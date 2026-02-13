/**
 * Estrategia Conversacional con Metodología AIDA
 * Determina cómo el bot debe responder según el tipo de producto y contexto
 */

export interface ConversationStrategy {
    shouldAskQuestions: boolean;
    suggestedQuestions?: string[];
    toolToUse: string | null;
    reasoning: string;
}

export class ConversationStrategyService {
    /**
     * Determina la estrategia conversacional basada en el mensaje y productos
     */
    static determineStrategy(
        message: string,
        products: any[],
        conversationHistory: any[]
    ): ConversationStrategy {
        const messageLower = message.toLowerCase().trim();

        // 🎯 ORDEN DE DETECCIÓN (CRÍTICO):
        // 1. Saludos/Despedidas
        // 2. Intención de compra
        // 3. Rechazo/Alternativas
        // 4. Producto específico
        // 5. Búsqueda general

        // 1️⃣ DETECTAR SALUDOS Y DESPEDIDAS
        if (this.isGreetingOrFarewell(messageLower)) {
            return {
                shouldAskQuestions: false,
                toolToUse: null,
                reasoning: 'Saludo o despedida detectado. Respuesta conversacional simple.'
            };
        }

        // 2️⃣ DETECTAR INTENCIÓN DE COMPRA
        if (this.isPurchaseIntent(messageLower)) {
            return {
                shouldAskQuestions: false,
                toolToUse: 'get_payment_info',
                reasoning: 'Intención de compra clara detectada. Mostrar información de pago.'
            };
        }

        // 3️⃣ DETECTAR RECHAZO Y SOLICITUD DE ALTERNATIVAS
        if (this.isRequestingAlternatives(messageLower)) {
            // Si pide alternativas de productos VARIABLES, hacer preguntas
            const productType = this.detectProductType(messageLower);
            if (productType === 'variable') {
                return {
                    shouldAskQuestions: true,
                    suggestedQuestions: this.getQuestionsForCategory(messageLower),
                    toolToUse: null,
                    reasoning: 'Cliente rechazó opción y pide alternativas de producto variable. Hacer preguntas para entender necesidades.'
                };
            }
            
            // Para productos digitales/simples, mostrar lista
            return {
                shouldAskQuestions: false,
                toolToUse: 'list_products_by_category',
                reasoning: 'Cliente rechazó opción actual y pide alternativas. Mostrar lista.'
            };
        }

        // 4️⃣ DETECTAR BÚSQUEDA ESPECÍFICA (nombre completo de producto)
        const specificProduct = this.findSpecificProduct(messageLower, products);
        if (specificProduct) {
            return {
                shouldAskQuestions: false,
                toolToUse: 'get_product_with_payment',
                reasoning: `Usuario mencionó producto específico: ${specificProduct.name}`
            };
        }

        // 5️⃣ DETECTAR TIPO DE PRODUCTO BUSCADO
        const productType = this.detectProductType(messageLower);

        // 🎯 FIX: Para productos VARIABLES, mostrar LISTA directamente (sin preguntas)
        // El cliente debe ver todas las opciones disponibles para elegir según sus necesidades
        if (productType === 'variable') {
            return {
                shouldAskQuestions: false,
                toolToUse: 'list_products_by_category',
                reasoning: 'Producto variable detectado. Mostrar LISTA de opciones para que el cliente elija según marca, precio y características.'
            };
        }

        // Para productos SIMPLES/DIGITALES, mostrar lista directamente
        if (productType === 'simple' || productType === 'digital') {
            return {
                shouldAskQuestions: false,
                toolToUse: 'list_products_by_category',
                reasoning: 'Producto simple/digital. Mostrar opciones directamente con descripciones atractivas (AIDA completo en una respuesta)'
            };
        }

        // Búsqueda general sin categoría clara
        return {
            shouldAskQuestions: false,
            toolToUse: 'list_products_by_category',
            reasoning: 'Búsqueda general. Mostrar opciones disponibles'
        };
    }

    /**
     * Detecta si es un saludo o despedida
     */
    private static isGreetingOrFarewell(messageLower: string): boolean {
        const greetings = [
            'hola', 'buenos días', 'buenas tardes', 'buenas noches', 'buen día',
            'saludos', 'qué tal', 'cómo estás', 'hey', 'holi'
        ];
        
        const farewells = [
            'gracias', 'muchas gracias', 'adiós', 'hasta luego', 'chao', 'bye',
            'nos vemos', 'hasta pronto', 'ok gracias', 'perfecto gracias', 'listo gracias'
        ];

        // Mensaje corto (máximo 4 palabras) que es solo saludo/despedida
        const wordCount = messageLower.replace(/[?¿!¡.,]/g, '').split(' ').filter(w => w.length > 0).length;
        if (wordCount > 4) return false;

        return greetings.some(g => messageLower.includes(g)) || 
               farewells.some(f => messageLower.includes(f));
    }

    /**
     * Detecta intención clara de compra
     */
    private static isPurchaseIntent(messageLower: string): boolean {
        // "me interesa" puede ser ambiguo si está en contexto de rechazo
        // Ejemplo: "Pero me interesan otros cursos" NO es intención de compra
        if (this.isRequestingAlternatives(messageLower)) {
            return false;
        }

        const purchaseKeywords = [
            'lo quiero', 'cómo pago', 'métodos de pago', 'formas de pago',
            'dale', 'comprar', 'comprarlo', 'adquirir', 'cómo compro', 'quiero comprarlo',
            'me lo llevo', 'proceder con la compra', 'realizar el pago', 'pagar',
            'cuenta bancaria', 'nequi', 'transferencia', 'datos de pago'
        ];

        // "me interesa" solo si NO está con "otros" o "pero"
        if (messageLower.includes('me interesa') && 
            !messageLower.includes('otros') && 
            !messageLower.includes('pero')) {
            return true;
        }

        // "sí" solo es intención de compra (necesita contexto conversacional)
        // Por ahora lo tratamos como búsqueda general
        if (messageLower === 'sí' || messageLower === 'si') {
            return false; // Requiere contexto, mejor dejar que AI decida
        }

        return purchaseKeywords.some(keyword => messageLower.includes(keyword));
    }

    /**
     * Detecta si el cliente está rechazando y pidiendo alternativas
     */
    private static isRequestingAlternatives(messageLower: string): boolean {
        const rejectionKeywords = [
            'pero', 'otros', 'otro', 'diferente', 'más opciones', 'qué más',
            'no me interesa', 'no me gusta', 'prefiero otro', 'algo más',
            'otras opciones', 'otros cursos', 'otras laptops', 'otros productos',
            'algo diferente', 'otra cosa', 'más alternativas'
        ];
        
        return rejectionKeywords.some(keyword => messageLower.includes(keyword));
    }

    /**
     * Detecta si el mensaje menciona un producto específico por nombre
     * MATCHING MUY ESTRICTO para evitar falsos positivos
     */
    private static findSpecificProduct(messageLower: string, products: any[]): any | null {
        // Limpiar mensaje
        const cleanMessage = messageLower.replace(/[?¿!¡.,]/g, '').trim();
        const messageWords = cleanMessage.split(' ').filter(w => w.length > 0);

        // Si el mensaje es muy corto (1-2 palabras genéricas), NO es búsqueda específica
        if (messageWords.length <= 2) {
            const genericWords = ['curso', 'cursos', 'laptop', 'laptops', 'pack', 'packs', 
                                 'mega', 'megapack', 'megapacks', 'digital', 'digitales',
                                 'computador', 'computadores', 'moto', 'motos',
                                 'teclado', 'teclados', 'mouse', 'ratón', 'monitor', 'monitores'];
            const isAllGeneric = messageWords.every(w => genericWords.includes(w));
            if (isAllGeneric) {
                console.log(`[Strategy] ⚠️ Mensaje muy genérico: "${cleanMessage}" - NO es búsqueda específica`);
                return null;
            }
        }

        let bestMatch: any = null;
        let bestScore = 0;

        for (const product of products) {
            const productNameLower = product.name.toLowerCase();
            
            // 1️⃣ COINCIDENCIA EXACTA (100% confianza)
            if (cleanMessage === productNameLower) {
                console.log(`[Strategy] ✅ Coincidencia EXACTA: ${product.name}`);
                return product;
            }

            // 2️⃣ NOMBRE COMPLETO DEL PRODUCTO ESTÁ EN EL MENSAJE
            if (cleanMessage.includes(productNameLower)) {
                console.log(`[Strategy] ✅ Nombre completo encontrado: ${product.name}`);
                return product;
            }

            // 3️⃣ PATRÓN ESPECIAL: "mega pack" + número (ej: "mega pack 11", "megapack 11")
            const megaPackPattern = /mega\s*pack\s+(\d+)/i;
            const msgMatch = cleanMessage.match(megaPackPattern);
            const prodMatch = productNameLower.match(megaPackPattern);
            
            if (msgMatch && prodMatch && msgMatch[1] === prodMatch[1]) {
                console.log(`[Strategy] ✅ Patrón Mega Pack detectado: ${product.name}`);
                return product;
            }

            // 4️⃣ COINCIDENCIA POR PALABRAS ÚNICAS (MUY ESTRICTO)
            const productWords = productNameLower
                .split(' ')
                .filter(w => w.length > 2) // Incluir números (ej: "11")
                .filter(w => !['curso', 'cursos', 'pack', 'packs', 'mega', 'laptop', 'moto', 'digital', 'digitales', 'de', 'del', 'la', 'el'].includes(w)); // Excluir palabras genéricas

            // Si no hay palabras únicas, no podemos hacer matching confiable
            if (productWords.length === 0) continue;

            const matchingWords = productWords.filter(pw => 
                messageWords.some(mw => {
                    // Coincidencia exacta para números
                    if (/^\d+$/.test(pw) && /^\d+$/.test(mw)) {
                        return pw === mw;
                    }
                    // Coincidencia para palabras
                    return mw === pw || (mw.length > 4 && pw.includes(mw));
                })
            );

            const matchScore = matchingWords.length / productWords.length;

            // 5️⃣ REQUIERE AL MENOS 70% DE COINCIDENCIA Y MÍNIMO 2 PALABRAS ÚNICAS
            if (matchingWords.length >= 2 && matchScore >= 0.7 && matchScore > bestScore) {
                bestMatch = product;
                bestScore = matchScore;
            }
        }

        // Solo retornar si tenemos alta confianza (70%+)
        if (bestScore >= 0.7) {
            console.log(`[Strategy] ✅ Producto específico encontrado: ${bestMatch.name} (confianza: ${Math.round(bestScore * 100)}%)`);
            return bestMatch;
        }

        return null;
    }

    /**
     * Detecta el tipo de producto basado en palabras clave
     */
    private static detectProductType(messageLower: string): 'variable' | 'simple' | 'digital' | 'unknown' {
        // Palabra "opciones" SIEMPRE es búsqueda general (nunca hacer preguntas)
        if (messageLower.includes('opciones')) {
            return 'digital'; // Mostrar lista sin preguntas
        }

        // Productos VARIABLES (requieren especificaciones)
        const variableKeywords = [
            'laptop', 'laptops', 'computador', 'computadores', 'pc', 'computadora',
            'moto', 'motos', 'motocicleta', 'impresora', 'impresoras',
            'teclado', 'teclados', 'mouse', 'ratón', 'monitor', 'monitores'
        ];

        // Productos DIGITALES/SIMPLES (precio fijo, sin variaciones)
        const digitalKeywords = [
            'curso', 'cursos', 'megapack', 'megapacks', 'digital', 'digitales',
            'pack', 'packs', 'capacitación', 'formación'
        ];

        for (const keyword of variableKeywords) {
            if (messageLower.includes(keyword)) {
                return 'variable';
            }
        }

        for (const keyword of digitalKeywords) {
            if (messageLower.includes(keyword)) {
                return 'digital';
            }
        }

        return 'unknown';
    }

    /**
     * Verifica si ya tenemos información de requisitos del cliente
     */
    private static hasClientRequirements(history: any[]): boolean {
        if (!history || history.length < 2) return false;

        // Buscar en los últimos 3 mensajes si el cliente respondió preguntas
        const recentMessages = history.slice(-3);
        
        for (const msg of recentMessages) {
            if (msg.role === 'user') {
                const content = msg.content.toLowerCase();
                
                // Palabras que indican que respondió a nuestras preguntas
                const responseIndicators = [
                    'trabajo', 'estudio', 'gaming', 'diseño', 'edición',
                    'presupuesto', 'precio', 'portátil', 'escritorio',
                    'rápido', 'potente', 'básico', 'avanzado'
                ];

                for (const indicator of responseIndicators) {
                    if (content.includes(indicator)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Genera preguntas apropiadas según la categoría
     */
    private static getQuestionsForCategory(messageLower: string): string[] {
        if (messageLower.includes('laptop') || messageLower.includes('computador')) {
            return [
                '¡Perfecto! Para recomendarte la mejor opción, cuéntame:',
                '• ¿Para qué lo necesitas? (trabajo, estudio, gaming, diseño)',
                '• ¿Qué presupuesto tienes en mente?',
                '• ¿Prefieres algo portátil o de escritorio?'
            ];
        }

        if (messageLower.includes('moto')) {
            return [
                '¡Excelente elección! Para ayudarte mejor:',
                '• ¿Para qué la usarás? (trabajo, paseo, ciudad)',
                '• ¿Qué cilindraje prefieres?',
                '• ¿Tienes presupuesto definido?'
            ];
        }

        // Pregunta genérica
        return [
            '¡Claro! Para recomendarte lo mejor:',
            '• ¿Para qué lo necesitas?',
            '• ¿Qué presupuesto tienes en mente?'
        ];
    }

    /**
     * Genera respuesta conversacional con preguntas (AIDA: Atención → Interés)
     */
    static generateQualificationResponse(questions: string[]): string {
        return questions.join('\n');
    }
}
