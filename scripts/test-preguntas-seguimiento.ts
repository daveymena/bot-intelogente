/**
 * 🧪 TEST DE PREGUNTAS DE SEGUIMIENTO
 * Verifica que el bot responda correctamente usando contexto
 */

import { Bot24_7Orchestrator } from '../src/lib/bot-24-7-orchestrator'
import { ProfessionalConversationMemory } from '../src/lib/professional-conversation-memory'
import { db } from '../src/lib/db'

async function testFollowUpQuestions() {
  console.log('🧪 INICIANDO TEST DE PREGUNTAS DE SEGUIMIENTO\n')

  try {
    // Obtener un usuario de prueba
    const user = await db.user.findFirst({
      where: { email: { contains: '@' } }
    })

    if (!user) {
      console.error('❌ No se encontró usuario de prueba')
      return
    }

    const userId = user.id
    const customerPhone = '573001234567@s.whatsapp.net'
    const conversationKey = `${userId}:${customerPhone}`

    console.log(`👤 Usuario: ${user.email}`)
    console.log(`📱 Teléfono: ${customerPhone}\n`)

    // Obtener un producto de prueba
    const product = await db.product.findFirst({
      where: { userId }
    })

    if (!product) {
      console.error('❌ No se encontró producto de prueba')
      return
    }

    console.log(`📦 Producto de prueba: ${product.name}`)
    console.log(`💰 Precio: $${product.price.toLocaleString('es-CO')} COP\n`)

    // ESCENARIO 1: Pregunta inicial sobre producto
    console.log('═══════════════════════════════════════════════════')
    console.log('ESCENARIO 1: Pregunta inicial sobre producto')
    console.log('═══════════════════════════════════════════════════\n')

    const message1 = `Hola, me interesa el ${product.name}`
    console.log(`👤 Usuario: "${message1}"`)

    const response1 = await Bot24_7Orchestrator.processMessage(
      userId,
      customerPhone,
      message1,
      []
    )

    console.log(`🤖 Bot: "${response1.message}"`)
    console.log(`📊 Confianza: ${response1.confidence}`)
    console.log(`🎯 Proveedor: ${response1.provider}`)
    console.log(`📸 Enviar foto: ${response1.shouldSendPhoto}\n`)

    // Esperar un momento
    await new Promise(resolve => setTimeout(resolve, 1000))

    // ESCENARIO 2: Pregunta de seguimiento - "más información"
    console.log('═══════════════════════════════════════════════════')
    console.log('ESCENARIO 2: Pregunta de seguimiento - "más información"')
    console.log('═══════════════════════════════════════════════════\n')

    const message2 = 'más información'
    console.log(`👤 Usuario: "${message2}"`)

    const response2 = await Bot24_7Orchestrator.processMessage(
      userId,
      customerPhone,
      message2,
      []
    )

    console.log(`🤖 Bot: "${response2.message}"`)
    console.log(`📊 Confianza: ${response2.confidence}`)
    console.log(`🎯 Proveedor: ${response2.provider}`)
    console.log(`💡 Usó contexto: ${response2.productId === product.id ? 'SÍ ✅' : 'NO ❌'}\n`)

    // Esperar un momento
    await new Promise(resolve => setTimeout(resolve, 1000))

    // ESCENARIO 3: Pregunta de seguimiento - "métodos de pago"
    console.log('═══════════════════════════════════════════════════')
    console.log('ESCENARIO 3: Pregunta de seguimiento - "métodos de pago"')
    console.log('═══════════════════════════════════════════════════\n')

    const message3 = 'métodos de pago'
    console.log(`👤 Usuario: "${message3}"`)

    const response3 = await Bot24_7Orchestrator.processMessage(
      userId,
      customerPhone,
      message3,
      []
    )

    console.log(`🤖 Bot: "${response3.message}"`)
    console.log(`📊 Confianza: ${response3.confidence}`)
    console.log(`🎯 Proveedor: ${response3.provider}`)
    console.log(`💡 Usó contexto: ${response3.productId === product.id ? 'SÍ ✅' : 'NO ❌'}\n`)

    // Esperar un momento
    await new Promise(resolve => setTimeout(resolve, 1000))

    // ESCENARIO 4: Pregunta de seguimiento - "cuánto cuesta"
    console.log('═══════════════════════════════════════════════════')
    console.log('ESCENARIO 4: Pregunta de seguimiento - "cuánto cuesta"')
    console.log('═══════════════════════════════════════════════════\n')

    const message4 = 'cuánto cuesta'
    console.log(`👤 Usuario: "${message4}"`)

    const response4 = await Bot24_7Orchestrator.processMessage(
      userId,
      customerPhone,
      message4,
      []
    )

    console.log(`🤖 Bot: "${response4.message}"`)
    console.log(`📊 Confianza: ${response4.confidence}`)
    console.log(`🎯 Proveedor: ${response4.provider}`)
    console.log(`💡 Usó contexto: ${response4.productId === product.id ? 'SÍ ✅' : 'NO ❌'}\n`)

    // Esperar un momento
    await new Promise(resolve => setTimeout(resolve, 1000))

    // ESCENARIO 5: Pregunta de seguimiento - "está disponible"
    console.log('═══════════════════════════════════════════════════')
    console.log('ESCENARIO 5: Pregunta de seguimiento - "está disponible"')
    console.log('═══════════════════════════════════════════════════\n')

    const message5 = 'está disponible'
    console.log(`👤 Usuario: "${message5}"`)

    const response5 = await Bot24_7Orchestrator.processMessage(
      userId,
      customerPhone,
      message5,
      []
    )

    console.log(`🤖 Bot: "${response5.message}"`)
    console.log(`📊 Confianza: ${response5.confidence}`)
    console.log(`🎯 Proveedor: ${response5.provider}`)
    console.log(`💡 Usó contexto: ${response5.productId === product.id ? 'SÍ ✅' : 'NO ❌'}\n`)

    // Esperar un momento
    await new Promise(resolve => setTimeout(resolve, 1000))

    // ESCENARIO 6: Confirmación - "sí quiero"
    console.log('═══════════════════════════════════════════════════')
    console.log('ESCENARIO 6: Confirmación - "sí quiero"')
    console.log('═══════════════════════════════════════════════════\n')

    const message6 = 'sí quiero'
    console.log(`👤 Usuario: "${message6}"`)

    const response6 = await Bot24_7Orchestrator.processMessage(
      userId,
      customerPhone,
      message6,
      []
    )

    console.log(`🤖 Bot: "${response6.message}"`)
    console.log(`📊 Confianza: ${response6.confidence}`)
    console.log(`🎯 Proveedor: ${response6.provider}`)
    console.log(`💡 Usó contexto: ${response6.productId === product.id ? 'SÍ ✅' : 'NO ❌'}\n`)

    // Verificar memoria
    console.log('═══════════════════════════════════════════════════')
    console.log('VERIFICACIÓN DE MEMORIA')
    console.log('═══════════════════════════════════════════════════\n')

    const memory = ProfessionalConversationMemory.getMemory(conversationKey)
    if (memory) {
      console.log('✅ Memoria encontrada:')
      console.log(`   📦 Producto actual: ${memory.currentProduct?.name || 'N/A'}`)
      console.log(`   💰 Precio: $${memory.currentProduct?.price?.toLocaleString('es-CO') || 'N/A'} COP`)
      console.log(`   📊 Mensajes: ${memory.state.messageCount}`)
      console.log(`   🎯 Intenciones: ${memory.state.intentions.join(', ')}`)
    } else {
      console.log('❌ No se encontró memoria')
    }

    console.log('\n✅ TEST COMPLETADO\n')

  } catch (error) {
    console.error('❌ Error en el test:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar test
testFollowUpQuestions()
