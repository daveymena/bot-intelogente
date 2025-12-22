import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verificarAdminOwner() {
  try {
    console.log('\n🔍 Verificando estado de ADMIN OWNER...\n')

    const user = await prisma.user.findUnique({
      where: { email: 'daveymena16@gmail.com' },
      include: {
        _count: {
          select: {
            products: true,
            conversations: true
          }
        }
      }
    })

    if (!user) {
      console.log('❌ Usuario no encontrado')
      return
    }

    console.log('👤 INFORMACIÓN DEL USUARIO:')
    console.log('=' .repeat(60))
    console.log(`Email: ${user.email}`)
    console.log(`Nombre: ${user.name || 'No configurado'}`)
    console.log(`Rol: ${user.role} ${user.role === 'ADMIN' ? '⭐ ADMIN' : ''}`)
    console.log(`Membresía: ${user.membershipType} ${user.membershipType === 'ENTERPRISE' ? '💎 ENTERPRISE' : ''}`)
    console.log(`Expira: ${user.membershipEnds ? user.membershipEnds.toLocaleDateString() : 'NUNCA ♾️'}`)
    console.log(`Activo: ${user.isActive ? '✅ Sí' : '❌ No'}`)
    console.log(`Email verificado: ${user.isEmailVerified ? '✅ Sí' : '❌ No'}`)

    console.log('\n📊 ESTADÍSTICAS:')
    console.log('=' .repeat(60))
    console.log(`Productos: ${user._count.products}`)
    console.log(`Conversaciones: ${user._count.conversations}`)

    console.log('\n💎 PRIVILEGIOS:')
    console.log('=' .repeat(60))
    if (user.role === 'ADMIN' && user.membershipType === 'ENTERPRISE' && !user.membershipEnds) {
      console.log('✅ Acceso completo al dashboard')
      console.log('✅ Sin límites de productos')
      console.log('✅ Sin límites de conversaciones')
      console.log('✅ Sin límites de mensajes')
      console.log('✅ Sin fecha de expiración')
      console.log('✅ Todas las funcionalidades desbloqueadas')
      console.log('✅ No pagas suscripción (eres el dueño)')
      console.log('\n🎉 ¡TODO CORRECTO! Eres ADMIN OWNER')
    } else {
      console.log('⚠️ Configuración incorrecta')
      console.log('\nEjecuta: npx tsx scripts/hacer-admin-owner.ts')
    }

    // Verificar suscripción
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id }
    })

    if (subscription) {
      console.log('\n📋 SUSCRIPCIÓN:')
      console.log('=' .repeat(60))
      console.log(`Estado: ${subscription.status}`)
      console.log(`Expira: ${subscription.currentPeriodEnd ? subscription.currentPeriodEnd.toLocaleDateString() : 'NUNCA ♾️'}`)
    }

    console.log('\n')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarAdminOwner()
