"use strict";
/**
 * 🔥 SERVICIO DE HOT RELOAD
 * Recarga automáticamente configuraciones y datos sin reiniciar el servidor
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotReloadService = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
class HotReloadService {
    /**
     * Inicializar sistema de hot reload
     */
    static initialize() {
        if (!this.isEnabled) {
            console.log('[Hot Reload] ⚠️ Hot reload deshabilitado');
            return;
        }
        console.log('[Hot Reload] 🔥 Inicializando sistema de hot reload...');
        // Vigilar cambios en productos
        this.watchProducts();
        // Vigilar cambios en configuración
        this.watchSettings();
        // Vigilar cambios en archivos de prompts
        this.watchPrompts();
        console.log('[Hot Reload] ✅ Sistema de hot reload activo');
    }
    /**
     * Vigilar cambios en productos de la base de datos
     */
    static watchProducts() {
        // Recargar productos cada 30 segundos si hay cambios
        setInterval(async () => {
            try {
                const products = await db_1.db.product.findMany({
                    where: { status: 'AVAILABLE' },
                    orderBy: { updatedAt: 'desc' },
                    take: 1
                });
                if (products.length > 0) {
                    const lastUpdate = products[0].updatedAt;
                    const cacheKey = 'last_product_update';
                    const cached = this.getCache(cacheKey);
                    if (!cached || cached !== lastUpdate.toISOString()) {
                        console.log('[Hot Reload] 🔄 Productos actualizados, recargando caché...');
                        this.setCache(cacheKey, lastUpdate.toISOString());
                        // Emitir evento de recarga
                        this.emit('products:updated');
                    }
                }
            }
            catch (error) {
                // Silencioso, no molestar con errores de polling
            }
        }, 30000); // Cada 30 segundos
    }
    /**
     * Vigilar cambios en configuración (usando productos como proxy)
     */
    static watchSettings() {
        // Por ahora, usar cambios en productos como indicador de configuración
        // En el futuro se puede agregar una tabla Settings si es necesario
        setInterval(async () => {
            try {
                // Verificar si hay cambios en la configuración del sistema
                // Por ahora solo emitimos el evento para mantener la estructura
                this.emit('settings:updated');
            }
            catch (error) {
                // Silencioso
            }
        }, 60000); // Cada 60 segundos (menos frecuente)
    }
    /**
     * Vigilar cambios en archivos de prompts
     */
    static watchPrompts() {
        const scriptsDir = path_1.default.join(process.cwd(), 'scripts');
        try {
            const watcher = (0, fs_1.watch)(scriptsDir, { recursive: false }, (eventType, filename) => {
                if (filename && filename.startsWith('agregar-prompt-')) {
                    console.log(`[Hot Reload] 🔄 Archivo de prompt modificado: ${filename}`);
                    this.emit('prompts:updated', filename);
                }
            });
            this.watchers.set('prompts', watcher);
        }
        catch (error) {
            console.log('[Hot Reload] ⚠️ No se pudo vigilar directorio de scripts');
        }
    }
    static getCache(key) {
        return this.cache.get(key);
    }
    static setCache(key, value) {
        this.cache.set(key, value);
    }
    static on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    static emit(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => {
            try {
                callback(data);
            }
            catch (error) {
                console.error(`[Hot Reload] Error en listener de ${event}:`, error);
            }
        });
    }
    /**
     * Detener todos los watchers
     */
    static stop() {
        console.log('[Hot Reload] 🛑 Deteniendo hot reload...');
        this.watchers.forEach(watcher => {
            try {
                watcher.close();
            }
            catch (error) {
                // Ignorar errores al cerrar
            }
        });
        this.watchers.clear();
    }
    /**
     * Forzar recarga de productos
     */
    static async reloadProducts() {
        console.log('[Hot Reload] 🔄 Forzando recarga de productos...');
        this.emit('products:updated');
    }
    /**
     * Forzar recarga de configuración
     */
    static async reloadSettings() {
        console.log('[Hot Reload] 🔄 Forzando recarga de configuración...');
        this.emit('settings:updated');
    }
}
exports.HotReloadService = HotReloadService;
HotReloadService.watchers = new Map();
HotReloadService.isEnabled = process.env.HOT_RELOAD_ENABLED !== 'false';
/**
 * Sistema simple de caché en memoria
 */
HotReloadService.cache = new Map();
/**
 * Sistema simple de eventos
 */
HotReloadService.listeners = new Map();
// Inicializar automáticamente si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
    HotReloadService.initialize();
}
