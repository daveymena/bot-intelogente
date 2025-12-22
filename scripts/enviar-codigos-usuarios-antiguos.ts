import { db } from '../src/lib/db'

async function enviarCodigosUsuariosAntiguos() {
  console.log('🔍 BUSCANDO USUARIOS SIN VERIFICAR...\n')

  // Buscar usuarios sin verificar
  const usuariosSinVerificar = await db.user.findMany({
    where: {
      isEmailVerified: false,
      isActive: false
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  if (usuariosSinVerificar.length === 0) {
    console.log('✅ No hay usuarios pendientes de verificación\n')
    return
  }

  console.log(`📧 Encontrados ${usuariosSinVerificar.length} usuarios sin verificar:\n`)
  
  usuariosSinVerificar.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email} (${user.name || 'Sin nombre'})`)
    console.log(`   Registrado: ${user.createdAt.toLocaleString()}`)
  })

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📨 ENVIANDO CÓDIGOS DE VERIFICACIÓN...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const { EmailVerificationService } = await import('../src/lib/email-verification-service')
  
  let enviados = 0
  let errores = 0

  for (const user of usuariosSinVerificar) {
    try {
      // Generar nuevo código
      const code = EmailVerificationService.generateCode()
      
      // Guardar en base de datos
      await EmailVerificationService.saveVerificationCode(user.id, code, 'email')
      
      // Enviar por email
      const emailSent = await EmailVerificationService.sendVerificationCode(
        user.email,
        code,
        user.name || undefined,
        'registration'
      )
      
      if (emailSent) {
        console.log(`✅ ${user.email} - Código enviado: ${code}`)
        enviados++
      } else {
        console.log(`⚠️  ${user.email} - Error enviando email (código guardado: ${code})`)
        errores++
      }
      
      // Esperar 1 segundo entre envíos para no saturar
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.log(`❌ ${user.email} - Error: ${error instanceof Error ? error.message : 'Unknown'}`)
      errores++
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 RESUMEN')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Total de usuarios: ${usuariosSinVerificar.length}`)
  console.log(`✅ Códigos enviados: ${enviados}`)
  console.log(`❌ Errores: ${errores}`)
  console.log('\n💡 Los usuarios pueden verificar su cuenta en:')
  console.log('   https://tu-dominio.com/verify-code')
  console.log('\n')
}

enviarCodigosUsuariosAntiguos()
  .then(() => {
    console.log('✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
