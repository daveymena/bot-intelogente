import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function activarUsuario() {
  const email = process.argv[2]

  if (!email) {
    console.log('❌ Uso: npx tsx scripts/activar-usuario-manual.ts <email>')
    console.log('📧 Ejemplo: npx tsx scripts/activar-usuario-manual.ts usuario@ejemplo.com')
    process.exit(1)
  }

  try {
    // Verificar conexión a la base de datos
    console.log('\n🔌 Verificando conexión a la base de datos...')
    await prisma.$connect()
    console.log('✅ Conexión exitosa\n')

    console.log(`🔍 Buscando usuario: ${email}`)

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscriptions: true
      }
    })

    if (!user) {
      console.log('❌ Usuario no encontrado')
      process.exit(1)
    }

    console.log('\n📊 Estado actual del usuario:')
    console.log('  - ID:', user.id)
    console.log('  - Nombre:', user.name || 'Sin nombre')
    console.log('  - Email verificado:', user.isEmailVerified ? '✅' : '❌')
    console.log('  - Teléfono verificado:', user.isPhoneVerified ? '✅' : '❌')
    console.log('  - Activo:', user.isActive ? '✅' : '❌')
    console.log('  - Tipo de membresía:', user.membershipType)
    console.log('  - Trial termina:', user.trialEnds?.toLocaleString() || 'N/A')

    // Activar usuario
    console.log('\n🔧 Activando usuario...')

    const trialEnds = new Date()
    trialEnds.setDate(trialEnds.getDate() + 10) // 10 días desde ahora

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        emailVerificationToken: null,
        membershipType: 'TRIAL',
        trialEnds,
        membershipEnds: trialEnds
      }
    })

    // Crear o actualizar suscripción
    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId: user.id }
    })

    if (existingSubscription) {
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: 'TRIAL',
          trialStart: new Date(),
          trialEnd: trialEnds
        }
      })
      console.log('✅ Suscripción actualizada')
    } else {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          status: 'TRIAL',
          trialStart: new Date(),
          trialEnd: trialEnds
        }
      })
      console.log('✅ Suscripción creada')
    }

    console.log('\n✅ Usuario activado exitosamente!')
    console.log('\n📊 Nuevo estado:')
    console.log('  - Email verificado: ✅')
    console.log('  - Teléfono verificado: ✅')
    console.log('  - Activo: ✅')
    console.log('  - Tipo: TRIAL (10 días)')
    console.log('  - Trial termina:', trialEnds.toLocaleString())
    console.log('\n🎉 El usuario ya puede iniciar sesión!')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

activarUsuario()
