const { generateJson, LLM_MODEL } = require('./geminiClient');

const MEMORY_TYPES = ['strongest', 'ats', 'product_company', 'startup'];

const parserSchema = {
  type: 'object',
  properties: {
    memories: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          memoryType: {
            type: 'string',
            enum: MEMORY_TYPES,
          },
          rawBullet: { type: 'string' },
          normalizedBullet: { type: 'string' },
          technologies: {
            type: 'array',
            items: { type: 'string' },
          },
          concepts: {
            type: 'array',
            items: { type: 'string' },
          },
          domainTags: {
            type: 'array',
            items: { type: 'string' },
          },
          senioritySignals: {
            type: 'array',
            items: { type: 'string' },
          },
          impactMetrics: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        required: [
          'memoryType',
          'rawBullet',
          'normalizedBullet',
          'technologies',
          'concepts',
          'domainTags',
          'senioritySignals',
          'impactMetrics',
        ],
      },
    },
  },
  required: ['memories'],
};

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
};

const sanitizeMemories = (memories) => {
  if (!Array.isArray(memories)) {
    return [];
  }

  return memories
    .filter((memory) => memory && MEMORY_TYPES.includes(memory.memoryType))
    .map((memory) => ({
      memoryType: memory.memoryType,
      rawBullet: String(memory.rawBullet || '').trim(),
      normalizedBullet: String(memory.normalizedBullet || memory.rawBullet || '').trim(),
      technologies: normalizeStringArray(memory.technologies),
      concepts: normalizeStringArray(memory.concepts),
      domainTags: normalizeStringArray(memory.domainTags),
      senioritySignals: normalizeStringArray(memory.senioritySignals),
      impactMetrics: normalizeStringArray(memory.impactMetrics),
    }))
    .filter((memory) => memory.rawBullet && memory.normalizedBullet);
};

const parseRawText = async (rawText) => {
  const input = String(rawText || '').trim();

  if (!input) {
    throw new Error('Raw text is required');
  }

  const prompt = `
You are parsing resume/project bullet intelligence for a resume tailoring system.

Return JSON only. Split the pasted input into individual bullet memories. For each bullet:
- Detect the nearest section/header and map it to exactly one memoryType:
  strongest, ats, product_company, startup.
- Remove bullet markers, wrapping quotes, and surrounding whitespace.
- Extract only technologies, concepts, domain tags, seniority signals, and impact metrics that are directly supported by the bullet text.
- Do not invent details.

Raw pasted text:
${input}
`;

  const parsed = await generateJson({
    prompt,
    schema: parserSchema,
    model: LLM_MODEL,
    logType: 'project_parsing_ai_call',
    metadata: { inputLength: input.length }
  });

  const memories = sanitizeMemories(parsed.memories);

  if (memories.length === 0) {
    throw new Error('No valid resume memories were parsed from the input');
  }

  return memories;
};

module.exports = {
  parseRawText,
};
