/**
 * 🧪 TEST COMPLETO DEL SISTEMA
 * Verifica todos los componentes críticos
 */

import { ProfessionalConversationMemory } from '../src/lib/professional-conversation-memory'
import { IntelligentPaymentDetector } from '../src/lib/intelligent-payment-detector'
import { ConversationContextService } from '../src/lib/conversation-context-service'

console.log('🧪 INICIANDO TESTS DEL SISTEMA\n')
console.log('=' .repeat(60))

// Test 1: Memoria Profesional
console.log('\n📋 TEST 1: Memoria Profesional')
console.log('-'.repeat(60))

const testKey = 'test-user:test-phone'

// Inicializar memoria
ProfessionalConversationMemory.initMemory(testKey)
console.log('✅ Memoria inicializada')

// Guardar producto
ProfessionalConversationMemory.setCurrentProduct(
  testKey,
  'test-id-123',
  'Mega Pack 08: Cursos Idiomas',
  20000,
  'DIGITAL'
)
console.log('✅ Producto guardado en memoria')

// Recuperar memoria
const memory = ProfessionalConversationMemory.getMemory(testKey)
if (memory && memory.currentProduct) {
  console.log(`✅ Producto recuperado: ${memory.currentProduct.name}`)
  console.log(`   ID: ${memory.currentProduct.id}`)
  console.log(`   Precio: ${memory.currentProduct.price}`)
} else {
  console.log('❌ ERROR: No se pudo recuperar la memoria')
}

// Test 2: Detección de Pagos
console.log('\n📋 TEST 2: Detección de Pagos')
console.log('-'.repeat(60))

const testCases = [
  { msg: '¿Cuáles métodos de pago tienes?', esperado: false, tipo: 'PREGUNTA' },
  { msg: '¿Cómo puedo pagar?', esperado: false, tipo: 'PREGUNTA' },
  { msg: 'Dame el link de pago', esperado: true, tipo: 'SOLICITUD' },
  { msg: 'Quiero pagar', esperado: true, tipo: 'SOLICITUD' },
  { msg: 'Métodos de pago', esperado: false, tipo: 'PREGUNTA' },
  { msg: 'Envíame el enlace', esperado: true, tipo: 'SOLICITUD' },
]

testCases.forEach(test => {
  const resultado = IntelligentPaymentDetector.quickDetect(test.msg)
  const correcto = resultado === test.esperado
  const emoji = correcto ? '✅' : '❌'
  
  console.log(`${emoji} "${test.msg}"`)
  console.log(`   Tipo: ${test.tipo}`)
  console.log(`   Esperado: ${test.esperado ? 'SOLICITUD' : 'PREGUNTA'}`)
  console.log(`   Resultado: ${resultado ? 'SOLICITUD' : 'PREGUNTA'}`)
  
  if (!correcto) {
    console.log(`   ⚠️ ERROR: Detección incorrecta!`)
  }
  console.log()
})

// Test 3: Contexto de Conversación
console.log('\n📋 TEST 3: Contexto de Conversación')
console.log('-'.repeat(60))

const testKey2 = 'test-user-2:test-phone-2'

// Guardar en contexto
ConversationContextService.setProductContext(
  testKey2,
  'product-456',
  'Curso de Piano'
)
console.log('✅ Producto guardado en contexto')

// Recuperar contexto
const context = ConversationContextService.getProductContext(testKey2)
if (context) {
  console.log(`✅ Contexto recuperado: ${context.lastProductName}`)
  console.log(`   ID: ${context.lastProductId}`)
  console.log(`   Mensajes: ${context.messageCount}`)
} else {
  console.log('❌ ERROR: No se pudo recuperar el contexto')
}

// Resumen Final
console.log('\n' + '='.repeat(60))
console.log('📊 RESUMEN DE TESTS')
console.log('='.repeat(60))

const memoryOk = memory && memory.currentProduct !== null
const contextOk = context !== null
const paymentOk = testCases.filter(t => {
  const r = IntelligentPaymentDetector.quickDetect(t.msg)
  return r === t.esperado
}).length === testCases.length

console.log(`Memoria Profesional: ${memoryOk ? '✅ OK' : '❌ FALLO'}`)
console.log(`Contexto de Conversación: ${contextOk ? '✅ OK' : '❌ FALLO'}`)
console.log(`Detección de Pagos: ${paymentOk ? '✅ OK' : '❌ FALLO'}`)

if (memoryOk && contextOk && paymentOk) {
  console.log('\n🎉 TODOS LOS TESTS PASARON')
} else {
  console.log('\n⚠️ ALGUNOS TESTS FALLARON - Revisar arriba')
}

console.log('\n' + '='.repeat(60))
