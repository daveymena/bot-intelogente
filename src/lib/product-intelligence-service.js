"use strict";
/**
 * 🧠 SERVICIO DE INTELIGENCIA DE PRODUCTOS
 * Maneja respuestas específicas e inteligentes sobre productos
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
exports.ProductIntelligenceService = void 0;
var db_1 = require("./db");
var ProductIntelligenceService = /** @class */ (function () {
    function ProductIntelligenceService() {
    }
    /**
     * Extraer palabras clave del mensaje
     */
    ProductIntelligenceService.extractKeywords = function (query) {
        var queryLower = query.toLowerCase();
        // Palabras a ignorar (stop words) - AMPLIADO
        var stopWords = [
            'info', 'información', 'informacion', 'dame', 'el', 'la', 'los', 'las',
            'un', 'una', 'del', 'de', 'cuánto', 'cuanto', 'cuesta', 'precio',
            'quiero', 'deseo', 'necesito', 'busco', 'hay', 'tienes', 'tienen', 'tiene',
            'disponible', 'link', 'enlace', 'comprar', 'sobre', 'acerca', 'ese',
            'esa', 'esto', 'esta', 'para', 'por', 'con', 'sin', 'más', 'mas',
            'sus', 'papeles', 'día', 'dia', 'documentos', 'garantía', 'garantia',
            'color', 'colores', 'envío', 'envio', 'entrega', 'pago', 'pagos',
            'métodos', 'metodos', 'forma', 'formas', 'como', 'cómo', 'que', 'qué',
            'ver', 'veo', 'vea', 'veas', 'ves', 'fotos', 'foto', 'imagen', 'imagenes',
            'detalles', 'detalle', 'características', 'caracteristicas', 'especificaciones',
            'saber', 'conocer', 'mostrar', 'muestra', 'muestrame', 'muéstrame',
            'enviar', 'envia', 'envía', 'manda', 'mandar', 'pasa', 'pasar',
            'puedes', 'puede', 'podría', 'podria', 'podrías', 'podrias',
            'gustaría', 'gustaria', 'quisiera', 'me', 'te', 'le', 'nos', 'les',
            'si', 'sí', 'no', 'tal', 'vez', 'quizá', 'quizás', 'quiza', 'quizas'
        ];
        // Dividir en palabras y filtrar
        var words = queryLower
            .split(/\s+/)
            .map(function (word) { return word.replace(/[?¿!¡.,;:]/g, ''); }) // Quitar puntuación de cada palabra
            .filter(function (word) { return word.length > 2; }) // Palabras de más de 2 caracteres
            .filter(function (word) { return !stopWords.includes(word); });
        return words;
    };
    /**
     * Buscar producto específico en la base de datos
     */
    ProductIntelligenceService.findProduct = function (query, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var queryLower_1, keywords_1, buscaUsado, buscaNuevo, allProducts, filteredProducts, specificMatches, _loop_1, _i, specificMatches_1, match, state_1, scoredProducts, bestMatch, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("\uD83D\uDD0D [Product Intelligence] Buscando producto: \"".concat(query, "\""));
                        queryLower_1 = query.toLowerCase();
                        keywords_1 = this.extractKeywords(query);
                        console.log("\uD83D\uDD11 [Product Intelligence] Palabras clave: ".concat(keywords_1.join(', ')));
                        // ⚠️ IMPORTANTE: Si no hay palabras clave significativas, NO buscar
                        // Esto evita búsquedas incorrectas con mensajes genéricos como "ver más información"
                        if (keywords_1.length === 0) {
                            console.log("\u274C [Product Intelligence] No hay palabras clave significativas - usar contexto de memoria");
                            return [2 /*return*/, null];
                        }
                        buscaUsado = queryLower_1.includes('usado') ||
                            queryLower_1.includes('usada') ||
                            queryLower_1.includes('segunda mano') ||
                            queryLower_1.includes('reacondicionado');
                        buscaNuevo = queryLower_1.includes('nuevo') ||
                            queryLower_1.includes('nueva') ||
                            queryLower_1.includes('0 km') ||
                            queryLower_1.includes('sin usar');
                        console.log("\uD83D\uDD0D [Product Intelligence] Filtro - Usado: ".concat(buscaUsado, ", Nuevo: ").concat(buscaNuevo));
                        return [4 /*yield*/, db_1.db.product.findMany({
                                where: {
                                    userId: userId,
                                    status: 'AVAILABLE'
                                }
                            })];
                    case 1:
                        allProducts = _a.sent();
                        if (allProducts.length === 0) {
                            console.log("\u274C [Product Intelligence] No hay productos disponibles");
                            return [2 /*return*/, null];
                        }
                        filteredProducts = allProducts;
                        if (buscaUsado) {
                            filteredProducts = allProducts.filter(function (p) {
                                var nameLower = p.name.toLowerCase();
                                var descLower = (p.description || '').toLowerCase();
                                var esUsado = nameLower.includes('usado') ||
                                    nameLower.includes('usada') ||
                                    descLower.includes('usado') ||
                                    descLower.includes('usada');
                                return esUsado;
                            });
                            console.log("\uD83D\uDD0D [Product Intelligence] Filtrados ".concat(filteredProducts.length, " productos USADOS"));
                        }
                        else if (buscaNuevo) {
                            filteredProducts = allProducts.filter(function (p) {
                                var nameLower = p.name.toLowerCase();
                                var descLower = (p.description || '').toLowerCase();
                                var esUsado = nameLower.includes('usado') ||
                                    nameLower.includes('usada') ||
                                    descLower.includes('usado') ||
                                    descLower.includes('usada');
                                return !esUsado; // Solo productos que NO son usados
                            });
                            console.log("\uD83D\uDD0D [Product Intelligence] Filtrados ".concat(filteredProducts.length, " productos NUEVOS"));
                        }
                        if (filteredProducts.length === 0) {
                            console.log("\u274C [Product Intelligence] No hay productos ".concat(buscaUsado ? 'USADOS' : 'NUEVOS', " disponibles"));
                            return [2 /*return*/, null];
                        }
                        specificMatches = [
                            { keywords: ['piano'], name: 'piano', searchIn: 'name' },
                            { keywords: ['macbook', 'mac', 'apple'], name: 'macbook', searchIn: 'name' },
                            { keywords: ['moto', 'pulsar', 'bajaj'], name: 'bajaj', searchIn: 'name' },
                            { keywords: ['asus', 'vivobook'], name: 'asus', searchIn: 'name' },
                            { keywords: ['laptop', 'laptops', 'portatil', 'computador', 'computadora'], name: 'laptop', searchIn: 'name' },
                            { keywords: ['hp'], name: 'hp', searchIn: 'name' },
                            { keywords: ['lenovo'], name: 'lenovo', searchIn: 'name' },
                            { keywords: ['mega', 'pack', 'megapack'], name: 'mega pack', searchIn: 'name' }
                        ];
                        _loop_1 = function (match) {
                            var hasKeywordInQuery = match.keywords.some(function (kw) { return queryLower_1.includes(kw); });
                            if (hasKeywordInQuery) {
                                // Buscar producto que contenga el nombre en su nombre o descripción
                                // 🚨 USAR filteredProducts en lugar de allProducts
                                var found = filteredProducts.find(function (p) {
                                    var nameLower = p.name.toLowerCase();
                                    var descLower = (p.description || '').toLowerCase();
                                    // Para "laptop", buscar cualquier laptop
                                    if (match.name === 'laptop') {
                                        return nameLower.includes('laptop') ||
                                            nameLower.includes('asus') ||
                                            nameLower.includes('hp') ||
                                            nameLower.includes('lenovo') ||
                                            nameLower.includes('macbook') ||
                                            descLower.includes('laptop');
                                    }
                                    // Buscar en nombre (ya está en minúsculas)
                                    return nameLower.includes(match.name);
                                });
                                if (found) {
                                    console.log("\u2705 [Product Intelligence] Producto espec\u00EDfico encontrado: ".concat(found.name));
                                    return { value: found };
                                }
                            }
                        };
                        // Buscar por coincidencias específicas (buscar en el mensaje original, no solo en keywords)
                        for (_i = 0, specificMatches_1 = specificMatches; _i < specificMatches_1.length; _i++) {
                            match = specificMatches_1[_i];
                            state_1 = _loop_1(match);
                            if (typeof state_1 === "object")
                                return [2 /*return*/, state_1.value];
                        }
                        scoredProducts = filteredProducts.map(function (p) {
                            var score = 0;
                            var nameLower = p.name.toLowerCase();
                            var descLower = (p.description || '').toLowerCase();
                            var tagsLower = (p.tags || '').toLowerCase();
                            keywords_1.forEach(function (keyword) {
                                var keywordLower = keyword.toLowerCase(); // Asegurar minúsculas
                                // Coincidencia exacta en nombre vale mucho más
                                if (nameLower.includes(keywordLower))
                                    score += 15;
                                if (descLower.includes(keywordLower))
                                    score += 3;
                                if (tagsLower.includes(keywordLower))
                                    score += 2;
                                // Bonus: coincidencia al inicio del nombre
                                if (nameLower.startsWith(keywordLower))
                                    score += 5;
                                // Bonus: palabra completa en el nombre
                                var nameWords = nameLower.split(/\s+/);
                                if (nameWords.some(function (word) { return word === keywordLower; }))
                                    score += 10;
                            });
                            return { product: p, score: score };
                        });
                        bestMatch = scoredProducts
                            .filter(function (sp) { return sp.score >= 5; })
                            .sort(function (a, b) { return b.score - a.score; })[0];
                        if (bestMatch) {
                            console.log("\u2705 [Product Intelligence] Producto encontrado: ".concat(bestMatch.product.name, " (score: ").concat(bestMatch.score, ")"));
                            return [2 /*return*/, bestMatch.product];
                        }
                        console.log("\u274C [Product Intelligence] No se encontraron productos con suficiente coincidencia (score m\u00EDnimo: 5)");
                        return [2 /*return*/, null];
                    case 2:
                        error_1 = _a.sent();
                        console.error('❌ [Product Intelligence] Error buscando producto:', error_1);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Detectar la intención del cliente
     */
    ProductIntelligenceService.detectIntent = function (message) {
        var messageLower = message.toLowerCase();
        // Intención: LINK/ENLACE
        if (/(link|enlace|url|página|pagina|dame el|envía|envia|manda|pasa).*(link|enlace|url|página|pagina)/i.test(messageLower) ||
            /^(link|enlace|url)$/i.test(messageLower)) {
            return {
                type: 'link',
                confidence: 0.95,
                keywords: ['link', 'enlace', 'url']
            };
        }
        // Intención: COMPRAR
        if (/(quiero|deseo|me gustaría|quisiera).*(comprar|adquirir|pedir|ordenar)/i.test(messageLower) ||
            /(comprar|compra|pedido|orden)/i.test(messageLower)) {
            return {
                type: 'buy',
                confidence: 0.95,
                keywords: ['comprar', 'pedido']
            };
        }
        // Intención: PRECIO
        if (/(cuánto|cuanto|precio|cuesta|valor|vale|costo)/i.test(messageLower)) {
            return {
                type: 'price',
                confidence: 0.9,
                keywords: ['precio', 'cuesta']
            };
        }
        // Intención: DISPONIBILIDAD
        if (/(disponible|stock|hay|tienen|tienes|queda|quedan)/i.test(messageLower)) {
            return {
                type: 'availability',
                confidence: 0.85,
                keywords: ['disponible', 'stock']
            };
        }
        // Intención: INFORMACIÓN
        if (/(info|información|informacion|detalles|características|caracteristicas|especificaciones|sobre|acerca)/i.test(messageLower)) {
            return {
                type: 'info',
                confidence: 0.9,
                keywords: ['info', 'detalles']
            };
        }
        // Por defecto: GENERAL
        return {
            type: 'general',
            confidence: 0.7,
            keywords: []
        };
    };
    /**
     * Extraer enlaces del producto (SOLO para productos digitales)
     */
    ProductIntelligenceService.extractLinks = function (product) {
        var _a;
        var links = {};
        try {
            // Intentar parsear tags como JSON
            var tags = product.tags ? JSON.parse(product.tags) : [];
            for (var _i = 0, tags_1 = tags; _i < tags_1.length; _i++) {
                var tag = tags_1[_i];
                if (typeof tag === 'string') {
                    // Extraer tags con prefijos de métodos de pago
                    if (tag.startsWith('hotmart:')) {
                        links.buy = tag.replace('hotmart:', '');
                    }
                    else if (tag.startsWith('mercadopago:')) {
                        links.mercadopago = tag.replace('mercadopago:', '');
                    }
                    else if (tag.startsWith('paypal:')) {
                        links.paypal = tag.replace('paypal:', '');
                    }
                    else if (tag.startsWith('contacto:')) {
                        links.contacto = tag.replace('contacto:', '');
                    }
                    else if (tag.startsWith('http')) {
                        // URLs sin prefijo
                        if (tag.includes('pay.hotmart') || tag.includes('checkout') || tag.includes('buy')) {
                            links.buy = tag;
                        }
                        else if (tag.includes('landein') || tag.includes('page') || tag.includes('info')) {
                            links.info = tag;
                        }
                        else if (!links.info) {
                            links.info = tag;
                        }
                    }
                }
            }
        }
        catch (e) {
            // Si no es JSON, buscar URLs en el string
            var urlRegex = /(https?:\/\/[^\s,]+)/g;
            var matches = ((_a = product.tags) === null || _a === void 0 ? void 0 : _a.match(urlRegex)) || [];
            for (var _b = 0, matches_1 = matches; _b < matches_1.length; _b++) {
                var url = matches_1[_b];
                if (url.includes('pay.hotmart') || url.includes('checkout')) {
                    links.buy = url;
                }
                else if (!links.info) {
                    links.info = url;
                }
            }
        }
        // ⚠️ SOLO GENERAR ENLACES PARA PRODUCTOS DIGITALES
        // Productos físicos NO tienen links de pago automáticos
        if (product.category === 'DIGITAL') {
            // Si no tiene MercadoPago configurado, no generar
            // Solo usar los links que están en los tags
            if (!links.buy && !links.mercadopago && !links.paypal) {
                // No generar links dinámicos, dejar vacío
                // El bot ofrecerá contacto directo
            }
        }
        else {
            // Productos físicos: NUNCA generar links de pago
            // Limpiar cualquier link que se haya extraído por error
            links.buy = undefined;
            links.mercadopago = undefined;
            links.paypal = undefined;
            // Agregar contacto directo
            links.contacto = '+57 304 274 8687';
        }
        return links;
    };
    /**
     * Extraer imágenes del producto
     */
    ProductIntelligenceService.extractImages = function (product) {
        try {
            return product.images ? JSON.parse(product.images) : [];
        }
        catch (e) {
            return [];
        }
    };
    /**
     * Generar respuesta según la intención
     */
    ProductIntelligenceService.generateResponse = function (product, intent, context) {
        return __awaiter(this, void 0, void 0, function () {
            var links, images, hasLinks, emoji, text;
            return __generator(this, function (_a) {
                links = this.extractLinks(product);
                images = this.extractImages(product);
                hasLinks = !!(links.info || links.buy);
                emoji = this.getProductEmoji(product);
                text = '';
                switch (intent.type) {
                    case 'info':
                        text = this.generateInfoResponse(product, emoji, links, images);
                        break;
                    case 'price':
                        text = this.generatePriceResponse(product, emoji, links);
                        break;
                    case 'link':
                        text = this.generateLinkResponse(product, emoji, links);
                        break;
                    case 'buy':
                        text = this.generateBuyResponse(product, emoji, links);
                        break;
                    case 'availability':
                        text = this.generateAvailabilityResponse(product, emoji);
                        break;
                    default:
                        text = this.generateGeneralResponse(product, emoji, links, images);
                }
                return [2 /*return*/, {
                        text: text,
                        product: product,
                        intent: intent,
                        hasLinks: hasLinks,
                        links: links,
                        images: images
                    }];
            });
        });
    };
    /**
     * Generar respuesta de INFORMACIÓN
     */
    ProductIntelligenceService.generateInfoResponse = function (product, emoji, links, images) {
        var response = "".concat(emoji, " **").concat(product.name, "**\n\n");
        if (product.description) {
            // Extraer características si están en formato de lista
            var lines = product.description.split(/[,\n]/).filter(function (l) { return l.trim(); });
            if (lines.length > 1) {
                lines.slice(0, 5).forEach(function (line) {
                    response += "\u2705 ".concat(line.trim(), "\n");
                });
            }
            else {
                response += "".concat(product.description, "\n\n");
            }
        }
        response += "\n\uD83D\uDCB0 Precio: $".concat(product.price.toLocaleString('es-CO'), " COP\n");
        if (product.stock) {
            response += "\uD83D\uDCE6 ".concat(product.stock, " unidades disponibles\n");
        }
        if (images.length > 0) {
            response += "\uD83D\uDCF8 ".concat(images.length, " foto").concat(images.length > 1 ? 's' : '', " disponible").concat(images.length > 1 ? 's' : '', "\n");
        }
        response += "\n\u00BFTe interesa?";
        return response;
    };
    /**
     * Generar respuesta de PRECIO
     */
    ProductIntelligenceService.generatePriceResponse = function (product, emoji, links) {
        var response = "El ".concat(product.name, " cuesta $").concat(product.price.toLocaleString('es-CO'), " COP ").concat(emoji, "\n\n");
        if (product.stock) {
            response += "Tenemos ".concat(product.stock, " unidades disponibles.\n");
        }
        if (links.buy) {
            response += "\u00BFDeseas el enlace de compra?";
        }
        else {
            response += "\u00BFDeseas m\u00E1s informaci\u00F3n o hacer el pedido?";
        }
        return response;
    };
    /**
     * Generar respuesta de LINK
     */
    ProductIntelligenceService.generateLinkResponse = function (product, emoji, links) {
        // Productos físicos: SIEMPRE contacto directo
        if (product.category === 'PHYSICAL') {
            return "Para adquirir ".concat(product.name, " ").concat(emoji, ", cont\u00E1ctanos directamente:\n\n\uD83D\uDCDE WhatsApp: +57 304 274 8687\n\uD83D\uDCE7 deinermen25@gmail.com\n\uD83D\uDCCD Centro Comercial El Diamante 2, San Nicol\u00E1s, Cali\n\nM\u00E9todos de pago:\n\u2705 Efectivo\n\u2705 Transferencia\n\u2705 Nequi/Daviplata\n\u2705 Tarjeta");
        }
        // Productos digitales: Verificar si tiene links
        if (!links.buy && !links.mercadopago && !links.paypal) {
            return "Para adquirir ".concat(product.name, " ").concat(emoji, ", cont\u00E1ctanos:\n\n\uD83D\uDCF1 WhatsApp: +57 304 274 8687\n\uD83D\uDCE7 deinermen25@gmail.com");
        }
        var response = "\u00A1Perfecto! ".concat(emoji, "\n\n");
        if (links.buy) {
            response += "Aqu\u00ED est\u00E1 el enlace de compra:\n\uD83D\uDC49 ".concat(links.buy, "\n\n");
        }
        if (links.mercadopago && !links.buy) {
            response += "Mercado Pago:\n\uD83D\uDC49 ".concat(links.mercadopago, "\n\n");
        }
        if (links.info) {
            response += "Tambi\u00E9n puedes ver m\u00E1s info aqu\u00ED:\n\uD83D\uDCC4 ".concat(links.info, "\n\n");
        }
        response += "Acceso inmediato despu\u00E9s del pago \u2705";
        return response;
    };
    /**
     * Generar respuesta de COMPRA
     */
    ProductIntelligenceService.generateBuyResponse = function (product, emoji, links) {
        var response = "\u00A1Excelente decisi\u00F3n! \uD83C\uDF89\n\n";
        response += "".concat(product.name, ": ").concat(product.price.toLocaleString('es-CO'), " COP\n\n");
        // Productos físicos: SIEMPRE contacto directo
        if (product.category === 'PHYSICAL') {
            response += "Para hacer tu pedido:\n\uD83D\uDCF1 WhatsApp: +57 304 274 8687\n\uD83D\uDCE7 deinermen25@gmail.com\n\uD83D\uDCCD Centro Comercial El Diamante 2, San Nicol\u00E1s, Cali\n\nM\u00E9todos de pago:\n\u2705 Efectivo\n\u2705 Transferencia\n\u2705 Nequi/Daviplata\n\u2705 Tarjeta";
            return response;
        }
        // Productos digitales: Verificar links
        if (links.buy) {
            response += "Compra aqu\u00ED:\n\uD83D\uDC49 ".concat(links.buy, "\n\n");
            response += "Acceso inmediato despu\u00E9s del pago \u2705";
        }
        else if (links.mercadopago) {
            response += "Compra aqu\u00ED:\n\uD83D\uDC49 ".concat(links.mercadopago, "\n\n");
            response += "Acceso inmediato despu\u00E9s del pago \u2705";
        }
        else {
            response += "Para hacer tu pedido:\n\uD83D\uDCF1 WhatsApp: +57 304 274 8687\n\uD83D\uDCE7 deinermen25@gmail.com\n\n";
            response += "\u00BFNecesitas ayuda con algo m\u00E1s?";
        }
        return response;
    };
    /**
     * Generar respuesta de DISPONIBILIDAD
     */
    ProductIntelligenceService.generateAvailabilityResponse = function (product, emoji) {
        var response = "".concat(emoji, " ").concat(product.name, "\n\n");
        if (product.stock && product.stock > 0) {
            response += "\u2705 Disponible: ".concat(product.stock, " unidad").concat(product.stock > 1 ? 'es' : '', "\n\n");
            response += "\u00BFTe gustar\u00EDa hacer el pedido?";
        }
        else if (product.category === 'DIGITAL') {
            response += "\u2705 Disponible (producto digital)\n\n";
            response += "Acceso inmediato despu\u00E9s de la compra";
        }
        else {
            response += "\u26A0\uFE0F Consultar disponibilidad\n\n";
            response += "Cont\u00E1ctanos para verificar stock:\n\uD83D\uDCF1 +57 304 274 8687";
        }
        return response;
    };
    /**
     * Generar respuesta GENERAL
     */
    ProductIntelligenceService.generateGeneralResponse = function (product, emoji, links, images) {
        var response = "".concat(emoji, " **").concat(product.name, "**\n\n");
        response += "\uD83D\uDCB0 $".concat(product.price.toLocaleString('es-CO'), " COP\n");
        if (product.stock) {
            response += "\uD83D\uDCE6 ".concat(product.stock, " disponibles\n");
        }
        if (images.length > 0) {
            response += "\uD83D\uDCF8 ".concat(images.length, " fotos\n");
        }
        response += "\n\u00BFQu\u00E9 te gustar\u00EDa saber?";
        return response;
    };
    /**
     * Obtener emoji según el producto
     */
    ProductIntelligenceService.getProductEmoji = function (product) {
        var name = product.name.toLowerCase();
        if (name.includes('piano') || name.includes('música'))
            return '🎹';
        if (name.includes('laptop') || name.includes('computador'))
            return '💻';
        if (name.includes('macbook') || name.includes('apple'))
            return '🍎';
        if (name.includes('moto') || name.includes('pulsar'))
            return '🏍️';
        if (name.includes('curso') || name.includes('mega pack'))
            return '📚';
        if (name.includes('memoria') || name.includes('ram'))
            return '💾';
        if (name.includes('ssd') || name.includes('disco'))
            return '💿';
        if (name.includes('morral') || name.includes('mochila'))
            return '🎒';
        return '✨';
    };
    /**
     * Extraer información estructurada del producto para la IA
     */
    ProductIntelligenceService.extractProductInfo = function (product) {
        return {
            name: product.name,
            price: product.price,
            priceFormatted: "$".concat(product.price.toLocaleString('es-CO'), " COP"),
            category: product.category,
            description: product.description || '',
            stock: product.stock,
            images: this.extractImages(product),
            links: this.extractLinks(product),
            emoji: this.getProductEmoji(product),
            isDigital: product.category === 'DIGITAL',
            isPhysical: product.category === 'PHYSICAL'
        };
    };
    /**
     * Generar respuesta estática como fallback (si falla la IA)
     */
    ProductIntelligenceService.generateStaticResponse = function (product, intent) {
        var emoji = this.getProductEmoji(product);
        var links = this.extractLinks(product);
        switch (intent.type) {
            case 'info':
                return "".concat(emoji, " ").concat(product.name, "\n\n\uD83D\uDCB0 $").concat(product.price.toLocaleString('es-CO'), " COP\n\n").concat(product.description || 'Excelente producto disponible', "\n\n\u00BFTe interesa?");
            case 'price':
                return "".concat(emoji, " ").concat(product.name, " cuesta $").concat(product.price.toLocaleString('es-CO'), " COP\n\n\u00BFDeseas m\u00E1s informaci\u00F3n?");
            case 'link':
                if (links.buy) {
                    return "\u00A1Perfecto! ".concat(emoji, "\n\nEnlace de compra:\n").concat(links.buy, "\n\n\u00BFAlguna duda?");
                }
                return "Para adquirir ".concat(product.name, ", cont\u00E1ctanos:\n\uD83D\uDCF1 +57 304 274 8687");
            case 'buy':
                return "\u00A1Excelente! ".concat(emoji, "\n\n").concat(product.name, ": $").concat(product.price.toLocaleString('es-CO'), " COP\n\n\u00BFConfirmamos tu pedido?");
            default:
                return "".concat(emoji, " ").concat(product.name, " - $").concat(product.price.toLocaleString('es-CO'), " COP\n\n\u00BFQu\u00E9 te gustar\u00EDa saber?");
        }
    };
    return ProductIntelligenceService;
}());
exports.ProductIntelligenceService = ProductIntelligenceService;
