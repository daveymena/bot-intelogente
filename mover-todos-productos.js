// Script para mover TODOS los productos al usuario correcto
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function moverTodosProductos() {
  console.log('🔄 Moviendo TODOS los productos al usuario correcto...\n');

  try {
    // IDs de usuarios
    const usuarioOrigen = 'cmhm54i3y0000kmrciujcs3uu'; // anny.mena@example.com
    const usuarioDestino = 'cmhm5hpxg0000kmmwjvazve9d'; // daveymena16@gmail.com

    console.log('👥 USUARIOS:');
    console.log(`   Origen: anny.mena@example.com`);
    console.log(`   Destino: daveymena16@gmail.com\n`);

    // Contar productos antes
    const productosOrigen = await prisma.product.count({
      where: { userId: usuarioOrigen }
    });
    
    const productosDestino = await prisma.product.count({
      where: { userId: usuarioDestino }
    });

    console.log('📊 ANTES:');
    console.log(`   anny.mena: ${productosOrigen} productos`);
    console.log(`   daveymena16: ${productosDestino} productos\n`);

    // Mover TODOS los productos
    console.log('🔄 Moviendo todos los productos...');
    const resultado = await prisma.product.updateMany({
      where: { userId: usuarioOrigen },
      data: { userId: usuarioDestino }
    });

    console.log(`   ✅ ${resultado.count} productos movidos\n`);

    // Contar productos después
    const productosOrigenDespues = await prisma.product.count({
      where: { userId: usuarioOrigen }
    });
    
    const productosDestinoDespues = await prisma.product.count({
      where: { userId: usuarioDestino }
    });

    console.log('📊 DESPUÉS:');
    console.log(`   anny.mena: ${productosOrigenDespues} productos`);
    console.log(`   daveymena16: ${productosDestinoDespues} productos\n`);

    // Mostrar algunos ejemplos
    console.log('📦 EJEMPLOS DE PRODUCTOS MOVIDOS:');
    const ejemplos = await prisma.product.findMany({
      where: { userId: usuarioDestino },
      select: { name: true, category: true, price: true },
      take: 10
    });

    ejemplos.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name}`);
      console.log(`      Categoría: ${p.category} | Precio: $${p.price.toLocaleString()}`);
    });

    console.log(`   ... y ${productosDestinoDespues - 10} más\n`);

    console.log('✅ TODOS LOS PRODUCTOS MOVIDOS!');
    console.log('\n🎨 AHORA PUEDES:');
    console.log('   1. Refrescar el dashboard (F5)');
    console.log('   2. Ver TODOS los productos en la sección "Productos"');
    console.log('   3. Deberías ver:');
    console.log('      - Portátiles de MegaComputer');
    console.log('      - Megapacks con fotos');
    console.log('      - Moto con 5 fotos');
    console.log('      - Curso de piano');
    console.log('      - Y todos los demás productos');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

moverTodosProductos();
