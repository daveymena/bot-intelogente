/**
 * 📧 ENVIAR EMAIL DE PRUEBA PROFESIONAL
 * Envía un email de prueba a daveymena16@gmail.com
 */

// IMPORTANTE: Cargar variables de entorno ANTES de cualquier import
import dotenv from 'dotenv'
dotenv.config()

// Verificar que la API Key se cargó correctamente
console.log('🔍 Verificando variables de entorno...')
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Configurado' : '❌ No encontrado')
console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev')
console.log('')

import { EmailService } from '../src/lib/email-service'

async function enviarEmailPrueba() {
  console.log('📧 ENVIANDO EMAIL DE PRUEBA PROFESIONAL\n')
  console.log('=' .repeat(70))

  const emailDestino = 'daveymena16@gmail.com'
  const nombreUsuario = 'Davey Mena'

  console.log(`\n📬 Destinatario: ${emailDestino}`)
  console.log(`👤 Nombre: ${nombreUsuario}\n`)

  // Verificar configuración
  const hasResendKey = !!process.env.RESEND_API_KEY
  
  if (!hasResendKey) {
    console.log('⚠️  RESEND_API_KEY no configurado')
    console.log('\n💡 El email se simulará en consola')
    console.log('   Para enviar email real:')
    console.log('   1. Crea cuenta en https://resend.com')
    console.log('   2. Obtén tu API Key')
    console.log('   3. Agrégala en .env: RESEND_API_KEY=re_xxx\n')
  } else {
    console.log('✅ RESEND_API_KEY configurado')
    console.log('📤 Enviando email real...\n')
  }

  console.log('─'.repeat(70))

  // Enviar email de prueba profesional
  console.log('\n📧 Enviando email de prueba profesional...\n')
  
  const enviadoPrueba = await EmailService.sendTestEmail(emailDestino)

  if (enviadoPrueba) {
    console.log('✅ Email de prueba enviado exitosamente!')
    
    if (hasResendKey) {
      console.log('\n📬 REVISA TU BANDEJA DE ENTRADA:')
      console.log(`   Email: ${emailDestino}`)
      console.log('   Asunto: ✅ Email de Prueba - Smart Sales Bot Pro')
      console.log('\n✨ El email incluye:')
      console.log('   ✅ Diseño HTML profesional y empresarial')
      console.log('   ✅ Gradientes modernos y colores corporativos')
      console.log('   ✅ Estadísticas del sistema en tiempo real')
      console.log('   ✅ Grid de características principales')
      console.log('   ✅ Botones interactivos con hover effects')
      console.log('   ✅ Footer profesional con links')
      console.log('   ✅ Responsive (se ve perfecto en móvil)')
      console.log('\n💡 También revisa:')
      console.log('   - Carpeta de Spam')
      console.log('   - Carpeta de Promociones')
      console.log('   - Carpeta de Social')
    } else {
      console.log('\n💡 Email simulado (no enviado realmente)')
      console.log('   Configura RESEND_API_KEY para enviar emails reales')
    }
  } else {
    console.log('❌ Error enviando email de prueba')
  }

  console.log('\n' + '─'.repeat(70))

  // Esperar un poco
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Enviar email de verificación
  console.log('\n📧 Enviando email de verificación...\n')
  
  const tokenPrueba = 'test-token-' + Date.now()
  const enviado = await EmailService.sendVerificationEmail(
    emailDestino,
    tokenPrueba,
    nombreUsuario
  )

  if (enviado) {
    console.log('✅ Email de verificación enviado!')
    
    if (hasResendKey) {
      console.log('\n📬 REVISA TU BANDEJA:')
      console.log(`   Email: ${emailDestino}`)
      console.log('   Asunto: 🤖 Verifica tu cuenta de Smart Sales Bot')
    }
  } else {
    console.log('❌ Error enviando email de verificación')
  }

  console.log('\n' + '─'.repeat(70))

  // Esperar un poco
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Enviar email de bienvenida
  console.log('\n📧 Enviando email de bienvenida...\n')
  
  const enviadoBienvenida = await EmailService.sendWelcomeEmail(
    emailDestino,
    nombreUsuario
  )

  if (enviadoBienvenida) {
    console.log('✅ Email de bienvenida enviado!')
    
    if (hasResendKey) {
      console.log('\n📬 REVISA TU BANDEJA:')
      console.log(`   Email: ${emailDestino}`)
      console.log('   Asunto: 🎉 ¡Bienvenido a Smart Sales Bot Pro!')
    }
  } else {
    console.log('❌ Error enviando email de bienvenida')
  }

  // Resumen final
  console.log('\n\n' + '='.repeat(70))
  console.log('\n📊 RESUMEN:\n')
  
  if (enviadoPrueba && enviado && enviadoBienvenida) {
    console.log('✅ Los 3 emails enviados correctamente')
    
    if (hasResendKey) {
      console.log('\n📧 EMAILS ENVIADOS A: daveymena16@gmail.com')
      console.log('\n📬 Revisa tu bandeja de entrada')
      console.log('   (También revisa spam/promociones)')
      console.log('\n✨ Los emails incluyen:')
      console.log('   ✅ Diseño HTML profesional y empresarial')
      console.log('   ✅ Gradientes modernos y colores corporativos')
      console.log('   ✅ Estadísticas y métricas visuales')
      console.log('   ✅ Botones interactivos con efectos hover')
      console.log('   ✅ Grid de características con iconos')
      console.log('   ✅ Footer profesional con links sociales')
      console.log('   ✅ Responsive (perfecto en móvil y desktop)')
      console.log('   ✅ Branding consistente')
      console.log('\n🎨 Diseño empresarial de alta calidad')
      console.log('   - Paleta de colores verde corporativo')
      console.log('   - Tipografía moderna (SF Pro, Segoe UI)')
      console.log('   - Sombras y efectos sutiles')
      console.log('   - Layout limpio y profesional')
    } else {
      console.log('\n💡 EMAILS SIMULADOS (no enviados realmente)')
      console.log('\n📝 Para enviar emails reales:')
      console.log('   1. Ve a https://resend.com')
      console.log('   2. Crea cuenta gratis')
      console.log('   3. Obtén tu API Key')
      console.log('   4. Agrégala en .env:')
      console.log('      RESEND_API_KEY=re_xxxxxxxxxx')
      console.log('   5. Ejecuta este script de nuevo')
    }
  } else {
    console.log('⚠️  Algunos emails fallaron')
  }

  console.log('\n' + '='.repeat(70))
}

// Ejecutar
enviarEmailPrueba()
  .then(() => {
    console.log('\n✅ Script finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
