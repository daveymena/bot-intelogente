/**
 * Test de Modelos Ollama en Easypanel
 * Prueba llama3 y mistral con preguntas sobre productos
 */

import Anthropic from '@anthropic-ai/sdk';

const OLLAMA_BASE_URL = 'https://davey-ollama.mapf5v.easypanel.host';

interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_duration?: number;
  eval_duration?: number;
}

async function testOllamaModel(model: string, prompt: string): Promise<void> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🤖 Probando modelo: ${model}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`📝 Pregunta: ${prompt}`);
  console.log(`⏱️  Iniciando...`);

  const startTime = Date.now();

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: `Eres un asistente de ventas experto en productos tecnológicos. 
Respondes en español de forma clara, concisa y profesional.
Tienes conocimiento sobre laptops, computadores, cursos digitales y megapacks.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 500
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OllamaResponse = await response.json();
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n✅ Respuesta recibida en ${duration}s`);
    console.log(`\n💬 Respuesta del modelo:\n`);
    console.log(data.message.content);

    // Métricas de rendimiento
    if (data.total_duration) {
      console.log(`\n📊 Métricas de rendimiento:`);
      console.log(`   - Duración total: ${(data.total_duration / 1e9).toFixed(2)}s`);
      if (data.load_duration) {
        console.log(`   - Carga del modelo: ${(data.load_duration / 1e9).toFixed(2)}s`);
      }
      if (data.prompt_eval_duration) {
        console.log(`   - Evaluación del prompt: ${(data.prompt_eval_duration / 1e9).toFixed(2)}s`);
      }
      if (data.eval_duration) {
        console.log(`   - Generación: ${(data.eval_duration / 1e9).toFixed(2)}s`);
      }
    }

  } catch (error) {
    console.error(`\n❌ Error al probar ${model}:`, error);
  }
}

async function runTests() {
  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                   TEST DE MODELOS OLLAMA EN EASYPANEL                      ║
║                                                                            ║
║  Servidor: ${OLLAMA_BASE_URL}                    ║
║  Modelos: llama3:latest, mistral:latest                                   ║
╚════════════════════════════════════════════════════════════════════════════╝
  `);

  // Preguntas de prueba sobre productos
  const testQuestions = [
    {
      question: "¿Qué laptop me recomiendas para diseño gráfico?",
      description: "Consulta sobre producto específico"
    },
    {
      question: "Necesito un computador económico para estudiar, ¿qué opciones tienes?",
      description: "Búsqueda por presupuesto"
    },
    {
      question: "¿Cuál es la diferencia entre un curso de piano y un megapack de música?",
      description: "Comparación de productos digitales"
    },
    {
      question: "Busco una moto para ciudad, ¿qué me recomiendas?",
      description: "Producto físico específico"
    }
  ];

  const models = ['llama3:latest', 'mistral:latest'];

  for (const model of models) {
    console.log(`\n\n${'█'.repeat(80)}`);
    console.log(`█  MODELO: ${model.toUpperCase().padEnd(68)}█`);
    console.log(`${'█'.repeat(80)}\n`);

    for (let i = 0; i < testQuestions.length; i++) {
      const test = testQuestions[i];
      console.log(`\n[${i + 1}/${testQuestions.length}] ${test.description}`);
      await testOllamaModel(model, test.question);
      
      // Pausa entre preguntas
      if (i < testQuestions.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Pausa entre modelos
    if (model !== models[models.length - 1]) {
      console.log(`\n\n⏸️  Pausa de 5 segundos antes del siguiente modelo...\n`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log(`\n\n${'='.repeat(80)}`);
  console.log(`✅ TESTS COMPLETADOS`);
  console.log(`${'='.repeat(80)}\n`);
  
  console.log(`📊 RESUMEN:`);
  console.log(`   - Modelos probados: ${models.length}`);
  console.log(`   - Preguntas por modelo: ${testQuestions.length}`);
  console.log(`   - Total de tests: ${models.length * testQuestions.length}`);
  console.log(`\n💡 RECOMENDACIÓN:`);
  console.log(`   Revisa las respuestas y tiempos de cada modelo para decidir cuál usar.`);
  console.log(`   - llama3: Generalmente más preciso y coherente`);
  console.log(`   - mistral: Puede ser más rápido en algunas consultas\n`);
}

// Ejecutar tests
runTests().catch(console.error);
