/**
 * Script para verificar qué productos necesitan fotos
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando estado de fotos de productos\n');
  console.log('='.repeat(60) + '\n');

  const todosProductos = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  console.log(`📦 Total de productos: ${todosProductos.length}\n`);

  let sinFotos = 0;
  let conUnaFoto = 0;
  let conVariasFotos = 0;
  let conMuchasFotos = 0;

  const productosSinFotos: any[] = [];
  const productosConPocasFotos: any[] = [];

  for (const producto of todosProductos) {
    try {
      const imagenes = producto.images ? JSON.parse(producto.images) : [];
      const numImagenes = imagenes.length;

      if (numImagenes === 0) {
        sinFotos++;
        productosSinFotos.push({
          id: producto.id,
          nombre: producto.name,
          categoria: producto.category
        });
      } else if (numImagenes === 1) {
        conUnaFoto++;
        productosConPocasFotos.push({
          id: producto.id,
          nombre: producto.name,
          imagenes: numImagenes
        });
      } else if (numImagenes <= 3) {
        conVariasFotos++;
      } else {
        conMuchasFotos++;
      }
    } catch (error) {
      sinFotos++;
      productosSinFotos.push({
        id: producto.id,
        nombre: producto.name,
        categoria: producto.category
      });
    }
  }

  console.log('📊 ESTADÍSTICAS:\n');
  console.log(`   ❌ Sin fotos: ${sinFotos} (${((sinFotos/todosProductos.length)*100).toFixed(1)}%)`);
  console.log(`   ⚠️  Con 1 foto: ${conUnaFoto} (${((conUnaFoto/todosProductos.length)*100).toFixed(1)}%)`);
  console.log(`   ✅ Con 2-3 fotos: ${conVariasFotos} (${((conVariasFotos/todosProductos.length)*100).toFixed(1)}%)`);
  console.log(`   🌟 Con 4+ fotos: ${conMuchasFotos} (${((conMuchasFotos/todosProductos.length)*100).toFixed(1)}%)`);

  if (productosSinFotos.length > 0) {
    console.log('\n\n❌ PRODUCTOS SIN FOTOS:\n');
    productosSinFotos.slice(0, 20).forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.nombre} (${p.categoria})`);
    });
    
    if (productosSinFotos.length > 20) {
      console.log(`   ... y ${productosSinFotos.length - 20} más`);
    }
  }

  if (productosConPocasFotos.length > 0) {
    console.log('\n\n⚠️  PRODUCTOS CON SOLO 1 FOTO:\n');
    productosConPocasFotos.slice(0, 20).forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.nombre}`);
    });
    
    if (productosConPocasFotos.length > 20) {
      console.log(`   ... y ${productosConPocasFotos.length - 20} más`);
    }
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('\n📝 RECOMENDACIONES:\n');

  if (sinFotos > 0) {
    console.log(`   1. Ejecuta: actualizar-fotos-sin-imagenes.bat`);
    console.log(`      Para agregar fotos a ${sinFotos} productos\n`);
  }

  if (conUnaFoto > 0) {
    console.log(`   2. Ejecuta: actualizar-fotos-pocas-imagenes.bat`);
    console.log(`      Para agregar más fotos a ${conUnaFoto} productos\n`);
  }

  if (sinFotos === 0 && conUnaFoto === 0) {
    console.log('   ✅ ¡Todos los productos tienen suficientes fotos!\n');
  }

  console.log('='.repeat(60) + '\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
