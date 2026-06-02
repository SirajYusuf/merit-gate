# Atlas Vector Search Index

Create this index manually in MongoDB Atlas on the `project_memories` collection.

Index name used by the backend:

```text
memory_vector_index
```

Set `MEMORY_VECTOR_INDEX` if you choose a different name.

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "userId"
    },
    {
      "type": "filter",
      "path": "projectId"
    },
    {
      "type": "filter",
      "path": "embeddingStatus"
    },
    {
      "type": "filter",
      "path": "memoryType"
    },
    {
      "type": "filter",
      "path": "technologies"
    }
  ]
}
```

The backend stores Gemini `gemini-embedding-001` vectors truncated to 768 dimensions with `outputDimensionality: 768`.

Optional env overrides:

```text
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
GEMINI_EMBEDDING_DIMENSIONS=768
```
