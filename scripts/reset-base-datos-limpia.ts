import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetBaseDatos() {
  console.log('🔥 RESET COMPLETO DE BASE DE DATOS')
  console.log('⚠️  Esto eliminará TODAS las conversaciones, mensajes y conexiones')
  console.log('✅ Mantendrá: Productos reales y usuario admin')
  console.log('\n' + '='.repeat(60))

  try {
    // 1. Eliminar TODAS las conversaciones y mensajes
    console.log('\n💬 Eliminando todas las conversaciones y mensajes...')
    
    const mensajes = await prisma.message.deleteMany({})
    console.log(`   ❌ ${mensajes.count} mensajes eliminados`)

    const conversaciones = await prisma.conversation.deleteMany({})
    console.log(`   ❌ ${conversaciones.count} conversaciones eliminadas`)

    // 2. Eliminar TODAS las conexiones WhatsApp
    console.log('\n📱 Eliminando todas las conexiones WhatsApp...')
    
    const conexiones = await prisma.whatsAppConnection.deleteMany({})
    console.log(`   ❌ ${conexiones.count} conexiones eliminadas`)

    // 3. Eliminar TODAS las sesiones
    console.log('\n🔐 Eliminando todas las sesiones...')
    
    const sesiones = await prisma.session.deleteMany({})
    console.log(`   ❌ ${sesiones.count} sesiones eliminadas`)

    // 4. Eliminar prompts de IA
    console.log('\n🤖 Eliminando prompts de IA...')
    
    const prompts = await prisma.aIPrompt.deleteMany({})
    console.log(`   ❌ ${prompts.count} prompts eliminados`)

    // 5. Eliminar productos demo/duplicados
    console.log('\n📦 Eliminando productos demo...')
    
    const productosDemo = await prisma.product.deleteMany({
      where: {
        OR: [
          { name: { contains: 'Gaming ASUS ROG' } },
          { name: { contains: 'Paquete de Proyectos Web' } },
          { name: { contains: 'Servicio de Mantenimiento' } },
          { name: { contains: 'Pulsar NS160 FI 2020' } },
          { description: { contains: 'Moto en excelentes condiciones' } }
        ]
      }
    })
    console.log(`   ❌ ${productosDemo.count} productos demo eliminados`)

    // 6. Mantener solo usuario admin principal
    console.log('\n👤 Limpiando usuarios...')
    
    const usuarioAdmin = 'daveymena16@gmail.com'
    
    const usuariosEliminados = await prisma.user.deleteMany({
      where: {
        email: {
          not: usuarioAdmin
        }
      }
    })
    console.log(`   ❌ ${usuariosEliminados.count} usuarios eliminados`)
    console.log(`   ✅ Usuario mantenido: ${usuarioAdmin}`)

    // 7. Verificar que el usuario admin existe
    let admin = await prisma.user.findUnique({
      where: { email: usuarioAdmin }
    })

    if (!admin) {
      console.log('\n⚠️  Usuario admin no existe, creando...')
      
      const bcrypt = await import('bcryptjs')
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      admin = await prisma.user.create({
        data: {
          email: usuarioAdmin,
          name: 'Admin',
          password: hashedPassword,
          role: 'ADMIN',
          isEmailVerified: true,
          businessName: 'Tecnovariedades D&S',
          phone: '+57 304 274 8687'
        }
      })
      console.log(`   ✅ Usuario admin creado: ${admin.email}`)
    }

    // 8. Reasignar todos los productos al usuario admin
    console.log('\n📦 Reasignando productos al usuario admin...')
    
    const productosActualizados = await prisma.product.updateMany({
      data: {
        userId: admin.id
      }
    })
    console.log(`   ✅ ${productosActualizados.count} productos reasignados`)

    // 9. Estadísticas finales
    console.log('\n' + '='.repeat(60))
    console.log('📊 ESTADO FINAL DE LA BASE DE DATOS')
    console.log('='.repeat(60))

    const stats = {
      usuarios: await prisma.user.count(),
      productos: await prisma.product.count(),
      conversaciones: await prisma.conversation.count(),
      mensajes: await prisma.message.count(),
      conexionesWhatsApp: await prisma.whatsAppConnection.count(),
      sesiones: await prisma.session.count()
    }

    console.log(`\n✅ Usuarios: ${stats.usuarios}`)
    console.log(`✅ Productos: ${stats.productos}`)
    console.log(`✅ Conversaciones: ${stats.conversaciones}`)
    console.log(`✅ Mensajes: ${stats.mensajes}`)
    console.log(`✅ Conexiones WhatsApp: ${stats.conexionesWhatsApp}`)
    console.log(`✅ Sesiones: ${stats.sesiones}`)

    // Mostrar algunos productos
    console.log('\n📦 Productos en la base de datos:')
    const productos = await prisma.product.findMany({ take: 10 })
    productos.forEach(p => console.log(`   - ${p.name}`))
    if (stats.productos > 10) {
      console.log(`   ... y ${stats.productos - 10} más`)
    }

    console.log('\n' + '='.repeat(60))
    console.log('✨ BASE DE DATOS LIMPIA Y LISTA')
    console.log('='.repeat(60))
    console.log('\n📝 Credenciales de acceso:')
    console.log(`   Email: ${usuarioAdmin}`)
    console.log(`   Password: admin123`)
    console.log('\n🚀 Ahora puedes iniciar el sistema y conectar WhatsApp')

  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetBaseDatos()
