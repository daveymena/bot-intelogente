/**
 * 💙 Script para generar links de PayPal para todos los productos
 * Ejecutar: npx tsx scripts/generar-links-paypal.ts
 */

import { generateMissingPayPalLinks } from '../src/lib/paypal-service'

async function main() {
  console.log('🚀 Generando links de PayPal para productos sin link...\n')
  
  // Verificar credenciales
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    console.error('❌ Error: Credenciales de PayPal no configuradas')
    console.log('\n📝 Configura las variables de entorno:')
    console.log('   PAYPAL_CLIENT_ID=tu_client_id')
    console.log('   PAYPAL_CLIENT_SECRET=tu_client_secret')
    console.log('   PAYPAL_MODE=sandbox (o live para producción)')
    process.exit(1)
  }
  
  console.log('✅ Credenciales de PayPal encontradas')
  console.log(`📍 Modo: ${process.env.PAYPAL_MODE || 'sandbox'}\n`)
  
  const result = await generateMissingPayPalLinks()
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 RESULTADO FINAL')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Links generados exitosamente: ${result.success}`)
  console.log(`❌ Fallidos: ${result.failed}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  process.exit(0)
}

main().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})
