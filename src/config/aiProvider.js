const aiService = require('../services/aiService');
const env = require('./env');

const providers = {
  groq: aiService.callGroq,
  openclaw: aiService.callOpenClaw,
};

module.exports = {
  getProvider: () => {
    return providers[env.AI.PROVIDER] || providers.groq;
  }
};
