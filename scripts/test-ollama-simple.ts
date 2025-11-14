/**
 * 🧪 TEST SIMPLE DE OLLAMA
 * Prueba directa sin cachés
 */

// Forzar recarga del .env
import { config } from 'dotenv';
config({ override: true });

async function testOllama() {
  console.log('🤖 TEST SIMPLE DE OLLAMA\n');

  // Mostrar configuración
  console.log('📋 Configuración actual:');
  console.log('   OLLAMA_BASE_URL:', process.env.OLLAMA_BASE_URL);
  console.log('   OLLAMA_MODEL:', process.env.OLLAMA_MODEL);
  console.log('   OLLAMA_ENABLED:', process.env.OLLAMA_ENABLED);
  console.log('   OLLAMA_TIMEOUT:', process.env.OLLAMA_TIMEOUT);
  console.log('');

  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const enabled = process.env.OLLAMA_ENABLED === 'true';

  if (!enabled) {
    console.log('❌ OLLAMA_ENABLED no está en "true"');
    console.log('💡 Verifica tu archivo .env');
    return;
  }

  console.log('✅ OLLAMA_ENABLED = true\n');

  // Test 1: Verificar conexión
  console.log('1️⃣ Probando conexión...');
  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conectado exitosamente');
      console.log(`📦 Modelos disponibles: ${data.models?.length || 0}`);
      
      if (data.models && data.models.length > 0) {
        data.models.forEach((m: any) => {
          console.log(`   - ${m.name}`);
        });
      }
      console.log('');
    } else {
      console.log('❌ Error:', response.status, response.statusText);
      return;
    }
  } catch (error: any) {
    console.log('❌ Error de conexión:', error.message);
    return;
  }

  // Test 2: Generar respuesta simple
  console.log('2️⃣ Probando generación de respuesta...');
  try {
    const inicio = Date.now();
    
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || 'gemma:2b',
        messages: [
          { role: 'system', content: 'Eres un asistente de ventas amigable.' },
          { role: 'user', content: 'Hola' }
        ],
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 100
        }
      })
    });

    const tiempo = Date.now() - inicio;

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Respuesta generada en ${(tiempo / 1000).toFixed(2)}s`);
      console.log(`📝 Respuesta: "${data.message.content.substring(0, 100)}..."`);
      console.log('');
    } else {
      console.log('❌ Error:', response.status, response.statusText);
      return;
    }
  } catch (error: any) {
    console.log('❌ Error:', error.message);
    return;
  }

  // Resumen
  console.log('='.repeat(60));
  console.log('✅ OLLAMA FUNCIONA CORRECTAMENTE\n');
  console.log('🚀 Puedes usar Ollama para:');
  console.log('   - Entrenamiento ilimitado (sin gastar tokens)');
  console.log('   - Respuestas rápidas en producción');
  console.log('   - Fallback cuando Groq tenga rate limit\n');
  console.log('💡 Siguiente paso:');
  console.log('   npx tsx scripts/entrenar-bot-automatico.ts\n');
}

testOllama();
