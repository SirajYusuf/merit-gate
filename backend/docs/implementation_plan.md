# Resume Mini-Brain + Grounded Resume Tailoring System — Implementation Plan

## Background

The existing project is a lean Express.js + MongoDB/Mongoose backend at:
`/home/sy-2/Downloads/Personal/Projects/merit-gate/merit-gate/backend/`

Current structure:
- `server.js` — app entry point, registers routes
- `config/db.js` — Mongoose connect
- `models/` — `User.js`, `ChatLog.js`
- `routes/` — `authRoutes.js`, `chatRoutes.js`
- `controllers/` — `authController.js`, `chatController.js`
- `services/` — `chatLogService.js`, `llmService.js` (already uses `@google/genai`)
- `middleware/`, `validators/`

Already installed: `@google/genai`, `mongoose`, `express`, `dotenv`, `cors`, `bcrypt`, `jsonwebtoken`, `express-validator`

New package needed: none for core; optionally `p-limit` for batching concurrency control.

---

## Proposed Folder Structure (New Files Only)

```
backend/
├── models/
│   ├── Project.js              [NEW]
│   ├── ProjectMemory.js        [NEW]
│   ├── TailoredResume.js       [NEW]
│   ├── TailoringRun.js         [NEW]
│   ├── EmbeddingJob.js         [NEW]
│   └── EvalRun.js              [NEW]
│
├── services/
│   ├── embeddingService.js     [NEW]  — Gemini embedding abstraction
│   ├── parserService.js        [NEW]  — Section + bullet parsing
│   ├── memoryBuilderService.js [NEW]  — Creates ProjectMemory docs
│   ├── vectorRetrievalService.js [NEW] — Atlas vector search
│   └── tailoringService.js     [NEW]  — Orchestrates retrieval → generation
│
├── controllers/
│   ├── projectController.js    [NEW]
│   └── tailoringController.js  [NEW]
│
├── routes/
│   ├── projectRoutes.js        [NEW]
│   └── tailoringRoutes.js      [NEW]
│
└── server.js                   [MODIFY] — Register 2 new route groups
```

---

## Module Architecture

### 1. Project Intelligence Module
**File:** `models/Project.js`, `controllers/projectController.js`, `routes/projectRoutes.js`

Manages user-owned projects. A project is the top-level container. Users create a project, then paste structured bullet intelligence.

**Endpoints:**
- `POST /api/projects` — create project
- `GET /api/projects` — list user's projects
- `GET /api/projects/:id` — get project with memory count
- `DELETE /api/projects/:id` — delete project + cascade delete memories
- `POST /api/projects/:id/ingest` — paste raw text block → triggers parse + embed pipeline

---

### 2. Section Parsing Logic (LLM-Based)
**File:** `services/parserService.js`

Instead of fragile regex parsing, we will use Gemini (`gemini-2.5-flash-lite` or similar model) with a structured JSON schema to parse, split, and enrich the raw pasted text block in a single API call.

**LLM Parsing Prompt Strategy:**
- Provide Gemini with the raw text block.
- Define a JSON schema for the response containing a list of parsed bullets.
- Instruct the model to:
  1. Detect the section header for each bullet and map it to `strongest` | `ats` | `product_company` | `startup`.
  2. Normalize the bullet text (remove bullet points, outer quotes, leading/trailing whitespace).
  3. Extract technologies (e.g. React, Node.js, AWS), concepts (e.g. CI/CD, microservices), domain tags, seniority signals, and impact metrics directly from the bullet text.

**JSON Schema for LLM Output:**
```json
{
  "type": "OBJECT",
  "properties": {
    "memories": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "memoryType": { "type": "STRING", "enum": ["strongest", "ats", "product_company", "startup"] },
          "rawBullet": { "type": "STRING" },
          "normalizedBullet": { "type": "STRING" },
          "technologies": { "type": "ARRAY", "items": { "type": "STRING" } },
          "concepts": { "type": "ARRAY", "items": { "type": "STRING" } },
          "domainTags": { "type": "ARRAY", "items": { "type": "STRING" } },
          "senioritySignals": { "type": "ARRAY", "items": { "type": "STRING" } },
          "impactMetrics": { "type": "ARRAY", "items": { "type": "STRING" } }
        },
        "required": ["memoryType", "rawBullet", "normalizedBullet", "technologies", "concepts", "domainTags", "senioritySignals", "impactMetrics"]
      }
    }
  },
  "required": ["memories"]
}
```

---

### 3. Memory Builder Service
**File:** `services/memoryBuilderService.js`

Since the LLM parser already extracts metadata structure, the memory builder service's job becomes extremely simple and clean:
1. Accept the parsed memory array from the LLM.
2. Build `ProjectMemory` documents and save them to MongoDB.
3. Automatically create `EmbeddingJob` documents (status: `pending`) for each created memory.
4. Return created memory IDs.

---

### 4. Gemini Embedding Service
**File:** `services/embeddingService.js`

Uses `@google/genai` (already installed) to call Gemini Embeddings API.

```
Model: gemini-embedding-001
Task type: RETRIEVAL_DOCUMENT (for storage), RETRIEVAL_QUERY (for JD)
Output dimensionality: 768
```

**Features:**
- `embedText(text)` — single embedding call, returns float array. On failure, throws the error immediately (no retries).
- `embedBatch(texts, batchSize=5)` — sequential batching with 200ms delay between batches.
- `processEmbeddingJobs(projectId)` — processes all `pending` EmbeddingJobs for a project, updates ProjectMemory embedding field + job status.

**EmbeddingJob lifecycle:**
`pending` → `processing` → `done` | `failed`

---

### 5. Vector Retrieval Service
**File:** `services/vectorRetrievalService.js`

Performs hybrid retrieval from MongoDB Atlas Vector Search.

**Atlas Vector Search Index (to be created manually in Atlas UI):**
```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    },
    { "type": "filter", "path": "userId" },
    { "type": "filter", "path": "memoryType" },
    { "type": "filter", "path": "technologies" }
  ]
}
```

**Retrieval flow:**
1. Embed JD text with `RETRIEVAL_QUERY` task type
2. Run `$vectorSearch` aggregation on `project_memories` collection
3. Apply pre-filter: `{ userId }` (always) + optional `{ memoryType }` 
4. Retrieve top-K candidates (default: 20)
5. Hybrid re-rank by: vector score (0.6) + technology overlap score (0.3) + seniority alignment (0.1)
6. Return top-N bullets (default: 10) with `memoryId`, `score`, `rawBullet`, full metadata

---

### 6. Tailoring Orchestrator
**File:** `services/tailoringService.js`, `controllers/tailoringController.js`

**JD Processing:**
1. Accept JD text
2. Extract JD metadata with lightweight LLM call:
   - technologies, concepts, roleType (`engineer`|`product`|`startup`|`enterprise`), seniority
3. Embed JD → `jdEmbedding`
4. Run vector retrieval → `groundedMemories`
5. Build grounded prompt — ONLY using retrieved bullet text, no hallucination allowed
6. Call Gemini to generate tailored bullets
7. Parse output → `[{ tailoredBullet, rewriteStrategy, confidenceScore }]`
8. For each tailored bullet, record which `sourceMemoryIds` it traced to
9. Create `TailoringRun` + `TailoredResume` documents

**Grounded Prompt Template:**
```
You are a resume tailoring assistant. You MUST ONLY use the provided source bullets.
Never invent technologies, metrics, or experience.
Source Bullets: [retrieved bullets with IDs]
Job Description: [JD text]
Task: Rewrite the most relevant bullets for this role. For each output bullet, cite the source ID.
```

---

### 7. Provenance Tracking Layer

**In `TailoringRun`:**
```js
provenanceMap: [{
  tailoredBullet: String,
  sourceMemoryIds: [ObjectId],
  rewriteStrategy: String,   // "ats_optimized" | "tone_adapted" | "metric_preserved"
  confidenceScore: Number    // 0.0-1.0
}]
```

Every tailored bullet has a traceable chain back to source `ProjectMemory` documents. This is stored at creation and never mutated.

---

### 8. Future Eval Support Layer
**File:** `models/EvalRun.js`

Schema designed to accept LLM judge output. Stored separately from tailoring runs but linked via `tailoringRunId`. Supports:
- `hallucinationScore` — did output contain invented facts?
- `retrievalQuality` — were the right memories retrieved?
- `keywordCoverage` — % of JD keywords present in output
- `provenanceValid` — do all sourceMemoryIds exist?
- `judgeModel` + `promptVersion` — for reproducibility

---

## Mongoose Schemas

### `Project.js`
```js
{
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['active','archived'], default: 'active' },
  memoryCount: { type: Number, default: 0 },
  lastIngestedAt: Date,
  timestamps: true
}
```

### `ProjectMemory.js`
```js
{
  userId: { type: ObjectId, ref: 'User', required: true },
  projectId: { type: ObjectId, ref: 'Project', required: true },
  projectTitle: String,
  memoryType: { type: String, enum: ['strongest','ats','product_company','startup'], required: true },
  rawBullet: { type: String, required: true },
  normalizedBullet: String,
  technologies: [String],
  concepts: [String],
  domainTags: [String],
  senioritySignals: [String],
  impactMetrics: [String],
  embedding: { type: [Number], default: undefined },  // 768 dims
  embeddingStatus: { type: String, enum: ['pending','done','failed'], default: 'pending' },
  provenance: {
    sourceType: { type: String, default: 'manual_input' },
    createdAt: Date
  },
  metadata: {
    embeddingModel: String,
    embeddingCreatedAt: Date
  },
  timestamps: true
}
```

### `TailoredResume.js`
```js
{
  userId: { type: ObjectId, ref: 'User', required: true },
  tailoringRunId: { type: ObjectId, ref: 'TailoringRun' },
  jobTitle: String,
  companyName: String,
  jobDescription: String,
  tailoredBullets: [String],
  generatedAt: Date,
  timestamps: true
}
```

### `TailoringRun.js`
```js
{
  userId: { type: ObjectId, ref: 'User', required: true },
  projectIds: [ObjectId],
  jobDescription: String,
  jdMetadata: {
    technologies: [String],
    concepts: [String],
    roleType: String,
    seniority: String
  },
  retrievedMemoryIds: [ObjectId],
  provenanceMap: [{
    tailoredBullet: String,
    sourceMemoryIds: [ObjectId],
    rewriteStrategy: String,
    confidenceScore: Number
  }],
  llmModel: String,
  promptVersion: String,
  status: { type: String, enum: ['pending','processing','done','failed'], default: 'pending' },
  timestamps: true
}
```

### `EmbeddingJob.js`
```js
{
  userId: ObjectId,
  projectId: ObjectId,
  memoryId: { type: ObjectId, ref: 'ProjectMemory' },
  status: { type: String, enum: ['pending','processing','done','failed'], default: 'pending' },
  attempts: { type: Number, default: 0 },
  errorMessage: String,
  processedAt: Date,
  timestamps: true
}
```

### `EvalRun.js`
```js
{
  tailoringRunId: { type: ObjectId, ref: 'TailoringRun', required: true },
  userId: ObjectId,
  judgeModel: String,
  promptVersion: String,
  scores: {
    hallucinationScore: Number,
    retrievalQuality: Number,
    keywordCoverage: Number,
    provenanceValid: Boolean,
    overallScore: Number
  },
  perBulletEvals: [{
    tailoredBullet: String,
    sourceMemoryIds: [ObjectId],
    hallucinationFlag: Boolean,
    judgeNotes: String
  }],
  runAt: Date,
  timestamps: true
}
```

---

## Suggested MongoDB Indexes

```js
// ProjectMemory
db.project_memories.createIndex({ userId: 1, projectId: 1 })
db.project_memories.createIndex({ embeddingStatus: 1 })
db.project_memories.createIndex({ technologies: 1 })

// EmbeddingJob
db.embedding_jobs.createIndex({ status: 1, projectId: 1 })

// TailoringRun
db.tailoring_runs.createIndex({ userId: 1, createdAt: -1 })

// Atlas Vector Search index (created in Atlas UI, NOT createIndex)
// path: "embedding", dimensions: 768, similarity: "cosine"
// pre-filters: userId, memoryType, technologies
```

---

## API Endpoints Summary

| Method | Route | Description |
|---|---|---|
| POST | `/api/projects` | Create project |
| GET | `/api/projects` | List user's projects |
| GET | `/api/projects/:id` | Get project detail |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/ingest` | Paste bullet text → parse → embed |
| GET | `/api/projects/:id/memories` | List memories for project |
| POST | `/api/tailoring/run` | Submit JD → retrieve → generate |
| GET | `/api/tailoring/runs` | List user's tailoring runs |
| GET | `/api/tailoring/runs/:id` | Get tailoring run + provenance |

---

## Embedding Lifecycle

```
POST /api/projects/:id/ingest
  → parserService.parseRawText(text)          → [{ memoryType, bullets[] }]
  → memoryBuilderService.buildMemories(...)    → creates ProjectMemory docs (embeddingStatus: pending)
                                               → creates EmbeddingJob docs (status: pending)
  → embeddingService.processEmbeddingJobs(projectId)  [runs async after response]
      → for each pending job:
          embed rawBullet
          update ProjectMemory.embedding + embeddingStatus: done
          update EmbeddingJob.status: done
      → on failure: mark failed, store error
```

---

## Tailoring Orchestration Flow

```
POST /api/tailoring/run
  → parse JD metadata (LLM, lightweight)
  → embed JD text (RETRIEVAL_QUERY)
  → vectorRetrievalService.retrieve(jdEmbedding, userId, filters)
      → $vectorSearch aggregation
      → hybrid re-rank
      → return top-10 grounded memories
  → tailoringService.generate(memories, jdText, jdMetadata)
      → build grounded prompt
      → Gemini generateContent
      → parse bullet output with source citations
  → store TailoringRun (with provenanceMap)
  → store TailoredResume
  → return tailored bullets + provenance
```

---

## Example Atlas Vector Search Aggregation

```js
db.project_memories.aggregate([
  {
    $vectorSearch: {
      index: "memory_vector_index",
      path: "embedding",
      queryVector: jdEmbeddingArray,
      numCandidates: 100,
      limit: 20,
      filter: {
        userId: { $eq: userObjectId }
      }
    }
  },
  {
    $addFields: { vectorScore: { $meta: "vectorSearchScore" } }
  },
  {
    $project: {
      rawBullet: 1, memoryType: 1, technologies: 1,
      senioritySignals: 1, impactMetrics: 1,
      vectorScore: 1, projectTitle: 1
    }
  }
])
```

---

## server.js Changes

Two new route mounts (minimal change):
```js
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tailoring', require('./routes/tailoringRoutes'));
```

---

## Open Questions

> [!IMPORTANT]
> **Atlas Vector Search Index Setup**: The vector index must be created manually in MongoDB Atlas UI (or via Atlas CLI). It cannot be created via Mongoose. We will provide the exact JSON config. Note that Atlas Vector Search is supported on free tier M0 clusters.

> [!IMPORTANT]
> **Embedding Dimensions**: Gemini `gemini-embedding-001` returns 3072-dimensional vectors by default, but the backend requests `outputDimensionality: 768`. The Atlas index must be configured with `numDimensions: 768`.

> [!NOTE]
> **Ingest is Synchronous or Async?**: The embedding step takes time. The plan runs embedding *after* responding to the HTTP request (fire-and-forget). Bullets will be searchable only once embedding jobs are done. Should we add a polling endpoint for embedding status?

> [!NOTE]
> **p-limit for batching**: To control concurrency during batch embedding, `p-limit` (tiny, zero-dep package) is recommended. We can skip it and use a simple sequential loop instead if you prefer zero new dependencies.

---

## Verification Plan

### After Implementation
1. `POST /api/projects` — create a test project, verify DB document
2. `POST /api/projects/:id/ingest` — paste sample multi-section text, verify:
   - ProjectMemory documents created per bullet
   - EmbeddingJob documents created
   - Embeddings stored after processing
3. `POST /api/tailoring/run` — submit a test JD, verify:
   - Atlas vector search returns bullets
   - TailoringRun created with provenanceMap
   - Each tailored bullet has sourceMemoryIds
4. `GET /api/tailoring/runs/:id` — verify full provenance chain readable
