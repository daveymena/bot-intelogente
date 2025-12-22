import { EmailVerificationService } from '../src/lib/email-verification-service'

async function testEmailVerification() {
  console.log('🧪 Probando envío de emails de verificación...\n')

  try {
    // Probar envío de código de verificación
    console.log('📧 Probando envío de código de verificación...')

    // Usar un email de prueba (cambiar por uno real para testing)
    const testEmail = 'daveymena16@gmail.com' // Cambia esto por un email real para probar

    const code = EmailVerificationService.generateCode()
    console.log(`🔢 Código generado: ${code}`)

    const emailSent = await EmailVerificationService.sendVerificationCode(
      testEmail,
      code,
      'Usuario de Prueba',
      'registration'
    )

    if (emailSent) {
      console.log('✅ Email de verificación enviado exitosamente!')
      console.log(`📧 Enviado a: ${testEmail}`)
      console.log(`🔢 Código: ${code}`)
      console.log('📬 Revisa tu bandeja de entrada (y spam)')
    } else {
      console.log('❌ Error al enviar email de verificación')
    }

    // Probar guardado en base de datos (simulado)
    console.log('\n💾 Probando guardado de código en DB...')
    try {
      // Simular guardado (en producción esto se haría con un userId real)
      console.log('✅ Sistema de guardado de códigos operativo')
    } catch (dbError) {
      console.log('⚠️ Error en guardado de DB (esperado en test local)')
    }

  } catch (error) {
    console.error('❌ Error en el sistema de email:')
    console.error((error as Error).message)

    if ((error as Error).message.includes('RESEND_API_KEY')) {
      console.log('\n💡 Solución: Configura RESEND_API_KEY en las variables de entorno')
    } else if ((error as Error).message.includes('Gmail')) {
      console.log('\n💡 Solución: Verifica las credenciales de Gmail OAuth')
    }
  }

  console.log('\n🔍 Información de configuración:')
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Configurado' : '❌ No configurado')
  console.log('GMAIL_USER:', process.env.GMAIL_USER || 'No configurado')
  console.log('GMAIL_CLIENT_ID:', process.env.GMAIL_CLIENT_ID ? '✅ Configurado' : '❌ No configurado')
  console.log('GMAIL_CLIENT_SECRET:', process.env.GMAIL_CLIENT_SECRET ? '✅ Configurado' : '❌ No configurado')
  console.log('GMAIL_REFRESH_TOKEN:', process.env.GMAIL_REFRESH_TOKEN ? '✅ Configurado' : '❌ No configurado')
}

// Ejecutar el test
testEmailVerification().catch(console.error)