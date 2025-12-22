/**
 * Analizar catálogos en C:\catalogos y extraer fotos reales
 * - Lee archivos JSON/CSV en la carpeta
 * - Identifica fotos reales (no Unsplash)
 * - Actualiza base de datos con fotos reales
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ProductoCatalogo {
  nombre?: string;
  name?: string;
  descripcion?: string;
  description?: string;
  precio?: number;
  price?: number;
  imagenes?: string[];
  images?: string[];
  imagen?: string;
  image?: string;
  fotos?: string[];
  photos?: string[];
  categoria?: string;
  category?: string;
  [key: string]: any;
}

// Ruta de catálogos
const RUTA_CATALOGOS = 'C:\\catalogos';

/**
 * Verificar si una URL es de Unsplash o placeholder
 */
function esFotoReal(url: string): boolean {
  if (!url) return false;
  
  const urlLower = url.toLowerCase();
  
  // Rechazar Unsplash y placeholders
  if (urlLower.includes('unsplash.com')) return false;
  if (urlLower.includes('placeholder')) return false;
  if (urlLower.includes('via.placeholder')) return false;
  if (urlLower.includes('placehold')) return false;
  if (urlLower.includes('lorempixel')) return false;
  if (urlLower.includes('dummyimage')) return false;
  
  // Aceptar URLs reales de tiendas
  if (urlLower.includes('megacomputer')) return true;
  if (urlLower.includes('smartjoys')) return true;
  if (urlLower.includes('disyvar')) return true;
  if (urlLower.includes('dropi')) return true;
  if (urlLower.includes('cdn')) return true;
  if (urlLower.includes('cloudinary')) return true;
  if (urlLower.includes('shopify')) return true;
  if (urlLower.includes('woocommerce')) return true;
  
  // Si tiene extensión de imagen, probablemente es real
  if (urlLower.match(/\.(jpg|jpeg|png|webp|gif)$/)) return true;
  
  return false;
}

/**
 * Extraer imágenes de un producto
 */
function extraerImagenes(producto: ProductoCatalogo): string[] {
  const imagenes: string[] = [];
  
  // Buscar en diferentes campos posibles
  const camposPosibles = [
    producto.imagenes,
    producto.images,
    producto.fotos,
    producto.photos,
  ];
  
  for (const campo of camposPosibles) {
    if (Array.isArray(campo)) {
      imagenes.push(...campo);
    } else if (typeof campo === 'string') {
      try {
        const parsed = JSON.parse(campo);
        if (Array.isArray(parsed)) {
          imagenes.push(...parsed);
        }
      } catch {
        imagenes.push(campo);
      }
    }
  }
  
  // Campos individuales
  if (producto.imagen) imagenes.push(producto.imagen);
  if (producto.image) imagenes.push(producto.image);
  
  // Filtrar solo fotos reales
  return imagenes.filter(img => esFotoReal(img));
}

/**
 * Normalizar nombre de producto para búsqueda
 */
function normalizarNombre(nombre: string): string {
  return nombre
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Leer archivo JSON
 */
function leerJSON(rutaArchivo: string): ProductoCatalogo[] {
  try {
    const contenido = fs.readFileSync(rutaArchivo, 'utf-8');
    const datos = JSON.parse(contenido);
    
    // Si es un array, devolverlo
    if (Array.isArray(datos)) {
      return datos;
    }
    
    // Si es un objeto con productos
    if (datos.productos || datos.products) {
      return datos.productos || datos.products;
    }
    
    // Si es un solo producto
    return [datos];
  } catch (error) {
    console.error(`   ❌ Error leyendo ${path.basename(rutaArchivo)}:`, error);
    return [];
  }
}

/**
 * Leer archivo CSV
 */
function leerCSV(rutaArchivo: string): ProductoCatalogo[] {
  try {
    const contenido = fs.readFileSync(rutaArchivo, 'utf-8');
    const lineas = contenido.split('\n').filter(l => l.trim());
    
    if (lineas.length < 2) return [];
    
    // Primera línea son los headers
    const headers = lineas[0].split(',').map(h => h.trim());
    
    const productos: ProductoCatalogo[] = [];
    
    for (let i = 1; i < lineas.length; i++) {
      const valores = lineas[i].split(',');
      const producto: ProductoCatalogo = {};
      
      headers.forEach((header, idx) => {
        if (valores[idx]) {
          producto[header] = valores[idx].trim();
        }
      });
      
      productos.push(producto);
    }
    
    return productos;
  } catch (error) {
    console.error(`   ❌ Error leyendo ${path.basename(rutaArchivo)}:`, error);
    return [];
  }
}

/**
 * Analizar un archivo de catálogo
 */
function analizarArchivo(rutaArchivo: string): {
  archivo: string;
  totalProductos: number;
  productosConFotos: number;
  fotosReales: number;
  productos: ProductoCatalogo[];
} {
  const extension = path.extname(rutaArchivo).toLowerCase();
  const nombreArchivo = path.basename(rutaArchivo);
  
  console.log(`\n📄 Analizando: ${nombreArchivo}`);
  
  let productos: ProductoCatalogo[] = [];
  
  if (extension === '.json') {
    productos = leerJSON(rutaArchivo);
  } else if (extension === '.csv') {
    productos = leerCSV(rutaArchivo);
  } else {
    console.log('   ⚠️  Formato no soportado');
    return {
      archivo: nombreArchivo,
      totalProductos: 0,
      productosConFotos: 0,
      fotosReales: 0,
      productos: [],
    };
  }
  
  let productosConFotos = 0;
  let fotosReales = 0;
  
  productos.forEach(producto => {
    const imagenes = extraerImagenes(producto);
    if (imagenes.length > 0) {
      productosConFotos++;
      fotosReales += imagenes.length;
    }
  });
  
  console.log(`   📦 Total productos: ${productos.length}`);
  console.log(`   📸 Con fotos reales: ${productosConFotos}`);
  console.log(`   🖼️  Total fotos reales: ${fotosReales}`);
  
  return {
    archivo: nombreArchivo,
    totalProductos: productos.length,
    productosConFotos,
    fotosReales,
    productos,
  };
}

/**
 * Buscar producto en base de datos por nombre
 */
async function buscarProductoPorNombre(nombre: string): Promise<any | null> {
  const nombreNormalizado = normalizarNombre(nombre);
  
  // Buscar por nombre exacto
  let producto = await prisma.product.findFirst({
    where: {
      name: {
        contains: nombre,
        mode: 'insensitive',
      },
    },
  });
  
  if (producto) return producto;
  
  // Buscar por palabras clave
  const palabras = nombreNormalizado.split(' ').filter(p => p.length > 3);
  
  for (const palabra of palabras) {
    producto = await prisma.product.findFirst({
      where: {
        name: {
          contains: palabra,
          mode: 'insensitive',
        },
      },
    });
    
    if (producto) return producto;
  }
  
  return null;
}

/**
 * Actualizar producto con fotos reales
 */
async function actualizarProductoConFotos(
  productoId: string,
  fotosNuevas: string[]
): Promise<boolean> {
  try {
    // Obtener fotos actuales
    const producto = await prisma.product.findUnique({
      where: { id: productoId },
    });
    
    if (!producto) return false;
    
    const fotosActuales = producto.images ? JSON.parse(producto.images) : [];
    
    // Filtrar fotos actuales que NO sean de Unsplash
    const fotosRealesActuales = fotosActuales.filter((img: string) => esFotoReal(img));
    
    // Combinar con nuevas fotos (sin duplicados)
    const todasLasFotos = [...new Set([...fotosRealesActuales, ...fotosNuevas])];
    
    // Actualizar solo si hay cambios
    if (todasLasFotos.length > fotosRealesActuales.length) {
      await prisma.product.update({
        where: { id: productoId },
        data: {
          images: JSON.stringify(todasLasFotos),
        },
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('   ❌ Error actualizando producto:', error);
    return false;
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🔍 ANALIZANDO CATÁLOGOS LOCALES\n');
  console.log('='.repeat(60));
  console.log(`📁 Ruta: ${RUTA_CATALOGOS}\n`);
  
  // Verificar que existe la carpeta
  if (!fs.existsSync(RUTA_CATALOGOS)) {
    console.error(`❌ No existe la carpeta: ${RUTA_CATALOGOS}`);
    console.log('\n💡 Crea la carpeta y coloca tus archivos JSON/CSV ahí.');
    return;
  }
  
  // Leer archivos en la carpeta
  const archivos = fs.readdirSync(RUTA_CATALOGOS)
    .filter(archivo => {
      const ext = path.extname(archivo).toLowerCase();
      return ext === '.json' || ext === '.csv';
    })
    .map(archivo => path.join(RUTA_CATALOGOS, archivo));
  
  if (archivos.length === 0) {
    console.log('⚠️  No se encontraron archivos JSON o CSV en la carpeta.');
    console.log('\n💡 Coloca tus catálogos en formato JSON o CSV en:');
    console.log(`   ${RUTA_CATALOGOS}`);
    return;
  }
  
  console.log(`📚 Archivos encontrados: ${archivos.length}\n`);
  
  // Analizar cada archivo
  const resultados = archivos.map(archivo => analizarArchivo(archivo));
  
  // Resumen de análisis
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE ANÁLISIS');
  console.log('='.repeat(60));
  
  const totalProductos = resultados.reduce((sum, r) => sum + r.totalProductos, 0);
  const totalConFotos = resultados.reduce((sum, r) => sum + r.productosConFotos, 0);
  const totalFotos = resultados.reduce((sum, r) => sum + r.fotosReales, 0);
  
  console.log(`\n📦 Total productos en catálogos: ${totalProductos}`);
  console.log(`📸 Productos con fotos reales: ${totalConFotos}`);
  console.log(`🖼️  Total fotos reales: ${totalFotos}\n`);
  
  resultados.forEach(r => {
    console.log(`📄 ${r.archivo}`);
    console.log(`   Productos: ${r.totalProductos} | Con fotos: ${r.productosConFotos} | Fotos: ${r.fotosReales}`);
  });
  
  // Preguntar si actualizar base de datos
  console.log('\n' + '='.repeat(60));
  console.log('💾 ACTUALIZANDO BASE DE DATOS');
  console.log('='.repeat(60) + '\n');
  
  let actualizados = 0;
  let noEncontrados = 0;
  let sinCambios = 0;
  
  for (const resultado of resultados) {
    console.log(`\n📄 Procesando: ${resultado.archivo}`);
    
    for (const productoCatalogo of resultado.productos) {
      const nombre = productoCatalogo.nombre || productoCatalogo.name;
      if (!nombre) continue;
      
      const fotosReales = extraerImagenes(productoCatalogo);
      if (fotosReales.length === 0) continue;
      
      // Buscar en BD
      const productoBD = await buscarProductoPorNombre(nombre);
      
      if (!productoBD) {
        noEncontrados++;
        console.log(`   ⚠️  No encontrado: ${nombre.slice(0, 50)}...`);
        continue;
      }
      
      // Actualizar con fotos
      const actualizado = await actualizarProductoConFotos(productoBD.id, fotosReales);
      
      if (actualizado) {
        actualizados++;
        console.log(`   ✅ Actualizado: ${nombre.slice(0, 50)}... (+${fotosReales.length} fotos)`);
      } else {
        sinCambios++;
      }
    }
  }
  
  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN FINAL');
  console.log('='.repeat(60));
  console.log(`✅ Actualizados: ${actualizados}`);
  console.log(`⚠️  No encontrados en BD: ${noEncontrados}`);
  console.log(`⏭️  Sin cambios: ${sinCambios}`);
  console.log(`📦 Total procesados: ${totalConFotos}`);
  console.log('='.repeat(60) + '\n');
  
  console.log('✨ Proceso completado!\n');
  console.log('📝 Próximos pasos:');
  console.log('   1. Verificar productos en dashboard');
  console.log('   2. Revisar fotos actualizadas');
  console.log('   3. Probar bot con productos\n');
  
  console.log('🌐 Dashboard: http://localhost:3000/dashboard\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
