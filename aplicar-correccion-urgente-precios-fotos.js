/**
 * 🚨 CORRECCIÓN URGENTE: IA INVENTA PRODUCTOS + FOTOS NO SE ENVÍAN
 * 
 * Este script aplica las correcciones críticas:
 * 1. Forzar que la IA use SOLO datos reales de BD
 * 2. Activar envío automático de fotos
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('========================================');
console.log('🚨 CORRECCIÓN URGENTE');
console.log('========================================\n');

console.log('PROBLEMAS A CORREGIR:');
console.log('1. ❌ IA inventa productos (Dell, HP, Lenovo)');
console.log('2. ❌ Fotos no se envían automáticamente');
console.log('');

console.log('APLICANDO CORRECCIONES...\n');

try {
  // 1. Integrar Real Data Enforcer
  console.log('📝 1/2: Actualizando SimpleConversationHandler...');
  execSync('npx tsx scripts/integrar-real-data-enforcer.ts', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('');
  
  // 2. Integrar Card Photo Sender
  console.log('📸 2/2: Activando envío automático de fotos...');
  execSync('npx tsx scripts/integrar-card-photo-sender.ts', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('');
  console.log('========================================');
  console.log('✅ CORRECCIONES APLICADAS EXITOSAMENTE');
  console.log('========================================\n');
  
  console.log('🔥 CAMBIOS REALIZADOS:');
  console.log('');
  console.log('1. SimpleConversationHandler:');
  console.log('   ✅ Prompt actualizado con regla anti-inventar');
  console.log('   ✅ Productos reales siempre pasados a IA');
  console.log('   ✅ Envío de fotos activado en actions');
  console.log('');
  console.log('2. BaileysStableService:');
  console.log('   ✅ CardPhotoSender integrado');
  console.log('   ✅ Formato profesional para fotos');
  console.log('   ✅ Pausas anti-ban entre fotos');
  console.log('');
  console.log('📋 PRÓXIMOS PASOS:');
  console.log('');
  console.log('1. Reiniciar el servidor:');
  console.log('   npm run dev');
  console.log('');
  console.log('2. Probar con WhatsApp:');
  console.log('   "Tienes portátiles"');
  console.log('');
  console.log('3. Verificar que:');
  console.log('   ✅ Solo muestra Asus, Acer, HP (productos reales)');
  console.log('   ✅ NO muestra Dell, Lenovo (inventados)');
  console.log('   ✅ Envía fotos automáticamente');
  console.log('');
  console.log('🎯 RESULTADO ESPERADO:');
  console.log('');
  console.log('Usuario: "Tienes portátiles"');
  console.log('');
  console.log('Bot: "💻 Sí, tengo portátiles disponibles:');
  console.log('');
  console.log('1️⃣ Asus Vivobook Go 15');
  console.log('   💰 1.699.900 COP');
  console.log('   📝 AMD Ryzen 3, 8GB RAM, 512GB SSD');
  console.log('');
  console.log('2️⃣ Asus Vivobook X1404va');
  console.log('   💰 1.699.900 COP');
  console.log('   📝 Intel Core i5, 12GB RAM, 256GB SSD');
  console.log('');
  console.log('[FOTO 1 enviada]');
  console.log('[FOTO 2 enviada]');
  console.log('');
  console.log('¿Cuál te interesa? 😊"');
  console.log('');
  
} catch (error) {
  console.error('');
  console.error('❌ ERROR APLICANDO CORRECCIONES:');
  console.error(error.message);
  console.error('');
  console.error('Por favor revisa los errores arriba y vuelve a intentar.');
  process.exit(1);
}
