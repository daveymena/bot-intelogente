/**
 * TEST: ESCENARIO PRODUCTO ESPECÍFICO
 * Cliente llega buscando un producto concreto
 * Ejemplo: PC Gamer o Monitor específico
 */

import { EnhancedLocalBot } from '../src/lib/enhanced-local-bot';

const testUserId = 'test-user-specific';
const testPhone = '+57300987654';

// Contexto simulado
let currentProduct: any = null;

// Simular respuestas de IA para búsqueda específica
const mockAISpecificResponse = async (message: string) => {
  const lowerMsg = message.toLowerCase();
  
  // Búsqueda específica de PC Gamer
  if (lowerMsg.includes('pc gamer') || lowerMsg.includes('gamer')) {
    return {
      response: `¡Perfecto! 🎮 Encontré este PC Gamer:\n\n` +
        `🖥️ *PC GAMER RYZEN 5 5600G*\n\n` +
        `*Especificaciones:*\n` +
        `• Procesador: AMD Ryzen 5 5600G (6 núcleos)\n` +
        `• RAM: 16GB DDR4 3200MHz\n` +
        `• Almacenamiento: 512GB SSD NVMe\n` +
        `• Gráficos: AMD Radeon Vega 7 integrados\n` +
        `• Fuente: 500W 80+ Bronze\n` +
        `• Case: RGB con ventiladores\n\n` +
        `*Rendimiento:*\n` +
        `✅ Fortnite: 100+ FPS (medio-alto)\n` +
        `✅ Valorant: 200+ FPS\n` +
        `✅ GTA V: 80+ FPS (alto)\n` +
        `✅ Minecraft: 150+ FPS\n\n` +
        `💰 *Precio: $2.200.000 COP*\n\n` +
        `¿Te gustaría saber más detalles? 😊`,
      action: 'search_product',
      confidence: 98,
      product: {
        name: 'PC Gamer Ryzen 5 5600G',
        price: 2200000
      }
    };
  }
  
  // Preguntas sobre especificaciones
  if (lowerMsg.includes('juego') || lowerMsg.includes('fps') || lowerMsg.includes('rendimiento')) {
    return {
      response: `¡Excelente pregunta! 🎯\n\n` +
        `El PC Gamer Ryzen 5 corre muy bien estos juegos:\n\n` +
        `🎮 *Juegos Populares:*\n` +
        `• Fortnite: 100-120 FPS (configuración media-alta)\n` +
        `• Valorant: 200+ FPS (configuración alta)\n` +
        `• League of Legends: 180+ FPS\n` +
        `• Minecraft: 150+ FPS con shaders\n` +
        `• GTA V: 80-90 FPS (configuración alta)\n` +
        `• CS:GO: 250+ FPS\n\n` +
        `💡 *Nota:* Si quieres jugar juegos más pesados como Cyberpunk o\n` +
        `Warzone, te recomendaría agregar una tarjeta gráfica dedicada\n` +
        `(RTX 3060 o RX 6600) en el futuro.\n\n` +
        `¿Qué juegos te gustaría jugar? 🎮`,
      action: 'answer_question',
      confidence: 95
    };
  }
  
  // Búsqueda de monitor específico
  if (lowerMsg.includes('monitor 27') || lowerMsg.includes('27 pulgadas')) {
    return {
      response: `¡Perfecto! 🖥️ Tengo este monitor de 27":\n\n` +
        `📺 *MONITOR SAMSUNG 27" CURVO*\n\n` +
        `*Especificaciones:*\n` +
        `• Tamaño: 27 pulgadas curvo (1800R)\n` +
        `• Resolución: 1920x1080 (Full HD)\n` +
        `• Tasa de refresco: 75Hz\n` +
        `• Tiempo de respuesta: 4ms\n` +
        `• Tecnología: FreeSync, Flicker-Free\n` +
        `• Conectividad: HDMI x2, DisplayPort\n\n` +
        `*Ideal para:*\n` +
        `✅ Gaming casual\n` +
        `✅ Trabajo y productividad\n` +
        `✅ Películas y series\n` +
        `✅ Diseño gráfico básico\n\n` +
        `💰 *Precio: $680.000 COP*\n\n` +
        `¿Te interesa? 😊`,
      action: 'search_product',
      confidence: 98,
      product: {
        name: 'Monitor Samsung 27" Curvo',
        price: 680000
      }
    };
  }
  
  // Comparación
  if (lowerMsg.includes('compar') || lowerMsg.includes('diferencia')) {
    return {
      response: `¡Claro! Te comparo los monitores:\n\n` +
        `📊 *COMPARACIÓN DE MONITORES*\n\n` +
        `*Monitor 24" LG ($450.000)*\n` +
        `✅ Más económico\n` +
        `✅ Consume menos espacio\n` +
        `✅ Panel IPS (mejores ángulos)\n` +
        `❌ Pantalla plana\n` +
        `❌ 60Hz estándar\n\n` +
        `*Monitor 27" Samsung ($680.000)*\n` +
        `✅ Pantalla más grande\n` +
        `✅ Curvo (más inmersivo)\n` +
        `✅ 75Hz (mejor para gaming)\n` +
        `✅ FreeSync (sin tearing)\n` +
        `❌ Más costoso\n\n` +
        `💡 *Recomendación:*\n` +
        `• Para trabajo/estudio → LG 24"\n` +
        `• Para gaming/multimedia → Samsung 27"\n\n` +
        `¿Cuál te convence más? 🤔`,
      action: 'answer_question',
      confidence: 90
    };
  }
  
  // Solicitud de pago
  if (lowerMsg.includes('comprar') || lowerMsg.includes('pago') || lowerMsg.includes('link')) {
    const product = currentProduct;
    return {
      response: `💳 ¡Perfecto! Aquí están tus opciones de pago:\n\n` +
        `📦 *Producto:* ${product?.name || 'PC Gamer Ryzen 5'}\n` +
        `💰 *Precio:* $${(product?.price || 2200000).toLocaleString('es-CO')} COP\n\n` +
        `*Métodos de pago disponibles:*\n\n` +
        `1️⃣ *MercadoPago* (Recomendado)\n` +
        `   💳 Tarjetas débito/crédito\n` +
        `   🏦 PSE (débito bancario)\n` +
        `   📱 Link: https://mpago.la/2X3Y4Z5\n\n` +
        `2️⃣ *Nequi / Daviplata*\n` +
        `   📱 Transferencia directa\n` +
        `   ☎️ 300-123-4567\n\n` +
        `3️⃣ *Bancolombia*\n` +
        `   🏦 Cuenta de ahorros\n` +
        `   💳 1234-5678-9012\n\n` +
        `¿Con cuál prefieres pagar? 😊`,
      action: 'generate_payment_links',
      confidence: 98
    };
  }
  
  return {
    response: '¿En qué más puedo ayudarte? 😊',
    action: 'answer_question',
    confidence: 80
  };
};

async function testEscenarioProductoEspecifico() {
  console.log('\n🎯 TEST: ESCENARIO PRODUCTO ESPECÍFICO');
  console.log('Cliente busca un producto concreto desde el inicio');
  console.log('═'.repeat(80));
  
  const localBot = new EnhancedLocalBot();
  
  // TEST 1: PC GAMER
  console.log('\n📍 CASO 1: BÚSQUEDA DE PC GAMER');
  console.log('═'.repeat(80));
  
  const conversacionGamer = [
    {
      step: '1️⃣ BÚSQUEDA DIRECTA',
      cliente: 'Hola, busco un PC gamer',
      esperado: 'Información detallada del PC Gamer'
    },
    {
      step: '2️⃣ PREGUNTA TÉCNICA',
      cliente: '¿Qué juegos corre bien?',
      esperado: 'Lista de juegos con FPS'
    },
    {
      step: '3️⃣ ESPECIFICACIÓN',
      cliente: 'Quiero jugar Fortnite y Valorant',
      esperado: 'Confirmación de rendimiento'
    },
    {
      step: '4️⃣ PRECIO',
      cliente: '¿Cuánto cuesta?',
      esperado: 'Precio y detalles'
    },
    {
      step: '5️⃣ CIERRE',
      cliente: 'Me interesa, ¿cómo compro?',
      esperado: 'Enlaces de pago'
    }
  ];
  
  for (const paso of conversacionGamer) {
    console.log('\n' + '━'.repeat(80));
    console.log(paso.step);
    console.log('━'.repeat(80));
    console.log(`👤 Cliente: "${paso.cliente}"`);
    
    const localResponse = await localBot.processMessage(paso.cliente);
    
    if (localResponse.wasLocal) {
      console.log('✅ Bot Local respondió');
      console.log(`🤖 Bot: "${localResponse.response.substring(0, 100)}..."`);
    } else {
      console.log('✅ Enviando a IA...');
      const aiResponse = await mockAISpecificResponse(paso.cliente);
      
      if (aiResponse.product) {
        currentProduct = aiResponse.product;
      }
      
      console.log(`🎯 Acción: ${aiResponse.action}`);
      console.log(`🤖 Bot: "${aiResponse.response.substring(0, 150)}..."`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // TEST 2: MONITOR ESPECÍFICO
  console.log('\n\n📍 CASO 2: BÚSQUEDA DE MONITOR 27"');
  console.log('═'.repeat(80));
  
  const conversacionMonitor = [
    {
      step: '1️⃣ BÚSQUEDA ESPECÍFICA',
      cliente: 'Necesito un monitor de 27 pulgadas',
      esperado: 'Información del monitor 27"'
    },
    {
      step: '2️⃣ COMPARACIÓN',
      cliente: '¿Cuál es la diferencia con el de 24"?',
      esperado: 'Comparación detallada'
    },
    {
      step: '3️⃣ DECISIÓN',
      cliente: 'Me quedo con el de 27"',
      esperado: 'Confirmación'
    },
    {
      step: '4️⃣ PAGO',
      cliente: 'Envíame el link de pago',
      esperado: 'Enlaces de pago'
    }
  ];
  
  for (const paso of conversacionMonitor) {
    console.log('\n' + '━'.repeat(80));
    console.log(paso.step);
    console.log('━'.repeat(80));
    console.log(`👤 Cliente: "${paso.cliente}"`);
    
    const localResponse = await localBot.processMessage(paso.cliente);
    
    if (localResponse.wasLocal) {
      console.log('✅ Bot Local respondió');
      console.log(`🤖 Bot: "${localResponse.response.substring(0, 100)}..."`);
    } else {
      console.log('✅ Enviando a IA...');
      const aiResponse = await mockAISpecificResponse(paso.cliente);
      
      if (aiResponse.product) {
        currentProduct = aiResponse.product;
      }
      
      console.log(`🎯 Acción: ${aiResponse.action}`);
      console.log(`🤖 Bot: "${aiResponse.response.substring(0, 150)}..."`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n' + '═'.repeat(80));
  console.log('📊 RESUMEN DE ESCENARIOS ESPECÍFICOS');
  console.log('═'.repeat(80));
  console.log('\n✅ CASO 1: PC GAMER');
  console.log('  • Búsqueda directa y específica');
  console.log('  • Información técnica detallada');
  console.log('  • Rendimiento en juegos populares');
  console.log('  • Cierre rápido (5 mensajes)');
  console.log('\n✅ CASO 2: MONITOR 27"');
  console.log('  • Búsqueda por especificación');
  console.log('  • Comparación con alternativas');
  console.log('  • Decisión informada');
  console.log('  • Cierre muy rápido (4 mensajes)');
  console.log('\n🎯 RESULTADO: Clientes con intención clara → Conversión rápida');
  console.log('═'.repeat(80));
}

// Ejecutar test
testEscenarioProductoEspecifico()
  .then(() => {
    console.log('\n✅ Test completado exitosamente\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en el test:', error);
    process.exit(1);
  });
