// Script simple para activar usuarios existentes
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function activarUsuarios() {
  console.log('🔧 Activando usuarios existentes...\n')

  try {
    // Actualizar TODOS los usuarios para que estén activos
    const resultado = await prisma.user.updateMany({
      data: {
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true
      }
    })

    console.log(`✅ ${resultado.count} usuarios activados!\n`)

    // Mostrar todos los usuarios
    const usuarios = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true
      }
    })

    console.log('📋 Usuarios en el sistema:')
    usuarios.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email} - ${user.name || 'Sin nombre'}`)
      console.log(`   ✅ Activo: ${user.isActive}`)
      console.log(`   ✅ Email verificado: ${user.isEmailVerified}`)
      console.log(`   ✅ Teléfono verificado: ${user.isPhoneVerified}`)
      console.log('')
    })

    console.log('✅ ¡Todos pueden hacer login ahora!')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

activarUsuarios()
