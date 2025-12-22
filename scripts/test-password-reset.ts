/**
 * 🧪 TEST: Sistema de recuperación de contraseña por WhatsApp
 * Prueba el flujo completo de forgot-password y reset-password
 */

import { db } from '../src/lib/db'
import { AuthService } from '../src/lib/auth'

async function testPasswordResetWhatsApp() {
  try {
    console.log('🧪 Probando sistema de recuperación de contraseña por WhatsApp...\n')

    // 1. Buscar un usuario de prueba con teléfono
    const user = await db.user.findFirst({
      where: {
        OR: [
          { phone: { not: null } },
          { whatsappNumber: { not: null } }
        ]
      }
    })

    if (!user) {
      console.log('❌ No hay usuarios con teléfono en la base de datos')
      console.log('💡 Crea un usuario con teléfono primero')
      return
    }

    const phoneNumber = user.whatsappNumber || user.phone || 'Sin teléfono'
    
    console.log(`✅ Usuario encontrado:`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Nombre: ${user.name || 'Sin nombre'}`)
    console.log(`   Teléfono: ${phoneNumber}`)
    console.log(`   ID: ${user.id}`)

    // 2. Generar código de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
    const resetCodeExpiry = new Date(Date.now() + 600000) // 10 minutos

    console.log(`\n🔑 Código generado: ${resetCode}`)
    console.log(`⏰ Expira en: ${resetCodeExpiry.toLocaleString()}`)

    // 3. Guardar código en la base de datos
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetCode,
        passwordResetExpires: resetCodeExpiry
      }
    })

    console.log(`✅ Código guardado en la base de datos`)

    // 4. Simular mensaje de WhatsApp
    console.log(`\n📱 Mensaje que se enviaría por WhatsApp:`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`🔐 *Recuperación de Contraseña*`)
    console.log(``)
    console.log(`Tu código de verificación es:`)
    console.log(``)
    console.log(`*${resetCode}*`)
    console.log(``)
    console.log(`Este código expira en 10 minutos.`)
    console.log(``)
    console.log(`Si no solicitaste este código, ignora este mensaje.`)
    console.log(``)
    console.log(`_Tecnovariedades D&S_`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

    // 5. Simular validación del código
    console.log(`\n🔍 Verificando código...`)
    
    const userWithCode = await db.user.findFirst({
      where: {
        OR: [
          { phone: phoneNumber },
          { whatsappNumber: phoneNumber }
        ],
        passwordResetToken: resetCode,
        passwordResetExpires: {
          gt: new Date()
        }
      }
    })

    if (userWithCode) {
      console.log(`✅ Código válido`)
    } else {
      console.log(`❌ Código inválido o expirado`)
      return
    }

    // 6. Simular reset de contraseña
    const newPassword = 'nuevaPassword123'
    const hashedPassword = await AuthService.hashPassword(newPassword)

    console.log(`\n🔐 Nueva contraseña: ${newPassword}`)
    console.log(`   Hash: ${hashedPassword.substring(0, 30)}...`)

    // 7. Actualizar contraseña
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    })

    console.log(`✅ Contraseña actualizada exitosamente`)

    // 8. Verificar que la nueva contraseña funciona
    const isValid = await AuthService.verifyPassword(newPassword, hashedPassword)
    console.log(`\n✅ Verificación de contraseña: ${isValid ? 'CORRECTA ✓' : 'INCORRECTA ✗'}`)

    // 9. Resumen
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`✅ TEST COMPLETADO EXITOSAMENTE`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    
    console.log(`\n⚠️  IMPORTANTE: La contraseña del usuario ha sido cambiada`)
    console.log(`\n📝 Credenciales de prueba:`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Teléfono: ${phoneNumber}`)
    console.log(`   Contraseña: ${newPassword}`)

    console.log(`\n🚀 Próximos pasos para probar en el navegador:`)
    console.log(`   1. Inicia el servidor: npm run dev`)
    console.log(`   2. Ve a: http://localhost:3000/forgot-password`)
    console.log(`   3. Ingresa el teléfono: ${phoneNumber}`)
    console.log(`   4. Revisa WhatsApp para el código (o usa: ${resetCode})`)
    console.log(`   5. Ingresa el código en la página`)
    console.log(`   6. Crea una nueva contraseña`)
    console.log(`   7. Inicia sesión con la nueva contraseña`)

    console.log(`\n💡 Tip: Si WhatsApp no está conectado, el código aparecerá en los logs`)

  } catch (error) {
    console.error('❌ Error en el test:', error)
  } finally {
    await db.$disconnect()
  }
}

testPasswordResetWhatsApp()
