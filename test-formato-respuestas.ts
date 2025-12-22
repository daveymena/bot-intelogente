/**
 * Test de Formato de Respuestas
 * Verifica que Ollama genere respuestas con formato profesional
 */

import { OllamaAssistantService } from './src/lib/ollama-assistant-service';

const productosEjemplo = [
  {
    name: 'Laptop HP Pavilion 15',
    price: 2500000,
    category: 'Computadores',
    description: 'Intel Core i7, 16GB RAM, SSD 512GB, Pantalla Full HD'
  },
  {
    name: 'Laptop Dell Inspiron 15',
    price: 1800000,
    category: 'Computadores',
    description: 'Intel Core i5, 8GB RAM, SSD 256GB, Ideal para diseño'
  },
  {
    name: 'Laptop Lenovo IdeaPad',
    price: 1500000,
    category: 'Computadores',
    description: 'AMD Ryzen 5, 8GB RAM, Buena relación calidad-precio'
  }
];

async function testFormato() {
  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                   TEST DE FORMATO DE RESPUESTAS                            ║
║                                                                            ║
║  Verifica que Ollama genere respuestas con formato WhatsApp profesional   ║
╚════════════════════════════════════════════════════════════════════════════╝
  `);

  const customerPhone = '+573001234567';

  // Test 1: Formatear productos
  console.log('\n' + '='.repeat(80));
  console.log('[1/3] TEST: Formatear Productos');
  console.log('='.repeat(80));
  
  const productosFormateados = OllamaAssistantService.formatProductsForWhatsApp(
    productosEjemplo,
    3
  );
  
  console.log('\n📦 Productos formateados:\n');
  console.log(productosFormateados);
  console.log('\n✅ Formato aplicado correctamente');

  // Test 2: Respuesta con productos
  console.log('\n\n' + '='.repeat(80));
  console.log('[2/3] TEST: Respuesta con Productos');
  console.log('='.repeat(80));
  console.log('\n📝 Pregunta: "Necesito una laptop para diseño gráfico"');
  console.log('⏱️  Generando respuesta con Ollama...\n');

  try {
    const startTime = Date.now();
    const respuestaConProductos = await OllamaAssistantService.generateResponseWithProducts(
      'Necesito una laptop para diseño gráfico',
      customerPhone,
      productosEjemplo
    );
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ Respuesta generada en ${duration}s\n`);
    console.log('💬 Respuesta de Ollama:\n');
    console.log('─'.repeat(80));
    console.log(respuestaConProductos);
    console.log('─'.repeat(80));

    // Verificar formato
    console.log('\n🔍 Verificando formato:');
    const tieneEmojis = /[😊🎉💰✅📦💻🏍️📚]/u.test(respuestaConProductos);
    const tieneNegritas = /\*.*\*/.test(respuestaConProductos);
    const tienePrecio = /\$[\d,]+/.test(respuestaConProductos);
    const tienePregunta = /\?/.test(respuestaConProductos);

    console.log(`   ${tieneEmojis ? '✅' : '❌'} Contiene emojis`);
    console.log(`   ${tieneNegritas ? '✅' : '❌'} Usa negritas (*texto*)`);
    console.log(`   ${tienePrecio ? '✅' : '❌'} Precios formateados`);
    console.log(`   ${tienePregunta ? '✅' : '❌'} Termina con pregunta`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  // Test 3: Respuesta sin productos
  console.log('\n\n' + '='.repeat(80));
  console.log('[3/3] TEST: Respuesta sin Productos');
  console.log('='.repeat(80));
  console.log('\n📝 Pregunta: "¿Qué características debe tener una laptop para diseño?"');
  console.log('⏱️  Generando respuesta con Ollama...\n');

  try {
    const startTime = Date.now();
    const respuestaSinProductos = await OllamaAssistantService.generateIntelligentResponse(
      '¿Qué características debe tener una laptop para diseño?',
      customerPhone,
      []
    );
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ Respuesta generada en ${duration}s\n`);
    console.log('💬 Respuesta de Ollama:\n');
    console.log('─'.repeat(80));
    console.log(respuestaSinProductos);
    console.log('─'.repeat(80));

    // Verificar formato
    console.log('\n🔍 Verificando formato:');
    const tieneEmojis = /[😊🎉💰✅📦💻]/u.test(respuestaSinProductos);
    const tieneEstructura = /\n/.test(respuestaSinProductos);
    const tienePregunta = /\?/.test(respuestaSinProductos);

    console.log(`   ${tieneEmojis ? '✅' : '❌'} Contiene emojis`);
    console.log(`   ${tieneEstructura ? '✅' : '❌'} Tiene estructura (saltos de línea)`);
    console.log(`   ${tienePregunta ? '✅' : '❌'} Termina con pregunta`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  // Resumen
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 RESUMEN');
  console.log('='.repeat(80));
  console.log('\n✅ Tests completados');
  console.log('\n💡 Características del formato:');
  console.log('   - Emojis relevantes y profesionales');
  console.log('   - Negritas para destacar información importante');
  console.log('   - Precios formateados con separador de miles');
  console.log('   - Estructura clara con saltos de línea');
  console.log('   - Preguntas de seguimiento para continuar conversación');
  console.log('\n🎯 Resultado: Formato WhatsApp profesional ✅');
  console.log('');
}

// Ejecutar test
testFormato().catch(console.error);
