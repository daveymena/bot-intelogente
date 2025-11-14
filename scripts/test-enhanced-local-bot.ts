/**
 * Script de testing para el Enhanced Local Bot
 * Prueba todos los patrones y categorías
 */

import { EnhancedLocalBot } from '../src/lib/enhanced-local-bot';

const bot = new EnhancedLocalBot();

interface TestCase {
  category: string;
  message: string;
  shouldBeLocal: boolean;
}

const testCases: TestCase[] = [
  // ✅ Saludos SIMPLES (solo saludos puros, cortos)
  { category: 'Saludos', message: 'Hola', shouldBeLocal: true },
  { category: 'Saludos', message: 'Buenos días', shouldBeLocal: true },
  { category: 'Saludos', message: 'Buenas tardes', shouldBeLocal: true },
  { category: 'Saludos', message: 'Hola buenas', shouldBeLocal: true },
  { category: 'Saludos', message: 'Hey', shouldBeLocal: true },
  
  // ✅ Despedidas SIMPLES
  { category: 'Despedidas', message: 'Adiós', shouldBeLocal: true },
  { category: 'Despedidas', message: 'Chao', shouldBeLocal: true },
  { category: 'Despedidas', message: 'Hasta luego', shouldBeLocal: true },
  { category: 'Despedidas', message: 'Nos vemos', shouldBeLocal: true },
  
  // ✅ Agradecimientos SIMPLES
  { category: 'Agradecimientos', message: 'Gracias', shouldBeLocal: true },
  { category: 'Agradecimientos', message: 'Muchas gracias', shouldBeLocal: true },
  { category: 'Agradecimientos', message: 'Mil gracias', shouldBeLocal: true },
  
  // ✅ Confirmaciones SIMPLES
  { category: 'Confirmaciones', message: 'Ok', shouldBeLocal: true },
  { category: 'Confirmaciones', message: 'Perfecto', shouldBeLocal: true },
  { category: 'Confirmaciones', message: 'Listo', shouldBeLocal: true },
  { category: 'Confirmaciones', message: 'Entendido', shouldBeLocal: true },
  { category: 'Confirmaciones', message: 'Dale', shouldBeLocal: true },
  
  // ❌ TODO LO DEMÁS VA A IA (requiere razonamiento o contexto)
  
  // Saludos con contexto → IA
  { category: 'Saludos+Contexto', message: 'Hola, cómo estás?', shouldBeLocal: false },
  { category: 'Saludos+Contexto', message: 'Hola, estoy interesado en...', shouldBeLocal: false },
  
  // Despedidas con contexto → IA
  { category: 'Despedidas+Contexto', message: 'Gracias, adiós', shouldBeLocal: false },
  { category: 'Despedidas+Contexto', message: 'Ok perfecto, chao', shouldBeLocal: false },
  
  // Agradecimientos con contexto → IA
  { category: 'Agradecimientos+Contexto', message: 'Gracias por la información', shouldBeLocal: false },
  { category: 'Agradecimientos+Contexto', message: 'Gracias por todo', shouldBeLocal: false },
  
  // Métodos de Pago → IA (puede necesitar contexto del producto)
  { category: 'Métodos de Pago', message: '¿Cuáles son los métodos de pago?', shouldBeLocal: false },
  { category: 'Métodos de Pago', message: '¿Cómo puedo pagar?', shouldBeLocal: false },
  { category: 'Métodos de Pago', message: '¿Aceptan tarjeta?', shouldBeLocal: false },
  { category: 'Métodos de Pago', message: 'Formas de pago', shouldBeLocal: false },
  { category: 'Métodos de Pago', message: '¿Puedo pagar con Nequi?', shouldBeLocal: false },
  
  // Envío → IA (puede necesitar ciudad específica)
  { category: 'Envío', message: '¿Hacen envíos?', shouldBeLocal: false },
  { category: 'Envío', message: '¿Cuánto demora el envío?', shouldBeLocal: false },
  { category: 'Envío', message: 'Información de entrega', shouldBeLocal: false },
  { category: 'Envío', message: '¿Envían a toda Colombia?', shouldBeLocal: false },
  
  // Garantía → IA (puede necesitar contexto del producto)
  { category: 'Garantía', message: '¿Tienen garantía?', shouldBeLocal: false },
  { category: 'Garantía', message: 'Información de garantía', shouldBeLocal: false },
  { category: 'Garantía', message: '¿Puedo devolver el producto?', shouldBeLocal: false },
  
  // Horarios → IA (puede tener preguntas específicas)
  { category: 'Horarios', message: '¿Cuál es el horario de atención?', shouldBeLocal: false },
  { category: 'Horarios', message: '¿A qué hora abren?', shouldBeLocal: false },
  { category: 'Horarios', message: 'Horarios', shouldBeLocal: false },
  
  // Disponibilidad → IA (necesita consultar BD)
  { category: 'Disponibilidad', message: '¿Tienen disponible?', shouldBeLocal: false },
  { category: 'Disponibilidad', message: '¿Hay stock?', shouldBeLocal: false },
  
  // Sobre el Negocio → IA (puede ser pregunta compleja)
  { category: 'Negocio', message: '¿Quiénes son?', shouldBeLocal: false },
  { category: 'Negocio', message: '¿Dónde están ubicados?', shouldBeLocal: false },
  
  // Casos que NO deben ser locales (requieren IA)
  { category: 'Productos', message: 'Busco una laptop para diseño gráfico', shouldBeLocal: false },
  { category: 'Productos', message: '¿Cuál es el precio del curso de piano?', shouldBeLocal: false },
  { category: 'Productos', message: 'Quiero ver las motos eléctricas', shouldBeLocal: false },
  { category: 'Productos', message: 'Necesito una laptop con 16GB de RAM', shouldBeLocal: false },
  
  // Links de pago (NO deben ser locales - requieren IA para generar link)
  { category: 'Link Pago', message: 'Me envías el link de pago?', shouldBeLocal: false },
  { category: 'Link Pago', message: 'Envíame el link de mercado pago', shouldBeLocal: false },
  { category: 'Link Pago', message: 'Quiero el link para pagar', shouldBeLocal: false },
  { category: 'Link Pago', message: 'Dame el link de PayPal', shouldBeLocal: false },
  { category: 'Link Pago', message: 'Pásame el link', shouldBeLocal: false },
];

async function runTests() {
  console.log('🧪 INICIANDO PRUEBAS DEL BOT LOCAL\n');
  console.log('='.repeat(60));
  
  let passed = 0;
  let failed = 0;
  const failedTests: { test: TestCase; result: any }[] = [];

  for (const test of testCases) {
    const result = await bot.processMessage(test.message);
    const success = result.wasLocal === test.shouldBeLocal;
    
    if (success) {
      passed++;
      console.log(`✅ ${test.category}: "${test.message}"`);
      if (result.wasLocal) {
        console.log(`   Respuesta: ${result.response.substring(0, 50)}...`);
        console.log(`   Tiempo: ${result.confidence * 100}% confianza\n`);
      }
    } else {
      failed++;
      failedTests.push({ test, result });
      console.log(`❌ ${test.category}: "${test.message}"`);
      console.log(`   Esperado: ${test.shouldBeLocal ? 'Local' : 'IA'}`);
      console.log(`   Obtenido: ${result.wasLocal ? 'Local' : 'IA'}\n`);
    }
  }

  console.log('='.repeat(60));
  console.log('\n📊 RESULTADOS DE LAS PRUEBAS\n');
  console.log(`Total de pruebas: ${testCases.length}`);
  console.log(`✅ Exitosas: ${passed} (${((passed / testCases.length) * 100).toFixed(1)}%)`);
  console.log(`❌ Fallidas: ${failed} (${((failed / testCases.length) * 100).toFixed(1)}%)`);

  // Mostrar métricas del bot
  console.log('\n' + bot.getFormattedStats());

  // Mostrar pruebas fallidas
  if (failedTests.length > 0) {
    console.log('\n❌ PRUEBAS FALLIDAS:\n');
    failedTests.forEach(({ test, result }) => {
      console.log(`• ${test.category}: "${test.message}"`);
      console.log(`  Esperado: ${test.shouldBeLocal ? 'Local' : 'IA'}`);
      console.log(`  Obtenido: ${result.wasLocal ? 'Local' : 'IA'}\n`);
    });
  }

  // Pruebas de rendimiento
  console.log('\n⚡ PRUEBA DE RENDIMIENTO\n');
  const performanceTests = [
    'Hola',
    '¿Cuáles son los métodos de pago?',
    '¿Hacen envíos?',
    'Gracias'
  ];

  let totalTime = 0;
  for (const message of performanceTests) {
    const start = Date.now();
    await bot.processMessage(message);
    const time = Date.now() - start;
    totalTime += time;
    console.log(`"${message}": ${time}ms`);
  }

  const avgTime = totalTime / performanceTests.length;
  console.log(`\nTiempo promedio: ${avgTime.toFixed(2)}ms`);
  
  if (avgTime < 100) {
    console.log('✅ Excelente rendimiento (< 100ms)');
  } else if (avgTime < 200) {
    console.log('⚠️ Rendimiento aceptable (< 200ms)');
  } else {
    console.log('❌ Rendimiento bajo (> 200ms)');
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 PRUEBAS COMPLETADAS\n');
}

// Ejecutar pruebas
runTests().catch(console.error);
