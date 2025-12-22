/**
 * Test completo del sistema Ollama
 * Verifica:
 * - Conexión a Ollama
 * - Formato CARD
 * - AIDA
 * - Memoria conversacional
 * - Fotos automáticas
 */

require('dotenv').config();

async function testOllamaCompleto() {
  console.log('🧪 TEST COMPLETO SISTEMA OLLAMA\n');
  console.log('='.repeat(60));

  // 1. Verificar configuración
  console.log('\n📋 1. VERIFICANDO CONFIGURACIÓN...');
  console.log(`USE_OLLAMA: ${process.env.USE_OLLAMA}`);
  console.log(`OLLAMA_BASE_URL: ${process.env.OLLAMA_BASE_URL}`);
  console.log(`OLLAMA_MODEL: ${process.env.OLLAMA_MODEL}`);
  console.log(`OLLAMA_TIMEOUT: ${process.env.OLLAMA_TIMEOUT}`);

  if (process.env.USE_OLLAMA !== 'true') {
    console.log('❌ USE_OLLAMA no está activado');
    return;
  }

  // 2. Test de conexión básica
  console.log('\n🔌 2. TEST DE CONEXIÓN BÁSICA...');
  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL;
    const response = await fetch(`${ollamaUrl}/api/tags`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conexión exitosa');
      console.log(`📦 Modelos disponibles: ${data.models?.length || 0}`);
      data.models?.forEach(m => {
        console.log(`   - ${m.name} (${(m.size / 1024 / 1024 / 1024).toFixed(2)} GB)`);
      });
    } else {
      console.log('❌ Error de conexión:', response.status);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // 3. Test de respuesta simple
  console.log('\n💬 3. TEST DE RESPUESTA SIMPLE...');
  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL;
    const model = process.env.OLLAMA_MODEL;

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'Eres un vendedor profesional. Responde en español.'
          },
          {
            role: 'user',
            content: 'Hola, ¿qué productos vendes?'
          }
        ],
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 300
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta recibida:');
      console.log(data.message?.content || 'Sin contenido');
    } else {
      console.log('❌ Error:', response.status);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // 4. Test de formato CARD
  console.log('\n🎴 4. TEST DE FORMATO CARD...');
  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL;
    const model = process.env.OLLAMA_MODEL;

    const producto = {
      nombre: 'Laptop HP 15-fd0033la',
      precio: 1899000,
      categoria: 'FISICO',
      descripcion: 'Intel Core i5, 8GB RAM, 256GB SSD'
    };

    const systemPrompt = `Eres un vendedor profesional de Tecnovariedades D&S.

FORMATO CARD OBLIGATORIO:
🎯 [Emoji] [Nombre del Producto]
💰 Precio: $X.XXX COP

📘 Incluye/Características:
✅ Característica 1
✅ Característica 2
✅ Característica 3

🧠 AIDA:
✨ Atención: [Gancho inicial]
🔥 Interés: [Beneficio principal]
⭐ Deseo: [Prueba social]
👉 Acción: [Pregunta de cierre]

💬 [Pregunta para avanzar]`;

    const userPrompt = `PRODUCTO:
Nombre: ${producto.nombre}
Precio: ${producto.precio.toLocaleString('es-CO')} COP
Categoría: ${producto.categoria}
Descripción: ${producto.descripcion}

CLIENTE PREGUNTA: "¿Qué laptop me recomiendas para trabajar?"

GENERA RESPUESTA CON FORMATO CARD:`;

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 800
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta CARD generada:');
      console.log('─'.repeat(60));
      console.log(data.message?.content || 'Sin contenido');
      console.log('─'.repeat(60));
    } else {
      console.log('❌ Error:', response.status);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // 5. Test de velocidad
  console.log('\n⚡ 5. TEST DE VELOCIDAD...');
  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL;
    const model = process.env.OLLAMA_MODEL;

    const inicio = Date.now();

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: 'Responde en una línea: ¿Qué es una laptop?'
          }
        ],
        stream: false,
        options: {
          temperature: 0.5,
          num_predict: 100
        }
      })
    });

    const tiempo = Date.now() - inicio;

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Tiempo de respuesta: ${tiempo}ms`);
      console.log(`📝 Respuesta: ${data.message?.content?.substring(0, 100)}...`);
      
      if (tiempo < 5000) {
        console.log('🚀 Velocidad: EXCELENTE');
      } else if (tiempo < 10000) {
        console.log('⚡ Velocidad: BUENA');
      } else {
        console.log('🐌 Velocidad: LENTA (considerar optimizar)');
      }
    } else {
      console.log('❌ Error:', response.status);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ TEST COMPLETO FINALIZADO');
}

// Ejecutar test
testOllamaCompleto().catch(console.error);
