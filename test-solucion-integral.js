/**
 * TEST INTEGRAL - Verifica todas las soluciones aplicadas
 */

const { db } = require('./src/lib/db');

async function testIntegral() {
  console.log('\n🔍 ========================================');
  console.log('   TEST INTEGRAL DE SOLUCIONES');
  console.log('========================================\n');

  let errores = 0;
  let exitos = 0;

  // TEST 1: Verificar productos de idiomas
  console.log('[TEST 1] 🌍 Verificando productos de idiomas...');
  try {
    const productosIdiomas = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: 'idioma', mode: 'insensitive' } },
          { name: { contains: 'inglés', mode: 'insensitive' } },
          { name: { contains: 'ingles', mode: 'insensitive' } },
        ],
        status: 'AVAILABLE'
      }
    });

    if (productosIdiomas.length > 0) {
      console.log(`✅ Encontrados ${productosIdiomas.length} productos de idiomas:`);
      productosIdiomas.forEach(p => {
        console.log(`   - ${p.name} (ID: ${p.id})`);
      });
      exitos++;
    } else {
      console.log('❌ NO se encontraron productos de idiomas');
      errores++;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    errores++;
  }

  console.log('');

  // TEST 2: Verificar curso de piano
  console.log('[TEST 2] 🎹 Verificando curso de piano...');
  try {
    const cursoPiano = await db.product.findFirst({
      where: {
        name: { contains: 'piano', mode: 'insensitive' },
        status: 'AVAILABLE'
      }
    });

    if (cursoPiano) {
      console.log(`✅ Curso de piano encontrado:`);
      console.log(`   Nombre: ${cursoPiano.name}`);
      console.log(`   Precio: ${cursoPiano.price.toLocaleString('es-CO')} COP`);
      console.log(`   Categoría: ${cursoPiano.category}`);
      
      // Verificar imágenes
      let imagenes = [];
      try {
        if (typeof cursoPiano.images === 'string') {
          imagenes = JSON.parse(cursoPiano.images);
        } else if (Array.isArray(cursoPiano.images)) {
          imagenes = cursoPiano.images;
        }
      } catch (e) {
        imagenes = [];
      }
      
      console.log(`   Imágenes: ${imagenes.length}`);
      if (imagenes.length > 0) {
        console.log(`   Primera imagen: ${imagenes[0]}`);
      }
      
      exitos++;
    } else {
      console.log('❌ Curso de piano NO encontrado');
      errores++;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    errores++;
  }

  console.log('');

  // TEST 3: Verificar archivo specific-product-finder.ts
  console.log('[TEST 3] 📁 Verificando archivo specific-product-finder.ts...');
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, 'src', 'lib', 'specific-product-finder.ts');
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('findSpecificProduct') && content.includes('export')) {
        console.log('✅ Archivo recreado correctamente');
        console.log(`   Tamaño: ${content.length} caracteres`);
        exitos++;
      } else {
        console.log('❌ Archivo existe pero contenido incorrecto');
        errores++;
      }
    } else {
      console.log('❌ Archivo NO existe');
      errores++;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    errores++;
  }

  console.log('');

  // TEST 4: Verificar configuración .env
  console.log('[TEST 4] ⚙️  Verificando configuración .env...');
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '.env');
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      const checks = [
        { key: 'USE_OLLAMA', expected: 'true' },
        { key: 'OLLAMA_BASE_URL', required: true },
        { key: 'OLLAMA_TIMEOUT', required: true },
      ];
      
      let allOk = true;
      checks.forEach(check => {
        const regex = new RegExp(`${check.key}=(.+)`, 'i');
        const match = envContent.match(regex);
        
        if (match) {
          const value = match[1].trim();
          console.log(`   ✅ ${check.key}=${value}`);
          
          if (check.expected && value !== check.expected) {
            console.log(`      ⚠️  Esperado: ${check.expected}`);
            allOk = false;
          }
        } else {
          console.log(`   ❌ ${check.key} NO encontrado`);
          allOk = false;
        }
      });
      
      if (allOk) {
        exitos++;
      } else {
        errores++;
      }
    } else {
      console.log('❌ Archivo .env NO existe');
      errores++;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    errores++;
  }

  console.log('');

  // TEST 5: Verificar sistema de fotos
  console.log('[TEST 5] 📸 Verificando sistema de fotos...');
  try {
    const fs = require('fs');
    const path = require('path');
    const photoServicePath = path.join(__dirname, 'src', 'conversational-module', 'services', 'photoService.ts');
    
    if (fs.existsSync(photoServicePath)) {
      const content = fs.readFileSync(photoServicePath, 'utf8');
      
      const checks = [
        'obtenerFotosProducto',
        'detectarSolicitudFotos',
        'startsWith(\'/\')',
        'baseUrl',
      ];
      
      let allOk = true;
      checks.forEach(check => {
        if (content.includes(check)) {
          console.log(`   ✅ ${check} presente`);
        } else {
          console.log(`   ❌ ${check} NO encontrado`);
          allOk = false;
        }
      });
      
      if (allOk) {
        exitos++;
      } else {
        errores++;
      }
    } else {
      console.log('❌ Archivo photoService.ts NO existe');
      errores++;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    errores++;
  }

  console.log('');

  // RESUMEN
  console.log('========================================');
  console.log('   RESUMEN DEL TEST');
  console.log('========================================');
  console.log(`✅ Exitosos: ${exitos}/5`);
  console.log(`❌ Errores: ${errores}/5`);
  console.log('');

  if (errores === 0) {
    console.log('🎉 ¡TODAS LAS SOLUCIONES APLICADAS CORRECTAMENTE!');
    console.log('');
    console.log('📋 PRÓXIMOS PASOS:');
    console.log('1. Reiniciar servidor: npm run dev');
    console.log('2. Probar búsqueda de piano: node test-busqueda-piano-directo.js');
    console.log('3. Probar búsqueda de idiomas: node test-busqueda-idiomas-final.js');
    console.log('4. Probar fotos: node test-fotos-curso-piano.js');
    console.log('');
  } else {
    console.log('⚠️  ALGUNAS SOLUCIONES REQUIEREN ATENCIÓN');
    console.log('');
    console.log('📋 ACCIONES REQUERIDAS:');
    if (errores > 0) {
      console.log('- Revisar los errores arriba');
      console.log('- Aplicar las correcciones necesarias');
      console.log('- Ejecutar este test de nuevo');
    }
    console.log('');
  }

  await db.$disconnect();
  process.exit(errores > 0 ? 1 : 0);
}

testIntegral().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
