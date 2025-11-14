const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function arreglarMegapackIdiomas() {
  try {
    console.log('🔧 Arreglando Mega Pack 08: Cursos Idiomas...\n');
    
    // Buscar el megapack de idiomas
    const megapack = await prisma.product.findFirst({
      where: { 
        name: { contains: 'Mega Pack 08', mode: 'insensitive' }
      }
    });
    
    if (!megapack) {
      console.log('❌ No se encontró Mega Pack 08');
      return;
    }
    
    console.log('✅ Encontrado:', megapack.name);
    console.log('   ID:', megapack.id);
    console.log('   Tags actuales:', megapack.tags);
    console.log('   Descripción:', megapack.description?.substring(0, 100));
    
    // Tags completos para idiomas
    const newTags = [
      // Términos principales
      "megapack",
      "mega pack",
      "curso",
      "cursos",
      "digital",
      
      // Idiomas
      "idioma",
      "idiomas",
      "language",
      "languages",
      
      // Inglés (con todas las variaciones)
      "ingles",
      "inglés",
      "english",
      "curso de ingles",
      "curso de inglés",
      "cursos de ingles",
      "cursos de inglés",
      "aprender ingles",
      "aprender inglés",
      
      // Otros idiomas comunes
      "frances",
      "francés",
      "french",
      "aleman",
      "alemán",
      "german",
      "italiano",
      "italian",
      "portugues",
      "portugués",
      "portuguese",
      "chino",
      "chinese",
      "japones",
      "japonés",
      "japanese",
      
      // Conceptos relacionados
      "conversacion",
      "conversación",
      "gramatica",
      "gramática",
      "vocabulario",
      "pronunciation",
      "pronunciacion",
      "pronunciación",
      
      // Niveles
      "basico",
      "básico",
      "intermedio",
      "avanzado",
      "principiante",
      
      // Categoría
      "educacion_desarrollo"
    ];
    
    await prisma.product.update({
      where: { id: megapack.id },
      data: { 
        tags: JSON.stringify(newTags),
        // Asegurar que la descripción mencione inglés
        description: megapack.description || '📦 Cursos completos de idiomas: Inglés, Francés, Alemán, Italiano y más\n\n💰 Precio individual: $20.000 COP\n\n🎁 O adquiere el Pack Completo (40 productos) por solo $60.000 COP\n💎 Ahorro de $740.000 COP'
      }
    });
    
    console.log(`\n✅ Tags actualizados (${newTags.length} términos)`);
    console.log('\n🧪 Ahora prueba buscar:');
    console.log('   - "curso de inglés"');
    console.log('   - "aprender inglés"');
    console.log('   - "curso de idiomas"');
    console.log('   - "inglés básico"');
    
    // Verificar que funciona
    console.log('\n🔍 Verificando búsqueda...');
    const test = await prisma.product.findMany({
      where: {
        AND: [
          { status: 'AVAILABLE' },
          {
            OR: [
              { name: { contains: 'ingles', mode: 'insensitive' } },
              { tags: { contains: 'ingles', mode: 'insensitive' } },
              { description: { contains: 'ingles', mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: { name: true }
    });
    
    console.log(`✅ Productos que contienen "inglés": ${test.length}`);
    test.forEach(p => console.log(`   - ${p.name}`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

arreglarMegapackIdiomas();
