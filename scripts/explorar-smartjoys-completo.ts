// Script para explorar todas las secciones de SmartJoys
import puppeteer from 'puppeteer';
import fs from 'fs';

async function explorarSmartJoys() {
  console.log('🔍 Explorando SmartJoys completamente...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  const resultados: any = {
    timestamp: new Date().toISOString(),
    paginas: []
  };

  // URLs a explorar
  const urlsExplorar = [
    { nombre: 'Página Principal', url: 'https://smartjoys.co/' },
    { nombre: 'Tienda', url: 'https://smartjoys.co/tienda/' },
    { nombre: 'Productos', url: 'https://smartjoys.co/productos/' },
    { nombre: 'Categorías', url: 'https://smartjoys.co/categorias/' },
    { nombre: 'Collections', url: 'https://smartjoys.co/collections/' },
    { nombre: 'Shop', url: 'https://smartjoys.co/shop/' },
  ];

  for (const sitio of urlsExplorar) {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📍 Explorando: ${sitio.nombre}`);
      console.log(`🔗 URL: ${sitio.url}`);
      console.log('='.repeat(60));

      await page.goto(sitio.url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      await new Promise(resolve => setTimeout(resolve, 3000));

      // Analizar la página
      const analisis = await page.evaluate(() => {
        const info: any = {
          titulo: document.title,
          url: window.location.href,
          existe: true,
          productos: [],
          selectores: [],
          links: [],
          categorias: []
        };

        // Buscar productos
        const selectoresProductos = [
          '.product',
          '.product-item',
          '.product-card',
          '.grid-item',
          '[class*="product"]',
          'article',
          '.item',
        ];

        selectoresProductos.forEach(selector => {
          const elementos = document.querySelectorAll(selector);
          if (elementos.length > 0) {
            info.selectores.push({
              selector,
              cantidad: elementos.length
            });

            // Extraer info del primer producto
            const primero = elementos[0];
            const nombre = primero.querySelector('h1, h2, h3, h4, .title, [class*="title"]')?.textContent?.trim();
            const precio = primero.querySelector('[class*="price"]')?.textContent?.trim();
            const imagen = primero.querySelector('img')?.getAttribute('src');
            const link = primero.querySelector('a')?.getAttribute('href');

            if (nombre || precio) {
              info.productos.push({
                selector,
                nombre: nombre?.substring(0, 50),
                precio,
                imagen: imagen?.substring(0, 80),
                link
              });
            }
          }
        });

        // Buscar todos los links
        document.querySelectorAll('a').forEach(link => {
          const href = link.getAttribute('href') || '';
          const texto = link.textContent?.trim();
          
          if (href.includes('/producto') || href.includes('/product') || 
              href.includes('/tienda') || href.includes('/shop') ||
              href.includes('/categoria') || href.includes('/category')) {
            info.links.push({
              href,
              texto: texto?.substring(0, 50)
            });
          }
        });

        // Buscar categorías
        document.querySelectorAll('[class*="categor"], [class*="menu"], nav a').forEach(el => {
          const texto = el.textContent?.trim();
          const href = el.getAttribute('href');
          if (texto && href) {
            info.categorias.push({ texto, href });
          }
        });

        return info;
      });

      // Tomar screenshot
      const screenshotPath = `smartjoys-${sitio.nombre.toLowerCase().replace(/\s+/g, '-')}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: false });

      resultados.paginas.push({
        ...sitio,
        ...analisis,
        screenshot: screenshotPath
      });

      // Mostrar resultados
      console.log(`\n✅ Página cargada: ${analisis.titulo}`);
      console.log(`📊 Selectores encontrados: ${analisis.selectores.length}`);
      console.log(`🔗 Links relevantes: ${analisis.links.length}`);
      console.log(`📦 Productos detectados: ${analisis.productos.length}`);
      console.log(`📸 Screenshot: ${screenshotPath}`);

      if (analisis.productos.length > 0) {
        console.log('\n🎯 PRODUCTOS ENCONTRADOS:');
        analisis.productos.slice(0, 3).forEach((p: any, i: number) => {
          console.log(`\n  ${i + 1}. ${p.nombre || 'Sin nombre'}`);
          console.log(`     Precio: ${p.precio || 'N/A'}`);
          console.log(`     Selector: ${p.selector}`);
        });
      }

      if (analisis.selectores.length > 0) {
        console.log('\n📋 SELECTORES:');
        analisis.selectores.forEach((s: any) => {
          console.log(`  • ${s.selector}: ${s.cantidad} elementos`);
        });
      }

    } catch (error: any) {
      console.log(`❌ Error o página no existe: ${error.message}`);
      resultados.paginas.push({
        ...sitio,
        existe: false,
        error: error.message
      });
    }
  }

  // Guardar resultados completos
  fs.writeFileSync('smartjoys-exploracion-completa.json', JSON.stringify(resultados, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE EXPLORACIÓN');
  console.log('='.repeat(60));
  
  const paginasExitosas = resultados.paginas.filter((p: any) => p.existe);
  const paginasConProductos = resultados.paginas.filter((p: any) => p.productos && p.productos.length > 0);

  console.log(`\n✅ Páginas encontradas: ${paginasExitosas.length}/${urlsExplorar.length}`);
  console.log(`📦 Páginas con productos: ${paginasConProductos.length}`);

  if (paginasConProductos.length > 0) {
    console.log('\n🎯 MEJORES PÁGINAS PARA SCRAPEAR:');
    paginasConProductos.forEach((p: any) => {
      console.log(`\n  ✅ ${p.nombre}`);
      console.log(`     URL: ${p.url}`);
      console.log(`     Productos: ${p.productos.length}`);
      console.log(`     Selectores: ${p.selectores.map((s: any) => s.selector).join(', ')}`);
    });
  }

  console.log('\n💾 Archivo generado: smartjoys-exploracion-completa.json');
  console.log('='.repeat(60));

  console.log('\n⏸️  Navegador abierto para inspección manual...');
  console.log('Presiona Ctrl+C cuando termines.\n');

  // Mantener navegador abierto
  await new Promise(() => {});

}

explorarSmartJoys().catch(console.error);
