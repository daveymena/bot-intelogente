// Script para debuggear los pagos paso a paso

async function testPaymentLinks() {
  console.log('🔍 DEBUGGING PAYMENT LINKS\n')
  console.log('=' .repeat(50))

  const testProduct = {
    productId: 'test-123',
    productName: 'AirPods Pro Test',
    price: 150000,
    description: 'Producto de prueba',
    quantity: 1
  }

  console.log('\n📦 Producto de prueba:')
  console.log(JSON.stringify(testProduct, null, 2))

  // Test 1: MercadoPago
  console.log('\n' + '='.repeat(50))
  console.log('1️⃣ PROBANDO MERCADOPAGO')
  console.log('='.repeat(50))
  
  try {
    console.log('Enviando petición...')
    const mpResponse = await fetch('http://localhost:3000/api/payments/create-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...testProduct, method: 'mercadopago' })
    })

    console.log('Status:', mpResponse.status)
    const mpData = await mpResponse.json()
    console.log('Respuesta:', JSON.stringify(mpData, null, 2))

    if (mpData.paymentLink && mpData.paymentLink !== '#') {
      console.log('✅ LINK GENERADO:', mpData.paymentLink)
      console.log('   Debe empezar con: https://www.mercadopago.com')
      console.log('   Empieza con:', mpData.paymentLink.substring(0, 30) + '...')
    } else {
      console.log('❌ ERROR: Link no generado o es #')
      console.log('   Verifica las credenciales de MercadoPago en .env')
    }
  } catch (error) {
    console.error('❌ ERROR:', error)
  }

  // Test 2: PayPal
  console.log('\n' + '='.repeat(50))
  console.log('2️⃣ PROBANDO PAYPAL')
  console.log('='.repeat(50))
  
  try {
    console.log('Enviando petición...')
    const ppResponse = await fetch('http://localhost:3000/api/payments/create-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...testProduct, method: 'paypal' })
    })

    console.log('Status:', ppResponse.status)
    const ppData = await ppResponse.json()
    console.log('Respuesta:', JSON.stringify(ppData, null, 2))

    if (ppData.paymentLink && ppData.paymentLink !== '#') {
      console.log('✅ LINK GENERADO:', ppData.paymentLink)
      console.log('   Debe empezar con: https://www.paypal.com')
      console.log('   Empieza con:', ppData.paymentLink.substring(0, 30) + '...')
    } else {
      console.log('❌ ERROR: Link no generado o es #')
      console.log('   Verifica las credenciales de PayPal en .env')
    }
  } catch (error) {
    console.error('❌ ERROR:', error)
  }

  // Test 3: WhatsApp
  console.log('\n' + '='.repeat(50))
  console.log('3️⃣ PROBANDO WHATSAPP')
  console.log('='.repeat(50))
  
  try {
    console.log('Enviando petición...')
    const waResponse = await fetch('http://localhost:3000/api/payments/create-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...testProduct, method: 'whatsapp' })
    })

    console.log('Status:', waResponse.status)
    const waData = await waResponse.json()
    console.log('Respuesta:', JSON.stringify(waData, null, 2))

    if (waData.paymentLink && waData.paymentLink !== '#') {
      console.log('✅ LINK GENERADO:', waData.paymentLink)
      console.log('   Debe empezar con: https://wa.me/573005560186')
      console.log('   Empieza con:', waData.paymentLink.substring(0, 40) + '...')
    } else {
      console.log('❌ ERROR: Link no generado')
    }
  } catch (error) {
    console.error('❌ ERROR:', error)
  }

  console.log('\n' + '='.repeat(50))
  console.log('✅ PRUEBAS COMPLETADAS')
  console.log('='.repeat(50))
  console.log('\n💡 INSTRUCCIONES:')
  console.log('1. Si ves "#" en los links, las credenciales están mal')
  console.log('2. Si ves "ERROR", revisa la consola del servidor')
  console.log('3. Si los links se generan, cópialos y pégalos en el navegador')
  console.log('4. Verifica que te lleven a la página de pago correcta')
}

testPaymentLinks()
