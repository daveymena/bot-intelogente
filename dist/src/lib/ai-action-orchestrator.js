"use strict";
/**
 * 🎯 AI ACTION ORCHESTRATOR
 *
 * La IA analiza el mensaje y decide QUÉ ACCIÓN ejecutar
 * En lugar de generar texto, ejecuta funciones reales
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIActionOrchestrator = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const db_1 = require("./db");
const groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY || ''
});
class AIActionOrchestrator {
    /**
     * La IA analiza el mensaje y decide QUÉ HACER
     */
    static async decideAction(message, conversationContext) {
        try {
            const prompt = `Eres un asistente de ventas inteligente. Tu trabajo es DECIDIR QUÉ ACCIÓN tomar, NO generar respuestas de texto.

MENSAJE DEL CLIENTE:
"${message}"

CONTEXTO ACTUAL:
${conversationContext.currentProduct ? `- Producto en conversación: ${conversationContext.currentProduct.name} ($${conversationContext.currentProduct.price.toLocaleString('es-CO')} COP)` : '- No hay producto en conversación'}
- Mensajes en conversación: ${conversationContext.historyMessages}
- Últimas intenciones: ${conversationContext.lastIntentions.join(', ') || 'ninguna'}

ACCIONES DISPONIBLES:

1. **generate_payment_links** - Generar enlaces de pago reales
   Usar cuando:
   - Cliente pide "link de pago", "quiero pagar", "cómo pago"
   - Cliente menciona método específico: "mercado pago", "paypal", "nequi"
   - Cliente dice "lo quiero", "lo compro", "estoy listo"
   - HAY un producto en conversación
   
2. **qualify_customer** - Calificar necesidades del cliente
   Usar cuando:
   - Cliente pregunta por categoría general: "portátil", "laptop", "computador"
   - Cliente busca algo pero no especifica: "busco un celular"
   - Es la PRIMERA vez que menciona el producto
   - NO sabemos para qué lo necesita (trabajo, estudio, gaming, etc.)
   - Hacer 1-2 preguntas para entender necesidad
   
3. **search_product** - Buscar producto en base de datos
   Usar cuando:
   - Cliente ya especificó necesidad: "portátil para gaming"
   - Cliente pregunta por producto MUY específico: "curso de piano online"
   - Ya calificamos y sabemos qué busca
   - Cliente responde a pregunta de calificación
   
4. **answer_question** - Responder pregunta con IA
   Usar cuando:
   - Cliente pregunta sobre métodos de pago (sin pedir enlaces)
   - Cliente pregunta sobre envíos, garantía, horarios
   - Cliente hace pregunta general sobre el negocio
   - Cliente pregunta características del producto actual
   
5. **send_photo** - Enviar foto del producto
   Usar cuando:
   - Cliente pide "foto", "imagen", "ver foto"
   - HAY un producto en conversación
   
6. **list_products** - Listar productos disponibles
   Usar cuando:
   - Cliente pregunta "qué productos tienen" (muy general)
   - Cliente quiere ver TODO el catálogo
   - Cliente dice "muéstrame todo"
   
7. **share_catalog** - Compartir link de catálogo/tienda
   Usar cuando:
   - Cliente pide "catálogo", "ver catálogo", "link del catálogo"
   - Cliente pide "tienda", "ver tienda", "link de la tienda"
   - Cliente quiere ver todos los productos online
   - Cliente pregunta "dónde puedo ver los productos"

8. **handle_objection** - Manejar objeción
   Usar cuando:
   - Cliente dice "muy caro", "no tengo plata"
   - Cliente duda: "no sé", "no estoy seguro"
   - Cliente compara: "en otro lado está más barato"
   
9. **escalate_to_human** - Escalar a humano
   Usar cuando:
   - Cliente pide hablar con persona
   - Problema complejo que no puedes resolver
   - Cliente muy molesto o frustrado

REGLAS CRÍTICAS:
- PRIMERA mención de categoría general (portátil, laptop) → qualify_customer
- Cliente ya especificó necesidad → search_product
- Si hay producto en conversación Y cliente pide pagar → generate_payment_links
- Si NO hay producto Y cliente pide pagar → qualify_customer (necesita producto primero)
- Si cliente pregunta "¿cómo pago?" sin producto → answer_question (explicar proceso)
- Si cliente pregunta "¿cómo pago?" con producto → generate_payment_links (ya sabe qué quiere)

RESPONDE EN FORMATO JSON:
{
  "action": "generate_payment_links" | "search_product" | "answer_question" | "send_photo" | "list_products",
  "confidence": 0.0-1.0,
  "reasoning": "breve explicación de por qué elegiste esta acción",
  "parameters": {
    // Parámetros específicos según la acción
  }
}

EJEMPLOS:

Mensaje: "link de pago"
Contexto: Producto = "Curso de Piano"
Respuesta: {
  "action": "generate_payment_links",
  "confidence": 0.98,
  "reasoning": "Cliente solicita link de pago y hay producto en conversación",
  "parameters": {}
}

Mensaje: "¿qué métodos de pago tienen?"
Contexto: Sin producto
Respuesta: {
  "action": "answer_question",
  "confidence": 0.95,
  "reasoning": "Pregunta sobre métodos sin producto específico, solo necesita información",
  "parameters": {}
}

Mensaje: "curso de piano"
Contexto: Sin producto
Respuesta: {
  "action": "search_product",
  "confidence": 0.95,
  "reasoning": "Cliente busca producto específico",
  "parameters": { "query": "curso de piano" }
}

Mensaje: "lo quiero"
Contexto: Producto = "Curso de Piano"
Respuesta: {
  "action": "generate_payment_links",
  "confidence": 0.90,
  "reasoning": "Cliente expresa intención de compra y hay producto en conversación",
  "parameters": {}
}

Mensaje: "¿cuánto cuesta?"
Contexto: Producto = "Curso de Piano"
Respuesta: {
  "action": "answer_question",
  "confidence": 0.95,
  "reasoning": "Pregunta sobre precio del producto actual, responder con IA",
  "parameters": {}
}

Mensaje: "quiero ver el catálogo"
Contexto: Sin producto
Respuesta: {
  "action": "share_catalog",
  "confidence": 0.98,
  "reasoning": "Cliente solicita ver catálogo completo",
  "parameters": {}
}

Mensaje: "dónde puedo ver todos los productos"
Contexto: Sin producto
Respuesta: {
  "action": "share_catalog",
  "confidence": 0.95,
  "reasoning": "Cliente quiere ver todos los productos, compartir catálogo",
  "parameters": {}
}

Ahora analiza el mensaje del cliente y decide la acción. Responde SOLO con el JSON:`;
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un orquestador de acciones. Respondes SOLO en formato JSON válido.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.1,
                max_tokens: 300,
            });
            const response = completion.choices[0]?.message?.content || '';
            // Extraer JSON
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.log('[ActionOrchestrator] ⚠️ No se pudo extraer JSON, usando fallback');
                return this.fallbackAction(message, conversationContext);
            }
            const action = JSON.parse(jsonMatch[0]);
            console.log(`[ActionOrchestrator] 🎯 Acción decidida: ${action.action}`);
            console.log(`[ActionOrchestrator] 💭 Razonamiento: ${action.reasoning}`);
            console.log(`[ActionOrchestrator] 📊 Confianza: ${(action.confidence * 100).toFixed(0)}%`);
            return action;
        }
        catch (error) {
            console.error('[ActionOrchestrator] ❌ Error:', error);
            return this.fallbackAction(message, conversationContext);
        }
    }
    /**
     * Acción de respaldo si falla la IA
     */
    static fallbackAction(message, conversationContext) {
        const normalized = message.toLowerCase();
        // Detectar pago
        if (/\b(link|pago|pagar|comprar|mercado|paypal)\b/i.test(normalized)) {
            if (conversationContext.currentProduct) {
                return {
                    action: 'generate_payment_links',
                    confidence: 0.8,
                    reasoning: 'Fallback: Detectado pago con producto',
                    parameters: {}
                };
            }
            else {
                return {
                    action: 'answer_question',
                    confidence: 0.7,
                    reasoning: 'Fallback: Detectado pago sin producto',
                    parameters: {}
                };
            }
        }
        // Detectar búsqueda de producto
        if (/\b(curso|laptop|moto|megapack|producto)\b/i.test(normalized)) {
            return {
                action: 'search_product',
                confidence: 0.7,
                reasoning: 'Fallback: Detectada búsqueda de producto',
                parameters: { query: message }
            };
        }
        // Por defecto: responder pregunta
        return {
            action: 'answer_question',
            confidence: 0.6,
            reasoning: 'Fallback: Responder con IA',
            parameters: {}
        };
    }
    /**
     * Ejecutar la acción decidida
     */
    static async executeAction(action, context) {
        console.log(`[ActionOrchestrator] ⚡ Ejecutando acción: ${action.action}`);
        try {
            switch (action.action) {
                case 'generate_payment_links':
                    return await this.executeGeneratePaymentLinks(context);
                case 'search_product':
                    return await this.executeSearchProduct(context, action.parameters?.query || context.message);
                case 'answer_question':
                    return await this.executeAnswerQuestion(context);
                case 'send_photo':
                    return await this.executeSendPhoto(context);
                case 'list_products':
                    return await this.executeListProducts(context);
                case 'share_catalog':
                    return await this.executeShareCatalog(context);
                default:
                    return await this.executeAnswerQuestion(context);
            }
        }
        catch (error) {
            console.error(`[ActionOrchestrator] ❌ Error ejecutando ${action.action}:`, error);
            return {
                success: false,
                message: '😅 Disculpa, tuve un problema. ¿Puedes intentar de nuevo?'
            };
        }
    }
    /**
     * Generar enlaces de pago
     */
    static async executeGeneratePaymentLinks(context) {
        if (!context.currentProduct) {
            return {
                success: true,
                message: '💳 Claro, con gusto te ayudo con el pago.\n\n¿Qué producto te gustaría comprar? 😊'
            };
        }
        const { BotPaymentLinkGenerator } = await Promise.resolve().then(() => __importStar(require('./bot-payment-link-generator')));
        const paymentLinks = await BotPaymentLinkGenerator.generatePaymentLinks(context.currentProduct.id, context.userId, 1);
        if (paymentLinks.success) {
            console.log('[ActionOrchestrator] ✅ Enlaces generados exitosamente');
            return {
                success: true,
                message: paymentLinks.message
            };
        }
        else {
            return {
                success: false,
                message: '😅 Disculpa, tuve un problema generando los enlaces. Contáctame al +57 304 274 8687'
            };
        }
    }
    /**
     * Buscar producto
     */
    static async executeSearchProduct(context, query) {
        const { ProductIntelligenceService } = await Promise.resolve().then(() => __importStar(require('./product-intelligence-service')));
        const product = await ProductIntelligenceService.findProduct(query, context.userId);
        if (product) {
            // Guardar en memoria
            const { ProfessionalConversationMemory } = await Promise.resolve().then(() => __importStar(require('./professional-conversation-memory')));
            ProfessionalConversationMemory.setCurrentProduct(context.conversationKey, product.id, product.name, product.price, product.category);
            // Generar respuesta con IA
            const { AIService } = await Promise.resolve().then(() => __importStar(require('./ai-service')));
            const response = await AIService.generateResponse(context.userId, context.message, context.customerPhone, context.conversationHistory);
            return {
                success: true,
                message: response.message,
                shouldSendPhoto: true
            };
        }
        else {
            return {
                success: true,
                message: `Lo siento, no encontré ese producto. 😔\n\n¿Buscas algo específico? Puedo ayudarte con laptops, cursos digitales, motos y más.`
            };
        }
    }
    /**
     * Responder pregunta con IA
     */
    static async executeAnswerQuestion(context) {
        const { AIService } = await Promise.resolve().then(() => __importStar(require('./ai-service')));
        const response = await AIService.generateResponse(context.userId, context.message, context.customerPhone, context.conversationHistory);
        return {
            success: true,
            message: response.message
        };
    }
    /**
     * Enviar foto
     */
    static async executeSendPhoto(context) {
        if (!context.currentProduct) {
            return {
                success: true,
                message: '📸 ¿De qué producto quieres ver la foto? 😊'
            };
        }
        return {
            success: true,
            message: `📸 Te envío la foto del ${context.currentProduct.name}`,
            shouldSendPhoto: true
        };
    }
    /**
     * Listar productos
     */
    static async executeListProducts(context) {
        const products = await db_1.db.product.findMany({
            where: {
                userId: context.userId,
                status: 'AVAILABLE'
            },
            take: 10
        });
        if (products.length === 0) {
            return {
                success: true,
                message: 'No tengo productos disponibles en este momento. 😔'
            };
        }
        const { ProductListFormatter } = await Promise.resolve().then(() => __importStar(require('./product-list-formatter')));
        const formattedList = ProductListFormatter.formatProductList(products, context.message);
        return {
            success: true,
            message: formattedList
        };
    }
    /**
     * Compartir catálogo/tienda
     */
    static async executeShareCatalog(context) {
        // Obtener configuración del usuario
        const user = await db_1.db.user.findUnique({
            where: { id: context.userId },
            select: {
                businessInfo: true
            }
        });
        // Extraer links del businessInfo
        let catalogLink = '';
        let storeLink = '';
        if (user?.businessInfo) {
            const businessInfo = typeof user.businessInfo === 'string'
                ? JSON.parse(user.businessInfo)
                : user.businessInfo;
            catalogLink = businessInfo.catalogLink || businessInfo.catalog_link || '';
            storeLink = businessInfo.storeLink || businessInfo.store_link || '';
        }
        // Si no hay links configurados, usar valores por defecto
        if (!catalogLink && !storeLink) {
            return {
                success: true,
                message: `📱 *NUESTROS PRODUCTOS*

Puedes ver todos nuestros productos disponibles contactándome directamente:

📞 WhatsApp: +57 304 274 8687

¿Te interesa algún producto en particular? 😊`
            };
        }
        // Construir mensaje con los links disponibles
        let message = `📱 *CATÁLOGO DE PRODUCTOS*\n\n`;
        if (catalogLink) {
            message += `📋 *Ver Catálogo Completo:*\n${catalogLink}\n\n`;
        }
        if (storeLink) {
            message += `🛒 *Visitar Tienda Online:*\n${storeLink}\n\n`;
        }
        message += `Aquí puedes ver todos nuestros productos con:\n`;
        message += `✅ Fotos reales\n`;
        message += `✅ Precios actualizados\n`;
        message += `✅ Descripciones completas\n`;
        message += `✅ Disponibilidad en tiempo real\n\n`;
        message += `¿Te interesa algo en particular? ¡Pregúntame! 😊`;
        return {
            success: true,
            message
        };
    }
}
exports.AIActionOrchestrator = AIActionOrchestrator;
