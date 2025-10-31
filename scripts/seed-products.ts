import { PrismaClient, ProductType, ProductStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function seedProducts() {
  try {
    console.log('🌱 Agregando productos de ejemplo...\n')

    // Buscar el usuario admin
    const admin = await prisma.user.findFirst({
      where: {
        email: 'daveymena16@gmail.com'
      }
    })

    if (!admin) {
      console.error('❌ Usuario admin no encontrado')
      console.log('💡 Primero debes crear un usuario admin')
      return
    }

    console.log(`✅ Usuario encontrado: ${admin.email}\n`)

    // Crear productos
    const products = [
      {
        name: 'Laptop HP 15.6"',
        description: 'Laptop HP con procesador Intel Core i5, 8GB RAM, 256GB SSD. Perfecta para trabajo y estudio. Incluye Windows 11 y garantía de 1 año.',
        price: 599.99,
        stock: 15,
        images: JSON.stringify(['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500']),
        tags: JSON.stringify(['laptop', 'hp', 'computadora', 'portatil', 'notebook']),
        autoResponse: 'La Laptop HP 15.6" es una excelente opción para trabajo y estudio. Tiene procesador Intel i5, 8GB RAM y 256GB SSD. Precio: $599.99 con envío gratis. ¿Te gustaría hacer el pedido?'
      },
      {
        name: 'Laptop Dell Inspiron',
        description: 'Laptop Dell Inspiron con Intel Core i7, 16GB RAM, 512GB SSD. Ideal para profesionales y gaming ligero. Pantalla Full HD de 15.6".',
        price: 749.99,
        stock: 10,
        images: JSON.stringify(['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500']),
        tags: JSON.stringify(['laptop', 'dell', 'computadora', 'gaming', 'profesional']),
        autoResponse: 'La Laptop Dell Inspiron es perfecta para profesionales. Intel i7, 16GB RAM, 512GB SSD y pantalla Full HD. Precio: $749.99. ¿Quieres más información?'
      },
      {
        name: 'Mouse Inalámbrico Logitech',
        description: 'Mouse inalámbrico ergonómico Logitech con sensor óptico de alta precisión. Batería de larga duración (hasta 18 meses). Compatible con Windows y Mac.',
        price: 29.99,
        stock: 50,
        images: JSON.stringify(['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500']),
        tags: JSON.stringify(['mouse', 'logitech', 'inalambrico', 'accesorio']),
        autoResponse: 'El Mouse Logitech es ergonómico y de alta precisión. Batería de 18 meses. Solo $29.99. ¿Lo agregamos a tu pedido?'
      },
      {
        name: 'Teclado Mecánico RGB',
        description: 'Teclado mecánico gaming con iluminación RGB personalizable. Switches mecánicos azules, reposamuñecas incluido. Ideal para gaming y programación.',
        price: 89.99,
        stock: 25,
        images: JSON.stringify(['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500']),
        tags: JSON.stringify(['teclado', 'mecanico', 'gaming', 'rgb', 'accesorio']),
        autoResponse: 'El Teclado Mecánico RGB es perfecto para gaming. Switches mecánicos e iluminación personalizable. Precio: $89.99. ¿Te interesa?'
      },
      {
        name: 'Monitor 24" Full HD',
        description: 'Monitor LED de 24 pulgadas Full HD (1920x1080). Panel IPS con ángulos de visión amplios. HDMI y VGA. Perfecto para oficina y entretenimiento.',
        price: 149.99,
        stock: 20,
        images: JSON.stringify(['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500']),
        tags: JSON.stringify(['monitor', 'pantalla', 'display', 'full hd']),
        autoResponse: 'Monitor 24" Full HD con panel IPS. Excelente calidad de imagen. Precio: $149.99 con envío incluido. ¿Lo quieres?'
      },
      {
        name: 'Audífonos Bluetooth Sony',
        description: 'Audífonos inalámbricos Sony con cancelación de ruido activa. Batería de 30 horas, sonido Hi-Res. Perfectos para música y llamadas.',
        price: 199.99,
        stock: 30,
        images: JSON.stringify(['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500']),
        tags: JSON.stringify(['audifonos', 'sony', 'bluetooth', 'inalambrico', 'cancelacion ruido']),
        autoResponse: 'Audífonos Sony con cancelación de ruido y 30 horas de batería. Calidad premium. Precio: $199.99. ¿Te gustaría probarlos?'
      },
      {
        name: 'Webcam HD 1080p',
        description: 'Webcam Full HD 1080p con micrófono integrado. Ideal para videollamadas, streaming y clases online. Plug and play, compatible con todas las plataformas.',
        price: 49.99,
        stock: 40,
        images: JSON.stringify(['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500']),
        tags: JSON.stringify(['webcam', 'camara', 'videollamadas', 'streaming']),
        autoResponse: 'Webcam HD 1080p perfecta para videollamadas y streaming. Micrófono incluido. Solo $49.99. ¿La necesitas?'
      },
      {
        name: 'Disco Duro Externo 1TB',
        description: 'Disco duro externo portátil de 1TB. USB 3.0 para transferencias rápidas. Compacto y resistente. Ideal para backups y almacenamiento.',
        price: 59.99,
        stock: 35,
        images: JSON.stringify(['https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=500']),
        tags: JSON.stringify(['disco duro', 'almacenamiento', 'backup', 'usb']),
        autoResponse: 'Disco Duro Externo 1TB con USB 3.0. Rápido y confiable para tus backups. Precio: $59.99. ¿Lo agregamos?'
      }
    ]

    let count = 0
    for (const product of products) {
      const created = await prisma.product.create({
        data: {
          ...product,
          userId: admin.id,
          currency: 'USD',
          category: ProductType.PHYSICAL,
          status: ProductStatus.AVAILABLE
        }
      })
      console.log(`✅ Producto creado: ${created.name} - $${created.price}`)
      count++
    }

    console.log(`\n🎉 ${count} productos agregados exitosamente!`)
    console.log('\n📊 Resumen:')
    console.log(`   - Usuario: ${admin.email}`)
    console.log(`   - Productos: ${count}`)
    console.log(`   - Total en inventario: $${products.reduce((sum, p) => sum + p.price, 0).toFixed(2)}`)
    console.log('\n💡 Ahora el bot puede recomendar estos productos automáticamente!')
    console.log('🚀 Envía un mensaje de prueba: "Qué productos tienes?"')

  } catch (error) {
    console.error('❌ Error agregando productos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedProducts()
