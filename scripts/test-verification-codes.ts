/**
 * Script para probar el envío de códigos de verificación por WhatsApp
 * 
 * Este script prueba:
 * 1. Envío de código de verificación para registro
 * 2. Envío de código para recuperación de contraseña
 * 3. Verificación de código
 */

import { db } from '../src/lib/db'
import { WhatsAppVerificationService } from '../src/lib/whatsapp-verification-service'
import { BaileysService } from '../src/lib/baileys-service'

async function testVerificationCodes() {
  console.log('🧪 Iniciando pruebas de códigos de verificación...\n')

  try {
    // 1. Verificar conexión de WhatsApp
    console.log('1️⃣ Verificando conexión de WhatsApp...')
    const activeConnection = await db.whatsAppConnection.findFirst({
      where: { status: 'CONNECTED' },
      orderBy: { connectedAt: 'desc' }
    })

    if (!activeConnection) {
      console.log('❌ No hay conexión activa de WhatsApp')
      console.log('   Por favor, conecta WhatsApp primero desde el dashboard')
      return
    }

    console.log(`✅ Conexión activa encontrada (Usuario: ${activeConnection.userId})`)
    console.log(`   Teléfono: ${activeConnection.phoneNumber}\n`)

    // 2. Buscar un usuario de prueba
    console.log('2️⃣ Buscando usuario de prueba...')
    const testUser = await db.user.findFirst({
      where: {
        phone: { not: null }
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isPhoneVerified: true
      }
    })

    if (!testUser) {
      console.log('❌ No hay usuarios con teléfono registrado')
      console.log('   Crea un usuario con teléfono primero')
      return
    }

    console.log(`✅ Usuario encontrado:`)
    console.log(`   Email: ${testUser.email}`)
    console.log(`   Nombre: ${testUser.name || 'N/A'}`)
    console.log(`   Teléfono: ${testUser.phone}`)
    console.log(`   Verificado: ${testUser.isPhoneVerified ? 'Sí' : 'No'}\n`)

    // 3. Generar y enviar código de verificación
    console.log('3️⃣ Generando código de verificación...')
    const code = WhatsAppVerificationService.generateCode()
    console.log(`✅ Código generado: ${code}\n`)

    console.log('4️⃣ Guardando código en base de datos...')
    await WhatsAppVerificationService.saveVerificationCode(testUser.id, code)
    console.log('✅ Código guardado\n')

    console.log('5️⃣ Enviando código por WhatsApp...')
    console.log(`   Enviando a: ${testUser.phone}`)
    
    const sent = await WhatsAppVerificationService.sendVerificationCode(
      testUser.phone!,
      code,
      testUser.name || undefined,
      activeConnection.userId
    )

    if (sent) {
      console.log('✅ Código enviado exitosamente por WhatsApp\n')
      console.log('📱 Revisa tu WhatsApp para ver el mensaje\n')
      
      // 6. Simular verificación del código
      console.log('6️⃣ Simulando verificación del código...')
      console.log(`   Ingresa este código en la app: ${code}\n`)
      
      // Esperar un poco para que el usuario pueda verificar
      console.log('⏳ Esperando 5 segundos para que puedas verificar el código...')
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      // Verificar el código automáticamente
      const result = await WhatsAppVerificationService.verifyCode(testUser.id, code)
      
      if (result.success) {
        console.log('✅ Código verificado exitosamente')
        console.log(`   Mensaje: ${result.message}\n`)
      } else {
        console.log('❌ Error verificando código')
        console.log(`   Mensaje: ${result.message}\n`)
      }
      
    } else {
      console.log('❌ Error enviando código por WhatsApp')
      console.log('   Verifica que:')
      console.log('   - WhatsApp esté conectado')
      console.log('   - El número de teléfono sea válido')
      console.log('   - El formato del número sea correcto\n')
    }

    // 7. Probar recuperación de contraseña
    console.log('7️⃣ Probando recuperación de contraseña...')
    
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
    const resetCodeExpiry = new Date(Date.now() + 600000) // 10 minutos

    await db.user.update({
      where: { id: testUser.id },
      data: {
        passwordResetToken: resetCode,
        passwordResetExpires: resetCodeExpiry
      }
    })

    console.log(`✅ Código de recuperación generado: ${resetCode}`)
    
    // Formatear número
    let phoneNumber = testUser.phone!.replace(/\D/g, '')
    if (!phoneNumber.startsWith('57') && phoneNumber.length === 10) {
      phoneNumber = '57' + phoneNumber
    }
    const whatsappNumber = `${phoneNumber}@s.whatsapp.net`
    
    const resetMessage = `🔐 *Recuperación de Contraseña*\n\nTu código de verificación es:\n\n*${resetCode}*\n\nEste código expira en 10 minutos.\n\nSi no solicitaste este código, ignora este mensaje.\n\n_Tecnovariedades D&S_`

    const resetSent = await BaileysService.sendMessage(
      activeConnection.userId,
      whatsappNumber,
      resetMessage
    )

    if (resetSent) {
      console.log('✅ Código de recuperación enviado por WhatsApp\n')
    } else {
      console.log('❌ Error enviando código de recuperación\n')
    }

    // Resumen
    console.log('=' .repeat(60))
    console.log('📊 RESUMEN DE PRUEBAS')
    console.log('='.repeat(60))
    console.log(`✅ Conexión WhatsApp: Activa`)
    console.log(`✅ Usuario de prueba: ${testUser.email}`)
    console.log(`${sent ? '✅' : '❌'} Código de verificación: ${sent ? 'Enviado' : 'Error'}`)
    console.log(`${resetSent ? '✅' : '❌'} Código de recuperación: ${resetSent ? 'Enviado' : 'Error'}`)
    console.log('='.repeat(60))
    
    if (sent && resetSent) {
      console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!')
      console.log('   El sistema de verificación por WhatsApp está funcionando correctamente.')
    } else {
      console.log('\n⚠️ Algunas pruebas fallaron')
      console.log('   Revisa los errores arriba para más detalles.')
    }

  } catch (error) {
    console.error('❌ Error en las pruebas:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar pruebas
console.log('╔══════════════════════════════════════════════════════════════╗')
console.log('║     PRUEBAS DE CÓDIGOS DE VERIFICACIÓN POR WHATSAPP         ║')
console.log('╚══════════════════════════════════════════════════════════════╝\n')

testVerificationCodes()
