/**
 * Test de búsqueda: "curso de piano"
 * Debe encontrar "Curso Completo de Piano Online"
 */

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function testBusquedaCursoPiano() {
  console.log('🔍 TEST: Búsqueda "curso de piano"\n');
  
  try {
    // Obtener el usuario admin
    const user = await db.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!user) {
      console.error('❌ No se encontró usuario admin');
      return;
    }
    
    console.log(`✅ Usuario: ${user.email}\n`);
    
    // Buscar productos que contengan "piano" o "curso"
    const productos = await db.product.findMany({
      where: {
        userId: user.id,
        status: 'AVAILABLE',
        OR: [
          { name: { contains: 'piano', mode: 'insensitive' } },
          { name: { contains: 'Piano', mode: 'insensitive' } },
          { name: { contains: 'curso', mode: 'insensitive' } },
        ]
      },
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
      }
    });
    
    console.log(`📦 Productos encontrados: ${productos.length}\n`);
    
    productos.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   Precio: $${p.price.toLocaleString('es-CO')}`);
      console.log(`   Categoría: ${p.category}`);
      console.log('');
    });
    
    // Buscar específicamente "Curso Completo de Piano Online"
    const cursoPiano = productos.find(p => 
      p.name.toLowerCase().includes('piano') && 
      p.name.toLowerCase().includes('curso')
    );
    
    if (cursoPiano) {
      console.log('✅ ENCONTRADO: Curso de Piano');
      console.log(`   ID: ${cursoPiano.id}`);
      console.log(`   Nombre completo: ${cursoPiano.name}`);
      console.log(`   Precio: $${cursoPiano.price.toLocaleString('es-CO')}`);
    } else {
      console.log('❌ NO ENCONTRADO: Curso de Piano');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

testBusquedaCursoPiano();
