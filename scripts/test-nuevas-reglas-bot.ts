/**
 * Script de prueba para las nuevas reglas del bot
 * Verifica que el bot responda correctamente según las instrucciones
 */

import { getIntelligentEngine } from '../src/lib/intelligent-conversation-engine'

const TEST_USER_ID = 'test-user-123'
const TEST_CHAT_ID = 'test-chat-nuevas-reglas'

async function testNuevasReglas() {
  console.log('🧪 ========================================')
  console.log('🧪 PRUEBA DE NUEVAS REGLAS DEL BOT')
  console.log('🧪 ========================================\n')

  const engine = getIntelligentEngine()

  // Test 1: Pregunta por curso específico (NO debe ofrecer otros)
  console.log('📝 Test 1: Pregunta por curso específico')
  console.log('Mensaje: "Hola, tienes el curso de piano?"')
  console.log('Esperado: Información SOLO del curso de piano, sin mencionar otros\n')
  
  const response1 = await engine.processMessage({
    chatId: TEST_CHAT_ID + '-1',
    userName: 'Cliente Test',
    message: 'Hola, tienes el curso de piano?',
    userId: TEST_USER_ID
  })
  
  console.log('✅ Respuesta del bot:')
  console.log(response1.text)
  console.log('\n' + '='.repeat(80) + '\n')

  // Test 2: Pregunta general sobre categoría (DEBE preguntar antes de mostrar)
  console.log('📝 Test 2: Pregunta general sobre categoría')
  console.log('Mensaje: "Tienes laptops?"')
  console.log('Esperado: Pregunta sobre qué tipo busca (económico, potente, etc.)\n')
  
  const response2 = await engine.processMessage({
    chatId: TEST_CHAT_ID + '-2',
    userName: 'Cliente Test',
    message: 'Tienes laptops?',
    userId: TEST_USER_ID
  })
  
  console.log('✅ Respuesta del bot:')
  console.log(response2.text)
  console.log('\n' + '='.repeat(80) + '\n')

  // Test 3: Megapack completo (debe reconocer variaciones)
  console.log('📝 Test 3: Megapack completo')
  console.log('Mensaje: "Quiero el super megapack"')
  console.log('Esperado: Información del megapack de 40 cursos ($60.000 COP)\n')
  
  const response3 = await engine.processMessage({
    chatId: TEST_CHAT_ID + '-3',
    userName: 'Cliente Test',
    message: 'Quiero el super megapack',
    userId: TEST_USER_ID
  })
  
  console.log('✅ Respuesta del bot:')
  console.log(response3.text)
  console.log('\n' + '='.repeat(80) + '\n')

  // Test 4: Solicitud de más información (debe dar descripción completa)
  console.log('📝 Test 4: Solicitud de más información')
  console.log('Mensaje 1: "Info del curso de piano"')
  console.log('Mensaje 2: "Dame más información"')
  console.log('Esperado: Descripción COMPLETA del curso\n')
  
  const chatId4 = TEST_CHAT_ID + '-4'
  
  await engine.processMessage({
    chatId: chatId4,
    userName: 'Cliente Test',
    message: 'Info del curso de piano',
    userId: TEST_USER_ID
  })
  
  const response4 = await engine.processMessage({
    chatId: chatId4,
    userName: 'Cliente Test',
    message: 'Dame más información',
    userId: TEST_USER_ID
  })
  
  console.log('✅ Respuesta del bot:')
  console.log(response4.text)
  console.log('\n' + '='.repeat(80) + '\n')

  // Test 5: Servicio técnico (debe preguntar qué necesita)
  console.log('📝 Test 5: Servicio técnico')
  console.log('Mensaje: "Necesito reparación"')
  console.log('Esperado: Pregunta sobre qué producto o servicio necesita\n')
  
  const response5 = await engine.processMessage({
    chatId: TEST_CHAT_ID + '-5',
    userName: 'Cliente Test',
    message: 'Necesito reparación',
    userId: TEST_USER_ID
  })
  
  console.log('✅ Respuesta del bot:')
  console.log(response5.text)
  console.log('\n' + '='.repeat(80) + '\n')

  // Test 6: Producto específico (NO debe ofrecer otros)
  console.log('📝 Test 6: Producto específico')
  console.log('Mensaje: "Cuánto cuesta la MacBook?"')
  console.log('Esperado: Precio y descripción SOLO de MacBook, sin mencionar otros laptops\n')
  
  const response6 = await engine.processMessage({
    chatId: TEST_CHAT_ID + '-6',
    userName: 'Cliente Test',
    message: 'Cuánto cuesta la MacBook?',
    userId: TEST_USER_ID
  })
  
  console.log('✅ Respuesta del bot:')
  console.log(response6.text)
  console.log('\n' + '='.repeat(80) + '\n')

  console.log('🎉 ========================================')
  console.log('🎉 PRUEBAS COMPLETADAS')
  console.log('🎉 ========================================')
  console.log('\n📋 Revisa las respuestas arriba para verificar que cumplan con las reglas:')
  console.log('   1. Curso específico → Solo ese curso, no otros')
  console.log('   2. Pregunta general → Pregunta antes de mostrar')
  console.log('   3. Megapack → Reconoce variaciones')
  console.log('   4. Más información → Descripción completa')
  console.log('   5. Servicio técnico → Pregunta qué necesita')
  console.log('   6. Producto específico → Solo ese producto')
}

// Ejecutar pruebas
testNuevasReglas().catch(console.error)
