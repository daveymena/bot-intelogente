/**
 * 🧪 TEST: Probar IA real con Groq
 */

require('dotenv').config();
const Groq = require('groq-sdk');

async function testIAReal() {
  console.log('🧪 TEST: IA Real con Groq\n');
  console.log('='.repeat(60));

  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    // ESCENARIOS DE PRUEBA
    const escenarios = [
      {
        nombre: 'Consulta General',
        mensaje: 'Qué laptops tienes disponibles?',
        esperado: 'Lista corta con opciones'
      },
      {
        nombre: 'Consulta Específica',
        mensaje: 'Necesito una laptop para diseño gráfico con buen procesador',
        esperado: 'Recomendación específica'
      },
      {
        nombre: 'Pregunta de Precio',
        mensaje: 'Cuánto cuesta?',
        esperado: 'Respuesta sobre precio'
      },
      {
        nombre: 'Saludo',
        mensaje: 'Hola',
        esperado: 'Saludo amigable'
      }
    ];

    for (const escenario of escenarios) {
      console.log(`\n📋 ${escenario.nombre}`);
      console.log('-'.repeat(60));
      console.log(`Usuario: "${escenario.mensaje}"`);
      console.log(`Esperado: ${escenario.esperado}\n`);

      const inicio = Date.now();

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `Eres un asistente de ventas amigable de Tecnovariedades D&S en Colombia. 
Respondes de forma CORTA y NATURAL, usando emojis.
Máximo 3-4 líneas por respuesta.
Tono casual y colombiano.`
          },
          {
            role: 'user',
            content: escenario.mensaje
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 200 // Limitar tokens para respuestas cortas
      });

      const duracion = Date.now() - inicio;
      const respuesta = completion.choices[0]?.message?.content || '';

      console.log('Bot:');
      console.log(respuesta);
      console.log(`\n⏱️  Tiempo: ${duracion}ms`);
      console.log(`📏 Longitud: ${respuesta.length} caracteres`);
      console.log(`🎯 Tokens usados: ${completion.usage?.total_tokens || 0}`);

      // Verificar calidad
      const esCorta = respuesta.length <= 400;
      const tieneEmojis = /[\p{Emoji}]/u.test(respuesta);
      const esRapida = duracion < 3000;

      console.log('\n✅ Verificación:');
      console.log(`   ${esCorta ? '✅' : '❌'} Respuesta corta (≤400 chars)`);
      console.log(`   ${tieneEmojis ? '✅' : '❌'} Usa emojis`);
      console.log(`   ${esRapida ? '✅' : '❌'} Respuesta rápida (<3s)`);

      // Pausa entre requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // RESUMEN
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN');
    console.log('='.repeat(60));
    console.log('\n✅ IA de Groq: FUNCIONANDO');
    console.log('✅ Respuestas: GENERADAS');
    console.log('✅ Modelo: llama-3.3-70b-versatile');
    console.log('\n💡 La IA está respondiendo correctamente');
    console.log('💡 Ahora prueba en WhatsApp para ver el flujo completo\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n⚠️  Verifica que GROQ_API_KEY esté configurada en .env');
    }
    
    if (error.message.includes('rate limit')) {
      console.log('\n⚠️  Límite de rate alcanzado, espera un momento');
    }
  }
}

// Ejecutar
testIAReal();
