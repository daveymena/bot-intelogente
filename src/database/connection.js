const { Pool } = require('pg');
const config = require('../config/env');

const pool = new Pool({
  host: config.DB.HOST,
  port: config.DB.PORT,
  user: config.DB.USER,
  password: config.DB.PASSWORD,
  database: config.DB.NAME,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
