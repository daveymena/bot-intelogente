/**
 * Test Rápido de Flujo de Ventas
 * Prueba el flujo completo con productos reales
 */

import { Orchestrator } from '../src/agents/orchestrator';
import { db } from '../src/lib/db';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function setupTestData() {
  console.log(`\n${colors.cyan}📦 Obteniendo datos reales de la base de datos...${colors.reset}\n`);
  
  // Obtener el primer usuario real
  const user = await db.user.findFirst({
    where: {
      isEmailVerified: true,
    },
  });

  if (!user) {
    throw new Error('No se encontró ningún usuario verificado en la base de datos');
  }

  // Obtener productos reales
  const products = await db.product.findMany({
    where: {
      userId: user.id,
      status: 'AVAILABLE',
    },
    take: 10,
  });

  console.log(`${colors.green}✅ Usuario encontrado: ${user.name || user.email}${colors.reset}`);
  console.log(`${colors.green}✅ Productos disponibles: ${products.length}${colors.reset}\n`);
  
  // Mostrar algunos productos de ejemplo
  console.log(`${colors.cyan}📦 Productos en catálogo:${colors.reset}`);
  products.slice(0, 5).forEach(p => {
    const price = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(p.price);
    console.log(`  • ${p.name} - ${price} (${p.category})`);
  });
  console.log('');

  return user.id;
}

async function testConversation(userId: string, chatId: string, messages: string[]) {
  const orchestrator = new Orchestrator();
  
  for (const message of messages) {
    console.log(`${colors.blue}👤 Cliente:${colors.reset} "${message}"`);
    
    try {
      const response = await orchestrator.processMessage({
        message,
        chatId,
        userId,
        userName: 'Test User',
      });
      
      const responseText = typeof response === 'string' ? response : response.text;
      console.log(`${colors.green}🤖 Bot:${colors.reset} ${responseText.substring(0, 200)}...`);
      console.log('');
    } catch (error) {
      console.log(`${colors.red}❌ Error:${colors.reset}`, error);
      console.log('');
    }
    
    // Pequeña pausa entre mensajes
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

async function runTests() {
  console.log(`\n${colors.bright}${colors.cyan}🧪 TEST DE FLUJO DE VENTAS${colors.reset}\n`);
  
  try {
    // Setup
    const userId = await setupTestData();
    const chatId = `test-${Date.now()}`;
    
    // Obtener productos reales para las pruebas
    const allProducts = await db.product.findMany({
      where: {
        userId,
        status: 'AVAILABLE',
      },
    });

    // Buscar producto digital
    const digitalProduct = allProducts.find(p => 
      p.type === 'DIGITAL' || 
      p.category?.toLowerCase().includes('curso') ||
      p.category?.toLowerCase().includes('digital') ||
      p.category?.toLowerCase().includes('megapack')
    );

    // Buscar producto físico
    const physicalProduct = allProducts.find(p => 
      p.type === 'PHYSICAL' || 
      p.category?.toLowerCase().includes('computador') ||
      p.category?.toLowerCase().includes('laptop') ||
      p.category?.toLowerCase().includes('portátil') ||
      p.category?.toLowerCase().includes('portatil')
    );

    // Test 1: Venta de Producto Digital
    if (digitalProduct) {
      console.log(`${colors.bright}${colors.yellow}📋 TEST 1: Venta de Producto Digital (${digitalProduct.name})${colors.reset}\n`);
      
      // Extraer palabras clave del nombre del producto
      const searchTerm = digitalProduct.name.split(' ').slice(0, 3).join(' ');
      
      await testConversation(userId, chatId + '-1', [
        'Hola',
        `Busco ${searchTerm}`,
        'Cuánto cuesta',
        'Qué incluye',
        'Cómo pago',
        'Quiero pagar por MercadoPago',
        'Luego te envío el comprobante',
      ]);
    } else {
      console.log(`${colors.yellow}⚠️ No se encontró producto digital para probar${colors.reset}\n`);
    }
    
    // Test 2: Venta de Producto Físico
    if (physicalProduct) {
      console.log(`\n${colors.bright}${colors.yellow}📋 TEST 2: Venta de Producto Físico (${physicalProduct.name})${colors.reset}\n`);
      
      // Extraer palabras clave del nombre del producto
      const searchTerm = physicalProduct.name.split(' ').slice(0, 3).join(' ');
      
      await testConversation(userId, chatId + '-2', [
        'Hola',
        `Necesito ${searchTerm}`,
        'Cuál es el precio',
        'Tiene garantía',
        'Métodos de pago',
        'Puedo pagar contraentrega',
      ]);
    } else {
      console.log(`${colors.yellow}⚠️ No se encontró producto físico para probar${colors.reset}\n`);
    }
    
    console.log(`\n${colors.bright}${colors.green}✅ TESTS COMPLETADOS${colors.reset}\n`);
    
  } catch (error) {
    console.error(`\n${colors.red}❌ Error en tests:${colors.reset}`, error);
  } finally {
    await db.$disconnect();
  }
}

runTests();
