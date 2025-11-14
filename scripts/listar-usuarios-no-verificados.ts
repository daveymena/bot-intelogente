import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listarUsuariosNoVerificados() {
  try {
    console.log('\n🔍 Buscando usuarios no verificados...\n')

    const usuarios = await prisma.user.findMany({
      where: {
        OR: [
          { isEmailVerified: false },
          { isPhoneVerified: false },
          { isActive: false }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        membershipType: true,
        trialEnds: true,
        createdAt: true,
        lastLoginAt: true
      }
    })

    if (usuarios.length === 0) {
      console.log('✅ No hay usuarios no verificados')
      return
    }

    console.log(`📊 Encontrados ${usuarios.length} usuarios no verificados:\n`)
    console.log('═'.repeat(100))

    usuarios.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.email}`)
      console.log('   ├─ ID:', user.id)
      console.log('   ├─ Nombre:', user.name || 'Sin nombre')
      console.log('   ├─ Teléfono:', user.phone || 'Sin teléfono')
      console.log('   ├─ Email verificado:', user.isEmailVerified ? '✅' : '❌')
      console.log('   ├─ Teléfono verificado:', user.isPhoneVerified ? '✅' : '❌')
      console.log('   ├─ Activo:', user.isActive ? '✅' : '❌')
      console.log('   ├─ Membresía:', user.membershipType)
      console.log('   ├─ Trial termina:', user.trialEnds?.toLocaleString() || 'N/A')
      console.log('   ├─ Registrado:', user.createdAt.toLocaleString())
      console.log('   └─ Último login:', user.lastLoginAt?.toLocaleString() || 'Nunca')
    })

    console.log('\n' + '═'.repeat(100))
    console.log('\n💡 Para activar un usuario manualmente, usa:')
    console.log('   npx tsx scripts/activar-usuario-manual.ts <email>')
    console.log('\n💡 Para reenviar verificación, el usuario puede ir a:')
    console.log('   https://tu-dominio.com/resend-verification')
    console.log('')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

listarUsuariosNoVerificados()
