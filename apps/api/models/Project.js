const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
      index: true,
    },
    memoryCount: {
      type: Number,
      default: 0,
    },
    lastIngestedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'projects',
  }
);

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
