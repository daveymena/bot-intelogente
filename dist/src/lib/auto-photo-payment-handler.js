"use strict";
/**
 * 🤖 Manejador Automático de Fotos y Links de Pago
 * Detecta solicitudes y responde automáticamente
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoPhotoPaymentHandler = void 0;
const product_photo_sender_1 = require("./product-photo-sender");
const bot_payment_link_generator_1 = require("./bot-payment-link-generator");
const db_1 = require("./db");
class AutoPhotoPaymentHandler {
    /**
     * Procesar mensaje y detectar si solicita fotos o links de pago
     */
    static async handleMessage(socket, userId, customerPhone, messageText, conversationId) {
        try {
            // 1. Detectar solicitud de fotos
            if (product_photo_sender_1.ProductPhotoSender.detectPhotoRequest(messageText)) {
                console.log('[AutoHandler] 📸 Solicitud de fotos detectada');
                await this.handlePhotoRequest(socket, userId, customerPhone, messageText, conversationId);
                return { handled: true, type: 'photo' };
            }
            // 2. Detectar solicitud de links de pago
            // DESACTIVADO: Ahora se maneja con el sistema inteligente en ai-service.ts
            // que usa IA para entender la intención y tiene mejor contexto
            /*
            if (BotPaymentLinkGenerator.detectPaymentRequest(messageText)) {
              console.log('[AutoHandler] 💳 Solicitud de pago detectada');
              await this.handlePaymentRequest(socket, userId, customerPhone, messageText, conversationId);
              return { handled: true, type: 'payment' };
            }
            */
            return { handled: false };
        }
        catch (error) {
            console.error('[AutoHandler] ❌ Error:', error);
            return { handled: false };
        }
    }
    /**
     * Manejar solicitud de fotos
     */
    static async handlePhotoRequest(socket, userId, customerPhone, messageText, conversationId) {
        try {
            console.log('[AutoHandler] 📸 Procesando solicitud de fotos...');
            // Buscar productos relevantes en el contexto de la conversación
            const products = await this.findRelevantProductsFromContext(userId, customerPhone, messageText, conversationId);
            if (products.length === 0) {
                console.log('[AutoHandler] ⚠️ No se encontraron productos en el contexto');
                // Respuesta cuando no hay productos en contexto
                const response = '📸 Claro, con gusto te envío fotos. ¿De qué producto te gustaría ver fotos?\n\n' +
                    'Puedes decirme:\n' +
                    '• "Fotos de laptops"\n' +
                    '• "Muéstrame las motos"\n' +
                    '• "Fotos del Mega Pack 01"\n' +
                    '• O el nombre del producto que te interesa';
                await socket.sendMessage(customerPhone, { text: response });
                await this.saveMessage(userId, customerPhone, response, conversationId);
                return;
            }
            // Enviar mensaje de confirmación
            const confirmMsg = products.length === 1
                ? `📸 Perfecto, te envío la foto de *${products[0].name}*...`
                : `📸 Perfecto, te envío fotos de los ${products.length} productos...`;
            await socket.sendMessage(customerPhone, { text: confirmMsg });
            await this.saveMessage(userId, customerPhone, confirmMsg, conversationId);
            // Pequeña pausa
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Enviar fotos de productos
            const result = await product_photo_sender_1.ProductPhotoSender.sendProductsWithPhotos(socket, customerPhone, products, 5 // Máximo 5 productos
            );
            console.log(`[AutoHandler] ✅ Fotos enviadas: ${result.sent} exitosas, ${result.failed} fallidas`);
            // Mensaje de seguimiento
            await new Promise(resolve => setTimeout(resolve, 2000));
            const followUp = result.sent > 0
                ? `✅ Listo! Te envié ${result.sent === 1 ? 'la foto' : `las ${result.sent} fotos`}.\n\n` +
                    `¿Te gusta? ¿Quieres saber más detalles o proceder con la compra? 😊`
                : '😅 Disculpa, tuve un problema enviando las fotos. ¿Puedes intentar de nuevo?';
            await socket.sendMessage(customerPhone, { text: followUp });
            await this.saveMessage(userId, customerPhone, followUp, conversationId);
        }
        catch (error) {
            console.error('[AutoHandler] ❌ Error en solicitud de fotos:', error);
            const errorMsg = '😅 Disculpa, tuve un problema enviando las fotos. ¿Puedes intentar de nuevo?';
            await socket.sendMessage(customerPhone, { text: errorMsg });
        }
    }
    /**
     * Manejar solicitud de links de pago
     */
    static async handlePaymentRequest(socket, userId, customerPhone, messageText, conversationId) {
        try {
            console.log('[AutoHandler] 💳 Procesando solicitud de pago...');
            console.log('[AutoHandler] 🔍 userId:', userId);
            console.log('[AutoHandler] 🔍 customerPhone:', customerPhone);
            console.log('[AutoHandler] 🔍 conversationId:', conversationId);
            // Buscar productos relevantes en el contexto
            const products = await this.findRelevantProductsFromContext(userId, customerPhone, messageText, conversationId);
            if (products.length === 0) {
                console.log('[AutoHandler] ⚠️ No se encontraron productos en el contexto');
                // Intentar buscar el último producto mencionado en la BD
                const lastProduct = await this.findLastMentionedProductInDB(conversationId);
                if (lastProduct) {
                    console.log(`[AutoHandler] ✅ Producto encontrado en BD: ${lastProduct.name}`);
                    // Enviar mensaje de confirmación
                    const confirmMsg = `💳 Perfecto! Te preparo los links de pago para *${lastProduct.name}*...`;
                    await socket.sendMessage(customerPhone, { text: confirmMsg });
                    await this.saveMessage(userId, customerPhone, confirmMsg, conversationId);
                    // Pequeña pausa
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    // Generar links de pago
                    const paymentResult = await bot_payment_link_generator_1.BotPaymentLinkGenerator.generatePaymentLinks(lastProduct.id, userId, 1);
                    if (paymentResult.success && paymentResult.message) {
                        await socket.sendMessage(customerPhone, { text: paymentResult.message });
                        await this.saveMessage(userId, customerPhone, paymentResult.message, conversationId);
                        console.log('[AutoHandler] ✅ Links de pago enviados (desde BD)');
                        return;
                    }
                }
                // Si realmente no hay productos, preguntar
                const response = '💳 Claro, con gusto te ayudo con el pago. ¿Qué producto te gustaría comprar?\n\n' +
                    'Dime el nombre del producto y te envío todas las opciones de pago disponibles 😊';
                await socket.sendMessage(customerPhone, { text: response });
                await this.saveMessage(userId, customerPhone, response, conversationId);
                return;
            }
            // Tomar el primer producto (el más relevante)
            const product = products[0];
            console.log(`[AutoHandler] ✅ Producto seleccionado: ${product.name}`);
            // Enviar mensaje de confirmación
            const confirmMsg = `💳 Perfecto! Te preparo los links de pago para *${product.name}*...`;
            await socket.sendMessage(customerPhone, { text: confirmMsg });
            await this.saveMessage(userId, customerPhone, confirmMsg, conversationId);
            // Pequeña pausa
            await new Promise(resolve => setTimeout(resolve, 1500));
            // Generar links de pago
            const paymentResult = await bot_payment_link_generator_1.BotPaymentLinkGenerator.generatePaymentLinks(product.id, userId, 1 // Cantidad por defecto
            );
            if (paymentResult.success && paymentResult.message) {
                // Enviar mensaje con links de pago
                await socket.sendMessage(customerPhone, { text: paymentResult.message });
                await this.saveMessage(userId, customerPhone, paymentResult.message, conversationId);
                console.log('[AutoHandler] ✅ Links de pago enviados');
            }
            else {
                // Error generando links
                const errorMsg = '😅 Disculpa, tuve un problema generando los links de pago.\n\n' +
                    'Pero puedes pagar por:\n' +
                    '📱 Nequi: 304 274 8687\n' +
                    '📱 Daviplata: 304 274 8687\n' +
                    '🏦 Transferencia bancaria\n\n' +
                    'O contáctame directamente para coordinar el pago 😊';
                await socket.sendMessage(customerPhone, { text: errorMsg });
                await this.saveMessage(userId, customerPhone, errorMsg, conversationId);
            }
        }
        catch (error) {
            console.error('[AutoHandler] ❌ Error en solicitud de pago:', error);
            const errorMsg = '😅 Disculpa, tuve un problema con los links de pago.\n\n' +
                'Puedes pagar por:\n' +
                '📱 Nequi: 304 274 8687\n' +
                '📱 Daviplata: 304 274 8687\n\n' +
                '¿Te sirve alguno de estos métodos?';
            await socket.sendMessage(customerPhone, { text: errorMsg });
        }
    }
    /**
     * Buscar el último producto mencionado en la base de datos
     */
    static async findLastMentionedProductInDB(conversationId) {
        try {
            // Buscar mensajes que contengan nombres de productos
            const conversation = await db_1.db.conversation.findUnique({
                where: { id: conversationId },
                include: {
                    messages: {
                        where: {
                            OR: [
                                { content: { contains: 'Curso', mode: 'insensitive' } },
                                { content: { contains: 'Laptop', mode: 'insensitive' } },
                                { content: { contains: 'Moto', mode: 'insensitive' } },
                                { content: { contains: 'Megapack', mode: 'insensitive' } },
                                { content: { contains: 'Foto de', mode: 'insensitive' } },
                                { content: { contains: '━━━━', mode: 'insensitive' } } // Formato de producto
                            ]
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 5
                    }
                }
            });
            if (!conversation || conversation.messages.length === 0) {
                return null;
            }
            // Extraer nombres de productos de los mensajes
            for (const message of conversation.messages) {
                // Buscar patrón "Foto de [Producto]"
                const fotoMatch = message.content.match(/Foto de (.+?) enviada/i);
                if (fotoMatch) {
                    const productName = fotoMatch[1];
                    const product = await db_1.db.product.findFirst({
                        where: {
                            userId: conversation.userId,
                            name: { contains: productName, mode: 'insensitive' }
                        }
                    });
                    if (product)
                        return product;
                }
                // Buscar patrón "✨ [Producto]"
                const titleMatch = message.content.match(/✨\s*\*?([^*\n]+)\*?/);
                if (titleMatch) {
                    const productName = titleMatch[1].trim();
                    const product = await db_1.db.product.findFirst({
                        where: {
                            userId: conversation.userId,
                            name: { contains: productName, mode: 'insensitive' }
                        }
                    });
                    if (product)
                        return product;
                }
            }
            return null;
        }
        catch (error) {
            console.error('[AutoHandler] ❌ Error buscando producto en BD:', error);
            return null;
        }
    }
    /**
     * Buscar productos relevantes del contexto de la conversación
     */
    static async findRelevantProductsFromContext(userId, customerPhone, currentMessage, conversationId) {
        try {
            // 🎯 PRIORIDAD 1: Usar ConversationContextService (último producto mencionado)
            const { ConversationContextService } = await Promise.resolve().then(() => __importStar(require('./conversation-context-service')));
            const conversationKey = `${userId}:${customerPhone}`;
            const productContext = ConversationContextService.getProductContext(conversationKey);
            if (productContext && productContext.lastProductId) {
                console.log(`[AutoHandler] 🎯 Producto del contexto: ${productContext.lastProductName}`);
                // Obtener producto de la BD
                const product = await db_1.db.product.findUnique({
                    where: { id: productContext.lastProductId }
                });
                if (product) {
                    console.log(`[AutoHandler] ✅ Producto encontrado en contexto guardado`);
                    return [product];
                }
            }
            // 2. Intentar buscar productos mencionados en el mensaje actual
            const { intelligentProductSearch } = await Promise.resolve().then(() => __importStar(require('./intelligent-product-search')));
            const searchResult = await intelligentProductSearch({
                userMessage: currentMessage,
                previousProducts: [],
                conversationHistory: []
            });
            if (searchResult && searchResult.products && searchResult.products.length > 0) {
                console.log(`[AutoHandler] ✅ Productos encontrados en mensaje actual: ${searchResult.products.length}`);
                return searchResult.products;
            }
            // 3. Buscar en el historial reciente de la conversación
            const conversation = await db_1.db.conversation.findUnique({
                where: { id: conversationId },
                include: {
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 10 // Últimos 10 mensajes
                    }
                }
            });
            if (!conversation) {
                return [];
            }
            // Combinar mensajes recientes
            const recentContext = conversation.messages
                .map(m => m.content)
                .join(' ');
            // Buscar productos en el contexto combinado
            const historySearchResult = await intelligentProductSearch({
                userMessage: recentContext,
                previousProducts: [],
                conversationHistory: []
            });
            if (historySearchResult && historySearchResult.products && historySearchResult.products.length > 0) {
                console.log(`[AutoHandler] ✅ Productos encontrados en historial: ${historySearchResult.products.length}`);
                return historySearchResult.products;
            }
            // 4. Si no hay productos específicos, buscar por categoría general
            const generalTerms = ['laptop', 'moto', 'curso', 'megapack'];
            for (const term of generalTerms) {
                if (currentMessage.toLowerCase().includes(term) || recentContext.toLowerCase().includes(term)) {
                    const generalSearchResult = await intelligentProductSearch({
                        userMessage: term,
                        previousProducts: [],
                        conversationHistory: []
                    });
                    if (generalSearchResult && generalSearchResult.products && generalSearchResult.products.length > 0) {
                        console.log(`[AutoHandler] ✅ Productos encontrados por término general: ${term}`);
                        return generalSearchResult.products.slice(0, 5); // Máximo 5
                    }
                }
            }
            return [];
        }
        catch (error) {
            console.error('[AutoHandler] ❌ Error buscando productos:', error);
            return [];
        }
    }
    /**
     * Guardar mensaje en la base de datos
     */
    static async saveMessage(userId, customerPhone, message, conversationId) {
        try {
            await db_1.db.message.create({
                data: {
                    conversationId,
                    content: message,
                    direction: 'OUTGOING',
                    type: 'TEXT'
                }
            });
            await db_1.db.conversation.update({
                where: { id: conversationId },
                data: { lastMessageAt: new Date() }
            });
        }
        catch (error) {
            console.error('[AutoHandler] ❌ Error guardando mensaje:', error);
        }
    }
    /**
     * Verificar si el mensaje debe ser manejado automáticamente
     */
    static shouldHandle(messageText) {
        return product_photo_sender_1.ProductPhotoSender.detectPhotoRequest(messageText) ||
            bot_payment_link_generator_1.BotPaymentLinkGenerator.detectPaymentRequest(messageText);
    }
}
exports.AutoPhotoPaymentHandler = AutoPhotoPaymentHandler;
