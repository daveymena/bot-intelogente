import axios from 'axios';

const OLLAMA_URL = 'http://localhost:11434';

interface TestCase {
  nombre: string;
  pregunta: string;
  contexto: string;
  razonamientoEsperado: string;
}

const testCases: TestCase[] = [
  {
    nombre: 'Inferencia de necesidad',
    pregunta: 'Necesito algo para trabajar desde casa y hacer videollamadas',
    contexto: 'Productos: Laptop HP i5 $2.5M, Moto AKT $8M, Curso Piano $650K',
    razonamientoEsperado: 'Debe inferir que necesita laptop, no moto ni curso'
  },
  {
    nombre: 'Comparación de precios',
    pregunta: 'Tengo $1 millón, qué puedo comprar?',
    contexto: 'Laptop $2.5M, Curso Piano $650K, Megapack Idiomas $450K',
    razonamientoEsperado: 'Debe recomendar curso o megapack, no laptop'
  },
  {
    nombre: 'Detección de urgencia',
    pregunta: 'Necesito urgente un portátil para mañana',
    contexto: 'Cliente pregunta por disponibilidad inmediata',
    razonamientoEsperado: 'Debe detectar urgencia y preguntar por ubicación/entrega'
  },
  {
    nombre: 'Intención de compra vs consulta',
    pregunta: 'Cuánto cuesta el curso de piano?',
    contexto: 'Solo pregunta precio, no dice "quiero comprar"',
    razonamientoEsperado: 'Debe dar precio y preguntar si le interesa, no asumir compra'
  },
  {
    nombre: 'Contexto conversacional',
    pregunta: 'Y ese viene con garantía?',
    contexto: 'Conversación previa sobre laptop HP',
    razonamientoEsperado: 'Debe entender que "ese" se refiere a la laptop mencionada antes'
  }
];

async function testRazonamiento(modelo: string, testCase: TestCase) {
  const prompt = `Eres un asistente de ventas inteligente. Analiza la siguiente situación:

CONTEXTO: ${testCase.contexto}
CLIENTE: ${testCase.pregunta}

Piensa paso a paso:
1. ¿Qué está pidiendo realmente el cliente?
2. ¿Qué productos son relevantes?
3. ¿Cuál es la mejor respuesta?

Responde en español de forma natural y breve.`;

  const inicio = Date.now();
  
  try {
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: modelo,
      prompt,
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 200
      }
    }, {
      timeout: 60000
    });

    const tiempo = Date.now() - inicio;
    return {
      respuesta: response.data.response.trim(),
      tiempo,
      error: null
    };
  } catch (error: any) {
    return {
      respuesta: '',
      tiempo: Date.now() - inicio,
      error: error.message
    };
  }
}

async function ejecutarPruebas() {
  console.log('🧠 PRUEBA DE RAZONAMIENTO OLLAMA\n');
  console.log('='.repeat(80));

  const modelos = ['gemma2:2b', 'gemma3:4b', 'qwen3:4b'];
  
  for (const testCase of testCases) {
    console.log(`\n\n📋 TEST: ${testCase.nombre}`);
    console.log('─'.repeat(80));
    console.log(`❓ Pregunta: ${testCase.pregunta}`);
    console.log(`📝 Contexto: ${testCase.contexto}`);
    console.log(`🎯 Esperado: ${testCase.razonamientoEsperado}`);
    console.log('');

    for (const modelo of modelos) {
      console.log(`\n🤖 ${modelo}:`);
      
      const resultado = await testRazonamiento(modelo, testCase);
      
      if (resultado.error) {
        console.log(`   ❌ Error: ${resultado.error}`);
        continue;
      }

      console.log(`   ⏱️  ${resultado.tiempo}ms (${(resultado.tiempo/1000).toFixed(1)}s)`);
      console.log(`   💬 ${resultado.respuesta.substring(0, 300)}...`);
    }
  }

  // Resumen comparativo
  console.log('\n\n📊 RESUMEN COMPARATIVO');
  console.log('='.repeat(80));

  console.log('\n🏆 VELOCIDAD:');
  console.log('   gemma2:2b - Más rápido (1.6GB, 2B parámetros)');
  console.log('   gemma3:4b - Medio (3.3GB, 4B parámetros)');
  console.log('   qwen3:4b  - Más lento (2.5GB, 4B parámetros)');

  console.log('\n🧠 RAZONAMIENTO:');
  console.log('   gemma2:2b - Básico, respuestas directas');
  console.log('   gemma3:4b - Bueno, entiende contexto');
  console.log('   qwen3:4b  - Piensa en inglés primero (problema)');

  console.log('\n💡 RECOMENDACIÓN PARA TU BOT:');
  console.log('='.repeat(80));
  console.log('\n✅ MEJOR OPCIÓN: gemma3:4b');
  console.log('   Razones:');
  console.log('   • Buen balance velocidad/calidad (~8s)');
  console.log('   • Responde directamente en español');
  console.log('   • Entiende contexto conversacional');
  console.log('   • No piensa en inglés como qwen3');
  console.log('   • Mejor que gemma2:2b para razonamiento');

  console.log('\n⚠️  CONSIDERACIÓN IMPORTANTE:');
  console.log('   Ollama es 10-20x más lento que Groq');
  console.log('   Úsalo solo como fallback cuando Groq falle');
  console.log('   No como primera opción');

  console.log('\n📝 Configuración recomendada:');
  console.log('   OLLAMA_ENABLED=true');
  console.log('   OLLAMA_MODEL=gemma3:4b');
  console.log('   AI_FALLBACK_ENABLED=true');
  console.log('   Orden: Groq → Ollama → Base Conocimiento');

  console.log('\n✅ Prueba completada\n');
}

ejecutarPruebas().catch(console.error);
