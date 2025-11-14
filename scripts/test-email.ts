/**
 * 🧪 PRUEBA: Envío de Emails
 * Prueba el sistema de envío de correos con Resend
 */

import { EmailService } from '../src/lib/email-service'

async function testEmail() {
  console.log('📧 PRUEBA DE ENVÍO DE EMAILS\n')
  console.log('=' .repeat(70))

  // Verificar configuración
  console.log('\n🔍 VERIFICANDO CONFIGURACIÓN...\n')
  
  const hasResendKey = !!process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  
  console.log(`RESEND_API_KEY: ${hasResendKey ? '✅ Configurado' : '❌ No configurado'}`)
  console.log(`RESEND_FROM_EMAIL: ${fromEmail}`)
  console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}`)
  
  if (!hasResendKey) {
    console.log('\n⚠️  RESEND_API_KEY no está configurado')
    console.log('\n📝 PASOS PARA CONFIGURAR:')
    console.log('   1. Ve a https://resend.com')
    console.log('   2. Crea una cuenta gratis')
    console.log('   3. Ve a "API Keys"')
    console.log('   4. Crea una nueva API Key')
    console.log('   5. Cópiala y agrégala en .env:')
    console.log('      RESEND_API_KEY=re_xxxxxxxxxx')
    console.log('\n   6. (Opcional) Configura tu dominio:')
    console.log('      - Ve a "Domains" en Resend')
    console.log('      - Agrega tu dominio')
    console.log('      - Configura los registros DNS')
    console.log('      - Actualiza en .env:')
    console.log('        RESEND_FROM_EMAIL=noreply@tudominio.com')
    console.log('\n💡 Sin configurar, los emails se simularán en consola\n')
  }

  // Pedir email de prueba
  console.log('\n' + '─'.repeat(70))
  console.log('\n📬 PRUEBA DE ENVÍO')
  console.log('\nIngresa un email para probar (o presiona Enter para usar uno de prueba):')
  
  // En este script usaremos un email de prueba
  const testEmail = 'test@example.com' // Cambiar por tu email real
  
  console.log(`\nUsando email de prueba: ${testEmail}`)
  console.log('\n⚠️  NOTA: Cambia "test@example.com" por tu email real en el script\n')

  // Probar email de verificación
  console.log('\n1️⃣ PROBANDO EMAIL DE VERIFICACIÓN...\n')
  
  const verificationToken = 'test-token-' + Date.now()
  const verificationSent = await EmailService.sendVerificationEmail(
    testEmail,
    verificationToken,
    'Usuario de Prueba'
  )
  
  if (verificationSent) {
    console.log('✅ Email de verificación enviado')
  } else {
    console.log('❌ Error enviando email de verificación')
  }

  // Esperar un poco
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Probar email de bienvenida
  console.log('\n2️⃣ PROBANDO EMAIL DE BIENVENIDA...\n')
  
  const welcomeSent = await EmailService.sendWelcomeEmail(
    testEmail,
    'Usuario de Prueba'
  )
  
  if (welcomeSent) {
    console.log('✅ Email de bienvenida enviado')
  } else {
    console.log('❌ Error enviando email de bienvenida')
  }

  // Esperar un poco
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Probar email de reset de contraseña
  console.log('\n3️⃣ PROBANDO EMAIL DE RESET DE CONTRASEÑA...\n')
  
  const resetToken = 'reset-token-' + Date.now()
  const resetSent = await EmailService.sendPasswordResetEmail(
    testEmail,
    resetToken,
    'Usuario de Prueba'
  )
  
  if (resetSent) {
    console.log('✅ Email de reset enviado')
  } else {
    console.log('❌ Error enviando email de reset')
  }

  // Resumen
  console.log('\n' + '='.repeat(70))
  console.log('\n📊 RESUMEN DE PRUEBAS:\n')
  
  const allSent = verificationSent && welcomeSent && resetSent
  
  if (allSent) {
    console.log('✅ Todos los emails se enviaron correctamente')
    
    if (hasResendKey) {
      console.log('\n📬 Revisa tu bandeja de entrada en:', testEmail)
      console.log('   (También revisa spam/promociones)')
    } else {
      console.log('\n💡 Los emails fueron simulados (no se enviaron realmente)')
      console.log('   Configura RESEND_API_KEY para enviar emails reales')
    }
  } else {
    console.log('⚠️  Algunos emails fallaron')
  }

  console.log('\n' + '='.repeat(70))
}

// Ejecutar
testEmail()
  .then(() => {
    console.log('\n✅ Script finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
