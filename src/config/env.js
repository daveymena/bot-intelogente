require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: process.env.DB_PORT || 5432,
    USER: process.env.DB_USER || 'botuser',
    PASSWORD: process.env.DB_PASSWORD,
    NAME: process.env.DB_NAME || 'botdb',
  },
  AI: {
    PROVIDER: process.env.AI_PROVIDER || 'groq', // 'groq' | 'openclaw'
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    OPENCLAW_API_KEY: process.env.OPENCLAW_API_KEY,
  },
  TENANT_MODE: process.env.TENANT_MODE === 'true',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
