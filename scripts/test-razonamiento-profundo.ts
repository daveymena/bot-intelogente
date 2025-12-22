/**
 * 🧠 TEST: RAZONAMIENTO PROFUNDO
 * Consultas complejas que requieren análisis y razonamiento
 */

import { OllamaOrchestrator } from '../src/lib/ollama-orchestrator';
import { db } from '../src/lib/db';

async function testRazonamientoProfundo() {
  console.log('🧠 TEST: RAZONAMIENTO PROFUNDO CON QWEN2.5\n');
  console.log('='.repeat(70));
  
  try {
    // Obtener usuario
    const user = await db.user.findFirst({
      where: { email: { contains: '@' } }
    });
    
    if (!user) {
      console.error('❌ No se encontró usuario');
      return;
    }
    
    console.log(`👤 Usuario: ${user.email}\n`);
    
    // Tests de razonamiento profundo
    const tests = [
      {
        name: 'Comparación de Productos',
        message: 'Cuál es la diferencia entre el ventilador portátil y el deflector de aire?',
        expected: 'Debe comparar características, precios y usos',
        requiereRazonamiento: true
      },
      {
        name: 'Recomendación Personalizada',
        message: 'Necesito algo para mi oficina que me ayude con el calor pero que sea económico',
        expected: 'Debe analizar necesidades y recomendar el producto adecuado',
        requiereRazonamiento: true
      },
      {
        name: 'Análisis de Presupuesto',
        message: 'Tengo 100 pesos, qué puedo comprar?',
        expected: 'Debe filtrar por precio y mostrar opciones dentro del presupuesto',
        requiereRazonamiento: true
      },
      {
        name: 'Consulta Sobre Beneficios',
        message: 'Por qué debería comprar el megapack de cursos en lugar de un curso individual?',
        expected: 'Debe explicar ventajas, valor y beneficios',
        requiereRazonamiento: true
      },
      {
        name: 'Pregunta Sobre Uso',
        message: 'Para qué sirve el deflector de aire?',
        expected: 'Debe explicar funcionalidad y casos de uso',
        requiereRazonamiento: true
      },
      {
        name: 'Consulta de Valor',
        message: 'Vale la pena el megapack de cursos por 2500 pesos?',
        expected: 'Debe analizar relación precio-valor',
        requiereRazonamiento: true
      },
      {
        name: 'Múltiples Criterios',
        message: 'Busco algo útil, económico y que pueda usar todos los días',
        expected: 'Debe considerar múltiples factores y recomendar',
        requiereRazonamiento: true
      },
      {
        name: 'Pregunta Abierta',
        message: 'Qué me recomiendas para regalar?',
        expected: 'Debe hacer preguntas o dar opciones variadas',
        requiereRazonamiento: true
      }
    ];
    
    let testsPasados = 0;
    let testsFallados = 0;
    
    for (const test of tests) {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`🧠 TEST: ${test.name}`);
      console.log(`💬 Consulta: "${test.message}"`);
      console.log(`✅ Esperado: ${test.expected}`);
      console.log(`🎯 Requiere razonamiento: ${test.requiereRazonamiento ? 'SÍ' : 'NO'}`);
      console.log('-'.repeat(70));
      
      const startTime = Date.now();
      
      try {
        // Usar IA para razonamiento profundo
        const result = await OllamaOrchestrator.generateWithKnowledgeBase(
          test.message,
          user.id
        );
        
        const duration = Date.now() - startTime;
        
        console.log(`\n🤖 RESPUESTA (${duration}ms):`);
        console.log(result.text);
        
        // Evaluar calidad del razonamiento
        const evaluation = evaluateReasoning(result.text, test.message);
        
        console.log(`\n📊 EVALUACIÓN DEL RAZONAMIENTO:`);
        console.log(`   Score Total: ${evaluation.totalScore}/100`);
        console.log(`   ✅ Responde la pregunta: ${evaluation.answersQuestion ? 'SÍ' : 'NO'} (${evaluation.scores.answersQuestion}/30)`);
        console.log(`   ✅ Proporciona detalles: ${evaluation.providesDetails ? 'SÍ' : 'NO'} (${evaluation.scores.providesDetails}/25)`);
        console.log(`   ✅ Usa razonamiento: ${evaluation.usesReasoning ? 'SÍ' : 'NO'} (${evaluation.scores.usesReasoning}/25)`);
        console.log(`   ✅ Es útil: ${evaluation.isHelpful ? 'SÍ' : 'NO'} (${evaluation.scores.isHelpful}/20)`);
        
        if (result.selectedProducts.length > 0) {
          console.log(`\n📦 Productos mencionados: ${result.selectedProducts.length}`);
          result.selectedProducts.forEach(p => {
            console.log(`   - ${p.name} ($${p.price.toLocaleString('es-CO')})`);
          });
        }
        
        // Determinar si pasó
        const passed = evaluation.totalScore >= 70;
        if (passed) {
          testsPasados++;
          console.log(`\n✅ TEST PASADO (${duration}ms) - Score: ${evaluation.totalScore}/100`);
        } else {
          testsFallados++;
          console.log(`\n❌ TEST FALLADO (${duration}ms) - Score: ${evaluation.totalScore}/100`);
        }
        
      } catch (error: any) {
        testsFallados++;
        console.error(`\n❌ ERROR:`, error.message);
      }
      
      // Esperar entre tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Resumen final
    console.log(`\n${'='.repeat(70)}`);
    console.log('📊 RESUMEN FINAL DE RAZONAMIENTO PROFUNDO');
    console.log('='.repeat(70));
    console.log(`✅ Tests pasados: ${testsPasados}/${tests.length}`);
    console.log(`❌ Tests fallados: ${testsFallados}/${tests.length}`);
    console.log(`📈 Tasa de éxito: ${Math.round((testsPasados / tests.length) * 100)}%`);
    
    if (testsPasados >= tests.length * 0.7) {
      console.log(`\n🎉 EXCELENTE: Qwen2.5 tiene buen razonamiento profundo`);
    } else if (testsPasados >= tests.length * 0.5) {
      console.log(`\n⚠️ ACEPTABLE: Qwen2.5 razona pero necesita mejoras`);
    } else {
      console.log(`\n❌ INSUFICIENTE: Qwen2.5 necesita mejor prompt o modelo más grande`);
    }
    
  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    await db.$disconnect();
  }
}

/**
 * Evalúa la calidad del razonamiento en la respuesta
 */
function evaluateReasoning(response: string, question: string): {
  totalScore: number;
  answersQuestion: boolean;
  providesDetails: boolean;
  usesReasoning: boolean;
  isHelpful: boolean;
  scores: {
    answersQuestion: number;
    providesDetails: number;
    usesReasoning: number;
    isHelpful: number;
  };
} {
  const responseLower = response.toLowerCase();
  const questionLower = question.toLowerCase();
  
  // 1. Responde la pregunta (30 puntos)
  let answersQuestionScore = 0;
  const questionKeywords = questionLower.match(/\b(qué|cuál|por qué|para qué|cómo|dónde|cuándo|vale|sirve|diferencia|recomiendas)\b/g) || [];
  
  if (questionKeywords.length > 0) {
    // Verificar si la respuesta contiene palabras relacionadas con la pregunta
    const hasRelevantContent = questionKeywords.some(keyword => {
      if (keyword === 'qué' || keyword === 'cuál') return response.length > 100;
      if (keyword === 'por qué') return /porque|ya que|debido|razón/i.test(response);
      if (keyword === 'para qué') return /para|sirve|útil|función/i.test(response);
      if (keyword === 'diferencia') return /diferencia|mientras|comparado|versus/i.test(response);
      return true;
    });
    
    if (hasRelevantContent) answersQuestionScore = 30;
    else if (response.length > 50) answersQuestionScore = 15;
  } else {
    answersQuestionScore = 20; // Pregunta abierta
  }
  
  // 2. Proporciona detalles (25 puntos)
  let providesDetailsScore = 0;
  const hasPrice = /\$|cop|precio/i.test(response);
  const hasFeatures = /características|incluye|ofrece|proporciona/i.test(response);
  const hasComparison = /mejor|peor|más|menos|diferencia|comparado/i.test(response);
  const hasExplanation = response.length > 150;
  
  if (hasPrice) providesDetailsScore += 7;
  if (hasFeatures) providesDetailsScore += 7;
  if (hasComparison) providesDetailsScore += 6;
  if (hasExplanation) providesDetailsScore += 5;
  
  // 3. Usa razonamiento (25 puntos)
  let usesReasoningScore = 0;
  const reasoningWords = [
    'porque', 'ya que', 'debido', 'por lo tanto', 'entonces',
    'si', 'aunque', 'sin embargo', 'además', 'también',
    'mejor', 'ideal', 'recomiendo', 'sugiero', 'considerar'
  ];
  
  const reasoningCount = reasoningWords.filter(word => 
    responseLower.includes(word)
  ).length;
  
  usesReasoningScore = Math.min(reasoningCount * 5, 25);
  
  // 4. Es útil (20 puntos)
  let isHelpfulScore = 0;
  const hasActionableInfo = /puedes|debes|te recomiendo|considera|elige/i.test(response);
  const hasOptions = /opción|alternativa|también|otra/i.test(response);
  const hasNextSteps = /\?|pregunta|dime|cuéntame|necesitas/i.test(response);
  const isComplete = response.length > 100 && response.length < 1000;
  
  if (hasActionableInfo) isHelpfulScore += 7;
  if (hasOptions) isHelpfulScore += 5;
  if (hasNextSteps) isHelpfulScore += 4;
  if (isComplete) isHelpfulScore += 4;
  
  // Calcular totales
  const totalScore = answersQuestionScore + providesDetailsScore + usesReasoningScore + isHelpfulScore;
  
  return {
    totalScore,
    answersQuestion: answersQuestionScore >= 20,
    providesDetails: providesDetailsScore >= 15,
    usesReasoning: usesReasoningScore >= 15,
    isHelpful: isHelpfulScore >= 12,
    scores: {
      answersQuestion: answersQuestionScore,
      providesDetails: providesDetailsScore,
      usesReasoning: usesReasoningScore,
      isHelpful: isHelpfulScore
    }
  };
}

// Ejecutar
testRazonamientoProfundo().catch(console.error);
