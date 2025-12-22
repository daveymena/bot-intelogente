// Test de Ollama - Verificar que SOLO usa Ollama (sin Groq ni OpenRouter)
require('dotenv').config();

async function testOllamaOnly() {
  console.log('🧪 TEST: Verificando que SOLO se usa Ollama\n');
  
  // Verificar variables de entorno
  console.log('📋 Variables de entorno:');
  console.log('  GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✅ ACTIVA (NO DEBERÍA)' : '❌ Deshabilitada (CORRECTO)');
  console.log('  OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? '✅ ACTIVA (NO DEBERÍA)' : '❌ Deshabilitada (CORRECTO)');
  console.log('  OLLAMA_BASE_URL:', process.env.OLLAMA_BASE_URL || '❌ NO CONFIGURADA');
  console.log('  OLLAMA_ENABLED:', process.env.OLLAMA_ENABLED);
  console.log('  AI_PROVIDER:', process.env.AI_PROVIDER);
  console.log('  AI_FALLBACK_ENABLED:', process.env.AI_FALLBACK_ENABLED);
  console.log('  AI_FALLBACK_ORDER:', process.env.AI_FALLBACK_ORDER);
  console.log('');

  // Test 1: Verificar conexión directa a Ollama
  console.log('🔌 Test 1: Conexión directa a Ollama');
  try {
    const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
        prompt: 'Di solo "Hola desde Ollama"',
        stream: false
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('  ✅ Ollama responde correctamente');
      console.log('  📝 Respuesta:', data.response?.substring(0, 100));
    } else {
      console.log('  ❌ Error en Ollama:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('  ❌ Error conectando a Ollama:', error.message);
  }
  console.log('');

  // Test 2: Probar el servicio de IA
  console.log('🤖 Test 2: Servicio de IA (debe usar SOLO Ollama)');
  try {
    const { AIService } = require('./src/lib/ai-service.ts');
    
    const response = await AIService.generateResponse(
      'Hola, ¿tienes laptops disponibles?',
      [],
      { name: 'Test User', phone: '1234567890' }
    );

    console.log('  ✅ Respuesta generada');
    console.log('  📝 Respuesta:', response.substring(0, 150) + '...');
    console.log('  🔍 Proveedor usado:', response.includes('Ollama') ? 'Ollama' : 'Desconocido');
  } catch (error) {
    console.log('  ❌ Error:', error.message);
  }
  console.log('');

  // Test 3: Verificar que NO se usan otros proveedores
  console.log('🚫 Test 3: Verificar que NO se usan Groq ni OpenRouter');
  const warnings = [];
  
  if (process.env.GROQ_API_KEY) {
    warnings.push('⚠️  GROQ_API_KEY está activa - debería estar comentada');
  }
  if (process.env.OPENROUTER_API_KEY) {
    warnings.push('⚠️  OPENROUTER_API_KEY está activa - debería estar comentada');
  }
  if (process.env.AI_FALLBACK_ENABLED === 'true') {
    warnings.push('⚠️  AI_FALLBACK_ENABLED está en true - debería ser false');
  }
  if (process.env.AI_PROVIDER !== 'ollama') {
    warnings.push('⚠️  AI_PROVIDER no es "ollama" - debería ser "ollama"');
  }

  if (warnings.length > 0) {
    console.log('  ❌ Advertencias encontradas:');
    warnings.forEach(w => console.log('    ' + w));
  } else {
    console.log('  ✅ Configuración correcta - SOLO Ollama activo');
  }
  console.log('');

  console.log('✅ Test completado\n');
}

testOllamaOnly().catch(console.error);
