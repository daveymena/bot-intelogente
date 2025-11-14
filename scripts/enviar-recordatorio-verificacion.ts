import { PrismaClient } from '@prisma/client'
import { EmailService } from '../src/lib/email-service'

const prisma = new PrismaClient()

async function enviarRecordatorios() {
  try {
    console.log('\n📧 Buscando usuarios no verificados...\n')

    // Buscar usuarios registrados hace más de 1 hora pero no verificados
    const unHoraAtras = new Date(Date.now() - 60 * 60 * 1000)

    const usuarios = await prisma.user.findMany({
      where: {
        isEmailVerified: false,
        createdAt: {
          lt: unHoraAtras // Registrados hace más de 1 hora
        },
        lastLoginAt: null // Nunca han iniciado sesión
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (usuarios.length === 0) {
      console.log('✅ No hay usuarios pendientes de verificación')
      return
    }

    console.log(`📊 Encontrados ${usuarios.length} usuarios sin verificar:\n`)

    let enviados = 0
    let errores = 0

    for (const user of usuarios) {
      try {
        console.log(`📤 Enviando recordatorio a: ${user.email}`)

        // Generar nuevo token si no tiene
        if (!user.emailVerificationToken) {
          const crypto = await import('crypto')
          const token = crypto.randomBytes(32).toString('hex')
          
          await prisma.user.update({
            where: { id: user.id },
            data: { emailVerificationToken: token }
          })

          user.emailVerificationToken = token
        }

        // Enviar email de recordatorio
        await EmailService.sendVerificationEmail(
          user.email,
          user.emailVerificationToken!,
          user.name || undefined
        )

        console.log(`   ✅ Enviado a ${user.email}`)
        enviados++

      } catch (error) {
        console.error(`   ❌ Error enviando a ${user.email}:`, error)
        errores++
      }
    }

    console.log('\n' + '═'.repeat(60))
    console.log(`\n📊 Resumen:`)
    console.log(`   ✅ Enviados: ${enviados}`)
    console.log(`   ❌ Errores: ${errores}`)
    console.log(`   📧 Total: ${usuarios.length}`)
    console.log('')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

enviarRecordatorios()
