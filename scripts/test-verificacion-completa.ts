import { db } from '../src/lib/db'

async function testVerificacion() {
  console.log('🧪 PROBANDO SISTEMA DE VERIFICACIÓN\n')

  // 1. Buscar usuarios sin verificar
  console.log('1️⃣ Buscando usuarios sin verificar...')
  const unverifiedUsers = await db.user.findMany({
    where: {
      isEmailVerified: false
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      isActive: true
    }
  })

  console.log(`   Encontrados: ${unverifiedUsers.length} usuarios sin verificar\n`)
  
  if (unverifiedUsers.length > 0) {
    console.log('   Usuarios sin verificar:')
    unverifiedUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.name || 'Sin nombre'}) - Creado: ${user.createdAt.toLocaleString()}`)
    })
    console.log()
  }

  // 2. Buscar códigos de verificación activos
  console.log('2️⃣ Buscando códigos de verificación activos...')
  const activeCodes = await db.verificationCode.findMany({
    where: {
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      user: {
        select: {
          email: true,
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  console.log(`   Encontrados: ${activeCodes.length} códigos activos\n`)
  
  if (activeCodes.length > 0) {
    console.log('   Códigos activos:')
    activeCodes.forEach(code => {
      const timeLeft = Math.round((code.expiresAt.getTime() - Date.now()) / 1000 / 60)
      console.log(`   - ${code.user.email}: ${code.code} (expira en ${timeLeft} minutos)`)
    })
    console.log()
  }

  // 3. Buscar códigos expirados
  console.log('3️⃣ Buscando códigos expirados...')
  const expiredCodes = await db.verificationCode.findMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    },
    include: {
      user: {
        select: {
          email: true
        }
      }
    }
  })

  console.log(`   Encontrados: ${expiredCodes.length} códigos expirados\n`)

  if (expiredCodes.length > 0) {
    console.log('   ⚠️ Limpiando códigos expirados...')
    await db.verificationCode.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })
    console.log(`   ✅ ${expiredCodes.length} códigos expirados eliminados\n`)
  }

  // 4. Estadísticas generales
  console.log('4️⃣ Estadísticas generales:')
  const totalUsers = await db.user.count()
  const verifiedUsers = await db.user.count({
    where: { isEmailVerified: true }
  })
  const activeUsers = await db.user.count({
    where: { isActive: true }
  })

  console.log(`   Total de usuarios: ${totalUsers}`)
  console.log(`   Usuarios verificados: ${verifiedUsers} (${Math.round(verifiedUsers/totalUsers*100)}%)`)
  console.log(`   Usuarios activos: ${activeUsers} (${Math.round(activeUsers/totalUsers*100)}%)`)
  console.log()

  // 5. Verificar configuración de emails
  console.log('5️⃣ Verificando configuración de emails:')
  console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Configurado' : '❌ NO configurado'}`)
  console.log(`   RESEND_FROM_EMAIL: ${process.env.RESEND_FROM_EMAIL || '❌ NO configurado'}`)
  console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM || '❌ NO configurado'}`)
  console.log()

  // 6. Probar generación de código
  console.log('6️⃣ Probando generación de código...')
  const { EmailVerificationService } = await import('../src/lib/email-verification-service')
  const testCode = EmailVerificationService.generateCode()
  console.log(`   Código generado: ${testCode}`)
  console.log(`   Longitud: ${testCode.length} caracteres`)
  console.log(`   Es numérico: ${/^\d+$/.test(testCode) ? '✅ Sí' : '❌ No'}`)
  console.log()

  // 7. Resumen final
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 RESUMEN DEL SISTEMA DE VERIFICACIÓN')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  if (unverifiedUsers.length === 0) {
    console.log('✅ Todos los usuarios están verificados')
  } else {
    console.log(`⚠️  ${unverifiedUsers.length} usuarios pendientes de verificación`)
    console.log('\n   Para activarlos manualmente:')
    console.log('   npx tsx scripts/activar-usuario-manual.ts <email>')
  }

  if (activeCodes.length > 0) {
    console.log(`\n📧 ${activeCodes.length} códigos de verificación activos`)
    console.log('   Los usuarios pueden usar estos códigos en /verify-code')
  }

  if (!process.env.RESEND_API_KEY) {
    console.log('\n⚠️  RESEND_API_KEY no configurado')
    console.log('   Los emails NO se enviarán')
    console.log('   Configura RESEND_API_KEY en .env o Easypanel')
  } else {
    console.log('\n✅ Sistema de emails configurado correctamente')
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

testVerificacion()
  .then(() => {
    console.log('✅ Prueba completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
