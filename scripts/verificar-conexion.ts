import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verificar() {
  try {
    console.log('🔍 VERIFICANDO CONEXIÓN DE WHATSAPP\n')

    const conexion = await prisma.whatsAppConnection.findFirst({
      orderBy: { lastConnectedAt: 'desc' }
    })

    if (!conexion) {
      console.log('❌ No hay conexión registrada')
      console.log('\n💡 SOLUCIÓN: Conecta WhatsApp desde el dashboard')
      return
    }

    console.log('📊 ESTADO DE LA CONEXIÓN:')
    console.log(`   Usuario: ${conexion.userId}`)
    console.log(`   Teléfono: ${conexion.phoneNumber}`)
    console.log(`   Estado: ${conexion.status}`)
    console.log(`   Conectado: ${conexion.isConnected ? '✅ SÍ' : '❌ NO'}`)
    console.log(`   Última conexión: ${conexion.lastConnectedAt || 'Nunca'}`)
    console.log(`   Último mensaje: ${conexion.lastMessageAt || 'Ninguno'}`)
    
    if (conexion.lastError) {
      console.log(`   ⚠️ Último error: ${conexion.lastError}`)
    }

    console.log('\n📨 ÚLTIMOS MENSAJES:')
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
      take: 5
    })

    if (mensajes.length === 0) {
      console.log('   ❌ No hay mensajes registrados')
    } else {
      mensajes.forEach(msg => {
        const dir = msg.direction === 'INCOMING' ? '📥 IN ' : '📤 OUT'
        console.log(`   ${dir} ${msg.conversation.customerName}: ${msg.content.substring(0, 40)}...`)
        console.log(`        ${msg.createdAt.toLocaleString('es-ES')}`)
      })
    }

    // Diagnóstico
    console.log('\n🔧 DIAGNÓSTICO:')
    
    if (conexion.status !== 'CONNECTED') {
      console.log('   ❌ WhatsApp NO está conectado')
      console.log('   💡 SOLUCIÓN: Reconecta WhatsApp desde el dashboard')
    } else if (!conexion.isConnected) {
      console.log('   ⚠️ Estado inconsistente (CONNECTED pero isConnected=false)')
      console.log('   💡 SOLUCIÓN: Desconecta y vuelve a conectar')
    } else if (!conexion.lastMessageAt) {
      console.log('   ⚠️ Conectado pero no ha recibido mensajes')
      console.log('   💡 Envía un mensaje de prueba al bot')
    } else {
      const minutosDesdeUltimoMensaje = Math.floor((Date.now() - new Date(conexion.lastMessageAt).getTime()) / 60000)
      console.log(`   ✅ Todo parece estar bien`)
      console.log(`   ℹ️ Último mensaje hace ${minutosDesdeUltimoMensaje} minutos`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificar()
