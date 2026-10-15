const mongoose = require('mongoose');

const evalRunSchema = new mongoose.Schema(
  {
    tailoringRunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TailoringRun',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    judgeModel: {
      type: String,
      default: '',
    },
    promptVersion: {
      type: String,
      default: '',
    },
    scores: {
      hallucinationScore: Number,
      retrievalQuality: Number,
      keywordCoverage: Number,
      provenanceValid: Boolean,
      overallScore: Number,
    },
    perBulletEvals: [{
      tailoredBullet: String,
      sourceMemoryIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProjectMemory',
      }],
      hallucinationFlag: Boolean,
      judgeNotes: String,
    }],
    runAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'eval_runs',
  }
);

const EvalRun = mongoose.model('EvalRun', evalRunSchema);

module.exports = EvalRun;
