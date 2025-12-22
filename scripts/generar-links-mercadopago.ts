/**
 * 💳 Script para generar links de MercadoPago para todos los productos
 * Ejecutar: npx tsx scripts/generar-links-mercadopago.ts
 */

import { generateMissingMercadoPagoLinks } from '../src/lib/mercadopago-service'

async function main() {
  console.log('🚀 Generando links de MercadoPago para productos sin link...\n')
  
  // Verificar que existe el token
  if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
    console.error('❌ Error: MERCADO_PAGO_ACCESS_TOKEN no está configurado')
    console.log('\n📝 Configura la variable de entorno:')
    console.log('   MERCADO_PAGO_ACCESS_TOKEN=tu_access_token')
    process.exit(1)
  }
  
  console.log('✅ Token de MercadoPago encontrado\n')
  
  const result = await generateMissingMercadoPagoLinks()
  
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
