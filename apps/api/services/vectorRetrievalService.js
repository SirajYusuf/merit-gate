const mongoose = require('mongoose');
const ProjectMemory = require('../models/ProjectMemory');
const { embedText } = require('./embeddingService');

const toLowerSet = (items) => new Set(
  (items || [])
    .filter((item) => typeof item === 'string')
    .map((item) => item.toLowerCase())
);

const computeOverlapScore = (memoryTerms, jdTerms) => {
  const memorySet = toLowerSet(memoryTerms);
  const jdSet = toLowerSet(jdTerms);

  if (memorySet.size === 0 || jdSet.size === 0) {
    return 0;
  }

  let matches = 0;
  memorySet.forEach((term) => {
    if (jdSet.has(term)) {
      matches += 1;
    }
  });

  return matches / Math.max(jdSet.size, 1);
};

const computeSeniorityScore = (memorySignals, seniority) => {
  if (!seniority) {
    return 0;
  }

  const seniorityLower = seniority.toLowerCase();
  const signals = toLowerSet(memorySignals);

  if (signals.has(seniorityLower)) {
    return 1;
  }

  for (const signal of signals) {
    if (signal.includes(seniorityLower) || seniorityLower.includes(signal)) {
      return 0.75;
    }
  }

  return 0;
};

const rerankMemories = ({ memories, jdMetadata, topN }) => {
  const jdTechnologies = jdMetadata.technologies || [];

  return memories
    .map((memory) => {
      const vectorScore = Number(memory.vectorScore || 0);
      const technologyScore = computeOverlapScore(memory.technologies, jdTechnologies);
      const seniorityScore = computeSeniorityScore(
        memory.senioritySignals,
        jdMetadata.seniority
      );
      const score = (vectorScore * 0.6) + (technologyScore * 0.3) + (seniorityScore * 0.1);

      return {
        memoryId: memory._id,
        score,
        vectorScore,
        rawBullet: memory.rawBullet,
        normalizedBullet: memory.normalizedBullet,
        memoryType: memory.memoryType,
        technologies: memory.technologies || [],
        concepts: memory.concepts || [],
        domainTags: memory.domainTags || [],
        senioritySignals: memory.senioritySignals || [],
        impactMetrics: memory.impactMetrics || [],
        projectId: memory.projectId,
        projectTitle: memory.projectTitle,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
};

const retrieveRelevantMemories = async ({
  userId,
  projectIds = [],
  jdText,
  jdMetadata,
  memoryType,
  topK = 20,
  topN = 10,
}) => {
  const jdEmbedding = await embedText(jdText, 'RETRIEVAL_QUERY');
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const filter = {
    userId: { $eq: userObjectId },
    embeddingStatus: { $eq: 'done' },
  };

  if (memoryType) {
    filter.memoryType = { $eq: memoryType };
  }

  if (projectIds.length > 0) {
    filter.projectId = {
      $in: projectIds.map((projectId) => new mongoose.Types.ObjectId(projectId)),
    };
  }

  let candidates;

  try {
    candidates = await ProjectMemory.aggregate([
      {
        $vectorSearch: {
          index: process.env.MEMORY_VECTOR_INDEX || 'memory_vector_index',
          path: 'embedding',
          queryVector: jdEmbedding,
          numCandidates: Math.max(topK * 5, 100),
          limit: topK,
          filter,
        },
      },
      {
        $addFields: {
          vectorScore: { $meta: 'vectorSearchScore' },
        },
      },
      {
        $project: {
          rawBullet: 1,
          normalizedBullet: 1,
          memoryType: 1,
          technologies: 1,
          concepts: 1,
          domainTags: 1,
          senioritySignals: 1,
          impactMetrics: 1,
          projectId: 1,
          projectTitle: 1,
          vectorScore: 1,
        },
      },
    ]);
  } catch (error) {
    throw new Error(
      `Vector search failed. Confirm the Atlas Vector Search index exists and includes the documented filter fields. ${error.message}`
    );
  }

  return rerankMemories({
    memories: candidates,
    jdMetadata,
    topN,
  });
};

module.exports = {
  retrieveRelevantMemories,
};
