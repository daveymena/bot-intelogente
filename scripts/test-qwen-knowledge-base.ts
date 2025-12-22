/**
 * 🧪 TEST QWEN2.5:3B con Base de Conocimiento
 */

import { OllamaOrchestrator } from '../src/lib/ollama-orchestrator';
import { db } from '../src/lib/db';

async function testQwenWithKnowledgeBase() {
  const modelName = process.env.OLLAMA_MODEL || 'gemma3:4b';
  console.log(`🧪 TEST: ${modelName} con Base de Conocimiento\n`);
  console.log(`📍 Modelo: ${modelName}`);
  console.log(`🌐 URL: ${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}`);
  console.log('='.repeat(60));
  
  try {
    // Obtener un usuario de prueba
    const user = await db.user.findFirst({
      where: {
        email: { contains: '@' }
      }
    });
    
    if (!user) {
      console.error('❌ No se encontró usuario de prueba');
      return;
    }
    
    console.log(`👤 Usuario: ${user.email}`);
    console.log(`📦 ID: ${user.id}\n`);
    
    // Tests
    const tests = [
      {
        name: 'Saludo Inicial',
        message: 'Hola',
        expected: 'Debe usar plantilla de saludo con emojis y categorías'
      },
      {
        name: 'Búsqueda de Laptop',
        message: 'Busco una laptop',
        expected: 'Debe mostrar laptops con formato profesional'
      },
      {
        name: 'Curso de Piano',
        message: 'Curso de piano',
        expected: 'Debe mostrar el curso con precio y métodos de pago'
      },
      {
        name: 'Pregunta por Pago',
        message: 'Cómo puedo pagar?',
        expected: 'Debe usar plantilla de métodos de pago'
      },
      {
        name: 'Producto Económico',
        message: 'Algo económico',
        expected: 'Debe mostrar productos ordenados por precio'
      }
    ];
    
    for (const test of tests) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📝 TEST: ${test.name}`);
      console.log(`💬 Mensaje: "${test.message}"`);
      console.log(`✅ Esperado: ${test.expected}`);
      console.log('-'.repeat(60));
      
      const startTime = Date.now();
      
      try {
        const result = await OllamaOrchestrator.generateWithKnowledgeBase(
          test.message,
          user.id
        );
        
        const duration = Date.now() - startTime;
        
        console.log(`\n🤖 RESPUESTA (${duration}ms):`);
        console.log(result.text);
        
        console.log(`\n📊 Metadata:`);
        console.log(`   Intención: ${result.intent}`);
        console.log(`   Confianza: ${result.confidence}`);
        console.log(`   Productos: ${result.selectedProducts.length}`);
        
        if (result.selectedProducts.length > 0) {
          console.log(`\n📦 Productos mencionados:`);
          result.selectedProducts.forEach(p => {
            console.log(`   - ${p.name} ($${p.price.toLocaleString('es-CO')})`);
          });
        }
        
        // Evaluar calidad de respuesta
        const score = evaluateResponse(result.text, test.message);
        console.log(`\n📊 Score: ${score.total}/100`);
        console.log(`   ✅ Emojis: ${score.hasEmojis ? 'SÍ' : 'NO'}`);
        console.log(`   ✅ Negocio: ${score.mentionsBusiness ? 'SÍ' : 'NO'}`);
        console.log(`   ✅ Formato: ${score.hasFormat ? 'SÍ' : 'NO'}`);
        console.log(`   ✅ Precio: ${score.hasPrice ? 'SÍ' : 'NO'}`);
        console.log(`   ✅ Pago: ${score.mentionsPayment ? 'SÍ' : 'NO'}`);
        
        console.log(`\n${score.total >= 80 ? '✅' : '❌'} Test ${score.total >= 80 ? 'PASADO' : 'FALLADO'} (${duration}ms)`);
        
      } catch (error: any) {
        console.error(`\n❌ ERROR:`, error.message);
      }
      
      // Esperar un poco entre tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ TODOS LOS TESTS COMPLETADOS');
    
  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    await db.$disconnect();
  }
}

/**
 * Evalúa la calidad de la respuesta
 */
function evaluateResponse(response: string, message: string): {
  total: number;
  hasEmojis: boolean;
  mentionsBusiness: boolean;
  hasFormat: boolean;
  hasPrice: boolean;
  mentionsPayment: boolean;
} {
  const hasEmojis = /[\u{1F300}-\u{1F9FF}]/u.test(response);
  const mentionsBusiness = /tecnovariedades|d&s/i.test(response);
  const hasFormat = /\*\*/.test(response) || /•/.test(response);
  const hasPrice = /\$|cop|precio/i.test(response);
  const mentionsPayment = /pago|nequi|daviplata|mercadopago|paypal/i.test(response);
  
  let score = 0;
  if (hasEmojis) score += 20;
  if (mentionsBusiness) score += 20;
  if (hasFormat) score += 20;
  if (hasPrice) score += 20;
  if (mentionsPayment) score += 20;
  
  return {
    total: score,
    hasEmojis,
    mentionsBusiness,
    hasFormat,
    hasPrice,
    mentionsPayment
  };
}

// Ejecutar
testQwenWithKnowledgeBase().catch(console.error);
