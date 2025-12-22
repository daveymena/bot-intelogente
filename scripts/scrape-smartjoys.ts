// Script para extraer productos de SmartJoys (Dropshipping)
import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ScrapedProduct {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  url: string;
  sku?: string;
  stock?: number;
}

// Función para extraer productos de una página
async function scrapePage(url: string): Promise<ScrapedProduct[]> {
  try {
    console.log(`📥 Scrapeando: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
      timeout: 30000,
    });

    const $ = cheerio.load(response.data);
    const products: ScrapedProduct[] = [];

    // Detectar estructura de productos (ajustar según el sitio)
    $('.product-item, .product-card, .product, [class*="product"]').each((i, element) => {
      try {
        const $el = $(element);
        
        // Extraer nombre
        const name = $el.find('.product-title, .product-name, h2, h3, [class*="title"]')
          .first()
          .text()
          .trim();

        // Extraer precio
        const priceText = $el.find('.price, .product-price, [class*="price"]')
          .first()
          .text()
          .trim();
        
        const price = parsePrice(priceText);

        // Extraer imagen
        const imageUrl = $el.find('img').first().attr('src') || 
                        $el.find('img').first().attr('data-src') || '';

        // Extraer URL del producto
        const productUrl = $el.find('a').first().attr('href') || '';

        // Extraer descripción corta
        const description = $el.find('.description, .product-description, p')
          .first()
          .text()
          .trim();

        if (name && price > 0) {
          products.push({
            name,
            description: description || `Producto de tecnología: ${name}`,
            price,
            category: 'PHYSICAL',
            images: imageUrl ? [normalizeUrl(imageUrl, url)] : [],
            url: normalizeUrl(productUrl, url),
          });
        }
      } catch (error) {
        console.error('Error procesando producto:', error);
      }
    });

    return products;
  } catch (error) {
    console.error(`❌ Error scrapeando ${url}:`, error);
    return [];
  }
}

// Función para extraer detalles de un producto individual
async function scrapeProductDetails(url: string): Promise<Partial<ScrapedProduct>> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 30000,
    });

    const $ = cheerio.load(response.data);

    // Extraer descripción completa
    const description = $('.product-description, .description, [class*="description"]')
      .text()
      .trim()
      .slice(0, 500);

    // Extraer todas las imágenes
    const images: string[] = [];
    $('.product-images img, .gallery img, [class*="image"] img').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src) {
        images.push(normalizeUrl(src, url));
      }
    });

    // Extraer SKU
    const sku = $('.sku, [class*="sku"]').text().trim();

    return {
      description: description || undefined,
      images: images.length > 0 ? images : undefined,
      sku: sku || undefined,
    };
  } catch (error) {
    console.error(`Error obteniendo detalles de ${url}:`, error);
    return {};
  }
}

// Función para normalizar URLs
function normalizeUrl(url: string, baseUrl: string): string {
  if (!url) return '';
  
  if (url.startsWith('http')) {
    return url;
  }
  
  if (url.startsWith('//')) {
    return 'https:' + url;
  }
  
  if (url.startsWith('/')) {
    const base = new URL(baseUrl);
    return `${base.protocol}//${base.host}${url}`;
  }
  
  return url;
}

// Función para parsear precios
function parsePrice(priceText: string): number {
  // Remover símbolos de moneda y texto
  const cleaned = priceText
    .replace(/[^\d.,]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  
  const price = parseFloat(cleaned);
  return isNaN(price) ? 0 : price;
}

// Función para categorizar productos automáticamente
function categorizeProduct(name: string, description: string): string {
  const text = (name + ' ' + description).toLowerCase();
  
  if (text.match(/audífono|auricular|headphone|earbud/i)) return 'Audífonos';
  if (text.match(/cargador|cable|usb|type-c/i)) return 'Cargadores y Cables';
  if (text.match(/smartwatch|reloj|watch/i)) return 'Smartwatches';
  if (text.match(/parlante|speaker|bocina/i)) return 'Parlantes';
  if (text.match(/power bank|batería|powerbank/i)) return 'Power Banks';
  if (text.match(/funda|case|protector/i)) return 'Accesorios';
  if (text.match(/mouse|teclado|keyboard/i)) return 'Periféricos';
  if (text.match(/cámara|camera/i)) return 'Cámaras';
  if (text.match(/luz|led|lámpara/i)) return 'Iluminación';
  
  return 'Tecnología';
}

// Función principal
async function main() {
  console.log('🚀 Iniciando scraping de SmartJoys...\n');

  const baseUrl = 'https://smartjoys.co';
  
  // URLs a scrapear (ajustar según las categorías del sitio)
  const urlsToScrape = [
    `${baseUrl}/`,
    `${baseUrl}/collections/all`,
    `${baseUrl}/collections/audifonos`,
    `${baseUrl}/collections/smartwatch`,
    `${baseUrl}/collections/parlantes`,
    `${baseUrl}/collections/accesorios`,
  ];

  let allProducts: ScrapedProduct[] = [];

  // Scrapear todas las páginas
  for (const url of urlsToScrape) {
    const products = await scrapePage(url);
    allProducts = [...allProducts, ...products];
    
    // Esperar un poco entre requests para no sobrecargar el servidor
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Remover duplicados por nombre
  const uniqueProducts = Array.from(
    new Map(allProducts.map(p => [p.name, p])).values()
  );

  console.log(`\n✅ Total de productos únicos encontrados: ${uniqueProducts.length}`);

  // Enriquecer con detalles (opcional, toma más tiempo)
  console.log('\n📝 Enriqueciendo productos con detalles...');
  
  for (let i = 0; i < Math.min(uniqueProducts.length, 20); i++) {
    const product = uniqueProducts[i];
    if (product.url) {
      const details = await scrapeProductDetails(product.url);
      Object.assign(product, details);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  // Guardar en JSON
  const outputPath = path.join(process.cwd(), 'scripts', 'smartjoys-productos.json');
  fs.writeFileSync(outputPath, JSON.stringify(uniqueProducts, null, 2));
  console.log(`\n💾 Productos guardados en: ${outputPath}`);

  // Preguntar si importar a la base de datos
  console.log('\n¿Deseas importar estos productos a la base de datos? (y/n)');
  
  // Para ejecución automática, descomentar esto:
  // await importToDatabase(uniqueProducts);

  console.log('\n✨ Scraping completado!');
  console.log('\nPara importar a la base de datos, ejecuta:');
  console.log('npx tsx scripts/import-smartjoys.ts');
}

// Función para importar a la base de datos
async function importToDatabase(products: ScrapedProduct[]) {
  console.log('\n📦 Importando productos a la base de datos...');

  // Obtener el primer usuario (admin)
  const user = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!user) {
    console.error('❌ No se encontró un usuario admin. Crea uno primero.');
    return;
  }

  let imported = 0;
  let skipped = 0;

  for (const product of products) {
    try {
      // Verificar si ya existe
      const existing = await prisma.product.findFirst({
        where: {
          name: product.name,
          userId: user.id,
        }
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Crear producto
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          currency: 'COP',
          category: 'PHYSICAL',
          status: 'AVAILABLE',
          images: JSON.stringify(product.images),
          tags: JSON.stringify([
            categorizeProduct(product.name, product.description),
            'dropshipping',
            'smartjoys',
          ]),
          userId: user.id,
        }
      });

      imported++;
    } catch (error) {
      console.error(`Error importando ${product.name}:`, error);
    }
  }

  console.log(`\n✅ Importados: ${imported}`);
  console.log(`⏭️  Omitidos (duplicados): ${skipped}`);
}

// Ejecutar
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
