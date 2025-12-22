// Scraper universal para tiendas de dropshipping
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

// Configuración de tiendas
const TIENDAS = {
  smartjoys: {
    url: 'https://smartjoys.co',
    nombre: 'SmartJoys',
    categorias: [
      '/collections/all',
      '/collections/audifonos',
      '/collections/smartwatch',
      '/collections/parlantes',
      '/collections/accesorios',
    ],
    selectores: {
      producto: '.product-item, .product-card, .grid-item',
      nombre: '.product-title, .product-name, h3',
      precio: '.price, .product-price',
      precioOriginal: '.compare-price, .original-price',
      imagen: 'img',
      link: 'a',
    }
  },
  // Puedes agregar más tiendas aquí
  // ejemplo: {
  //   url: 'https://otra-tienda.com',
  //   ...
  // }
};

async function scrapearTienda(tiendaKey: keyof typeof TIENDAS) {
  const tienda = TIENDAS[tiendaKey];
  console.log(`🚀 Scrapeando: ${tienda.nombre}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  const productos: Product[] = [];

  try {
    for (const categoria of tienda.categorias) {
      const url = `${tienda.url}${categoria}`;
      console.log(`📥 Cargando: ${url}`);

      try {
        await page.goto(url, { 
          waitUntil: 'networkidle2', 
          timeout: 30000 
        });

        // Esperar a que carguen los productos
        await page.waitForSelector(tienda.selectores.producto, { timeout: 10000 });

        // Scroll para cargar productos lazy-load
        await autoScroll(page);

        // Extraer productos
        const productosCategoria = await page.evaluate((selectores) => {
          const items: any[] = [];
          const elementos = document.querySelectorAll(selectores.producto);

          elementos.forEach((el) => {
            try {
              // Nombre
              const nombreEl = el.querySelector(selectores.nombre);
              const name = nombreEl?.textContent?.trim() || '';

              // Precio
              const precioEl = el.querySelector(selectores.precio);
              const priceText = precioEl?.textContent?.trim() || '';

              // Precio original
              const precioOriginalEl = el.querySelector(selectores.precioOriginal);
              const originalPriceText = precioOriginalEl?.textContent?.trim() || '';

              // Imagen
              const imgEl = el.querySelector(selectores.imagen);
              const image = imgEl?.getAttribute('src') || 
                           imgEl?.getAttribute('data-src') || 
                           imgEl?.getAttribute('data-srcset')?.split(' ')[0] || '';

              // Link
              const linkEl = el.querySelector(selectores.link);
              const url = linkEl?.getAttribute('href') || '';

              if (name && priceText) {
                items.push({
                  name,
                  priceText,
                  originalPriceText,
                  image,
                  url,
                });
              }
            } catch (error) {
              console.error('Error procesando elemento:', error);
            }
          });

          return items;
        }, tienda.selectores);

        console.log(`   ✅ Encontrados ${productosCategoria.length} productos`);

        // Procesar cada producto
        for (const item of productosCategoria) {
          const price = parsePrice(item.priceText);
          const originalPrice = item.originalPriceText ? parsePrice(item.originalPriceText) : undefined;
          const discount = originalPrice && price ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined;

          const productUrl = item.url.startsWith('http') 
            ? item.url 
            : `${tienda.url}${item.url}`;

          const imageUrl = item.image.startsWith('http')
            ? item.image
            : item.image.startsWith('//')
            ? `https:${item.image}`
            : `${tienda.url}${item.image}`;

          if (price > 0) {
            productos.push({
              name: item.name,
              description: `Producto de tecnología: ${item.name}`,
              price,
              originalPrice,
              discount,
              images: [imageUrl],
              url: productUrl,
              category: 'PHYSICAL',
              inStock: true,
            });
          }
        }

        // Pausa entre categorías
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`   ❌ Error en ${url}:`, error);
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await browser.close();
  }

  // Remover duplicados
  const productosUnicos = Array.from(
    new Map(productos.map(p => [p.name, p])).values()
  );

  return productosUnicos;
}

// Función para hacer scroll automático
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

function parsePrice(priceText: string): number {
  const cleaned = priceText
    .replace(/[^\d.,]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  
  const price = parseFloat(cleaned);
  return isNaN(price) ? 0 : price;
}

async function main() {
  console.log('🛍️ SCRAPER UNIVERSAL DE TIENDAS\n');
  console.log('Tiendas disponibles:');
  Object.keys(TIENDAS).forEach((key, i) => {
    console.log(`${i + 1}. ${TIENDAS[key as keyof typeof TIENDAS].nombre}`);
  });
  console.log('');

  // Scrapear todas las tiendas
  let todosLosProductos: Product[] = [];

  for (const tiendaKey of Object.keys(TIENDAS)) {
    const productos = await scrapearTienda(tiendaKey as keyof typeof TIENDAS);
    todosLosProductos = [...todosLosProductos, ...productos];
    console.log(`✅ ${productos.length} productos de ${TIENDAS[tiendaKey as keyof typeof TIENDAS].nombre}\n`);
  }

  // Guardar resultados
  const outputPath = path.join(process.cwd(), 'scripts', 'productos-dropshipping.json');
  fs.writeFileSync(outputPath, JSON.stringify(todosLosProductos, null, 2));

  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN');
  console.log('='.repeat(50));
  console.log(`✅ Total de productos: ${todosLosProductos.length}`);
  console.log(`💾 Guardados en: ${outputPath}`);
  console.log('='.repeat(50) + '\n');

  console.log('🎉 Scraping completado!');
  console.log('\nPara importar a la base de datos:');
  console.log('npx tsx scripts/import-dropshipping.ts');
}

main().catch(console.error);
