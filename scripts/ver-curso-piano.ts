/**
 * Ver información del curso de piano
 */

import { db } from '@/lib/db';

async function verCursoPiano() {
  console.log('🎹 INFORMACIÓN DEL CURSO DE PIANO\n');
  
  const curso = await db.product.findFirst({
    where: {
      name: {
        contains: 'piano',
        mode: 'insensitive'
      }
    }
  });
  
  if (!curso) {
    console.log('❌ No se encontró el curso de piano');
    return;
  }
  
  console.log('📦 Producto:');
  console.log(`   Nombre: ${curso.name}`);
  console.log(`   ID: ${curso.id}`);
  console.log(`   Precio: ${curso.price}`);
  console.log(`   Categoría: ${curso.category}`);
  console.log(`   Status: ${curso.status}`);
  
  console.log('\n📸 Campo images (RAW):');
  console.log(`   Tipo: ${typeof curso.images}`);
  console.log(`   Valor:`, curso.images);
  
  if (curso.images) {
    console.log(`\n📏 Análisis:`);
    console.log(`   Longitud: ${curso.images.length}`);
    console.log(`   Es array: ${Array.isArray(curso.images)}`);
    
    if (Array.isArray(curso.images)) {
      console.log(`   Elementos: ${curso.images.length}`);
      curso.images.forEach((img, i) => {
        console.log(`   [${i}]: "${img}" (${typeof img}, longitud: ${img?.length || 0})`);
      });
    }
  }
  
  console.log('\n💡 Para corregir:');
  console.log('   npx tsx scripts/corregir-imagenes-curso-piano.ts');
}

verCursoPiano()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
