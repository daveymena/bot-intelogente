/**
 * 🧪 TEST: Verificar envío de emails
 * Diagnosticar por qué no llegan los correos de verificación
 */

import { EmailService } from '../src/lib/email-service'

async function testEmailVerificacion() {
  console.log('📧 PROBANDO SISTEMA DE EMAILS\n')
  console.log('='.repeat(70))
  
  try {
    // 1. Verificar configuración
    console.log('\n1️⃣ VERIFICANDO CONFIGURACIÓN')
    console.log('-'.repeat(70))
    
    const resendKey = process.env.RESEND_API_KEY
    const emailFrom = process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL
    
    console.log(`RESEND_API_KEY: ${resendKey ? '✅ Configurada' : '❌ NO configurada'}`)
    console.log(`EMAIL_FROM: ${emailFrom || '❌ NO configurado'}`)
    
    if (!resendKey) {
      console.log('\n❌ ERROR: RESEND_API_KEY no está configurada')
      console.log('   Configura en .env:')
      console.log('   RESEND_API_KEY=re_xxx')
      return
    }
    
    if (!emailFrom) {
      console.log('\n⚠️  ADVERTENCIA: EMAIL_FROM no está configurado')
      console.log('   Usando default de Resend')
    }
    
    // 2. Probar envío de email de verificación
    console.log('\n2️⃣ ENVIANDO EMAIL DE PRUEBA')
    console.log('-'.repeat(70))
    
    const testEmail = 'eladios.mena@gmail.com' // Tu email
    const testToken = 'test-token-' + Date.now()
    
    console.log(`Enviando a: ${testEmail}`)
    console.log(`Token: ${testToken}`)
    console.log('Enviando...')
    
    await EmailService.sendVerificationEmail(testEmail, testToken, 'Usuario de Prueba')
    
    console.log('\n✅ EMAIL ENVIADO EXITOSAMENTE')
    console.log('\n📝 VERIFICA:')
    console.log('   1. Revisa tu bandeja de entrada')
    console.log('   2. Revisa spam/correo no deseado')
    console.log('   3. Puede tardar 1-2 minutos')
    
    // 3. Mostrar información del email
    console.log('\n3️⃣ INFORMACIÓN DEL EMAIL')
    console.log('-'.repeat(70))
    console.log(`De: ${emailFrom}`)
    console.log(`Para: ${testEmail}`)
    console.log(`Asunto: Verifica tu correo electrónico`)
    console.log(`Link: http://localhost:3000/verify-email?token=${testToken}`)
    
  } catch (error: any) {
    console.error('\n❌ ERROR AL ENVIAR EMAIL:', error.message)
    
    if (error.message.includes('401')) {
      console.log('\n🔑 ERROR DE AUTENTICACIÓN:')
      console.log('   - RESEND_API_KEY es inválida')
      console.log('   - Verifica en https://resend.com/api-keys')
    } else if (error.message.includes('403')) {
      console.log('\n🚫 ERROR DE PERMISOS:')
      console.log('   - El dominio no está verificado en Resend')
      console.log('   - Usa onboarding@resend.dev para pruebas')
    } else if (error.message.includes('422')) {
      console.log('\n📧 ERROR DE EMAIL:')
      console.log('   - El email de destino es inválido')
      console.log('   - O el formato del mensaje es incorrecto')
    }
    
    console.log('\n📋 DETALLES DEL ERROR:')
    console.log(error)
  }
  
  console.log('\n' + '='.repeat(70))
}

testEmailVerificacion()
