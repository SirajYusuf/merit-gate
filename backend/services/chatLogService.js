const ChatLog = require('../models/ChatLog');

const createChatLog = async (userId, input, output, config = null, metadata = null) => {
  try {
    const log = await ChatLog.create({
      user: userId,
      input,
      output,
      config,
      metadata,
    });
    return log;
  } catch (error) {
    console.error('Error saving chat log:', error);
  }
};

const getChatLogsForUser = async (userId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const logs = await ChatLog.find({ user: userId })
      .select('_id createdAt input')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await ChatLog.countDocuments({ user: userId });
    
    const summaryLogs = logs.map(log => ({
      _id: log._id,
      createdAt: log.createdAt,
      input: log.input ? (log.input.length > 150 ? log.input.substring(0, 150) + '...' : log.input) : ''
    }));
    
    return {
      logs: summaryLogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalLogs: total
    };
  } catch (error) {
    console.error('Error fetching chat logs:', error);
    throw error;
  }
};

const getChatLogById = async (logId, userId) => {
  try {
    return await ChatLog.findOne({ _id: logId, user: userId });
  } catch (error) {
    console.error('Error fetching single chat log:', error);
    throw error;
  }
};

module.exports = { createChatLog, getChatLogsForUser, getChatLogById };
