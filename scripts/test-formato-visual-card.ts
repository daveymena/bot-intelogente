/**
 * Script para probar el formato visual tipo "card" en respuestas
 */

import { 
  construirPromptDigital,
  construirPromptFisico,
  construirPromptDropshipping,
  construirPromptServicio,
  type ProductoInfo 
} from '../src/conversational-module/ai/promptBuilder';

console.log('🎨 PRUEBA: Formato Visual Card en WhatsApp\n');
console.log('='.repeat(70));

// Productos de prueba
const productos = {
  digital: {
    id: 1,
    nombre: 'Curso Completo de Piano',
    descripcion: 'Aprende piano desde cero con 10 módulos completos, videos HD, partituras descargables y soporte personalizado.',
    precio: 15000,
    categoria: 'DIGITAL',
    metodosPago: ['Nequi', 'Daviplata', 'PayPal']
  } as ProductoInfo,
  
  fisico: {
    id: 2,
    nombre: 'Laptop HP 15-dy2021la',
    descripcion: 'Intel Core i5, 8GB RAM, 256GB SSD, Pantalla 15.6" Full HD, Windows 11',
    precio: 1850000,
    categoria: 'PHYSICAL',
    stock: 3,
    metodosPago: ['Efectivo', 'Transferencia', 'Tarjeta']
  } as ProductoInfo,
  
  dropshipping: {
    id: 3,
    nombre: 'Smartwatch X5 Pro',
    descripcion: 'Reloj inteligente con monitor de salud, GPS, resistente al agua, batería 7 días',
    precio: 89900,
    categoria: 'PHYSICAL',
    metodosPago: ['Contrareembolso', 'Transferencia']
  } as ProductoInfo,
  
  servicio: {
    id: 4,
    nombre: 'Reparación de Laptops',
    descripcion: 'Diagnóstico y reparación de laptops, cambio de piezas, limpieza, actualización',
    precio: 50000,
    categoria: 'SERVICE',
    metodosPago: ['Efectivo', 'Transferencia']
  } as ProductoInfo
};

// Función para verificar formato
function verificarFormato(prompt: string, tipo: string): { passed: number; failed: number; checks: any[] } {
  const checks = [
    {
      name: 'Tiene línea superior decorativa (┏━━━)',
      test: prompt.includes('┏━━━') || prompt.includes('━━━'),
      critical: true
    },
    {
      name: 'Usa emojis en secciones',
      test: /[📚💰✅💳🚚📦🎓🔧🎁]/u.test(prompt),
      critical: true
    },
    {
      name: 'Usa negritas para títulos (*TEXTO*)',
      test: prompt.includes('*') && /\*[A-ZÁÉÍÓÚ\s]+\*/u.test(prompt),
      critical: true
    },
    {
      name: 'Usa separadores (━━━)',
      test: (prompt.match(/━━━/g) || []).length >= 2,
      critical: true
    },
    {
      name: 'Usa viñetas (•) para listas',
      test: prompt.includes('•'),
      critical: false
    },
    {
      name: 'Tiene llamado a la acción con emoji',
      test: /🎯|😊/u.test(prompt),
      critical: false
    },
    {
      name: 'Formato organizado (no texto corrido)',
      test: prompt.split('\n').length > 10,
      critical: true
    }
  ];

  let passed = 0;
  let failed = 0;

  console.log(`\n📋 VERIFICACIÓN: ${tipo}`);
  console.log('-'.repeat(70));

  checks.forEach(check => {
    const status = check.test ? '✅' : '❌';
    const critical = check.critical ? '🔴' : '⚪';
    console.log(`   ${status} ${critical} ${check.name}`);
    
    if (check.test) {
      passed++;
    } else {
      failed++;
    }
  });

  return { passed, failed, checks };
}

// Probar cada tipo de producto
console.log('\n\n🧪 PROBANDO FORMATOS...\n');

const resultados: any = {};

// 1. Producto Digital
console.log('\n' + '='.repeat(70));
console.log('1️⃣  PRODUCTO DIGITAL');
console.log('='.repeat(70));
const promptDigital = construirPromptDigital(productos.digital);
resultados.digital = verificarFormato(promptDigital, 'Producto Digital');

// 2. Producto Físico
console.log('\n' + '='.repeat(70));
console.log('2️⃣  PRODUCTO FÍSICO');
console.log('='.repeat(70));
const promptFisico = construirPromptFisico(productos.fisico);
resultados.fisico = verificarFormato(promptFisico, 'Producto Físico');

// 3. Dropshipping
console.log('\n' + '='.repeat(70));
console.log('3️⃣  DROPSHIPPING');
console.log('='.repeat(70));
const promptDropshipping = construirPromptDropshipping(productos.dropshipping);
resultados.dropshipping = verificarFormato(promptDropshipping, 'Dropshipping');

// 4. Servicio
console.log('\n' + '='.repeat(70));
console.log('4️⃣  SERVICIO');
console.log('='.repeat(70));
const promptServicio = construirPromptServicio(productos.servicio);
resultados.servicio = verificarFormato(promptServicio, 'Servicio');

// Resumen final
console.log('\n\n' + '='.repeat(70));
console.log('📊 RESUMEN FINAL');
console.log('='.repeat(70));

let totalPassed = 0;
let totalFailed = 0;
let allPassed = true;

Object.entries(resultados).forEach(([tipo, resultado]: [string, any]) => {
  const status = resultado.failed === 0 ? '✅' : '❌';
  console.log(`\n${status} ${tipo.toUpperCase()}: ${resultado.passed}/${resultado.passed + resultado.failed} pruebas pasadas`);
  totalPassed += resultado.passed;
  totalFailed += resultado.failed;
  if (resultado.failed > 0) allPassed = false;
});

console.log('\n' + '-'.repeat(70));
console.log(`Total: ${totalPassed}/${totalPassed + totalFailed} pruebas pasadas`);

if (allPassed) {
  console.log('\n✅ ¡TODOS LOS FORMATOS ESTÁN CORRECTOS!');
  console.log('   El formato visual tipo "card" está implementado correctamente.');
} else {
  console.log('\n⚠️  ALGUNOS FORMATOS NECESITAN AJUSTES');
  console.log('   Revisa los prompts que fallaron.');
}

// Mostrar ejemplo de un prompt
console.log('\n\n' + '='.repeat(70));
console.log('📝 EJEMPLO DE PROMPT GENERADO (Producto Digital)');
console.log('='.repeat(70));
console.log('\nPROMPT COMPLETO:');
console.log('-'.repeat(70));
console.log(promptDigital);
console.log('-'.repeat(70));

console.log('\n💡 NOTA:');
console.log('   Este es el prompt que recibe la IA. La IA debe seguir');
console.log('   el formato de ejemplo incluido en el prompt para generar');
console.log('   respuestas visuales tipo "card" bien organizadas.');

console.log('\n📚 Ver más ejemplos en: FORMATO_VISUAL_CARD_WHATSAPP.md');
