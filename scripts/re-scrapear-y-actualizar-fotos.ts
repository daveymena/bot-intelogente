/**
 * Script para re-scrapear productos existentes y actualizar sus fotos
 * - MegaComputer
 * - Megapacks
 * - Dropshipping (SmartJoys, Disyvar)
 */

import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

interface ProductoActualizar {
  id: string;
  name: string;
  images: string[];
  tags: string[];
  metadata?: any;
}

// Configuración
const DELAY_ENTRE_PRODUCTOS = 3000; // 3 segundos
const MAX_PRODUCTOS_POR_LOTE = 50;
const TIMEOUT_NAVEGACION = 30000;

/**
 * Detectar origen del producto
 */
function detectarOrigen(producto: ProductoActualizar): string {
  const tags = producto.tags || [];
  const metadata = producto.metadata || {};
  const nombre = producto.name.toLowerCase();

  if (tags.includes('megacomputer') || metadata.supplier === 'MegaComputer') {
    return 'megacomputer';
  }
  
  if (tags.includes('megapack') || nombre.includes('megapack') || nombre.includes('mega pack')) {
    return 'megapack';
  }
  
  if (tags.includes('smartjoys') || metadata.supplier === 'SmartJoys') {
    return 'smartjoys';
  }
  
  if (tags.includes('disyvar') || metadata.supplier === 'Disyvar') {
    return 'disyvar';
  }
  
  if (tags.includes('dropshipping')) {
    return 'dropshipping';
  }

  return 'desconocido';
}

/**
 * Buscar producto en MegaComputer
 */
async function buscarEnMegaComputer(nombreProducto: string): Promise<string[]> {
  try {
    const searchUrl = `https://megacomputer.com.co/buscar?q=${encodeURIComponent(nombreProducto)}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const imagenes: string[] = [];

    // Buscar primer producto en resultados
    const primerProducto = $('.product-item, .product-card, [class*="product"]').first();
    
    if (primerProducto.length > 0) {
      const linkProducto = primerProducto.find('a').first().attr('href');
      
      if (linkProducto) {
        const urlCompleta = linkProducto.startsWith('http') 
          ? linkProducto 
          : `https://megacomputer.com.co${linkProducto}`;

        // Visitar página del producto
        const prodResponse = await axios.get(urlCompleta, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          timeout: 15000,
        });

        const $prod = cheerio.load(prodResponse.data);
        
        // Extraer todas las imágenes del producto
        $prod('img[src*="product"], img[src*="cdn"], .product-images img, .gallery img').each((i, el) => {
          const src = $prod(el).attr('src') || $prod(el).attr('data-src');
          if (src && !src.includes('placeholder') && !imagenes.includes(src)) {
            const urlImagen = src.startsWith('http') ? src : `https://megacomputer.com.co${src}`;
            imagenes.push(urlImagen);
          }
        });
      }
    }

    return imagenes;
  } catch (error) {
    console.error(`   ❌ Error en MegaComputer: ${error}`);
    return [];
  }
}

/**
 * Buscar producto en SmartJoys con Puppeteer
 */
async function buscarEnSmartJoys(nombreProducto: string, browser: any): Promise<string[]> {
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    const searchUrl = `https://smartjoys.co/search?q=${encodeURIComponent(nombreProducto)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: TIMEOUT_NAVEGACION });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const imagenes = await page.evaluate(() => {
      const imgs: string[] = [];
      
      // Buscar primer producto
      const primerProducto = document.querySelector('.product-item, .product-card, [class*="product"]');
      
      if (primerProducto) {
        const link = primerProducto.querySelector('a')?.getAttribute('href');
        if (link) {
          // Guardar link para visitar después
          (window as any).__productLink = link;
        }
      }

      return imgs;
    });

    // Si encontró un link, visitarlo
    const productLink = await page.evaluate(() => (window as any).__productLink);
    
    if (productLink) {
      const urlCompleta = productLink.startsWith('http') 
        ? productLink 
        : `https://smartjoys.co${productLink}`;

      await page.goto(urlCompleta, { waitUntil: 'networkidle0', timeout: TIMEOUT_NAVEGACION });
      await new Promise(resolve => setTimeout(resolve, 2000));

      const imagenesProducto = await page.evaluate(() => {
        const imgs: string[] = [];
        document.querySelectorAll('img[src*="product"], img[src*="cdn"]').forEach(img => {
          const src = img.getAttribute('src');
          if (src && !imgs.includes(src)) {
            imgs.push(src);
          }
        });
        return imgs;
      });

      imagenes.push(...imagenesProducto);
    }

    await page.close();
    return imagenes;
  } catch (error) {
    console.error(`   ❌ Error en SmartJoys: ${error}`);
    return [];
  }
}

/**
 * Buscar producto en Disyvar
 */
async function buscarEnDisyvar(nombreProducto: string): Promise<string[]> {
  try {
    const searchUrl = `https://disyvar.com.co/buscar?q=${encodeURIComponent(nombreProducto)}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const imagenes: string[] = [];

    const primerProducto = $('.product, .product-item, [class*="product"]').first();
    
    if (primerProducto.length > 0) {
      const linkProducto = primerProducto.find('a').first().attr('href');
      
      if (linkProducto) {
        const urlCompleta = linkProducto.startsWith('http') 
          ? linkProducto 
          : `https://disyvar.com.co${linkProducto}`;

        const prodResponse = await axios.get(urlCompleta, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          timeout: 15000,
        });

        const $prod = cheerio.load(prodResponse.data);
        
        $prod('img[src*="product"], img[src*="cdn"], .product-images img').each((i, el) => {
          const src = $prod(el).attr('src') || $prod(el).attr('data-src');
          if (src && !src.includes('placeholder') && !imagenes.includes(src)) {
            const urlImagen = src.startsWith('http') ? src : `https://disyvar.com.co${src}`;
            imagenes.push(urlImagen);
          }
        });
      }
    }

    return imagenes;
  } catch (error) {
    console.error(`   ❌ Error en Disyvar: ${error}`);
    return [];
  }
}

/**
 * Buscar imágenes de Megapacks (Google Drive o URLs conocidas)
 */
async function buscarImagenesMegapack(nombreProducto: string): Promise<string[]> {
  // Para megapacks, usar imágenes genéricas o de Google Drive
  const imagenes: string[] = [];
  
  // Extraer número de megapack si existe
  const match = nombreProducto.match(/mega\s*pack\s*(\d+)/i);
  
  if (match) {
    const numero = match[1];
    // URLs de Google Drive conocidas (ajustar según tus archivos)
    imagenes.push(`https://drive.google.com/uc?id=MEGAPACK_${numero}`);
  }

  // Imagen genérica de megapack
  imagenes.push('https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=500');

  return imagenes;
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 RE-SCRAPEANDO PRODUCTOS Y ACTUALIZANDO FOTOS\n');
  console.log('='.repeat(60));

  // Obtener productos sin fotos o con pocas fotos
  const productos = await prisma.product.findMany({
    where: {
      OR: [
        { images: { equals: '[]' } },
        { images: { equals: '' } },
        { images: null },
      ],
      status: 'AVAILABLE',
    },
    take: MAX_PRODUCTOS_POR_LOTE,
    orderBy: { createdAt: 'desc' },
  });

  console.log(`\n📦 Productos a actualizar: ${productos.length}\n`);

  if (productos.length === 0) {
    console.log('✅ Todos los productos tienen fotos!');
    return;
  }

  // Iniciar navegador para SmartJoys
  console.log('🌐 Iniciando navegador...\n');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let actualizados = 0;
  let sinCambios = 0;
  let errores = 0;

  for (let i = 0; i < productos.length; i++) {
    const producto = productos[i];
    
    console.log(`[${i + 1}/${productos.length}] ${producto.name}`);
    console.log('-'.repeat(60));

    try {
      const productoData: ProductoActualizar = {
        id: producto.id,
        name: producto.name,
        images: producto.images ? JSON.parse(producto.images) : [],
        tags: producto.tags ? JSON.parse(producto.tags) : [],
        metadata: producto.metadata ? JSON.parse(producto.metadata) : {},
      };

      const origen = detectarOrigen(productoData);
      console.log(`   🏪 Origen detectado: ${origen.toUpperCase()}`);

      let imagenesNuevas: string[] = [];

      // Buscar según origen
      switch (origen) {
        case 'megacomputer':
          console.log('   🔍 Buscando en MegaComputer...');
          imagenesNuevas = await buscarEnMegaComputer(producto.name);
          break;

        case 'smartjoys':
          console.log('   🔍 Buscando en SmartJoys...');
          imagenesNuevas = await buscarEnSmartJoys(producto.name, browser);
          break;

        case 'disyvar':
          console.log('   🔍 Buscando en Disyvar...');
          imagenesNuevas = await buscarEnDisyvar(producto.name);
          break;

        case 'megapack':
          console.log('   🔍 Buscando imágenes de Megapack...');
          imagenesNuevas = await buscarImagenesMegapack(producto.name);
          break;

        case 'dropshipping':
          console.log('   🔍 Buscando en múltiples tiendas...');
          // Intentar en todas las tiendas
          imagenesNuevas = await buscarEnSmartJoys(producto.name, browser);
          if (imagenesNuevas.length === 0) {
            imagenesNuevas = await buscarEnDisyvar(producto.name);
          }
          if (imagenesNuevas.length === 0) {
            imagenesNuevas = await buscarEnMegaComputer(producto.name);
          }
          break;

        default:
          console.log('   ⚠️  Origen desconocido, intentando búsqueda general...');
          imagenesNuevas = await buscarEnMegaComputer(producto.name);
          break;
      }

      // Actualizar si se encontraron imágenes
      if (imagenesNuevas.length > 0) {
        await prisma.product.update({
          where: { id: producto.id },
          data: {
            images: JSON.stringify(imagenesNuevas),
          },
        });

        actualizados++;
        console.log(`   ✅ Actualizado: ${imagenesNuevas.length} imágenes`);
        imagenesNuevas.forEach((img, idx) => {
          console.log(`      ${idx + 1}. ${img.slice(0, 60)}...`);
        });
      } else {
        sinCambios++;
        console.log('   ⚠️  No se encontraron imágenes');
      }

    } catch (error) {
      errores++;
      console.error(`   ❌ Error: ${error}`);
    }

    console.log('');

    // Delay entre productos
    if (i < productos.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_ENTRE_PRODUCTOS));
    }
  }

  await browser.close();

  // Resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN FINAL');
  console.log('='.repeat(60));
  console.log(`✅ Actualizados: ${actualizados}`);
  console.log(`⚠️  Sin cambios: ${sinCambios}`);
  console.log(`❌ Errores: ${errores}`);
  console.log(`📦 Total procesados: ${productos.length}`);
  console.log('='.repeat(60) + '\n');

  console.log('✨ Proceso completado!\n');
  console.log('📝 Próximos pasos:');
  console.log('   1. Verificar productos en dashboard');
  console.log('   2. Ejecutar de nuevo si quedan productos sin fotos');
  console.log('   3. Revisar productos con errores manualmente\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
