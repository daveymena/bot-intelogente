/**
 * 👥 Ver usuarios - Script simple
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    console.log('👥 Consultando usuarios...\n')

    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        lastLoginAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (usuarios.length === 0) {
      console.log('❌ No hay usuarios en la base de datos')
      console.log('\n💡 Para crear un usuario admin, ejecuta:')
      console.log('   npx tsx scripts/create-admin.ts')
      return
    }

    console.log(`✅ Encontrados ${usuarios.length} usuario(s):\n`)
    console.log('═'.repeat(80))

    usuarios.forEach((user, index) => {
      console.log(`\n${index + 1}. Usuario:`)
      console.log('   ID:', user.id)
      console.log('   Email:', user.email)
      console.log('   Nombre:', user.name || 'Sin nombre')
      console.log('   Rol:', user.role)
      console.log('   Activo:', user.isActive ? '✅ Sí' : '❌ No')
      console.log('   Email verificado:', user.isEmailVerified ? '✅ Sí' : '❌ No')
      console.log('   Creado:', new Date(user.createdAt).toLocaleString())
      console.log('   Último login:', user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Nunca')
    })

    console.log('\n' + '═'.repeat(80))
    console.log('\n💡 Credenciales de acceso:')
    console.log('   URL: http://localhost:3000')
    console.log('   Email: (ver arriba)')
    console.log('   Contraseña: (la que configuraste)')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
