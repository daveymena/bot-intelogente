"use strict";
/**
 * 🔍 MONITOR DE CONEXIÓN
 * Sistema que verifica y mantiene la conexión de WhatsApp activa
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionMonitor = void 0;
const whatsapp_web_service_1 = require("./whatsapp-web-service");
class ConnectionMonitor {
    /**
     * Iniciar monitoreo de conexión para un usuario
     */
    static startMonitoring(userId) {
        if (!this.isEnabled) {
            return;
        }
        // Detener monitoreo previo si existe
        this.stopMonitoring(userId);
        // Resetear contadores
        this.conflictDetected.set(userId, false);
        this.reconnectAttempts.set(userId, 0);
        console.log(`[Monitor] 🔍 Iniciando monitoreo de conexión para ${userId}`);
        // Verificar conexión cada 30 segundos
        const interval = setInterval(async () => {
            try {
                // Si se detectó conflicto, no intentar reconectar
                if (this.conflictDetected.get(userId)) {
                    console.log(`[Monitor] ⏸️ Monitoreo pausado por conflicto de sesión para ${userId}`);
                    return;
                }
                const status = whatsapp_web_service_1.WhatsAppWebService.getConnectionStatus(userId);
                if (!status || status.status !== 'CONNECTED') {
                    // Verificar intentos de reconexión
                    const attempts = this.reconnectAttempts.get(userId) || 0;
                    if (attempts >= this.MAX_RECONNECT_ATTEMPTS) {
                        console.log(`[Monitor] 🛑 Máximo de intentos alcanzado para ${userId}, deteniendo monitoreo`);
                        this.stopMonitoring(userId);
                        return;
                    }
                    console.log(`[Monitor] ⚠️ Conexión perdida para ${userId}, reconectando... (intento ${attempts + 1}/${this.MAX_RECONNECT_ATTEMPTS})`);
                    this.reconnectAttempts.set(userId, attempts + 1);
                    await whatsapp_web_service_1.WhatsAppWebService.initializeConnection(userId);
                }
                else {
                    // Conexión OK, resetear contador
                    this.reconnectAttempts.set(userId, 0);
                    console.log(`[Monitor] ✅ Conexión activa para ${userId}`);
                }
            }
            catch (error) {
                console.error(`[Monitor] ❌ Error verificando conexión:`, error);
            }
        }, 30000); // Cada 30 segundos
        this.intervals.set(userId, interval);
    }
    /**
     * Marcar que se detectó un conflicto de sesión
     */
    static markConflict(userId) {
        console.log(`[Monitor] ⚠️ Conflicto de sesión detectado para ${userId}`);
        this.conflictDetected.set(userId, true);
        this.stopMonitoring(userId);
    }
    /**
     * Limpiar marca de conflicto
     */
    static clearConflict(userId) {
        this.conflictDetected.set(userId, false);
        this.reconnectAttempts.set(userId, 0);
    }
    /**
     * Detener monitoreo de conexión
     */
    static stopMonitoring(userId) {
        const interval = this.intervals.get(userId);
        if (interval) {
            clearInterval(interval);
            this.intervals.delete(userId);
            console.log(`[Monitor] 🛑 Monitoreo detenido para ${userId}`);
        }
    }
    /**
     * Detener todos los monitoreos
     */
    static stopAll() {
        console.log('[Monitor] 🛑 Deteniendo todos los monitoreos...');
        this.intervals.forEach((interval, userId) => {
            clearInterval(interval);
            console.log(`[Monitor] 🛑 Monitoreo detenido para ${userId}`);
        });
        this.intervals.clear();
    }
    /**
     * Verificar estado de monitoreo
     */
    static isMonitoring(userId) {
        return this.intervals.has(userId);
    }
    /**
     * Obtener usuarios monitoreados
     */
    static getMonitoredUsers() {
        return Array.from(this.intervals.keys());
    }
}
exports.ConnectionMonitor = ConnectionMonitor;
ConnectionMonitor.intervals = new Map();
ConnectionMonitor.isEnabled = process.env.ENABLE_CONNECTION_MONITOR !== 'false';
ConnectionMonitor.conflictDetected = new Map();
ConnectionMonitor.reconnectAttempts = new Map();
ConnectionMonitor.MAX_RECONNECT_ATTEMPTS = 3;
// Limpiar al cerrar el proceso
process.on('SIGINT', () => {
    ConnectionMonitor.stopAll();
    process.exit(0);
});
process.on('SIGTERM', () => {
    ConnectionMonitor.stopAll();
    process.exit(0);
});
