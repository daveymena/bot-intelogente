/**
 * Verificar productos: Piano vs Diseño Gráfico
 */

import { db } from '../src/lib/db';

async function verificarProductos() {
  console.log('🔍 Buscando productos relacionados...\n');

  const products = await db.product.findMany({
    where: {
      OR: [
        { name: { contains: 'Piano' } },
        { name: { contains: 'Diseño Gráfico' } },
        { name: { contains: 'Mega Pack 01' } }
      ]
    },
    select: {
      id: true,
      name: true,
      images: true,
      category: true,
      price: true
    }
  });

  console.log(`📦 Encontrados ${products.length} productos:\n`);

  for (const product of products) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📌 ID: ${product.id}`);
    console.log(`📝 Nombre: ${product.name}`);
    console.log(`💰 Precio: ${product.price}`);
    console.log(`📂 Categoría: ${product.category}`);
    console.log(`🖼️  Imágenes:`, product.images);
    console.log('');
  }

  // Verificar si hay duplicados
  const pianoProducts = products.filter(p => p.name.includes('Piano'));
  const disenoProducts = products.filter(p => p.name.includes('Diseño Gráfico'));

  if (pianoProducts.length > 1) {
    console.log('⚠️  ADVERTENCIA: Hay múltiples productos de Piano');
  }

  if (disenoProducts.length > 1) {
    console.log('⚠️  ADVERTENCIA: Hay múltiples productos de Diseño Gráfico');
  }

  // Verificar si las imágenes están cruzadas
  for (const product of products) {
    if (product.name.includes('Piano') && product.images) {
      const images = typeof product.images === 'string' 
        ? JSON.parse(product.images) 
        : product.images;
      
      if (images[0]?.includes('diseno') || images[0]?.includes('grafico')) {
        console.log('❌ ERROR: Producto de Piano tiene imagen de Diseño Gráfico');
        console.log(`   Producto: ${product.name}`);
        console.log(`   Imagen: ${images[0]}`);
      }
    }

    if (product.name.includes('Diseño Gráfico') && product.images) {
      const images = typeof product.images === 'string' 
        ? JSON.parse(product.images) 
        : product.images;
      
      if (images[0]?.includes('piano')) {
        console.log('❌ ERROR: Producto de Diseño Gráfico tiene imagen de Piano');
        console.log(`   Producto: ${product.name}`);
        console.log(`   Imagen: ${images[0]}`);
      }
    }
  }
}

verificarProductos()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
