const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function verificarProductos() {
  try {
    // Obtener usuario admin
    const usuario = await db.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!usuario) {
      console.log('❌ No hay usuarios ADMIN en la BD');
      return;
    }

    console.log('✅ Usuario encontrado:', usuario.email);
    console.log('📦 ID:', usuario.id);
    console.log();

    // Contar productos del usuario
    const totalProductos = await db.product.count({
      where: { userId: usuario.id }
    });

    console.log(`📊 Total de productos: ${totalProductos}`);
    console.log();

    if (totalProductos === 0) {
      console.log('❌ El usuario NO tiene productos');
      console.log('💡 Necesitas agregar productos primero');
      return;
    }

    // Buscar productos que contengan "portátil" o "laptop"
    const portatiles = await db.product.findMany({
      where: {
        userId: usuario.id,
        OR: [
          { name: { contains: 'portátil', mode: 'insensitive' } },
          { name: { contains: 'portatil', mode: 'insensitive' } },
          { name: { contains: 'laptop', mode: 'insensitive' } },
          { name: { contains: 'computador', mode: 'insensitive' } }
        ]
      },
      take: 5
    });

    console.log(`💻 Portátiles encontrados: ${portatiles.length}`);
    
    if (portatiles.length > 0) {
      console.log('\n📋 Productos:');
      portatiles.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name}`);
        console.log(`     Precio: ${p.price.toLocaleString('es-CO')} COP`);
        console.log(`     Categoría: ${p.category}`);
        console.log(`     Estado: ${p.status}`);
        console.log();
      });
    } else {
      console.log('❌ No hay portátiles en el catálogo');
      console.log('💡 Agrega productos con categoría COMPUTER o que contengan "portátil" en el nombre');
    }

    // Mostrar algunos productos del usuario
    const algunosProductos = await db.product.findMany({
      where: { userId: usuario.id },
      take: 5,
      select: {
        name: true,
        category: true,
        status: true
      }
    });

    if (algunosProductos.length > 0) {
      console.log('\n📦 Algunos productos del usuario:');
      algunosProductos.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name} (${p.category}) - ${p.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.$disconnect();
  }
}

verificarProductos();
