import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testEnlacesReales() {
  console.log('🧪 VERIFICACIÓN: Enlaces en productos\n');
  console.log('='.repeat(60));

  try {
    // Buscar productos digitales
    const productosDigitales = await prisma.product.findMany({
      where: {
        category: 'DIGITAL'
      },
      select: {
        id: true,
        name: true,
        price: true,
        paymentLinkMercadoPago: true,
        paymentLinkPayPal: true,
        paymentLinkCustom: true
      },
      take: 10
    });

    console.log(`\n📦 Productos Digitales (${productosDigitales.length}):\n`);

    let conEnlace = 0;
    let sinEnlace = 0;

    for (const producto of productosDigitales) {
      const tieneEnlace = producto.paymentLinkMercadoPago || 
                          producto.paymentLinkPayPal || 
                          producto.paymentLinkCustom;
      
      if (tieneEnlace) {
        conEnlace++;
        console.log(`✅ ${producto.name}`);
        console.log(`   💰 Precio: $${producto.price.toLocaleString()} COP`);
        const enlace = producto.paymentLinkMercadoPago || 
                       producto.paymentLinkPayPal || 
                       producto.paymentLinkCustom;
        console.log(`   🔗 Enlace: ${enlace}`);
      } else {
        sinEnlace++;
        console.log(`⚠️  ${producto.name}`);
        console.log(`   💰 Precio: $${producto.price.toLocaleString()} COP`);
        console.log(`   ❌ Sin enlace configurado`);
      }
      console.log('');
    }

    console.log('='.repeat(60));
    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Con enlace: ${conEnlace} productos`);
    console.log(`   ⚠️  Sin enlace: ${sinEnlace} productos`);

    if (sinEnlace > 0) {
      console.log(`\n💡 Recomendación:`);
      console.log(`   Para que el bot muestre enlaces reales:`);
      console.log(`   1. Ve al dashboard: http://localhost:4000`);
      console.log(`   2. Edita cada producto`);
      console.log(`   3. Agrega el enlace en "Link de Pago"`);
      console.log(`\n   Mientras tanto, el bot dará el contacto directo:`);
      console.log(`   📱 +57 304 274 8687`);
    } else {
      console.log(`\n✅ ¡Perfecto! Todos los productos tienen enlaces configurados`);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testEnlacesReales();
