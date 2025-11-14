import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verificarDatabase() {
  console.log('\n🔍 DIAGNÓSTICO DE BASE DE DATOS\n')
  console.log('═'.repeat(60))

  try {
    // 1. Verificar variable de entorno
    console.log('\n1️⃣ Verificando configuración...')
    const dbUrl = process.env.DATABASE_URL
    
    if (!dbUrl) {
      console.log('❌ DATABASE_URL no está configurada en .env')
      console.log('\n💡 Solución:')
      console.log('   Agrega en tu archivo .env:')
      console.log('   DATABASE_URL="file:./dev.db"')
      process.exit(1)
    }

    console.log('✅ DATABASE_URL configurada')
    
    // Determinar tipo de base de datos
    if (dbUrl.startsWith('file:')) {
      console.log('📁 Tipo: SQLite (desarrollo)')
      console.log('📍 Ubicación:', dbUrl.replace('file:', ''))
    } else if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
      console.log('🐘 Tipo: PostgreSQL')
      // Ocultar contraseña en la URL
      const safeUrl = dbUrl.replace(/:[^:@]+@/, ':****@')
      console.log('📍 URL:', safeUrl)
    } else {
      console.log('⚠️  Tipo desconocido:', dbUrl.substring(0, 20) + '...')
    }

    // 2. Intentar conectar
    console.log('\n2️⃣ Probando conexión...')
    await prisma.$connect()
    console.log('✅ Conexión exitosa')

    // 3. Verificar tablas
    console.log('\n3️⃣ Verificando estructura...')
    
    try {
      const userCount = await prisma.user.count()
      console.log(`✅ Tabla 'user' existe (${userCount} usuarios)`)
    } catch (error) {
      console.log('❌ Tabla "user" no existe o hay un error')
      console.log('\n💡 Solución:')
      console.log('   Ejecuta: npm run db:push')
      throw error
    }

    // 4. Contar registros
    console.log('\n4️⃣ Contando registros...')
    
    const counts = {
      usuarios: await prisma.user.count(),
      productos: await prisma.product.count(),
      conversaciones: await prisma.conversation.count(),
      suscripciones: await prisma.subscription.count()
    }

    console.log(`   📊 Usuarios: ${counts.usuarios}`)
    console.log(`   📦 Productos: ${counts.productos}`)
    console.log(`   💬 Conversaciones: ${counts.conversaciones}`)
    console.log(`   💳 Suscripciones: ${counts.suscripciones}`)

    // 5. Verificar usuarios no verificados
    console.log('\n5️⃣ Usuarios no verificados...')
    
    const noVerificados = await prisma.user.count({
      where: {
        OR: [
          { isEmailVerified: false },
          { isPhoneVerified: false },
          { isActive: false }
        ]
      }
    })

    if (noVerificados > 0) {
      console.log(`   ⚠️  ${noVerificados} usuarios pendientes de verificación`)
      console.log('\n   💡 Para ver detalles:')
      console.log('      npx tsx scripts/listar-usuarios-no-verificados.ts')
    } else {
      console.log('   ✅ Todos los usuarios están verificados')
    }

    // Resumen
    console.log('\n' + '═'.repeat(60))
    console.log('\n✅ BASE DE DATOS FUNCIONANDO CORRECTAMENTE\n')
    console.log('🎯 Comandos disponibles:')
    console.log('   • npx tsx scripts/listar-usuarios-no-verificados.ts')
    console.log('   • npx tsx scripts/activar-usuario-manual.ts <email>')
    console.log('   • gestionar-usuarios-no-verificados.bat')
    console.log('')

  } catch (error: any) {
    console.log('\n' + '═'.repeat(60))
    console.log('\n❌ ERROR EN LA BASE DE DATOS\n')
    
    if (error.message?.includes('URL must start with')) {
      console.log('🔧 Problema: DATABASE_URL tiene formato incorrecto')
      console.log('\n💡 Soluciones:')
      console.log('\n   Opción 1 - SQLite (desarrollo):')
      console.log('   DATABASE_URL="file:./dev.db"')
      console.log('\n   Opción 2 - PostgreSQL (producción):')
      console.log('   DATABASE_URL="postgresql://user:password@host:5432/database"')
    } else if (error.message?.includes('does not exist')) {
      console.log('🔧 Problema: Las tablas no existen')
      console.log('\n💡 Solución:')
      console.log('   npm run db:push')
    } else if (error.code === 'P1001') {
      console.log('🔧 Problema: No se puede conectar a la base de datos')
      console.log('\n💡 Verifica:')
      console.log('   • Que PostgreSQL esté corriendo')
      console.log('   • Que las credenciales sean correctas')
      console.log('   • Que el host sea accesible')
    } else {
      console.log('🔧 Error:', error.message)
    }
    
    console.log('')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verificarDatabase()
