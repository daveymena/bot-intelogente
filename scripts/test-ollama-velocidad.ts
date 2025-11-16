import axios from 'axios';

interface TestResult {
  pregunta: string;
  respuesta: string;
  tiempo: number;
  modelo: string;
  tokens?: number;
}

const OLLAMA_URL = 'http://localhost:11434';

async function testOllamaVelocidad() {
  console.log('🧪 PRUEBA DE VELOCIDAD OLLAMA\n');
  console.log('='.repeat(60));

  const modelos = ['gemma3:4b', 'qwen3:4b'];
  
  const preguntas = [
    'Hola, ¿qué productos vendes?',
    'Necesito un portátil para diseño gráfico',
    'Cuál es el precio del curso de piano?',
    'Tienes megapacks de idiomas?',
    'Quiero comprar una moto, qué opciones hay?'
  ];

  const resultados: TestResult[] = [];

  for (const modelo of modelos) {
    console.log(`\n📊 Probando modelo: ${modelo}`);
    console.log('-'.repeat(60));

    for (const pregunta of preguntas) {
      const inicio = Date.now();
      
      try {
        const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
          model: modelo,
          prompt: `Eres un asistente de ventas de Tecnovariedades D&S en Colombia. Responde en español de forma breve y amigable.

Cliente: ${pregunta}

Asistente:`,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 150
          }
        }, {
          timeout: 30000
        });

        const tiempo = Date.now() - inicio;
        const respuesta = response.data.response.trim();

        resultados.push({
          pregunta,
          respuesta,
          tiempo,
          modelo
        });

        console.log(`\n❓ Pregunta: ${pregunta}`);
        console.log(`💬 Respuesta: ${respuesta.substring(0, 100)}...`);
        console.log(`⏱️  Tiempo: ${tiempo}ms (${(tiempo/1000).toFixed(2)}s)`);

      } catch (error: any) {
        console.error(`❌ Error: ${error.message}`);
        resultados.push({
          pregunta,
          respuesta: 'ERROR',
          tiempo: Date.now() - inicio,
          modelo
        });
      }
    }
  }

  // Resumen estadístico
  console.log('\n\n📈 RESUMEN ESTADÍSTICO');
  console.log('='.repeat(60));

  for (const modelo of modelos) {
    const resultadosModelo = resultados.filter(r => r.modelo === modelo && r.respuesta !== 'ERROR');
    
    if (resultadosModelo.length === 0) continue;

    const tiempos = resultadosModelo.map(r => r.tiempo);
    const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
    const minimo = Math.min(...tiempos);
    const maximo = Math.max(...tiempos);

    console.log(`\n🤖 Modelo: ${modelo}`);
    console.log(`   Respuestas exitosas: ${resultadosModelo.length}/${preguntas.length}`);
    console.log(`   Tiempo promedio: ${promedio.toFixed(0)}ms (${(promedio/1000).toFixed(2)}s)`);
    console.log(`   Tiempo mínimo: ${minimo}ms`);
    console.log(`   Tiempo máximo: ${maximo}ms`);
  }

  // Comparación con Groq
  console.log('\n\n⚡ COMPARACIÓN CON GROQ');
  console.log('='.repeat(60));
  console.log('Groq (llama-3.1-8b):     ~500-1000ms');
  
  for (const modelo of modelos) {
    const resultadosModelo = resultados.filter(r => r.modelo === modelo && r.respuesta !== 'ERROR');
    if (resultadosModelo.length > 0) {
      const promedio = resultadosModelo.reduce((sum, r) => sum + r.tiempo, 0) / resultadosModelo.length;
      const diferencia = promedio - 750; // Promedio Groq
      const porcentaje = ((promedio / 750) * 100).toFixed(0);
      
      console.log(`Ollama (${modelo}): ~${promedio.toFixed(0)}ms (${porcentaje}% vs Groq)`);
      
      if (diferencia > 0) {
        console.log(`   ⚠️  ${(diferencia/1000).toFixed(1)}s más lento que Groq`);
      } else {
        console.log(`   ✅ ${Math.abs(diferencia/1000).toFixed(1)}s más rápido que Groq`);
      }
    }
  }

  // Recomendación
  console.log('\n\n💡 RECOMENDACIÓN');
  console.log('='.repeat(60));
  
  const mejorModelo = modelos.reduce((mejor, actual) => {
    const resultadosMejor = resultados.filter(r => r.modelo === mejor && r.respuesta !== 'ERROR');
    const resultadosActual = resultados.filter(r => r.modelo === actual && r.respuesta !== 'ERROR');
    
    if (resultadosMejor.length === 0) return actual;
    if (resultadosActual.length === 0) return mejor;
    
    const promedioMejor = resultadosMejor.reduce((sum, r) => sum + r.tiempo, 0) / resultadosMejor.length;
    const promedioActual = resultadosActual.reduce((sum, r) => sum + r.tiempo, 0) / resultadosActual.length;
    
    return promedioActual < promedioMejor ? actual : mejor;
  });

  console.log(`\n🏆 Modelo más rápido: ${mejorModelo}`);
  console.log('\n📝 Configuración recomendada para .env:');
  console.log(`OLLAMA_ENABLED=true`);
  console.log(`OLLAMA_MODEL=${mejorModelo}`);
  console.log(`OLLAMA_URL=http://localhost:11434`);

  console.log('\n✅ Prueba completada\n');
}

// Ejecutar
testOllamaVelocidad().catch(console.error);
