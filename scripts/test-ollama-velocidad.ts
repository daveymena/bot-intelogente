/**
 * Test de velocidad de Ollama
 * Verifica que Ollama esté funcionando rápido y correctamente
 */

import { AIMultiProvider } from '../src/lib/ai-multi-provider';

async function testOllamaVelocidad() {
  console.log('🚀 Test de Velocidad de Ollama\n');
  console.log('='.repeat(60) + '\n');

  // Configuración - Cargar .env
  require('dotenv').config();
  
  const ollamaUrl = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_URL || 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL || 'gemma:2b';

  console.log(`📍 URL: ${ollamaUrl}`);
  console.log(`🤖 Modelo: ${model}`);
  console.log(`⏱️  Timeout: ${process.env.OLLAMA_TIMEOUT || '10000'}ms\n`);

  // Test 1: Verificar conexión
  console.log('1️⃣ Verificando conexión con Ollama...');
  try {
    const response = await fetch(`${ollamaUrl}/api/tags`);
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Ollama conectado`);
      console.log(`   📦 Modelos disponibles: ${data.models?.length || 0}`);
      
      if (data.models) {
        data.models.forEach((m: any) => {
          console.log(`      - ${m.name} (${(m.size / 1024 / 1024 / 1024).toFixed(2)} GB)`);
        });
      }
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`);
    console.error('\n💡 Verifica que Ollama esté corriendo y accesible\n');
    return;
  }

  console.log('');

  // Test 2: Respuesta simple (velocidad)
  console.log('2️⃣ Test de velocidad - Respuesta simple...');
  try {
    const startTime = Date.now();
    
    const response = await AIMultiProvider.generateCompletion([
      {
        role: 'system',
        content: 'Eres un asistente de ventas conciso y directo.'
      },
      {
        role: 'user',
        content: 'Hola'
      }
    ], {
      max_tokens: 50
    });

    const responseTime = Date.now() - startTime;
    
    console.log(`   ⚡ Tiempo de respuesta: ${responseTime}ms`);
    console.log(`   🤖 Provider: ${response.provider}`);
    console.log(`   📝 Respuesta: "${response.content.slice(0, 100)}..."`);
    
    if (responseTime < 2000) {
      console.log(`   ✅ EXCELENTE - Muy rápido!`);
    } else if (responseTime < 5000) {
      console.log(`   ✅ BUENO - Velocidad aceptable`);
    } else {
      console.log(`   ⚠️ LENTO - Considera optimizar`);
    }
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`);
  }

  console.log('');

  // Test 3: Respuesta de producto (caso real)
  console.log('3️⃣ Test de caso real - Consulta de producto...');
  try {
    const startTime = Date.now();
    
    const response = await AIMultiProvider.generateCompletion([
      {
        role: 'system',
        content: 'Eres un asistente de ventas de tecnología. Responde de forma breve y útil.'
      },
      {
        role: 'user',
        content: '¿Tienes laptops disponibles?'
      }
    ], {
      max_tokens: 150
    });

    const responseTime = Date.now() - startTime;
    
    console.log(`   ⚡ Tiempo de respuesta: ${responseTime}ms`);
    console.log(`   🤖 Provider: ${response.provider}`);
    console.log(`   📝 Respuesta: "${response.content}"`);
    
    if (responseTime < 3000) {
      console.log(`   ✅ EXCELENTE - Cliente no esperará mucho`);
    } else if (responseTime < 7000) {
      console.log(`   ✅ ACEPTABLE - Velocidad razonable`);
    } else {
      console.log(`   ⚠️ LENTO - Cliente puede impacientarse`);
    }
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`);
  }

  console.log('');

  // Test 4: Múltiples requests (carga)
  console.log('4️⃣ Test de carga - 5 requests consecutivos...');
  const times: number[] = [];
  
  for (let i = 1; i <= 5; i++) {
    try {
      const startTime = Date.now();
      
      await AIMultiProvider.generateCompletion([
        {
          role: 'system',
          content: 'Responde en una palabra.'
        },
        {
          role: 'user',
          content: `Test ${i}`
        }
      ], {
        max_tokens: 10
      });

      const responseTime = Date.now() - startTime;
      times.push(responseTime);
      
      console.log(`   Request ${i}/5: ${responseTime}ms`);
      
      // Pequeño delay entre requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error: any) {
      console.error(`   Request ${i}/5: ❌ ${error.message}`);
    }
  }

  if (times.length > 0) {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log(`\n   📊 Estadísticas:`);
    console.log(`      Promedio: ${avgTime.toFixed(0)}ms`);
    console.log(`      Mínimo: ${minTime}ms`);
    console.log(`      Máximo: ${maxTime}ms`);
    
    if (avgTime < 2000) {
      console.log(`      ✅ Rendimiento EXCELENTE bajo carga`);
    } else if (avgTime < 4000) {
      console.log(`      ✅ Rendimiento BUENO bajo carga`);
    } else {
      console.log(`      ⚠️ Rendimiento MEJORABLE bajo carga`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✨ Test completado!\n');

  // Recomendaciones
  console.log('💡 Recomendaciones para optimizar velocidad:\n');
  console.log('1. Usa modelos pequeños para respuestas rápidas:');
  console.log('   - gemma:2b (2GB) - MUY RÁPIDO ⚡');
  console.log('   - phi:2.7b (2.7GB) - RÁPIDO');
  console.log('   - llama3.2:3b (3GB) - BALANCEADO\n');
  
  console.log('2. Ajusta max_tokens según necesidad:');
  console.log('   - Saludos: 50 tokens');
  console.log('   - Respuestas cortas: 150 tokens');
  console.log('   - Respuestas detalladas: 300 tokens\n');
  
  console.log('3. Configura timeout apropiado:');
  console.log('   - OLLAMA_TIMEOUT=10000 (10 segundos)\n');
  
  console.log('4. Usa GPU si está disponible en tu servidor\n');
  
  console.log('5. Considera fallback a Groq para respuestas complejas\n');
}

testOllamaVelocidad().catch(console.error);
