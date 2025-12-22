/**
 * 🤖 TEST: SOLO IA - Sin plantillas locales
 * Qwen2.5 maneja TODO
 */

import { OllamaOrchestrator } from '../src/lib/ollama-orchestrator';
import { db } from '../src/lib/db';

async function testSoloIA() {
  console.log('🤖 TEST: SOLO IA (Qwen2.5 maneja TODO)\n');
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
    
    // Tests - TODOS con IA
    const tests = [
      {
        name: 'Saludo (IA)',
        message: 'Hola',
        expected: 'IA debe generar saludo profesional'
      },
      {
        name: 'Búsqueda Laptop (IA)',
        message: 'Busco una laptop',
        expected: 'IA debe encontrar y presentar laptops'
      },
      {
        name: 'Búsqueda Curso (IA)',
        message: 'Curso de piano',
        expected: 'IA debe encontrar cursos de piano'
      },
      {
        name: 'Pregunta Pago (IA)',
        message: 'Cómo puedo pagar?',
        expected: 'IA debe explicar métodos de pago'
      },
      {
        name: 'Búsqueda Compleja (IA)',
        message: 'Algo económico para estudiar',
        expected: 'IA debe razonar y recomendar'
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
        // USAR SOLO IA - generateWithKnowledgeBase
        const result = await OllamaOrchestrator.generateWithKnowledgeBase(
          test.message,
          user.id
        );
        
        const duration = Date.now() - startTime;
        
        console.log(`\n🤖 RESPUESTA IA (${duration}ms):`);
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
        
        // Evaluar calidad
        const score = evaluateResponse(result.text);
        console.log(`\n📊 Score: ${score.total}/100`);
        console.log(`   ✅ Emojis: ${score.hasEmojis ? 'SÍ' : 'NO'}`);
        console.log(`   ✅ Negocio: ${score.mentionsBusiness ? 'SÍ' : 'NO'}`);
        console.log(`   ✅ Formato: ${score.hasFormat ? 'SÍ' : 'NO'}`);
        console.log(`   ✅ Profesional: ${score.isProfessional ? 'SÍ' : 'NO'}`);
        
        console.log(`\n${score.total >= 80 ? '✅' : '❌'} Test ${score.total >= 80 ? 'PASADO' : 'FALLADO'} (${duration}ms)`);
        
      } catch (error: any) {
        console.error(`\n❌ ERROR:`, error.message);
      }
      
      // Esperar entre tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ TODOS LOS TESTS COMPLETADOS');
    console.log('\n💡 Nota: Todos los tests usaron IA (Qwen2.5)');
    console.log('   No se usaron plantillas locales');
    
  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    await db.$disconnect();
  }
}

/**
 * Evalúa la calidad de la respuesta de la IA
 */
function evaluateResponse(response: string): {
  total: number;
  hasEmojis: boolean;
  mentionsBusiness: boolean;
  hasFormat: boolean;
  isProfessional: boolean;
} {
  const hasEmojis = /[\u{1F300}-\u{1F9FF}]/u.test(response);
  const mentionsBusiness = /tecnovariedades|d&s/i.test(response);
  const hasFormat = /\*\*/.test(response) || /•/.test(response);
  const isProfessional = response.length > 50 && !response.includes('error');
  
  let score = 0;
  if (hasEmojis) score += 25;
  if (mentionsBusiness) score += 25;
  if (hasFormat) score += 25;
  if (isProfessional) score += 25;
  
  return {
    total: score,
    hasEmojis,
    mentionsBusiness,
    hasFormat,
    isProfessional
  };
}

// Ejecutar
testSoloIA().catch(console.error);
