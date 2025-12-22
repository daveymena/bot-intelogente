/**
 * TEST: Búsqueda de idiomas con fallback mejorado
 */

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function testBusquedaIdiomas() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(' TEST DE BÚSQUEDA: "Me interesa mucho el curso de idiomas"');
  console.log('═══════════════════════════════════════════════════════════\n');

  const userId = 'cmixj6v1i0000uo70u6i3zxe1';
  const query = 'Me interesa mucho el curso de idiomas';

  // 1. Extraer keywords
  console.log('1️⃣  EXTRACCIÓN DE KEYWORDS');
  console.log('─────────────────────────────────────────────────────────────');
  const stopwords = [
    'para', 'con', 'de', 'del', 'la', 'el', 'un', 'una', 'los', 'las', 'y', 'o', 'en', 'por',
    'busco', 'quiero', 'necesito', 'tienes', 'deseo', 'interesa', 'informacion', 'info',
    'precio', 'costo', 'valor', 'cuanto', 'como', 'donde', 'hola', 'saludos', 'buenos', 'dias',
    'mucho', 'muy', 'mas', 'menos', 'algo', 'algun', 'alguna'
  ];
  
  const keywords = query
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2)
    .filter(w => !stopwords.includes(w));
  
  console.log(`Query original: "${query}"`);
  console.log(`Keywords extraídas: ${keywords.join(', ')}`);
  console.log(`Total keywords: ${keywords.length}\n`);

  // 2. Buscar curso específico de idiomas
  console.log('2️⃣  BÚSQUEDA EXACTA (Curso de idiomas)');
  console.log('─────────────────────────────────────────────────────────────');
  
  const cursosIdiomas = await db.product.findMany({
    where: {
      userId,
      status: 'AVAILABLE',
      category: 'DIGITAL',
      OR: keywords.flatMap(kw => [
        { name: { contains: kw, mode: 'insensitive' } },
        { description: { contains: kw, mode: 'insensitive' } }
      ])
    },
    take: 5
  });
  
  if (cursosIdiomas.length > 0) {
    console.log(`✅ Encontrados ${cursosIdiomas.length} cursos de idiomas:`);
    cursosIdiomas.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name}`);
      console.log(`      Precio: ${p.price.toLocaleString('es-CO')} COP`);
      console.log(`      Fotos: ${p.images?.length || 0}`);
    });
  } else {
    console.log('❌ No se encontraron cursos específicos de idiomas');
  }
  console.log('');

  // 3. FALLBACK: Buscar en megapacks
  console.log('3️⃣  FALLBACK: Búsqueda en Megapacks');
  console.log('─────────────────────────────────────────────────────────────');
  
  // Primero intentar búsqueda ESPECÍFICA (AND - todas las keywords)
  let megapacks = await db.product.findMany({
    where: {
      userId,
      status: 'AVAILABLE',
      category: 'DIGITAL',
      OR: [
        { name: { contains: 'mega', mode: 'insensitive' } },
        { name: { contains: 'pack', mode: 'insensitive' } }
      ],
      AND: keywords.map(kw => ({
        OR: [
          { name: { contains: kw, mode: 'insensitive' } },
          { description: { contains: kw, mode: 'insensitive' } }
        ]
      }))
    },
    take: 1 // Solo 1 producto específico
  });
  
  if (megapacks.length > 0) {
    console.log('✅ Búsqueda ESPECÍFICA (AND): Encontrado megapack con TODAS las keywords');
  } else {
    console.log('🔄 Búsqueda ESPECÍFICA (AND): No encontrado, intentando búsqueda flexible...');
    
    // Búsqueda FLEXIBLE (OR - alguna keyword)
    megapacks = await db.product.findMany({
      where: {
        userId,
        status: 'AVAILABLE',
        category: 'DIGITAL',
        OR: [
          { name: { contains: 'mega', mode: 'insensitive' } },
          { name: { contains: 'pack', mode: 'insensitive' } }
        ],
        AND: keywords.length > 0 ? [
          {
            OR: keywords.flatMap(kw => [
              { name: { contains: kw, mode: 'insensitive' } },
              { description: { contains: kw, mode: 'insensitive' } }
            ])
          }
        ] : []
      },
      take: 3
    });
  }
  
  if (megapacks.length === 0 && keywords.length > 0) {
    console.log('🔄 No encontré megapacks con keywords, buscando todos los megapacks...');
    megapacks = await db.product.findMany({
      where: {
        userId,
        status: 'AVAILABLE',
        category: 'DIGITAL',
        OR: [
          { name: { contains: 'mega', mode: 'insensitive' } },
          { name: { contains: 'pack', mode: 'insensitive' } }
        ]
      },
      take: 3
    });
  }
  
  if (megapacks.length > 0) {
    console.log(`✅ Encontrados ${megapacks.length} megapacks:`);
    megapacks.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name}`);
      console.log(`      Precio: ${p.price.toLocaleString('es-CO')} COP`);
      console.log(`      Fotos: ${p.images?.length || 0}`);
      if (p.images && p.images.length > 0) {
        console.log(`      URL: ${p.images[0]}`);
      }
    });
  } else {
    console.log('❌ No se encontraron megapacks');
  }
  console.log('');

  // 4. Respuesta que debería dar el bot
  console.log('4️⃣  RESPUESTA ESPERADA DEL BOT');
  console.log('─────────────────────────────────────────────────────────────');
  
  if (cursosIdiomas.length > 0) {
    console.log('✅ Respuesta: Mostrar cursos de idiomas específicos');
  } else if (megapacks.length > 0) {
    console.log('✅ Respuesta: "No encontré un curso individual de idiomas,');
    console.log('   pero tengo megapacks que incluyen cursos de idiomas"');
    console.log('');
    console.log('   Formato profesional:');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   😊 No encontré un curso individual de idiomas,');
    console.log('   pero tengo estos megapacks que podrían interesarte:');
    console.log('');
    megapacks.slice(0, 3).forEach((p, i) => {
      console.log(`   ${i + 1}. 📦 ${p.name}`);
      console.log(`      💰 Precio: ${p.price.toLocaleString('es-CO')} COP`);
      console.log('');
    });
    console.log('   ¿Te gustaría ver más detalles de alguno?');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } else {
    console.log('❌ Respuesta: "No encontré productos relacionados con idiomas"');
  }
  console.log('');

  // 5. Verificar todos los megapacks disponibles
  console.log('5️⃣  TODOS LOS MEGAPACKS DISPONIBLES');
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
    }
  });
  
  console.log(`Total megapacks: ${todosMegapacks.length}`);
  if (todosMegapacks.length > 0) {
    console.log('\nPrimeros 5 megapacks:');
    todosMegapacks.slice(0, 5).forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name}`);
    });
  }
  console.log('');

  console.log('═══════════════════════════════════════════════════════════');
  console.log(' RESUMEN');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ Keywords extraídas: ${keywords.length}`);
  console.log(`✅ Cursos específicos: ${cursosIdiomas.length}`);
  console.log(`✅ Megapacks encontrados: ${megapacks.length}`);
  console.log(`✅ Total megapacks disponibles: ${todosMegapacks.length}`);
  console.log('');
  
  if (megapacks.length > 0) {
    console.log('🎉 SISTEMA FUNCIONANDO CORRECTAMENTE');
    console.log('   El bot debería mostrar megapacks como alternativa');
  } else if (todosMegapacks.length > 0) {
    console.log('⚠️  HAY MEGAPACKS PERO NO SE ENCONTRARON');
    console.log('   Revisar lógica de búsqueda');
  } else {
    console.log('❌ NO HAY MEGAPACKS EN LA BASE DE DATOS');
  }
  console.log('═══════════════════════════════════════════════════════════\n');

  await db.$disconnect();
}

testBusquedaIdiomas().catch(console.error);
