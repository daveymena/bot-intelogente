/**
 * Test de Búsquedas Ambiguas
 * Prueba cómo el sistema maneja búsquedas genéricas sin especificaciones
 */

import { SearchAgent } from './src/agents/search-agent'
import { SharedMemory } from './src/agents/shared-memory'

async function testBusquedasAmbiguas() {
  console.log('🧪 ========================================')
  console.log('🧪 TEST: BÚSQUEDAS AMBIGUAS')
  console.log('🧪 ========================================\n')

  const agent = new SearchAgent()
  
  // Casos de prueba (usando términos que existen en la BD)
  const testCases = [
    {
      name: 'Búsqueda genérica: "portátil"',
      message: 'busco un portátil',
      expected: 'Debe preguntar: ¿Para qué uso? ¿Presupuesto? ¿Marca preferida?'
    },
    {
      name: 'Búsqueda genérica: "curso"',
      message: 'quiero un curso',
      expected: 'Debe preguntar: ¿Qué tema te interesa?'
    },
    {
      name: 'Búsqueda específica: "Asus"',
      message: 'busco Asus',
      expected: 'Debe mostrar productos Asus (9 disponibles)'
    },
    {
      name: 'Búsqueda específica: "HP"',
      message: 'me interesa HP',
      expected: 'Debe mostrar productos HP (2 disponibles)'
    },
    {
      name: 'Búsqueda específica: "curso de piano"',
      message: 'me interesa el curso de piano',
      expected: 'Debe mostrar el Curso Completo de Piano Online'
    },
    {
      name: 'Búsqueda muy específica: "Asus Vivobook"',
      message: 'quiero el Asus Vivobook',
      expected: 'Debe mostrar el producto exacto'
    }
  ]

  for (const testCase of testCases) {
    console.log(`\n📝 ${testCase.name}`)
    console.log('─'.repeat(60))
    console.log(`💬 Mensaje: "${testCase.message}"`)
    console.log(`✅ Esperado: ${testCase.expected}\n`)

    const memory: SharedMemory = {
      chatId: 'test-ambiguous',
      userId: 'cmi6xj8q30000kme42q5fjk41', // Usuario real con productos
      userName: 'Test User',
      salesStage: 'greeting',
      messageCount: 1,
      lastQuery: '',
      searchQueries: [],
      interestedProducts: [],
      paymentIntent: false,
      preferredPaymentMethod: null,
      photoSent: false,
      productInfoSent: false,
      conversationHistory: []
    }

    try {
      const result = await agent.execute(testCase.message, memory)
      
      console.log(`📊 Resultado:`)
      console.log(`   Confianza: ${(result.confidence * 100).toFixed(0)}%`)
      console.log(`   Siguiente agente: ${result.nextAgent}`)
      console.log(`   Productos encontrados: ${memory.interestedProducts.length}`)
      
      if (memory.currentProduct) {
        console.log(`   ✅ Producto actual: ${memory.currentProduct.name}`)
      }
      
      console.log(`\n💬 Respuesta del bot:`)
      console.log(`   ${result.text.substring(0, 200)}${result.text.length > 200 ? '...' : ''}`)
      
      // Análisis
      const isAmbiguous = memory.interestedProducts.length > 3
      const hasQualificationQuestions = result.text.includes('?') && result.text.includes('presupuesto')
      const hasSpecificProduct = memory.interestedProducts.length === 1
      
      console.log(`\n🔍 Análisis:`)
      if (isAmbiguous) {
        console.log(`   ⚠️  Búsqueda ambigua: ${memory.interestedProducts.length} productos`)
        if (hasQualificationQuestions) {
          console.log(`   ✅ Bot hace preguntas de calificación`)
        } else {
          console.log(`   ❌ Bot NO hace preguntas de calificación`)
        }
      } else if (hasSpecificProduct) {
        console.log(`   ✅ Producto específico encontrado`)
      } else {
        console.log(`   ❌ No se encontraron productos`)
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`)
    }
  }

  console.log('\n\n📊 RESUMEN')
  console.log('═'.repeat(60))
  console.log('✅ Tests completados')
  console.log('\n💡 RECOMENDACIONES:')
  console.log('   1. Búsquedas genéricas deben hacer preguntas de calificación')
  console.log('   2. Búsquedas específicas deben mostrar productos directamente')
  console.log('   3. Si hay múltiples productos, mostrar top 3 y preguntar')
  console.log('   4. Si hay 1 producto, mostrar info completa inmediatamente')
}

testBusquedasAmbiguas().catch(console.error)
