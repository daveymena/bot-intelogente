/**
 * Re-importar productos de MegaComputer con fotos actualizadas
 */

import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface MegaComputerProduct {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  url: string;
  sku?: string;
  brand?: string;
  specifications?: Record<string, string>;
}

async function scrapearMegaComputer(): Promise<MegaComputerProduct[]> {
  console.log('🚀 Scrapeando MegaComputer con Puppeteer...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  const productos: MegaComputerProduct[] = [];
  const baseUrl = 'https://megacomputer.com.co';

  // Categorías a scrapear
  const categorias = [
    '/computadores-portatiles',
    '/computadores-escritorio',
    '/monitores',
    '/componentes',
    '/perifericos',
  ];

  try {
    for (const categoria of categorias) {
      console.log(`📂 Categoría: ${categoria}`);
      
      await page.goto(`${baseUrl}${categoria}`, {
        waitUntil: 'networkidle0',
        timeout: 60000,
      });

      await new Promise(resolve => setTimeout(resolve, 3000));

      // Extraer productos de la página
      const productosCategoria = await page.evaluate(() => {
        const items: any[] = [];
        
        document.querySelectorAll('.product-item, .product-card, [class*="product"]').forEach(el => {
          try {
            const link = el.querySelector('a')?.getAttribute('href');
            const nombre = el.querySelector('h2, h3, h4, .title, [class*="title"]')?.textContent?.trim();
            const precioText = el.querySelector('[class*="price"]')?.textContent?.trim();
            const img = el.querySelector('img')?.getAttribute('src');

            if (link && nombre) {
              items.push({
                name: nombre,
                priceText: precioText,
                image: img,
                url: link,
              });
            }
          } catch (error) {
            // Ignorar errores individuales
          }
        });

        return items;
      });

      console.log(`   ✅ Encontrados ${productosCategoria.length} productos\n`);

      // Visitar cada producto para obtener detalles
      for (let i = 0; i < Math.min(productosCategoria.length, 10); i++) {
        const item = productosCategoria[i];
        
        try {
          const productUrl = item.url.startsWith('http') 
            ? item.url 
            : `${baseUrl}${item.url}`;

          console.log(`   📦 [${i + 1}/${productosCategoria.length}] ${item.name.slice(0, 50)}...`);

          await page.goto(productUrl, {
            waitUntil: 'networkidle0',
            timeout: 30000,
          });

          await new Promise(resolve => setTimeout(resolve, 2000));

          // Extraer detalles
          const detalles = await page.evaluate(() => {
            const nombre = document.querySelector('h1, .product-title')?.textContent?.trim() || '';
            const descripcion = document.querySelector('.product-description, [class*="description"]')?.textContent?.trim() || '';
            const precioText = document.querySelector('[class*="price"]:not([class*="compare"])')?.textContent?.trim() || '';
            const sku = document.querySelector('.sku, [class*="sku"]')?.textContent?.trim() || '';
            const marca = document.querySelector('.brand, [class*="brand"]')?.textContent?.trim() || '';

            const imagenes: string[] = [];
            document.querySelectorAll('img[src*="product"], img[src*="cdn"], .product-images img, .gallery img').forEach(img => {
              const src = img.getAttribute('src') || img.getAttribute('data-src');
              if (src && !src.includes('placeholder')) {
                imagenes.push(src);
              }
            });

            const specs: Record<string, string> = {};
            document.querySelectorAll('.specifications li, .specs li, [class*="spec"] li').forEach(li => {
              const text = li.textContent?.trim() || '';
              const parts = text.split(':');
              if (parts.length === 2) {
                specs[parts[0].trim()] = parts[1].trim();
              }
            });

            return {
              nombre,
              descripcion,
              precioText,
              sku,
              marca,
              imagenes,
              specs,
            };
          });

          const precio = parsePrice(detalles.precioText);

          if (precio > 0 && detalles.nombre) {
            productos.push({
              name: detalles.nombre,
              description: detalles.descripcion || `${detalles.nombre} - Producto de tecnología`,
              price: precio,
              category: 'PHYSICAL',
              images: detalles.imagenes.map(img => 
                img.startsWith('http') ? img : `${baseUrl}${img}`
              ),
              url: productUrl,
              sku: detalles.sku,
              brand: detalles.marca,
              specifications: detalles.specs,
            });

            console.log(`      ✅ ${detalles.imagenes.length} imágenes`);
          }

          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
          console.error(`      ❌ Error: ${error}`);
        }
      }

      console.log('');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await browser.close();
  }

  return productos;
}

function parsePrice(priceText: string): number {
  const cleaned = priceText
    .replace(/[^\d.,]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  
  const price = parseFloat(cleaned);
  return isNaN(price) ? 0 : Math.round(price);
}

function categorizarProducto(nombre: string, descripcion: string): string {
  const texto = (nombre + ' ' + descripcion).toLowerCase();
  
  if (texto.match(/laptop|portátil|notebook/i)) return 'Laptops';
  if (texto.match(/pc|desktop|torre|all-in-one/i)) return 'Computadores de Escritorio';
  if (texto.match(/monitor|pantalla/i)) return 'Monitores';
  if (texto.match(/teclado|keyboard/i)) return 'Teclados';
  if (texto.match(/mouse|ratón/i)) return 'Mouse';
  if (texto.match(/procesador|cpu|ryzen|intel/i)) return 'Procesadores';
  if (texto.match(/memoria|ram/i)) return 'Memorias RAM';
  if (texto.match(/disco|ssd|hdd/i)) return 'Almacenamiento';
  if (texto.match(/tarjeta.*video|gpu|gráfica/i)) return 'Tarjetas Gráficas';
  
  return 'Tecnología';
}

async function importarABaseDatos(productos: MegaComputerProduct[]) {
  console.log('\n📦 Importando a base de datos...\n');

  const user = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!user) {
    console.error('❌ No se encontró usuario admin');
    return;
  }

  let importados = 0;
  let actualizados = 0;
  let errores = 0;

  for (const producto of productos) {
    try {
      // Buscar si existe
      const existente = await prisma.product.findFirst({
        where: {
          name: producto.name,
          userId: user.id,
        }
      });

      const categoria = categorizarProducto(producto.name, producto.description);

      if (existente) {
        // Actualizar solo si tiene más imágenes
        const imagenesActuales = existente.images ? JSON.parse(existente.images).length : 0;
        const imagenesNuevas = producto.images.length;

        if (imagenesNuevas > imagenesActuales) {
          await prisma.product.update({
            where: { id: existente.id },
            data: {
              images: JSON.stringify(producto.images),
              description: producto.description,
              price: producto.price,
            }
          });
          actualizados++;
          console.log(`🔄 ${producto.name} (${imagenesActuales} → ${imagenesNuevas} fotos)`);
        }
      } else {
        // Crear nuevo
        await prisma.product.create({
          data: {
            name: producto.name,
            description: producto.description,
            price: producto.price,
            currency: 'COP',
            category: 'PHYSICAL',
            status: 'AVAILABLE',
            images: JSON.stringify(producto.images),
            tags: JSON.stringify([
              categoria,
              'megacomputer',
              'tecnología',
              producto.brand || '',
            ].filter(Boolean)),
            metadata: JSON.stringify({
              supplier: 'MegaComputer',
              supplierUrl: producto.url,
              sku: producto.sku,
              brand: producto.brand,
              specifications: producto.specifications,
            }),
            userId: user.id,
          }
        });
        importados++;
        console.log(`✅ ${producto.name} (${producto.images.length} fotos)`);
      }

    } catch (error) {
      errores++;
      console.error(`❌ Error: ${producto.name}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN');
  console.log('='.repeat(60));
  console.log(`✅ Nuevos: ${importados}`);
  console.log(`🔄 Actualizados: ${actualizados}`);
  console.log(`❌ Errores: ${errores}`);
  console.log(`📦 Total: ${productos.length}`);
  console.log('='.repeat(60) + '\n');
}

async function main() {
  console.log('🚀 RE-IMPORTANDO MEGACOMPUTER\n');
  console.log('='.repeat(60) + '\n');

  // Scrapear
  const productos = await scrapearMegaComputer();

  // Guardar JSON
  const outputPath = path.join(process.cwd(), 'scripts', 'productos-megacomputer-completo.json');
  fs.writeFileSync(outputPath, JSON.stringify(productos, null, 2));
  console.log(`💾 Guardado en: ${outputPath}\n`);

  // Importar
  await importarABaseDatos(productos);

  console.log('✨ Proceso completado!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
