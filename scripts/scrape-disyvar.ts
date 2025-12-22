/**
 * Script para extraer productos de Disyvar.com.co (Dropshipping)
 * Extrae todo el catálogo de productos y lo guarda en JSON
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

interface DisyvarProduct {
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    category: string;
    subcategory?: string;
    images: string[];
    url: string;
    sku?: string;
    brand?: string;
    stock?: string;
    specifications?: Record<string, string>;
}

// Configuración
const BASE_URL = 'https://disyvar.com.co';
const OUTPUT_FILE = 'scripts/disyvar-productos.json';

// Headers para simular navegador real
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
};

/**
 * Normalizar URLs relativas a absolutas
 */
function normalizeUrl(url: string, baseUrl: string = BASE_URL): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return 'https:' + url;
    if (url.startsWith('/')) return baseUrl + url;
    return baseUrl + '/' + url;
}

/**
 * Parsear precios en formato colombiano
 */
function parsePrice(priceText: string): number {
    if (!priceText) return 0;

    // Remover símbolos y texto, mantener solo números
    const cleaned = priceText
        .replace(/[^\d.,]/g, '')
        .replace(/\./g, '') // Remover puntos de miles
        .replace(',', '.'); // Convertir coma decimal a punto

    const price = parseFloat(cleaned);
    return isNaN(price) ? 0 : Math.round(price);
}

/**
 * Categorizar productos automáticamente
 */
function categorizeProduct(name: string, description: string, urlPath: string): string {
    const text = (name + ' ' + description + ' ' + urlPath).toLowerCase();

    // Categorías principales
    if (text.match(/laptop|portátil|notebook|computador/i)) return 'Laptops';
    if (text.match(/pc|desktop|torre|all-in-one/i)) return 'Computadores de Escritorio';
    if (text.match(/monitor|pantalla|display/i)) return 'Monitores';
    if (text.match(/teclado|keyboard/i)) return 'Teclados';
    if (text.match(/mouse|ratón/i)) return 'Mouse';
    if (text.match(/audífono|auricular|headset|headphone/i)) return 'Audífonos';
    if (text.match(/parlante|speaker|bocina|altavoz/i)) return 'Parlantes';
    if (text.match(/webcam|cámara web/i)) return 'Webcams';
    if (text.match(/micrófono|microphone/i)) return 'Micrófonos';
    if (text.match(/impresora|printer|escáner/i)) return 'Impresoras';
    if (text.match(/router|modem|wifi|red/i)) return 'Redes';
    if (text.match(/disco|ssd|hdd|almacenamiento/i)) return 'Almacenamiento';
    if (text.match(/memoria|ram/i)) return 'Memorias RAM';
    if (text.match(/procesador|cpu|ryzen|intel/i)) return 'Procesadores';
    if (text.match(/tarjeta.*video|gpu|gráfica/i)) return 'Tarjetas Gráficas';
    if (text.match(/fuente.*poder|psu/i)) return 'Fuentes de Poder';
    if (text.match(/case|gabinete|torre/i)) return 'Cases';
    if (text.match(/silla|chair/i)) return 'Sillas Gamer';
    if (text.match(/escritorio|desk|mesa/i)) return 'Escritorios';
    if (text.match(/cable|adaptador|hub/i)) return 'Cables y Adaptadores';
    if (text.match(/cargador|charger/i)) return 'Cargadores';
    if (text.match(/ups|batería|respaldo/i)) return 'UPS y Respaldo';

    return 'Tecnología';
}

/**
 * Extraer productos de una página de listado
 */
async function scrapeProductList(url: string): Promise<DisyvarProduct[]> {
    try {
        console.log(`📥 Scrapeando listado: ${url}`);

        const response = await axios.get(url, {
            headers: HEADERS,
            timeout: 30000,
        });

        const $ = cheerio.load(response.data);
        const products: DisyvarProduct[] = [];

        // Análisis específico para Disyvar (WooCommerce)
        console.log('💡 Analizando estructura de productos...');

        // Buscar productos WooCommerce
        const wooProducts = $('.type-product, .product-type-simple, .product-type-variable');

        if (wooProducts.length > 0) {
            console.log(`✅ Encontrados ${wooProducts.length} productos WooCommerce`);

            wooProducts.each((i, element) => {
                try {
                    const $el = $(element);

                    // Extraer nombre del producto
                    const name = $el.find('.woocommerce-loop-product__title, h2.woocommerce-loop-product__title, h3')
                        .first()
                        .text()
                        .trim();

                    if (!name || name.length < 3) return;

                    // Extraer precio
                    const priceElement = $el.find('.price .woocommerce-Price-amount, .price ins .amount, .price .amount');
                    const priceText = priceElement.first().text().trim();
                    const price = parsePrice(priceText);

                    if (price === 0) return;

                    // Extraer precio original (si hay descuento)
                    const originalPriceElement = $el.find('.price del .amount');
                    const originalPriceText = originalPriceElement.text().trim();
                    const originalPrice = originalPriceText ? parsePrice(originalPriceText) : undefined;

                    // Extraer imagen
                    const img = $el.find('img').first();
                    const imageUrl = img.attr('src') || img.attr('data-src') || img.attr('data-lazy-src') || '';

                    // Extraer URL del producto
                    const productLink = $el.find('a.woocommerce-LoopProduct-link, a').first();
                    const productUrl = productLink.attr('href') || '';

                    // Extraer categorías
                    const categories: string[] = [];
                    $el.find('.posted_in a, .product_meta a[rel="tag"]').each((j, cat) => {
                        categories.push($(cat).text().trim());
                    });

                    // Extraer descripción corta
                    const description = $el.find('.woocommerce-product-details__short-description, .product-short-description')
                        .first()
                        .text()
                        .trim();

                    const fullUrl = normalizeUrl(productUrl);

                    products.push({
                        name,
                        description: description || `${name} - Producto disponible en Disyvar`,
                        price,
                        originalPrice,
                        category: categories[0] || categorizeProduct(name, description, productUrl),
                        subcategory: categories[1],
                        images: imageUrl ? [normalizeUrl(imageUrl)] : [],
                        url: fullUrl,
                    });
                } catch (error) {
                    console.error('Error procesando producto:', error);
                }
            });
        } else {
            // Análisis alternativo más agresivo
            console.log('💡 Intentando análisis alternativo...');

            // Buscar cualquier elemento que tenga precio y título
            $('article, .product, [class*="product"], li.product').each((i, el) => {
                try {
                    const $el = $(el);

                    // Buscar título
                    const name = $el.find('h1, h2, h3, h4, .title, [class*="title"]')
                        .first()
                        .text()
                        .trim();

                    // Buscar precio
                    const priceText = $el.find('.price, [class*="price"], .amount, [class*="precio"]')
                        .first()
                        .text()
                        .trim();

                    const price = parsePrice(priceText);

                    if (name && name.length > 3 && price > 0) {
                        const img = $el.find('img').first();
                        const imageUrl = img.attr('src') || img.attr('data-src') || '';
                        const link = $el.find('a').first().attr('href') || '';

                        products.push({
                            name,
                            description: `${name} - Producto disponible en Disyvar`,
                            price,
                            category: categorizeProduct(name, '', link),
                            images: imageUrl ? [normalizeUrl(imageUrl)] : [],
                            url: normalizeUrl(link),
                        });
                    }
                } catch (error) {
                    // Ignorar errores en análisis alternativo
                }
            });
        }

        return products;
    } catch (error: any) {
        console.error(`❌ Error scrapeando ${url}:`, error.message);
        return [];
    }
}

/**
 * Extraer detalles completos de un producto individual
 */
async function scrapeProductDetails(url: string): Promise<Partial<DisyvarProduct>> {
    try {
        console.log(`  📄 Obteniendo detalles de: ${url}`);

        const response = await axios.get(url, {
            headers: HEADERS,
            timeout: 30000,
        });

        const $ = cheerio.load(response.data);

        // Descripción completa
        const description = $('.product-description, .description, [class*="description"]')
            .text()
            .trim()
            .slice(0, 1000);

        // Todas las imágenes
        const images: string[] = [];
        $('.product-images img, .gallery img, [class*="image"] img, [class*="gallery"] img').each((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy');
            if (src && !src.includes('placeholder')) {
                images.push(normalizeUrl(src));
            }
        });

        // SKU
        const sku = $('.sku, [class*="sku"], [class*="codigo"]')
            .text()
            .trim()
            .replace(/SKU:|Código:|Ref:/gi, '')
            .trim();

        // Marca
        const brand = $('.brand, [class*="brand"], [class*="marca"]')
            .first()
            .text()
            .trim();

        // Stock
        const stock = $('.stock, [class*="stock"], [class*="disponibilidad"]')
            .first()
            .text()
            .trim();

        // Especificaciones técnicas
        const specifications: Record<string, string> = {};
        $('.specifications li, .specs li, [class*="spec"] li').each((i, el) => {
            const text = $(el).text().trim();
            const parts = text.split(':');
            if (parts.length === 2) {
                specifications[parts[0].trim()] = parts[1].trim();
            }
        });

        return {
            description: description || undefined,
            images: images.length > 0 ? images : undefined,
            sku: sku || undefined,
            brand: brand || undefined,
            stock: stock || undefined,
            specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
        };
    } catch (error: any) {
        console.error(`  ❌ Error obteniendo detalles: ${error.message}`);
        return {};
    }
}

/**
 * Descubrir categorías y páginas del sitio
 */
async function discoverCategories(): Promise<string[]> {
    try {
        console.log('🔍 Descubriendo categorías del sitio...\n');

        const response = await axios.get(BASE_URL, {
            headers: HEADERS,
            timeout: 30000,
        });

        const $ = cheerio.load(response.data);
        const categories: Set<string> = new Set();

        // Buscar enlaces de categorías
        $('a[href*="categoria"], a[href*="category"], a[href*="productos"], a[href*="products"], nav a, .menu a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && !href.includes('#') && !href.includes('javascript')) {
                categories.add(normalizeUrl(href));
            }
        });

        const categoryList = Array.from(categories).filter(url =>
            url.includes(BASE_URL) &&
            !url.includes('carrito') &&
            !url.includes('cart') &&
            !url.includes('checkout') &&
            !url.includes('cuenta') &&
            !url.includes('account')
        );

        console.log(`✅ Encontradas ${categoryList.length} posibles categorías\n`);
        return categoryList;
    } catch (error: any) {
        console.error('❌ Error descubriendo categorías:', error.message);
        return [BASE_URL];
    }
}

/**
 * Función principal
 */
async function main() {
    console.log('🚀 Iniciando scraping de Disyvar.com.co\n');
    console.log('='.repeat(60));
    console.log('\n');

    let allProducts: DisyvarProduct[] = [];

    // Descubrir categorías automáticamente
    const categories = await discoverCategories();

    // Agregar página principal y algunas URLs comunes
    const urlsToScrape = [
        BASE_URL,
        `${BASE_URL}/productos`,
        `${BASE_URL}/products`,
        `${BASE_URL}/tienda`,
        `${BASE_URL}/shop`,
        ...categories.slice(0, 10), // Limitar a 10 categorías para no sobrecargar
    ];

    // Remover duplicados
    const uniqueUrls = Array.from(new Set(urlsToScrape));

    console.log(`📋 URLs a scrapear: ${uniqueUrls.length}\n`);

    // Scrapear todas las páginas
    for (let i = 0; i < uniqueUrls.length; i++) {
        const url = uniqueUrls[i];
        console.log(`[${i + 1}/${uniqueUrls.length}] Procesando...`);

        const products = await scrapeProductList(url);

        if (products.length > 0) {
            console.log(`  ✅ Encontrados ${products.length} productos`);
            allProducts = [...allProducts, ...products];
        } else {
            console.log(`  ⚠️ No se encontraron productos`);
        }

        console.log('');

        // Esperar entre requests para no sobrecargar el servidor
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Remover duplicados por nombre y URL
    const uniqueProducts = Array.from(
        new Map(allProducts.map(p => [`${p.name}-${p.url}`, p])).values()
    );

    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ Total de productos únicos encontrados: ${uniqueProducts.length}\n`);

    if (uniqueProducts.length === 0) {
        console.log('⚠️ No se encontraron productos. Posibles razones:');
        console.log('   - El sitio requiere JavaScript para cargar productos');
        console.log('   - El sitio tiene protección anti-scraping');
        console.log('   - Los selectores necesitan ajuste manual');
        console.log('\n💡 Intenta visitar el sitio manualmente y revisar su estructura');
        return;
    }

    // Enriquecer productos con detalles (primeros 50 para no tardar mucho)
    const productsToEnrich = Math.min(uniqueProducts.length, 50);
    console.log(`📝 Enriqueciendo ${productsToEnrich} productos con detalles completos...\n`);

    for (let i = 0; i < productsToEnrich; i++) {
        const product = uniqueProducts[i];
        if (product.url && product.url !== BASE_URL) {
            console.log(`[${i + 1}/${productsToEnrich}] ${product.name.slice(0, 50)}...`);
            const details = await scrapeProductDetails(product.url);
            Object.assign(product, details);
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }

    // Guardar en JSON
    const outputPath = path.join(process.cwd(), OUTPUT_FILE);
    fs.writeFileSync(outputPath, JSON.stringify(uniqueProducts, null, 2), 'utf-8');

    console.log('\n' + '='.repeat(60));
    console.log(`\n💾 Productos guardados en: ${outputPath}`);
    console.log(`📊 Total de productos: ${uniqueProducts.length}`);

    // Estadísticas por categoría
    const categoryCounts: Record<string, number> = {};
    uniqueProducts.forEach(p => {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    console.log('\n📈 Productos por categoría:');
    Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, count]) => {
            console.log(`   ${cat}: ${count}`);
        });

    console.log('\n✨ Scraping completado exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Revisar el archivo JSON generado');
    console.log('   2. Ejecutar: npx tsx scripts/import-disyvar.ts');
    console.log('   3. Los productos estarán disponibles para dropshipping\n');
}

// Ejecutar
main().catch(error => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
});
