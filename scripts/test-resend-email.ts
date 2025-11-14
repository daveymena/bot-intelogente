import { EmailVerificationService } from '../src/lib/email-verification-service'

async function testResendEmail() {
  console.log('🧪 Probando envío de emails con Resend...\n')

  try {
    // Probar envío de código de verificación con Resend
    console.log('📧 Probando envío de código de verificación con Resend...')

    const testEmail = 'daveymena16@gmail.com' // Email de prueba
    const code = EmailVerificationService.generateCode()

    console.log(`🔢 Código generado: ${code}`)
    console.log(`📧 Enviando a: ${testEmail}`)

    // Forzar uso de Resend configurando solo las variables de Resend
    process.env.GMAIL_USER = '' // Desactivar Gmail
    process.env.GMAIL_CLIENT_ID = ''
    process.env.GMAIL_CLIENT_SECRET = ''
    process.env.GMAIL_REFRESH_TOKEN = ''

    // Asegurarse de que las variables de Resend estén configuradas
    console.log('🔧 Variables de Resend configuradas:')
    console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅' : '❌'}`)
    console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM ? '✅' : '❌'}`)

    const emailSent = await EmailVerificationService.sendVerificationCode(
      testEmail,
      code,
      'Usuario de Prueba',
      'registration'
    )

    if (emailSent) {
      console.log('✅ Email enviado exitosamente con Resend!')
      console.log(`📧 Enviado a: ${testEmail}`)
      console.log(`🔢 Código: ${code}`)
      console.log('📬 Revisa tu bandeja de entrada (y spam)')

      // Probar envío de email de recuperación de contraseña
      console.log('\n🔐 Probando envío de email de recuperación de contraseña...')
      const resetCode = EmailVerificationService.generateCode()
      const resetSent = await EmailVerificationService.sendVerificationCode(
        testEmail,
        resetCode,
        'Usuario de Prueba',
        'password-reset'
      )

      if (resetSent) {
        console.log('✅ Email de recuperación enviado exitosamente!')
        console.log(`🔢 Código de recuperación: ${resetCode}`)
      } else {
        console.log('❌ Error enviando email de recuperación')
      }

    } else {
      console.log('❌ Error enviando email con Resend')
      console.log('💡 Posibles causas:')
      console.log('   - API Key de Resend inválida')
      console.log('   - Email remitente no verificado en Resend')
      console.log('   - Límites de envío excedidos')
      console.log('   - Problemas de conectividad')
    }

  } catch (error) {
    console.error('❌ Error en el sistema de Resend:')
    console.error((error as Error).message)

    if ((error as Error).message.includes('Resend')) {
      console.log('\n💡 Solución para Resend:')
      console.log('   1. Verifica que la API Key sea correcta')
      console.log('   2. Asegúrate de que el dominio esté verificado en Resend')
      console.log('   3. Verifica que el email remitente esté autorizado')
      console.log('   4. Revisa los límites de envío en tu plan')
    }
  }

  console.log('\n🔍 Información de configuración actual:')
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Configurado' : '❌ No configurado')
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'No configurado')
  console.log('GMAIL_USER:', process.env.GMAIL_USER || 'No configurado')
}

// Ejecutar el test
testResendEmail().catch(console.error)