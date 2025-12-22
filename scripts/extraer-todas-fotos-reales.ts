import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Archivos JSON a procesar
const JSON_FILES = [
  'catalogo-completo-68-productos-ACTUALIZADO.json',
  'catalogo-completo-68-productos.json',
  'catalogo-completo-importar.json',
  'catalogo-completo-importar-fixed.json',
  'productos-listos-importar.json',
  'productos-megapacks-moto.json',
  'productos-digitales-actualizados.json'
];

interface ProductoJSON {
  name: string;
  images?: string[] | string;
  [key: string]: any;
}

async function extraerTodasFotosReales() {
  console.log('🔍 EXTRAYENDO FOTOS REALES DE TODOS LOS ARCHIVOS\n');
  
  const mapaFotos = new Map<string, string[]>();
  let archivosEncontrados = 0;
  let archivosNoEncontrados = 0;
  
  // Leer todos los archivos JSON
  for (const archivo of JSON_FILES) {
    const rutaArchivo = path.join(process.cwd(), archivo);
    
    if (!fs.existsSync(rutaArchivo)) {
      console.log(`⚠️  No encontrado: ${archivo}`);
      archivosNoEncontrados++;
      continue;
    }
    
    try {
      const contenido = fs.readFileSync(rutaArchivo, 'utf-8');
      const productos: ProductoJSON[] = JSON.parse(contenido);
      archivosEncontrados++;
      
      console.log(`📄 ${archivo}: ${productos.length} productos`);
      
      for (const producto of productos) {
        if (!producto.images) continue;
        
        // Normalizar imágenes (puede ser array o string)
        let imagenes: string[] = [];
        if (Array.isArray(producto.images)) {
          imagenes = producto.images;
        } else if (typeof producto.images === 'string') {
          try {
            imagenes = JSON.parse(producto.images);
          } catch {
            imagenes = [producto.images];
          }
        }
        
        // Filtrar solo fotos reales (no Unsplash)
        const fotosReales = imagenes.filter(img => 
          !img.includes('unsplash.com') &&
          !img.includes('TU-IMAGEN') &&
          img.trim().length > 0
        );
        
        if (fotosReales.length > 0) {
          // Usar nombre normalizado como clave
          const nombreNormalizado = producto.name.toLowerCase().substring(0, 50);
          mapaFotos.set(nombreNormalizado, fotosReales);
        }
      }
    } catch (error) {
      console.error(`❌ Error leyendo ${archivo}:`, error);
    }
  }
  
  console.log(`\n📊 Archivos procesados: ${archivosEncontrados}`);
  console.log(`📊 Productos con fotos reales encontrados: ${mapaFotos.size}\n`);
  
  // Actualizar productos en la base de datos
  const productosDB = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      images: true
    }
  });
  
  let actualizados = 0;
  let sinCambios = 0;
  let noEncontrados = 0;
  
  for (const productoDB of productosDB) {
    const nombreNormalizado = productoDB.name.toLowerCase().substring(0, 50);
    
    // Buscar coincidencia en el mapa
    let fotosReales: string[] | undefined;
    for (const [key, fotos] of mapaFotos.entries()) {
      if (nombreNormalizado.includes(key) || key.includes(nombreNormalizado.substring(0, 30))) {
        fotosReales = fotos;
        break;
      }
    }
    
    if (!fotosReales) {
      noEncontrados++;
      continue;
    }
    
    // Verificar si son diferentes
    const imagenesActuales = productoDB.images ? JSON.parse(productoDB.images) : [];
    
    // Si ya tiene fotos reales (no Unsplash), no cambiar
    const tieneUnsplash = imagenesActuales.some((img: string) => img.includes('unsplash.com'));
    
    if (!tieneUnsplash && imagenesActuales.length > 0) {
      sinCambios++;
      continue;
    }
    
    // Actualizar con fotos reales
    await prisma.product.update({
      where: { id: productoDB.id },
      data: { images: JSON.stringify(fotosReales) }
    });
    
    actualizados++;
    console.log(`✅ ${productoDB.name}`);
    console.log(`   ${fotosReales.join(', ')}`);
  }
  
  console.log('\n📊 RESUMEN FINAL:');
  console.log(`  ✅ Actualizados: ${actualizados}`);
  console.log(`  ➖ Sin cambios (ya tenían fotos reales): ${sinCambios}`);
  console.log(`  ⚠️  No encontrados en JSON: ${noEncontrados}`);
  console.log(`  📦 Total procesados: ${productosDB.length}`);
  
  await prisma.$disconnect();
}

extraerTodasFotosReales().catch(console.error);
