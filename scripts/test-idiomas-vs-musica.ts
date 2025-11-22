/**
 * 🧪 TEST: IDIOMAS VS MÚSICA
 * Verifica que el bot no confunda idiomas con música
 */

import { ProductCategoryDetector } from '../src/lib/product-category-detector'
import { Bot24_7Orchestrator } from '../src/lib/bot-24-7-orchestrator'
import { db } from '../src/lib/db'

async function testIdiomasVsMusica() {
  console.log('🧪 TEST: IDIOMAS VS MÚSICA\n')

  try {
    // Obtener usuario de prueba (daveymena16@gmail.com tiene los megapacks)
    const user = await db.user.findFirst({
      where: { email: 'daveymena16@gmail.com' }
    })

    if (!user) {
      console.error('❌ No se encontró usuario daveymena16@gmail.com')
      console.log('💡 Intenta con otro usuario que tenga productos')
      return
    }

    const userId = user.id
    const customerPhone = '573001234567@s.whatsapp.net'

    console.log(`👤 Usuario: ${user.email}\n`)

    // CASO 1: Buscar megapack de IDIOMAS
    console.log('═══════════════════════════════════════════════════')
    console.log('CASO 1: "megapack de idiomas"')
    console.log('═══════════════════════════════════════════════════\n')

    const message1 = 'megapack de idiomas'
    console.log(`📝 Mensaje: "${message1}"`)

    // Detectar categoría
    const category1 = ProductCategoryDetector.detectCategory(message1)
    console.log(`🎯 Categoría detectada: ${category1.category} (${(category1.confidence * 100).toFixed(0)}%)`)

    // Buscar productos por categoría
    const products1 = await ProductCategoryDetector.findProductsByCategory(message1, userId, 5)
    console.log(`📦 Productos encontrados: ${products1.length}`)
    
    if (products1.length > 0) {
      console.log('\n📋 Lista de productos:')
      products1.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name}`)
      })
      
      const hasIdiomas = products1[0].name.toLowerCase().includes('idioma')
      const hasMusica = products1[0].name.toLowerCase().includes('música') || products1[0].name.toLowerCase().includes('musica')
      
      if (hasIdiomas && !hasMusica) {
        console.log('\n✅ CORRECTO: Encontró producto de IDIOMAS')
      } else if (hasMusica) {
        console.log('\n❌ ERROR: Encontró producto de MÚSICA en lugar de IDIOMAS')
      } else {
        console.log('\n⚠️ ADVERTENCIA: Producto no es claramente de idiomas ni música')
      }
    } else {
      console.log('\n❌ ERROR: No se encontraron productos')
    }

    // Probar con el orquestador completo
    console.log('\n🤖 Probando con orquestador completo...')
    const response1 = await Bot24_7Orchestrator.processMessage(
      userId,
      customerPhone,
      message1,
      []
    )

    console.log(`📨 Respuesta del bot:`)
    console.log(`   "${response1.message.substring(0, 100)}..."`)
    
    if (response1.productId) {
      const product = await db.product.findUnique({
        where: { id: response1.productId }
      })
      
      if (product) {
        const hasIdiomas = product.name.toLowerCase().includes('idioma')
        const hasMusica = product.name.toLowerCase().includes('música') || product.name.toLowerCase().includes('musica')
        
        console.log(`📦 Producto seleccionado: ${product.name}`)
        
        if (hasIdiomas && !hasMusica) {
          console.log('✅ CORRECTO: Bot seleccionó producto de IDIOMAS')
        } else if (hasMusica) {
          console.log('❌ ERROR: Bot seleccionó producto de MÚSICA')
        }
      }
    }

    // CASO 2: Buscar megapack de MÚSICA
    console.log('\n═══════════════════════════════════════════════════')
    console.log('CASO 2: "megapack de música"')
    console.log('═══════════════════════════════════════════════════\n')

    const message2 = 'megapack de música'
    console.log(`📝 Mensaje: "${message2}"`)

    const category2 = ProductCategoryDetector.detectCategory(message2)
    console.log(`🎯 Categoría detectada: ${category2.category} (${(category2.confidence * 100).toFixed(0)}%)`)

    const products2 = await ProductCategoryDetector.findProductsByCategory(message2, userId, 5)
    console.log(`📦 Productos encontrados: ${products2.length}`)
    
    if (products2.length > 0) {
      console.log('\n📋 Lista de productos:')
      products2.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name}`)
      })
      
      const hasMusica = products2[0].name.toLowerCase().includes('música') || products2[0].name.toLowerCase().includes('musica')
      const hasIdiomas = products2[0].name.toLowerCase().includes('idioma')
      
      if (hasMusica && !hasIdiomas) {
        console.log('\n✅ CORRECTO: Encontró producto de MÚSICA')
      } else if (hasIdiomas) {
        console.log('\n❌ ERROR: Encontró producto de IDIOMAS en lugar de MÚSICA')
      } else {
        console.log('\n⚠️ ADVERTENCIA: Producto no es claramente de música ni idiomas')
      }
    } else {
      console.log('\n❌ ERROR: No se encontraron productos')
    }

    // CASO 3: Buscar curso de PIANO (debe ser música)
    console.log('\n═══════════════════════════════════════════════════')
    console.log('CASO 3: "curso de piano"')
    console.log('═══════════════════════════════════════════════════\n')

    const message3 = 'curso de piano'
    console.log(`📝 Mensaje: "${message3}"`)

    const category3 = ProductCategoryDetector.detectCategory(message3)
    console.log(`🎯 Categoría detectada: ${category3.category} (${(category3.confidence * 100).toFixed(0)}%)`)

    if (category3.category === 'musica') {
      console.log('✅ CORRECTO: Detectó categoría MÚSICA')
    } else {
      console.log(`❌ ERROR: Detectó categoría ${category3.category} en lugar de MÚSICA`)
    }

    // CASO 4: Buscar curso de INGLÉS (debe ser idiomas)
    console.log('\n═══════════════════════════════════════════════════')
    console.log('CASO 4: "curso de inglés"')
    console.log('═══════════════════════════════════════════════════\n')

    const message4 = 'curso de inglés'
    console.log(`📝 Mensaje: "${message4}"`)

    const category4 = ProductCategoryDetector.detectCategory(message4)
    console.log(`🎯 Categoría detectada: ${category4.category} (${(category4.confidence * 100).toFixed(0)}%)`)

    if (category4.category === 'idiomas') {
      console.log('✅ CORRECTO: Detectó categoría IDIOMAS')
    } else {
      console.log(`❌ ERROR: Detectó categoría ${category4.category} en lugar de IDIOMAS`)
    }

    console.log('\n═══════════════════════════════════════════════════')
    console.log('RESUMEN DE RESULTADOS')
    console.log('═══════════════════════════════════════════════════\n')

    console.log('✅ Test completado')
    console.log('\nVerifica que:')
    console.log('1. "megapack de idiomas" → Mega Pack 08: Cursos Idiomas')
    console.log('2. "megapack de música" → Mega Pack 09: Cursos Música')
    console.log('3. "curso de piano" → Categoría: música')
    console.log('4. "curso de inglés" → Categoría: idiomas')

  } catch (error) {
    console.error('❌ Error en el test:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar test
testIdiomasVsMusica()
