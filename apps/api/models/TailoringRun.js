const mongoose = require('mongoose');

const provenanceMapSchema = new mongoose.Schema(
  {
    tailoredBullet: {
      type: String,
      required: true,
    },
    sourceMemoryIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectMemory',
    }],
    rewriteStrategy: {
      type: String,
      enum: ['ats_optimized', 'tone_adapted', 'metric_preserved'],
      default: 'ats_optimized',
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

const tailoringRunSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    }],
    jobDescription: {
      type: String,
      required: true,
    },
    jdMetadata: {
      technologies: {
        type: [String],
        default: [],
      },
      concepts: {
        type: [String],
        default: [],
      },
      roleType: {
        type: String,
        default: '',
      },
      seniority: {
        type: String,
        default: '',
      },
    },
    retrievedMemoryIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectMemory',
    }],
    provenanceMap: {
      type: [provenanceMapSchema],
      default: [],
    },
    llmModel: {
      type: String,
      default: '',
    },
    promptVersion: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'done', 'failed'],
      default: 'pending',
      index: true,
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'tailoring_runs',
  }
);

tailoringRunSchema.index({ userId: 1, createdAt: -1 });

const TailoringRun = mongoose.model('TailoringRun', tailoringRunSchema);

module.exports = TailoringRun;
