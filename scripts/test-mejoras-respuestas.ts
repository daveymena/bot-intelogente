/**
 * 🧪 TEST DE MEJORAS EN RESPUESTAS Y COHERENCIA
 * Verifica que las mejoras aplicadas funcionen correctamente
 */

import { CoherentResponseSystem } from '../src/lib/coherent-response-system';
import { UnifiedMemory } from '../src/lib/unified-memory-service';

console.log('🧪 INICIANDO TESTS DE MEJORAS EN RESPUESTAS\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const coherentSystem = CoherentResponseSystem.getInstance();

// Mock de contexto
const mockContext: UnifiedMemory = {
  chatId: 'test@test.com',
  userId: 'test-user',
  userName: 'Juan',
  messageCount: 1,
  conversationStage: 'greeting',
  currentProduct: {
    id: '1',
    name: 'Curso Completo de Piano',
    price: 60000,
    category: 'Cursos Digitales',
    description: 'Aprende piano desde cero',
  },
  interestedProducts: [],
  productHistory: [],
  viewedProducts: [],
  objections: [],
  budget: null,
  paymentIntent: false,
  paymentLinkSent: false,
  photoSent: false,
  productInfoSent: false,
  preferredPaymentMethod: null,
  messages: [],
  lastActivity: new Date(),
};

// Test 1: Saludo inicial
console.log('📝 TEST 1: SALUDO INICIAL');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const greeting = coherentSystem.generateCoherentResponse({
  intent: 'greeting',
  context: mockContext,
  tone: 'friendly',
});

console.log('Respuesta:');
console.log(greeting);
console.log('\n✅ Verificar que:');
console.log('  - Menciona "Tecnovariedades D&S"');
console.log('  - Muestra catálogo (Laptops, Motos, Cursos, Megapacks)');
console.log('  - Usa emojis apropiados');
console.log('\n');

// Test 2: Información de producto
console.log('📝 TEST 2: INFORMACIÓN DE PRODUCTO');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const productInfo = coherentSystem.generateCoherentResponse({
  intent: 'product_info',
  context: mockContext,
  tone: 'friendly',
});

console.log('Respuesta:');
console.log(productInfo);
console.log('\n✅ Verificar que:');
console.log('  - Muestra precio formateado ($60.000)');
console.log('  - Menciona el nombre del producto');
console.log('  - Ofrece siguiente paso claro');
console.log('\n');

// Test 3: Solicitud de pago
console.log('📝 TEST 3: SOLICITUD DE PAGO');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const paymentRequest = coherentSystem.generateCoherentResponse({
  intent: 'payment_request',
  context: mockContext,
  tone: 'friendly',
});

console.log('Respuesta:');
console.log(paymentRequest);
console.log('\n✅ Verificar que:');
console.log('  - Muestra resumen del pedido');
console.log('  - Lista métodos de pago (MercadoPago, PayPal, Nequi, etc.)');
console.log('  - Tiene formato visual claro');
console.log('  - Incluye emojis apropiados');
console.log('\n');

// Test 4: Objeción de precio
console.log('📝 TEST 4: OBJECIÓN DE PRECIO');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const contextWithObjection = {
  ...mockContext,
  objections: [{ type: 'price', message: 'está muy caro', timestamp: new Date() }],
};

const objectionResponse = coherentSystem.generateCoherentResponse({
  intent: 'objection',
  context: contextWithObjection as any,
  tone: 'friendly',
});

console.log('Respuesta:');
console.log(objectionResponse);
console.log('\n✅ Verificar que:');
console.log('  - Muestra empatía');
console.log('  - Lista opciones concretas');
console.log('  - Invita a continuar conversación');
console.log('\n');

// Test 5: Confirmación
console.log('📝 TEST 5: CONFIRMACIÓN DE COMPRA');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const contextWithPaymentIntent = {
  ...mockContext,
  paymentIntent: true,
};

const confirmation = coherentSystem.generateCoherentResponse({
  intent: 'confirmation',
  context: contextWithPaymentIntent as any,
  tone: 'friendly',
});

console.log('Respuesta:');
console.log(confirmation);
console.log('\n✅ Verificar que:');
console.log('  - Muestra resumen visual');
console.log('  - Incluye producto y precio');
console.log('  - Tiene call to action claro');
console.log('  - Usa tono celebratorio');
console.log('\n');

// Test 6: Producto físico vs digital
console.log('📝 TEST 6: DIFERENCIACIÓN DIGITAL VS FÍSICO');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const physicalProduct = {
  ...mockContext,
  currentProduct: {
    id: '2',
    name: 'Laptop Asus Vivobook',
    price: 2500000,
    category: 'Laptops',
    description: 'Laptop potente para trabajo',
  },
};

const physicalInfo = coherentSystem.generateCoherentResponse({
  intent: 'product_info',
  context: physicalProduct as any,
  tone: 'friendly',
});

console.log('Producto Digital (Curso):');
console.log(productInfo);
console.log('\n');
console.log('Producto Físico (Laptop):');
console.log(physicalInfo);
console.log('\n✅ Verificar que:');
console.log('  - Digital menciona "Acceso INMEDIATO"');
console.log('  - Físico menciona "Envío GRATIS"');
console.log('  - Ambos tienen formato consistente');
console.log('\n');

// Resumen
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ TESTS COMPLETADOS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📊 RESUMEN:');
console.log('  - 6 escenarios probados');
console.log('  - Verificar manualmente cada respuesta');
console.log('  - Confirmar formato visual y contenido');
console.log('\n');

console.log('🚀 SIGUIENTE PASO:');
console.log('  Probar en WhatsApp real con flujo completo');
console.log('  npm run dev');
console.log('\n');
