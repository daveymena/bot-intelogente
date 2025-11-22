/**
 * 🧪 TEST DEL SISTEMA CONVERSACIONAL COMPLETO
 * Prueba todos los componentes del sistema conversacional
 */

import { Orchestrator } from '../src/agents/orchestrator';
import { ConversationFlowManager } from '../src/agents/conversation-flow-manager';
import { QuestionGenerator } from '../src/agents/question-generator';
import { ObjectionHandler } from '../src/agents/objection-handler';
import { SharedMemoryService } from '../src/agents/shared-memory';

console.log('🧪 INICIANDO TEST DEL SISTEMA CONVERSACIONAL COMPLETO\n');

// Crear instancia del orquestador
const orchestrator = new Orchestrator();
const memoryService = SharedMemoryService.getInstance();

// Datos de prueba
const testChatId = 'test-chat-123';
const testUserId = 'test-user-456';
const testUserName = 'Juan Pérez';

/**
 * Test 1: Flujo completo de venta
 */
async function testFullSalesFlow() {
  console.log('📊 TEST 1: FLUJO COMPLETO DE VENTA\n');
  console.log('='.repeat(60));
  
  const messages = [
    'Hola',
    'Busco un curso',
    'De piano',
    'Sí, cuéntame más',
    'Está muy caro',
    'Ok, me convenciste',
    'MercadoPago',
  ];
  
  for (const message of messages) {
    console.log(`\n👤 Cliente: "${message}"`);
    
    try {
      const response = await orchestrator.processMessage({
        chatId: testChatId,
        userId: testUserId,
        message,
        userName: testUserName,
      });
      
      console.log(`🤖 Bot: "${response.text.substring(0, 200)}..."`);
      console.log(`   Confianza: ${(response.confidence || 0) * 100}%`);
      console.log(`   Siguiente agente: ${response.nextAgent || 'ninguno'}`);
      
      // Esperar un poco entre mensajes
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('❌ Error:', error);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Test 1 completado\n');
}

/**
 * Test 2: Manejo de objeciones
 */
async function testObjectionHandling() {
  console.log('🛡️ TEST 2: MANEJO DE OBJECIONES\n');
  console.log('='.repeat(60));
  
  const objections = [
    { message: 'Está muy caro', type: 'price' },
    { message: 'No sé si es de buena calidad', type: 'quality' },
    { message: 'Déjame pensarlo', type: 'timing' },
    { message: 'Quiero comparar con otros', type: 'comparison' },
    { message: 'No estoy seguro si es confiable', type: 'trust' },
  ];
  
  const memory = memoryService.get(testChatId, testUserId);
  memory.currentProduct = {
    id: 'test-product-1',
    name: 'Curso Completo de Piano',
    price: 65000,
    category: 'Cursos Digitales',
    description: 'Aprende piano desde cero',
    images: [],
  };
  
  for (const { message, type } of objections) {
    console.log(`\n👤 Cliente: "${message}"`);
    console.log(`   Tipo esperado: ${type}`);
    
    const response = ObjectionHandler.handleObjection(
      message,
      memory,
      memory.currentProduct
    );
    
    if (response) {
      console.log(`🤖 Bot: "${response.response.substring(0, 150)}..."`);
      console.log(`   Tipo detectado: ${response.type}`);
      console.log(`   Confianza: ${(response.confidence * 100).toFixed(0)}%`);
      console.log(`   Acción: ${response.nextAction}`);
    } else {
      console.log('⚠️ No se detectó objeción');
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Test 2 completado\n');
}

/**
 * Test 3: Generación de preguntas
 */
async function testQuestionGeneration() {
  console.log('❓ TEST 3: GENERACIÓN DE PREGUNTAS\n');
  console.log('='.repeat(60));
  
  const memory = memoryService.get(testChatId, testUserId);
  
  // Test preguntas de descubrimiento
  console.log('\n📍 PREGUNTAS DE DESCUBRIMIENTO:');
  for (let i = 1; i <= 3; i++) {
    memory.messageCount = i;
    const question = QuestionGenerator.generateDiscoveryQuestion(memory);
    console.log(`\n${i}. ${question.question}`);
    console.log(`   Propósito: ${question.purpose}`);
    console.log(`   Confianza: ${(question.confidence * 100).toFixed(0)}%`);
  }
  
  // Test preguntas de calificación
  console.log('\n\n📍 PREGUNTAS DE CALIFICACIÓN:');
  
  const products = [
    { name: 'Curso de Piano', category: 'Cursos Digitales' },
    { name: 'Portátil Acer', category: 'Laptops' },
    { name: 'Moto Yamaha', category: 'Motos' },
  ];
  
  for (const product of products) {
    memory.currentProduct = {
      id: 'test-' + product.name,
      name: product.name,
      price: 1000000,
      category: product.category,
      images: [],
    };
    
    const question = QuestionGenerator.generateQualificationQuestion(
      memory,
      memory.currentProduct
    );
    
    console.log(`\n${product.name}:`);
    console.log(`   ${question.question}`);
    console.log(`   Confianza: ${(question.confidence * 100).toFixed(0)}%`);
  }
  
  // Test preguntas de cierre
  console.log('\n\n📍 PREGUNTAS DE CIERRE:');
  
  memory.paymentIntent = false;
  memory.paymentLinkSent = false;
  let question = QuestionGenerator.generateClosingQuestion(memory);
  console.log(`\nSin intención de pago:`);
  console.log(`   ${question.question}`);
  
  memory.paymentIntent = true;
  question = QuestionGenerator.generateClosingQuestion(memory);
  console.log(`\nCon intención de pago:`);
  console.log(`   ${question.question}`);
  
  memory.paymentLinkSent = true;
  question = QuestionGenerator.generateClosingQuestion(memory);
  console.log(`\nLink enviado:`);
  console.log(`   ${question.question}`);
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Test 3 completado\n');
}

/**
 * Test 4: Análisis de flujo conversacional
 */
async function testFlowAnalysis() {
  console.log('🎯 TEST 4: ANÁLISIS DE FLUJO CONVERSACIONAL\n');
  console.log('='.repeat(60));
  
  const memory = memoryService.get(testChatId, testUserId);
  
  const scenarios = [
    {
      stage: 'greeting',
      messageCount: 1,
      message: 'Hola',
      hasProduct: false,
    },
    {
      stage: 'discovery',
      messageCount: 2,
      message: 'Busco un curso',
      hasProduct: false,
    },
    {
      stage: 'search',
      messageCount: 3,
      message: 'De piano',
      hasProduct: true,
    },
    {
      stage: 'presentation',
      messageCount: 4,
      message: 'Cuéntame más',
      hasProduct: true,
    },
    {
      stage: 'qualification',
      messageCount: 5,
      message: 'Me interesa',
      hasProduct: true,
    },
    {
      stage: 'payment',
      messageCount: 6,
      message: 'Cómo pago?',
      hasProduct: true,
    },
  ];
  
  for (const scenario of scenarios) {
    memory.salesStage = scenario.stage;
    memory.messageCount = scenario.messageCount;
    memory.currentProduct = scenario.hasProduct ? {
      id: 'test-product',
      name: 'Curso de Piano',
      price: 65000,
      category: 'Cursos',
      images: [],
    } : undefined;
    
    const decision = ConversationFlowManager.analyzeFlow(memory, scenario.message);
    
    console.log(`\n📊 Escenario: ${scenario.stage}`);
    console.log(`   Mensaje: "${scenario.message}"`);
    console.log(`   Stage actual: ${decision.currentStage}`);
    console.log(`   Siguiente stage: ${decision.nextStage}`);
    console.log(`   Debe preguntar: ${decision.shouldAskQuestion ? 'Sí' : 'No'}`);
    if (decision.suggestedQuestion) {
      console.log(`   Pregunta sugerida: "${decision.suggestedQuestion.substring(0, 50)}..."`);
    }
    console.log(`   Razonamiento: ${decision.reasoning}`);
    console.log(`   Confianza: ${(decision.confidence * 100).toFixed(0)}%`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Test 4 completado\n');
}

/**
 * Test 5: Estadísticas del sistema
 */
async function testSystemStats() {
  console.log('📊 TEST 5: ESTADÍSTICAS DEL SISTEMA\n');
  console.log('='.repeat(60));
  
  const stats = orchestrator.getStats();
  
  console.log('\n📈 Estadísticas generales:');
  console.log(`   Total de conversaciones activas: ${stats.total}`);
  
  if (stats.contexts && stats.contexts.length > 0) {
    console.log('\n💬 Conversaciones:');
    stats.contexts.forEach((ctx, i) => {
      console.log(`\n   ${i + 1}. Chat: ${ctx.key}`);
      console.log(`      Producto: ${ctx.product || 'ninguno'}`);
      console.log(`      Mensajes: ${ctx.messages}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Test 5 completado\n');
}

/**
 * Ejecutar todos los tests
 */
async function runAllTests() {
  try {
    await testFullSalesFlow();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testObjectionHandling();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testQuestionGeneration();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testFlowAnalysis();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testSystemStats();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 TODOS LOS TESTS COMPLETADOS EXITOSAMENTE');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ ERROR EN LOS TESTS:', error);
  }
}

// Ejecutar tests
runAllTests();
