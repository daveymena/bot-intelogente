
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const apiKey = process.env.GROQ_API_KEY;

async function testDirectGroq() {
  console.log('🚀 Probando conexión directa con Groq API (Node Native Fetch)...');
  
  if (!apiKey) {
    console.log('❌ Error: No se encontró GROQ_API_KEY en .env');
    return;
  }

  const hiddenKey = apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 4);
  console.log(`📡 Usando API Key: ${hiddenKey}`);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ ¡Éxito! Conexión establecida.');
      console.log('Respuesta:', data.choices[0].message.content);
    } else {
      console.log('\n❌ Error de API:', data.error?.message || response.statusText);
      if (response.status === 401) console.log('👉 La API Key parece inválida.');
      if (response.status === 429) console.log('👉 Has agotado tu cuota de Groq.');
      if (response.status === 404) console.log('👉 Modelo no encontrado.');
    }
  } catch (error) {
    console.log('\n❌ Error de red:', error.message);
  }
}

testDirectGroq();
