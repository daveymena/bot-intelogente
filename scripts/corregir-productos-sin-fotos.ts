/**
 * Corregir productos que se importaron sin fotos
 * Lee los archivos JSON originales y actualiza los productos en BD
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ProductoJSON {
  name?: string;
  nombre?: string;
  images?: string[] | string;
  imagenes?: string[] | string;
  [key: string]: any;
}

const RUTA_CATALOGOS = 'C:\\catalogos';

/**
 * Normalizar imágenes a array
 */
function normalizarImagenes(producto: ProductoJSON): string[] {
  const imagenes: string[] = [];
  
  // Buscar en diferentes campos
  const campos = [
    producto.images,
    producto.imagenes,
    producto.image,
    producto.imagen,
    producto.fotos,
    producto.photos,
  ];
  
  for (const campo of campos) {
    if (!campo) continue;
    
    if (Array.isArray(campo)) {
      imagenes.push(...campo.filter(img => typeof img === 'string'));
    } else if (typeof campo === 'string') {
      try {
        const parsed = JSON.parse(campo);
        if (Array.isArray(parsed)) {
          imagenes.push(...parsed);
        } else {
          imagenes.push(campo);
        }
      } catch {
        imagenes.push(campo);
      }
    }
  }
  
  return [...new Set(imagenes)].filter(img => img && img.length > 0);
}

/**
 * Normalizar nombre para búsqueda
 */
function normalizarNombre(nombre: string): string {
  return nombre
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Buscar producto en BD
 */
async function buscarProducto(nombre: string): Promise<any | null> {
  // Buscar exacto
  let producto = await prisma.product.findFirst({
    where: {
      name: {
        equals: nombre,
        mode: 'insensitive',
      },
    },
  });
  
  if (producto) return producto;
  
  // Buscar por similitud
  producto = await prisma.product.findFirst({
    where: {
      name: {
        contains: nombre.slice(0, 20),
        mode: 'insensitive',
      },
    },
  });
  
  return producto;
}

/**
 * Leer archivo JSON
 */
function leerJSON(rutaArchivo: string): ProductoJSON[] {
  try {
    const contenido = fs.readFileSync(rutaArchivo, 'utf-8');
    const datos = JSON.parse(contenido);
    
    if (Array.isArray(datos)) return datos;
    if (datos.productos || datos.products) return datos.productos || datos.products;
    return [datos];
  } catch (error) {
    console.error(`   ❌ Error leyendo ${path.basename(rutaArchivo)}`);
    return [];
  }
}

async function main() {
  console.log('🔧 CORRIGIENDO PRODUCTOS SIN FOTOS\n');
  console.log('='.repeat(60));
  
  // Verificar carpeta
  if (!fs.existsSync(RUTA_CATALOGOS)) {
    console.error(`❌ No existe la carpeta: ${RUTA_CATALOGOS}`);
    return;
  }
  
  // Buscar archivos JSON
  const archivos = fs.readdirSync(RUTA_CATALOGOS)
    .filter(archivo => archivo.endsWith('.json'))
    .map(archivo => path.join(RUTA_CATALOGOS, archivo));
  
  if (archivos.length === 0) {
    console.log('⚠️  No se encontraron archivos JSON');
    return;
  }
  
  console.log(`📚 Archivos encontrados: ${archivos.length}\n`);
  
  // Buscar productos sin fotos en BD
  const productosSinFotos = await prisma.product.findMany({
    where: {
      OR: [
        { images: { equals: '[]' } },
        { images: { equals: '' } },
        { images: null },
      ],
    },
  });
  
  console.log(`📦 Productos sin fotos en BD: ${productosSinFotos.length}\n`);
  
  if (productosSinFotos.length === 0) {
    console.log('✅ Todos los productos tienen fotos!');
    return;
  }
  
  let actualizados = 0;
  let noEncontrados = 0;
  
  // Procesar cada archivo
  for (const archivo of archivos) {
    console.log(`\n📄 Procesando: ${path.basename(archivo)}`);
    
    const productos = leerJSON(archivo);
    console.log(`   📦 Productos en archivo: ${productos.length}`);
    
    for (const productoJSON of productos) {
      const nombre = productoJSON.name || productoJSON.nombre;
      if (!nombre) continue;
      
      const imagenes = normalizarImagenes(productoJSON);
      if (imagenes.length === 0) continue;
      
      // Buscar en productos sin fotos
      const productoSinFoto = productosSinFotos.find(p => 
        normalizarNombre(p.name) === normalizarNombre(nombre) ||
        p.name.toLowerCase().includes(nombre.toLowerCase().slice(0, 20))
      );
      
      if (!productoSinFoto) continue;
      
      // Actualizar con fotos
      try {
        await prisma.product.update({
          where: { id: productoSinFoto.id },
          data: {
            images: JSON.stringify(imagenes),
          },
        });
        
        actualizados++;
        console.log(`   ✅ ${nombre.slice(0, 50)}... (+${imagenes.length} fotos)`);
      } catch (error) {
        console.error(`   ❌ Error actualizando: ${nombre.slice(0, 50)}...`);
      }
    }
  }
  
  // Resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN');
  console.log('='.repeat(60));
  console.log(`✅ Actualizados: ${actualizados}`);
  console.log(`⚠️  Sin fotos en archivos: ${productosSinFotos.length - actualizados}`);
  console.log(`📦 Total sin fotos: ${productosSinFotos.length}`);
  console.log('='.repeat(60) + '\n');
  
  if (actualizados > 0) {
    console.log('✨ Productos corregidos exitosamente!\n');
    console.log('📝 Próximos pasos:');
    console.log('   1. Verificar en dashboard: http://localhost:3000/dashboard');
    console.log('   2. Revisar que las fotos aparezcan correctamente');
    console.log('   3. Probar bot con productos actualizados\n');
  } else {
    console.log('⚠️  No se encontraron coincidencias entre archivos y BD\n');
    console.log('💡 Posibles razones:');
    console.log('   - Los nombres no coinciden exactamente');
    console.log('   - Los productos en archivos ya tienen fotos en BD');
    console.log('   - Los archivos no contienen los productos importados\n');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
