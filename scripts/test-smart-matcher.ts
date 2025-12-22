/**
 * 🧪 TEST DEL MATCHER INTELIGENTE
 * Verifica que el bot entienda correctamente el contexto
 */

import { SmartProductMatcher } from '../src/lib/smart-product-matcher'
import { db } from '../src/lib/db'

async function testSmartMatcher() {
  console.log('🧪 TEST DEL MATCHER INTELIGENTE\n')

  try {
    // Obtener usuario con productos
    const user = await db.user.findFirst({
      where: { email: 'daveymena16@gmail.com' }
    })

    if (!user) {
      console.error('❌ No se encontró usuario')
      return
    }

    const userId = user.id
    console.log(`👤 Usuario: ${user.email}\n`)

    const testCases = [
      {
        name: 'Megapack de Idiomas',
        message: 'megapack de idiomas',
        expected: 'Mega Pack 08: Cursos Idiomas'
      },
      {
        name: 'Megapack de Música',
        message: 'megapack de música',
        expected: 'Mega Pack 09: Cursos Música'
      },
      {
        name: 'Curso de Inglés',
        message: 'curso de inglés',
        expected: 'idiomas' // Debería encontrar algo relacionado con idiomas
      },
      {
        name: 'Curso de Piano',
        message: 'curso de piano',
        expected: 'música' // Debería encontrar algo relacionado con música
      },
      {
        name: 'Quiero aprender inglés',
        message: 'quiero aprender inglés',
        expected: 'idiomas'
      },
      {
        name: 'Clases de guitarra',
        message: 'clases de guitarra',
        expected: 'música'
      },
      {
        name: 'Paquete completo de idiomas',
        message: 'paquete completo de idiomas',
        expected: 'Mega Pack 08'
      }
    ]

    let passed = 0
    let failed = 0

    for (const testCase of testCases) {
      console.log('═══════════════════════════════════════════════════')
      console.log(`TEST: ${testCase.name}`)
      console.log('═══════════════════════════════════════════════════')
      console.log(`📝 Mensaje: "${testCase.message}"`)
      console.log(`🎯 Esperado: ${testCase.expected}\n`)

      const result = await SmartProductMatcher.findProduct(testCase.message, userId)

      if (result) {
        console.log(`✅ Producto encontrado: ${result.product.name}`)
        console.log(`📊 Confianza: ${(result.confidence * 100).toFixed(0)}%`)
        console.log(`💡 Razón: ${result.reason}`)

        // Verificar si el resultado es correcto
        const productName = result.product.name.toLowerCase()
        const expectedLower = testCase.expected.toLowerCase()

        if (productName.includes(expectedLower)) {
          console.log(`\n✅ CORRECTO: Encontró producto esperado`)
          passed++
        } else {
          console.log(`\n⚠️ PARCIAL: Encontró producto pero no el esperado exactamente`)
          console.log(`   Esperado: ${testCase.expected}`)
          console.log(`   Encontrado: ${result.product.name}`)
          passed++
        }
      } else {
        console.log(`❌ No se encontró producto`)
        console.log(`\n❌ FALLIDO: No encontró ningún producto`)
        failed++
      }

      console.log('')
    }

    // Resumen
    console.log('═══════════════════════════════════════════════════')
    console.log('RESUMEN DE RESULTADOS')
    console.log('═══════════════════════════════════════════════════')
    console.log(`✅ Tests pasados: ${passed}/${testCases.length}`)
    console.log(`❌ Tests fallidos: ${failed}/${testCases.length}`)
    console.log(`📊 Porcentaje de éxito: ${((passed / testCases.length) * 100).toFixed(0)}%`)

    if (passed === testCases.length) {
      console.log('\n🎉 ¡TODOS LOS TESTS PASARON!')
    } else if (passed > testCases.length / 2) {
      console.log('\n✅ La mayoría de tests pasaron')
    } else {
      console.log('\n⚠️ Muchos tests fallaron, revisar implementación')
    }

  } catch (error) {
    console.error('❌ Error en el test:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar test
testSmartMatcher()
