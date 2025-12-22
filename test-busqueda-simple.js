/**
 * Test simple de búsqueda semántica
 */

require('dotenv').config();

async function testSimple() {
  console.log('🧪 TEST SIMPLE - BÚSQUEDA SEMÁNTICA\n');
  console.log('='.repeat(60));

  // Verificar configuración
  console.log('\n📋 CONFIGURACIÓN:');
  console.log(`USE_OLLAMA: ${process.env.USE_OLLAMA}`);
  console.log(`OLLAMA_BASE_URL: ${process.env.OLLAMA_BASE_URL}`);
  console.log(`OLLAMA_MODEL: ${process.env.OLLAMA_MODEL}`);

  if (process.env.USE_OLLAMA !== 'true') {
    console.log('\n❌ USE_OLLAMA no está activado');
    return;
  }

  // Test de conexión a Ollama
  console.log('\n🔌 TEST DE CONEXIÓN:');
  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL;
    const response = await fetch(`${ollamaUrl}/api/tags`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Ollama conectado');
      console.log(`📦 Modelos: ${data.models?.length || 0}`);
    } else {
      console.log('❌ Error de conexión');
      return;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  // Test de análisis semántico
  console.log('\n🧠 TEST DE ANÁLISIS SEMÁNTICO:');
  
  const testCases = [
    { mensaje: 'curso de piano', esperado: 'curso específico de piano' },
    { mensaje: 'curzo de piyano', esperado: 'curso de piano (con corrección)' },
    { mensaje: 'algo para trabajar', esperado: 'laptop para oficina' }
  ];

  for (const test of testCases) {
    console.log(`\n📝 Mensaje: "${test.mensaje}"`);
    console.log(`🎯 Esperado: ${test.esperado}`);
    
    try {
      const ollamaUrl = process.env.OLLAMA_BASE_URL;
      const model = process.env.OLLAMA_MODEL;

      const prompt = `Analiza este mensaje de un cliente y determina qué producto busca:

Mensaje: "${test.mensaje}"

Productos disponibles:
1. Curso Completo de Piano Online - $49.000
2. Laptop HP 15-fd0033la - $1.899.000
3. Megapack de Cursos - $99.000

Responde en JSON:
{
  "productoId": número,
  "razonamiento": "explicación corta"
}`;

      const response = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'Eres un asistente que analiza intenciones. Respondes SOLO en JSON.' },
            { role: 'user', content: prompt }
          ],
          stream: false,
          options: {
            temperature: 0.3,
            num_predict: 200
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.message?.content || '';
        
        console.log('✅ Respuesta de Ollama:');
        console.log(content.substring(0, 200));
        
        // Intentar extraer JSON
        const jsonMatch = content.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          console.log(`💡 Producto ID: ${analysis.productoId}`);
          console.log(`🧠 Razonamiento: ${analysis.razonamiento}`);
        }
      } else {
        console.log('❌ Error en respuesta');
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ TEST COMPLETADO');
}

testSimple().catch(console.error);
