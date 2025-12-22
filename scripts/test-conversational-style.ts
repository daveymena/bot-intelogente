/**
 * 🧪 TEST: Estilo Conversacional Natural
 * 
 * Prueba el nuevo estilo conversacional con 🟢
 */

import { ResponseFormatter } from '../src/lib/response-formatter'

console.log('🧪 PROBANDO ESTILO CONVERSACIONAL\n')
console.log('='.repeat(60))

// Test 1: Respuesta con precio
console.log('\n📝 Test 1: Respuesta con Precio')
console.log('-'.repeat(60))
const priceResponse = 'El Megapack de Piano está en oferta especial por $70. Es un infoproducto digital completo.'
console.log('ANTES:')
console.log(priceResponse)
console.log('\nDESPUÉS:')
console.log(ResponseFormatter.format(priceResponse))

// Test 2: Respuesta con beneficios
console.log('\n\n📝 Test 2: Respuesta con Beneficios')
console.log('-'.repeat(60))
const benefitsResponse = 'Incluye: Curso completo en video. Guías PDF de teoría musical. Ejercicios prácticos. Partituras descargables.'
console.log('ANTES:')
console.log(benefitsResponse)
console.log('\nDESPUÉS:')
console.log(ResponseFormatter.format(benefitsResponse))

// Test 3: Respuesta con lista
console.log('\n\n📝 Test 3: Respuesta con Lista')
console.log('-'.repeat(60))
const listResponse = 'Tenemos estas opciones: 1. Laptop ASUS VivoBook - $2.500.000. 2. Lenovo IdeaPad 3 - $2.800.000. 3. HP Pavilion - $3.200.000.'
console.log('ANTES:')
console.log(listResponse)
console.log('\nDESPUÉS:')
console.log(ResponseFormatter.format(listResponse))

// Test 4: Respuesta con métodos de pago
console.log('\n\n📝 Test 4: Respuesta con Métodos de Pago')
console.log('-'.repeat(60))
const paymentResponse = 'Puedes hacer el pago por tarjeta o transferencia segura. También aceptamos Nequi y Daviplata.'
console.log('ANTES:')
console.log(paymentResponse)
console.log('\nDESPUÉS:')
console.log(ResponseFormatter.format(paymentResponse))

// Test 5: Saludo
console.log('\n\n📝 Test 5: Saludo')
console.log('-'.repeat(60))
const greeting = 'Hola! Que gusto saludarte. Gracias por contactar a Tecnovariedades D&S.'
console.log('ANTES:')
console.log(greeting)
console.log('\nDESPUÉS:')
console.log(ResponseFormatter.format(greeting))

console.log('\n\n' + '='.repeat(60))
console.log('✅ PRUEBAS COMPLETADAS')
console.log('='.repeat(60))
console.log('\n💡 Verifica que las respuestas tengan:')
console.log('   ✅ 🟢 antes de información clave')
console.log('   ✅ • para viñetas (no 🔹)')
console.log('   ✅ Emojis relevantes')
console.log('   ✅ Formato limpio y conversacional')
console.log('   ✅ Pregunta al final')
