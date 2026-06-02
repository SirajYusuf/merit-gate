const mongoose = require('mongoose');

const tailoredResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tailoringRunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TailoringRun',
      default: null,
    },
    jobTitle: {
      type: String,
      default: '',
      trim: true,
    },
    companyName: {
      type: String,
      default: '',
      trim: true,
    },
    jobDescription: {
      type: String,
      default: '',
    },
    tailoredBullets: {
      type: [String],
      default: [],
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'tailored_resumes',
  }
);

const TailoredResume = mongoose.model('TailoredResume', tailoredResumeSchema);

module.exports = TailoredResume;
