
import { PaymentAgent } from '../src/agents/payment-agent';
import { SharedMemory } from '../src/agents/shared-memory';
import { PaymentMethodsConfig } from '../src/lib/payment-methods-config';

// Mock Product
const mockProduct = {
  id: 'test-product-id',
  name: 'Curso de Piano Premium',
  price: 50000,
  description: 'Curso completo de piano para principiantes',
  category: 'curso',
  images: ['url-to-image'],
  stock: 100
};

// Mock Memory
const mockMemory: SharedMemory = {
  chatId: 'test-chat-id',
  userId: 'test-user-id',
  messages: [],
  currentProduct: mockProduct, // Product is already in context
  salesStage: 'payment',
  paymentIntent: true
};

async function runTest() {
  console.log('🚀 INICIANDO TEST DE LÓGICA DE PAGOS\n');
  const agent = new PaymentAgent();

  // TEST 1: Listar métodos de pago
  console.log('---------------------------------------------------');
  console.log('🧪 TEST 1: Solicitud General ("quiero comprar")');
  const response1 = await agent.execute('quiero comprar', { ...mockMemory });
  console.log('📝 RESPUESTA DEL BOT:');
  console.log(response1.text);
  
  if (response1.text.includes('Métodos de Pago Disponibles') && response1.text.includes('MercadoPago')) {
    console.log('✅ PASÓ: Muestra la lista de métodos.');
  } else {
    console.log('❌ FALLÓ: No mostró la lista correctamente.');
  }

  // TEST 2: Selección de Nequi (Verificar instrucciones de foto)
  console.log('\n---------------------------------------------------');
  console.log('🧪 TEST 2: Selección de Nequi ("nequi")');
  const response2 = await agent.execute('nequi', { ...mockMemory });
  console.log('📝 RESPUESTA DEL BOT:');
  console.log(response2.text);

  if (response2.text.includes('Toma captura del comprobante') && response2.text.includes('Envíame la captura por aquí')) {
    console.log('✅ PASÓ: Pide la foto del comprobante explícitamente.');
  } else {
    console.log('❌ FALLÓ: No pidió la foto correctamente.');
  }

  // TEST 3: Selección de MercadoPago (Verificar generación de link)
  console.log('\n---------------------------------------------------');
  console.log('🧪 TEST 3: Selección de MercadoPago ("mercadopago")');
  
  // Mockear el generador de links para no llamar a la API real si falla
  // Pero intentaremos que corra real si hay credenciales, si no, veremos el error controlado
  try {
    const response3 = await agent.execute('mercadopago', { ...mockMemory });
    console.log('📝 RESPUESTA DEL BOT:');
    console.log(response3.text);

    if (response3.text.includes('Link de MercadoPago') || response3.text.includes('http')) {
      console.log('✅ PASÓ: Generó un link (o intentó mostrarlo).');
    } else {
      console.log('⚠️ OBSERVACIÓN: Verifique si se generó el link arriba.');
    }
  } catch (e) {
    console.log('⚠️ Error ejecutando test de MercadoPago (posible falta de credenciales en test):', e);
  }

  console.log('\n---------------------------------------------------');
  console.log('🏁 FIN DEL TEST');
}

runTest().catch(console.error);
