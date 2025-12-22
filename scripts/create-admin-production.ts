import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
    try {
        const email = process.env.ADMIN_EMAIL || 'admin@example.com'
        const password = process.env.ADMIN_PASSWORD || 'admin123'

        // Verificar si ya existe
        const existing = await prisma.user.findUnique({
            where: { email }
        })

        if (existing) {
            console.log('✅ Usuario admin ya existe')
            return
        }

        // Crear usuario admin
        const hashedPassword = await bcrypt.hash(password, 10)
        
        const admin = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: 'Administrador',
                role: 'ADMIN',
                membershipType: 'ENTERPRISE',
                isActive: true,
                isEmailVerified: true
            }
        })

        console.log('✅ Usuario admin creado exitosamente')
        console.log(`   Email: ${email}`)
        console.log(`   ID: ${admin.id}`)

    } catch (error) {
        console.error('❌ Error creando admin:', error)
    } finally {
        await prisma.$disconnect()
    }
}

createAdminUser()
