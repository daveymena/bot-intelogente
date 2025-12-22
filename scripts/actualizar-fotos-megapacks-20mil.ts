import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const IMAGEN_MEGAPACK_20 = 'https://hotmart.s3.amazonaws.com/product_pictures/00388af9-ea3f-4389-8e85-1cd1dcf11f72/Sintitulo600x600px.png';

async function actualizarFotosMegapacks20() {
  console.log('🔍 Buscando megapacks de 20 mil sin foto...\n');

  try {
    // Buscar productos que contengan "20" o "20mil" o "20 mil" en el nombre
    const megapacks = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: '20', mode: 'insensitive' } },
          { name: { contains: 'veinte', mode: 'insensitive' } },
          { description: { contains: '20', mode: 'insensitive' } },
          { description: { contains: 'veinte', mode: 'insensitive' } }
        ],
        AND: [
          {
            OR: [
              { name: { contains: 'megapack', mode: 'insensitive' } },
              { name: { contains: 'mega pack', mode: 'insensitive' } },
              { name: { contains: 'pack', mode: 'insensitive' } }
            ]
          }
        ]
      }
    });

    console.log(`📦 Encontrados ${megapacks.length} megapacks con "20" en el nombre\n`);

    // Filtrar los que no tienen imagen o tienen imagen de placeholder
    const sinFoto = megapacks.filter(p => 
      !p.images || 
      p.images === '' || 
      p.images.includes('placeholder') ||
      p.images.includes('unsplash') ||
      p.images.includes('via.placeholder')
    );

    console.log(`❌ ${sinFoto.length} megapacks sin foto válida:\n`);
    
    sinFoto.forEach(p => {
      console.log(`   - ${p.name} (ID: ${p.id})`);
      console.log(`     Imagen actual: ${p.images || 'Sin imagen'}\n`);
    });

    if (sinFoto.length === 0) {
      console.log('✅ Todos los megapacks de 20 mil ya tienen foto');
      return;
    }

    console.log(`\n🔄 Actualizando ${sinFoto.length} productos...\n`);

    let actualizados = 0;
    for (const producto of sinFoto) {
      await prisma.product.update({
        where: { id: producto.id },
        data: { images: IMAGEN_MEGAPACK_20 }
      });
      
      console.log(`✅ Actualizado: ${producto.name}`);
      actualizados++;
    }

    console.log(`\n✨ Proceso completado: ${actualizados} productos actualizados`);
    console.log(`📸 Imagen aplicada: ${IMAGEN_MEGAPACK_20}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

actualizarFotosMegapacks20();
