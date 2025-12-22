/**
 * Script para crear usuario premium
 * Email: daveymena16@gmail.com
 * Contraseña: 671520Dvd.
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function crearUsuarioPremium() {
  try {
    console.log('🔐 Creando usuario premium...')

    // Datos del usuario premium
    const userData = {
      email: 'daveymena16@gmail.com',
      name: 'Davey Mena',
      password: '671520Dvd.',
      role: 'ADMIN' as const,
      membershipType: 'PROFESSIONAL' as const,
      isActive: true,
      isEmailVerified: true,
      businessName: 'Tecnovariedades D&S',
      businessPhone: '+57 304 274 8687',
      businessAddress: 'Centro Comercial El Diamante 2, San Nicolás, Cali',
      adminNotificationPhone: '3005560186',
      subscriptionPlan: 'pro',
      subscriptionStatus: 'active'
    }

    // Verificar si ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (existingUser) {
      console.log('⚠️  Usuario ya existe, actualizando a premium...')
      
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      
      await prisma.user.update({
        where: { email: userData.email },
        data: {
          ...userData,
          password: hashedPassword,
          membershipType: 'PROFESSIONAL',
          role: 'ADMIN',
          isActive: true,
          isEmailVerified: true,
          subscriptionPlan: 'pro',
          subscriptionStatus: 'active',
          membershipEnds: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año
        }
      })
      
      console.log('✅ Usuario actualizado a premium exitosamente')
    } else {
      // Crear nuevo usuario premium
      const hashedPassword = await bcrypt.hash(userData.password, 10)

      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          membershipEnds: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año
        }
      })

      console.log('✅ Usuario premium creado exitosamente')
      console.log('📧 Email:', user.email)
      console.log('👤 Nombre:', user.name)
      console.log('🏢 Empresa:', user.businessName)
      console.log('💎 Membresía:', user.membershipType)
    }

    // Crear/actualizar configuración de bot
    const user = await prisma.user.findUnique({ 
      where: { email: userData.email } 
    })

    if (user) {
      await prisma.botSettings.upsert({
        where: { userId: user.id },
        update: {
          businessName: userData.businessName,
          businessPhone: userData.businessPhone,
          businessAddress: userData.businessAddress,
          autoResponseEnabled: true,
          smartWaitingEnabled: true,
          enableAutoFallback: true,
          preferredAiProvider: 'groq'
        },
        create: {
          userId: user.id,
          businessName: userData.businessName,
          businessPhone: userData.businessPhone,
          businessAddress: userData.businessAddress,
          autoResponseEnabled: true,
          smartWaitingEnabled: true,
          enableAutoFallback: true,
          preferredAiProvider: 'groq'
        }
      })

      console.log('✅ Configuración de bot creada/actualizada')

      // Crear configuración de pagos
      await prisma.paymentConfig.upsert({
        where: { userId: user.id },
        update: {
          nequiEnabled: true,
          nequiPhone: '3136174267',
          daviplataEnabled: true,
          daviplataPhone: '3136174267',
          bankTransferEnabled: true,
          contactPhone: '+57 304 274 8687',
          contactEmail: 'deinermen25@gmail.com',
          contactAddress: 'Centro Comercial El Diamante 2, San Nicolás, Cali'
        },
        create: {
          userId: user.id,
          nequiEnabled: true,
          nequiPhone: '3136174267',
          daviplataEnabled: true,
          daviplataPhone: '3136174267',
          bankTransferEnabled: true,
          contactPhone: '+57 304 274 8687',
          contactEmail: 'deinermen25@gmail.com',
          contactAddress: 'Centro Comercial El Diamante 2, San Nicolás, Cali'
        }
      })

      console.log('✅ Configuración de pagos creada/actualizada')

      // Crear configuración de tienda
      await prisma.storeSettings.upsert({
        where: { userId: user.id },
        update: {
          storeName: 'Tecnovariedades D&S',
          storeSlug: 'tecnovariedades-ds',
          description: 'Tecnología y productos digitales de calidad',
          phone: '+57 304 274 8687',
          whatsapp: '3136174267',
          email: 'deinermen25@gmail.com',
          address: 'Centro Comercial El Diamante 2, San Nicolás, Cali',
          city: 'Cali',
          country: 'Colombia',
          currency: 'COP',
          isPublic: true,
          isActive: true
        },
        create: {
          userId: user.id,
          storeName: 'Tecnovariedades D&S',
          storeSlug: 'tecnovariedades-ds',
          description: 'Tecnología y productos digitales de calidad',
          phone: '+57 304 274 8687',
          whatsapp: '3136174267',
          email: 'deinermen25@gmail.com',
          address: 'Centro Comercial El Diamante 2, San Nicolás, Cali',
          city: 'Cali',
          country: 'Colombia',
          currency: 'COP',
          isPublic: true,
          isActive: true
        }
      })

      console.log('✅ Configuración de tienda creada/actualizada')
    }

    console.log('\n🎉 Usuario premium configurado completamente')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email: daveymena16@gmail.com')
    console.log('🔑 Contraseña: 671520Dvd.')
    console.log('💎 Membresía: PROFESSIONAL (1 año)')
    console.log('👑 Rol: ADMIN')
    console.log('✅ Email verificado: Sí')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  } catch (error) {
    console.error('❌ Error creando usuario premium:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
crearUsuarioPremium()
  .then(() => {
    console.log('\n✨ Proceso completado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
