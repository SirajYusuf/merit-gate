const { Queue } = require('bullmq');

const EMBEDDING_QUEUE_NAME = 'embedding-jobs';

let embeddingQueue;

const getRedisConnectionOptions = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  const parsedUrl = new URL(redisUrl);
  const db = parsedUrl.pathname ? Number(parsedUrl.pathname.replace('/', '')) : 0;

  return {
    host: parsedUrl.hostname,
    port: Number(parsedUrl.port || 6379),
    username: parsedUrl.username || undefined,
    password: parsedUrl.password || undefined,
    db: Number.isNaN(db) ? 0 : db,
    tls: parsedUrl.protocol === 'rediss:' ? {} : undefined,
  };
};

const getEmbeddingQueue = () => {
  if (!embeddingQueue) {
    embeddingQueue = new Queue(EMBEDDING_QUEUE_NAME, {
      connection: getRedisConnectionOptions(),
    });
  }

  return embeddingQueue;
};

const enqueueEmbeddingJobs = async (embeddingJobs) => {
  if (!embeddingJobs.length) {
    return [];
  }

  const queue = getEmbeddingQueue();
  return queue.addBulk(
    embeddingJobs.map((embeddingJob) => ({
      name: 'embed-project-memory',
      data: {
        embeddingJobId: embeddingJob._id.toString(),
      },
      opts: {
        jobId: embeddingJob._id.toString(),
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: {
          age: 86400,
          count: 1000,
        },
        removeOnFail: {
          age: 604800,
          count: 5000,
        },
      },
    }))
  );
};

const removeEmbeddingJobs = async (embeddingJobIds) => {
  if (!embeddingJobIds.length) {
    return;
  }

  const queue = getEmbeddingQueue();

  await Promise.all(
    embeddingJobIds.map(async (embeddingJobId) => {
      const queueJob = await queue.getJob(embeddingJobId.toString());

      if (queueJob) {
        try {
          await queueJob.remove();
        } catch (error) {
          console.error(`Failed to remove queue job ${embeddingJobId}:`, error.message);
        }
      }
    })
  );
};

module.exports = {
  EMBEDDING_QUEUE_NAME,
  getRedisConnectionOptions,
  getEmbeddingQueue,
  enqueueEmbeddingJobs,
  removeEmbeddingJobs,
};
