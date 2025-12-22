/**
 * TEST: Búsqueda de "curso de idiomas"
 * 
 * Verifica que el bot encuentre cursos de idiomas y NO el curso de piano
 */

const { ProfessionalBotArchitecture } = require('./src/lib/professional-bot-architecture.ts')

async function testCursoIdiomas() {
  console.log('🧪 TEST: Búsqueda de "curso de idiomas"\n')
  console.log('=' .repeat(60))

  // Simular usuario
  const userId = 'test-user-id'
  const customerPhone = '+573001234567'
  const message = 'Me interesa el curso de idiomas'

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

    // Verificar que NO mencione "Piano"
    if (response.message.toLowerCase().includes('piano')) {
      console.log('\n❌ ERROR: El bot respondió con Piano en lugar de idiomas')
      console.log('   Usuario pidió: "curso de idiomas"')
      console.log('   Bot respondió con: Curso de Piano')
      return false
    }

    // Verificar que SÍ mencione idiomas
    if (response.message.toLowerCase().includes('idioma') ||
        response.message.toLowerCase().includes('ingles') ||
        response.message.toLowerCase().includes('frances')) {
      console.log('\n✅ ÉXITO: El bot encontró curso de idiomas correcto')
      return true
    }

    console.log('\n⚠️ ADVERTENCIA: No se pudo determinar si la respuesta es correcta')
    console.log('   La respuesta no menciona ni piano ni idiomas')
    return false

  } catch (error) {
    console.error('\n❌ ERROR EN TEST:', error)
    return false
  }
}

// Ejecutar test
testCursoIdiomas()
  .then(success => {
    console.log('\n' + '='.repeat(60))
    if (success) {
      console.log('✅ TEST PASADO: El sistema encuentra curso de idiomas correctamente')
    } else {
      console.log('❌ TEST FALLIDO: El sistema confunde idiomas con piano')
    }
    console.log('='.repeat(60))
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('❌ ERROR FATAL:', error)
    process.exit(1)
  })
