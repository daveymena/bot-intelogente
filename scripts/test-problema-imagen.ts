/**
 * Test específico para el problema mostrado en la imagen:
 * 1. Usuario pregunta por "MegaPack de idiomas"
 * 2. Bot da info de pago
 * 3. Usuario pregunta "mercado libre"
 * 4. Bot DEBE recordar que estaba hablando del MegaPack de idiomas
 * 5. Bot DEBE usar link dinámico de PayPal, NO email
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ConversationContext {
  selectedProduct?: {
    id: number;
    name: string;
    price: number;
  };
  lastIntent?: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}

async function testProblemaImagen() {
  console.log('🧪 TEST: Problema de contexto y PayPal de la imagen\n');
  console.log('='.repeat(80) + '\n');

  // Simular la conversación exacta de la imagen
  const conversacion = [
    {
      usuario: 'MegaPack de idiomas',
      esperado: 'Debe encontrar el MegaPack de idiomas y guardarlo en contexto'
    },
    {
      usuario: 'mercado libre',
      esperado: 'Debe recordar que hablábamos del MegaPack de idiomas y dar info de pago con LINK dinámico'
    }
  ];

  // 1. BUSCAR EL PRODUCTO
  console.log('1️⃣ Buscando "MegaPack de idiomas" en la base de datos...\n');
  
  const megapackIdiomas = await prisma.product.findFirst({
    where: {
      OR: [
        { name: { contains: 'idiomas', mode: 'insensitive' } },
        { name: { contains: 'idioma', mode: 'insensitive' } },
        { tags: { contains: 'idiomas' } },
        { description: { contains: 'idiomas', mode: 'insensitive' } }
      ],
      AND: [
        {
          OR: [
            { name: { contains: 'megapack', mode: 'insensitive' } },
            { name: { contains: 'mega pack', mode: 'insensitive' } }
          ]
        }
      ]
    }
  });

  if (!megapackIdiomas) {
    console.log('❌ ERROR: No se encontró el MegaPack de idiomas');
    console.log('💡 Solución: Verificar que existe en la base de datos\n');
    await prisma.$disconnect();
    return;
  }

  console.log('✅ Producto encontrado:');
  console.log(`   ID: ${megapackIdiomas.id}`);
  console.log(`   Nombre: ${megapackIdiomas.name}`);
  console.log(`   Precio: $${megapackIdiomas.price.toLocaleString()}`);
  console.log(`   Categoría: ${megapackIdiomas.category}`);
  
  const hasPaymentLinks = !!(
    megapackIdiomas.paymentLinkPayPal || 
    megapackIdiomas.paymentLinkMercadoPago || 
    megapackIdiomas.paymentLinkCustom
  );
  console.log(`   Links de pago: ${hasPaymentLinks ? 'Configurados ✅' : 'No configurados ❌'}\n`);

  // 2. SIMULAR CONTEXTO
  console.log('2️⃣ Simulando contexto de conversación...\n');
  
  const context: ConversationContext = {
    selectedProduct: {
      id: megapackIdiomas.id,
      name: megapackIdiomas.name,
      price: Number(megapackIdiomas.price)
    },
    lastIntent: 'product_inquiry',
    conversationHistory: [
      {
        role: 'user',
        content: 'MegaPack de idiomas',
        timestamp: new Date()
      },
      {
        role: 'assistant',
        content: `¡Excelente elección! 🌍 El ${megapackIdiomas.name} incluye...`,
        timestamp: new Date()
      }
    ]
  };

  console.log('✅ Contexto creado:');
  console.log(`   Producto seleccionado: ${context.selectedProduct.name}`);
  console.log(`   Última intención: ${context.lastIntent}\n`);

  // 3. SIMULAR PREGUNTA POR MÉTODO DE PAGO
  console.log('3️⃣ Usuario pregunta: "mercado libre"\n');
  console.log('🔍 Detectando intención...\n');

  const intencionPago = detectarIntencionPago('mercado libre');
  console.log(`   Intención detectada: ${intencionPago ? '✅ PAGO' : '❌ NO DETECTADA'}\n`);

  if (!intencionPago) {
    console.log('❌ ERROR: No se detectó intención de pago');
    console.log('💡 Solución: Mejorar detección de intenciones en intent-detector.ts\n');
  }

  // 4. VERIFICAR QUE SE MANTIENE EL CONTEXTO
  console.log('4️⃣ Verificando que se mantiene el producto en contexto...\n');
  
  if (!context.selectedProduct) {
    console.log('❌ ERROR CRÍTICO: Se perdió el producto del contexto');
    console.log('💡 Solución: Implementar persistencia en shared-memory.ts\n');
  } else {
    console.log('✅ Producto mantenido en contexto:');
    console.log(`   ${context.selectedProduct.name}\n`);
  }

  // 5. GENERAR LINK DE PAGO
  console.log('5️⃣ Generando link de pago para PayPal...\n');
  
  const paypalLink = megapackIdiomas.paymentLinkPayPal;
  
  if (!paypalLink) {
    console.log('❌ ERROR: Producto no tiene paymentLinkPayPal configurado');
    console.log('💡 Solución: Configurar el campo paymentLinkPayPal en el producto\n');
  } else {
    console.log('✅ Link de PayPal configurado:');
    console.log(`   ${paypalLink}\n`);
    
    // Verificar si es un link dinámico o un email
    if (paypalLink.includes('@')) {
      console.log('❌ ERROR: PayPal configurado con EMAIL en vez de link');
      console.log('💡 Solución: Cambiar por link dinámico:\n');
      console.log('   https://www.paypal.com/ncp/payment/YOUR_BUSINESS_ID\n');
    } else if (paypalLink.includes('paypal.com')) {
      console.log('✅ Link dinámico correcto\n');
    } else {
      console.log('⚠️  ADVERTENCIA: Link no parece ser de PayPal\n');
    }
  }
  
  // Verificar variable de entorno
  const linkTemplate = process.env.PAYPAL_LINK_TEMPLATE || '';
  if (!linkTemplate) {
    console.log('⚠️  ADVERTENCIA: PAYPAL_LINK_TEMPLATE no configurado en .env');
    console.log('💡 Recomendación: Agregar para generación automática:\n');
    console.log('   PAYPAL_LINK_TEMPLATE=https://www.paypal.com/ncp/payment/YOUR_ID\n');
  }

  // 6. VERIFICAR RESPUESTA CORRECTA
  console.log('6️⃣ Generando respuesta del bot...\n');
  
  const respuestaCorrecta = generarRespuestaPago(
    context.selectedProduct,
    'PAYPAL'
  );

  console.log('✅ Respuesta esperada:');
  console.log('─'.repeat(80));
  console.log(respuestaCorrecta);
  console.log('─'.repeat(80) + '\n');

  // 7. VERIFICAR QUE NO MUESTRA PRODUCTOS IRRELEVANTES
  console.log('7️⃣ Verificando que NO se muestran productos irrelevantes...\n');
  
  const productosIrrelevantes = await prisma.product.findMany({
    where: {
      AND: [
        { id: { not: megapackIdiomas.id } },
        {
          OR: [
            { name: { contains: 'piano', mode: 'insensitive' } },
            { name: { contains: 'auriculares', mode: 'insensitive' } }
          ]
        }
      ]
    }
  });

  if (productosIrrelevantes.length > 0) {
    console.log('⚠️  ADVERTENCIA: Estos productos NO deben aparecer:');
    productosIrrelevantes.forEach(p => {
      console.log(`   ❌ ${p.name}`);
    });
    console.log('\n💡 Solución: Mejorar filtrado en search-agent.ts\n');
  } else {
    console.log('✅ No hay productos irrelevantes en la búsqueda\n');
  }

  // RESUMEN FINAL
  console.log('='.repeat(80));
  console.log('📊 RESUMEN DEL TEST');
  console.log('='.repeat(80) + '\n');

  const problemas = [];
  
  if (!megapackIdiomas) problemas.push('Producto no encontrado');
  if (!intencionPago) problemas.push('Intención de pago no detectada');
  if (!context.selectedProduct) problemas.push('Contexto perdido');
  if (!megapackIdiomas?.paymentLinkPayPal) problemas.push('PayPal no configurado');
  if (megapackIdiomas?.paymentLinkPayPal?.includes('@')) problemas.push('PayPal usa email en vez de link');
  if (productosIrrelevantes.length > 0) problemas.push('Productos irrelevantes encontrados');

  if (problemas.length === 0) {
    console.log('✅ TODOS LOS TESTS PASARON');
    console.log('🎉 El bot debería funcionar correctamente\n');
  } else {
    console.log('❌ PROBLEMAS ENCONTRADOS:\n');
    problemas.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p}`);
    });
    console.log('\n📝 Ejecutar correcciones:\n');
    console.log('   npx tsx scripts/corregir-problemas-criticos.ts\n');
  }

  await prisma.$disconnect();
}

function detectarIntencionPago(mensaje: string): boolean {
  const palabrasPago = [
    'pago', 'pagar', 'comprar', 'compra', 'precio',
    'mercadopago', 'mercado pago', 'mercado libre',
    'paypal', 'nequi', 'daviplata', 'tarjeta',
    'transferencia', 'efectivo', 'cómo pago', 'como pago'
  ];

  const mensajeLower = mensaje.toLowerCase();
  return palabrasPago.some(palabra => mensajeLower.includes(palabra));
}

function generarRespuestaPago(producto: any, metodo: string): string {
  return `¡Perfecto! Para el ${producto.name} puedes pagar con ${metodo} 💳

💰 Precio: $${producto.price.toLocaleString()} COP

🔗 Link de pago:
[LINK DINÁMICO AQUÍ]

Una vez realices el pago, envíame el comprobante y te envío el producto de inmediato 📦✨

¿Tienes alguna pregunta? 😊`;
}

testProblemaImagen().catch(console.error);
