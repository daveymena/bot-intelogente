// Script para verificar manualmente usuarios que no recibieron email
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verificarUsuariosManualmente() {
  console.log('🔧 Verificando usuarios manualmente...\n')

  try {
    // Buscar usuarios no verificados
    const usuariosNoVerificados = await prisma.user.findMany({
      where: {
        OR: [
          { isEmailVerified: false },
          { isPhoneVerified: false },
          { isActive: false }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        createdAt: true
      }
    })

    if (usuariosNoVerificados.length === 0) {
      console.log('✅ No hay usuarios pendientes de verificación')
      return
    }

    console.log(`📋 Encontrados ${usuariosNoVerificados.length} usuarios no verificados:\n`)

    usuariosNoVerificados.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`)
      console.log(`   Nombre: ${user.name || 'Sin nombre'}`)
      console.log(`   Teléfono: ${user.phone || 'Sin teléfono'}`)
      console.log(`   Email verificado: ${user.isEmailVerified ? '✅' : '❌'}`)
      console.log(`   Teléfono verificado: ${user.isPhoneVerified ? '✅' : '❌'}`)
      console.log(`   Activo: ${user.isActive ? '✅' : '❌'}`)
      console.log(`   Registrado: ${user.createdAt.toLocaleString('es-ES')}`)
      console.log('')
    })

    // Preguntar si quiere verificar a todos
    console.log('🔄 Verificando TODOS los usuarios automáticamente...\n')

    // Actualizar todos los usuarios
    const resultado = await prisma.user.updateMany({
      where: {
        OR: [
          { isEmailVerified: false },
          { isPhoneVerified: false },
          { isActive: false }
        ]
      },
      data: {
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        emailVerificationToken: null,
        phoneVerificationCode: null
      }
    })

    console.log(`✅ ${resultado.count} usuarios verificados exitosamente!\n`)

    // Mostrar usuarios actualizados
    const usuariosActualizados = await prisma.user.findMany({
      where: {
        id: {
          in: usuariosNoVerificados.map(u => u.id)
        }
      },
      select: {
        email: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true
      }
    })

    console.log('📊 Estado final:')
    usuariosActualizados.forEach(user => {
      console.log(`   ${user.email}: ✅ Verificado y activo`)
    })

    console.log('\n✅ ¡Todos los usuarios pueden acceder ahora!')
    console.log('💡 Pueden hacer login con su email y contraseña')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
verificarUsuariosManualmente()
  .then(() => {
    console.log('\n✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })
