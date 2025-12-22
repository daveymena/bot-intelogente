/**
 * 🧪 TEST: Response Formatter
 * 
 * Prueba el formateador de respuestas para verificar que agrega
 * emojis, viñetas y formato correctamente
 */

import { ResponseFormatter } from '../src/lib/response-formatter'

console.log('🧪 PROBANDO FORMATEADOR DE RESPUESTAS\n')
console.log('='.repeat(60))

// Test 1: Saludo simple
console.log('\n📝 Test 1: Saludo Simple')
console.log('-'.repeat(60))
const greeting = 'Hola bienvenido a Tecnovariedades. Soy Laura tu asesora de ventas. En que puedo ayudarte.'
console.log('ANTES:')
console.log(greeting)
console.log('\nDESPUÉS:')
console.log(ResponseFormatter.format(greeting))

// Test 2: Respuesta con producto
console.log('\n\n📝 Test 2: Respuesta con Producto')
console.log('-'.repeat(60))
const productResponse = 'Tenemos el laptop ASUS VivoBook con Intel Core i5, 8GB RAM y 512GB SSD. Precio 2500000 COP. Incluye envio gratis y garantia de 1 año.'
console.log('ANTES:')
console.log(productResponse)
console.log('\nDESPUÉS:')
console.log(ResponseFormatter.format(productResponse))

// Test 3: Lista con características
console.log('\n\n📝 Test 3: Lista con Características')
console.log('-'.repeat(60))
const listResponse = 'El laptop incluye: 1. Procesador Intel Core i5. 2. 8GB de RAM. 3. Disco SSD de 512GB. 4. Pantalla Full HD. 5. Garantia de 1 año.'
console.log('ANTES:')
console.log(listResponse)
console.log('\nDESPUÉS:')
console.log(ResponseFormatter.format(listResponse))

// Test 4: Respuesta con precios
console.log('\n\n📝 Test 4: Respuesta con Precios')
console.log('-'.repeat(60))
const priceResponse = 'Tenemos laptops desde $1500000 hasta $3500000. El envio es gratis en todos los productos. La garantia es de 1 año.'
console.log('ANTES:')
console.log(priceResponse)
console.log('\nDESPUÉS:')
console.log(ResponseFormatter.format(priceResponse))

// Test 5: Respuesta de producto específico
console.log('\n\n📝 Test 5: Formato de Producto Específico')
console.log('-'.repeat(60))
const specificProduct = ResponseFormatter.formatProductResponse(
  'ASUS VivoBook 15',
  2500000,
  'Laptop ideal para trabajo y estudio con procesador Intel Core i5 de 11va generación'
)
console.log(specificProduct)

// Test 6: Respuesta de objeción de precio
console.log('\n\n📝 Test 6: Formato de Objeción de Precio')
console.log('-'.repeat(60))
const priceObjection = ResponseFormatter.formatPriceObjectionResponse(
  'ASUS VivoBook 15',
  [
    'Procesador de última generación',
    'Garantía de 1 año',
    'Envío gratis',
    'Soporte técnico incluido'
  ]
)
console.log(priceObjection)

console.log('\n\n' + '='.repeat(60))
console.log('✅ PRUEBAS COMPLETADAS')
console.log('='.repeat(60))
console.log('\n💡 Verifica que todas las respuestas tengan:')
console.log('   ✅ Emojis relevantes (👋 😊 💰 🎁 ✨)')
console.log('   ✅ Viñetas organizadas (•)')
console.log('   ✅ Saltos de línea claros')
console.log('   ✅ Formato profesional')
