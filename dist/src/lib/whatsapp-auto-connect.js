"use strict";
/**
 * 🚀 SERVICIO DE AUTO-CONEXIÓN DE WHATSAPP
 * Conecta automáticamente WhatsApp al iniciar el servidor
 * sin necesidad de interacción con el dashboard
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppAutoConnect = void 0;
const db_1 = require("./db");
const baileys_stable_service_1 = require("./baileys-stable-service");
class WhatsAppAutoConnect {
    /**
     * Inicializar auto-conexión al arrancar el servidor
     */
    static async initialize() {
        if (this.isInitialized) {
            console.log('[Auto-Connect] ⚠️ Ya está inicializado');
            return;
        }
        console.log('[Auto-Connect] 🚀 Inicializando sistema de auto-conexión...');
        try {
            // Esperar 5 segundos para que el servidor esté completamente listo
            await new Promise(resolve => setTimeout(resolve, 5000));
            // Intentar conectar automáticamente
            await this.autoConnectAllUsers();
            // Configurar verificación periódica
            this.startPeriodicCheck();
            this.isInitialized = true;
            console.log('[Auto-Connect] ✅ Sistema de auto-conexión inicializado');
        }
        catch (error) {
            console.error('[Auto-Connect] ❌ Error inicializando:', error);
        }
    }
    /**
     * Conectar automáticamente todos los usuarios que tenían sesión activa
     */
    static async autoConnectAllUsers() {
        try {
            console.log('[Auto-Connect] 🔍 Buscando usuarios con sesiones previas...');
            // Buscar usuarios que tenían WhatsApp conectado
            const connections = await db_1.db.whatsAppConnection.findMany({
                where: {
                    OR: [
                        { status: 'CONNECTED' },
                        { isConnected: true },
                        { lastConnectedAt: { not: null } }
                    ]
                },
                include: {
                    user: true
                }
            });
            if (connections.length === 0) {
                console.log('[Auto-Connect] ℹ️ No hay usuarios con sesiones previas');
                return;
            }
            console.log(`[Auto-Connect] 📱 Encontrados ${connections.length} usuario(s) con sesión previa`);
            // Intentar reconectar cada usuario
            for (const connection of connections) {
                try {
                    console.log(`[Auto-Connect] 🔄 Reconectando usuario: ${connection.user.email}`);
                    const result = await baileys_stable_service_1.BaileysStableService.initializeConnection(connection.userId);
                    if (result.success) {
                        console.log(`[Auto-Connect] ✅ Usuario ${connection.user.email} reconectado`);
                    }
                    else {
                        console.log(`[Auto-Connect] ⚠️ Usuario ${connection.user.email} necesita escanear QR`);
                    }
                    // Pequeña pausa entre reconexiones
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
                catch (error) {
                    console.error(`[Auto-Connect] ❌ Error reconectando ${connection.user.email}:`, error);
                }
            }
            console.log('[Auto-Connect] ✅ Proceso de auto-conexión completado');
        }
        catch (error) {
            console.error('[Auto-Connect] ❌ Error en auto-conexión:', error);
        }
    }
    /**
     * Verificación periódica del estado de conexión
     */
    static startPeriodicCheck() {
        console.log(`[Auto-Connect] ⏰ Iniciando verificación periódica cada ${this.CHECK_INTERVAL / 1000}s`);
        this.reconnectInterval = setInterval(async () => {
            try {
                // Buscar conexiones que deberían estar activas pero no lo están
                const disconnected = await db_1.db.whatsAppConnection.findMany({
                    where: {
                        AND: [
                            { lastConnectedAt: { not: null } }, // Tenían conexión antes
                            { status: { not: 'CONNECTED' } }, // Pero ahora no están conectados
                            {
                                lastConnectedAt: {
                                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
                                }
                            }
                        ]
                    },
                    include: {
                        user: true
                    }
                });
                if (disconnected.length > 0) {
                    console.log(`[Auto-Connect] 🔄 Detectadas ${disconnected.length} conexión(es) caída(s)`);
                    for (const connection of disconnected) {
                        console.log(`[Auto-Connect] 🔄 Intentando reconectar: ${connection.user.email}`);
                        try {
                            await baileys_stable_service_1.BaileysStableService.initializeConnection(connection.userId);
                            await new Promise(resolve => setTimeout(resolve, 2000));
                        }
                        catch (error) {
                            console.error(`[Auto-Connect] ❌ Error reconectando:`, error);
                        }
                    }
                }
            }
            catch (error) {
                console.error('[Auto-Connect] ❌ Error en verificación periódica:', error);
            }
        }, this.CHECK_INTERVAL);
    }
    /**
     * Detener el sistema de auto-conexión
     */
    static stop() {
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
            console.log('[Auto-Connect] 🛑 Sistema de auto-conexión detenido');
        }
        this.isInitialized = false;
    }
    /**
     * Forzar reconexión de un usuario específico
     */
    static async forceReconnect(userId) {
        try {
            console.log(`[Auto-Connect] 🔄 Forzando reconexión para usuario: ${userId}`);
            const result = await baileys_stable_service_1.BaileysStableService.initializeConnection(userId);
            if (result.success) {
                console.log(`[Auto-Connect] ✅ Reconexión exitosa`);
                return true;
            }
            else {
                console.log(`[Auto-Connect] ⚠️ Reconexión requiere QR`);
                return false;
            }
        }
        catch (error) {
            console.error('[Auto-Connect] ❌ Error en reconexión forzada:', error);
            return false;
        }
    }
    /**
     * Obtener estado del sistema
     */
    static getStatus() {
        return {
            isInitialized: this.isInitialized,
            checkInterval: this.CHECK_INTERVAL,
            isRunning: this.reconnectInterval !== null
        };
    }
}
exports.WhatsAppAutoConnect = WhatsAppAutoConnect;
WhatsAppAutoConnect.isInitialized = false;
WhatsAppAutoConnect.reconnectInterval = null;
WhatsAppAutoConnect.CHECK_INTERVAL = 30000; // 30 segundos
