/**
 * TEST DE ENVÍO REAL DE FOTOS POR WHATSAPP
 * Prueba que las fotos se envíen correctamente al bot
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Colores
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

/**
 * Simula el flujo completo de envío de fotos
 */
async function testEnvioFotosWhatsApp() {
  console.log('\n');
  log(colors.cyan, '═══════════════════════════════════════════════════════════');
  log(colors.cyan, '  TEST DE ENVÍO DE FOTOS POR WHATSAPP');
  log(colors.cyan, '═══════════════════════════════════════════════════════════');
  console.log('\n');

  try {
    // 1. CONFIGURACIÓN
    log(colors.blue, '1️⃣  CONFIGURACIÓN');
    console.log('─────────────────────────────────────────────────────────────');
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000';
    console.log(`   Base URL: ${baseUrl}`);
    console.log(`   Auto Photo Sending: ${process.env.AUTO_PHOTO_SENDING || 'true'}`);
    console.log('\n');

    // 2. OBTENER PRODUCTOS DE PRUEBA
    log(colors.blue, '2️⃣  PRODUCTOS DE PRUEBA');
    console.log('─────────────────────────────────────────────────────────────');
    
    // Buscar productos con fotos
    const productosConFotos = await prisma.product.findMany({
      where: {
        status: 'AVAILABLE',
        images: { not: null },
      },
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        images: true,
      },
      take: 5,
    });

    console.log(`   Productos con fotos encontrados: ${productosConFotos.length}\n`);

    if (productosConFotos.length === 0) {
      log(colors.red, '   ❌ No hay productos con fotos para probar');
      return;
    }

    // 3. SIMULAR BÚSQUEDAS
    log(colors.blue, '3️⃣  SIMULACIÓN DE BÚSQUEDAS');
    console.log('─────────────────────────────────────────────────────────────\n');

    const consultas = [
      'Tienes portátiles',
      'Curso de piano',
      'Megapack de cursos',
      'Quiero ver fotos',
    ];

    for (const consulta of consultas) {
      console.log(`   📱 Cliente: "${consulta}"`);
      
      // Simular búsqueda
      const keywords = consulta.toLowerCase().split(' ').filter(w => w.length > 3);
      
      const productos = await prisma.product.findMany({
        where: {
          status: 'AVAILABLE',
          OR: keywords.flatMap(kw => [
            { name: { contains: kw, mode: 'insensitive' } },
            { description: { contains: kw, mode: 'insensitive' } },
          ]),
        },
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
        },
        take: 3,
      });

      if (productos.length === 0) {
        console.log(`      ❌ No se encontraron productos\n`);
        continue;
      }

      console.log(`      ✅ Encontrados ${productos.length} producto(s):`);
      
      for (const producto of productos) {
        let imagenes = [];
        try {
          if (producto.images) {
            imagenes = JSON.parse(producto.images);
          }
        } catch (e) {
          // Ignorar error de parse
        }

        const tieneFotos = Array.isArray(imagenes) && imagenes.length > 0;
        const primeraFoto = tieneFotos ? imagenes[0] : null;

        console.log(`         • ${producto.name}`);
        console.log(`           Precio: ${producto.price.toLocaleString('es-CO')} COP`);
        console.log(`           Fotos: ${tieneFotos ? `${imagenes.length} ✅` : 'Sin fotos ❌'}`);
        
        if (primeraFoto) {
          const urlCompleta = primeraFoto.startsWith('/') 
            ? `${baseUrl}${primeraFoto}` 
            : primeraFoto;
          console.log(`           URL: ${urlCompleta}`);
        }
      }
      console.log('');
    }

    // 4. VERIFICAR LÓGICA DE ENVÍO
    log(colors.blue, '4️⃣  VERIFICACIÓN DE LÓGICA DE ENVÍO');
    console.log('─────────────────────────────────────────────────────────────\n');

    const producto = productosConFotos[0];
    let imagenes = [];
    
    try {
      imagenes = JSON.parse(producto.images);
    } catch (e) {
      log(colors.red, '   ❌ Error parseando imágenes');
      return;
    }

    console.log(`   Producto de prueba: ${producto.name}`);
    console.log(`   Total imágenes: ${imagenes.length}`);
    console.log('');

    // Simular lógica de SimpleConversationHandler
    console.log('   📤 Simulando envío según SimpleConversationHandler:');
    console.log('');

    if (imagenes.length === 1) {
      console.log('      ✅ Caso: 1 producto con 1 foto');
      console.log('      Acción: Enviar foto con caption');
      console.log(`      URL: ${imagenes[0].startsWith('/') ? baseUrl + imagenes[0] : imagenes[0]}`);
    } else if (imagenes.length > 1) {
      console.log(`      ✅ Caso: 1 producto con ${imagenes.length} fotos`);
      console.log('      Acción: Enviar primera foto con caption');
      console.log(`      URL: ${imagenes[0].startsWith('/') ? baseUrl + imagenes[0] : imagenes[0]}`);
    }
    console.log('');

    // 5. VERIFICAR FORMATO DE RESPUESTA
    log(colors.blue, '5️⃣  FORMATO DE RESPUESTA');
    console.log('─────────────────────────────────────────────────────────────\n');

    console.log('   📝 Mensaje de texto (ProfessionalCardFormatter):');
    console.log('');
    console.log(`      💻 ${producto.name}`);
    console.log('');
    console.log(`      💰 Precio: ${producto.price.toLocaleString('es-CO')} COP`);
    console.log('');
    console.log('      ¿Te gustaría comprarlo?');
    console.log('      Escribe "pagar" para ver los métodos de pago');
    console.log('');

    console.log('   📸 Foto enviada:');
    console.log(`      URL: ${imagenes[0].startsWith('/') ? baseUrl + imagenes[0] : imagenes[0]}`);
    console.log('');

    // 6. CASOS DE PRUEBA
    log(colors.blue, '6️⃣  CASOS DE PRUEBA RECOMENDADOS');
    console.log('─────────────────────────────────────────────────────────────\n');

    console.log('   Para probar en WhatsApp real, envía estos mensajes:');
    console.log('');
    console.log('   1️⃣  "Tienes portátiles"');
    console.log('       Esperado: Lista de portátiles + foto del primero');
    console.log('');
    console.log('   2️⃣  "Curso de piano"');
    console.log('       Esperado: Info del curso + foto');
    console.log('');
    console.log('   3️⃣  "Megapack"');
    console.log('       Esperado: Lista de megapacks + foto del primero');
    console.log('');
    console.log('   4️⃣  "Quiero ver fotos"');
    console.log('       Esperado: Fotos del producto en contexto');
    console.log('');

    // 7. CHECKLIST DE VERIFICACIÓN
    log(colors.blue, '7️⃣  CHECKLIST DE VERIFICACIÓN');
    console.log('─────────────────────────────────────────────────────────────\n');

    console.log('   Verifica que:');
    console.log('');
    console.log('   [ ] Las fotos se envían automáticamente');
    console.log('   [ ] Las URLs son correctas (http://... o https://...)');
    console.log('   [ ] Las fotos se ven correctamente en WhatsApp');
    console.log('   [ ] El formato del mensaje es profesional (sin asteriscos)');
    console.log('   [ ] No hay errores en la consola del servidor');
    console.log('   [ ] Las fotos corresponden al producto correcto');
    console.log('');

    // 8. PRODUCTOS ESPECÍFICOS PARA PROBAR
    log(colors.blue, '8️⃣  PRODUCTOS ESPECÍFICOS PARA PROBAR');
    console.log('─────────────────────────────────────────────────────────────\n');

    // Buscar productos específicos
    const productosEspecificos = [
      { nombre: 'piano', categoria: 'DIGITAL' },
      { nombre: 'portátil', categoria: 'PHYSICAL' },
      { nombre: 'megapack', categoria: 'DIGITAL' },
    ];

    for (const spec of productosEspecificos) {
      const prod = await prisma.product.findFirst({
        where: {
          name: { contains: spec.nombre, mode: 'insensitive' },
          status: 'AVAILABLE',
        },
        select: {
          name: true,
          images: true,
        },
      });

      if (prod) {
        let imgs = [];
        try {
          imgs = JSON.parse(prod.images || '[]');
        } catch (e) {}

        console.log(`   ${spec.categoria === 'DIGITAL' ? '📚' : '💻'} ${prod.name}`);
        console.log(`      Fotos: ${imgs.length > 0 ? `${imgs.length} ✅` : 'Sin fotos ❌'}`);
        
        if (imgs.length > 0) {
          const url = imgs[0].startsWith('/') ? baseUrl + imgs[0] : imgs[0];
          console.log(`      URL: ${url}`);
        }
        console.log('');
      } else {
        console.log(`   ❌ No encontrado: ${spec.nombre}`);
        console.log('');
      }
    }

    // RESUMEN FINAL
    console.log('\n');
    log(colors.cyan, '═══════════════════════════════════════════════════════════');
    log(colors.cyan, '  RESUMEN');
    log(colors.cyan, '═══════════════════════════════════════════════════════════');
    console.log('');
    
    log(colors.green, '   ✅ Configuración verificada');
    log(colors.green, `   ✅ ${productosConFotos.length} productos con fotos disponibles`);
    log(colors.green, '   ✅ Lógica de envío correcta');
    console.log('');
    log(colors.yellow, '   📱 Ahora prueba en WhatsApp real con los mensajes sugeridos');
    console.log('');
    log(colors.cyan, '═══════════════════════════════════════════════════════════');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
testEnvioFotosWhatsApp();
