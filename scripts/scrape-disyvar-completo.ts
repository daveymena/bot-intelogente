/**
 * Scraper COMPLETO para Disyvar - Extrae TODO el catálogo
 * Navega por todas las páginas y categorías
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
  if (text.match(/silla|butaca/i)) return 'Muebles';
  if (text.match(/ducha|baño/i)) return 'Hogar';
  if (text.match(/cuchillo|cocina/i)) return 'Cocina';
  if (text.match(/etiqueta|rollo/i)) return 'Suministros';
  if (text.match(/maleta|bolso/i)) return 'Accesorios';
  if (text.match(/aspiradora|limpieza/i)) return 'Electrodomésticos';
  if (text.match(/cepillo|deslanador/i)) return 'Cuidado Personal';
  
  return 'Tecnología';
}

async function autoScroll(page: any) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 200;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 150);
    });
  });
}

async function extractProductsFromPage(page: any): Promise<any[]> {
  return await page.evaluate(() => {
    const items: any[] = [];
    
    const productElements = document.querySelectorAll('.js-item-product, .product-item, [itemtype*="Product"]');
    
    productElements.forEach((el: any) => {
      try {
        const nameEl = el.querySelector('.js-item-name, .product-name, [itemprop="name"]');
        const name = nameEl?.textContent?.trim() || '';
        
        if (!name || name.length < 3) return;

        const priceEl = el.querySelector('.js-price-display, .price, [itemprop="price"]');
        const priceText = priceEl?.textContent?.trim() || '';
        
        const originalPriceEl = el.querySelector('.js-compare-price-display, .compare-price');
        const originalPriceText = originalPriceEl?.textContent?.trim() || '';

        const imgEl = el.querySelector('img');
        const imageUrl = imgEl?.getAttribute('src') || 
                        imgEl?.getAttribute('data-src') || 
                        imgEl?.getAttribute('data-srcset')?.split(' ')[0] || '';

        const linkEl = el.querySelector('a');
        const productUrl = linkEl?.getAttribute('href') || '';

        const skuEl = el.querySelector('[data-sku], .sku');
        const sku = skuEl?.textContent?.trim() || skuEl?.getAttribute('data-sku') || '';

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
        // Ignorar errores individuales
      }
    });

    return items;
  });
}

async function main() {
  console.log('🚀 Scraper COMPLETO de Disyvar\n');
  console.log('='.repeat(60) + '\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  const allProducts: DisyvarProduct[] = [];
  const seenProducts = new Set<string>();

  try {
    // Página 1
    console.log('📥 Página 1: Cargando productos...');
    await page.goto(`${BASE_URL}/productos/`, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    await page.waitForSelector('.js-item-product, .product-item', {
      timeout: 10000
    }).catch(() => {});

    await autoScroll(page);
    await new Promise(resolve => setTimeout(resolve, 2000));

    let products = await extractProductsFromPage(page);
    console.log(`   ✅ Encontrados ${products.length} productos\n`);

    // Procesar productos de página 1
    for (const product of products) {
      if (!product.name || !product.priceText || seenProducts.has(product.name)) continue;

      const price = parsePrice(product.priceText);
      if (price === 0) continue;

      seenProducts.add(product.name);

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
        images: imageUrl && !imageUrl.includes('data:image') ? [imageUrl] : [],
        url: fullUrl,
        sku: product.sku || undefined,
        stock: product.stock || undefined,
      });
    }

    // Buscar más páginas
    console.log('🔍 Buscando más páginas...\n');
    
    let currentPage = 2;
    let hasMorePages = true;

    while (hasMorePages && currentPage <= 10) {
      try {
        const nextPageUrl = `${BASE_URL}/productos/?page=${currentPage}`;
        console.log(`📥 Página ${currentPage}: Cargando...`);
        
        await page.goto(nextPageUrl, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

        await autoScroll(page);
        await new Promise(resolve => setTimeout(resolve, 2000));

        products = await extractProductsFromPage(page);

        if (products.length === 0) {
          console.log(`   ⚠️ No hay más productos\n`);
          hasMorePages = false;
          break;
        }

        console.log(`   ✅ Encontrados ${products.length} productos\n`);

        let newProducts = 0;
        for (const product of products) {
          if (!product.name || !product.priceText || seenProducts.has(product.name)) continue;

          const price = parsePrice(product.priceText);
          if (price === 0) continue;

          seenProducts.add(product.name);
          newProducts++;

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
            images: imageUrl && !imageUrl.includes('data:image') ? [imageUrl] : [],
            url: fullUrl,
            sku: product.sku || undefined,
            stock: product.stock || undefined,
          });
        }

        if (newProducts === 0) {
          console.log(`   ⚠️ No hay productos nuevos, fin de páginas\n`);
          hasMorePages = false;
        }

        currentPage++;
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (error: any) {
        console.log(`   ❌ Error en página ${currentPage}: ${error.message}\n`);
        hasMorePages = false;
      }
    }

    // Enriquecer productos (primeros 30)
    console.log(`\n📝 Enriqueciendo ${Math.min(allProducts.length, 30)} productos con detalles...\n`);
    
    for (let i = 0; i < Math.min(allProducts.length, 30); i++) {
      const product = allProducts[i];
      
      if (!product.url || product.url === BASE_URL) continue;

      try {
        console.log(`[${i + 1}/${Math.min(allProducts.length, 30)}] ${product.name.slice(0, 50)}...`);
        
        await page.goto(product.url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

        const details = await page.evaluate(() => {
          const descEl = document.querySelector('.js-product-description, .product-description, [itemprop="description"]');
          const description = descEl?.textContent?.trim().slice(0, 1000) || '';

          const images: string[] = [];
          document.querySelectorAll('.js-product-slide-img, .product-image img').forEach((img: any) => {
            const src = img.getAttribute('src') || img.getAttribute('data-src');
            if (src && !src.includes('placeholder') && !src.includes('data:image')) {
              images.push(src);
            }
          });

          const skuEl = document.querySelector('[data-sku], .sku');
          const sku = skuEl?.textContent?.trim() || '';

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
            `${BASE_URL}${img}`
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

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Total de productos únicos: ${allProducts.length}\n`);

  if (allProducts.length === 0) {
    console.log('⚠️ No se encontraron productos');
    return;
  }

  // Guardar JSON
  const outputPath = path.join(process.cwd(), OUTPUT_FILE);
  fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2), 'utf-8');

  console.log(`💾 Productos guardados en: ${outputPath}`);

  // Estadísticas
  const categoryCounts: Record<string, number> = {};
  allProducts.forEach(p => {
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
