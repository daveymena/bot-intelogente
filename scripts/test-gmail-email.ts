import { EmailVerificationService } from '../src/lib/email-verification-service'

async function testGmailEmail() {
  console.log('🧪 Probando envío de emails con Gmail OAuth...\n')

  try {
    // Probar envío de código de verificación con Gmail
    console.log('📧 Probando envío de código de verificación con Gmail...')

    const testEmail = 'daveymena16@gmail.com' // Email de prueba
    const code = EmailVerificationService.generateCode()

    console.log(`🔢 Código generado: ${code}`)
    console.log(`📧 Enviando a: ${testEmail}`)

    // Forzar uso de Gmail configurando solo las variables de Gmail
    process.env.RESEND_API_KEY = '' // Desactivar Resend
    process.env.SENDGRID_API_KEY = '' // Desactivar SendGrid

    // Asegurarse de que las variables de Gmail estén configuradas
    console.log('🔧 Variables de Gmail configuradas:')
    console.log(`   GMAIL_USER: ${process.env.GMAIL_USER ? '✅' : '❌'}`)
    console.log(`   GMAIL_CLIENT_ID: ${process.env.GMAIL_CLIENT_ID ? '✅' : '❌'}`)
    console.log(`   GMAIL_CLIENT_SECRET: ${process.env.GMAIL_CLIENT_SECRET ? '✅' : '❌'}`)
    console.log(`   GMAIL_REFRESH_TOKEN: ${process.env.GMAIL_REFRESH_TOKEN ? '✅' : '❌'}`)

    const emailSent = await EmailVerificationService.sendVerificationCode(
      testEmail,
      code,
      'Usuario de Prueba',
      'registration'
    )

    if (emailSent) {
      console.log('✅ Email enviado exitosamente con Gmail!')
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
      console.log('❌ Error enviando email con Gmail')
      console.log('💡 Posibles causas:')
      console.log('   - Credenciales de Gmail OAuth inválidas')
      console.log('   - Token de refresh expirado')
      console.log('   - Gmail API no habilitada')
      console.log('   - Límites de envío excedidos')
    }

  } catch (error) {
    console.error('❌ Error en el sistema de Gmail:')
    console.error((error as Error).message)

    if ((error as Error).message.includes('Gmail')) {
      console.log('\n💡 Solución para Gmail:')
      console.log('   1. Verifica que las credenciales OAuth sean correctas')
      console.log('   2. Asegúrate de que Gmail API esté habilitada')
      console.log('   3. Regenera el refresh token si expiró')
      console.log('   4. Verifica que el email remitente esté autorizado')
    }
  }

  console.log('\n🔍 Información de configuración actual:')
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Configurado' : '❌ No configurado')
  console.log('GMAIL_USER:', process.env.GMAIL_USER || 'No configurado')
  console.log('GMAIL_CLIENT_ID:', process.env.GMAIL_CLIENT_ID ? '✅ Configurado' : '❌ No configurado')
  console.log('GMAIL_CLIENT_SECRET:', process.env.GMAIL_CLIENT_SECRET ? '✅ Configurado' : '❌ No configurado')
  console.log('GMAIL_REFRESH_TOKEN:', process.env.GMAIL_REFRESH_TOKEN ? '✅ Configurado' : '❌ No configurado')
}

// Ejecutar el test
testGmailEmail().catch(console.error)