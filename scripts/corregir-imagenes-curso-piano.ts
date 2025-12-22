/**
 * Corregir imagen del curso de piano
 */

import { db } from '@/lib/db';

async function corregirImagenCursoPiano() {
  console.log('🎹 CORRIGIENDO IMAGEN DEL CURSO DE PIANO\n');
  
  // Buscar el curso de piano
  const cursoPiano = await db.product.findFirst({
    where: {
      name: {
        contains: 'piano',
        mode: 'insensitive'
      }
    }
  });
  
  if (!cursoPiano) {
    console.log('❌ No se encontró el curso de piano');
    return;
  }
  
  console.log(`📦 Producto encontrado: ${cursoPiano.name}`);
  console.log(`   ID: ${cursoPiano.id}`);
  console.log(`   Imágenes actuales:`, cursoPiano.images);
  
  // URL de imagen por defecto para cursos de piano
  const nuevaImagenUrl = 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&q=80';
  
  console.log(`\n📸 Nueva imagen: ${nuevaImagenUrl}`);
  
  // Actualizar
  const actualizado = await db.product.update({
    where: { id: cursoPiano.id },
    data: {
      images: [nuevaImagenUrl]
    }
  });
  
  console.log('\n✅ Imagen actualizada correctamente');
  console.log(`   Nuevas imágenes:`, actualizado.images);
  
  console.log('\n💡 NOTA:');
  console.log('   Esta es una imagen temporal de Unsplash.');
  console.log('   Puedes cambiarla desde el dashboard en la sección de Productos.');
}

corregirImagenCursoPiano()
  .then(() => {
    console.log('\n✅ Corrección completada');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
