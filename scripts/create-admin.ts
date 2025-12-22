import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'daveymena16@gmail.com'
  const adminPassword = process.env.ADMIN_PASSWORD || '6715320Dvd.'

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin',
        role: 'ADMIN',
        membershipType: 'ENTERPRISE',
        isActive: true,
        isEmailVerified: true,
        businessName: 'Smart Sales Bot Admin'
      }
    })

    // Create bot settings
    await prisma.botSettings.create({
      data: {
        userId: admin.id,
        businessName: 'Smart Sales Bot Admin',
        businessPhone: '+57 300 000 0000',
        responseDelay: 2,
        autoResponseEnabled: true,
        smartWaitingEnabled: true,
        maxTokens: 500,
        temperature: 0.7
      }
    })

    // Create subscription
    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

    await prisma.subscription.create({
      data: {
        userId: admin.id,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: oneYearFromNow
      }
    })

    console.log('✅ Admin user created successfully')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
  } catch (error) {
    console.error('❌ Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
