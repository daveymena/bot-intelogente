/**
 * Script para actualizar las fotos de productos desde las tiendas originales
 * Extrae imágenes de Disyvar, SmartJoys, MegaComputer y otras fuentes
 */

import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';
import axios from 'axios';

const prisma = new PrismaClient();

interface ProductoConFotos {
  id: string;
  name: string;
  url?: string;
  images: string[];
  nuevasImagenes: string[];
}

// Detectar la tienda origen del producto
function detectarTienda(producto: any): string | null {
  const name = producto.name?.toLowerCase() || '';
  const desc = producto.description?.toLowerCase() || '';
  const tags = producto.tags ? JSON.parse(producto.tags) : [];
  
  // Buscar en tags
  if (tags.includes('disyvar')) return 'disyvar';
  if (tags.includes('smartjoys')) return 'smartjoys';
  if (tags.includes('megacomputer')) return 'megacomputer';
  if (tags.includes('dropi')) return 'dropi';
  
  // Buscar en descripción o nombre
  if (desc.includes('disyvar') || name.includes('disyvar')) return 'disyvar';
  if (desc.includes('smartjoys') || name.includes('smartjoys')) return 'smartjoys';
  if (desc.includes('megacomputer') || name.includes('megacomputer')) return 'megacomputer';
  
  return null;
}

// Buscar producto en Disyvar y extraer fotos
async function buscarEnDisyvar(nombreProducto: string, page: any): Promise<string[]> {
  try {
    const searchUrl = `https://disyvar.com.co/buscar?q=${encodeURIComponent(nombreProducto)}`;
    console.log(`   🔍 Buscando en Disyvar: ${searchUrl}`);
    
    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForSelector('.js-item-product, .product-item', {
      timeout: 5000
    }).catch(() => {});

    // Obtener el primer resultado
    const primerProducto = await page.evaluate(() => {
      const item = document.querySelector('.js-item-product, .product-item');
      if (!item) return null;
      
      const link = item.querySelector('a');
      return link?.getAttribute('href') || null;
    });

    if (!primerProducto) {
      console.log('   ⚠️ No se encontró en Disyvar');
      return [];
    }

    const productUrl = primerProducto.startsWith('http') 
      ? primerProducto 
      : `https://disyvar.com.co${primerProducto}`;

    console.log(`   📸 Extrayendo fotos de: ${productUrl}`);
    
    await page.goto(productUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const imagenes = await page.evaluate(() => {
      const imgs: string[] = [];
      
      // Buscar en galería de producto
      document.querySelectorAll('.js-product-slide-img img, .product-image img, [class*="gallery"] img').forEach((img: any) => {
        const src = img.getAttribute('src') || 
                    img.getAttribute('data-src') || 
                    img.getAttribute('data-srcset')?.split(' ')[0];
        
        if (src && !src.includes('placeholder') && !src.includes('data:image')) {
          imgs.push(src);
        }
      });

      return imgs;
    });

    const imagenesCompletas = imagenes.map(img => 
      img.startsWith('http') ? img : 
      img.startsWith('//') ? `https:${img}` :
      `https://disyvar.com.co${img}`
    );

    console.log(`   ✅ Encontradas ${imagenesCompletas.length} imágenes`);
    return imagenesCompletas;

  } catch (error: any) {
    console.log(`   ❌ Error en Disyvar: ${error.message}`);
    return [];
  }
}

// Buscar producto en SmartJoys y extraer fotos
async function buscarEnSmartJoys(nombreProducto: string, page: any): Promise<string[]> {
  try {
    const searchUrl = `https://smartjoys.co/search?q=${encodeURIComponent(nombreProducto)}`;
    console.log(`   🔍 Buscando en SmartJoys: ${searchUrl}`);
    
    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForSelector('.product-item, .product-card', {
      timeout: 5000
    }).catch(() => {});

    const primerProducto = await page.evaluate(() => {
      const item = document.querySelector('.product-item, .product-card');
      if (!item) return null;
      
      const link = item.querySelector('a');
      return link?.getAttribute('href') || null;
    });

    if (!primerProducto) {
      console.log('   ⚠️ No se encontró en SmartJoys');
      return [];
    }

    const productUrl = primerProducto.startsWith('http') 
      ? primerProducto 
      : `https://smartjoys.co${primerProducto}`;

    console.log(`   📸 Extrayendo fotos de: ${productUrl}`);
    
    await page.goto(productUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const imagenes = await page.evaluate(() => {
      const imgs: string[] = [];
      
      document.querySelectorAll('.product-images img, .gallery img, [class*="image"] img').forEach((img: any) => {
        const src = img.getAttribute('src') || img.getAttribute('data-src');
        
        if (src && !src.includes('placeholder') && !src.includes('data:image')) {
          imgs.push(src);
        }
      });

      return imgs;
    });

    const imagenesCompletas = imagenes.map(img => 
      img.startsWith('http') ? img : 
      img.startsWith('//') ? `https:${img}` :
      `https://smartjoys.co${img}`
    );

    console.log(`   ✅ Encontradas ${imagenesCompletas.length} imágenes`);
    return imagenesCompletas;

  } catch (error: any) {
    console.log(`   ❌ Error en SmartJoys: ${error.message}`);
    return [];
  }
}

// Buscar producto en MegaComputer y extraer fotos
async function buscarEnMegaComputer(nombreProducto: string, page: any): Promise<string[]> {
  try {
    const searchUrl = `https://megacomputer.com.co/buscar?q=${encodeURIComponent(nombreProducto)}`;
    console.log(`   🔍 Buscando en MegaComputer: ${searchUrl}`);
    
    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForSelector('.product-item, .product', {
      timeout: 5000
    }).catch(() => {});

    const primerProducto = await page.evaluate(() => {
      const item = document.querySelector('.product-item, .product');
      if (!item) return null;
      
      const link = item.querySelector('a');
      return link?.getAttribute('href') || null;
    });

    if (!primerProducto) {
      console.log('   ⚠️ No se encontró en MegaComputer');
      return [];
    }

    const productUrl = primerProducto.startsWith('http') 
      ? primerProducto 
      : `https://megacomputer.com.co${primerProducto}`;

    console.log(`   📸 Extrayendo fotos de: ${productUrl}`);
    
    await page.goto(productUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const imagenes = await page.evaluate(() => {
      const imgs: string[] = [];
      
      document.querySelectorAll('.product-gallery img, .product-image img, img[class*="product"]').forEach((img: any) => {
        const src = img.getAttribute('src') || img.getAttribute('data-src');
        
        if (src && !src.includes('placeholder') && !src.includes('data:image')) {
          imgs.push(src);
        }
      });

      return imgs;
    });

    const imagenesCompletas = imagenes.map(img => 
      img.startsWith('http') ? img : 
      img.startsWith('//') ? `https:${img}` :
      `https://megacomputer.com.co${img}`
    );

    console.log(`   ✅ Encontradas ${imagenesCompletas.length} imágenes`);
    return imagenesCompletas;

  } catch (error: any) {
    console.log(`   ❌ Error en MegaComputer: ${error.message}`);
    return [];
  }
}

// Función principal para actualizar fotos
async function actualizarFotosProducto(producto: any, page: any): Promise<string[]> {
  const tienda = detectarTienda(producto);
  
  if (!tienda) {
    console.log(`   ⚠️ No se pudo detectar la tienda origen`);
    return [];
  }

  console.log(`   🏪 Tienda detectada: ${tienda.toUpperCase()}`);

  let nuevasImagenes: string[] = [];

  switch (tienda) {
    case 'disyvar':
      nuevasImagenes = await buscarEnDisyvar(producto.name, page);
      break;
    case 'smartjoys':
      nuevasImagenes = await buscarEnSmartJoys(producto.name, page);
      break;
    case 'megacomputer':
      nuevasImagenes = await buscarEnMegaComputer(producto.name, page);
      break;
    default:
      console.log(`   ⚠️ Tienda no soportada: ${tienda}`);
  }

  return nuevasImagenes;
}

async function main() {
  console.log('🚀 Actualizador de Fotos de Productos\n');
  console.log('='.repeat(60) + '\n');

  // Obtener productos sin fotos o con pocas fotos
  const productos = await prisma.product.findMany({
    where: {
      OR: [
        { images: { equals: '[]' } },
        { images: { equals: '' } },
        { images: null },
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`📦 Productos sin fotos: ${productos.length}\n`);

  if (productos.length === 0) {
    console.log('✅ Todos los productos tienen fotos!');
    return;
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  let actualizados = 0;
  let sinCambios = 0;
  let errores = 0;

  for (let i = 0; i < productos.length; i++) {
    const producto = productos[i];
    
    console.log(`\n[${i + 1}/${productos.length}] ${producto.name}`);
    console.log('-'.repeat(60));

    try {
      const nuevasImagenes = await actualizarFotosProducto(producto, page);

      if (nuevasImagenes.length > 0) {
        // Actualizar producto con nuevas imágenes
        await prisma.product.update({
          where: { id: producto.id },
          data: {
            images: JSON.stringify(nuevasImagenes)
          }
        });

        console.log(`   ✅ Actualizado con ${nuevasImagenes.length} imágenes`);
        actualizados++;
      } else {
        console.log(`   ⚠️ No se encontraron imágenes`);
        sinCambios++;
      }

      // Pausa entre productos
      await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
      errores++;
    }
  }

  await browser.close();

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RESUMEN:');
  console.log(`   ✅ Actualizados: ${actualizados}`);
  console.log(`   ⚠️  Sin cambios: ${sinCambios}`);
  console.log(`   ❌ Errores: ${errores}`);
  console.log('\n✨ Proceso completado!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
