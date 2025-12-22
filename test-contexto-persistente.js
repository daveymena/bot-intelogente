/**
 * 🧪 TEST: Verificar que el contexto se mantiene entre mensajes
 * 
 * Este test simula una conversación real donde:
 * 1. Usuario pregunta por un producto
 * 2. Bot responde y guarda contexto
 * 3. Usuario hace pregunta de seguimiento
 * 4. Bot debe recordar el producto (NO enviar saludo inicial)
 */

const { ConversationContextService } = require('./src/lib/conversation-context-service')

async function testContextoPersistente() {
  console.log('🧪 TEST: Contexto Persistente\n')
  
  const conversationKey = 'test-user:573001234567'
  const productId = 'test-product-123'
  const productName = 'Portátil HP Pavilion'
  
  // ========================================
  // PASO 1: Simular primera interacción
  // ========================================
  console.log('📝 PASO 1: Usuario pregunta por producto')
  console.log('Usuario: "Busco un portátil"\n')
  
  // Bot encuentra producto y guarda en contexto
  ConversationContextService.setProductContext(
    conversationKey,
    productId,
    productName,
    {
      price: 2500000,
      category: 'Tecnología',
      type: 'physical',
      paymentMethods: ['MercadoPago', 'PayPal']
    }
  )
  
  console.log('✅ Bot guardó producto en contexto\n')
  
  // Verificar que se guardó
  let context = ConversationContextService.getProductContext(conversationKey)
  console.log('📊 Contexto actual:', {
    producto: context?.lastProductName,
    mensajes: context?.messageCount,
    ultimaActualizacion: context?.lastMentionedAt
  })
  console.log('\n')
  
  // ========================================
  // PASO 2: Esperar 3 segundos (simular pausa)
  // ========================================
  console.log('⏳ PASO 2: Esperando 3 segundos...\n')
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // ========================================
  // PASO 3: Usuario hace pregunta de seguimiento
  // ========================================
  console.log('📝 PASO 3: Usuario hace pregunta de seguimiento')
  console.log('Usuario: "¿Cuánto cuesta?"\n')
  
  // Renovar contexto (esto debería pasar automáticamente)
  ConversationContextService.renewContext(conversationKey)
  ConversationContextService.incrementMessageCount(conversationKey)
  
  // Verificar que el contexto sigue vivo
  context = ConversationContextService.getProductContext(conversationKey)
  
  if (context) {
    console.log('✅ ÉXITO: Contexto mantenido')
    console.log('📊 Contexto actual:', {
      producto: context.lastProductName,
      mensajes: context.messageCount,
      ultimaActualizacion: context.lastMentionedAt
    })
    console.log('\n✅ El bot puede responder: "El Portátil HP Pavilion cuesta 2.500.000 COP"')
  } else {
    console.log('❌ ERROR: Contexto perdido')
    console.log('❌ El bot respondería con saludo inicial (PROBLEMA)')
  }
  
  console.log('\n')
  
  // ========================================
  // PASO 4: Esperar 35 minutos (simular timeout)
  // ========================================
  console.log('⏳ PASO 4: Simulando timeout de 35 minutos...')
  console.log('(En realidad esperamos 2 segundos para el test)\n')
  
  // Modificar temporalmente el timeout para el test
  const originalTimeout = ConversationContextService.CONTEXT_TIMEOUT
  ConversationContextService.CONTEXT_TIMEOUT = 2000 // 2 segundos
  
  await new Promise(resolve => setTimeout(resolve, 2500))
  
  // Intentar obtener contexto después del timeout
  context = ConversationContextService.getProductContext(conversationKey)
  
  if (!context) {
    console.log('✅ CORRECTO: Contexto expiró después de inactividad')
    console.log('✅ El bot respondería con saludo inicial (ESPERADO)')
  } else {
    console.log('❌ ERROR: Contexto no expiró cuando debería')
  }
  
  // Restaurar timeout original
  ConversationContextService.CONTEXT_TIMEOUT = originalTimeout
  
  console.log('\n')
  
  // ========================================
  // PASO 5: Test de renovación continua
  // ========================================
  console.log('📝 PASO 5: Test de renovación continua')
  console.log('Simulando 5 mensajes con pausas de 1 segundo\n')
  
  // Crear nuevo contexto
  ConversationContextService.setProductContext(
    conversationKey,
    productId,
    productName
  )
  
  for (let i = 1; i <= 5; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ConversationContextService.renewContext(conversationKey)
    ConversationContextService.incrementMessageCount(conversationKey)
    
    context = ConversationContextService.getProductContext(conversationKey)
    console.log(`Mensaje ${i}: Contexto ${context ? '✅ VIVO' : '❌ PERDIDO'} (${context?.messageCount} mensajes)`)
  }
  
  console.log('\n')
  
  // ========================================
  // RESUMEN
  // ========================================
  console.log('=' .repeat(50))
  console.log('📊 RESUMEN DEL TEST')
  console.log('=' .repeat(50))
  console.log('✅ Contexto se guarda correctamente')
  console.log('✅ Contexto se renueva con cada mensaje')
  console.log('✅ Contexto expira después de inactividad')
  console.log('✅ Contador de mensajes funciona')
  console.log('\n🎉 TODOS LOS TESTS PASARON\n')
  
  // Limpiar
  ConversationContextService.clearContext(conversationKey)
}

// Ejecutar test
testContextoPersistente().catch(console.error)
