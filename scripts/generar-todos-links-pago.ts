/**
 * 💳 Script para generar TODOS los links de pago (MercadoPago + PayPal)
 * Ejecutar: npx tsx scripts/generar-todos-links-pago.ts
 */

import { generateMissingMercadoPagoLinks } from '../src/lib/mercadopago-service'
import { generateMissingPayPalLinks } from '../src/lib/paypal-service'

async function main() {
  console.log('🚀 Generando links de pago para todos los productos...\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  let mpResult = { success: 0, failed: 0 }
  let ppResult = { success: 0, failed: 0 }
  
  // MercadoPago
  if (process.env.MERCADO_PAGO_ACCESS_TOKEN) {
    console.log('🔵 MERCADOPAGO')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    mpResult = await generateMissingMercadoPagoLinks()
    console.log('')
  } else {
    console.log('⚠️ MercadoPago: Token no configurado, saltando...\n')
  }
  
  // PayPal
  if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
    console.log('🟡 PAYPAL')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    ppResult = await generateMissingPayPalLinks()
    console.log('')
  } else {
    console.log('⚠️ PayPal: Credenciales no configuradas, saltando...\n')
  }
  
  // Resumen final
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 RESUMEN FINAL')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`🔵 MercadoPago: ${mpResult.success} exitosos, ${mpResult.failed} fallidos`)
  console.log(`🟡 PayPal: ${ppResult.success} exitosos, ${ppResult.failed} fallidos`)
  console.log(`📦 Total: ${mpResult.success + ppResult.success} links generados`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  process.exit(0)
}

main().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})
