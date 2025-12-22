/**
 * TEST: Sistema de Memoria y Contexto
 * 
 * Verifica que el bot mantenga el contexto entre mensajes
 */

const { PerfectBotSystem } = require('./src/lib/perfect-bot-system.ts')

async function testMemoriaContexto() {
  console.log('🧪 TEST: Sistema de Memoria y Contexto\n')
  console.log('=' .repeat(60))

  const userId = 'test-user-123'
  const customerPhone = '573001234567'

  try {
    // CONVERSACIÓN 1: Pregunta por curso de piano
    console.log('\n📱 MENSAJE 1: "Tienes curso de piano"')
    const respuesta1 = await PerfectBotSystem.processMessage(
      userId,
      customerPhone,
      'Tienes curso de piano'
    )
    console.log('🤖 BOT:', respuesta1.message)
    console.log('📊 Confianza:', respuesta1.confidence)

    // Esperar 1 segundo
    await new Promise(resolve => setTimeout(resolve, 1000))

    // CONVERSACIÓN 2: Cliente dice "Me interesa"
    console.log('\n📱 MENSAJE 2: "Me interesa"')
    const respuesta2 = await PerfectBotSystem.processMessage(
      userId,
      customerPhone,
      'Me interesa'
    )
    console.log('🤖 BOT:', respuesta2.message)
    console.log('📊 Confianza:', respuesta2.confidence)

    // Verificar que NO perdió el contexto
    const perdioContexto = respuesta2.message.toLowerCase().includes('hola') && 
                          respuesta2.message.toLowerCase().includes('tenemos')
    
    if (perdioContexto) {
      console.log('\n❌ ERROR: Bot perdió el contexto!')
      console.log('   Debería continuar con el Curso de Piano')
    } else {
      console.log('\n✅ ÉXITO: Bot mantuvo el contexto!')
      console.log('   Continuó con el producto correcto')
    }

    // Esperar 1 segundo
    await new Promise(resolve => setTimeout(resolve, 1000))

    // CONVERSACIÓN 3: Cliente pide más detalles
    console.log('\n📱 MENSAJE 3: "Si más detalles"')
    const respuesta3 = await PerfectBotSystem.processMessage(
      userId,
      customerPhone,
      'Si más detalles'
    )
    console.log('🤖 BOT:', respuesta3.message)
    console.log('📊 Confianza:', respuesta3.confidence)

    // Verificar que sigue con el mismo producto
    const siguioConProducto = respuesta3.message.toLowerCase().includes('piano')
    
    if (!siguioConProducto) {
      console.log('\n❌ ERROR: Bot no continuó con el producto!')
    } else {
      console.log('\n✅ ÉXITO: Bot siguió con el mismo producto!')
    }

    // Esperar 1 segundo
    await new Promise(resolve => setTimeout(resolve, 1000))

    // CONVERSACIÓN 4: Cliente pide precio
    console.log('\n📱 MENSAJE 4: "Cuanto cuesta"')
    const respuesta4 = await PerfectBotSystem.processMessage(
      userId,
      customerPhone,
      'Cuanto cuesta'
    )
    console.log('🤖 BOT:', respuesta4.message)
    console.log('📊 Confianza:', respuesta4.confidence)

    // Verificar que dio el precio del producto correcto
    const dioPrecio = respuesta4.message.includes('60.000') || respuesta4.message.includes('60,000')
    
    if (!dioPrecio) {
      console.log('\n❌ ERROR: No dio el precio correcto!')
    } else {
      console.log('\n✅ ÉXITO: Dio el precio del producto correcto!')
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ TEST COMPLETADO')

  } catch (error) {
    console.error('\n❌ ERROR EN TEST:', error.message)
    console.error(error.stack)
  }
}

// Ejecutar test
testMemoriaContexto()
