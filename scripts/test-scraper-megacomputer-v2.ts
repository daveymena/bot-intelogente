/**
 * 🧪 Test del Scraper de MegaComputer V2
 * Estrategia alternativa: navegar por categorías
 */

import puppeteer from 'puppeteer';

async function extraerFotosDirecto(productUrl: string, page: any): Promise<string[]> {
  try {
    console.log(`   📸 Abriendo: ${productUrl}`);
    
    await page.goto(productUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 3));
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extraer imágenes
    const imagenes = await page.evaluate(() => {
      const imgs: string[] = [];
      
      const selectors = [
        'img[class*="product"]',
        'img[class*="gallery"]',
        'img[class*="image"]',
        'img[class*="zoom"]',
        '.woocommerce-product-gallery img',
        '.product-images img',
        'figure img',
        'picture img'
      ];

      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach((img: HTMLImageElement) => {
          const src = img.src || img.getAttribute('data-src') || '';
          
          if (src && 
              src.startsWith('http') &&
              !src.includes('placeholder') && 
              !src.includes('logo') &&
              !src.includes('icon') &&
              src.length > 30 &&
              img.width > 100 &&
              img.height > 100) {
            imgs.push(src);
          }
        });
      });

      return [...new Set(imgs)];
    });

    const imagenesCompletas = imagenes.filter((img: string) => 
      img.match(/\.(jpg|jpeg|png|webp|gif)/i) !== null
    );

    console.log(`   ✅ ${imagenesCompletas.length} imágenes encontradas`);
    
    if (imagenesCompletas.length > 0) {
      console.log(`   📷 Primera: ${imagenesCompletas[0]}`);
    }
    
    return imagenesCompletas;

  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    return [];
  }
}

async function buscarEnCategoria(categoria: string, page: any): Promise<string[]> {
  try {
    const categoriaUrl = `https://megacomputer.com.co/categoria-producto/${categoria}/`;
    console.log(`\n🔍 Navegando a categoría: ${categoria}`);
    console.log(`   URL: ${categoriaUrl}`);
    
    await page.goto(categoriaUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extraer URLs de productos
    const productosUrls = await page.evaluate(() => {
      const urls: string[] = [];
      
      const selectors = [
        '.product-item a',
        '.product a',
        'article a',
        '.woocommerce-loop-product__link'
      ];

      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach((link: HTMLAnchorElement) => {
          const href = link.href;
          if (href && 
              !href.includes('/categoria-producto/') &&
              !href.includes('/categoria/') &&
              !href.includes('#')) {
            urls.push(href);
          }
        });
      });

      return [...new Set(urls)];
    });

    console.log(`   📦 ${productosUrls.length} productos encontrados`);
    return productosUrls.slice(0, 3); // Solo primeros 3 para prueba

  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    return [];
  }
}

async function main() {
  console.log('🧪 Test del Scraper de MegaComputer V2\n');
  console.log('Estrategia: Navegar por categorías\n');
  console.log('='.repeat(70) + '\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Categorías de MegaComputer
  const categorias = [
    'computadores/portatiles',
    'perifericos/mouse',
    'perifericos/teclados',
    'monitores',
    'impresoras'
  ];

  for (const categoria of categorias) {
    const productosUrls = await buscarEnCategoria(categoria, page);

    if (productosUrls.length > 0) {
      console.log(`\n   Probando productos de ${categoria}:`);
      
      for (let i = 0; i < Math.min(2, productosUrls.length); i++) {
        const url = productosUrls[i];
        console.log(`\n   [${i + 1}] ${url.split('/').pop()}`);
        
        const imagenes = await extraerFotosDirecto(url, page);
        
        if (imagenes.length > 0) {
          console.log(`   ✅ ÉXITO: ${imagenes.length} imágenes`);
          imagenes.slice(0, 3).forEach((img, idx) => {
            console.log(`      ${idx + 1}. ${img.substring(0, 80)}...`);
          });
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  await browser.close();

  console.log('\n' + '='.repeat(70));
  console.log('\n✨ Test completado!');
  console.log('\nSi encontró productos correctamente, el scraper está funcionando.');
}

main().catch(console.error);
