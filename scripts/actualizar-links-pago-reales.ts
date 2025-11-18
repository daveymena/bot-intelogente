import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function actualizarLinksReales() {
  console.log('🔄 ACTUALIZANDO LINKS DE PAGO CON VALORES REALES...\\n');
  
  // 1. Verificar configuración
  const PAYPAL_EMAIL = process.env.PAYPAL_EMAIL;
  const PAYPAL_LINK = process.env.PAYPAL_LINK_TEMPLATE;
  const MERCADOPAGO_LINK = process.env.MERCADOPAGO_LINK;
  
  console.log('📋 Configuración actual:');
  console.log('   PayPal Email: ' + PAYPAL_EMAIL);
  console.log('   PayPal Link: ' + PAYPAL_LINK);
  console.log('   MercadoPago Link: ' + MERCADOPAGO_LINK + '\\n');
  
  // 2. Buscar productos con links de ejemplo
  console.log('🔍 Buscando productos con links de ejemplo...\\n');
  
  const productosConEjemplo = await prisma.product.findMany({
    where: {
      OR: [
        { paymentLinkPayPal: { contains: 'LQXDGBXDXHFXE' } },
        { paymentLinkPayPal: { contains: 'YOUR_' } },
        { paymentLinkPayPal: { contains: 'TU_' } },
        { paymentLinkPayPal: { contains: 'example' } },
        { paymentLinkMercadoPago: { contains: 'TU_LINK' } },
        { paymentLinkMercadoPago: { contains: 'YOUR_' } },
        { paymentLinkMercadoPago: { contains: 'example' } }
      ]
    },
    select: {
      id: true,
      name: true,
      paymentLinkPayPal: true,
      paymentLinkMercadoPago: true
    }
  });
  
  if (productosConEjemplo.length === 0) {
    console.log('✅ No se encontraron productos con links de ejemplo\\n');
    
    // Verificar si hay productos sin links
    const productosSinLinks = await prisma.product.findMany({
      where: {
        AND: [
          { paymentLinkPayPal: null },
          { paymentLinkMercadoPago: null }
        ]
      },
      select: {
        id: true,
        name: true
      }
    });
    
    if (productosSinLinks.length > 0) {
      console.log('⚠️  Encontrados ' + productosSinLinks.length + ' productos sin links de pago');
      console.log('   Configurando links reales...\\n');
      
      for (const producto of productosSinLinks) {
        await prisma.product.update({
          where: { id: producto.id },
          data: {
            paymentLinkPayPal: PAYPAL_LINK || PAYPAL_EMAIL,
            paymentLinkMercadoPago: MERCADOPAGO_LINK !== 'https://mpago.la/TU_LINK_AQUI' ? MERCADOPAGO_LINK : null
          }
        });
      }
      
      console.log('✅ ' + productosSinLinks.length + ' productos configurados\\n');
    }
    
    await mostrarResumen();
    await prisma.$disconnect();
    return;
  }
  
  console.log('⚠️  Encontrados ' + productosConEjemplo.length + ' productos con links de ejemplo\\n');
  
  // Mostrar ejemplos
  console.log('📦 Ejemplos de productos a actualizar:');
  productosConEjemplo.slice(0, 5).forEach((p, i) => {
    console.log('   ' + (i + 1) + '. ' + p.name);
    if (p.paymentLinkPayPal) {
      console.log('      PayPal: ' + p.paymentLinkPayPal);
    }
    if (p.paymentLinkMercadoPago) {
      console.log('      MercadoPago: ' + p.paymentLinkMercadoPago);
    }
  });
  
  if (productosConEjemplo.length > 5) {
    console.log('   ... y ' + (productosConEjemplo.length - 5) + ' más\\n');
  } else {
    console.log('');
  }
  
  // 3. Actualizar productos
  console.log('🔧 Actualizando con links reales...\\n');
  
  let actualizados = 0;
  let errores = 0;
  
  for (const producto of productosConEjemplo) {
    try {
      const updateData: any = {};
      
      // Actualizar PayPal si tiene link de ejemplo
      if (producto.paymentLinkPayPal && 
          (producto.paymentLinkPayPal.includes('LQXDGBXDXHFXE') ||
           producto.paymentLinkPayPal.includes('YOUR_') ||
           producto.paymentLinkPayPal.includes('TU_') ||
           producto.paymentLinkPayPal.includes('example'))) {
        updateData.paymentLinkPayPal = PAYPAL_LINK || PAYPAL_EMAIL;
      }
      
      // Actualizar MercadoPago si tiene link de ejemplo
      if (producto.paymentLinkMercadoPago && 
          (producto.paymentLinkMercadoPago.includes('TU_LINK') ||
           producto.paymentLinkMercadoPago.includes('YOUR_') ||
           producto.paymentLinkMercadoPago.includes('example'))) {
        if (MERCADOPAGO_LINK && MERCADOPAGO_LINK !== 'https://mpago.la/TU_LINK_AQUI') {
          updateData.paymentLinkMercadoPago = MERCADOPAGO_LINK;
        } else {
          updateData.paymentLinkMercadoPago = null;
        }
      }
      
      if (Object.keys(updateData).length > 0) {
        await prisma.product.update({
          where: { id: producto.id },
          data: updateData
        });
        actualizados++;
        
        if (actualizados % 50 === 0) {
          console.log('   ✅ ' + actualizados + '/' + productosConEjemplo.length + ' productos actualizados...');
        }
      }
    } catch (error) {
      console.error('   ❌ Error en producto ' + producto.name + ':', error);
      errores++;
    }
  }
  
  // 4. Resumen
  console.log('\\n' + '='.repeat(80));
  console.log('📊 RESUMEN DE ACTUALIZACIÓN');
  console.log('='.repeat(80) + '\\n');
  
  console.log('✅ Productos actualizados: ' + actualizados);
  console.log('❌ Errores: ' + errores);
  console.log('📈 Total procesados: ' + productosConEjemplo.length + '\\n');
  
  if (actualizados > 0) {
    console.log('✅ Links actualizados exitosamente\\n');
  }
  
  await mostrarResumen();
  await prisma.$disconnect();
}

async function mostrarResumen() {
  console.log('🔍 Verificando configuración final...\\n');
  
  // Contar productos por método de pago
  const totalProductos = await prisma.product.count();
  
  const conPayPal = await prisma.product.count({
    where: { paymentLinkPayPal: { not: null } }
  });
  
  const conMercadoPago = await prisma.product.count({
    where: { paymentLinkMercadoPago: { not: null } }
  });
  
  const sinMetodos = await prisma.product.count({
    where: {
      AND: [
        { paymentLinkPayPal: null },
        { paymentLinkMercadoPago: null },
        { paymentLinkCustom: null }
      ]
    }
  });
  
  console.log('📊 Estado de los productos:');
  console.log('   Total de productos: ' + totalProductos);
  console.log('   Con PayPal: ' + conPayPal + ' (' + Math.round(conPayPal / totalProductos * 100) + '%)');
  console.log('   Con MercadoPago: ' + conMercadoPago + ' (' + Math.round(conMercadoPago / totalProductos * 100) + '%)');
  console.log('   Sin métodos de pago: ' + sinMetodos + '\\n');
  
  if (sinMetodos > 0) {
    console.log('⚠️  ADVERTENCIA: ' + sinMetodos + ' productos sin métodos de pago');
    console.log('   Ejecuta: npx tsx scripts/configurar-links-pago-masivo.ts\\n');
  }
  
  // Verificar MercadoPago
  const mercadopagoLink = process.env.MERCADOPAGO_LINK;
  if (!mercadopagoLink || mercadopagoLink === 'https://mpago.la/TU_LINK_AQUI') {
    console.log('⚠️  MercadoPago no configurado');
    console.log('   Para configurar:');
    console.log('   1. Ir a: https://www.mercadopago.com.co/tools/create');
    console.log('   2. Crear tu link de cobro');
    console.log('   3. Agregar a .env: MERCADOPAGO_LINK=tu_link_aqui');
    console.log('   4. Ejecutar este script de nuevo\\n');
  }
  
  // Verificar PayPal.Me
  const paypalLink = process.env.PAYPAL_LINK_TEMPLATE;
  if (paypalLink && paypalLink.includes('paypal.me')) {
    console.log('✅ PayPal.Me configurado: ' + paypalLink);
    console.log('   Verifica que funcione: ' + paypalLink + '\\n');
  } else {
    console.log('ℹ️  Usando email de PayPal: ' + process.env.PAYPAL_EMAIL);
    console.log('   Para mejorar, crea tu PayPal.Me en: https://www.paypal.me\\n');
  }
  
  console.log('📝 Próximos pasos:');
  console.log('   1. Verificar que los links funcionan');
  console.log('   2. Probar con: npx tsx scripts/test-problema-imagen.ts');
  console.log('   3. Iniciar el bot: npm run dev\\n');
}

actualizarLinksReales().catch(console.error);
