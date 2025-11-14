/**
 * Scraper mejorado para Disyvar usando Puppeteer
 * Maneja JavaScript y extrae productos correctamente
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

interface DisyvarProduct {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  url: string;
  sku?: string;
  brand?: string;
  stock?: string;
}

const BASE_URL = 'https://disyvar.com.co';
const OUTPUT_FILE = 'scripts/disyvar-productos.json';

function parsePrice(priceText: string): number {
  if (!priceText) return 0;
  const cleaned = priceText
    .replace(/[^\d.,]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const price = parseFloat(cleaned);
  return isNaN(price) ? 0 : Math.round(price);
}

function categorizeProduct(name: string, description: string): string {
  const text = (name + ' ' + description).toLowerCase();
  
  if (text.match(/laptop|portátil|notebook/i)) return 'Laptops';
  if (text.match(/impresora|printer/i)) return 'Impresoras';
  if (text.match(/cámara|camera/i)) return 'Cámaras';
  if (text.match(/ducha|baño/i)) return 'Hogar';
  if (text.match(/cuchillo|cocina/i)) return 'Cocina';
  if (text.match(/etiqueta|rollo/i)) return 'Suministros';
  
  return 'Tecnología';
}

async function scrapeWithPuppeteer() {
  console.log('🚀 Iniciando scraper con Puppeteer...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  const allProducts: DisyvarProduct[] = [];

  try {
    // Ir a la página principal
    console.log('📥 Cargando página principal...');
    await page.goto(`${BASE_URL}/productos/`, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Esperar a que carguen los productos
    await page.waitForSelector('.js-item-product, .product-item, [data-product-id]', {
      timeout: 10000
    }).catch(() => console.log('⚠️ No se encontró selector de productos'));

    // Scroll para cargar lazy loading
    await autoScroll(page);

    // Extraer productos
    const products = await page.evaluate(() => {
      const items: any[] = [];
      
      // Buscar productos en la página
      const productElements = document.querySelectorAll('.js-item-product, .product-item, [itemtype*="Product"]');
      
      productElements.forEach((el) => {
        try {
          // Nombre
          const nameEl = el.querySelector('.js-item-name, .product-name, [itemprop="name"]');
          const name = nameEl?.textContent?.trim() || '';
          
          if (!name || name.length < 3) return;

          // Precio
          const priceEl = el.querySelector('.js-price-display, .price, [itemprop="price"]');
          const priceText = priceEl?.textContent?.trim() || '';
          
          // Precio original
          const originalPriceEl = el.querySelector('.js-compare-price-display, .compare-price');
          const originalPriceText = originalPriceEl?.textContent?.trim() || '';

          // Imagen
          const imgEl = el.querySelector('img');
          const imageUrl = imgEl?.getAttribute('src') || 
                          imgEl?.getAttribute('data-src') || 
                          imgEl?.getAttribute('data-srcset')?.split(' ')[0] || '';

          // URL del producto
          const linkEl = el.querySelector('a');
          const productUrl = linkEl?.getAttribute('href') || '';

          // SKU
          const skuEl = el.querySelector('[data-sku], .sku');
          const sku = skuEl?.textContent?.trim() || skuEl?.getAttribute('data-sku') || '';

          // Stock
          const stockEl = el.querySelector('.js-stock-status, .stock-status');
          const stock = stockEl?.textContent?.trim() || '';

          items.push({
            name,
            priceText,
            originalPriceText,
            imageUrl,
            productUrl,
            sku,
            stock
          });
        } catch (error) {
          console.error('Error procesando elemento:', error);
        }
      });

      return items;
    });

    console.log(`✅ Encontrados ${products.length} productos en la página principal\n`);

    // Procesar cada producto
    for (const product of products) {
      if (!product.name || !product.priceText) continue;

      const price = parsePrice(product.priceText);
      if (price === 0) continue;

      const fullUrl = product.productUrl.startsWith('http') 
        ? product.productUrl 
        : `${BASE_URL}${product.productUrl}`;

      const imageUrl = product.imageUrl.startsWith('http')
        ? product.imageUrl
        : product.imageUrl.startsWith('//')
        ? `https:${product.imageUrl}`
        : `${BASE_URL}${product.imageUrl}`;

      allProducts.push({
        name: product.name,
        description: `${product.name} - Producto disponible en Disyvar`,
        price,
        originalPrice: product.originalPriceText ? parsePrice(product.originalPriceText) : undefined,
        category: categorizeProduct(product.name, ''),
        images: imageUrl ? [imageUrl] : [],
        url: fullUrl,
        sku: product.sku || undefined,
        stock: product.stock || undefined,
      });
    }

    // Enriquecer con detalles (primeros 20)
    console.log(`\n📝 Enriqueciendo productos con detalles...\n`);
    
    for (let i = 0; i < Math.min(allProducts.length, 20); i++) {
      const product = allProducts[i];
      
      if (!product.url || product.url === BASE_URL) continue;

      try {
        console.log(`[${i + 1}/20] ${product.name.slice(0, 50)}...`);
        
        await page.goto(product.url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

        const details = await page.evaluate(() => {
          // Descripción
          const descEl = document.querySelector('.js-product-description, .product-description, [itemprop="description"]');
          const description = descEl?.textContent?.trim().slice(0, 1000) || '';

          // Imágenes adicionales
          const images: string[] = [];
          document.querySelectorAll('.js-product-slide-img, .product-image img').forEach((img: any) => {
            const src = img.getAttribute('src') || img.getAttribute('data-src');
            if (src && !src.includes('placeholder') && !src.includes('data:image')) {
              images.push(src);
            }
          });

          // SKU
          const skuEl = document.querySelector('[data-sku], .sku');
          const sku = skuEl?.textContent?.trim() || '';

          // Marca
          const brandEl = document.querySelector('[itemprop="brand"], .brand');
          const brand = brandEl?.textContent?.trim() || '';

          return { description, images, sku, brand };
        });

        if (details.description) {
          product.description = details.description;
        }

        if (details.images.length > 0) {
          product.images = details.images.map(img => 
            img.startsWith('http') ? img : 
            img.startsWith('//') ? `https:${img}` :
            `${window.location.origin}${img}`
          );
        }

        if (details.sku) product.sku = details.sku;
        if (details.brand) product.brand = details.brand;

        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error: any) {
        console.log(`  ⚠️ Error: ${error.message}`);
      }
    }

  } catch (error: any) {
    console.error('❌ Error en scraping:', error.message);
  } finally {
    await browser.close();
  }

  return allProducts;
}

async function autoScroll(page: any) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function main() {
  console.log('🚀 Scraper Disyvar con Puppeteer\n');
  console.log('='.repeat(60) + '\n');

  const products = await scrapeWithPuppeteer();

  // Remover duplicados
  const uniqueProducts = Array.from(
    new Map(products.map(p => [p.name, p])).values()
  );

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Total de productos únicos: ${uniqueProducts.length}\n`);

  if (uniqueProducts.length === 0) {
    console.log('⚠️ No se encontraron productos');
    console.log('💡 Verifica que el sitio esté accesible');
    return;
  }

  // Guardar JSON
  const outputPath = path.join(process.cwd(), OUTPUT_FILE);
  fs.writeFileSync(outputPath, JSON.stringify(uniqueProducts, null, 2), 'utf-8');

  console.log(`💾 Productos guardados en: ${outputPath}`);

  // Estadísticas
  const categoryCounts: Record<string, number> = {};
  uniqueProducts.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  console.log('\n📈 Productos por categoría:');
  Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });

  console.log('\n✨ Scraping completado!');
  console.log('\n📝 Próximo paso:');
  console.log('   npx tsx scripts/import-disyvar.ts\n');
}

main().catch(console.error);
