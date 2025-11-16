#!/usr/bin/env tsx
/**
 * 🛍️ Scraper de SmartJoys - Productos Dropshipping
 * Extrae productos de https://smartjoys.co/tienda/
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = path.join(process.cwd(), 'data', 'smartjoys-dropshipping.json');
const BASE_URL = 'https://smartjoys.co/tienda/';

interface Product {
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  category: string;
  url: string;
  sku?: string;
  inStock: boolean;
  tags: string[];
}

async function scrapeSmartJoys() {
  console.log('🛍️  Scrapeando productos de SmartJoys...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const products: Product[] = [];
  let pageNum = 1;
  let hasMore = true;

  while (hasMore && pageNum <= 10) { // Máximo 10 páginas
    console.log(`📄 Página ${pageNum}...`);

    try {
      const url = pageNum === 1 ? BASE_URL : `${BASE_URL}page/${pageNum}/`;
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Esperar a que carguen los productos (probar múltiples selectores)
      try {
        await page.waitForSelector('.product, .woocommerce-LoopProduct-link, article.product', { timeout: 10000 });
      } catch (error) {
        console.log('  ⚠️  No se encontraron productos con los selectores esperados');
        console.log('  🔍 Intentando detectar estructura de la página...');
        
        // Debug: ver qué hay en la página
        const bodyText = await page.evaluate(() => document.body.innerText);
        console.log('  📄 Contenido de la página:', bodyText.substring(0, 200));
        
        hasMore = false;
        continue;
      }

      // Extraer productos de la página (probar múltiples selectores)
      const pageProducts = await page.evaluate(() => {
        const productElements = document.querySelectorAll('.product, .woocommerce-LoopProduct-link, article.product, .product-item');
        const results: any[] = [];
        
        console.log('Productos encontrados:', productElements.length);

        productElements.forEach((el) => {
          try {
            // Nombre
            const nameEl = el.querySelector('.woocommerce-loop-product__title');
            const name = nameEl?.textContent?.trim() || '';

            // Precio
            const priceEl = el.querySelector('.price .woocommerce-Price-amount');
            const priceText = priceEl?.textContent?.replace(/[^\d]/g, '') || '0';
            const price = parseInt(priceText);

            // Precio original (si está en oferta)
            const originalPriceEl = el.querySelector('.price del .woocommerce-Price-amount');
            const originalPriceText = originalPriceEl?.textContent?.replace(/[^\d]/g, '');
            const originalPrice = originalPriceText ? parseInt(originalPriceText) : undefined;

            // Imagen
            const imgEl = el.querySelector('img');
            const image = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || '';

            // URL
            const linkEl = el.querySelector('a');
            const url = linkEl?.getAttribute('href') || '';

            // Categoría (desde clases)
            const classes = el.className;
            const categoryMatch = classes.match(/product_cat-([^\s]+)/);
            const category = categoryMatch ? categoryMatch[1].replace(/-/g, ' ') : 'general';

            // Stock
            const inStock = !el.classList.contains('outofstock');

            if (name && price > 0) {
              results.push({
                name,
                price,
                originalPrice,
                image,
                url,
                category,
                inStock
              });
            }
          } catch (error) {
            console.error('Error extrayendo producto:', error);
          }
        });

        return results;
      });

      console.log(`  ✅ ${pageProducts.length} productos encontrados`);

      // Procesar cada producto para obtener detalles
      for (const product of pageProducts) {
        try {
          // Ir a la página del producto
          await page.goto(product.url, { waitUntil: 'networkidle2', timeout: 30000 });

          // Extraer detalles
          const details = await page.evaluate(() => {
            // Descripción
            const descEl = document.querySelector('.woocommerce-product-details__short-description');
            const description = descEl?.textContent?.trim() || '';

            // Imágenes adicionales
            const imgElements = document.querySelectorAll('.woocommerce-product-gallery__image img');
            const images: string[] = [];
            imgElements.forEach(img => {
              const src = img.getAttribute('src') || img.getAttribute('data-src');
              if (src) images.push(src);
            });

            // SKU
            const skuEl = document.querySelector('.sku');
            const sku = skuEl?.textContent?.trim();

            // Tags/Categorías
            const tagElements = document.querySelectorAll('.tagged_as a');
            const tags: string[] = [];
            tagElements.forEach(tag => {
              const text = tag.textContent?.trim();
              if (text) tags.push(text);
            });

            return {
              description,
              images: images.length > 0 ? images : undefined,
              sku,
              tags: tags.length > 0 ? tags : undefined
            };
          });

          // Combinar datos
          products.push({
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            description: details.description || `${product.name} - Producto de calidad`,
            images: details.images || [product.image],
            category: product.category,
            url: product.url,
            sku: details.sku,
            inStock: product.inStock,
            tags: details.tags || [product.category]
          });

          console.log(`    ✓ ${product.name.substring(0, 50)}...`);

          // Pausa para no saturar
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`    ✗ Error en ${product.name}:`, error);
        }
      }

      // Verificar si hay más páginas
      const hasNextPage = await page.evaluate(() => {
        const nextLink = document.querySelector('.next.page-numbers');
        return nextLink !== null;
      });

      hasMore = hasNextPage;
      pageNum++;

      // Pausa entre páginas
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`Error en página ${pageNum}:`, error);
      hasMore = false;
    }
  }

  await browser.close();

  // Guardar resultados
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(products, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN');
  console.log('='.repeat(60));
  console.log(`✅ Total de productos: ${products.length}`);
  console.log(`📁 Archivo guardado: ${OUTPUT_FILE}`);
  console.log('='.repeat(60));

  // Estadísticas
  const byCategory = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📂 Por Categoría:');
  Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`  ${cat.padEnd(30)} ${count} productos`);
    });

  const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
  console.log(`\n💰 Precio promedio: $${avgPrice.toLocaleString('es-CO')} COP`);

  const inStock = products.filter(p => p.inStock).length;
  console.log(`📦 En stock: ${inStock}/${products.length} (${((inStock/products.length)*100).toFixed(1)}%)`);

  console.log('\n✅ Scraping completado!\n');
}

scrapeSmartJoys().catch(console.error);
