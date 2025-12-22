const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 🎯 PRODUCTOS ESPECÍFICOS QUE FALTAN
const productosEspecificos = [
  {
    name: 'Curso Completo de Piano Online',
    price: 60000,
    category: 'DIGITAL',
    description: '🎹 Aprende piano desde cero hasta nivel profesional. +80 lecciones en video HD, acceso de por vida, soporte directo del profesor. Método progresivo y fácil de seguir.',
    tags: JSON.stringify(['piano', 'curso', 'musica', 'aprender', 'online']),
    images: JSON.stringify(['/fotos/curso-piano.jpg'])
  },
  {
    name: 'ASUS VivoBook GO 15',
    price: 1189000,
    category: 'PHYSICAL',
    description: '💻 Laptop ASUS VivoBook GO 15 - AMD Ryzen 3 7320U, 8GB DDR5 RAM, 512GB SSD, Pantalla 15.6" FHD. Ideal para trabajo y estudio.',
    tags: JSON.stringify(['laptop', 'asus', 'vivobook', 'computador', 'portatil']),
    images: JSON.stringify(['/fotos/asus-vivobook.jpg'])
  },
  {
    name: 'ASUS VivoBook 15 i5',
    price: 1650000,
    category: 'PHYSICAL',
    description: '💻 Laptop ASUS VivoBook 15 - Intel Core i5, 8GB RAM, 512GB SSD, Pantalla 15.6" FHD. Rendimiento superior para multitarea.',
    tags: JSON.stringify(['laptop', 'asus', 'vivobook', 'i5', 'computador']),
    images: JSON.stringify(['/fotos/asus-vivobook-i5.jpg'])
  },
  {
    name: 'Moto Bajaj Pulsar NS 160 FI (2020)',
    price: 6500000,
    category: 'PHYSICAL',
    description: '🏍️ Moto Bajaj Pulsar NS 160 FI modelo 2020. Motor 160cc inyección electrónica, frenos ABS, tablero digital, excelente estado, papeles al día. Precio negociable hasta $6.300.000',
    tags: JSON.stringify(['moto', 'bajaj', 'pulsar', 'ns160', 'motocicleta']),
    images: JSON.stringify(['/fotos/pulsar-ns160.jpg'])
  },
  {
    name: 'Mega Pack 17: Apps Android Premium',
    price: 20000,
    category: 'DIGITAL',
    description: '📱 Colección de aplicaciones Android premium desbloqueadas. Incluye apps de productividad, entretenimiento, edición y más.',
    tags: JSON.stringify(['megapack', 'android', 'apps', 'aplicaciones']),
    images: JSON.stringify([])
  },
  {
    name: 'Mega Pack 21: Pack Sublimado',
    price: 20000,
    category: 'DIGITAL',
    description: '🎨 Diseños y recursos completos para sublimación. Plantillas, tutoriales y técnicas profesionales.',
    tags: JSON.stringify(['megapack', 'sublimado', 'diseño', 'manualidades']),
    images: JSON.stringify([])
  }
];

async function agregarProductosEspecificos() {
  console.log('🎯 AGREGANDO PRODUCTOS ESPECÍFICOS\n');
  console.log('='.repeat(60));
  
  try {
    // Obtener el primer usuario
    const usuario = await prisma.user.findFirst();
    if (!usuario) {
      console.error('❌ No hay usuarios en la base de datos');
      await prisma.$disconnect();
      return;
    }
    
    console.log(`✅ Usuario encontrado: ${usuario.email}\n`);
    
    let agregados = 0;
    let existentes = 0;
    let errores = 0;
    
    for (const producto of productosEspecificos) {
      try {
        // Verificar si ya existe
        const existe = await prisma.product.findFirst({
          where: { 
            name: producto.name,
            userId: usuario.id
          }
        });
        
        if (!existe) {
          await prisma.product.create({
            data: {
              name: producto.name,
              description: producto.description,
              price: producto.price,
              category: producto.category,
              stock: producto.category === 'DIGITAL' ? 999 : 1,
              status: 'AVAILABLE',
              images: producto.images,
              tags: producto.tags,
              userId: usuario.id
            }
          });
          console.log(`✅ ${producto.name}`);
          agregados++;
        } else {
          console.log(`⏭️  ${producto.name} (ya existe)`);
          existentes++;
        }
      } catch (error) {
        console.error(`❌ ${producto.name}: ${error.message}`);
        errores++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 RESUMEN:');
    console.log(`✅ Agregados: ${agregados}`);
    console.log(`⏭️  Ya existían: ${existentes}`);
    console.log(`❌ Errores: ${errores}`);
    
    // Contar total de productos
    const total = await prisma.product.count({
      where: { userId: usuario.id }
    });
    console.log(`\n📦 Total de productos en BD: ${total}`);
    
    console.log('\n🎉 ¡Completado!');
    console.log('\n📝 SIGUIENTE PASO:');
    console.log('   1. Reinicia el servidor');
    console.log('   2. Prueba: "Estoy interesado en el curso de piano"');
    console.log('   3. Debe mostrar SOLO el curso de piano');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

agregarProductosEspecificos();
