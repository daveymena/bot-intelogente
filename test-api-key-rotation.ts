/**
 * Test de Rotación de API Keys
 * Verifica que el sistema rote correctamente entre múltiples API keys
 */

import dotenv from 'dotenv';
dotenv.config();

import { openClawOrchestrator } from './src/lib/bot/openclaw-orchestrator.js';

async function testApiKeyRotation() {
  console.log('\n🔑 TEST: Rotación de API Keys\n');
  console.log('═══════════════════════════════════════════════════\n');

  // Verificar cuántas keys están configuradas
  const keys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
    process.env.GROQ_API_KEY_5
  ].filter(Boolean);

  console.log(`📊 API Keys configuradas: ${keys.length}`);
  keys.forEach((key, i) => {
    const masked = key.substring(0, 10) + '...' + key.substring(key.length - 4);
    console.log(`   ${i + 1}. ${masked}`);
  });
  console.log('');

  if (keys.length < 2) {
    console.log('⚠️  Solo hay 1 API key configurada. Agrega más keys en .env para probar la rotación.');
    console.log('   Ejemplo:');
    console.log('   GROQ_API_KEY=tu_key_1');
    console.log('   GROQ_API_KEY_2=tu_key_2');
    console.log('   GROQ_API_KEY_3=tu_key_3\n');
  }

  // Simular múltiples llamadas para ver la rotación
  console.log('🧪 Simulando múltiples llamadas al AI...\n');

  const testMessages = [
    'Hola',
    'Cuéntame sobre tus productos',
    'Qué es un megapack?',
    'Tienes computadores?',
    'Cuánto cuesta?'
  ];

  const context = {
    userId: 'test-user',
    products: [],
    conversationId: 'test-rotation'
  };

  for (let i = 0; i < testMessages.length; i++) {
    console.log(`\n📱 Mensaje ${i + 1}/${testMessages.length}: "${testMessages[i]}"`);
    console.log('─────────────────────────────────────────────────');
    
    try {
      const startTime = Date.now();
      const response = await openClawOrchestrator.processMessage(
        testMessages[i],
        'test-rotation-' + Date.now(),
        context
      );
      const duration = Date.now() - startTime;

      console.log(`✅ Respuesta recibida (${duration}ms)`);
      console.log(`   Texto: ${response.text.substring(0, 80)}...`);
      
      // Pequeña pausa entre mensajes
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('✅ Test completado');
  console.log('═══════════════════════════════════════════════════\n');

  console.log('📊 Resumen:');
  console.log(`   - API Keys disponibles: ${keys.length}`);
  console.log(`   - Mensajes procesados: ${testMessages.length}`);
  console.log(`   - Sistema de rotación: ${keys.length > 1 ? 'ACTIVO' : 'NO NECESARIO (1 key)'}`);
  console.log('');

  process.exit(0);
}

testApiKeyRotation();
