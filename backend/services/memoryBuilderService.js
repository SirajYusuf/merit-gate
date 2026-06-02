const EmbeddingJob = require('../models/EmbeddingJob');
const Project = require('../models/Project');
const ProjectMemory = require('../models/ProjectMemory');
const { enqueueEmbeddingJobs } = require('./embeddingQueueService');

const buildProjectMemories = async ({ userId, project, parsedMemories }) => {
  const memoryDocs = parsedMemories.map((memory) => ({
    userId,
    projectId: project._id,
    projectTitle: project.title,
    memoryType: memory.memoryType,
    rawBullet: memory.rawBullet,
    normalizedBullet: memory.normalizedBullet,
    technologies: memory.technologies,
    concepts: memory.concepts,
    domainTags: memory.domainTags,
    senioritySignals: memory.senioritySignals,
    impactMetrics: memory.impactMetrics,
    embeddingStatus: 'pending',
    provenance: {
      sourceType: 'manual_input',
      createdAt: new Date(),
    },
  }));

  const createdMemories = await ProjectMemory.insertMany(memoryDocs);

  const embeddingJobs = await EmbeddingJob.insertMany(
    createdMemories.map((memory) => ({
      userId,
      projectId: project._id,
      memoryId: memory._id,
      status: 'pending',
    }))
  );

  await enqueueEmbeddingJobs(embeddingJobs);

  await Project.updateOne(
    { _id: project._id, userId },
    {
      $inc: { memoryCount: createdMemories.length },
      $set: { lastIngestedAt: new Date() },
    }
  );

  return {
    memoryIds: createdMemories.map((memory) => memory._id),
    embeddingJobIds: embeddingJobs.map((job) => job._id),
    queuedCount: embeddingJobs.length,
  };
};

module.exports = {
  buildProjectMemories,
};
