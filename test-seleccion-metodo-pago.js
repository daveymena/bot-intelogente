/**
 * 🧪 TEST: Selección de método de pago específico
 * 
 * Verifica que cuando el cliente selecciona un método (ej: "MercadoPago"),
 * el bot genera el link inmediatamente sin inventar información.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log('🧪 TEST: Selección de método de pago\n');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Obtener un producto de prueba
    const product = await prisma.product.findFirst({
      where: {
        status: 'AVAILABLE',
        category: 'DIGITAL'
      }
    });

    if (!product) {
      console.log('❌ No hay productos disponibles para probar');
      return;
    }

    console.log('📦 Producto de prueba:', product.name);
    console.log('💰 Precio:', product.price.toLocaleString('es-CO'), 'COP\n');

    // Importar el motor
    const { getIntelligentEngine } = require('./src/lib/intelligent-conversation-engine');
    const engine = getIntelligentEngine();

    const chatId = 'test-' + Date.now();
    const userId = product.userId;

    // PASO 1: Usuario pregunta por el producto
    console.log('PASO 1: Usuario pregunta por el producto');
    console.log('─────────────────────────────────────────');
    console.log('👤 Usuario: "' + product.name + '"');
    
    const response1 = await engine.processMessage({
      chatId,
      userName: 'Test User',
      message: product.name,
      userId
    });
    
    console.log('🤖 Bot:', response1.text.substring(0, 200) + '...');
    console.log('📊 Contexto:', {
      producto: response1.context.currentProduct?.name || 'ninguno',
      intencionPago: response1.context.paymentIntent || false
    });
    console.log('');

    // PASO 2: Usuario pregunta por métodos de pago
    console.log('PASO 2: Usuario pregunta por métodos de pago');
    console.log('─────────────────────────────────────────');
    console.log('👤 Usuario: "¿Cómo puedo pagar?"');
    
    const response2 = await engine.processMessage({
      chatId,
      userName: 'Test User',
      message: '¿Cómo puedo pagar?',
      userId
    });
    
    console.log('🤖 Bot:', response2.text.substring(0, 300) + '...');
    console.log('📊 Acciones:', response2.actions.map(a => a.type));
    console.log('📊 Contexto:', {
      producto: response2.context.currentProduct?.name || 'ninguno',
      intencionPago: response2.context.paymentIntent || false
    });
    console.log('');

    // PASO 3: Usuario selecciona MercadoPago
    console.log('PASO 3: Usuario selecciona MercadoPago');
    console.log('─────────────────────────────────────────');
    console.log('👤 Usuario: "MercadoPago"');
    
    const response3 = await engine.processMessage({
      chatId,
      userName: 'Test User',
      message: 'MercadoPago',
      userId
    });
    
    console.log('🤖 Bot:');
    console.log(response3.text);
    console.log('');
    console.log('📊 Acciones:', response3.actions.map(a => a.type));
    console.log('📊 Contexto:', {
      producto: response3.context.currentProduct?.name || 'ninguno',
      metodoPago: response3.context.preferredPaymentMethod || 'ninguno'
    });
    console.log('');

    // VERIFICACIONES
    console.log('VERIFICACIONES:');
    console.log('═══════════════════════════════════════════════════════');
    
    // 1. Verificar que NO haya placeholders sin reemplazar
    const hasPlaceholder = response3.text.includes('[LINK DE PAGO') || 
                          response3.text.includes('[PAYMENT_LINK') ||
                          response3.text.includes('[MERCADO PAGO');
    
    if (hasPlaceholder) {
      console.log('❌ FALLO: La respuesta contiene placeholders sin reemplazar');
      console.log('   Placeholders encontrados en:', response3.text);
    } else {
      console.log('✅ PASS: No hay placeholders sin reemplazar');
    }

    // 2. Verificar que NO invente información
    const hasInventedInfo = response3.text.includes('Google Drive') ||
                           response3.text.includes('Hotmart') ||
                           response3.text.includes('de dos formas') ||
                           response3.text.includes('área de miembros') ||
                           response3.text.includes('descargar o ver online');
    
    if (hasInventedInfo) {
      console.log('❌ FALLO: La respuesta contiene información inventada');
      console.log('   Información inventada encontrada');
    } else {
      console.log('✅ PASS: No hay información inventada');
    }

    // 3. Verificar que tenga un link real o número
    const hasRealLink = response3.text.includes('http') || 
                       response3.text.includes('3136174267') ||
                       response3.text.includes('mercadopago.com');
    
    if (hasRealLink) {
      console.log('✅ PASS: La respuesta contiene un link o número real');
    } else {
      console.log('❌ FALLO: La respuesta NO contiene un link o número real');
    }

    // 4. Verificar que la respuesta sea breve (no más de 500 caracteres)
    if (response3.text.length <= 500) {
      console.log('✅ PASS: La respuesta es breve (' + response3.text.length + ' caracteres)');
    } else {
      console.log('⚠️  ADVERTENCIA: La respuesta es muy larga (' + response3.text.length + ' caracteres)');
    }

    // 5. Verificar que se generó la acción correcta
    const hasSpecificMethodAction = response3.actions.some(a => a.type === 'send_specific_payment_method');
    
    if (hasSpecificMethodAction) {
      console.log('✅ PASS: Se generó la acción send_specific_payment_method');
    } else {
      console.log('❌ FALLO: NO se generó la acción send_specific_payment_method');
      console.log('   Acciones generadas:', response3.actions.map(a => a.type));
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    
    // Resumen
    const allPassed = !hasPlaceholder && !hasInventedInfo && hasRealLink && hasSpecificMethodAction;
    
    if (allPassed) {
      console.log('✅ TODOS LOS TESTS PASARON');
    } else {
      console.log('❌ ALGUNOS TESTS FALLARON');
    }

  } catch (error) {
    console.error('❌ Error en el test:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

test();
