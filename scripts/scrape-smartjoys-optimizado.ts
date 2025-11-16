#!/usr/bin/env tsx
/**
 * 🛍️ Scraper Optimizado de SmartJoys
 * Basado en la estructura real detectada
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
  inStock: boolean;
  tags: string[];
}

async function scrapeSmartJoys() {
  console.log('🛍️  Scrapeando productos de SmartJoys (Optimizado)...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const products: Product[] = [];
  let pageNum = 1;
  let hasMore = true;

  while (hasMore && pageNum <= 5) { // Máximo 5 páginas
    console.log(`📄 Página ${pageNum}...`);

    try {
      const url = pageNum === 1 ? BASE_URL : `${BASE_URL}page/${pageNum}/`;
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      // Esperar a que carguen los productos
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Extraer productos usando la estructura real de WooCommerce
      const pageProducts = await page.evaluate(() => {
        const results: any[] = [];

        // Buscar productos por diferentes selectores
        const productElements = document.querySelectorAll('.product, article[class*="product"]');

        productElements.forEach((el) => {
          try {
            // Nombre del producto
            const nameEl = el.querySelector('.woocommerce-loop-product__title, h3, .product-title');
            const name = nameEl?.textContent?.trim();

            // URL del producto
            const linkEl = el.querySelector('a[href*="/producto/"], a.woocommerce-LoopProduct-link');
            const url = linkEl?.getAttribute('href');

            // Precio original (el que está tachado)
            const originalPriceEl = el.querySelector('del .woocommerce-Price-amount bdi, del .woocommerce-Price-amount');
            const originalPriceText = originalPriceEl?.textContent?.replace(/[^\d]/g, '');
            const originalPrice = originalPriceText ? parseInt(originalPriceText) : undefined;

            // Precio actual (el precio de venta - rebajado si hay descuento)
            // Si hay precio original (tachado), buscar el precio de oferta (ins)
            let price = 0;
            if (originalPrice) {
              // Hay descuento, buscar precio en <ins>
              const salePriceEl = el.querySelector('ins .woocommerce-Price-amount bdi, ins .woocommerce-Price-amount');
              const salePriceText = salePriceEl?.textContent?.replace(/[^\d]/g, '');
              price = salePriceText ? parseInt(salePriceText) : 0;
            } else {
              // No hay descuento, usar precio normal
              const priceEl = el.querySelector('.woocommerce-Price-amount bdi, .woocommerce-Price-amount');
              const priceText = priceEl?.textContent?.replace(/[^\d]/g, '');
              price = priceText ? parseInt(priceText) : 0;
            }

            // Imagen
            const imgEl = el.querySelector('img');
            const image = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || '';

            // Categoría (desde clases o atributos)
            const classes = el.className;
            const categoryMatch = classes.match(/product_cat-([^\s]+)/);
            const category = categoryMatch ? categoryMatch[1].replace(/-/g, ' ') : 'general';

            // Stock
            const inStock = !el.classList.contains('outofstock') && !el.classList.contains('out-of-stock');

            if (name && price > 0 && url) {
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
            // Ignorar errores individuales
          }
        });

        return results;
      });

      console.log(`  ✅ ${pageProducts.length} productos encontrados`);

      if (pageProducts.length === 0) {
        hasMore = false;
        continue;
      }

      // Procesar todos los productos de la página
      const productsToProcess = pageProducts;

      for (const product of productsToProcess) {
        try {
          console.log(`    📦 ${product.name.substring(0, 40)}...`);

          // Ir a la página del producto
          await page.goto(product.url, { waitUntil: 'networkidle2', timeout: 30000 });
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Extraer detalles
          const details = await page.evaluate(() => {
            // Descripción
            const descEl = document.querySelector('.woocommerce-product-details__short-description, .product-short-description, .entry-summary p');
            const description = descEl?.textContent?.trim() || '';

            // Imágenes
            const imgElements = document.querySelectorAll('.woocommerce-product-gallery__image img, .product-images img');
            const images: string[] = [];
            imgElements.forEach(img => {
              const src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-large_image');
              if (src && !src.includes('placeholder')) {
                images.push(src);
              }
            });

            // Tags
            const tagElements = document.querySelectorAll('.tagged_as a, .product_meta a[rel="tag"]');
            const tags: string[] = [];
            tagElements.forEach(tag => {
              const text = tag.textContent?.trim();
              if (text) tags.push(text);
            });

            // Categorías
            const catElements = document.querySelectorAll('.posted_in a, .product_meta a[rel="tag"]');
            catElements.forEach(cat => {
              const text = cat.textContent?.trim();
              if (text && !tags.includes(text)) tags.push(text);
            });

            return {
              description,
              images: images.length > 0 ? images : undefined,
              tags: tags.length > 0 ? tags : undefined
            };
          });

          // Combinar datos
          products.push({
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            description: details.description || `${product.name} - Producto de calidad para dropshipping`,
            images: details.images || [product.image].filter(Boolean),
            category: product.category,
            url: product.url,
            inStock: product.inStock,
            tags: details.tags || [product.category]
          });

          console.log(`      ✓ Detalles extraídos`);

          // Pausa para no saturar
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`      ✗ Error: ${error}`);
          // Agregar producto básico sin detalles
          products.push({
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            description: `${product.name} - Producto de calidad`,
            images: [product.image].filter(Boolean),
            category: product.category,
            url: product.url,
            inStock: product.inStock,
            tags: [product.category]
          });
        }
      }

      // Verificar si hay más páginas
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      const hasNextPage = await page.evaluate(() => {
        const nextLink = document.querySelector('.next.page-numbers, a.next');
        return nextLink !== null;
      });

      hasMore = hasNextPage && pageProducts.length > 0;
      pageNum++;

      // Pausa entre páginas
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`❌ Error en página ${pageNum}:`, error);
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
  if (products.length > 0) {
    const byCategory = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📂 Por Categoría:');
    Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([cat, count]) => {
        console.log(`  ${cat.padEnd(30)} ${count} productos`);
      });

    const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
    console.log(`\n💰 Precio promedio: $${Math.round(avgPrice).toLocaleString('es-CO')} COP`);

    const inStock = products.filter(p => p.inStock).length;
    console.log(`📦 En stock: ${inStock}/${products.length} (${((inStock/products.length)*100).toFixed(1)}%)`);

    // Mostrar algunos ejemplos
    console.log('\n📝 Ejemplos de productos:');
    products.slice(0, 3).forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.name}`);
      console.log(`   Precio: $${p.price.toLocaleString('es-CO')}`);
      console.log(`   Categoría: ${p.category}`);
      console.log(`   URL: ${p.url}`);
    });
  }

  console.log('\n✅ Scraping completado!\n');
}

scrapeSmartJoys().catch(console.error);
