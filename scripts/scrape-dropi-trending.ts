/**
 * 🔥 SCRAPER DE PRODUCTOS TRENDING DE DROPI
 * Extrae los productos más vendidos y de moda para catálogo demo
 */

import puppeteer from 'puppeteer'
import { PrismaClient } from '@prisma/client'
import { DropshippingPricing } from '../src/lib/dropshipping-pricing'

const prisma = new PrismaClient()

interface TrendingProduct {
  name: string
  description: string
  price: number
  images: string[]
  category: string
  url: string
  rating?: number
  sales?: number
}

// Categorías trending para buscar
const TRENDING_CATEGORIES = [
  'celulares',
  'smartwatch',
  'audifonos',
  'gadgets',
  'tecnologia',
  'gaming',
  'accesorios-tech',
  'electronica',
]

// URLs de tiendas populares en Dropi
const POPULAR_STORES = [
  'https://app.dropi.co/store/smartjoys',
  'https://app.dropi.co/store/techstore',
  'https://app.dropi.co/store/gadgetscol',
  'https://app.dropi.co/marketplace/trending',
  'https://app.dropi.co/marketplace/best-sellers',
]

async function scrapeTrendingProducts(): Promise<TrendingProduct[]> {
  console.log('🔥 Iniciando scraping de productos trending de Dropi...\n')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const products: TrendingProduct[] = []

  try {
    const page = await browser.newPage()
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    )

    // Scrape cada tienda popular
    for (const storeUrl of POPULAR_STORES) {
      console.log(`📦 Scrapeando: ${storeUrl}`)

      try {
        await page.goto(storeUrl, { waitForTimeout: 5000, timeout: 30000 })

        // Esperar a que carguen los productos
        await page.waitForSelector('.product-card, .product-item, [class*="product"]', {
          timeout: 10000,
        }).catch(() => console.log('   ⚠️  No se encontraron productos'))

        // Extraer productos
        const storeProducts = await page.evaluate(() => {
          const productElements = document.querySelectorAll(
            '.product-card, .product-item, [class*="product"]'
          )

          return Array.from(productElements).slice(0, 10).map((el) => {
            const name = el.querySelector('h3, h4, .product-name, [class*="name"]')?.textContent?.trim() || ''
            const priceText = el.querySelector('.price, [class*="price"]')?.textContent?.trim() || '0'
            const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0
            const img = el.querySelector('img')?.src || ''
            const link = el.querySelector('a')?.href || ''

            return { name, price, img, link }
          }).filter(p => p.name && p.price > 0)
        })

        console.log(`   ✅ ${storeProducts.length} productos encontrados`)

        // Agregar a la lista
        storeProducts.forEach((p: any) => {
          products.push({
            name: p.name,
            description: `Producto trending de tecnología. ${p.name}`,
            price: p.price,
            images: p.img ? [p.img] : [],
            category: 'Tecnología',
            url: p.link,
          })
        })

        // Esperar un poco entre requests
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        console.log(`   ❌ Error en ${storeUrl}:`, error)
      }
    }

    // Si no encontramos productos con scraping, usar productos demo
    if (products.length === 0) {
      console.log('\n⚠️  No se pudieron scrapear productos. Usando catálogo demo...\n')
      return getDemoTrendingProducts()
    }

  } finally {
    await browser.close()
  }

  return products
}

// Productos demo trending (backup si el scraping falla)
function getDemoTrendingProducts(): TrendingProduct[] {
  return [
    {
      name: 'iPhone 15 Pro Max 256GB',
      description: 'El smartphone más avanzado de Apple con chip A17 Pro, cámara de 48MP y pantalla Super Retina XDR de 6.7"',
      price: 4500000,
      images: ['https://via.placeholder.com/500x500?text=iPhone+15+Pro'],
      category: 'Celulares',
      url: 'https://app.dropi.co',
      rating: 4.9,
      sales: 1250,
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Smartphone premium con S Pen, cámara de 200MP, pantalla AMOLED 6.8" y batería de 5000mAh',
      price: 4200000,
      images: ['https://via.placeholder.com/500x500?text=Galaxy+S24'],
      category: 'Celulares',
      url: 'https://app.dropi.co',
      rating: 4.8,
      sales: 980,
    },
    {
      name: 'Apple Watch Series 9 GPS 45mm',
      description: 'Smartwatch con pantalla Always-On, sensor de salud avanzado, resistente al agua y batería de 18 horas',
      price: 1800000,
      images: ['https://via.placeholder.com/500x500?text=Apple+Watch'],
      category: 'Smartwatch',
      url: 'https://app.dropi.co',
      rating: 4.9,
      sales: 2100,
    },
    {
      name: 'AirPods Pro 2da Gen con USB-C',
      description: 'Audífonos inalámbricos con cancelación activa de ruido, audio espacial y hasta 30 horas de batería',
      price: 950000,
      images: ['https://via.placeholder.com/500x500?text=AirPods+Pro'],
      category: 'Audífonos',
      url: 'https://app.dropi.co',
      rating: 4.8,
      sales: 3500,
    },
    {
      name: 'Sony WH-1000XM5',
      description: 'Audífonos over-ear con la mejor cancelación de ruido del mercado, 30 horas de batería y audio Hi-Res',
      price: 1200000,
      images: ['https://via.placeholder.com/500x500?text=Sony+XM5'],
      category: 'Audífonos',
      url: 'https://app.dropi.co',
      rating: 4.9,
      sales: 1800,
    },
    {
      name: 'iPad Air M2 11" 256GB',
      description: 'Tablet potente con chip M2, pantalla Liquid Retina, compatible con Apple Pencil y Magic Keyboard',
      price: 2800000,
      images: ['https://via.placeholder.com/500x500?text=iPad+Air'],
      category: 'Tablets',
      url: 'https://app.dropi.co',
      rating: 4.8,
      sales: 750,
    },
    {
      name: 'MacBook Air M3 13" 512GB',
      description: 'Laptop ultradelgada con chip M3, pantalla Retina 13.6", hasta 18 horas de batería y diseño premium',
      price: 5500000,
      images: ['https://via.placeholder.com/500x500?text=MacBook+Air'],
      category: 'Laptops',
      url: 'https://app.dropi.co',
      rating: 4.9,
      sales: 650,
    },
    {
      name: 'PlayStation 5 Slim Digital',
      description: 'Consola de nueva generación con SSD ultra rápido, gráficos 4K 120fps y DualSense revolucionario',
      price: 2200000,
      images: ['https://via.placeholder.com/500x500?text=PS5'],
      category: 'Gaming',
      url: 'https://app.dropi.co',
      rating: 4.9,
      sales: 1500,
    },
    {
      name: 'Nintendo Switch OLED',
      description: 'Consola híbrida con pantalla OLED de 7", 64GB de almacenamiento y dock mejorado',
      price: 1400000,
      images: ['https://via.placeholder.com/500x500?text=Switch+OLED'],
      category: 'Gaming',
      url: 'https://app.dropi.co',
      rating: 4.8,
      sales: 2200,
    },
    {
      name: 'GoPro HERO 12 Black',
      description: 'Cámara de acción 5.3K60, estabilización HyperSmooth 6.0, resistente al agua hasta 10m',
      price: 1900000,
      images: ['https://via.placeholder.com/500x500?text=GoPro+12'],
      category: 'Cámaras',
      url: 'https://app.dropi.co',
      rating: 4.7,
      sales: 850,
    },
    {
      name: 'DJI Mini 4 Pro',
      description: 'Drone compacto con cámara 4K HDR, 34 minutos de vuelo, detección de obstáculos omnidireccional',
      price: 3200000,
      images: ['https://via.placeholder.com/500x500?text=DJI+Mini'],
      category: 'Drones',
      url: 'https://app.dropi.co',
      rating: 4.8,
      sales: 420,
    },
    {
      name: 'Samsung Galaxy Buds2 Pro',
      description: 'Audífonos TWS con cancelación de ruido inteligente, audio Hi-Fi 24bit y resistencia IPX7',
      price: 650000,
      images: ['https://via.placeholder.com/500x500?text=Buds2+Pro'],
      category: 'Audífonos',
      url: 'https://app.dropi.co',
      rating: 4.7,
      sales: 2800,
    },
    {
      name: 'Xiaomi 13T Pro 512GB',
      description: 'Smartphone con cámara Leica, carga rápida 120W, pantalla AMOLED 144Hz y procesador Dimensity 9200+',
      price: 2100000,
      images: ['https://via.placeholder.com/500x500?text=Xiaomi+13T'],
      category: 'Celulares',
      url: 'https://app.dropi.co',
      rating: 4.6,
      sales: 1100,
    },
    {
      name: 'Logitech MX Master 3S',
      description: 'Mouse ergonómico premium con 8K DPI, scroll electromagnético y batería de 70 días',
      price: 420000,
      images: ['https://via.placeholder.com/500x500?text=MX+Master'],
      category: 'Accesorios',
      url: 'https://app.dropi.co',
      rating: 4.9,
      sales: 1900,
    },
    {
      name: 'Anker PowerCore 20000mAh',
      description: 'Batería portátil de alta capacidad con carga rápida PowerIQ 3.0 y puerto USB-C PD',
      price: 180000,
      images: ['https://via.placeholder.com/500x500?text=Anker+Power'],
      category: 'Accesorios',
      url: 'https://app.dropi.co',
      rating: 4.7,
      sales: 4500,
    },
  ]
}

async function importTrendingProducts() {
  console.log('🔥 IMPORTADOR DE PRODUCTOS TRENDING\n')
  console.log('='.repeat(70))

  // Obtener productos (scraping o demo)
  const products = await scrapeTrendingProducts()

  console.log(`\n📦 ${products.length} productos trending encontrados\n`)
  console.log('─'.repeat(70))

  // Obtener usuario admin
  const adminUser = await prisma.user.findFirst({
    where: { email: 'daveymena16@gmail.com' },
  })

  if (!adminUser) {
    console.log('❌ Usuario admin no encontrado')
    return
  }

  let imported = 0
  let skipped = 0

  for (const product of products) {
    try {
      // Calcular precio con ganancia
      const pricing = DropshippingPricing.calculateFinalPrice(product.price)

      console.log(`\n📦 ${product.name}`)
      console.log(`   Precio Dropi: $${product.price.toLocaleString('es-CO')}`)
      console.log(`   Precio Venta: $${pricing.sellingPrice.toLocaleString('es-CO')}`)
      console.log(`   Ganancia: $${pricing.profitMargin.toLocaleString('es-CO')} 💰`)

      // Crear producto en la base de datos
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: pricing.sellingPrice,
          currency: 'COP',
          category: 'PHYSICAL',
          status: 'AVAILABLE',
          images: JSON.stringify(product.images),
          stock: 999, // Stock "ilimitado" para dropshipping
          userId: adminUser.id,
        },
      })

      imported++
      console.log(`   ✅ Importado`)
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`   ⏭️  Ya existe`)
        skipped++
      } else {
        console.log(`   ❌ Error:`, error.message)
      }
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('\n📊 RESUMEN:\n')
  console.log(`✅ Importados: ${imported}`)
  console.log(`⏭️  Omitidos: ${skipped}`)
  console.log(`📦 Total: ${products.length}`)
  console.log('\n💰 CATÁLOGO DEMO LISTO PARA PUBLICITAR')
  console.log('\n🌐 Ver en: http://localhost:3000/catalogo')
  console.log('\n' + '='.repeat(70))
}

importTrendingProducts()
  .then(() => {
    console.log('\n✅ Importación completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
