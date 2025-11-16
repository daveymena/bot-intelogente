import axios from 'axios';

/**
 * 🔥 CALENTAR OLLAMA
 * Hace una petición inicial para cargar el modelo en memoria
 */

async function calentarOllama() {
  console.log('🔥 CALENTANDO OLLAMA\n');
  console.log('='.repeat(60));

  const OLLAMA_URL = 'http://localhost:11434';
  const MODEL = 'gemma3:4b';

  console.log(`📦 Modelo: ${MODEL}`);
  console.log(`🌐 URL: ${OLLAMA_URL}`);
  console.log('\n⏳ Cargando modelo en memoria...');
  console.log('   (Esto puede tardar 30-60 segundos la primera vez)\n');

  const inicio = Date.now();

  try {
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: MODEL,
      prompt: 'Hola',
      stream: false,
      options: {
        num_predict: 10
      }
    }, {
      timeout: 120000
    });

    const tiempo = Date.now() - inicio;

    console.log(`✅ Modelo cargado en ${tiempo}ms (${(tiempo/1000).toFixed(1)}s)`);
    console.log(`💬 Respuesta: ${response.data.response.substring(0, 50)}...`);
    console.log('\n🎯 Ollama está listo y caliente');
    console.log('   Las siguientes respuestas serán más rápidas (~15-30s)\n');

  } catch (error: any) {
    console.error('❌ Error calentando Ollama:', error.message);
    console.log('\n💡 Verifica:');
    console.log('   1. Ollama está corriendo: ollama list');
    console.log('   2. Modelo instalado: ollama pull gemma3:4b');
    console.log('   3. Puerto correcto: http://localhost:11434\n');
  }
}

calentarOllama().catch(console.error);
