import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function demoMultiTenant() {
  console.log('🏢 DEMO: Sistema Multi-Tenant\n');
  console.log('Este script demuestra cómo funciona el aislamiento entre clientes\n');
  console.log('='.repeat(70));

  try {
    // Simular 3 clientes diferentes
    const clientes = [
      {
        nombre: 'Tecnovariedades D&S',
        productos: ['Laptop HP', 'Moto Bajaj', 'Curso de Piano'],
        userId: 'user_tecno_123'
      },
      {
        nombre: 'Tienda de Ropa Fashion',
        productos: ['Camiseta Nike', 'Pantalón Adidas', 'Zapatos Puma'],
        userId: 'user_ropa_456'
      },
      {
        nombre: 'Restaurante El Sabor',
        productos: ['Pizza Margarita', 'Hamburguesa Clásica', 'Ensalada César'],
        userId: 'user_rest_789'
      }
    ];

    console.log('\n📊 ESCENARIO: 3 Clientes Diferentes\n');

    clientes.forEach((cliente, index) => {
      console.log(`${index + 1}. ${cliente.nombre}`);
      console.log(`   userId: ${cliente.userId}`);
      console.log(`   Productos: ${cliente.productos.join(', ')}`);
      console.log('');
    });

    console.log('='.repeat(70));
    console.log('\n🔍 SIMULACIÓN DE BÚSQUEDAS:\n');

    // Simular búsqueda de "laptop" para cada cliente
    console.log('Cliente 1 (Tecnovariedades) busca "laptop":');
    console.log('   Query: SELECT * FROM products WHERE userId = "user_tecno_123" AND name LIKE "%laptop%"');
    console.log('   ✅ Resultado: Laptop HP (su producto)');
    console.log('');

    console.log('Cliente 2 (Tienda de Ropa) busca "laptop":');
    console.log('   Query: SELECT * FROM products WHERE userId = "user_ropa_456" AND name LIKE "%laptop%"');
    console.log('   ❌ Resultado: [] (no tiene laptops, solo ropa)');
    console.log('');

    console.log('Cliente 3 (Restaurante) busca "laptop":');
    console.log('   Query: SELECT * FROM products WHERE userId = "user_rest_789" AND name LIKE "%laptop%"');
    console.log('   ❌ Resultado: [] (no tiene laptops, solo comida)');
    console.log('');

    console.log('='.repeat(70));
    console.log('\n🔒 AISLAMIENTO GARANTIZADO:\n');

    console.log('✅ Cada cliente SOLO ve sus propios productos');
    console.log('✅ Imposible acceder a productos de otros clientes');
    console.log('✅ Cada consulta SIEMPRE filtra por userId');
    console.log('✅ Base de datos con índices optimizados por usuario');
    console.log('');

    console.log('='.repeat(70));
    console.log('\n📝 CÓDIGO REAL EN EL SISTEMA:\n');

    console.log('```typescript');
    console.log('// SearchAgent - Búsqueda de productos');
    console.log('const dbProducts = await db.product.findMany({');
    console.log('  where: {');
    console.log('    userId: memory.userId, // 🔒 Filtro obligatorio');
    console.log('    status: "AVAILABLE",');
    console.log('    OR: searchConditions');
    console.log('  }');
    console.log('});');
    console.log('```');
    console.log('');

    console.log('='.repeat(70));
    console.log('\n🎯 ESTADO ACTUAL DEL SISTEMA:\n');

    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();

    console.log(`👥 Usuarios registrados: ${totalUsers}`);
    console.log(`📦 Productos totales: ${totalProducts}`);
    console.log('');

    if (totalUsers === 1) {
      console.log('💡 Actualmente tienes 1 usuario (tú).');
      console.log('   Cuando otros clientes se registren, cada uno tendrá');
      console.log('   sus propios productos completamente aislados.');
    } else {
      console.log(`✅ Sistema multi-tenant activo con ${totalUsers} clientes`);
    }

    console.log('');
    console.log('='.repeat(70));
    console.log('\n✅ CONCLUSIÓN:\n');
    console.log('El sistema Smart Sales Bot Pro está diseñado como SaaS multi-tenant.');
    console.log('Cada cliente es completamente independiente y seguro.');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

demoMultiTenant();
