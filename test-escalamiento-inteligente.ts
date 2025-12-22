/**
 * 🚨 TEST: Sistema de Escalamiento Inteligente
 * 
 * Prueba el sistema que detecta cuándo una conversación necesita
 * intervención humana y genera mensajes apropiados.
 */

import { IntelligentEscalationSystem } from './src/lib/intelligent-escalation-system'

async function testEscalamiento() {
  console.log('🚨 INICIANDO TEST DE ESCALAMIENTO INTELIGENTE\n')
  console.log('='.repeat(60))

  // Test 1: Queja sobre producto defectuoso
  console.log('\n📋 TEST 1: Queja sobre producto defectuoso')
  console.log('-'.repeat(60))
  const test1 = await IntelligentEscalationSystem.shouldEscalate(
    'El portátil que me vendieron no funciona, se apaga solo y la pantalla tiene rayas. Quiero devolución del dinero YA!',
    [
      'Hola, compré un portátil hace 3 días',
      'Tiene problemas graves'
    ],
    0.7
  )
  console.log('Resultado:', test1)
  if (test1.shouldEscalate) {
    console.log('\n📨 Mensaje de escalamiento:')
    console.log(IntelligentEscalationSystem.generateEscalationMessage(test1))
  }

  // Test 2: Consulta técnica compleja
  console.log('\n\n📋 TEST 2: Consulta técnica compleja')
  console.log('-'.repeat(60))
  const test2 = await IntelligentEscalationSystem.shouldEscalate(
    'Necesito saber si el portátil ASUS ROG es compatible con virtualización VT-x y si puedo instalar VMware ESXi 7.0 con soporte para GPU passthrough',
    [
      'Hola, estoy buscando un portátil para desarrollo',
      'Necesito especificaciones muy específicas'
    ],
    0.5
  )
  console.log('Resultado:', test2)
  if (test2.shouldEscalate) {
    console.log('\n📨 Mensaje de escalamiento:')
    console.log(IntelligentEscalationSystem.generateEscalationMessage(test2))
  }

  // Test 3: Problema con pago
  console.log('\n\n📋 TEST 3: Problema con pago')
  console.log('-'.repeat(60))
  const test3 = await IntelligentEscalationSystem.shouldEscalate(
    'Ya pagué por MercadoPago hace 2 horas pero no me han enviado el producto. El pago aparece como aprobado en mi cuenta',
    [
      'Hola, hice un pago',
      'No he recibido nada'
    ],
    0.8
  )
  console.log('Resultado:', test3)
  if (test3.shouldEscalate) {
    console.log('\n📨 Mensaje de escalamiento:')
    console.log(IntelligentEscalationSystem.generateEscalationMessage(test3))
  }

  // Test 4: Consulta simple (NO debe escalar)
  console.log('\n\n📋 TEST 4: Consulta simple (NO debe escalar)')
  console.log('-'.repeat(60))
  const test4 = await IntelligentEscalationSystem.shouldEscalate(
    '¿Cuánto cuesta el curso de piano?',
    [],
    0.9
  )
  console.log('Resultado:', test4)
  if (test4.shouldEscalate) {
    console.log('\n📨 Mensaje de escalamiento:')
    console.log(IntelligentEscalationSystem.generateEscalationMessage(test4))
  } else {
    console.log('✅ Correctamente NO escalado (consulta simple)')
  }

  // Test 5: Solicitud de negociación
  console.log('\n\n📋 TEST 5: Solicitud de negociación')
  console.log('-'.repeat(60))
  const test5 = await IntelligentEscalationSystem.shouldEscalate(
    'Me interesa el portátil pero el precio está muy alto. ¿Pueden hacerme un descuento si compro 3 unidades para mi empresa?',
    [
      'Hola, estoy interesado en portátiles',
      'Necesito varios'
    ],
    0.7
  )
  console.log('Resultado:', test5)
  if (test5.shouldEscalate) {
    console.log('\n📨 Mensaje de escalamiento:')
    console.log(IntelligentEscalationSystem.generateEscalationMessage(test5))
  }

  // Test 6: Frustración del cliente
  console.log('\n\n📋 TEST 6: Frustración del cliente')
  console.log('-'.repeat(60))
  const test6 = await IntelligentEscalationSystem.shouldEscalate(
    'Ya les pregunté 3 veces y no me responden bien. Esto es un pésimo servicio!',
    [
      '¿Tienen el portátil disponible?',
      'Hola?',
      'Nadie me responde'
    ],
    0.6
  )
  console.log('Resultado:', test6)
  if (test6.shouldEscalate) {
    console.log('\n📨 Mensaje de escalamiento:')
    console.log(IntelligentEscalationSystem.generateEscalationMessage(test6))
  }

  // Test 7: Solicitud de garantía
  console.log('\n\n📋 TEST 7: Solicitud de garantía')
  console.log('-'.repeat(60))
  const test7 = await IntelligentEscalationSystem.shouldEscalate(
    'El portátil tiene 8 meses de uso y se dañó la tarjeta gráfica. ¿Cómo hago válida la garantía?',
    [
      'Hola, tengo un problema con mi compra'
    ],
    0.7
  )
  console.log('Resultado:', test7)
  if (test7.shouldEscalate) {
    console.log('\n📨 Mensaje de escalamiento:')
    console.log(IntelligentEscalationSystem.generateEscalationMessage(test7))
  }

  // Test 8: Baja confianza en respuesta
  console.log('\n\n📋 TEST 8: Baja confianza en respuesta del bot')
  console.log('-'.repeat(60))
  const test8 = await IntelligentEscalationSystem.shouldEscalate(
    '¿Tienen disponible el modelo XYZ-123 con las especificaciones ABC?',
    [],
    0.3 // Confianza muy baja
  )
  console.log('Resultado:', test8)
  if (test8.shouldEscalate) {
    console.log('\n📨 Mensaje de escalamiento:')
    console.log(IntelligentEscalationSystem.generateEscalationMessage(test8))
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ TEST COMPLETADO')
}

// Ejecutar test
testEscalamiento().catch(console.error)
