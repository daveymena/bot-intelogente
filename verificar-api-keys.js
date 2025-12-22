const axios = require('axios');
require('dotenv').config();

async function verificarGroqKey(apiKey, index) {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return { index, status: 'OK', key: apiKey.substring(0, 20) + '...' };
  } catch (error) {
    const errorCode = error.response?.data?.error?.code || 'unknown';
    const errorMessage = error.response?.data?.error?.message || error.message;
    return { 
      index, 
      status: 'ERROR', 
      code: errorCode,
      message: errorMessage.substring(0, 100),
      key: apiKey.substring(0, 20) + '...'
    };
  }
}

async function verificarTodasLasKeys() {
  console.log('🔍 Verificando API Keys de Groq...\n');
  
  const keys = [];
  
  // Buscar todas las keys en el .env
  if (process.env.GROQ_API_KEY) keys.push(process.env.GROQ_API_KEY);
  if (process.env.GROQ_API_KEY_2) keys.push(process.env.GROQ_API_KEY_2);
  if (process.env.GROQ_API_KEY_3) keys.push(process.env.GROQ_API_KEY_3);
  if (process.env.GROQ_API_KEY_4) keys.push(process.env.GROQ_API_KEY_4);
  if (process.env.GROQ_API_KEY_5) keys.push(process.env.GROQ_API_KEY_5);
  if (process.env.GROQ_API_KEY_6) keys.push(process.env.GROQ_API_KEY_6);
  if (process.env.GROQ_API_KEY_7) keys.push(process.env.GROQ_API_KEY_7);
  if (process.env.GROQ_API_KEY_8) keys.push(process.env.GROQ_API_KEY_8);
  
  console.log(`📊 Total de API Keys encontradas: ${keys.length}\n`);
  
  if (keys.length === 0) {
    console.log('❌ No se encontraron API Keys en el archivo .env');
    console.log('\n💡 Agrega al menos una:');
    console.log('   GROQ_API_KEY=gsk_XXXXXXXXXXXXXXXX');
    return;
  }
  
  const resultados = [];
  
  for (let i = 0; i < keys.length; i++) {
    console.log(`Verificando API Key #${i + 1}...`);
    const resultado = await verificarGroqKey(keys[i], i + 1);
    resultados.push(resultado);
    
    if (resultado.status === 'OK') {
      console.log(`✅ API Key #${i + 1}: FUNCIONANDO`);
    } else {
      console.log(`❌ API Key #${i + 1}: ${resultado.code}`);
      console.log(`   ${resultado.message}`);
    }
    console.log('');
    
    // Pausa para no saturar
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('═'.repeat(60));
  console.log('📊 RESUMEN');
  console.log('═'.repeat(60));
  
  const funcionando = resultados.filter(r => r.status === 'OK').length;
  const fallando = resultados.filter(r => r.status === 'ERROR').length;
  
  console.log(`✅ Funcionando: ${funcionando}`);
  console.log(`❌ Con errores: ${fallando}`);
  console.log(`📦 Total: ${keys.length}`);
  
  if (funcionando === 0) {
    console.log('\n🚨 CRÍTICO: Ninguna API Key funciona');
    console.log('\n💡 SOLUCIONES:');
    console.log('   1. Obtén nuevas API Keys en https://console.groq.com/');
    console.log('   2. Usa OpenAI como fallback (OPENAI_API_KEY)');
    console.log('   3. Instala Ollama local (sin límites)');
  } else if (funcionando < keys.length / 2) {
    console.log('\n⚠️ ADVERTENCIA: Pocas API Keys funcionando');
    console.log('   Considera obtener más keys para mejor disponibilidad');
  } else {
    console.log('\n✅ Sistema funcionando correctamente');
  }
  
  // Mostrar errores específicos
  const errores = resultados.filter(r => r.status === 'ERROR');
  if (errores.length > 0) {
    console.log('\n📋 ERRORES DETECTADOS:');
    errores.forEach(e => {
      console.log(`\n   API Key #${e.index}:`);
      console.log(`   Código: ${e.code}`);
      console.log(`   Mensaje: ${e.message}`);
    });
  }
}

verificarTodasLasKeys();
