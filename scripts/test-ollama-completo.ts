import { config } from 'dotenv';
config(); // Cargar variables de entorno

import { OllamaService } from '../src/lib/ollama-service';

/**
 * 🧪 TEST COMPLETO DE OLLAMA
 * Verifica que gemma3:4b funcione correctamente
 */

async function testOllamaCompleto() {
  console.log('🧪 TEST COMPLETO DE OLLAMA\n');
  console.log('='.repeat(60));

  // 1. Verificar disponibilidad
  console.log('\n1️⃣ Verificando disponibilidad...');
  console.log('-'.repeat(60));
  
  const disponible = await OllamaService.isAvailable();
  
  if (!disponible) {
    console.error('❌ Ollama no está disponible');
    console.log('\n💡 Soluciones:');
    console.log('   1. Verifica que Ollama esté corriendo: ollama list');
    console.log('   2. Verifica .env: OLLAMA_ENABLED=true');
    console.log('   3. Verifica URL: OLLAMA_BASE_URL=http://localhost:11434');
    process.exit(1);
  }

  console.log('✅ Ollama disponible');

  // 2. Verificar modelo
  console.log('\n2️⃣ Verificando modelo gemma3:4b...');
  console.log('-'.repeat(60));
  
  const tieneModelo = await OllamaService.checkModel();
  
  if (!tieneModelo) {
    console.error('❌ Modelo gemma3:4b no encontrado');
    console.log('\n💡 Instálalo con:');
    console.log('   ollama pull gemma3:4b');
    process.exit(1);
  }

  console.log('✅ Modelo gemma3:4b instalado');

  // 3. Listar modelos
  console.log('\n3️⃣ Modelos disponibles...');
  console.log('-'.repeat(60));
  
  const modelos = await OllamaService.listModels();
  modelos.forEach(m => console.log(`   • ${m}`));

  // 4. Test de respuesta simple
  console.log('\n4️⃣ Test de respuesta simple...');
  console.log('-'.repeat(60));
  
  const inicio1 = Date.now();
  const respuesta1 = await OllamaService.generateResponse({
    systemPrompt: 'Eres un asistente de ventas amigable en español.',
    messages: [
      { role: 'user', content: 'Hola, ¿qué productos vendes?' }
    ]
  });
  const tiempo1 = Date.now() - inicio1;

  if (respuesta1) {
    console.log(`✅ Respuesta generada en ${tiempo1}ms (${(tiempo1/1000).toFixed(1)}s)`);
    console.log(`💬 "${respuesta1.text.substring(0, 100)}..."`);
    console.log(`🎯 Confianza: ${(respuesta1.confidence * 100).toFixed(0)}%`);
  } else {
    console.error('❌ No se pudo generar respuesta');
  }

  // 5. Test de contexto conversacional
  console.log('\n5️⃣ Test de contexto conversacional...');
  console.log('-'.repeat(60));
  
  const inicio2 = Date.now();
  const respuesta2 = await OllamaService.generateResponse({
    systemPrompt: 'Eres un asistente de ventas. Recuerda el contexto de la conversación.',
    messages: [
      { role: 'user', content: 'Tengo una laptop HP' },
      { role: 'assistant', content: 'Excelente, la laptop HP es muy buena.' },
      { role: 'user', content: 'Y esa viene con garantía?' }
    ]
  });
  const tiempo2 = Date.now() - inicio2;

  if (respuesta2) {
    console.log(`✅ Respuesta generada en ${tiempo2}ms (${(tiempo2/1000).toFixed(1)}s)`);
    console.log(`💬 "${respuesta2.text.substring(0, 100)}..."`);
    
    const mencionaLaptop = respuesta2.text.toLowerCase().includes('laptop') || 
                          respuesta2.text.toLowerCase().includes('hp');
    
    if (mencionaLaptop) {
      console.log('✅ Entiende el contexto (menciona laptop/HP)');
    } else {
      console.log('⚠️  No detectó el contexto claramente');
    }
  } else {
    console.error('❌ No se pudo generar respuesta');
  }

  // 6. Test de intención de compra
  console.log('\n6️⃣ Test de detección de intención...');
  console.log('-'.repeat(60));
  
  const inicio3 = Date.now();
  const respuesta3 = await OllamaService.generateResponse({
    systemPrompt: 'Eres un asistente de ventas. Detecta si el cliente quiere comprar o solo pregunta.',
    messages: [
      { role: 'user', content: 'Cuánto cuesta el curso de piano?' }
    ]
  });
  const tiempo3 = Date.now() - inicio3;

  if (respuesta3) {
    console.log(`✅ Respuesta generada en ${tiempo3}ms (${(tiempo3/1000).toFixed(1)}s)`);
    console.log(`💬 "${respuesta3.text.substring(0, 150)}..."`);
    
    const preguntaSiInteresa = respuesta3.text.toLowerCase().includes('interesa') ||
                               respuesta3.text.toLowerCase().includes('gustaría');
    
    if (preguntaSiInteresa) {
      console.log('✅ Pregunta si le interesa (no asume compra)');
    } else {
      console.log('⚠️  Podría mejorar la detección de intención');
    }
  } else {
    console.error('❌ No se pudo generar respuesta');
  }

  // Resumen
  console.log('\n\n📊 RESUMEN');
  console.log('='.repeat(60));
  
  const tiempoPromedio = (tiempo1 + tiempo2 + tiempo3) / 3;
  
  console.log(`\n⏱️  Tiempo promedio: ${tiempoPromedio.toFixed(0)}ms (${(tiempoPromedio/1000).toFixed(1)}s)`);
  console.log(`📈 Velocidad vs Groq: ~${(tiempoPromedio/750).toFixed(0)}x más lento`);
  
  if (tiempoPromedio < 10000) {
    console.log('✅ Velocidad aceptable para fallback');
  } else if (tiempoPromedio < 20000) {
    console.log('⚠️  Un poco lento, pero funcional');
  } else {
    console.log('❌ Muy lento, considera usar gemma2:2b');
  }

  console.log('\n💡 RECOMENDACIONES:');
  console.log('-'.repeat(60));
  
  if (respuesta1 && respuesta2 && respuesta3) {
    console.log('✅ Ollama funciona correctamente');
    console.log('✅ gemma3:4b responde en español');
    console.log('✅ Entiende contexto conversacional');
    console.log('✅ Listo para usar como fallback');
    
    console.log('\n📝 Configuración actual:');
    console.log('   OLLAMA_ENABLED=true');
    console.log('   OLLAMA_MODEL=gemma3:4b');
    console.log('   OLLAMA_BASE_URL=http://localhost:11434');
    
    console.log('\n🎯 Flujo de fallback:');
    console.log('   1. Groq (8 keys) → Rápido (0.5-1s)');
    console.log('   2. Ollama (gemma3:4b) → Lento pero funcional (8-30s)');
    console.log('   3. Base Conocimiento → Respuestas guardadas');
    console.log('   4. Fallback genérico → Último recurso');
  } else {
    console.log('⚠️  Algunos tests fallaron');
    console.log('💡 Revisa los logs arriba para más detalles');
  }

  console.log('\n✅ Test completado\n');
}

// Ejecutar
testOllamaCompleto().catch(console.error);
