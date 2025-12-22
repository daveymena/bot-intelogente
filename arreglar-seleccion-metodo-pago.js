/**
 * 🔧 ARREGLO: Generar link cuando el cliente selecciona un método específico
 * 
 * PROBLEMA:
 * - Cliente dice "MercadoPago" → IA responde con [LINK DE PAGO DE MERCADO PAGO] sin reemplazar
 * - IA inventa información sobre Google Drive/Hotmart
 * 
 * SOLUCIÓN:
 * - Detectar cuando el cliente selecciona un método específico
 * - Generar el link real usando PaymentLinkGenerator
 * - Prohibir inventar información en el prompt
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log('🧪 Probando generación de link con método específico...\n');

  // Simular conversación
  const { getIntelligentEngine } = require('./src/lib/intelligent-conversation-engine');
  const engine = getIntelligentEngine();

  const chatId = 'test-' + Date.now();
  const userId = 'test-user';

  try {
    // 1. Usuario pregunta por un curso
    console.log('👤 Usuario: "Curso de piano"');
    const response1 = await engine.processMessage({
      chatId,
      userName: 'Test User',
      message: 'Curso de piano',
      userId
    });
    console.log('🤖 Bot:', response1.text.substring(0, 150) + '...\n');

    // 2. Usuario pregunta por métodos de pago
    console.log('👤 Usuario: "¿Cómo puedo pagar?"');
    const response2 = await engine.processMessage({
      chatId,
      userName: 'Test User',
      message: '¿Cómo puedo pagar?',
      userId
    });
    console.log('🤖 Bot:', response2.text.substring(0, 200) + '...');
    console.log('📊 Acciones:', response2.actions.map(a => a.type));
    console.log('');

    // 3. Usuario selecciona MercadoPago
    console.log('👤 Usuario: "MercadoPago"');
    const response3 = await engine.processMessage({
      chatId,
      userName: 'Test User',
      message: 'MercadoPago',
      userId
    });
    console.log('🤖 Bot:', response3.text);
    console.log('📊 Acciones:', response3.actions.map(a => a.type));
    console.log('');

    // Verificar que NO haya placeholders sin reemplazar
    const hasPlaceholder = response3.text.includes('[LINK DE PAGO') || 
                          response3.text.includes('[PAYMENT_LINK');
    
    if (hasPlaceholder) {
      console.log('❌ ERROR: La respuesta contiene placeholders sin reemplazar');
      console.log('   Texto:', response3.text);
    } else {
      console.log('✅ No hay placeholders sin reemplazar');
    }

    // Verificar que NO invente información
    const hasInventedInfo = response3.text.includes('Google Drive') ||
                           response3.text.includes('Hotmart') ||
                           response3.text.includes('de dos formas');
    
    if (hasInventedInfo) {
      console.log('❌ ERROR: La respuesta contiene información inventada');
      console.log('   Texto:', response3.text);
    } else {
      console.log('✅ No hay información inventada');
    }

    // Verificar que tenga un link real
    const hasRealLink = response3.text.includes('http') || 
                       response3.text.includes('3136174267'); // Número de Nequi
    
    if (hasRealLink) {
      console.log('✅ La respuesta contiene un link o número real');
    } else {
      console.log('❌ ERROR: La respuesta NO contiene un link o número real');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
