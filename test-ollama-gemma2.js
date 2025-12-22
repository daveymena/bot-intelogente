/**
 * 🧪 TEST RÁPIDO: Ollama con gemma2:4b
 * Verifica que Ollama esté funcionando correctamente
 */

async function testOllama() {
  const OLLAMA_URL = 'http://localhost:11434';
  const MODEL = 'gemma3:4b';
  const TIMEOUT = 300000; // 5 minutos
  
  console.log('🧪 Probando Ollama con gemma3:4b (Timeout: 5 minutos)...\n');
  
  // 1. Verificar conexión
  console.log('1️⃣ Verificando conexión a Ollama...');
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Ollama conectado');
    console.log(`📦 Modelos disponibles: ${data.models.length}`);
    
    // Verificar si gemma3:4b está disponible
    const hasGemma3 = data.models.some(m => m.name === MODEL);
    if (hasGemma3) {
      console.log(`✅ Modelo ${MODEL} encontrado\n`);
    } else {
      console.log(`❌ Modelo ${MODEL} NO encontrado`);
      console.log(`💡 Descárgalo con: ollama pull ${MODEL}\n`);
      return;
    }
  } catch (error) {
    console.error('❌ Error conectando a Ollama:', error.message);
    console.log('💡 Asegúrate de que Ollama esté corriendo: ollama serve\n');
    return;
  }
  
  // 2. Probar generación de respuesta
  console.log('2️⃣ Probando generación de respuesta...');
  console.log('⏳ Esperando respuesta (puede tomar hasta 5 minutos)...');
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente de ventas amigable.'
          },
          {
            role: 'user',
            content: 'Hola, ¿tienes computadores portátiles?'
          }
        ],
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 100,
          num_ctx: 2048
        }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const responseTime = Date.now() - startTime;
    
    console.log('✅ Respuesta generada exitosamente');
    console.log(`⏱️ Tiempo: ${responseTime}ms`);
    console.log(`📝 Respuesta: ${data.message.content}\n`);
    
    // 3. Verificar velocidad
    if (responseTime < 5000) {
      console.log('🚀 Velocidad: EXCELENTE (< 5s)');
    } else if (responseTime < 10000) {
      console.log('✅ Velocidad: BUENA (< 10s)');
    } else if (responseTime < 30000) {
      console.log('⚠️ Velocidad: ACEPTABLE (< 30s)');
    } else {
      console.log('❌ Velocidad: LENTA (> 30s)');
    }
    
    console.log('\n✅ TODO LISTO! Ollama funciona correctamente con gemma3:4b');
    console.log('🎯 Ahora puedes entrenar el bot con: npx tsx scripts/entrenar-bot.ts');
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Timeout después de 5 minutos');
      console.log('💡 El modelo puede estar muy ocupado o necesita más recursos');
    } else {
      console.error('❌ Error generando respuesta:', error.message);
    }
  }
}

testOllama();
