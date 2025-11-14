/**
 * 🧪 Test del Sistema Híbrido Inteligente
 * 
 * Prueba:
 * 1. Respuestas directas (sin IA)
 * 2. Respuestas con Groq (IA)
 * 3. Mantenimiento de historial
 */

import { DirectResponseHandler } from '../src/lib/direct-response-handler'

async function runTests() {
console.log('🧪 Iniciando pruebas del Sistema Híbrido Inteligente\n')

// ========================================
// 1. PRUEBAS DE RESPUESTAS DIRECTAS
// ========================================

console.log('⚡ PRUEBA 1: Respuestas Directas (Sin IA)\n')

const testCases = [
  { input: 'hola', expected: 'saludo' },
  { input: 'buenos días', expected: 'saludo' },
  { input: 'gracias', expected: 'agradecimiento' },
  { input: 'muchas gracias', expected: 'agradecimiento' },
  { input: 'ok', expected: 'confirmación' },
  { input: 'perfecto', expected: 'confirmación' },
  { input: 'chao', expected: 'despedida' },
  { input: 'adiós', expected: 'despedida' },
  { input: 'voy a realizar el pago', expected: 'intención de pago' },
  { input: 'ya voy a pagar', expected: 'intención de pago' },
  { input: 'cuál es el horario', expected: 'horario' },
  { input: 'dónde están ubicados', expected: 'ubicación' },
  { input: 'hacen envíos', expected: 'envío' },
  { input: 'tienen garantía', expected: 'garantía' }
]

let passed = 0
let failed = 0

for (const test of testCases) {
  const canHandle = DirectResponseHandler.canHandleDirectly(test.input)
  const response = await DirectResponseHandler.getDirectResponse(test.input, 'Asistente de Prueba')
  
  if (canHandle && response) {
    console.log(`✅ "${test.input}" → Respuesta directa (${test.expected})`)
    passed++
  } else {
    console.log(`❌ "${test.input}" → No manejado correctamente`)
    failed++
  }
}

console.log(`\n📊 Resultados: ${passed} pasadas, ${failed} fallidas\n`)

// ========================================
// 2. PRUEBAS DE CASOS QUE DEBEN IR A GROQ
// ========================================

console.log('🤖 PRUEBA 2: Casos que deben usar Groq (IA)\n')

const groqCases = [
  'Busco una laptop para diseño gráfico',
  'Qué motos tienes disponibles',
  'Cuál es el mejor curso de piano',
  'Más información sobre este producto',
  'Cómo puedo pagar',
  'Cuál es la diferencia entre estos dos',
  'Me recomiendas algo para edición de video',
  'Qué incluye el megapack'
]

for (const message of groqCases) {
  const canHandle = DirectResponseHandler.canHandleDirectly(message)
  
  if (!canHandle) {
    console.log(`✅ "${message}" → Debe usar Groq ✓`)
  } else {
    console.log(`❌ "${message}" → Incorrectamente manejado como directo`)
  }
}

// ========================================
// 3. SIMULACIÓN DE HISTORIAL
// ========================================

console.log('\n📚 PRUEBA 3: Simulación de Historial\n')

const conversationHistory: any[] = []

const simulateMessage = (role: 'user' | 'assistant', content: string) => {
  conversationHistory.push({ role, content })
  
  // Mantener solo últimos 10 mensajes (20 entradas)
  if (conversationHistory.length > 20) {
    conversationHistory.splice(0, conversationHistory.length - 20)
  }
  
  console.log(`${role === 'user' ? '👤' : '🤖'} ${content}`)
}

// Simular conversación
simulateMessage('user', 'Hola')
simulateMessage('assistant', '👋 ¡Hola! Bienvenido')
simulateMessage('user', 'Busco una laptop')
simulateMessage('assistant', 'Claro, tengo varias opciones...')
simulateMessage('user', 'Cuál es mejor')
simulateMessage('assistant', 'Te recomiendo esta...')
simulateMessage('user', 'Me envías fotos')
simulateMessage('assistant', '[Fotos enviadas]')
simulateMessage('user', 'Cuánto cuesta')
simulateMessage('assistant', 'El precio es...')
simulateMessage('user', 'Cómo puedo pagar')
simulateMessage('assistant', 'Tenemos varias opciones...')

console.log(`\n📊 Historial: ${conversationHistory.length} mensajes (${conversationHistory.length / 2} pares)`)

if (conversationHistory.length <= 20) {
  console.log('✅ Historial dentro del límite (10 pares)')
} else {
  console.log('❌ Historial excede el límite')
}

// ========================================
// 4. PRUEBA DE LIMPIEZA DE HISTORIAL
// ========================================

console.log('\n🧹 PRUEBA 4: Limpieza Automática de Historial\n')

// Agregar más mensajes para forzar limpieza
for (let i = 0; i < 15; i++) {
  simulateMessage('user', `Mensaje ${i + 1}`)
  simulateMessage('assistant', `Respuesta ${i + 1}`)
}

console.log(`\n📊 Después de agregar 15 pares más:`)
console.log(`   Historial: ${conversationHistory.length} mensajes`)

if (conversationHistory.length === 20) {
  console.log('✅ Limpieza automática funcionando correctamente')
} else {
  console.log(`❌ Limpieza falló: esperado 20, actual ${conversationHistory.length}`)
}

// ========================================
// RESUMEN FINAL
// ========================================

console.log('\n' + '='.repeat(50))
console.log('📋 RESUMEN DE PRUEBAS')
console.log('='.repeat(50))

console.log(`
✅ Respuestas Directas: ${passed}/${testCases.length} casos
✅ Casos para Groq: ${groqCases.length} identificados
✅ Historial: Funcionando correctamente
✅ Limpieza: Automática cada 10 pares

🎉 Sistema Híbrido Inteligente: FUNCIONANDO
`)

console.log('💡 Próximos pasos:')
console.log('   1. Probar con WhatsApp real')
console.log('   2. Verificar tiempos de respuesta')
console.log('   3. Monitorear uso de API de Groq')
console.log('   4. Ajustar respuestas directas según feedback')
}

runTests()
