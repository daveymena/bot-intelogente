#!/usr/bin/env tsx
/**
 * 🔌 TEST DE CONEXIÓN A POSTGRESQL
 * 
 * Script para probar la conexión a PostgreSQL de Easypanel
 * 
 * USO:
 * 1. Configura las variables de conexión abajo
 * 2. Ejecuta: npx tsx scripts/test-postgres-connection.ts
 */

import { Client } from 'pg';

// ========================================
// 🔧 CONFIGURACIÓN - EDITA ESTOS VALORES
// ========================================

const DB_CONFIG = {
  // Opción 1: URL completa (más fácil)
  connectionString: 'postgresql://postgres:9feb7a0e7110d6a42e93@157.173.97.41:5432/botwhatsapp',
  
  // Opción 2: Valores separados (descomenta si prefieres)
  // host: '157.173.97.41',
  // port: 5432,
  // user: 'postgres',
  // password: '9feb7a0e7110d6a42e93',
  // database: 'botwhatsapp',
  
  // Configuración adicional
  ssl: false, // sslmode=disable según tu configuración
  connectionTimeoutMillis: 10000,
};

// ========================================
// 🧪 FUNCIONES DE PRUEBA
// ========================================

async function testConnection() {
  console.log('🔌 Probando conexión a PostgreSQL...\n');
  console.log('📋 Configuración:');
  console.log(`   Host: ${DB_CONFIG.connectionString || DB_CONFIG.host}`);
  console.log(`   Database: botwhatsapp`);
  console.log(`   SSL: ${DB_CONFIG.ssl ? 'Habilitado' : 'Deshabilitado'}\n`);

  const client = new Client(DB_CONFIG);

  try {
    // Intentar conectar
    console.log('⏳ Conectando...');
    await client.connect();
    console.log('✅ Conexión exitosa!\n');

    // Probar consulta simple
    console.log('🔍 Probando consulta...');
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Consulta exitosa!');
    console.log(`   Hora del servidor: ${result.rows[0].current_time}`);
    console.log(`   Versión PostgreSQL: ${result.rows[0].pg_version}\n`);

    // Listar tablas
    console.log('📊 Listando tablas en la base de datos...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tables.rows.length > 0) {
      console.log(`✅ Encontradas ${tables.rows.length} tablas:`);
      tables.rows.forEach((row, i) => {
        console.log(`   ${i + 1}. ${row.table_name}`);
      });
    } else {
      console.log('⚠️  No se encontraron tablas (base de datos vacía)');
    }

    // Contar registros en tablas principales
    console.log('\n📈 Contando registros...');
    const tablesToCount = ['User', 'Product', 'Conversation', 'Message'];
    
    for (const table of tablesToCount) {
      try {
        const count = await client.query(`SELECT COUNT(*) as total FROM "${table}"`);
        console.log(`   ${table}: ${count.rows[0].total} registros`);
      } catch (err) {
        console.log(`   ${table}: tabla no existe o error`);
      }
    }

    console.log('\n✅ TODAS LAS PRUEBAS EXITOSAS!');
    console.log('\n💡 Tu conexión está funcionando correctamente.');
    console.log('   Puedes usar esta configuración en tu .env local:\n');
    console.log(`   DATABASE_URL="${DB_CONFIG.connectionString}"`);

  } catch (error: any) {
    console.error('\n❌ ERROR DE CONEXIÓN:\n');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🚫 Conexión rechazada');
      console.error('   Posibles causas:');
      console.error('   1. PostgreSQL no está expuesto públicamente en Easypanel');
      console.error('   2. IP o puerto incorrectos');
      console.error('   3. Firewall bloqueando el puerto 5432\n');
      console.error('💡 Solución:');
      console.error('   - Ve a Easypanel → Tu servicio PostgreSQL → Domains/Expose');
      console.error('   - Habilita acceso público al puerto 5432');
      console.error('   - O usa un túnel SSH (ver EXPONER_POSTGRES_EASYPANEL.md)');
      
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏱️  Timeout de conexión');
      console.error('   El servidor no responde en el tiempo esperado');
      console.error('   Verifica que la IP/dominio sea correcta\n');
      
    } else if (error.code === '28P01') {
      console.error('🔐 Autenticación fallida');
      console.error('   Usuario o contraseña incorrectos');
      console.error('   Verifica las credenciales en Easypanel\n');
      
    } else if (error.code === '3D000') {
      console.error('🗄️  Base de datos no existe');
      console.error('   La base de datos "botwhatsapp" no existe');
      console.error('   Verifica el nombre en Easypanel\n');
      
    } else {
      console.error('Error desconocido:');
      console.error(`   Código: ${error.code}`);
      console.error(`   Mensaje: ${error.message}\n`);
    }
    
    console.error('📖 Para más ayuda, lee: EXPONER_POSTGRES_EASYPANEL.md');
    process.exit(1);
    
  } finally {
    await client.end();
  }
}

// ========================================
// 🚀 EJECUTAR
// ========================================

console.log('╔════════════════════════════════════════╗');
console.log('║  TEST DE CONEXIÓN POSTGRESQL EASYPANEL ║');
console.log('╚════════════════════════════════════════╝\n');

testConnection()
  .then(() => {
    console.log('\n✨ Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error.message);
    process.exit(1);
  });
