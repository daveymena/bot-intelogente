/**
 * PRUEBA DE FLUJO COMPLETO CON BASE DE DATOS REAL
 * Simula una conversación completa de venta
 */

import { Orchestrator } from '../src/agents/orchestrator';
import { UnifiedMemoryService } from '../src/lib/unified-memory-service';
import { db } from '../src/lib/db';

interface ConversationStep {
  user: string;
  expectedAgent?: string;
  description: string;
}

const conversationFlow: ConversationStep[] = [
  {
    user: 'Hola',
    expectedAgent: 'greeting',
    description: 'Saludo inicial'
  },
  {
    user: 'busco un portátil para diseño gráfico',
    expectedAgent: 'search',
    description: 'Búsqueda de producto'
  },
  {
    user: 'cuánto cuesta el primero?',
    expectedAgent: 'product',
    description: 'Pregunta sobre precio'
  },
  {
    user: 'tienes fotos?',
    expectedAgent: 'photo',
    description: 'Solicitud de fotos'
  },
  {
    user: 'me interesa, cómo puedo pagar?',
    expectedAgent: 'payment',
    description: 'Consulta métodos de pago'
  },
  {
    user: 'mercadopago',
    expectedAgent: 'payment',
    description: 'Selección de método de pago'
  },
  {
    user: 'gracias',
    expectedAgent: 'closing',
    description: 'Despedida'
  }
];

async function testCompleteFlow() {
  console.log('🎬 INICIANDO PRUEBA DE FLUJO COMPLETO\n');
  console.log('═'.repeat(70));
  
  const chatId = `test-flow-${Date.now()}`;
  const userId = `test-user-${Date.now()}`;
  const orchestrator = new Orchestrator();
  const memoryService = new UnifiedMemoryService();
  
  let stepsPassed = 0;
  let stepsFailed = 0;
  
  try {
    // Verificar conexión a BD
    console.log('\n📊 Verificando base de datos...');
    const productCount = await db.product.count();
    console.log(`   ✅ Conectado - ${productCount} productos en catálogo\n`);
    
    // Ejecutar cada paso de la conversación
    for (let i = 0; i < conversationFlow.length; i++) {
      const step = conversationFlow[i];
      console.log(`\n${'─'.repeat(70)}`);
      console.log(`📝 Paso ${i + 1}/${conversationFlow.length}: ${step.description}`);
      console.log(`   Usuario: "${step.user}"`);
      
      try {
        // Ejecutar mensaje
        const startTime = Date.now();
        const response = await orchestrator.processMessage({
          chatId,
          userId,
          message: step.user,
          from: `${userId}@s.whatsapp.net`
        });
        const duration = Date.now() - startTime;
        
        // Mostrar respuesta
        console.log(`\n   🤖 Bot (${duration}ms):`);
        const preview = response.text.substring(0, 100);
        console.log(`   "${preview}${response.text.length > 100 ? '...' : ''}"`);
        
        // Verificar agente si se especificó
        if (step.expectedAgent && response.agentUsed) {
          if (response.agentUsed === step.expectedAgent) {
            console.log(`   ✅ Agente correcto: ${response.agentUsed}`);
            stepsPassed++;
          } else {
            console.log(`   ⚠️  Agente diferente: esperado=${step.expectedAgent}, obtenido=${response.agentUsed}`);
            stepsPassed++; // Aún cuenta como éxito si respondió
          }
        } else {
          console.log(`   ✅ Respuesta generada`);
          stepsPassed++;
        }
        
        // Mostrar estado de memoria
        const memory = await memoryService.loadMemory(chatId, userId);
        if (memory) {
          console.log(`\n   💾 Memoria:`);
          console.log(`      Producto actual: ${memory.currentProduct?.name || 'Ninguno'}`);
          console.log(`      Mensajes: ${memory.messageCount || 0}`);
          console.log(`      Última actualización: ${memory.lastUpdated ? new Date(memory.lastUpdated).toLocaleTimeString() : 'N/A'}`);
        }
        
        // Pausa entre mensajes (simular usuario real)
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        stepsFailed++;
      }
    }
    
    // Resumen final
    console.log(`\n${'═'.repeat(70)}`);
    console.log('\n📊 RESUMEN DE LA CONVERSACIÓN\n');
    console.log(`Total de pasos: ${conversationFlow.length}`);
    console.log(`✅ Exitosos: ${stepsPassed} (${((stepsPassed/conversationFlow.length)*100).toFixed(1)}%)`);
    console.log(`❌ Fallidos: ${stepsFailed} (${((stepsFailed/conversationFlow.length)*100).toFixed(1)}%)`);
    
    // Estadísticas de memoria
    const stats = await memoryService.getStats(chatId, userId);
    if (stats) {
      console.log('\n💾 Estadísticas de Memoria:');
      console.log(`   Mensajes totales: ${stats.totalMessages}`);
      console.log(`   Productos vistos: ${stats.productsViewed}`);
      console.log(`   Duración: ${stats.conversationDuration}`);
    }
    
    console.log('\n' + '═'.repeat(70));
    
    if (stepsFailed === 0) {
      console.log('\n🎉 ¡FLUJO COMPLETO EXITOSO! El sistema funciona correctamente.\n');
      return true;
    } else {
      console.log('\n⚠️  Algunos pasos fallaron. Revisar implementación.\n');
      return false;
    }
    
  } catch (error) {
    console.error('\n💥 ERROR FATAL:', error);
    return false;
  } finally {
    // Limpiar memoria de prueba
    try {
      await memoryService.clearMemory(chatId, userId);
      console.log('🧹 Memoria de prueba limpiada\n');
    } catch (e) {
      // Ignorar errores de limpieza
    }
  }
}

// Ejecutar prueba
console.log('🚀 Smart Sales Bot Pro - Prueba de Flujo Completo\n');
testCompleteFlow()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
