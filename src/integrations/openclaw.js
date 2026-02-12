const OpenClaw = require('openclaw');
const config = require('../config/env');

const openclaw = new OpenClaw({ apiKey: config.AI.OPENCLAW_API_KEY });

module.exports = {
  callOpenClaw: async (systemPrompt, context, userMessage) => {
    try {
      const response = await openclaw.chat.completions.create({
        messages: [
            { role: 'system', content: `${systemPrompt}\nCONTEXT:${JSON.stringify(context)}` },
            { role: 'user', content: userMessage },
        ],
        model: 'openclaw-v1', // Placeholder
     });
     return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenClaw Error:', error);
      throw error;
    }
  }
};
