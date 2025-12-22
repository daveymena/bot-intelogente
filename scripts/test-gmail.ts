/**
 * 🧪 TEST: Gmail Email Service
 * Probar envío de emails con Gmail
 */

import { GmailEmailService } from '../src/lib/email-service-gmail'

async function testGmail() {
  console.log('📧 PROBANDO GMAIL EMAIL SERVICE\n')
  console.log('='.repeat(70))
  
  try {
    // 1. Verificar configuración
    console.log('\n1️⃣ VERIFICANDO CONFIGURACIÓN')
    console.log('-'.repeat(70))
    
    const gmailUser = process.env.GMAIL_USER
    const gmailPassword = process.env.GMAIL_APP_PASSWORD
    
    console.log(`GMAIL_USER: ${gmailUser || '❌ NO configurado'}`)
    console.log(`GMAIL_APP_PASSWORD: ${gmailPassword ? '✅ Configurada' : '❌ NO configurada'}`)
    
    if (!gmailUser || !gmailPassword) {
      console.log('\n❌ ERROR: Gmail no está configurado')
      console.log('\n📝 PASOS PARA CONFIGURAR:')
      console.log('   1. Ve a https://myaccount.google.com/')
      console.log('   2. Seguridad → Verificación en 2 pasos (actívala)')
      console.log('   3. Seguridad → Contraseñas de aplicaciones')
      console.log('   4. Genera una contraseña para "Correo"')
      console.log('   5. Copia la contraseña (16 caracteres)')
      console.log('   6. Agrega a .env:')
      console.log('      GMAIL_USER=tu-email@gmail.com')
      console.log('      GMAIL_APP_PASSWORD=abcdefghijklmnop')
      console.log('\n📖 Ver guía completa: CONFIGURAR_GMAIL_GRATIS.md')
      return
    }
    
    // 2. Enviar email de prueba
    console.log('\n2️⃣ ENVIANDO EMAIL DE PRUEBA')
    console.log('-'.repeat(70))
    
    const testEmail = gmailUser // Enviar a ti mismo
    const testToken = 'test-token-' + Date.now()
    
    console.log(`De: ${gmailUser}`)
    console.log(`Para: ${testEmail}`)
    console.log(`Enviando...`)
    
    await GmailEmailService.sendVerificationEmail(testEmail, testToken, 'Usuario de Prueba')
    
    console.log('\n✅ EMAIL ENVIADO EXITOSAMENTE')
    console.log('\n📝 VERIFICA:')
    console.log('   1. Revisa tu bandeja de entrada')
    console.log('   2. Busca email de verificación')
    console.log('   3. Puede tardar 10-30 segundos')
    
    // 3. Información
    console.log('\n3️⃣ INFORMACIÓN')
    console.log('-'.repeat(70))
    console.log(`✅ Gmail configurado correctamente`)
    console.log(`✅ Puedes enviar hasta 500 emails/día`)
    console.log(`✅ Los emails llegarán a cualquier destinatario`)
    console.log(`✅ No requiere verificación de dominio`)
    
  } catch (error: any) {
    console.error('\n❌ ERROR AL ENVIAR EMAIL:', error.message)
    
    if (error.message.includes('Invalid login')) {
      console.log('\n🔑 ERROR DE AUTENTICACIÓN:')
      console.log('   - Verifica que GMAIL_USER sea correcto')
      console.log('   - Verifica que GMAIL_APP_PASSWORD sea correcta')
      console.log('   - Asegúrate de que no tenga espacios')
      console.log('   - Genera una nueva contraseña de aplicación')
    } else if (error.message.includes('Gmail no configurado')) {
      console.log('\n⚙️  CONFIGURACIÓN FALTANTE:')
      console.log('   Ver pasos arriba para configurar Gmail')
    }
    
    console.log('\n📋 DETALLES DEL ERROR:')
    console.log(error)
  }
  
  console.log('\n' + '='.repeat(70))
}

testGmail()
