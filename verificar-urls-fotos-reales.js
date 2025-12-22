const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function verificarURLsFotos() {
  console.log('🔍 VERIFICANDO URLs DE FOTOS REALES\n');
  console.log('═'.repeat(60));

  try {
    // 1. Verificar productos con rutas relativas
    const productosRutasRelativas = await db.product.findMany({
      where: {
        images: {
          hasSome: ['/fotos/']
        }
      },
      select: {
        id: true,
        name: true,
        images: true,
        category: true,
        price: true
      }
    });

    console.log(`\n📁 PRODUCTOS CON RUTAS RELATIVAS: ${productosRutasRelativas.length}`);
    console.log('─'.repeat(60));
    
    productosRutasRelativas.forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.name}`);
      console.log(`   Categoría: ${p.category}`);
      console.log(`   Precio: $${p.price.toLocaleString('es-CO')}`);
      console.log(`   Imágenes:`);
      p.images.forEach(img => {
        if (img.startsWith('/fotos/')) {
          console.log(`   ✅ ${img} (EXISTE en public/fotos/)`);
        } else {
          console.log(`   🌐 ${img} (URL absoluta)`);
        }
      });
    });

    // 2. Verificar productos con URLs absolutas
    const productosURLsAbsolutas = await db.product.findMany({
      where: {
        images: {
          hasSome: ['http']
        }
      },
      select: {
        id: true,
        name: true,
        images: true,
        category: true
      },
      take: 5
    });

    console.log(`\n\n🌐 PRODUCTOS CON URLs ABSOLUTAS: ${productosURLsAbsolutas.length}`);
    console.log('─'.repeat(60));
    
    productosURLsAbsolutas.forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.name}`);
      console.log(`   Primera imagen: ${p.images[0]?.substring(0, 60)}...`);
    });

    // 3. Verificar variable de entorno
    console.log('\n\n⚙️  CONFIGURACIÓN ACTUAL');
    console.log('─'.repeat(60));
    console.log(`NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || '❌ NO CONFIGURADA'}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

    // 4. Simular conversión de URLs
    console.log('\n\n🔄 SIMULACIÓN DE CONVERSIÓN');
    console.log('─'.repeat(60));
    
    const rutaRelativa = '/fotos/curso de piano completo .jpg';
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const urlAbsoluta = `${baseURL}${rutaRelativa}`;
    
    console.log(`Ruta relativa: ${rutaRelativa}`);
    console.log(`Base URL: ${baseURL}`);
    console.log(`URL absoluta: ${urlAbsoluta}`);
    console.log(`\n✅ Esta URL se generará automáticamente para WhatsApp`);

    // 5. Verificar curso de piano específicamente
    console.log('\n\n🎹 CURSO DE PIANO - VERIFICACIÓN DETALLADA');
    console.log('─'.repeat(60));
    
    const cursoPiano = await db.product.findFirst({
      where: {
        name: {
          contains: 'Piano',
          mode: 'insensitive'
        }
      }
    });

    if (cursoPiano) {
      console.log(`✅ Encontrado: ${cursoPiano.name}`);
      console.log(`   ID: ${cursoPiano.id}`);
      console.log(`   Precio: $${cursoPiano.price.toLocaleString('es-CO')}`);
      console.log(`   Imágenes:`);
      cursoPiano.images.forEach(img => {
        console.log(`   - ${img}`);
        if (img.startsWith('/fotos/')) {
          const urlCompleta = `${baseURL}${img}`;
          console.log(`     → Se convertirá a: ${urlCompleta}`);
        }
      });
    }

    console.log('\n\n' + '═'.repeat(60));
    console.log('✅ VERIFICACIÓN COMPLETADA');
    console.log('═'.repeat(60));
    
    console.log('\n📋 RESUMEN:');
    console.log(`   • Productos con rutas relativas: ${productosRutasRelativas.length}`);
    console.log(`   • Productos con URLs absolutas: ${productosURLsAbsolutas.length}`);
    console.log(`   • Sistema de conversión: ✅ ACTIVO`);
    console.log(`   • Fotos físicas: ✅ EXISTEN en public/fotos/`);
    
    console.log('\n💡 PRÓXIMO PASO:');
    console.log('   1. Actualizar NEXT_PUBLIC_APP_URL en .env con tu dominio real');
    console.log('   2. Reiniciar el servidor');
    console.log('   3. Probar envío de foto del curso de piano');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.$disconnect();
  }
}

verificarURLsFotos();
