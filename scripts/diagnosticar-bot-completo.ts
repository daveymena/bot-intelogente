/**
 * 🔍 DIAGNÓSTICO COMPLETO DEL BOT
 * Verifica por qué el bot no responde mensajes
 */

import { db } from '../src/lib/db'

async function diagnosticar() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DEL BOT\n')
  console.log('='.repeat(70))

  try {
    // 1. Verificar conexiones de WhatsApp
    console.log('\n1️⃣ CONEXIONES DE WHATSAPP:\n')
    
    const connections = await db.whatsAppConnection.findMany({
      select: {
        userId: true,
        phoneNumber: true,
        status: true,
        isConnected: true,
        lastConnectedAt: true,
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    if (connections.length === 0) {
      console.log('❌ No hay conexiones de WhatsApp')
      console.log('💡 Necesitas conectar WhatsApp desde el dashboard')
    } else {
      connections.forEach((conn, i) => {
        console.log(`${i + 1}. Usuario: ${conn.user.email}`)
        console.log(`   Teléfono: ${conn.phoneNumber}`)
        console.log(`   Estado: ${conn.status}`)
        console.log(`   Conectado: ${conn.isConnected ? '✅ Sí' : '❌ No'}`)
        console.log(`   Última conexión: ${conn.lastConnectedAt?.toLocaleString() || 'Nunca'}`)
        console.log()
      })
    }

    // 2. Verificar mensajes recientes
    console.log('2️⃣ MENSAJES RECIENTES (últimos 10):\n')
    
    const messages = await db.message.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        direction: true,
        createdAt: true,
        conversation: {
          select: {
            customerPhone: true,
            customerName: true
          }
        }
      }
    })

    if (messages.length === 0) {
      console.log('❌ No hay mensajes en la base de datos')
      console.log('💡 El bot no está recibiendo mensajes')
    } else {
      messages.forEach((msg, i) => {
        const direction = msg.direction === 'INCOMING' ? '📥' : '📤'
        console.log(`${i + 1}. ${direction} ${msg.conversation?.customerPhone || 'Desconocido'}`)
        console.log(`   "${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}"`)
        console.log(`   ${msg.createdAt.toLocaleString()}`)
        console.log()
      })
    }

    // 3. Verificar conversaciones activas
    console.log('3️⃣ CONVERSACIONES ACTIVAS:\n')
    
    const conversations = await db.conversation.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        customerPhone: true,
        customerName: true,
        lastMessageAt: true,
        _count: {
          select: { messages: true }
        }
      }
    })

    if (conversations.length === 0) {
      console.log('⚠️  No hay conversaciones activas')
    } else {
      conversations.forEach((conv, i) => {
        console.log(`${i + 1}. ${conv.customerName || conv.customerPhone}`)
        console.log(`   Mensajes: ${conv._count.messages}`)
        console.log(`   Último mensaje: ${conv.lastMessageAt.toLocaleString()}`)
        console.log()
      })
    }

    // 4. Verificar configuración de IA
    console.log('4️⃣ CONFIGURACIÓN DE IA:\n')
    
    const groqKey = process.env.GROQ_API_KEY
    const groqModel = process.env.GROQ_MODEL
    const ollamaEnabled = process.env.OLLAMA_ENABLED
    const ollamaUrl = process.env.OLLAMA_BASE_URL
    const fallbackEnabled = process.env.AI_FALLBACK_ENABLED

    console.log(`Groq API Key: ${groqKey ? '✅ Configurada' : '❌ No configurada'}`)
    console.log(`Groq Model: ${groqModel || 'No especificado'}`)
    console.log(`Ollama Enabled: ${ollamaEnabled}`)
    console.log(`Ollama URL: ${ollamaUrl || 'No configurada'}`)
    console.log(`Fallback Enabled: ${fallbackEnabled}`)

    // 5. Verificar productos
    console.log('\n5️⃣ PRODUCTOS DISPONIBLES:\n')
    
    const products = await db.product.count({
      where: { status: 'AVAILABLE' }
    })

    console.log(`Total productos: ${products}`)
    if (products === 0) {
      console.log('⚠️  No hay productos disponibles')
    }

    // 6. Resumen y recomendaciones
    console.log('\n' + '='.repeat(70))
    console.log('📊 RESUMEN Y RECOMENDACIONES:\n')

    const connectedCount = connections.filter(c => c.isConnected).length
    const hasMessages = messages.length > 0
    const hasAI = !!groqKey

    if (connectedCount === 0) {
      console.log('❌ PROBLEMA: WhatsApp no está conectado')
      console.log('   Solución: Ve al dashboard y conecta WhatsApp')
    } else {
      console.log('✅ WhatsApp está conectado')
    }

    if (!hasMessages) {
      console.log('❌ PROBLEMA: No hay mensajes en la BD')
      console.log('   Posibles causas:')
      console.log('   - El servidor no está corriendo')
      console.log('   - WhatsApp no está recibiendo mensajes')
      console.log('   - Hay un error en el manejador de mensajes')
    } else {
      console.log('✅ El bot está recibiendo mensajes')
      
      const lastIncoming = messages.find(m => m.direction === 'INCOMING')
      const lastOutgoing = messages.find(m => m.direction === 'OUTGOING')
      
      if (lastIncoming && !lastOutgoing) {
        console.log('❌ PROBLEMA: Recibe mensajes pero no responde')
        console.log('   Posibles causas:')
        console.log('   - Error en la IA')
        console.log('   - Error en el servicio de respuestas')
        console.log('   - Revisa los logs del servidor')
      } else if (lastIncoming && lastOutgoing) {
        const timeDiff = lastIncoming.createdAt.getTime() - lastOutgoing.createdAt.getTime()
        if (timeDiff > 0) {
          console.log('⚠️  Hay mensajes entrantes sin responder')
        } else {
          console.log('✅ El bot está respondiendo mensajes')
        }
      }
    }

    if (!hasAI) {
      console.log('❌ PROBLEMA: IA no configurada')
      console.log('   Solución: Configura GROQ_API_KEY en .env')
    } else {
      console.log('✅ IA configurada')
    }

    console.log('\n💡 PRÓXIMOS PASOS:')
    console.log('   1. Verifica que el servidor esté corriendo (npm run dev)')
    console.log('   2. Revisa los logs del servidor en la consola')
    console.log('   3. Envía un mensaje de prueba por WhatsApp')
    console.log('   4. Observa si aparece en los logs')

  } catch (error) {
    console.error('\n❌ Error en diagnóstico:', error)
  }
}

diagnosticar()
  .then(() => {
    console.log('\n✅ Diagnóstico completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
