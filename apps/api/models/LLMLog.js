const mongoose = require('mongoose');

const llmLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['tailoring_ai_call', 'project_parsing_ai_call', 'other'],
    required: true,
  },
  prompt: {
    type: mongoose.Schema.Types.Mixed, // Can be string or structured object
    required: true,
  },
  response: {
    type: mongoose.Schema.Types.Mixed,
  },
  rawResponse: {
    type: String,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  error: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('LLMLog', llmLogSchema);
