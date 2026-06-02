const mongoose = require('mongoose');
const Project = require('../models/Project');
const ProjectMemory = require('../models/ProjectMemory');
const TailoredResume = require('../models/TailoredResume');
const TailoringRun = require('../models/TailoringRun');
const { generateJson, LLM_MODEL } = require('./geminiClient');
const { retrieveRelevantMemories } = require('./vectorRetrievalService');

const PROMPT_VERSION = 'resume-tailoring-v1';

const jdMetadataSchema = {
  type: 'object',
  properties: {
    technologies: {
      type: 'array',
      items: { type: 'string' },
    },
    concepts: {
      type: 'array',
      items: { type: 'string' },
    },
    roleType: {
      type: 'string',
      enum: ['engineer', 'product', 'startup', 'enterprise'],
    },
    seniority: {
      type: 'string',
    },
  },
  required: ['technologies', 'concepts', 'roleType', 'seniority'],
};

const tailoringSchema = {
  type: 'object',
  properties: {
    bullets: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tailoredBullet: { type: 'string' },
          sourceMemoryIds: {
            type: 'array',
            items: { type: 'string' },
          },
          rewriteStrategy: {
            type: 'string',
            enum: ['ats_optimized', 'tone_adapted', 'metric_preserved'],
          },
          confidenceScore: {
            type: 'number',
          },
        },
        required: [
          'tailoredBullet',
          'sourceMemoryIds',
          'rewriteStrategy',
          'confidenceScore',
        ],
      },
    },
  },
  required: ['bullets'],
};

const normalizeStringArray = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
};

const clampConfidence = (value) => {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return 0;
  }

  return Math.min(1, Math.max(0, numericValue));
};

const extractJdMetadata = async (jobDescription) => {
  const prompt = `
Extract structured metadata from this job description for resume retrieval.

Return JSON only. Extract only terms that are explicitly present or clearly implied by the text.

Job description:
${jobDescription}
`;

  const parsed = await generateJson({
    prompt,
    schema: jdMetadataSchema,
    model: LLM_MODEL,
    logType: 'tailoring_ai_call',
    metadata: { jobDescriptionLength: jobDescription?.length }
  });

  return {
    technologies: normalizeStringArray(parsed.technologies),
    concepts: normalizeStringArray(parsed.concepts),
    roleType: parsed.roleType || 'engineer',
    seniority: parsed.seniority || '',
  };
};

const generateTailoredBullets = async ({ memories, jobDescription, jdMetadata }) => {
  const sourceBullets = memories.map((memory) => ({
    id: memory.memoryId.toString(),
    bullet: memory.rawBullet,
    technologies: memory.technologies,
    impactMetrics: memory.impactMetrics,
    memoryType: memory.memoryType,
  }));

  const prompt = `
You are a resume tailoring assistant.

Rules:
- You MUST ONLY use the provided source bullets.
- Never invent technologies, metrics, companies, seniority, or experience.
- Preserve real metrics exactly when present.
- Every output bullet must cite at least one source memory ID from the source list.
- Return JSON only.

Job metadata:
${JSON.stringify(jdMetadata, null, 2)}

Source bullets:
${JSON.stringify(sourceBullets, null, 2)}

Job description:
${jobDescription}

Task:
Rewrite the most relevant bullets for this role. Produce concise resume bullets, each with sourceMemoryIds, rewriteStrategy, and confidenceScore.
`;

  const parsed = await generateJson({
    prompt,
    schema: tailoringSchema,
    model: LLM_MODEL,
    logType: 'tailoring_ai_call',
    metadata: { numSourceBullets: sourceBullets.length }
  });

  const allowedSourceIds = new Set(memories.map((memory) => memory.memoryId.toString()));

  return (Array.isArray(parsed.bullets) ? parsed.bullets : [])
    .map((bullet) => {
      const sourceMemoryIds = normalizeStringArray(bullet.sourceMemoryIds)
        .filter((sourceMemoryId) => allowedSourceIds.has(sourceMemoryId));

      return {
        tailoredBullet: String(bullet.tailoredBullet || '').trim(),
        sourceMemoryIds,
        rewriteStrategy: ['ats_optimized', 'tone_adapted', 'metric_preserved'].includes(bullet.rewriteStrategy)
          ? bullet.rewriteStrategy
          : 'ats_optimized',
        confidenceScore: clampConfidence(bullet.confidenceScore),
      };
    })
    .filter((bullet) => bullet.tailoredBullet && bullet.sourceMemoryIds.length > 0);
};

const resolveProjectIds = async ({ userId, projectIds }) => {
  const query = { userId };

  if (projectIds && projectIds.length > 0) {
    query._id = { $in: projectIds };
  }

  const projects = await Project.find(query).select('_id');
  return projects.map((project) => project._id);
};

const runTailoring = async ({
  userId,
  jobDescription,
  projectIds = [],
  jobTitle = '',
  companyName = '',
  memoryType,
  topK = 20,
  topN = 10,
}) => {
  const resolvedProjectIds = await resolveProjectIds({ userId, projectIds });

  if (projectIds.length > 0 && resolvedProjectIds.length !== projectIds.length) {
    throw new Error('One or more projects were not found');
  }

  const jdMetadata = await extractJdMetadata(jobDescription);
  const tailoringRun = await TailoringRun.create({
    userId,
    projectIds: resolvedProjectIds,
    jobDescription,
    jdMetadata,
    llmModel: LLM_MODEL,
    promptVersion: PROMPT_VERSION,
    status: 'processing',
  });

  try {
    const memories = await retrieveRelevantMemories({
      userId,
      projectIds: resolvedProjectIds,
      jdText: jobDescription,
      jdMetadata,
      memoryType,
      topK,
      topN,
    });

    if (memories.length === 0) {
      throw new Error('No embedded project memories were available for tailoring');
    }

    const generatedBullets = await generateTailoredBullets({
      memories,
      jobDescription,
      jdMetadata,
    });

    if (generatedBullets.length === 0) {
      throw new Error('No grounded tailored bullets were generated');
    }

    const provenanceMap = generatedBullets.map((bullet) => ({
      tailoredBullet: bullet.tailoredBullet,
      sourceMemoryIds: bullet.sourceMemoryIds.map((sourceMemoryId) => (
        new mongoose.Types.ObjectId(sourceMemoryId)
      )),
      rewriteStrategy: bullet.rewriteStrategy,
      confidenceScore: bullet.confidenceScore,
    }));

    tailoringRun.retrievedMemoryIds = memories.map((memory) => memory.memoryId);
    tailoringRun.provenanceMap = provenanceMap;
    tailoringRun.status = 'done';
    await tailoringRun.save();

    const tailoredResume = await TailoredResume.create({
      userId,
      tailoringRunId: tailoringRun._id,
      jobTitle,
      companyName,
      jobDescription,
      tailoredBullets: generatedBullets.map((bullet) => bullet.tailoredBullet),
      generatedAt: new Date(),
    });

    return {
      tailoringRun,
      tailoredResume,
      jdMetadata,
      tailoredBullets: generatedBullets,
      retrievedMemories: memories,
    };
  } catch (error) {
    tailoringRun.status = 'failed';
    tailoringRun.errorMessage = error.message;
    await tailoringRun.save();
    throw error;
  }
};

const getTailoringRunWithProvenance = async ({ userId, tailoringRunId }) => {
  const tailoringRun = await TailoringRun.findOne({
    _id: tailoringRunId,
    userId,
  }).lean();

  if (!tailoringRun) {
    return null;
  }

  const sourceIds = tailoringRun.provenanceMap.flatMap((item) => item.sourceMemoryIds);
  const sourceMemories = await ProjectMemory.find({
    _id: { $in: sourceIds },
    userId,
  }).lean();
  const tailoredResume = await TailoredResume.findOne({
    tailoringRunId,
    userId,
  }).lean();

  return {
    ...tailoringRun,
    tailoredResume,
    sourceMemories,
  };
};

module.exports = {
  runTailoring,
  getTailoringRunWithProvenance,
};
