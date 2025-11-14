/**
 * 🧪 TEST: Gmail OAuth2 Service
 * Probar envío de emails con Gmail OAuth2
 */

import { GmailOAuthService } from '../src/lib/email-service-oauth'

async function testGmailOAuth() {
  console.log('📧 PROBANDO GMAIL OAUTH2 SERVICE\n')
  console.log('='.repeat(70))
  
  try {
    // 1. Verificar configuración
    console.log('\n1️⃣ VERIFICANDO CONFIGURACIÓN')
    console.log('-'.repeat(70))
    
    const gmailUser = process.env.GMAIL_USER
    const clientId = process.env.GMAIL_CLIENT_ID
    const clientSecret = process.env.GMAIL_CLIENT_SECRET
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN
    
    console.log(`GMAIL_USER: ${gmailUser || '❌ NO configurado'}`)
    console.log(`GMAIL_CLIENT_ID: ${clientId ? '✅ Configurado' : '❌ NO configurado'}`)
    console.log(`GMAIL_CLIENT_SECRET: ${clientSecret ? '✅ Configurado' : '❌ NO configurado'}`)
    console.log(`GMAIL_REFRESH_TOKEN: ${refreshToken ? '✅ Configurado' : '❌ NO configurado'}`)
    
    if (!gmailUser || !clientId || !clientSecret || !refreshToken) {
      console.log('\n❌ ERROR: Gmail OAuth2 no está completamente configurado')
      console.log('\n📝 NECESITAS:')
      console.log('   1. GMAIL_USER=tu-email@gmail.com')
      console.log('   2. GMAIL_CLIENT_ID=816538559367-...')
      console.log('   3. GMAIL_CLIENT_SECRET=GOCSPX-...')
      console.log('   4. GMAIL_REFRESH_TOKEN=[obtener de OAuth Playground]')
      console.log('\n📖 Ver guía: CONFIGURAR_GMAIL_OAUTH2.md')
      return
    }
    
    // 2. Enviar email de prueba
    console.log('\n2️⃣ ENVIANDO EMAIL DE PRUEBA')
    console.log('-'.repeat(70))
    
    const testEmail = gmailUser // Enviar a ti mismo
    const testToken = 'test-token-' + Date.now()
    
    console.log(`De: ${gmailUser}`)
    console.log(`Para: ${testEmail}`)
    console.log(`Obteniendo access token...`)
    console.log(`Enviando...`)
    
    await GmailOAuthService.sendVerificationEmail(testEmail, testToken, 'Usuario de Prueba')
    
    console.log('\n✅ EMAIL ENVIADO EXITOSAMENTE')
    console.log('\n📝 VERIFICA:')
    console.log('   1. Revisa tu bandeja de entrada')
    console.log('   2. Busca email de verificación')
    console.log('   3. Puede tardar 10-30 segundos')
    
    // 3. Información
    console.log('\n3️⃣ INFORMACIÓN')
    console.log('-'.repeat(70))
    console.log(`✅ Gmail OAuth2 configurado correctamente`)
    console.log(`✅ Más seguro que contraseña de aplicación`)
    console.log(`✅ Puedes enviar hasta 500 emails/día`)
    console.log(`✅ Los emails llegarán a cualquier destinatario`)
    console.log(`✅ No requiere verificación de dominio`)
    
  } catch (error: any) {
    console.error('\n❌ ERROR AL ENVIAR EMAIL:', error.message)
    
    if (error.message.includes('invalid_grant')) {
      console.log('\n🔑 ERROR DE REFRESH TOKEN:')
      console.log('   - El refresh token es inválido o expiró')
      console.log('   - Genera uno nuevo en OAuth Playground')
      console.log('   - https://developers.google.com/oauthplayground')
    } else if (error.message.includes('invalid_client')) {
      console.log('\n🔑 ERROR DE CREDENCIALES:')
      console.log('   - Client ID o Client Secret incorrectos')
      console.log('   - Verifica que sean los correctos')
    } else if (error.message.includes('Gmail OAuth2 no configurado')) {
      console.log('\n⚙️  CONFIGURACIÓN FALTANTE:')
      console.log('   Ver pasos arriba para configurar Gmail OAuth2')
    }
    
    console.log('\n📋 DETALLES DEL ERROR:')
    console.log(error)
  }
  
  console.log('\n' + '='.repeat(70))
}

testGmailOAuth()
