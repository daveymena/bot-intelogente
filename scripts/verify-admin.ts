import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'daveymena16@gmail.com'

  try {
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!admin) {
      console.log('❌ Admin user not found')
      return
    }

    // Update admin to verified
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        isEmailVerified: true,
        isActive: true,
        emailVerificationToken: null
      }
    })

    console.log('✅ Admin email verified successfully')
    console.log('📧 Email:', adminEmail)
    console.log('🔓 You can now login')
  } catch (error) {
    console.error('❌ Error verifying admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAdmin()
