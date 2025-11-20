// Script para inspeccionar la estructura de SmartJoys
import puppeteer from 'puppeteer';
import fs from 'fs';

async function inspeccionarSmartJoys() {
  console.log('🔍 Inspeccionando estructura de SmartJoys...\n');

  const browser = await puppeteer.launch({
    headless: false, // Ver el navegador
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  try {
    console.log('📥 Cargando https://smartjoys.co/...\n');
    await page.goto('https://smartjoys.co/', { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });

    // Esperar a que cargue
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Tomar screenshot
    await page.screenshot({ path: 'smartjoys-estructura.png', fullPage: true });
    console.log('📸 Screenshot guardado: smartjoys-estructura.png\n');

    // Analizar estructura de la página
    const analisis = await page.evaluate(() => {
      const info: any = {
        titulo: document.title,
        url: window.location.href,
        selectoresEncontrados: [],
        productosEncontrados: [],
        estructuraHTML: '',
      };

      // Buscar posibles contenedores de productos
      const selectoresPosibles = [
        '.product',
        '.product-item',
        '.product-card',
        '.grid-item',
        '[class*="product"]',
        '[data-product]',
        'article',
        '.item',
        '[class*="item"]',
        'a[href*="/producto"]',
        'a[href*="/products"]',
        'a[href*="/tienda/"]',
      ];

      selectoresPosibles.forEach(selector => {
        try {
          const elementos = document.querySelectorAll(selector);
          if (elementos.length > 0) {
            info.selectoresEncontrados.push({
              selector,
              cantidad: elementos.length,
              ejemplo: elementos[0]?.outerHTML?.substring(0, 200) + '...'
            });
          }
        } catch (e) {
          // Ignorar errores
        }
      });

      // Intentar encontrar productos
      const todosLosLinks = document.querySelectorAll('a');
      const linksProductos: string[] = [];
      
      todosLosLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href.includes('/producto') || href.includes('/products') || href.includes('/tienda/')) {
          if (!linksProductos.includes(href)) {
            linksProductos.push(href);
          }
        }
      });

      info.linksProductos = linksProductos.slice(0, 10); // Primeros 10

      // Buscar imágenes de productos
      const imagenes = document.querySelectorAll('img');
      const imagenesProductos: string[] = [];
      
      imagenes.forEach(img => {
        const src = img.getAttribute('src') || '';
        const alt = img.getAttribute('alt') || '';
        if (src && (src.includes('product') || src.includes('cdn') || alt.toLowerCase().includes('product'))) {
          if (!imagenesProductos.includes(src)) {
            imagenesProductos.push(src);
          }
        }
      });

      info.imagenesProductos = imagenesProductos.slice(0, 5);

      // Buscar precios
      const elementosConPrecio = document.querySelectorAll('[class*="price"], [class*="precio"]');
      info.elementosConPrecio = elementosConPrecio.length;

      // Obtener estructura del primer producto encontrado
      const primerProducto = document.querySelector('.product, .product-item, .product-card, [class*="product"]');
      if (primerProducto) {
        info.estructuraProducto = primerProducto.outerHTML.substring(0, 500) + '...';
        
        // Analizar clases del producto
        info.clasesProducto = primerProducto.className;
        
        // Buscar elementos dentro del producto
        const nombre = primerProducto.querySelector('h1, h2, h3, h4, .title, [class*="title"], [class*="name"]');
        const precio = primerProducto.querySelector('[class*="price"], [class*="precio"]');
        const imagen = primerProducto.querySelector('img');
        
        info.elementosProducto = {
          nombre: nombre ? {
            selector: nombre.tagName + '.' + nombre.className,
            texto: nombre.textContent?.trim().substring(0, 50)
          } : null,
          precio: precio ? {
            selector: precio.tagName + '.' + precio.className,
            texto: precio.textContent?.trim()
          } : null,
          imagen: imagen ? {
            src: imagen.getAttribute('src'),
            alt: imagen.getAttribute('alt')
          } : null
        };
      }

      // Obtener HTML del body (primeros 2000 caracteres)
      info.estructuraHTML = document.body.innerHTML.substring(0, 2000);

      return info;
    });

    // Guardar análisis en JSON
    fs.writeFileSync('smartjoys-analisis.json', JSON.stringify(analisis, null, 2));

    // Mostrar resultados
    console.log('=' .repeat(60));
    console.log('📊 ANÁLISIS DE ESTRUCTURA');
    console.log('='.repeat(60));
    console.log(`\n📄 Título: ${analisis.titulo}`);
    console.log(`🔗 URL: ${analisis.url}\n`);

    console.log('🎯 SELECTORES ENCONTRADOS:');
    console.log('-'.repeat(60));
    if (analisis.selectoresEncontrados.length > 0) {
      analisis.selectoresEncontrados.forEach((s: any) => {
        console.log(`✅ ${s.selector} - ${s.cantidad} elementos`);
      });
    } else {
      console.log('❌ No se encontraron selectores comunes de productos');
    }

    console.log('\n🔗 LINKS DE PRODUCTOS:');
    console.log('-'.repeat(60));
    if (analisis.linksProductos && analisis.linksProductos.length > 0) {
      analisis.linksProductos.forEach((link: string) => {
        console.log(`  • ${link}`);
      });
    } else {
      console.log('❌ No se encontraron links de productos');
    }

    console.log('\n🖼️  IMÁGENES DE PRODUCTOS:');
    console.log('-'.repeat(60));
    if (analisis.imagenesProductos && analisis.imagenesProductos.length > 0) {
      analisis.imagenesProductos.forEach((img: string) => {
        console.log(`  • ${img.substring(0, 80)}...`);
      });
    } else {
      console.log('❌ No se encontraron imágenes de productos');
    }

    console.log('\n💰 ELEMENTOS CON PRECIO:');
    console.log('-'.repeat(60));
    console.log(`Encontrados: ${analisis.elementosConPrecio} elementos`);

    if (analisis.elementosProducto) {
      console.log('\n📦 ESTRUCTURA DEL PRIMER PRODUCTO:');
      console.log('-'.repeat(60));
      console.log(`Clases: ${analisis.clasesProducto}`);
      
      if (analisis.elementosProducto.nombre) {
        console.log(`\n  Nombre:`);
        console.log(`    Selector: ${analisis.elementosProducto.nombre.selector}`);
        console.log(`    Texto: ${analisis.elementosProducto.nombre.texto}`);
      }
      
      if (analisis.elementosProducto.precio) {
        console.log(`\n  Precio:`);
        console.log(`    Selector: ${analisis.elementosProducto.precio.selector}`);
        console.log(`    Texto: ${analisis.elementosProducto.precio.texto}`);
      }
      
      if (analisis.elementosProducto.imagen) {
        console.log(`\n  Imagen:`);
        console.log(`    Src: ${analisis.elementosProducto.imagen.src?.substring(0, 60)}...`);
        console.log(`    Alt: ${analisis.elementosProducto.imagen.alt}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('💾 Archivos generados:');
    console.log('  • smartjoys-estructura.png (screenshot)');
    console.log('  • smartjoys-analisis.json (análisis completo)');
    console.log('='.repeat(60));

    console.log('\n⏸️  El navegador permanecerá abierto para inspección manual...');
    console.log('Presiona Ctrl+C cuando termines de revisar.\n');

    // Mantener el navegador abierto
    await new Promise(() => {}); // Esperar indefinidamente

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // No cerrar el navegador automáticamente
    // await browser.close();
  }
}

inspeccionarSmartJoys().catch(console.error);
