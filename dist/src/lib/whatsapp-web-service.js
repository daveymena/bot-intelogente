"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppWebService = void 0;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode_1 = __importDefault(require("qrcode"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = require("./db");
const hot_reload_service_1 = require("./hot-reload-service");
const connection_monitor_1 = require("./connection-monitor");
const message_queue_service_1 = require("./message-queue-service");
class WhatsAppWebService {
    /**
     * Recargar productos desde la base de datos
     */
    static async reloadProducts() {
        try {
            this.productsCache = await db_1.db.product.findMany({
                where: { status: 'AVAILABLE' },
                orderBy: { name: 'asc' }
            });
            this.lastProductsUpdate = new Date();
            console.log(`[WhatsApp Web] ✅ ${this.productsCache.length} productos recargados`);
        }
        catch (error) {
            console.error('[WhatsApp Web] ❌ Error recargando productos:', error);
        }
    }
    /**
     * Recargar configuración desde variables de entorno
     */
    static async reloadSettings() {
        try {
            this.settingsCache = {
                botName: process.env.BOT_NAME || 'Smart Sales Bot',
                botPhone: process.env.BOT_PHONE || '',
                businessAddress: process.env.BUSINESS_ADDRESS || '',
                aiEnabled: process.env.AI_ENABLED !== 'false',
                photosEnabled: process.env.PHOTOS_ENABLED !== 'false',
                audioEnabled: process.env.AUDIO_ENABLED !== 'false'
            };
            this.lastSettingsUpdate = new Date();
            console.log('[WhatsApp Web] ✅ Configuración recargada');
        }
        catch (error) {
            console.error('[WhatsApp Web] ❌ Error recargando configuración:', error);
        }
    }
    /**
     * Obtener productos (con caché)
     */
    static async getProducts() {
        if (this.productsCache.length === 0 || !this.lastProductsUpdate) {
            await this.reloadProducts();
        }
        return this.productsCache;
    }
    /**
     * Obtener configuración (con caché)
     */
    static async getSettings() {
        if (!this.settingsCache || !this.lastSettingsUpdate) {
            await this.reloadSettings();
        }
        return this.settingsCache;
    }
    // Inicializar conexión de WhatsApp con WhatsApp Web.js
    static async initializeConnection(userId) {
        try {
            console.log(`[WhatsApp Web] Inicializando conexión para usuario: ${userId}`);
            // Crear directorio para sesiones si no existe
            const authDir = path_1.default.join(process.cwd(), 'whatsapp-sessions', userId);
            if (!fs_1.default.existsSync(authDir)) {
                fs_1.default.mkdirSync(authDir, { recursive: true });
            }
            // Crear cliente de WhatsApp
            console.log(`[WhatsApp Web] 📦 Creando cliente con configuración:`);
            console.log(`[WhatsApp Web]    - clientId: ${userId}`);
            console.log(`[WhatsApp Web]    - dataPath: ${authDir}`);
            const client = new whatsapp_web_js_1.Client({
                authStrategy: new whatsapp_web_js_1.LocalAuth({
                    clientId: userId,
                    dataPath: authDir
                }),
                puppeteer: {
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--single-process',
                        '--disable-gpu'
                    ]
                }
            });
            console.log(`[WhatsApp Web] ✅ Cliente creado`);
            // Guardar sesión
            const session = {
                client,
                qr: null,
                status: 'CONNECTING',
                userId,
                isReady: false
            };
            this.sessions.set(userId, session);
            // Actualizar estado en DB
            await this.updateConnectionStatus(userId, 'CONNECTING');
            // Configurar manejadores ANTES de inicializar
            let qrResolved = false;
            // Manejar código QR
            client.on('qr', async (qr) => {
                console.log(`[WhatsApp Web] 📱 Evento 'qr' recibido para usuario: ${userId}`);
                try {
                    // Generar QR como data URL para el frontend
                    const qrDataURL = await qrcode_1.default.toDataURL(qr, {
                        width: 300,
                        margin: 2,
                        color: {
                            dark: '#25D366',
                            light: '#FFFFFF'
                        }
                    });
                    session.qr = qrDataURL;
                    session.status = 'QR_PENDING';
                    console.log(`[WhatsApp Web] ✅ QR generado y guardado en sesión`);
                    // Actualizar en DB
                    await db_1.db.whatsAppConnection.upsert({
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
                    });
                    console.log(`[WhatsApp Web] ✅ QR guardado en DB`);
                    // Llamar callback si existe
                    const callback = this.qrCallbacks.get(userId);
                    if (callback) {
                        callback(qrDataURL);
                    }
                    qrResolved = true;
                }
                catch (error) {
                    console.error('[WhatsApp Web] ❌ Error generando QR:', error);
                }
            });
            // Manejar conexión exitosa
            client.on('ready', async () => {
                console.log(`[WhatsApp Web] ✅ Conexión establecida para usuario: ${userId}`);
                session.status = 'CONNECTED';
                session.qr = null;
                session.isReady = true;
                // Obtener info del usuario de WhatsApp
                const info = client.info;
                const phoneNumber = info.wid.user;
                console.log(`[WhatsApp Web] 📱 Número de WhatsApp: ${phoneNumber}`);
                await db_1.db.whatsAppConnection.upsert({
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
                });
                console.log(`[WhatsApp Web] ✅ Conexión registrada en base de datos`);
                // Configurar manejadores de mensajes
                this.setupMessageHandlers(client, userId);
                // Iniciar monitoreo de conexión
                connection_monitor_1.ConnectionMonitor.startMonitoring(userId);
                // 🔄 Iniciar sistema de auto-reconexión
                const { WhatsAppReconnectionService } = await Promise.resolve().then(() => __importStar(require('./whatsapp-reconnection-service')));
                WhatsAppReconnectionService.startMonitoring(userId);
                // Procesar mensajes pendientes
                await this.processPendingQueue(userId);
            });
            // Manejar desconexión
            client.on('disconnected', async (reason) => {
                console.log(`[WhatsApp Web] Conexión cerrada. Razón: ${reason}`);
                session.status = 'DISCONNECTED';
                await this.updateConnectionStatus(userId, 'DISCONNECTED');
                this.sessions.delete(userId);
                connection_monitor_1.ConnectionMonitor.stopMonitoring(userId);
                // 🔄 El sistema de auto-reconexión detectará esto y reconectará automáticamente
                console.log(`[WhatsApp Web] 🔄 Sistema de auto-reconexión activado`);
            });
            // Manejar errores
            client.on('auth_failure', async (msg) => {
                console.error('[WhatsApp Web] Error de autenticación:', msg);
                session.status = 'DISCONNECTED';
                await this.updateConnectionStatus(userId, 'DISCONNECTED', `Auth failure: ${msg}`);
                this.sessions.delete(userId);
            });
            // Inicializar cliente de forma asíncrona
            console.log(`[WhatsApp Web] 🚀 Iniciando cliente de WhatsApp...`);
            // Inicializar sin esperar - el QR llegará por evento
            client.initialize().catch(async (error) => {
                console.error('[WhatsApp Web] ❌ Error inicializando cliente:', error);
                if (error instanceof Error) {
                    console.error('[WhatsApp Web] Error message:', error.message);
                }
                await this.updateConnectionStatus(userId, 'DISCONNECTED', error.message);
            });
            console.log(`[WhatsApp Web] ✅ Cliente inicializado - esperando QR por evento`);
            // Retornar inmediatamente - el QR se manejará por eventos
            return { success: true };
        }
        catch (error) {
            console.error('[WhatsApp Web] Error inicializando conexión:', error);
            await this.updateConnectionStatus(userId, 'DISCONNECTED', error instanceof Error ? error.message : 'Error desconocido');
            return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
        }
    }
    // Configurar manejadores de mensajes entrantes
    static setupMessageHandlers(client, userId) {
        console.log(`[WhatsApp Web] 🎯 Configurando manejadores de mensajes para usuario: ${userId}`);
        client.on('message', async (message) => {
            console.log(`[WhatsApp Web] 📩 Mensaje recibido - fromMe: ${message.fromMe}, type: ${message.type}`);
            // Ignorar mensajes propios
            if (message.fromMe) {
                console.log(`[WhatsApp Web] ⏭️ Ignorando mensaje propio`);
                return;
            }
            try {
                const from = message.from;
                if (!from) {
                    console.log(`[WhatsApp Web] ⚠️ Mensaje sin remitente, ignorando`);
                    return;
                }
                console.log(`[WhatsApp Web] 👤 Mensaje de: ${from}`);
                // Procesar mensaje de texto
                let messageText = message.body || '';
                // Procesar imagen
                if (message.hasMedia && message.type === 'image') {
                    console.log(`[WhatsApp Web] 📸 Imagen recibida de ${from}`);
                    try {
                        const media = await message.downloadMedia();
                        messageText = message.body || 'Me envías fotos para verlo';
                        console.log(`[WhatsApp Web] ✅ Imagen procesada`);
                    }
                    catch (error) {
                        console.error(`[WhatsApp Web] ❌ Error descargando imagen:`, error);
                        messageText = 'Me envías fotos para verlo';
                    }
                }
                // Procesar audio
                if (message.hasMedia && message.type === 'audio') {
                    console.log(`[WhatsApp Web] 🎤 Audio recibido de ${from}`);
                    try {
                        const { AudioTranscriptionService } = await Promise.resolve().then(() => __importStar(require('./audio-transcription-service')));
                        const audioService = new AudioTranscriptionService();
                        messageText = await audioService.transcribeWhatsAppAudio(message);
                        console.log(`[WhatsApp Web] ✅ Audio transcrito: "${messageText}"`);
                    }
                    catch (error) {
                        console.error(`[WhatsApp Web] ❌ Error transcribiendo audio:`, error.message);
                        messageText = '[Audio recibido - Error en transcripción]';
                    }
                }
                if (!messageText) {
                    console.log(`[WhatsApp Web] ⚠️ Mensaje vacío, ignorando`);
                    return;
                }
                console.log(`[WhatsApp Web] 📨 Mensaje procesado: "${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}"`);
                // Guardar mensaje en DB
                console.log(`[WhatsApp Web] 💾 Guardando mensaje en DB...`);
                const conversation = await this.saveIncomingMessage(userId, from, messageText);
                console.log(`[WhatsApp Web] ✅ Mensaje guardado - Conversación ID: ${conversation.id}`);
                // Respuesta automática con IA
                console.log(`[WhatsApp Web] 🤖 Iniciando respuesta automática...`);
                await this.handleAutoResponse(client, userId, from, messageText, conversation.id, message);
                console.log(`[WhatsApp Web] ✅ Proceso de respuesta completado`);
            }
            catch (error) {
                console.error('[WhatsApp Web] ❌ Error procesando mensaje:', error);
                if (error instanceof Error) {
                    console.error('[WhatsApp Web] Stack:', error.stack);
                }
            }
        });
        console.log(`[WhatsApp Web] ✅ Manejadores configurados correctamente`);
    }
    // Manejar respuesta automática con IA
    static async handleAutoResponse(client, userId, from, messageText, conversationId, originalMessage) {
        console.log(`[WhatsApp Web] 🎯 handleAutoResponse iniciado`);
        console.log(`[WhatsApp Web]    - userId: ${userId}`);
        console.log(`[WhatsApp Web]    - from: ${from}`);
        console.log(`[WhatsApp Web]    - conversationId: ${conversationId}`);
        try {
            // Importar servicios dinámicamente
            console.log(`[WhatsApp Web] 📦 Importando servicios de IA...`);
            const { AIService } = await Promise.resolve().then(() => __importStar(require('./ai-service')));
            const { IntelligentResponseService } = await Promise.resolve().then(() => __importStar(require('./intelligent-response-service')));
            console.log(`[WhatsApp Web] ✅ Servicios importados`);
            // Verificar si debe responder automáticamente
            console.log(`[WhatsApp Web] 🔍 Verificando si debe responder...`);
            const shouldRespond = AIService.shouldAutoRespond(messageText);
            console.log(`[WhatsApp Web] Debe responder: ${shouldRespond}`);
            if (!shouldRespond) {
                console.log(`[WhatsApp Web] ⏭️ Mensaje ignorado (muy corto o comando)`);
                return;
            }
            console.log(`[WhatsApp Web] 🧠 Obteniendo historial de conversación...`);
            const history = await AIService.getConversationHistory(conversationId);
            console.log(`[WhatsApp Web] ✅ Historial obtenido: ${history.length} mensajes`);
            // Generar respuesta inteligente
            console.log(`[WhatsApp Web] 🤖 Generando respuesta inteligente...`);
            const intelligentResponse = await IntelligentResponseService.generateResponseWithHumanTouch(userId, messageText, from, history);
            console.log(`[WhatsApp Web] ✅ Respuesta generada:`, {
                complexity: intelligentResponse.complexity,
                usedAdvancedAI: intelligentResponse.usedAdvancedAI,
                responseTime: `${intelligentResponse.responseTime}ms`,
                length: intelligentResponse.message.length,
                preview: intelligentResponse.message.substring(0, 50) + '...'
            });
            // 🚨 ANTI-BAN: Esperar delay humano ANTES de enviar
            // Los delays ya se aplicaron en generateResponseWithHumanTouch
            // pero agregamos un delay adicional aleatorio para parecer más humano
            const extraDelay = Math.floor(Math.random() * 3000) + 2000; // 2-5 segundos extra
            console.log(`[WhatsApp Web] ⏱️  Esperando ${extraDelay}ms adicionales (anti-ban)...`);
            await new Promise(resolve => setTimeout(resolve, extraDelay));
            // Enviar respuesta
            console.log(`[WhatsApp Web] 📤 Enviando respuesta a ${from}...`);
            await client.sendMessage(from, intelligentResponse.message);
            console.log(`[WhatsApp Web] ✅ Respuesta enviada exitosamente`);
            // Guardar respuesta en DB
            console.log(`[WhatsApp Web] 💾 Guardando respuesta en DB...`);
            await db_1.db.message.create({
                data: {
                    conversationId,
                    content: intelligentResponse.message,
                    direction: 'OUTGOING',
                    type: 'TEXT'
                }
            });
            console.log(`[WhatsApp Web] ✅ Respuesta guardada en DB`);
            // Actualizar timestamp de conversación
            await db_1.db.conversation.update({
                where: { id: conversationId },
                data: { lastMessageAt: new Date() }
            });
            console.log(`[WhatsApp Web] ✅ Timestamp actualizado`);
        }
        catch (error) {
            console.error('[WhatsApp Web] ❌ Error en respuesta automática:', error);
            if (error instanceof Error) {
                console.error('[WhatsApp Web] Error message:', error.message);
                console.error('[WhatsApp Web] Error stack:', error.stack);
            }
            // Fallback: respuesta simple
            console.log(`[WhatsApp Web] 🔄 Intentando enviar respuesta de fallback...`);
            try {
                const session = this.sessions.get(userId);
                console.log(`[WhatsApp Web] Sesión encontrada: ${!!session}, isReady: ${session?.isReady}`);
                if (session?.isReady) {
                    const fallbackMessage = '👋 Hola ¡Bienvenido a Tecnovariedades D&S! 😄💻\n\nAquí encontrarás tecnología, soporte, cursos y herramientas digitales para potenciar tu día a día.\n\n📦 ¿Buscas algún producto, servicio o información en especial?';
                    console.log(`[WhatsApp Web] Enviando fallback...`);
                    await client.sendMessage(from, fallbackMessage);
                    console.log(`[WhatsApp Web] ✅ Fallback enviado`);
                    // Guardar fallback en DB
                    await db_1.db.message.create({
                        data: {
                            conversationId,
                            content: fallbackMessage,
                            direction: 'OUTGOING',
                            type: 'TEXT'
                        }
                    });
                }
                else {
                    console.log(`[WhatsApp Web] ❌ No se puede enviar fallback: sesión no lista`);
                }
            }
            catch (sendError) {
                console.error('[WhatsApp Web] ❌ Error enviando mensaje de fallback:', sendError);
                if (sendError instanceof Error) {
                    console.error('[WhatsApp Web] Fallback error:', sendError.message);
                }
            }
        }
    }
    // Guardar mensaje entrante en DB
    static async saveIncomingMessage(userId, from, content) {
        try {
            // Buscar o crear conversación
            let conversation = await db_1.db.conversation.findFirst({
                where: {
                    userId,
                    customerPhone: from
                }
            });
            if (!conversation) {
                const customerName = `Cliente ${from.split('@')[0].slice(-4)}`;
                conversation = await db_1.db.conversation.create({
                    data: {
                        userId,
                        customerPhone: from,
                        customerName,
                        status: 'ACTIVE'
                    }
                });
            }
            // Crear mensaje
            await db_1.db.message.create({
                data: {
                    conversationId: conversation.id,
                    content,
                    direction: 'INCOMING',
                    type: 'TEXT'
                }
            });
            // Actualizar timestamp de conversación
            await db_1.db.conversation.update({
                where: { id: conversation.id },
                data: { lastMessageAt: new Date() }
            });
            console.log(`[WhatsApp Web] Mensaje guardado en DB`);
            return conversation;
        }
        catch (error) {
            console.error('[WhatsApp Web] Error guardando mensaje:', error);
            throw error;
        }
    }
    // Enviar mensaje
    static async sendMessage(userId, to, content, retries = 3) {
        try {
            const session = this.sessions.get(userId);
            if (!session || !session.client || session.status !== 'CONNECTED' || !session.isReady) {
                console.error('[WhatsApp Web] No hay sesión activa para enviar mensaje');
                // Agregar a la cola
                console.log('[WhatsApp Web] 📬 Agregando mensaje a la cola para envío posterior');
                await this.enqueueIfDisconnected(userId, to, content, 'text');
                // Intentar reconectar
                if (retries > 0) {
                    console.log(`[WhatsApp Web] Intentando reconectar... (${retries} intentos restantes)`);
                    await this.initializeConnection(userId);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return this.sendMessage(userId, to, content, retries - 1);
                }
                return false;
            }
            // Asegurar formato correcto del número
            const jid = to.includes('@') ? to : `${to}@c.us`;
            await session.client.sendMessage(jid, content);
            console.log(`[WhatsApp Web] Mensaje enviado a ${to}`);
            // Guardar en DB
            const conversation = await db_1.db.conversation.findFirst({
                where: { userId, customerPhone: jid }
            });
            if (conversation) {
                await db_1.db.message.create({
                    data: {
                        conversationId: conversation.id,
                        content,
                        direction: 'OUTGOING',
                        type: 'TEXT'
                    }
                });
                await db_1.db.conversation.update({
                    where: { id: conversation.id },
                    data: { lastMessageAt: new Date() }
                });
            }
            return true;
        }
        catch (error) {
            console.error('[WhatsApp Web] Error enviando mensaje:', error);
            if (retries > 0) {
                console.log(`[WhatsApp Web] 🔄 Reintentando envío... (${retries} intentos restantes)`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.sendMessage(userId, to, content, retries - 1);
            }
            return false;
        }
    }
    /**
     * Obtener sesión de un usuario (para sistema de reconexión)
     */
    static getSession(userId) {
        return this.sessions.get(userId) || null;
    }
    // Desconectar
    static async disconnect(userId) {
        try {
            console.log(`[WhatsApp Web] 🔌 Desconectando usuario ${userId}...`);
            const session = this.sessions.get(userId);
            if (session && session.client) {
                await session.client.destroy();
            }
            // Eliminar sesión de memoria
            this.sessions.delete(userId);
            // Actualizar estado en DB
            await this.updateConnectionStatus(userId, 'DISCONNECTED');
            // Detener monitoreo de conexión
            connection_monitor_1.ConnectionMonitor.stopMonitoring(userId);
            // Eliminar archivos de sesión
            const authDir = path_1.default.join(process.cwd(), 'whatsapp-sessions', userId);
            if (fs_1.default.existsSync(authDir)) {
                fs_1.default.rmSync(authDir, { recursive: true, force: true });
            }
            console.log(`[WhatsApp Web] Usuario ${userId} desconectado`);
            return true;
        }
        catch (error) {
            console.error('[WhatsApp Web] Error desconectando:', error);
            return false;
        }
    }
    // Obtener estado de conexión
    static getConnectionStatus(userId) {
        return this.sessions.get(userId) || null;
    }
    // Registrar callback para QR
    static onQRCode(userId, callback) {
        this.qrCallbacks.set(userId, callback);
    }
    // Actualizar estado en DB
    static async updateConnectionStatus(userId, status, error) {
        try {
            await db_1.db.whatsAppConnection.upsert({
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
            });
        }
        catch (error) {
            console.error('[WhatsApp Web] Error actualizando estado en DB:', error);
        }
    }
    /**
     * Procesar mensajes pendientes de la cola
     */
    static async processPendingQueue(userId) {
        try {
            const session = this.sessions.get(userId);
            if (!session || !session.client || session.status !== 'CONNECTED') {
                console.log('[WhatsApp Web] ⚠️ No se puede procesar cola: WhatsApp no conectado');
                return;
            }
            // Función para enviar mensaje desde la cola
            const sendFromQueue = async (phone, message, metadata) => {
                try {
                    const jid = phone.includes('@') ? phone : `${phone}@c.us`;
                    if (metadata?.type === 'image' && metadata?.imageUrl) {
                        // Enviar imagen (simplificado)
                        await session.client.sendMessage(jid, message);
                    }
                    else {
                        // Enviar texto
                        await session.client.sendMessage(jid, message);
                    }
                    console.log(`[WhatsApp Web] ✅ Mensaje de cola enviado a ${phone}`);
                    return true;
                }
                catch (error) {
                    console.error(`[WhatsApp Web] ❌ Error enviando mensaje de cola:`, error);
                    return false;
                }
            };
            // Procesar cola
            await message_queue_service_1.MessageQueueService.processPendingMessages(sendFromQueue);
            // Limpiar mensajes antiguos
            await message_queue_service_1.MessageQueueService.cleanOldMessages();
        }
        catch (error) {
            console.error('[WhatsApp Web] ❌ Error procesando cola:', error);
        }
    }
    /**
     * Agregar mensaje a la cola si WhatsApp está desconectado
     */
    static async enqueueIfDisconnected(userId, phoneNumber, message, type = 'text', metadata) {
        const session = this.sessions.get(userId);
        // Si está conectado y listo, no encolar
        if (session && session.client && session.status === 'CONNECTED' && session.isReady) {
            return false;
        }
        // Agregar a la cola
        console.log('[WhatsApp Web] 📬 WhatsApp desconectado, agregando mensaje a la cola');
        await message_queue_service_1.MessageQueueService.enqueue(phoneNumber, message, type, metadata);
        return true;
    }
    /**
     * Obtener estadísticas de la cola
     */
    static async getQueueStats() {
        return await message_queue_service_1.MessageQueueService.getQueueStats();
    }
    /**
     * Reseteo completo - Limpia TODO para empezar desde cero
     */
    static async fullReset(userId) {
        try {
            console.log(`[WhatsApp Web] 🔄 INICIANDO RESETEO COMPLETO para usuario ${userId}`);
            // 1. Desconectar cliente si existe
            const session = this.sessions.get(userId);
            if (session?.client) {
                try {
                    console.log(`[WhatsApp Web] 1️⃣ Cerrando cliente...`);
                    await session.client.destroy();
                }
                catch (error) {
                    console.log(`[WhatsApp Web] ⚠️ Error cerrando cliente (continuando):`, error);
                }
            }
            // 2. Eliminar sesión de memoria
            console.log(`[WhatsApp Web] 2️⃣ Eliminando sesión de memoria...`);
            this.sessions.delete(userId);
            this.qrCallbacks.delete(userId);
            // 3. Detener monitoreo
            console.log(`[WhatsApp Web] 3️⃣ Deteniendo monitoreo...`);
            connection_monitor_1.ConnectionMonitor.stopMonitoring(userId);
            // 4. Limpiar base de datos COMPLETAMENTE
            console.log(`[WhatsApp Web] 4️⃣ Limpiando base de datos...`);
            await db_1.db.whatsAppConnection.deleteMany({
                where: { userId }
            });
            // 5. Eliminar TODOS los archivos de sesión
            console.log(`[WhatsApp Web] 5️⃣ Eliminando archivos de sesión...`);
            const authDir = path_1.default.join(process.cwd(), 'whatsapp-sessions', userId);
            if (fs_1.default.existsSync(authDir)) {
                try {
                    fs_1.default.rmSync(authDir, { recursive: true, force: true });
                    console.log(`[WhatsApp Web]    ✓ Directorio eliminado`);
                }
                catch (error) {
                    console.log(`[WhatsApp Web] ⚠️ Error eliminando directorio:`, error);
                }
            }
            console.log(`[WhatsApp Web] ✅ RESETEO COMPLETO EXITOSO`);
            return {
                success: true,
                message: 'Reseteo completo exitoso. Ahora puedes conectar WhatsApp desde cero.'
            };
        }
        catch (error) {
            console.error('[WhatsApp Web] ❌ Error en reseteo completo:', error);
            return {
                success: false,
                message: `Error en reseteo: ${error instanceof Error ? error.message : 'Error desconocido'}`
            };
        }
    }
    /**
     * Limpieza rápida antes de generar nuevo QR
     */
    static async quickCleanup(userId) {
        try {
            console.log(`[WhatsApp Web] 🧹 Limpieza rápida para usuario ${userId}`);
            // Eliminar sesión de memoria
            this.sessions.delete(userId);
            this.qrCallbacks.delete(userId);
            // Limpiar QR antiguo en DB
            await db_1.db.whatsAppConnection.updateMany({
                where: { userId },
                data: {
                    qrCode: null,
                    qrExpiresAt: null,
                    status: 'DISCONNECTED',
                    lastError: null
                }
            });
            console.log(`[WhatsApp Web] ✅ Limpieza rápida completada`);
        }
        catch (error) {
            console.error('[WhatsApp Web] ❌ Error en limpieza rápida:', error);
        }
    }
}
exports.WhatsAppWebService = WhatsAppWebService;
_a = WhatsAppWebService;
WhatsAppWebService.sessions = new Map();
WhatsAppWebService.qrCallbacks = new Map();
WhatsAppWebService.productsCache = [];
WhatsAppWebService.settingsCache = null;
WhatsAppWebService.lastProductsUpdate = null;
WhatsAppWebService.lastSettingsUpdate = null;
// Inicializar hot reload
(() => {
    // Escuchar cambios en productos
    hot_reload_service_1.HotReloadService.on('products:updated', async () => {
        console.log('[WhatsApp Web] 🔄 Recargando productos...');
        await _a.reloadProducts();
    });
    // Escuchar cambios en configuración
    hot_reload_service_1.HotReloadService.on('settings:updated', async () => {
        console.log('[WhatsApp Web] 🔄 Recargando configuración...');
        await _a.reloadSettings();
    });
})();
