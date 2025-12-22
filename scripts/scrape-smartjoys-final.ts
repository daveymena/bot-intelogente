// Scraper optimizado para SmartJoys con margen de ganancia
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

interface Product {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  url: string;
  category: string;
  inStock: boolean;
}

async function scrapearSmartJoys() {
  console.log('🚀 Scrapeando SmartJoys con Puppeteer...\n');

  const browser = await puppeteer.launch({
    headless: false, // Ver qué está pasando
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  const productos: Product[] = [];
  const baseUrl = 'https://smartjoys.co';

  try {
    console.log('📥 Cargando página principal...');
    await page.goto(baseUrl, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    });

    // Esperar un poco para que cargue todo
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Tomar screenshot para debug
    await page.screenshot({ path: 'smartjoys-debug.png' });
    console.log('📸 Screenshot guardado: smartjoys-debug.png');

    // Intentar encontrar productos con diferentes selectores
    console.log('\n🔍 Buscando productos en la página...');
    
    const productosEncontrados = await page.evaluate(() => {
      const items: any[] = [];
      
      // Lista de posibles selectores
      const selectores = [
        'div[class*="product"]',
        'article[class*="product"]',
        'li[class*="product"]',
        '.product',
        '[data-product]',
        'a[href*="/products/"]',
      ];

      let elementos: NodeListOf<Element> | null = null;

      // Probar cada selector
      for (const selector of selectores) {
        elementos = document.querySelectorAll(selector);
        if (elementos.length > 0) {
          console.log(`✅ Encontrados ${elementos.length} elementos con: ${selector}`);
          break;
        }
      }

      if (!elementos || elementos.length === 0) {
        // Si no encuentra nada, buscar todos los links a productos
        elementos = document.querySelectorAll('a[href*="/products/"]');
      }

      elementos.forEach((el) => {
        try {
          // Intentar extraer información
          const link = el.getAttribute('href') || 
                      el.querySelector('a')?.getAttribute('href') || '';
          
          const nombre = el.textContent?.trim() || 
                        el.querySelector('h2, h3, h4, .title, [class*="title"]')?.textContent?.trim() || '';

          // Buscar precio en el elemento o sus hijos
          const precioEl = el.querySelector('[class*="price"]') || 
                          el.querySelector('[data-price]');
          const precio = precioEl?.textContent?.trim() || '';

          // Buscar imagen
          const img = el.querySelector('img');
          const imagen = img?.getAttribute('src') || 
                        img?.getAttribute('data-src') || '';

          if (link && nombre) {
            items.push({
              name: nombre,
              priceText: precio,
              image: imagen,
              url: link,
            });
          }
        } catch (error) {
          // Ignorar errores individuales
        }
      });

      return items;
    });

    console.log(`\n✅ Encontrados ${productosEncontrados.length} productos\n`);

    // Procesar productos encontrados
    for (let i = 0; i < Math.min(productosEncontrados.length, 30); i++) {
      const item = productosEncontrados[i];
      
      try {
        const productUrl = item.url.startsWith('http') 
          ? item.url 
          : `${baseUrl}${item.url}`;

        console.log(`📦 [${i + 1}/${productosEncontrados.length}] Visitando producto...`);

        // Visitar página del producto
        await page.goto(productUrl, { 
          waitUntil: 'networkidle0',
          timeout: 30000 
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Extraer detalles del producto
        const detalles = await page.evaluate(() => {
          // Nombre
          const nombreEl = document.querySelector('h1, .product-title, [class*="product-title"]');
          const name = nombreEl?.textContent?.trim() || '';

          // Descripción
          const descEl = document.querySelector('.product-description, [class*="description"]');
          const description = descEl?.textContent?.trim().slice(0, 300) || '';

          // Precio
          const precioEl = document.querySelector('[class*="price"]:not([class*="compare"])');
          const priceText = precioEl?.textContent?.trim() || '';

          // Precio original
          const precioOriginalEl = document.querySelector('[class*="compare"], [class*="original"]');
          const originalPriceText = precioOriginalEl?.textContent?.trim() || '';

          // Imágenes
          const images: string[] = [];
          document.querySelectorAll('img[src*="product"], img[src*="cdn"]').forEach(img => {
            const src = img.getAttribute('src');
            if (src && !images.includes(src)) {
              images.push(src);
            }
          });

          return {
            name,
            description,
            priceText,
            originalPriceText,
            images,
          };
        });

        const price = parsePrice(detalles.priceText);
        const originalPrice = detalles.originalPriceText ? parsePrice(detalles.originalPriceText) : undefined;
        const discount = originalPrice && price ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined;

        if (price > 0 && detalles.name) {
          const imageUrl = detalles.images[0]?.startsWith('http')
            ? detalles.images[0]
            : detalles.images[0]?.startsWith('//')
            ? `https:${detalles.images[0]}`
            : `${baseUrl}${detalles.images[0]}`;

          productos.push({
            name: detalles.name,
            description: detalles.description || `Producto de tecnología: ${detalles.name}`,
            price,
            originalPrice,
            discount,
            images: [imageUrl],
            url: productUrl,
            category: 'PHYSICAL',
            inStock: true,
          });

          console.log(`   ✅ ${detalles.name}`);
          console.log(`   💰 $${price.toLocaleString()}`);
        }

        // Pausa entre productos
        await new Promise(resolve => setTimeout(resolve, 1500));

      } catch (error) {
        console.error(`   ❌ Error: ${error}`);
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await browser.close();
  }

  return productos;
}

function parsePrice(priceText: string): number {
  const cleaned = priceText
    .replace(/[^\d.,]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  
  const price = parseFloat(cleaned);
  return isNaN(price) ? 0 : price;
}

async function main() {
  const productos = await scrapearSmartJoys();

  // Remover duplicados
  const productosUnicos = Array.from(
    new Map(productos.map(p => [p.name, p])).values()
  );

  // Guardar resultados
  const outputPath = path.join(process.cwd(), 'scripts', 'productos-dropshipping.json');
  fs.writeFileSync(outputPath, JSON.stringify(productosUnicos, null, 2));

  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN');
  console.log('='.repeat(50));
  console.log(`✅ Productos extraídos: ${productosUnicos.length}`);
  console.log(`💾 Guardados en: ${outputPath}`);
  console.log('='.repeat(50) + '\n');

  console.log('🎉 Scraping completado!');
  console.log('\nPara importar con margen de $20,000:');
  console.log('npm run import:dropshipping');
}

main().catch(console.error);
