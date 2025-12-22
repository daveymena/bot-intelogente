/**
 * 🔗 GENERAR LINKS DE PAGO PARA TODOS LOS CURSOS
 * 
 * Este script genera links de pago dinámicos para todos los cursos
 * y megapacks disponibles en el catálogo
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generarLinksTodosCursos() {
  console.log('🔗 GENERANDO LINKS DE PAGO PARA TODOS LOS CURSOS\n');
  console.log('='.repeat(60));

  try {
    // Obtener todos los productos digitales (cursos y megapacks)
    const productos = await prisma.product.findMany({
      where: {
        category: 'DIGITAL',
        status: 'AVAILABLE'
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`\n📦 Total de productos digitales: ${productos.length}\n`);

    // Generar links para cada producto
    for (const producto of productos) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📚 ${producto.name}`);
      console.log(`💰 Precio: ${producto.price.toLocaleString('es-CO')} COP`);
      console.log(`\n🔗 LINKS DE PAGO:\n`);

      // MercadoPago
      const mercadoPagoLink = `https://tecnovariedades.com/payment/mercadopago?product=${encodeURIComponent(producto.name)}&amount=${producto.price}&id=${producto.id}`;
      console.log(`💳 MercadoPago:`);
      console.log(`   ${mercadoPagoLink}\n`);

      // PayPal
      const paypalLink = `https://tecnovariedades.com/payment/paypal?product=${encodeURIComponent(producto.name)}&amount=${producto.price}&id=${producto.id}`;
      console.log(`🌍 PayPal:`);
      console.log(`   ${paypalLink}\n`);

      // Nequi/Daviplata (Instrucciones)
      console.log(`📱 Nequi/Daviplata:`);
      console.log(`   Transferir ${producto.price.toLocaleString('es-CO')} COP al 3136174267`);
      console.log(`   Enviar captura del pago\n`);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`\n✅ Links generados para ${productos.length} productos`);
    console.log(`\n📝 NOTA: Estos links son dinámicos y se generan automáticamente`);
    console.log(`cuando el cliente pregunta por un producto específico.\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
generarLinksTodosCursos();
