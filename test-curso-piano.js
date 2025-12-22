/**
 * Script para probar la búsqueda específica de cursos
 */

const { PrismaClient } = require('@prisma/client')
const { intelligentProductSearch } = require('./src/lib/intelligent-product-search')

const prisma = new PrismaClient()

async function testBusquedaCursoPiano() {
  console.log('🎹 PROBANDO BÚSQUEDA DE CURSO DE PIANO\n')

  try {
    // Simular consulta de usuario
    const context = {
      userMessage: 'curso de piano',
      previousProducts: [],
      conversationHistory: []
    }

    console.log('📝 Consulta del usuario:', context.userMessage)
    console.log('🔍 Buscando productos...\n')

    // Ejecutar búsqueda
    const result = await intelligentProductSearch(context)

    if (result) {
      console.log('✅ RESULTADO DE BÚSQUEDA:')
      console.log('📊 Confianza:', result.confidence + '%')
      console.log('💡 Razón:', result.reason)
      console.log('📸 Enviar foto:', result.shouldSendPhoto ? 'Sí' : 'No')

      if (result.product) {
        console.log('\n🎯 PRODUCTO ENCONTRADO:')
        console.log('📦 Nombre:', result.product.name)
        console.log('💰 Precio:', result.product.price)
        console.log('🏷️  Categoría:', result.product.category)
        console.log('🏪 Tienda:', result.product.store || 'Propia')

        // Verificar que NO sea un megapack
        const isMegapack = result.product.name.toLowerCase().includes('megapack') ||
                          result.product.name.toLowerCase().includes('mega pack') ||
                          result.product.name.toLowerCase().includes('super') ||
                          result.product.name.toLowerCase().includes('completo')

        console.log('📦 Es megapack:', isMegapack ? '❌ SÍ (ERROR)' : '✅ NO (CORRECTO)')

        if (isMegapack) {
          console.log('\n❌ ERROR: Se encontró un megapack en lugar de un curso individual')
        } else {
          console.log('\n✅ ÉXITO: Se encontró un curso individual correcto')
        }

      } else if (result.products) {
        console.log('\n📋 PRODUCTOS ENCONTRADOS (' + result.products.length + '):')
        result.products.forEach((product, index) => {
          const isMegapack = product.name.toLowerCase().includes('megapack') ||
                            product.name.toLowerCase().includes('mega pack') ||
                            product.name.toLowerCase().includes('super') ||
                            product.name.toLowerCase().includes('completo')

          console.log(`${index + 1}. ${product.name} - ${isMegapack ? 'MEGAPACK' : 'CURSO INDIVIDUAL'}`)
        })

        const megapacks = result.products.filter(p =>
          p.name.toLowerCase().includes('megapack') ||
          p.name.toLowerCase().includes('mega pack') ||
          p.name.toLowerCase().includes('super') ||
          p.name.toLowerCase().includes('completo')
        )

        if (megapacks.length > 0) {
          console.log('\n⚠️  ADVERTENCIA: Se encontraron ' + megapacks.length + ' megapacks')
        }
      }

    } else {
      console.log('❌ No se encontró ningún producto')
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }

  console.log('\n' + '='.repeat(50))
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testBusquedaCursoPiano()
}

module.exports = { testBusquedaCursoPiano }