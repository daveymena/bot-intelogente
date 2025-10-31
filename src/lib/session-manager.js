"use strict";
/**
 * 🔄 GESTOR DE SESIONES PERSISTENTES
 * Mantiene la conexión de WhatsApp activa en segundo plano
 * Reconecta automáticamente si se pierde la conexión
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManager = void 0;
var baileys_service_1 = require("./baileys-service");
var db_1 = require("./db");
var SessionManager = /** @class */ (function () {
    function SessionManager() {
    }
    /**
     * Inicializar el gestor de sesiones al arrancar el servidor
     */
    SessionManager.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var activeConnections, _i, activeConnections_1, connection, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isInitialized) {
                            console.log('[SessionManager] Ya está inicializado');
                            return [2 /*return*/];
                        }
                        console.log('[SessionManager] 🚀 Inicializando gestor de sesiones...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, db_1.db.whatsAppConnection.findMany({
                                where: {
                                    OR: [
                                        { status: 'CONNECTED' },
                                        { isConnected: true }
                                    ]
                                }
                            })];
                    case 2:
                        activeConnections = _a.sent();
                        console.log("[SessionManager] Encontradas ".concat(activeConnections.length, " conexiones activas"));
                        _i = 0, activeConnections_1 = activeConnections;
                        _a.label = 3;
                    case 3:
                        if (!(_i < activeConnections_1.length)) return [3 /*break*/, 6];
                        connection = activeConnections_1[_i];
                        return [4 /*yield*/, this.restoreSession(connection.userId)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        // Configurar verificación periódica cada 5 minutos
                        setInterval(function () {
                            _this.checkAllSessions();
                        }, 5 * 60 * 1000);
                        this.isInitialized = true;
                        console.log('[SessionManager] ✅ Gestor de sesiones inicializado');
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _a.sent();
                        console.error('[SessionManager] ❌ Error inicializando:', error_1);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Restaurar sesión de un usuario
     */
    SessionManager.restoreSession = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var existingSession, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        console.log("[SessionManager] \uD83D\uDD04 Restaurando sesi\u00F3n para usuario: ".concat(userId));
                        existingSession = baileys_service_1.BaileysService.getConnectionStatus(userId);
                        if (existingSession && existingSession.status === 'CONNECTED') {
                            console.log("[SessionManager] \u2705 Sesi\u00F3n ya activa para: ".concat(userId));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, baileys_service_1.BaileysService.initializeConnection(userId)];
                    case 1:
                        result = _a.sent();
                        if (!(result.success || result.qr)) return [3 /*break*/, 2];
                        console.log("[SessionManager] \u2705 Sesi\u00F3n restaurada para: ".concat(userId));
                        // Configurar reconexión automática si se desconecta
                        this.setupAutoReconnect(userId);
                        return [3 /*break*/, 4];
                    case 2:
                        console.log("[SessionManager] \u26A0\uFE0F No se pudo restaurar sesi\u00F3n para: ".concat(userId));
                        // Actualizar estado en DB
                        return [4 /*yield*/, db_1.db.whatsAppConnection.update({
                                where: { userId: userId },
                                data: {
                                    status: 'DISCONNECTED',
                                    isConnected: false
                                }
                            })];
                    case 3:
                        // Actualizar estado en DB
                        _a.sent();
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_2 = _a.sent();
                        console.error("[SessionManager] \u274C Error restaurando sesi\u00F3n para ".concat(userId, ":"), error_2);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Configurar reconexión automática
     */
    SessionManager.setupAutoReconnect = function (userId) {
        var _this = this;
        // Limpiar intervalo anterior si existe
        var existingInterval = this.reconnectIntervals.get(userId);
        if (existingInterval) {
            clearInterval(existingInterval);
        }
        // Verificar conexión cada 30 segundos (más frecuente)
        var interval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var session, connection, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        session = baileys_service_1.BaileysService.getConnectionStatus(userId);
                        if (!(!session || session.status !== 'CONNECTED')) return [3 /*break*/, 3];
                        console.log("[SessionManager] \u26A0\uFE0F Sesi\u00F3n no activa en memoria, verificando DB...");
                        return [4 /*yield*/, db_1.db.whatsAppConnection.findUnique({
                                where: { userId: userId }
                            })];
                    case 1:
                        connection = _a.sent();
                        if (!(connection && (connection.status === 'CONNECTED' || connection.isConnected))) return [3 /*break*/, 3];
                        console.log("[SessionManager] \uD83D\uDD04 Reconectando usuario: ".concat(userId));
                        return [4 /*yield*/, this.restoreSession(userId)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        console.error("[SessionManager] Error en auto-reconexi\u00F3n para ".concat(userId, ":"), error_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); }, 30 * 1000); // Cada 30 segundos
        this.reconnectIntervals.set(userId, interval);
        console.log("[SessionManager] \u23F0 Auto-reconexi\u00F3n configurada para: ".concat(userId, " (cada 30 seg)"));
    };
    /**
     * Verificar todas las sesiones activas
     */
    SessionManager.checkAllSessions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var connections, _i, connections_1, connection, session, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        console.log('[SessionManager] 🔍 Verificando todas las sesiones...');
                        return [4 /*yield*/, db_1.db.whatsAppConnection.findMany({
                                where: {
                                    OR: [
                                        { status: 'CONNECTED' },
                                        { isConnected: true }
                                    ]
                                }
                            })];
                    case 1:
                        connections = _a.sent();
                        _i = 0, connections_1 = connections;
                        _a.label = 2;
                    case 2:
                        if (!(_i < connections_1.length)) return [3 /*break*/, 5];
                        connection = connections_1[_i];
                        session = baileys_service_1.BaileysService.getConnectionStatus(connection.userId);
                        if (!(!session || session.status !== 'CONNECTED')) return [3 /*break*/, 4];
                        console.log("[SessionManager] \u26A0\uFE0F Sesi\u00F3n perdida para ".concat(connection.userId, ", reconectando..."));
                        return [4 /*yield*/, this.restoreSession(connection.userId)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        console.log('[SessionManager] ✅ Verificación completada');
                        return [3 /*break*/, 7];
                    case 6:
                        error_4 = _a.sent();
                        console.error('[SessionManager] Error verificando sesiones:', error_4);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Detener auto-reconexión para un usuario
     */
    SessionManager.stopAutoReconnect = function (userId) {
        var interval = this.reconnectIntervals.get(userId);
        if (interval) {
            clearInterval(interval);
            this.reconnectIntervals.delete(userId);
            console.log("[SessionManager] \u23F9\uFE0F Auto-reconexi\u00F3n detenida para: ".concat(userId));
        }
    };
    /**
     * Limpiar todos los intervalos
     */
    SessionManager.cleanup = function () {
        console.log('[SessionManager] 🧹 Limpiando intervalos...');
        for (var _i = 0, _a = this.reconnectIntervals.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], userId = _b[0], interval = _b[1];
            clearInterval(interval);
            console.log("[SessionManager] Intervalo limpiado para: ".concat(userId));
        }
        this.reconnectIntervals.clear();
        this.isInitialized = false;
    };
    SessionManager.reconnectIntervals = new Map();
    SessionManager.isInitialized = false;
    return SessionManager;
}());
exports.SessionManager = SessionManager;
// Inicializar automáticamente cuando se importa el módulo
if (typeof window === 'undefined') {
    // Solo en el servidor
    SessionManager.initialize().catch(console.error);
}
