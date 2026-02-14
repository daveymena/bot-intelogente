/**
 * Estrategia Conversacional con Metodología AIDA
 * Determina cómo el bot debe responder según el tipo de producto y contexto
 */

export interface ConversationStrategy {
    shouldAskQuestions: boolean;
    suggestedQuestions?: string[];
    suggestedResponse?: string;
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
            const isFarewell = this.isFarewell(messageLower);
            return {
                shouldAskQuestions: false,
                toolToUse: null,
                reasoning: isFarewell ? 'Despedida detectada.' : 'Saludo detectado.',
                suggestedResponse: isFarewell 
                    ? '¡De nada! Ha sido un gusto ayudarte. Si necesitas algo más, aquí estaré. ¡Que tengas un excelente día! 😊'
                    : '¡Hola! soy David, tu asesor virtual de TecnoVariedades D&S. 👋 ¿En qué puedo ayudarte hoy? ¿Buscas algún producto en especial?'
            };
        }

        // 2️⃣ DETECTAR BÚSQUEDA ESPECÍFICA (nombre completo de producto)
        const specificProduct = this.findSpecificProduct(messageLower, products);
        if (specificProduct) {
            return {
                shouldAskQuestions: false,
                toolToUse: 'get_product_with_payment',
                reasoning: `Usuario mencionó producto específico: ${specificProduct.name}`
            };
        }

        // 3️⃣ DETECTAR INTENCIÓN DE COMPRA O PAGO
        if (this.isPurchaseIntent(messageLower)) {
            return {
                shouldAskQuestions: false,
                toolToUse: 'get_payment_info',
                reasoning: 'Intención de compra o consulta de pago detectada.'
            };
        }

        // 4️⃣ DETECTAR RECHAZO Y SOLICITUD DE ALTERNATIVAS
        if (this.isRequestingAlternatives(messageLower)) {
            const productType = this.detectProductType(messageLower);
            if (productType === 'variable') {
                return {
                    shouldAskQuestions: true,
                    suggestedQuestions: this.getQuestionsForCategory(messageLower),
                    toolToUse: null,
                    reasoning: 'Cliente rechazó opción y pide alternativas de producto variable.'
                };
            }
            return {
                shouldAskQuestions: false,
                toolToUse: 'list_products_by_category',
                reasoning: 'Cliente rechazó opción actual y pide alternativas.'
            };
        }

        // 5️⃣ DETECTAR DUDAS DE NEGOCIO (Problem Solving)
        if (this.isBusinessInquiry(messageLower)) {
            return {
                shouldAskQuestions: false,
                toolToUse: null,
                reasoning: 'Duda sobre el negocio detectada (ubicación, envíos, horarios).'
            };
        }

        // 6️⃣ DETECTAR TIPO DE PRODUCTO BUSCADO
        const productType = this.detectProductType(messageLower);

        // 🎯 INTELIGENCIA DE VENTAS: Para productos VARIABLES, calificar ANTES de mostrar lista
        // (A menos que el mensaje ya tenga especificaciones o sea una petición de "opciones")
        if (productType === 'variable') {
            const hasSpecs = this.hasClientRequirements([ { role: 'user', content: message } ]);
            const isAskingForOptions = messageLower.includes('opciones') || messageLower.includes('lista') || messageLower.includes('qué tienes');
            
            if (!hasSpecs && !isAskingForOptions) {
                return {
                    shouldAskQuestions: true,
                    suggestedQuestions: this.getQuestionsForCategory(messageLower),
                    toolToUse: null,
                    reasoning: 'Producto variable detectado sin especificaciones. Iniciando fase de CALIFICACIÓN para asesorar mejor.'
                };
            }

            return {
                shouldAskQuestions: false,
                toolToUse: 'list_products_by_category',
                reasoning: 'Producto variable detectado con especificaciones o petición de lista. Mostrando opciones filtradas.'
            };
        }

        // Para productos SIMPLES/DIGITALES, mostrar lista directamente (AIDA rápido)
        if (productType === 'simple' || productType === 'digital') {
            return {
                shouldAskQuestions: false,
                toolToUse: 'list_products_by_category',
                reasoning: 'Producto simple/digital. Mostrando opciones directamente para agilizar la venta.'
            };
        }

        // Búsqueda general sin categoría clara: Usar analyze_intent del orquestador (fallback)
        return {
            shouldAskQuestions: false,
            toolToUse: 'list_products_by_category', // Por defecto intentar listar si hay keywords
            reasoning: 'Búsqueda general. Intentando mostrar catálogo relevante.'
        };
    }

    /**
     * Detecta si es un saludo o despedida
     */
    private static isGreetingOrFarewell(messageLower: string): boolean {
        const greetings = [
            'hola', 'buenos días', 'buenos dias', 'buenas tardes', 'buenas noches', 'buen día', 'buen dia',
            'saludos', 'qué tal', 'que tal', 'cómo estás', 'como estas', 'como esta', 'cómo esta', 'hey', 'holi', 'así'
        ];
        
        const wordCount = messageLower.replace(/[?¿!¡.,]/g, '').split(' ').filter(w => w.length > 0).length;
        
        // Si el mensaje es solo un saludo de la lista
        const isBasicGreeting = greetings.some(g => messageLower === g || messageLower.startsWith(g + ' '));
        
        if (isBasicGreeting && wordCount <= 5) return true;

        return this.isFarewell(messageLower);
    }

    private static isFarewell(messageLower: string): boolean {
        const farewells = [
            'gracias', 'muchas gracias', 'adiós', 'adios', 'hasta luego', 'chao', 'bye',
            'nos vemos', 'hasta pronto', 'ok gracias', 'perfecto gracias', 'listo gracias'
        ];
        const wordCount = messageLower.replace(/[?¿!¡.,]/g, '').split(' ').filter(w => w.length > 0).length;
        return farewells.some(f => messageLower.includes(f)) && wordCount <= 4;
    }

    /**
     * Detecta intención clara de compra o duda sobre pago
     */
    private static isPurchaseIntent(messageLower: string): boolean {
        // "me interesa" puede ser ambiguo si está en contexto de rechazo
        if (this.isRequestingAlternatives(messageLower)) {
            return false;
        }

        const purchaseKeywords = [
            'lo quiero', 'cómo pago', 'como pago', 'donde pago', 'dónde pago',
            'métodos de pago', 'metodos de pago', 'método de pago', 'metodo de pago',
            'formas de pago', 'forma de pago', 'medios de pago', 'medio de pago',
            'cómo compro', 'como compro', 'cómo adquiro', 'como adquiero',
            'quiero comprarlo', 'comprar', 'me lo llevo', 'proceder con la compra',
            'realizar el pago', 'pagar', 'cuenta bancaria', 'nequi', 'daviplata',
            'transferencia', 'datos de pago', 'datos para el pago',
            'link de pago', 'link para pagar', 'método', 'metodo',
            'cual es la cuenta', 'cuál es la cuenta', 'dame la cuenta',
            'info de pago', 'información de pago', 'informacion de pago'
        ];

        // "me interesa" solo si NO está con "otros" o "pero"
        if (messageLower.includes('me interesa') && 
            !messageLower.includes('otros') && 
            !messageLower.includes('pero')) {
            return true;
        }

        return purchaseKeywords.some(keyword => messageLower.includes(keyword));
    }

    /**
     * Detecta dudas sobre el negocio (Ubicación, Envíos, Horarios)
     */
    private static isBusinessInquiry(messageLower: string): boolean {
        const businessKeywords = [
            'donde estan', 'donde queda', 'ubicacion', 'dirección', 'direccion', 'local',
            'donde encuentro', 'ciudad', 'envio', 'domicilio', 'cuanto vale el envio',
            'llega a mi ciudad', 'horario', 'abierto', 'cierran', 'atienden'
        ];
        
        return businessKeywords.some(keyword => messageLower.includes(keyword));
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
