"use strict";
/**
 * 🔄 SAFE RECONNECT MANAGER
 * Maneja reconexiones de Baileys de forma segura para evitar bans
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeReconnectManager = void 0;
const anti_ban_middleware_1 = require("./anti-ban-middleware");
class SafeReconnectManager {
    /**
     * Verificar si se puede reconectar
     */
    static canReconnect(userId) {
        const state = this.getState(userId);
        const now = Date.now();
        // Resetear contador si pasó el período de reset
        if (now - state.lastDisconnectTime > this.RESET_PERIOD_MS) {
            state.disconnectCount = 0;
            state.reconnectAttempts = 0;
        }
        // Verificar si alcanzó el máximo de intentos
        if (state.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
            console.log(`⚠️ [SafeReconnect] Usuario ${userId} alcanzó máximo de intentos`);
            return false;
        }
        // Verificar si ya está reconectando
        if (state.isReconnecting) {
            console.log(`⚠️ [SafeReconnect] Usuario ${userId} ya está reconectando`);
            return false;
        }
        return true;
    }
    /**
     * Registrar desconexión
     */
    static recordDisconnect(userId) {
        const state = this.getState(userId);
        const now = Date.now();
        state.disconnectCount++;
        state.lastDisconnectTime = now;
        console.log(`📊 [SafeReconnect] Usuario ${userId} desconectado ${state.disconnectCount} veces`);
    }
    /**
     * Obtener delay de reconexión
     */
    static getReconnectDelay(userId) {
        const state = this.getState(userId);
        // Usar AntiBan para calcular delay con exponential backoff
        const delay = anti_ban_middleware_1.AntiBanMiddleware.getReconnectDelay(state.disconnectCount);
        console.log(`⏱️ [SafeReconnect] Esperando ${delay}ms antes de reconectar`);
        return delay;
    }
    /**
     * Iniciar reconexión
     */
    static async startReconnect(userId, reconnectFn) {
        try {
            if (!this.canReconnect(userId)) {
                return false;
            }
            const state = this.getState(userId);
            state.isReconnecting = true;
            state.reconnectAttempts++;
            // Esperar delay de reconexión
            const delay = this.getReconnectDelay(userId);
            await new Promise(resolve => setTimeout(resolve, delay));
            // Ejecutar reconexión
            console.log(`🔄 [SafeReconnect] Reconectando usuario ${userId}...`);
            await reconnectFn();
            // Marcar como exitoso
            state.isReconnecting = false;
            console.log(`✅ [SafeReconnect] Usuario ${userId} reconectado exitosamente`);
            return true;
        }
        catch (error) {
            const state = this.getState(userId);
            state.isReconnecting = false;
            console.error(`❌ [SafeReconnect] Error reconectando usuario ${userId}:`, error);
            return false;
        }
    }
    /**
     * Resetear estado de reconexión
     */
    static resetState(userId) {
        this.states.delete(userId);
        console.log(`🔄 [SafeReconnect] Estado reseteado para ${userId}`);
    }
    /**
     * Verificar si debe esperar antes de reconectar
     */
    static shouldWaitBeforeReconnect(userId) {
        const state = this.getState(userId);
        return anti_ban_middleware_1.AntiBanMiddleware.shouldWaitBeforeReconnect(userId, state.disconnectCount);
    }
    /**
     * Obtener estado de reconexión
     */
    static getReconnectState(userId) {
        const state = this.getState(userId);
        return {
            disconnectCount: state.disconnectCount,
            reconnectAttempts: state.reconnectAttempts,
            isReconnecting: state.isReconnecting,
            lastDisconnectTime: new Date(state.lastDisconnectTime).toISOString(),
            canReconnect: this.canReconnect(userId)
        };
    }
    /**
     * Obtener estado de usuario
     */
    static getState(userId) {
        if (!this.states.has(userId)) {
            this.states.set(userId, {
                userId,
                disconnectCount: 0,
                lastDisconnectTime: 0,
                isReconnecting: false,
                reconnectAttempts: 0
            });
        }
        return this.states.get(userId);
    }
    /**
     * Limpiar estados antiguos
     */
    static cleanup() {
        const now = Date.now();
        const CLEANUP_THRESHOLD = 3600000; // 1 hora
        for (const [userId, state] of this.states.entries()) {
            if (now - state.lastDisconnectTime > CLEANUP_THRESHOLD) {
                this.states.delete(userId);
            }
        }
    }
}
exports.SafeReconnectManager = SafeReconnectManager;
SafeReconnectManager.states = new Map();
SafeReconnectManager.MAX_RECONNECT_ATTEMPTS = 5;
SafeReconnectManager.RESET_PERIOD_MS = 300000; // 5 minutos
// Limpiar estados cada hora
setInterval(() => {
    SafeReconnectManager.cleanup();
}, 3600000);
