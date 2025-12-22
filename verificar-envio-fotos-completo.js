/**
 * VERIFICACIÓN COMPLETA DE ENVÍO DE FOTOS
 * Comprueba que las fotos se envíen correctamente y valida URLs
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const prisma = new PrismaClient();

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

/**
 * Verifica si una URL externa es accesible
 */
function verificarURLExterna(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, { timeout: 5000 }, (res) => {
      resolve({
        accesible: res.statusCode === 200,
        status: res.statusCode,
        contentType: res.headers['content-type'],
      });
    });

    req.on('error', () => {
      resolve({ accesible: false, error: 'No accesible' });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ accesible: false, error: 'Timeout' });
    });
  });
}

/**
 * Verifica si un archivo local existe
 */
function verificarArchivoLocal(rutaRelativa) {
  const rutaCompleta = path.join(process.cwd(), 'public', rutaRelativa);
  const existe = fs.existsSync(rutaCompleta);
  
  let info = { existe };
  
  if (existe) {
    const stats = fs.statSync(rutaCompleta);
    info.tamaño = stats.size;
    info.tamañoKB = (stats.size / 1024).toFixed(2);
    info.extension = path.extname(rutaCompleta);
  }
  
  return info;
}

/**
 * Analiza el formato de las imágenes de un producto
 */
function analizarImagenes(product) {
  if (!product.images) {
    return { tipo: 'sin_imagenes', imagenes: [] };
  }

  let imagenes = [];
  
  try {
    // Intentar parsear como JSON
    if (typeof product.images === 'string') {
      imagenes = JSON.parse(product.images);
    } else if (Array.isArray(product.images)) {
      imagenes = product.images;
    }
  } catch (e) {
    return { tipo: 'error_parse', error: e.message, imagenes: [] };
  }

  if (!Array.isArray(imagenes) || imagenes.length === 0) {
    return { tipo: 'array_vacio', imagenes: [] };
  }

  // Analizar cada imagen
  const analisis = imagenes.map(img => {
    if (!img || typeof img !== 'string') {
      return { url: img, tipo: 'invalida', valida: false };
    }

    if (img.startsWith('http://') || img.startsWith('https://')) {
      return { url: img, tipo: 'externa', valida: true };
    }

    if (img.startsWith('/fotos/') || img.startsWith('/')) {
      return { url: img, tipo: 'local', valida: true };
    }

    return { url: img, tipo: 'desconocida', valida: false };
  });

  return {
    tipo: 'ok',
    total: imagenes.length,
    imagenes: analisis,
    locales: analisis.filter(a => a.tipo === 'local').length,
    externas: analisis.filter(a => a.tipo === 'externa').length,
    invalidas: analisis.filter(a => !a.valida).length,
  };
}

/**
 * Verifica un producto completo
 */
async function verificarProducto(product, baseUrl) {
  const analisis = analizarImagenes(product);
  
  if (analisis.tipo !== 'ok') {
    return {
      id: product.id,
      nombre: product.name,
      estado: 'sin_fotos',
      analisis,
    };
  }

  // Verificar cada imagen
  const verificaciones = [];
  
  for (const img of analisis.imagenes) {
    if (!img.valida) {
      verificaciones.push({
        url: img.url,
        tipo: img.tipo,
        accesible: false,
        error: 'URL inválida',
      });
      continue;
    }

    if (img.tipo === 'local') {
      const info = verificarArchivoLocal(img.url);
      const urlCompleta = `${baseUrl}${img.url}`;
      
      verificaciones.push({
        url: img.url,
        urlCompleta,
        tipo: 'local',
        accesible: info.existe,
        tamaño: info.tamañoKB ? `${info.tamañoKB} KB` : null,
        extension: info.extension,
      });
    } else if (img.tipo === 'externa') {
      const resultado = await verificarURLExterna(img.url);
      
      verificaciones.push({
        url: img.url,
        tipo: 'externa',
        accesible: resultado.accesible,
        status: resultado.status,
        contentType: resultado.contentType,
        error: resultado.error,
      });
    }
  }

  const todasAccesibles = verificaciones.every(v => v.accesible);
  
  return {
    id: product.id,
    nombre: product.name,
    categoria: product.category,
    estado: todasAccesibles ? 'ok' : 'problemas',
    totalImagenes: analisis.total,
    imagenesLocales: analisis.locales,
    imagenesExternas: analisis.externas,
    imagenesInvalidas: analisis.invalidas,
    verificaciones,
  };
}

/**
 * Función principal
 */
async function verificarEnvioFotosCompleto() {
  console.log('\n');
  log(colors.cyan, '═══════════════════════════════════════════════════════════');
  log(colors.cyan, '  VERIFICACIÓN COMPLETA DE ENVÍO DE FOTOS');
  log(colors.cyan, '═══════════════════════════════════════════════════════════');
  console.log('\n');

  try {
    // 1. CONFIGURACIÓN
    log(colors.blue, '1️⃣  CONFIGURACIÓN DEL SISTEMA');
    console.log('─────────────────────────────────────────────────────────────');
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:4000';
    console.log(`   Base URL: ${baseUrl}`);
    
    const fotosPath = path.join(process.cwd(), 'public', 'fotos');
    const fotosExist = fs.existsSync(fotosPath);
    console.log(`   Carpeta fotos: ${fotosPath}`);
    console.log(`   Existe: ${fotosExist ? '✅' : '❌'}`);
    
    if (fotosExist) {
      const files = fs.readdirSync(fotosPath);
      const imageFiles = files.filter(f => 
        /\.(jpg|jpeg|png|webp|gif)$/i.test(f)
      );
      console.log(`   Archivos totales: ${files.length}`);
      console.log(`   Imágenes: ${imageFiles.length}`);
    }
    console.log('\n');

    // 2. OBTENER PRODUCTOS
    log(colors.blue, '2️⃣  ANALIZANDO PRODUCTOS EN BASE DE DATOS');
    console.log('─────────────────────────────────────────────────────────────');
    
    const products = await prisma.product.findMany({
      where: { status: 'AVAILABLE' },
      select: {
        id: true,
        name: true,
        category: true,
        images: true,
      },
      orderBy: { name: 'asc' },
    });

    console.log(`   Total productos activos: ${products.length}`);
    console.log('\n');

    // 3. VERIFICAR CADA PRODUCTO
    log(colors.blue, '3️⃣  VERIFICANDO IMÁGENES DE CADA PRODUCTO');
    console.log('─────────────────────────────────────────────────────────────');
    console.log('   (Esto puede tardar unos segundos...)\n');

    const resultados = [];
    let productosOK = 0;
    let productosConProblemas = 0;
    let productosSinFotos = 0;

    for (const product of products) {
      const resultado = await verificarProducto(product, baseUrl);
      resultados.push(resultado);

      if (resultado.estado === 'ok') {
        productosOK++;
      } else if (resultado.estado === 'problemas') {
        productosConProblemas++;
      } else {
        productosSinFotos++;
      }
    }

    // 4. MOSTRAR RESULTADOS DETALLADOS
    log(colors.blue, '4️⃣  RESULTADOS DETALLADOS');
    console.log('─────────────────────────────────────────────────────────────\n');

    // Productos OK
    if (productosOK > 0) {
      log(colors.green, `   ✅ PRODUCTOS CON FOTOS OK (${productosOK}):`);
      resultados
        .filter(r => r.estado === 'ok')
        .slice(0, 5)
        .forEach(r => {
          console.log(`      • ${r.nombre}`);
          console.log(`        ${r.totalImagenes} imagen(es) - Todas accesibles ✅`);
        });
      if (productosOK > 5) {
        console.log(`      ... y ${productosOK - 5} más\n`);
      } else {
        console.log('');
      }
    }

    // Productos con problemas
    if (productosConProblemas > 0) {
      log(colors.yellow, `   ⚠️  PRODUCTOS CON PROBLEMAS (${productosConProblemas}):`);
      resultados
        .filter(r => r.estado === 'problemas')
        .forEach(r => {
          console.log(`      • ${r.nombre}`);
          r.verificaciones.forEach(v => {
            if (!v.accesible) {
              console.log(`        ❌ ${v.url}`);
              if (v.error) console.log(`           Error: ${v.error}`);
              if (v.tipo === 'local') console.log(`           Archivo no existe en servidor`);
            }
          });
        });
      console.log('');
    }

    // Productos sin fotos
    if (productosSinFotos > 0) {
      log(colors.yellow, `   ℹ️  PRODUCTOS SIN FOTOS (${productosSinFotos}):`);
      resultados
        .filter(r => r.estado === 'sin_fotos')
        .slice(0, 10)
        .forEach(r => {
          console.log(`      • ${r.nombre}`);
        });
      if (productosSinFotos > 10) {
        console.log(`      ... y ${productosSinFotos - 10} más\n`);
      } else {
        console.log('');
      }
    }

    // 5. VERIFICACIÓN ESPECÍFICA: CURSO DE PIANO
    log(colors.blue, '5️⃣  VERIFICACIÓN ESPECÍFICA: CURSO DE PIANO');
    console.log('─────────────────────────────────────────────────────────────');
    
    const piano = resultados.find(r => 
      r.nombre.toLowerCase().includes('piano')
    );

    if (piano) {
      console.log(`   Producto: ${piano.nombre}`);
      console.log(`   Estado: ${piano.estado === 'ok' ? '✅ OK' : piano.estado === 'problemas' ? '⚠️ Problemas' : '❌ Sin fotos'}`);
      
      if (piano.verificaciones && piano.verificaciones.length > 0) {
        console.log(`   Imágenes:`);
        piano.verificaciones.forEach((v, i) => {
          console.log(`      ${i + 1}. ${v.accesible ? '✅' : '❌'} ${v.tipo === 'local' ? v.urlCompleta : v.url}`);
          if (v.tamaño) console.log(`         Tamaño: ${v.tamaño}`);
          if (!v.accesible && v.error) console.log(`         Error: ${v.error}`);
        });
      }
    } else {
      console.log(`   ❌ No se encontró curso de piano`);
    }
    console.log('\n');

    // 6. ESTADÍSTICAS GENERALES
    log(colors.blue, '6️⃣  ESTADÍSTICAS GENERALES');
    console.log('─────────────────────────────────────────────────────────────');
    
    const totalImagenes = resultados.reduce((sum, r) => sum + (r.totalImagenes || 0), 0);
    const imagenesLocales = resultados.reduce((sum, r) => sum + (r.imagenesLocales || 0), 0);
    const imagenesExternas = resultados.reduce((sum, r) => sum + (r.imagenesExternas || 0), 0);
    const imagenesInvalidas = resultados.reduce((sum, r) => sum + (r.imagenesInvalidas || 0), 0);

    console.log(`   Total productos: ${products.length}`);
    console.log(`   Con fotos OK: ${productosOK} (${((productosOK / products.length) * 100).toFixed(1)}%)`);
    console.log(`   Con problemas: ${productosConProblemas}`);
    console.log(`   Sin fotos: ${productosSinFotos}`);
    console.log('');
    console.log(`   Total imágenes: ${totalImagenes}`);
    console.log(`   Imágenes locales: ${imagenesLocales}`);
    console.log(`   Imágenes externas: ${imagenesExternas}`);
    console.log(`   Imágenes inválidas: ${imagenesInvalidas}`);
    console.log('\n');

    // 7. RECOMENDACIONES
    log(colors.blue, '7️⃣  RECOMENDACIONES');
    console.log('─────────────────────────────────────────────────────────────');
    
    if (productosConProblemas > 0) {
      log(colors.yellow, '   ⚠️  Hay productos con imágenes inaccesibles');
      console.log('      Revisa las URLs y asegúrate de que los archivos existan');
      console.log('');
    }

    if (productosSinFotos > 0) {
      log(colors.yellow, `   ℹ️  ${productosSinFotos} productos sin fotos`);
      console.log('      Considera agregar imágenes para mejorar la experiencia');
      console.log('');
    }

    if (productosOK === products.length) {
      log(colors.green, '   ✅ ¡PERFECTO! Todos los productos tienen fotos accesibles');
      console.log('      El sistema está listo para enviar fotos por WhatsApp');
      console.log('');
    }

    // 8. RESUMEN FINAL
    console.log('\n');
    log(colors.cyan, '═══════════════════════════════════════════════════════════');
    log(colors.cyan, '  RESUMEN FINAL');
    log(colors.cyan, '═══════════════════════════════════════════════════════════');
    console.log('');
    
    if (productosOK > 0) {
      log(colors.green, `   ✅ ${productosOK} productos listos para enviar fotos`);
    }
    
    if (productosConProblemas > 0) {
      log(colors.yellow, `   ⚠️  ${productosConProblemas} productos con problemas`);
    }
    
    if (productosSinFotos > 0) {
      log(colors.yellow, `   ℹ️  ${productosSinFotos} productos sin fotos`);
    }

    const porcentajeOK = ((productosOK / products.length) * 100).toFixed(1);
    console.log('');
    console.log(`   Tasa de éxito: ${porcentajeOK}%`);
    console.log('');
    
    if (parseFloat(porcentajeOK) >= 80) {
      log(colors.green, '   🎉 Sistema en buen estado para envío de fotos');
    } else if (parseFloat(porcentajeOK) >= 50) {
      log(colors.yellow, '   ⚠️  Sistema funcional pero con margen de mejora');
    } else {
      log(colors.red, '   ❌ Se requiere atención urgente');
    }
    
    console.log('\n');
    log(colors.cyan, '═══════════════════════════════════════════════════════════');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
verificarEnvioFotosCompleto();
