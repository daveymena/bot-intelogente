/**
 * TEST: Sistema de Memoria con Usuario Real
 * 
 * Verifica que el bot mantenga el contexto entre mensajes
 * usando el usuario real con productos en la BD
 */

const { PrismaClient } = require('@prisma/client')
const { PerfectBotSystem } = require('./src/lib/perfect-bot-system.ts')

const db = new PrismaClient()

async function testMemoriaReal() {
  console.log('🧪 TEST: Sistema de Memoria con Usuario Real\n')
  console.log('=' .repeat(60))

  try {
    // Obtener el primer usuario con productos
    const usuario = await db.user.findFirst({
      include: {
        products: {
          where: { status: 'AVAILABLE' },
          take: 1
        }
      }
    })

    if (!usuario) {
      console.log('❌ No hay usuarios en la base de datos')
      return
    }

    if (usuario.products.length === 0) {
      console.log('❌ El usuario no tiene productos')
      return
    }

    console.log(`✅ Usuario encontrado: ${usuario.email}`)
    console.log(`✅ Productos disponibles: ${usuario.products.length}`)

    const userId = usuario.id
    const customerPhone = '573001234567'

    // CONVERSACIÓN 1: Pregunta por curso de piano
    console.log('\n📱 MENSAJE 1: "Tienes curso de piano"')
    const respuesta1 = await PerfectBotSystem.processMessage(
      userId,
      customerPhone,
      'Tienes curso de piano'
    )
    console.log('🤖 BOT:', respuesta1.message.substring(0, 100) + '...')
    console.log('📊 Confianza:', respuesta1.confidence)

    const encontroProducto = !respuesta1.message.toLowerCase().includes('no tengo')
    console.log(encontroProducto ? '✅ Encontró producto' : '❌ No encontró producto')

    // Esperar 1 segundo
    await new Promise(resolve => setTimeout(resolve, 1000))

    // CONVERSACIÓN 2: Cliente dice "Me interesa"
    console.log('\n📱 MENSAJE 2: "Me interesa"')
    const respuesta2 = await PerfectBotSystem.processMessage(
      userId,
      customerPhone,
      'Me interesa'
    )
    console.log('🤖 BOT:', respuesta2.message.substring(0, 100) + '...')
    console.log('📊 Confianza:', respuesta2.confidence)

    // Verificar que NO perdió el contexto
    const perdioContexto = respuesta2.message.toLowerCase().includes('hola') && 
                          respuesta2.message.toLowerCase().includes('tenemos')
    
    if (perdioContexto) {
      console.log('\n❌ ERROR: Bot perdió el contexto!')
      console.log('   Debería continuar con el producto anterior')
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
    console.log('🤖 BOT:', respuesta3.message.substring(0, 100) + '...')
    console.log('📊 Confianza:', respuesta3.confidence)

    // Verificar que sigue con el mismo producto
    const siguioConProducto = !respuesta3.message.toLowerCase().includes('hola')
    
    if (!siguioConProducto) {
      console.log('\n❌ ERROR: Bot no continuó con el producto!')
    } else {
      console.log('\n✅ ÉXITO: Bot siguió con el mismo producto!')
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ TEST COMPLETADO')

  } catch (error) {
    console.error('\n❌ ERROR EN TEST:', error.message)
    console.error(error.stack)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar test
testMemoriaReal()
