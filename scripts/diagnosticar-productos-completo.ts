import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function diagnosticar() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DE PRODUCTOS Y FOTOS');
  console.log('='.repeat(70));

  // 1. Verificar productos en BD
  const productosEnBD = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      images: true,
      category: true,
      price: true,
    }
  });

  console.log('\n📊 PRODUCTOS EN LA BASE DE DATOS:');
  console.log(`Total: ${productosEnBD.length}`);
  
  const conFotos = productosEnBD.filter(p => {
    if (!p.images) return false;
    try {
      const arr = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
      return arr.length > 0;
    } catch {
      return false;
    }
  }).length;
  
  console.log(`Con fotos: ${conFotos}`);
  console.log(`Sin fotos: ${productosEnBD.length - conFotos}`);

  if (productosEnBD.length > 0) {
    console.log('\n📋 Listado de productos en BD:');
    productosEnBD.forEach((p, i) => {
      let imageArray: string[] = [];
      if (p.images) {
        try {
          imageArray = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
        } catch (e) {
          imageArray = [];
        }
      }
      const tieneFotos = imageArray.length > 0;
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   Categoría: ${p.category}`);
      console.log(`   Precio: $${p.price.toLocaleString()}`);
      console.log(`   Fotos: ${tieneFotos ? `✅ SÍ (${imageArray.length})` : '❌ NO'}`);
      if (tieneFotos) {
        console.log(`   URLs: ${imageArray.slice(0, 2).join(', ')}${imageArray.length > 2 ? '...' : ''}`);
      }
      console.log('');
    });
  }

  // 2. Verificar JSON
  const jsonPath = path.join(process.cwd(), 'productos-megacomputer-completo.json');
  
  if (fs.existsSync(jsonPath)) {
    const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    
    console.log('\n📄 PRODUCTOS EN EL JSON:');
    console.log(`Total: ${jsonContent.length}`);
    console.log(`Con fotos: ${jsonContent.filter((p: any) => p.images && p.images.length > 0).length}`);
    console.log(`Sin fotos: ${jsonContent.filter((p: any) => !p.images || p.images.length === 0).length}`);

    console.log('\n📋 Listado de productos en JSON:');
    jsonContent.forEach((p: any, i: number) => {
      console.log(`${i + 1}. ${p.name || p.title}`);
      console.log(`   Categoría: ${p.category}`);
      console.log(`   Precio: $${p.price?.toLocaleString() || 'N/A'}`);
      const fotos = p.images || [];
      console.log(`   Fotos: ${fotos.length > 0 ? `✅ SÍ (${fotos.length})` : '❌ NO'}`);
      if (fotos.length > 0) {
        console.log(`   URLs: ${fotos.slice(0, 2).join(', ')}${fotos.length > 2 ? '...' : ''}`);
      }
      console.log('');
    });

    // 3. Comparar
    console.log('\n🔄 COMPARACIÓN:');
    const nombresEnBD = new Set(productosEnBD.map(p => p.name.toLowerCase()));
    const nombresEnJSON = jsonContent.map((p: any) => (p.name || p.title).toLowerCase());
    
    const faltanEnBD = nombresEnJSON.filter((n: string) => !nombresEnBD.has(n));
    
    if (faltanEnBD.length > 0) {
      console.log(`\n⚠️  Productos en JSON que NO están en BD: ${faltanEnBD.length}`);
      faltanEnBD.forEach((nombre: string, i: number) => {
        console.log(`${i + 1}. ${nombre}`);
      });
    } else {
      console.log('✅ Todos los productos del JSON están en la BD');
    }

  } else {
    console.log('\n❌ No se encontró productos-megacomputer-completo.json');
  }

  await prisma.$disconnect();
}

diagnosticar().catch(console.error);
