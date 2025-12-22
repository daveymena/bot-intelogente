/**
 * Scraper Universal de Fotos - Extrae imágenes de TODAS las tiendas
 * Actualiza productos existentes con fotos de alta calidad
 */

import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface TiendaConfig {
  nombre: string;
  baseUrl: string;
  searchPath: string;
  selectors: {
    productItem: string;
    productLink: string;
    productImages: string;
  };
}

const TIENDAS: TiendaConfig[] = [
  {
    nombre: 'Disyvar',
    baseUrl: 'https://disyvar.com.co',
    searchPath: '/buscar?q=',
    selectors: {
      productItem: '.js-item-product, .product-item',
      productLink: 'a',
      productImages: '.js-product-slide-img img, .product-image img, [class*="gallery"] img'
    }
  },
  {
    nombre: 'SmartJoys',
    baseUrl: 'https://smartjoys.co',
    searchPath: '/search?q=',
    selectors: {
      productItem: '.product-item, .product-card',
      productLink: 'a',
      productImages: '.product-images img, .gallery img, [class*="image"] img'
    }
  },
  {
    nombre: 'MegaComputer',
    baseUrl: 'https://megacomputer.com.co',
    searchPath: '/buscar?q=',
    selectors: {
      productItem: '.product-item, .product',
      productLink: 'a',
      productImages: '.product-gallery img, .product-image img, img[class*="product"]'
    }
  },
  {
    nombre: 'Alkosto',
    baseUrl: 'https://www.alkosto.com',
    searchPath: '/search?q=',
    selectors: {
      productItem: '.product-item, [class*="product"]',
      productLink: 'a',
      productImages: '.product-gallery img, .gallery img'
    }
  },
  {
    nombre: 'Éxito',
    baseUrl: 'https://www.exito.com',
    searchPath: '/s?q=',
    selectors: {
      productItem: '.product, [data-testid*="product"]',
      productLink: 'a',
      productImages: '.product-image img, [class*="image"] img'
    }
  }
];

async function buscarProductoEnTienda(
  nombreProducto: string, 
  tienda: TiendaConfig, 
  page: any
): Promise<string[]> {
  try {
    const searchUrl = `${tienda.baseUrl}${tienda.searchPath}${encodeURIComponent(nombreProducto)}`;
    console.log(`   🔍 ${tienda.nombre}: ${searchUrl}`);
    
    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Esperar a que carguen los productos
    await page.waitForSelector(tienda.selectors.productItem, {
      timeout: 5000
    }).catch(() => {});

    // Obtener el primer resultado
    const primerProducto = await page.evaluate((selector: string) => {
      const item = document.querySelector(selector);
      if (!item) return null;
      
      const link = item.querySelector('a');
      return link?.getAttribute('href') || null;
    }, tienda.selectors.productItem);

    if (!primerProducto) {
      console.log(`   ⚠️ No encontrado en ${tienda.nombre}`);
      return [];
    }

    // Construir URL completa
    const productUrl = primerProducto.startsWith('http') 
      ? primerProducto 
      : `${tienda.baseUrl}${primerProducto}`;

    console.log(`   📸 Extrayendo fotos...`);
    
    await page.goto(productUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Scroll para cargar imágenes lazy
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extraer todas las imágenes
    const imagenes = await page.evaluate((selector: string) => {
      const imgs: string[] = [];
      
      document.querySelectorAll(selector).forEach((img: any) => {
        const src = img.getAttribute('src') || 
                    img.getAttribute('data-src') ||
                    img.getAttribute('data-srcset')?.split(' ')[0] ||
                    img.getAttribute('srcset')?.split(' ')[0];
        
        if (src && 
            !src.includes('placeholder') && 
            !src.includes('data:image') &&
            !src.includes('logo') &&
            !src.includes('icon')) {
          imgs.push(src);
        }
      });

      return [...new Set(imgs)]; // Remover duplicados
    }, tienda.selectors.productImages);

    // Normalizar URLs
    const imagenesCompletas = imagenes.map(img => {
      if (img.startsWith('http')) return img;
      if (img.startsWith('//')) return `https:${img}`;
      return `${tienda.baseUrl}${img}`;
    });

    console.log(`   ✅ ${imagenesCompletas.length} imágenes encontradas`);
    return imagenesCompletas;

  } catch (error: any) {
    console.log(`   ❌ Error en ${tienda.nombre}: ${error.message}`);
    return [];
  }
}

async function buscarEnTodasLasTiendas(
  nombreProducto: string, 
  page: any
): Promise<string[]> {
  const todasLasImagenes: string[] = [];

  for (const tienda of TIENDAS) {
    const imagenes = await buscarProductoEnTienda(nombreProducto, tienda, page);
    todasLasImagenes.push(...imagenes);

    // Pausa entre tiendas
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Si ya tenemos suficientes imágenes, no seguir buscando
    if (todasLasImagenes.length >= 5) {
      break;
    }
  }

  // Remover duplicados
  return [...new Set(todasLasImagenes)];
}

async function main() {
  console.log('🚀 Scraper Universal de Fotos de Productos\n');
  console.log('='.repeat(60) + '\n');

  const args = process.argv.slice(2);
  const modo = args[0] || 'sin-fotos'; // 'sin-fotos', 'todos', 'pocas-fotos'

  let productos: any[] = [];

  switch (modo) {
    case 'sin-fotos':
      productos = await prisma.product.findMany({
        where: {
          OR: [
            { images: { equals: '[]' } },
            { images: { equals: '' } },
            { images: null },
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
      console.log(`📦 Modo: Productos SIN fotos (${productos.length})\n`);
      break;

    case 'pocas-fotos':
      const todosProductos = await prisma.product.findMany();
      productos = todosProductos.filter(p => {
        try {
          const imgs = p.images ? JSON.parse(p.images) : [];
          return imgs.length < 2;
        } catch {
          return true;
        }
      });
      console.log(`📦 Modo: Productos con POCAS fotos (${productos.length})\n`);
      break;

    case 'todos':
      productos = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
      });
      console.log(`📦 Modo: TODOS los productos (${productos.length})\n`);
      break;

    default:
      console.log('❌ Modo inválido. Usa: sin-fotos, pocas-fotos, o todos');
      return;
  }

  if (productos.length === 0) {
    console.log('✅ No hay productos para procesar!');
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
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1920, height: 1080 });

  let actualizados = 0;
  let sinCambios = 0;
  let errores = 0;

  const resultados: any[] = [];

  for (let i = 0; i < productos.length; i++) {
    const producto = productos[i];
    
    console.log(`\n[${i + 1}/${productos.length}] ${producto.name}`);
    console.log('-'.repeat(60));

    try {
      const imagenesActuales = producto.images ? JSON.parse(producto.images) : [];
      console.log(`   📷 Imágenes actuales: ${imagenesActuales.length}`);

      const nuevasImagenes = await buscarEnTodasLasTiendas(producto.name, page);

      if (nuevasImagenes.length > 0) {
        // Combinar imágenes actuales con nuevas (sin duplicados)
        const todasLasImagenes = [...new Set([...imagenesActuales, ...nuevasImagenes])];

        await prisma.product.update({
          where: { id: producto.id },
          data: {
            images: JSON.stringify(todasLasImagenes)
          }
        });

        console.log(`   ✅ Actualizado: ${imagenesActuales.length} → ${todasLasImagenes.length} imágenes`);
        
        resultados.push({
          id: producto.id,
          nombre: producto.name,
          antes: imagenesActuales.length,
          despues: todasLasImagenes.length,
          nuevas: nuevasImagenes
        });

        actualizados++;
      } else {
        console.log(`   ⚠️ No se encontraron imágenes nuevas`);
        sinCambios++;
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
  const reportePath = path.join(process.cwd(), 'scripts', 'reporte-fotos.json');
  fs.writeFileSync(reportePath, JSON.stringify(resultados, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RESUMEN:');
  console.log(`   ✅ Actualizados: ${actualizados}`);
  console.log(`   ⚠️  Sin cambios: ${sinCambios}`);
  console.log(`   ❌ Errores: ${errores}`);
  console.log(`\n💾 Reporte guardado en: ${reportePath}`);
  console.log('\n✨ Proceso completado!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
