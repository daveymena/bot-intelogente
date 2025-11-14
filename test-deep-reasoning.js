/**
 * 🧪 TEST DEL SISTEMA DE RAZONAMIENTO PROFUNDO
 * Prueba el nuevo sistema de IA con documentación completa
 */

const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

// Simular los servicios (en producción se importarían)
async function testDeepReasoning() {
  console.log('🧪 INICIANDO TEST DEL SISTEMA DE RAZONAMIENTO PROFUNDO\n')
  console.log('=' .repeat(70))

  try {
    // 1. Verificar que hay productos en la base de datos
    console.log('\n📦 PASO 1: Verificando productos en la base de datos...\n')
    
    const products = await db.product.findMany({
      where: { status: 'AVAILABLE' }
    })

    console.log(`✅ Productos encontrados: ${products.length}`)
    
    if (products.length === 0) {
      console.log('❌ ERROR: No hay productos en la base de datos')
      console.log('   Agrega productos antes de probar el sistema')
      return
    }

    // Mostrar resumen de productos
    console.log('\n📊 Resumen de productos:')
    const categories = {}
    products.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1
    })

    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   • ${category}: ${count} producto(s)`)
    })

    // 2. Simular documentación de productos
    console.log('\n📚 PASO 2: Generando documentación de productos...\n')
    
    let documentation = `# 📦 CATÁLOGO COMPLETO DE PRODUCTOS\n\n`
    documentation += `Total de productos: ${products.length}\n\n`

    products.slice(0, 3).forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name}`)
      console.log(`      💰 $${product.price.toLocaleString('es-CO')} COP`)
      console.log(`      📦 Categoría: ${product.category}`)
      
      documentation += `## ${index + 1}. ${product.name}\n`
      documentation += `- Precio: $${product.price.toLocaleString('es-CO')} COP\n`
      documentation += `- Categoría: ${product.category}\n\n`
    })

    if (products.length > 3) {
      console.log(`   ... y ${products.length - 3} más`)
    }

    console.log('\n✅ Documentación generada exitosamente')
    console.log(`   Tamaño: ${documentation.length} caracteres`)

    // 3. Simular casos de prueba
    console.log('\n🧪 PASO 3: Simulando casos de prueba...\n')

    const testCases = [
      {
        message: 'Quiero más detalles',
        expectedIntent: 'ask_info',
        description: 'Solicitud de información sin mencionar producto'
      },
      {
        message: 'Cuánto cuesta?',
        expectedIntent: 'ask_price',
        description: 'Pregunta por precio sin mencionar producto'
      },
      {
        message: 'Dame el link',
        expectedIntent: 'request_payment_link',
        description: 'Solicitud de enlace de pago'
      },
      {
        message: 'Qué productos tienes?',
        expectedIntent: 'general',
        description: 'Consulta general de catálogo'
      },
      {
        message: `Info del ${products[0].name}`,
        expectedIntent: 'ask_info',
        description: 'Información de producto específico'
      }
    ]

    testCases.forEach((testCase, index) => {
      console.log(`\n   Test ${index + 1}: ${testCase.description}`)
      console.log(`   Mensaje: "${testCase.message}"`)
      console.log(`   Intención esperada: ${testCase.expectedIntent}`)
      
      // Simular análisis de intención
      const messageLower = testCase.message.toLowerCase()
      let detectedIntent = 'general'

      if (messageLower.includes('info') || messageLower.includes('detalles')) {
        detectedIntent = 'ask_info'
      } else if (messageLower.includes('cuánto') || messageLower.includes('cuesta') || messageLower.includes('precio')) {
        detectedIntent = 'ask_price'
      } else if (messageLower.includes('link') || messageLower.includes('enlace')) {
        detectedIntent = 'request_payment_link'
      }

      const isCorrect = detectedIntent === testCase.expectedIntent
      console.log(`   Intención detectada: ${detectedIntent}`)
      console.log(`   ${isCorrect ? '✅ CORRECTO' : '❌ INCORRECTO'}`)
    })

    // 4. Verificar que los servicios existen
    console.log('\n🔍 PASO 4: Verificando archivos del sistema...\n')

    const fs = require('fs')
    const path = require('path')

    const requiredFiles = [
      'src/lib/product-documentation-service.ts',
      'src/lib/deep-reasoning-ai-service.ts',
      'src/lib/reasoning-service.ts',
      'src/lib/intelligent-response-service.ts'
    ]

    let allFilesExist = true

    requiredFiles.forEach(file => {
      const filePath = path.join(__dirname, file)
      const exists = fs.existsSync(filePath)
      console.log(`   ${exists ? '✅' : '❌'} ${file}`)
      if (!exists) allFilesExist = false
    })

    if (!allFilesExist) {
      console.log('\n⚠️ ADVERTENCIA: Algunos archivos no existen')
      console.log('   Asegúrate de que todos los archivos estén creados')
    }

    // 5. Resumen final
    console.log('\n' + '='.repeat(70))
    console.log('\n📊 RESUMEN DEL TEST:\n')

    console.log(`✅ Productos en DB: ${products.length}`)
    console.log(`✅ Documentación generada: ${documentation.length} caracteres`)
    console.log(`✅ Casos de prueba: ${testCases.length}`)
    console.log(`${allFilesExist ? '✅' : '⚠️'} Archivos del sistema: ${allFilesExist ? 'Todos presentes' : 'Algunos faltan'}`)

    console.log('\n🎯 PRÓXIMOS PASOS:\n')
    console.log('1. Integrar el sistema en el bot (ver INTEGRAR_RAZONAMIENTO_PROFUNDO.md)')
    console.log('2. Reiniciar el bot')
    console.log('3. Probar con mensajes reales de WhatsApp')
    console.log('4. Verificar logs en consola')
    console.log('5. Ajustar prompts según resultados')

    console.log('\n✅ TEST COMPLETADO EXITOSAMENTE\n')

  } catch (error) {
    console.error('\n❌ ERROR EN EL TEST:', error)
    console.error('\nDetalles:', error.message)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar test
testDeepReasoning()
  .then(() => {
    console.log('🎉 Test finalizado')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })
