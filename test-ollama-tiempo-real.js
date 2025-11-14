// Test para medir el tiempo REAL de Ollama con prompts del sistema
require('dotenv').config();

async function testOllamaRealTime() {
  console.log('⏱️  TEST: Tiempo real de Ollama con prompts del sistema\n');
  console.log('📍 URL:', process.env.OLLAMA_BASE_URL);
  console.log('🤖 Modelo:', process.env.OLLAMA_MODEL);
  console.log('⏰ Timeout configurado:', process.env.OLLAMA_TIMEOUT, 'ms\n');

  // Simular productos reales (20 productos como en el sistema)
  const productos = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Producto ${i + 1}`,
    description: `Descripción detallada del producto ${i + 1} con características y especificaciones técnicas`,
    price: 1000000 + (i * 100000),
    category: 'PHYSICAL'
  }));

  // Prompt real del sistema (igual al que usa intelligent-product-search.ts)
  const prompt = `Analiza este mensaje del cliente: "Me gustaría saber cual me sirve para trabajar"

Productos disponibles:
${productos.map((p, i) => `${i + 1}. ${p.name} - $${p.price.toLocaleString()} - ${p.description}`).join('\n')}

Responde SOLO con un JSON en este formato:
{
  "found": true/false,
  "isGeneralQuery": true/false,
  "productIndex": número o null,
  "productIndexes": [números] o null,
  "confidence": 0-100,
  "reason": "explicación breve",
  "shouldSendPhoto": true/false
}`;

  console.log('📝 Prompt:', prompt.substring(0, 200) + '...');
  console.log('📏 Tamaño del prompt:', prompt.length, 'caracteres\n');

  // Test 1: Prompt completo (como en producción)
  console.log('🧪 Test 1: Prompt completo (20 productos)');
  const startTime1 = Date.now();
  
  try {
    const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 500
        }
      })
    });

    const endTime1 = Date.now();
    const duration1 = endTime1 - startTime1;

    if (response.ok) {
      const data = await response.json();
      console.log(`  ✅ Respuesta en ${duration1}ms (${(duration1/1000).toFixed(2)}s)`);
      console.log(`  📝 Respuesta: ${data.response?.substring(0, 150)}...`);
      
      // Clasificar velocidad
      if (duration1 < 3000) {
        console.log(`  ⚡ Velocidad: RÁPIDA - Perfecto para producción`);
      } else if (duration1 < 5000) {
        console.log(`  🐢 Velocidad: NORMAL - Aceptable`);
      } else if (duration1 < 10000) {
        console.log(`  🐌 Velocidad: LENTA - Considerar Groq principal`);
      } else if (duration1 < 20000) {
        console.log(`  ❌ Velocidad: MUY LENTA - Usar Groq principal`);
      } else {
        console.log(`  ❌❌ Velocidad: EXTREMADAMENTE LENTA - Solo Groq`);
      }
    } else {
      console.log(`  ❌ Error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    const endTime1 = Date.now();
    const duration1 = endTime1 - startTime1;
    console.log(`  ❌ Error después de ${duration1}ms: ${error.message}`);
  }

  console.log('');

  // Test 2: Prompt reducido (10 productos)
  const productosReducidos = productos.slice(0, 10);
  const promptReducido = `Analiza este mensaje del cliente: "Me gustaría saber cual me sirve para trabajar"

Productos disponibles:
${productosReducidos.map((p, i) => `${i + 1}. ${p.name} - $${p.price.toLocaleString()} - ${p.description}`).join('\n')}

Responde SOLO con un JSON en este formato:
{
  "found": true/false,
  "isGeneralQuery": true/false,
  "productIndex": número o null,
  "confidence": 0-100
}`;

  console.log('🧪 Test 2: Prompt reducido (10 productos)');
  const startTime2 = Date.now();
  
  try {
    const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL,
        prompt: promptReducido,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 300
        }
      })
    });

    const endTime2 = Date.now();
    const duration2 = endTime2 - startTime2;

    if (response.ok) {
      const data = await response.json();
      console.log(`  ✅ Respuesta en ${duration2}ms (${(duration2/1000).toFixed(2)}s)`);
      console.log(`  📝 Respuesta: ${data.response?.substring(0, 150)}...`);
      
      if (duration2 < 5000) {
        console.log(`  ⚡ Velocidad: MEJOR - Reducir productos ayuda`);
      } else {
        console.log(`  🐌 Velocidad: AÚN LENTA - Problema del servidor`);
      }
    } else {
      console.log(`  ❌ Error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    const endTime2 = Date.now();
    const duration2 = endTime2 - startTime2;
    console.log(`  ❌ Error después de ${duration2}ms: ${error.message}`);
  }

  console.log('');
  console.log('📊 CONCLUSIÓN:');
  console.log('  - Si Test 1 < 5s: Ollama funciona bien, úsalo como principal');
  console.log('  - Si Test 1 5-10s: Ollama lento, aumenta timeout o usa Groq');
  console.log('  - Si Test 1 > 10s: Ollama muy lento, usa Groq como principal');
  console.log('  - Si Test 2 es mucho más rápido: Reduce productos de 20 a 10');
}

testOllamaRealTime().catch(console.error);
