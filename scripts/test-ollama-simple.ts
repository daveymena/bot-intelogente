/**
 * 🧪 TEST SIMPLE - Ollama con plantillas locales
 */

import { OllamaOrchestrator } from '../src/lib/ollama-orchestrator';

async function testOllamaSimple() {
  console.log('🧪 TEST: Ollama con Plantillas Locales\n');
  console.log('='.repeat(60));
  
  // Productos de prueba
  const testProducts = [
    {
      id: 1,
      name: 'Laptop HP 15.6" Core i5',
      price: 1500000,
      category: 'LAPTOP',
      description: 'Laptop HP con procesador Intel Core i5, 8GB RAM, 256GB SSD',
      images: [],
      stock: 5,
      tags: ['laptop', 'hp', 'core i5'],
      smartTags: ['computador', 'portatil']
    },
    {
      id: 2,
      name: 'Laptop Lenovo ThinkPad',
      price: 2000000,
      category: 'LAPTOP',
      description: 'Lenovo ThinkPad profesional, Core i7, 16GB RAM',
      images: [],
      stock: 3,
      tags: ['laptop', 'lenovo', 'thinkpad'],
      smartTags: ['computador', 'portatil', 'profesional']
    },
    {
      id: 3,
      name: 'Curso Completo de Piano',
      price: 50000,
      category: 'DIGITAL',
      description: 'Aprende piano desde cero hasta nivel avanzado',
      images: [],
      stock: 999,
      tags: ['curso', 'piano', 'música'],
      smartTags: ['educación', 'digital']
    },
    {
      id: 4,
      name: 'Moto Yamaha FZ 150',
      price: 8000000,
      category: 'MOTORCYCLE',
      description: 'Moto Yamaha FZ 150cc, modelo 2023',
      images: [],
      stock: 2,
      tags: ['moto', 'yamaha'],
      smartTags: ['vehículo', 'transporte']
    }
  ];
  
  const context = {
    products: testProducts,
    businessInfo: {
      name: 'Tecnovariedades D&S',
      description: 'Tu tienda de tecnología',
      categories: ['Laptops', 'Motos', 'Cursos']
    },
    paymentMethods: {
      online: ['MercadoPago', 'PayPal'],
      local: ['Nequi', 'Daviplata']
    },
    conversationHistory: []
  };
  
  // Tests
  const tests = [
    {
      name: 'Saludo',
      message: 'Hola',
      expected: 'Debe responder con saludo y categorías'
    },
    {
      name: 'Búsqueda de laptop',
      message: 'Busco una laptop',
      expected: 'Debe mostrar laptops HP y Lenovo'
    },
    {
      name: 'Búsqueda de curso',
      message: 'Curso de piano',
      expected: 'Debe mostrar el curso de piano'
    },
    {
      name: 'Pregunta por pago',
      message: 'Cómo puedo pagar?',
      expected: 'Debe mostrar métodos de pago'
    }
  ];
  
  for (const test of tests) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📝 TEST: ${test.name}`);
    console.log(`💬 Mensaje: "${test.message}"`);
    console.log(`✅ Esperado: ${test.expected}`);
    console.log('-'.repeat(60));
    
    const startTime = Date.now();
    
    try {
      const result = await OllamaOrchestrator.generateIntelligentResponse(
        test.message,
        context
      );
      
      const duration = Date.now() - startTime;
      
      console.log(`\n🤖 RESPUESTA (${duration}ms):`);
      console.log(result.text);
      console.log(`\n📊 Metadata:`);
      console.log(`   Intención: ${result.intent}`);
      console.log(`   Confianza: ${result.confidence}`);
      console.log(`   Productos: ${result.selectedProducts.length}`);
      
      if (result.selectedProducts.length > 0) {
        console.log(`\n📦 Productos seleccionados:`);
        result.selectedProducts.forEach(p => {
          console.log(`   - ${p.name} ($${p.price.toLocaleString('es-CO')})`);
        });
      }
      
      console.log(`\n✅ Test completado en ${duration}ms`);
      
    } catch (error: any) {
      console.error(`\n❌ ERROR:`, error.message);
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ TODOS LOS TESTS COMPLETADOS');
}

// Ejecutar
testOllamaSimple().catch(console.error);
