/**
 * Test Simple de las 3 IAs
 * Prueba Groq, OpenRouter y Ollama
 */

require('dotenv').config();

async function testGroq() {
  console.log('\n🚀 Probando GROQ...');
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'user', content: 'Di "Groq funciona" en una palabra' }
        ],
        max_tokens: 10
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('✅ GROQ: Funcionando');
    console.log(`   Respuesta: ${content}`);
    return true;
  } catch (error) {
    console.log('❌ GROQ: Error');
    console.log(`   ${error.message}`);
    return false;
  }
}

async function testOpenRouter() {
  console.log('\n🌐 Probando OPENROUTER...');
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Test Bot'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          { role: 'user', content: 'Di "OpenRouter funciona" en una palabra' }
        ],
        max_tokens: 10
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('✅ OPENROUTER: Funcionando');
    console.log(`   Respuesta: ${content}`);
    return true;
  } catch (error) {
    console.log('❌ OPENROUTER: Error');
    console.log(`   ${error.message}`);
    return false;
  }
}

async function testOllama() {
  console.log('\n🦙 Probando OLLAMA...');
  
  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gemma:2b',
        messages: [
          { role: 'user', content: 'Di "Ollama funciona" en una palabra' }
        ],
        stream: false,
        options: {
          num_predict: 10
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.message.content;
    
    console.log('✅ OLLAMA: Funcionando');
    console.log(`   Respuesta: ${content}`);
    return true;
  } catch (error) {
    console.log('❌ OLLAMA: Error');
    console.log(`   ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   TEST DE LAS 3 IAs                   ║');
  console.log('╚═══════════════════════════════════════╝');

  const results = {
    groq: await testGroq(),
    openrouter: await testOpenRouter(),
    ollama: await testOllama()
  };

  console.log('\n╔═══════════════════════════════════════╗');
  console.log('║   RESUMEN                             ║');
  console.log('╚═══════════════════════════════════════╝\n');

  console.log(`Groq:       ${results.groq ? '✅ Funcionando' : '❌ No funciona'}`);
  console.log(`OpenRouter: ${results.openrouter ? '✅ Funcionando' : '❌ No funciona'}`);
  console.log(`Ollama:     ${results.ollama ? '✅ Funcionando' : '❌ No funciona'}`);

  const working = Object.values(results).filter(r => r).length;
  console.log(`\nTotal: ${working}/3 funcionando`);

  if (working === 3) {
    console.log('\n🎉 ¡Todas las IAs están funcionando!');
  } else if (working > 0) {
    console.log('\n⚠️ Algunas IAs no están funcionando');
  } else {
    console.log('\n❌ Ninguna IA está funcionando');
  }
}

runTests().catch(console.error);
