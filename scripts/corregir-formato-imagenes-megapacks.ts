/**
 * Corregir formato de imágenes de megapacks
 * De string simple a JSON array
 */

import { db } from '../src/lib/db';

async function corregirFormatoImagenes() {
  console.log('🖼️  Corrigiendo formato de imágenes de megapacks\n');

  const megapacks = await db.product.findMany({
    where: {
      name: {
        contains: 'Mega Pack'
      },
      status: 'AVAILABLE'
    }
  });

  console.log(`📦 Total megapacks encontrados: ${megapacks.length}\n`);

  let corregidos = 0;
  let yaCorrectos = 0;

  for (const megapack of megapacks) {
    const images = megapack.images;

    // Verificar si ya está en formato JSON array
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) {
        console.log(`✅ Ya correcto: ${megapack.name}`);
        yaCorrectos++;
        continue;
      }
    } catch {
      // No es JSON, es string simple
    }

    // Corregir a formato JSON array
    console.log(`🔄 Corrigiendo: ${megapack.name}`);
    console.log(`   Antes: ${images.substring(0, 80)}...`);

    await db.product.update({
      where: { id: megapack.id },
      data: {
        images: JSON.stringify([images])
      }
    });

    console.log(`   Después: ["${images.substring(0, 60)}..."]`);
    console.log('');
    corregidos++;
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ CORRECCIÓN COMPLETADA\n');
  console.log(`   🔄 Corregidos: ${corregidos}`);
  console.log(`   ✅ Ya correctos: ${yaCorrectos}`);
  console.log(`   📦 Total: ${megapacks.length}`);
}

corregirFormatoImagenes()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
