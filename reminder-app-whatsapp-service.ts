/**
 * 📱 WhatsApp Service para App de Recordatorios
 * Basado en Smart Sales Bot Pro - Adaptado para recordatorios
 */

import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  WASocket,
  proto,
  WAMessage
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import path from 'path'
import fs from 'fs'
import QRCode from 'qrcode'
import pino from 'pino'

interface ReminderSession {
  socket: WASocket | null
  qr: string | null
  status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'QR_PENDING'
  userId: string
  isReady: boolean
  phoneNumber?: string
}

export class ReminderWhatsAppService {
  private static sessions: Map<string, ReminderSession> = new Map()
  private static qrCallbacks: Map<string, (qr: string) => void> = new Map()
  private static logger = pino({ level: 'silent' })

  /**
   * 🚀 Inicializar conexión WhatsApp
   */
  static async initializeConnection(userId: string): Promise<{ success: boolean; qr?: string; error?: string }> {
    try {
      console.log(`[ReminderWA] 🚀 Inicializando conexión para: ${userId}`)

      // Limpiar sesión anterior
      await this.cleanupSession(userId)

      // Crear directorio para sesiones
      const authDir = path.join(process.cwd(), 'reminder_sessions', userId)
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true })
      }

      // Cargar estado de autenticación
      const { state, saveCreds } = await useMultiFileAuthState(authDir)
      const { version } = await fetchLatestBaileysVersion()

      // Crear socket
      const socket = makeWASocket({
        version,
        logger: this.logger,
        printQRInTerminal: false,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, this.logger)
        },
        generateHighQualityLinkPreview: true
      })

      // Crear sesión
      const session: ReminderSession = {
        socket,
        qr: null,
        status: 'CONNECTING',
        userId,
        isReady: false
      }
      this.sessions.set(userId, session)

      // Configurar eventos
      await this.setupEventHandlers(socket, session, saveCreds, userId)

      return { success: true }
    } catch (error) {
      console.error('[ReminderWA] ❌ Error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  }

  /**
   * 🎯 Configurar eventos
   */
  private static async setupEventHandlers(
    socket: WASocket,
    session: ReminderSession,
    saveCreds: () => Promise<void>,
    userId: string
  ) {
    // Guardar credenciales
    socket.ev.on('creds.update', saveCreds)

    // Manejar conexión
    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update

      console.log(`[ReminderWA] 🔄 Estado:`, { connection, hasQr: !!qr })

      // QR Code
      if (qr) {
        try {
          const qrDataURL = await QRCode.toDataURL(qr, {
            width: 300,
            margin: 2,
            color: { dark: '#25D366', light: '#FFFFFF' }
          })

          session.qr = qrDataURL
          session.status = 'QR_PENDING'

          console.log(`[ReminderWA] 📱 QR generado para ${userId}`)

          // Callback
          const callback = this.qrCallbacks.get(userId)
          if (callback) callback(qrDataURL)
        } catch (error) {
          console.error('[ReminderWA] ❌ Error QR:', error)
        }
      }

      // Conexión exitosa
      if (connection === 'open') {
        console.log(`[ReminderWA] ✅ Conectado: ${userId}`)

        session.status = 'CONNECTED'
        session.qr = null
        session.isReady = true
        session.phoneNumber = socket.user?.id.split(':')[0] || 'unknown'

        // Keep-alive
        this.startKeepAlive(socket, userId)
      }

      // Desconexión
      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut

        console.log(`[ReminderWA] 🔌 Desconectado. Código: ${statusCode}, Reconectar: ${shouldReconnect}`)

        if (shouldReconnect) {
          setTimeout(() => {
            console.log(`[ReminderWA] 🔄 Reconectando...`)
            this.initializeConnection(userId)
          }, 5000)
        } else {
          session.status = 'DISCONNECTED'
          this.sessions.delete(userId)
        }
      }
    })
  }

  /**
   * 📤 Enviar recordatorio por WhatsApp
   */
  static async sendReminder(
    userId: string, 
    phoneNumber: string, 
    message: string,
    options?: {
      includeEmoji?: boolean
      urgent?: boolean
    }
  ): Promise<boolean> {
    try {
      const session = this.sessions.get(userId)

      if (!session || !session.socket || session.status !== 'CONNECTED') {
        console.error('[ReminderWA] ❌ No hay sesión activa')
        return false
      }

      // Formatear número
      const formattedNumber = phoneNumber.includes('@') 
        ? phoneNumber 
        : `${phoneNumber}@s.whatsapp.net`

      // Formatear mensaje
      let finalMessage = message
      if (options?.includeEmoji) {
        const emoji = options.urgent ? '🚨' : '⏰'
        finalMessage = `${emoji} ${message}`
      }

      // Enviar mensaje
      await session.socket.sendMessage(formattedNumber, { text: finalMessage })

      console.log(`[ReminderWA] ✅ Recordatorio enviado a ${phoneNumber}`)
      return true
    } catch (error) {
      console.error('[ReminderWA] ❌ Error enviando:', error)
      return false
    }
  }

  /**
   * 📤 Enviar recordatorio con imagen
   */
  static async sendReminderWithImage(
    userId: string,
    phoneNumber: string,
    message: string,
    imageUrl: string
  ): Promise<boolean> {
    try {
      const session = this.sessions.get(userId)
      if (!session?.socket || session.status !== 'CONNECTED') return false

      const formattedNumber = phoneNumber.includes('@') 
        ? phoneNumber 
        : `${phoneNumber}@s.whatsapp.net`

      await session.socket.sendMessage(formattedNumber, {
        image: { url: imageUrl },
        caption: message
      })

      console.log(`[ReminderWA] ✅ Recordatorio con imagen enviado`)
      return true
    } catch (error) {
      console.error('[ReminderWA] ❌ Error:', error)
      return false
    }
  }

  /**
   * 📊 Obtener estado de conexión
   */
  static getConnectionStatus(userId: string): ReminderSession | null {
    return this.sessions.get(userId) || null
  }

  /**
   * 📱 Registrar callback para QR
   */
  static onQRCode(userId: string, callback: (qr: string) => void) {
    this.qrCallbacks.set(userId, callback)
  }

  /**
   * 🔌 Desconectar
   */
  static async disconnect(userId: string): Promise<boolean> {
    try {
      const session = this.sessions.get(userId)
      if (session?.socket) {
        await session.socket.logout()
      }
      await this.cleanupSession(userId)
      return true
    } catch (error) {
      console.error('[ReminderWA] ❌ Error desconectando:', error)
      return false
    }
  }

  /**
   * 🧹 Limpiar sesión
   */
  private static async cleanupSession(userId: string) {
    this.sessions.delete(userId)
    this.qrCallbacks.delete(userId)
  }

  /**
   * 💓 Keep-alive para mantener conexión
   */
  private static startKeepAlive(socket: WASocket, userId: string): void {
    setInterval(async () => {
      try {
        const session = this.sessions.get(userId)
        if (session?.status === 'CONNECTED' && socket.user) {
          await socket.sendPresenceUpdate('available')
          console.log(`[ReminderWA] 💓 Keep-alive: ${userId}`)
        }
      } catch (error) {
        console.error(`[ReminderWA] ❌ Keep-alive error:`, error)
      }
    }, 30000) // Cada 30 segundos
  }

  /**
   * 📋 Listar todas las sesiones activas
   */
  static getActiveSessions(): Array<{userId: string, status: string, phoneNumber?: string}> {
    return Array.from(this.sessions.entries()).map(([userId, session]) => ({
      userId,
      status: session.status,
      phoneNumber: session.phoneNumber
    }))
  }
}