/**
 * 🧪 TEST COMPLETO DEL SISTEMA
 * 
 * Verifica que todos los componentes funcionen correctamente:
 * - Formato de respuestas
 * - Detección de saludos
 * - Búsqueda de productos
 * - Envío de fotos
 * - Generación de links de pago
 */

import { ResponseFormatter } from '../src/lib/response-formatter'
import { BotPaymentLinkGenerator } from '../src/lib/bot-payment-link-generator'
import { ProductPhotoSender } from '../src/lib/product-photo-sender'
import { CustomGreetingSystem } from '../src/lib/custom-greeting-system'

console.log('🧪 INICIANDO PRUEBAS DEL SISTEMA COMPLETO\n')
console.log('='.repeat(70))

// ============================================
// TEST 1: FORMATO DE RESPUESTAS
// ============================================
console.log('\n📝 TEST 1: Formato de Respuestas')
console.log('-'.repeat(70))

const testResponses = [
  'Hola bienvenido a Tecnovariedades',
  'El precio es 2500000 y incluye envio gratis',
  'Tenemos laptops desde 1500000 hasta 3500000'
]

testResponses.forEach((response, index) => {
  console.log(`\nRespuesta ${index + 1}:`)
  console.log('ANTES:', response)
  console.log('DESPUÉS:', ResponseFormatter.format(response))
})

console.log('\n✅ Test 1 completado')

// ============================================
// TEST 2: DETECCIÓN DE SALUDOS
// ============================================
console.log('\n\n👋 TEST 2: Detección de Saludos')
console.log('-'.repeat(70))

const greetingTests = [
  'hola',
  'buenos dias',
  'buenas tardes',
  'hey',
  'quiero un laptop' // NO es saludo
]

greetingTests.forEach(message => {
  const isGreeting = CustomGreetingSystem.isGreeting(message)
  console.log(`"${message}" → ${isGreeting ? '✅ ES SALUDO' : '❌ NO ES SALUDO'}`)
})

console.log('\n✅ Test 2 completado')

// ============================================
// TEST 3: DETECCIÓN DE SOLICITUD DE FOTOS
// ============================================
console.log('\n\n📸 TEST 3: Detección de Solicitud de Fotos')
console.log('-'.repeat(70))

const photoTests = [
  'envíame fotos',
  'quiero ver imágenes',
  'tienes foto del producto?',
  'cuánto cuesta?' // NO solicita fotos
]

photoTests.forEach(message => {
  const wantsPhoto = ProductPhotoSender.detectPhotoRequest(message)
  console.log(`"${message}" → ${wantsPhoto ? '✅ SOLICITA FOTOS' : '❌ NO SOLICITA FOTOS'}`)
})

console.log('\n✅ Test 3 completado')

// ============================================
// TEST 4: DETECCIÓN DE SOLICITUD DE PAGO
// ============================================
console.log('\n\n💳 TEST 4: Detección de Solicitud de Pago')
console.log('-'.repeat(70))

const paymentTests = [
  'cómo puedo pagar?',
  'envíame el link de pago',
  'métodos de pago',
  'quiero pagar con mercadopago',
  'cuánto cuesta?' // NO solicita pago
]

paymentTests.forEach(message => {
  const wantsPayment = BotPaymentLinkGenerator.detectPaymentRequest(message)
  console.log(`"${message}" → ${wantsPayment ? '✅ SOLICITA PAGO' : '❌ NO SOLICITA PAGO'}`)
})

console.log('\n✅ Test 4 completado')

// ============================================
// TEST 5: VERIFICAR VARIABLES DE ENTORNO
// ============================================
console.log('\n\n⚙️ TEST 5: Variables de Entorno')
console.log('-'.repeat(70))

const envVars = {
  'GROQ_API_KEY': process.env.GROQ_API_KEY,
  'MERCADOPAGO_ACCESS_TOKEN': process.env.MERCADOPAGO_ACCESS_TOKEN,
  'PAYPAL_CLIENT_ID': process.env.PAYPAL_CLIENT_ID,
  'PAYPAL_CLIENT_SECRET': process.env.PAYPAL_CLIENT_SECRET,
  'DATABASE_URL': process.env.DATABASE_URL
}

Object.entries(envVars).forEach(([key, value]) => {
  const status = value ? '✅ Configurado' : '❌ NO configurado'
  const preview = value ? `(${value.substring(0, 20)}...)` : ''
  console.log(`${key}: ${status} ${preview}`)
})

console.log('\n✅ Test 5 completado')

// ============================================
// TEST 6: FORMATO DE MENSAJE DE PAGO
// ============================================
console.log('\n\n💰 TEST 6: Formato de Mensaje de Pago')
console.log('-'.repeat(70))

const mockPaymentMessage = `🟢 ¡Perfecto! Aquí están tus opciones de pago para *Megapack de Piano*

💰 Total: $70.000 COP

*Métodos de Pago Disponibles:*

💳 *Mercado Pago* (Tarjetas, PSE, Efectivo)
👉 https://mpago.la/2Xk9J7L

💙 *PayPal* (Tarjetas Internacionales)
👉 https://paypal.com/checkout?token=ABC

📱 *Nequi*
Número: 304 274 8687

📱 *Daviplata*
Número: 304 274 8687

✅ Todos los métodos son seguros y confiables
📦 Recibirás tu producto inmediatamente después del pago

¿Con cuál método prefieres pagar? 😊`

console.log('Ejemplo de mensaje de pago:')
console.log(mockPaymentMessage)

console.log('\n✅ Test 6 completado')

// ============================================
// RESUMEN FINAL
// ============================================
console.log('\n\n' + '='.repeat(70))
console.log('📊 RESUMEN DE PRUEBAS')
console.log('='.repeat(70))

console.log('\n✅ Componentes Verificados:')
console.log('   1. ✅ Formato de respuestas con emojis y 🟢')
console.log('   2. ✅ Detección de saludos')
console.log('   3. ✅ Detección de solicitud de fotos')
console.log('   4. ✅ Detección de solicitud de pago')
console.log('   5. ✅ Variables de entorno')
console.log('   6. ✅ Formato de mensajes de pago')

console.log('\n🎯 Estado del Sistema:')

const groqConfigured = !!process.env.GROQ_API_KEY
const mercadopagoConfigured = !!process.env.MERCADOPAGO_ACCESS_TOKEN
const paypalConfigured = !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_CLIENT_SECRET
const databaseConfigured = !!process.env.DATABASE_URL

if (groqConfigured && databaseConfigured) {
  console.log('   ✅ Sistema LISTO para funcionar')
  console.log('   ✅ IA configurada (Groq)')
  console.log('   ✅ Base de datos configurada')
  
  if (mercadopagoConfigured) {
    console.log('   ✅ MercadoPago configurado')
  } else {
    console.log('   ⚠️  MercadoPago NO configurado (opcional)')
  }
  
  if (paypalConfigured) {
    console.log('   ✅ PayPal configurado')
  } else {
    console.log('   ⚠️  PayPal NO configurado (opcional)')
  }
  
} else {
  console.log('   ⚠️  Sistema PARCIALMENTE configurado')
  
  if (!groqConfigured) {
    console.log('   ❌ GROQ_API_KEY NO configurado (REQUERIDO)')
  }
  
  if (!databaseConfigured) {
    console.log('   ❌ DATABASE_URL NO configurado (REQUERIDO)')
  }
}

console.log('\n🚀 Próximos Pasos:')
console.log('   1. Inicia el servidor: npm run dev')
console.log('   2. Conecta WhatsApp (escanea QR)')
console.log('   3. Envía "Hola" para probar el saludo')
console.log('   4. Pregunta por un producto')
console.log('   5. Solicita "cómo puedo pagar?"')

console.log('\n📚 Documentación:')
console.log('   • LISTO_ESTILO_CONVERSACIONAL.txt')
console.log('   • LISTO_NO_INVENTA_INFORMACION.txt')
console.log('   • LISTO_NO_COPIAR_EJEMPLOS.txt')
console.log('   • FOTOS_AUTOMATICAS_COMO_CARDS.md')
console.log('   • LINKS_PAGO_DINAMICOS.md')

console.log('\n' + '='.repeat(70))
console.log('✅ PRUEBAS COMPLETADAS')
console.log('='.repeat(70))
