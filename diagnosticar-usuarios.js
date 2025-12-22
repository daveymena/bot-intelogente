/**
 * Script de diagnóstico para verificar usuarios existentes en la base de datos
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function diagnosticarUsuarios() {
  console.log('🔍 DIAGNÓSTICO DE USUARIOS EXISTENTES\n')

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        _count: {
          select: { products: true }
        }
      }
    })

    console.log(`📊 Total de usuarios: ${users.length}\n`)

    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.name || 'Sin nombre'} - ${user.email}`)
      console.log(`   📧 Email: ${user.email}`)
      console.log(`   📱 Teléfono: ${user.phone || 'N/A'}`)
      console.log(`   📦 Productos: ${user._count.products}`)
      console.log(`   🆔 ID: ${user.id}`)
      console.log(`   📅 Creado: ${user.createdAt.toLocaleDateString('es-CO')}\n`)
    })

    // Buscar específicamente el usuario mencionado
    const targetUser = users.find(u => u.email.includes('daeymena16'))
    if (targetUser) {
      console.log('🎯 USUARIO ENCONTRADO (daeymena16):\n')
      console.log(`   📧 Email: ${targetUser.email}`)
      console.log(`   📦 Productos: ${targetUser._count.products}`)
      console.log(`   🆔 ID: ${targetUser.id}\n`)

      // Mostrar productos de este usuario
      if (targetUser._count.products > 0) {
        const products = await prisma.product.findMany({
          where: { userId: targetUser.id },
          select: {
            id: true,
            name: true,
            price: true,
            category: true,
            status: true
          }
        })

        console.log('📦 PRODUCTOS DEL USUARIO:\n')
        products.forEach((p, i) => {
          console.log(`${i + 1}. ${p.name}`)
          console.log(`   💰 Precio: ${p.price.toLocaleString('es-CO')} COP`)
          console.log(`   📁 Categoría: ${p.category}`)
          console.log(`   📊 Status: ${p.status}\n`)
        })
      } else {
        console.log('❌ Este usuario no tiene productos asociados\n')
      }
    } else {
      console.log('❌ No se encontró usuario con email que contenga "daeymena16"\n')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

diagnosticarUsuarios()