/**
 * Script para probar la búsqueda mejorada de megapacks
 */

import { ProductIntelligenceService } from '../src/lib/product-intelligence-service'
import { FuzzyMatchService } from '../src/lib/fuzzy-match-service'
import { TextNormalizer } from '../src/lib/text-normalizer'
import { db } from '../src/lib/db'

async function testMegapackSearch() {
  console.log('='.repeat(70))
  console.log('🧪 TEST DE BÚSQUEDA DE MEGAPACKS')
  console.log('='.repeat(70))
  console.log('')

  // Queries de prueba
  const testQueries = [
    'Pack Completo 40 Mega Packs',
    'pack completo',
    'todos los megapacks',
    'megapack completo',
    'quiero el pack de 40',
    'megapak completo',  // Con error de escritura
    'paquete completo',
    'todos los packs',
    'megapack 1',
    'mega pack 5',
    'pack 10'
  ]

  // Obtener usuario de prueba
  const user = await db.user.findFirst()
  
  if (!user) {
    console.log('❌ No hay usuarios en la base de datos')
    console.log('   Crea un usuario primero')
    return
  }

  console.log(`👤 Usuario de prueba: ${user.email}`)
  console.log('')

  for (const query of testQueries) {
    console.log('─'.repeat(70))
    console.log(`📝 Query: "${query}"`)
    console.log('')

    // 1. Normalización
    const normalized = TextNormalizer.normalize(query)
    console.log(`🔤 Normalizado: "${normalized}"`)

    // 2. Detección de intención de megapack
    const intent = FuzzyMatchService.detectMegapackIntent(query)
    console.log(`🎯 Intención:`)
    console.log(`   - Es búsqueda de megapack: ${intent.isMegapackQuery}`)
    console.log(`   - Quiere todos: ${intent.wantsAll}`)
    console.log(`   - Número específico: ${intent.specificNumber || 'ninguno'}`)

    // 3. Corrección de errores
    const dictionary = FuzzyMatchService.getCommonProductTerms()
    const correction = FuzzyMatchService.correctTypos(query.toLowerCase(), dictionary, 0.7)
    
    if (correction.corrections.length > 0) {
      console.log(`✏️  Correcciones:`)
      correction.corrections.forEach(c => {
        console.log(`   "${c.original}" → "${c.corrected}" (${(c.similarity * 100).toFixed(0)}%)`)
      })
    }

    // 4. Búsqueda de producto
    console.log(`🔍 Buscando producto...`)
    const product = await ProductIntelligenceService.findProduct(query, user.id)

    if (product) {
      console.log(`✅ Producto encontrado:`)
      console.log(`   Nombre: ${product.name}`)
      console.log(`   Precio: ${product.price.toLocaleString()} COP`)
      console.log(`   Categoría: ${product.category}`)
    } else {
      console.log(`❌ No se encontró producto`)
    }

    console.log('')
  }

  console.log('='.repeat(70))
  console.log('✅ Test completado')
  console.log('='.repeat(70))
  console.log('')

  await db.$disconnect()
}

testMegapackSearch().catch(error => {
  console.error('❌ Error en test:', error)
  process.exit(1)
})
