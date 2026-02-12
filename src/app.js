const whatsapp = require('./integrations/whatsapp');
const db = require('./database/connection');
const logger = require('./utils/logger');
const config = require('./config/env');

const start = async () => {
  logger.info('Starting Bot-Inteligente Platform...');
  
  // Initialize Database (Wait for connection)
  try {
      await db.pool.connect();
      logger.info('Connected to PostgreSQL');
  } catch (e) {
      logger.error('Failed to connect to database', e);
      process.exit(1);
  }

  // Initialize WhatsApp
  try {
      await whatsapp.connect();
      logger.info('WhatsApp Integration Started');
  } catch (e) {
      logger.error('Failed to start WhatsApp Integration', e);
  }
  
  // Keep alive for Docker? Node.js process keeps alive if sockets open.
  
  logger.info(`Server running on port ${config.PORT}`);
};

start();
