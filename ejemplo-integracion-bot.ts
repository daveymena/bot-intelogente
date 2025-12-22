/**
 * 📝 EJEMPLO DE INTEGRACIÓN CON TU BOT ACTUAL
 * Copia este código en tu archivo principal del bot
 */

import { HybridMessageHandler } from './lib/hybrid-message-handler'

// Inicializar handler con tu API key de Groq
const messageHandler = new HybridMessageHandler(process.env.GROQ_API_KEY)

// En tu handler de mensajes de Baileys:
socket.ev.on('messages.upsert', async ({ messages }) => {
  for (const msg of messages) {
    if (msg.key.fromMe) continue // Ignorar mensajes propios
    
    const from = msg.key.remoteJid
    const messageText = msg.message?.conversation || 
                       msg.message?.extendedTextMessage?.text || ''
    
    if (!messageText) continue

    try {
      // Procesar con sistema híbrido
      const response = await messageHandler.handleIncomingMessage(
        messageText,
        from,
        userId // Tu userId
      )

      // Enviar respuesta
      await socket.sendMessage(from, { text: response })

    } catch (error) {
      console.error('Error:', error)
    }
  }
})

// Para cambiar entre modo IA y modo local:
// messageHandler.setAIMode(false) // Desactivar IA (solo BD)
// messageHandler.setAIMode(true)  // Activar IA (BD + IA)
