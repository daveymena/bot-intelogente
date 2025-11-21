"use strict";
/**
 * Detector de Intención (SIN IA Externa)
 * Usa patrones y reglas para detectar la intención del usuario
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntentDetector = void 0;
class IntentDetector {
    /**
     * Detecta la intención del mensaje
     */
    static detect(message, memory) {
        const cleanMsg = message.toLowerCase().trim();
        // 🔥 PRIORIDAD 0: SELECCIÓN DE MÉTODO DE PAGO (antes que todo)
        // Si hay producto en contexto Y menciona un método de pago, es selección
        const hasProductContext = memory.currentProduct || (memory.interestedProducts && memory.interestedProducts.length > 0);
        const paymentMethod = this.detectPaymentMethod(cleanMsg);
        if (hasProductContext && paymentMethod) {
            return {
                intent: 'payment_selection',
                confidence: 0.98, // MUY alta confianza
                entities: { paymentMethod },
            };
        }
        // 🔥 PRIORIDAD 1: MÉTODOS DE PAGO (antes que búsqueda)
        // Si pregunta por métodos de pago, es payment_methods (no búsqueda)
        if (this.isPaymentMethodsQuery(cleanMsg)) {
            // 🔥 EXTRAER PRODUCTO MENCIONADO EN EL MENSAJE
            const productName = this.extractProductName(cleanMsg);
            return {
                intent: 'payment_methods',
                confidence: 0.95,
                entities: { productName }, // Incluir producto si se menciona
            };
        }
        // 🔥 PRIORIDAD 2: INFO DE PRODUCTO (si hay productos en contexto)
        // Si hay productos en contexto Y pide información, es product_info (no búsqueda)
        if (hasProductContext && this.isProductInfoQuery(cleanMsg)) {
            return {
                intent: 'product_info',
                confidence: 0.95, // MUY alta confianza cuando hay producto en contexto
                entities: {},
            };
        }
        // 🔥 CORRECCIÓN CRÍTICA: Si hay productos interesados Y el mensaje parece selección
        // (números, "ese", "este", etc.), es product_info para que SearchAgent maneje
        if (memory.interestedProducts && memory.interestedProducts.length > 0) {
            if (this.isProductSelection(cleanMsg)) {
                return {
                    intent: 'product_info', // Usar product_info para que SearchAgent maneje selección
                    confidence: 0.9,
                    entities: {},
                };
            }
        }
        // 🔥 PRIORIDAD 3: BÚSQUEDA DE PRODUCTO (antes que saludo)
        // Si el mensaje contiene palabras de búsqueda, es búsqueda aunque tenga "hola"
        // PERO: Si hay producto en contexto, NO es búsqueda (evita falsos positivos)
        if (!hasProductContext && this.isProductSearch(cleanMsg)) {
            const productName = this.extractProductName(cleanMsg);
            return {
                intent: 'search_product',
                confidence: 0.9, // Alta confianza
                entities: { productName },
            };
        }
        // 🔥 CORRECCIÓN: SALUDO SOLO SI NO HAY CONTEXTO DE PRODUCTO ACTIVO
        // Si ya hay conversación avanzada (productos mostrados), NO detectar como saludo
        const hasActiveConversation = memory.greetingSent && (memory.currentProduct || memory.interestedProducts.length > 0 || memory.messageCount > 2);
        if (this.isGreeting(cleanMsg) && !hasActiveConversation) {
            return {
                intent: 'greeting',
                confidence: 0.95,
                entities: {},
            };
        }
        // 3. DESPEDIDA
        if (this.isFarewell(cleanMsg)) {
            return {
                intent: 'farewell',
                confidence: 0.95,
                entities: {},
            };
        }
        // 3. SOLICITUD DE FOTO
        if (this.isPhotoRequest(cleanMsg)) {
            return {
                intent: 'photo_request',
                confidence: 0.9,
                entities: {},
            };
        }
        // 6. CONSULTA DE PRECIO
        if (this.isPriceQuery(cleanMsg)) {
            return {
                intent: 'price_query',
                confidence: 0.85,
                entities: {},
            };
        }
        // 7. CONSULTA DE DISPONIBILIDAD
        if (this.isAvailabilityQuery(cleanMsg)) {
            return {
                intent: 'availability_query',
                confidence: 0.85,
                entities: {},
            };
        }
        // 8. CONFIRMACIÓN
        if (this.isConfirmation(cleanMsg)) {
            return {
                intent: 'confirmation',
                confidence: 0.8,
                entities: {},
            };
        }
        // 9. INFO DE PRODUCTO (sin contexto - baja prioridad)
        if (this.isProductInfoQuery(cleanMsg)) {
            return {
                intent: 'product_info',
                confidence: 0.75, // Confianza media sin contexto
                entities: {},
            };
        }
        // 9b. SELECCIÓN DE PRODUCTO (cuando hay múltiples productos mostrados)
        if (memory.interestedProducts && memory.interestedProducts.length > 0) {
            if (this.isProductSelection(cleanMsg)) {
                return {
                    intent: 'product_info', // Usar product_info para que ProductAgent maneje
                    confidence: 0.9,
                    entities: {},
                };
            }
        }
        // 10. QUEJA/RECLAMO
        if (this.isComplaint(cleanMsg)) {
            return {
                intent: 'complaint',
                confidence: 0.8,
                entities: {},
            };
        }
        // 11. GENERAL (fallback)
        return {
            intent: 'general',
            confidence: 0.5,
            entities: {},
        };
    }
    // ========== DETECTORES ESPECÍFICOS ==========
    static isGreeting(msg) {
        const greetings = [
            'hola', 'buenos dias', 'buenas tardes', 'buenas noches',
            'buen dia', 'buena tarde', 'buena noche', 'saludos',
            'hey', 'holi', 'que tal', 'como estas'
        ];
        return greetings.some(g => msg.includes(g));
    }
    static isFarewell(msg) {
        const farewells = [
            'adios', 'chao', 'hasta luego', 'nos vemos', 'bye',
            'gracias', 'muchas gracias', 'ok gracias', 'perfecto gracias'
        ];
        return farewells.some(f => msg.includes(f)) && msg.length < 30;
    }
    static isPhotoRequest(msg) {
        return (msg.includes('foto') ||
            msg.includes('imagen') ||
            msg.includes('ver') && (msg.includes('producto') || msg.includes('como')) ||
            msg.includes('muestra') ||
            msg.includes('envia') && msg.includes('foto') ||
            msg.includes('manda') && msg.includes('foto'));
    }
    static isPaymentMethodsQuery(msg) {
        // Detectar TODAS las formas de preguntar por métodos de pago
        return (
        // Métodos de pago
        (msg.includes('metodo') || msg.includes('método')) && msg.includes('pago') ||
            msg.includes('metodos de pago') ||
            msg.includes('métodos de pago') ||
            msg.includes('metodo de pago') ||
            msg.includes('método de pago') ||
            // Cómo pagar
            msg.includes('como pago') ||
            msg.includes('cómo pago') ||
            msg.includes('como puedo pagar') ||
            msg.includes('cómo puedo pagar') ||
            msg.includes('como te pago') ||
            msg.includes('cómo te pago') ||
            msg.includes('como puedo pagarte') ||
            msg.includes('cómo puedo pagarte') ||
            msg.includes('como pagar') ||
            msg.includes('cómo pagar') ||
            // Formas de pago
            msg.includes('formas de pago') ||
            msg.includes('forma de pago') ||
            msg.includes('opciones de pago') ||
            msg.includes('opcion de pago') ||
            msg.includes('opción de pago') ||
            // Qué métodos
            msg.includes('que metodos') ||
            msg.includes('qué métodos') ||
            msg.includes('que método') ||
            msg.includes('qué método') ||
            msg.includes('metodos tienes') ||
            msg.includes('métodos tienes') ||
            msg.includes('metodo tienes') ||
            msg.includes('método tienes') ||
            // Aceptan
            msg.includes('aceptan') ||
            msg.includes('aceptas') ||
            msg.includes('reciben') ||
            msg.includes('recibes') ||
            // Preguntas directas
            msg === 'metodos' ||
            msg === 'métodos' ||
            msg === 'metodo' ||
            msg === 'método' ||
            msg === 'pago' ||
            msg === 'pagos' ||
            msg === 'como pago' ||
            msg === 'cómo pago' ||
            // Variaciones comunes
            msg.includes('metodos de pagos tienes') ||
            msg.includes('que metodos de pago tienes') ||
            msg.includes('qué métodos de pago tienes'));
    }
    static detectPaymentMethod(msg) {
        // Limpiar mensaje
        const clean = msg.toLowerCase().trim();
        // Detectar MercadoPago (TODAS las variaciones)
        if (clean.includes('mercadopago') ||
            clean.includes('mercado pago') ||
            clean.includes('mercadopago') ||
            clean.includes('mercado-pago') ||
            clean.includes('mercado_pago') ||
            clean === 'mercado' ||
            clean === 'mercadopago' ||
            clean.includes('pagar por mercado') ||
            clean.includes('quiero pagar por mercado') ||
            clean.includes('parar por mercado') ||
            clean.includes('pago por mercado')) {
            return 'mercadopago';
        }
        // Detectar PayPal (TODAS las variaciones)
        if (clean.includes('paypal') ||
            clean.includes('pay pal') ||
            clean.includes('pay-pal') ||
            clean === 'paypal' ||
            clean.includes('pagar por paypal') ||
            clean.includes('quiero pagar por paypal')) {
            return 'paypal';
        }
        // Detectar Nequi
        if (clean.includes('nequi') || clean === 'nequi')
            return 'nequi';
        // Detectar Daviplata
        if (clean.includes('daviplata') || clean === 'daviplata')
            return 'daviplata';
        // Detectar tarjeta
        if (clean.includes('tarjeta') || clean.includes('credito') || clean.includes('crédito') || clean.includes('debito') || clean.includes('débito'))
            return 'mercadopago';
        // Detectar efectivo
        if (clean.includes('efectivo'))
            return 'efectivo';
        // Detectar consignación
        if (clean.includes('consignacion') || clean.includes('consignación') || clean.includes('bancaria') || clean.includes('banco'))
            return 'consignacion';
        // Detectar contraentrega
        if (clean.includes('contraentrega') || clean.includes('contra entrega'))
            return 'contraentrega';
        // Detectar PSE
        if (clean.includes('pse'))
            return 'mercadopago';
        return null;
    }
    static isPriceQuery(msg) {
        return (msg.includes('cuanto cuesta') ||
            msg.includes('cuanto vale') ||
            msg.includes('cuanto es') ||
            msg.includes('precio') ||
            msg.includes('valor') ||
            msg === 'cuanto');
    }
    static isAvailabilityQuery(msg) {
        return (msg.includes('tienen') ||
            msg.includes('hay') ||
            msg.includes('disponible') ||
            msg.includes('stock') ||
            msg.includes('en existencia'));
    }
    static isConfirmation(msg) {
        const confirmations = ['si', 'sí', 'ok', 'vale', 'dale', 'perfecto', 'bien', 'bueno', 'claro'];
        return confirmations.includes(msg) || (msg.length < 10 && confirmations.some(c => msg.includes(c)));
    }
    static isComplaint(msg) {
        return (msg.includes('queja') ||
            msg.includes('reclamo') ||
            msg.includes('problema') ||
            msg.includes('mal') && msg.includes('servicio') ||
            msg.includes('no funciona') ||
            msg.includes('no llego') ||
            msg.includes('no llegó'));
    }
    static isProductSearch(msg) {
        // 🔥 CORRECCIÓN: Detectar expresiones de interés en productos específicos
        const interestPatterns = [
            /\b(si|sí)\s+(me\s+)?interesa\s+(ver\s+)?(el|la|los|las)?\s*\w+/i,
            /\bme\s+interesa\s+(ver\s+)?(el|la)?\s*\w+/i,
            /\bquiero\s+(ver\s+)?(el|la)?\s*\w+/i,
            /\bme\s+gustaria\s+(ver\s+)?(el|la)?\s*\w+/i,
            /\bquisiera\s+(ver\s+)?(el|la)?\s*\w+/i,
            /\binformacion\s+(sobre|del|de)\s+\w+/i,
            /\bcuentame\s+(sobre|del|de)\s+\w+/i,
        ];
        // Si coincide con algún patrón de interés, es búsqueda
        if (interestPatterns.some(p => p.test(msg))) {
            return true;
        }
        // Palabras clave de búsqueda
        const searchKeywords = [
            'busco', 'necesito', 'quiero', 'me interesa', 'tienes',
            'vendes', 'hay', 'tienen', 'mostrar', 'ver', 'enseñar'
        ];
        // Nombres de productos/categorías
        const productKeywords = [
            'curso', 'megapack', 'portatil', 'portátil',
            'computador', 'laptop', 'moto', 'servicio',
            'piano', 'guitarra', 'diseño', 'excel', 'ingles', 'inglés',
            'programacion', 'programación', 'marketing', 'fotografia', 'fotografía'
        ];
        // Si tiene palabra de búsqueda + palabra de producto, es búsqueda
        const hasSearchKeyword = searchKeywords.some(k => msg.includes(k));
        const hasProductKeyword = productKeywords.some(k => msg.includes(k));
        if (hasSearchKeyword && hasProductKeyword) {
            return true;
        }
        // Si solo menciona un producto específico (sin palabra de búsqueda)
        // pero el mensaje es corto (< 50 caracteres), probablemente es búsqueda
        if (hasProductKeyword && msg.length < 50) {
            return true;
        }
        return false;
    }
    static isProductInfoQuery(msg) {
        // Detectar solicitudes de información sobre productos
        const infoPatterns = [
            'caracteristicas', 'características', 'especificaciones',
            'mas informacion', 'más información', 'mas info', 'más info',
            'cuentame', 'cuéntame', 'detalles', 'ver mas', 'ver más',
            'saber mas', 'saber más', 'me gustaria ver', 'me gustaría ver',
            'quiero ver', 'quisiera ver', 'informacion de', 'información de',
            'sobre este', 'sobre el', 'de este curso', 'del curso', 'del producto',
            'que incluye', 'qué incluye', 'que trae', 'qué trae',
            'como es', 'cómo es', 'de que trata', 'de qué trata'
        ];
        // También detectar mensajes muy cortos que piden info
        const shortInfoPatterns = ['info', 'información', 'detalles', 'mas', 'más'];
        if (msg.length < 15 && shortInfoPatterns.some(p => msg.includes(p))) {
            return true;
        }
        return infoPatterns.some(p => msg.includes(p));
    }
    static isProductSelection(msg) {
        // Detectar cuando el cliente está seleccionando un producto de una lista
        const selectionPatterns = [
            'el primero', 'el primer', 'el 1', 'primero',
            'el segundo', 'el 2', 'segundo',
            'el tercero', 'el 3', 'tercero',
            'ese', 'esa', 'este', 'esta', 'eso',
            'el de diseño', 'el de', 'la de',
            'quiero el', 'quiero ese', 'quiero este',
            'me interesa el', 'me interesa ese'
        ];
        return selectionPatterns.some(p => msg.includes(p));
    }
    static extractProductName(msg) {
        // 🔥 MEJORADO: Extraer nombre de producto del mensaje
        // Limpiar palabras de relleno comunes
        let cleanMsg = msg
            .toLowerCase()
            .replace(/\b(si|sí|me|interesa|ver|el|la|los|las|un|una|quiero|quisiera|me\s+gustaria|me\s+gustaría|busco|necesito|tienes|hay|sobre|del|de)\b/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        // Si quedó algo después de limpiar, eso es el nombre del producto
        if (cleanMsg.length > 2) {
            return cleanMsg;
        }
        // Fallback: buscar palabras clave de productos
        const productKeywords = [
            'curso', 'megapack', 'portatil', 'portátil', 'computador', 'laptop',
            'moto', 'servicio', 'piano', 'guitarra', 'diseño', 'excel',
            'ingles', 'inglés', 'programacion', 'programación', 'marketing',
            'fotografia', 'fotografía', 'idiomas', 'música', 'musica'
        ];
        const words = msg.toLowerCase().split(' ');
        const productWords = words.filter(w => productKeywords.some(k => w.includes(k)) || w.length > 4);
        return productWords.length > 0 ? productWords.join(' ') : undefined;
    }
}
exports.IntentDetector = IntentDetector;
