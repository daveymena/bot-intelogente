/**
 * Script para aplicar la migración del modelo Order
 */

const { execSync } = require('child_process');

console.log('📦 Aplicando migración del modelo Order...\n');

try {
  // Generar el cliente de Prisma
  console.log('1️⃣ Generando cliente de Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('\n2️⃣ Creando migración...');
  execSync('npx prisma migrate dev --name add_order_model', { stdio: 'inherit' });
  
  console.log('\n✅ Migración aplicada exitosamente!');
  console.log('\n📊 El modelo Order está listo para usar.');
  console.log('\nAhora puedes:');
  console.log('- Crear órdenes desde el checkout');
  console.log('- Ver órdenes en /tienda/orden/[id]');
  console.log('- Gestionar órdenes desde el dashboard');
  
} catch (error) {
  console.error('\n❌ Error al aplicar la migración:', error.message);
  console.log('\n💡 Si estás en producción, usa:');
  console.log('   npx prisma migrate deploy');
}
