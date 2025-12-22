const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 🌍 MEGAPACKS DE IDIOMAS QUE FALTAN
const megapacksIdiomas = [
  {
    name: 'Mega Pack 03: Cursos Inglés',
    price: 20000,
    category: 'DIGITAL',
    description: '🌍 Cursos de inglés desde básico hasta avanzado. Incluye conversación, negocios, gramática y pronunciación. Material audiovisual y ejercicios prácticos.',
    tags: JSON.stringify(['megapack', 'idiomas', 'ingles', 'conversacion', 'curso', 'english']),
    images: JSON.stringify([])
  },
  {
    name: 'Mega Pack 08: Cursos Idiomas',
    price: 20000,
    category: 'DIGITAL',
    description: '🌍 Más de 90 cursos de idiomas. Inglés, francés, alemán, italiano, portugués, chino, japonés. Desde nivel básico hasta avanzado con material audiovisual y ejercicios prácticos.',
    tags: JSON.stringify(['megapack', 'idiomas', 'ingles', 'frances', 'aleman', 'italiano', 'portugues', 'chino', 'japones', 'lenguajes', 'cursos']),
    images: JSON.stringify([])
  }
];

async function agregarMegapacksIdiomas() {
  console.log('🌍 AGREGANDO MEGAPACKS DE IDIOMAS\n');
  console.log('='.repeat(60));
  
  try {
    const usuario = await prisma.user.findFirst();
    if (!usuario) {
      console.error('❌ No hay usuarios en la base de datos');
      await prisma.$disconnect();
      return;
    }
    
    console.log(`✅ Usuario encontrado: ${usuario.email}\n`);
    
    let agregados = 0;
    let existentes = 0;
    
    for (const megapack of megapacksIdiomas) {
      try {
        const existe = await prisma.product.findFirst({
          where: { 
            name: megapack.name,
            userId: usuario.id
          }
        });
        
        if (!existe) {
          await prisma.product.create({
            data: {
              name: megapack.name,
              description: megapack.description,
              price: megapack.price,
              category: megapack.category,
              stock: 999,
              status: 'AVAILABLE',
              images: megapack.images,
              tags: megapack.tags,
              userId: usuario.id
            }
          });
          console.log(`✅ ${megapack.name}`);
          agregados++;
        } else {
          console.log(`⏭️  ${megapack.name} (ya existe)`);
          existentes++;
        }
      } catch (error) {
        console.error(`❌ ${megapack.name}: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 RESUMEN:');
    console.log(`✅ Agregados: ${agregados}`);
    console.log(`⏭️  Ya existían: ${existentes}`);
    
    const total = await prisma.product.count({
      where: { userId: usuario.id }
    });
    console.log(`\n📦 Total de productos en BD: ${total}`);
    
    console.log('\n🎉 ¡Completado!');
    console.log('\n📝 AHORA PRUEBA:');
    console.log('   "Mega packs de idiomas"');
    console.log('   Debe mostrar los 2 megapacks de idiomas');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

agregarMegapacksIdiomas();
