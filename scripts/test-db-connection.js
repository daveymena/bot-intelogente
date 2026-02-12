
require('dotenv').config();
const { Pool } = require('pg');

// Configuración con SSL deshabilitado para EasyPanel
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: false, // Deshabilitar SSL para conexión local
  connectionTimeoutMillis: 5000,
});

console.log('Testing connection...', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    database: process.env.DB_NAME
});

async function test() {
  try {
    const client = await pool.connect();
    console.log('✅ Connection Successful!');
    const res = await client.query('SELECT NOW()');
    console.log('Current DB Time:', res.rows[0].now);
    
    // Verificar tablas existentes
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Tablas existentes:');
    if (tables.rows.length === 0) {
      console.log('   ⚠️  No hay tablas. Necesitas aplicar el esquema.');
    } else {
      tables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
    console.error('\n💡 Posibles soluciones:');
    console.error('   1. Verifica que tu IP esté permitida en EasyPanel');
    console.error('   2. Verifica las credenciales en .env');
    console.error('   3. Intenta desde la red interna de EasyPanel');
    process.exit(1);
  }
}

test();
