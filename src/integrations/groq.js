const Groq = require('groq-sdk');
const config = require('../config/env');

const groq = new Groq({ apiKey: config.AI.GROQ_API_KEY });

module.exports = {
  callGroq: async (systemPrompt, context, userMessage) => {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: `${systemPrompt}\nCONTEXT:${JSON.stringify(context)}` },
          { role: 'user', content: userMessage },
        ],
        model: 'llama3-8b-8192', 
      });
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Groq Error:', error);
      throw error;
    }
  },
  
  analyzeIntent: async (message) => {
      const prompt = `
      Analiza el siguiente mensaje y devuelve un JSON con la intención y confianza.
      Intenciones posibles: saludo, consulta_precio, comparacion, compra, soporte, reclamo, objecion_precio, despedida.
      Mensaje: "${message}"
      Responder SOLO JSON.
      Ejemplo: {"intent": "consulta_precio", "confidence": 0.9, "entities": {"categoria": "laptop"}}
      `;
      try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama3-8b-8192',
            response_format: { type: 'json_object' }
        });
        return JSON.parse(completion.choices[0]?.message?.content || '{}');
      } catch (e) {
          console.error("Intent Error", e);
          return { intent: "unknown", confidence: 0 };
      }
  }
};
