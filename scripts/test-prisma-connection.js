require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

console.log('🔍 Probando conexión a PostgreSQL con Prisma...');
console.log('📡 DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));

async function testConnection() {
  try {
    // Probar conexión
    await prisma.$connect();
    console.log('✅ Conexión exitosa con Prisma!');
    
    // Obtener información de la BD
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as pg_version`;
    console.log('\n⏰ Hora actual de la BD:', result[0].current_time);
    console.log('📊 Versión de PostgreSQL:', result[0].pg_version.split(' ')[0] + ' ' + result[0].pg_version.split(' ')[1]);
    
    // Listar tablas
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('\n📋 Tablas en la base de datos:');
    if (tables.length === 0) {
      console.log('   ⚠️  No hay tablas. Ejecuta: npx prisma db push');
    } else {
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table_name}`);
      });
    }
    
    // Contar usuarios (si existe la tabla)
    try {
      const userCount = await prisma.user.count();
      console.log(`\n👥 Usuarios registrados: ${userCount}`);
    } catch (e) {
      console.log('\n⚠️  Tabla "users" no existe aún. Ejecuta: npx prisma db push');
    }
    
    await prisma.$disconnect();
    console.log('\n✅ Test completado exitosamente!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error de conexión:', error.message);
    console.error('\n💡 Posibles soluciones:');
    console.error('   1. Verifica DATABASE_URL en .env');
    console.error('   2. Verifica que tu IP esté permitida en EasyPanel');
    console.error('   3. Intenta desde la red interna de EasyPanel');
    console.error('   4. Verifica que el puerto 6432 esté abierto');
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();
