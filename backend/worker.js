const dotenv = require('dotenv');
const { Worker } = require('bullmq');
const connectDB = require('./config/db');
const { EMBEDDING_QUEUE_NAME, getRedisConnectionOptions } = require('./services/embeddingQueueService');
const { processEmbeddingJob } = require('./services/embeddingService');

dotenv.config();

const startWorker = async () => {
  await connectDB();

  const worker = new Worker(
    EMBEDDING_QUEUE_NAME,
    async (job) => {
      const { embeddingJobId } = job.data;
      return processEmbeddingJob(embeddingJobId);
    },
    {
      connection: getRedisConnectionOptions(),
      concurrency: Number(process.env.EMBEDDING_WORKER_CONCURRENCY || 2),
    }
  );

  worker.on('completed', (job) => {
    console.log(`Embedding job completed: ${job.id}`);
  });

  worker.on('failed', (job, error) => {
    console.error(`Embedding job failed: ${job && job.id}`, error.message);
  });

  const shutdown = async () => {
    console.log('Shutting down embedding worker...');
    await worker.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  console.log(`Embedding worker listening on queue: ${EMBEDDING_QUEUE_NAME}`);
};

startWorker().catch((error) => {
  console.error('Worker failed to start:', error);
  process.exit(1);
});
