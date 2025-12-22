/**
 * Diagnosticar y corregir URLs de imágenes de productos
 */

import { db } from '@/lib/db';

async function diagnosticarImagenes() {
  console.log('🔍 DIAGNÓSTICO DE IMÁGENES DE PRODUCTOS\n');
  
  // 1. Obtener todos los productos
  const productos = await db.product.findMany({
    select: {
      id: true,
      name: true,
      images: true,
      category: true
    }
  });
  
  console.log(`📦 Total de productos: ${productos.length}\n`);
  
  let sinImagenes = 0;
  let imagenesInvalidas = 0;
  let imagenesValidas = 0;
  
  console.log('📋 ANÁLISIS POR PRODUCTO:\n');
  
  for (const producto of productos) {
    console.log(`\n📦 ${producto.name}`);
    console.log(`   ID: ${producto.id}`);
    console.log(`   Categoría: ${producto.category}`);
    
    if (!producto.images || producto.images.length === 0) {
      console.log(`   ❌ SIN IMÁGENES`);
      sinImagenes++;
      continue;
    }
    
    console.log(`   📸 Imágenes (${producto.images.length}):`);
    
    let todasValidas = true;
    
    for (let i = 0; i < producto.images.length; i++) {
      const img = producto.images[i];
      
      // Verificar si es válida
      const esValida = img && 
                       typeof img === 'string' && 
                       img.length > 10 && 
                       (img.startsWith('http://') || img.startsWith('https://'));
      
      if (esValida) {
        console.log(`      ${i + 1}. ✅ ${img.substring(0, 60)}...`);
      } else {
        console.log(`      ${i + 1}. ❌ INVÁLIDA: "${img}"`);
        todasValidas = false;
      }
    }
    
    if (todasValidas) {
      imagenesValidas++;
    } else {
      imagenesInvalidas++;
    }
  }
  
  // Resumen
  console.log('\n\n📊 RESUMEN:');
  console.log(`   ✅ Productos con imágenes válidas: ${imagenesValidas}`);
  console.log(`   ❌ Productos con imágenes inválidas: ${imagenesInvalidas}`);
  console.log(`   ⚠️  Productos sin imágenes: ${sinImagenes}`);
  
  // Buscar específicamente el curso de piano
  console.log('\n\n🎹 CURSO DE PIANO:');
  const cursoPiano = productos.find(p => 
    p.name.toLowerCase().includes('piano')
  );
  
  if (cursoPiano) {
    console.log(`   Nombre: ${cursoPiano.name}`);
    console.log(`   ID: ${cursoPiano.id}`);
    console.log(`   Imágenes:`, cursoPiano.images);
    
    if (!cursoPiano.images || cursoPiano.images.length === 0) {
      console.log(`   ❌ NO TIENE IMÁGENES`);
    } else {
      const primeraImagen = cursoPiano.images[0];
      const esValida = primeraImagen && 
                       typeof primeraImagen === 'string' && 
                       primeraImagen.length > 10 && 
                       (primeraImagen.startsWith('http://') || primeraImagen.startsWith('https://'));
      
      if (esValida) {
        console.log(`   ✅ Imagen válida: ${primeraImagen}`);
      } else {
        console.log(`   ❌ Imagen INVÁLIDA: "${primeraImagen}"`);
        console.log(`   📝 Tipo: ${typeof primeraImagen}`);
        console.log(`   📏 Longitud: ${primeraImagen?.length || 0}`);
      }
    }
  } else {
    console.log(`   ❌ NO SE ENCONTRÓ CURSO DE PIANO`);
  }
  
  // Sugerencias
  console.log('\n\n💡 SUGERENCIAS:');
  
  if (imagenesInvalidas > 0) {
    console.log(`\n1. Corregir imágenes inválidas:`);
    console.log(`   npx tsx scripts/corregir-imagenes-invalidas.ts`);
  }
  
  if (sinImagenes > 0) {
    console.log(`\n2. Agregar imágenes faltantes:`);
    console.log(`   npx tsx scripts/agregar-imagenes-productos.ts`);
  }
  
  console.log(`\n3. Ver producto específico:`);
  console.log(`   npx tsx scripts/ver-producto.ts "nombre del producto"`);
}

diagnosticarImagenes()
  .then(() => {
    console.log('\n✅ Diagnóstico completado');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
