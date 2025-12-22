// Script para probar credenciales de pago
import 'dotenv/config'

console.log('🔐 Verificando Credenciales de Pago\n')
console.log('=' .repeat(60))

// Verificar Mercado Pago
console.log('\n💳 MERCADO PAGO:')
console.log('─'.repeat(60))

const mpPublicKey = process.env.MERCADO_PAGO_PUBLIC_KEY
const mpAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
const mpClientId = process.env.MERCADO_PAGO_CLIENT_ID

if (mpPublicKey && mpAccessToken && mpClientId) {
  console.log('✅ Public Key:', mpPublicKey.substring(0, 20) + '...')
  console.log('✅ Access Token:', mpAccessToken.substring(0, 20) + '...')
  console.log('✅ Client ID:', mpClientId)
  console.log('✅ Estado: CONFIGURADO')
  
  // Probar conexión con Mercado Pago
  console.log('\n🔍 Probando conexión con Mercado Pago...')
  
  fetch('https://api.mercadopago.com/v1/payment_methods', {
    headers: {
      'Authorization': `Bearer ${mpAccessToken}`
    }
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      console.log('❌ Error:', data.message)
    } else {
      console.log('✅ Conexión exitosa!')
      console.log(`✅ Métodos de pago disponibles: ${data.length}`)
      console.log('\n📋 Algunos métodos:')
      data.slice(0, 5).forEach((method: any) => {
        console.log(`   - ${method.name} (${method.id})`)
      })
    }
  })
  .catch(err => {
    console.log('❌ Error de conexión:', err.message)
  })
} else {
  console.log('❌ Credenciales NO configuradas')
}

// Verificar PayPal
console.log('\n\n💰 PAYPAL:')
console.log('─'.repeat(60))

const ppClientId = process.env.PAYPAL_CLIENT_ID
const ppClientSecret = process.env.PAYPAL_CLIENT_SECRET
const ppMode = process.env.PAYPAL_MODE || 'sandbox'

if (ppClientId && ppClientSecret) {
  console.log('✅ Client ID:', ppClientId.substring(0, 20) + '...')
  console.log('✅ Client Secret:', ppClientSecret.substring(0, 20) + '...')
  console.log('✅ Modo:', ppMode.toUpperCase())
  console.log('✅ Estado: CONFIGURADO')
  
  // Probar conexión con PayPal
  console.log('\n🔍 Probando conexión con PayPal...')
  
  const ppBaseUrl = ppMode === 'live' 
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
  
  // Obtener token de acceso
  const auth = Buffer.from(`${ppClientId}:${ppClientSecret}`).toString('base64')
  
  fetch(`${ppBaseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      console.log('❌ Error:', data.error_description)
    } else {
      console.log('✅ Conexión exitosa!')
      console.log('✅ Token obtenido:', data.access_token.substring(0, 20) + '...')
      console.log('✅ Expira en:', data.expires_in, 'segundos')
      console.log('✅ Scope:', data.scope)
    }
  })
  .catch(err => {
    console.log('❌ Error de conexión:', err.message)
  })
} else {
  console.log('❌ Credenciales NO configuradas')
}

console.log('\n' + '='.repeat(60))
console.log('\n💡 Nota: Si ves ✅ en ambos, las credenciales están correctas')
console.log('   y puedes procesar pagos reales.\n')
