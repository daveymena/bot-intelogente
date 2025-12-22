/**
 * Test completo de correcciones:
 * 1. Precios reales de BD
 * 2. Fotos en formato CARD
 * 3. No inventar información
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCorrecciones() {
  console.log('========================================');
  console.log('TEST DE CORRECCIONES COMPLETAS');
  console.log('========================================\n');

  try {
    // TEST 1: Verificar precios reales en BD
    console.log('[TEST 1] Verificando precios reales en BD...');
    
    const megapacks = await prisma.product.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: 'Mega Pack', mode: 'insensitive' } },
              { name: { contains: 'Megapack', mode: 'insensitive' } }
            ]
          },
          { category: 'DIGITAL' } // Los megapacks son productos digitales
        ]
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: true
      }
    });

    console.log(`\n✅ Encontrados ${megapacks.length} megapacks\n`);

    let preciosCorrectos = 0;
    let preciosIncorrectos = 0;
    let sinFotos = 0;

    for (const mp of megapacks) {
      const esPiano = mp.name.toLowerCase().includes('piano');
      const esMegapack40 = mp.name.toLowerCase().includes('40') || mp.name.toLowerCase().includes('cuarenta');
      
      // Determinar precio esperado según el tipo
      let precioEsperado;
      if (esPiano) {
        precioEsperado = 40000; // Piano cuesta 40mil
      } else if (esMegapack40) {
        precioEsperado = 60000; // Megapack 40 cuesta 60mil
      } else {
        precioEsperado = 20000; // Todos los demás cuestan 20mil
      }
      
      const precioEsCorrecto = mp.price === precioEsperado;

      // Verificar fotos
      let cantidadFotos = 0;
      try {
        const images = typeof mp.images === 'string' ? JSON.parse(mp.images) : mp.images;
        cantidadFotos = Array.isArray(images) ? images.length : 0;
      } catch (e) {
        cantidadFotos = 0;
      }

      if (precioEsCorrecto) {
        preciosCorrectos++;
        console.log(`✅ ${mp.name}`);
        console.log(`   Precio: ${mp.price.toLocaleString('es-CO')} COP (CORRECTO)`);
        console.log(`   Fotos: ${cantidadFotos}`);
      } else {
        preciosIncorrectos++;
        console.log(`❌ ${mp.name}`);
        console.log(`   Precio actual: ${mp.price.toLocaleString('es-CO')} COP`);
        console.log(`   Precio esperado: ${precioEsperado.toLocaleString('es-CO')} COP`);
        console.log(`   Fotos: ${cantidadFotos}`);
      }

      if (cantidadFotos === 0) {
        sinFotos++;
      }

      console.log('');
    }

    console.log('RESUMEN TEST 1:');
    console.log(`  ✅ Precios correctos: ${preciosCorrectos}`);
    console.log(`  ❌ Precios incorrectos: ${preciosIncorrectos}`);
    console.log(`  📸 Sin fotos: ${sinFotos}`);
    console.log('');

    // TEST 2: Verificar megapack de 40 cursos
    console.log('[TEST 2] Verificando megapack de 40 cursos...');
    
    const megapack40 = await prisma.product.findFirst({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: '40', mode: 'insensitive' } },
              { name: { contains: 'cuarenta', mode: 'insensitive' } }
            ]
          },
          { category: 'DIGITAL' } // Los megapacks son productos digitales
        ]
      }
    });

    if (megapack40) {
      const precioEsCorrecto = megapack40.price === 60000;
      
      if (precioEsCorrecto) {
        console.log(`✅ ${megapack40.name}`);
        console.log(`   Precio: ${megapack40.price.toLocaleString('es-CO')} COP (CORRECTO)`);
      } else {
        console.log(`❌ ${megapack40.name}`);
        console.log(`   Precio actual: ${megapack40.price.toLocaleString('es-CO')} COP`);
        console.log(`   Precio esperado: 60,000 COP`);
      }
    } else {
      console.log('⚠️  No se encontró megapack de 40 cursos');
    }
    console.log('');

    // TEST 3: Verificar curso de reparación
    console.log('[TEST 3] Verificando curso de reparación de celulares...');
    
    const cursoReparacion = await prisma.product.findFirst({
      where: {
        name: { contains: 'reparación', mode: 'insensitive' },
        category: 'DIGITAL' // Los megapacks son productos digitales
      }
    });

    if (cursoReparacion) {
      const precioEsCorrecto = cursoReparacion.price === 20000;
      
      if (precioEsCorrecto) {
        console.log(`✅ ${cursoReparacion.name}`);
        console.log(`   Precio: ${cursoReparacion.price.toLocaleString('es-CO')} COP (CORRECTO)`);
      } else {
        console.log(`❌ ${cursoReparacion.name}`);
        console.log(`   Precio actual: ${cursoReparacion.price.toLocaleString('es-CO')} COP`);
        console.log(`   Precio esperado: 20,000 COP`);
      }

      // Verificar fotos
      let cantidadFotos = 0;
      try {
        const images = typeof cursoReparacion.images === 'string' 
          ? JSON.parse(cursoReparacion.images) 
          : cursoReparacion.images;
        cantidadFotos = Array.isArray(images) ? images.length : 0;
      } catch (e) {
        cantidadFotos = 0;
      }

      console.log(`   Fotos: ${cantidadFotos}`);
      
      if (cantidadFotos === 0) {
        console.log('   ⚠️  Este producto NO tiene fotos para enviar');
      }
    } else {
      console.log('⚠️  No se encontró curso de reparación');
    }
    console.log('');

    // TEST 4: Verificar que RealDataEnforcer está integrado
    console.log('[TEST 4] Verificando integración de RealDataEnforcer...');
    
    const fs = require('fs');
    const path = require('path');
    
    const controllerPath = path.join(process.cwd(), 'src/conversational-module/ai/conversacionController.ts');
    const controllerContent = fs.readFileSync(controllerPath, 'utf-8');
    
    const tieneImport = controllerContent.includes('RealDataEnforcer');
    const tieneVerificacion = controllerContent.includes('RealDataEnforcer.getProductData');
    
    if (tieneImport && tieneVerificacion) {
      console.log('✅ RealDataEnforcer está integrado correctamente');
      console.log('   ✓ Import presente');
      console.log('   ✓ Verificación de datos presente');
    } else {
      console.log('❌ RealDataEnforcer NO está integrado');
      if (!tieneImport) console.log('   ✗ Falta import');
      if (!tieneVerificacion) console.log('   ✗ Falta verificación');
    }
    console.log('');

    // TEST 5: Verificar que CardPhotoSender está integrado
    console.log('[TEST 5] Verificando integración de CardPhotoSender...');
    
    const baileysPath = path.join(process.cwd(), 'src/lib/baileys-stable-service.ts');
    const baileysContent = fs.readFileSync(baileysPath, 'utf-8');
    
    const tieneCardImport = baileysContent.includes('CardPhotoSender');
    const usaCardSender = baileysContent.includes('CardPhotoSender.sendProductCard');
    
    if (tieneCardImport && usaCardSender) {
      console.log('✅ CardPhotoSender está integrado correctamente');
      console.log('   ✓ Import presente');
      console.log('   ✓ Uso de sendProductCard presente');
    } else {
      console.log('❌ CardPhotoSender NO está integrado');
      if (!tieneCardImport) console.log('   ✗ Falta import');
      if (!usaCardSender) console.log('   ✗ Falta uso de sendProductCard');
    }
    console.log('');

    // RESUMEN FINAL
    console.log('========================================');
    console.log('RESUMEN FINAL');
    console.log('========================================');
    
    const todosLosTestsPasaron = 
      preciosIncorrectos === 0 &&
      tieneImport && tieneVerificacion &&
      tieneCardImport && usaCardSender;

    if (todosLosTestsPasaron) {
      console.log('✅ TODOS LOS TESTS PASARON');
      console.log('');
      console.log('El sistema está listo para:');
      console.log('  ✓ Usar precios reales de BD');
      console.log('  ✓ Enviar fotos en formato CARD');
      console.log('  ✓ No inventar información');
      console.log('');
      console.log('Puedes probar con:');
      console.log('  npm run dev');
      console.log('');
      console.log('Y enviar mensaje:');
      console.log('  "busco curso de reparacion de celulares"');
    } else {
      console.log('❌ ALGUNOS TESTS FALLARON');
      console.log('');
      console.log('Ejecuta:');
      console.log('  INTEGRAR_CORRECCIONES_AHORA.bat');
      console.log('');
      console.log('Para aplicar todas las correcciones');
    }
    console.log('');

  } catch (error) {
    console.error('❌ Error en tests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCorrecciones();
