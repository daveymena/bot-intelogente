/**
 * 🔍 Verificar Abusos del Sistema de Trial
 * Detecta usuarios que han activado el trial múltiples veces
 */

import { db } from '../src/lib/db'

async function verificarAbusos() {
  console.log('🔍 VERIFICANDO ABUSOS DEL SISTEMA DE TRIAL\n')
  console.log('=' .repeat(70))

  // 1. Buscar usuarios con trial expirado que volvieron a FREE
  const usuariosConTrialUsado = await db.user.findMany({
    where: {
      trialEnds: { not: null },
      membershipType: 'FREE'
    },
    select: {
      id: true,
      email: true,
      name: true,
      membershipType: true,
      trialEnds: true,
      membershipEnds: true,
      createdAt: true,
      _count: {
        select: {
          payments: true
        }
      }
    }
  })

  console.log(`\n📊 Usuarios que ya usaron el trial: ${usuariosConTrialUsado.length}\n`)

  if (usuariosConTrialUsado.length > 0) {
    console.log('Estos usuarios NO deberían poder activar el trial de nuevo:\n')
    
    usuariosConTrialUsado.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Trial expiró: ${user.trialEnds?.toLocaleDateString()}`)
      console.log(`   Pagos realizados: ${user._count.payments}`)
      console.log(`   Estado actual: ${user.membershipType}`)
      console.log()
    })
  }

  // 2. Buscar usuarios con trial activo
  const now = new Date()
  const usuariosConTrialActivo = await db.user.findMany({
    where: {
      membershipType: 'TRIAL',
      trialEnds: { gt: now }
    },
    select: {
      id: true,
      email: true,
      trialEnds: true,
      createdAt: true
    }
  })

  console.log(`\n✅ Usuarios con trial activo: ${usuariosConTrialActivo.length}\n`)

  if (usuariosConTrialActivo.length > 0) {
    usuariosConTrialActivo.forEach((user, index) => {
      const daysRemaining = Math.ceil(
        (user.trialEnds!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      console.log(`${index + 1}. ${user.email}`)
      console.log(`   Días restantes: ${daysRemaining}`)
      console.log(`   Expira: ${user.trialEnds?.toLocaleDateString()}`)
      console.log()
    })
  }

  // 3. Buscar posibles abusos (usuarios que intentaron activar trial múltiples veces)
  // Esto requeriría un log de intentos, por ahora solo mostramos advertencia
  console.log('\n⚠️  RECOMENDACIONES:\n')
  console.log('1. Los usuarios con trialEnds != null NO pueden volver a activar trial')
  console.log('2. El sistema ahora valida esto en el código')
  console.log('3. Si detectas abusos, puedes bloquear manualmente al usuario')
  console.log()

  // 4. Estadísticas generales
  const stats = {
    totalUsers: await db.user.count(),
    usersWithTrial: await db.user.count({ where: { trialEnds: { not: null } } }),
    usersWithActiveTrial: await db.user.count({ 
      where: { 
        membershipType: 'TRIAL',
        trialEnds: { gt: now }
      } 
    }),
    usersWithPaidMembership: await db.user.count({
      where: {
        membershipType: { in: ['BASIC', 'PROFESSIONAL', 'ENTERPRISE'] }
      }
    }),
    freeUsers: await db.user.count({ where: { membershipType: 'FREE' } })
  }

  console.log('\n📊 ESTADÍSTICAS GENERALES:\n')
  console.log(`Total de usuarios: ${stats.totalUsers}`)
  console.log(`Usuarios que usaron trial: ${stats.usersWithTrial}`)
  console.log(`Usuarios con trial activo: ${stats.usersWithActiveTrial}`)
  console.log(`Usuarios con membresía pagada: ${stats.usersWithPaidMembership}`)
  console.log(`Usuarios en plan FREE: ${stats.freeUsers}`)
  console.log()

  // 5. Calcular tasa de conversión
  if (stats.usersWithTrial > 0) {
    const conversionRate = (stats.usersWithPaidMembership / stats.usersWithTrial) * 100
    console.log(`📈 Tasa de conversión (trial → pago): ${conversionRate.toFixed(1)}%`)
  }

  console.log('\n' + '=' .repeat(70))
  console.log('\n✅ Verificación completada')
}

// Ejecutar
verificarAbusos()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
