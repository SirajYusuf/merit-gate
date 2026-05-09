const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    input: {
      type: String,
      default: null,
    },
    output: {
      type: String,
      default: null,
    },
    config: {
      model: {
        type: String,
        default: null,
      },
    },
    metadata: {
      type: String,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

const ChatLog = mongoose.model('ChatLog', chatLogSchema);

module.exports = ChatLog;
