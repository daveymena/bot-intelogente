"use strict";
/**
 * 🧠 SERVICIO DE RESPUESTAS INTELIGENTES
 * Sistema de razonamiento que decide cuándo usar bot local vs IA avanzada
 * Incluye demoras humanas y burbujas de "escribiendo..."
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
exports.IntelligentResponseService = void 0;
var ai_service_1 = require("./ai-service");
var IntelligentResponseService = /** @class */ (function () {
    function IntelligentResponseService() {
    }
    /**
     * Analizar complejidad del mensaje y decidir qué tipo de respuesta usar
     */
    IntelligentResponseService.analyzeMessageComplexity = function (message) {
        var lowerMessage = message.toLowerCase();
        // 🟢 CASOS SIMPLES - Bot local puede manejar (SIN GROQ)
        var simplePatterns = [
            /^(hola|hi|hey|buenos días|buenas tardes|buenas noches)$/i,
            /^(gracias|muchas gracias|ok|vale|perfecto|entendido)$/i,
            /^(sí|si|no|nop|nope)$/i,
            /^(info|información|dame info|quiero info)/i, // Info básica de producto
            /^(precio|cuánto|cuanto|cuesta|vale|valor)\??$/i, // Solo pregunta precio
            /^(disponible|hay|tienes|tienen|stock)\??$/i, // Solo disponibilidad
            /^(link|enlace|url|página|pagina)\??$/i, // Solo pide link
            /^(comprar|quiero|deseo|me interesa)\s+(el|la|un|una)?\s*\w+$/i, // Compra simple
        ];
        for (var _i = 0, simplePatterns_1 = simplePatterns; _i < simplePatterns_1.length; _i++) {
            var pattern = simplePatterns_1[_i];
            if (pattern.test(message)) {
                return {
                    useAdvancedAI: false,
                    reason: 'Pregunta simple - Bot local (sin Groq)',
                    complexity: 'simple',
                    estimatedDelay: this.getHumanDelay('simple')
                };
            }
        }
        // 🟢 PREGUNTAS DIRECTAS SOBRE PRODUCTOS - Bot local
        if (message.length < 50 && (lowerMessage.includes('precio') ||
            lowerMessage.includes('cuesta') ||
            lowerMessage.includes('vale') ||
            lowerMessage.includes('disponible') ||
            lowerMessage.includes('link') ||
            lowerMessage.includes('enlace') ||
            lowerMessage.includes('info'))) {
            return {
                useAdvancedAI: false,
                reason: 'Pregunta directa sobre producto - Bot local',
                complexity: 'simple',
                estimatedDelay: this.getHumanDelay('simple')
            };
        }
        // 🔴 CASOS COMPLEJOS - Requieren Groq (contexto, memoria, razonamiento)
        var complexPatterns = [
            /agendar|cita|reunión|appointment/i,
            /negociar|descuento|rebaja|oferta especial/i,
            /comparar|diferencia|mejor opción|cuál es mejor/i,
            /recomendar|sugerir|aconsejar|qué me recomiendas/i,
            /cuánto.*quedar|precio final|total a pagar/i,
            /garantía|devolución|cambio|reembolso/i,
            /especificaciones técnicas|características detalladas/i,
            /compatible con|funciona con|sirve para/i,
            /problema|error|falla|no funciona|ayuda/i,
            /explicar|cómo funciona|cómo se usa/i,
            /diferencia entre|ventajas|desventajas/i,
        ];
        for (var _a = 0, complexPatterns_1 = complexPatterns; _a < complexPatterns_1.length; _a++) {
            var pattern = complexPatterns_1[_a];
            if (pattern.test(lowerMessage)) {
                return {
                    useAdvancedAI: true,
                    reason: 'Requiere Groq - Razonamiento complejo: ' + pattern.source.substring(0, 30),
                    complexity: 'complex',
                    estimatedDelay: this.getHumanDelay('complex')
                };
            }
        }
        // 🔴 PREGUNTAS QUE REQUIEREN CONTEXTO - Usar Groq
        // Preguntas vagas que necesitan memoria de conversación
        var needsContextPatterns = [
            /^(y|pero|entonces|además|también)\s/i, // Empieza con conjunción (necesita contexto)
            /^(eso|ese|esa|esto|esta|aquello)\s/i, // Referencias (necesita contexto)
            /^(me|te|le)\s+(das|envías|pasas|mandas)/i, // "me das el link" (necesita saber QUÉ)
            /^(cuál|cual|qué)\s+(es|sería|me)/i, // Preguntas abiertas
        ];
        for (var _b = 0, needsContextPatterns_1 = needsContextPatterns; _b < needsContextPatterns_1.length; _b++) {
            var pattern = needsContextPatterns_1[_b];
            if (pattern.test(message)) {
                return {
                    useAdvancedAI: true,
                    reason: 'Requiere Groq - Necesita contexto de conversación',
                    complexity: 'complex',
                    estimatedDelay: this.getHumanDelay('complex')
                };
            }
        }
        // 🟠 CASOS MEDIOS - Depende de la longitud y contexto
        if (message.length > 150) {
            return {
                useAdvancedAI: true,
                reason: 'Requiere Groq - Mensaje muy largo',
                complexity: 'complex',
                estimatedDelay: this.getHumanDelay('complex')
            };
        }
        if (message.split(' ').length > 20) {
            return {
                useAdvancedAI: true,
                reason: 'Requiere Groq - Múltiples preguntas',
                complexity: 'medium',
                estimatedDelay: this.getHumanDelay('medium')
            };
        }
        // 🟢 MENCIONA PRODUCTO ESPECÍFICO - Bot local puede manejar
        var productKeywords = ['laptop', 'moto', 'curso', 'piano', 'macbook', 'asus', 'bajaj', 'mega pack'];
        var hasProductKeyword = productKeywords.some(function (keyword) { return lowerMessage.includes(keyword); });
        if (hasProductKeyword && message.length < 80) {
            return {
                useAdvancedAI: false,
                reason: 'Pregunta sobre producto específico - Bot local',
                complexity: 'simple',
                estimatedDelay: this.getHumanDelay('simple')
            };
        }
        // Por defecto, usar bot local para preguntas simples
        return {
            useAdvancedAI: false,
            reason: 'Pregunta estándar - Bot local (ahorro de tokens)',
            complexity: 'simple',
            estimatedDelay: this.getHumanDelay('simple')
        };
    };
    /**
     * Calcular demora humana realista según complejidad
     * REDUCIDO para evitar pérdida de conexión
     */
    IntelligentResponseService.getHumanDelay = function (complexity) {
        var delays = {
            simple: { min: 800, max: 1500 }, // 0.8-1.5 segundos (antes 1.5-3)
            medium: { min: 1500, max: 2500 }, // 1.5-2.5 segundos (antes 3-5)
            complex: { min: 2500, max: 4000 }, // 2.5-4 segundos (antes 5-8)
        };
        var range = delays[complexity];
        return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    };
    /**
     * Simular escritura humana (burbujas de "escribiendo...")
     */
    IntelligentResponseService.simulateTyping = function (phoneNumber, duration) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("[Typing] Simulando escritura por ".concat(duration, "ms para ").concat(phoneNumber));
                        // Enviar estado de "escribiendo" a WhatsApp
                        // await BaileysService.sendPresenceUpdate(phoneNumber, 'composing')
                        // Esperar la duración
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, duration); })
                            // Detener estado de "escribiendo"
                            // await BaileysService.sendPresenceUpdate(phoneNumber, 'paused')
                        ];
                    case 1:
                        // Enviar estado de "escribiendo" a WhatsApp
                        // await BaileysService.sendPresenceUpdate(phoneNumber, 'composing')
                        // Esperar la duración
                        _a.sent();
                        // Detener estado de "escribiendo"
                        // await BaileysService.sendPresenceUpdate(phoneNumber, 'paused')
                        console.log("[Typing] Escritura completada para ".concat(phoneNumber));
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('[Typing] Error simulando escritura:', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generar respuesta con demora humana y burbujas
     */
    IntelligentResponseService.generateResponseWithHumanTouch = function (userId_1, customerMessage_1, customerPhone_1) {
        return __awaiter(this, arguments, void 0, function (userId, customerMessage, customerPhone, conversationHistory) {
            var startTime, decision, response, responseTime, error_2;
            if (conversationHistory === void 0) { conversationHistory = []; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 9]);
                        decision = this.analyzeMessageComplexity(customerMessage);
                        console.log("[Intelligence] Decisi\u00F3n de respuesta:", {
                            complexity: decision.complexity,
                            useAdvancedAI: decision.useAdvancedAI,
                            reason: decision.reason,
                            delay: decision.estimatedDelay
                        });
                        // 2. Simular burbujas de "escribiendo..." antes de responder
                        return [4 /*yield*/, this.simulateTyping(customerPhone, decision.estimatedDelay)
                            // 3. Generar respuesta según la decisión
                        ];
                    case 2:
                        // 2. Simular burbujas de "escribiendo..." antes de responder
                        _a.sent();
                        response = void 0;
                        if (!decision.useAdvancedAI) return [3 /*break*/, 4];
                        // Usar IA avanzada (Groq con modelo potente)
                        console.log("[Intelligence] \uD83E\uDDE0 Usando IA AVANZADA para razonamiento complejo");
                        return [4 /*yield*/, ai_service_1.AIService.generateResponse(userId, customerMessage, customerPhone, conversationHistory)];
                    case 3:
                        response = _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        // Usar bot local (respuestas rápidas y simples)
                        console.log("[Intelligence] \u26A1 Usando BOT LOCAL para respuesta simple");
                        return [4 /*yield*/, this.generateSimpleResponse(userId, customerMessage, customerPhone, conversationHistory)];
                    case 5:
                        response = _a.sent();
                        _a.label = 6;
                    case 6:
                        responseTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                message: response.message,
                                confidence: response.confidence,
                                usedAdvancedAI: decision.useAdvancedAI,
                                complexity: decision.complexity,
                                responseTime: responseTime
                            }];
                    case 7:
                        error_2 = _a.sent();
                        console.error('[Intelligence] Error generando respuesta:', error_2);
                        // Fallback con demora humana
                        return [4 /*yield*/, this.simulateTyping(customerPhone, 2000)];
                    case 8:
                        // Fallback con demora humana
                        _a.sent();
                        return [2 /*return*/, {
                                message: '¡Hola! Gracias por contactarnos. Un momento por favor, te atenderé enseguida. 😊',
                                confidence: 0.5,
                                usedAdvancedAI: false,
                                complexity: 'simple',
                                responseTime: Date.now() - startTime
                            }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generar respuesta simple sin IA avanzada
     */
    IntelligentResponseService.generateSimpleResponse = function (userId_1, message_1, _customerPhone_1) {
        return __awaiter(this, arguments, void 0, function (userId, message, _customerPhone, conversationHistory) {
            var lowerMessage;
            if (conversationHistory === void 0) { conversationHistory = []; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lowerMessage = message.toLowerCase();
                        // Saludos
                        if (/^(hola|hi|hey|buenos días|buenas tardes|buenas noches)$/i.test(message)) {
                            return [2 /*return*/, {
                                    message: '👋 Hola ¡Bienvenido a Tecnovariedades D&S! 😄💻\n\nAquí encontrarás tecnología, soporte, cursos y herramientas digitales para potenciar tu día a día.\n\n📦 ¿Buscas algún producto, servicio o información en especial?',
                                    confidence: 0.95
                                }];
                        }
                        // Agradecimientos
                        if (/^(gracias|muchas gracias)$/i.test(message)) {
                            return [2 /*return*/, {
                                    message: '¡De nada! 😊 Estoy aquí para ayudarte. ¿Necesitas algo más?',
                                    confidence: 0.95
                                }];
                        }
                        // Confirmaciones
                        if (/^(ok|vale|perfecto|entendido)$/i.test(message)) {
                            return [2 /*return*/, {
                                    message: '¡Perfecto! 👍 ¿Hay algo más en lo que pueda ayudarte?',
                                    confidence: 0.95
                                }];
                        }
                        return [4 /*yield*/, ai_service_1.AIService.generateResponse(userId, message, _customerPhone, conversationHistory)];
                    case 1: 
                    // Para todo lo demás, usar IA pero con respuesta rápida
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Calcular tiempo de lectura humano (para mensajes largos)
     */
    IntelligentResponseService.calculateReadingTime = function (message) {
        // Promedio de lectura: 200 palabras por minuto
        var words = message.split(' ').length;
        var readingTimeMs = (words / 200) * 60 * 1000;
        // Mínimo 1 segundo, máximo 5 segundos
        return Math.min(Math.max(readingTimeMs, 1000), 5000);
    };
    /**
     * Agregar variación humana al tiempo de respuesta
     */
    IntelligentResponseService.addHumanVariation = function (baseDelay) {
        // Agregar ±20% de variación aleatoria
        var variation = baseDelay * 0.2;
        var randomVariation = (Math.random() * variation * 2) - variation;
        return Math.floor(baseDelay + randomVariation);
    };
    return IntelligentResponseService;
}());
exports.IntelligentResponseService = IntelligentResponseService;
