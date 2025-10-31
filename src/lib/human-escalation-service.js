"use strict";
/**
 * 👨‍💼 SERVICIO DE ESCALAMIENTO A HUMANO
 * Notifica al administrador cuando se necesita atención personalizada
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
exports.HumanEscalationService = void 0;
var baileys_service_1 = require("./baileys-service");
var db_1 = require("./db");
var HumanEscalationService = /** @class */ (function () {
    function HumanEscalationService() {
    }
    /**
     * Detectar si necesita escalamiento a humano
     */
    HumanEscalationService.needsHumanEscalation = function (message) {
        var lowerMessage = message.toLowerCase();
        // SERVICIOS TÉCNICOS
        if (/reparaci[oó]n|reparar|arreglar|arreglo|da[ñn]ado|no funciona|problema|falla|error/i.test(lowerMessage) &&
            /computador|pc|laptop|portatil|port[aá]til|equipo/i.test(lowerMessage)) {
            return {
                needs: true,
                reason: 'Servicio técnico de reparación',
                category: 'REPARACION'
            };
        }
        // MANTENIMIENTO
        if (/mantenimiento|limpieza|formatear|formateo|instalar|instalaci[oó]n/i.test(lowerMessage) &&
            /computador|pc|laptop|portatil|port[aá]til|equipo/i.test(lowerMessage)) {
            return {
                needs: true,
                reason: 'Servicio de mantenimiento',
                category: 'MANTENIMIENTO'
            };
        }
        // COTIZACIÓN PERSONALIZADA
        if (/cotizaci[oó]n|cotizar|presupuesto|cu[aá]nto cuesta|precio de/i.test(lowerMessage) &&
            /reparaci[oó]n|mantenimiento|servicio/i.test(lowerMessage)) {
            return {
                needs: true,
                reason: 'Cotización de servicio',
                category: 'COTIZACION'
            };
        }
        // ASESORÍA TÉCNICA
        if (/asesor[ií]a|recomendar|recomienda|qu[eé] me conviene|cu[aá]l es mejor/i.test(lowerMessage) &&
            /comprar|adquirir/i.test(lowerMessage)) {
            return {
                needs: true,
                reason: 'Asesoría técnica personalizada',
                category: 'ASESORIA'
            };
        }
        // AGENDAMIENTO DE CITAS
        // IMPORTANTE: NO confundir "ver foto" con "ver producto"
        if (/agendar|cita|agenda|reservar|visita/i.test(lowerMessage) ||
            (/\b(ver|ir a ver|quiero ver)\b/i.test(lowerMessage) &&
                /\b(moto|producto|local|tienda|negocio|laptop|computador)\b/i.test(lowerMessage) &&
                !/\b(foto|imagen|picture|pic)\b/i.test(lowerMessage))) {
            return {
                needs: true,
                reason: 'Solicitud de cita',
                category: 'CITA'
            };
        }
        return {
            needs: false,
            reason: '',
            category: ''
        };
    };
    /**
     * Recopilar información del cliente
     */
    HumanEscalationService.collectCustomerInfo = function (customerPhone, customerMessage, category) {
        return __awaiter(this, void 0, void 0, function () {
            var questions;
            return __generator(this, function (_a) {
                questions = [];
                if (category === 'REPARACION' || category === 'MANTENIMIENTO') {
                    questions.push('¿Qué marca y modelo es tu computador?');
                    questions.push('¿Qué problema presenta exactamente?');
                    questions.push('¿Cuándo comenzó el problema?');
                }
                else if (category === 'COTIZACION') {
                    questions.push('¿Qué servicio necesitas exactamente?');
                    questions.push('¿Es para computador de escritorio o portátil?');
                }
                else if (category === 'ASESORIA') {
                    questions.push('¿Para qué vas a usar el equipo principalmente?');
                    questions.push('¿Cuál es tu presupuesto aproximado?');
                }
                else if (category === 'CITA') {
                    questions.push('¿Qué producto o servicio quieres ver?');
                    questions.push('¿Qué día te gustaría venir?');
                    questions.push('¿En qué horario prefieres? (mañana/tarde)');
                }
                return [2 /*return*/, questions];
            });
        });
    };
    /**
     * Notificar al administrador
     */
    HumanEscalationService.notifyAdmin = function (userId, customerPhone, customerName, category, customerMessage, collectedInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var notification_1, sent, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        console.log("[Escalation] \uD83D\uDCE2 Notificando al admin sobre caso: ".concat(category));
                        notification_1 = "\uD83D\uDD14 *NUEVO CASO - ".concat(category, "*\n\n");
                        notification_1 += "\uD83D\uDC64 *Cliente:* ".concat(customerName, "\n");
                        notification_1 += "\uD83D\uDCF1 *Tel\u00E9fono:* ".concat(customerPhone, "\n");
                        notification_1 += "\uD83D\uDCDD *Mensaje:* ".concat(customerMessage, "\n");
                        if (collectedInfo && collectedInfo.length > 0) {
                            notification_1 += "\n\uD83D\uDCCB *Informaci\u00F3n recopilada:*\n";
                            collectedInfo.forEach(function (info, index) {
                                notification_1 += "".concat(index + 1, ". ").concat(info, "\n");
                            });
                        }
                        notification_1 += "\n\u23F0 *Hora:* ".concat(new Date().toLocaleString('es-ES'), "\n");
                        notification_1 += "\n\uD83D\uDCAC *Responde directamente al cliente:*\n";
                        notification_1 += "https://wa.me/".concat(customerPhone.replace(/[^0-9]/g, ''));
                        return [4 /*yield*/, baileys_service_1.BaileysService.sendMessage(userId, this.ADMIN_PHONE + '@s.whatsapp.net', notification_1)];
                    case 1:
                        sent = _a.sent();
                        if (!sent) return [3 /*break*/, 3];
                        console.log("[Escalation] \u2705 Notificaci\u00F3n enviada al admin");
                        // Guardar en DB
                        return [4 /*yield*/, this.saveEscalation(userId, customerPhone, category, customerMessage)];
                    case 2:
                        // Guardar en DB
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, sent];
                    case 4:
                        error_1 = _a.sent();
                        console.error('[Escalation] ❌ Error notificando al admin:', error_1);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Guardar escalamiento en DB
     */
    HumanEscalationService.saveEscalation = function (userId, customerPhone, category, message) {
        return __awaiter(this, void 0, void 0, function () {
            var conversation, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.db.conversation.findFirst({
                                where: {
                                    userId: userId,
                                    customerPhone: customerPhone
                                }
                            })];
                    case 1:
                        conversation = _a.sent();
                        if (!conversation) return [3 /*break*/, 3];
                        // Agregar nota en la conversación
                        return [4 /*yield*/, db_1.db.message.create({
                                data: {
                                    conversationId: conversation.id,
                                    content: "[ESCALADO A HUMANO - ".concat(category, "] ").concat(message),
                                    direction: 'INCOMING',
                                    type: 'TEXT'
                                }
                            })];
                    case 2:
                        // Agregar nota en la conversación
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        console.error('[Escalation] Error guardando escalamiento:', error_2);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generar respuesta de escalamiento
     */
    HumanEscalationService.generateEscalationResponse = function (category) {
        var responses = {
            REPARACION: "\u00A1Claro! S\u00ED ofrecemos servicio de reparaci\u00F3n de computadores. \uD83D\uDD27\n\nPara darte un diagn\u00F3stico preciso y cotizaci\u00F3n, necesito algunos datos:\n\n1\uFE0F\u20E3 \u00BFQu\u00E9 marca y modelo es tu computador?\n2\uFE0F\u20E3 \u00BFQu\u00E9 problema presenta exactamente?\n3\uFE0F\u20E3 \u00BFCu\u00E1ndo comenz\u00F3 el problema?\n\n\uD83D\uDCDE Tambi\u00E9n puedes llamarme directamente al:\n*313 617 4267*\n\nTe responder\u00E9 personalmente para ayudarte mejor. \uD83D\uDE0A",
            MANTENIMIENTO: "\u00A1Por supuesto! Ofrecemos servicio de mantenimiento de computadores. \uD83D\uDEE0\uFE0F\n\nPara darte informaci\u00F3n precisa, cu\u00E9ntame:\n\n1\uFE0F\u20E3 \u00BFQu\u00E9 marca y modelo es tu computador?\n2\uFE0F\u20E3 \u00BFQu\u00E9 tipo de mantenimiento necesitas? (limpieza, formateo, instalaci\u00F3n, etc.)\n3\uFE0F\u20E3 \u00BFEs port\u00E1til o de escritorio?\n\n\uD83D\uDCDE Cont\u00E1ctame directamente al:\n*313 617 4267*\n\nTe atender\u00E9 personalmente. \uD83D\uDE0A",
            COTIZACION: "\u00A1Con gusto! Te puedo dar una cotizaci\u00F3n personalizada. \uD83D\uDCB0\n\nPara darte un precio exacto, necesito saber:\n\n1\uFE0F\u20E3 \u00BFQu\u00E9 servicio necesitas exactamente?\n2\uFE0F\u20E3 \u00BFMarca y modelo del equipo?\n3\uFE0F\u20E3 \u00BFAlg\u00FAn detalle adicional?\n\n\uD83D\uDCDE Ll\u00E1mame o escr\u00EDbeme al:\n*313 617 4267*\n\nTe responder\u00E9 con la cotizaci\u00F3n precisa. \uD83D\uDE0A",
            ASESORIA: "\u00A1Perfecto! Te puedo asesorar para que elijas el mejor equipo. \uD83D\uDCBB\n\nPara recomendarte lo ideal, cu\u00E9ntame:\n\n1\uFE0F\u20E3 \u00BFPara qu\u00E9 lo vas a usar principalmente?\n2\uFE0F\u20E3 \u00BFCu\u00E1l es tu presupuesto aproximado?\n3\uFE0F\u20E3 \u00BFPrefieres port\u00E1til o de escritorio?\n\n\uD83D\uDCDE Cont\u00E1ctame al:\n*313 617 4267*\n\nTe ayudar\u00E9 a elegir lo mejor para ti. \uD83D\uDE0A",
            CITA: "\u00A1Claro! Con gusto agendamos una cita para que vengas. \uD83D\uDCC5\n\nPara coordinar mejor, cu\u00E9ntame:\n\n1\uFE0F\u20E3 \u00BFQu\u00E9 producto o servicio quieres ver?\n2\uFE0F\u20E3 \u00BFQu\u00E9 d\u00EDa te gustar\u00EDa venir?\n3\uFE0F\u20E3 \u00BFPrefieres en la ma\u00F1ana o en la tarde?\n\n\uD83D\uDCCD *Ubicaci\u00F3n:*\nCentro Comercial El Diamante 2, San Nicol\u00E1s, Cali\n\n\uD83D\uDCDE Confirma tu cita al:\n*313 617 4267*\n\nTe esperamos! \uD83D\uDE0A"
        };
        return responses[category] || responses.ASESORIA;
    };
    HumanEscalationService.ADMIN_PHONE = '573136174267'; // Tu número
    return HumanEscalationService;
}());
exports.HumanEscalationService = HumanEscalationService;
