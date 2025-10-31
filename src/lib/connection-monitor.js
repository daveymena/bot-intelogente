"use strict";
/**
 * 🔍 MONITOR DE CONEXIÓN
 * Sistema que verifica y mantiene la conexión de WhatsApp activa
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
exports.ConnectionMonitor = void 0;
var baileys_service_1 = require("./baileys-service");
var ConnectionMonitor = /** @class */ (function () {
    function ConnectionMonitor() {
    }
    /**
     * Iniciar monitoreo de conexión para un usuario
     */
    ConnectionMonitor.startMonitoring = function (userId) {
        var _this = this;
        if (!this.isEnabled) {
            return;
        }
        // Detener monitoreo previo si existe
        this.stopMonitoring(userId);
        console.log("[Monitor] \uD83D\uDD0D Iniciando monitoreo de conexi\u00F3n para ".concat(userId));
        // Verificar conexión cada 30 segundos
        var interval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var status_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, baileys_service_1.BaileysService.getConnectionStatus(userId)];
                    case 1:
                        status_1 = _a.sent();
                        if (!(!status_1 || status_1.status !== 'CONNECTED')) return [3 /*break*/, 3];
                        console.log("[Monitor] \u26A0\uFE0F Conexi\u00F3n perdida para ".concat(userId, ", reconectando..."));
                        return [4 /*yield*/, baileys_service_1.BaileysService.initializeConnection(userId)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        // Conexión OK, hacer ping silencioso
                        console.log("[Monitor] \u2705 Conexi\u00F3n activa para ".concat(userId));
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        console.error("[Monitor] \u274C Error verificando conexi\u00F3n:", error_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        }); }, 30000); // Cada 30 segundos
        this.intervals.set(userId, interval);
    };
    /**
     * Detener monitoreo de conexión
     */
    ConnectionMonitor.stopMonitoring = function (userId) {
        var interval = this.intervals.get(userId);
        if (interval) {
            clearInterval(interval);
            this.intervals.delete(userId);
            console.log("[Monitor] \uD83D\uDED1 Monitoreo detenido para ".concat(userId));
        }
    };
    /**
     * Detener todos los monitoreos
     */
    ConnectionMonitor.stopAll = function () {
        console.log('[Monitor] 🛑 Deteniendo todos los monitoreos...');
        this.intervals.forEach(function (interval, userId) {
            clearInterval(interval);
            console.log("[Monitor] \uD83D\uDED1 Monitoreo detenido para ".concat(userId));
        });
        this.intervals.clear();
    };
    /**
     * Verificar estado de monitoreo
     */
    ConnectionMonitor.isMonitoring = function (userId) {
        return this.intervals.has(userId);
    };
    /**
     * Obtener usuarios monitoreados
     */
    ConnectionMonitor.getMonitoredUsers = function () {
        return Array.from(this.intervals.keys());
    };
    ConnectionMonitor.intervals = new Map();
    ConnectionMonitor.isEnabled = process.env.ENABLE_CONNECTION_MONITOR !== 'false';
    return ConnectionMonitor;
}());
exports.ConnectionMonitor = ConnectionMonitor;
// Limpiar al cerrar el proceso
process.on('SIGINT', function () {
    ConnectionMonitor.stopAll();
    process.exit(0);
});
process.on('SIGTERM', function () {
    ConnectionMonitor.stopAll();
    process.exit(0);
});
