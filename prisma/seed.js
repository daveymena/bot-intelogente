/**
 * Seed script para poblar la base de datos con datos iniciales
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  try {
    // Crear usuario real basado en la configuración
    const hashedPassword = await bcrypt.hash('6715320Dvd.', 10)

    const user = await prisma.user.upsert({
      where: { email: 'daveymena16@gmail.com' },
      update: {},
      create: {
        email: 'daveymena16@gmail.com',
        name: 'Davey Mena',
        password: hashedPassword,
        phone: '+573005560186',
        role: 'ADMIN',
        membershipType: 'PROFESSIONAL',
        isActive: true,
        isEmailVerified: true,
        businessName: 'Tecnovariedades D&S',
        whatsappNumber: '+573005560186'
      }
    })

    console.log('✅ Usuario creado:', user.name)

    // Crear productos de prueba
    const products = [
      {
        name: 'iPhone 15 Pro Max',
        description: 'El último iPhone con chip A17 Pro, 1TB de almacenamiento, pantalla Super Retina XDR de 6.7 pulgadas.',
        price: 6500000,
        category: 'PHYSICAL',
        status: 'AVAILABLE',
        images: JSON.stringify([
          '/placeholder-product.svg'
        ]),
        tags: JSON.stringify(['iphone', 'celular', 'apple', 'tecnologia']),
        paymentLinkMercadoPago: 'https://mpago.la/iphone15',
        paymentLinkPayPal: 'https://paypal.me/iphone15',
        paymentLinkCustom: 'https://hotmart.com/iphone15',
        userId: user.id
      },
      {
        name: 'MacBook Pro M3',
        description: 'Laptop profesional con chip M3, 16GB RAM, 512GB SSD, pantalla Liquid Retina XDR.',
        price: 8500000,
        category: 'PHYSICAL',
        status: 'AVAILABLE',
        images: JSON.stringify([
          '/placeholder-product.svg'
        ]),
        tags: JSON.stringify(['macbook', 'laptop', 'apple', 'computador']),
        paymentLinkMercadoPago: 'https://mpago.la/macbook',
        paymentLinkPayPal: 'https://paypal.me/macbook',
        userId: user.id
      },
      {
        name: 'Curso de Piano Online',
        description: 'Aprende a tocar piano desde cero con lecciones profesionales. Incluye teoría musical, práctica y ejercicios.',
        price: 150000,
        category: 'DIGITAL',
        status: 'AVAILABLE',
        images: JSON.stringify([
          'https://example.com/piano-course.jpg'
        ]),
        tags: JSON.stringify(['piano', 'musica', 'curso', 'online', 'educacion']),
        paymentLinkMercadoPago: 'https://mpago.la/piano',
        paymentLinkPayPal: 'https://paypal.me/piano',
        userId: user.id
      },
      {
        name: 'Servicio de Reparación de Celulares',
        description: 'Reparación profesional de celulares. Cambio de pantalla, batería, software. Garantía incluida.',
        price: 80000,
        category: 'SERVICE',
        status: 'AVAILABLE',
        tags: JSON.stringify(['reparacion', 'celular', 'servicio', 'mantenimiento']),
        paymentLinkMercadoPago: 'https://mpago.la/reparacion',
        userId: user.id
      },
      {
        name: 'Audífonos Sony WH-1000XM5',
        description: 'Audífonos inalámbricos con cancelación de ruido líder en la industria. 30 horas de batería.',
        price: 1200000,
        category: 'PHYSICAL',
        status: 'AVAILABLE',
        images: JSON.stringify([
          'https://example.com/sony-headphones.jpg'
        ]),
        tags: JSON.stringify(['audifonos', 'sony', 'bluetooth', 'musica']),
        paymentLinkMercadoPago: 'https://mpago.la/sony',
        paymentLinkPayPal: 'https://paypal.me/sony',
        userId: user.id
      }
    ]

    for (const productData of products) {
      const product = await prisma.product.upsert({
        where: {
          id: `${user.id}-${productData.name.toLowerCase().replace(/\s+/g, '-')}`
        },
        update: {},
        create: {
          ...productData,
          id: `${user.id}-${productData.name.toLowerCase().replace(/\s+/g, '-')}`
        }
      })
      console.log('✅ Producto creado:', product.name)
    }

    // Crear configuración de pagos
    await prisma.paymentConfig.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        mercadoPagoEnabled: true,
        paypalEnabled: true,
        bankTransferEnabled: true,
        nequiEnabled: true,
        daviplataEnabled: true,
        contactPhone: '+57 304 274 8687',
        contactEmail: 'deinermen25@gmail.com',
        contactAddress: 'Centro Comercial El Diamante 2, San Nicolás, Cali'
      }
    })

    console.log('✅ Configuración de pagos creada')

    // Crear configuración de la tienda
    await prisma.storeSettings.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        storeName: 'Tecnovariedades D&S',
        storeSlogan: 'Tecnología y Variedades',
        description: 'Tienda especializada en productos tecnológicos y servicios de reparación',
        email: 'deinermen25@gmail.com',
        phone: '+57 304 274 8687',
        whatsapp: '+573042748687',
        address: 'Centro Comercial El Diamante 2, San Nicolás, Cali',
        currency: 'COP',
        language: 'es',
        timezone: 'America/Bogota'
      }
    })

    console.log('✅ Configuración de tienda creada')

    console.log('\n🎉 Seed completado exitosamente!')
    console.log(`📊 Resumen:`)
    console.log(`   👤 Usuarios: 1`)
    console.log(`   📦 Productos: ${products.length}`)
    console.log(`   ⚙️  Configuraciones: creadas`)

  } catch (error) {
    console.error('❌ Error en seed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })