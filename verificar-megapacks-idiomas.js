/**
 * Verificar si existe un megapack específico de idiomas
 */

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function verificarMegapacksIdiomas() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(' VERIFICAR MEGAPACKS DE IDIOMAS');
  console.log('═══════════════════════════════════════════════════════════\n');

  const userId = 'cmixj6v1i0000uo70u6i3zxe1';

  // 1. Buscar megapacks que contengan "idiomas" en nombre o descripción
  console.log('1️⃣  Megapacks con "idiomas" en nombre o descripción:');
  console.log('─────────────────────────────────────────────────────────────');
  
  const megapacksIdiomas = await db.product.findMany({
    where: {
      userId,
      status: 'AVAILABLE',
      category: 'DIGITAL',
      OR: [
        { name: { contains: 'mega', mode: 'insensitive' } },
        { name: { contains: 'pack', mode: 'insensitive' } }
      ],
      AND: [
        {
          OR: [
            { name: { contains: 'idiomas', mode: 'insensitive' } },
            { description: { contains: 'idiomas', mode: 'insensitive' } }
          ]
        }
      ]
    }
  });
  
  if (megapacksIdiomas.length > 0) {
    console.log(`✅ Encontrados ${megapacksIdiomas.length} megapacks:`);
    megapacksIdiomas.forEach((p, i) => {
      console.log(`\n   ${i + 1}. ${p.name}`);
      console.log(`      Precio: ${p.price.toLocaleString('es-CO')} COP`);
      if (p.description) {
        console.log(`      Descripción: ${p.description.substring(0, 100)}...`);
      }
    });
  } else {
    console.log('❌ No se encontraron megapacks con "idiomas"');
  }
  console.log('');

  // 2. Buscar megapacks que contengan "curso" en nombre o descripción
  console.log('2️⃣  Megapacks con "curso" en nombre o descripción:');
  console.log('─────────────────────────────────────────────────────────────');
  
  const megapacksCurso = await db.product.findMany({
    where: {
      userId,
      status: 'AVAILABLE',
      category: 'DIGITAL',
      OR: [
        { name: { contains: 'mega', mode: 'insensitive' } },
        { name: { contains: 'pack', mode: 'insensitive' } }
      ],
      AND: [
        {
          OR: [
            { name: { contains: 'curso', mode: 'insensitive' } },
            { description: { contains: 'curso', mode: 'insensitive' } }
          ]
        }
      ]
    }
  });
  
  if (megapacksCurso.length > 0) {
    console.log(`✅ Encontrados ${megapacksCurso.length} megapacks:`);
    megapacksCurso.slice(0, 5).forEach((p, i) => {
      console.log(`\n   ${i + 1}. ${p.name}`);
      console.log(`      Precio: ${p.price.toLocaleString('es-CO')} COP`);
    });
  } else {
    console.log('❌ No se encontraron megapacks con "curso"');
  }
  console.log('');

  // 3. Buscar megapacks que contengan "curso" E "idiomas"
  console.log('3️⃣  Megapacks con "curso" E "idiomas" (AND):');
  console.log('─────────────────────────────────────────────────────────────');
  
  const megapacksEspecificos = await db.product.findMany({
    where: {
      userId,
      status: 'AVAILABLE',
      category: 'DIGITAL',
      OR: [
        { name: { contains: 'mega', mode: 'insensitive' } },
        { name: { contains: 'pack', mode: 'insensitive' } }
      ],
      AND: [
        {
          OR: [
            { name: { contains: 'curso', mode: 'insensitive' } },
            { description: { contains: 'curso', mode: 'insensitive' } }
          ]
        },
        {
          OR: [
            { name: { contains: 'idiomas', mode: 'insensitive' } },
            { description: { contains: 'idiomas', mode: 'insensitive' } }
          ]
        }
      ]
    }
  });
  
  if (megapacksEspecificos.length > 0) {
    console.log(`✅ Encontrados ${megapacksEspecificos.length} megapacks específicos:`);
    megapacksEspecificos.forEach((p, i) => {
      console.log(`\n   ${i + 1}. ${p.name}`);
      console.log(`      Precio: ${p.price.toLocaleString('es-CO')} COP`);
      if (p.description) {
        console.log(`      Descripción: ${p.description.substring(0, 150)}...`);
      }
    });
  } else {
    console.log('❌ No existe un megapack específico con "curso" E "idiomas"');
  }
  console.log('');

  // 4. Listar todos los megapacks disponibles
  console.log('4️⃣  Todos los megapacks disponibles (primeros 10):');
  console.log('─────────────────────────────────────────────────────────────');
  
  const todosMegapacks = await db.product.findMany({
    where: {
      userId,
      status: 'AVAILABLE',
      category: 'DIGITAL',
      OR: [
        { name: { contains: 'mega', mode: 'insensitive' } },
        { name: { contains: 'pack', mode: 'insensitive' } }
      ]
    },
    take: 10
  });
  
  todosMegapacks.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name} - ${p.price.toLocaleString('es-CO')} COP`);
  });
  console.log('');

  console.log('═══════════════════════════════════════════════════════════');
  console.log(' CONCLUSIÓN');
  console.log('═══════════════════════════════════════════════════════════');
  
  if (megapacksEspecificos.length > 0) {
    console.log('✅ Existe megapack específico de idiomas');
    console.log('   El bot debería mostrar SOLO ese megapack');
  } else if (megapacksIdiomas.length > 0) {
    console.log('✅ Existen megapacks con "idiomas" pero no específicos');
    console.log('   El bot debería mostrar esos megapacks');
  } else if (megapacksCurso.length > 0) {
    console.log('⚠️  Solo existen megapacks con "curso"');
    console.log('   El bot debería mostrar megapacks de cursos generales');
  } else {
    console.log('❌ No existen megapacks relacionados');
    console.log('   El bot debería mostrar todos los megapacks disponibles');
  }
  console.log('═══════════════════════════════════════════════════════════\n');

  await db.$disconnect();
}

verificarMegapacksIdiomas().catch(console.error);
