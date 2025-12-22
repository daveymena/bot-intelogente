/**
 * 👥 Ver usuarios en la base de datos
 */

import { db } from '../src/lib/db'

async function verUsuarios() {
  try {
    console.log('👥 Consultando usuarios...\n')

    const usuarios = await db.user.findMany({
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
      console.log('   Creado:', user.createdAt.toLocaleString())
      console.log('   Último login:', user.lastLoginAt?.toLocaleString() || 'Nunca')
    })

    console.log('\n' + '═'.repeat(80))

  } catch (error) {
    console.error('❌ Error consultando usuarios:', error)
  } finally {
    await db.$disconnect()
  }
}

verUsuarios()
