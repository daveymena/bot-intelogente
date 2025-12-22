import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function obtenerUrlTienda() {
  try {
    // Buscar usuario por email o nombre
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
        whatsappNumber: true,
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    console.log('\n🏪 URLs de Tiendas Disponibles:\n')
    console.log('=' .repeat(80))

    if (usuarios.length === 0) {
      console.log('❌ No hay usuarios registrados')
      return
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    usuarios.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.businessName || user.name || 'Usuario'}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Productos: ${user._count.products}`)
      console.log(`   WhatsApp: ${user.whatsappNumber || 'No configurado'}`)
      console.log(`   \n   🔗 URL Tienda: ${baseUrl}/tienda/${user.id}`)
      console.log(`   📋 Copiar: /tienda/${user.id}`)
    })

    console.log('\n' + '='.repeat(80))
    console.log('\n💡 Cómo usar:')
    console.log('   1. Copia la URL completa')
    console.log('   2. Compártela con tus clientes')
    console.log('   3. Ellos verán SOLO tus productos (sin login)')
    console.log('\n✅ La tienda es pública pero personalizada por usuario\n')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

obtenerUrlTienda()
