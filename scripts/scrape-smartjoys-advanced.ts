// Script avanzado para scrapear SmartJoys con Puppeteer
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

interface Product {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  images: string[];
  url: string;
  sku?: string;
  inStock: boolean;
  features?: string[];
}

async function scrapeSmartJoys() {
  console.log('🚀 Iniciando scraping avanzado de SmartJoys...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  const products: Product[] = [];
  const baseUrl = 'https://smartjoys.co';

  try {
    // Ir a la página principal
    console.log('📥 Cargando página principal...');
    await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Esperar a que carguen los productos
    await page.waitForSelector('.product-item, .product-card, [class*="product"]', { timeout: 10000 });

    // Extraer productos de la página principal
    const mainProducts = await page.evaluate(() => {
      const items: any[] = [];
      
      // Intentar diferentes selectores comunes
      const selectors = [
        '.product-item',
        '.product-card',
        '.product',
        '[class*="product-"]',
        '.grid-item',
      ];

      let elements: NodeListOf<Element> | null = null;
      
      for (const selector of selectors) {
        elements = document.querySelectorAll(selector);
        if (elements.length > 0) break;
      }

      if (!elements || elements.length === 0) return items;

      elements.forEach((el) => {
        try {
          // Nombre
          const nameEl = el.querySelector('.product-title, .product-name, h2, h3, [class*="title"]');
          const name = nameEl?.textContent?.trim() || '';

          // Precio
          const priceEl = el.querySelector('.price, .product-price, [class*="price"]');
          const priceText = priceEl?.textContent?.trim() || '';
          
          // Imagen
          const imgEl = el.querySelector('img');
          const image = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || '';

          // URL
          const linkEl = el.querySelector('a');
          const url = linkEl?.getAttribute('href') || '';

          if (name && priceText) {
            items.push({
              name,
              priceText,
              image,
              url,
            });
          }
        } catch (error) {
          console.error('Error procesando elemento:', error);
        }
      });

      return items;
    });

    console.log(`✅ Encontrados ${mainProducts.length} productos en la página principal\n`);

    // Procesar cada producto
    for (let i = 0; i < Math.min(mainProducts.length, 50); i++) {
      const item = mainProducts[i];
      
      try {
        const productUrl = item.url.startsWith('http') 
          ? item.url 
          : `${baseUrl}${item.url}`;

        console.log(`📦 [${i + 1}/${mainProducts.length}] ${item.name}`);

        // Visitar página del producto para más detalles
        await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 15000 });

        const details = await page.evaluate(() => {
          // Descripción
          const descEl = document.querySelector('.product-description, .description, [class*="description"]');
          const description = descEl?.textContent?.trim() || '';

          // Precio actual
          const priceEl = document.querySelector('.price, .product-price, [class*="price"]:not([class*="compare"])');
          const priceText = priceEl?.textContent?.trim() || '';

          // Precio original (si hay descuento)
          const originalPriceEl = document.querySelector('.compare-price, .original-price, [class*="compare"]');
          const originalPriceText = originalPriceEl?.textContent?.trim() || '';

          // Imágenes
          const images: string[] = [];
          document.querySelectorAll('.product-images img, .gallery img, [class*="image"] img').forEach(img => {
            const src = img.getAttribute('src') || img.getAttribute('data-src');
            if (src && !images.includes(src)) {
              images.push(src);
            }
          });

          // SKU
          const skuEl = document.querySelector('.sku, [class*="sku"]');
          const sku = skuEl?.textContent?.trim() || '';

          // Stock
          const stockEl = document.querySelector('.stock, [class*="stock"], [class*="availability"]');
          const stockText = stockEl?.textContent?.toLowerCase() || '';
          const inStock = !stockText.includes('agotado') && !stockText.includes('out of stock');

          // Características
          const features: string[] = [];
          document.querySelectorAll('.product-features li, .features li, [class*="feature"]').forEach(li => {
            const text = li.textContent?.trim();
            if (text) features.push(text);
          });

          return {
            description,
            priceText,
            originalPriceText,
            images,
            sku,
            inStock,
            features,
          };
        });

        // Parsear precios
        const price = parsePrice(details.priceText);
        const originalPrice = details.originalPriceText ? parsePrice(details.originalPriceText) : undefined;
        const discount = originalPrice && price ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined;

        // Normalizar imágenes
        const images = details.images.map(img => 
          img.startsWith('http') ? img : `${baseUrl}${img}`
        );

        if (price > 0) {
          products.push({
            name: item.name,
            description: details.description || `Producto de tecnología: ${item.name}`,
            price,
            originalPrice,
            discount,
            category: 'PHYSICAL',
            images: images.length > 0 ? images : [item.image],
            url: productUrl,
            sku: details.sku,
            inStock: details.inStock,
            features: details.features.length > 0 ? details.features : undefined,
          });

          console.log(`   💰 $${price.toLocaleString()} ${discount ? `(${discount}% OFF)` : ''}`);
        }

        // Pequeña pausa entre productos
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`   ❌ Error: ${error}`);
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await browser.close();
  }

  // Guardar resultados
  const outputPath = path.join(process.cwd(), 'scripts', 'productos-dropshipping.json');
  fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));

  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN');
  console.log('='.repeat(50));
  console.log(`✅ Productos extraídos: ${products.length}`);
  console.log(`💾 Guardados en: ${outputPath}`);
  console.log('='.repeat(50) + '\n');

  console.log('🎉 Scraping completado!');
  console.log('\n💰 Margen configurado: +$20,000 por producto');
  console.log('\nPara importar con margen de ganancia:');
  console.log('npm run import:dropshipping');

  return products;
}

function parsePrice(priceText: string): number {
  const cleaned = priceText
    .replace(/[^\d.,]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  
  const price = parseFloat(cleaned);
  return isNaN(price) ? 0 : price;
}

// Ejecutar
scrapeSmartJoys().catch(console.error);
