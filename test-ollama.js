/**
 * 🧪 TEST DE OLLAMA
 * Prueba la conexión y respuestas de Ollama
 */

const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'https://bot-whatsapp-ollama.sqaoeo.easypanel.host';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma:2b';

console.log('🧪 INICIANDO PRUEBAS DE OLLAMA\n');
console.log('📍 URL:', OLLAMA_URL);
console.log('🤖 Modelo:', OLLAMA_MODEL);
console.log('─'.repeat(60));

// Test 1: Verificar que Ollama está disponible
async function testConnection() {
  console.log('\n📡 Test 1: Verificando conexión...');
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/tags`, {
      timeout: 5000
    });
    
    console.log('✅ Ollama está disponible');
    console.log('📦 Modelos instalados:');
    response.data.models.forEach(model => {
      console.log(`   - ${model.name} (${(model.size / 1024 / 1024 / 1024).toFixed(2)} GB)`);
    });
    
    // Verificar si el modelo configurado está instalado
    const modelExists = response.data.models.some(m => m.name === OLLAMA_MODEL);
    if (modelExists) {
      console.log(`✅ Modelo ${OLLAMA_MODEL} está instalado`);
    } else {
      console.log(`⚠️  Modelo ${OLLAMA_MODEL} NO está instalado`);
      console.log(`   Instalar con: docker exec -it ollama ollama pull ${OLLAMA_MODEL}`);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('   Ollama no está corriendo o la URL es incorrecta');
    }
    return false;
  }
}

// Test 2: Prueba simple de generación
async function testSimpleGeneration() {
  console.log('\n💬 Test 2: Generación simple...');
  try {
    const startTime = Date.now();
    
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt: 'Responde en español: ¿Qué es un portátil?',
      stream: false
    }, {
      timeout: 30000
    });
    
    const duration = Date.now() - startTime;
    
    console.log('✅ Respuesta generada en', duration, 'ms');
    console.log('📝 Respuesta:', response.data.response.substring(0, 200) + '...');
    console.log('📊 Tokens:', response.data.eval_count || 'N/A');
    
    return true;
  } catch (error) {
    console.log('❌ Error en generación:', error.message);
    return false;
  }
}

// Test 3: Prueba de chat (conversación)
async function testChat() {
  console.log('\n💭 Test 3: Modo chat...');
  try {
    const startTime = Date.now();
    
    const response = await axios.post(`${OLLAMA_URL}/api/chat`, {
      model: OLLAMA_MODEL,
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente de ventas profesional. Responde en español de forma breve y amigable.'
        },
        {
          role: 'user',
          content: 'Hola, busco un portátil para diseño gráfico'
        }
      ],
      stream: false
    }, {
      timeout: 30000
    });
    
    const duration = Date.now() - startTime;
    
    console.log('✅ Chat respondió en', duration, 'ms');
    console.log('📝 Respuesta:', response.data.message.content.substring(0, 200) + '...');
    
    return true;
  } catch (error) {
    console.log('❌ Error en chat:', error.message);
    return false;
  }
}

// Test 4: Prueba de búsqueda de productos (caso real)
async function testProductSearch() {
  console.log('\n🔍 Test 4: Búsqueda de productos...');
  try {
    const startTime = Date.now();
    
    const productos = [
      '1. Portátil HP Ryzen 5 - $1.500.000',
      '2. Portátil Lenovo i5 - $1.800.000',
      '3. Portátil Asus Ryzen 7 - $2.200.000',
      '4. Portátil Dell i7 - $2.500.000'
    ];
    
    const prompt = `Eres un experto en productos. El cliente pregunta: "quiero un portátil para diseño gráfico"

Productos disponibles:
${productos.join('\n')}

Responde SOLO con el número del producto más adecuado y una razón breve (máximo 20 palabras).
Formato: "Producto X: [razón]"`;
    
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false
    }, {
      timeout: 30000
    });
    
    const duration = Date.now() - startTime;
    
    console.log('✅ Búsqueda completada en', duration, 'ms');
    console.log('📝 Recomendación:', response.data.response.substring(0, 150));
    
    return true;
  } catch (error) {
    console.log('❌ Error en búsqueda:', error.message);
    return false;
  }
}

// Test 5: Prueba de velocidad con diferentes tamaños
async function testSpeed() {
  console.log('\n⚡ Test 5: Prueba de velocidad...');
  
  const prompts = [
    'Hola',
    'Hola, ¿tienes portátiles?',
    'Hola, busco un portátil para diseño gráfico con buen procesador y RAM'
  ];
  
  for (let i = 0; i < prompts.length; i++) {
    try {
      const startTime = Date.now();
      
      await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: OLLAMA_MODEL,
        prompt: prompts[i],
        stream: false
      }, {
        timeout: 30000
      });
      
      const duration = Date.now() - startTime;
      console.log(`   Prompt ${i + 1} (${prompts[i].length} chars): ${duration}ms`);
      
    } catch (error) {
      console.log(`   Prompt ${i + 1}: Error - ${error.message}`);
    }
  }
  
  return true;
}

// Ejecutar todas las pruebas
async function runAllTests() {
  console.log('\n🚀 Ejecutando todas las pruebas...\n');
  
  const results = {
    connection: await testConnection(),
    simpleGeneration: false,
    chat: false,
    productSearch: false,
    speed: false
  };
  
  if (results.connection) {
    results.simpleGeneration = await testSimpleGeneration();
    results.chat = await testChat();
    results.productSearch = await testProductSearch();
    results.speed = await testSpeed();
  }
  
  // Resumen
  console.log('\n' + '═'.repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('═'.repeat(60));
  
  const tests = [
    ['Conexión', results.connection],
    ['Generación Simple', results.simpleGeneration],
    ['Chat', results.chat],
    ['Búsqueda de Productos', results.productSearch],
    ['Velocidad', results.speed]
  ];
  
  tests.forEach(([name, passed]) => {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}`);
  });
  
  const passedCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  console.log('\n' + '─'.repeat(60));
  console.log(`Resultado: ${passedCount}/${totalCount} pruebas pasadas`);
  
  if (passedCount === totalCount) {
    console.log('🎉 ¡Todas las pruebas pasaron! Ollama está funcionando correctamente.');
  } else if (passedCount === 0) {
    console.log('❌ Ninguna prueba pasó. Verifica la configuración de Ollama.');
  } else {
    console.log('⚠️  Algunas pruebas fallaron. Revisa los errores arriba.');
  }
  
  console.log('═'.repeat(60));
}

// Ejecutar
runAllTests().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
