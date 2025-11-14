const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBusqueda() {
  try {
    console.log('🧪 TEST: Búsqueda de "curso de diseño gráfico"\n');
    
    // Simular búsqueda como lo haría el bot
    const searchTerms = [
      'curso de diseño gráfico',
      'diseño gráfico',
      'curso diseño',
      'mega pack diseño',
      'mega pack 01'
    ];
    
    for (const term of searchTerms) {
      console.log(`\n🔍 Buscando: "${term}"`);
      console.log('─'.repeat(50));
      
      const productos = await prisma.product.findMany({
        where: {
          AND: [
            { status: 'AVAILABLE' },
            {
              OR: [
                { name: { contains: term, mode: 'insensitive' } },
                { description: { contains: term, mode: 'insensitive' } },
                { tags: { contains: term, mode: 'insensitive' } }
              ]
            }
          ]
        },
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          tags: true
        },
        take: 5
      });
      
      if (productos.length > 0) {
        console.log(`✅ Encontrados ${productos.length} producto(s):`);
        productos.forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.name}`);
          console.log(`     Precio: $${p.price.toLocaleString('es-CO')}`);
          
          if (p.images) {
            try {
              const imgs = JSON.parse(p.images);
              console.log(`     Fotos: ${imgs.length > 0 ? '✅ ' + imgs.length : '❌ Sin fotos'}`);
            } catch (e) {
              console.log(`     Fotos: ❌ Error`);
            }
          } else {
            console.log(`     Fotos: ❌ Sin fotos`);
          }
        });
      } else {
        console.log('❌ No se encontraron productos');
      }
    }
    
    // Test específico con palabras clave
    console.log('\n\n🎯 TEST: Búsqueda por palabras clave individuales');
    console.log('═'.repeat(50));
    
    const keywords = ['diseño', 'gráfico', 'curso', 'mega pack'];
    
    for (const keyword of keywords) {
      const count = await prisma.product.count({
        where: {
          AND: [
            { status: 'AVAILABLE' },
            {
              OR: [
                { name: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } },
                { tags: { contains: keyword, mode: 'insensitive' } }
              ]
            }
          ]
        }
      });
      
      console.log(`"${keyword}": ${count} productos`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testBusqueda();
