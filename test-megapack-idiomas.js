/**
 * TEST: Búsqueda de Megapack de Idiomas
 * 
 * Verifica que el bot encuentre el producto correcto cuando el usuario pregunta:
 * "Me interesa el mega pack de Idiomas"
 */

const { ProfessionalBotArchitecture } = require('./src/lib/professional-bot-architecture.ts')

async function testMegapackIdiomas() {
  console.log('🧪 TEST: Búsqueda de Megapack de Idiomas\n')
  console.log('=' .repeat(60))

  // Simular usuario
  const userId = 'test-user-id'
  const customerPhone = '+573001234567'
  const message = 'Me interesa el mega pack de Idiomas'

  console.log(`\n📱 Cliente: ${customerPhone}`)
  console.log(`💬 Mensaje: "${message}"`)
  console.log('\n' + '='.repeat(60))

  try {
    // Procesar mensaje
    const response = await ProfessionalBotArchitecture.processMessage(
      userId,
      customerPhone,
      message
    )

    console.log('\n✅ RESPUESTA DEL BOT:')
    console.log('='.repeat(60))
    console.log(response.message)
    console.log('='.repeat(60))
    console.log(`\n📊 Confianza: ${(response.confidence * 100).toFixed(0)}%`)
    console.log(`🎯 Intención: ${response.intent}`)

    // Verificar que NO mencione "Álbumes digitales"
    if (response.message.toLowerCase().includes('álbum') || 
        response.message.toLowerCase().includes('album')) {
      console.log('\n❌ ERROR: El bot respondió con álbumes en lugar de idiomas')
      console.log('   Esto indica que el sistema de búsqueda sigue fallando')
      return false
    }

    // Verificar que SÍ mencione idiomas
    if (response.message.toLowerCase().includes('idioma') ||
        response.message.toLowerCase().includes('ingles') ||
        response.message.toLowerCase().includes('frances')) {
      console.log('\n✅ ÉXITO: El bot encontró el megapack de idiomas correcto')
      return true
    }

    console.log('\n⚠️ ADVERTENCIA: No se pudo determinar si la respuesta es correcta')
    return false

  } catch (error) {
    console.error('\n❌ ERROR EN TEST:', error)
    return false
  }
}

// Ejecutar test
testMegapackIdiomas()
  .then(success => {
    console.log('\n' + '='.repeat(60))
    if (success) {
      console.log('✅ TEST PASADO: El sistema de búsqueda funciona correctamente')
    } else {
      console.log('❌ TEST FALLIDO: El sistema de búsqueda necesita más ajustes')
    }
    console.log('='.repeat(60))
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('❌ ERROR FATAL:', error)
    process.exit(1)
  })
