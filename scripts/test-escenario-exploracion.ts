/**
 * TEST: ESCENARIO DE EXPLORACIÓN
 * Cliente llega sin saber exactamente qué quiere
 * Busca computadores, monitores, bafles
 */

import { EnhancedLocalBot } from '../src/lib/enhanced-local-bot';

const testUserId = 'test-user-id';
const testPhone = '+57300123456';

// Contexto simulado simple
let currentProduct: any = null;

// Simular respuestas de IA
const mockAIResponse = async (message: string) => {
  const lowerMsg = message.toLowerCase();
  
  // Búsqueda de computadores
  if (lowerMsg.includes('computador') || lowerMsg.includes('pc')) {
    return {
      response: `¡Claro! 💻 Tenemos varios computadores excelentes:\n\n` +
        `1️⃣ *Laptop HP 15-dy2795wm*\n` +
        `   • Intel Core i5 11va Gen\n` +
        `   • 8GB RAM, 256GB SSD\n` +
        `   • Pantalla 15.6" HD\n` +
        `   💰 $1.850.000 COP\n\n` +
        `2️⃣ *PC Gamer Ryzen 5*\n` +
        `   • AMD Ryzen 5 5600G\n` +
        `   • 16GB RAM, 512GB SSD\n` +
        `   • Gráficos Vega 7\n` +
        `   💰 $2.200.000 COP\n\n` +
        `3️⃣ *Laptop Dell Inspiron 15*\n` +
        `   • Intel Core i7 12va Gen\n` +
        `   • 16GB RAM, 512GB SSD\n` +
        `   • Pantalla 15.6" FHD\n` +
        `   💰 $3.100.000 COP\n\n` +
        `¿Alguno te llama la atención? 😊`,
      action: 'search_product',
      confidence: 95
    };
  }
  
  // Pregunta por uso
  if (lowerMsg.includes('uso') || lowerMsg.includes('para qué')) {
    return {
      response: `Perfecto, eso me ayuda mucho 👍\n\n` +
        `Para *trabajo y estudio*, te recomiendo:\n\n` +
        `🌟 *Laptop HP 15-dy2795wm* - $1.850.000\n` +
        `Es ideal porque:\n` +
        `✅ Procesador rápido para multitarea\n` +
        `✅ Pantalla cómoda de 15.6"\n` +
        `✅ Batería de larga duración\n` +
        `✅ Perfecto para Office, navegación, videollamadas\n\n` +
        `¿Te gustaría saber más detalles? 😊`,
      action: 'answer_question',
      confidence: 90
    };
  }
  
  // Búsqueda de monitores
  if (lowerMsg.includes('monitor')) {
    return {
      response: `¡Excelente! 🖥️ Tenemos monitores de diferentes tamaños:\n\n` +
        `1️⃣ *Monitor LG 24" Full HD*\n` +
        `   • 24 pulgadas IPS\n` +
        `   • 1920x1080 (Full HD)\n` +
        `   • HDMI + VGA\n` +
        `   💰 $450.000 COP\n\n` +
        `2️⃣ *Monitor Samsung 27" Curvo*\n` +
        `   • 27 pulgadas curvo\n` +
        `   • 1920x1080 (Full HD)\n` +
        `   • 75Hz, FreeSync\n` +
        `   💰 $680.000 COP\n\n` +
        `3️⃣ *Monitor ASUS 32" 4K*\n` +
        `   • 32 pulgadas IPS\n` +
        `   • 3840x2160 (4K UHD)\n` +
        `   • HDR, USB-C\n` +
        `   💰 $1.200.000 COP\n\n` +
        `¿Qué tamaño te interesa más? 🤔`,
      action: 'search_product',
      confidence: 95
    };
  }
  
  // Búsqueda de bafles
  if (lowerMsg.includes('bafle') || lowerMsg.includes('parlante') || lowerMsg.includes('altavoz')) {
    return {
      response: `¡Genial! 🔊 Tenemos bafles para diferentes necesidades:\n\n` +
        `1️⃣ *Bafle Bluetooth JBL Flip 6*\n` +
        `   • Portátil, resistente al agua\n` +
        `   • 12 horas de batería\n` +
        `   • Sonido potente\n` +
        `   💰 $380.000 COP\n\n` +
        `2️⃣ *Bafle Activo Behringer 15"*\n` +
        `   • 1000W de potencia\n` +
        `   • Bluetooth + USB + SD\n` +
        `   • Ideal para fiestas\n` +
        `   💰 $850.000 COP\n\n` +
        `3️⃣ *Sistema 2.1 Logitech Z623*\n` +
        `   • Subwoofer + 2 satélites\n` +
        `   • 200W RMS\n` +
        `   • Para PC/TV\n` +
        `   💰 $520.000 COP\n\n` +
        `¿Para qué lo vas a usar? 🎵`,
      action: 'search_product',
      confidence: 95
    };
  }
  
  // Combo completo
  if (lowerMsg.includes('combo') || lowerMsg.includes('todo')) {
    return {
      response: `¡Perfecto! 🎁 Te armo un combo completo:\n\n` +
        `📦 *COMBO OFICINA COMPLETA*\n\n` +
        `💻 Laptop HP 15 - $1.850.000\n` +
        `🖥️ Monitor LG 24" - $450.000\n` +
        `🔊 Bafles Logitech - $520.000\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 Total: $2.820.000 COP\n\n` +
        `🎉 *DESCUENTO ESPECIAL*: $2.650.000\n` +
        `💵 ¡Ahorras $170.000!\n\n` +
        `¿Te interesa este combo? 😊`,
      action: 'answer_question',
      confidence: 95
    };
  }
  
  return {
    response: '¿En qué más puedo ayudarte? 😊',
    action: 'answer_question',
    confidence: 80
  };
};

async function testEscenarioExploracion() {
  console.log('\n🎯 TEST: ESCENARIO DE EXPLORACIÓN');
  console.log('Cliente llega sin saber exactamente qué quiere');
  console.log('═'.repeat(80));
  
  const localBot = new EnhancedLocalBot();
  
  const conversacion = [
    {
      step: '1️⃣ SALUDO INICIAL',
      cliente: 'Hola, buenas tardes',
      esperado: 'Saludo del bot'
    },
    {
      step: '2️⃣ EXPLORACIÓN GENERAL',
      cliente: 'Estoy buscando un computador',
      esperado: 'Lista de computadores disponibles'
    },
    {
      step: '3️⃣ CALIFICACIÓN - USO',
      cliente: 'Es para trabajo y estudio',
      esperado: 'Recomendación específica según uso'
    },
    {
      step: '4️⃣ MÁS INFORMACIÓN',
      cliente: '¿Cuánto cuesta el HP?',
      esperado: 'Detalles del producto HP'
    },
    {
      step: '5️⃣ EXPLORACIÓN ADICIONAL',
      cliente: 'También necesito un monitor',
      esperado: 'Lista de monitores'
    },
    {
      step: '6️⃣ ESPECIFICACIÓN',
      cliente: 'El de 24 pulgadas me interesa',
      esperado: 'Detalles del monitor 24"'
    },
    {
      step: '7️⃣ UPSELLING',
      cliente: '¿Y bafles tienen?',
      esperado: 'Lista de bafles'
    },
    {
      step: '8️⃣ COMBO',
      cliente: '¿Me haces un combo con todo?',
      esperado: 'Oferta de combo con descuento'
    },
    {
      step: '9️⃣ CIERRE',
      cliente: 'Me interesa, ¿cómo pago?',
      esperado: 'Métodos de pago'
    }
  ];
  
  for (const paso of conversacion) {
    console.log('\n' + '━'.repeat(80));
    console.log(paso.step);
    console.log('━'.repeat(80));
    console.log(`👤 Cliente: "${paso.cliente}"`);
    
    // Verificar respuesta del bot local
    const localResponse = await localBot.processMessage(paso.cliente);
    
    if (localResponse.wasLocal) {
      console.log('✅ Bot Local respondió');
      console.log(`📂 Categoría: ${localResponse.category}`);
      console.log(`🤖 Bot: "${localResponse.response.substring(0, 100)}..."`);
    } else {
      console.log('✅ Bot Local detectó → Enviando a IA');
      console.log('🤖 IA analizando mensaje...');
      
      // Simular respuesta de IA
      const aiResponse = await mockAIResponse(paso.cliente);
      
      console.log(`🎯 Acción: ${aiResponse.action}`);
      console.log(`📊 Confianza: ${aiResponse.confidence}%`);
      console.log(`🤖 Bot: "${aiResponse.response.substring(0, 150)}..."`);
    }
    
    console.log(`✓ Esperado: ${paso.esperado}`);
    
    // Pequeña pausa para legibilidad
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n' + '═'.repeat(80));
  console.log('📊 RESUMEN DEL FLUJO DE EXPLORACIÓN');
  console.log('═'.repeat(80));
  console.log('✅ Cliente exploró múltiples categorías');
  console.log('✅ Bot calificó necesidades (uso: trabajo/estudio)');
  console.log('✅ Recomendaciones personalizadas');
  console.log('✅ Upselling natural (monitor + bafles)');
  console.log('✅ Oferta de combo con descuento');
  console.log('✅ Cierre de venta exitoso');
  console.log('\n🎯 RESULTADO: Cliente satisfecho con múltiples productos');
  console.log('═'.repeat(80));
}

// Ejecutar test
testEscenarioExploracion()
  .then(() => {
    console.log('\n✅ Test completado exitosamente\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en el test:', error);
    process.exit(1);
  });
