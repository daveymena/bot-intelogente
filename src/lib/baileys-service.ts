import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  WASocket,
  ConnectionState,
  BaileysEventMap,
  downloadMediaMessage
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import QRCode from 'qrcode'
import path from 'path'
import fs from 'fs'
import { db } from './db'
import { HotReloadService } from './hot-reload-service'
import { ConnectionMonitor } from './connection-monitor'
import { MessageQueueService } from './message-queue-service'

interface WhatsAppSession {
  socket: WASocket | null
  qr: string | null
  status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'QR_PENDING'
  userId: string
  isReady: boolean // Nueva bandera para saber si está listo para enviar
  isSyncing: boolean // Nueva bandera para saber si está sincronizando
}

export class BaileysService {
  private static sessions: Map<string, WhatsAppSession> = new Map()
  private static qrCallbacks: Map<string, (qr: string) => void> = new Map()
  private static productsCache: any[] = []
  private static settingsCache: any = null
  private static lastProductsUpdate: Date | null = null
  private static lastSettingsUpdate: Date | null = null

  // Inicializar hot reload
  static {
    // Escuchar cambios en productos
    HotReloadService.on('products:updated', async () => {
      console.log('[Baileys] 🔄 Recargando productos...')
      await this.reloadProducts()
    })

    // Escuchar cambios en configuración
    HotReloadService.on('settings:updated', async () => {
      console.log('[Baileys] 🔄 Recargando configuración...')
      await this.reloadSettings()
    })
  }

  /**
   * Recargar productos desde la base de datos
   */
  private static async reloadProducts() {
    try {
      this.productsCache = await db.product.findMany({
        where: { status: 'AVAILABLE' },
        orderBy: { name: 'asc' }
      })
      this.lastProductsUpdate = new Date()
      console.log(`[Baileys] ✅ ${this.productsCache.length} productos recargados`)
    } catch (error) {
      console.error('[Baileys] ❌ Error recargando productos:', error)
    }
  }

  /**
   * Recargar configuración desde variables de entorno
   */
  private static async reloadSettings() {
    try {
      // Recargar configuración desde .env o variables de entorno
      this.settingsCache = {
        botName: process.env.BOT_NAME || 'Smart Sales Bot',
        botPhone: process.env.BOT_PHONE || '',
        businessAddress: process.env.BUSINESS_ADDRESS || '',
        aiEnabled: process.env.AI_ENABLED !== 'false',
        photosEnabled: process.env.PHOTOS_ENABLED !== 'false',
        audioEnabled: process.env.AUDIO_ENABLED !== 'false'
      }
      this.lastSettingsUpdate = new Date()
      console.log('[Baileys] ✅ Configuración recargada')
    } catch (error) {
      console.error('[Baileys] ❌ Error recargando configuración:', error)
    }
  }

  /**
   * Obtener productos (con caché)
   */
  static async getProducts() {
    if (this.productsCache.length === 0 || !this.lastProductsUpdate) {
      await this.reloadProducts()
    }
    return this.productsCache
  }

  /**
   * Obtener configuración (con caché)
   */
  static async getSettings() {
    if (!this.settingsCache || !this.lastSettingsUpdate) {
      await this.reloadSettings()
    }
    return this.settingsCache
  }

  // Inicializar conexión de WhatsApp con Baileys
  static async initializeConnection(userId: string): Promise<{ success: boolean; qr?: string; error?: string }> {
    try {
      console.log(`[Baileys] Inicializando conexión para usuario: ${userId}`)

      // Crear directorio para sesiones si no existe
      const authDir = path.join(process.cwd(), 'auth_sessions', userId)
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true })
      }

      // Cargar estado de autenticación
      const { state, saveCreds } = await useMultiFileAuthState(authDir)

      // Crear logger silencioso para Baileys
      const logger = {
        level: 'silent' as const,
        fatal: () => {},
        error: () => {},
        warn: () => {},
        info: () => {},
        debug: () => {},
        trace: () => {},
        child: () => logger
      }

      // Crear socket de WhatsApp con logger silencioso
      const socket = makeWASocket({
        auth: state,
        browser: ['WhatsApp Bot', 'Chrome', '1.0.0'],
        logger: logger,
        printQRInTerminal: false // No imprimir QR en terminal
      })

      // Guardar sesión
      const session: WhatsAppSession = {
        socket,
        qr: null,
        status: 'CONNECTING',
        userId,
        isReady: false,
        isSyncing: false
      }
      this.sessions.set(userId, session)

      // Actualizar estado en DB
      await this.updateConnectionStatus(userId, 'CONNECTING')

      return new Promise((resolve, reject) => {
        let qrResolved = false

        // Manejar código QR
        socket.ev.on('connection.update', async (update) => {
          const { connection, lastDisconnect, qr } = update

          // Si hay QR, generarlo como imagen
          if (qr && !qrResolved) {
            console.log(`[Baileys] ✅ QR generado para usuario: ${userId}`)
            
            try {
              // Imprimir QR en terminal
              const qrTerminal = await QRCode.toString(qr, { type: 'terminal', small: true })
              console.log('\n📱 ESCANEA ESTE QR CON WHATSAPP:\n')
              console.log(qrTerminal)
              console.log('\n')

              // Generar QR como data URL para el frontend
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

              console.log(`[Baileys] ✅ QR guardado en sesión y DB para usuario: ${userId}`)

              // Actualizar en DB inmediatamente
              await db.whatsAppConnection.upsert({
                where: { userId },
                create: {
                  userId,
                  phoneNumber: 'pending',
                  status: 'QR_PENDING',
                  qrCode: qrDataURL,
                  qrExpiresAt: new Date(Date.now() + 60000) // 1 minuto
                },
                update: {
                  status: 'QR_PENDING',
                  qrCode: qrDataURL,
                  qrExpiresAt: new Date(Date.now() + 60000)
                }
              })

              console.log(`[Baileys] QR guardado en DB exitosamente`)

              // Llamar callback si existe
              const callback = this.qrCallbacks.get(userId)
              if (callback) {
                callback(qrDataURL)
              }

              // Resolver la promesa con el QR
              qrResolved = true
              resolve({ success: true, qr: qrDataURL })
            } catch (error) {
              console.error('[Baileys] Error generando QR:', error)
              if (!qrResolved) {
                qrResolved = true
                resolve({ success: false, error: 'Error generando QR' })
              }
            }
          }

          // Manejar conexión establecida
          if (connection === 'open') {
            console.log(`[Baileys] ✅ Conexión establecida para usuario: ${userId}`)
            
            session.status = 'CONNECTED'
            session.qr = null
            session.isSyncing = true // Inicialmente sincronizando
            
            // Esperar a que termine la sincronización inicial (20 segundos máximo)
            console.log('[Baileys] ⏳ Esperando sincronización inicial...')
            setTimeout(async () => {
              session.isReady = true
              session.isSyncing = false
              console.log('[Baileys] ✅ Bot listo para enviar mensajes')
              
              // 📬 PROCESAR MENSAJES PENDIENTES DE LA COLA
              console.log('[Baileys] 📬 Verificando mensajes pendientes en la cola...')
              await this.processPendingQueue(userId)
            }, 25000) // 25 segundos para estar seguros

            // Obtener info del usuario de WhatsApp
            const phoneNumber = socket.user?.id.split(':')[0] || 'unknown'

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

            // Configurar manejadores de mensajes
            this.setupMessageHandlers(socket, userId)
            
            // Iniciar monitoreo de conexión
            ConnectionMonitor.startMonitoring(userId)
          }

          // Manejar desconexión
          if (connection === 'close') {
            const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut
            
            // Detectar error de conflicto (múltiples sesiones)
            const isConflict = lastDisconnect?.error?.message?.includes('conflict') ||
                              lastDisconnect?.error?.message?.includes('replaced')
            
            if (isConflict) {
              console.log(`[Baileys] ⚠️ Conflicto detectado: otra sesión está activa`)
              console.log(`[Baileys] No se reconectará automáticamente para evitar conflictos`)
              session.status = 'DISCONNECTED'
              await this.updateConnectionStatus(userId, 'DISCONNECTED', 'Otra sesión activa detectada')
              this.sessions.delete(userId)
              return
            }
            
            console.log(`[Baileys] Conexión cerrada. Reconectar: ${shouldReconnect}`)

            if (shouldReconnect) {
              // Intentar reconectar solo si no hay otra sesión activa
              setTimeout(() => {
                this.initializeConnection(userId)
              }, 3000)
            } else {
              // Logout completo
              session.status = 'DISCONNECTED'
              await this.updateConnectionStatus(userId, 'DISCONNECTED')
              this.sessions.delete(userId)
            }
          }
        })

        // Guardar credenciales cuando cambien
        socket.ev.on('creds.update', saveCreds)

        // Timeout si no se genera QR en 15 segundos
        setTimeout(() => {
          if (!qrResolved) {
            console.log(`[Baileys] Timeout esperando QR para usuario: ${userId}`)
            qrResolved = true
            resolve({ success: false, error: 'Timeout esperando QR. Intenta de nuevo.' })
          }
        }, 15000)
      })
    } catch (error) {
      console.error('[Baileys] Error inicializando conexión:', error)
      await this.updateConnectionStatus(userId, 'DISCONNECTED', error instanceof Error ? error.message : 'Error desconocido')
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  }

  // Helper para enviar mensajes de forma segura
  private static async safeSendMessage(socket: WASocket, userId: string, to: string, content: any): Promise<boolean> {
    const session = this.sessions.get(userId)
    
    if (!session) {
      console.log('[Baileys] ⚠️ No hay sesión para enviar mensaje')
      return false
    }
    
    // Si está sincronizando, esperar un poco
    if (session.isSyncing || !session.isReady) {
      console.log('[Baileys] ⏳ Esperando sincronización antes de enviar...')
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Si sigue sincronizando después de esperar, intentar de todos modos
      if (session.isSyncing || !session.isReady) {
        console.log('[Baileys] ⚠️ Aún sincronizando, pero enviando mensaje...')
      }
    }
    
    try {
      await socket.sendMessage(to, content)
      return true
    } catch (error) {
      console.error('[Baileys] ❌ Error en safeSendMessage:', error)
      return false
    }
  }

  // Configurar manejadores de mensajes entrantes
  private static setupMessageHandlers(socket: WASocket, userId: string) {
    socket.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return

      for (const msg of messages) {
        // Ignorar mensajes propios
        if (msg.key.fromMe) continue

        try {
          const from = msg.key.remoteJid
          if (!from) continue

          // 1. Procesar mensaje de texto
          let messageText = msg.message?.conversation || 
                           msg.message?.extendedTextMessage?.text || 
                           ''

          // 2. Procesar audio (transcripción automática)
          if (msg.message?.audioMessage) {
            console.log(`[Baileys] 🎤 Audio recibido de ${from}`)
            
            try {
              // Importar MediaService
              const { MediaService } = await import('./media-service')
              
              // Descargar audio (pasar userId)
              const audioBuffer = await this.downloadMedia(msg, userId)
              
              if (audioBuffer) {
                // Transcribir con Groq Whisper
                const transcription = await MediaService.transcribeAudio(
                  audioBuffer,
                  msg.message.audioMessage.mimetype || 'audio/ogg'
                )
                
                messageText = transcription
                console.log(`[Baileys] ✅ Audio transcrito: "${transcription}"`)
                
                // No enviar mensaje de confirmación, solo procesar directamente
              }
            } catch (error) {
              console.error('[Baileys] ❌ Error transcribiendo audio:', error)
              messageText = '[Audio recibido - Error en transcripción]'
            }
          }

          // 3. Procesar imagen
          if (msg.message?.imageMessage) {
            console.log(`[Baileys] 📸 Imagen recibida de ${from}`)
            const caption = msg.message.imageMessage.caption || ''
            messageText = caption || 'Me envías fotos para verlo'
          }

          // 4. Procesar video
          if (msg.message?.videoMessage) {
            console.log(`[Baileys] 🎥 Video recibido de ${from}`)
            const caption = msg.message.videoMessage.caption || ''
            messageText = caption || '[Video recibido]'
          }

          if (!messageText) continue

          console.log(`[Baileys] 📨 Mensaje procesado de ${from}: ${messageText}`)

          // Guardar mensaje en DB
          const conversation = await this.saveIncomingMessage(userId, from, messageText)

          // Respuesta automática con IA
          await this.handleAutoResponse(socket, userId, from, messageText, conversation.id, msg)

        } catch (error) {
          console.error('[Baileys] Error procesando mensaje:', error)
        }
      }
    })
  }

  // Manejar respuesta automática con IA INTELIGENTE + DEMORA HUMANA + RAZONAMIENTO PROFUNDO
  private static async handleAutoResponse(
    socket: WASocket,
    userId: string,
    from: string,
    messageText: string,
    conversationId: string,
    originalMessage?: any
  ) {
    try {
      // Importar servicios dinámicamente
      const { IntelligentResponseService } = await import('./intelligent-response-service')
      const { AIService } = await import('./ai-service')
      const { ReasoningService } = await import('./reasoning-service')

      // Verificar si debe responder automáticamente
      if (!AIService.shouldAutoRespond(messageText)) {
        console.log(`[Baileys] ⏭️ Mensaje ignorado (muy corto o comando)`)
        return
      }

      console.log(`[Baileys] 🧠 Iniciando RAZONAMIENTO PROFUNDO...`)

      // 1. Mostrar estado de "escribiendo..." en WhatsApp
      try {
        await socket.sendPresenceUpdate('composing', from)
        console.log(`[Baileys] ✍️ Estado "escribiendo..." activado`)
      } catch (error) {
        console.log(`[Baileys] ⚠️ No se pudo activar "escribiendo..."`)
      }

      // 2. Obtener historial de conversación
      const history = await AIService.getConversationHistory(conversationId)

      // 🧠 PASO NUEVO: RAZONAMIENTO PROFUNDO
      console.log(`[Baileys] 🔍 Analizando mensaje con razonamiento profundo...`)
      const reasoning = await ReasoningService.reason(
        messageText,
        userId,
        from,
        history
      )

      // Mostrar proceso de razonamiento en consola
      console.log(`[Baileys] 🧠 RAZONAMIENTO COMPLETADO:`)
      console.log(`   - Intención: ${reasoning.finalIntent}`)
      console.log(`   - Confianza: ${(reasoning.confidence * 100).toFixed(0)}%`)
      console.log(`   - Producto: ${reasoning.productFound ? reasoning.productFound.name : 'No encontrado'}`)
      console.log(`   - Usar IA: ${reasoning.shouldUseAI ? 'Sí' : 'No (respuesta directa)'}`)
      console.log(`   - Pasos: ${reasoning.steps.length}`)

      let intelligentResponse: any

      // 3. Decidir cómo responder según el razonamiento
      if (!reasoning.shouldUseAI && reasoning.suggestedResponse) {
        // Respuesta directa sin IA (más rápido)
        console.log(`[Baileys] ⚡ Usando respuesta directa (sin IA)`)
        
        // Simular demora humana breve
        const delay = Math.floor(Math.random() * 1000) + 500 // 0.5-1.5 segundos
        await new Promise(resolve => setTimeout(resolve, delay))
        
        intelligentResponse = {
          message: reasoning.suggestedResponse,
          confidence: reasoning.confidence,
          usedAdvancedAI: false,
          complexity: 'simple',
          responseTime: delay
        }
      } else {
        // Usar IA con razonamiento completo
        console.log(`[Baileys] 🤖 Usando IA con contexto de razonamiento`)
        
        intelligentResponse = await IntelligentResponseService.generateResponseWithHumanTouch(
          userId,
          messageText,
          from,
          history
        )
      }

      console.log(`[Baileys] ✅ Respuesta generada:`, {
        complexity: intelligentResponse.complexity,
        usedAdvancedAI: intelligentResponse.usedAdvancedAI,
        responseTime: `${intelligentResponse.responseTime}ms`,
        preview: intelligentResponse.message.substring(0, 50) + '...'
      })

      // 4. Detener estado de "escribiendo..."
      try {
        await socket.sendPresenceUpdate('paused', from)
      } catch (error) {
        // Ignorar error
      }

      // 5. Detectar si debe enviar fotos
      const shouldSendPhotos = /foto|imagen|picture|ver|muestra|enseña/i.test(messageText)
      
      if (shouldSendPhotos) {
        console.log(`[Baileys] 📸 Cliente solicita fotos, buscando producto...`)
        
        try {
          // Buscar producto mencionado
          const { ProductIntelligenceService } = await import('./product-intelligence-service')
          const product = await ProductIntelligenceService.findProduct(messageText, userId)
          
          if (product && product.images) {
            const images = JSON.parse(product.images)
            
            if (images.length > 0) {
              console.log(`[Baileys] 📸 Enviando ${images.length} foto(s) del producto...`)
              
              // Enviar texto primero
              await socket.sendMessage(from, { text: intelligentResponse.message })
              
              // Enviar fotos (máximo 3)
              for (let i = 0; i < Math.min(images.length, 3); i++) {
                const imageUrl = images[i]
                
                try {
                  const { MediaService } = await import('./media-service')
                  const imageMessage = await MediaService.prepareImageMessage(
                    imageUrl,
                    i === 0 ? `📸 ${product.name}\n💰 $${product.price.toLocaleString()} COP` : undefined
                  )
                  
                  await socket.sendMessage(from, imageMessage)
                  console.log(`[Baileys] ✅ Foto ${i + 1} enviada`)
                  
                  // Pequeña demora entre fotos
                  await new Promise(resolve => setTimeout(resolve, 1000))
                } catch (error) {
                  console.error(`[Baileys] ❌ Error enviando foto ${i + 1}:`, error)
                }
              }
              
              console.log(`[Baileys] 📤 Respuesta con fotos enviada a ${from}`)
              return // Salir, ya enviamos todo
            }
          }
        } catch (error) {
          console.error('[Baileys] ❌ Error enviando fotos:', error)
        }
      }
      
      // 6. Enviar respuesta de texto normal (sin fotos o si falló el envío de fotos)
      await socket.sendMessage(from, { text: intelligentResponse.message })

      console.log(`[Baileys] 📤 Respuesta enviada a ${from}`)

      // 6. Guardar respuesta en DB con metadata
      await db.message.create({
        data: {
          conversationId,
          content: intelligentResponse.message,
          direction: 'OUTGOING',
          type: 'TEXT'
        }
      })

      // 7. Actualizar timestamp de conversación
      await db.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() }
      })

    } catch (error) {
      console.error('[Baileys] ❌ Error en respuesta automática:', error)
      
      // Verificar si es error de conexión
      const isConnectionError = error instanceof Error && 
        (error.message.includes('Connection Closed') || 
         error.message.includes('Connection Lost') ||
         error.message.includes('Socket closed'))
      
      if (isConnectionError) {
        console.log('[Baileys] 🔄 Conexión perdida, intentando reconectar...')
        // Intentar reconectar
        setTimeout(() => {
          this.initializeConnection(userId)
        }, 2000)
      } else {
        // Fallback: respuesta simple sin demora (solo si la conexión está activa)
        try {
          const session = this.sessions.get(userId)
          if (session?.socket && session.status === 'CONNECTED') {
            await socket.sendMessage(from, { 
              text: '👋 Hola ¡Bienvenido a Tecnovariedades D&S! 😄💻\n\nAquí encontrarás tecnología, soporte, cursos y herramientas digitales para potenciar tu día a día.\n\n📦 ¿Buscas algún producto, servicio o información en especial?' 
            })
          }
        } catch (sendError) {
          console.error('[Baileys] ❌ Error enviando mensaje de fallback:', sendError)
        }
      }
    }
  }

  // Guardar mensaje entrante en DB
  private static async saveIncomingMessage(userId: string, from: string, content: string) {
    try {
      // Buscar o crear conversación
      let conversation = await db.conversation.findFirst({
        where: {
          userId,
          customerPhone: from
        }
      })

      if (!conversation) {
        // Extraer nombre del número
        const customerName = `Cliente ${from.split('@')[0].slice(-4)}`
        
        conversation = await db.conversation.create({
          data: {
            userId,
            customerPhone: from,
            customerName,
            status: 'ACTIVE'
          }
        })
      }

      // Crear mensaje
      await db.message.create({
        data: {
          conversationId: conversation.id,
          content,
          direction: 'INCOMING',
          type: 'TEXT'
        }
      })

      // Actualizar timestamp de conversación
      await db.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() }
      })

      console.log(`[Baileys] Mensaje guardado en DB`)
      
      return conversation
    } catch (error) {
      console.error('[Baileys] Error guardando mensaje:', error)
      throw error
    }
  }

  // Enviar mensaje con validación de conexión y reintentos
  static async sendMessage(userId: string, to: string, content: string, retries = 3): Promise<boolean> {
    try {
      const session = this.sessions.get(userId)

      if (!session || !session.socket || session.status !== 'CONNECTED') {
        console.error('[Baileys] No hay sesión activa para enviar mensaje')
        
        // 📬 AGREGAR A LA COLA en lugar de fallar
        console.log('[Baileys] 📬 Agregando mensaje a la cola para envío posterior')
        await this.enqueueIfDisconnected(userId, to, content, 'text')
        
        // Si no hay sesión, intentar reconectar
        if (retries > 0) {
          console.log(`[Baileys] Intentando reconectar... (${retries} intentos restantes)`)
          await this.initializeConnection(userId)
          await new Promise(resolve => setTimeout(resolve, 2000))
          return this.sendMessage(userId, to, content, retries - 1)
        }
        
        return false
      }

      // Verificar si está sincronizando
      if (session.isSyncing || !session.isReady) {
        console.log('[Baileys] ⏳ Bot sincronizando, esperando...')
        
        // Esperar hasta 30 segundos a que termine la sincronización
        const maxWait = 30000
        const startWait = Date.now()
        
        while ((session.isSyncing || !session.isReady) && (Date.now() - startWait) < maxWait) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
        if (session.isSyncing || !session.isReady) {
          console.log('[Baileys] ⚠️ Timeout esperando sincronización, enviando de todos modos...')
        } else {
          console.log('[Baileys] ✅ Sincronización completada, enviando mensaje')
        }
      }

      // Asegurar formato correcto del número
      const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`

      await session.socket.sendMessage(jid, { text: content })

      console.log(`[Baileys] Mensaje enviado a ${to}`)

      // Guardar en DB
      const conversation = await db.conversation.findFirst({
        where: { userId, customerPhone: jid }
      })

      if (conversation) {
        await db.message.create({
          data: {
            conversationId: conversation.id,
            content,
            direction: 'OUTGOING',
            type: 'TEXT'
          }
        })

        await db.conversation.update({
          where: { id: conversation.id },
          data: { lastMessageAt: new Date() }
        })
      }

      return true
    } catch (error) {
      console.error('[Baileys] Error enviando mensaje:', error)
      
      // Verificar si es error de conexión y reintentar
      const isConnectionError = error instanceof Error && 
        (error.message.includes('Connection Closed') || 
         error.message.includes('Connection Lost') ||
         error.message.includes('Socket closed'))
      
      if (isConnectionError && retries > 0) {
        console.log(`[Baileys] 🔄 Reintentando envío... (${retries} intentos restantes)`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return this.sendMessage(userId, to, content, retries - 1)
      }
      
      return false
    }
  }

  // Desconectar
  static async disconnect(userId: string): Promise<boolean> {
    try {
      const session = this.sessions.get(userId)

      if (session && session.socket) {
        await session.socket.logout()
      }

      this.sessions.delete(userId)
      await this.updateConnectionStatus(userId, 'DISCONNECTED')

      // Detener monitoreo de conexión
      ConnectionMonitor.stopMonitoring(userId)

      // Eliminar archivos de sesión
      const authDir = path.join(process.cwd(), 'auth_sessions', userId)
      if (fs.existsSync(authDir)) {
        fs.rmSync(authDir, { recursive: true, force: true })
      }

      console.log(`[Baileys] Usuario ${userId} desconectado`)
      return true
    } catch (error) {
      console.error('[Baileys] Error desconectando:', error)
      return false
    }
  }

  // Obtener estado de conexión
  static getConnectionStatus(userId: string): WhatsAppSession | null {
    return this.sessions.get(userId) || null
  }

  // Registrar callback para QR
  static onQRCode(userId: string, callback: (qr: string) => void) {
    this.qrCallbacks.set(userId, callback)
  }

  // Descargar media de un mensaje
  private static async downloadMedia(message: any, userId: string): Promise<Buffer | null> {
    try {
      const session = this.sessions.get(userId)
      if (!session?.socket) {
        throw new Error('Socket no disponible')
      }

      // Logger simple compatible con Baileys
      const logger = {
        level: 'silent' as const,
        fatal: () => {},
        error: () => {},
        warn: () => {},
        info: () => {},
        debug: () => {},
        trace: () => {},
        child: () => logger
      }

      // Usar la función downloadMediaMessage de Baileys (no es un método del mensaje)
      const buffer = await downloadMediaMessage(
        message,
        'buffer',
        {},
        {
          logger,
          reuploadRequest: session.socket.updateMediaMessage
        }
      )
      return buffer as Buffer
    } catch (error) {
      console.error('[Baileys] Error descargando media:', error)
      return null
    }
  }

  // Actualizar estado en DB
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
      console.error('[Baileys] Error actualizando estado en DB:', error)
    }
  }

  /**
   * 📬 Procesar mensajes pendientes de la cola
   */
  private static async processPendingQueue(userId: string): Promise<void> {
    try {
      const session = this.sessions.get(userId)
      if (!session || !session.socket || session.status !== 'CONNECTED') {
        console.log('[Baileys] ⚠️ No se puede procesar cola: bot no conectado')
        return
      }

      // Función para enviar mensaje desde la cola
      const sendFromQueue = async (phone: string, message: string, metadata?: any): Promise<boolean> => {
        try {
          const jid = phone.includes('@') ? phone : `${phone}@s.whatsapp.net`
          
          if (metadata?.type === 'image' && metadata?.imageUrl) {
            // Enviar imagen
            const { MediaService } = await import('./media-service')
            const imageMsg = await MediaService.prepareImageMessage(metadata.imageUrl, message)
            await session.socket!.sendMessage(jid, imageMsg)
          } else {
            // Enviar texto
            await session.socket!.sendMessage(jid, { text: message })
          }
          
          console.log(`[Baileys] ✅ Mensaje de cola enviado a ${phone}`)
          return true
        } catch (error) {
          console.error(`[Baileys] ❌ Error enviando mensaje de cola:`, error)
          return false
        }
      }

      // Procesar cola
      await MessageQueueService.processPendingMessages(sendFromQueue)
      
      // Limpiar mensajes antiguos
      await MessageQueueService.cleanOldMessages()
      
    } catch (error) {
      console.error('[Baileys] ❌ Error procesando cola:', error)
    }
  }

  /**
   * 📬 Agregar mensaje a la cola si el bot está desconectado
   */
  static async enqueueIfDisconnected(
    userId: string,
    phoneNumber: string,
    message: string,
    type: 'text' | 'image' | 'audio' = 'text',
    metadata?: any
  ): Promise<boolean> {
    const session = this.sessions.get(userId)
    
    // Si está conectado y listo, no encolar
    if (session && session.socket && session.status === 'CONNECTED' && session.isReady) {
      return false
    }

    // Agregar a la cola
    console.log('[Baileys] 📬 Bot desconectado, agregando mensaje a la cola')
    await MessageQueueService.enqueue(phoneNumber, message, type, metadata)
    return true
  }

  /**
   * 📊 Obtener estadísticas de la cola
   */
  static async getQueueStats() {
    return await MessageQueueService.getQueueStats()
  }
}
