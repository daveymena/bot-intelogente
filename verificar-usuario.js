/**
 * Script de diagnóstico para verificar usuario en la base de datos
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarUsuario() {
  console.log('🔍 Verificando usuario en la base de datos...\n')

  try {
    const email = 'daveymena16@gmail.com'
    
    // Buscar usuario por email
    const usuario = await prisma.user.findUnique({
      where: { email },
      include: {
        products: true,
        settings: true,
        paymentConfig: true,
        storeSettings: true,
        whatsappConnection: true
      }
    })

    if (!usuario) {
      console.log('❌ Usuario NO encontrado en la base de datos')
      console.log(`   Email buscado: ${email}`)
      console.log('\n📋 Posibles causas:')
      console.log('   1. El seed no se ha ejecutado')
      console.log('   2. La base de datos está vacía')
      console.log('   3. El email es diferente')
      console.log('\n💡 Solución:')
      console.log('   Ejecuta: npm run seed')
      console.log('   O: node prisma/seed.js')
      
      // Mostrar todos los usuarios existentes
      const todosUsuarios = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          membershipType: true,
          isEmailVerified: true,
          createdAt: true
        }
      })
      
      if (todosUsuarios.length > 0) {
        console.log('\n📊 Usuarios existentes en la base de datos:')
        todosUsuarios.forEach((u, i) => {
          console.log(`\n   ${i + 1}. ${u.name || 'Sin nombre'}`)
          console.log(`      Email: ${u.email}`)
          console.log(`      Role: ${u.role}`)
          console.log(`      Membership: ${u.membershipType}`)
          console.log(`      Verificado: ${u.isEmailVerified ? '✅' : '❌'}`)
          console.log(`      Creado: ${u.createdAt.toLocaleString()}`)
        })
      } else {
        console.log('\n📊 No hay usuarios en la base de datos')
      }
      
      return
    }

    // Usuario encontrado - mostrar información completa
    console.log('✅ Usuario ENCONTRADO en la base de datos\n')
    console.log('👤 INFORMACIÓN DEL USUARIO:')
    console.log('═'.repeat(50))
    console.log(`   ID: ${usuario.id}`)
    console.log(`   Nombre: ${usuario.name || 'No configurado'}`)
    console.log(`   Email: ${usuario.email}`)
    console.log(`   Teléfono: ${usuario.phone || 'No configurado'}`)
    console.log(`   Role: ${usuario.role}`)
    console.log(`   Membership: ${usuario.membershipType}`)
    console.log(`   Estado: ${usuario.isActive ? '✅ Activo' : '❌ Inactivo'}`)
    console.log(`   Email verificado: ${usuario.isEmailVerified ? '✅ Sí' : '❌ No'}`)
    console.log(`   Teléfono verificado: ${usuario.isPhoneVerified ? '✅ Sí' : '❌ No'}`)
    console.log(`   Negocio: ${usuario.businessName || 'No configurado'}`)
    console.log(`   Último login: ${usuario.lastLoginAt ? usuario.lastLoginAt.toLocaleString() : 'Nunca'}`)
    console.log(`   Creado: ${usuario.createdAt.toLocaleString()}`)
    console.log(`   Actualizado: ${usuario.updatedAt.toLocaleString()}`)

    // Productos
    console.log('\n📦 PRODUCTOS:')
    console.log('═'.repeat(50))
    if (usuario.products.length > 0) {
      console.log(`   Total: ${usuario.products.length} productos`)
      usuario.products.forEach((p, i) => {
        console.log(`\n   ${i + 1}. ${p.name}`)
        console.log(`      Precio: $${p.price.toLocaleString()} ${p.currency}`)
        console.log(`      Categoría: ${p.category}`)
        console.log(`      Estado: ${p.status}`)
      })
    } else {
      console.log('   ⚠️  No hay productos registrados')
    }

    // Configuración del bot
    console.log('\n⚙️  CONFIGURACIÓN DEL BOT:')
    console.log('═'.repeat(50))
    if (usuario.settings) {
      console.log(`   Negocio: ${usuario.settings.businessName}`)
      console.log(`   Teléfono: ${usuario.settings.businessPhone}`)
      console.log(`   Auto-respuesta: ${usuario.settings.autoResponseEnabled ? '✅ Habilitada' : '❌ Deshabilitada'}`)
      console.log(`   Groq API: ${usuario.settings.groqApiKey ? '✅ Configurada' : '❌ No configurada'}`)
    } else {
      console.log('   ⚠️  No hay configuración del bot')
    }

    // Configuración de pagos
    console.log('\n💳 CONFIGURACIÓN DE PAGOS:')
    console.log('═'.repeat(50))
    if (usuario.paymentConfig) {
      const config = usuario.paymentConfig
      console.log(`   MercadoPago: ${config.mercadoPagoEnabled ? '✅ Habilitado' : '❌ Deshabilitado'}`)
      console.log(`   PayPal: ${config.paypalEnabled ? '✅ Habilitado' : '❌ Deshabilitado'}`)
      console.log(`   Nequi: ${config.nequiEnabled ? '✅ Habilitado' : '❌ Deshabilitado'}`)
      console.log(`   Daviplata: ${config.daviplataEnabled ? '✅ Habilitado' : '❌ Deshabilitado'}`)
      console.log(`   Transferencia: ${config.bankTransferEnabled ? '✅ Habilitado' : '❌ Deshabilitado'}`)
    } else {
      console.log('   ⚠️  No hay configuración de pagos')
    }

    // Configuración de tienda
    console.log('\n🏪 CONFIGURACIÓN DE TIENDA:')
    console.log('═'.repeat(50))
    if (usuario.storeSettings) {
      const store = usuario.storeSettings
      console.log(`   Nombre: ${store.storeName}`)
      console.log(`   Slogan: ${store.storeSlogan || 'No configurado'}`)
      console.log(`   Email: ${store.email || 'No configurado'}`)
      console.log(`   Teléfono: ${store.phone || 'No configurado'}`)
      console.log(`   WhatsApp: ${store.whatsapp || 'No configurado'}`)
      console.log(`   Dirección: ${store.address || 'No configurado'}`)
    } else {
      console.log('   ⚠️  No hay configuración de tienda')
    }

    // Conexión WhatsApp
    console.log('\n📱 CONEXIÓN WHATSAPP:')
    console.log('═'.repeat(50))
    if (usuario.whatsappConnection) {
      const conn = usuario.whatsappConnection
      console.log(`   Estado: ${conn.status}`)
      console.log(`   Número: ${conn.phoneNumber || 'No configurado'}`)
      console.log(`   Conectado: ${conn.isConnected ? '✅ Sí' : '❌ No'}`)
      console.log(`   Última conexión: ${conn.lastConnectedAt ? conn.lastConnectedAt.toLocaleString() : 'Nunca'}`)
    } else {
      console.log('   ⚠️  No hay conexión WhatsApp configurada')
    }

    console.log('\n' + '═'.repeat(50))
    console.log('✅ Verificación completada')

  } catch (error) {
    console.error('❌ Error al verificar usuario:', error.message)
    console.error('\n📋 Detalles del error:')
    console.error(error)
  }
}

// Ejecutar verificación
verificarUsuario()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
