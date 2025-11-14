import { db } from '../src/lib/db'

async function monitorear() {
  console.log('🔍 MONITOREANDO BOT EN TIEMPO REAL')
  console.log('=' .repeat(70))
  console.log('📝 Esperando mensajes... (Ctrl+C para salir)\n')

  let ultimoMensajeId: string | null = null

  // Monitorear cada 2 segundos
  setInterval(async () => {
    try {
      // Obtener último mensaje
      const ultimoMensaje = await db.message.findFirst({
        orderBy: { createdAt: 'desc' },
        include: {
          conversation: {
            select: {
              customerPhone: true,
              customerName: true
            }
          }
        }
      })

      if (!ultimoMensaje) return

      // Si es un mensaje nuevo
      if (ultimoMensaje.id !== ultimoMensajeId) {
        ultimoMensajeId = ultimoMensaje.id

        const direccion = ultimoMensaje.direction === 'INCOMING' ? '📥 RECIBIDO' : '📤 ENVIADO'
        const hora = ultimoMensaje.createdAt.toLocaleTimeString('es-CO')
        
        console.log(`\n${direccion} - ${hora}`)
        console.log(`De/Para: ${ultimoMensaje.conversation.customerName}`)
        console.log(`Mensaje: ${ultimoMensaje.content.substring(0, 100)}${ultimoMensaje.content.length > 100 ? '...' : ''}`)
        
        // Si es mensaje entrante, verificar si hay respuesta
        if (ultimoMensaje.direction === 'INCOMING') {
          console.log('⏳ Esperando respuesta del bot...')
          
          // Esperar 10 segundos para ver si responde
          setTimeout(async () => {
            const respuesta = await db.message.findFirst({
              where: {
                conversationId: ultimoMensaje.conversationId,
                direction: 'OUTGOING',
                createdAt: {
                  gt: ultimoMensaje.createdAt
                }
              },
              orderBy: { createdAt: 'desc' }
            })

            if (respuesta) {
              console.log('✅ Bot respondió correctamente')
            } else {
              console.log('❌ Bot NO respondió - PROBLEMA DETECTADO')
              console.log('💡 Revisa los logs del servidor (npm run dev)')
            }
          }, 10000)
        }
      }
    } catch (error) {
      console.error('❌ Error monitoreando:', error)
    }
  }, 2000)
}

monitorear().catch(console.error)
