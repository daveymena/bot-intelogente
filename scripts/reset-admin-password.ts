import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetAdminPassword() {
  const adminEmail = process.env.ADMIN_EMAIL || 'daveymena16@gmail.com'
  const newPassword = process.env.ADMIN_PASSWORD || '6715320Dvd.'

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

    // Update admin password and verify email
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        isEmailVerified: true,
        isActive: true,
        emailVerificationToken: null
      }
    })

    console.log('✅ Admin password reset successfully')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', newPassword)
    console.log('✅ Email verified: true')
    console.log('✅ Account active: true')
    console.log('')
    console.log('🔓 You can now login with these credentials')
  } catch (error) {
    console.error('❌ Error resetting password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAdminPassword()
