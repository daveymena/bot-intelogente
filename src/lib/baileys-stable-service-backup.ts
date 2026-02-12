import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  WASocket,
  proto,
  WAMessage,
  downloadMediaMessage
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import path from 'path'
import fs from 'fs'
import { db } from './db'
import QRCode from 'qrcode'
import pino from 'pino'
import { AudioTranscriptionService } from './audio-transcription-service'
import { VoiceGenerationService } from './voice-generation-service'
// 🛡️ Sistema Anti-Ban
import { SafeBaileysSender } from './safe-baileys-sender'
import { SafeReconnectManager } from './safe-reconnect-manager'

interface BaileysSession {
  socket: WASocket | null
  qr: string | null
  status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'QR_PENDING'
  userId: string
  isReady: boolean
  reconnectAttempts: number
  lastDisconnect: Date | null
}

export class BaileysStableService {
  private static sessions: Map<string, BaileysSession> = new Map()
  private static qrCallbacks: Map<string, (qr: string) => void> = new Map()
  private static reconnectTimers: Map<string, NodeJS.Timeout> = new Map()
  private static connectionLocks: Map<string, number> = new Map() // 🔒 Bloqueo de conexiones con timestamp
  private static keepAliveTimers: Map<string, NodeJS.Timeout> = new Map() // 💓 Keep-alive timers
  private static messageHandlersConfigured: Map<string, boolean> = new Map() // 🎯 Rastrear handlers configurados

  private static conversationHistories: Map<string, any[]> = new Map()

  // Logger silencioso
  private static logger = pino({ level: 'silent' })

  /**
   * Inicializar conexión de WhatsApp con Baileys
   */

  /**
   * Inicializar sistema híbrido
   */
  static async initializeConnection(userId: string): Promise<{ success: boolean; qr?: string; error?: string }> {
    try {
      // 🔒 Verificar si ya hay una conexión en proceso
      const existingLock = this.connectionLocks.get(userId)
      if (existingLock) {
        const lockTime = Date.now() - existingLock
        // Si el lock tiene más de 2 minutos, permitir nueva conexión
        if (lockTime < 120000) {
          console.log(`[Baileys] ⚠️ Ya hay una conexión en proceso para ${userId} (${Math.round(lockTime/1000)}s), ignorando...`)
          return { success: false, error: 'Conexión ya en proceso' }
        } else {
          console.log(`[Baileys] 🔓 Lock expirado para ${userId}, permitiendo nueva conexión`)
        }
      }

      // 🔒 Bloquear nuevas conexiones con timestamp
      this.connectionLocks.set(userId, Date.now())

      console.log(`[Baileys] 🚀 Inicializando conexión para usuario: ${userId}`)

      // Limpiar sesión anterior si existe
      await this.cleanupSession(userId)

      // Crear directorio para sesiones
      const authDir = path.join(process.cwd(), 'auth_sessions', userId)
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true })
      }

      console.log(`[Baileys] 📁 Directorio de sesión: ${authDir}`)

      // Cargar estado de autenticación
      const { state, saveCreds } = await useMultiFileAuthState(authDir)
      console.log(`[Baileys] ✅ Estado de autenticación cargado`)

      // Obtener versión más reciente de Baileys
      const { version } = await fetchLatestBaileysVersion()
      console.log(`[Baileys] 📦 Versión de Baileys: ${version.join('.')}`)

      // Crear socket de WhatsApp
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

      console.log(`[Baileys] ✅ Socket creado`)

      // Crear sesión
      const session: BaileysSession = {
        socket,
        qr: null,
        status: 'CONNECTING',
        userId,
        isReady: false,
        reconnectAttempts: 0,
        lastDisconnect: null
      }
      this.sessions.set(userId, session)

      // Actualizar estado en DB
      await this.updateConnectionStatus(userId, 'CONNECTING')

      // Configurar manejadores de eventos
      await this.setupEventHandlers(socket, session, saveCreds, userId)

      console.log(`[Baileys] ✅ Manejadores de eventos configurados`)

      return { success: true }
    } catch (error) {
      console.error('[Baileys] ❌ Error inicializando conexión:', error)
      await this.updateConnectionStatus(userId, 'DISCONNECTED', error instanceof Error ? error.message : 'Error desconocido')
      this.connectionLocks.delete(userId) // 🔓 Desbloquear en caso de error
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  }

  /**
   * Configurar manejadores de eventos
   */
  private static async setupEventHandlers(
    socket: WASocket,
    session: BaileysSession,
    saveCreds: () => Promise<void>,
    userId: string
  ) {
    const { userId: sessionUserId } = session

    // Manejar actualización de credenciales
    socket.ev.on('creds.update', saveCreds)

    // Manejar actualización de conexión
    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update

      console.log(`[Baileys] 🔄 Actualización de conexión:`, {
        connection,
        hasQr: !!qr,
        hasLastDisconnect: !!lastDisconnect
      })

      // Manejar QR
      if (qr) {
        console.log(`[Baileys] 📱 QR recibido para usuario: ${userId}`)

        try {
          const qrDataURL = await QRCode.toDataURL(qr, {
            width: 300,
            margin: 2,
            color: {
              dark: '#25D366',
              light: '#FFFFFF'
            }
          })

          session.qr = qrDataURL
          session.status = 'QR_PENDING'

          // Guardar en DB
          await db.whatsAppConnection.upsert({
            where: { userId },
            create: {
              userId,
              phoneNumber: 'pending',
              status: 'QR_PENDING',
              qrCode: qrDataURL,
              qrExpiresAt: new Date(Date.now() + 60000)
            },
            update: {
              status: 'QR_PENDING',
              qrCode: qrDataURL,
              qrExpiresAt: new Date(Date.now() + 60000)
            }
          })

          console.log(`[Baileys] ✅ QR guardado en DB`)

          // Llamar callback si existe
          const callback = this.qrCallbacks.get(userId)
          if (callback) {
            callback(qrDataURL)
          }
        } catch (error) {
          console.error('[Baileys] ❌ Error generando QR:', error)
        }
      }

      // Manejar conexión abierta
      if (connection === 'open') {
        console.log(`[Baileys] ✅ Conexión establecida para usuario: ${userId}`)

        session.status = 'CONNECTED'
        session.qr = null
        session.isReady = true
        session.reconnectAttempts = 0

        // Obtener info del usuario
        const phoneNumber = socket.user?.id.split(':')[0] || 'unknown'
        console.log(`[Baileys] 📱 Número de WhatsApp: ${phoneNumber}`)

        await db.whatsAppConnection.upsert({
          where: { userId },
          create: {
            userId,
            phoneNumber,
            status: 'CONNECTED',
            isConnected: true,
            lastConnectedAt: new Date(),
            qrCode: null,
            qrExpiresAt: null
          },
          update: {
            phoneNumber,
            status: 'CONNECTED',
            isConnected: true,
            lastConnectedAt: new Date(),
            qrCode: null,
            qrExpiresAt: null,
            connectionAttempts: 0,
            lastError: null
          }
        })

        console.log(`[Baileys] ✅ Conexión registrada en base de datos`)

        // 🔓 Desbloquear conexión exitosa
        this.connectionLocks.delete(userId)

        // 💓 Iniciar keep-alive para mantener conexión activa
        this.startKeepAlive(socket, userId)

        // Configurar manejador de mensajes
        this.setupMessageHandler(socket, userId)
      }

      // Manejar cierre de conexión
      if (connection === 'close') {
        session.lastDisconnect = new Date()
        
        // Determinar si debe reconectar basado en el motivo de desconexión
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode
        
        // 🚫 Código 440 = Conflicto de sesión (múltiples conexiones)
        // NO reconectar automáticamente, esperar a que el sistema se estabilice
        if (statusCode === 440) {
          console.log(`[Baileys] ⚠️ Conflicto de sesión detectado (440), limpiando y esperando...`)
          session.status = 'DISCONNECTED'
          await this.updateConnectionStatus(userId, 'DISCONNECTED', 'Conflicto de sesión - múltiples conexiones')
          this.stopKeepAlive(userId)
          this.sessions.delete(userId)
          this.connectionLocks.delete(userId)
          return
        }
        
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut
        
        console.log(`[Baileys] 🔌 Conexión cerrada. Código: ${statusCode}, Reconectar: ${shouldReconnect}`)

        if (shouldReconnect) {
          // 🛡️ Registrar desconexión en SafeReconnectManager
          SafeReconnectManager.recordDisconnect(userId)
          session.reconnectAttempts++

          // 🛡️ Verificar si puede reconectar (protección anti-ban)
          if (!SafeReconnectManager.canReconnect(userId)) {
            console.log(`[Baileys] ❌ Máximo de reintentos alcanzado (protección anti-ban)`)
            session.status = 'DISCONNECTED'
            await this.updateConnectionStatus(userId, 'DISCONNECTED', 'Máximo de reintentos alcanzado')
            this.stopKeepAlive(userId)
            this.sessions.delete(userId)
            this.connectionLocks.delete(userId)
            return
          }

          console.log(`[Baileys] 🔄 Intento de reconexión #${session.reconnectAttempts}`)

          // 🔓 Desbloquear antes de reconectar
          this.connectionLocks.delete(userId)

          // 🛡️ Usar SafeReconnectManager para reconexión segura
          const success = await SafeReconnectManager.startReconnect(userId, async () => {
            console.log(`[Baileys] 🔄 Reconectando con protección anti-ban...`)
            await this.initializeConnection(userId)
          })

          if (!success) {
            console.log(`[Baileys] ❌ Reconexión fallida`)
            session.status = 'DISCONNECTED'
            await this.updateConnectionStatus(userId, 'DISCONNECTED', 'Reconexión fallida')
            this.stopKeepAlive(userId)
            this.sessions.delete(userId)
            this.connectionLocks.delete(userId)
          }
        } else {
          console.log(`[Baileys] 🚪 Usuario cerró sesión (logged out), no reconectar`)
          session.status = 'DISCONNECTED'
          await this.updateConnectionStatus(userId, 'DISCONNECTED', 'Usuario cerró sesión')
          this.stopKeepAlive(userId) // 💓 Detener keep-alive
          this.sessions.delete(userId)
          this.connectionLocks.delete(userId) // 🔓 Desbloquear
        }
      }
    })

    console.log(`[Baileys] ✅ Event handlers configurados`)
  }

  /**
   * Configurar manejador de mensajes
   */
  private static setupMessageHandler(socket: WASocket, userId: string) {
    // 🛡️ PREVENIR DUPLICADOS: Verificar si ya hay un handler configurado
    const handlerKey = `${userId}-${socket.user?.id || 'unknown'}`
    
    if (this.messageHandlersConfigured.get(handlerKey)) {
      console.log(`[Baileys] ⚠️ Handler ya configurado para ${userId}, ignorando duplicado`)
      return
    }
    
    console.log(`[Baileys] 🎯 Configurando manejador de mensajes para usuario: ${userId}`)
    
    // Marcar como configurado
    this.messageHandlersConfigured.set(handlerKey, true)

    socket.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return

      for (const message of messages) {
        // Ignorar mensajes propios
        if (message.key.fromMe) continue

        try {
          const from = message.key.remoteJid
          if (!from) continue

          // Extraer texto del mensaje
          let messageText = message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            ''

          // 🎤 Procesar audio
          if (message.message?.audioMessage) {
            console.log(`[Baileys] 🎤 Audio recibido de ${from}`)
            try {
              const { AudioTranscriptionService } = await import('./audio-transcription-service')
              const audioService = new AudioTranscriptionService()

              // Descargar audio
              const buffer = await downloadMediaMessage(
                message,
                'buffer',
                {},
                {
                  logger: pino({ level: 'silent' }),
                  reuploadRequest: socket.updateMediaMessage
                }
              )

              // Guardar temporalmente y transcribir
              const tempPath = path.join(process.cwd(), 'temp-audio', `audio_${Date.now()}.ogg`)
              await fs.promises.mkdir(path.dirname(tempPath), { recursive: true })
              await fs.promises.writeFile(tempPath, buffer as Buffer)

              messageText = await audioService.transcribeWithGroq(tempPath)
              console.log(`[Baileys] ✅ Audio transcrito: "${messageText}"`)

              // Limpiar
              await fs.promises.unlink(tempPath).catch(() => { })
            } catch (error: any) {
              console.error(`[Baileys] ❌ Error transcribiendo audio:`, error.message)
              messageText = '[Audio recibido - Error en transcripción]'
            }
          }

          // 📸 Procesar imagen
          if (message.message?.imageMessage) {
            console.log(`[Baileys] 📸 Imagen recibida de ${from}`)
            const caption = message.message.imageMessage.caption || ''
            messageText = caption || 'Me envías fotos para verlo'
          }

          if (!messageText) continue

          console.log(`[Baileys] 📨 Mensaje procesado de ${from}: ${messageText.substring(0, 100)}`)

          // Guardar mensaje en DB
          const conversation = await this.saveIncomingMessage(userId, from, messageText)

          // ❌ DESACTIVADO: Sistema antiguo de pagos (ahora lo maneja clean-bot)
          // const paymentDetected = await this.detectAndHandlePayment(socket, userId, from, messageText, conversation.id)
          // if (paymentDetected) {
          //   console.log('[Baileys] Solicitud de pago manejada')
          //   continue
          // }

          // 🎯 SISTEMA UNIFICADO DE VENTAS (Conversational Module)
          console.log('[Baileys] 🧠 Procesando con Conversational Module...')
          
          try {
            const { procesarMensaje } = await import('../conversational-module')
            
            const result = await procesarMensaje(from, messageText, {
              botUserId: userId,
              esAudio: !!message.message?.audioMessage
            })
            
            console.log(`[Baileys] ✅ Respuesta generada del módulo conversacional`)
            
            // ⏳ SIMULAR ESCRITURA
            try {
              const { calculateTypingDelay, simulateTyping } = await import('./utils')
              await socket.sendPresenceUpdate('composing', from)
              const delay = calculateTypingDelay(result.texto.length)
              await simulateTyping(delay)
              await socket.sendPresenceUpdate('paused', from)
            } catch (e) { /* ignore */ }
            
            // 1. Enviar Texto Principal
            await socket.sendMessage(from, { text: result.texto })
            
            // 2. Enviar Fotos si existen
            if (result.fotos && result.fotos.length > 0) {
              console.log(`[Baileys] 📸 Enviando ${result.fotos.length} foto(s)...`)
              for (const foto of result.fotos) {
                try {
                  const imageSource = foto.url.startsWith('http') ? { url: foto.url } : { stream: fs.createReadStream(path.join(process.cwd(), 'public', foto.url.startsWith('/') ? foto.url.substring(1) : foto.url)) }
                  await socket.sendMessage(from, {
                    image: imageSource,
                    caption: foto.caption || ''
                  })
                } catch (photoError) {
                  console.error('[Baileys] Error enviando foto:', photoError)
                }
              }
            }
            
            // 3. Enviar Links de Pago si existen
            if (result.linksPago && result.linksPago.success && result.linksPago.message) {
              await socket.sendMessage(from, { text: result.linksPago.message })
            }
            
            // Guardar en DB
            await this.saveOutgoingMessage(userId, from, result.texto, conversation.id)
            
          } catch (handlerError: any) {
            console.error('[Baileys] ❌ Error en Conversational Module:', handlerError.message)
            await socket.sendMessage(from, { text: '😅 Disculpa, tuve un problema. ¿Puedes repetir?' })
          }

        } catch (error) {
          console.error('[Baileys] ❌ Error procesando mensaje:', error)
        }
      }
    })

    console.log(`[Baileys] ✅ Manejador de mensajes configurado`)
  }

  /**
   * Guardar mensaje entrante en DB
   */
  private static async saveIncomingMessage(userId: string, from: string, content: string) {
    let conversation = await db.conversation.findFirst({
      where: { userId, customerPhone: from }
    })

    if (!conversation) {
      const customerName = `Cliente ${from.split('@')[0].slice(-4)}`
      conversation = await db.conversation.create({
        data: { userId, customerPhone: from, customerName, status: 'ACTIVE' }
      })
    }

    await db.message.create({
      data: { conversationId: conversation.id, content, direction: 'INCOMING', type: 'TEXT' }
    })

    await db.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() }
    })

    return conversation
  }

  /**
   * Guardar mensaje saliente en DB
   */
  private static async saveOutgoingMessage(userId: string, to: string, content: string, conversationId?: string) {
    let conversation = conversationId
      ? await db.conversation.findUnique({ where: { id: conversationId } })
      : await db.conversation.findFirst({ where: { userId, customerPhone: to } })

    if (!conversation) {
      const customerName = `Cliente ${to.split('@')[0].slice(-4)}`
      conversation = await db.conversation.create({
        data: { userId, customerPhone: to, customerName, status: 'ACTIVE' }
      })
    }

    await db.message.create({
      data: { conversationId: conversation.id, content, direction: 'OUTGOING', type: 'TEXT' }
    })

    await db.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() }
    })

    return conversation
  }

  /**
   * 🛡️ Enviar mensaje de forma segura (con protección anti-ban)
   */
  static async sendMessage(userId: string, to: string, content: string): Promise<boolean> {
    try {
      const session = this.sessions.get(userId)

      if (!session || !session.socket || session.status !== 'CONNECTED') {
        console.error('[Baileys] ❌ No hay sesión activa')
        return false
      }

      // Usar SafeBaileysSender para protección anti-ban
      const success = await SafeBaileysSender.sendText(session.socket, {
        userId,
        recipient: to,
        message: content,
        forceHumanize: true
      })

      if (success) {
        console.log(`[Baileys] ✅ Mensaje enviado de forma segura a ${to}`)
      } else {
        console.log(`[Baileys] ⚠️ Mensaje bloqueado por protección anti-ban`)
      }

      return success
    } catch (error) {
      console.error('[Baileys] ❌ Error enviando mensaje:', error)
      return false
    }
  }

  /**
   * 🛡️ Enviar mensaje directo (sin humanización, para casos especiales)
   */
  static async sendMessageDirect(userId: string, to: string, content: string): Promise<boolean> {
    try {
      const session = this.sessions.get(userId)

      if (!session || !session.socket || session.status !== 'CONNECTED') {
        console.error('[Baileys] ❌ No hay sesión activa')
        return false
      }

      // Usar SafeBaileysSender sin humanización
      const success = await SafeBaileysSender.sendText(session.socket, {
        userId,
        recipient: to,
        message: content,
        forceHumanize: false
      })

      return success
    } catch (error) {
      console.error('[Baileys] ❌ Error enviando mensaje directo:', error)
      return false
    }
  }

  /**
   * Desconectar
   */
  static async disconnect(userId: string): Promise<boolean> {
    try {
      console.log(`[Baileys] 🔌 Desconectando usuario ${userId}...`)

      const session = this.sessions.get(userId)
      if (session?.socket) {
        await session.socket.logout()
      }

      // Limpiar sesión
      await this.cleanupSession(userId)

      // Actualizar DB
      await this.updateConnectionStatus(userId, 'DISCONNECTED')

      console.log(`[Baileys] ✅ Usuario ${userId} desconectado`)
      return true
    } catch (error) {
      console.error('[Baileys] ❌ Error desconectando:', error)
      return false
    }
  }

  /**
   * Limpiar sesión
   */
  private static async cleanupSession(userId: string) {
    // Cancelar timer de reconexión
    const timer = this.reconnectTimers.get(userId)
    if (timer) {
      clearTimeout(timer)
      this.reconnectTimers.delete(userId)
    }

    // 🎯 Limpiar flags de handlers configurados para este usuario
    // Esto permite que se configure un nuevo handler en la próxima conexión
    for (const key of this.messageHandlersConfigured.keys()) {
      if (key.startsWith(`${userId}-`)) {
        this.messageHandlersConfigured.delete(key)
        console.log(`[Baileys] 🧹 Handler flag limpiado: ${key}`)
      }
    }

    // Eliminar sesión
    this.sessions.delete(userId)
    this.qrCallbacks.delete(userId)
  }

  /**
   * Obtener estado de conexión
   */
  static getConnectionStatus(userId: string): BaileysSession | null {
    return this.sessions.get(userId) || null
  }

  /**
   * Registrar callback para QR
   */
  static onQRCode(userId: string, callback: (qr: string) => void) {
    this.qrCallbacks.set(userId, callback)
  }

  /**
   * Actualizar estado en DB
   */
  private static async updateConnectionStatus(
    userId: string,
    status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'QR_PENDING',
    error?: string
  ) {
    try {
      await db.whatsAppConnection.upsert({
        where: { userId },
        create: {
          userId,
          phoneNumber: 'pending',
          status,
          isConnected: status === 'CONNECTED',
          lastError: error,
          lastErrorAt: error ? new Date() : null
        },
        update: {
          status,
          isConnected: status === 'CONNECTED',
          lastError: error,
          lastErrorAt: error ? new Date() : null
        }
      })
    } catch (error) {
      console.error('[Baileys] ❌ Error actualizando estado en DB:', error)
    }
  }

  /**
   * 💓 Iniciar keep-alive para mantener la conexión activa
   * Envía presencia cada 30 segundos para evitar que el servidor cierre la conexión
   */
  private static startKeepAlive(socket: WASocket, userId: string): void {
    // Detener keep-alive anterior si existe
    this.stopKeepAlive(userId)

    console.log(`[Baileys] 💓 Iniciando keep-alive para ${userId}`)

    const keepAliveInterval = setInterval(async () => {
      try {
        const session = this.sessions.get(userId)

        if (!session || session.status !== 'CONNECTED' || !session.isReady) {
          console.log(`[Baileys] 💓 Keep-alive detenido: sesión no activa`)
          this.stopKeepAlive(userId)
          return
        }

        // Verificar que el socket sigue conectado
        if (!socket || !socket.user) {
          console.log(`[Baileys] 💓 Socket desconectado, deteniendo keep-alive`)
          this.stopKeepAlive(userId)
          return
        }

        // Enviar presencia para mantener conexión activa
        await socket.sendPresenceUpdate('available')
        console.log(`[Baileys] 💓 Keep-alive enviado para ${userId}`)

      } catch (error) {
        console.error(`[Baileys] ❌ Error en keep-alive:`, error)
        // Si hay error, puede ser que la conexión se cayó
        // Intentar una vez más, si falla detener keep-alive
        const session = this.sessions.get(userId)
        if (session) {
          session.reconnectAttempts = (session.reconnectAttempts || 0) + 1
          if (session.reconnectAttempts > 3) {
            console.log(`[Baileys] 💓 Demasiados errores en keep-alive, deteniendo`)
            this.stopKeepAlive(userId)
          }
        }
      }
    }, 30 * 1000) // Cada 30 segundos (más frecuente para mejor estabilidad)

    this.keepAliveTimers.set(userId, keepAliveInterval)
    console.log(`[Baileys] ✅ Keep-alive configurado (cada 30s)`)
  }

  /**
   * Detener keep-alive
   */
  private static stopKeepAlive(userId: string): void {
    const timer = this.keepAliveTimers.get(userId)
    if (timer) {
      clearInterval(timer)
      this.keepAliveTimers.delete(userId)
      console.log(`[Baileys] 💓 Keep-alive detenido para ${userId}`)
    }
  }

  /**
   * 🚀 NUEVO SISTEMA CONVERSACIONAL MODULAR
   * Maneja mensajes con el nuevo sistema que incluye:
   * - Ahorro de tokens (60-80%)
   * - Razonamiento profundo
   * - Pagos dinámicos
   * - Envío de fotos
   * - Transcripción de audio
   */
  private static async handleNewConversationalSystem(
    socket: WASocket,
    userId: string,
    from: string,
    messageText: string,
    conversationId: string,
    message: WAMessage
  ) {
    console.log(`[Baileys] 🚀 Usando NUEVO SISTEMA CONVERSACIONAL MODULAR`)

    try {
      // Importar el nuevo módulo conversacional
      const { procesarMensaje } = await import('../conversational-module')

      // Preparar opciones según el tipo de mensaje
      const opciones: any = {}

      // 🎤 Audio
      if (message.message?.audioMessage) {
        const buffer = await downloadMediaMessage(
          message,
          'buffer',
          {},
          {
            logger: pino({ level: 'silent' }),
            reuploadRequest: socket.updateMediaMessage
          }
        )
        opciones.esAudio = true
        opciones.audioBuffer = buffer as Buffer
      }

      // 📸 Imagen
      if (message.message?.imageMessage) {
        opciones.tieneImagen = true
      }

      // 🤖 Procesar con el nuevo sistema
      const respuesta = await procesarMensaje(from, messageText, {
        ...opciones,
        botUserId: userId // 🔑 CLAVE: Pasar el ID del dueño del bot para SaaS
      })

      // 📤 Enviar respuesta de texto
      if (respuesta.texto) {
        await socket.sendMessage(from, { text: respuesta.texto })
        console.log(`[Baileys] ✅ Respuesta enviada`)

        // Guardar en BD
        await db.message.create({
          data: {
            conversationId,
            content: respuesta.texto,
            direction: 'OUTGOING',
            type: 'TEXT'
          }
        })
      }

      // 📸 Enviar fotos si hay
      if (respuesta.fotos && respuesta.fotos.length > 0) {
        console.log(`[Baileys] 📸 Enviando ${respuesta.fotos.length} foto(s)`)
        for (const foto of respuesta.fotos) {
          await socket.sendMessage(from, {
            image: { url: foto.url },
            caption: foto.caption
          })
        }
      }

      // 💳 Enviar links de pago si hay
      if (respuesta.linksPago) {
        console.log(`[Baileys] 💳 Enviando información de pago`)
        // Los links ya están formateados en el texto de respuesta
      }

      // Actualizar última actividad
      await db.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() }
      })

    } catch (error) {
      console.error('[Baileys] ❌ Error en nuevo sistema conversacional:', error)
      
      // Fallback: respuesta genérica
      await socket.sendMessage(from, {
        text: 'Disculpa, tuve un problema al procesar tu mensaje. ¿Podrías intentar de nuevo? 🙏'
      })
    }
  }
}
