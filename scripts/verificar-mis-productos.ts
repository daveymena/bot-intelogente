import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarMisProductos() {
  console.log('🔍 Verificando productos en la base de datos...\n');

  try {
    // Buscar usuarios
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    console.log('👥 USUARIOS EN LA BASE DE DATOS:');
    console.log('='.repeat(60));
    
    if (usuarios.length === 0) {
      console.log('❌ No hay usuarios en la base de datos\n');
      return;
    }

    usuarios.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name || 'Sin nombre'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   📦 Productos: ${user._count.products}`);
    });

    // Buscar tus correos específicos
    const tusCorreos = [
      'daveymena16@gmail.com',
      'deinermena25@gmail.com',
      'admin@smartsalesbot.com'
    ];

    console.log('\n\n🎯 BUSCANDO TUS PRODUCTOS:');
    console.log('='.repeat(60));

    for (const email of tusCorreos) {
      const usuario = await prisma.user.findUnique({
        where: { email },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              category: true,
              subcategory: true,
              images: true,
              tags: true,
              createdAt: true
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (usuario) {
        console.log(`\n✅ Usuario encontrado: ${email}`);
        console.log(`📦 Total de productos: ${usuario.products.length}\n`);

        if (usuario.products.length > 0) {
          console.log('PRODUCTOS:');
          console.log('-'.repeat(60));
          
          usuario.products.forEach((producto, index) => {
            console.log(`\n${index + 1}. ${producto.name}`);
            console.log(`   ID: ${producto.id}`);
            console.log(`   💰 Precio: ${producto.price.toLocaleString()} COP`);
            console.log(`   📁 Categoría: ${producto.category}`);
            if (producto.subcategory) {
              console.log(`   📂 Subcategoría: ${producto.subcategory}`);
            }
            console.log(`   🖼️  Imágenes: ${Array.isArray(producto.images) ? producto.images.length : 0}`);
            console.log(`   🏷️  Tags: ${Array.isArray(producto.tags) ? producto.tags.join(', ') : 'N/A'}`);
            console.log(`   📅 Creado: ${new Date(producto.createdAt).toLocaleDateString()}`);
          });

          // Resumen por categoría
          console.log('\n\n📊 RESUMEN POR CATEGORÍA:');
          console.log('-'.repeat(60));
          
          const porCategoria: { [key: string]: number } = {};
          usuario.products.forEach(p => {
            const cat = p.subcategory || p.category;
            porCategoria[cat] = (porCategoria[cat] || 0) + 1;
          });

          Object.entries(porCategoria)
            .sort((a, b) => b[1] - a[1])
            .forEach(([categoria, cantidad]) => {
              console.log(`  ${categoria}: ${cantidad} productos`);
            });

          // Resumen por tags
          console.log('\n\n🏷️  RESUMEN POR TAGS:');
          console.log('-'.repeat(60));
          
          const porTag: { [key: string]: number } = {};
          usuario.products.forEach(p => {
            if (Array.isArray(p.tags)) {
              p.tags.forEach(tag => {
                porTag[tag] = (porTag[tag] || 0) + 1;
              });
            }
          });

          Object.entries(porTag)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .forEach(([tag, cantidad]) => {
              console.log(`  ${tag}: ${cantidad} productos`);
            });

        } else {
          console.log('❌ No hay productos asociados a este usuario');
        }
      } else {
        console.log(`\n❌ Usuario no encontrado: ${email}`);
      }
    }

    // Estadísticas generales
    console.log('\n\n📊 ESTADÍSTICAS GENERALES:');
    console.log('='.repeat(60));
    
    const totalProductos = await prisma.product.count();
    const productosConImagenes = await prisma.product.count({
      where: {
        images: {
          not: []
        }
      }
    });
    const productosDigitales = await prisma.product.count({
      where: { isDigital: true }
    });
    const productosFisicos = await prisma.product.count({
      where: { isDigital: false }
    });

    console.log(`\n📦 Total de productos en BD: ${totalProductos}`);
    console.log(`🖼️  Productos con imágenes: ${productosConImagenes}`);
    console.log(`💿 Productos digitales: ${productosDigitales}`);
    console.log(`📦 Productos físicos: ${productosFisicos}`);

    // Productos más recientes
    console.log('\n\n🆕 ÚLTIMOS 10 PRODUCTOS CREADOS:');
    console.log('='.repeat(60));
    
    const ultimosProductos = await prisma.product.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    ultimosProductos.forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.name}`);
      console.log(`   Usuario: ${p.user.email}`);
      console.log(`   Precio: ${p.price.toLocaleString()} COP`);
      console.log(`   Fecha: ${new Date(p.createdAt).toLocaleString()}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarMisProductos();
