/**
 * 🧪 Test del Scraper de MegaComputer
 * Prueba la extracción de fotos sin necesidad de base de datos
 */

import puppeteer from 'puppeteer';

async function extraerFotosMegaComputer(nombreProducto: string, page: any): Promise<string[]> {
  try {
    // Limpiar nombre del producto para mejor búsqueda
    const nombreLimpio = nombreProducto
      .replace(/\([^)]*\)/g, '')
      .replace(/\d+gb/gi, '')
      .replace(/\d+tb/gi, '')
      .replace(/ram|ssd|hdd/gi, '')
      .trim()
      .split(' ')
      .slice(0, 4)
      .join(' ');

    const searchUrl = `https://megacomputer.com.co/buscar?q=${encodeURIComponent(nombreLimpio)}`;
    console.log(`   🔍 Buscando: "${nombreLimpio}"`);
    console.log(`   🌐 URL: ${searchUrl}`);
    
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Buscar el primer producto - mejorado para evitar categorías
    const primerProducto = await page.evaluate(() => {
      const selectors = [
        '.product-item a[href*="/producto/"]',
        '.product a[href*="/producto/"]',
        'article a[href*="/producto/"]',
        '.product-item a',
        '.product a',
        'article a'
      ];

      for (const selector of selectors) {
        const links = document.querySelectorAll(selector);
        for (const link of Array.from(links)) {
          const href = (link as HTMLAnchorElement).getAttribute('href');
          if (href && 
              !href.includes('#') && 
              !href.includes('javascript') &&
              !href.includes('/categoria-producto/') &&
              !href.includes('/categoria/') &&
              (href.includes('/producto/') || href.match(/\/[a-z0-9-]+\/?$/))) {
            return href;
          }
        }
      }
      return null;
    });

    if (!primerProducto) {
      console.log(`   ⚠️ No encontrado en MegaComputer`);
      return [];
    }

    const productUrl = primerProducto.startsWith('http') 
      ? primerProducto 
      : `https://megacomputer.com.co${primerProducto}`;

    // Verificar que no sea una página de categoría
    if (productUrl.includes('/categoria-producto/') || productUrl.includes('/categoria/')) {
      console.log(`   ⚠️ URL de categoría detectada, saltando...`);
      return [];
    }

    console.log(`   📸 Abriendo producto...`);
    console.log(`   🔗 ${productUrl}`);
    
    await page.goto(productUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 3));
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extraer imágenes
    const imagenes = await page.evaluate(() => {
      const imgs: string[] = [];
      
      const selectors = [
        'img[class*="product"]',
        'img[class*="gallery"]',
        'img[class*="image"]',
        'img[class*="zoom"]',
        'img[class*="main"]',
        '.product-gallery img',
        '.product-image img',
        '.gallery img',
        '[data-image] img',
        'picture img',
        'figure img'
      ];

      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach((img: HTMLImageElement) => {
          const src = img.src || 
                      img.getAttribute('data-src') ||
                      img.getAttribute('data-lazy') ||
                      img.getAttribute('data-original') ||
                      img.dataset.src ||
                      '';
          
          if (src && 
              src.startsWith('http') &&
              !src.includes('placeholder') && 
              !src.includes('data:image') &&
              !src.includes('logo') &&
              !src.includes('icon') &&
              !src.includes('banner') &&
              !src.includes('sprite') &&
              !src.includes('blank') &&
              src.length > 30 &&
              img.width > 100 &&
              img.height > 100) {
            imgs.push(src);
          }
        });
      });

      return [...new Set(imgs)];
    });

    const imagenesCompletas = imagenes
      .map((img: string) => {
        if (img.startsWith('http')) return img;
        if (img.startsWith('//')) return `https:${img}`;
        return `https://megacomputer.com.co${img}`;
      })
      .filter((img: string) => img.match(/\.(jpg|jpeg|png|webp|gif)/i) !== null);

    console.log(`   ✅ ${imagenesCompletas.length} imágenes encontradas\n`);
    
    imagenesCompletas.forEach((img, i) => {
      console.log(`   ${i + 1}. ${img}`);
    });
    
    return imagenesCompletas;

  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    return [];
  }
}

async function main() {
  console.log('🧪 Test del Scraper de MegaComputer\n');
  console.log('='.repeat(70) + '\n');

  // Productos de prueba
  const productosPrueba = [
    'Portátil Asus Vivobook',
    'Mouse Logitech',
    'Monitor LG 24',
    'Teclado Mecánico',
    'Impresora HP'
  ];

  const browser = await puppeteer.launch({
    headless: false, // Mostrar navegador para debug
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const page = await browser.newPage();
  
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8'
  });
  
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });
  
  await page.setViewport({ width: 1920, height: 1080 });

  for (let i = 0; i < productosPrueba.length; i++) {
    const producto = productosPrueba[i];
    
    console.log(`\n[${i + 1}/${productosPrueba.length}] Probando: ${producto}`);
    console.log('-'.repeat(70));

    const imagenes = await extraerFotosMegaComputer(producto, page);

    if (imagenes.length > 0) {
      console.log(`\n   ✅ ÉXITO: ${imagenes.length} imágenes extraídas`);
    } else {
      console.log(`\n   ⚠️ No se encontraron imágenes`);
    }

    // Pausa entre búsquedas
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  await browser.close();

  console.log('\n' + '='.repeat(70));
  console.log('\n✨ Test completado!');
  console.log('\nSi el scraper funcionó correctamente, puedes ejecutar:');
  console.log('npx tsx scripts/extraer-fotos-megacomputer.ts');
}

main().catch(console.error);
