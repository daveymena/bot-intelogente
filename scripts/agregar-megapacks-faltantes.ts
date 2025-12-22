import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function agregarMegapacksFaltantes() {
  try {
    console.log('🔍 Leyendo catálogo completo...\n');

    const catalogoCompleto = JSON.parse(
      fs.readFileSync('catalogo-megapacks-20mil-ACTUALIZADO.json', 'utf-8')
    );

    // Filtrar solo los megapacks del 11 al 25
    const megapacksFaltantes = catalogoCompleto.filter((producto: any) => {
      const match = producto.name.match(/Mega Pack (\d+)/);
      if (match) {
        const numero = parseInt(match[1]);
        return numero >= 11 && numero <= 25;
      }
      return false;
    });

    console.log(`📦 Megapacks faltantes encontrados en el archivo: ${megapacksFaltantes.length}\n`);

    if (megapacksFaltantes.length === 0) {
      console.log('❌ No se encontraron los megapacks faltantes en el archivo JSON');
      return;
    }

    // Obtener el primer usuario (admin)
    const usuario = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    });

    if (!usuario) {
      console.log('❌ No se encontró un usuario admin');
      return;
    }

    console.log(`👤 Usuario: ${usuario.email}\n`);

    // Agregar cada megapack
    for (const mp of megapacksFaltantes) {
      console.log(`➕ Agregando: ${mp.name}...`);

      await prisma.product.create({
        data: {
          name: mp.name,
          description: mp.description || `Megapack con cursos y recursos digitales de ${mp.name}`,
          price: mp.price || 20000,
          currency: mp.currency || 'COP',
          category: mp.category || 'DIGITAL',
          status: mp.status || 'AVAILABLE',
          images: Array.isArray(mp.images) ? mp.images[0] : (mp.images || null),
          tags: Array.isArray(mp.tags) ? mp.tags.join(',') : (mp.tags || 'megapack,cursos,digital'),
          userId: usuario.id
        }
      });

      console.log(`   ✅ Agregado exitosamente`);
    }

    console.log(`\n✅ Se agregaron ${megapacksFaltantes.length} megapacks a la base de datos`);

    // Verificar total
    const totalMegapacks = await prisma.product.count({
      where: {
        name: {
          contains: 'Mega Pack'
        }
      }
    });

    console.log(`\n📊 Total de megapacks en la BD ahora: ${totalMegapacks}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

agregarMegapacksFaltantes();
