import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function hacerAdminOwner() {
  try {
    console.log('\n🔧 Actualizando usuario a ADMIN OWNER...\n')

    // Buscar tu usuario
    const user = await prisma.user.findUnique({
      where: { email: 'daveymena16@gmail.com' }
    })

    if (!user) {
      console.log('❌ Usuario no encontrado')
      return
    }

    console.log('📋 Usuario actual:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Rol: ${user.role}`)
    console.log(`   Membresía: ${user.membershipType}`)
    console.log(`   Activo: ${user.isActive}`)

    // Actualizar a ADMIN con ENTERPRISE sin límites
    const updatedUser = await prisma.user.update({
      where: { email: 'daveymena16@gmail.com' },
      data: {
        role: 'ADMIN',
        membershipType: 'ENTERPRISE',
        membershipEnds: null, // Sin fecha de expiración
        trialEnds: null, // Sin trial
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true
      }
    })

    console.log('\n✅ Usuario actualizado exitosamente!')
    console.log('\n📋 Nuevo estado:')
    console.log(`   Email: ${updatedUser.email}`)
    console.log(`   Rol: ${updatedUser.role} ⭐`)
    console.log(`   Membresía: ${updatedUser.membershipType} 💎`)
    console.log(`   Expira: NUNCA (Owner) ♾️`)
    console.log(`   Activo: ${updatedUser.isActive}`)
    console.log(`   Email verificado: ${updatedUser.isEmailVerified}`)

    // Actualizar o crear suscripción
    const subscription = await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: null, // Sin fecha de fin
        cancelAtPeriodEnd: false,
        trialStart: null,
        trialEnd: null
      },
      create: {
        userId: user.id,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      }
    })

    console.log('\n✅ Suscripción actualizada!')
    console.log(`   Estado: ${subscription.status}`)
    console.log(`   Expira: NUNCA`)

    console.log('\n🎉 ¡Listo! Ahora eres ADMIN OWNER con acceso ilimitado')
    console.log('\n💎 Beneficios:')
    console.log('   ✅ Acceso completo al dashboard')
    console.log('   ✅ Sin límites de productos')
    console.log('   ✅ Sin límites de conversaciones')
    console.log('   ✅ Sin límites de mensajes')
    console.log('   ✅ Sin fecha de expiración')
    console.log('   ✅ Todas las funcionalidades desbloqueadas')
    console.log('   ✅ No pagas suscripción (eres el dueño)')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

hacerAdminOwner()
