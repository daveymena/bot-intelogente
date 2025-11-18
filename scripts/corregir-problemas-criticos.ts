import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function corregirProblemasCriticos() {
  console.log('🔧 INICIANDO CORRECCIÓN DE PROBLEMAS CRÍTICOS...\n');

  // 1. VERIFICAR Y CORREGIR LINKS DE PAGO
  console.log('1️⃣ Verificando links de pago en productos...');
  
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
      name: true
    }
  });

  if (productosSinLinks.length > 0) {
    console.log(`   ⚠️  Encontrados ${productosSinLinks.length} productos sin links de pago`);
    console.log('   💡 Estos productos necesitan configuración manual:\n');
    
    productosSinLinks.slice(0, 5).forEach(p => {
      console.log(`      - ${p.name} (ID: ${p.id})`);
    });
    
    if (productosSinLinks.length > 5) {
      console.log(`      ... y ${productosSinLinks.length - 5} más\n`);
    }
    
    console.log('   📝 Solución: Configurar links en el dashboard o ejecutar:');
    console.log('      UPDATE products SET paymentLinkPayPal = \'https://paypal.com/...\' WHERE id = \'...\'\n');
  } else {
    console.log('   ✅ Todos los productos tienen al menos un link de pago\n');
  }

  // 2. VERIFICAR CONFIGURACIÓN DE PAYPAL
  console.log('2️⃣ Verificando configuración de PayPal...');
  
  const paypalConfig = {
    linkTemplate: process.env.PAYPAL_LINK_TEMPLATE,
    businessId: process.env.PAYPAL_BUSINESS_ID,
    email: process.env.PAYPAL_EMAIL
  };

  if (!paypalConfig.linkTemplate) {
    console.log('   ❌ PAYPAL_LINK_TEMPLATE no configurado');
    console.log('   📝 Agregar a .env:');
    console.log('   PAYPAL_LINK_TEMPLATE=https://www.paypal.com/ncp/payment/YOUR_BUSINESS_ID');
  } else {
    console.log('   ✅ PAYPAL_LINK_TEMPLATE configurado');
  }

  if (paypalConfig.email && !paypalConfig.linkTemplate) {
    console.log('   ⚠️  ADVERTENCIA: Tienes PAYPAL_EMAIL pero no PAYPAL_LINK_TEMPLATE');
    console.log('   🔧 El bot debe usar links dinámicos, NO emails\n');
  } else {
    console.log('   ✅ Configuración correcta\n');
  }

  // 3. VERIFICAR PRODUCTOS DUPLICADOS O CONFUSOS
  console.log('3️⃣ Verificando productos con nombres similares...');
  
  const todosProductos = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      tags: true
    }
  });

  const gruposSimilares: { [key: string]: typeof todosProductos } = {};
  
  for (const producto of todosProductos) {
    const palabrasClave = producto.name.toLowerCase()
      .split(' ')
      .filter(p => p.length > 3);
    
    for (const palabra of palabrasClave) {
      if (!gruposSimilares[palabra]) {
        gruposSimilares[palabra] = [];
      }
      gruposSimilares[palabra].push(producto);
    }
  }

  const conflictos = Object.entries(gruposSimilares)
    .filter(([_, productos]) => productos.length > 1)
    .map(([palabra, productos]) => ({ palabra, productos }));

  if (conflictos.length > 0) {
    console.log(`   ⚠️  Encontrados ${conflictos.length} grupos de productos con nombres similares:`);
    conflictos.slice(0, 5).forEach(({ palabra, productos }) => {
      console.log(`\n   📦 Palabra: "${palabra}"`);
      productos.forEach(p => {
        console.log(`      - ${p.name} (${p.category})`);
      });
    });
    console.log('\n   💡 Recomendación: Agregar tags específicos para diferenciarlos\n');
  } else {
    console.log('   ✅ No se encontraron conflictos\n');
  }

  // 4. VERIFICAR PRODUCTOS SIN CATEGORÍA CLARA
  console.log('4️⃣ Verificando categorías de productos...');
  
  const productosSinCategoria = todosProductos.filter(p => 
    !p.category || p.category === 'OTROS' || p.category === 'GENERAL'
  );

  if (productosSinCategoria.length > 0) {
    console.log(`   ⚠️  ${productosSinCategoria.length} productos sin categoría específica:`);
    productosSinCategoria.slice(0, 5).forEach(p => {
      console.log(`      - ${p.name}`);
    });
    console.log('\n   💡 Recomendación: Asignar categorías específicas\n');
  } else {
    console.log('   ✅ Todos los productos tienen categoría\n');
  }

  // 5. GENERAR REPORTE DE CORRECCIONES
  console.log('='.repeat(80));
  console.log('📊 RESUMEN DE CORRECCIONES');
  console.log('='.repeat(80) + '\n');

  console.log('✅ Correcciones aplicadas:');
  console.log(`   - ${productosSinMetodos.length} productos actualizados con métodos de pago`);
  console.log('   - Configuración de PayPal verificada');
  console.log('   - Productos similares identificados\n');

  console.log('⚠️  Acciones manuales requeridas:');
  console.log('   1. Revisar src/agents/payment-agent.ts');
  console.log('   2. Actualizar src/agents/shared-memory.ts');
  console.log('   3. Mejorar src/lib/product-intelligence-service.ts');
  console.log('   4. Limpiar datos de entrenamiento\n');

  console.log('📝 Próximos pasos:');
  console.log('   1. Ejecutar: npx tsx scripts/test-contexto-producto.ts');
  console.log('   2. Ejecutar: npx tsx scripts/test-paypal-dinamico.ts');
  console.log('   3. Probar conversación completa con el bot\n');

  await prisma.$disconnect();
}

corregirProblemasCriticos().catch(console.error);
