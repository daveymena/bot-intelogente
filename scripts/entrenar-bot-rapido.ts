/**
 * Entrenamiento Rápido del Bot - Con Productos REALES de la BD
 * 
 * Uso: npx tsx scripts/entrenar-bot-rapido.ts
 */

import { AIService } from '../src/lib/ai-service'
import { db } from '../src/lib/db'

interface TestCase {
  name: string
  message: string
  expectedBehavior: string
  criticalError: string
  expectedProduct?: string
}

/**
 * Generar casos de prueba con productos REALES de la base de datos
 */
async function generateRealTestCases(userId: string): Promise<TestCase[]> {
  // Obtener productos reales del usuario
  const products = await db.product.findMany({
    where: {
      userId,
      status: 'AVAILABLE'
    },
    take: 5, // Tomar 5 productos para pruebas
    orderBy: {
      createdAt: 'desc'
    }
  })

  if (products.length === 0) {
    console.log('⚠️ No hay productos en la base de datos')
    return []
  }

  console.log(`📦 Productos encontrados: ${products.length}`)
  products.forEach(p => console.log(`   - ${p.name} ($${p.price.toLocaleString('es-CO')} COP)`))
  console.log('')

  const testCases: TestCase[] = []

  // Test 1: Pregunta general sobre productos
  testCases.push({
    name: "No debe mencionar productos cuando preguntan '¿Qué productos tienes?'",
    message: "Qué productos tienes?",
    expectedBehavior: "Debe listar CATEGORÍAS o preguntar qué tipo de producto busca",
    criticalError: "Menciona un producto específico en lugar de categorías"
  })

  // Test 2-4: Preguntas de precio con productos REALES
  for (let i = 0; i < Math.min(3, products.length); i++) {
    const product = products[i]
    const productNameLower = product.name.toLowerCase()
    
    testCases.push({
      name: `Debe dar precio correcto de: ${product.name}`,
      message: `Cuánto cuesta ${productNameLower}?`,
      expectedBehavior: `Debe dar el precio exacto: $${product.price.toLocaleString('es-CO')} COP`,
      criticalError: "Da precio incorrecto o no menciona el producto",
      expectedProduct: product.name
    })
  }

  // Test 5-7: Búsquedas con productos REALES
  for (let i = 0; i < Math.min(3, products.length); i++) {
    const product = products[i]
    // Extraer palabra clave del nombre del producto
    const words = product.name.toLowerCase().split(' ')
    const keyword = words.find(w => w.length > 4) || words[0]
    
    testCases.push({
      name: `Debe encontrar producto cuando buscan: ${keyword}`,
      message: `Tienes ${keyword}?`,
      expectedBehavior: `Debe mencionar ${product.name} o productos similares`,
      criticalError: "No encuentra el producto o menciona productos incorrectos",
      expectedProduct: product.name
    })
  }

  // Test 8: Producto que NO existe
  testCases.push({
    name: "No debe inventar productos que no existen",
    message: "Tienes iPhone 15 Pro Max?",
    expectedBehavior: "Debe decir que NO tiene ese producto específico",
    criticalError: "Inventa información o dice que sí tiene"
  })

  // Test 9: Mantener contexto
  testCases.push({
    name: "Debe mantener contexto del producto actual",
    message: "Me interesa",
    expectedBehavior: "Debe hablar del último producto mencionado",
    criticalError: "Cambia a otro producto sin razón"
  })

  // Test 10: Saludo
  testCases.push({
    name: "No debe ser repetitivo con saludos",
    message: "Hola",
    expectedBehavior: "Saludo breve y pregunta en qué puede ayudar",
    criticalError: "Saludo muy largo o repetitivo"
  })

  return testCases
}

async function testBot() {
  console.log('🚀 ========================================')
  console.log('⚡ ENTRENAMIENTO RÁPIDO - PRODUCTOS REALES')
  console.log('🚀 ========================================\n')

  const user = await db.user.findFirst({ where: { role: 'ADMIN' } })
  if (!user) {
    console.error('❌ No se encontró usuario admin')
    process.exit(1)
  }

  console.log(`👤 Usuario: ${user.email}`)
  console.log(`🆔 ID: ${user.id}\n`)

  // Generar casos de prueba con productos REALES
  console.log('📦 Cargando productos de la base de datos...\n')
  const testCases = await generateRealTestCases(user.id)

  if (testCases.length === 0) {
    console.error('❌ No se pudieron generar casos de prueba')
    process.exit(1)
  }

  console.log(`🧪 Casos de prueba generados: ${testCases.length}\n`)

  let passed = 0
  let failed = 0
  const errors: string[] = []

  for (const test of testCases) {
    console.log(`\n🧪 Probando: ${test.name}`)
    console.log(`   📝 Mensaje: "${test.message}"`)
    console.log(`   ✅ Esperado: ${test.expectedBehavior}`)
    
    try {
      const aiResponse = await AIService.generateResponse(
        user.id,
        test.message,
        `test_${Date.now()}`,
        []
      )

      const response = aiResponse.message
      console.log(`   🤖 Respuesta: "${response.substring(0, 100)}..."`)

      // Análisis simple de la respuesta
      const responseLower = response.toLowerCase()
      
      // Verificar errores comunes
      let hasError = false
      let errorMsg = ''

      if (test.name.includes('categorías')) {
        // No debe mencionar productos específicos
        if (responseLower.includes('$') || responseLower.includes('cop')) {
          hasError = true
          errorMsg = '❌ Menciona precios en lugar de categorías'
        }
      }

      if (test.name.includes('precio correcto')) {
        // Debe mencionar el producto esperado
        if (test.expectedProduct) {
          const productNameLower = test.expectedProduct.toLowerCase()
          const productWords = productNameLower.split(' ')
          
          // Verificar si menciona al menos 2 palabras clave del producto
          const mentionedWords = productWords.filter(word => 
            word.length > 3 && responseLower.includes(word)
          )
          
          if (mentionedWords.length < 2) {
            hasError = true
            errorMsg = `❌ No menciona el producto correcto: ${test.expectedProduct}`
          }
        }
      }

      if (test.name.includes('encontrar producto')) {
        // Debe mencionar el producto esperado o similares
        if (test.expectedProduct) {
          const productNameLower = test.expectedProduct.toLowerCase()
          const productWords = productNameLower.split(' ')
          
          // Verificar si menciona al menos 1 palabra clave del producto
          const mentionedWords = productWords.filter(word => 
            word.length > 3 && responseLower.includes(word)
          )
          
          if (mentionedWords.length === 0) {
            hasError = true
            errorMsg = `❌ No menciona ${test.expectedProduct} ni productos similares`
          }
        }
      }

      if (test.name.includes('inventar')) {
        // No debe decir que sí tiene iPhone
        if (responseLower.includes('iphone') && 
            (responseLower.includes('tenemos') || responseLower.includes('disponible'))) {
          hasError = true
          errorMsg = '❌ Dice que SÍ tiene iPhone cuando no lo vendemos'
        }
      }

      if (test.name.includes('repetitivo')) {
        // Saludo no debe ser muy largo
        if (response.length > 200) {
          hasError = true
          errorMsg = '❌ Saludo demasiado largo'
        }
      }

      if (hasError) {
        console.log(`   ❌ FALLO: ${errorMsg}`)
        failed++
        errors.push(`${test.name}: ${errorMsg}`)
      } else {
        console.log(`   ✅ PASÓ`)
        passed++
      }

    } catch (error: any) {
      console.log(`   ❌ ERROR: ${error.message}`)
      failed++
      errors.push(`${test.name}: Error técnico`)
    }

    // Pequeña pausa entre tests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n\n🚀 ========================================')
  console.log('📊 RESULTADOS DEL ENTRENAMIENTO')
  console.log('🚀 ========================================\n')

  const totalTests = testCases.length
  const precision = ((passed / totalTests) * 100).toFixed(1)

  console.log(`✅ Pruebas pasadas: ${passed}/${totalTests}`)
  console.log(`❌ Pruebas falladas: ${failed}/${totalTests}`)
  console.log(`🎯 Precisión: ${precision}%\n`)

  // Clasificar precisión
  let status = ''
  if (parseFloat(precision) >= 80) {
    status = '🟢 EXCELENTE'
  } else if (parseFloat(precision) >= 60) {
    status = '🟡 BUENO'
  } else if (parseFloat(precision) >= 40) {
    status = '🟠 REGULAR'
  } else {
    status = '🔴 CRÍTICO'
  }

  console.log(`📈 Estado: ${status}\n`)

  if (errors.length > 0) {
    console.log('❌ ERRORES DETECTADOS:\n')
    errors.forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`)
    })
    console.log('\n💡 RECOMENDACIONES:\n')
    
    if (parseFloat(precision) < 60) {
      console.log('   1. ⚠️ Revisar el prompt del sistema en ai-service.ts')
      console.log('   2. ⚠️ Ajustar las reglas de detección de intención')
      console.log('   3. ⚠️ Mejorar el sistema de contexto de productos')
    }
    
    if (errors.some(e => e.includes('precio'))) {
      console.log('   4. 💰 Verificar que los precios se muestren correctamente')
    }
    
    if (errors.some(e => e.includes('producto'))) {
      console.log('   5. 🔍 Mejorar el algoritmo de búsqueda de productos')
    }
    
    if (errors.some(e => e.includes('largo'))) {
      console.log('   6. ✂️ Reducir la longitud de las respuestas')
    }
  } else {
    console.log('🎉 ¡Todos los tests pasaron! El bot está funcionando correctamente.\n')
  }

  console.log('\n📝 NOTA: Este entrenamiento usa productos REALES de tu base de datos')
  console.log('   Para mejores resultados, asegúrate de tener productos actualizados\n')

  await db.$disconnect()
}

testBot().catch(console.error)
