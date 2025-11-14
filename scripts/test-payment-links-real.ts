// Script para probar la generación de links de pago reales

async function testPaymentLinks() {
  console.log('🧪 Probando generación de links de pago...\n')

  const testProduct = {
    productId: 'test-123',
    productName: 'AirPods Pro',
    price: 150000,
    description: 'AirPods Pro de alta calidad',
    quantity: 1
  }

  // Test MercadoPago
  console.log('1️⃣ Probando MercadoPago...')
  try {
    const mpResponse = await fetch('http://localhost:3000/api/payments/create-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...testProduct, method: 'mercadopago' })
    })
    const mpData = await mpResponse.json()
    console.log('✅ MercadoPago:', mpData.paymentLink)
    console.log('   Debe empezar con: https://www.mercadopago.com')
  } catch (error) {
    console.error('❌ Error MercadoPago:', error)
  }

  console.log('')

  // Test PayPal
  console.log('2️⃣ Probando PayPal...')
  try {
    const ppResponse = await fetch('http://localhost:3000/api/payments/create-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...testProduct, method: 'paypal' })
    })
    const ppData = await ppResponse.json()
    console.log('✅ PayPal:', ppData.paymentLink)
    console.log('   Debe empezar con: https://www.paypal.com')
  } catch (error) {
    console.error('❌ Error PayPal:', error)
  }

  console.log('')

  // Test WhatsApp
  console.log('3️⃣ Probando WhatsApp...')
  try {
    const waResponse = await fetch('http://localhost:3000/api/payments/create-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...testProduct, method: 'whatsapp' })
    })
    const waData = await waResponse.json()
    console.log('✅ WhatsApp:', waData.paymentLink)
    console.log('   Debe empezar con: https://wa.me/573005560186')
  } catch (error) {
    console.error('❌ Error WhatsApp:', error)
  }

  console.log('\n✅ Pruebas completadas!')
}

testPaymentLinks()
