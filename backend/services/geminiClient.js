const { GoogleGenAI } = require('@google/genai');
const LLMLog = require('../models/LLMLog');

const LLM_MODEL = 'gemini-2.5-flash-lite';
const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001';
const EMBEDDING_DIMENSIONS = Number(process.env.GEMINI_EMBEDDING_DIMENSIONS || 768);

let aiClient;

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is required');
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  return aiClient;
};

const parseJsonText = (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('LLM returned an empty response');
  }

  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const jsonText = fencedMatch ? fencedMatch[1] : trimmed;

  return JSON.parse(jsonText);
};

const generateJson = async ({ prompt, schema, model = LLM_MODEL, logType = 'other', metadata = {} }) => {
  const ai = getGeminiClient();
  let rawText = '';
  let parsedResponse = null;
  let errorMsg = null;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: schema,
      },
    });

    rawText = response.text;
    parsedResponse = parseJsonText(rawText);
  } catch (err) {
    errorMsg = err.message;
    throw err;
  } finally {
    // Fire and forget logging
    LLMLog.create({
      type: logType,
      prompt,
      response: parsedResponse,
      rawResponse: rawText,
      metadata: { ...metadata, model },
      error: errorMsg
    }).catch(err => console.error('[LLMLog] Failed to log:', err.message));
  }

  return parsedResponse;
};

module.exports = {
  LLM_MODEL,
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS,
  getGeminiClient,
  generateJson,
  parseJsonText,
};
