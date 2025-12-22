/**
 * Test del Sistema de Base de Conocimiento Local
 */

import { LocalKnowledgeBase } from '../src/lib/local-knowledge-base';

async function testKnowledgeBase() {
  console.log('🧪 TEST: Base de Conocimiento Local\n');

  try {
    // 1. Inicializar
    console.log('1️⃣ Inicializando base de conocimiento...');
    await LocalKnowledgeBase.initialize();
    console.log('✅ Inicializada\n');

    // 2. Guardar respuestas de ejemplo
    console.log('2️⃣ Guardando respuestas de ejemplo...');
    
    await LocalKnowledgeBase.saveSuccessfulResponse({
      userQuery: 'tienes el curso de piano?',
      botResponse: '¡Hola! 😄 Sí, el Curso Completo de Piano Online está disponible ✅\n\n📚 Incluye:\n- Teoría musical completa\n- Técnicas de interpretación\n- Partituras y ejercicios\n- Videos HD paso a paso\n\n💰 Precio: $60,000 COP\n🎓 Acceso: De por vida\n✅ Certificado incluido\n\n¿Te gustaría más información sobre el curso? 😊',
      productId: 'curso-piano-123',
      productName: 'Curso Completo de Piano Online',
      confidence: 0.95
    });

    await LocalKnowledgeBase.saveSuccessfulResponse({
      userQuery: 'cuanto cuesta el curso de diseño grafico?',
      botResponse: '¡Hola! 😄 El Mega Pack 01: Cursos Diseño Gráfico tiene un precio de $20,000 COP\n\n📚 Incluye:\n- Photoshop completo\n- Illustrator profesional\n- InDesign avanzado\n- Técnicas profesionales\n\n💰 Precio: $20,000 COP\n🎁 O adquiere el Pack Completo (40 productos) por solo $60,000 COP\n💎 Ahorro de $740,000 COP\n\n¿Te gustaría proceder con la compra? 😊💳',
      productId: 'megapack-diseno-456',
      productName: 'Mega Pack 01: Cursos Diseño Gráfico',
      confidence: 0.92
    });

    await LocalKnowledgeBase.saveSuccessfulResponse({
      userQuery: 'como puedo pagar?',
      botResponse: 'Perfecto 💪 Puedes pagarlo por los siguientes métodos 👇\n\n1️⃣ NEQUI / DAVIPLATA\n   📱 Número: 3136174267\n   ✅ Transferencia instantánea\n\n2️⃣ TARJETA DE CRÉDITO/DÉBITO\n   💳 Pago seguro con MercadoPago\n   ✅ Acceso inmediato\n\n3️⃣ PAYPAL\n   🌎 Pago internacional\n   ✅ Seguro y confiable\n\n4️⃣ TRANSFERENCIA BANCARIA\n   🏦 Banco: Bancolombia\n   ✅ Envía comprobante por WhatsApp\n\n¿Con cuál prefieres continuar? 😄',
      confidence: 0.98
    });

    console.log('✅ 3 respuestas guardadas\n');

    // 3. Buscar respuestas similares
    console.log('3️⃣ Buscando respuestas similares...\n');

    const tests = [
      'tienes curso de piano?',
      'cuanto vale el curso de diseño?',
      'metodos de pago',
      'como pago?',
      'tienes laptops?' // Esta no debería encontrar nada
    ];

    for (const query of tests) {
      console.log(`📝 Consulta: "${query}"`);
      const result = await LocalKnowledgeBase.findSimilarResponse({
        userQuery: query
      });

      if (result) {
        console.log(`✅ Respuesta encontrada (confianza: ${(result.confidence * 100).toFixed(0)}%)`);
        console.log(`   Respuesta: ${result.response.substring(0, 100)}...`);
      } else {
        console.log('❌ No se encontró respuesta similar');
      }
      console.log('');
    }

    // 4. Estadísticas
    console.log('4️⃣ Estadísticas de la base de conocimiento:');
    const stats = await LocalKnowledgeBase.getStats();
    console.log(`   Total de entradas: ${stats.totalEntries}`);
    console.log(`   Tasa de éxito promedio: ${(stats.avgSuccessRate * 100).toFixed(1)}%`);
    console.log(`   Uso total: ${stats.totalUsage} veces`);
    console.log(`   Tamaño del caché: ${stats.cacheSize} entradas`);
    console.log('');

    console.log('✅ Test completado exitosamente');

  } catch (error) {
    console.error('❌ Error en el test:', error);
  }
}

testKnowledgeBase();
