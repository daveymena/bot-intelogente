/**
 * 🧪 TEST DE CONVERSACIONES COMPLETAS
 * Simula conversaciones reales para verificar respuestas y generación de links
 */

import { db } from './src/lib/db';
import { SmartResponseEngine } from './src/lib/plantillas-respuestas-bot';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(emoji: string, message: string, color: string = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function logUser(message: string) {
  log('👤', `Cliente: "${message}"`, colors.cyan);
}

function logBot(message: string) {
  log('🤖', `Bot: ${message.substring(0, 150)}${message.length > 150 ? '...' : ''}`, colors.green);
}

function logAnalysis(intent: string, confidence: number, useAI: boolean) {
  log('📊', `Intención: ${intent} | Confianza: ${confidence}% | Usó IA: ${useAI ? 'SÍ' : 'NO'}`, colors.yellow);
}

function logSection(title: string) {
  console.log(`\n${colors.bright}${colors.magenta}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}${'='.repeat(60)}${colors.reset}\n`);
}

async function testConversation(
  title: string,
  messages: string[],
  context?: any
) {
  logSection(title);
  
  const history: string[] = [];
  let currentContext = context;
  
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    logUser(message);
    
    try {
      // Analizar intención
      const analysis = await SmartResponseEngine.analyzeIntent(
        message,
        history,
        currentContext,
        'test-user-id'
      );
      
      logAnalysis(analysis.intent, analysis.confidence, analysis.useAI);
      
      // Generar respuesta
      const response = SmartResponseEngine.generateResponse(analysis, currentContext);
      logBot(response);
      
      // Actualizar historial
      history.push(message);
      history.push(response);
      
      // Si se generó un link de pago, actualizar contexto
      if (analysis.intent === 'payment_link_generated') {
        log('✅', 'Link de pago generado exitosamente', colors.green);
        if (analysis.entities?.selectedMethod) {
          log('💳', `Método seleccionado: ${analysis.entities.selectedMethod}`, colors.blue);
        }
      }
      
      console.log(''); // Espacio entre mensajes
      
    } catch (error) {
      log('❌', `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`, colors.red);
    }
  }
}

async function runTests() {
  log('🚀', 'INICIANDO TESTS DE CONVERSACIONES COMPLETAS', colors.bright);
  
  // Obtener un producto real de la BD
  const product = await db.product.findFirst({
    where: { status: 'AVAILABLE' }
  });
  
  if (!product) {
    log('❌', 'No hay productos en la BD para probar', colors.red);
    return;
  }
  
  log('📦', `Producto de prueba: ${product.name} (${product.price} COP)`, colors.blue);
  
  const productContext = {
    product: {
      id: product.id,
      name: product.name,
      price: product.price
    },
    lastProduct: product.name
  };
  
  // ========== TEST 1: SALUDO SIMPLE ==========
  await testConversation(
    'TEST 1: Saludo Simple',
    ['Hola', 'Buenos días', 'Hey']
  );
  
  // ========== TEST 2: BÚSQUEDA DE PRODUCTO ==========
  await testConversation(
    'TEST 2: Búsqueda de Producto',
    ['Curso de Piano', 'Megapack de idiomas', 'Laptop gaming']
  );
  
  // ========== TEST 3: SOLICITUD DE PAGO SIN CONTEXTO ==========
  await testConversation(
    'TEST 3: Solicitud de Pago SIN Producto en Contexto',
    ['Quiero pagar', 'Métodos de pago', 'Cómo puedo pagar']
  );
  
  // ========== TEST 4: SOLICITUD DE PAGO CON CONTEXTO ==========
  await testConversation(
    'TEST 4: Solicitud de Pago CON Producto en Contexto',
    ['Quiero pagar', 'Métodos de pago disponibles'],
    productContext
  );
  
  // ========== TEST 5: MÉTODO ESPECÍFICO CON CONTEXTO (CASO CRÍTICO) ==========
  await testConversation(
    'TEST 5: Cliente Dice "Mercadopago" Directamente (DEBE GENERAR LINK)',
    ['Por mercadopago', 'Mercadopago', 'Mercado pago'],
    productContext
  );
  
  // ========== TEST 6: MÉTODO ESPECÍFICO CON CONTEXTO - PAYPAL ==========
  await testConversation(
    'TEST 6: Cliente Dice "PayPal" Directamente (DEBE GENERAR LINK)',
    ['Por paypal', 'PayPal', 'Con paypal'],
    productContext
  );
  
  // ========== TEST 7: MÉTODO ESPECÍFICO CON CONTEXTO - NEQUI ==========
  await testConversation(
    'TEST 7: Cliente Dice "Nequi" Directamente (DEBE GENERAR INFO)',
    ['Por nequi', 'Nequi', 'Con nequi'],
    productContext
  );
  
  // ========== TEST 8: CONVERSACIÓN COMPLETA REALISTA ==========
  await testConversation(
    'TEST 8: Conversación Completa Realista',
    [
      'Hola',
      'Busco un curso de piano',
      'Cuánto cuesta',
      'Quiero comprarlo',
      'Por mercadopago'
    ],
    productContext
  );
  
  // ========== TEST 9: VARIACIONES DE "MERCADOPAGO" ==========
  await testConversation(
    'TEST 9: Variaciones de "MercadoPago" (TODAS DEBEN GENERAR LINK)',
    [
      'mercado pago',
      'mercadopago',
      'mercado libre',
      'por mercado',
      'con mercadopago'
    ],
    productContext
  );
  
  // ========== TEST 10: PREGUNTAS SOBRE MÉTODOS SIN ELEGIR ==========
  await testConversation(
    'TEST 10: Preguntas Sobre Métodos SIN Elegir Uno (DEBE MOSTRAR OPCIONES)',
    [
      '¿Qué métodos de pago tienen?',
      '¿Cómo puedo pagar?',
      'Formas de pago',
      'Métodos disponibles'
    ],
    productContext
  );
  
  logSection('RESUMEN DE TESTS');
  log('✅', 'Tests completados', colors.green);
  log('📊', 'Revisa los resultados arriba para verificar:', colors.yellow);
  log('  ', '1. ¿El bot entiende el contexto?', colors.reset);
  log('  ', '2. ¿Genera links cuando el cliente elige un método?', colors.reset);
  log('  ', '3. ¿Muestra opciones cuando solo pregunta?', colors.reset);
  log('  ', '4. ¿Usa IA cuando es necesario?', colors.reset);
}

// Ejecutar tests
runTests()
  .then(() => {
    console.log('\n✅ Tests finalizados exitosamente\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en tests:', error);
    process.exit(1);
  });
