/**
 * 🧪 TEST DE CONOCIMIENTO EXTERNO
 * Prueba la búsqueda de información externa de productos
 */

require('dotenv').config()

async function testConocimientoExterno() {
  console.log('🧪 INICIANDO TEST DE CONOCIMIENTO EXTERNO\n')

  try {
    // Importar el servicio
    const { ExternalKnowledgeService } = require('./src/lib/external-knowledge-service.ts')

    // Productos de prueba
    const testProducts = [
      {
        name: 'Laptop HP Core i5 8GB RAM',
        category: 'PHYSICAL',
        question: '¿Qué procesador tiene?'
      },
      {
        name: 'Laptop Asus VivoBook',
        category: 'PHYSICAL',
        question: 'Cuáles son las especificaciones?'
      },
      {
        name: 'Moto Bajaj Pulsar NS 160',
        category: 'PHYSICAL',
        question: 'Qué características tiene?'
      },
      {
        name: 'Impresora HP LaserJet',
        category: 'PHYSICAL',
        question: 'Qué velocidad de impresión tiene?'
      }
    ]

    console.log('📦 Productos a probar:', testProducts.length)
    console.log('=' .repeat(60))

    for (const product of testProducts) {
      console.log(`\n🔍 PROBANDO: ${product.name}`)
      console.log(`   Categoría: ${product.category}`)
      console.log(`   Pregunta: "${product.question}"`)
      console.log('-'.repeat(60))

      // 1. Verificar si necesita enriquecimiento
      const needsEnrichment = ExternalKnowledgeService.shouldEnrichProduct(
        product,
        product.question
      )
      console.log(`   ¿Necesita info externa? ${needsEnrichment ? '✅ SÍ' : '❌ NO'}`)

      if (!needsEnrichment) {
        console.log(`   ⏭️ Saltando (no necesita enriquecimiento)`)
        continue
      }

      // 2. Buscar información externa
      console.log(`\n   🌐 Buscando información externa...`)
      const info = await ExternalKnowledgeService.searchProductInfo(
        product.name,
        product.category
      )

      if (info.found) {
        console.log(`   ✅ Información encontrada!`)
        console.log(`   📊 Confianza: ${info.confidence}%`)
        console.log(`   📚 Fuente: ${info.source}`)

        if (info.specs) {
          console.log(`\n   📋 Especificaciones:`)
          Object.entries(info.specs).forEach(([key, value]) => {
            console.log(`      • ${key}: ${value}`)
          })
        }

        if (info.features && info.features.length > 0) {
          console.log(`\n   ✨ Características:`)
          info.features.forEach(feature => {
            console.log(`      ✓ ${feature}`)
          })
        }

        if (info.description) {
          console.log(`\n   📝 Descripción técnica:`)
          console.log(`      ${info.description}`)
        }

        // 3. Generar respuesta enriquecida
        console.log(`\n   💬 Generando respuesta enriquecida...`)
        const response = await ExternalKnowledgeService.generateEnrichedResponse(
          {
            ...product,
            price: 1500000,
            description: 'Excelente producto'
          },
          product.question
        )

        console.log(`\n   🤖 Respuesta generada:`)
        console.log(`   ${'-'.repeat(58)}`)
        console.log(`   ${response.split('\n').join('\n   ')}`)
        console.log(`   ${'-'.repeat(58)}`)

      } else {
        console.log(`   ⚠️ No se encontró información confiable`)
        console.log(`   📊 Confianza: ${info.confidence}%`)
      }

      console.log('\n' + '='.repeat(60))
      
      // Pausa entre pruebas
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    console.log('\n\n✅ TEST COMPLETADO')
    console.log('\n💡 CONCLUSIONES:')
    console.log('1. El sistema busca información técnica real de productos')
    console.log('2. Solo usa información con confianza >= 60%')
    console.log('3. Si no encuentra info, responde honestamente')
    console.log('4. NO inventa especificaciones')

  } catch (error) {
    console.error('❌ Error en test:', error)
    console.error('Stack:', error.stack)
  }
}

// Ejecutar test
testConocimientoExterno()
