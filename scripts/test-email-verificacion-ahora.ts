// Script para probar el envío de emails de verificación
import { EmailService } from '../src/lib/email-service'

async function testEmailVerification() {
  console.log('🧪 Probando envío de email de verificación...\n')
  
  // Email de prueba
  const testEmail = 'tu-email@gmail.com' // CAMBIAR POR TU EMAIL
  const testToken = 'test-token-123456'
  const testName = 'Usuario de Prueba'
  
  console.log(`📧 Enviando email a: ${testEmail}`)
  console.log(`🔑 Token de prueba: ${testToken}`)
  console.log(`👤 Nombre: ${testName}\n`)
  
  try {
    // Verificar variables de entorno
    console.log('🔍 Verificando configuración...')
    console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Configurada' : '❌ No configurada'}`)
    console.log(`   RESEND_FROM_EMAIL: ${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}`)
    console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}\n`)
    
    // Enviar email de verificación
    console.log('📤 Enviando email de verificación...')
    const result = await EmailService.sendVerificationEmail(testEmail, testToken, testName)
    
    if (result) {
      console.log('\n✅ ¡Email enviado exitosamente!')
      console.log('\n📬 Revisa tu bandeja de entrada (y spam)')
      console.log(`   Email: ${testEmail}`)
      console.log(`   Asunto: 🤖 Verifica tu cuenta de Smart Sales Bot`)
      console.log(`\n🔗 Link de verificación:`)
      console.log(`   ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${testToken}`)
    } else {
      console.log('\n❌ Error al enviar el email')
      console.log('\n🔧 Posibles causas:')
      console.log('   1. RESEND_API_KEY inválida o expirada')
      console.log('   2. Email remitente no verificado en Resend')
      console.log('   3. Límite de envíos alcanzado')
      console.log('   4. Problema de conexión con Resend')
      console.log('\n💡 Soluciones:')
      console.log('   1. Verifica tu API key en https://resend.com/api-keys')
      console.log('   2. Verifica tu dominio en https://resend.com/domains')
      console.log('   3. Revisa los logs de Resend')
    }
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    console.error('\n📋 Detalles:', error)
  }
}

// Ejecutar
testEmailVerification()
  .then(() => {
    console.log('\n✅ Prueba completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })
