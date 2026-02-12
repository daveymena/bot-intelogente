const pino = require('pino');
const config = require('../config/env');

const logger = pino({
  level: config.LOG_LEVEL,
  timestamp: pino.stdTimeFunctions.isoTime,
});

module.exports = logger;
