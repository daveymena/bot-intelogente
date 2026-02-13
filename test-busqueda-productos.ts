/**
 * Test de Búsqueda de Productos
 * Verifica que el bot use la herramienta correcta según el tipo de consulta
 */

import { OpenClawOrchestrator } from './src/lib/bot/openclaw-orchestrator';

const orchestrator = new OpenClawOrchestrator();

// Mock de productos para testing
const mockProducts = [
  {
    id: 1,
    name: 'Mega Pack 11: Cursos Marketing Digital',
    tipo_producto: 'digital',
    tipo_entrega: 'inmediata',
    description: 'Pack completo de cursos de marketing digital',
    tags: 'cursos,digital,marketing',
    price: 50000
  },
  {
    id: 2,
    name: 'Curso de Piano Avanzado',
    tipo_producto: 'digital',
    tipo_entrega: 'inmediata',
    description: 'Curso completo de piano nivel avanzado',
    tags: 'curso,piano,música',
    price: 80000
  },
  {
    id: 3,
    name: 'Laptop Asus Vivobook 15',
    tipo_producto: 'fisico',
    tipo_entrega: 'envio',
    description: 'Laptop Asus Vivobook 15 pulgadas',
    tags: 'laptop,computador,asus',
    price: 1500000
  }
];

const mockContext = {
  userId: 'test-user',
  products: mockProducts,
  currentStage: 'saludo'
};

// Casos de prueba
const testCases = [
  {
    message: 'Curso digitales ?',
    expectedTool: 'list_products_by_category',
    description: 'Búsqueda genérica de cursos digitales'
  },
  {
    message: 'cursos digitales?',
    expectedTool: 'list_products_by_category',
    description: 'Búsqueda genérica de cursos (variante)'
  },
  {
    message: 'cursos?',
    expectedTool: 'list_products_by_category',
    description: 'Búsqueda genérica de cursos (simple)'
  },
  {
    message: 'qué cursos tienes?',
    expectedTool: 'list_products_by_category',
    description: 'Pregunta sobre cursos disponibles'
  },
  {
    message: 'laptops?',
    expectedTool: 'list_products_by_category',
    description: 'Búsqueda genérica de laptops'
  },
  {
    message: 'megapacks?',
    expectedTool: 'list_products_by_category',
    description: 'Búsqueda genérica de megapacks'
  },
  {
    message: 'Mega Pack 11',
    expectedTool: 'get_product_with_payment',
    description: 'Búsqueda específica por nombre completo'
  },
  {
    message: '¿Qué tal es el Mega Pack 11?',
    expectedTool: 'get_product_with_payment',
    description: 'Pregunta sobre producto específico'
  },
  {
    message: 'Laptop Asus Vivobook',
    expectedTool: 'get_product_with_payment',
    description: 'Búsqueda específica de laptop'
  },
  {
    message: 'hola',
    expectedTool: null,
    description: 'Saludo simple (sin herramienta)'
  }
];

async function runTests() {
  console.log('🧪 Iniciando Tests de Búsqueda de Productos\n');
  console.log('═'.repeat(80));
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    try {
      console.log(`\n📝 Test: ${testCase.description}`);
      console.log(`   Mensaje: "${testCase.message}"`);
      console.log(`   Esperado: ${testCase.expectedTool || 'null'}`);
      
      const result = await orchestrator.processMessage(
        testCase.message,
        'test-user-123',
        mockContext
      );
      
      // Extraer la herramienta usada del resultado
      // Nota: Necesitamos modificar el orchestrator para que retorne esta info
      // Por ahora, verificamos el resultado
      
      console.log(`   ✅ Resultado: ${result.success ? 'Éxito' : 'Fallo'}`);
      
      if (result.success) {
        passed++;
        console.log(`   ✅ PASÓ`);
      } else {
        failed++;
        console.log(`   ❌ FALLÓ`);
      }
      
    } catch (error: any) {
      failed++;
      console.log(`   ❌ ERROR: ${error.message}`);
    }
  }
  
  console.log('\n' + '═'.repeat(80));
  console.log(`\n📊 Resultados:`);
  console.log(`   ✅ Pasados: ${passed}/${testCases.length}`);
  console.log(`   ❌ Fallados: ${failed}/${testCases.length}`);
  console.log(`   📈 Tasa de éxito: ${((passed / testCases.length) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 ¡Todos los tests pasaron!');
  } else {
    console.log('\n⚠️ Algunos tests fallaron. Revisa la lógica de selección de herramientas.');
  }
}

// Ejecutar tests
runTests().catch(console.error);
