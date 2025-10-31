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
exports.BaileysService = void 0;
var baileys_1 = __importStar(require("@whiskeysockets/baileys"));
var qrcode_1 = __importDefault(require("qrcode"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var db_1 = require("./db");
var hot_reload_service_1 = require("./hot-reload-service");
var connection_monitor_1 = require("./connection-monitor");
var message_queue_service_1 = require("./message-queue-service");
var BaileysService = /** @class */ (function () {
    function BaileysService() {
    }
    /**
     * Recargar productos desde la base de datos
     */
    BaileysService.reloadProducts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _b, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _b = this;
                        return [4 /*yield*/, db_1.db.product.findMany({
                                where: { status: 'AVAILABLE' },
                                orderBy: { name: 'asc' }
                            })];
                    case 1:
                        _b.productsCache = _c.sent();
                        this.lastProductsUpdate = new Date();
                        console.log("[Baileys] \u2705 ".concat(this.productsCache.length, " productos recargados"));
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _c.sent();
                        console.error('[Baileys] ❌ Error recargando productos:', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Recargar configuración desde variables de entorno
     */
    BaileysService.reloadSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                try {
                    // Recargar configuración desde .env o variables de entorno
                    this.settingsCache = {
                        botName: process.env.BOT_NAME || 'Smart Sales Bot',
                        botPhone: process.env.BOT_PHONE || '',
                        businessAddress: process.env.BUSINESS_ADDRESS || '',
                        aiEnabled: process.env.AI_ENABLED !== 'false',
                        photosEnabled: process.env.PHOTOS_ENABLED !== 'false',
                        audioEnabled: process.env.AUDIO_ENABLED !== 'false'
                    };
                    this.lastSettingsUpdate = new Date();
                    console.log('[Baileys] ✅ Configuración recargada');
                }
                catch (error) {
                    console.error('[Baileys] ❌ Error recargando configuración:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Obtener productos (con caché)
     */
    BaileysService.getProducts = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.productsCache.length === 0 || !this.lastProductsUpdate)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.reloadProducts()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, this.productsCache];
                }
            });
        });
    };
    /**
     * Obtener configuración (con caché)
     */
    BaileysService.getSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(!this.settingsCache || !this.lastSettingsUpdate)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.reloadSettings()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, this.settingsCache];
                }
            });
        });
    };
    // Inicializar conexión de WhatsApp con Baileys
    BaileysService.initializeConnection = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var authDir, _b, state, saveCreds_1, logger_1, socket_1, session_1, error_2;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 5]);
                        console.log("[Baileys] Inicializando conexi\u00F3n para usuario: ".concat(userId));
                        authDir = path_1.default.join(process.cwd(), 'auth_sessions', userId);
                        if (!fs_1.default.existsSync(authDir)) {
                            fs_1.default.mkdirSync(authDir, { recursive: true });
                        }
                        return [4 /*yield*/, (0, baileys_1.useMultiFileAuthState)(authDir)
                            // Crear logger silencioso para Baileys
                        ];
                    case 1:
                        _b = _c.sent(), state = _b.state, saveCreds_1 = _b.saveCreds;
                        logger_1 = {
                            level: 'silent',
                            fatal: function () { },
                            error: function () { },
                            warn: function () { },
                            info: function () { },
                            debug: function () { },
                            trace: function () { },
                            child: function () { return logger_1; }
                        };
                        socket_1 = (0, baileys_1.default)({
                            auth: state,
                            browser: ['WhatsApp Bot', 'Chrome', '1.0.0'],
                            logger: logger_1,
                            printQRInTerminal: false // No imprimir QR en terminal
                        });
                        session_1 = {
                            socket: socket_1,
                            qr: null,
                            status: 'CONNECTING',
                            userId: userId,
                            isReady: false,
                            isSyncing: false
                        };
                        this.sessions.set(userId, session_1);
                        // Actualizar estado en DB
                        return [4 /*yield*/, this.updateConnectionStatus(userId, 'CONNECTING')];
                    case 2:
                        // Actualizar estado en DB
                        _c.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var qrResolved = false;
                                // Manejar código QR
                                socket_1.ev.on('connection.update', function (update) { return __awaiter(_this, void 0, void 0, function () {
                                    var connection, lastDisconnect, qr, qrTerminal, qrDataURL, callback, error_3, phoneNumber, statusCode, shouldReconnect, isConflict;
                                    var _this = this;
                                    var _b, _c, _d, _e, _f, _g, _h;
                                    return __generator(this, function (_j) {
                                        switch (_j.label) {
                                            case 0:
                                                connection = update.connection, lastDisconnect = update.lastDisconnect, qr = update.qr;
                                                if (!(qr && !qrResolved)) return [3 /*break*/, 6];
                                                console.log("[Baileys] \u2705 QR generado para usuario: ".concat(userId));
                                                _j.label = 1;
                                            case 1:
                                                _j.trys.push([1, 5, , 6]);
                                                return [4 /*yield*/, qrcode_1.default.toString(qr, { type: 'terminal', small: true })];
                                            case 2:
                                                qrTerminal = _j.sent();
                                                console.log('\n📱 ESCANEA ESTE QR CON WHATSAPP:\n');
                                                console.log(qrTerminal);
                                                console.log('\n');
                                                return [4 /*yield*/, qrcode_1.default.toDataURL(qr, {
                                                        width: 300,
                                                        margin: 2,
                                                        color: {
                                                            dark: '#25D366',
                                                            light: '#FFFFFF'
                                                        }
                                                    })];
                                            case 3:
                                                qrDataURL = _j.sent();
                                                session_1.qr = qrDataURL;
                                                session_1.status = 'QR_PENDING';
                                                console.log("[Baileys] \u2705 QR guardado en sesi\u00F3n y DB para usuario: ".concat(userId));
                                                // Actualizar en DB inmediatamente
                                                return [4 /*yield*/, db_1.db.whatsAppConnection.upsert({
                                                        where: { userId: userId },
                                                        create: {
                                                            userId: userId,
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
                                                    })];
                                            case 4:
                                                // Actualizar en DB inmediatamente
                                                _j.sent();
                                                console.log("[Baileys] QR guardado en DB exitosamente");
                                                callback = this.qrCallbacks.get(userId);
                                                if (callback) {
                                                    callback(qrDataURL);
                                                }
                                                // Resolver la promesa con el QR
                                                qrResolved = true;
                                                resolve({ success: true, qr: qrDataURL });
                                                return [3 /*break*/, 6];
                                            case 5:
                                                error_3 = _j.sent();
                                                console.error('[Baileys] Error generando QR:', error_3);
                                                if (!qrResolved) {
                                                    qrResolved = true;
                                                    resolve({ success: false, error: 'Error generando QR' });
                                                }
                                                return [3 /*break*/, 6];
                                            case 6:
                                                if (!(connection === 'open')) return [3 /*break*/, 8];
                                                console.log("[Baileys] \u2705 Conexi\u00F3n establecida para usuario: ".concat(userId));
                                                session_1.status = 'CONNECTED';
                                                session_1.qr = null;
                                                session_1.isSyncing = true; // Inicialmente sincronizando
                                                // Esperar a que termine la sincronización inicial (20 segundos máximo)
                                                console.log('[Baileys] ⏳ Esperando sincronización inicial...');
                                                setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                                    return __generator(this, function (_b) {
                                                        switch (_b.label) {
                                                            case 0:
                                                                session_1.isReady = true;
                                                                session_1.isSyncing = false;
                                                                console.log('[Baileys] ✅ Bot listo para enviar mensajes');
                                                                // 📬 PROCESAR MENSAJES PENDIENTES DE LA COLA
                                                                console.log('[Baileys] 📬 Verificando mensajes pendientes en la cola...');
                                                                return [4 /*yield*/, this.processPendingQueue(userId)];
                                                            case 1:
                                                                _b.sent();
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                }); }, 25000); // 25 segundos para estar seguros
                                                phoneNumber = ((_b = socket_1.user) === null || _b === void 0 ? void 0 : _b.id.split(':')[0]) || 'unknown';
                                                return [4 /*yield*/, db_1.db.whatsAppConnection.upsert({
                                                        where: { userId: userId },
                                                        create: {
                                                            userId: userId,
                                                            phoneNumber: phoneNumber,
                                                            status: 'CONNECTED',
                                                            isConnected: true,
                                                            lastConnectedAt: new Date(),
                                                            qrCode: null,
                                                            qrExpiresAt: null
                                                        },
                                                        update: {
                                                            phoneNumber: phoneNumber,
                                                            status: 'CONNECTED',
                                                            isConnected: true,
                                                            lastConnectedAt: new Date(),
                                                            qrCode: null,
                                                            qrExpiresAt: null,
                                                            connectionAttempts: 0,
                                                            lastError: null
                                                        }
                                                    })
                                                    // Configurar manejadores de mensajes
                                                ];
                                            case 7:
                                                _j.sent();
                                                // Configurar manejadores de mensajes
                                                this.setupMessageHandlers(socket_1, userId);
                                                // Iniciar monitoreo de conexión
                                                connection_monitor_1.ConnectionMonitor.startMonitoring(userId);
                                                _j.label = 8;
                                            case 8:
                                                if (!(connection === 'close')) return [3 /*break*/, 13];
                                                statusCode = (_d = (_c = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _c === void 0 ? void 0 : _c.output) === null || _d === void 0 ? void 0 : _d.statusCode;
                                                shouldReconnect = statusCode !== baileys_1.DisconnectReason.loggedOut;
                                                isConflict = ((_f = (_e = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _e === void 0 ? void 0 : _e.message) === null || _f === void 0 ? void 0 : _f.includes('conflict')) ||
                                                    ((_h = (_g = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _g === void 0 ? void 0 : _g.message) === null || _h === void 0 ? void 0 : _h.includes('replaced'));
                                                if (!isConflict) return [3 /*break*/, 10];
                                                console.log("[Baileys] \u26A0\uFE0F Conflicto detectado: otra sesi\u00F3n est\u00E1 activa");
                                                console.log("[Baileys] No se reconectar\u00E1 autom\u00E1ticamente para evitar conflictos");
                                                session_1.status = 'DISCONNECTED';
                                                return [4 /*yield*/, this.updateConnectionStatus(userId, 'DISCONNECTED', 'Otra sesión activa detectada')];
                                            case 9:
                                                _j.sent();
                                                this.sessions.delete(userId);
                                                return [2 /*return*/];
                                            case 10:
                                                console.log("[Baileys] Conexi\u00F3n cerrada. Reconectar: ".concat(shouldReconnect));
                                                if (!shouldReconnect) return [3 /*break*/, 11];
                                                // Intentar reconectar solo si no hay otra sesión activa
                                                setTimeout(function () {
                                                    _this.initializeConnection(userId);
                                                }, 3000);
                                                return [3 /*break*/, 13];
                                            case 11:
                                                // Logout completo
                                                session_1.status = 'DISCONNECTED';
                                                return [4 /*yield*/, this.updateConnectionStatus(userId, 'DISCONNECTED')];
                                            case 12:
                                                _j.sent();
                                                this.sessions.delete(userId);
                                                _j.label = 13;
                                            case 13: return [2 /*return*/];
                                        }
                                    });
                                }); });
                                // Guardar credenciales cuando cambien
                                socket_1.ev.on('creds.update', saveCreds_1);
                                // Timeout si no se genera QR en 15 segundos
                                setTimeout(function () {
                                    if (!qrResolved) {
                                        console.log("[Baileys] Timeout esperando QR para usuario: ".concat(userId));
                                        qrResolved = true;
                                        resolve({ success: false, error: 'Timeout esperando QR. Intenta de nuevo.' });
                                    }
                                }, 15000);
                            })];
                    case 3:
                        error_2 = _c.sent();
                        console.error('[Baileys] Error inicializando conexión:', error_2);
                        return [4 /*yield*/, this.updateConnectionStatus(userId, 'DISCONNECTED', error_2 instanceof Error ? error_2.message : 'Error desconocido')];
                    case 4:
                        _c.sent();
                        return [2 /*return*/, { success: false, error: error_2 instanceof Error ? error_2.message : 'Error desconocido' }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Helper para enviar mensajes de forma segura
    BaileysService.safeSendMessage = function (socket, userId, to, content) {
        return __awaiter(this, void 0, void 0, function () {
            var session, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        session = this.sessions.get(userId);
                        if (!session) {
                            console.log('[Baileys] ⚠️ No hay sesión para enviar mensaje');
                            return [2 /*return*/, false];
                        }
                        if (!(session.isSyncing || !session.isReady)) return [3 /*break*/, 2];
                        console.log('[Baileys] ⏳ Esperando sincronización antes de enviar...');
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 3000); })
                            // Si sigue sincronizando después de esperar, intentar de todos modos
                        ];
                    case 1:
                        _b.sent();
                        // Si sigue sincronizando después de esperar, intentar de todos modos
                        if (session.isSyncing || !session.isReady) {
                            console.log('[Baileys] ⚠️ Aún sincronizando, pero enviando mensaje...');
                        }
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, socket.sendMessage(to, content)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 4:
                        error_4 = _b.sent();
                        console.error('[Baileys] ❌ Error en safeSendMessage:', error_4);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Configurar manejadores de mensajes entrantes
    BaileysService.setupMessageHandlers = function (socket, userId) {
        var _this = this;
        socket.ev.on('messages.upsert', function (_b) { return __awaiter(_this, [_b], void 0, function (_c) {
            var _i, messages_1, msg, from, messageText, MediaService, audioBuffer, transcription, error_5, caption, caption, conversation, error_6;
            var _d, _e, _f, _g, _h, _j;
            var messages = _c.messages, type = _c.type;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        if (type !== 'notify')
                            return [2 /*return*/];
                        _i = 0, messages_1 = messages;
                        _k.label = 1;
                    case 1:
                        if (!(_i < messages_1.length)) return [3 /*break*/, 14];
                        msg = messages_1[_i];
                        // Ignorar mensajes propios
                        if (msg.key.fromMe)
                            return [3 /*break*/, 13];
                        _k.label = 2;
                    case 2:
                        _k.trys.push([2, 12, , 13]);
                        from = msg.key.remoteJid;
                        if (!from)
                            return [3 /*break*/, 13];
                        messageText = ((_d = msg.message) === null || _d === void 0 ? void 0 : _d.conversation) ||
                            ((_f = (_e = msg.message) === null || _e === void 0 ? void 0 : _e.extendedTextMessage) === null || _f === void 0 ? void 0 : _f.text) ||
                            '';
                        if (!((_g = msg.message) === null || _g === void 0 ? void 0 : _g.audioMessage)) return [3 /*break*/, 9];
                        console.log("[Baileys] \uD83C\uDFA4 Audio recibido de ".concat(from));
                        _k.label = 3;
                    case 3:
                        _k.trys.push([3, 8, , 9]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('./media-service')); })];
                    case 4:
                        MediaService = (_k.sent()).MediaService;
                        return [4 /*yield*/, this.downloadMedia(msg, userId)];
                    case 5:
                        audioBuffer = _k.sent();
                        if (!audioBuffer) return [3 /*break*/, 7];
                        return [4 /*yield*/, MediaService.transcribeAudio(audioBuffer, msg.message.audioMessage.mimetype || 'audio/ogg')];
                    case 6:
                        transcription = _k.sent();
                        messageText = transcription;
                        console.log("[Baileys] \u2705 Audio transcrito: \"".concat(transcription, "\""));
                        _k.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_5 = _k.sent();
                        console.error('[Baileys] ❌ Error transcribiendo audio:', error_5);
                        messageText = '[Audio recibido - Error en transcripción]';
                        return [3 /*break*/, 9];
                    case 9:
                        // 3. Procesar imagen
                        if ((_h = msg.message) === null || _h === void 0 ? void 0 : _h.imageMessage) {
                            console.log("[Baileys] \uD83D\uDCF8 Imagen recibida de ".concat(from));
                            caption = msg.message.imageMessage.caption || '';
                            messageText = caption || 'Me envías fotos para verlo';
                        }
                        // 4. Procesar video
                        if ((_j = msg.message) === null || _j === void 0 ? void 0 : _j.videoMessage) {
                            console.log("[Baileys] \uD83C\uDFA5 Video recibido de ".concat(from));
                            caption = msg.message.videoMessage.caption || '';
                            messageText = caption || '[Video recibido]';
                        }
                        if (!messageText)
                            return [3 /*break*/, 13];
                        console.log("[Baileys] \uD83D\uDCE8 Mensaje procesado de ".concat(from, ": ").concat(messageText));
                        return [4 /*yield*/, this.saveIncomingMessage(userId, from, messageText)
                            // Respuesta automática con IA
                        ];
                    case 10:
                        conversation = _k.sent();
                        // Respuesta automática con IA
                        return [4 /*yield*/, this.handleAutoResponse(socket, userId, from, messageText, conversation.id, msg)];
                    case 11:
                        // Respuesta automática con IA
                        _k.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        error_6 = _k.sent();
                        console.error('[Baileys] Error procesando mensaje:', error_6);
                        return [3 /*break*/, 13];
                    case 13:
                        _i++;
                        return [3 /*break*/, 1];
                    case 14: return [2 /*return*/];
                }
            });
        }); });
    };
    // Manejar respuesta automática con IA INTELIGENTE + DEMORA HUMANA
    BaileysService.handleAutoResponse = function (socket, userId, from, messageText, conversationId, originalMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var IntelligentResponseService, AIService, error_7, history_1, intelligentResponse, error_8, shouldSendPhotos, ProductIntelligenceService, product, images, i, imageUrl, MediaService, imageMessage, error_9, error_10, error_11, isConnectionError, session, sendError_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 32, , 38]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('./intelligent-response-service')); })];
                    case 1:
                        IntelligentResponseService = (_b.sent()).IntelligentResponseService;
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('./ai-service')); })];
                    case 2:
                        AIService = (_b.sent()).AIService;
                        // Verificar si debe responder automáticamente
                        if (!AIService.shouldAutoRespond(messageText)) {
                            console.log("[Baileys] \u23ED\uFE0F Mensaje ignorado (muy corto o comando)");
                            return [2 /*return*/];
                        }
                        console.log("[Baileys] \uD83E\uDDE0 Generando respuesta INTELIGENTE con demora humana...");
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, socket.sendPresenceUpdate('composing', from)];
                    case 4:
                        _b.sent();
                        console.log("[Baileys] \u270D\uFE0F Estado \"escribiendo...\" activado");
                        return [3 /*break*/, 6];
                    case 5:
                        error_7 = _b.sent();
                        console.log("[Baileys] \u26A0\uFE0F No se pudo activar \"escribiendo...\"");
                        return [3 /*break*/, 6];
                    case 6: return [4 /*yield*/, AIService.getConversationHistory(conversationId)
                        // 3. Generar respuesta con sistema inteligente (incluye demora automática)
                    ];
                    case 7:
                        history_1 = _b.sent();
                        return [4 /*yield*/, IntelligentResponseService.generateResponseWithHumanTouch(userId, messageText, from, history_1)];
                    case 8:
                        intelligentResponse = _b.sent();
                        console.log("[Baileys] \u2705 Respuesta generada:", {
                            complexity: intelligentResponse.complexity,
                            usedAdvancedAI: intelligentResponse.usedAdvancedAI,
                            responseTime: "".concat(intelligentResponse.responseTime, "ms"),
                            preview: intelligentResponse.message.substring(0, 50) + '...'
                        });
                        _b.label = 9;
                    case 9:
                        _b.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, socket.sendPresenceUpdate('paused', from)];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        error_8 = _b.sent();
                        return [3 /*break*/, 12];
                    case 12:
                        shouldSendPhotos = /foto|imagen|picture|ver|muestra|enseña/i.test(messageText);
                        if (!shouldSendPhotos) return [3 /*break*/, 28];
                        console.log("[Baileys] \uD83D\uDCF8 Cliente solicita fotos, buscando producto...");
                        _b.label = 13;
                    case 13:
                        _b.trys.push([13, 27, , 28]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('./product-intelligence-service')); })];
                    case 14:
                        ProductIntelligenceService = (_b.sent()).ProductIntelligenceService;
                        return [4 /*yield*/, ProductIntelligenceService.findProduct(messageText, userId)];
                    case 15:
                        product = _b.sent();
                        if (!(product && product.images)) return [3 /*break*/, 26];
                        images = JSON.parse(product.images);
                        if (!(images.length > 0)) return [3 /*break*/, 26];
                        console.log("[Baileys] \uD83D\uDCF8 Enviando ".concat(images.length, " foto(s) del producto..."));
                        // Enviar texto primero
                        return [4 /*yield*/, socket.sendMessage(from, { text: intelligentResponse.message })
                            // Enviar fotos (máximo 3)
                        ];
                    case 16:
                        // Enviar texto primero
                        _b.sent();
                        i = 0;
                        _b.label = 17;
                    case 17:
                        if (!(i < Math.min(images.length, 3))) return [3 /*break*/, 25];
                        imageUrl = images[i];
                        _b.label = 18;
                    case 18:
                        _b.trys.push([18, 23, , 24]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('./media-service')); })];
                    case 19:
                        MediaService = (_b.sent()).MediaService;
                        return [4 /*yield*/, MediaService.prepareImageMessage(imageUrl, i === 0 ? "\uD83D\uDCF8 ".concat(product.name, "\n\uD83D\uDCB0 $").concat(product.price.toLocaleString(), " COP") : undefined)];
                    case 20:
                        imageMessage = _b.sent();
                        return [4 /*yield*/, socket.sendMessage(from, imageMessage)];
                    case 21:
                        _b.sent();
                        console.log("[Baileys] \u2705 Foto ".concat(i + 1, " enviada"));
                        // Pequeña demora entre fotos
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 22:
                        // Pequeña demora entre fotos
                        _b.sent();
                        return [3 /*break*/, 24];
                    case 23:
                        error_9 = _b.sent();
                        console.error("[Baileys] \u274C Error enviando foto ".concat(i + 1, ":"), error_9);
                        return [3 /*break*/, 24];
                    case 24:
                        i++;
                        return [3 /*break*/, 17];
                    case 25:
                        console.log("[Baileys] \uD83D\uDCE4 Respuesta con fotos enviada a ".concat(from));
                        return [2 /*return*/]; // Salir, ya enviamos todo
                    case 26: return [3 /*break*/, 28];
                    case 27:
                        error_10 = _b.sent();
                        console.error('[Baileys] ❌ Error enviando fotos:', error_10);
                        return [3 /*break*/, 28];
                    case 28: 
                    // 6. Enviar respuesta de texto normal (sin fotos o si falló el envío de fotos)
                    return [4 /*yield*/, socket.sendMessage(from, { text: intelligentResponse.message })];
                    case 29:
                        // 6. Enviar respuesta de texto normal (sin fotos o si falló el envío de fotos)
                        _b.sent();
                        console.log("[Baileys] \uD83D\uDCE4 Respuesta enviada a ".concat(from));
                        // 6. Guardar respuesta en DB con metadata
                        return [4 /*yield*/, db_1.db.message.create({
                                data: {
                                    conversationId: conversationId,
                                    content: intelligentResponse.message,
                                    direction: 'OUTGOING',
                                    type: 'TEXT'
                                }
                            })
                            // 7. Actualizar timestamp de conversación
                        ];
                    case 30:
                        // 6. Guardar respuesta en DB con metadata
                        _b.sent();
                        // 7. Actualizar timestamp de conversación
                        return [4 /*yield*/, db_1.db.conversation.update({
                                where: { id: conversationId },
                                data: { lastMessageAt: new Date() }
                            })];
                    case 31:
                        // 7. Actualizar timestamp de conversación
                        _b.sent();
                        return [3 /*break*/, 38];
                    case 32:
                        error_11 = _b.sent();
                        console.error('[Baileys] ❌ Error en respuesta automática:', error_11);
                        isConnectionError = error_11 instanceof Error &&
                            (error_11.message.includes('Connection Closed') ||
                                error_11.message.includes('Connection Lost') ||
                                error_11.message.includes('Socket closed'));
                        if (!isConnectionError) return [3 /*break*/, 33];
                        console.log('[Baileys] 🔄 Conexión perdida, intentando reconectar...');
                        // Intentar reconectar
                        setTimeout(function () {
                            _this.initializeConnection(userId);
                        }, 2000);
                        return [3 /*break*/, 37];
                    case 33:
                        _b.trys.push([33, 36, , 37]);
                        session = this.sessions.get(userId);
                        if (!((session === null || session === void 0 ? void 0 : session.socket) && session.status === 'CONNECTED')) return [3 /*break*/, 35];
                        return [4 /*yield*/, socket.sendMessage(from, {
                                text: '👋 Hola ¡Bienvenido a Tecnovariedades D&S! 😄💻\n\nAquí encontrarás tecnología, soporte, cursos y herramientas digitales para potenciar tu día a día.\n\n📦 ¿Buscas algún producto, servicio o información en especial?'
                            })];
                    case 34:
                        _b.sent();
                        _b.label = 35;
                    case 35: return [3 /*break*/, 37];
                    case 36:
                        sendError_1 = _b.sent();
                        console.error('[Baileys] ❌ Error enviando mensaje de fallback:', sendError_1);
                        return [3 /*break*/, 37];
                    case 37: return [3 /*break*/, 38];
                    case 38: return [2 /*return*/];
                }
            });
        });
    };
    // Guardar mensaje entrante en DB
    BaileysService.saveIncomingMessage = function (userId, from, content) {
        return __awaiter(this, void 0, void 0, function () {
            var conversation, customerName, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, db_1.db.conversation.findFirst({
                                where: {
                                    userId: userId,
                                    customerPhone: from
                                }
                            })];
                    case 1:
                        conversation = _b.sent();
                        if (!!conversation) return [3 /*break*/, 3];
                        customerName = "Cliente ".concat(from.split('@')[0].slice(-4));
                        return [4 /*yield*/, db_1.db.conversation.create({
                                data: {
                                    userId: userId,
                                    customerPhone: from,
                                    customerName: customerName,
                                    status: 'ACTIVE'
                                }
                            })];
                    case 2:
                        conversation = _b.sent();
                        _b.label = 3;
                    case 3: 
                    // Crear mensaje
                    return [4 /*yield*/, db_1.db.message.create({
                            data: {
                                conversationId: conversation.id,
                                content: content,
                                direction: 'INCOMING',
                                type: 'TEXT'
                            }
                        })
                        // Actualizar timestamp de conversación
                    ];
                    case 4:
                        // Crear mensaje
                        _b.sent();
                        // Actualizar timestamp de conversación
                        return [4 /*yield*/, db_1.db.conversation.update({
                                where: { id: conversation.id },
                                data: { lastMessageAt: new Date() }
                            })];
                    case 5:
                        // Actualizar timestamp de conversación
                        _b.sent();
                        console.log("[Baileys] Mensaje guardado en DB");
                        return [2 /*return*/, conversation];
                    case 6:
                        error_12 = _b.sent();
                        console.error('[Baileys] Error guardando mensaje:', error_12);
                        throw error_12;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // Enviar mensaje con validación de conexión y reintentos
    BaileysService.sendMessage = function (userId_1, to_1, content_1) {
        return __awaiter(this, arguments, void 0, function (userId, to, content, retries) {
            var session, maxWait, startWait, jid, conversation, error_13, isConnectionError;
            if (retries === void 0) { retries = 3; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 15, , 18]);
                        session = this.sessions.get(userId);
                        if (!(!session || !session.socket || session.status !== 'CONNECTED')) return [3 /*break*/, 5];
                        console.error('[Baileys] No hay sesión activa para enviar mensaje');
                        // 📬 AGREGAR A LA COLA en lugar de fallar
                        console.log('[Baileys] 📬 Agregando mensaje a la cola para envío posterior');
                        return [4 /*yield*/, this.enqueueIfDisconnected(userId, to, content, 'text')
                            // Si no hay sesión, intentar reconectar
                        ];
                    case 1:
                        _b.sent();
                        if (!(retries > 0)) return [3 /*break*/, 4];
                        console.log("[Baileys] Intentando reconectar... (".concat(retries, " intentos restantes)"));
                        return [4 /*yield*/, this.initializeConnection(userId)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, this.sendMessage(userId, to, content, retries - 1)];
                    case 4: return [2 /*return*/, false];
                    case 5:
                        if (!(session.isSyncing || !session.isReady)) return [3 /*break*/, 9];
                        console.log('[Baileys] ⏳ Bot sincronizando, esperando...');
                        maxWait = 30000;
                        startWait = Date.now();
                        _b.label = 6;
                    case 6:
                        if (!((session.isSyncing || !session.isReady) && (Date.now() - startWait) < maxWait)) return [3 /*break*/, 8];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 7:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 8:
                        if (session.isSyncing || !session.isReady) {
                            console.log('[Baileys] ⚠️ Timeout esperando sincronización, enviando de todos modos...');
                        }
                        else {
                            console.log('[Baileys] ✅ Sincronización completada, enviando mensaje');
                        }
                        _b.label = 9;
                    case 9:
                        jid = to.includes('@') ? to : "".concat(to, "@s.whatsapp.net");
                        return [4 /*yield*/, session.socket.sendMessage(jid, { text: content })];
                    case 10:
                        _b.sent();
                        console.log("[Baileys] Mensaje enviado a ".concat(to));
                        return [4 /*yield*/, db_1.db.conversation.findFirst({
                                where: { userId: userId, customerPhone: jid }
                            })];
                    case 11:
                        conversation = _b.sent();
                        if (!conversation) return [3 /*break*/, 14];
                        return [4 /*yield*/, db_1.db.message.create({
                                data: {
                                    conversationId: conversation.id,
                                    content: content,
                                    direction: 'OUTGOING',
                                    type: 'TEXT'
                                }
                            })];
                    case 12:
                        _b.sent();
                        return [4 /*yield*/, db_1.db.conversation.update({
                                where: { id: conversation.id },
                                data: { lastMessageAt: new Date() }
                            })];
                    case 13:
                        _b.sent();
                        _b.label = 14;
                    case 14: return [2 /*return*/, true];
                    case 15:
                        error_13 = _b.sent();
                        console.error('[Baileys] Error enviando mensaje:', error_13);
                        isConnectionError = error_13 instanceof Error &&
                            (error_13.message.includes('Connection Closed') ||
                                error_13.message.includes('Connection Lost') ||
                                error_13.message.includes('Socket closed'));
                        if (!(isConnectionError && retries > 0)) return [3 /*break*/, 17];
                        console.log("[Baileys] \uD83D\uDD04 Reintentando env\u00EDo... (".concat(retries, " intentos restantes)"));
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 16:
                        _b.sent();
                        return [2 /*return*/, this.sendMessage(userId, to, content, retries - 1)];
                    case 17: return [2 /*return*/, false];
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    // Desconectar
    BaileysService.disconnect = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var session, authDir, error_14;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        session = this.sessions.get(userId);
                        if (!(session && session.socket)) return [3 /*break*/, 2];
                        return [4 /*yield*/, session.socket.logout()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        this.sessions.delete(userId);
                        return [4 /*yield*/, this.updateConnectionStatus(userId, 'DISCONNECTED')
                            // Detener monitoreo de conexión
                        ];
                    case 3:
                        _b.sent();
                        // Detener monitoreo de conexión
                        connection_monitor_1.ConnectionMonitor.stopMonitoring(userId);
                        authDir = path_1.default.join(process.cwd(), 'auth_sessions', userId);
                        if (fs_1.default.existsSync(authDir)) {
                            fs_1.default.rmSync(authDir, { recursive: true, force: true });
                        }
                        console.log("[Baileys] Usuario ".concat(userId, " desconectado"));
                        return [2 /*return*/, true];
                    case 4:
                        error_14 = _b.sent();
                        console.error('[Baileys] Error desconectando:', error_14);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Obtener estado de conexión
    BaileysService.getConnectionStatus = function (userId) {
        return this.sessions.get(userId) || null;
    };
    // Registrar callback para QR
    BaileysService.onQRCode = function (userId, callback) {
        this.qrCallbacks.set(userId, callback);
    };
    // Descargar media de un mensaje
    BaileysService.downloadMedia = function (message, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var session, logger_2, buffer, error_15;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        session = this.sessions.get(userId);
                        if (!(session === null || session === void 0 ? void 0 : session.socket)) {
                            throw new Error('Socket no disponible');
                        }
                        logger_2 = {
                            level: 'silent',
                            fatal: function () { },
                            error: function () { },
                            warn: function () { },
                            info: function () { },
                            debug: function () { },
                            trace: function () { },
                            child: function () { return logger_2; }
                        };
                        return [4 /*yield*/, (0, baileys_1.downloadMediaMessage)(message, 'buffer', {}, {
                                logger: logger_2,
                                reuploadRequest: session.socket.updateMediaMessage
                            })];
                    case 1:
                        buffer = _b.sent();
                        return [2 /*return*/, buffer];
                    case 2:
                        error_15 = _b.sent();
                        console.error('[Baileys] Error descargando media:', error_15);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Actualizar estado en DB
    BaileysService.updateConnectionStatus = function (userId, status, error) {
        return __awaiter(this, void 0, void 0, function () {
            var error_16;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_1.db.whatsAppConnection.upsert({
                                where: { userId: userId },
                                create: {
                                    userId: userId,
                                    phoneNumber: 'pending',
                                    status: status,
                                    isConnected: status === 'CONNECTED',
                                    lastError: error,
                                    lastErrorAt: error ? new Date() : null
                                },
                                update: {
                                    status: status,
                                    isConnected: status === 'CONNECTED',
                                    lastError: error,
                                    lastErrorAt: error ? new Date() : null
                                }
                            })];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_16 = _b.sent();
                        console.error('[Baileys] Error actualizando estado en DB:', error_16);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 📬 Procesar mensajes pendientes de la cola
     */
    BaileysService.processPendingQueue = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var session_2, sendFromQueue, error_17;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        session_2 = this.sessions.get(userId);
                        if (!session_2 || !session_2.socket || session_2.status !== 'CONNECTED') {
                            console.log('[Baileys] ⚠️ No se puede procesar cola: bot no conectado');
                            return [2 /*return*/];
                        }
                        sendFromQueue = function (phone, message, metadata) { return __awaiter(_this, void 0, void 0, function () {
                            var jid, MediaService, imageMsg, error_18;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 7, , 8]);
                                        jid = phone.includes('@') ? phone : "".concat(phone, "@s.whatsapp.net");
                                        if (!((metadata === null || metadata === void 0 ? void 0 : metadata.type) === 'image' && (metadata === null || metadata === void 0 ? void 0 : metadata.imageUrl))) return [3 /*break*/, 4];
                                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('./media-service')); })];
                                    case 1:
                                        MediaService = (_b.sent()).MediaService;
                                        return [4 /*yield*/, MediaService.prepareImageMessage(metadata.imageUrl, message)];
                                    case 2:
                                        imageMsg = _b.sent();
                                        return [4 /*yield*/, session_2.socket.sendMessage(jid, imageMsg)];
                                    case 3:
                                        _b.sent();
                                        return [3 /*break*/, 6];
                                    case 4: 
                                    // Enviar texto
                                    return [4 /*yield*/, session_2.socket.sendMessage(jid, { text: message })];
                                    case 5:
                                        // Enviar texto
                                        _b.sent();
                                        _b.label = 6;
                                    case 6:
                                        console.log("[Baileys] \u2705 Mensaje de cola enviado a ".concat(phone));
                                        return [2 /*return*/, true];
                                    case 7:
                                        error_18 = _b.sent();
                                        console.error("[Baileys] \u274C Error enviando mensaje de cola:", error_18);
                                        return [2 /*return*/, false];
                                    case 8: return [2 /*return*/];
                                }
                            });
                        }); };
                        // Procesar cola
                        return [4 /*yield*/, message_queue_service_1.MessageQueueService.processPendingMessages(sendFromQueue)
                            // Limpiar mensajes antiguos
                        ];
                    case 1:
                        // Procesar cola
                        _b.sent();
                        // Limpiar mensajes antiguos
                        return [4 /*yield*/, message_queue_service_1.MessageQueueService.cleanOldMessages()];
                    case 2:
                        // Limpiar mensajes antiguos
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_17 = _b.sent();
                        console.error('[Baileys] ❌ Error procesando cola:', error_17);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 📬 Agregar mensaje a la cola si el bot está desconectado
     */
    BaileysService.enqueueIfDisconnected = function (userId_1, phoneNumber_1, message_1) {
        return __awaiter(this, arguments, void 0, function (userId, phoneNumber, message, type, metadata) {
            var session;
            if (type === void 0) { type = 'text'; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        session = this.sessions.get(userId);
                        // Si está conectado y listo, no encolar
                        if (session && session.socket && session.status === 'CONNECTED' && session.isReady) {
                            return [2 /*return*/, false];
                        }
                        // Agregar a la cola
                        console.log('[Baileys] 📬 Bot desconectado, agregando mensaje a la cola');
                        return [4 /*yield*/, message_queue_service_1.MessageQueueService.enqueue(phoneNumber, message, type, metadata)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * 📊 Obtener estadísticas de la cola
     */
    BaileysService.getQueueStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, message_queue_service_1.MessageQueueService.getQueueStats()];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    var _a;
    _a = BaileysService;
    BaileysService.sessions = new Map();
    BaileysService.qrCallbacks = new Map();
    BaileysService.productsCache = [];
    BaileysService.settingsCache = null;
    BaileysService.lastProductsUpdate = null;
    BaileysService.lastSettingsUpdate = null;
    // Inicializar hot reload
    (function () {
        // Escuchar cambios en productos
        hot_reload_service_1.HotReloadService.on('products:updated', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(_a, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('[Baileys] 🔄 Recargando productos...');
                        return [4 /*yield*/, _a.reloadProducts()];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Escuchar cambios en configuración
        hot_reload_service_1.HotReloadService.on('settings:updated', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(_a, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('[Baileys] 🔄 Recargando configuración...');
                        return [4 /*yield*/, _a.reloadSettings()];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    })();
    return BaileysService;
}());
exports.BaileysService = BaileysService;
