import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function configurarLinksPago() {
  console.log('🔧 CONFIGURANDO LINKS DE PAGO MASIVAMENTE...\\n');
  
  // 1. Verificar variables de entorno
  const PAYPAL_LINK_BASE = process.env.PAYPAL_LINK_TEMPLATE;
  
  if (!PAYPAL_LINK_BASE) {
    console.log('❌ ERROR: PAYPAL_LINK_TEMPLATE no configurado en .env\\n');
    console.log('📝 Agregar a .env:');
    console.log('   PAYPAL_LINK_TEMPLATE=https://www.paypal.com/ncp/payment/YOUR_BUSINESS_ID\\n');
    process.exit(1);
  }
  
  console.log('✅ PAYPAL_LINK_TEMPLATE configurado:');
  console.log('   ' + PAYPAL_LINK_BASE + '\\n');
  
  // 2. Buscar productos sin links
  console.log('🔍 Buscando productos sin links de pago...\\n');
  
  const productosSinLinks = await prisma.product.findMany({
    where: {
      AND: [
        { paymentLinkPayPal: null },
        { paymentLinkMercadoPago: null },
        { paymentLinkCustom: null }
      ]
    },
    select: {
      id: true,
      name: true,
      category: true,
      price: true
    }
  });
  
  if (productosSinLinks.length === 0) {
    console.log('✅ Todos los productos ya tienen links de pago configurados\\n');
    await prisma.$disconnect();
    return;
  }
  
  console.log('⚠️  Encontrados ' + productosSinLinks.length + ' productos sin links de pago\\n');
  
  // Mostrar algunos ejemplos
  console.log('📦 Ejemplos de productos a configurar:');
  productosSinLinks.slice(0, 5).forEach((p, i) => {
    console.log('   ' + (i + 1) + '. ' + p.name + ' - $' + p.price.toLocaleString());
  });
  
  if (productosSinLinks.length > 5) {
    console.log('   ... y ' + (productosSinLinks.length - 5) + ' más\\n');
  } else {
    console.log('');
  }
  
  // 3. Confirmar acción
  console.log('🔧 Configurando links de PayPal...\\n');
  
  let configurados = 0;
  let errores = 0;
  
  for (const producto of productosSinLinks) {
    try {
      await prisma.product.update({
        where: { id: producto.id },
        data: {
          paymentLinkPayPal: PAYPAL_LINK_BASE
        }
      });
      configurados++;
      
      if (configurados % 50 === 0) {
        console.log('   ✅ ' + configurados + '/' + productosSinLinks.length + ' productos configurados...');
      }
    } catch (error) {
      console.error('   ❌ Error en producto ' + producto.name + ':', error);
      errores++;
    }
  }
  
  // 4. Resumen
  console.log('\\n' + '='.repeat(80));
  console.log('📊 RESUMEN DE CONFIGURACIÓN');
  console.log('='.repeat(80) + '\\n');
  
  console.log('✅ Productos configurados: ' + configurados);
  console.log('❌ Errores: ' + errores);
  console.log('📈 Total procesados: ' + productosSinLinks.length + '\\n');
  
  if (configurados > 0) {
    console.log('✅ Links de PayPal configurados exitosamente\\n');
    console.log('📝 Próximos pasos:');
    console.log('   1. Verificar que los links funcionan');
    console.log('   2. Personalizar links por producto si es necesario');
    console.log('   3. Configurar MercadoPago y otros métodos de pago\\n');
  }
  
  // 5. Verificar productos específicos
  console.log('🔍 Verificando productos clave...\\n');
  
  const megapackIdiomas = await prisma.product.findFirst({
    where: {
      OR: [
        { name: { contains: 'idiomas', mode: 'insensitive' } },
        { name: { contains: 'idioma', mode: 'insensitive' } }
      ],
      AND: [
        {
          OR: [
            { name: { contains: 'megapack', mode: 'insensitive' } },
            { name: { contains: 'mega pack', mode: 'insensitive' } }
          ]
        }
      ]
    },
    select: {
      id: true,
      name: true,
      paymentLinkPayPal: true,
      paymentLinkMercadoPago: true,
      paymentLinkCustom: true
    }
  });
  
  if (megapackIdiomas) {
    console.log('✅ MegaPack de Idiomas encontrado:');
    console.log('   Nombre: ' + megapackIdiomas.name);
    console.log('   PayPal: ' + (megapackIdiomas.paymentLinkPayPal ? '✅ Configurado' : '❌ No configurado'));
    console.log('   MercadoPago: ' + (megapackIdiomas.paymentLinkMercadoPago ? '✅ Configurado' : '⚠️  No configurado'));
    console.log('   Custom: ' + (megapackIdiomas.paymentLinkCustom ? '✅ Configurado' : '⚠️  No configurado') + '\\n');
  }
  
  await prisma.$disconnect();
}

configurarLinksPago().catch(console.error);
