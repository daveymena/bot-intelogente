/**
 * 🧪 Test de Detección de Intención de Pago
 */

import { DirectResponseHandler } from '../src/lib/direct-response-handler'

console.log('🧪 Probando detección de intención de pago\n')

const testCases = [
  // NO debe detectar (solicitudes de información)
  { input: 'dame el link de pago', shouldDetect: false },
  { input: 'cómo puedo pagar', shouldDetect: false },
  { input: 'qué métodos de pago tienen', shouldDetect: false },
  { input: 'envíame el link', shouldDetect: false },
  { input: 'aceptan nequi', shouldDetect: false },
  { input: 'información de pago', shouldDetect: false },
  
  // SÍ debe detectar (intención de pagar)
  { input: 'voy a realizar el pago', shouldDetect: true },
  { input: 'ya voy a pagar', shouldDetect: true },
  { input: 'voy a pagar ahora', shouldDetect: true },
  { input: 'procedo con el pago', shouldDetect: true },
  { input: 'listo, voy a pagar', shouldDetect: true },
  { input: 'ya pago', shouldDetect: true }
]

let passed = 0
let failed = 0

console.log('📋 Casos que NO deben detectarse (solicitudes de info):\n')

for (const test of testCases.filter(t => !t.shouldDetect)) {
  const detected = DirectResponseHandler.canHandleDirectly(test.input)
  
  if (!detected) {
    console.log(`✅ "${test.input}" → Correctamente NO detectado`)
    passed++
  } else {
    console.log(`❌ "${test.input}" → Incorrectamente detectado`)
    failed++
  }
}

console.log('\n📋 Casos que SÍ deben detectarse (intención de pagar):\n')

for (const test of testCases.filter(t => t.shouldDetect)) {
  const detected = DirectResponseHandler.canHandleDirectly(test.input)
  
  if (detected) {
    console.log(`✅ "${test.input}" → Correctamente detectado`)
    passed++
  } else {
    console.log(`❌ "${test.input}" → Incorrectamente NO detectado`)
    failed++
  }
}

console.log(`\n📊 Resultado: ${passed} pasadas, ${failed} fallidas`)

if (failed === 0) {
  console.log('🎉 ¡Todas las pruebas pasaron!')
} else {
  console.log('⚠️  Algunas pruebas fallaron')
}
