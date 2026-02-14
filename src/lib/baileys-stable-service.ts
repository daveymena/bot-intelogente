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
// @ts-ignore
import { ProfessionalResponseFormatter } from './professional-response-formatter'
import { routeMessage } from './bot/core/agentRouter'

interface BaileysSession {
  socket: WASocket | null
  qr: string | null
  status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'QR_PENDING'
  userId: string
  isReady: boolean
  reconnectAttempts: number
  lastDisconnect: Date | null
}

// Redirigir consola a archivo para depuración remota
let originalLog = console.log;
let originalError = console.error;

if (typeof fs !== 'undefined' && typeof process !== 'undefined') {
  try {
    const logFile = fs.createWriteStream(path.join(process.cwd(), 'debug_console.log'), { flags: 'a' });

    console.log = (...args) => {
      const msg = `[${new Date().toISOString()}] LOG: ${args.map(a => typeof a === 'object' ? (a instanceof Error ? a.stack : JSON.stringify(a)) : a).join(' ')}\n`;
      logFile.write(msg);
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      const msg = `[${new Date().toISOString()}] ERROR: ${args.map(a => typeof a === 'object' ? (a instanceof Error ? a.stack : JSON.stringify(a)) : a).join(' ')}\n`;
      logFile.write(msg);
      originalError.apply(console, args);
    };
  } catch (e) {
    // Silence fs error but keep original loggers
  }
}

export class BaileysStableService {
  // Cache de Productos para optimización de velocidad
  private static productsCache: any[] | null = null
  private static lastCacheUpdate: number = 0

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
   * Inicializar sistema híbrido
   */
  static async initializeConnection(userId: string): Promise<{ success: boolean; qr?: string; error?: string }> {
    try {
      // 🔒 Verificar si ya hay una conexión en proceso
      const existingLock = this.connectionLocks.get(userId)
      if (existingLock) {
        const lockTime = Date.now() - existingLock
        if (lockTime < 120000) {
          console.log(`[Baileys] ⚠️ Ya hay una conexión en proceso para ${userId} (${Math.round(lockTime/1000)}s), ignorando...`)
          return { success: false, error: 'Conexión ya en proceso' }
        }
      }

      // 🔒 Bloquear nuevas conexiones INMEDIATAMENTE
      this.connectionLocks.set(userId, Date.now())

      console.log(`[Baileys] 🚀 Inicializando conexión para usuario: ${userId}`)

      // Limpiar sesión anterior si existe
      await this.cleanupSession(userId)

      // Crear directorio para sesiones
      const authDir = path.join(process.cwd(), 'auth_sessions', userId)
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true })
      }

      const { state, saveCreds } = await useMultiFileAuthState(authDir)
      const { version } = await fetchLatestBaileysVersion()

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

      await this.updateConnectionStatus(userId, 'CONNECTING')
      await this.setupEventHandlers(socket, session, saveCreds, userId)

      return { success: true }
    } catch (error) {
      console.error('[Baileys] ❌ Error inicializando conexión:', error)
      await this.updateConnectionStatus(userId, 'DISCONNECTED', error instanceof Error ? error.message : 'Error desconocido')
      this.connectionLocks.delete(userId)
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
    socket.ev.on('creds.update', saveCreds)

    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update

      console.log(`[Baileys] 🔄 Actualización de conexión para ${userId}:`, JSON.stringify(update));

      if (qr) {
        try {
          const qrDataURL = await QRCode.toDataURL(qr, { width: 300 })
          session.qr = qrDataURL
          session.status = 'QR_PENDING'
          await this.updateConnectionStatus(userId, 'QR_PENDING', undefined, qrDataURL)
          
          const callback = this.qrCallbacks.get(userId)
          if (callback) callback(qrDataURL)
        } catch (error) {
          console.error('[Baileys] ❌ Error generando QR:', error)
        }
      }

      if (connection === 'open') {
        console.log(`[Baileys] ✅ Conexión establecida para: ${userId}`)
        session.status = 'CONNECTED'
        session.qr = null
        session.isReady = true
        session.reconnectAttempts = 0

        const phoneNumber = socket.user?.id.split(':')[0] || 'unknown'
        await db.whatsAppConnection.upsert({
          where: { userId },
          create: { userId, phoneNumber, status: 'CONNECTED', isConnected: true, lastConnectedAt: new Date() },
          update: { phoneNumber, status: 'CONNECTED', isConnected: true, lastConnectedAt: new Date(), connectionAttempts: 0, lastError: null }
        })

        this.connectionLocks.delete(userId)
        this.startKeepAlive(socket, userId)
        this.setupMessageHandler(socket, userId)
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut

        if (shouldReconnect) {
          SafeReconnectManager.recordDisconnect(userId)
          session.reconnectAttempts++

          if (!SafeReconnectManager.canReconnect(userId)) {
            console.log(`[Baileys] ❌ Protección anti-ban activada para ${userId}`)
            await this.cleanupSession(userId)
            await this.updateConnectionStatus(userId, 'DISCONNECTED', 'Protección anti-ban activa')
            return
          }

          this.connectionLocks.delete(userId)
          await SafeReconnectManager.startReconnect(userId, async () => {
            await this.initializeConnection(userId)
          })
        } else {
          await this.cleanupSession(userId)
          await this.updateConnectionStatus(userId, 'DISCONNECTED', 'Sesión cerrada por usuario')
        }
      }
    })
  }

  /**
   * Configurar manejador de mensajes
   */
  private static setupMessageHandler(socket: WASocket, userId: string) {
    const botId = socket.user?.id || 'unknown';
    console.log(`[Baileys] 🎯 Configurando manejador para ${userId} (Bot ID: ${botId})`);
    
    socket.ev.process(async (events) => {
      if (events['messages.upsert']) {
        const { messages, type } = events['messages.upsert'];
        if (type !== 'notify') return;

        for (const message of messages) {
          if (message.key.fromMe) continue;

          try {
            const from = message.key.remoteJid;
            if (!from) continue;

            let messageText = message.message?.conversation ||
              message.message?.extendedTextMessage?.text ||
              '';

            let hasImage = !!message.message?.imageMessage;
            if (hasImage) {
              const caption = message.message?.imageMessage?.caption || '';
              messageText = caption || 'Comprobante enviado';
            }

            if (!messageText && !hasImage) continue;

            console.log(`[Baileys] 📩 Mensaje de ${from}: "${messageText.slice(0, 50)}"`);
            fs.appendFileSync('debug_baileys.log', `[${new Date().toISOString()}] FROM: ${from} MSG: ${messageText}\n`);

            // Guardar en DB
            const conversation = await this.saveIncomingMessage(userId, from, messageText);
            
            console.log('[Baileys] 🧠 Procesando con AgentRouter...');
            const isAdmin = from.includes('3136174267');
            const result = await routeMessage(userId, from, messageText, { hasImage, isAdmin, conversationId: conversation.id });
            
            const formattedText = ProfessionalResponseFormatter.cleanOldFormat(result.text);

            // Delay humano
            try {
              const delay = Math.min(4000, Math.max(1200, (formattedText.length * 20) + 500));
              await socket.sendPresenceUpdate('composing', from);
              await new Promise(r => setTimeout(r, delay));
              await socket.sendPresenceUpdate('paused', from);
            } catch (e) {}

            // Enviar respuesta
            if (result.media && result.media.length > 0) {
              console.log(`[Baileys] 📸 Enviando media...`);
              await socket.sendMessage(from, { 
                image: { url: result.media[0] }, 
                caption: formattedText 
              });
            } else {
              await socket.sendMessage(from, { text: formattedText });
            }
            
            console.log(`[Baileys] ✅ Respuesta enviada a ${from}`);

            // Guardar saliente
            await this.saveOutgoingMessage(userId, from, formattedText, conversation.id);

          } catch (err: any) {
            console.error(`[Baileys] ❌ Error en ciclo de mensaje:`, err.message);
          }
        }
      }
    });
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

    if (!conversation) return null

    await db.message.create({
      data: { conversationId: conversation.id, content, direction: 'OUTGOING', type: 'TEXT' }
    })

    return conversation
  }

  /**
   * 🛡️ Enviar mensaje de forma segura
   */
  static async sendMessage(userId: string, to: string, content: string): Promise<boolean> {
    try {
      const session = this.sessions.get(userId)
      if (!session || !session.socket || session.status !== 'CONNECTED') return false

      const success = await SafeBaileysSender.sendText(session.socket, {
        userId, recipient: to, message: content, forceHumanize: true
      })
      
      if (success) await this.saveOutgoingMessage(userId, to, content)
      return success
    } catch (error) {
      console.error('[Baileys] ❌ Error:', error)
      return false
    }
  }

  /**
   * Desconectar
   */
  static async disconnect(userId: string): Promise<boolean> {
    try {
      const session = this.sessions.get(userId)
      if (session?.socket) await session.socket.logout()
      await this.cleanupSession(userId)
      await this.updateConnectionStatus(userId, 'DISCONNECTED')
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Limpiar sesión
   */
  private static async cleanupSession(userId: string) {
    const timer = this.reconnectTimers.get(userId)
    if (timer) clearTimeout(timer)
    this.reconnectTimers.delete(userId)
    
    this.stopKeepAlive(userId)
    this.sessions.delete(userId)
    this.qrCallbacks.delete(userId)
    this.messageHandlersConfigured.delete(userId)
  }

  private static startKeepAlive(socket: WASocket, userId: string) {
    this.stopKeepAlive(userId)
    const interval = setInterval(async () => {
      try {
        await socket.sendPresenceUpdate('available')
      } catch (e) {
        this.stopKeepAlive(userId)
      }
    }, 60000)
    this.keepAliveTimers.set(userId, interval)
  }

  private static stopKeepAlive(userId: string) {
    const interval = this.keepAliveTimers.get(userId)
    if (interval) clearInterval(interval)
    this.keepAliveTimers.delete(userId)
  }

  static onQRCode(userId: string, callback: (qr: string) => void) {
    this.qrCallbacks.set(userId, callback)
  }

  static getConnectionStatus(userId: string): BaileysSession | null {
    return this.sessions.get(userId) || null
  }

  private static async updateConnectionStatus(userId: string, status: any, error?: string, qrCode?: string) {
    try {
      await db.whatsAppConnection.upsert({
        where: { userId },
        create: { userId, status, isConnected: status === 'CONNECTED', lastError: error, qrCode, phoneNumber: 'pending' },
        update: { status, isConnected: status === 'CONNECTED', lastError: error, qrCode }
      })
    } catch (e) {
      console.error('[Baileys] Error actualizando DB:', e)
    }
  }
}
