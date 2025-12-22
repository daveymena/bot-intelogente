const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function agregarMegapacksIdiomas() {
  console.log('🌍 AGREGANDO MEGAPACKS DE IDIOMAS');
  console.log('═'.repeat(60));

  try {
    // Buscar el usuario (primer usuario disponible)
    const usuario = await db.user.findFirst();
    
    if (!usuario) {
      console.error('❌ No se encontró ningún usuario');
      return;
    }

    console.log(`✅ Usuario encontrado: ${usuario.email}`);

    // Megapacks de idiomas a agregar
    const megapacksIdiomas = [
      {
        name: 'Mega Pack 03: Cursos Inglés',
        description: 'Cursos de inglés desde básico hasta avanzado incluyendo conversación y negocios',
        price: 20000,
        currency: 'COP',
        category: 'DIGITAL',
        status: 'AVAILABLE',
        images: ['/fotos/megacp unitario.png'],
        tags: ['ingles', 'idiomas', 'conversacion', 'curso', 'english'],
        stock: null,
        paymentLinkCustom: ''
      },
      {
        name: 'Mega Pack 08: Cursos Idiomas',
        description: 'Más de 90 cursos de idiomas. Inglés, francés, alemán, italiano, portugués, chino, japonés. Desde nivel básico hasta avanzado con material audiovisual y ejercicios prácticos.',
        price: 20000,
        currency: 'COP',
        category: 'DIGITAL',
        status: 'AVAILABLE',
        images: ['/fotos/megacp unitario.png'],
        tags: ['idiomas', 'ingles', 'frances', 'aleman', 'italiano', 'portugues', 'chino', 'japones', 'curso'],
        stock: null,
        paymentLinkCustom: ''
      }
    ];

    console.log(`\n📦 Agregando ${megapacksIdiomas.length} megapacks de idiomas...\n`);

    for (const megapack of megapacksIdiomas) {
      // Verificar si ya existe
      const existe = await db.product.findFirst({
        where: {
          userId: usuario.id,
          name: megapack.name
        }
      });

      if (existe) {
        console.log(`⚠️  Ya existe: ${megapack.name}`);
        continue;
      }

      // Crear el megapack
      const creado = await db.product.create({
        data: {
          ...megapack,
          userId: usuario.id
        }
      });

      console.log(`✅ Agregado: ${creado.name}`);
      console.log(`   ID: ${creado.id}`);
      console.log(`   Precio: $${creado.price.toLocaleString('es-CO')}`);
      console.log(`   Tags: ${creado.tags.join(', ')}`);
      console.log();
    }

    // Verificar que se agregaron
    console.log('\n' + '═'.repeat(60));
    console.log('🔍 VERIFICACIÓN FINAL');
    console.log('═'.repeat(60));

    const megapacksEnBD = await db.product.findMany({
      where: {
        userId: usuario.id,
        OR: [
          { name: { contains: 'idiomas', mode: 'insensitive' } },
          { name: { contains: 'inglés', mode: 'insensitive' } },
          { name: { contains: 'ingles', mode: 'insensitive' } },
          { tags: { hasSome: ['idiomas', 'ingles'] } }
        ]
      }
    });

    console.log(`\n✅ Total de megapacks de idiomas en BD: ${megapacksEnBD.length}`);
    megapacksEnBD.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - $${p.price.toLocaleString('es-CO')}`);
    });

    console.log('\n' + '═'.repeat(60));
    console.log('✅ PROCESO COMPLETADO');
    console.log('═'.repeat(60));
    console.log('\n💡 Ahora reinicia el servidor y prueba:');
    console.log('   "tienes cursos de idiomas?"');
    console.log('   "quiero aprender inglés"');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.$disconnect();
  }
}

agregarMegapacksIdiomas();
