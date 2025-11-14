/**
 * Actualizar fotos de megapacks con la imagen correcta
 * Los de diseño gráfico mantienen su foto actual
 * Los demás usan: https://hotmart.s3.amazonaws.com/product_pictures/00388af9-ea3f-4389-8e85-1cd1dcf11f72/Sintitulo600x600px.png
 */

import { db } from '../src/lib/db';

async function actualizarFotosMegapacks() {
  console.log('🖼️  ACTUALIZANDO FOTOS DE MEGAPACKS\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Imagen correcta para megapacks (NO diseño gráfico)
  const imagenMegapack = 'https://hotmart.s3.amazonaws.com/product_pictures/00388af9-ea3f-4389-8e85-1cd1dcf11f72/Sintitulo600x600px.png';

  // Obtener todos los megapacks
  const megapacks = await db.product.findMany({
    where: {
      name: {
        contains: 'Mega Pack'
      }
    }
  });

  console.log(`📦 Total megapacks encontrados: ${megapacks.length}\n`);

  let actualizados = 0;
  let omitidos = 0;

  for (const megapack of megapacks) {
    // Omitir si es de diseño gráfico
    const esDisenoGrafico = 
      megapack.name.toLowerCase().includes('diseño gráfico') ||
      megapack.name.toLowerCase().includes('diseño grafico') ||
      megapack.name.toLowerCase().includes('archivos editables');

    if (esDisenoGrafico) {
      console.log(`⏭️  Omitido (diseño gráfico): ${megapack.name}`);
      omitidos++;
      continue;
    }

    // Parsear imágenes actuales
    let images: string[] = [];
    try {
      images = JSON.parse(megapack.images);
    } catch {
      images = [megapack.images];
    }

    // Verificar si ya tiene la imagen correcta
    if (images[0] === imagenMegapack) {
      console.log(`✅ Ya tiene foto correcta: ${megapack.name}`);
      omitidos++;
      continue;
    }

    // Actualizar con la imagen correcta
    await db.product.update({
      where: { id: megapack.id },
      data: {
        images: JSON.stringify([imagenMegapack])
      }
    });

    console.log(`🔄 Actualizado: ${megapack.name}`);
    console.log(`   📸 Foto anterior: ${images[0]}`);
    console.log(`   📸 Foto nueva: ${imagenMegapack}\n`);
    
    actualizados++;
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ ACTUALIZACIÓN COMPLETADA\n');
  console.log(`   🔄 Actualizados: ${actualizados}`);
  console.log(`   ⏭️  Omitidos: ${omitidos}`);
  console.log(`   📦 Total: ${megapacks.length}`);
}

actualizarFotosMegapacks()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
