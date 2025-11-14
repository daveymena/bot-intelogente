const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function buscarProducto() {
  try {
    console.log('🔍 Buscando productos de diseño gráfico...\n');
    
    const productos = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'diseño', mode: 'insensitive' } },
          { name: { contains: 'Diseño', mode: 'insensitive' } },
          { description: { contains: 'diseño', mode: 'insensitive' } },
          { tags: { contains: 'diseño', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        images: true,
        tags: true,
        userId: true,
        status: true
      }
    });
    
    console.log(`✅ Encontrados ${productos.length} productos\n`);
    
    productos.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Precio: $${p.price.toLocaleString('es-CO')}`);
      console.log(`   Categoría: ${p.category}`);
      console.log(`   Usuario: ${p.userId}`);
      console.log(`   Descripción: ${p.description?.substring(0, 80)}...`);
      
      if (p.images) {
        try {
          const imgs = JSON.parse(p.images);
          console.log(`   Fotos: ${imgs.length} imagen(es)`);
          if (imgs.length > 0) {
            console.log(`   Primera foto: ${imgs[0]}`);
          }
        } catch (e) {
          console.log(`   Fotos: Error parseando`);
        }
      } else {
        console.log(`   Fotos: ❌ SIN FOTOS`);
      }
      
      console.log(`   Tags: ${p.tags || 'N/A'}`);
      console.log(`   Estado: ${p.status}`);
      console.log('');
    });
    
    // Buscar específicamente "Mega Pack 01"
    console.log('\n🎯 Buscando específicamente "Mega Pack 01: Cursos Diseño Gráfico"...\n');
    
    const megaPack = await prisma.product.findFirst({
      where: {
        name: { contains: 'Mega Pack 01', mode: 'insensitive' }
      }
    });
    
    if (megaPack) {
      console.log('✅ ENCONTRADO:');
      console.log(JSON.stringify(megaPack, null, 2));
    } else {
      console.log('❌ NO ENCONTRADO en la base de datos');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

buscarProducto();
