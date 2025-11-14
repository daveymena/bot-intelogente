/**
 * 📸 Extractor Final de Fotos MegaComputer
 * Navega por categorías y busca productos por nombre
 */

import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';
import fs from 'fs';

const prisma = new PrismaClient();

// Mapeo de subcategorías a URLs de MegaComputer
const CATEGORIA_MAP: Record<string, string> = {
  'PORTATILES': 'computadores/portatiles',
  'MONITORES': 'monitores',
  'IMPRESORAS': 'impresoras',
  'ACCESORIOS': 'perifericos/mouse', // Buscaremos en varias
  'DIADEMAS': 'perifericos/diademas',
  'AUDIO': 'audio',
  'COMPONENTES': 'componentes/memorias-ram'
};

async function extraerImagenesProducto(productUrl: string, page: any): Promise<string[]> {
  try {
    await page.goto(productUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 3));
    await new Promise(resolve => setTimeout(resolve, 1000));

    const imagenes = await page.evaluate(() => {
      const imgs: string[] = [];
      
      const selectors = [
        'img[class*="product"]',
        'img[class*="gallery"]',
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

    return imagenes.filter((img: string) => 
      img.match(/\.(jpg|jpeg|png|webp|gif)/i) !== null
    );

  } catch (error: any) {
    console.log(`   ❌ Error extrayendo imágenes: ${error.message}`);
    return [];
  }
}

async function buscarProductoEnCategoria(
  nombreProducto: string, 
  categoria: string, 
  page: any
): Promise<string[]> {
  try {
    const categoriaUrl = `https://megacomputer.com.co/categoria-producto/${categoria}/`;
    
    await page.goto(categoriaUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extraer todos los productos de la categoría
    const productos = await page.evaluate(() => {
      const items: Array<{url: string, nombre: string}> = [];
      
      const selectors = [
        '.product-item',
        '.product',
        'article',
        '.woocommerce-loop-product'
      ];

      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach((item: Element) => {
          const link = item.querySelector('a');
          const title = item.querySelector('.woocommerce-loop-product__title, h2, h3, .product-title');
          
          if (link && title) {
            const href = link.getAttribute('href');
            const nombre = title.textContent?.trim() || '';
            
            if (href && 
                !href.includes('/categoria-producto/') &&
                !href.includes('/categoria/')) {
              items.push({ url: href, nombre });
            }
          }
        });
      });

      return items;
    });

    // Buscar coincidencia por nombre
    const nombreLimpio = nombreProducto.toLowerCase()
      .replace(/\([^)]*\)/g, '')
      .replace(/\d+gb/gi, '')
      .replace(/\d+tb/gi, '')
      .trim();

    const palabrasClave = nombreLimpio.split(' ').filter(p => p.length > 3);

    for (const producto of productos) {
      const nombreProductoLower = producto.nombre.toLowerCase();
      
      // Contar cuántas palabras clave coinciden
      const coincidencias = palabrasClave.filter(palabra => 
        nombreProductoLower.includes(palabra)
      ).length;

      // Si coinciden al menos 2 palabras clave
      if (coincidencias >= 2) {
        console.log(`   ✅ Coincidencia: "${producto.nombre}"`);
        const imagenes = await extraerImagenesProducto(producto.url, page);
        
        if (imagenes.length > 0) {
          return imagenes;
        }
      }
    }

    return [];

  } catch (error: any) {
    console.log(`   ❌ Error en categoría: ${error.message}`);
    return [];
  }
}

async function main() {
  console.log('📸 Extractor Final de Fotos MegaComputer\n');
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
          category: 'PHYSICAL'
        },
        {
          subcategory: {
            in: Object.keys(CATEGORIA_MAP)
          }
        }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`📦 Productos sin fotos: ${productos.length}\n`);

  if (productos.length === 0) {
    console.log('✅ Todos los productos tienen fotos!');
    await prisma.$disconnect();
    return;
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  let actualizados = 0;
  let sinFotos = 0;
  let errores = 0;

  const resultados: any[] = [];

  for (let i = 0; i < productos.length; i++) {
    const producto = productos[i];
    
    console.log(`\n[${i + 1}/${productos.length}] ${producto.name}`);
    console.log(`   Subcategoría: ${producto.subcategory}`);
    console.log('-'.repeat(60));

    try {
      const categoria = CATEGORIA_MAP[producto.subcategory || ''];
      
      if (!categoria) {
        console.log(`   ⚠️ Sin mapeo de categoría`);
        sinFotos++;
        continue;
      }

      console.log(`   🔍 Buscando en: ${categoria}`);
      
      const imagenes = await buscarProductoEnCategoria(
        producto.name,
        categoria,
        page
      );

      if (imagenes.length > 0) {
        await prisma.product.update({
          where: { id: producto.id },
          data: { images: JSON.stringify(imagenes) }
        });

        console.log(`   ✅ Actualizado con ${imagenes.length} imágenes`);
        console.log(`   📷 Primera: ${imagenes[0].substring(0, 70)}...`);
        
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

      // Pausa entre productos
      await new Promise(resolve => setTimeout(resolve, 4000));

    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
      errores++;
    }
  }

  await browser.close();

  // Guardar reporte
  const reportePath = 'scripts/reporte-fotos-megacomputer-final.json';
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
