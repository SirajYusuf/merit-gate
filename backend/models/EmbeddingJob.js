const mongoose = require('mongoose');

const embeddingJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    memoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectMemory',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'done', 'failed'],
      default: 'pending',
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: '',
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'embedding_jobs',
  }
);

embeddingJobSchema.index({ status: 1, projectId: 1 });

const EmbeddingJob = mongoose.model('EmbeddingJob', embeddingJobSchema);

module.exports = EmbeddingJob;
