/**
 * Script para actualizar los links de entrega de productos digitales
 * Curso de Piano y Megapack de 40 Cursos
 */

import { db } from '../src/lib/db';

async function main() {
  console.log('🔧 Actualizando links de entrega...\n');

  try {
    // 1. Actualizar Curso de Piano
    console.log('🎹 Actualizando Curso de Piano...');
    
    // Información de entrega para Curso de Piano
    const pianoLink = 'https://drive.google.com/drive/folders/1fhzQ30sJZRUHJ-qCoIwDPxOZfjL2eZ4m?usp=sharing';
    const pianoInstructions = `
📧 ENTREGA INMEDIATA:

🔗 Link de acceso:
${pianoLink}

📝 Instrucciones:
1. Abre el link con tu cuenta de Gmail
2. Tendrás acceso a todas las lecciones
3. Puedes ver online o descargar
4. Acceso de por vida ✅

¿Necesitas ayuda? Responde este mensaje.
    `.trim();

    const pianoUpdated = await db.product.updateMany({
      where: {
        OR: [
          { name: { contains: 'Piano', mode: 'insensitive' } },
          { name: { contains: 'piano', mode: 'insensitive' } }
        ],
        category: 'DIGITAL'
      },
      data: {
        autoResponse: pianoInstructions
      }
    });

    console.log(`✅ ${pianoUpdated.count} producto(s) de Piano actualizados\n`);

    // 2. Actualizar Megapack de 40 Cursos
    console.log('🎓 Actualizando Megapack de 40 Cursos...');
    
    // Información de entrega para Megapack
    const megapackLink = 'https://1024terabox.com/s/1V1uSSVPIt5-FXkGEWtk_Lw';
    const megapackCode = 'ifq5';
    const megapackInstructions = `
📧 ENTREGA INMEDIATA:

🔗 Link de acceso:
${megapackLink}

🔑 Código de extracción: ${megapackCode}

📝 Instrucciones:
1. Abre el link
2. Ingresa el código: ${megapackCode}
3. Descarga los 40 cursos
4. Acceso de por vida ✅

¿Necesitas ayuda? Responde este mensaje.
    `.trim();

    const megapackUpdated = await db.product.updateMany({
      where: {
        OR: [
          { name: { contains: 'Mega Pack', mode: 'insensitive' } },
          { name: { contains: 'MegaPack', mode: 'insensitive' } },
          { name: { contains: '40', mode: 'insensitive' } }
        ],
        category: 'DIGITAL'
      },
      data: {
        autoResponse: megapackInstructions
      }
    });

    console.log(`✅ ${megapackUpdated.count} producto(s) de Megapack actualizados\n`);

    // 3. Verificar productos actualizados
    console.log('📋 Verificando productos actualizados...\n');

    const pianoProducts = await db.product.findMany({
      where: {
        name: { contains: 'Piano', mode: 'insensitive' },
        category: 'DIGITAL'
      },
      select: {
        id: true,
        name: true,
        price: true,
        autoResponse: true
      }
    });

    const megapackProducts = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: 'Mega Pack', mode: 'insensitive' } },
          { name: { contains: '40', mode: 'insensitive' } }
        ],
        category: 'DIGITAL'
      },
      select: {
        id: true,
        name: true,
        price: true,
        autoResponse: true
      }
    });

    console.log('🎹 PRODUCTOS DE PIANO:');
    pianoProducts.forEach(p => {
      console.log(`   - ${p.name}`);
      console.log(`     Precio: $${p.price.toLocaleString('es-CO')}`);
      if (p.autoResponse) {
        console.log(`     ✅ Instrucciones de entrega configuradas`);
      }
      console.log('');
    });

    console.log('🎓 PRODUCTOS DE MEGAPACK:');
    megapackProducts.forEach(p => {
      console.log(`   - ${p.name}`);
      console.log(`     Precio: $${p.price.toLocaleString('es-CO')}`);
      if (p.autoResponse) {
        console.log(`     ✅ Instrucciones de entrega configuradas`);
      }
      console.log('');
    });

    console.log('✅ ========================================');
    console.log('✅ ACTUALIZACIÓN COMPLETADA');
    console.log('✅ ========================================\n');

    console.log('📧 Los productos ahora tienen configurados:');
    console.log('   ✅ Links de entrega en autoResponse');
    console.log('   ✅ Instrucciones de acceso');
    console.log('   ✅ Códigos de extracción (si aplica)');
    console.log('   ✅ El bot enviará estas instrucciones después del pago\n');

    console.log('🚀 Próximos pasos:');
    console.log('   1. Iniciar el bot: npm run dev');
    console.log('   2. Probar flujo completo de venta');
    console.log('   3. Verificar envío de emails con links\n');

  } catch (error) {
    console.error('❌ Error actualizando productos:', error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
