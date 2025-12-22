/**
 * 🔥 IMPORTAR CATÁLOGO TRENDING DIRECTO
 * Importa productos de tecnología trending sin scraping
 */

import dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '@prisma/client'
import { DropshippingPricing } from '../src/lib/dropshipping-pricing'

const prisma = new PrismaClient()

const TRENDING_PRODUCTS = [
  {
    name: 'iPhone 15 Pro Max 256GB',
    description: 'El smartphone más avanzado de Apple con chip A17 Pro, cámara de 48MP y pantalla Super Retina XDR de 6.7"',
    price: 4500000,
    category: 'Celulares',
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Smartphone premium con S Pen, cámara de 200MP, pantalla AMOLED 6.8" y batería de 5000mAh',
    price: 4200000,
    category: 'Celulares',
  },
  {
    name: 'Apple Watch Series 9 GPS 45mm',
    description: 'Smartwatch con pantalla Always-On, sensor de salud avanzado, resistente al agua y batería de 18 horas',
    price: 1800000,
    category: 'Smartwatch',
  },
  {
    name: 'AirPods Pro 2da Gen con USB-C',
    description: 'Audífonos inalámbricos con cancelación activa de ruido, audio espacial y hasta 30 horas de batería',
    price: 950000,
    category: 'Audífonos',
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Audífonos over-ear con la mejor cancelación de ruido del mercado, 30 horas de batería y audio Hi-Res',
    price: 1200000,
    category: 'Audífonos',
  },
  {
    name: 'iPad Air M2 11" 256GB',
    description: 'Tablet potente con chip M2, pantalla Liquid Retina, compatible con Apple Pencil y Magic Keyboard',
    price: 2800000,
    category: 'Tablets',
  },
  {
    name: 'MacBook Air M3 13" 512GB',
    description: 'Laptop ultradelgada con chip M3, pantalla Retina 13.6", hasta 18 horas de batería y diseño premium',
    price: 5500000,
    category: 'Laptops',
  },
  {
    name: 'PlayStation 5 Slim Digital',
    description: 'Consola de nueva generación con SSD ultra rápido, gráficos 4K 120fps y DualSense revolucionario',
    price: 2200000,
    category: 'Gaming',
  },
  {
    name: 'Nintendo Switch OLED',
    description: 'Consola híbrida con pantalla OLED de 7", 64GB de almacenamiento y dock mejorado',
    price: 1400000,
    category: 'Gaming',
  },
  {
    name: 'GoPro HERO 12 Black',
    description: 'Cámara de acción 5.3K60, estabilización HyperSmooth 6.0, resistente al agua hasta 10m',
    price: 1900000,
    category: 'Cámaras',
  },
  {
    name: 'DJI Mini 4 Pro',
    description: 'Drone compacto con cámara 4K HDR, 34 minutos de vuelo, detección de obstáculos omnidireccional',
    price: 3200000,
    category: 'Drones',
  },
  {
    name: 'Samsung Galaxy Buds2 Pro',
    description: 'Audífonos TWS con cancelación de ruido inteligente, audio Hi-Fi 24bit y resistencia IPX7',
    price: 650000,
    category: 'Audífonos',
  },
  {
    name: 'Xiaomi 13T Pro 512GB',
    description: 'Smartphone con cámara Leica, carga rápida 120W, pantalla AMOLED 144Hz y procesador Dimensity 9200+',
    price: 2100000,
    category: 'Celulares',
  },
  {
    name: 'Logitech MX Master 3S',
    description: 'Mouse ergonómico premium con 8K DPI, scroll electromagnético y batería de 70 días',
    price: 420000,
    category: 'Accesorios',
  },
  {
    name: 'Anker PowerCore 20000mAh',
    description: 'Batería portátil de alta capacidad con carga rápida PowerIQ 3.0 y puerto USB-C PD',
    price: 180000,
    category: 'Accesorios',
  },
]

async function importTrending() {
  console.log('🔥 IMPORTANDO CATÁLOGO TRENDING\n')
  console.log('='.repeat(70))

  const adminUser = await prisma.user.findFirst({
    where: { email: 'daveymena16@gmail.com' },
  })

  if (!adminUser) {
    console.log('❌ Usuario admin no encontrado')
    return
  }

  console.log(`\n👤 Usuario: ${adminUser.email}`)
  console.log(`📦 Productos a importar: ${TRENDING_PRODUCTS.length}\n`)
  console.log('─'.repeat(70))

  let imported = 0
  let skipped = 0

  for (const product of TRENDING_PRODUCTS) {
    const pricing = DropshippingPricing.calculateFinalPrice(product.price)

    console.log(`\n📦 ${product.name}`)
    console.log(`   Categoría: ${product.category}`)
    console.log(`   Precio Dropi: $${product.price.toLocaleString('es-CO')}`)
    console.log(`   Precio Venta: $${pricing.sellingPrice.toLocaleString('es-CO')}`)
    console.log(`   💰 Ganancia: $${pricing.profitMargin.toLocaleString('es-CO')}`)

    try {
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: pricing.sellingPrice,
          currency: 'COP',
          category: 'PHYSICAL',
          status: 'AVAILABLE',
          stock: 999,
          userId: adminUser.id,
        },
      })

      imported++
      console.log(`   ✅ Importado`)
    } catch (error: any) {
      if (error.code === 'P2002') {
        skipped++
        console.log(`   ⏭️  Ya existe`)
      } else {
        console.log(`   ❌ Error:`, error.message)
      }
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('\n📊 RESUMEN:\n')
  console.log(`✅ Importados: ${imported}`)
  console.log(`⏭️  Omitidos: ${skipped}`)
  console.log(`📦 Total: ${TRENDING_PRODUCTS.length}`)
  
  if (imported > 0) {
    console.log('\n🎉 CATÁLOGO TRENDING LISTO!')
    console.log('\n🌐 Ver productos en:')
    console.log('   Dashboard: http://localhost:3000/dashboard')
    console.log('   Catálogo: http://localhost:3000/catalogo')
  }
  
  console.log('\n' + '='.repeat(70))
}

importTrending()
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
