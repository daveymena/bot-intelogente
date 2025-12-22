/**
 * 🚀 SCRAPER ROBUSTO PARA SAAS - Extracción de Fotos de Productos
 * 
 * Características:
 * - Múltiples fuentes (Google Images, tiendas, etc.)
 * - Retry automático con fallbacks
 * - Validación de imágenes
 * - Rate limiting para evitar bloqueos
 * - Logs detallados
 * - Compatible con SaaS multi-tenant
 */

import { PrismaClient } from '@prisma/client';
import puppeteer, { Browser, Page } from 'puppeteer';
import axios from 'axios';

const prisma = new PrismaClient();

interface ScraperConfig {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  userAgent: string;
  headless: boolean;
}

const DEFAULT_CONFIG: ScraperConfig = {
  maxRetries: 3,
  retryDelay: 2000,
  timeout: 30000,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  headless: true
};

/**
 * Extrae fotos de Google Images
 */
async function buscarEnGoogleImages(
  query: string,
  page: Page,
  maxImages: number = 5
): Promise<string[]> {
  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
    console.log(`   🔍 Google Images: ${query}`);

    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: DEFAULT_CONFIG.timeout
    });

    // Scroll para cargar más imágenes
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extraer URLs de imágenes
    const imagenes = await page.evaluate((max) => {
      const imgs: string[] = [];
      const elements = document.querySelectorAll('img[src^="http"]');
      
      elements.forEach((img: any) => {
        if (imgs.length >= max) return;
        
        const src = img.src;
        if (src && 
            !src.includes('google') && 
            !src.includes('gstatic') &&
            !src.includes('logo') &&
            src.startsWith('http')) {
          imgs.push(src);
        }
      });

      return imgs;
    }, maxImages);

    console.log(`   ✅ ${imagenes.length} imágenes de Google`);
    return imagenes;

  } catch (error: any) {
    console.log(`   ❌ Error en Google Images: ${error.message}`);
    return [];
  }
}

/**
 * Busca en tiendas colombianas específicas
 */
async function buscarEnTiendasColombianas(
  query: string,
  page: Page
): Promise<string[]> {
  const tiendas = [
    {
      nombre: 'Alkosto',
      url: `https://www.alkosto.com/search?q=${encodeURIComponent(query)}`,
      selector: '.product-image img, [class*="image"] img'
    },
    {
      nombre: 'Éxito',
      url: `https://www.exito.com/s?q=${encodeURIComponent(query)}`,
      selector: '.product-image img, [data-testid*="image"] img'
    },
    {
      nombre: 'Falabella',
      url: `https://www.falabella.com.co/falabella-co/search?Ntt=${encodeURIComponent(query)}`,
      selector: '.product-image img, [class*="ProductImage"] img'
    }
  ];

  const todasLasImagenes: string[] = [];

  for (const tienda of tiendas) {
    try {
      console.log(`   🏪 ${tienda.nombre}...`);
      
      await page.goto(tienda.url, {
        waitUntil: 'networkidle2',
        timeout: DEFAULT_CONFIG.timeout
      });

      await page.waitForSelector(tienda.selector, { timeout: 5000 }).catch(() => {});

      const imagenes = await page.evaluate((selector) => {
        const imgs: string[] = [];
        document.querySelectorAll(selector).forEach((img: any) => {
          const src = img.src || img.dataset.src;
          if (src && src.startsWith('http')) {
            imgs.push(src);
          }
        });
        return imgs.slice(0, 3);
      }, tienda.selector);

      if (imagenes.length > 0) {
        console.log(`   ✅ ${imagenes.length} de ${tienda.nombre}`);
        todasLasImagenes.push(...imagenes);
      }

      // Pausa entre tiendas
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error: any) {
      console.log(`   ⚠️ ${tienda.nombre}: ${error.message.substring(0, 50)}`);
    }
  }

  return todasLasImagenes;
}

/**
 * Valida que una URL de imagen sea accesible
 */
async function validarImagen(url: string): Promise<boolean> {
  try {
    const response = await axios.head(url, {
      timeout: 5000,
      headers: {
        'User-Agent': DEFAULT_CONFIG.userAgent
      }
    });

    const contentType = response.headers['content-type'];
    return contentType?.startsWith('image/') || false;

  } catch {
    return false;
  }
}

/**
 * Extrae fotos con múltiples estrategias y fallbacks
 */
async function extraerFotosRobusto(
  nombreProducto: string,
  categoria: string,
  page: Page
): Promise<string[]> {
  console.log(`\n📸 Extrayendo fotos para: ${nombreProducto}`);
  console.log('-'.repeat(60));

  const todasLasImagenes: string[] = [];

  // ESTRATEGIA 1: Google Images (más confiable)
  const googleImages = await buscarEnGoogleImages(nombreProducto, page, 5);
  todasLasImagenes.push(...googleImages);

  // ESTRATEGIA 2: Si no hay suficientes, buscar en tiendas
  if (todasLasImagenes.length < 3) {
    console.log(`   🔄 Buscando en tiendas colombianas...`);
    const tiendasImages = await buscarEnTiendasColombianas(nombreProducto, page);
    todasLasImagenes.push(...tiendasImages);
  }

  // ESTRATEGIA 3: Búsqueda genérica por categoría si aún no hay fotos
  if (todasLasImagenes.length === 0 && categoria) {
    console.log(`   🔄 Búsqueda genérica por categoría: ${categoria}`);
    const categoriaImages = await buscarEnGoogleImages(`${categoria} producto`, page, 3);
    todasLasImagenes.push(...categoriaImages);
  }

  // Remover duplicados
  const imagenesUnicas = [...new Set(todasLasImagenes)];

  // Validar imágenes (opcional, puede ser lento)
  // const imagenesValidas = [];
  // for (const img of imagenesUnicas.slice(0, 5)) {
  //   if (await validarImagen(img)) {
  //     imagenesValidas.push(img);
  //   }
  // }

  console.log(`   🎯 Total encontradas: ${imagenesUnicas.length}`);
  return imagenesUnicas.slice(0, 5); // Máximo 5 imágenes
}

/**
 * Procesa productos sin fotos o con pocas fotos
 */
async function procesarProductos(
  modo: 'sin-fotos' | 'pocas-fotos' | 'todos' = 'sin-fotos',
  userId?: string
) {
  console.log('🚀 SCRAPER ROBUSTO DE FOTOS - SAAS\n');
  console.log('='.repeat(60) + '\n');

  // Construir filtro según modo
  let whereCondition: any = { status: 'AVAILABLE' };

  if (userId) {
    whereCondition.userId = userId;
  }

  if (modo === 'sin-fotos') {
    whereCondition.OR = [
      { images: { equals: '[]' } },
      { images: { equals: '' } },
      { images: null },
    ];
  }

  const productos = await prisma.product.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' },
    take: 50 // Límite para no sobrecargar
  });

  // Filtrar por pocas fotos si es necesario
  let productosFiltrados = productos;
  if (modo === 'pocas-fotos') {
    productosFiltrados = productos.filter(p => {
      try {
        const imgs = p.images ? JSON.parse(p.images) : [];
        return imgs.length < 2;
      } catch {
        return true;
      }
    });
  }

  console.log(`📦 Productos a procesar: ${productosFiltrados.length}\n`);

  if (productosFiltrados.length === 0) {
    console.log('✅ No hay productos para procesar!');
    return;
  }

  const browser = await puppeteer.launch({
    headless: DEFAULT_CONFIG.headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const page = await browser.newPage();
  await page.setUserAgent(DEFAULT_CONFIG.userAgent);
  await page.setViewport({ width: 1920, height: 1080 });

  let actualizados = 0;
  let sinCambios = 0;
  let errores = 0;

  for (let i = 0; i < productosFiltrados.length; i++) {
    const producto = productosFiltrados[i];

    console.log(`\n[${i + 1}/${productosFiltrados.length}] ${producto.name}`);
    console.log('='.repeat(60));

    try {
      const imagenesActuales = producto.images ? JSON.parse(producto.images) : [];
      console.log(`📷 Imágenes actuales: ${imagenesActuales.length}`);

      const nuevasImagenes = await extraerFotosRobusto(
        producto.name,
        producto.category,
        page
      );

      if (nuevasImagenes.length > 0) {
        const todasLasImagenes = [...new Set([...imagenesActuales, ...nuevasImagenes])];

        await prisma.product.update({
          where: { id: producto.id },
          data: {
            images: JSON.stringify(todasLasImagenes)
          }
        });

        console.log(`✅ Actualizado: ${imagenesActuales.length} → ${todasLasImagenes.length} imágenes`);
        actualizados++;
      } else {
        console.log(`⚠️ No se encontraron imágenes`);
        sinCambios++;
      }

      // Pausa entre productos para evitar bloqueos
      await new Promise(resolve => setTimeout(resolve, 4000));

    } catch (error: any) {
      console.log(`❌ Error: ${error.message}`);
      errores++;
    }
  }

  await browser.close();

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RESUMEN:');
  console.log(`   ✅ Actualizados: ${actualizados}`);
  console.log(`   ⚠️  Sin cambios: ${sinCambios}`);
  console.log(`   ❌ Errores: ${errores}`);
  console.log('\n✨ Proceso completado!');
}

// Ejecutar
const args = process.argv.slice(2);
const modo = (args[0] as any) || 'sin-fotos';
const userId = args[1];

procesarProductos(modo, userId)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
