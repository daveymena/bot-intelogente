import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🛍️ Agregando productos con imágenes reales...\n')

  // Buscar usuario admin
  const user = await prisma.user.findFirst({
    where: { email: 'daveymena16@gmail.com' }
  })

  if (!user) {
    console.error('❌ Usuario no encontrado')
    return
  }

  // Productos con imágenes reales
  const productos = [
    {
      name: 'AirPods Pro 1.1',
      description: 'La mejor calidad del mercado. AirPods inalámbricos con un diseño de cargador portátil, excelente sonido y bajos de alta calidad. Perfectos para música, llamadas y contenido multimedia.',
      price: 64900,
      currency: 'COP',
      category: 'PHYSICAL' as const,
      status: 'AVAILABLE' as const,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800',
        'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800',
        'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800'
      ]),
      tags: JSON.stringify(['audio', 'bluetooth', 'inalámbrico', 'apple']),
      stock: 50,
      autoResponse: '¡Excelente elección! Los AirPods Pro 1.1 tienen cancelación de ruido activa y sonido de alta calidad. ¿Te gustaría conocer las opciones de pago?'
    },
    {
      name: 'iPhone 15 Pro Max 256GB',
      description: 'El iPhone más avanzado. Pantalla Super Retina XDR de 6.7", chip A17 Pro, sistema de cámaras profesional con zoom óptico 5x, titanio aeroespacial y USB-C.',
      price: 5499000,
      currency: 'COP',
      category: 'PHYSICAL' as const,
      status: 'AVAILABLE' as const,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
        'https://images.unsplash.com/photo-1695048133082-1c3b7c8c6b0f?w=800',
        'https://images.unsplash.com/photo-1695048064236-f9f5f0e6f0e0?w=800'
      ]),
      tags: JSON.stringify(['smartphone', 'apple', 'iphone', '5g']),
      stock: 15,
      autoResponse: 'El iPhone 15 Pro Max es el más potente de Apple. Incluye garantía de 1 año y envío gratis. ¿Quieres más información?'
    },
    {
      name: 'Samsung Galaxy S24 Ultra 512GB',
      description: 'Potencia extrema con Galaxy AI. Pantalla Dynamic AMOLED 2X de 6.8", S Pen integrado, cámara de 200MP, procesador Snapdragon 8 Gen 3 y batería de 5000mAh.',
      price: 5299000,
      currency: 'COP',
      category: 'PHYSICAL' as const,
      status: 'AVAILABLE' as const,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800'
      ]),
      tags: JSON.stringify(['smartphone', 'samsung', 'android', '5g']),
      stock: 20,
      autoResponse: 'El Galaxy S24 Ultra tiene la mejor cámara del mercado con 200MP. Perfecto para fotografía profesional. ¿Te interesa?'
    },
    {
      name: 'Apple Watch Series 9 GPS 45mm',
      description: 'El reloj inteligente más avanzado. Pantalla Retina siempre activa, chip S9, detección de accidentes, seguimiento de salud avanzado y resistencia al agua.',
      price: 1899000,
      currency: 'COP',
      category: 'PHYSICAL' as const,
      status: 'AVAILABLE' as const,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800',
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800',
        'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800'
      ]),
      tags: JSON.stringify(['smartwatch', 'apple', 'fitness', 'salud']),
      stock: 30,
      autoResponse: 'El Apple Watch Series 9 es perfecto para fitness y salud. Monitorea tu corazón, sueño y actividad física. ¿Quieres saber más?'
    },
    {
      name: 'MacBook Air M3 13" 256GB',
      description: 'Ultraligera y potente. Chip M3 de Apple, pantalla Liquid Retina de 13.6", hasta 18 horas de batería, diseño delgado en aluminio y cámara FaceTime HD 1080p.',
      price: 4799000,
      currency: 'COP',
      category: 'PHYSICAL' as const,
      status: 'AVAILABLE' as const,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800'
      ]),
      tags: JSON.stringify(['laptop', 'apple', 'macbook', 'portátil']),
      stock: 10,
      autoResponse: 'La MacBook Air M3 es perfecta para trabajo y estudio. Súper rápida y con batería de todo el día. ¿Te gustaría financiarla?'
    },
    {
      name: 'Sony WH-1000XM5 Audífonos',
      description: 'La mejor cancelación de ruido del mundo. Audio de alta resolución, 30 horas de batería, carga rápida, micrófono con IA y diseño premium ultraligero.',
      price: 1299000,
      currency: 'COP',
      category: 'PHYSICAL' as const,
      status: 'AVAILABLE' as const,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'
      ]),
      tags: JSON.stringify(['audio', 'audífonos', 'sony', 'bluetooth']),
      stock: 25,
      autoResponse: 'Los Sony WH-1000XM5 son los mejores audífonos con cancelación de ruido. Perfectos para viajes y trabajo. ¿Quieres probarlos?'
    },
    {
      name: 'iPad Pro 12.9" M2 256GB',
      description: 'La tablet más poderosa. Chip M2, pantalla Liquid Retina XDR, cámara TrueDepth, compatible con Apple Pencil y Magic Keyboard. Perfecta para creativos.',
      price: 5199000,
      currency: 'COP',
      category: 'PHYSICAL' as const,
      status: 'AVAILABLE' as const,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
        'https://images.unsplash.com/photo-1585790050230-5dd28404f1b4?w=800',
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800'
      ]),
      tags: JSON.stringify(['tablet', 'apple', 'ipad', 'creatividad']),
      stock: 12,
      autoResponse: 'El iPad Pro 12.9" es perfecto para diseño, edición de video y productividad. ¿Te interesa con Apple Pencil?'
    },
    {
      name: 'PlayStation 5 Slim Digital',
      description: 'La consola de nueva generación. SSD ultra rápido, gráficos 4K a 120fps, audio 3D Tempest, DualSense con retroalimentación háptica y 1TB de almacenamiento.',
      price: 2299000,
      currency: 'COP',
      category: 'PHYSICAL' as const,
      status: 'AVAILABLE' as const,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800',
        'https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=800',
        'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=800'
      ]),
      tags: JSON.stringify(['gaming', 'consola', 'playstation', 'ps5']),
      stock: 8,
      autoResponse: 'La PS5 Slim Digital es la consola más potente. Incluye 2 controles y envío gratis. ¿Quieres agregarla al carrito?'
    }
  ]

  // Crear productos
  for (const producto of productos) {
    const created = await prisma.product.create({
      data: {
        ...producto,
        userId: user.id
      }
    })
    console.log(`✅ ${created.name} - ${created.price.toLocaleString('es-CO')} COP`)
  }

  console.log(`\n🎉 ${productos.length} productos agregados exitosamente!`)
  console.log('\n📊 Resumen:')
  console.log(`   - Usuario: ${user.email}`)
  console.log(`   - Productos: ${productos.length}`)
  console.log(`   - Total en inventario: ${productos.reduce((sum, p) => sum + p.price, 0).toLocaleString('es-CO')} COP`)
  console.log('\n💡 Todos los productos tienen imágenes reales de Unsplash!')
  console.log('🚀 Recarga la tienda para verlos: http://localhost:3000/tienda')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
