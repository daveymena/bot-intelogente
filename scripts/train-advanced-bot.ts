/**
 * 🎓 SCRIPT DE ENTRENAMIENTO AVANZADO DEL BOT
 * 
 * Entrena el bot con conversaciones reales para hacerlo "indestructible"
 */

import { AdvancedConversationTrainer } from '../src/lib/advanced-conversation-trainer';
import { ConversationIntelligenceLayer } from '../src/lib/conversation-intelligence-layer';

async function main() {
  console.log('\n🎓 ========================================');
  console.log('🎓 ENTRENAMIENTO AVANZADO DEL BOT');
  console.log('🎓 ========================================\n');
  
  try {
    // 1. Entrenar con conversaciones reales
    console.log('📚 Paso 1: Analizando conversaciones reales...\n');
    await AdvancedConversationTrainer.trainWithRealConversations(100);
    
    // 2. Detectar patrones exitosos
    console.log('\n🔍 Paso 2: Detectando patrones exitosos...\n');
    const patterns = await AdvancedConversationTrainer.detectSuccessPatterns();
    
    console.log(`✅ ${patterns.length} patrones exitosos detectados\n`);
    
    if (patterns.length > 0) {
      console.log('🏆 Top 5 patrones más frecuentes:\n');
      patterns.slice(0, 5).forEach((pattern, index) => {
        console.log(`${index + 1}. ${pattern.pattern}`);
        console.log(`   Frecuencia: ${pattern.frequency} veces`);
        console.log(`   Confianza: ${(pattern.confidence * 100).toFixed(0)}%`);
        console.log(`   Resultado: ${pattern.outcome}`);
        console.log(`   Emoción: ${pattern.context.userEmotion}\n`);
      });
    }
    
    // 3. Obtener estadísticas
    console.log('📊 Paso 3: Generando estadísticas...\n');
    const stats = await AdvancedConversationTrainer.getTrainingStats();
    
    console.log('📈 ESTADÍSTICAS DE ENTRENAMIENTO:');
    console.log(`   Total de patrones: ${stats.totalPatterns}`);
    console.log(`   Tasa de éxito: ${stats.successRate.toFixed(1)}%`);
    console.log(`   Patrones únicos: ${stats.topPatterns.length}\n`);
    
    // 4. Probar detección de intenciones ocultas
    console.log('🕵️ Paso 4: Probando detección de intenciones ocultas...\n');
    
    const testMessages = [
      {
        message: 'Está muy caro, no sé...',
        history: [
          { role: 'user', content: '¿Cuánto cuesta?' },
          { role: 'assistant', content: 'El precio es $2.500.000 COP' }
        ]
      },
      {
        message: 'Lo voy a pensar',
        history: [
          { role: 'user', content: 'Me interesa el portátil' },
          { role: 'assistant', content: 'Excelente elección' }
        ]
      },
      {
        message: '¿Tiene garantía?',
        history: [
          { role: 'user', content: 'Quiero comprar' },
          { role: 'assistant', content: 'Perfecto' }
        ]
      },
      {
        message: 'Lo quiero! 🤩',
        history: [
          { role: 'user', content: 'Muéstrame el producto' },
          { role: 'assistant', content: 'Aquí está' }
        ]
      }
    ];
    
    for (const test of testMessages) {
      const hiddenIntent = AdvancedConversationTrainer.detectHiddenIntent(
        test.message,
        test.history,
        {}
      );
      
      if (hiddenIntent) {
        console.log(`💬 Mensaje: "${test.message}"`);
        console.log(`   🎯 Intención oculta: ${hiddenIntent.intent}`);
        console.log(`   📊 Confianza: ${(hiddenIntent.confidence * 100).toFixed(0)}%`);
        console.log(`   💡 Acción recomendada: ${hiddenIntent.recommendedAction}\n`);
      }
    }
    
    // 5. Probar detección de momentos críticos
    console.log('⏰ Paso 5: Probando detección de momentos críticos...\n');
    
    const criticalTests = [
      {
        message: 'Cómo puedo pagar?',
        history: [
          { role: 'user', content: 'Me interesa' },
          { role: 'assistant', content: 'Genial' }
        ]
      },
      {
        message: 'Pero no estoy seguro...',
        history: [
          { role: 'user', content: 'Cuánto cuesta?' },
          { role: 'assistant', content: '$2.500.000' }
        ]
      },
      {
        message: 'ok',
        history: [
          { role: 'user', content: 'Tienes laptops?' },
          { role: 'assistant', content: 'Sí, tenemos' }
        ]
      }
    ];
    
    for (const test of criticalTests) {
      const moment = AdvancedConversationTrainer.detectCriticalMoment(
        test.message,
        test.history,
        {}
      );
      
      if (moment) {
        console.log(`💬 Mensaje: "${test.message}"`);
        console.log(`   ⏰ Momento: ${moment.type}`);
        console.log(`   🚨 Urgencia: ${(moment.urgency * 100).toFixed(0)}%`);
        console.log(`   💡 Respuesta óptima: ${moment.optimalResponse}\n`);
      }
    }
    
    // 6. Probar análisis completo
    console.log('🧠 Paso 6: Probando análisis completo de inteligencia...\n');
    
    const fullTest = {
      message: 'Me interesa mucho! Cómo puedo pagar? 😊',
      chatId: 'test-chat',
      userId: 'test-user',
      conversationHistory: [
        { role: 'user', content: 'Busco un portátil para diseño' },
        { role: 'assistant', content: 'Tengo el Asus Vivobook perfecto' },
        { role: 'user', content: 'Cuánto cuesta?' },
        { role: 'assistant', content: '$2.179.900 COP' }
      ],
      context: {
        currentProduct: {
          id: '1',
          name: 'Asus Vivobook',
          price: 2179900
        }
      }
    };
    
    const analysis = await ConversationIntelligenceLayer.analyzeBeforeProcessing(fullTest);
    
    console.log('📊 ANÁLISIS COMPLETO:');
    console.log(`   😊 Emoción: ${analysis.userEmotion}`);
    console.log(`   📈 Nivel de interés: ${(analysis.interestLevel * 100).toFixed(0)}%`);
    console.log(`   💰 Probabilidad de compra: ${(analysis.purchaseProbability * 100).toFixed(0)}%`);
    console.log(`   🎯 Tono recomendado: ${analysis.recommendations.tone}`);
    console.log(`   🎯 Enfoque recomendado: ${analysis.recommendations.focus}`);
    console.log(`   🚨 Prioridad: ${analysis.recommendations.priority}\n`);
    
    console.log('\n✅ ========================================');
    console.log('✅ ENTRENAMIENTO COMPLETADO EXITOSAMENTE');
    console.log('✅ ========================================\n');
    
    console.log('🎉 El bot ahora es más inteligente y puede:');
    console.log('   ✅ Detectar intenciones ocultas del usuario');
    console.log('   ✅ Predecir objeciones antes de que se expresen');
    console.log('   ✅ Identificar momentos críticos para cerrar ventas');
    console.log('   ✅ Adaptar su tono según la emoción del usuario');
    console.log('   ✅ Calcular probabilidad de compra en tiempo real');
    console.log('   ✅ Prevenir pérdida de interés del cliente\n');
    
  } catch (error) {
    console.error('\n❌ Error durante el entrenamiento:', error);
    process.exit(1);
  }
}

main();
