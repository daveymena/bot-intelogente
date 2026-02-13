/**
 * 🧪 TEST: Lógica de Búsqueda de Productos
 * Verifica que OpenClaw detecte correctamente búsquedas generales vs específicas
 */

import { OpenClawOrchestrator } from './src/lib/bot/openclaw-orchestrator';

const TEST_USER_ID = 'test-user-123';

interface TestCase {
  name: string;
  message: string;
  expectedTool: 'list_products_by_category' | 'get_product_with_payment' | 'get_payment_info' | null;
  description: string;
}

const testCases: TestCase[] = [
  // ✅ BÚSQUEDAS GENERALES (deben usar list_products_by_category)
  {
    name: 'Búsqueda General - Cursos Digitales',
    message: 'Cursos digitales?',
    expectedTool: 'list_products_by_category',
    description: 'Pregunta por categoría sin nombre específico'
  },
  {
    name: 'Búsqueda General - Laptops',
    message: 'Qué laptops tienes?',
    expectedTool: 'list_products_by_category',
    description: 'Pregunta por categoría de laptops'
  },
  {
    name: 'Búsqueda General - Computadores',
    message: 'Muéstrame computadores',
    expectedTool: 'list_products_by_category',
    description: 'Solicita ver categoría de computadores'
  },
  {
    name: 'Búsqueda General - Megapacks',
    message: 'Tienes megapacks?',
    expectedTool: 'list_products_by_category',
    description: 'Pregunta por categoría de megapacks'
  },
  {
    name: 'Búsqueda General - Motos',
    message: 'Tienen motos?',
    expectedTool: 'list_products_by_category',
    description: 'Pregunta por categoría de motos'
  },
  {
    name: 'Búsqueda General - Vaga',
    message: 'Busco una laptop',
    expectedTool: 'list_products_by_category',
    description: 'Búsqueda vaga sin nombre específico'
  },
  {
    name: 'Búsqueda General - Productos',
    message: 'Qué productos tienes?',
    expectedTool: 'list_products_by_category',
    description: 'Pregunta general por productos'
  },

  // ✅ BÚSQUEDAS ESPECÍFICAS (deben usar get_product_with_payment)
  {
    name: 'Búsqueda Específica - Mega Pack 11',
    message: 'Cuánto cuesta el Mega Pack 11?',
    expectedTool: 'get_product_with_payment',
    description: 'Menciona nombre específico de producto'
  },
  {
    name: 'Búsqueda Específica - Laptop Asus',
    message: 'Información de la Laptop Asus Vivobook',
    expectedTool: 'get_product_with_payment',
    description: 'Pregunta por producto específico'
  },
  {
    name: 'Búsqueda Específica - Moto',
    message: 'Qué tal es la Moto Auteco Victory?',
    expectedTool: 'get_product_with_payment',
    description: 'Pregunta por specs de producto específico'
  },

  // ✅ PAGOS (deben usar get_payment_info)
  {
    name: 'Consulta de Pago',
    message: 'Cómo puedo pagar?',
    expectedTool: 'get_payment_info',
    description: 'Pregunta por métodos de pago'
  },
  {
    name: 'Solicitud de Cuentas',
    message: 'Dame las cuentas para pagar',
    expectedTool: 'get_payment_info',
    description: 'Solicita información de cuentas'
  },

  // ✅ CHAT DIRECTO (no deben usar herramientas)
  {
    name: 'Saludo',
    message: 'Hola buenos días',
    expectedTool: null,
    description: 'Saludo simple'
  },
  {
    name: 'Despedida',
    message: 'Gracias, adiós',
    expectedTool: null,
    description: 'Despedida'
  }
];

async function runTests() {
  console.log('🧪 INICIANDO TESTS DE LÓGICA DE BÚSQUEDA\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const orchestrator = new OpenClawOrchestrator();
  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`📝 Test: ${testCase.name}`);
    console.log(`   Mensaje: "${testCase.message}"`);
    console.log(`   Esperado: ${testCase.expectedTool || 'null (chat directo)'}`);

    try {
      // Simular contexto mínimo
      const context = {
        userId: TEST_USER_ID,
        from: '573001234567',
        currentStage: 'consulta',
        conversationHistory: []
      };

      // Procesar mensaje (esto internamente llama a _think)
      const response = await orchestrator.processMessage(
        testCase.message,
        context.from,
        context
      );

      // Analizar respuesta para detectar qué herramienta se usó
      let detectedTool: string | null = null;

      if (response.includes('━━━━━━━━━━━━━━━━━━') && response.includes('1️⃣') && response.includes('2️⃣')) {
        // Respuesta con lista de productos
        detectedTool = 'list_products_by_category';
      } else if (response.includes('💰 Precio:') && response.includes('📦 Stock:')) {
        // Respuesta con producto individual
        detectedTool = 'get_product_with_payment';
      } else if (response.includes('💳') && (response.includes('MercadoPago') || response.includes('PayPal'))) {
        // Respuesta con información de pago
        detectedTool = 'get_payment_info';
      } else {
        // Chat directo sin herramientas
        detectedTool = null;
      }

      const success = detectedTool === testCase.expectedTool;

      if (success) {
        console.log(`   ✅ PASÓ - Herramienta detectada: ${detectedTool || 'null'}\n`);
        passed++;
      } else {
        console.log(`   ❌ FALLÓ - Herramienta detectada: ${detectedTool || 'null'}`);
        console.log(`   Respuesta: ${response.substring(0, 150)}...\n`);
        failed++;
      }

    } catch (error: any) {
      console.log(`   ❌ ERROR: ${error.message}\n`);
      failed++;
    }

    // Pequeña pausa entre tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 RESULTADOS FINALES:\n');
  console.log(`✅ Tests Pasados: ${passed}/${testCases.length}`);
  console.log(`❌ Tests Fallidos: ${failed}/${testCases.length}`);
  console.log(`📈 Tasa de Éxito: ${((passed / testCases.length) * 100).toFixed(1)}%\n`);

  if (failed === 0) {
    console.log('🎉 ¡TODOS LOS TESTS PASARON! La lógica de búsqueda funciona correctamente.\n');
  } else {
    console.log('⚠️ Algunos tests fallaron. Revisar la lógica de detección.\n');
  }
}

// Ejecutar tests
runTests().catch(console.error);
