/**
 * Script para extraer fotos de una URL específica
 * Útil cuando conoces exactamente la página del producto
 */

import puppeteer from 'puppeteer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function extraerFotosDeUrl(url: string): Promise<string[]> {
  console.log(`\n🔍 Extrayendo fotos de: ${url}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  try {
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Scroll para cargar imágenes lazy
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extraer todas las imágenes posibles
    const imagenes = await page.evaluate(() => {
      const imgs: string[] = [];
      
      // Selectores comunes para galerías de productos
      const selectors = [
        '.product-gallery img',
        '.product-image img',
        '.gallery img',
        '[class*="gallery"] img',
        '[class*="product"] img',
        '[class*="image"] img',
        '.js-product-slide-img img',
        '[data-zoom-image]',
        'img[itemprop="image"]'
      ];

      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach((img: any) => {
          const src = img.getAttribute('src') || 
                      img.getAttribute('data-src') ||
                      img.getAttribute('data-zoom-image') ||
                      img.getAttribute('data-srcset')?.split(' ')[0];
          
          if (src && 
              !src.includes('placeholder') && 
              !src.includes('data:image') &&
              !src.includes('logo') &&
              !src.includes('icon') &&
              src.length > 20) {
            imgs.push(src);
          }
        });
      });

      return [...new Set(imgs)];
    });

    await browser.close();

    // Normalizar URLs
    const baseUrl = new URL(url);
    const imagenesCompletas = imagenes.map(img => {
      if (img.startsWith('http')) return img;
      if (img.startsWith('//')) return `https:${img}`;
      return `${baseUrl.protocol}//${baseUrl.host}${img}`;
    });

    console.log(`✅ Encontradas ${imagenesCompletas.length} imágenes:\n`);
    imagenesCompletas.forEach((img, i) => {
      console.log(`   ${i + 1}. ${img}`);
    });

    return imagenesCompletas;

  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
    await browser.close();
    return [];
  }
}

async function actualizarProductoPorId(productId: string, imagenes: string[]) {
  try {
    const producto = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!producto) {
      console.log(`\n❌ Producto no encontrado: ${productId}`);
      return;
    }

    const imagenesActuales = producto.images ? JSON.parse(producto.images) : [];
    const todasLasImagenes = [...new Set([...imagenesActuales, ...imagenes])];

    await prisma.product.update({
      where: { id: productId },
      data: {
        images: JSON.stringify(todasLasImagenes)
      }
    });

    console.log(`\n✅ Producto actualizado: ${producto.name}`);
    console.log(`   Antes: ${imagenesActuales.length} imágenes`);
    console.log(`   Ahora: ${todasLasImagenes.length} imágenes`);

  } catch (error: any) {
    console.error(`❌ Error actualizando producto: ${error.message}`);
  }
}

async function main() {
  console.log('🖼️  Extractor de Fotos por URL Directa\n');
  console.log('='.repeat(60) + '\n');

  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('❌ Uso incorrecto\n');
    console.log('Opciones:\n');
    console.log('1. Solo extraer fotos:');
    console.log('   npx tsx scripts/extraer-fotos-url-directa.ts <URL>\n');
    console.log('2. Extraer y actualizar producto:');
    console.log('   npx tsx scripts/extraer-fotos-url-directa.ts <URL> <PRODUCT_ID>\n');
    console.log('Ejemplos:\n');
    console.log('   npx tsx scripts/extraer-fotos-url-directa.ts https://disyvar.com.co/producto/laptop-hp');
    console.log('   npx tsx scripts/extraer-fotos-url-directa.ts https://smartjoys.co/products/audifonos abc123\n');
    return;
  }

  const url = args[0];
  const productId = args[1];

  // Validar URL
  try {
    new URL(url);
  } catch {
    console.log('❌ URL inválida');
    return;
  }

  // Extraer fotos
  const imagenes = await extraerFotosDeUrl(url);

  if (imagenes.length === 0) {
    console.log('\n⚠️ No se encontraron imágenes');
    return;
  }

  // Si se proporcionó ID de producto, actualizar
  if (productId) {
    await actualizarProductoPorId(productId, imagenes);
  } else {
    console.log('\n💡 Para actualizar un producto, proporciona su ID:');
    console.log(`   npx tsx scripts/extraer-fotos-url-directa.ts ${url} <PRODUCT_ID>\n`);
  }

  console.log('\n✨ Proceso completado!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
