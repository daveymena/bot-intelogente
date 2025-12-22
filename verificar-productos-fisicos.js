/**
 * VERIFICAR PRODUCTOS FÍSICOS REALES
 * Muestra SOLO los productos físicos que existen en BD
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarProductosFisicos() {
  console.log('========================================');
  console.log('PRODUCTOS FÍSICOS REALES EN BASE DE DATOS');
  console.log('========================================\n');

  try {
    // Obtener productos físicos
    const productos = await prisma.product.findMany({
      where: {
        category: 'PHYSICAL',
        status: 'AVAILABLE'
      },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        images: true
      },
      orderBy: {
        price: 'asc'
      }
    });

    if (productos.length === 0) {
      console.log('❌ NO HAY PRODUCTOS FÍSICOS EN LA BASE DE DATOS');
      return;
    }

    console.log(`✅ Encontrados ${productos.length} productos físicos\n`);

    // Agrupar por tipo
    const portatiles = productos.filter(p => 
      p.name.toLowerCase().includes('portátil') || 
      p.name.toLowerCase().includes('portatil') ||
      p.name.toLowerCase().includes('laptop')
    );

    const teclados = productos.filter(p => 
      p.name.toLowerCase().includes('teclado')
    );

    const otros = productos.filter(p => 
      !p.name.toLowerCase().includes('portátil') && 
      !p.name.toLowerCase().includes('portatil') &&
      !p.name.toLowerCase().includes('laptop') &&
      !p.name.toLowerCase().includes('teclado')
    );

    // Mostrar portátiles
    if (portatiles.length > 0) {
      console.log('💻 PORTÁTILES REALES:');
      console.log('='.repeat(80));
      portatiles.forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.name}`);
        console.log(`   💰 Precio: ${p.price.toLocaleString('es-CO')} COP`);
        if (p.description) {
          const desc = p.description.substring(0, 100);
          console.log(`   📝 ${desc}${p.description.length > 100 ? '...' : ''}`);
        }
        console.log(`   🆔 ID: ${p.id}`);
        console.log(`   📸 Fotos: ${p.images?.length || 0}`);
      });
      console.log('\n');
    }

    // Mostrar teclados
    if (teclados.length > 0) {
      console.log('⌨️  TECLADOS REALES:');
      console.log('='.repeat(80));
      teclados.forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.name}`);
        console.log(`   💰 Precio: ${p.price.toLocaleString('es-CO')} COP`);
      });
      console.log('\n');
    }

    // Mostrar otros
    if (otros.length > 0) {
      console.log('📦 OTROS PRODUCTOS FÍSICOS:');
      console.log('='.repeat(80));
      otros.forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.name}`);
        console.log(`   💰 Precio: ${p.price.toLocaleString('es-CO')} COP`);
      });
      console.log('\n');
    }

    // Resumen
    console.log('========================================');
    console.log('RESUMEN:');
    console.log('========================================');
    console.log(`Total productos físicos: ${productos.length}`);
    console.log(`  - Portátiles: ${portatiles.length}`);
    console.log(`  - Teclados: ${teclados.length}`);
    console.log(`  - Otros: ${otros.length}`);
    console.log('');
    console.log('⚠️  IMPORTANTE:');
    console.log('El bot SOLO debe mostrar estos productos.');
    console.log('Si muestra Dell, HP, Lenovo = ESTÁ INVENTANDO');
    console.log('');

    // Verificar marcas reales
    const marcas = new Set();
    portatiles.forEach(p => {
      const nombre = p.name.toLowerCase();
      if (nombre.includes('asus')) marcas.add('Asus');
      if (nombre.includes('dell')) marcas.add('Dell');
      if (nombre.includes('hp')) marcas.add('HP');
      if (nombre.includes('lenovo')) marcas.add('Lenovo');
      if (nombre.includes('acer')) marcas.add('Acer');
    });

    console.log('✅ MARCAS REALES EN BD:');
    marcas.forEach(marca => console.log(`   - ${marca}`));
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verificarProductosFisicos();
