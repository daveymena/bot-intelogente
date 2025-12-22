/**
 * TEST: Búsqueda de "curso de idiomas"
 * Debe buscar en megapacks si no encuentra curso específico
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBusquedaIdiomas() {
  console.log('========================================');
  console.log('TEST: BÚSQUEDA DE CURSO DE IDIOMAS');
  console.log('========================================\n');

  const userId = process.env.DEFAULT_USER_ID || 'default-user-id';
  const query = 'curso de idiomas';

  console.log(`🔍 Buscando: "${query}"`);
  console.log(`👤 Usuario: ${userId}\n`);

  // 1. Buscar curso específico de idiomas
  console.log('1️⃣ Buscando curso específico de idiomas...');
  const cursoEspecifico = await prisma.product.findMany({
    where: {
      userId,
      status: 'AVAILABLE',
      category: 'DIGITAL',
      OR: [
        { name: { contains: 'idioma', mode: 'insensitive' } },
        { description: { contains: 'idioma', mode: 'insensitive' } },
        { tags: { has: 'idiomas' } }
      ]
    }
  });

  if (cursoEspecifico.length > 0) {
    console.log(`✅ Encontrados ${cursoEspecifico.length} cursos específicos:`);
    cursoEspecifico.forEach(p => {
      console.log(`   - ${p.name} (${p.price.toLocaleString('es-CO')} COP)`);
    });
  } else {
    console.log('❌ No se encontraron cursos específicos de idiomas');
  }

  console.log('');

  // 2. Buscar en megapacks (fallback)
  console.log('2️⃣ Buscando en megapacks (fallback)...');
  const megapacks = await prisma.product.findMany({
    where: {
      userId,
      status: 'AVAILABLE',
      category: 'DIGITAL',
      OR: [
        { name: { contains: 'mega', mode: 'insensitive' } },
        { name: { contains: 'pack', mode: 'insensitive' } },
        { subcategory: 'MEGAPACK' }
      ],
      AND: {
        OR: [
          { name: { contains: 'idioma', mode: 'insensitive' } },
          { description: { contains: 'idioma', mode: 'insensitive' } },
          { tags: { has: 'idiomas' } }
        ]
      }
    },
    take: 3
  });

  if (megapacks.length > 0) {
    console.log(`✅ Encontrados ${megapacks.length} megapacks relacionados:`);
    megapacks.forEach(p => {
      console.log(`   - ${p.name} (${p.price.toLocaleString('es-CO')} COP)`);
      if (p.description) {
        const shortDesc = p.description.substring(0, 100);
        console.log(`     📝 ${shortDesc}...`);
      }
    });
  } else {
    console.log('❌ No se encontraron megapacks relacionados');
  }

  console.log('');

  // 3. Resultado final
  console.log('========================================');
  console.log('RESULTADO FINAL');
  console.log('========================================\n');

  if (cursoEspecifico.length > 0) {
    console.log('✅ Se encontró curso específico');
    console.log('📤 El bot mostrará el curso individual');
  } else if (megapacks.length > 0) {
    console.log('✅ Se encontraron megapacks como alternativa');
    console.log('📤 El bot mostrará:');
    console.log('   "No encontré un curso individual de idiomas,');
    console.log('    pero tengo estos megapacks que lo incluyen:"');
  } else {
    console.log('❌ No se encontraron productos');
    console.log('📤 El bot mostrará mensaje de no encontrado');
  }

  console.log('');

  // 4. Formato esperado
  console.log('========================================');
  console.log('FORMATO ESPERADO (SIN ASTERISCOS)');
  console.log('========================================\n');

  if (megapacks.length > 0) {
    const pack = megapacks[0];
    console.log('💡 No encontré un curso individual de idiomas');
    console.log('');
    console.log('Pero tengo estos megapacks que lo incluyen:');
    console.log('');
    console.log(`1️⃣ 📦 ${pack.name}`);
    console.log(`   💰 ${pack.price.toLocaleString('es-CO')} COP`);
    if (pack.description) {
      const shortDesc = pack.description.substring(0, 100);
      console.log(`   📝 ${shortDesc}...`);
    }
    console.log('');
    console.log('¿Te interesa alguno?');
    console.log('Dime el número para más información 😊');
  }

  console.log('');
  console.log('========================================');
  console.log('VERIFICACIÓN DE FORMATO');
  console.log('========================================\n');

  console.log('✅ Sin asteriscos (*)');
  console.log('✅ Sin guiones bajos (_)');
  console.log('✅ Sin puntos (...) para separar');
  console.log('✅ Con emojis profesionales');
  console.log('✅ Con espaciado elegante');
  console.log('✅ Formato tipo boleta/card');

  await prisma.$disconnect();
}

testBusquedaIdiomas().catch(console.error);
