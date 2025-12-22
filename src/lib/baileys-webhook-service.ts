/**
 * Baileys Webhook Service - Versión Simplificada
 * 
 * Responsabilidades:
 * ✅ Conectar con WhatsApp
 * ✅ Recibir mensajes → enviar a n8n
 * ✅ Enviar mensajes desde n8n → WhatsApp
 * ✅ Mantener sesión estable
 * 
 * NO hace:
 * ❌ Lógica de negocio
 * ❌ Llamadas a IA
 * ❌ Consultas a base de datos
 */

import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  proto,
  downloadMediaMessage
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import axios from 'axios'
import * as fs from 'fs'
import * as path from 'path'

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/whatsapp-incoming'
const AUTH_DIR = './auth_sessions'

interface IncomingMessage {
  from: string
  message: string
  timestamp: number
  messageId: string
  hasMedia: boolean
  mediaType?: 'image' | 'audio' | 'video' | 'document'
  mediaUrl?: string
}

export class BaileysWebhookService {
  private sock: WASocket | null = null
  private qrCode: string | null = null
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected'

  /**
   * Conectar con WhatsApp
   */
  async connect(): Promise<void> {
    try {
      console.log('🔄 Iniciando conexión con WhatsApp...')
      
      // Crear directorio de sesiones si no existe
      if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true })
      }

      const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)

      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ['Smart Sales Bot', 'Chrome', '1.0.0'],
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
        markOnlineOnConnect: true
      })

      this.connectionStatus = 'connecting'

      // Guardar credenciales cuando cambien
      this.sock.ev.on('creds.update', saveCreds)

      // Manejar actualizaciones de conexión
      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr) {
          this.qrCode = qr
          console.log('📱 QR Code generado')
        }

        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
          
          console.log('❌ Conexión cerrada. Reconectar:', shouldReconnect)
          
          if (shouldReconnect) {
            this.connectionStatus = 'disconnected'
            setTimeout(() => this.connect(), 5000)
          } else {
            this.connectionStatus = 'disconnected'
            this.qrCode = null
          }
        } else if (connection === 'open') {
          this.connectionStatus = 'connected'
          this.qrCode = null
          console.log('✅ Conectado a WhatsApp')
        }
      })

      // Escuchar mensajes entrantes
      this.sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
          await this.handleIncomingMessage(msg)
        }
      })

    } catch (error) {
      console.error('❌ Error conectando con WhatsApp:', error)
      this.connectionStatus = 'disconnected'
      throw error
    }
  }

  /**
   * Manejar mensaje entrante
   */
  private async handleIncomingMessage(msg: proto.IWebMessageInfo): Promise<void> {
    try {
      // Ignorar mensajes propios
      if (msg.key.fromMe) return

      // Ignorar mensajes de estado
      if (msg.key.remoteJid === 'status@broadcast') return

      const from = msg.key.remoteJid || ''
      const messageId = msg.key.id || ''
      const timestamp = Number(msg.messageTimestamp) || Date.now()

      // Extraer texto del mensaje
      let messageText = ''
      if (msg.message?.conversation) {
        messageText = msg.message.conversation
      } else if (msg.message?.extendedTextMessage?.text) {
        messageText = msg.message.extendedTextMessage.text
      } else if (msg.message?.imageMessage?.caption) {
        messageText = msg.message.imageMessage.caption
      }

      // Detectar media
      let hasMedia = false
      let mediaType: 'image' | 'audio' | 'video' | 'document' | undefined
      let mediaUrl: string | undefined

      if (msg.message?.imageMessage) {
        hasMedia = true
        mediaType = 'image'
      } else if (msg.message?.audioMessage) {
        hasMedia = true
        mediaType = 'audio'
      } else if (msg.message?.videoMessage) {
        hasMedia = true
        mediaType = 'video'
      } else if (msg.message?.documentMessage) {
        hasMedia = true
        mediaType = 'document'
      }

      // Si hay media, descargarla (opcional)
      if (hasMedia && this.sock) {
        try {
          const buffer = await downloadMediaMessage(msg, 'buffer', {})
          // Aquí podrías subir a un servidor de archivos
          // Por ahora solo lo guardamos localmente
          const filename = `${messageId}.${mediaType}`
          const filepath = path.join('./temp-media', filename)
          
          if (!fs.existsSync('./temp-media')) {
            fs.mkdirSync('./temp-media', { recursive: true })
          }
          
          fs.writeFileSync(filepath, buffer as Buffer)
          mediaUrl = filepath
        } catch (error) {
          console.error('Error descargando media:', error)
        }
      }

      // Preparar datos para n8n
      const incomingMessage: IncomingMessage = {
        from,
        message: messageText,
        timestamp,
        messageId,
        hasMedia,
        mediaType,
        mediaUrl
      }

      console.log('📨 Mensaje recibido:', {
        from: from.split('@')[0],
        message: messageText.substring(0, 50),
        hasMedia
      })

      // Enviar a n8n
      await this.sendToN8N(incomingMessage)

    } catch (error) {
      console.error('❌ Error procesando mensaje:', error)
    }
  }

  /**
   * Enviar mensaje a n8n webhook
   */
  private async sendToN8N(data: IncomingMessage): Promise<void> {
    try {
      await axios.post(N8N_WEBHOOK_URL, data, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('✅ Mensaje enviado a n8n')
    } catch (error) {
      console.error('❌ Error enviando a n8n:', error)
      // Aquí podrías implementar un sistema de cola para reintentar
    }
  }

  /**
   * Enviar mensaje a WhatsApp (llamado desde n8n)
   */
  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      if (!this.sock || this.connectionStatus !== 'connected') {
        throw new Error('WhatsApp no está conectado')
      }

      // Asegurar formato correcto del número
      const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`

      await this.sock.sendMessage(jid, { text: message })
      
      console.log('✅ Mensaje enviado a WhatsApp:', {
        to: to.split('@')[0],
        message: message.substring(0, 50)
      })

      return true
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error)
      return false
    }
  }

  /**
   * Enviar imagen con caption
   */
  async sendImage(to: string, imageUrl: string, caption?: string): Promise<boolean> {
    try {
      if (!this.sock || this.connectionStatus !== 'connected') {
        throw new Error('WhatsApp no está conectado')
      }

      const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`

      // Descargar imagen
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
      const buffer = Buffer.from(response.data)

      await this.sock.sendMessage(jid, {
        image: buffer,
        caption: caption || ''
      })

      console.log('✅ Imagen enviada a WhatsApp')
      return true
    } catch (error) {
      console.error('❌ Error enviando imagen:', error)
      return false
    }
  }

  /**
   * Obtener estado de conexión
   */
  getStatus(): {
    status: string
    qrCode: string | null
  } {
    return {
      status: this.connectionStatus,
      qrCode: this.qrCode
    }
  }

  /**
   * Desconectar
   */
  async disconnect(): Promise<void> {
    if (this.sock) {
      await this.sock.logout()
      this.sock = null
      this.connectionStatus = 'disconnected'
      this.qrCode = null
      console.log('👋 Desconectado de WhatsApp')
    }
  }
}

// Singleton instance
let instance: BaileysWebhookService | null = null

export function getBaileysWebhookService(): BaileysWebhookService {
  if (!instance) {
    instance = new BaileysWebhookService()
  }
  return instance
}
