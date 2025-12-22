/**
 * Test de Razonamiento de Ollama
 * Prueba qué tan bien Ollama entiende y razona sobre búsquedas de productos
 */

import { AIMultiProvider } from '../src/lib/ai-multi-provider';
import { db } from '../src/lib/db';

async function testOllamaReasoning() {
  console.log('\n🧠 TEST DE RAZONAMIENTO DE OLLAMA\n');
  console.log('='.repeat(60));
  
  // Cargar productos de la BD
  const products = await db.product.findMany({
    where: { status: 'AVAILABLE' },
    select: {
      id: true,
      name: true,
      price: true,
      category: true,
      description: true
    },
    take: 50
  });
  
  console.log(`\n📦 Cargados ${products.length} productos de la BD\n`);
  
  // Lista de productos para Ollama
  const productList = products.map((p, i) => 
    `${i + 1}. ${p.name} - ${p.price.toLocaleString('es-CO')} COP (${p.category})`
  ).join('\n');
  
  // Casos de prueba
  const testCases = [
    {
      name: 'Búsqueda Específica',
      query: 'Curso de Piano',
      expectedProducts: ['piano', 'curso']
    },
    {
      name: 'Búsqueda con Contexto',
      query: 'laptop para diseño gráfico',
      expectedProducts: ['laptop', 'diseño']
    },
    {
      name: 'Búsqueda Ambigua',
      query: 'algo para aprender',
      expectedProducts: ['curso', 'megapack']
    },
    {
      name: 'Búsqueda por Precio',
      query: 'algo económico',
      expectedProducts: ['barato', 'económico']
    },
    {
      name: 'Búsqueda por Categoría',
      query: 'motos',
      expectedProducts: ['moto', 'motorcycle']
    }
  ];
  
  for (const testCase of testCases) {
    console.log('\n' + '─'.repeat(60));
    console.log(`\n📝 TEST: ${testCase.name}`);
    console.log(`💬 Query: "${testCase.query}"`);
    console.log('─'.repeat(60));
    
    try {
      const startTime = Date.now();
      
      const systemPrompt = `Eres un experto en búsqueda de productos.

PRODUCTOS DISPONIBLES:
${productList}

TU TAREA:
Analiza qué busca el cliente y selecciona los productos más relevantes.

Responde en formato:
PRODUCTOS: [números de productos separados por comas]
RAZONAMIENTO: [explica por qué seleccionaste esos productos]
KEYWORDS: [palabras clave extraídas]

Si NO encuentras productos relevantes:
PRODUCTOS: ninguno
RAZONAMIENTO: [explica por qué no hay coincidencias]
KEYWORDS: [palabras clave del mensaje]`;

      const aiMessages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: `Cliente dice: "${testCase.query}"\n\n¿Qué productos coinciden?` }
      ];
      
      const response = await AIMultiProvider.generateCompletion(aiMessages, {
        temperature: 0.3,
        max_tokens: 300
      });
      
      const responseTime = Date.now() - startTime;
      
      console.log(`\n⏱️  Tiempo de respuesta: ${responseTime}ms`);
      console.log(`\n🦙 Respuesta de Ollama:`);
      console.log('─'.repeat(60));
      console.log(response.content);
      console.log('─'.repeat(60));
      
      // Analizar respuesta
      const productMatch = response.content.match(/PRODUCTOS?:\s*([^\n]+)/i);
      const reasoningMatch = response.content.match(/RAZONAMIENTO:\s*([^\n]+)/i);
      const keywordsMatch = response.content.match(/KEYWORDS?:\s*([^\n]+)/i);
      
      console.log(`\n📊 Análisis:`);
      
      if (productMatch) {
        const productsFound = productMatch[1].trim();
        console.log(`✅ Productos: ${productsFound}`);
        
        if (productsFound.toLowerCase().includes('ninguno')) {
          console.log(`⚠️  No encontró productos relevantes`);
        } else {
          const numbers = productsFound.match(/\d+/g);
          if (numbers) {
            console.log(`📦 Cantidad: ${numbers.length} producto(s)`);
            numbers.forEach(num => {
              const index = parseInt(num) - 1;
              if (index >= 0 && index < products.length) {
                console.log(`   ${num}. ${products[index].name}`);
              }
            });
          }
        }
      } else {
        console.log(`❌ No encontró formato PRODUCTOS:`);
      }
      
      if (reasoningMatch) {
        console.log(`\n🧠 Razonamiento: ${reasoningMatch[1].trim()}`);
      }
      
      if (keywordsMatch) {
        console.log(`🔑 Keywords: ${keywordsMatch[1].trim()}`);
      }
      
      // Evaluar calidad
      console.log(`\n⭐ Evaluación:`);
      let score = 0;
      
      if (productMatch) {
        score += 30;
        console.log(`   ✅ Formato correcto (+30)`);
      }
      
      if (reasoningMatch) {
        score += 20;
        console.log(`   ✅ Incluye razonamiento (+20)`);
      }
      
      if (keywordsMatch) {
        score += 20;
        console.log(`   ✅ Extrae keywords (+20)`);
      }
      
      if (responseTime < 5000) {
        score += 15;
        console.log(`   ✅ Respuesta rápida (+15)`);
      }
      
      if (response.content.length > 50 && response.content.length < 500) {
        score += 15;
        console.log(`   ✅ Longitud apropiada (+15)`);
      }
      
      console.log(`\n   📊 Score Total: ${score}/100`);
      
      if (score >= 80) {
        console.log(`   🎉 EXCELENTE`);
      } else if (score >= 60) {
        console.log(`   👍 BUENO`);
      } else if (score >= 40) {
        console.log(`   ⚠️  REGULAR`);
      } else {
        console.log(`   ❌ NECESITA MEJORAS`);
      }
      
    } catch (error: any) {
      console.error(`\n❌ Error: ${error.message}`);
    }
    
    // Esperar un poco entre tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Tests completados\n');
}

// Ejecutar
testOllamaReasoning()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
