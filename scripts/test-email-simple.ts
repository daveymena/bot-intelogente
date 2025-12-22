// Test simple de email
import { EmailService } from '../src/lib/email-service'

// CAMBIAR ESTE EMAIL POR EL TUYO
const MI_EMAIL = 'daveymena16@gmail.com'

console.log('🧪 Probando envío de email...\n')
console.log(`📧 Enviando a: ${MI_EMAIL}\n`)

EmailService.sendTestEmail(MI_EMAIL)
  .then((success) => {
    if (success) {
      console.log('\n✅ ¡EMAIL ENVIADO!')
      console.log('📬 Revisa tu bandeja de entrada (y spam)')
      console.log(`   Email: ${MI_EMAIL}`)
    } else {
      console.log('\n❌ ERROR al enviar')
      console.log('\n🔧 Posibles causas:')
      console.log('   1. RESEND_API_KEY no configurada')
      console.log('   2. API key inválida')
      console.log('   3. Límite de envíos alcanzado')
      console.log('\n💡 Solución:')
      console.log('   1. Verificar .env tiene RESEND_API_KEY')
      console.log('   2. Reiniciar servidor: npm run dev')
      console.log('   3. Verificar en https://resend.com')
    }
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  })
