/**
 * Script para resetear contraseña directamente en la base de datos
 * Úsalo cuando no puedas acceder al dashboard
 */

import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function resetPassword() {
  console.log('🔐 Reseteo Directo de Contraseña\n')

  try {
    // Email del usuario (cámbialo por el tuyo)
    const email = 'admin@test.com' // ⚠️ CAMBIAR ESTO
    const newPassword = 'admin123'  // ⚠️ CAMBIAR ESTO

    console.log(`📧 Buscando usuario: ${email}`)

    // Buscar usuario
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true
      }
    })

    if (!user) {
      console.log('❌ Usuario no encontrado')
      console.log('\n💡 Usuarios disponibles:')
      
      const allUsers = await db.user.findMany({
        select: {
          email: true,
          name: true,
          isActive: true
        }
      })

      allUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.name || 'Sin nombre'}) - ${u.isActive ? 'Activo' : 'Inactivo'}`)
      })

      return
    }

    console.log(`✅ Usuario encontrado:`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Nombre: ${user.name || 'N/A'}`)
    console.log(`   Activo: ${user.isActive ? 'Sí' : 'No'}`)

    // Hashear nueva contraseña
    console.log(`\n🔒 Hasheando nueva contraseña...`)
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Actualizar contraseña y activar usuario
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isActive: true, // Activar usuario por si acaso
        passwordResetToken: null,
        passwordResetExpires: null
      }
    })

    console.log(`✅ Contraseña actualizada exitosamente\n`)
    console.log(`═══════════════════════════════════════════`)
    console.log(`📋 CREDENCIALES DE ACCESO:`)
    console.log(`═══════════════════════════════════════════`)
    console.log(`Email:    ${email}`)
    console.log(`Password: ${newPassword}`)
    console.log(`═══════════════════════════════════════════\n`)
    console.log(`🌐 Ahora puedes iniciar sesión en:`)
    console.log(`   http://localhost:3000/login\n`)
    console.log(`📱 Después de iniciar sesión:`)
    console.log(`   1. Ir al Dashboard`)
    console.log(`   2. Conectar WhatsApp`)
    console.log(`   3. Escanear código QR`)
    console.log(`   4. Ya podrás usar recuperación de contraseña\n`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar
resetPassword()
