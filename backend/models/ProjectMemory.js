const mongoose = require('mongoose');

const projectMemorySchema = new mongoose.Schema(
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
    projectTitle: {
      type: String,
      default: '',
    },
    memoryType: {
      type: String,
      enum: ['strongest', 'ats', 'product_company', 'startup'],
      required: true,
      index: true,
    },
    rawBullet: {
      type: String,
      required: true,
    },
    normalizedBullet: {
      type: String,
      default: '',
    },
    technologies: {
      type: [String],
      default: [],
      index: true,
    },
    concepts: {
      type: [String],
      default: [],
    },
    domainTags: {
      type: [String],
      default: [],
    },
    senioritySignals: {
      type: [String],
      default: [],
    },
    impactMetrics: {
      type: [String],
      default: [],
    },
    embedding: {
      type: [Number],
      default: undefined,
    },
    embeddingStatus: {
      type: String,
      enum: ['pending', 'processing', 'done', 'failed'],
      default: 'pending',
      index: true,
    },
    provenance: {
      sourceType: {
        type: String,
        default: 'manual_input',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    metadata: {
      embeddingModel: {
        type: String,
        default: '',
      },
      embeddingCreatedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
    collection: 'project_memories',
  }
);

projectMemorySchema.index({ userId: 1, projectId: 1 });

const ProjectMemory = mongoose.model('ProjectMemory', projectMemorySchema);

module.exports = ProjectMemory;
