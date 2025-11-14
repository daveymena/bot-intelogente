import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function limpiarDatosDemo() {
  console.log('🧹 LIMPIANDO DATOS DEMO DE LA BASE DE DATOS\n')
  console.log('='.repeat(60))

  try {
    // 1. Eliminar productos demo/prueba
    console.log('\n📦 Limpiando productos demo...')
    
    const productosDemo = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'Gaming ASUS ROG' } },
          { name: { contains: 'Paquete de Proyectos Web' } },
          { name: { contains: 'Servicio de Mantenimiento' } },
          { name: { contains: 'Pulsar NS160 FI 2020' } }, // Duplicado, mantener solo Bajaj
          { description: { contains: 'Moto en excelentes condiciones' } } // Demo
        ]
      }
    })

    console.log(`   Encontrados ${productosDemo.length} productos demo`)
    
    for (const producto of productosDemo) {
      await prisma.product.delete({ where: { id: producto.id } })
      console.log(`   ❌ Eliminado: ${producto.name}`)
    }

    // 2. Eliminar conversaciones de prueba
    console.log('\n💬 Limpiando conversaciones de prueba...')
    
    const conversacionesPrueba = await prisma.conversation.findMany({
      where: {
        OR: [
          { customerName: { contains: 'Test' } },
          { customerName: { contains: 'Demo' } },
          { customerName: { contains: 'Prueba' } },
          { customerPhone: { contains: 'test' } }
        ]
      }
    })

    console.log(`   Encontradas ${conversacionesPrueba.length} conversaciones de prueba`)
    
    for (const conv of conversacionesPrueba) {
      // Primero eliminar mensajes
      await prisma.message.deleteMany({ where: { conversationId: conv.id } })
      // Luego eliminar conversación
      await prisma.conversation.delete({ where: { id: conv.id } })
      console.log(`   ❌ Eliminada conversación: ${conv.customerName}`)
    }

    // 3. Eliminar usuarios demo (excepto los reales)
    console.log('\n👤 Limpiando usuarios demo...')
    
    const usuariosReales = [
      'daveymena16@gmail.com',
      'admin@tecnovariedades.com',
      'demo@tecnovariedades.com' // Mantener para pruebas
    ]

    const usuariosDemo = await prisma.user.findMany({
      where: {
        email: {
          notIn: usuariosReales
        }
      }
    })

    console.log(`   Encontrados ${usuariosDemo.length} usuarios demo`)
    
    for (const usuario of usuariosDemo) {
      // Eliminar datos relacionados primero
      await prisma.whatsAppConnection.deleteMany({ where: { userId: usuario.id } })
      await prisma.conversation.deleteMany({ where: { userId: usuario.id } })
      await prisma.product.deleteMany({ where: { userId: usuario.id } })
      await prisma.aIPrompt.deleteMany({ where: { userId: usuario.id } })
      await prisma.session.deleteMany({ where: { userId: usuario.id } })
      
      // Eliminar usuario
      await prisma.user.delete({ where: { id: usuario.id } })
      console.log(`   ❌ Eliminado usuario: ${usuario.email}`)
    }

    // 4. Limpiar sesiones expiradas
    console.log('\n🔐 Limpiando sesiones expiradas...')
    
    const sesionesExpiradas = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })

    console.log(`   ❌ Eliminadas ${sesionesExpiradas.count} sesiones expiradas`)

    // 5. Limpiar conexiones WhatsApp desconectadas antiguas
    console.log('\n📱 Limpiando conexiones WhatsApp antiguas...')
    
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() - 7) // Más de 7 días

    const conexionesAntiguas = await prisma.whatsAppConnection.deleteMany({
      where: {
        AND: [
          { status: 'DISCONNECTED' },
          { updatedAt: { lt: fechaLimite } }
        ]
      }
    })

    console.log(`   ❌ Eliminadas ${conexionesAntiguas.count} conexiones antiguas`)

    // 6. Estadísticas finales
    console.log('\n' + '='.repeat(60))
    console.log('📊 ESTADÍSTICAS FINALES')
    console.log('='.repeat(60))

    const stats = {
      usuarios: await prisma.user.count(),
      productos: await prisma.product.count(),
      conversaciones: await prisma.conversation.count(),
      mensajes: await prisma.message.count(),
      conexionesWhatsApp: await prisma.whatsAppConnection.count()
    }

    console.log(`\n✅ Usuarios: ${stats.usuarios}`)
    console.log(`✅ Productos: ${stats.productos}`)
    console.log(`✅ Conversaciones: ${stats.conversaciones}`)
    console.log(`✅ Mensajes: ${stats.mensajes}`)
    console.log(`✅ Conexiones WhatsApp: ${stats.conexionesWhatsApp}`)

    console.log('\n' + '='.repeat(60))
    console.log('✨ BASE DE DATOS LIMPIA Y LISTA PARA DATOS REALES')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

limpiarDatosDemo()
