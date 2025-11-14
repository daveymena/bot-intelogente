import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function diagnosticar() {
  try {
    console.log('🔍 DIAGNÓSTICO DE WHATSAPP\n')

    // 1. Verificar conexión en DB
    const conexiones = await prisma.whatsAppConnection.findMany()
    
    console.log('📊 CONEXIONES EN BASE DE DATOS:')
    if (conexiones.length === 0) {
      console.log('❌ No hay conexiones registradas')
    } else {
      conexiones.forEach(conn => {
        console.log(`\n👤 Usuario: ${conn.userId}`)
        console.log(`📱 Teléfono: ${conn.phoneNumber}`)
        console.log(`🔌 Estado: ${conn.status}`)
        console.log(`✅ Conectado: ${conn.isConnected ? 'SÍ' : 'NO'}`)
        console.log(`🕐 Última conexión: ${conn.lastConnectedAt || 'Nunca'}`)
        console.log(`📝 Último mensaje: ${conn.lastMessageAt || 'Ninguno'}`)
        if (conn.lastError) {
          console.log(`❌ Último error: ${conn.lastError}`)
        }
      })
    }

    // 2. Verificar conversaciones
    console.log('\n\n💬 CONVERSACIONES:')
    const conversaciones = await prisma.conversation.findMany({
      include: {
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { lastMessageAt: 'desc' },
      take: 5
    })

    if (conversaciones.length === 0) {
      console.log('❌ No hay conversaciones registradas')
    } else {
      conversaciones.forEach(conv => {
        console.log(`\n📞 ${conv.customerName} (${conv.customerPhone})`)
        console.log(`   Mensajes: ${conv._count.messages}`)
        console.log(`   Estado: ${conv.status}`)
        console.log(`   Último mensaje: ${conv.lastMessageAt}`)
      })
    }

    // 3. Verificar últimos mensajes
    console.log('\n\n📨 ÚLTIMOS MENSAJES:')
    const mensajes = await prisma.message.findMany({
      include: {
        conversation: {
          select: {
            customerName: true,
            customerPhone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    if (mensajes.length === 0) {
      console.log('❌ No hay mensajes registrados')
    } else {
      mensajes.forEach(msg => {
        const direccion = msg.direction === 'INCOMING' ? '📥' : '📤'
        console.log(`\n${direccion} ${msg.conversation.customerName}`)
        console.log(`   ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`)
        console.log(`   ${msg.createdAt.toLocaleString('es-ES')}`)
      })
    }

    // 4. Verificar productos
    console.log('\n\n📦 PRODUCTOS EN CATÁLOGO:')
    const productos = await prisma.product.count()
    console.log(`Total: ${productos} productos`)

    // 5. Verificar configuración de IA
    console.log('\n\n🤖 CONFIGURACIÓN DE IA:')
    console.log(`GROQ_API_KEY: ${process.env.GROQ_API_KEY ? '✅ Configurada' : '❌ NO configurada'}`)
    console.log(`GROQ_MODEL: ${process.env.GROQ_MODEL || 'llama-3.1-8b-instant (default)'}`)

    console.log('\n\n✅ Diagnóstico completado')

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error)
  } finally {
    await prisma.$disconnect()
  }
}

diagnosticar()
