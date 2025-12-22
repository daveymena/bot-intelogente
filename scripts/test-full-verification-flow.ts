import { EmailVerificationService } from '../src/lib/email-verification-service'
import { db } from '../src/lib/db'

async function testFullVerificationFlow() {
  console.log('🔍 Probando flujo completo de verificación de email...\n')

  try {
    // 1. Crear usuario de prueba
    console.log('👤 Paso 1: Creando usuario de prueba...')
    const testEmail = 'daveymena16@gmail.com' // Usar email propio para Resend
    const testPassword = 'test123456'

    // Verificar si el usuario ya existe
    let testUser = await db.user.findUnique({
      where: { email: testEmail }
    })

    if (!testUser) {
      testUser = await db.user.create({
        data: {
          email: testEmail,
          password: testPassword, // En producción usar hash
          name: 'Usuario de Prueba',
          isActive: false,
          isEmailVerified: false
        }
      })
      console.log('✅ Usuario creado:', testUser.id)
    } else {
      console.log('✅ Usuario existente encontrado:', testUser.id)
    }

    // 2. Enviar código de verificación
    console.log('\n📧 Paso 2: Enviando código de verificación...')
    const verificationCode = EmailVerificationService.generateCode()
    console.log(`🔢 Código generado: ${verificationCode}`)

    const emailSent = await EmailVerificationService.sendVerificationCode(
      testEmail,
      verificationCode,
      'Usuario de Prueba',
      'registration'
    )

    if (!emailSent) {
      console.log('❌ Error enviando email de verificación')
      return
    }

    // 3. Guardar código en base de datos
    console.log('\n💾 Paso 3: Guardando código en base de datos...')
    await EmailVerificationService.saveVerificationCode(testUser.id, verificationCode, 'email')
    console.log('✅ Código guardado en DB')

    // 4. Verificar código correcto
    console.log('\n✅ Paso 4: Verificando código correcto...')
    const correctVerification = await EmailVerificationService.verifyCode(testUser.id, verificationCode, 'email')

    if (correctVerification.success) {
      console.log('✅ Verificación exitosa!')
      console.log('📊 Estado del usuario actualizado')

      // Verificar que el usuario esté marcado como verificado
      const updatedUser = await db.user.findUnique({
        where: { id: testUser.id }
      })

      console.log('🔍 Estado final del usuario:')
      console.log(`   - Email verificado: ${updatedUser?.isEmailVerified}`)
      console.log(`   - Activo: ${updatedUser?.isActive}`)
      console.log(`   - Token de verificación: ${updatedUser?.emailVerificationToken ? 'Presente' : 'Nulo'}`)

    } else {
      console.log('❌ Error en verificación:', correctVerification.message)
    }

    // 5. Probar código incorrecto
    console.log('\n❌ Paso 5: Probando código incorrecto...')
    const wrongVerification = await EmailVerificationService.verifyCode(testUser.id, '000000', 'email')

    if (!wrongVerification.success) {
      console.log('✅ Código incorrecto rechazado correctamente')
    } else {
      console.log('❌ Error: Código incorrecto fue aceptado')
    }

    // 6. Limpiar datos de prueba
    console.log('\n🧹 Paso 6: Limpiando datos de prueba...')
    await db.user.delete({
      where: { id: testUser.id }
    })
    console.log('✅ Usuario de prueba eliminado')

    console.log('\n🎉 Flujo completo de verificación probado exitosamente!')

  } catch (error) {
    console.error('❌ Error en el flujo de verificación:')
    console.error((error as Error).message)

    // Intentar limpiar en caso de error
    try {
      const testUser = await db.user.findUnique({
        where: { email: 'test-verification@example.com' }
      })
      if (testUser) {
        await db.user.delete({ where: { id: testUser.id } })
        console.log('🧹 Datos de prueba limpiados después del error')
      }
    } catch (cleanupError) {
      console.error('❌ Error limpiando datos:', (cleanupError as Error).message)
    }
  }
}

// Ejecutar el test
testFullVerificationFlow().catch(console.error)