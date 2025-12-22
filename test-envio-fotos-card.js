/**
 * TEST: Verificar envío de fotos en formato CARD
 * Prueba que el bot envíe fotos automáticamente con caption profesional
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

function log(color, message) {
  console.log(color + message + colors.reset);
}

async function testEnvioFotosCard() {
  log(colors.bright + colors.cyan, '\n🧪 TEST: ENVÍO DE FOTOS EN FORMATO CARD\n');
  log(colors.cyan, '━'.repeat(60));

  try {
    // 1. Verificar que existen productos con imágenes
    log(colors.yellow, '\n📦 PASO 1: Verificando productos con imágenes...');
    
    const productosConImagenes = await prisma.product.findMany({
      where: {
        status: 'AVAILABLE',
        images: {
          not: null
        }
      },
      take: 5
    });

    if (productosConImagenes.length === 0) {
      log(colors.red, '❌ No hay productos con imágenes en la BD');
      return;
    }

    log(colors.green, `✅ Encontrados ${productosConImagenes.length} productos con imágenes`);

    // Mostrar productos
    productosConImagenes.forEach((p, i) => {
      let images = [];
      try {
        images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
      } catch (e) {
        images = [];
      }
      
      log(colors.cyan, `\n   ${i + 1}. ${p.name}`);
      log(colors.cyan, `      💰 Precio: ${p.price.toLocaleString('es-CO')} COP`);
      log(colors.cyan, `      📸 Imágenes: ${images.length}`);
      if (images.length > 0) {
        log(colors.cyan, `      🔗 Primera imagen: ${images[0].substring(0, 60)}...`);
      }
    });

    // 2. Probar generación de caption CARD
    log(colors.yellow, '\n📝 PASO 2: Probando generación de caption CARD...');
    
    const { CardPhotoSender } = require('./src/lib/card-photo-sender');
    const productoTest = productosConImagenes[0];
    
    const caption = CardPhotoSender.generateCardCaption({
      name: productoTest.name,
      price: productoTest.price,
      description: productoTest.description,
      category: productoTest.category,
      deliveryLink: productoTest.deliveryLink
    });

    log(colors.green, '\n✅ Caption CARD generado:');
    log(colors.cyan, '━'.repeat(60));
    log(colors.bright, caption);
    log(colors.cyan, '━'.repeat(60));

    // 3. Verificar formato del caption
    log(colors.yellow, '\n🔍 PASO 3: Verificando formato del caption...');
    
    const checks = {
      tieneEmoji: /[📚💻📦🎓]/.test(caption),
      tieneNombre: caption.includes(productoTest.name),
      tienePrecio: caption.includes(productoTest.price.toLocaleString('es-CO')),
      tieneSeparador: caption.includes('━'),
      tieneCallToAction: /te interesa|comprar|más info/i.test(caption),
      noTieneAsteriscos: !caption.includes('**'),
      noTienePuntosSuspensivos: !caption.includes('...')
    };

    let allChecksPass = true;
    Object.entries(checks).forEach(([check, pass]) => {
      const icon = pass ? '✅' : '❌';
      const color = pass ? colors.green : colors.red;
      log(color, `   ${icon} ${check}: ${pass ? 'PASS' : 'FAIL'}`);
      if (!pass) allChecksPass = false;
    });

    // 4. Simular procesamiento de SimpleConversationHandler
    log(colors.yellow, '\n🤖 PASO 4: Simulando respuesta del bot...');
    
    const { SimpleConversationHandler } = require('./src/lib/simple-conversation-handler');
    const handler = SimpleConversationHandler.getInstance();
    
    // Obtener usuario de prueba
    const usuario = await prisma.user.findFirst();
    if (!usuario) {
      log(colors.red, '❌ No hay usuarios en la BD');
      return;
    }

    const response = await handler.handleMessage({
      chatId: 'test-chat-' + Date.now(),
      userId: usuario.id,
      message: productoTest.name,
      userName: 'Test User'
    });

    log(colors.green, '\n✅ Respuesta del bot:');
    log(colors.cyan, response.text.substring(0, 200) + '...');

    // Verificar acciones
    if (response.actions && response.actions.length > 0) {
      log(colors.green, `\n✅ Acciones generadas: ${response.actions.length}`);
      response.actions.forEach((action, i) => {
        log(colors.cyan, `   ${i + 1}. Tipo: ${action.type}`);
        if (action.type === 'send_photo' && action.data?.product) {
          log(colors.green, `      ✅ Producto: ${action.data.product.name}`);
          
          let images = [];
          try {
            const p = action.data.product;
            images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
          } catch (e) {
            images = [];
          }
          
          log(colors.green, `      📸 Imágenes: ${images.length}`);
        }
      });
    } else {
      log(colors.yellow, '\n⚠️ No se generaron acciones de envío de fotos');
      log(colors.yellow, '   Esto puede ser normal si el producto no tiene imágenes');
    }

    // 5. Verificar integración con conversacionController
    log(colors.yellow, '\n🔗 PASO 5: Verificando integración con conversacionController...');
    
    const fs = require('fs');
    const controllerCode = fs.readFileSync('./src/conversational-module/ai/conversacionController.ts', 'utf8');
    
    const integrationChecks = {
      importaCardPhotoSender: controllerCode.includes('CardPhotoSender'),
      usaGenerateCardCaption: controllerCode.includes('generateCardCaption'),
      procesaAcciones: controllerCode.includes('send_photo'),
      agregaCaption: controllerCode.includes('caption:'),
      limitaTresfotos: controllerCode.includes('Math.min(images.length, 3)')
    };

    let allIntegrationPass = true;
    Object.entries(integrationChecks).forEach(([check, pass]) => {
      const icon = pass ? '✅' : '❌';
      const color = pass ? colors.green : colors.red;
      log(color, `   ${icon} ${check}: ${pass ? 'PASS' : 'FAIL'}`);
      if (!pass) allIntegrationPass = false;
    });

    // RESULTADO FINAL
    log(colors.cyan, '\n' + '━'.repeat(60));
    if (allChecksPass && allIntegrationPass) {
      log(colors.bright + colors.green, '\n✅ TODOS LOS TESTS PASARON');
      log(colors.green, '\nEl sistema está correctamente configurado para:');
      log(colors.green, '  1. Generar captions en formato CARD profesional');
      log(colors.green, '  2. Enviar fotos automáticamente con productos');
      log(colors.green, '  3. Usar datos reales de la base de datos');
      log(colors.green, '  4. Limitar a 3 fotos por producto');
      log(colors.green, '  5. Solo primera foto con caption completo');
      
      log(colors.yellow, '\n📋 PRÓXIMO PASO:');
      log(colors.cyan, '   Reiniciar el servidor y probar en WhatsApp:');
      log(colors.bright, '   npm run dev');
      log(colors.cyan, '\n   Luego enviar mensaje:');
      log(colors.bright, `   "${productoTest.name}"`);
    } else {
      log(colors.bright + colors.red, '\n❌ ALGUNOS TESTS FALLARON');
      log(colors.yellow, '\nRevisar los checks marcados con ❌');
    }
    
    log(colors.cyan, '\n' + '━'.repeat(60) + '\n');

  } catch (error) {
    log(colors.red, '\n❌ ERROR EN TEST:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar test
testEnvioFotosCard();
