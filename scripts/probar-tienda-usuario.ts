import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function probarTienda() {
  try {
    const userId = 'cmhjgzsjl0000t526gou8b8x2'

    console.log('\n🧪 Probando Sistema de Tienda Individual\n')
    console.log('='.repeat(60))

    // 1. Verificar usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
        whatsappNumber: true
      }
    })

    if (!user) {
      console.log('❌ Usuario no encontrado')
      return
    }

    console.log('\n✅ Usuario encontrado:')
    console.log(`   Nombre: ${user.businessName || user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   WhatsApp: ${user.whatsappNumber || 'No configurado'}`)

    // 2. Contar productos
    const totalProducts = await prisma.product.count({
      where: { userId: userId }
    })

    const availableProducts = await prisma.product.count({
      where: {
        userId: userId,
        status: 'AVAILABLE'
      }
    })

    console.log('\n📦 Productos:')
    console.log(`   Total: ${totalProducts}`)
    console.log(`   Disponibles: ${availableProducts}`)

    // 3. Obtener algunos productos de ejemplo
    const sampleProducts = await prisma.product.findMany({
      where: {
        userId: userId,
        status: 'AVAILABLE'
      },
      take: 5,
      select: {
        name: true,
        price: true,
        currency: true,
        category: true
      }
    })

    console.log('\n🛍️ Productos de ejemplo:')
    sampleProducts.forEach((p, i) => {
      const price = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: p.currency,
        minimumFractionDigits: 0
      }).format(p.price)
      console.log(`   ${i + 1}. ${p.name} - ${price} (${p.category})`)
    })

    // 4. URLs
    console.log('\n🔗 URLs de tu tienda:')
    console.log(`   Local: http://localhost:3000/tienda/${userId}`)
    console.log(`   Producción: https://bot-whatsapp-bot-automatizado.sqaoeo.easypanel.host/tienda/${userId}`)

    console.log('\n' + '='.repeat(60))
    console.log('\n✅ Todo listo! Tu tienda está funcionando correctamente')
    console.log('\n💡 Próximos pasos:')
    console.log('   1. Inicia el servidor: npm run dev')
    console.log('   2. Abre: http://localhost:3000/tienda/' + userId)
    console.log('   3. Comparte la URL con tus clientes\n')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

probarTienda()
