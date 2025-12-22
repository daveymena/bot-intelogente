import { db } from './src/lib/db';

async function verificarProductosSinFotos() {
  const productos = await db.product.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      images: true
    }
  });

  console.log('=== ANÁLISIS DE FOTOS EN PRODUCTOS ===\n');

  const sinFotos = productos.filter(p => {
    if (!p.images) return true;
    if (p.images === '[]') return true;
    if (p.images === 'null') return true;
    if (p.images === '') return true;
    
    try {
      const imgs = JSON.parse(p.images);
      return imgs.length === 0;
    } catch {
      return true;
    }
  });

  const conPocasFotos = productos.filter(p => {
    try {
      if (!p.images || p.images === '[]' || p.images === 'null') return false;
      const imgs = JSON.parse(p.images);
      return imgs.length > 0 && imgs.length < 2;
    } catch {
      return false;
    }
  });

  const conFotos = productos.filter(p => {
    try {
      if (!p.images || p.images === '[]' || p.images === 'null') return false;
      const imgs = JSON.parse(p.images);
      return imgs.length >= 2;
    } catch {
      return false;
    }
  });

  console.log(`📊 TOTAL PRODUCTOS: ${productos.length}\n`);
  console.log(`❌ SIN FOTOS: ${sinFotos.length}`);
  sinFotos.slice(0, 10).forEach(p => {
    console.log(`   - ${p.name.substring(0, 60)}...`);
  });

  console.log(`\n⚠️  CON POCAS FOTOS (1): ${conPocasFotos.length}`);
  conPocasFotos.slice(0, 10).forEach(p => {
    console.log(`   - ${p.name.substring(0, 60)}...`);
  });

  console.log(`\n✅ CON FOTOS (2+): ${conFotos.length}`);

  await db.$disconnect();
}

verificarProductosSinFotos();
