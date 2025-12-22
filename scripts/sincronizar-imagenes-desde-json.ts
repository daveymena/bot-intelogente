import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ProductImport {
  name: string;
  images: string[];
}

async function sincronizarImagenesDesdeJSON() {
  try {
    console.log('🔍 Sincronizando imágenes desde JSON...\n');

    const admin = await prisma.user.findFirst({
      where: {
        email: 'daveymena16@gmail.com'
      }
    });

    if (!admin) {
      console.error('❌ Usuario admin no encontrado');
      return;
    }

    // Leer el catálogo corregido
    const catalogPath = path.join(process.cwd(), 'catalogo-completo-importar-fixed.json');
    
    if (!fs.existsSync(catalogPath)) {
      console.error('❌ Archivo no encontrado: catalogo-completo-importar-fixed.json');
      return;
    }

    const catalogData = fs.readFileSync(catalogPath, 'utf-8');
    const productsJSON: ProductImport[] = JSON.parse(catalogData);

    console.log(`📦 Productos en JSON: ${productsJSON.length}\n`);

    let updated = 0;
    let notFound = 0;
    let alreadyOk = 0;

    for (const productJSON of productsJSON) {
      try {
        // Buscar el producto en la base de datos
        const productDB = await prisma.product.findFirst({
          where: {
            userId: admin.id,
            name: productJSON.name
          }
        });

        if (!productDB) {
          console.log(`⏭️  No encontrado en BD: ${productJSON.name}`);
          notFound++;
          continue;
        }

        // Verificar si necesita actualización
        let currentImages: string[] = [];
        try {
          currentImages = JSON.parse(productDB.images || '[]');
        } catch (e) {
          currentImages = [];
        }

        const needsUpdate = !currentImages || 
                           currentImages.length === 0 || 
                           currentImages[0] === '' ||
                           !currentImages[0].startsWith('http');

        if (!needsUpdate) {
          alreadyOk++;
          continue;
        }

        // Preparar imágenes del JSON
        let newImages = productJSON.images;
        if (!newImages || newImages.length === 0 || newImages[0] === '') {
          // Usar imagen genérica según tipo de producto
          if (productJSON.name.toLowerCase().includes('monitor')) {
            newImages = ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500'];
          } else if (productJSON.name.toLowerCase().includes('laptop') || 
                     productJSON.name.toLowerCase().includes('portatil') ||
                     productJSON.name.toLowerCase().includes('macbook')) {
            newImages = ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'];
          } else if (productJSON.name.toLowerCase().includes('mouse') || 
                     productJSON.name.toLowerCase().includes('teclado') ||
                     productJSON.name.toLowerCase().includes('combo')) {
            newImages = ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500'];
          } else if (productJSON.name.toLowerCase().includes('diadema') ||
                     productJSON.name.toLowerCase().includes('auricular')) {
            newImages = ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'];
          } else if (productJSON.name.toLowerCase().includes('parlante') ||
                     productJSON.name.toLowerCase().includes('torre de sonido')) {
            newImages = ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500'];
          } else if (productJSON.name.toLowerCase().includes('impresora') ||
                     productJSON.name.toLowerCase().includes('escáner')) {
            newImages = ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500'];
          } else {
            newImages = ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'];
          }
        }

        // Actualizar el producto
        await prisma.product.update({
          where: {
            id: productDB.id
          },
          data: {
            images: JSON.stringify(newImages)
          }
        });

        console.log(`✅ Actualizado: ${productJSON.name}`);
        updated++;

      } catch (error: any) {
        console.error(`❌ Error con ${productJSON.name}:`, error.message);
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Actualizados: ${updated}`);
    console.log(`   ✔️  Ya tenían imágenes: ${alreadyOk}`);
    console.log(`   ⏭️  No encontrados: ${notFound}`);
    console.log(`\n🎉 Sincronización completada!`);
    console.log(`\n💡 Ahora todos los productos tienen imágenes válidas`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

sincronizarImagenesDesdeJSON();
