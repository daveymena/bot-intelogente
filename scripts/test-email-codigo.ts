/**
 * Script para probar envío de códigos por email
 */

import { EmailVerificationService } from '../src/lib/email-verification-service'

async function testEmail() {
  console.log('📧 Probando envío de código por email...\n')

  const testEmail = 'daveymena16@gmail.com' // Tu email
  const code = EmailVerificationService.generateCode()

  console.log(`📧 Email destino: ${testEmail}`)
  console.log(`🔐 Código generado: ${code}\n`)

  console.log('📤 Enviando email...')

  const sent = await EmailVerificationService.sendVerificationCode(
    testEmail,
    code,
    'David',
    'registration'
  )

  if (sent) {
    console.log('\n✅ Email enviado exitosamente!')
    console.log('📬 Revisa tu bandeja de entrada')
    console.log(`   Email: ${testEmail}`)
    console.log(`   Asunto: 🔐 Código de Verificación - Smart Sales Bot`)
    console.log(`   Código: ${code}\n`)
  } else {
    console.log('\n❌ Error enviando email')
    console.log('Verifica:')
    console.log('  1. RESEND_API_KEY en .env')
    console.log('  2. EMAIL_FROM en .env')
    console.log('  3. Conexión a internet\n')
  }

  // Probar también recuperación de contraseña
  console.log('━'.repeat(60))
  console.log('\n📧 Probando recuperación de contraseña...\n')

  const resetCode = EmailVerificationService.generateCode()
  console.log(`🔐 Código de recuperación: ${resetCode}\n`)

  const resetSent = await EmailVerificationService.sendVerificationCode(
    testEmail,
    resetCode,
    'David',
    'password-reset'
  )

  if (resetSent) {
    console.log('\n✅ Email de recuperación enviado!')
    console.log('📬 Revisa tu bandeja de entrada')
    console.log(`   Asunto: 🔐 Recuperación de Contraseña - Smart Sales Bot\n`)
  } else {
    console.log('\n❌ Error enviando email de recuperación\n')
  }

  console.log('='.repeat(60))
  console.log('📊 RESUMEN')
  console.log('='.repeat(60))
  console.log(`Registro: ${sent ? '✅ Enviado' : '❌ Error'}`)
  console.log(`Recuperación: ${resetSent ? '✅ Enviado' : '❌ Error'}`)
  console.log('='.repeat(60))

  if (sent && resetSent) {
    console.log('\n🎉 ¡Todo funciona correctamente!')
    console.log('   Los códigos se están enviando por email.')
  } else {
    console.log('\n⚠️ Hay problemas con el envío de emails')
    console.log('   Revisa la configuración en .env')
  }
}

testEmail()
