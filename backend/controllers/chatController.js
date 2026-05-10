const { llmService } = require('../services/llmService');
const { getChatLogsForUser, getChatLogById } = require('../services/chatLogService');

const chatWithLLM = async (req, res) => {
  try {
    const { message } = req.body;

    // Pass the message and user ID to the LLM service (handles logging & formatting)
    const formattedResponse = await llmService(req.user._id, message);

    res.json({
      response: formattedResponse,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await getChatLogsForUser(req.user._id, page, 20);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChatLogDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await getChatLogById(id, req.user._id);
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { chatWithLLM, getHistory, getChatLogDetails };
