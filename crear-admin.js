/**
 * Script para crear usuario administrador
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function crearAdmin() {
  try {
    console.log('🔐 Creando usuario administrador...')

    // Datos del administrador
    const adminData = {
      email: 'daveymena16@gmail.com',
      name: 'Davey Mena',
      password: '6715320Dvd',
      role: 'ADMIN',
      membershipType: 'PROFESSIONAL',
      isActive: true,
      isEmailVerified: true,
      businessName: 'Tecnovariedades D&S',
      businessPhone: '+57 304 274 8687',
      businessAddress: 'Centro Comercial El Diamante 2, San Nicolás, Cali',
      adminNotificationPhone: '3005560186'
    }

    // Verificar si ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: adminData.email }
    })

    if (existingUser) {
      console.log('⚠️  Usuario administrador ya existe, actualizando...')
      await prisma.user.update({
        where: { email: adminData.email },
        data: {
          ...adminData,
          password: await bcrypt.hash(adminData.password, 10)
        }
      })
      console.log('✅ Usuario administrador actualizado')
    } else {
      // Crear nuevo usuario
      const hashedPassword = await bcrypt.hash(adminData.password, 10)

      const user = await prisma.user.create({
        data: {
          ...adminData,
          password: hashedPassword
        }
      })

      console.log('✅ Usuario administrador creado exitosamente')
      console.log('📧 Email:', user.email)
      console.log('👤 Nombre:', user.name)
      console.log('🏢 Empresa:', user.businessName)
    }

    // Crear configuración de bot por defecto
    const botSettings = await prisma.botSettings.upsert({
      where: { userId: (await prisma.user.findUnique({ where: { email: adminData.email } })).id },
      update: {
        businessName: adminData.businessName,
        businessPhone: adminData.businessPhone,
        businessAddress: adminData.businessAddress
      },
      create: {
        userId: (await prisma.user.findUnique({ where: { email: adminData.email } })).id,
        businessName: adminData.businessName,
        businessPhone: adminData.businessPhone,
        businessAddress: adminData.businessAddress
      }
    })

    console.log('✅ Configuración de bot creada/actualizada')

  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  crearAdmin()
    .then(() => {
      console.log('\n🎉 Usuario administrador configurado correctamente')
      console.log('📧 daveymena16@gmail.com')
      console.log('🔑 6715320Dvd')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Error:', error)
      process.exit(1)
    })
}

module.exports = { crearAdmin }