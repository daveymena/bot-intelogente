/**
 * 🧪 TEST: BÚSQUEDA DE CURSO DE INGLÉS
 * Verifica que el bot encuentre correctamente el curso de inglés
 */

import { SearchAgent } from '../src/agents/search-agent'
import { SharedMemory } from '../src/agents/shared-memory'
import { db } from '../src/lib/db'

async function testBusquedaIngles() {
  console.log('🧪 INICIANDO TEST DE BÚSQUEDA DE INGLÉS\n')
  console.log('=' .repeat(60))

  try {
    // 1. Buscar usuario de prueba
    console.log('\n🔍 BUSCANDO USUARIO...')
    const user = await db.user.findFirst({
      where: {
        email: {
          not: 'system@smartsalesbot.com'
        }
      }
    })

    if (!user) {
      console.log('❌ No se encontró ningún usuario')
      return
    }

    console.log(`✅ Usuario encontrado: ${user.email}`)

    // 2. Crear memoria compartida
    const memory: SharedMemory = {
      userId: user.id,
      chatId: '123456789@s.whatsapp.net',
      currentProduct: undefined,
      interestedProducts: [],
      lastQuery: '',
      messageCount: 0,
      salesStage: 'search',
      paymentIntent: false,
      messages: [],
      lastUpdate: new Date(),
      createdAt: new Date(),
      photoSent: false,
      paymentLinkSent: false,
      productInfoSent: false,
      searchQueries: [],
      objections: [],
      questionsAsked: []
    }

    // 3. Crear agente de búsqueda
    const searchAgent = new SearchAgent()

    // 4. Probar diferentes consultas de inglés
    const queries = [
      'curso de inglés',
      'quiero aprender inglés',
      'me interesa el curso de inglés',
      'tienes cursos de inglés?',
      'inglés'
    ]

    for (const query of queries) {
      console.log('\n' + '=' .repeat(60))
      console.log(`📝 CONSULTA: "${query}"`)
      console.log('=' .repeat(60))

      const response = await searchAgent.execute(query, memory)

      console.log('\n📊 RESULTADO:')
      console.log(`   Confianza: ${(response.confidence * 100).toFixed(0)}%`)
      console.log(`   Siguiente agente: ${response.nextAgent}`)
      console.log(`   Producto actual: ${memory.currentProduct?.name || 'ninguno'}`)
      console.log(`   Productos interesados: ${memory.interestedProducts.length}`)
      
      if (memory.interestedProducts.length > 0) {
        console.log('\n   📦 Productos encontrados:')
        memory.interestedProducts.forEach((p, i) => {
          console.log(`      ${i + 1}. ${p.name}`)
        })
      }

      console.log('\n💬 RESPUESTA:')
      console.log(response.text.substring(0, 300) + '...')

      // Verificar que encontró el curso de inglés
      const productName = memory.currentProduct?.name.toLowerCase() || '';
      const productDesc = memory.currentProduct?.description?.toLowerCase() || '';
      
      const foundEnglish = productName.includes('inglés') ||
                          productName.includes('ingles') ||
                          productName.includes('idiomas') || // "Cursos Idiomas" incluye inglés
                          productDesc.includes('inglés') ||
                          productDesc.includes('ingles') ||
                          memory.interestedProducts.some(p => 
                            p.name.toLowerCase().includes('inglés') || 
                            p.name.toLowerCase().includes('ingles') ||
                            p.name.toLowerCase().includes('idiomas')
                          )

      if (foundEnglish) {
        console.log('\n✅ CORRECTO: Encontró curso relacionado con inglés')
        if (productName.includes('idiomas')) {
          console.log('   📚 Producto: "Cursos Idiomas" (incluye inglés)')
        }
      } else {
        console.log('\n❌ ERROR: NO encontró curso de inglés')
        console.log('   El bot debería haber encontrado un curso de inglés o idiomas')
      }

      // Resetear memoria para siguiente prueba
      memory.currentProduct = null
      memory.interestedProducts = []
    }

    console.log('\n' + '=' .repeat(60))
    console.log('✅ TEST COMPLETADO')
    console.log('=' .repeat(60))

  } catch (error) {
    console.error('\n❌ ERROR EN EL TEST:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar test
testBusquedaIngles()
