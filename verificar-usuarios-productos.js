// Script para verificar usuarios y sus productos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarUsuarios() {
  console.log('👥 Verificando usuarios y productos...\n');

  try {
    // 1. Listar todos los usuarios
    console.log('👥 USUARIOS EN LA BASE DE DATOS:');
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
        _count: {
          select: { products: true }
        }
      }
    });

    usuarios.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.email || 'Sin email'}`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Nombre: ${user.name || 'Sin nombre'}`);
      console.log(`      Negocio: ${user.businessName || 'Sin negocio'}`);
      console.log(`      Productos: ${user._count.products}`);
      console.log('');
    });

    // 2. Verificar productos por usuario
    console.log('📦 PRODUCTOS POR USUARIO:');
    for (const user of usuarios) {
      if (user._count.products > 0) {
        const productos = await prisma.product.findMany({
          where: { userId: user.id },
          select: { name: true, images: true },
          take: 3
        });

        console.log(`   Usuario: ${user.email}`);
        console.log(`   Total productos: ${user._count.products}`);
        console.log(`   Ejemplos:`);
        productos.forEach((p, i) => {
          const images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
          console.log(`      ${i + 1}. ${p.name}`);
          console.log(`         Fotos: ${images.length > 0 ? images[0] : 'Sin fotos'}`);
        });
        console.log('');
      }
    }

    // 3. Verificar el usuario actual de la sesión
    console.log('🔐 PARA VERIFICAR EL USUARIO DE LA SESIÓN:');
    console.log('   1. Abrir: http://localhost:3000/api/auth/session');
    console.log('   2. Ver el "user.id" en la respuesta');
    console.log('   3. Comparar con los IDs de arriba');
    console.log('');

    // 4. Solución si los productos están en otro usuario
    console.log('💡 SOLUCIÓN:');
    console.log('   Si los productos están en un usuario diferente al de tu sesión:');
    console.log('   1. Opción A: Cambiar el userId de los productos');
    console.log('   2. Opción B: Iniciar sesión con el usuario correcto');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verificarUsuarios();
