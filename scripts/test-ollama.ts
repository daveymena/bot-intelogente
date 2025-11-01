import { AIMultiProvider } from '../src/lib/ai-multi-provider';

async function testOllama() {
  console.log('🧪 Probando conexión con Ollama...\n');
  console.log(`📍 URL: ${process.env.OLLAMA_BASE_URL}`);
  console.log(`🤖 Modelo: ${process.env.OLLAMA_MODEL}\n`);

  try {
    const response = await AIMultiProvider.generateCompletion([
      { role: 'system', content: 'Eres un asistente útil de ventas.' },
      { role: 'user', content: 'Hola, ¿qué productos vendes?' }
    ], {
      max_tokens: 100
    });

    console.log('✅ Respuesta exitosa!\n');
    console.log(`Provider usado: ${response.provider}`);
    console.log(`Modelo: ${response.model}`);
    console.log(`\nRespuesta:\n${response.content}\n`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

testOllama();
