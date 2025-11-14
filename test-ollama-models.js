// Test para verificar qué modelos tiene Ollama
require('dotenv').config();

async function checkOllamaModels() {
  console.log('🔍 Verificando modelos disponibles en Ollama\n');
  console.log('📍 URL:', process.env.OLLAMA_BASE_URL);
  console.log('🤖 Modelo configurado:', process.env.OLLAMA_MODEL);
  console.log('');

  // Test 1: Verificar que Ollama responde
  console.log('1️⃣ Test: ¿Ollama está activo?');
  try {
    const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/tags`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('  ✅ Ollama está activo');
      console.log('  📦 Modelos disponibles:');
      
      if (data.models && data.models.length > 0) {
        data.models.forEach(model => {
          const isConfigured = model.name === process.env.OLLAMA_MODEL;
          console.log(`    ${isConfigured ? '✅' : '  '} ${model.name} (${(model.size / 1024 / 1024 / 1024).toFixed(2)} GB)`);
        });
      } else {
        console.log('    ⚠️  No hay modelos instalados');
      }
    } else {
      console.log('  ❌ Error:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('  ❌ Error conectando:', error.message);
  }

  console.log('');

  // Test 2: Probar el modelo configurado
  console.log('2️⃣ Test: ¿El modelo configurado funciona?');
  try {
    const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL,
        prompt: 'Di solo "OK"',
        stream: false
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('  ✅ Modelo funciona correctamente');
      console.log('  📝 Respuesta:', data.response);
    } else {
      console.log('  ❌ Error:', response.status, response.statusText);
      
      if (response.status === 404) {
        console.log('  💡 El modelo no existe. Modelos disponibles arriba ☝️');
      }
    }
  } catch (error) {
    console.log('  ❌ Error:', error.message);
  }

  console.log('');

  // Test 3: Probar con llama3.2:3b (el anterior)
  console.log('3️⃣ Test: ¿Funciona llama3.2:3b?');
  try {
    const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:3b',
        prompt: 'Di solo "OK"',
        stream: false
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('  ✅ llama3.2:3b funciona');
      console.log('  📝 Respuesta:', data.response);
      console.log('  💡 Puedes usar este modelo en .env');
    } else {
      console.log('  ❌ Error:', response.status);
    }
  } catch (error) {
    console.log('  ❌ Error:', error.message);
  }

  console.log('');
  console.log('📋 RECOMENDACIÓN:');
  console.log('  - Si llama3.2:1b no existe, usa llama3.2:3b');
  console.log('  - O instala llama3.2:1b en Ollama con: ollama pull llama3.2:1b');
  console.log('  - Actualiza .env con el modelo que funcione');
}

checkOllamaModels().catch(console.error);
