const { GoogleGenAI } = require('@google/genai');
const { createChatLog } = require('./chatLogService');
const LLM_MODEL = 'gemini-2.5-flash-lite';

const llmService = async (userId, prompt) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: LLM_MODEL,
      contents: prompt,
    });

    const formattedResponse = response.text.split('\n').filter(line => line.trim() !== '');
    await createChatLog(userId, prompt, response.text, {
      model: LLM_MODEL,
    }, JSON.stringify(response));

    return formattedResponse;
  } catch (error) {
    console.error('LLM Service Error:', error);
    throw new Error('Failed to communicate with LLM');
  }
};

module.exports = { llmService };
