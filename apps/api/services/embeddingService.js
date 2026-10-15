const EmbeddingJob = require('../models/EmbeddingJob');
const ProjectMemory = require('../models/ProjectMemory');
const { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL, getGeminiClient } = require('./geminiClient');

const embedText = async (text, taskType = 'RETRIEVAL_DOCUMENT') => {
  const input = String(text || '').trim();

  if (!input) {
    throw new Error('Text is required for embedding');
  }

  const ai = getGeminiClient();
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: [input],
    config: {
      taskType,
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });

  const values = response.embeddings && response.embeddings[0] && response.embeddings[0].values;

  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('Embedding API returned no vector values');
  }

  return values;
};

const processEmbeddingJob = async (embeddingJobId) => {
  const embeddingJob = await EmbeddingJob.findById(embeddingJobId);

  if (!embeddingJob) {
    throw new Error(`Embedding job not found: ${embeddingJobId}`);
  }

  if (embeddingJob.status === 'done') {
    return { embeddingJobId, status: 'done' };
  }

  try {
    embeddingJob.status = 'processing';
    embeddingJob.attempts += 1;
    embeddingJob.errorMessage = '';
    await embeddingJob.save();

    const memory = await ProjectMemory.findOne({
      _id: embeddingJob.memoryId,
      userId: embeddingJob.userId,
      projectId: embeddingJob.projectId,
    });

    if (!memory) {
      throw new Error(`Project memory not found: ${embeddingJob.memoryId}`);
    }

    memory.embeddingStatus = 'processing';
    await memory.save();

    const embedding = await embedText(
      memory.normalizedBullet || memory.rawBullet,
      'RETRIEVAL_DOCUMENT'
    );

    memory.embedding = embedding;
    memory.embeddingStatus = 'done';
    memory.metadata.embeddingModel = EMBEDDING_MODEL;
    memory.metadata.embeddingCreatedAt = new Date();
    await memory.save();

    embeddingJob.status = 'done';
    embeddingJob.processedAt = new Date();
    embeddingJob.errorMessage = '';
    await embeddingJob.save();

    return {
      embeddingJobId,
      memoryId: memory._id.toString(),
      status: 'done',
      dimensions: embedding.length,
    };
  } catch (error) {
    embeddingJob.status = 'failed';
    embeddingJob.errorMessage = error.message;
    embeddingJob.processedAt = new Date();
    await embeddingJob.save();

    await ProjectMemory.updateOne(
      { _id: embeddingJob.memoryId },
      { $set: { embeddingStatus: 'failed' } }
    );

    throw error;
  }
};

module.exports = {
  embedText,
  processEmbeddingJob,
};
