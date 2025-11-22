#!/usr/bin/env tsx
/**
 * 🔍 Test: Inspeccionar estructura de SmartJoys
 */

import puppeteer from 'puppeteer';

async function inspectSmartJoys() {
  console.log('🔍 Inspeccionando estructura de SmartJoys...\n');

  const browser = await puppeteer.launch({
    headless: false, // Ver el navegador
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('📄 Cargando página...');
  await page.goto('https://smartjoys.co/tienda/', { 
    waitUntil: 'networkidle2', 
    timeout: 60000 
  });

  console.log('✅ Página cargada\n');

  // Esperar un poco más para que cargue todo
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Inspeccionar estructura
  const structure = await page.evaluate(() => {
    // Buscar diferentes selectores comunes
    const selectors = [
      '.product',
      '.woocommerce-LoopProduct-link',
      'article.product',
      '.product-item',
      '[class*="product"]',
      '.type-product',
      '.post-type-product'
    ];

    const results: any = {};

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        results[selector] = {
          count: elements.length,
          sample: elements[0]?.outerHTML?.substring(0, 500)
        };
      }
    }

    // También buscar contenedores de productos
    const containers = document.querySelectorAll('[class*="products"], [class*="shop"], [class*="woocommerce"]');
    results.containers = Array.from(containers).map(c => ({
      class: c.className,
      children: c.children.length
    }));

    return results;
  });

  console.log('📊 Estructura encontrada:');
  console.log(JSON.stringify(structure, null, 2));

  // Tomar screenshot
  await page.screenshot({ path: 'smartjoys-screenshot.png', fullPage: true });
  console.log('\n📸 Screenshot guardado: smartjoys-screenshot.png');

  console.log('\n⏸️  Navegador abierto. Presiona Ctrl+C para cerrar...');
  
  // Mantener abierto para inspección manual
  await new Promise(() => {});
}

inspectSmartJoys().catch(console.error);
