/**
 * 📸 Extraer fotos de MegaComputer para productos sin imagen
 * Enfocado en productos de tecnología (portátiles, monitores, accesorios, etc.)
 */

import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';
import fs from 'fs';

const prisma = new PrismaClient();

async function extraerFotosMegaComputer(nombreProducto: string, page: any): Promise<string[]> {
  try {
    // Limpiar nombre del producto para mejor búsqueda
    const nombreLimpio = nombreProducto
      .replace(/\([^)]*\)/g, '') // Remover paréntesis
      .replace(/\d+gb/gi, '') // Remover especificaciones de GB
      .replace(/\d+tb/gi, '')
      .replace(/ram|ssd|hdd/gi, '')
      .trim()
      .split(' ')
      .slice(0, 4) // Solo primeras 4 palabras
      .join(' ');

    const searchUrl = `https://megacomputer.com.co/buscar?q=${encodeURIComponent(nombreLimpio)}`;
    console.log(`   🔍 Buscando: "${nombreLimpio}"`);
    
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Esperar un poco para que cargue el contenido
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Buscar el primer producto - evitar páginas de categoría
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

    // Construir URL completa
    const productUrl = primerProducto.startsWith('http') 
      ? primerProducto 
      : `https://megacomputer.com.co${primerProducto}`;

    // Verificar que no sea una página de categoría
    if (productUrl.includes('/categoria-producto/') || productUrl.includes('/categoria/')) {
      console.log(`   ⚠️ URL de categoría detectada, saltando...`);
      return [];
    }

    console.log(`   📸 Abriendo: ${productUrl.substring(0, 60)}...`);
    
    await page.goto(productUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Esperar y hacer scroll para cargar imágenes lazy
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 3);
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extraer todas las imágenes del producto
    const imagenes = await page.evaluate(() => {
      const imgs: string[] = [];
      
      // Selectores específicos para MegaComputer y genéricos
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
              img.width > 100 && // Solo imágenes grandes
              img.height > 100) {
            imgs.push(src);
          }
        });
      });

      return [...new Set(imgs)]; // Remover duplicados
    });

    // Filtrar y normalizar URLs
    const imagenesCompletas = imagenes
      .map((img: string) => {
        if (img.startsWith('http')) return img;
        if (img.startsWith('//')) return `https:${img}`;
        return `https://megacomputer.com.co${img}`;
      })
      .filter((img: string) => {
        // Validar que sea una URL válida de imagen
        return img.match(/\.(jpg|jpeg|png|webp|gif)/i) !== null;
      });

    console.log(`   ✅ ${imagenesCompletas.length} imágenes encontradas`);
    
    // Mostrar primera imagen como referencia
    if (imagenesCompletas.length > 0) {
      console.log(`   📷 Primera: ${imagenesCompletas[0].substring(0, 70)}...`);
    }
    
    return imagenesCompletas;

  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    return [];
  }
}

async function main() {
  console.log('📸 Extractor de Fotos MegaComputer\n');
  console.log('='.repeat(60) + '\n');

  // Buscar productos de tecnología sin fotos
  const productos = await prisma.product.findMany({
    where: {
      AND: [
        {
          OR: [
            { images: { equals: '[]' } },
            { images: { equals: '' } },
            { images: null },
          ]
        },
        {
          category: 'PHYSICAL' // Solo productos físicos
        },
        {
          OR: [
            { subcategory: 'PORTATILES' },
            { subcategory: 'MONITORES' },
            { subcategory: 'ACCESORIOS' },
            { subcategory: 'COMPONENTES' },
            { subcategory: 'DIADEMAS' },
            { subcategory: 'IMPRESORAS' },
            { subcategory: 'AUDIO' },
            { subcategory: null } // Incluir sin subcategoría
          ]
        }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`📦 Productos de tecnología sin fotos: ${productos.length}\n`);

  if (productos.length === 0) {
    console.log('✅ Todos los productos de tecnología tienen fotos!');
    return;
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const page = await browser.newPage();
  
  // Configurar user agent y viewport
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8'
  });
  
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });
  
  await page.setViewport({ width: 1920, height: 1080 });

  let actualizados = 0;
  let sinFotos = 0;
  let errores = 0;

  const resultados: any[] = [];

  for (let i = 0; i < productos.length; i++) {
    const producto = productos[i];
    
    console.log(`\n[${i + 1}/${productos.length}] ${producto.name}`);
    console.log(`   Subcategoría: ${producto.subcategory || 'Sin asignar'}`);
    console.log('-'.repeat(60));

    try {
      const imagenes = await extraerFotosMegaComputer(producto.name, page);

      if (imagenes.length > 0) {
        await prisma.product.update({
          where: { id: producto.id },
          data: {
            images: JSON.stringify(imagenes)
          }
        });

        console.log(`   ✅ Actualizado con ${imagenes.length} imágenes`);
        
        resultados.push({
          id: producto.id,
          nombre: producto.name,
          subcategoria: producto.subcategory,
          imagenes: imagenes.length,
          urls: imagenes
        });

        actualizados++;
      } else {
        console.log(`   ⚠️ No se encontraron imágenes`);
        sinFotos++;
      }

      // Pausa entre productos para no saturar el servidor
      await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
      errores++;
    }
  }

  await browser.close();

  // Guardar reporte
  const reportePath = 'scripts/reporte-fotos-megacomputer.json';
  fs.writeFileSync(reportePath, JSON.stringify(resultados, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RESUMEN:');
  console.log(`   ✅ Actualizados: ${actualizados}`);
  console.log(`   ⚠️  Sin fotos: ${sinFotos}`);
  console.log(`   ❌ Errores: ${errores}`);
  console.log(`\n💾 Reporte: ${reportePath}`);
  console.log('\n✨ Proceso completado!');

  await prisma.$disconnect();
}

main().catch(console.error);
