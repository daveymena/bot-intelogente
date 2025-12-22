/**
 * 🤖 ENTRENAMIENTO SOLO CON OLLAMA
 * Prueba el desempeño de Ollama sin usar Groq
 * Perfecto para evaluar la calidad de respuestas locales
 */

// Forzar recarga del .env
import { config } from 'dotenv';
config({ override: true });

import { OllamaService } from '../src/lib/ollama-service';
import { LocalKnowledgeBase } from '../src/lib/local-knowledge-base';
import { db } from '../src/lib/db';

// Preguntas de prueba para evaluar Ollama
const PREGUNTAS_PRUEBA = [
  // Saludos
  'Hola, buenos días',
  'Hola, cómo estás?',
  
  // Cursos
  'Tienes el curso de piano?',
  'Cuánto cuesta el curso de piano?',
  'Qué incluye el curso de piano?',
  'Tienes curso de diseño gráfico?',
  'Cuánto cuesta el curso de diseño?',
  
  // Megapacks
  'Qué es el megapack?',
  'Tienes el megapack completo?',
  'Cuánto cuesta el megapack?',
  
  // Laptops
  'Tienes laptops?',
  'Cuánto cuesta una laptop?',
  'Tienes MacBook?',
  
  // Métodos de pago
  'Cómo puedo pagar?',
  'Aceptan Nequi?',
  'Aceptan tarjeta de crédito?',
  'Métodos de pago disponibles',
  
  // Envíos
  'Hacen envíos?',
  'Cuánto cuesta el envío?',
  'Envían a todo Colombia?',
  
  // Garantías
  'Tienen garantía?',
  'Cuánto dura la garantía?',
  'Qué cubre la garantía?'
];

async function entrenarSoloOllama() {
  console.log('🤖 ENTRENAMIENTO SOLO CON OLLAMA\n');
  console.log('Evaluando desempeño de Ollama (gemma:2b) sin usar Groq\n');

  try {
    // 1. Verificar Ollama
    console.log('1️⃣ Verificando Ollama...');
    const available = await OllamaService.isAvailable();
    
    if (!available) {
      console.error('❌ Ollama no está disponible');
      console.log('\n💡 Asegúrate de que Ollama esté corriendo:');
      console.log('   URL: https://bot-whatsapp-ollama.sqaoeo.easypanel.host');
      return;
    }
    
    console.log('✅ Ollama disponible\n');

    // 2. Verificar modelo
    console.log('2️⃣ Verificando modelo gemma:2b...');
    const hasModel = await OllamaService.checkModel();
    
    if (!hasModel) {
      console.error('❌ Modelo gemma:2b no encontrado');
      return;
    }
    
    console.log('✅ Modelo gemma:2b listo\n');

    // 3. Inicializar base de conocimiento
    console.log('3️⃣ Inicializando base de conocimiento...');
    await LocalKnowledgeBase.initialize();
    console.log('✅ Base de conocimiento lista\n');

    // 4. Obtener usuario
    const user = await db.user.findFirst();
    if (!user) {
      console.error('❌ No hay usuarios en la base de datos');
      return;
    }

    // 5. Obtener productos para contexto
    const productos = await db.product.findMany({
      where: { userId: user.id, status: 'AVAILABLE' },
      take: 10
    });

    console.log(`✅ ${productos.length} productos disponibles para contexto\n`);

    // 6. Entrenar con cada pregunta
    console.log('4️⃣ Iniciando entrenamiento...\n');
    console.log('='.repeat(60));

    let exitosas = 0;
    let fallidas = 0;
    let tiempoTotal = 0;

    for (let i = 0; i < PREGUNTAS_PRUEBA.length; i++) {
      const pregunta = PREGUNTAS_PRUEBA[i];
      
      console.log(`\n[${i + 1}/${PREGUNTAS_PRUEBA.length}] 💬 "${pregunta}"`);
      
      try {
        const inicio = Date.now();

        // Construir prompt del sistema
        const systemPrompt = `Eres un asistente de ventas profesional para Tecnovariedades D&S.

Vendes:
- Cursos digitales (piano, diseño gráfico, programación, Excel)
- Megapacks de cursos
- Laptops y computadores
- Motos

Métodos de pago:
- Nequi: 3136174267
- Daviplata: 3136174267
- MercadoPago (tarjeta)
- PayPal
- Transferencia bancaria

Responde de forma amigable, profesional y concisa.
Usa emojis apropiados.
Si no sabes algo, sé honesto.`;

        // Generar respuesta con Ollama
        const response = await OllamaService.generateResponse({
          systemPrompt,
          messages: [
            { role: 'user', content: pregunta }
          ]
        });

        const tiempo = Date.now() - inicio;
        tiempoTotal += tiempo;

        if (response) {
          console.log(`⏱️  Tiempo: ${(tiempo / 1000).toFixed(2)}s`);
          console.log(`🤖 Respuesta (${(response.confidence * 100).toFixed(0)}% confianza):`);
          console.log(`   ${response.text.substring(0, 150)}...`);

          // Guardar si es buena
          if (response.confidence >= 0.7) {
            await LocalKnowledgeBase.saveSuccessfulResponse({
              userQuery: pregunta,
              botResponse: response.text,
              confidence: response.confidence,
              context: 'entrenamiento-ollama'
            });
            
            exitosas++;
            console.log('   ✅ Guardada en base de conocimiento');
          } else {
            fallidas++;
            console.log('   ⚠️ Confianza baja, no guardada');
          }
        } else {
          fallidas++;
          console.log('   ❌ No se pudo generar respuesta');
        }

        // Pausa entre preguntas
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        fallidas++;
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    // 7. Resumen
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DEL ENTRENAMIENTO\n');
    
    console.log(`Total de preguntas: ${PREGUNTAS_PRUEBA.length}`);
    console.log(`✅ Exitosas: ${exitosas}`);
    console.log(`❌ Fallidas: ${fallidas}`);
    console.log(`📈 Tasa de éxito: ${((exitosas / PREGUNTAS_PRUEBA.length) * 100).toFixed(1)}%`);
    console.log(`⏱️  Tiempo promedio: ${(tiempoTotal / PREGUNTAS_PRUEBA.length / 1000).toFixed(2)}s por pregunta`);
    console.log(`⏱️  Tiempo total: ${(tiempoTotal / 1000 / 60).toFixed(2)} minutos`);

    // Estadísticas de la base de conocimiento
    const stats = await LocalKnowledgeBase.getStats();
    console.log(`\n📚 Base de Conocimiento:`);
    console.log(`   Total de entradas: ${stats.totalEntries}`);
    console.log(`   Tasa de éxito promedio: ${(stats.avgSuccessRate * 100).toFixed(1)}%`);

    // Evaluación del desempeño
    console.log('\n🎯 EVALUACIÓN DE OLLAMA (gemma:2b):\n');
    
    const tasaExito = (exitosas / PREGUNTAS_PRUEBA.length) * 100;
    const tiempoPromedio = tiempoTotal / PREGUNTAS_PRUEBA.length / 1000;

    if (tasaExito >= 80) {
      console.log('✅ EXCELENTE - Ollama funciona muy bien');
    } else if (tasaExito >= 60) {
      console.log('⚠️ BUENO - Ollama funciona aceptablemente');
    } else {
      console.log('❌ REGULAR - Ollama necesita ajustes');
    }

    if (tiempoPromedio <= 3) {
      console.log('✅ RÁPIDO - Respuestas en menos de 3 segundos');
    } else if (tiempoPromedio <= 5) {
      console.log('⚠️ ACEPTABLE - Respuestas en 3-5 segundos');
    } else {
      console.log('❌ LENTO - Respuestas en más de 5 segundos');
    }

    console.log('\n💡 RECOMENDACIÓN:');
    if (tasaExito >= 70 && tiempoPromedio <= 5) {
      console.log('   ✅ Ollama es adecuado para entrenamiento');
      console.log('   ✅ Puedes usarlo como IA principal');
      console.log('   ✅ Groq como respaldo es suficiente');
    } else {
      console.log('   ⚠️ Ollama funciona pero con limitaciones');
      console.log('   💡 Considera usar Groq como principal');
      console.log('   💡 Ollama como respaldo o para entrenamiento');
    }

    console.log('\n🚀 Siguiente paso:');
    console.log('   - Si Ollama funciona bien: Entrenar con más preguntas');
    console.log('   - Si Ollama es lento: Usar Groq para producción');
    console.log('   - Siempre: Mantener base de conocimiento local\n');

  } catch (error) {
    console.error('❌ Error en el entrenamiento:', error);
  }
}

entrenarSoloOllama();
