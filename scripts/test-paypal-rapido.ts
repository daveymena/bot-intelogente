/**
 * Test rápido de PayPal y objeciones de precio
 */

import { SalesAgentSimple } from '../src/lib/sales-agent-simple'

async function test() {
  const agent = new SalesAgentSimple()
  
  // Esperar a que cargue productos
  await new Promise(r => setTimeout(r, 2000))
  
  console.log('🧪 Test rápido de PayPal y objeciones\n')
  
  // 1. Preguntar por curso de piano
  let res = await agent.processMessage('quiero el curso de piano', 'test-123')
  console.log('1. Pregunta piano:', res.intent)
  console.log('   Producto:', res.product?.name || 'ninguno')
  
  // 2. Objeción de precio
  res = await agent.processMessage('está muy caro', 'test-123')
  console.log('\n2. Objeción precio:', res.intent)
  console.log('   Respuesta:', res.text.substring(0, 150) + '...')
  
  // 3. Solicitar pago
  res = await agent.processMessage('ok lo quiero, como pago?', 'test-123')
  console.log('\n3. Solicitud pago:', res.intent)
  
  // Verificar si tiene link de PayPal
  const tienePayPal = res.text.includes('paypal.com')
  console.log('   ✅ Tiene link PayPal:', tienePayPal)
  
  if (tienePayPal) {
    const match = res.text.match(/https:\/\/www\.paypal\.com\/[^\s]+/)
    if (match) {
      console.log('   Link:', match[0])
    }
  }
  
  // Verificar MercadoPago
  const tieneMercadoPago = res.text.includes('mercadopago.com')
  console.log('   ✅ Tiene link MercadoPago:', tieneMercadoPago)
  
  console.log('\n✅ Test completado')
  process.exit(0)
}

test()
