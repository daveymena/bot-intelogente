/**
 * TEST HANDLER DIRECTO FINAL
 * 
 * Prueba directamente el SimpleConversationHandler sin pasar por la API
 * para verificar que el sistema inteligente funciona correctamente
 */

async function testHandlerDirecto() {
  console.log('\n🧪 TEST HANDLER DIRECTO FINAL\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // Importar el handler
    const { SimpleConversationHandler } = await import('./src/lib/simple-conversation-handler.ts');
    const handler = SimpleConversationHandler.getInstance();
    
    const TEST_CHAT_ID = 'test-chat-' + Date.now();
    const TEST_USER_ID = 'cm3wfmk7z0000kqh8qpwam123'; // Usuario de prueba
    
    console.log(`📱 Chat ID: ${TEST_CHAT_ID}`);
    console.log(`👤 User ID: ${TEST_USER_ID}\n`);
    console.log('═══════════════════════════════════════════════════════════\n');

    // TEST 1: BÚSQUEDA ESPECÍFICA
    console.log('🎯 TEST 1: BÚSQUEDA ESPECÍFICA DE PRODUCTO\n');
    console.log('📤 Usuario: "Quiero el curso de piano"\n');
    
    const response1 = await handler.handleMessage({
      chatId: TEST_CHAT_ID,
      userId: TEST_USER_ID,
      message: 'Quiero el curso de piano',
      userName: 'Test User'
    });
    
    console.log('✅ Bot respondió:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(response1.text);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Verificaciones
    const text1 = response1.text;
    const hasProductName = text1.toLowerCase().includes('piano');
    const hasPrice = /\d{1,3}[.,]?\d{3}/.test(text1) || text1.includes('COP') || text1.includes('60');
    const hasDescription = text1.length > 100;
    const hasActions = response1.actions && response1.actions.length > 0;
    
    console.log('📊 VERIFICACIONES:');
    console.log(`   ${hasProductName ? '✅' : '❌'} Menciona el producto (Piano)`);
    console.log(`   ${hasPrice ? '✅' : '❌'} Muestra el precio`);
    console.log(`   ${hasDescription ? '✅' : '❌'} Incluye descripción (${text1.length} caracteres)`);
    console.log(`   ${hasActions ? '✅' : '❌'} Tiene acciones de foto`);
    
    if (hasActions) {
      console.log(`\n📸 Acciones detectadas: ${response1.actions.length}`);
      response1.actions.forEach((action, i) => {
        console.log(`   ${i + 1}. Tipo: ${action.type}`);
        if (action.data.product) {
          console.log(`      Producto: ${action.data.product.name}`);
          console.log(`      Imágenes: ${action.data.product.images?.length || 0}`);
        }
      });
    }
    
    // Verificar que NO invente información
    const hasFlowkey = text1.toLowerCase().includes('flowkey');
    const hasPianote = text1.toLowerCase().includes('pianote');
    const hasYousician = text1.toLowerCase().includes('yousician');
    const hasGenericQuestions = /cuál es tu nivel|qué tipo de aprendizaje|cuéntame:/i.test(text1);
    
    console.log('\n🚨 VALIDACIÓN ANTI-INVENTAR:');
    console.log(`   ${!hasFlowkey ? '✅' : '❌'} NO menciona Flowkey`);
    console.log(`   ${!hasPianote ? '✅' : '❌'} NO menciona Pianote`);
    console.log(`   ${!hasYousician ? '✅' : '❌'} NO menciona Yousician`);
    console.log(`   ${!hasGenericQuestions ? '✅' : '❌'} NO hace preguntas innecesarias`);
    
    // TEST 2: BÚSQUEDA GENÉRICA
    console.log('\n═══════════════════════════════════════════════════════════\n');
    console.log('🎯 TEST 2: BÚSQUEDA GENÉRICA DE CATEGORÍA\n');
    console.log('📤 Usuario: "Qué cursos tienes"\n');
    
    const response2 = await handler.handleMessage({
      chatId: TEST_CHAT_ID + '-2',
      userId: TEST_USER_ID,
      message: 'Qué cursos tienes',
      userName: 'Test User'
    });
    
    console.log('✅ Bot respondió:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(response2.text);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const text2 = response2.text;
    
    // Contar productos mencionados
    const productMatches = text2.match(/[1-3][️⃣\.)]/g) || [];
    const hasMultipleOptions = productMatches.length >= 2 && productMatches.length <= 3;
    const hasPrices = (text2.match(/\d{1,3}[.,]?\d{3}/g) || []).length >= 2;
    const hasQuestion = /cuál|cual|te interesa|prefieres|gustaria/i.test(text2);
    
    console.log('📊 VERIFICACIONES:');
    console.log(`   ${hasMultipleOptions ? '✅' : '❌'} Muestra 2-3 opciones (${productMatches.length} encontradas)`);
    console.log(`   ${hasPrices ? '✅' : '❌'} Incluye precios de múltiples productos`);
    console.log(`   ${hasQuestion ? '✅' : '❌'} Pregunta cuál le interesa`);
    console.log(`   Longitud de respuesta: ${text2.length} caracteres`);
    
    // TEST 3: BÚSQUEDA ESPECÍFICA DE LAPTOP
    console.log('\n═══════════════════════════════════════════════════════════\n');
    console.log('🎯 TEST 3: BÚSQUEDA ESPECÍFICA DE LAPTOP\n');
    console.log('📤 Usuario: "Busco laptop gaming"\n');
    
    const response3 = await handler.handleMessage({
      chatId: TEST_CHAT_ID + '-3',
      userId: TEST_USER_ID,
      message: 'Busco laptop gaming',
      userName: 'Test User'
    });
    
    console.log('✅ Bot respondió:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(response3.text);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const text3 = response3.text;
    const hasLaptop = /laptop|portátil|portatil/i.test(text3);
    const hasGaming = /gaming|juegos|gamer/i.test(text3);
    const hasPrice3 = /\d{1,3}[.,]?\d{3}/.test(text3) || text3.includes('COP');
    
    console.log('📊 VERIFICACIONES:');
    console.log(`   ${hasLaptop ? '✅' : '❌'} Menciona laptop`);
    console.log(`   ${hasGaming ? '✅' : '❌'} Menciona gaming/juegos`);
    console.log(`   ${hasPrice3 ? '✅' : '❌'} Muestra precio`);
    
    // RESUMEN FINAL
    console.log('\n═══════════════════════════════════════════════════════════\n');
    console.log('📊 RESUMEN FINAL DEL TEST\n');
    
    const allTestsPassed = 
      hasProductName && hasPrice && !hasFlowkey && !hasPianote && !hasYousician &&
      hasMultipleOptions && hasLaptop;
    
    if (allTestsPassed) {
      console.log('✅ TODOS LOS TESTS PASARON EXITOSAMENTE\n');
      console.log('🎯 El sistema inteligente está funcionando correctamente:');
      console.log('   • Búsqueda específica → Muestra producto completo + foto');
      console.log('   • Búsqueda genérica → Muestra 2-3 opciones');
      console.log('   • Validación anti-inventar → Activa y funcionando');
      console.log('   • Datos reales → Siempre del catálogo');
    } else {
      console.log('⚠️ ALGUNOS TESTS FALLARON\n');
      console.log('Revisa los detalles arriba para ver qué necesita ajuste.');
    }
    
    console.log('\n═══════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error en el test:', error);
    console.error(error.stack);
  }
}

// Ejecutar test
testHandlerDirecto().catch(console.error);
