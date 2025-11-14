import { EmailVerificationService } from '../src/lib/email-verification-service'

async function testCodigoVerificacion() {
  console.log('\n🧪 PRUEBA DE CÓDIGO DE VERIFICACIÓN\n')
  console.log('═'.repeat(60))

  // 1. Verificar configuración de email
  console.log('\n1️⃣ Verificando configuración de email...')
  
  const hasResend = !!process.env.RESEND_API_KEY
  const hasSendGrid = !!process.env.SENDGRID_API_KEY
  const hasSMTP = !!process.env.EMAIL_HOST
  const isDev = process.env.NODE_ENV === 'development'

  if (hasResend) {
    console.log('✅ Resend API configurado')
  } else if (hasSendGrid) {
    console.log('✅ SendGrid API configurado')
  } else if (hasSMTP) {
    console.log('✅ SMTP configurado')
  } else if (isDev) {
    console.log('⚠️  Modo desarrollo - Códigos se mostrarán en consola')
  } else {
    console.log('❌ No hay servicio de email configurado')
    console.log('\n💡 Configura en .env:')
    console.log('   RESEND_API_KEY=tu_api_key')
    console.log('   o')
    console.log('   SENDGRID_API_KEY=tu_api_key')
    console.log('   o')
    console.log('   EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS')
  }

  // 2. Generar código de prueba
  console.log('\n2️⃣ Generando código de verificación...')
  const codigo = EmailVerificationService.generateCode()
  console.log(`✅ Código generado: ${codigo}`)
  console.log(`   Longitud: ${codigo.length} dígitos`)
  console.log(`   Formato: ${/^\d{6}$/.test(codigo) ? '✅ Válido (6 dígitos)' : '❌ Inválido'}`)

  // 3. Probar envío (si hay email de prueba)
  const emailPrueba = process.argv[2]
  
  if (emailPrueba) {
    console.log(`\n3️⃣ Enviando código a ${emailPrueba}...`)
    
    try {
      const enviado = await EmailVerificationService.sendVerificationCode(
        emailPrueba,
        codigo,
        'Usuario de Prueba',
        'registration'
      )

      if (enviado) {
        console.log('✅ Código enviado exitosamente')
        console.log('\n📧 Revisa tu email:')
        console.log(`   • Bandeja de entrada`)
        console.log(`   • Carpeta de spam`)
        console.log(`   • Código: ${codigo}`)
      } else {
        console.log('❌ Error al enviar código')
        
        if (isDev) {
          console.log('\n💡 En modo desarrollo, el código se muestra en consola')
          console.log(`   Código: ${codigo}`)
        }
      }
    } catch (error) {
      console.error('❌ Error:', error)
    }
  } else {
    console.log('\n3️⃣ Envío de prueba omitido')
    console.log('💡 Para probar envío, ejecuta:')
    console.log('   npx tsx scripts/test-codigo-verificacion.ts tu@email.com')
  }

  // 4. Información sobre el sistema
  console.log('\n' + '═'.repeat(60))
  console.log('\n📋 INFORMACIÓN DEL SISTEMA\n')
  
  console.log('🔐 Códigos de Verificación:')
  console.log('   • Formato: 6 dígitos numéricos')
  console.log('   • Ejemplo: 123456')
  console.log('   • Generación: Aleatoria')
  console.log('   • Validez: Hasta que se use')
  console.log('')
  
  console.log('📧 Envío de Emails:')
  if (hasResend) {
    console.log('   • Servicio: Resend (Recomendado)')
    console.log('   • Estado: ✅ Configurado')
  } else if (hasSendGrid) {
    console.log('   • Servicio: SendGrid')
    console.log('   • Estado: ✅ Configurado')
  } else if (hasSMTP) {
    console.log('   • Servicio: SMTP')
    console.log('   • Estado: ✅ Configurado')
  } else if (isDev) {
    console.log('   • Servicio: Consola (Desarrollo)')
    console.log('   • Estado: ⚠️  Solo para pruebas')
  } else {
    console.log('   • Servicio: ❌ No configurado')
  }
  console.log('')
  
  console.log('🎯 Flujo de Verificación:')
  console.log('   1. Usuario se registra')
  console.log('   2. Sistema genera código de 6 dígitos')
  console.log('   3. Código se envía por email')
  console.log('   4. Usuario ingresa código')
  console.log('   5. Sistema verifica y activa cuenta')
  console.log('')
  
  console.log('🔧 Comandos útiles:')
  console.log('   • Probar envío:')
  console.log('     npx tsx scripts/test-codigo-verificacion.ts email@ejemplo.com')
  console.log('')
  console.log('   • Ver usuarios sin verificar:')
  console.log('     npx tsx scripts/listar-usuarios-no-verificados.ts')
  console.log('')
  console.log('   • Activar usuario manualmente:')
  console.log('     npx tsx scripts/activar-usuario-manual.ts email@ejemplo.com')
  console.log('')

  // 5. Verificar si hay códigos pendientes en la base de datos
  console.log('═'.repeat(60))
  console.log('\n5️⃣ Verificando códigos pendientes en base de datos...')
  
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    const codigosPendientes = await prisma.verificationCode.findMany({
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
      },
      take: 10
    })

    if (codigosPendientes.length > 0) {
      console.log(`\n📊 ${codigosPendientes.length} códigos activos encontrados:\n`)
      
      codigosPendientes.forEach((vc, index) => {
        console.log(`${index + 1}. ${vc.user.email}`)
        console.log(`   ├─ Código: ${vc.code}`)
        console.log(`   ├─ Tipo: ${vc.type}`)
        console.log(`   ├─ Creado: ${vc.createdAt.toLocaleString()}`)
        console.log(`   └─ Expira: ${vc.expiresAt.toLocaleString()}`)
      })
    } else {
      console.log('✅ No hay códigos pendientes')
    }

    await prisma.$disconnect()
  } catch (error) {
    console.log('⚠️  No se pudo verificar la base de datos')
  }

  console.log('\n' + '═'.repeat(60))
  console.log('\n✅ PRUEBA COMPLETADA\n')
}

testCodigoVerificacion()
