/**
 * Corregir foto del Mega Pack 01 (Diseño Gráfico)
 */

import { db } from '../src/lib/db';

async function corregirFotoMegapack01() {
  console.log('🖼️  Corrigiendo foto del Mega Pack 01\n');

  const fotoCorrecta = 'https://hotmart.s3.amazonaws.com/product_pictures/dff88656-8bdd-42a4-b9ac-7eaeabb44202/MEGAPACK01CURSOSDEDESEO.png';

  const mp01 = await db.product.findFirst({
    where: {
      name: {
        contains: 'Mega Pack 01'
      }
    }
  });

  if (!mp01) {
    console.log('❌ Mega Pack 01 no encontrado');
    return;
  }

  console.log(`📦 Producto: ${mp01.name}`);
  console.log(`🆔 ID: ${mp01.id}`);

  let images: string[] = [];
  try {
    images = JSON.parse(mp01.images);
  } catch {
    images = [mp01.images];
  }

  console.log(`📸 Foto actual: ${images[0]}`);
  console.log(`📸 Foto correcta: ${fotoCorrecta}`);

  if (images[0] === fotoCorrecta) {
    console.log('\n✅ La foto ya es correcta');
    return;
  }

  await db.product.update({
    where: { id: mp01.id },
    data: {
      images: JSON.stringify([fotoCorrecta])
    }
  });

  console.log('\n✅ Foto actualizada correctamente');
}

corregirFotoMegapack01()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
