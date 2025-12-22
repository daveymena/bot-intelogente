/**
 * Importar megapacks faltantes desde el JSON
 */

import { db } from '../src/lib/db';
import * as fs from 'fs';

async function importarMegapacksFaltantes() {
  console.log('📦 IMPORTANDO MEGAPACKS FALTANTES\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Leer JSON
  const jsonData = JSON.parse(
    fs.readFileSync('catalogo-megapacks-20mil-ACTUALIZADO.json', 'utf8')
  );

  // Filtrar solo megapacks
  const megapacksEnJSON = jsonData.filter((p: any) => 
    p.name.includes('Mega Pack')
  );

  // Obtener megapacks de la base de datos
  const megapacksEnDB = await db.product.findMany({
    where: {
      name: {
        contains: 'Mega Pack'
      }
    }
  });

  // Crear mapa de megapacks en DB
  const dbNames = new Set(megapacksEnDB.map(p => p.name.trim().toLowerCase()));

  // Encontrar faltantes
  const faltantes = megapacksEnJSON.filter((p: any) => 
    !dbNames.has(p.name.trim().toLowerCase())
  );

  console.log(`⚠️  Megapacks faltantes: ${faltantes.length}\n`);

  if (faltantes.length === 0) {
    console.log('✅ No hay megapacks faltantes');
    return;
  }

  // Imagen repetitiva para todos los megapacks
  const imagenMegapack = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzG9zKj6vPlvpYozQFy0QisTM-HnvlBGWVhQ&s';

  // Obtener usuario admin
  const adminUser = await db.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!adminUser) {
    console.log('❌ Error: No se encontró usuario admin');
    console.log('   Crea un usuario admin primero con: npx tsx scripts/crear-usuario-admin-smart-sales.ts');
    return;
  }

  console.log(`👤 Usuario admin encontrado: ${adminUser.email}\n`);

  let importados = 0;
  let errores = 0;

  for (const megapack of faltantes) {
    try {
      console.log(`📥 Importando: ${megapack.name}`);

      // Generar ID único
      const id = `mp-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // Preparar imágenes
      let images = megapack.images;
      
      // Si la imagen es /fotos/megapak-20.png, usar la imagen repetitiva
      if (Array.isArray(images) && images[0]?.includes('/fotos/megapak-20.png')) {
        images = [imagenMegapack];
      } else if (!images || images.length === 0) {
        images = [imagenMegapack];
      }

      // Preparar tags como string JSON
      let tagsString = '[]';
      if (megapack.tags) {
        if (Array.isArray(megapack.tags)) {
          tagsString = JSON.stringify(megapack.tags);
        } else if (typeof megapack.tags === 'string') {
          tagsString = megapack.tags;
        }
      }

      // Crear producto
      await db.product.create({
        data: {
          id,
          name: megapack.name,
          description: megapack.description || '',
          price: megapack.price,
          currency: megapack.currency || 'COP',
          category: megapack.category || 'DIGITAL',
          status: megapack.status || 'AVAILABLE',
          images: JSON.stringify(images),
          tags: tagsString,
          stock: megapack.stock,
          paymentLinkCustom: megapack.paymentLinkCustom || '',
          userId: adminUser.id
        }
      });

      console.log(`   ✅ Importado exitosamente`);
      console.log(`   🆔 ID: ${id}`);
      console.log(`   💰 Precio: $${megapack.price.toLocaleString('es-CO')}`);
      console.log('');
      
      importados++;
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`);
      console.log('');
      errores++;
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ IMPORTACIÓN COMPLETADA`);
  console.log(`   ✅ Importados: ${importados}`);
  console.log(`   ❌ Errores: ${errores}`);
  console.log('');

  // Verificar total
  const totalMegapacks = await db.product.count({
    where: {
      name: {
        contains: 'Mega Pack'
      }
    }
  });

  console.log(`📦 Total de megapacks en base de datos: ${totalMegapacks}`);
  console.log(`📊 Esperado: ${megapacksEnJSON.length}`);
  
  if (totalMegapacks === megapacksEnJSON.length) {
    console.log('\n✅ TODOS LOS MEGAPACKS IMPORTADOS CORRECTAMENTE');
  } else {
    console.log(`\n⚠️  Faltan ${megapacksEnJSON.length - totalMegapacks} megapacks`);
  }
}

importarMegapacksFaltantes()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
