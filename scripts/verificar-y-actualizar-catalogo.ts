/**
 * Verificar estado del catálogo y actualizar con productos frescos
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 VERIFICANDO ESTADO DEL CATÁLOGO\n');
  console.log('='.repeat(60));

  // Estadísticas generales
  const totalProductos = await prisma.product.count();
  const productosActivos = await prisma.product.count({
    where: { status: 'AVAILABLE' }
  });

  console.log(`\n📊 ESTADÍSTICAS GENERALES`);
  console.log(`   Total productos: ${totalProductos}`);
  console.log(`   Productos activos: ${productosActivos}`);

  // Productos por origen
  console.log(`\n🏪 PRODUCTOS POR ORIGEN`);
  
  const origenes = [
    'megacomputer',
    'smartjoys',
    'disyvar',
    'megapack',
    'dropshipping',
  ];

  for (const origen of origenes) {
    const count = await prisma.product.count({
      where: {
        tags: {
          contains: origen
        }
      }
    });
    
    if (count > 0) {
      console.log(`   ${origen.toUpperCase()}: ${count} productos`);
    }
  }

  // Productos con/sin fotos
  console.log(`\n📸 ESTADO DE FOTOS`);
  
  const conFotos = await prisma.product.count({
    where: {
      AND: [
        { images: { not: null } },
        { images: { not: '[]' } },
        { images: { not: '' } },
      ]
    }
  });

  const sinFotos = await prisma.product.count({
    where: {
      OR: [
        { images: null },
        { images: '[]' },
        { images: '' },
      ]
    }
  });

  console.log(`   ✅ Con fotos: ${conFotos}`);
  console.log(`   ❌ Sin fotos: ${sinFotos}`);

  // Productos con pocas fotos
  const productos = await prisma.product.findMany({
    where: {
      status: 'AVAILABLE',
    },
    select: {
      id: true,
      name: true,
      images: true,
      tags: true,
    }
  });

  let conPocasFotos = 0;
  let conBuenasFotos = 0;

  productos.forEach(p => {
    try {
      const images = p.images ? JSON.parse(p.images) : [];
      if (images.length === 1) {
        conPocasFotos++;
      } else if (images.length >= 2) {
        conBuenasFotos++;
      }
    } catch (error) {
      // Ignorar errores de parsing
    }
  });

  console.log(`   ⚠️  Con 1 foto: ${conPocasFotos}`);
  console.log(`   ✅ Con 2+ fotos: ${conBuenasFotos}`);

  // Productos recientes
  console.log(`\n📅 PRODUCTOS RECIENTES`);
  
  const hoy = new Date();
  const hace7dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
  const hace30dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);

  const ultimos7dias = await prisma.product.count({
    where: {
      createdAt: {
        gte: hace7dias
      }
    }
  });

  const ultimos30dias = await prisma.product.count({
    where: {
      createdAt: {
        gte: hace30dias
      }
    }
  });

  console.log(`   Últimos 7 días: ${ultimos7dias}`);
  console.log(`   Últimos 30 días: ${ultimos30dias}`);

  // Recomendaciones
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('💡 RECOMENDACIONES');
  console.log('='.repeat(60));

  if (sinFotos > 0) {
    console.log(`\n⚠️  Tienes ${sinFotos} productos sin fotos`);
    console.log('   Ejecutar: re-scrapear-fotos-ahora.bat');
  }

  if (conPocasFotos > 10) {
    console.log(`\n⚠️  Tienes ${conPocasFotos} productos con solo 1 foto`);
    console.log('   Ejecutar: actualizar-fotos-pocas-imagenes.bat');
  }

  if (ultimos7dias === 0) {
    console.log(`\n📦 No has agregado productos en los últimos 7 días`);
    console.log('   Recomendación: Importar productos frescos');
    console.log('   ');
    console.log('   OPCIÓN 1 - SmartJoys (Rápido):');
    console.log('   npx tsx scripts/scrape-smartjoys-final.ts');
    console.log('   npx tsx scripts/importar-smartjoys.ts');
    console.log('   ');
    console.log('   OPCIÓN 2 - MegaComputer (Completo):');
    console.log('   re-importar-megacomputer-ahora.bat');
    console.log('   ');
    console.log('   OPCIÓN 3 - Disyvar (Amplio):');
    console.log('   npx tsx scripts/scrape-disyvar.ts');
    console.log('   npx tsx scripts/import-disyvar.ts');
  }

  // Mostrar algunos productos de ejemplo
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('📦 PRODUCTOS DE EJEMPLO (Primeros 10)');
  console.log('='.repeat(60));

  const ejemplos = await prisma.product.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      name: true,
      price: true,
      images: true,
      tags: true,
      createdAt: true,
    }
  });

  ejemplos.forEach((p, i) => {
    const images = p.images ? JSON.parse(p.images) : [];
    const tags = p.tags ? JSON.parse(p.tags) : [];
    const origen = tags.find((t: string) => 
      ['megacomputer', 'smartjoys', 'disyvar', 'megapack', 'dropshipping'].includes(t.toLowerCase())
    ) || 'desconocido';

    console.log(`\n${i + 1}. ${p.name.slice(0, 50)}...`);
    console.log(`   💰 ${p.price.toLocaleString()} COP`);
    console.log(`   📸 ${images.length} fotos`);
    console.log(`   🏪 ${origen}`);
    console.log(`   📅 ${p.createdAt.toLocaleDateString()}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('✨ VERIFICACIÓN COMPLETADA');
  console.log('='.repeat(60) + '\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
