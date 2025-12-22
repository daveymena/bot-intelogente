/**
 * Script para verificar los precios reales de los productos en la base de datos
 */

import { db } from '../src/lib/db';

async function main() {
  console.log('🔍 Verificando precios de productos en el catálogo...\n');

  try {
    // Buscar Curso de Piano
    const pianoProducts = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: 'Piano', mode: 'insensitive' } },
          { name: { contains: 'piano', mode: 'insensitive' } }
        ],
        category: 'DIGITAL'
      },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        category: true,
        status: true
      }
    });

    console.log('🎹 CURSOS DE PIANO EN EL CATÁLOGO:');
    console.log('=====================================\n');
    
    if (pianoProducts.length === 0) {
      console.log('❌ No se encontraron cursos de piano en la base de datos\n');
    } else {
      pianoProducts.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   💰 Precio REAL: $${p.price.toLocaleString('es-CO')} COP`);
        console.log(`   📦 Categoría: ${p.category}`);
        console.log(`   ✅ Estado: ${p.status}`);
        if (p.description) {
          console.log(`   📝 Descripción: ${p.description.substring(0, 100)}...`);
        }
        console.log('');
      });
    }

    // Buscar Megapacks
    const megapackProducts = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: 'Mega Pack', mode: 'insensitive' } },
          { name: { contains: 'MegaPack', mode: 'insensitive' } },
          { name: { contains: 'megapack', mode: 'insensitive' } }
        ],
        category: 'DIGITAL'
      },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        category: true,
        status: true
      }
    });

    console.log('🎓 MEGAPACKS EN EL CATÁLOGO:');
    console.log('=====================================\n');
    
    if (megapackProducts.length === 0) {
      console.log('❌ No se encontraron megapacks en la base de datos\n');
    } else {
      megapackProducts.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   💰 Precio REAL: $${p.price.toLocaleString('es-CO')} COP`);
        console.log(`   📦 Categoría: ${p.category}`);
        console.log(`   ✅ Estado: ${p.status}`);
        if (p.description) {
          console.log(`   📝 Descripción: ${p.description.substring(0, 100)}...`);
        }
        console.log('');
      });
    }

    // Buscar todos los cursos digitales
    const allDigitalProducts = await db.product.findMany({
      where: {
        category: 'DIGITAL',
        status: 'AVAILABLE'
      },
      select: {
        id: true,
        name: true,
        price: true,
        category: true
      },
      orderBy: {
        price: 'asc'
      }
    });

    console.log('📚 TODOS LOS PRODUCTOS DIGITALES DISPONIBLES:');
    console.log('=====================================\n');
    
    allDigitalProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   💰 Precio: $${p.price.toLocaleString('es-CO')} COP\n`);
    });

    console.log('\n⚠️ IMPORTANTE:');
    console.log('=====================================');
    console.log('El bot DEBE usar SOLO estos precios del catálogo.');
    console.log('NO debe inventar precios ni usar valores de ejemplo.\n');

    console.log('✅ Para actualizar precios:');
    console.log('1. Edita los productos en el dashboard');
    console.log('2. O usa Prisma Studio: npx prisma studio');
    console.log('3. O actualiza directamente en la BD\n');

  } catch (error) {
    console.error('❌ Error consultando productos:', error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('✅ Verificación completada\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
