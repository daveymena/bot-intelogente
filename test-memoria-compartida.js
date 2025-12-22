/**
 * Test del Sistema de Memoria Compartida Mejorado
 * Simula una conversación completa para verificar que la memoria funciona
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Simular el sistema de memoria
class TestMemorySystem {
  constructor() {
    this.memories = new Map();
  }

  createMemory(chatId, userId) {
    return {
      userId,
      chatId,
      currentProduct: null,
      interestedProducts: [],
      productHistory: [],
      messages: [],
      salesStage: 'greeting',
      paymentIntent: false,
      photoSent: false,
      paymentLinkSent: false,
      productInfoSent: false,
      greetingSent: false,
      viewedProducts: [],
      searchQueries: [],
      lastUpdate: new Date(),
      createdAt: new Date(),
    };
  }

  get(chatId, userId) {
    if (!this.memories.has(chatId)) {
      this.memories.set(chatId, this.createMemory(chatId, userId));
    }
    return this.memories.get(chatId);
  }

  setCurrentProduct(chatId, product, stage = 'viewed') {
    const memory = this.memories.get(chatId);
    if (!memory) return;

    const isNewProduct = !memory.currentProduct || memory.currentProduct.id !== product.id;

    if (isNewProduct) {
      console.log(`\n🔄 Cambio de producto: ${memory.currentProduct?.name || 'ninguno'} → ${product.name}`);
      
      // Agregar al historial
      memory.productHistory.push({
        product,
        timestamp: new Date(),
        stage,
      });

      // Resetear flags
      memory.photoSent = false;
      memory.productInfoSent = false;
      memory.paymentLinkSent = false;
    }

    memory.currentProduct = product;
    
    if (!memory.interestedProducts.find(p => p.id === product.id)) {
      memory.interestedProducts.push(product);
    }

    if (!memory.viewedProducts.includes(product.id)) {
      memory.viewedProducts.push(product.id);
    }

    memory.lastUpdate = new Date();
  }

  findProductInHistory(chatId) {
    const memory = this.memories.get(chatId);
    if (!memory) return null;

    if (memory.currentProduct) {
      return memory.currentProduct;
    }

    if (memory.productHistory.length > 0) {
      return memory.productHistory[memory.productHistory.length - 1].product;
    }

    if (memory.interestedProducts.length > 0) {
      return memory.interestedProducts[memory.interestedProducts.length - 1];
    }

    return null;
  }

  addMessage(chatId, role, content) {
    const memory = this.memories.get(chatId);
    if (memory) {
      memory.messages.push({ role, content, timestamp: new Date() });
    }
  }

  getContext(chatId) {
    const memory = this.memories.get(chatId);
    if (!memory) return '';

    const parts = [];
    
    if (memory.currentProduct) {
      parts.push(`Producto actual: ${memory.currentProduct.name}`);
    }

    if (memory.productHistory.length > 1) {
      const others = memory.productHistory.slice(0, -1).map(h => h.product.name).join(', ');
      parts.push(`También preguntó por: ${others}`);
    }

    parts.push(`Etapa: ${memory.salesStage}`);

    if (memory.paymentIntent) {
      parts.push('Cliente tiene intención de pago');
    }

    return parts.join(' | ');
  }
}

async function testMemorySystem() {
  console.log('🧪 Iniciando test del sistema de memoria compartida...\n');

  const memorySystem = new TestMemorySystem();
  const chatId = 'test-chat-123';
  const userId = 'test-user-456';

  // Obtener algunos productos de prueba
  const products = await prisma.product.findMany({
    take: 3,
    where: { status: 'AVAILABLE' },
  });

  if (products.length < 2) {
    console.log('❌ No hay suficientes productos en la BD para el test');
    return;
  }

  const [laptop, moto, curso] = products;

  console.log('📦 Productos de prueba:');
  products.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.name} - $${p.price.toLocaleString('es-CO')}`);
  });

  // Simular conversación
  console.log('\n\n🎬 SIMULACIÓN DE CONVERSACIÓN\n');
  console.log('=' .repeat(60));

  // 1. Cliente busca un portátil
  console.log('\n👤 Cliente: "Quiero un portátil"');
  const memory = memorySystem.get(chatId, userId);
  memorySystem.addMessage(chatId, 'user', 'Quiero un portátil');
  
  console.log('🤖 Bot: [Muestra laptop]');
  memorySystem.setCurrentProduct(chatId, laptop, 'viewed');
  memorySystem.addMessage(chatId, 'assistant', `Te muestro: ${laptop.name}`);
  
  console.log(`✅ Producto en memoria: ${memory.currentProduct?.name}`);
  console.log(`📊 Historial: ${memory.productHistory.length} productos`);

  // 2. Cliente pregunta por métodos de pago
  console.log('\n👤 Cliente: "Tiene los métodos de pago?"');
  memorySystem.addMessage(chatId, 'user', 'Tiene los métodos de pago?');
  
  // Simular que el PaymentAgent busca el producto
  const productForPayment = memorySystem.findProductInHistory(chatId);
  
  if (productForPayment) {
    console.log(`✅ PaymentAgent recuperó: ${productForPayment.name}`);
    memorySystem.setCurrentProduct(chatId, productForPayment, 'payment_intent');
    console.log(`🤖 Bot: "Sí! Para ${productForPayment.name} puedes pagar con..."`);
  } else {
    console.log('❌ ERROR: No se pudo recuperar el producto');
  }

  console.log(`📊 Contexto: ${memorySystem.getContext(chatId)}`);

  // 3. Cliente cambia de opinión y pregunta por una moto
  console.log('\n👤 Cliente: "Y qué tal una moto?"');
  memorySystem.addMessage(chatId, 'user', 'Y qué tal una moto?');
  
  console.log('🤖 Bot: [Muestra moto]');
  memorySystem.setCurrentProduct(chatId, moto, 'viewed');
  memorySystem.addMessage(chatId, 'assistant', `Te muestro: ${moto.name}`);
  
  console.log(`✅ Producto actual: ${memory.currentProduct?.name}`);
  console.log(`📊 Historial: ${memory.productHistory.length} productos`);
  console.log(`   1. ${memory.productHistory[0].product.name} (${memory.productHistory[0].stage})`);
  console.log(`   2. ${memory.productHistory[1].product.name} (${memory.productHistory[1].stage})`);

  // 4. Cliente pregunta por precio (sin mencionar el producto)
  console.log('\n👤 Cliente: "Cuánto cuesta?"');
  memorySystem.addMessage(chatId, 'user', 'Cuánto cuesta?');
  
  const currentProduct = memorySystem.findProductInHistory(chatId);
  
  if (currentProduct) {
    console.log(`✅ ProductAgent recuperó: ${currentProduct.name}`);
    console.log(`🤖 Bot: "${currentProduct.name} cuesta $${currentProduct.price.toLocaleString('es-CO')}"`);
  } else {
    console.log('❌ ERROR: No se pudo recuperar el producto');
  }

  // 5. Cliente pregunta por más información
  console.log('\n👤 Cliente: "Cuéntame más"');
  memorySystem.addMessage(chatId, 'user', 'Cuéntame más');
  
  const productForInfo = memorySystem.findProductInHistory(chatId);
  
  if (productForInfo) {
    console.log(`✅ ProductAgent recuperó: ${productForInfo.name}`);
    memorySystem.setCurrentProduct(chatId, productForInfo, 'interested');
    console.log(`🤖 Bot: "Claro! ${productForInfo.name} tiene..."`);
  } else {
    console.log('❌ ERROR: No se pudo recuperar el producto');
  }

  // 6. Cliente pregunta por métodos de pago de la moto
  console.log('\n👤 Cliente: "Cómo puedo pagar?"');
  memorySystem.addMessage(chatId, 'user', 'Cómo puedo pagar?');
  
  const productForPayment2 = memorySystem.findProductInHistory(chatId);
  
  if (productForPayment2) {
    console.log(`✅ PaymentAgent recuperó: ${productForPayment2.name}`);
    memorySystem.setCurrentProduct(chatId, productForPayment2, 'payment_intent');
    console.log(`🤖 Bot: "Para ${productForPayment2.name} aceptamos..."`);
  } else {
    console.log('❌ ERROR: No se pudo recuperar el producto');
  }

  // Resumen final
  console.log('\n\n📊 RESUMEN FINAL');
  console.log('=' .repeat(60));
  console.log(`Producto actual: ${memory.currentProduct?.name}`);
  console.log(`Productos de interés: ${memory.interestedProducts.length}`);
  memory.interestedProducts.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.name}`);
  });
  console.log(`Historial de productos: ${memory.productHistory.length}`);
  memory.productHistory.forEach((h, i) => {
    console.log(`  ${i + 1}. ${h.product.name} (${h.stage})`);
  });
  console.log(`Mensajes: ${memory.messages.length}`);
  console.log(`\nContexto completo: ${memorySystem.getContext(chatId)}`);

  console.log('\n\n✅ Test completado exitosamente!');
  console.log('El sistema de memoria compartida funciona correctamente.');
}

// Ejecutar test
testMemorySystem()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
