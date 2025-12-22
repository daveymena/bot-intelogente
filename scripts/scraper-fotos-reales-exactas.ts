/**
 * 🎯 SCRAPER ULTRA-PRECISO - Solo Fotos REALES del Producto Exacto
 * 
 * NO extrae fotos genéricas
 * Busca el producto EXACTO en tiendas reales
 * Valida que las fotos correspondan al producto específico
 */

import { PrismaClient } from '@prisma/client';
import puppeteer, { Browser, Page } from 'puppeteer';

const prisma = new PrismaClient();

interface TiendaReal {
  nombre: string;
  baseUrl: string;
  searchPath: string;
  selectors: {
    productItem: string;
    productLink: string;
    productName: string;
    productImages: string;
  };
}

// Tiendas reales colombianas con productos reales
const TIENDAS_REALES: TiendaReal[] = [
  {
    nombre: 'MegaComputer',
    baseUrl: 'https://megacomputer.com.co',
    searchPath: '/buscar?q=',
    selectors: {
      productItem: '.product-item, .product',
      productLink: 'a',
      productName: '.product-title, .product-name, h2, h3',
      productImages: '.product-gallery img, .product-image img, .woocommerce-product-gallery img'
    }
  },
  {
    nombre: 'Alkosto',
    baseUrl: 'https://www.alkosto.com',
    searchPath: '/search?q=',
    selectors: {
      productItem: '.product-item, [class*="product"]',
      productLink: 'a',
      productName: '.product-name, [class*="title"]',
      productImages: '.product-gallery img, .gallery img, [class*="ProductImage"] img'
    }
  },
  {
    nombre: 'Éxito',
    baseUrl: 'https://www.exito.com',
    searchPath: '/s?q=',
    selectors: {
      productItem: '.product, [data-testid*="product"]',
      productLink: 'a',
      productName: '[class*="title"], [class*="name"]',
      productImages: '.product-image img, [class*="image"] img'
    }
  },
  {
    nombre: 'Falabella',
    baseUrl: 'https://www.falabella.com.co',
    searchPath: '/falabella-co/search?Ntt=',
    selectors: {
      productItem: '.product-item, [class*="Product"]',
      productLink: 'a',
      productName: '[class*="ProductName"], [class*="title"]',
      productImages: '[class*="ProductImage"] img, .product-image img'
    }
  }
];

/**
 * Calcula similitud entre dos strings (0-1)
 */
function calcularSimilitud(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  
  // Contar palabras en común
  const palabras1 = s1.split(/\s+/);
  const palabras2 = s2.split(/\s+/);
  
  let coincidencias = 0;
  palabras1.forEach(p1 => {
    if (palabras2.some(p2 => p2.includes(p1) || p1.includes(p2))) {
      coincidencias++;
    }
  });
  
  return coincidencias / Math.max(palabras1.length, palabras2.length);
}

/**
 * Busca el producto EXACTO en una tienda específica
 */
async function buscarProductoExactoEnTienda(
  nombreProducto: string,
  tienda: TiendaReal,
  page: Page
): Promise<string[]> {
  try {
    const searchUrl = `${tienda.baseUrl}${tienda.searchPath}${encodeURIComponent(nombreProducto)}`;
    console.log(`   🔍 ${tienda.nombre}: Buscando "${nombreProducto.substring(0, 40)}..."`);
    
    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Esperar resultados
    await page.waitForSelector(tienda.selectors.productItem, {
      timeout: 5000
    }).catch(() => {});

    // Buscar el producto que mejor coincida
    const resultados = await page.evaluate((selectors, nombreBuscado) => {
      const items = document.querySelectorAll(selectors.productItem);
      const productos: Array<{url: string, nombre: string, similitud: number}> = [];
      
      items.forEach((item: any) => {
        const link = item.querySelector('a');
        const nameEl = item.querySelector(selectors.productName);
        
        if (link && nameEl) {
          const url = link.getAttribute('href');
          const nombre = nameEl.textContent?.trim() || '';
          
          if (url && nombre) {
            // Calcular similitud básica
            const nombreLower = nombre.toLowerCase();
            const buscadoLower = nombreBuscado.toLowerCase();
            const palabrasBuscadas = buscadoLower.split(/\s+/).filter(p => p.length > 3);
            
            let coincidencias = 0;
            palabrasBuscadas.forEach(palabra => {
              if (nombreLower.includes(palabra)) coincidencias++;
            });
            
            const similitud = coincidencias / palabrasBuscadas.length;
            
            if (similitud > 0.5) { // Al menos 50% de palabras coinciden
              productos.push({ url, nombre, similitud });
            }
          }
        }
      });
      
      // Ordenar por similitud
      productos.sort((a, b) => b.similitud - a.similitud);
      return productos;
      
    }, tienda.selectors, nombreProducto);

    if (resultados.length === 0) {
      console.log(`   ⚠️ No se encontró el producto en ${tienda.nombre}`);
      return [];
    }

    // Tomar el mejor resultado
    const mejorResultado = resultados[0];
    console.log(`   ✅ Encontrado: "${mejorResultado.nombre.substring(0, 40)}..." (${Math.round(mejorResultado.similitud * 100)}% similitud)`);

    // Construir URL completa
    const productUrl = mejorResultado.url.startsWith('http')
      ? mejorResultado.url
      : `${tienda.baseUrl}${mejorResultado.url}`;

    console.log(`   📸 Extrayendo fotos del producto...`);
    
    await page.goto(productUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Scroll para cargar imágenes lazy
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Extraer SOLO imágenes del producto
    const imagenes = await page.evaluate((selector) => {
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
            !src.includes('icon') &&
            !src.includes('banner') &&
            src.length > 20) {
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
    }).filter(img => img.startsWith('http')); // Solo URLs válidas

    console.log(`   ✅ ${imagenesCompletas.length} fotos REALES extraídas`);
    return imagenesCompletas.slice(0, 5); // Máximo 5 fotos

  } catch (error: any) {
    console.log(`   ❌ Error en ${tienda.nombre}: ${error.message.substring(0, 50)}`);
    return [];
  }
}

/**
 * Busca fotos REALES en todas las tiendas
 */
async function buscarFotosReales(
  nombreProducto: string,
  page: Page
): Promise<string[]> {
  const todasLasImagenes: string[] = [];

  for (const tienda of TIENDAS_REALES) {
    const imagenes = await buscarProductoExactoEnTienda(nombreProducto, tienda, page);
    todasLasImagenes.push(...imagenes);

    // Pausa entre tiendas
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Si ya tenemos suficientes fotos REALES, no seguir
    if (todasLasImagenes.length >= 5) {
      break;
    }
  }

  return [...new Set(todasLasImagenes)]; // Remover duplicados
}

/**
 * Procesa productos sin fotos
 */
async function main() {
  console.log('🎯 SCRAPER ULTRA-PRECISO - Solo Fotos REALES\n');
  console.log('='.repeat(60) + '\n');

  const args = process.argv.slice(2);
  const modo = args[0] || 'sin-fotos';
  const userId = args[1];

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
    take: 20 // Límite conservador
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
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  await page.setViewport({ width: 1920, height: 1080 });

  let actualizados = 0;
  let sinCambios = 0;

  for (let i = 0; i < productosFiltrados.length; i++) {
    const producto = productosFiltrados[i];
    
    console.log(`\n[${i + 1}/${productosFiltrados.length}] ${producto.name}`);
    console.log('-'.repeat(60));

    try {
      const imagenesActuales = producto.images ? JSON.parse(producto.images) : [];
      console.log(`📷 Imágenes actuales: ${imagenesActuales.length}`);

      const fotosReales = await buscarFotosReales(producto.name, page);

      if (fotosReales.length > 0) {
        const todasLasImagenes = [...new Set([...imagenesActuales, ...fotosReales])];

        await prisma.product.update({
          where: { id: producto.id },
          data: {
            images: JSON.stringify(todasLasImagenes)
          }
        });

        console.log(`✅ Actualizado: ${imagenesActuales.length} → ${todasLasImagenes.length} fotos REALES`);
        actualizados++;
      } else {
        console.log(`⚠️ No se encontraron fotos REALES del producto`);
        sinCambios++;
      }

      // Pausa entre productos
      await new Promise(resolve => setTimeout(resolve, 5000));

    } catch (error: any) {
      console.log(`❌ Error: ${error.message}`);
      sinCambios++;
    }
  }

  await browser.close();

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RESUMEN:');
  console.log(`   ✅ Actualizados con fotos REALES: ${actualizados}`);
  console.log(`   ⚠️  Sin fotos encontradas: ${sinCambios}`);
  console.log('\n✨ Proceso completado!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
