"use strict";
/**
 * 🔄 SISTEMA DE AUTO-RECONEXIÓN DE WHATSAPP
 *
 * Conecta automáticamente WhatsApp cuando el servidor inicia
 * y mantiene la conexión activa con reconexión automática
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppAutoReconnect = void 0;
const db_1 = require("./db");
class WhatsAppAutoReconnect {
    /**
     * Inicializar sistema de auto-reconexión
     */
    static async initialize() {
        if (this.isInitialized) {
            console.log('🔄 [Auto-Reconnect] Ya está inicializado');
            return;
        }
        console.log('🚀 [Auto-Reconnect] Iniciando sistema de auto-reconexión...');
        this.isInitialized = true;
        // Esperar 5 segundos para que el servidor esté completamente listo
        await this.sleep(5000);
        // Intentar conectar inmediatamente
        await this.attemptConnection();
        // Configurar verificación periódica cada 30 segundos
        this.reconnectInterval = setInterval(async () => {
            await this.checkAndReconnect();
        }, 30000); // 30 segundos
        console.log('✅ [Auto-Reconnect] Sistema iniciado correctamente');
    }
    /**
     * Verificar y reconectar si es necesario
     */
    static async checkAndReconnect() {
        try {
            // Obtener todos los usuarios activos
            const users = await db_1.db.user.findMany({
                where: {
                    role: { in: ['ADMIN', 'USER'] }
                },
                select: {
                    id: true,
                    email: true,
                    whatsappNumber: true
                }
            });
            if (users.length === 0) {
                return; // Silencioso
            }
            // Verificar estado de conexión
            const { BaileysStableService } = await Promise.resolve().then(() => __importStar(require('./baileys-stable-service')));
            for (const user of users) {
                const session = BaileysStableService.getConnectionStatus(user.id);
                const isConnected = session?.status === 'CONNECTED' && session?.isReady;
                // 🔒 SOLO reconectar si está completamente DISCONNECTED
                // NO reconectar si está CONNECTING, QR_PENDING, o en proceso
                if (!session || (session.status === 'DISCONNECTED' && !isConnected)) {
                    // Verificar que no haya una reconexión reciente (evitar spam)
                    const lastDisconnect = session?.lastDisconnect;
                    if (lastDisconnect) {
                        const timeSinceDisconnect = Date.now() - lastDisconnect.getTime();
                        if (timeSinceDisconnect < 60000) { // Menos de 1 minuto
                            continue; // Esperar más tiempo
                        }
                    }
                    console.log(`🔄 [Auto-Reconnect] Usuario ${user.email} desconectado, intentando reconectar...`);
                    await this.attemptConnection(user.id);
                }
                // No hacer nada si ya está conectado o en proceso de conexión
            }
            // Resetear contador de intentos si hay conexión exitosa
            this.reconnectAttempts = 0;
        }
        catch (error) {
            console.error('❌ [Auto-Reconnect] Error en verificación:', error);
        }
    }
    /**
     * Intentar conectar WhatsApp
     */
    static async attemptConnection(userId) {
        try {
            console.log('🔌 [Auto-Reconnect] Intentando conectar WhatsApp...');
            // Obtener usuario
            let user;
            if (userId) {
                user = await db_1.db.user.findUnique({ where: { id: userId } });
            }
            else {
                // Buscar el primer usuario admin
                user = await db_1.db.user.findFirst({
                    where: { role: 'ADMIN' }
                });
            }
            if (!user) {
                console.log('⚠️ [Auto-Reconnect] No se encontró usuario para conectar');
                return;
            }
            // Importar servicio de Baileys
            const { BaileysStableService } = await Promise.resolve().then(() => __importStar(require('./baileys-stable-service')));
            // Verificar si ya está conectado
            const session = BaileysStableService.getConnectionStatus(user.id);
            if (session?.status === 'CONNECTED' && session?.isReady) {
                console.log(`✅ [Auto-Reconnect] ${user.email} ya está conectado`);
                return;
            }
            // Verificar si hay sesión guardada (archivos de autenticación)
            const authDir = `auth_sessions/${user.id}`;
            const fs = await Promise.resolve().then(() => __importStar(require('fs')));
            const path = await Promise.resolve().then(() => __importStar(require('path')));
            const authPath = path.join(process.cwd(), authDir);
            if (!fs.existsSync(authPath) || fs.readdirSync(authPath).length === 0) {
                console.log(`⚠️ [Auto-Reconnect] No hay sesión guardada para ${user.email}, se requiere escanear QR`);
                return;
            }
            // Intentar conectar usando sesión guardada
            console.log(`🔌 [Auto-Reconnect] Conectando ${user.email} con sesión guardada...`);
            const result = await BaileysStableService.initializeConnection(user.id);
            if (result.success) {
                console.log(`✅ [Auto-Reconnect] ${user.email} conectado exitosamente`);
                this.reconnectAttempts = 0;
            }
            else if (result.qr) {
                console.log(`📱 [Auto-Reconnect] ${user.email} requiere escanear QR code`);
            }
            else {
                console.log(`⚠️ [Auto-Reconnect] ${user.email} no pudo conectar: ${result.error}`);
            }
        }
        catch (error) {
            this.reconnectAttempts++;
            console.error(`❌ [Auto-Reconnect] Error al conectar (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts}):`, error.message);
            // Si se alcanzó el máximo de intentos, esperar más tiempo
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.log('⚠️ [Auto-Reconnect] Máximo de intentos alcanzado, esperando 5 minutos...');
                await this.sleep(300000); // 5 minutos
                this.reconnectAttempts = 0;
            }
        }
    }
    /**
     * Detener sistema de auto-reconexión
     */
    static stop() {
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
            this.isInitialized = false;
            console.log('🛑 [Auto-Reconnect] Sistema detenido');
        }
    }
    /**
     * Forzar reconexión inmediata
     */
    static async forceReconnect(userId) {
        console.log('🔄 [Auto-Reconnect] Forzando reconexión...');
        await this.attemptConnection(userId);
    }
    /**
     * Utilidad: Sleep
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.WhatsAppAutoReconnect = WhatsAppAutoReconnect;
WhatsAppAutoReconnect.reconnectInterval = null;
WhatsAppAutoReconnect.isInitialized = false;
WhatsAppAutoReconnect.reconnectAttempts = 0;
WhatsAppAutoReconnect.maxReconnectAttempts = 5;
// Exportar para uso en server.ts
exports.default = WhatsAppAutoReconnect;
