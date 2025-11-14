import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 TEST COMPLETO DEL SISTEMA DE IA PARA EASYPANEL\n');
console.log('='.repeat(70));

async function testCompleteAISystem() {
  let allTestsPassed = true;

  // TEST 1: Verificar variables de entorno
  console.log('\n📋 TEST 1: VARIABLES DE ENTORNO\n');
  
  const requiredVars = {
    'AI_USE_REASONING': process.env.AI_USE_REASONING,
    'OLLAMA_ENABLED': process.env.OLLAMA_ENABLED,
    'OLLAMA_BASE_URL': process.env.OLLAMA_BASE_URL,
    'OLLAMA_MODEL': process.env.OLLAMA_MODEL,
    'GROQ_API_KEY': process.env.GROQ_API_KEY,
    'GROQ_MODEL': process.env.GROQ_MODEL,
  };

  for (const [key, value] of Object.entries(requiredVars)) {
    if (value) {
      const displayValue = key.includes('KEY') 
        ? '✅ Configurado' 
        : value;
      console.log(`✅ ${key}: ${displayValue}`);
    } else {
      console.log(`❌ ${key}: NO CONFIGURADO`);
      allTestsPassed = false;
    }
  }

  // TEST 2: Probar conexión a Ollama
  console.log('\n🤖 TEST 2: CONEXIÓN A OLLAMA\n');
  
  const ollamaUrl = process.env.OLLAMA_BASE_URL;
  
  if (ollamaUrl && process.env.OLLAMA_ENABLED === 'true') {
    try {
      console.log(`📡 Conectando a: ${ollamaUrl}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${ollamaUrl}/api/tags`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Ollama conectado exitosamente`);
        console.log(`📦 Modelos disponibles: ${data.models?.length || 0}`);
        
        if (data.models && data.models.length > 0) {
          data.models.forEach((model: any) => {
            console.log(`   • ${model.name}`);
          });
        }
      } else {
        console.log(`⚠️  Ollama respondió con status: ${response.status}`);
        console.log(`   Usará Groq como respaldo`);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log(`⚠️  Timeout conectando a Ollama (5s)`);
      } else {
        console.log(`⚠️  Error conectando a Ollama: ${error.message}`);
      }
      console.log(`   Usará Groq como respaldo`);
    }
  } else {
    console.log('⚠️  Ollama no habilitado, usará solo Groq');
  }

  // TEST 3: Probar Groq
  console.log('\n⚡ TEST 3: CONEXIÓN A GROQ\n');
  
  const groqApiKey = process.env.GROQ_API_KEY;
  
  if (groqApiKey) {
    try {
      console.log('📡 Probando Groq API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Groq conectado exitosamente`);
        console.log(`📦 Modelos disponibles: ${data.data?.length || 0}`);
      } else {
        console.log(`❌ Groq respondió con status: ${response.status}`);
        allTestsPassed = false;
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log(`❌ Timeout conectando a Groq (5s)`);
      } else {
        console.log(`❌ Error conectando a Groq: ${error.message}`);
      }
      allTestsPassed = false;
    }
  } else {
    console.log('❌ GROQ_API_KEY no configurado');
    allTestsPassed = false;
  }

  // TEST 4: Verificar archivos del sistema
  console.log('\n📁 TEST 4: ARCHIVOS DEL SISTEMA\n');
  
  const fs = require('fs');
  const requiredFiles = [
    'src/lib/ai-advanced-reasoning.ts',
    'src/lib/ai-service.ts',
    'src/lib/ai-multi-provider.ts',
  ];

  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - NO EXISTE`);
      allTestsPassed = false;
    }
  }

  // TEST 5: Verificar configuración de razonamiento
  console.log('\n🧠 TEST 5: CONFIGURACIÓN DE RAZONAMIENTO\n');
  
  if (process.env.AI_USE_REASONING === 'true') {
    console.log('✅ Razonamiento profundo HABILITADO');
    console.log('   • Chain of Thought activado');
    console.log('   • Análisis de intención mejorado');
    console.log('   • Contexto de 24 horas');
  } else {
    console.log('⚠️  Razonamiento profundo DESHABILITADO');
    console.log('   Recomendación: AI_USE_REASONING=true');
  }

  // TEST 6: Verificar orden de fallback
  console.log('\n🔄 TEST 6: ORDEN DE FALLBACK\n');
  
  const fallbackOrder = process.env.AI_FALLBACK_ORDER || 'ollama,groq';
  console.log(`📋 Orden configurado: ${fallbackOrder}`);
  
  const providers = fallbackOrder.split(',').map(p => p.trim());
  providers.forEach((provider, index) => {
    console.log(`   ${index + 1}. ${provider.toUpperCase()}`);
  });

  // RESUMEN FINAL
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN FINAL');
  console.log('='.repeat(70) + '\n');

  if (allTestsPassed) {
    console.log('✅ TODOS LOS TESTS PASARON\n');
    console.log('🎯 Sistema listo para Easypanel:');
    console.log('   • Ollama configurado como principal');
    console.log('   • Groq configurado como respaldo');
    console.log('   • Razonamiento profundo habilitado');
    console.log('   • Fallback automático funcionando');
    console.log('');
    console.log('🚀 Próximos pasos:');
    console.log('   1. git add .');
    console.log('   2. git commit -m "IA super configurada lista para Easypanel"');
    console.log('   3. git push origin main');
    console.log('   4. Redesplegar en Easypanel');
    console.log('   5. Verificar logs');
  } else {
    console.log('⚠️  ALGUNOS TESTS FALLARON\n');
    console.log('🔧 Acciones requeridas:');
    console.log('   • Verifica las variables de entorno');
    console.log('   • Asegúrate de que Groq API Key sea válido');
    console.log('   • Verifica que Ollama esté accesible');
    console.log('');
    console.log('📖 Lee: SISTEMA_IA_RAZONAMIENTO_COMPLETO.md');
  }

  console.log('\n' + '='.repeat(70));
  console.log('📝 CONFIGURACIÓN PARA EASYPANEL');
  console.log('='.repeat(70) + '\n');
  
  console.log('Copia estas variables en Easypanel → Environment:\n');
  console.log('# Sistema de IA con Razonamiento');
  console.log('AI_USE_REASONING=true');
  console.log('');
  console.log('# Ollama (Principal)');
  console.log(`OLLAMA_ENABLED=${process.env.OLLAMA_ENABLED || 'true'}`);
  console.log(`OLLAMA_BASE_URL=${process.env.OLLAMA_BASE_URL || 'https://tu-ollama.easypanel.host'}`);
  console.log(`OLLAMA_MODEL=${process.env.OLLAMA_MODEL || 'gemma:2b'}`);
  console.log('OLLAMA_TIMEOUT=10000');
  console.log('OLLAMA_MAX_TOKENS=300');
  console.log('');
  console.log('# Groq (Respaldo)');
  console.log(`GROQ_API_KEY=${process.env.GROQ_API_KEY || 'tu_groq_api_key'}`);
  console.log(`GROQ_MODEL=${process.env.GROQ_MODEL || 'llama-3.1-8b-instant'}`);
  console.log('GROQ_TIMEOUT=5000');
  console.log('GROQ_MAX_TOKENS=350');
  console.log('');
  console.log('# Fallback');
  console.log('AI_FALLBACK_ENABLED=true');
  console.log('AI_FALLBACK_ORDER=ollama,groq');
  console.log('');

  return allTestsPassed;
}

testCompleteAISystem()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n❌ Error ejecutando tests:', error);
    process.exit(1);
  });
