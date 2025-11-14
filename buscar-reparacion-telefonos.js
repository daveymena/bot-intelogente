const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function buscarProducto() {
  try {
    console.log('🔍 Buscando "Reparación de teléfonos y tablets"...\n');
    
    const terminos = [
      'reparacion',
      'reparación',
      'telefono',
      'teléfono',
      'tablet',
      'celular',
      'movil',
      'móvil'
    ];
    
    for (const termino of terminos) {
      console.log(`\n🔎 Buscando: "${termino}"`);
      
      const productos = await prisma.product.findMany({
        where: {
          AND: [
            { status: 'AVAILABLE' },
            {
              OR: [
                { name: { contains: termino, mode: 'insensitive' } },
                { description: { contains: termino, mode: 'insensitive' } },
                { tags: { contains: termino, mode: 'insensitive' } }
              ]
            }
          ]
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          category: true,
          tags: true
        },
        take: 5
      });
      
      if (productos.length > 0) {
        console.log(`✅ Encontrados ${productos.length} producto(s):`);
        productos.forEach((p, i) => {
          console.log(`\n  ${i + 1}. ${p.name}`);
          console.log(`     Precio: $${p.price.toLocaleString('es-CO')}`);
          console.log(`     Categoría: ${p.category}`);
          if (p.description) {
            console.log(`     Descripción: ${p.description.substring(0, 80)}...`);
          }
          if (p.tags) {
            console.log(`     Tags: ${p.tags}`);
          }
        });
      } else {
        console.log(`❌ No se encontraron productos`);
      }
    }
    
    // Búsqueda combinada
    console.log('\n\n🎯 Búsqueda combinada: "reparación" + "teléfono"');
    const combinado = await prisma.product.findMany({
      where: {
        AND: [
          { status: 'AVAILABLE' },
          {
            OR: [
              {
                AND: [
                  { name: { contains: 'reparacion', mode: 'insensitive' } },
                  { name: { contains: 'telefono', mode: 'insensitive' } }
                ]
              },
              {
                AND: [
                  { description: { contains: 'reparacion', mode: 'insensitive' } },
                  { description: { contains: 'telefono', mode: 'insensitive' } }
                ]
              }
            ]
          }
        ]
      }
    });
    
    if (combinado.length > 0) {
      console.log(`✅ Encontrados ${combinado.length} producto(s)`);
      combinado.forEach(p => {
        console.log(`\n  - ${p.name}`);
        console.log(`    $${p.price.toLocaleString('es-CO')}`);
      });
    } else {
      console.log('❌ No existe ese producto en la base de datos');
      console.log('\n💡 SOLUCIÓN:');
      console.log('   1. Agregar el producto a la base de datos');
      console.log('   2. O configurar el bot para decir que no lo tiene');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

buscarProducto();
