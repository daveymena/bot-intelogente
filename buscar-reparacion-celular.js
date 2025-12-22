const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function buscar() {
  const productos = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'reparacion', mode: 'insensitive' } },
        { name: { contains: 'reparación', mode: 'insensitive' } },
        { name: { contains: 'celular', mode: 'insensitive' } },
        { name: { contains: 'telefono', mode: 'insensitive' } },
        { name: { contains: 'teléfono', mode: 'insensitive' } },
        { name: { contains: 'movil', mode: 'insensitive' } },
        { name: { contains: 'móvil', mode: 'insensitive' } },
        { description: { contains: 'reparacion', mode: 'insensitive' } },
        { description: { contains: 'celular', mode: 'insensitive' } }
      ]
    }
  });
  
  console.log(`\n📱 Productos de reparación de celulares: ${productos.length}\n`);
  
  if (productos.length === 0) {
    console.log('❌ NO existe curso de reparación de celulares en la BD');
    console.log('\n💡 El bot NO debe inventar este producto');
    console.log('   Debe responder honestamente que no lo tiene');
  } else {
    productos.forEach((p, i) => {
      console.log(`${i+1}. ${p.name} - ${p.price.toLocaleString()} COP`);
    });
  }
  
  await prisma.$disconnect();
}

buscar();
