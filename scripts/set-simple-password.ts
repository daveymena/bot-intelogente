import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function setSimplePassword() {
  const adminEmail = 'daveymena16@gmail.com'
  const newPassword = 'admin123' // Contraseña simple para pruebas

  try {
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!admin) {
      console.log('❌ Admin user not found')
      return
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update admin
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        isEmailVerified: true,
        isActive: true,
        emailVerificationToken: null
      }
    })

    console.log('✅ Password updated successfully!')
    console.log('')
    console.log('═══════════════════════════════════')
    console.log('  NUEVAS CREDENCIALES')
    console.log('═══════════════════════════════════')
    console.log('📧 Email:    daveymena16@gmail.com')
    console.log('🔑 Password: admin123')
    console.log('═══════════════════════════════════')
    console.log('')
    console.log('✅ Email verified: true')
    console.log('✅ Account active: true')
    console.log('')
    console.log('🔓 Ahora puedes iniciar sesión!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setSimplePassword()
