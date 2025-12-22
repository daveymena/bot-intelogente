/**
 * Script para verificar productos duplicados en la base de datos
 */

import { db as prisma } from '../src/lib/db';

async function verificarDuplicados() {
  console.log('🔍 Verificando productos duplicados...\n');
  console.log('='.repeat(70));

  try {
    // Buscar todos los productos
    const productos = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });

    console.log(`\n📊 Total de productos: ${productos.length}\n`);

    // Agrupar por nombre
    const productosPorNombre = new Map<string, any[]>();

    productos.forEach(producto => {
      const nombre = producto.name.toLowerCase().trim();
      if (!productosPorNombre.has(nombre)) {
        productosPorNombre.set(nombre, []);
      }
      productosPorNombre.get(nombre)!.push(producto);
    });

    // Buscar duplicados
    let duplicadosEncontrados = 0;

    console.log('🔎 Productos duplicados encontrados:\n');
    console.log('-'.repeat(70));

    productosPorNombre.forEach((productos, nombre) => {
      if (productos.length > 1) {
        duplicadosEncontrados++;
        console.log(`\n❌ DUPLICADO: "${nombre}" (${productos.length} veces)`);
        productos.forEach((p, idx) => {
          console.log(`   ${idx + 1}. ID: ${p.id}`);
          console.log(`      Precio: $${p.price.toLocaleString('es-CO')} COP`);
          console.log(`      Categoría: ${p.category}`);
          console.log(`      Estado: ${p.status}`);
          console.log(`      Creado: ${p.createdAt.toISOString()}`);
        });
      }
    });

    if (duplicadosEncontrados === 0) {
      console.log('\n✅ No se encontraron productos duplicados\n');
    } else {
      console.log(`\n⚠️  Total de productos duplicados: ${duplicadosEncontrados}\n`);
    }

    // Buscar específicamente cursos de piano
    console.log('='.repeat(70));
    console.log('\n🎹 Buscando cursos de piano específicamente...\n');
    
    const cursosPiano = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'piano', mode: 'insensitive' } },
          { description: { contains: 'piano', mode: 'insensitive' } }
        ]
      }
    });

    console.log(`📚 Cursos de piano encontrados: ${cursosPiano.length}\n`);

    if (cursosPiano.length > 0) {
      cursosPiano.forEach((curso, idx) => {
        console.log(`${idx + 1}. ${curso.name}`);
        console.log(`   ID: ${curso.id}`);
        console.log(`   Precio: $${curso.price.toLocaleString('es-CO')} COP`);
        console.log(`   Categoría: ${curso.category}`);
        console.log(`   Estado: ${curso.status}`);
        console.log(`   Descripción: ${curso.description?.substring(0, 100)}...`);
        console.log('');
      });
    }

    // Mostrar todos los productos
    console.log('='.repeat(70));
    console.log('\n📋 Lista completa de productos:\n');
    
    productos.forEach((p, idx) => {
      console.log(`${idx + 1}. ${p.name}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Precio: $${p.price.toLocaleString('es-CO')} COP`);
      console.log(`   Categoría: ${p.category}`);
      console.log(`   Estado: ${p.status}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarDuplicados();
