/**
 * Script para probar que productos digitales NO preguntan sobre recogida
 */

import { construirPromptDigital, type ProductoInfo } from '../src/conversational-module/ai/promptBuilder';

console.log('🧪 PRUEBA: Productos Digitales - Sin Pregunta de Recogida\n');
console.log('='.repeat(60));

// Producto digital de ejemplo
const cursoDigital: ProductoInfo = {
  id: 1,
  nombre: 'Curso Completo de Piano',
  descripcion: 'Aprende piano desde cero con 10 módulos completos, videos HD, partituras descargables y soporte personalizado.',
  precio: 15000,
  categoria: 'DIGITAL',
  tipoVenta: 'digital',
  imagenes: ['https://example.com/piano.jpg'],
  metodosPago: ['Nequi', 'Daviplata', 'PayPal']
};

console.log('\n📦 PRODUCTO DE PRUEBA:');
console.log(`   Nombre: ${cursoDigital.nombre}`);
console.log(`   Tipo: ${cursoDigital.categoria}`);
console.log(`   Precio: ${cursoDigital.precio.toLocaleString('es-CO')} COP`);

console.log('\n📝 PROMPT GENERADO:');
console.log('-'.repeat(60));
const prompt = construirPromptDigital(cursoDigital);
console.log(prompt);
console.log('-'.repeat(60));

// Verificaciones
console.log('\n✅ VERIFICACIONES:');

const checks = [
  {
    name: 'Menciona que es DIGITAL',
    test: prompt.includes('DIGITAL') || prompt.includes('digital'),
    critical: true
  },
  {
    name: 'Menciona entrega inmediata',
    test: prompt.includes('inmediata') || prompt.includes('instantáneo'),
    critical: true
  },
  {
    name: 'NO menciona recogida en tienda',
    test: !prompt.toLowerCase().includes('recoger') && !prompt.toLowerCase().includes('recogida'),
    critical: true
  },
  {
    name: 'NO menciona envío físico',
    test: !prompt.toLowerCase().includes('envío a domicilio') && !prompt.toLowerCase().includes('costo de envío'),
    critical: true
  },
  {
    name: 'Menciona WhatsApp o email',
    test: prompt.includes('WhatsApp') || prompt.includes('email'),
    critical: true
  },
  {
    name: 'Incluye instrucción de NO preguntar por recogida',
    test: prompt.includes('NO se recoge') || prompt.includes('NO tiene envío físico'),
    critical: true
  },
  {
    name: 'Incluye precio',
    test: prompt.includes('15,000') || prompt.includes('15.000'),
    critical: false
  }
];

let passed = 0;
let failed = 0;
let criticalFailed = 0;

checks.forEach(check => {
  const status = check.test ? '✅' : '❌';
  const critical = check.critical ? '🔴 CRÍTICO' : '';
  console.log(`   ${status} ${check.name} ${critical}`);
  
  if (check.test) {
    passed++;
  } else {
    failed++;
    if (check.critical) criticalFailed++;
  }
});

console.log('\n📊 RESULTADOS:');
console.log(`   ✅ Pasadas: ${passed}/${checks.length}`);
console.log(`   ❌ Fallidas: ${failed}/${checks.length}`);
if (criticalFailed > 0) {
  console.log(`   🔴 Críticas fallidas: ${criticalFailed}`);
}

console.log('\n' + '='.repeat(60));

if (criticalFailed === 0 && failed === 0) {
  console.log('✅ TODAS LAS PRUEBAS PASARON');
  console.log('El prompt está correctamente configurado para productos digitales.');
} else if (criticalFailed > 0) {
  console.log('❌ PRUEBAS CRÍTICAS FALLARON');
  console.log('El prompt necesita correcciones urgentes.');
  process.exit(1);
} else {
  console.log('⚠️ ALGUNAS PRUEBAS FALLARON');
  console.log('El prompt funciona pero podría mejorarse.');
}

console.log('\n💡 RECOMENDACIÓN:');
console.log('   Prueba con un cliente real preguntando por un curso digital');
console.log('   y verifica que NO pregunte sobre recogida o envío físico.');
