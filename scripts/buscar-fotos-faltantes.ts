import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function buscarFotosFaltantes() {
  console.log('🔍 BUSCANDO PRODUCTOS SIN FOTOS REALES\n');
  
  // Obtener productos con fotos de Unsplash
  const productos = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      images: true,
      category: true
    }
  });
  
  const conUnsplash: any[] = [];
  const sinFotos: any[] = [];
  const conFotosReales: any[] = [];
  
  for (const producto of productos) {
    const imagenes = producto.images ? JSON.parse(producto.images) : [];
    
    if (imagenes.length === 0) {
      sinFotos.push(producto);
    } else if (imagenes.some((img: string) => img.includes('unsplash.com'))) {
      conUnsplash.push(producto);
    } else {
      conFotosReales.push(producto);
    }
  }
  
  console.log('📊 ESTADÍSTICAS:');
  console.log(`  ✅ Con fotos reales: ${conFotosReales.length}`);
  console.log(`  ⚠️  Con fotos Unsplash: ${conUnsplash.length}`);
  console.log(`  ❌ Sin fotos: ${sinFotos.length}`);
  console.log(`  📦 Total: ${productos.length}\n`);
  
  if (conUnsplash.length > 0) {
    console.log('⚠️  PRODUCTOS CON FOTOS UNSPLASH (NECESITAN FOTOS REALES):');
    conUnsplash.forEach(p => {
      console.log(`  - [${p.category}] ${p.name}`);
    });
  }
  
  if (sinFotos.length > 0) {
    console.log('\n❌ PRODUCTOS SIN FOTOS:');
    sinFotos.forEach(p => {
      console.log(`  - [${p.category}] ${p.name}`);
    });
  }
  
  console.log('\n📝 ARCHIVOS JSON DISPONIBLES:');
  const archivos = [
    'catalogo-completo-68-productos-ACTUALIZADO.json',
    'catalogo-completo-68-productos.json',
    'catalogo-completo-importar.json',
    'catalogo-completo-importar-fixed.json',
    'productos-listos-importar.json',
    'productos-digitales-actualizados.json'
  ];
  
  archivos.forEach(archivo => {
    const ruta = path.join(process.cwd(), archivo);
    if (fs.existsSync(ruta)) {
      const contenido = JSON.parse(fs.readFileSync(ruta, 'utf-8'));
      console.log(`  ✅ ${archivo}: ${contenido.length} productos`);
    } else {
      console.log(`  ❌ ${archivo}: No encontrado`);
    }
  });
  
  await prisma.$disconnect();
}

buscarFotosFaltantes().catch(console.error);
