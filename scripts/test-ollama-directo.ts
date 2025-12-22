// Test directo de Ollama sin dependencias

const OLLAMA_URL = 'https://bot-whatsapp-ollama.sqaoeo.easypanel.host';
const MODEL = 'gemma:2b';

async function testOllamaDirect() {
  console.log('🧪 Test directo de Ollama\n');
  console.log(`📍 URL: ${OLLAMA_URL}`);
  console.log(`🤖 Modelo: ${MODEL}\n`);

  // Test 1: Verificar que el servidor responde
  console.log('1️⃣ Verificando servidor...');
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    const data = await response.json();
    console.log('✅ Servidor responde');
    console.log(`   Modelos disponibles: ${data.models?.map((m: any) => m.name).join(', ')}\n`);
  } catch (error: any) {
    console.error('❌ Error conectando al servidor:', error.message);
    return;
  }

  // Test 2: Generar respuesta
  console.log('2️⃣ Generando respuesta de prueba...');
  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: 'Eres un asistente útil de ventas.' },
          { role: 'user', content: 'Hola, ¿qué productos vendes?' }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Respuesta generada exitosamente\n');
    console.log('📝 Respuesta:');
    console.log(data.message?.content || data);
    console.log('\n✅ Ollama funciona correctamente!');

  } catch (error: any) {
    console.error('❌ Error generando respuesta:', error.message);
  }
}

testOllamaDirect();
