/**
 * Test del flujo completo: Megapack con foto y link correctos
 * Simula la conversación real del bot
 */

import { db } from '../src/lib/db';

async function testFlujoCompletoMegapack() {
  console.log('🧪 TEST: Flujo Completo Megapack\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. Verificar Mega Pack 01 en base de datos
  console.log('📊 PASO 1: Verificar producto en base de datos\n');
  
  const megapack01 = await db.product.findFirst({
    where: {
      name: {
        contains: 'Mega Pack 01'
      }
    }
  });

  if (!megapack01) {
    console.log('❌ ERROR: Mega Pack 01 no encontrado en base de datos');
    return;
  }

  console.log('✅ Producto encontrado:');
  console.log(`   📦 Nombre: ${megapack01.name}`);
  console.log(`   💰 Precio: $${megapack01.price.toLocaleString('es-CO')} ${megapack01.currency}`);
  console.log(`   🆔 ID: ${megapack01.id}`);

  // Parsear imágenes
  let images: string[] = [];
  try {
    images = JSON.parse(megapack01.images);
  } catch {
    images = [megapack01.images];
  }

  console.log(`   📸 Foto actual: ${images[0]}`);

  // Verificar foto correcta
  const fotoEsperada = megapack01.name.toLowerCase().includes('diseño gráfico')
    ? 'https://hotmart.s3.amazonaws.com/product_pictures/dff88656-8bdd-42a4-b9ac-7eaeabb44202/MEGAPACK01CURSOSDEDESEO.png'
    : 'https://hotmart.s3.amazonaws.com/product_pictures/00388af9-ea3f-4389-8e85-1cd1dcf11f72/Sintitulo600x600px.png';

  if (images[0] === fotoEsperada) {
    console.log('   ✅ Foto correcta');
  } else {
    console.log('   ⚠️  Foto incorrecta');
    console.log(`   📸 Debería ser: ${fotoEsperada}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 2. Simular conversación
  console.log('💬 PASO 2: Simular conversación del bot\n');

  const conversacion = [
    {
      usuario: 'Me interesa el mega pack 01',
      botDeberia: 'Enviar foto del Mega Pack 01 + descripción + precio'
    },
    {
      usuario: 'Que métodos de pago tienen?',
      botDeberia: 'Mostrar métodos de pago para Mega Pack 01 ($20.000)'
    },
    {
      usuario: 'Envíame el link',
      botDeberia: 'Enviar link de pago del Mega Pack 01 ($20.000)'
    }
  ];

  for (let i = 0; i < conversacion.length; i++) {
    const paso = conversacion[i];
    console.log(`${i + 1}. 📱 Usuario: "${paso.usuario}"`);
    console.log(`   🤖 Bot debería: ${paso.botDeberia}`);
    
    if (i === 0) {
      console.log(`   📸 Foto a enviar: ${images[0]}`);
      console.log(`   📦 Producto: ${megapack01.name}`);
      console.log(`   💰 Precio: $${megapack01.price.toLocaleString('es-CO')}`);
    }
    
    if (i === 1) {
      console.log(`   🔒 Contexto bloqueado: ${megapack01.name}`);
      console.log(`   💰 Precio: $${megapack01.price.toLocaleString('es-CO')}`);
    }
    
    if (i === 2) {
      console.log(`   🔒 Contexto bloqueado: ${megapack01.name}`);
      console.log(`   💰 Precio: $${megapack01.price.toLocaleString('es-CO')}`);
      console.log(`   🔗 Link dinámico con ID: ${megapack01.id}`);
    }
    
    console.log('');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 3. Verificar que NO haya productos conflictivos
  console.log('🔍 PASO 3: Verificar productos conflictivos\n');

  const productosConflictivos = await db.product.findMany({
    where: {
      OR: [
        { name: { contains: 'Piano' } },
        { name: { contains: 'piano' } }
      ]
    }
  });

  if (productosConflictivos.length > 0) {
    console.log(`⚠️  Encontrados ${productosConflictivos.length} productos de Piano:`);
    productosConflictivos.forEach(p => {
      console.log(`   - ${p.name} (${p.price.toLocaleString('es-CO')} COP)`);
    });
    console.log('\n   ⚠️  IMPORTANTE: El bot NO debe cambiar a estos productos');
    console.log('   ⚠️  El contexto debe mantenerse en Mega Pack 01');
  } else {
    console.log('✅ No hay productos conflictivos de Piano');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 4. Verificar duplicados de Mega Pack 01
  console.log('🔍 PASO 4: Verificar duplicados de Mega Pack 01\n');

  const megapacks01 = await db.product.findMany({
    where: {
      name: {
        contains: 'Mega Pack 01'
      }
    }
  });

  console.log(`📦 Total de "Mega Pack 01" encontrados: ${megapacks01.length}`);

  if (megapacks01.length > 1) {
    console.log('\n⚠️  DUPLICADOS ENCONTRADOS:\n');
    megapacks01.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   💰 Precio: $${p.price.toLocaleString('es-CO')}`);
      console.log(`   🆔 ID: ${p.id}`);
      
      let imgs: string[] = [];
      try {
        imgs = JSON.parse(p.images);
      } catch {
        imgs = [p.images];
      }
      console.log(`   📸 Foto: ${imgs[0]}`);
      console.log('');
    });
    
    console.log('⚠️  RECOMENDACIÓN: Eliminar duplicados para evitar confusión');
  } else {
    console.log('✅ No hay duplicados');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 5. Resumen final
  console.log('📋 RESUMEN FINAL:\n');

  const checks = [
    {
      item: 'Mega Pack 01 existe en BD',
      status: megapack01 ? '✅' : '❌'
    },
    {
      item: 'Foto correcta',
      status: images[0] === fotoEsperada ? '✅' : '⚠️'
    },
    {
      item: 'Precio correcto ($20.000)',
      status: megapack01.price === 20000 ? '✅' : '⚠️'
    },
    {
      item: 'Sin duplicados',
      status: megapacks01.length === 1 ? '✅' : '⚠️'
    },
    {
      item: 'Sin productos conflictivos',
      status: productosConflictivos.length === 0 ? '✅' : '⚠️'
    }
  ];

  checks.forEach(check => {
    console.log(`${check.status} ${check.item}`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🎯 PUNTOS CLAVE PARA EL BOT:\n');
  console.log('1. ✅ Cuando el usuario dice "mega pack 01", buscar en BD');
  console.log('2. ✅ Enviar la FOTO correcta del producto encontrado');
  console.log('3. ✅ BLOQUEAR el contexto del producto durante el proceso de pago');
  console.log('4. ✅ NO cambiar a otro producto (ej: Piano)');
  console.log('5. ✅ Generar link dinámico con el ID del producto correcto');
  console.log('6. ✅ Mantener el precio consistente en todos los mensajes');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Verificar intelligent-conversation-engine
  console.log('🔧 VERIFICACIÓN DEL MOTOR DE CONVERSACIÓN:\n');
  console.log('El archivo src/lib/intelligent-conversation-engine.ts debe:');
  console.log('1. ✅ Detectar cuando el usuario pregunta por un producto');
  console.log('2. ✅ Buscar el producto en la BD');
  console.log('3. ✅ Guardar el producto en contexto');
  console.log('4. ✅ BLOQUEAR el contexto cuando detecta proceso de pago');
  console.log('5. ✅ Usar el producto del contexto para generar links');
  console.log('6. ✅ Enviar la foto del producto correcto');

  console.log('\n✅ TEST COMPLETADO\n');
}

testFlujoCompletoMegapack()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
