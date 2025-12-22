// Test de velocidad de Ollama
require('dotenv').config();

async function testOllamaSpeed() {
  console.log('⏱️  TEST: Velocidad de respuesta de Ollama\n');
  
  const tests = [
    {
      name: 'Saludo simple',
      prompt: 'Di solo "Hola"',
      maxTokens: 50
    },
    {
      name: 'Análisis de intención',
      prompt: 'Analiza este mensaje: "quiero un portátil". Responde solo con: {"type": "product_search"}',
      maxTokens: 100
    },
    {
      name: 'Búsqueda de producto',
      prompt: 'De esta lista: [1. Laptop HP, 2. Laptop Dell], ¿cuál recomiendas para trabajar? Responde en 1 línea.',
      maxTokens: 200
    }
  ];

  for (const test of tests) {
    console.log(`\n🧪 Test: ${test.name}`);
    console.log(`📝 Prompt: ${test.prompt.substring(0, 50)}...`);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
          prompt: test.prompt,
          stream: false,
          options: {
            temperature: 0.3,
            num_predict: test.maxTokens
          }
        })
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (response.ok) {
        const data = await response.json();
        console.log(`  ✅ Respuesta en ${duration}ms (${(duration/1000).toFixed(2)}s)`);
        console.log(`  📝 Respuesta: ${data.response?.substring(0, 100)}...`);
        
        // Clasificar velocidad
        if (duration < 2000) {
          console.log(`  ⚡ Velocidad: RÁPIDA`);
        } else if (duration < 5000) {
          console.log(`  🐢 Velocidad: NORMAL`);
        } else if (duration < 10000) {
          console.log(`  🐌 Velocidad: LENTA`);
        } else {
          console.log(`  ❌ Velocidad: MUY LENTA (puede causar timeouts)`);
        }
      } else {
        console.log(`  ❌ Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`  ❌ Error después de ${duration}ms: ${error.message}`);
    }
  }

  console.log('\n\n📊 RESUMEN:');
  console.log('  - Si las respuestas son < 5s: ✅ Ollama funciona bien');
  console.log('  - Si las respuestas son 5-10s: ⚠️  Puede causar delays');
  console.log('  - Si las respuestas son > 10s: ❌ Necesitas optimizar Ollama');
  console.log('\n💡 RECOMENDACIONES:');
  console.log('  - Modelo más pequeño: llama3.2:1b (más rápido)');
  console.log('  - Aumentar recursos del servidor Ollama');
  console.log('  - Reducir OLLAMA_MAX_TOKENS en .env');
  console.log('  - Considerar habilitar fallback a Groq para casos lentos');
}

testOllamaSpeed().catch(console.error);
