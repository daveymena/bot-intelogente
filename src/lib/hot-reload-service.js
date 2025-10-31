"use strict";
/**
 * 🔥 SERVICIO DE HOT RELOAD
 * Recarga automáticamente configuraciones y datos sin reiniciar el servidor
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotReloadService = void 0;
var fs_1 = require("fs");
var path_1 = __importDefault(require("path"));
var db_1 = require("./db");
var HotReloadService = /** @class */ (function () {
    function HotReloadService() {
    }
    /**
     * Inicializar sistema de hot reload
     */
    HotReloadService.initialize = function () {
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
    };
    /**
     * Vigilar cambios en productos de la base de datos
     */
    HotReloadService.watchProducts = function () {
        var _this = this;
        // Recargar productos cada 30 segundos si hay cambios
        setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var products, lastUpdate, cacheKey, cached, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_1.db.product.findMany({
                                where: { status: 'AVAILABLE' },
                                orderBy: { updatedAt: 'desc' },
                                take: 1
                            })];
                    case 1:
                        products = _a.sent();
                        if (products.length > 0) {
                            lastUpdate = products[0].updatedAt;
                            cacheKey = 'last_product_update';
                            cached = this.getCache(cacheKey);
                            if (!cached || cached !== lastUpdate.toISOString()) {
                                console.log('[Hot Reload] 🔄 Productos actualizados, recargando caché...');
                                this.setCache(cacheKey, lastUpdate.toISOString());
                                // Emitir evento de recarga
                                this.emit('products:updated');
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); }, 30000); // Cada 30 segundos
    };
    /**
     * Vigilar cambios en configuración (usando productos como proxy)
     */
    HotReloadService.watchSettings = function () {
        var _this = this;
        // Por ahora, usar cambios en productos como indicador de configuración
        // En el futuro se puede agregar una tabla Settings si es necesario
        setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // Verificar si hay cambios en la configuración del sistema
                    // Por ahora solo emitimos el evento para mantener la estructura
                    this.emit('settings:updated');
                }
                catch (error) {
                    // Silencioso
                }
                return [2 /*return*/];
            });
        }); }, 60000); // Cada 60 segundos (menos frecuente)
    };
    /**
     * Vigilar cambios en archivos de prompts
     */
    HotReloadService.watchPrompts = function () {
        var _this = this;
        var scriptsDir = path_1.default.join(process.cwd(), 'scripts');
        try {
            var watcher = (0, fs_1.watch)(scriptsDir, { recursive: false }, function (eventType, filename) {
                if (filename && filename.startsWith('agregar-prompt-')) {
                    console.log("[Hot Reload] \uD83D\uDD04 Archivo de prompt modificado: ".concat(filename));
                    _this.emit('prompts:updated', filename);
                }
            });
            this.watchers.set('prompts', watcher);
        }
        catch (error) {
            console.log('[Hot Reload] ⚠️ No se pudo vigilar directorio de scripts');
        }
    };
    HotReloadService.getCache = function (key) {
        return this.cache.get(key);
    };
    HotReloadService.setCache = function (key, value) {
        this.cache.set(key, value);
    };
    HotReloadService.on = function (event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    };
    HotReloadService.emit = function (event, data) {
        var callbacks = this.listeners.get(event) || [];
        callbacks.forEach(function (callback) {
            try {
                callback(data);
            }
            catch (error) {
                console.error("[Hot Reload] Error en listener de ".concat(event, ":"), error);
            }
        });
    };
    /**
     * Detener todos los watchers
     */
    HotReloadService.stop = function () {
        console.log('[Hot Reload] 🛑 Deteniendo hot reload...');
        this.watchers.forEach(function (watcher) {
            try {
                watcher.close();
            }
            catch (error) {
                // Ignorar errores al cerrar
            }
        });
        this.watchers.clear();
    };
    /**
     * Forzar recarga de productos
     */
    HotReloadService.reloadProducts = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('[Hot Reload] 🔄 Forzando recarga de productos...');
                this.emit('products:updated');
                return [2 /*return*/];
            });
        });
    };
    /**
     * Forzar recarga de configuración
     */
    HotReloadService.reloadSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('[Hot Reload] 🔄 Forzando recarga de configuración...');
                this.emit('settings:updated');
                return [2 /*return*/];
            });
        });
    };
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
    return HotReloadService;
}());
exports.HotReloadService = HotReloadService;
// Inicializar automáticamente si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
    HotReloadService.initialize();
}
