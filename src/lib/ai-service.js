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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
var groq_sdk_1 = __importDefault(require("groq-sdk"));
var db_1 = require("./db");
var product_intelligence_service_1 = require("./product-intelligence-service");
var ai_multi_provider_1 = require("./ai-multi-provider");
var conversation_context_service_1 = require("./conversation-context-service");
var groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY || ''
});
// Usar sistema multi-provider si está habilitado
var USE_MULTI_PROVIDER = process.env.AI_FALLBACK_ENABLED === 'true';
var AIService = /** @class */ (function () {
    function AIService() {
    }
    /**
     * Cargar historial completo de conversación de las últimas 24 horas
     */
    AIService.loadFullConversationHistory = function (userId, customerPhone) {
        return __awaiter(this, void 0, void 0, function () {
            var twentyFourHoursAgo, conversation, history_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        twentyFourHoursAgo = new Date();
                        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
                        return [4 /*yield*/, db_1.db.conversation.findFirst({
                                where: {
                                    userId: userId,
                                    customerPhone: customerPhone,
                                    status: 'ACTIVE'
                                },
                                include: {
                                    messages: {
                                        where: {
                                            createdAt: {
                                                gte: twentyFourHoursAgo
                                            }
                                        },
                                        orderBy: {
                                            createdAt: 'asc'
                                        },
                                        take: 100 // Máximo 100 mensajes (50 intercambios)
                                    }
                                }
                            })];
                    case 1:
                        conversation = _a.sent();
                        if (!conversation || !conversation.messages.length) {
                            return [2 /*return*/, []];
                        }
                        history_1 = conversation.messages.map(function (msg) { return ({
                            role: msg.direction === 'INCOMING' ? 'user' : 'assistant',
                            content: msg.content
                        }); });
                        return [2 /*return*/, history_1];
                    case 2:
                        error_1 = _a.sent();
                        console.error('[AI] Error cargando historial:', error_1);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Generar respuesta inteligente basada en el mensaje del cliente
    AIService.generateResponse = function (userId_1, customerMessage_1, _customerPhone_1) {
        return __awaiter(this, arguments, void 0, function (userId, customerMessage, _customerPhone, conversationHistory) {
            var fullHistory, HumanEscalationService, escalation, customerName, response, productIntent, conversationKey, product, context, context, i, historicalMessage, foundProduct, productInfo, aiResponse, user, relevantProducts, customPrompts, businessContext, systemPrompt, historyToUse, messages, responseMessage, aiResponse, completion, intent, error_2;
            var _a, _b;
            if (conversationHistory === void 0) { conversationHistory = []; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 21, , 22]);
                        console.log("[AI] Generando respuesta para: \"".concat(customerMessage, "\""));
                        return [4 /*yield*/, this.loadFullConversationHistory(userId, _customerPhone)];
                    case 1:
                        fullHistory = _c.sent();
                        console.log("[AI] \uD83D\uDCDA Historial cargado: ".concat(fullHistory.length, " mensajes de las \u00FAltimas 24h"));
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('./human-escalation-service')); })];
                    case 2:
                        HumanEscalationService = (_c.sent()).HumanEscalationService;
                        escalation = HumanEscalationService.needsHumanEscalation(customerMessage);
                        if (!escalation.needs) return [3 /*break*/, 4];
                        console.log("[AI] \uD83D\uDC68\u200D\uD83D\uDCBC Escalamiento detectado: ".concat(escalation.category));
                        customerName = 'Cliente' // Puedes obtenerlo de la conversación
                        ;
                        return [4 /*yield*/, HumanEscalationService.notifyAdmin(userId, _customerPhone, customerName, escalation.category, customerMessage)
                            // Responder al cliente
                        ];
                    case 3:
                        _c.sent();
                        response = HumanEscalationService.generateEscalationResponse(escalation.category);
                        return [2 /*return*/, {
                                message: response,
                                confidence: 0.95,
                                intent: 'human_escalation'
                            }];
                    case 4:
                        productIntent = product_intelligence_service_1.ProductIntelligenceService.detectIntent(customerMessage);
                        conversationKey = "".concat(userId, ":").concat(_customerPhone);
                        if (!(productIntent.confidence > 0.7)) return [3 /*break*/, 14];
                        console.log("[AI] Intenci\u00F3n de producto detectada: ".concat(productIntent.type, " (").concat(productIntent.confidence, ")"));
                        return [4 /*yield*/, product_intelligence_service_1.ProductIntelligenceService.findProduct(customerMessage, userId)
                            // Si encontró producto NUEVO, actualizar memoria inmediatamente
                        ];
                    case 5:
                        product = _c.sent();
                        // Si encontró producto NUEVO, actualizar memoria inmediatamente
                        if (product) {
                            context = conversation_context_service_1.ConversationContextService.getProductContext(conversationKey);
                            // Solo actualizar si es diferente al producto actual en memoria
                            if (!context || context.lastProductId !== product.id) {
                                console.log("[AI] \uD83D\uDD04 Cambiando contexto a: ".concat(product.name));
                                conversation_context_service_1.ConversationContextService.setProductContext(conversationKey, product.id, product.name);
                            }
                        }
                        if (!!product) return [3 /*break*/, 11];
                        console.log("[AI] \uD83D\uDD0D No se encontr\u00F3 producto en mensaje actual");
                        context = conversation_context_service_1.ConversationContextService.getProductContext(conversationKey);
                        if (!context) return [3 /*break*/, 7];
                        return [4 /*yield*/, db_1.db.product.findUnique({
                                where: { id: context.lastProductId }
                            })];
                    case 6:
                        // Obtener el producto de la base de datos
                        product = _c.sent();
                        if (product) {
                            console.log("[AI] \uD83D\uDCBE Producto recuperado de memoria: ".concat(product.name));
                            // Incrementar contador de mensajes sobre este producto
                            conversation_context_service_1.ConversationContextService.incrementMessageCount(conversationKey);
                        }
                        _c.label = 7;
                    case 7:
                        if (!(!product && conversationHistory.length > 0)) return [3 /*break*/, 11];
                        console.log("[AI] \uD83D\uDCDA Buscando en historial de conversaci\u00F3n...");
                        i = conversationHistory.length - 1;
                        _c.label = 8;
                    case 8:
                        if (!(i >= Math.max(0, conversationHistory.length - 6))) return [3 /*break*/, 11];
                        historicalMessage = conversationHistory[i];
                        if (!(historicalMessage.role === 'user')) return [3 /*break*/, 10];
                        return [4 /*yield*/, product_intelligence_service_1.ProductIntelligenceService.findProduct(historicalMessage.content, userId)];
                    case 9:
                        foundProduct = _c.sent();
                        if (foundProduct) {
                            console.log("[AI] \u2705 Producto encontrado en historial: ".concat(foundProduct.name));
                            product = foundProduct;
                            // Guardar en memoria para próximas preguntas
                            conversation_context_service_1.ConversationContextService.setProductContext(conversationKey, foundProduct.id, foundProduct.name);
                            return [3 /*break*/, 11];
                        }
                        _c.label = 10;
                    case 10:
                        i--;
                        return [3 /*break*/, 8];
                    case 11:
                        if (!product) return [3 /*break*/, 13];
                        console.log("[AI] Producto encontrado: ".concat(product.name, " - Generando respuesta con IA"));
                        productInfo = product_intelligence_service_1.ProductIntelligenceService.extractProductInfo(product);
                        return [4 /*yield*/, this.generateProductResponse(customerMessage, product, productInfo, productIntent, fullHistory.length > 0 ? fullHistory : conversationHistory)];
                    case 12:
                        aiResponse = _c.sent();
                        return [2 /*return*/, {
                                message: aiResponse,
                                confidence: productIntent.confidence,
                                intent: productIntent.type
                            }];
                    case 13:
                        // NO encontró producto - responder honestamente
                        console.log("[AI] \u26A0\uFE0F No se encontr\u00F3 producto para: \"".concat(customerMessage, "\""));
                        return [2 /*return*/, {
                                message: "Lo siento, no tengo ese producto o servicio disponible en este momento. \uD83D\uDE14\n\nPuedo ayudarte con:\n\uD83D\uDCBB Laptops y computadores\n\uD83C\uDFB9 Curso de Piano Profesional\n\uD83D\uDCDA Megapacks de cursos digitales\n\uD83C\uDFCD\uFE0F Moto Bajaj Pulsar NS 160\n\n\u00BFTe interesa algo de esto? O si buscas algo espec\u00EDfico, cu\u00E9ntame m\u00E1s detalles y te ayudo. \uD83D\uDE0A\n\n\uD83D\uDCDE WhatsApp: +57 304 274 8687",
                                confidence: 0.9,
                                intent: 'product_not_found'
                            }];
                    case 14: return [4 /*yield*/, db_1.db.user.findUnique({
                            where: { id: userId },
                            include: {
                                products: {
                                    where: { status: 'AVAILABLE' }
                                }
                            }
                        })];
                    case 15:
                        user = _c.sent();
                        if (!user) {
                            throw new Error('Usuario no encontrado');
                        }
                        relevantProducts = this.findRelevantProducts(customerMessage, user.products);
                        return [4 /*yield*/, db_1.db.aIPrompt.findMany({
                                where: {
                                    userId: userId,
                                    isActive: true
                                }
                            })
                            // Construir contexto del negocio
                        ];
                    case 16:
                        customPrompts = _c.sent();
                        businessContext = this.buildBusinessContext(user, customPrompts);
                        systemPrompt = this.buildSystemPrompt(businessContext, relevantProducts);
                        historyToUse = fullHistory.length > 0 ? fullHistory : conversationHistory;
                        messages = __spreadArray(__spreadArray([
                            { role: 'system', content: systemPrompt }
                        ], historyToUse.slice(-5), true), [
                            { role: 'user', content: customerMessage }
                        ], false);
                        responseMessage = void 0;
                        if (!USE_MULTI_PROVIDER) return [3 /*break*/, 18];
                        console.log('[AI] 🔄 Usando sistema multi-provider con fallback automático');
                        return [4 /*yield*/, ai_multi_provider_1.AIMultiProvider.generateCompletion(messages, {
                                temperature: 0.7,
                                max_tokens: parseInt(process.env.GROQ_MAX_TOKENS || '500'),
                                top_p: 1
                            })];
                    case 17:
                        aiResponse = _c.sent();
                        responseMessage = aiResponse.content;
                        console.log("[AI] \u2705 Respuesta generada con: ".concat(aiResponse.provider, " (").concat(aiResponse.model, ")"));
                        return [3 /*break*/, 20];
                    case 18:
                        // Usar solo Groq (modo legacy)
                        console.log('[AI] Usando solo Groq (modo legacy)');
                        return [4 /*yield*/, groq.chat.completions.create({
                                model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
                                messages: messages,
                                temperature: 0.7,
                                max_tokens: parseInt(process.env.GROQ_MAX_TOKENS || '500'),
                                top_p: 1,
                                stream: false
                            })];
                    case 19:
                        completion = _c.sent();
                        responseMessage = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || 'Lo siento, no pude procesar tu mensaje.';
                        _c.label = 20;
                    case 20:
                        intent = this.detectIntent(customerMessage);
                        console.log("[AI] Respuesta generada: \"".concat(responseMessage.substring(0, 50), "...\""));
                        return [2 /*return*/, {
                                message: responseMessage,
                                confidence: 0.85,
                                intent: intent,
                                productMentioned: relevantProducts.length > 0 ? relevantProducts[0].name : undefined
                            }];
                    case 21:
                        error_2 = _c.sent();
                        console.error('[AI] Error generando respuesta:', error_2);
                        // Respuesta de fallback
                        return [2 /*return*/, {
                                message: '👋 Hola ¡Bienvenido a Tecnovariedades D&S! 😄💻\n\nAquí encontrarás tecnología, soporte, cursos y herramientas digitales para potenciar tu día a día.\n\n📦 ¿Buscas algún producto, servicio o información en especial?',
                                confidence: 0.5,
                                intent: 'greeting'
                            }];
                    case 22: return [2 /*return*/];
                }
            });
        });
    };
    // Buscar productos relevantes según el mensaje del cliente
    AIService.findRelevantProducts = function (message, allProducts) {
        var messageLower = message.toLowerCase();
        // 🚨 DETECTAR SI BUSCA ESPECÍFICAMENTE NUEVO O USADO
        var buscaUsado = messageLower.includes('usado') ||
            messageLower.includes('usada') ||
            messageLower.includes('segunda mano') ||
            messageLower.includes('reacondicionado');
        var buscaNuevo = messageLower.includes('nuevo') ||
            messageLower.includes('nueva') ||
            messageLower.includes('0 km') ||
            messageLower.includes('sin usar');
        console.log("[AI] \uD83D\uDD0D B\u00FAsqueda - Usado: ".concat(buscaUsado, ", Nuevo: ").concat(buscaNuevo));
        // Buscar productos que coincidan con el mensaje
        var relevant = allProducts.filter(function (p) {
            var nameLower = p.name.toLowerCase();
            var descLower = (p.description || '').toLowerCase();
            // 🚨 FILTRO CRÍTICO: Si busca usado, SOLO mostrar usados
            if (buscaUsado) {
                var esUsado = nameLower.includes('usado') ||
                    nameLower.includes('usada') ||
                    descLower.includes('usado') ||
                    descLower.includes('usada') ||
                    descLower.includes('segunda mano') ||
                    descLower.includes('reacondicionado');
                if (!esUsado) {
                    console.log("[AI] \u274C Descartando ".concat(p.name, " - No es usado"));
                    return false; // Descartar productos nuevos
                }
            }
            // 🚨 FILTRO CRÍTICO: Si busca nuevo, SOLO mostrar nuevos
            if (buscaNuevo) {
                var esUsado = nameLower.includes('usado') ||
                    nameLower.includes('usada') ||
                    descLower.includes('usado') ||
                    descLower.includes('usada');
                if (esUsado) {
                    console.log("[AI] \u274C Descartando ".concat(p.name, " - Es usado, busca nuevo"));
                    return false; // Descartar productos usados
                }
            }
            // Buscar coincidencias en nombre o descripción
            var nameWords = nameLower.split(' ');
            var messageWords = messageLower.split(' ');
            // Si el mensaje menciona palabras del nombre del producto
            var hasNameMatch = nameWords.some(function (word) {
                return word.length > 3 && messageWords.some(function (mw) { return mw.includes(word) || word.includes(mw); });
            });
            // Si el mensaje menciona palabras de la descripción
            var hasDescMatch = descLower.split(' ').some(function (word) {
                return word.length > 4 && messageLower.includes(word);
            });
            // Buscar en tags
            var hasTagMatch = false;
            try {
                var tags = p.tags ? JSON.parse(p.tags) : [];
                hasTagMatch = tags.some(function (tag) {
                    return messageLower.includes(tag.toLowerCase());
                });
            }
            catch (e) {
                // Ignorar errores de parsing
            }
            var matches = hasNameMatch || hasDescMatch || hasTagMatch;
            if (matches) {
                console.log("[AI] \u2705 Producto relevante: ".concat(p.name));
            }
            return matches;
        });
        // Si encontró productos específicos, retornarlos (máximo 5)
        if (relevant.length > 0) {
            return relevant.slice(0, 5);
        }
        // Si no encontró nada específico, buscar por categoría general
        if (messageLower.includes('laptop') || messageLower.includes('portatil') || messageLower.includes('computador')) {
            return allProducts.filter(function (p) {
                return p.name.toLowerCase().includes('laptop') ||
                    p.name.toLowerCase().includes('vivobook') ||
                    p.name.toLowerCase().includes('macbook');
            }).slice(0, 5);
        }
        if (messageLower.includes('curso') || messageLower.includes('mega pack')) {
            return allProducts.filter(function (p) {
                return p.name.toLowerCase().includes('curso') ||
                    p.name.toLowerCase().includes('mega pack');
            }).slice(0, 5);
        }
        if (messageLower.includes('moto')) {
            return allProducts.filter(function (p) {
                return p.name.toLowerCase().includes('moto') ||
                    p.name.toLowerCase().includes('pulsar') ||
                    p.name.toLowerCase().includes('bajaj');
            }).slice(0, 5);
        }
        // Si no hay coincidencias, retornar productos destacados
        return allProducts.slice(0, 5);
    };
    // Construir contexto del negocio
    AIService.buildBusinessContext = function (user, customPrompts) {
        var context = "Nombre del negocio: ".concat(user.businessName || 'Tecnovariedades D&S', "\n");
        context += "Contacto: WhatsApp +57 304 274 8687\n";
        context += "Email: deinermen25@gmail.com\n";
        if (user.businessDescription) {
            context += "Descripci\u00F3n: ".concat(user.businessDescription, "\n");
        }
        if (customPrompts.length > 0) {
            context += '\nInstrucciones personalizadas:\n';
            customPrompts.forEach(function (prompt) {
                context += "- ".concat(prompt.name, ": ").concat(prompt.prompt, "\n");
            });
        }
        return context;
    };
    // Construir prompt del sistema mejorado
    AIService.buildSystemPrompt = function (businessContext, products) {
        // Construir información detallada de productos
        var productsInfo = products.length > 0
            ? products.map(function (p) {
                var info = "\uD83D\uDCE6 **".concat(p.name, "**\n");
                info += "   \uD83D\uDCB0 Precio: $".concat(p.price.toLocaleString('es-CO'), " COP\n");
                if (p.description) {
                    info += "   \uD83D\uDCDD ".concat(p.description, "\n");
                }
                if (p.stock) {
                    info += "   \uD83D\uDCE6 Stock: ".concat(p.stock, " unidades\n");
                }
                // Buscar enlaces en tags o descripción
                try {
                    var tags = p.tags ? JSON.parse(p.tags) : [];
                    // Extraer links de pago REALES de los tags
                    var hotmartTag = tags.find(function (t) { return t.startsWith('hotmart:'); });
                    var mercadopagoTag = tags.find(function (t) { return t.startsWith('mercadopago:'); });
                    var paypalTag = tags.find(function (t) { return t.startsWith('paypal:'); });
                    var nequiTag = tags.find(function (t) { return t.startsWith('nequi:'); });
                    var paycoTag = tags.find(function (t) { return t.startsWith('payco:'); });
                    var contactoTag = tags.find(function (t) { return t.startsWith('contacto:'); });
                    // Links directos (sin prefijo)
                    var enlaces = tags.filter(function (t) { return t.startsWith('http'); });
                    // SIEMPRE mostrar métodos de pago disponibles
                    info += "   \uD83D\uDCB3 M\u00E9todos de pago disponibles:\n";
                    // Hotmart (si existe)
                    if (hotmartTag) {
                        var hotmartLink = hotmartTag.replace('hotmart:', '');
                        info += "      - Hotmart (pago directo): ".concat(hotmartLink, "\n");
                    }
                    // Mercado Pago (si existe)
                    if (mercadopagoTag) {
                        var mercadopagoLink = mercadopagoTag.replace('mercadopago:', '');
                        info += "      - Mercado Pago: ".concat(mercadopagoLink, "\n");
                    }
                    // PayPal (si existe)
                    if (paypalTag) {
                        var paypalLink = paypalTag.replace('paypal:', '');
                        if (paypalLink.includes('http')) {
                            info += "      - PayPal: ".concat(paypalLink, "\n");
                        }
                        else {
                            info += "      - PayPal: Solicitar por WhatsApp\n";
                        }
                    }
                    // Nequi (si existe)
                    if (nequiTag) {
                        var nequiNumber = nequiTag.replace('nequi:', '');
                        info += "      - Nequi/Daviplata: ".concat(nequiNumber, "\n");
                    }
                    // Payco (si existe)
                    if (paycoTag) {
                        var paycoLink = paycoTag.replace('payco:', '');
                        info += "      - Tarjeta de cr\u00E9dito: ".concat(paycoLink, "\n");
                    }
                    // Contacto directo (si existe)
                    if (contactoTag) {
                        var contacto = contactoTag.replace('contacto:', '');
                        info += "      - Contacto directo: ".concat(contacto, "\n");
                    }
                    // Si no tiene ningún método de pago configurado
                    if (!hotmartTag && !mercadopagoTag && !paypalTag && !nequiTag && !paycoTag && !contactoTag) {
                        info += "      - Contacto directo: +57 304 274 8687\n";
                    }
                    // Si hay enlace de info, agregarlo
                    var infoLink = enlaces.find(function (link) {
                        return link.includes('landein') || link.includes('page') || link.includes('info') || link.includes('vercel');
                    });
                    if (infoLink) {
                        info += "   \u2139\uFE0F M\u00E1s informaci\u00F3n: ".concat(infoLink, "\n");
                    }
                }
                catch (e) {
                    // Si hay error, ofrecer contacto directo
                    info += "   \uD83D\uDCB3 M\u00E9todos de pago disponibles\n";
                    info += "   \uD83D\uDCF1 WhatsApp: +57 304 274 8687\n";
                }
                // Buscar imágenes
                try {
                    var imagenes = p.images ? JSON.parse(p.images) : [];
                    if (imagenes.length > 0) {
                        info += "   \uD83D\uDCF8 ".concat(imagenes.length, " imagen(es) disponible(s)\n");
                    }
                }
                catch (e) {
                    // Ignorar errores
                }
                return info;
            }).join('\n')
            : 'No hay productos disponibles actualmente.';
        return "Eres un asistente de ventas inteligente y profesional para Tecnovariedades D&S en WhatsApp.\n\n".concat(businessContext, "\n\nPRODUCTOS RELEVANTES PARA ESTA CONSULTA:\n").concat(productsInfo, "\n\nTU PERSONALIDAD:\n- \uD83D\uDE0A Profesional pero cercano y amigable\n- \uD83D\uDCA1 Experto en tecnolog\u00EDa y productos digitales\n- \uD83C\uDFAF Orientado a ayudar y resolver dudas espec\u00EDficas\n- \uD83D\uDE80 Persuasivo de forma SUTIL (no agresivo ni insistente)\n- \u2728 Usas emojis para organizar informaci\u00F3n de forma atractiva y clara\n- \uD83D\uDCC5 Ofreces agendar citas SOLO si el cliente pregunta por ver el producto en persona\n\nREGLAS CR\u00CDTICAS DE RESPUESTA:\n\n1. \u2B50 RESPUESTAS ESPEC\u00CDFICAS (MUY IMPORTANTE):\n   - Si preguntan por UN producto espec\u00EDfico \u2192 Responde SOLO sobre ESE producto\n   - Si preguntan por una categor\u00EDa \u2192 Muestra m\u00E1ximo 3 opciones\n   - Si preguntan por precio \u2192 Da el precio exacto del producto mencionado\n   - NO des informaci\u00F3n gen\u00E9rica si preguntan por algo espec\u00EDfico\n\n2. \uD83C\uDFAF INFORMACI\u00D3N SEG\u00DAN INTENCI\u00D3N:\n   \n   a) Si piden INFORMACI\u00D3N/DETALLES:\n      - Da caracter\u00EDsticas principales\n      - Menciona beneficios clave\n      - Incluye precio\n      - Pregunta si desea m\u00E1s info o comprar\n   \n   b) Si piden PRECIO:\n      - Da el precio exacto\n      - Menciona 1-2 caracter\u00EDsticas principales\n      - Pregunta si desea comprarlo\n   \n   c) Si piden ENLACE/LINK o C\u00D3MO PAGAR:\n      - SIEMPRE menciona TODAS las opciones de pago disponibles\n      - Si tiene Hotmart \u2192 Menciona Hotmart + Mercado Pago + PayPal\n      - Si NO tiene Hotmart \u2192 Menciona Mercado Pago + PayPal\n      - SIEMPRE menciona WhatsApp: +57 304 274 8687\n      - Deja que el cliente elija su m\u00E9todo preferido\n      - Confirma que el pago es seguro\n   \n   d) Si quieren COMPRAR:\n      - Confirma el producto y precio\n      - Da el enlace de compra\n      - Menciona garant\u00EDa o beneficios\n\n3. \uD83D\uDCDD FORMATO DE RESPUESTA CON EMOJIS ORGANIZADOS:\n   - \u2705 Usa emojis para organizar informaci\u00F3n (\u2705 caracter\u00EDsticas, \uD83D\uDCB0 precio, \uD83D\uDCDE contacto)\n   - \uD83C\uDFAF Emojis relevantes por categor\u00EDa:\n     \u2022 \uD83C\uDFB9 Piano, \uD83D\uDCBB Laptop, \uD83C\uDFCD\uFE0F Moto, \uD83D\uDCDA Cursos, \uD83D\uDCE6 Megapacks\n   - \uD83D\uDCCA M\u00E1ximo 5-6 l\u00EDneas (conciso y claro)\n   - \uD83D\uDCB0 Precio siempre: $X.XXX.XXX COP\n   - \uD83D\uDC49 Enlaces al final con flecha\n   - \u2B07\uFE0F Saltos de l\u00EDnea para claridad\n\n4. \uD83C\uDFAF PERSUASI\u00D3N SUTIL (MUY IMPORTANTE):\n   \n   a) Para PRODUCTOS DIGITALES (Cursos, Megapacks):\n      - Menciona beneficios clave (acceso inmediato, de por vida, etc.)\n      - Termina con pregunta suave: \"\u00BFTe gustar\u00EDa comprarlo?\" o \"\u00BFDeseas el link?\"\n      - NO presiones, solo facilita la compra\n   \n   b) Para PRODUCTOS F\u00CDSICOS (Laptops, Motos):\n      - Da informaci\u00F3n completa y atractiva\n      - Menciona ventajas (garant\u00EDa, calidad, etc.)\n      - Termina con: \"\u00BFTe interesa?\" o \"\u00BFQuieres m\u00E1s detalles?\"\n      - SOLO si preguntan \"puedo verlo\" o \"quiero ir\" \u2192 Ofrece agendar cita\n   \n   c) NUNCA:\n      - \u274C No seas insistente o agresivo\n      - \u274C No repitas \"compra ahora\" m\u00FAltiples veces\n      - \u274C No ofrezcas citas si no las piden\n      - \u274C No presiones al cliente\n\n5. \uD83D\uDCC5 AGENDAMIENTO DE CITAS:\n   \n   SOLO ofrece agendar cita si el cliente:\n   - Pregunta \"puedo verlo en persona?\"\n   - Dice \"quiero ir a verlo\"\n   - Pregunta \"d\u00F3nde est\u00E1n ubicados?\"\n   - Muestra inter\u00E9s en visitar el local\n   \n   \u26A0\uFE0F NO confundas:\n   - \"Tienes foto?\" \u2192 Env\u00EDa foto, NO ofrezcas cita\n   - \"Puedo verlo?\" \u2192 Ofrece cita\n   \n   Respuesta para agendar:\n   \"\u00A1Claro! Con gusto te esperamos \uD83D\uDCC5\n   \n   \uD83D\uDCCD Ubicaci\u00F3n:\n   Centro Comercial El Diamante 2, San Nicol\u00E1s, Cali\n   \n   \uD83D\uDCDE Confirma tu visita:\n   +57 304 274 8687\n   \n   \u00BFQu\u00E9 d\u00EDa te gustar\u00EDa venir?\"\n\n6. \uD83D\uDCF8 FOTOS DE PRODUCTOS:\n   \n   Si piden foto/imagen:\n   - \"Claro, te env\u00EDo la foto \uD83D\uDCF8\"\n   - Menciona que puedes enviar fotos por WhatsApp\n   - NO ofrezcas cita (solo pidieron foto)\n\n4. \uD83D\uDCA1 EJEMPLOS ESPEC\u00CDFICOS:\n\n   Cliente: \"Hola\"\n   T\u00FA: \"\uD83D\uDC4B Hola \u00A1Bienvenido a Tecnovariedades D&S! \uD83D\uDE04\uD83D\uDCBB\n\nAqu\u00ED encontrar\u00E1s tecnolog\u00EDa, soporte, cursos y herramientas digitales para potenciar tu d\u00EDa a d\u00EDa.\n\n\uD83D\uDCE6 \u00BFBuscas alg\u00FAn producto, servicio o informaci\u00F3n en especial?\"\n\n   Cliente: \"Info del curso de piano\"\n   T\u00FA: \"\uD83C\uDFB9 **Curso Piano Profesional Completo**\n   \n\u2705 +80 lecciones en video HD\n\u2705 Acceso de por vida\n\u2705 Soporte directo del profesor\n\uD83D\uDCB0 $60.000 COP\n\n\u00BFTe gustar\u00EDa comprarlo?\"\n\n   Cliente: \"Cu\u00E1nto cuesta el curso de piano?\"\n   T\u00FA: \"El Curso de Piano Profesional cuesta **$60.000 COP** \uD83C\uDFB9\n\nIncluye +80 lecciones y acceso de por vida.\n\n\u00BFDeseas el enlace de compra?\"\n\n   Cliente: \"Dame el link del curso de piano\"\n   T\u00FA: \"\u00A1Perfecto! Aqu\u00ED est\u00E1 el enlace de compra \uD83C\uDFB9\n\n\uD83D\uDCB3 Hotmart (pago directo):\n\uD83D\uDC49 https://pay.hotmart.com/I95497720H?checkoutMode=2&bid=1760738599205\n\nPrecio: $60.000 COP\nAcceso inmediato \u2705\n\n\u00BFTienes alguna duda antes de comprar?\"\n\n   Cliente: \"Quiero comprar el curso de piano\"\n   T\u00FA: \"\u00A1Excelente decisi\u00F3n! \uD83C\uDF89\n\n\uD83C\uDFB9 Curso Piano Profesional\n\uD83D\uDCB0 $60.000 COP\n\nCompra aqu\u00ED:\n\uD83D\uDC49 https://pay.hotmart.com/I95497720H?checkoutMode=2&bid=1760738599205\n\nAcceso inmediato \u2705\"\n\n   Cliente: \"Tienes laptops?\"\n   T\u00FA: \"\u00A1S\u00ED! Tenemos varias opciones \uD83D\uDCBB\n\n1. ASUS VivoBook Ryzen 3: $1.189.000\n2. ASUS VivoBook i5: $1.650.000  \n3. MacBook Pro M4: $9.799.000\n\n\u00BFCu\u00E1l te interesa?\"\n\n   Cliente: \"Qu\u00E9 productos tienes?\"\n   T\u00FA: \"Tenemos varias categor\u00EDas \uD83D\uDE0A\n\n\uD83D\uDCBB **Laptops:** Desde $1.189.000\n\uD83C\uDFB9 **Curso de Piano:** $60.000\n\uD83D\uDCDA **Megapacks Digitales:** $20.000\n\uD83C\uDFCD\uFE0F **Moto Bajaj Pulsar:** $6.500.000\n\n\u00BFQu\u00E9 te interesa?\"\n\n   Cliente: \"Info de la laptop m\u00E1s barata\"\n   T\u00FA: \"\uD83D\uDCBB **ASUS VivoBook GO 15**\n\n\u2705 AMD Ryzen 3 7320U\n\u2705 8GB DDR5 RAM\n\u2705 512GB SSD\n\u2705 Pantalla 15.6\" FHD\n\uD83D\uDCB0 $1.189.000 COP\n\nExcelente para trabajo y estudio. \u00BFTe interesa?\"\n\n   Cliente: \"Dame el link de un megapack\"\n   T\u00FA: \"\uD83D\uDCDA **Mega Pack de Dise\u00F1o Gr\u00E1fico**\n\uD83D\uDCB0 $20.000 COP\n\nM\u00E9todos de pago:\n1\uFE0F\u20E3 Nequi/Daviplata: 313 617 4267\n2\uFE0F\u20E3 Tarjeta: https://payco.link/3798e2c6-3888-4cdf-bfd5-5d1761f5a4cf\n\n\uD83D\uDCDE WhatsApp: +57 304 274 8687\"\n\n   Cliente: \"Quiero comprar una laptop\"\n   T\u00FA: \"\uD83D\uDCBB Para comprar la laptop, cont\u00E1ctanos directamente:\n\n\uD83D\uDCDE WhatsApp: +57 304 274 8687\n\uD83D\uDCE7 deinermen25@gmail.com\n\uD83D\uDCCD Centro Comercial El Diamante 2, San Nicol\u00E1s, Cali\n\nM\u00E9todos de pago:\n\u2705 Efectivo\n\u2705 Transferencia\n\u2705 Nequi/Daviplata\"\n\n   Cliente: \"Tienes motos?\"\n   T\u00FA: \"\u00A1S\u00ED! Tengo una moto disponible \uD83C\uDFCD\uFE0F\n\nMoto Bajaj Pulsar NS 160 FI (2020)\n\uD83D\uDCB0 $6.500.000 COP (Negociable hasta $6.300.000)\n\n\u2705 Motor 160cc inyecci\u00F3n electr\u00F3nica\n\u2705 Frenos ABS\n\u2705 Papeles al d\u00EDa\n\n\u00BFTe interesa?\"\n\n   Cliente: \"Info de la moto\"\n   T\u00FA: \"\uD83C\uDFCD\uFE0F **Moto Bajaj Pulsar NS 160 FI (2020)**\n\n\u2705 Motor 160cc inyecci\u00F3n electr\u00F3nica\n\u2705 Frenos ABS\n\u2705 Tablero digital\n\u2705 Excelente estado\n\u2705 Papeles al d\u00EDa\n\uD83D\uDCB0 $6.500.000 COP (Negociable)\n\n\uD83D\uDCCD Centro Comercial El Diamante 2, San Nicol\u00E1s, Cali\n\uD83D\uDCDE WhatsApp: +57 304 274 8687\n\n\u00BFQuieres m\u00E1s detalles?\"\n\n   Cliente: \"Cu\u00E1nto cuesta la moto?\"\n   T\u00FA: \"La Moto Bajaj Pulsar NS 160 FI (2020) cuesta **$6.500.000 COP** \uD83C\uDFCD\uFE0F\n\nPrecio negociable hasta $6.300.000 COP\n\n\uD83D\uDCDE Cont\u00E1ctanos: +57 304 274 8687\"\n\n   Cliente: \"Puedo ir a ver la moto?\"\n   T\u00FA: \"\u00A1Claro! Con gusto te esperamos \uD83D\uDCC5\n\n\uD83C\uDFCD\uFE0F Moto Bajaj Pulsar NS 160 FI (2020)\n\uD83D\uDCB0 $6.500.000 COP (Negociable)\n\n\uD83D\uDCCD Ubicaci\u00F3n:\nCentro Comercial El Diamante 2, San Nicol\u00E1s, Cali\n\n\uD83D\uDCDE Confirma tu visita:\n+57 304 274 8687\n\n\u00BFQu\u00E9 d\u00EDa te gustar\u00EDa venir?\"\n\n   Cliente: \"Quiero comprar un megapack\"\n   T\u00FA: \"\u00A1Excelente elecci\u00F3n! \uD83D\uDCDA\n\nMega Pack de Dise\u00F1o Gr\u00E1fico\n\uD83D\uDCB0 $20.000 COP\n\nM\u00E9todos de pago:\n1\uFE0F\u20E3 Nequi: 313 617 4267\n2\uFE0F\u20E3 Tarjeta: https://payco.link/3798e2c6-3888-4cdf-bfd5-5d1761f5a4cf\n3\uFE0F\u20E3 MercadoPago: https://mpago.li/32cJgK3\n\nAcceso inmediato tras el pago \u2705\"\n\n   Cliente: \"Tienes foto de la moto?\"\n   T\u00FA: \"\u00A1Claro! Te puedo enviar fotos \uD83D\uDCF8\n\n\uD83C\uDFCD\uFE0F Moto Bajaj Pulsar NS 160 FI (2020)\n\uD83D\uDCB0 $6.500.000 COP (Negociable)\n\n\uD83D\uDCDE Escr\u00EDbeme al WhatsApp y te env\u00EDo las fotos:\n+57 304 274 8687\n\n\u00BFTe interesa?\"\n\n   Cliente: \"Manda foto\"\n   T\u00FA: \"Con gusto te env\u00EDo las fotos \uD83D\uDCF8\n\n\uD83D\uDCDE Cont\u00E1ctame por WhatsApp:\n+57 304 274 8687\n\nTe env\u00EDo todas las fotos del producto que te interesa \u2705\"\n\u2705 Tarjeta de cr\u00E9dito\n\n\u00BFTe gustar\u00EDa agendar una visita?\"\n\n5. \uD83D\uDD17 MANEJO DE ENLACES Y M\u00C9TODOS DE PAGO:\n   \n   a) **Cursos digitales (Piano, Megapacks):**\n      - SIEMPRE incluye los m\u00E9todos de pago disponibles\n      - Muestra los links REALES que est\u00E1n en el cat\u00E1logo\n      - Ejemplo: Hotmart, Nequi, Payco\n   \n   b) **Productos f\u00EDsicos (Laptops, Motos, Accesorios):**\n      - SIEMPRE incluye contacto directo: +57 304 274 8687\n      - Menciona ubicaci\u00F3n: Centro Comercial El Diamante 2, San Nicol\u00E1s, Cali\n      - Ofrece m\u00E9todos de pago: Efectivo, Transferencia, Nequi, Tarjeta\n   \n   c) **Si el cliente pregunta \"c\u00F3mo pago\" o \"dame el link\":**\n      - Para productos digitales \u2192 Muestra los links REALES del cat\u00E1logo\n      - Para productos f\u00EDsicos \u2192 Muestra contacto directo\n      - NUNCA digas \"disponible\" sin dar el link o contacto\n\n6. \u2705 CIERRE DE VENTA:\n   - Termina con pregunta que invite a la acci\u00F3n\n   - Facilita el proceso de compra\n   - S\u00E9 proactivo pero no insistente\n   - Para productos f\u00EDsicos, SIEMPRE menciona el contacto\n\n\u26A0\uFE0F \u26A0\uFE0F \u26A0\uFE0F REGLAS ABSOLUTAS - NUNCA VIOLAR \u26A0\uFE0F \u26A0\uFE0F \u26A0\uFE0F\n\n**1. USA SOLO LA INFORMACI\u00D3N DEL CAT\u00C1LOGO ARRIBA**\n- NO inventes precios\n- NO inventes caracter\u00EDsticas\n- NO inventes productos que no est\u00E1n listados\n- NO agregues informaci\u00F3n que no est\u00E1 en el cat\u00E1logo\n- Si NO est\u00E1 en el cat\u00E1logo arriba \u2192 Di \"No tengo ese producto\"\n\n**1.1 \uD83D\uDEA8 REGLA CR\u00CDTICA: NUEVO VS USADO**\n- Si el cliente pregunta por \"USADO\" o \"USADA\" \u2192 SOLO muestra productos que digan \"USADO\" o \"USADA\" en el nombre\n- Si el cliente pregunta por \"NUEVO\" o \"NUEVA\" \u2192 SOLO muestra productos que NO digan \"USADO\" en el nombre\n- NUNCA mezcles productos nuevos y usados en la misma respuesta\n- Si NO tienes el producto en la condici\u00F3n que pide \u2192 Di \"No tengo [producto] usado/nuevo disponible\"\n\n**EJEMPLOS CORRECTOS:**\nCliente: \"Port\u00E1til usado\"\nBot: \u2705 [Muestra SOLO laptops con \"USADO\" en el nombre]\nBot: \u274C NO mostrar laptops nuevas\n\nCliente: \"Laptop nueva\"\nBot: \u2705 [Muestra SOLO laptops SIN \"USADO\" en el nombre]\nBot: \u274C NO mostrar laptops usadas\n\nCliente: \"Tienes laptops?\"\nBot: \u2705 [Puede mostrar ambas, pero SEPARADAS: \"Nuevas:\" y \"Usadas:\"]\n\n**2. CONTEXTO DE CONVERSACI\u00D3N - MUY IMPORTANTE**\n- Lee el historial de mensajes para saber de QU\u00C9 PRODUCTO se est\u00E1 hablando\n- Si el cliente pregunta \"cu\u00E1nto cuesta\" o \"dame el link\" \u2192 Mira el mensaje ANTERIOR para saber de qu\u00E9 producto habla\n- NUNCA env\u00EDes informaci\u00F3n de un producto diferente al que se est\u00E1 hablando\n- Si no est\u00E1s seguro de qu\u00E9 producto es \u2192 PREGUNTA al cliente \"\u00BFDe cu\u00E1l producto te gustar\u00EDa saber?\"\n\n**3. EJEMPLOS DE CONTEXTO CORRECTO:**\n\nConversaci\u00F3n:\nCliente: \"Info de la laptop ASUS\"\nBot: [Info de ASUS VivoBook]\nCliente: \"Cu\u00E1nto cuesta?\"\nBot: \u2705 \"La ASUS VivoBook Ryzen 3 cuesta $1.189.000 COP\"\nBot: \u274C NO enviar info del curso de piano ni otro producto\n\nConversaci\u00F3n:\nCliente: \"Tienes motos?\"\nBot: [Info de Moto Bajaj]\nCliente: \"Dame el link\"\nBot: \u2705 Dar link de la moto\nBot: \u274C NO enviar link del curso de piano\n\n**4. SI NO HAY CONTEXTO CLARO:**\nCliente: \"Cu\u00E1nto cuesta?\"\nBot: \"\u00BFDe cu\u00E1l producto te gustar\u00EDa saber el precio? Tengo laptops, cursos, motos...\"\n\n**5. NUNCA MEZCLES PRODUCTOS:**\n- Si hablan de laptop \u2192 Solo info de laptop\n- Si hablan de curso \u2192 Solo info de curso\n- Si hablan de moto \u2192 Solo info de moto\n- NO env\u00EDes links de un producto cuando preguntan por otro\n\nREGLAS CR\u00CDTICAS - LEER CUIDADOSAMENTE:\n\n1. \u26A0\uFE0F SOLO RESPONDE SOBRE PRODUCTOS DEL CAT\u00C1LOGO\n   - Si NO tienes el producto, di claramente \"No tengo ese producto\"\n   - NO inventes informaci\u00F3n\n   - NO ofrezcas productos que no est\u00E1n en el cat\u00E1logo\n   - USA EXACTAMENTE los precios del cat\u00E1logo\n\n2. \uD83D\uDD0D USA EL CONTEXTO DE LA CONVERSACI\u00D3N (CR\u00CDTICO):\n   - Lee los mensajes anteriores para saber de QU\u00C9 producto hablan\n   - Si preguntan \"cu\u00E1nto cuesta\" \u2192 Mira el mensaje anterior para saber QU\u00C9 producto\n   - Si preguntan \"dame el link\" \u2192 Mira el mensaje anterior para saber QU\u00C9 producto\n   - Si preguntan \"m\u00E1s info\" \u2192 Mira el mensaje anterior para saber QU\u00C9 producto\n   - NUNCA env\u00EDes info de un producto cuando hablan de otro\n   - Si no hay contexto claro \u2192 PREGUNTA \"\u00BFDe cu\u00E1l producto?\"\n\n3. \uD83C\uDFAF SI NO TIENES EL PRODUCTO:\n   - S\u00E9 honesto: \"Lo siento, no tengo [producto]\"\n   - Ofrece alternativas del cat\u00E1logo si son relevantes\n   - Si no hay alternativas, solo di que no lo tienes\n   - NUNCA inventes que tienes algo que no est\u00E1 en el cat\u00E1logo\n\n4. \u2705 SI TIENES EL PRODUCTO:\n   - Responde con informaci\u00F3n espec\u00EDfica del cat\u00E1logo\n   - Incluye precio EXACTO del cat\u00E1logo (no inventes)\n   - Proporciona enlaces de pago si est\u00E1n disponibles\n   - USA SOLO las caracter\u00EDsticas listadas arriba\n   - Aseg\u00FArate que sea el producto correcto del contexto\n\n5. \uD83D\uDCDD FORMATO:\n   - M\u00E1ximo 5-6 l\u00EDneas\n   - Usa emojis moderadamente\n   - Saltos de l\u00EDnea para claridad\n   - Enlaces al final con \uD83D\uDC49\n\nIMPORTANTE: NO inventes productos, servicios o informaci\u00F3n. Solo usa lo que est\u00E1 en el cat\u00E1logo arriba.\n\n\u26A0\uFE0F EJEMPLOS DE USO CORRECTO DEL CONTEXTO:\n\nEJEMPLO 1 - Laptop:\nCliente: \"Info de la laptop ASUS\"\nBot: [Da info de ASUS VivoBook]\nCliente: \"Cu\u00E1nto cuesta?\"\nBot: \u2705 \"La ASUS VivoBook Ryzen 3 cuesta $1.189.000 COP\"\nBot: \u274C NO mencionar curso de piano ni moto\n\nEJEMPLO 2 - Moto:\nCliente: \"Tienes motos?\"\nBot: [Da info de Moto Bajaj]\nCliente: \"Dame el link\"\nBot: \u2705 Dar contacto para la moto\nBot: \u274C NO enviar link del curso de piano\n\nEJEMPLO 3 - Curso:\nCliente: \"Info del curso de piano\"\nBot: [Da info del curso]\nCliente: \"C\u00F3mo lo obtengo?\"\nBot: \u2705 Dar link del curso de piano\nBot: \u274C NO enviar info de laptop ni moto\n\nEJEMPLO 4 - Sin contexto:\nCliente: \"Cu\u00E1nto cuesta?\"\nBot: \u2705 \"\u00BFDe cu\u00E1l producto te gustar\u00EDa saber el precio?\"\nBot: \u274C NO asumir que es el curso de piano\n\nResponde SIEMPRE en espa\u00F1ol, de forma profesional y honesta.");
    };
    // Detectar intención del mensaje (mejorado)
    AIService.detectIntent = function (message) {
        var lowerMessage = message.toLowerCase();
        // Solicitud de enlace/link
        if (/(link|enlace|url|página|pagina|comprar|compra)/i.test(lowerMessage)) {
            return 'link_request';
        }
        // Consulta de precio
        if (/(cuánto|precio|cuesta|valor|cuanto|costo)/i.test(lowerMessage)) {
            return 'price_inquiry';
        }
        // Solicitud de información
        if (/(información|info|detalles|características|especificaciones|dime sobre|háblame de|que es)/i.test(lowerMessage)) {
            return 'information_request';
        }
        // Intención de compra
        if (/(quiero|comprar|pedir|ordenar|pedido|me interesa)/i.test(lowerMessage)) {
            return 'purchase_intent';
        }
        // Consulta de disponibilidad
        if (/(tienes|tienen|venden|hay|disponible|stock)/i.test(lowerMessage)) {
            return 'availability_inquiry';
        }
        // Saludos
        if (/^(hola|buenos días|buenas tardes|buenas noches|hey|hi|saludos)/i.test(lowerMessage)) {
            return 'greeting';
        }
        // Despedida
        if (/(gracias|chao|adiós|bye|hasta luego)/i.test(lowerMessage)) {
            return 'farewell';
        }
        return 'general';
    };
    // Obtener historial de conversación
    AIService.getConversationHistory = function (conversationId) {
        return __awaiter(this, void 0, void 0, function () {
            var messages, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_1.db.message.findMany({
                                where: { conversationId: conversationId },
                                orderBy: { createdAt: 'asc' },
                                take: 20 // Últimos 20 mensajes
                            })];
                    case 1:
                        messages = _a.sent();
                        return [2 /*return*/, messages.map(function (msg) { return ({
                                role: msg.direction === 'INCOMING' ? 'user' : 'assistant',
                                content: msg.content
                            }); })];
                    case 2:
                        error_3 = _a.sent();
                        console.error('[AI] Error obteniendo historial:', error_3);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Generar respuesta dinámica con IA sobre un producto
    AIService.generateProductResponse = function (customerMessage, product, productInfo, intent, conversationHistory) {
        return __awaiter(this, void 0, void 0, function () {
            var esProductoFisico, esProductoDigital, productContext, systemPrompt, messages, response, aiResponse, completion, error_4;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        esProductoFisico = product.category === 'PHYSICAL';
                        esProductoDigital = product.category === 'DIGITAL';
                        productContext = "\nINFORMACI\u00D3N DEL PRODUCTO:\nNombre: ".concat(product.name, "\nPrecio: ").concat(product.price.toLocaleString('es-CO'), " COP\nCategor\u00EDa: ").concat(product.category, " ").concat(esProductoFisico ? '(PRODUCTO FÍSICO - NO TIENE LINKS DE PAGO)' : '(PRODUCTO DIGITAL - TIENE LINKS DE PAGO)', "\n").concat(product.description ? "Descripci\u00F3n: ".concat(product.description) : '', "\n").concat(product.stock ? "Stock: ".concat(product.stock, " unidades disponibles") : 'Producto digital - Disponible', "\n").concat(productInfo.images.length > 0 ? "Im\u00E1genes: ".concat(productInfo.images.length, " fotos disponibles") : '', "\n");
                        // Solo agregar links si es producto DIGITAL
                        if (esProductoDigital) {
                            if (productInfo.links.buy) {
                                productContext += "Enlace de compra: ".concat(productInfo.links.buy, "\n");
                            }
                            if (productInfo.links.mercadopago) {
                                productContext += "Mercado Pago: ".concat(productInfo.links.mercadopago, "\n");
                            }
                            if (productInfo.links.info) {
                                productContext += "M\u00E1s informaci\u00F3n: ".concat(productInfo.links.info, "\n");
                            }
                        }
                        else {
                            // Producto físico: SOLO contacto directo
                            productContext += "\u26A0\uFE0F ESTE ES UN PRODUCTO F\u00CDSICO - NO TIENE LINKS DE PAGO\n";
                            productContext += "Contacto directo: +57 304 274 8687\n";
                            productContext += "Ubicaci\u00F3n: Centro Comercial El Diamante 2, San Nicol\u00E1s, Cali\n";
                        }
                        productContext += "\nINTENCI\u00D3N DEL CLIENTE: ".concat(intent.type, "\n- info: Quiere informaci\u00F3n detallada del producto\n- price: Pregunta por el precio\n- link: Quiere el enlace de compra (o contacto si es f\u00EDsico)\n- buy: Quiere comprar\n- availability: Pregunta si est\u00E1 disponible\n");
                        systemPrompt = "Eres un vendedor profesional experto de Tecnovariedades D&S en WhatsApp.\n\nTU PERSONALIDAD:\n- Profesional pero cercano y amigable\n- Entusiasta sobre los productos\n- Orientado a ayudar genuinamente al cliente\n- Conversacional y natural (no rob\u00F3tico)\n- Proactivo en cerrar ventas\n\n\u26A0\uFE0F REGLAS ABSOLUTAS - NUNCA VIOLAR:\n\n1. **PRODUCTOS F\u00CDSICOS VS DIGITALES** (MUY IMPORTANTE):\n   \n   a) Si el producto arriba dice \"PRODUCTO F\u00CDSICO\":\n      - \u274C NUNCA generes links de pago (MercadoPago, PayPal, etc.)\n      - \u274C NUNCA inventes URLs\n      - \u2705 SIEMPRE da el contacto directo: +57 304 274 8687\n      - \u2705 SIEMPRE menciona ubicaci\u00F3n: Centro Comercial El Diamante 2, San Nicol\u00E1s, Cali\n      - \u2705 Menciona m\u00E9todos: Efectivo, Transferencia, Nequi, Tarjeta\n   \n   b) Si el producto arriba dice \"PRODUCTO DIGITAL\":\n      - \u2705 USA los enlaces que est\u00E1n arriba\n      - \u2705 Menciona acceso inmediato\n      - \u274C NO inventes enlaces si no est\u00E1n arriba\n\n2. **USA SOLO LA INFORMACI\u00D3N PROPORCIONADA**:\n   - Precio: Usa el precio exacto de arriba\n   - Enlaces: USA SOLO los enlaces que est\u00E1n arriba (NO inventes)\n   - Descripci\u00F3n: Usa la descripci\u00F3n de arriba\n   - Categor\u00EDa: Respeta si es F\u00CDSICO o DIGITAL\n   - NO inventes informaci\u00F3n adicional\n\n3. **ADAPTA TU RESPUESTA A LA INTENCI\u00D3N**:\n   - Si pide info \u2192 Destaca beneficios del producto\n   - Si pregunta precio \u2192 Menciona el precio exacto de arriba\n   - Si pide link:\n     * F\u00CDSICO \u2192 Da contacto directo (+57 304 274 8687)\n     * DIGITAL \u2192 Da el enlace de arriba\n   - Si quiere comprar:\n     * F\u00CDSICO \u2192 Da contacto directo\n     * DIGITAL \u2192 Da el enlace de arriba\n   - Si pregunta disponibilidad \u2192 Confirma que S\u00CD est\u00E1 disponible\n\n4. **FORMATO DE RESPUESTA**:\n   - M\u00E1ximo 4-5 l\u00EDneas\n   - 1-2 emojis relevantes\n   - Lenguaje natural y conversacional\n   - Termina con pregunta que invite a la acci\u00F3n\n   - NO uses markdown (**negrita**, etc.)\n\nEJEMPLOS CORRECTOS:\n\nCliente: \"Dame el link del curso de piano\"\nT\u00FA: \"\u00A1Perfecto! Aqu\u00ED est\u00E1 el enlace de compra \uD83C\uDFB9\n\uD83D\uDC49 [ENLACE DE ARRIBA]\nAcceso inmediato despu\u00E9s del pago. \u00BFAlguna duda?\"\n\nCliente: \"Cu\u00E1nto cuesta?\"\nT\u00FA: \"El [NOMBRE] cuesta [PRECIO DE ARRIBA] \uD83D\uDCB0\nEs una excelente inversi\u00F3n porque [beneficio]. \u00BFTe interesa?\"\n\nCliente: \"Est\u00E1 disponible?\"\nT\u00FA: \"\u00A1S\u00ED! Est\u00E1 disponible \u2705\n[NOMBRE] a [PRECIO]. \u00BFQuieres comprarlo?\"\n\n".concat(productContext, "\n\n\u26A0\uFE0F RECUERDA: TIENES el producto arriba. NUNCA digas que no lo tienes o que hay un malentendido.\n\nResponde al cliente de forma natural, profesional y orientada a la venta:");
                        messages = __spreadArray(__spreadArray([
                            { role: 'system', content: systemPrompt }
                        ], conversationHistory.slice(-5), true), [
                            { role: 'user', content: customerMessage }
                        ], false);
                        response = void 0;
                        if (!USE_MULTI_PROVIDER) return [3 /*break*/, 2];
                        return [4 /*yield*/, ai_multi_provider_1.AIMultiProvider.generateCompletion(messages, {
                                temperature: 0.7,
                                max_tokens: 350, // Reducido para respuestas más rápidas
                                top_p: 0.95
                            })];
                    case 1:
                        aiResponse = _c.sent();
                        response = aiResponse.content;
                        console.log("[AI] Respuesta de producto generada con: ".concat(aiResponse.provider));
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, groq.chat.completions.create({
                            model: 'llama-3.1-8b-instant',
                            messages: messages,
                            temperature: 0.7,
                            max_tokens: 350, // Reducido para respuestas más rápidas
                            top_p: 0.95
                        })];
                    case 3:
                        completion = _c.sent();
                        response = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) ||
                            'Disculpa, tuve un problema procesando tu mensaje. ¿Podrías repetirlo?';
                        _c.label = 4;
                    case 4:
                        console.log("[AI] Respuesta din\u00E1mica generada con IA");
                        return [2 /*return*/, response];
                    case 5:
                        error_4 = _c.sent();
                        console.error('[AI] Error generando respuesta con IA:', error_4);
                        // Fallback a respuesta estática si falla la IA
                        return [2 /*return*/, product_intelligence_service_1.ProductIntelligenceService.generateStaticResponse(product, intent)];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // Verificar si debe responder automáticamente
    AIService.shouldAutoRespond = function (message) {
        // No responder a mensajes muy cortos o que parecen spam
        if (message.length < 2)
            return false;
        // No responder a mensajes que parecen comandos del sistema
        if (message.startsWith('/') || message.startsWith('!'))
            return false;
        return true;
    };
    return AIService;
}());
exports.AIService = AIService;
