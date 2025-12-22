/**
 * TEST DIRECTO: Buscar megapacks de idiomas
 */

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function testBusquedaIdiomas() {
  console.log('\n🧪 TEST: BÚSQUEDA DE MEGAPACKS DE IDIOMAS\n');
  console.log('═'.repeat(60));

  const userId = 'default-user';
  const queries = [
    'tienes cursos de idiomas?',
    'quiero aprender inglés',
    'cursos de idiomas',
    'mega pack idiomas',
    'inglés'
  ];

  for (const query of queries) {
    console.log(`\n📝 Query: "${query}"`);
    console.log('─'.repeat(60));

    const queryLower = query.toLowerCase();

    // Buscar productos que contengan "idiomas" o "inglés" en nombre o descripción
    const productos = await db.product.findMany({
      where: {
        userId,
        status: 'AVAILABLE',
        OR: [
          { name: { contains: 'idiomas', mode: 'insensitive' } },
          { name: { contains: 'inglés', mode: 'insensitive' } },
          { name: { contains: 'ingles', mode: 'insensitive' } },
          { description: { contains: 'idiomas', mode: 'insensitive' } },
          { description: { contains: 'inglés', mode: 'insensitive' } },
          { description: { contains: 'ingles', mode: 'insensitive' } }
        ]
      }
    });

    if (productos.length > 0) {
      console.log(`✅ Encontrados ${productos.length} productos:`);
      productos.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - ${p.price.toLocaleString('es-CO')} COP`);
      });
    } else {
      console.log('❌ No se encontraron productos');
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('✅ TEST COMPLETADO\n');

  await db.$disconnect();
}

testBusquedaIdiomas().catch(console.error);
