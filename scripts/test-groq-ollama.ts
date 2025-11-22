/**
 * Script para probar Groq y Ollama
 * Verifica que ambas IAs estén configuradas correctamente
 */

import { sendToGroq, sendToOllama, sendWithFallback, getApiStats } from '@/conversational-module/ai/groqClient';

async function testGroqOllama() {
  console.log('🧪 PRUEBA DE GROQ Y OLLAMA\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const testMessage = [
    {
      role: 'system' as const,
      content: 'Eres un asistente de ventas amigable. Responde en español de forma breve.',
    },
    {
      role: 'user' as const,
      content: 'Hola, ¿qué productos tienes?',
    },
  ];

  // 1. Probar Groq
  console.log('1️⃣ PROBANDO GROQ\n');
  console.log('Configuración:');
  console.log(`   • API Keys disponibles: ${getApiStats().totalKeys}`);
  console.log(`   • API Key actual: ${getApiStats().currentKey}`);
  console.log(`   • Modelo: ${process.env.GROQ_MODEL || 'llama-3.1-8b-instant'}`);
  console.log(`   • Max tokens: ${process.env.GROQ_MAX_TOKENS || '300'}\n`);

  try {
    console.log('Enviando mensaje a Groq...');
    const startGroq = Date.now();
    const groqResponse = await sendToGroq(testMessage, {
      temperature: 0.7,
      maxTokens: 100,
    });
    const timeGroq = Date.now() - startGroq;

    console.log('✅ Groq respondió exitosamente\n');
    console.log('Respuesta:');
    console.log(`   "${groqResponse.content}"\n`);
    console.log('Estadísticas:');
    console.log(`   • Modelo usado: ${groqResponse.model}`);
    console.log(`   • Tiempo: ${timeGroq}ms`);
    if (groqResponse.usage) {
      console.log(`   • Tokens prompt: ${groqResponse.usage.prompt_tokens}`);
      console.log(`   • Tokens respuesta: ${groqResponse.usage.completion_tokens}`);
      console.log(`   • Tokens totales: ${groqResponse.usage.total_tokens}`);
    }
    console.log();
  } catch (error: any) {
    console.error('❌ Error con Groq:', error.message);
    console.log();
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 2. Probar Ollama
  console.log('2️⃣ PROBANDO OLLAMA\n');
  console.log('Configuración:');
  console.log(`   • Habilitado: ${process.env.OLLAMA_ENABLED}`);
  console.log(`   • URL: ${process.env.OLLAMA_BASE_URL}`);
  console.log(`   • Modelo: ${process.env.OLLAMA_MODEL || 'gemma:2b'}`);
  console.log(`   • Timeout: ${process.env.OLLAMA_TIMEOUT || '60000'}ms\n`);

  if (process.env.OLLAMA_ENABLED === 'true') {
    try {
      console.log('Enviando mensaje a Ollama...');
      const startOllama = Date.now();
      const ollamaResponse = await sendToOllama(testMessage, {
        temperature: 0.7,
      });
      const timeOllama = Date.now() - startOllama;

      console.log('✅ Ollama respondió exitosamente\n');
      console.log('Respuesta:');
      console.log(`   "${ollamaResponse.content}"\n`);
      console.log('Estadísticas:');
      console.log(`   • Modelo usado: ${ollamaResponse.model}`);
      console.log(`   • Tiempo: ${timeOllama}ms`);
      console.log();
    } catch (error: any) {
      console.error('❌ Error con Ollama:', error.message);
      console.log('   Nota: Ollama puede estar lento o no disponible');
      console.log();
    }
  } else {
    console.log('⚠️  Ollama está desactivado en .env');
    console.log();
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 3. Probar sistema con fallback
  console.log('3️⃣ PROBANDO SISTEMA CON FALLBACK\n');
  console.log('Configuración:');
  console.log(`   • Fallback habilitado: ${process.env.AI_FALLBACK_ENABLED !== 'false' ? 'Sí' : 'No'}`);
  console.log(`   • Flujo: Groq (rotación) → Ollama → Estático\n`);

  try {
    console.log('Enviando mensaje con fallback automático...');
    const startFallback = Date.now();
    const fallbackResponse = await sendWithFallback(testMessage, {
      temperature: 0.7,
      maxTokens: 100,
    });
    const timeFallback = Date.now() - startFallback;

    console.log('✅ Sistema respondió exitosamente\n');
    console.log('Respuesta:');
    console.log(`   "${fallbackResponse.content}"\n`);
    console.log('Estadísticas:');
    console.log(`   • Proveedor usado: ${fallbackResponse.model}`);
    console.log(`   • Tiempo total: ${timeFallback}ms`);
    console.log();
  } catch (error: any) {
    console.error('❌ Error en sistema con fallback:', error.message);
    console.log();
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 4. Resumen
  console.log('📊 RESUMEN\n');
  console.log('Configuración actual:');
  console.log(`   • Groq: ✅ Activo (${getApiStats().totalKeys} API keys)`);
  console.log(`   • Ollama: ${process.env.OLLAMA_ENABLED === 'true' ? '✅ Activo' : '❌ Desactivado'}`);
  console.log(`   • Fallback: ${process.env.AI_FALLBACK_ENABLED !== 'false' ? '✅ Activo' : '❌ Desactivado'}`);
  console.log();

  console.log('Flujo de respuesta:');
  console.log('   1. Groq (primario) con rotación de 3 API keys');
  console.log('   2. Ollama (fallback) si Groq falla');
  console.log('   3. Respuesta estática si ambos fallan');
  console.log();

  console.log('Ventajas:');
  console.log('   ✅ Rotación automática de API keys de Groq');
  console.log('   ✅ Fallback a Ollama si Groq alcanza límite');
  console.log('   ✅ Respuesta de emergencia si todo falla');
  console.log('   ✅ Sistema resiliente y confiable');
  console.log();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ PRUEBA COMPLETADA\n');
}

// Ejecutar
testGroqOllama().catch(console.error);
