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
import { createGroqHybridSystem } from './hybrid-intelligent-response-system'
import { HybridIntelligentResponseSystem } from './hybrid-intelligent-response-system'
import { AudioTranscriptionService } from './audio-transcription-service'
import { VoiceGenerationService } from './voice-generation-service'
import * as Personality from './conversational-personality'
import { FlowIntegration } from './flow-integration'
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

  private static hybridSystem: HybridIntelligentResponseSystem | null = null as HybridIntelligentResponseSystem | null
  private static conversationHistories: Map<string, any[]> = new Map()

  // Logger silencioso
  private static logger = pino({ level: 'silent' })

  /**
   * Inicializar conexión de WhatsApp con Baileys
   */

  /**
   * Inicializar sistema híbrido
   */
  private static async initializeHybridSystem() {
    if (this.hybridSystem) return

    try {
      const groqApiKey = process.env.GROQ_API_KEY
      if (groqApiKey) {
        this.hybridSystem = await createGroqHybridSystem(groqApiKey)
        console.log('[Baileys] ✅ Sistema híbrido inicializado')
      } else {
        console.log('[Baileys] ⚠️  GROQ_API_KEY no encontrada, sistema híbrido desactivado')
      }
    } catch (error) {
      console.error('[Baileys] ❌ Error inicializando sistema híbrido:', error)
    }
  }

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

          // 🎯 SISTEMA SIMPLE DE VENTAS
          // Basado en el bot funcional probado
          console.log('[Baileys] 🎯 Usando SalesAgentSimple')
          
          try {
            const { getSalesAgent, calculateTypingDelay, simulateTyping } = await import('./sales-agent-simple')
            const salesAgent = getSalesAgent()
            salesAgent.setUserId(userId)
            
            console.log('[Baileys] 📝 Procesando:', messageText.substring(0, 50))
            
            const result = await salesAgent.processMessage(messageText, from)
            
            console.log(`[Baileys] ✅ Respuesta generada (intent: ${result.intent}, stage: ${result.salesStage})`)
            
            // ⏳ SIMULAR ESCRITURA - Mostrar "escribiendo..." antes de enviar
            try {
              await socket.sendPresenceUpdate('composing', from)
              const typingDelay = calculateTypingDelay(result.text.length)
              console.log(`[Baileys] ⏳ Simulando escritura por ${typingDelay}ms...`)
              await simulateTyping(typingDelay)
              await socket.sendPresenceUpdate('paused', from)
            } catch (typingError) {
              // Ignorar errores de typing, no es crítico
              console.log('[Baileys] ⚠️ No se pudo simular escritura')
            }
            
            // Enviar respuesta de texto
            await socket.sendMessage(from, { text: result.text })
            console.log('[Baileys] ✅ Respuesta enviada')
            
            // Enviar fotos si es necesario
            if (result.sendPhotos && result.photos && result.photos.length > 0) {
              console.log(`[Baileys] 📸 Enviando ${result.photos.length} foto(s)...`)
              for (const photoUrl of result.photos) {
                try {
                  let imageSource: { url: string } | { stream: fs.ReadStream } | null = null
                  
                  // 1. Si es URL pública (http/https)
                  if (photoUrl && (photoUrl.startsWith('http://') || photoUrl.startsWith('https://'))) {
                    imageSource = { url: photoUrl }
                    console.log(`[Baileys] 🌐 Usando URL pública: ${photoUrl.substring(0, 50)}...`)
                  }
                  // 2. Si es ruta local (/fotos/... o fotos/...)
                  else if (photoUrl && (photoUrl.startsWith('/fotos/') || photoUrl.startsWith('fotos/'))) {
                    const localPath = path.join(process.cwd(), 'public', photoUrl.startsWith('/') ? photoUrl.substring(1) : photoUrl)
                    if (fs.existsSync(localPath)) {
                      imageSource = { stream: fs.createReadStream(localPath) }
                      console.log(`[Baileys] 📁 Usando archivo local: ${localPath}`)
                    } else {
                      console.log(`[Baileys] ⚠️ Archivo no encontrado: ${localPath}`)
                    }
                  }
                  
                  // Enviar imagen si tenemos fuente válida
                  if (imageSource) {
                    await socket.sendMessage(from, {
                      image: imageSource,
                      caption: result.product?.name || ''
                    })
                    console.log('[Baileys] ✅ Foto enviada')
                  }
                } catch (photoError: any) {
                  console.error('[Baileys] ⚠️ Error enviando foto:', photoError.message)
                }
              }
            }
            
            // Guardar en DB
            await this.saveOutgoingMessage(userId, from, result.text, conversation.id)
            
          } catch (handlerError: any) {
            console.error('[Baileys] ❌ Error en SalesAgentSimple:', handlerError.message)
            console.error('[Baileys] Stack:', handlerError.stack)
            
            // Fallback simple
            try {
              await socket.sendMessage(from, { 
                text: '😅 Disculpa, tuve un problema. ¿Puedes repetir?' 
              })
            } catch (fallbackError) {
              console.error('[Baileys] ❌ Error en fallback:', fallbackError)
            }
          }

        } catch (error) {
          console.error('[Baileys] ❌ Error procesando mensaje:', error)
        }
      }
    })

    console.log(`[Baileys] ✅ Manejador de mensajes configurado`)
  }

  /**
   * Manejar respuesta automática con IA
   */
  private static async handleAutoResponse(
    socket: WASocket,
    userId: string,
    from: string,
    messageText: string,
    conversationId: string
  ) {
    console.log(`[Baileys] 🤖 Iniciando respuesta automática...`)

    try {
      // Verificar que la sesión esté lista antes de procesar
      const session = this.sessions.get(userId)
      if (!session || !session.isReady || session.status !== 'CONNECTED') {
        console.log(`[Baileys] ⏸️ Sesión no lista, esperando reconexión...`)
        // Guardar mensaje para procesar después
        return
      }

      // Importar servicios dinámicamente
      const { AIService } = await import('./ai-service')
      const { IntelligentResponseService } = await import('./intelligent-response-service')

      // Verificar si debe responder
      if (!AIService.shouldAutoRespond(messageText)) {
        console.log(`[Baileys] ⏭️ Mensaje ignorado (muy corto o comando)`)
        return
      }

      // Obtener historial
      const history = await AIService.getConversationHistory(conversationId)

      // Generar respuesta
      const intelligentResponse = await IntelligentResponseService.generateResponseWithHumanTouch(
        userId,
        messageText,
        from,
        history
      )

      console.log(`[Baileys] ✅ Respuesta generada (${intelligentResponse.responseTime}ms)`)

      // Verificar de nuevo que sigue conectado antes de enviar
      if (!session.isReady || session.status !== 'CONNECTED') {
        console.log(`[Baileys] ⚠️ Conexión perdida durante generación de respuesta`)
        return
      }

      // Enviar respuesta con retry
      let enviado = false
      for (let intento = 1; intento <= 3; intento++) {
        try {
          await socket.sendMessage(from, { text: intelligentResponse.message })
          console.log(`[Baileys] 📤 Respuesta enviada`)
          enviado = true
          break
        } catch (sendError) {
          console.log(`[Baileys] ⚠️ Intento ${intento}/3 falló, reintentando...`)
          if (intento < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
      }

      if (!enviado) {
        console.log(`[Baileys] ❌ No se pudo enviar después de 3 intentos`)
        return
      }

      // Guardar en DB
      await db.message.create({
        data: {
          conversationId,
          content: intelligentResponse.message,
          direction: 'OUTGOING',
          type: 'TEXT'
        }
      })

      await db.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() }
      })

      console.log(`[Baileys] ✅ Respuesta guardada en DB`)

      // 📸 NOTA: El envío de fotos ahora se maneja en handleHybridResponse
      // Este código antiguo ya no se usa

    } catch (error) {
      console.error('[Baileys] ❌ Error en respuesta automática:', error)
    }
  }

  /**
   * Manejar respuesta con sistema híbrido (NUEVO)
   */
  private static async handleHybridResponse(
    socket: WASocket,
    userId: string,
    from: string,
    messageText: string,
    conversationId: string
  ) {
    console.log('[Baileys] 🧠 Usando SISTEMA HÍBRIDO CON CALIFICACIÓN')

    try {
      // Inicializar sistema híbrido si no está listo
      if (!this.hybridSystem) {
        await this.initializeHybridSystem()
      }

      // Obtener historial de conversación
      let history = this.conversationHistories.get(from) || []
      
      // 🔢 DETECTAR SELECCIÓN NUMÉRICA PRIMERO
      const { NumericSelectionDetector } = await import('./numeric-selection-detector')
      const selection = await NumericSelectionDetector.detectSelection(
        messageText,
        history,
        userId
      )
      
      if (selection.isSelection && selection.selectedProduct) {
        console.log(`[Baileys] 🔢 Selección numérica detectada: ${selection.selectedProduct.name}`)
        
        // Enviar producto seleccionado con foto
        try {
          const { ProductPhotoSender } = await import('./product-photo-sender')
          
          const confirmMessage = `¡Perfecto! 😊 Elegiste la opción ${selection.selectedNumber}\n\nTe envío los detalles:`
          await socket.sendMessage(from, { text: confirmMessage })
          await this.saveOutgoingMessage(userId, from, confirmMessage, conversationId)
          
          // Enviar producto con foto
          const result = await ProductPhotoSender.sendProductsWithPhotos(
            socket,
            from,
            [selection.selectedProduct],
            1
          )
          
          console.log(`[Baileys] ✅ Producto enviado: ${result.sent}`)
          
          // Actualizar historial
          history.push(
            { role: 'user', content: messageText },
            { role: 'assistant', content: `Producto seleccionado: ${selection.selectedProduct.name}` }
          )
          
          if (history.length > 20) {
            history = history.slice(-20)
          }
          this.conversationHistories.set(from, history)
          
          return // Terminar aquí
        } catch (error) {
          console.error('[Baileys] ❌ Error enviando producto seleccionado:', error)
          // Continuar con flujo normal si falla
        }
      }

      // 🎯 USAR EL SISTEMA HÍBRIDO QUE TIENE CALIFICACIÓN
      if (this.hybridSystem && typeof this.hybridSystem.processMessage === 'function') {
        console.log('[Baileys] 🎯 Procesando con sistema híbrido (con calificación)')
        
        const response = await this.hybridSystem.processMessage(
          messageText,
          userId,
          history,
          from
        )
        
        // Enviar respuesta
        await socket.sendMessage(from, { text: response })
        
        // Guardar en DB
        await this.saveOutgoingMessage(userId, from, response, conversationId)
        
        // Actualizar historial
        history.push(
          { role: 'user', content: messageText },
          { role: 'assistant', content: response }
        )
        
        if (history.length > 20) {
          history = history.slice(-20)
        }
        this.conversationHistories.set(from, history)
        
        console.log('[Baileys] ✅ Respuesta enviada con sistema híbrido')
        return
      }

      // FALLBACK: Si no hay sistema híbrido, usar búsqueda inteligente
      console.log('[Baileys] ⚠️ Sistema híbrido no disponible, usando fallback')
      const { intelligentProductSearch, generateProductResponse } = await import('./intelligent-product-search')
      
      // Extraer productos mencionados previamente
      const previousProducts = history
        .filter((msg: any) => msg.role === 'assistant')
        .map((msg: any) => {
          const match = msg.content.match(/\*([^*]+)\*/);
          return match ? match[1] : null;
        })
        .filter(Boolean);

      // Buscar producto con IA
      const productMatch = await intelligentProductSearch({
        userMessage: messageText,
        previousProducts,
        conversationHistory: history.map((h: any) => h.content)
      });

      // Si encontró producto(s), manejar según el tipo de consulta
      if (productMatch && productMatch.confidence >= 70) {
        console.log('[Baileys] ✅ Producto(s) encontrado(s) con IA');
        
        try {
          const { ProductPhotoSender } = await import('./product-photo-sender')
          const { ConversationContextService } = await import('./conversation-context-service')
          
          // 🔍 CONSULTA GENERAL: Mostrar opciones sin fotos
          if (productMatch.isGeneralQuery && productMatch.products) {
            console.log(`[Baileys] 📋 Consulta general detectada, mostrando ${productMatch.products.length} opciones`)
            
            // Intros naturales variadas
            const intros = [
              '¡Perfecto! Mira, tengo varias opciones que te pueden servir:',
              '¡Claro! Déjame mostrarte lo que tengo:',
              '¡Dale! Te muestro las opciones disponibles:',
              'Súper, tengo estas opciones para ti:',
              '¡Genial! Fíjate en estas opciones:'
            ];
            
            const intro = intros[Math.floor(Math.random() * intros.length)];
            let optionsMessage = `${intro}\n\n`;
            
            productMatch.products.forEach((product: any, index: number) => {
              const price = typeof product.price === 'number' 
                ? Personality.formatPriceNaturally(product.price)
                : product.price;
              
              optionsMessage += `${index + 1}️⃣ *${product.name}*\n`;
              optionsMessage += `   💰 ${price}\n`;
              if (product.description) {
                const shortDesc = product.description.substring(0, 80);
                optionsMessage += `   📝 ${shortDesc}${product.description.length > 80 ? '...' : ''}\n`;
              }
              optionsMessage += '\n';
            });
            
            // Cierres naturales variados
            const closes = [
              '¿Cuál te llama más la atención?',
              '¿Alguna te gusta? Puedes decirme el número',
              '¿Cuál te interesa? Dime el número o el nombre',
              '¿Te gusta alguna? Cuéntame',
              '¿Cuál te cuadra más?'
            ];
            
            optionsMessage += closes[Math.floor(Math.random() * closes.length)] + ' 😊';
            
            // Enviar mensaje con opciones
            await socket.sendMessage(from, { text: optionsMessage })
            console.log('[Baileys] ✅ Opciones enviadas')
            
            // Guardar en DB
            await this.saveOutgoingMessage(userId, from, optionsMessage, conversationId)
            
            // Actualizar historial
            history.push(
              { role: 'user', content: messageText },
              { role: 'assistant', content: optionsMessage }
            )
            
            if (history.length > 10) {
              history = history.slice(-10)
            }
            this.conversationHistories.set(from, history)
            
            return // Terminar aquí
          }
          
          // 🎯 CONSULTA ESPECÍFICA: Enviar producto con foto
          const products = Array.isArray(productMatch.products) 
            ? productMatch.products 
            : [productMatch.product]
          
          console.log(`[Baileys] 📸 Enviando ${products.length} producto(s) con fotos`)
          
          // Si es una recomendación (reason contiene justificación), enviar mensaje explicativo primero
          if (productMatch.reason && productMatch.reason.length > 50 && products.length === 1) {
            const intros = [
              '✨ *Mira, te recomiendo este:*',
              '💡 *Este es perfecto para ti:*',
              '🎯 *Mi recomendación:*',
              '⭐ *Este te va a gustar:*',
              '👌 *Fíjate en este:*'
            ];
            
            const intro = intros[Math.floor(Math.random() * intros.length)];
            const recommendationMessage = `${intro}\n\n${productMatch.reason}\n\nTe envío los detalles completos:`;
            
            await socket.sendMessage(from, { text: recommendationMessage });
            await this.saveOutgoingMessage(userId, from, recommendationMessage, conversationId);
            console.log('[Baileys] 💡 Mensaje de recomendación enviado');
          }
          
          // Enviar productos con fotos
          const result = await ProductPhotoSender.sendProductsWithPhotos(
            socket,
            from,
            products,
            5 // máximo 5 productos
          )
          
          console.log(`[Baileys] ✅ Enviados: ${result.sent}, Fallidos: ${result.failed}`)
          
          // 💾 GUARDAR CONTEXTO: Recordar el último producto enviado
          if (products.length > 0) {
            const conversationKey = `${userId}:${from}`
            const lastProduct = products[products.length - 1] // Último producto enviado
            ConversationContextService.setProductContext(
              conversationKey,
              lastProduct.id,
              lastProduct.name
            )
          }
          
          // Guardar en DB
          await this.saveOutgoingMessage(
            userId, 
            from, 
            `[Enviados ${result.sent} productos con fotos]`, 
            conversationId
          )
          
          // Actualizar historial
          history.push(
            { role: 'user', content: messageText },
            { role: 'assistant', content: `Productos enviados: ${products.map((p: any) => p.name).join(', ')}` }
          )
          
          if (history.length > 10) {
            history = history.slice(-10)
          }
          this.conversationHistories.set(from, history)
          
          return // Terminar aquí, ya enviamos todo
          
        } catch (photoError) {
          console.error('[Baileys] ⚠️ Error enviando fotos:', photoError)
          // Continuar con sistema normal si falla
        }
      }

      // Si no encontró producto o confianza baja, usar sistema híbrido normal
      let response: string

      if (this.hybridSystem && typeof this.hybridSystem.processMessage === 'function') {
        // Usar sistema híbrido (BD + IA + Formato + Conocimiento Externo)
        console.log('[Baileys] 🧠 Procesando con sistema híbrido (BD + IA + Conocimiento Externo)')
        response = await this.hybridSystem.processMessage(
          messageText,
          userId,
          history,
          from
        )
      } else {
        // Fallback: usar sistema local (solo BD)
        console.log('[Baileys] 📦 Procesando con sistema local (solo BD)')
        const { IntelligentProductQuerySystem } = await import('./intelligent-product-query-system')
        response = await IntelligentProductQuerySystem.processQuery(
          messageText,
          userId,
          history
        )
      }

      // 🎭 AÑADIR PERSONALIDAD Y NATURALIDAD
      const buyingIntent = Personality.detectBuyingIntent(messageText);
      const isFirstMessage = history.length === 0;
      
      // Hacer la respuesta más natural y humana
      response = Personality.generateNaturalResponse({
        baseMessage: response,
        context: {
          isFirstMessage,
          conversationCount: history.length,
        },
        addEmpathy: messageText.includes('?') ? 'question' : undefined
      });
      
      // Si hay intención de compra fuerte, añadir respuesta apropiada
      if (buyingIntent.hasBuyingIntent && buyingIntent.intentType === 'ready') {
        const intentResponse = Personality.generateIntentBasedResponse(buyingIntent);
        if (intentResponse) {
          response = `${intentResponse}\n\n${response}`;
        }
      }

      // Actualizar historial
      history.push(
        { role: 'user', content: messageText },
        { role: 'assistant', content: response }
      )

      // Mantener solo últimos 10 mensajes
      if (history.length > 10) {
        history = history.slice(-10)
      }
      this.conversationHistories.set(from, history)

      // Enviar respuesta (texto + audio opcional)
      await socket.sendMessage(from, { text: response })
      console.log('[Baileys] ✅ Respuesta híbrida enviada')

      // 📸 NO REENVIAR FOTOS EN PREGUNTAS DE SEGUIMIENTO
      // Solo continuar la conversación con texto
      console.log('[Baileys] 💬 Continuando conversación sin reenviar fotos')

      // 🎙️ ENVIAR AUDIO SI ESTÁ HABILITADO
      if (process.env.VOICE_ENABLED === 'true') {
        try {
          const voiceService = new VoiceGenerationService()

          if (voiceService.isConfigured()) {
            console.log('[Baileys] 🎙️ Generando respuesta de voz...')

            // Generar audio
            const audioBuffer = await voiceService.generateVoice(response)

            // Enviar audio
            await socket.sendMessage(from, {
              audio: audioBuffer,
              mimetype: 'audio/mp4',
              ptt: true // Push-to-talk (nota de voz)
            })

            console.log('[Baileys] ✅ Audio enviado')
          }
        } catch (error: any) {
          console.error('[Baileys] ⚠️ Error enviando audio:', error.message)
          // No fallar si el audio falla, ya se envió el texto
        }
      }

      // Guardar en DB
      await this.saveOutgoingMessage(userId, from, response, conversationId)

    } catch (error) {
      console.error('[Baileys] ❌ Error en respuesta híbrida:', error)

      // Fallback a respuesta simple
      const fallbackResponse = '😅 Disculpa, tuve un problema procesando tu mensaje. ¿Puedes intentar de nuevo?'
      await socket.sendMessage(from, { text: fallbackResponse })
    }
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
   * 📸 Enviar fotos del producto si el cliente las pidió
   */
  private static async sendProductPhotosIfRequested(
    socket: WASocket,
    userId: string,
    to: string,
    messageText: string,
    conversationId: string
  ): Promise<void> {
    try {
      // Detectar si pidió fotos
      const photoRequest = this.detectPhotoRequest(messageText)
      if (!photoRequest.isPhotoRequest) {
        return // No pidió fotos
      }

      console.log(`[Baileys] 📸 Cliente pidió fotos - Buscando producto en contexto...`)

      // Buscar producto en contexto
      const { ConversationContextService } = await import('./conversation-context-service')
      const conversationKey = `${userId}:${to}`
      const context = ConversationContextService.getProductContext(conversationKey)

      if (!context) {
        console.log(`[Baileys] ⚠️ No hay producto en contexto para enviar fotos`)
        return
      }

      // Obtener producto de la base de datos
      const product = await db.product.findUnique({
        where: { id: context.lastProductId }
      })

      if (!product) {
        console.log(`[Baileys] ⚠️ Producto no encontrado en BD`)
        return
      }

      console.log(`[Baileys] ✅ Producto encontrado: ${product.name}`)

      // Obtener fotos del producto
      const photos = product.images ? JSON.parse(product.images as string) : []

      if (photos.length === 0) {
        console.log(`[Baileys] ⚠️ Producto no tiene fotos`)
        return
      }

      console.log(`[Baileys] 📸 Enviando ${photos.length} foto(s) del producto...`)

      // Enviar cada foto
      const { MediaService } = await import('./media-service')
      const fs = await import('fs')
      const { createGroqHybridSystem, HybridIntelligentResponseSystem } = await import('./hybrid-intelligent-response-system')
      const { CustomGreetingSystem } = await import('./custom-greeting-system')

      for (let i = 0; i < Math.min(photos.length, 3); i++) { // Máximo 3 fotos
        const photoUrl = photos[i]

        try {
          console.log(`[Baileys] 📤 Enviando foto ${i + 1}/${Math.min(photos.length, 3)}: ${photoUrl}`)

          const imageData = await MediaService.prepareImageMessage(
            photoUrl,
            i === 0 ? `${product.name}\n💰 $${product.price.toLocaleString('es-CO')} COP` : undefined
          )

          // Enviar imagen con Baileys
          await socket.sendMessage(to, {
            image: imageData.image,
            caption: imageData.caption || ''
          })

          console.log(`[Baileys] ✅ Foto ${i + 1} enviada`)

          // Guardar en DB
          await db.message.create({
            data: {
              conversationId,
              content: `[Foto ${i + 1} de ${product.name}]`,
              direction: 'OUTGOING',
              type: 'IMAGE'
            }
          })

          // Pequeña pausa entre fotos
          if (i < Math.min(photos.length, 3) - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }

        } catch (error) {
          console.error(`[Baileys] ❌ Error enviando foto ${i + 1}:`, error)
        }
      }

      console.log(`[Baileys] ✅ Todas las fotos enviadas`)

    } catch (error) {
      console.error('[Baileys] ❌ Error enviando fotos del producto:', error)
    }
  }

  /**
   * Detectar si el mensaje es una solicitud de fotos
   */
  private static detectPhotoRequest(message: string): { isPhotoRequest: boolean; confidence: number } {
    const normalized = message.toLowerCase().trim()

    const photoPatterns = [
      /\b(foto|fotos|imagen|imagenes|imágenes|pic|pics|picture|pictures)\b/i,
      /\b(me\s+(envía|envia|manda|pasa|muestra|enseña))\s+(foto|fotos|imagen|imagenes|imágenes)/i,
      /\b(tiene|tienes|hay)\s+(foto|fotos|imagen|imagenes|imágenes)/i,
      /\b(ver|mirar|revisar)\s+(foto|fotos|imagen|imagenes|imágenes)/i,
      /\b(foto|fotos|imagen|imagenes|imágenes)\s+(del|de|para|sobre)/i,
      /\b(cómo|como)\s+(se\s+ve|luce|es)/i,
      /\b(me\s+envía|me\s+envia|me\s+manda|me\s+pasa|me\s+muestra|envíame|enviame)\b/i
    ]

    for (const pattern of photoPatterns) {
      if (pattern.test(normalized)) {
        return { isPhotoRequest: true, confidence: 0.95 }
      }
    }

    const weakPatterns = [
      /\b(ver|mirar|revisar)\b/i,
      /\b(muestra|enseña|pasa)\b/i
    ]

    for (const pattern of weakPatterns) {
      if (pattern.test(normalized) && normalized.length < 20) {
        return { isPhotoRequest: true, confidence: 0.7 }
      }
    }

    return { isPhotoRequest: false, confidence: 0 }
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
      const respuesta = await procesarMensaje(from, messageText, opciones)

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

  /**
   * 💳 DETECTAR Y MANEJAR SOLICITUD DE PAGO
   * Detecta cuando el usuario quiere pagar y genera los links automáticamente
   */
  private static async detectAndHandlePayment(
    socket: WASocket,
    userId: string,
    from: string,
    messageText: string,
    conversationId: string
  ): Promise<boolean> {
    try {
      const normalized = messageText.toLowerCase().trim()

      // Patrones de solicitud de pago
      const paymentPatterns = [
        /\b(quiero|deseo|me\s+gustaría|quisiera)\s+(pagar|comprar|adquirir)/i,
        /\b(cómo|como)\s+(pago|compro|puedo\s+pagar)/i,
        /\b(métodos?\s+de\s+pago|formas?\s+de\s+pago)/i,
        /\b(link\s+de\s+pago|enlace\s+de\s+pago)/i,
        /\b(dame|envía|envia|pasa|manda)\s+(el\s+)?(link|enlace)/i,
        /\b(proceder\s+con\s+(la\s+)?compra)/i,
        /\b(realizar\s+(el\s+)?pago)/i,
        /\b(pagar|comprar|adquirir)\b/i,
      ]

      let isPaymentRequest = false
      for (const pattern of paymentPatterns) {
        if (pattern.test(normalized)) {
          isPaymentRequest = true
          break
        }
      }

      if (!isPaymentRequest) {
        return false // No es solicitud de pago
      }

      console.log(`[Baileys] 💳 Solicitud de pago detectada`)

      // Buscar producto en contexto
      const { ConversationContextService } = await import('./conversation-context-service')
      const conversationKey = `${userId}:${from}`
      const context = ConversationContextService.getProductContext(conversationKey)

      if (!context) {
        console.log(`[Baileys] ⚠️ No hay producto en contexto para generar pago`)
        const noProductMessage = `Para generar el link de pago, necesito saber qué producto te interesa 🤔

¿Podrías decirme cuál producto quieres comprar?`
        
        await socket.sendMessage(from, { text: noProductMessage })
        await this.saveOutgoingMessage(userId, from, noProductMessage, conversationId)
        return true // Manejado
      }

      console.log(`[Baileys] ✅ Producto en contexto: ${context.lastProductName}`)

      // 🔥 GENERAR LINKS DE PAGO CON TU SISTEMA
      const { BotPaymentLinkGenerator } = await import('./bot-payment-link-generator')
      
      console.log(`[Baileys] 🔄 Generando links para producto ID: ${context.lastProductId}, Usuario: ${userId}`)
      
      const paymentResult = await BotPaymentLinkGenerator.generatePaymentLinks(
        context.lastProductId,
        userId,
        1 // cantidad
      )

      console.log(`[Baileys] 📊 Resultado de generación:`, {
        success: paymentResult.success,
        hasMercadoPago: !!paymentResult.mercadoPagoLink,
        hasPayPal: !!paymentResult.payPalLink,
        messageLength: paymentResult.message?.length
      })

      if (paymentResult.success && paymentResult.message) {
        console.log(`[Baileys] ✅ Links de pago generados exitosamente`)
        
        // Enviar mensaje con los links
        await socket.sendMessage(from, { text: paymentResult.message })
        
        // Guardar en BD
        await this.saveOutgoingMessage(userId, from, paymentResult.message, conversationId)
        
        return true // Manejado
      } else {
        console.log(`[Baileys] ⚠️ No se pudieron generar links de pago`)
        
        // Fallback: enviar mensaje genérico
        const fallbackMessage = `¡Perfecto! Para proceder con el pago de *${context.lastProductName}*, puedes usar:

💳 *Métodos de pago disponibles:*
• MercadoPago
• PayPal
• Nequi
• Daviplata
• Transferencia bancaria

Escríbeme para coordinar el pago 😊`
        
        await socket.sendMessage(from, { text: fallbackMessage })
        await this.saveOutgoingMessage(userId, from, fallbackMessage, conversationId)
        
        return true // Manejado
      }

    } catch (error) {
      console.error('[Baileys] ❌ Error detectando/manejando pago:', error)
      return false // No manejado
    }
  }
}
