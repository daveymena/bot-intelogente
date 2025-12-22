/**
 * Test para verificar que las fotos se envían automáticamente
 */

const { PrismaClient } = require('@prisma/client');
const { procesarMensaje } = require('./src/conversational-module/ai/conversacionController');

const db = new PrismaClient();

async function testEnvioFotos() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 TEST: Envío Automático de Fotos');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Obtener usuario
    const usuario = await db.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!usuario) {
      console.log('❌ No hay usuarios en la BD');
      return;
    }

    console.log(`✅ Usuario: ${usuario.email}\n`);

    // Buscar el curso de piano
    const cursoPiano = await db.product.findFirst({
      where: {
        userId: usuario.id,
        name: { contains: 'Piano', mode: 'insensitive' }
      }
    });

    if (!cursoPiano) {
      console.log('❌ No se encontró el curso de piano');
      return;
    }

    console.log('📚 Curso encontrado:', cursoPiano.name);
    console.log('💰 Precio:', cursoPiano.price.toLocaleString('es-CO'), 'COP');
    console.log('📸 Imágenes:', cursoPiano.images);
    console.log();

    // Parsear imágenes
    let imagenes = [];
    try {
      imagenes = cursoPiano.images ? JSON.parse(cursoPiano.images) : [];
      console.log('✅ Imágenes parseadas:', imagenes);
    } catch (error) {
      console.log('❌ Error parseando imágenes:', error.message);
    }
    console.log();

    // Test: Cliente pregunta por el curso
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 Cliente pregunta por curso de piano');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Cliente: "tienes curso de piano?"\n');

    const respuesta = await procesarMensaje(
      '573001234567',
      'tienes curso de piano?',
      { botUserId: usuario.id }
    );

    console.log('🤖 Respuesta del bot:');
    console.log(respuesta.texto.substring(0, 400));
    if (respuesta.texto.length > 400) {
      console.log('   ...(respuesta truncada)');
    }
    console.log();

    // Verificar fotos
    if (respuesta.fotos && respuesta.fotos.length > 0) {
      console.log('✅ FOTOS INCLUIDAS EN LA RESPUESTA:');
      respuesta.fotos.forEach((foto, i) => {
        console.log(`  ${i + 1}. ${foto.url}`);
        if (foto.caption) {
          console.log(`     Caption: ${foto.caption.substring(0, 100)}...`);
        }
      });
    } else {
      console.log('❌ NO SE INCLUYERON FOTOS EN LA RESPUESTA');
    }

    console.log();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESULTADO:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const exito = respuesta.fotos && respuesta.fotos.length > 0;
    
    if (exito) {
      console.log('✅ TEST EXITOSO: Las fotos se envían automáticamente');
    } else {
      console.log('❌ TEST FALLIDO: Las fotos NO se están enviando');
      console.log('\nPosibles causas:');
      console.log('  - Las imágenes no están en el formato correcto');
      console.log('  - La conversión de rutas locales falló');
      console.log('  - El producto no tiene imágenes válidas');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.$disconnect();
  }
}

testEnvioFotos();
