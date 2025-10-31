"use strict";
/**
 * 📬 SERVICIO DE COLA DE MENSAJES
 * Maneja mensajes pendientes cuando el bot se desconecta
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
exports.MessageQueueService = void 0;
var db_1 = require("./db");
var MessageQueueService = /** @class */ (function () {
    function MessageQueueService() {
    }
    /**
     * Agregar mensaje a la cola
     */
    MessageQueueService.enqueue = function (phoneNumber_1, message_1) {
        return __awaiter(this, arguments, void 0, function (phoneNumber, message, type, metadata) {
            var error_1;
            if (type === void 0) { type = 'text'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('[Queue] 📬 Agregando mensaje a la cola:', { phoneNumber: phoneNumber, type: type });
                        // Guardar en base de datos
                        return [4 /*yield*/, db_1.db.messageQueue.create({
                                data: {
                                    phoneNumber: phoneNumber,
                                    message: message,
                                    type: type,
                                    metadata: metadata ? JSON.stringify(metadata) : null,
                                    attempts: 0,
                                    status: 'PENDING'
                                }
                            })];
                    case 1:
                        // Guardar en base de datos
                        _a.sent();
                        console.log('[Queue] ✅ Mensaje agregado a la cola');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('[Queue] ❌ Error agregando mensaje a la cola:', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Procesar mensajes pendientes
     */
    MessageQueueService.processPendingMessages = function (sendFunction) {
        return __awaiter(this, void 0, void 0, function () {
            var pendingMessages, _i, pendingMessages_1, msg, metadata, success, error_2, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.processingQueue) {
                            console.log('[Queue] ⏳ Ya hay un proceso de cola en ejecución');
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 17, 18, 19]);
                        this.processingQueue = true;
                        console.log('[Queue] 🔄 Procesando mensajes pendientes...');
                        return [4 /*yield*/, db_1.db.messageQueue.findMany({
                                where: {
                                    status: 'PENDING',
                                    attempts: { lt: 3 } // Máximo 3 intentos
                                },
                                orderBy: { createdAt: 'asc' },
                                take: 50
                            })];
                    case 2:
                        pendingMessages = _a.sent();
                        if (pendingMessages.length === 0) {
                            console.log('[Queue] ✅ No hay mensajes pendientes');
                            return [2 /*return*/];
                        }
                        console.log("[Queue] \uD83D\uDCE8 Procesando ".concat(pendingMessages.length, " mensajes pendientes..."));
                        _i = 0, pendingMessages_1 = pendingMessages;
                        _a.label = 3;
                    case 3:
                        if (!(_i < pendingMessages_1.length)) return [3 /*break*/, 16];
                        msg = pendingMessages_1[_i];
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 12, , 15]);
                        // Incrementar intentos
                        return [4 /*yield*/, db_1.db.messageQueue.update({
                                where: { id: msg.id },
                                data: { attempts: msg.attempts + 1 }
                            })
                            // Parsear metadata si existe
                        ];
                    case 5:
                        // Incrementar intentos
                        _a.sent();
                        metadata = msg.metadata ? JSON.parse(msg.metadata) : undefined;
                        return [4 /*yield*/, sendFunction(msg.phoneNumber, msg.message, metadata)];
                    case 6:
                        success = _a.sent();
                        if (!success) return [3 /*break*/, 8];
                        // Marcar como enviado
                        return [4 /*yield*/, db_1.db.messageQueue.update({
                                where: { id: msg.id },
                                data: {
                                    status: 'SENT',
                                    sentAt: new Date()
                                }
                            })];
                    case 7:
                        // Marcar como enviado
                        _a.sent();
                        console.log("[Queue] \u2705 Mensaje enviado: ".concat(msg.id));
                        return [3 /*break*/, 10];
                    case 8:
                        if (!(msg.attempts + 1 >= 3)) return [3 /*break*/, 10];
                        return [4 /*yield*/, db_1.db.messageQueue.update({
                                where: { id: msg.id },
                                data: { status: 'FAILED' }
                            })];
                    case 9:
                        _a.sent();
                        console.log("[Queue] \u274C Mensaje fallido despu\u00E9s de 3 intentos: ".concat(msg.id));
                        _a.label = 10;
                    case 10: 
                    // Pequeña pausa entre mensajes para no saturar
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 11:
                        // Pequeña pausa entre mensajes para no saturar
                        _a.sent();
                        return [3 /*break*/, 15];
                    case 12:
                        error_2 = _a.sent();
                        console.error("[Queue] \u274C Error procesando mensaje ".concat(msg.id, ":"), error_2);
                        if (!(msg.attempts + 1 >= 3)) return [3 /*break*/, 14];
                        return [4 /*yield*/, db_1.db.messageQueue.update({
                                where: { id: msg.id },
                                data: { status: 'FAILED' }
                            })];
                    case 13:
                        _a.sent();
                        _a.label = 14;
                    case 14: return [3 /*break*/, 15];
                    case 15:
                        _i++;
                        return [3 /*break*/, 3];
                    case 16:
                        console.log('[Queue] ✅ Procesamiento de cola completado');
                        return [3 /*break*/, 19];
                    case 17:
                        error_3 = _a.sent();
                        console.error('[Queue] ❌ Error procesando cola:', error_3);
                        return [3 /*break*/, 19];
                    case 18:
                        this.processingQueue = false;
                        return [7 /*endfinally*/];
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Limpiar mensajes antiguos (más de 7 días)
     */
    MessageQueueService.cleanOldMessages = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sevenDaysAgo, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        sevenDaysAgo = new Date();
                        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                        return [4 /*yield*/, db_1.db.messageQueue.deleteMany({
                                where: {
                                    OR: [
                                        { status: 'SENT', sentAt: { lt: sevenDaysAgo } },
                                        { status: 'FAILED', createdAt: { lt: sevenDaysAgo } }
                                    ]
                                }
                            })];
                    case 1:
                        result = _a.sent();
                        console.log("[Queue] \uD83E\uDDF9 Limpiados ".concat(result.count, " mensajes antiguos"));
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error('[Queue] ❌ Error limpiando mensajes antiguos:', error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Obtener estadísticas de la cola
     */
    MessageQueueService.getQueueStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, pending, sent, failed, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                db_1.db.messageQueue.count({ where: { status: 'PENDING' } }),
                                db_1.db.messageQueue.count({ where: { status: 'SENT' } }),
                                db_1.db.messageQueue.count({ where: { status: 'FAILED' } })
                            ])];
                    case 1:
                        _a = _b.sent(), pending = _a[0], sent = _a[1], failed = _a[2];
                        return [2 /*return*/, { pending: pending, sent: sent, failed: failed }];
                    case 2:
                        error_5 = _b.sent();
                        console.error('[Queue] ❌ Error obteniendo estadísticas:', error_5);
                        return [2 /*return*/, { pending: 0, sent: 0, failed: 0 }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MessageQueueService.processingQueue = false;
    return MessageQueueService;
}());
exports.MessageQueueService = MessageQueueService;
