const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function arreglarTags() {
  try {
    console.log('🔧 Arreglando tags de productos de diseño gráfico...\n');
    
    // 1. Mega Pack 01: Cursos Diseño Gráfico
    const megaPack01 = await prisma.product.findFirst({
      where: { name: { contains: 'Mega Pack 01', mode: 'insensitive' } }
    });
    
    if (megaPack01) {
      console.log('✅ Encontrado: Mega Pack 01: Cursos Diseño Gráfico');
      console.log(`   ID: ${megaPack01.id}`);
      console.log(`   Tags actuales: ${megaPack01.tags}`);
      
      const newTags = [
        // Términos principales
        "megapack",
        "mega pack",
        "curso",
        "cursos",
        "digital",
        
        // Diseño (con y sin tilde)
        "diseño",
        "diseno",
        "gráfico",
        "grafico",
        "diseño gráfico",
        "diseno grafico",
        "diseño grafico",
        "diseno gráfico",
        
        // Herramientas
        "photoshop",
        "illustrator",
        "indesign",
        "adobe",
        
        // Categoría
        "diseno_creatividad",
        "creatividad",
        "arte",
        "grafico",
        
        // Variaciones de búsqueda
        "curso de diseño",
        "curso de diseno",
        "curso diseño",
        "curso diseno",
        "cursos de diseño",
        "cursos de diseno",
        "curso de diseño gráfico",
        "curso de diseno grafico",
        "mega pack diseño",
        "mega pack diseno",
        "pack diseño",
        "pack diseno"
      ];
      
      await prisma.product.update({
        where: { id: megaPack01.id },
        data: { tags: JSON.stringify(newTags) }
      });
      
      console.log(`   ✅ Tags actualizados (${newTags.length} términos)\n`);
    } else {
      console.log('❌ No se encontró Mega Pack 01\n');
    }
    
    // 2. Mega Pack 07: Archivos editables de diseño gráfico
    const megaPack07 = await prisma.product.findFirst({
      where: { name: { contains: 'Mega Pack 07', mode: 'insensitive' } }
    });
    
    if (megaPack07) {
      console.log('✅ Encontrado: Mega Pack 07: Archivos editables de diseño gráfico');
      console.log(`   ID: ${megaPack07.id}`);
      console.log(`   Tags actuales: ${megaPack07.tags}`);
      
      const newTags = [
        "megapack",
        "mega pack",
        "archivos",
        "editables",
        "plantillas",
        "diseño",
        "diseno",
        "gráfico",
        "grafico",
        "diseño gráfico",
        "diseno grafico",
        "psd",
        "ai",
        "eps",
        "adobe",
        "photoshop",
        "illustrator",
        "diseno_creatividad",
        "recursos",
        "templates",
        "archivos de diseño",
        "archivos de diseno",
        "plantillas diseño",
        "plantillas diseno"
      ];
      
      await prisma.product.update({
        where: { id: megaPack07.id },
        data: { tags: JSON.stringify(newTags) }
      });
      
      console.log(`   ✅ Tags actualizados (${newTags.length} términos)\n`);
    } else {
      console.log('❌ No se encontró Mega Pack 07\n');
    }
    
    // 3. Otros productos de diseño
    const otrosProductos = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'diseño', mode: 'insensitive' } },
          { name: { contains: 'diseno', mode: 'insensitive' } },
          { description: { contains: 'diseño', mode: 'insensitive' } }
        ],
        NOT: {
          OR: [
            { name: { contains: 'Mega Pack 01', mode: 'insensitive' } },
            { name: { contains: 'Mega Pack 07', mode: 'insensitive' } }
          ]
        }
      }
    });
    
    console.log(`\n📦 Encontrados ${otrosProductos.length} productos adicionales de diseño:`);
    otrosProductos.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name}`);
    });
    
    console.log('\n✅ Proceso completado');
    console.log('\n🧪 Ahora prueba buscar:');
    console.log('   - "curso de diseño gráfico"');
    console.log('   - "curso diseño"');
    console.log('   - "mega pack diseño"');
    console.log('   - "cursos de diseño"');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

arreglarTags();
