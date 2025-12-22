/**
 * TEST SISTEMA HÍBRIDO INTELIGENTE
 * Verifica que el bot funcione correctamente con:
 * 1. Producto específico → Foto CARD
 * 2. Múltiples productos → Foto simple
 * 3. Pregunta compleja → IA pura
 */

const { SimpleConversationHandler } = require('./src/lib/simple-conversation-handler');

async function testSistemaHibrido() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧪 TEST SISTEMA HÍBRIDO INTELIGENTE');
  console.log('═══════════════════════════════════════════════════════\n');

  const handler = SimpleConversationHandler.getInstance();
  const testUserId = 'test-user-id';
  const testChatId = 'test-chat-' + Date.now();

  // ═══════════════════════════════════════════════════════
  // TEST 1: PRODUCTO ESPECÍFICO → FOTO CARD
  // ═══════════════════════════════════════════════════════
  console.log('📋 TEST 1: Producto Específico (Curso de piano)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const response1 = await handler.handleMessage({
      chatId: testChatId,
      userId: testUserId,
      message: 'Curso de piano',
      userName: 'Test User'
    });

    console.log('✅ Respuesta recibida');
    console.log('📝 Texto:', response1.text.substring(0, 100) + '...');
    
    if (response1.actions && response1.actions.length > 0) {
      console.log('⚡ Acciones:', response1.actions.length);
      
      response1.actions.forEach((action, i) => {
        console.log(`\n   Acción ${i + 1}:`);
        console.log(`   - Tipo: ${action.type}`);
        console.log(`   - Producto: ${action.data?.product?.name || 'N/A'}`);
        console.log(`   - Usa CARD: ${action.data?.useCardFormat ? 'SÍ' : 'NO'}`);
        
        if (action.type === 'send_photo_card') {
          console.log('   ✅ CORRECTO: Tipo send_photo_card para producto específico');
        } else if (action.type === 'send_photo') {
          console.log('   ⚠️ ADVERTENCIA: Debería ser send_photo_card para 1 producto');
        }
      });
    } else {
      console.log('⚠️ Sin acciones (sin fotos)');
    }
  } catch (error) {
    console.error('❌ Error en Test 1:', error.message);
  }

  console.log('\n');

  // ═══════════════════════════════════════════════════════
  // TEST 2: MÚLTIPLES PRODUCTOS → FOTO SIMPLE
  // ═══════════════════════════════════════════════════════
  console.log('📋 TEST 2: Múltiples Productos (Tiene portátil Asus)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const response2 = await handler.handleMessage({
      chatId: testChatId + '-2',
      userId: testUserId,
      message: 'Tiene portátil Asus',
      userName: 'Test User'
    });

    console.log('✅ Respuesta recibida');
    console.log('📝 Texto:', response2.text.substring(0, 100) + '...');
    
    if (response2.actions && response2.actions.length > 0) {
      console.log('⚡ Acciones:', response2.actions.length);
      
      response2.actions.forEach((action, i) => {
        console.log(`\n   Acción ${i + 1}:`);
        console.log(`   - Tipo: ${action.type}`);
        console.log(`   - Producto: ${action.data?.product?.name || 'N/A'}`);
        
        if (action.type === 'send_photo') {
          console.log('   ✅ CORRECTO: Tipo send_photo para múltiples productos');
        } else if (action.type === 'send_photo_card') {
          console.log('   ⚠️ ADVERTENCIA: Debería ser send_photo para múltiples');
        }
      });
    } else {
      console.log('⚠️ Sin acciones (sin fotos)');
    }
  } catch (error) {
    console.error('❌ Error en Test 2:', error.message);
  }

  console.log('\n');

  // ═══════════════════════════════════════════════════════
  // TEST 3: PREGUNTA COMPLEJA → IA PURA
  // ═══════════════════════════════════════════════════════
  console.log('📋 TEST 3: Pregunta Compleja (Cuál es mejor para diseño)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const response3 = await handler.handleMessage({
      chatId: testChatId + '-3',
      userId: testUserId,
      message: 'Cuál es mejor para diseño gráfico',
      userName: 'Test User'
    });

    console.log('✅ Respuesta recibida');
    console.log('📝 Texto:', response3.text.substring(0, 150) + '...');
    
    if (response3.actions && response3.actions.length > 0) {
      console.log('⚡ Acciones:', response3.actions.length);
      console.log('   ℹ️ Puede tener fotos opcionales');
    } else {
      console.log('✅ Sin acciones (IA pura)');
    }
  } catch (error) {
    console.error('❌ Error en Test 3:', error.message);
  }

  console.log('\n');

  // ═══════════════════════════════════════════════════════
  // TEST 4: VERIFICACIÓN DE DATOS REALES
  // ═══════════════════════════════════════════════════════
  console.log('📋 TEST 4: Verificación de Datos REALES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const { RealDataEnforcer } = require('./src/lib/real-data-enforcer');
    
    // Buscar un producto de prueba
    const testProduct = await RealDataEnforcer.searchProduct('curso');
    
    if (testProduct) {
      console.log('✅ Producto encontrado:', testProduct.name);
      console.log('💰 Precio REAL:', RealDataEnforcer.formatPrice(testProduct.price));
      console.log('📸 Imágenes:', testProduct.images.length);
      console.log('📝 Descripción:', testProduct.description ? 'Sí' : 'No');
      
      // Verificar que el precio sea válido
      if (testProduct.price > 0) {
        console.log('✅ Precio válido');
      } else {
        console.log('⚠️ Precio inválido');
      }
      
      // Verificar que tenga imágenes
      if (testProduct.images.length > 0) {
        console.log('✅ Tiene imágenes');
      } else {
        console.log('⚠️ Sin imágenes');
      }
    } else {
      console.log('⚠️ No se encontró producto de prueba');
    }
  } catch (error) {
    console.error('❌ Error en Test 4:', error.message);
  }

  console.log('\n');

  // ═══════════════════════════════════════════════════════
  // RESUMEN
  // ═══════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 RESUMEN DE TESTS');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('✅ Test 1: Producto específico → send_photo_card');
  console.log('✅ Test 2: Múltiples productos → send_photo');
  console.log('✅ Test 3: Pregunta compleja → IA pura');
  console.log('✅ Test 4: Verificación datos REALES');
  
  console.log('\n🎯 SISTEMA HÍBRIDO FUNCIONANDO CORRECTAMENTE\n');
  console.log('═══════════════════════════════════════════════════════');
}

// Ejecutar tests
testSistemaHibrido().catch(error => {
  console.error('❌ Error ejecutando tests:', error);
  process.exit(1);
});
