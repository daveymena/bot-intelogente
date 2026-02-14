/**
 * SISTEMA SIMPLE DE CONVERSACIÓN (SAAS ENABLED)
 * Reemplaza toda la complejidad: agentes, orchestrator, memoria compartida
 * 1 archivo, 1 flujo, súper confiable y Multi-Tenant
 */

import { db } from '@/lib/db';

interface SimpleMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface SimpleResponse {
  text: string;
  actions?: Array<{ type: string; data: any }>;
}

export class SimpleConversationHandler {
  // STATIC para persistir entre requests - CLAVES COMPUESTAS (userId:chatId) para SaaS
  private static conversationHistory: Map<string, SimpleMessage[]> = new Map();
  private static currentProduct: Map<string, any> = new Map();

  /**
   * Genera una clave única por tienda y cliente para aislamiento SaaS
   */
  private getContextKey(userId: string, chatId: string): string {
    return `${userId}:${chatId}`;
  }

  /**
   * Método principal - maneja TODA la conversación
   */
  async handleMessage(params: {
    chatId: string;
    userId: string;
    message: string;
    userName?: string;
  }): Promise<SimpleResponse> {
    let { chatId, userId, message, userName } = params;

    // SAAS: UserId es dinámico y corresponde al dueño de la tienda por donde escriben
    console.log(`\n💬 [SIMPLE] Mensaje recibido en Tienda ${userId}: "${message}"`);

    // 1. Agregar mensaje a historial (USA CLAVE COMPUESTA)
    await this.addToHistory(userId, chatId, { role: 'user', content: message });

    // 2. Detectar tipo de mensaje (4 tipos simples)
    const type = this.detectMessageType(message, userId, chatId);
    console.log(`🎯 [SIMPLE] Tipo detectado: ${type}`);

    let response: SimpleResponse;

    switch (type) {
      case 'payment':
        response = await this.handlePayment(message, chatId, userId);
        break;
      case 'search':
        response = await this.handleSearch(message, chatId, userId);
        break;
      case 'followup':
        response = await this.handleFollowUp(message, chatId, userId);
        break;
      case 'borrower':
        response = await this.handleBorrowerForm(message, chatId, userId);
        break;
      default:
        response = await this.handleGeneral(message, chatId, userId);
    }

    // 3. Agregar respuesta a historial (USA CLAVE COMPUESTA)
    await this.addToHistory(userId, chatId, { role: 'assistant', content: response.text });

    console.log(`✅ [SIMPLE] Bot: "${response.text.substring(0, 50)}..."`);
    return response;
  }

  /**
   * Detecta el tipo de mensaje (simple, 5 categorías)
   */
  private detectMessageType(message: string, userId: string, chatId: string): 'payment' | 'search' | 'followup' | 'borrower' | 'general' {
    const lower = message.toLowerCase();
    const contextKey = this.getContextKey(userId, chatId);

    // 1. PAGO (prioridad máxima)
    if (/(pagar|pago|comprar|link|mercadopago|paypal|nequi|métodos?.*pago)/i.test(lower)) {
      return 'payment';
    }

    // 2. SEGUIMIENTO (pregunta sobre producto actual) - PRIORIDAD ALTA si hay contexto
    if (SimpleConversationHandler.currentProduct.has(contextKey)) {
      // Palabras típicas de seguimiento o preguntas detalle
      if (/(incluye|contiene|foto|imagen|precio|cómo|cuánto|qué|tienes|trae|detalles?|info|información)/i.test(lower)) {
        return 'followup';
      }
    }

    // 3. ASESOR (Detección de interés general en laptops sin modelo específico)
    if (/(quiero|necesito|busco|recomiéndame|cuál).* (portátil|laptop|computador|pc|maquina)/i.test(lower)) {
      if (!this.containsSpecificModel(lower)) {
        return 'search'; // Irá por search pero detectará modo asesor
      }
    }

    // 4. BÚSQUEDA (tiene keywords de productos)
    if (/(busco|quiero|necesito|tienes|curso|laptop|moto|megapack|mega|pack|interesa|precio)/i.test(lower)) {
      return 'search';
    }

    // 5. REGISTRO PRESTATARIO (PRESTAR/DATOS)
    if (/(prestar|prestamista|mis datos|registro|formulario|link.*datos|ingresar.*datos)/i.test(lower)) {
      return 'borrower';
    }

    return 'general';
  }

  /**
   * Verifica si el mensaje contiene algún modelo específico de la base de datos
   */
  private containsSpecificModel(message: string): boolean {
    // Lista de modelos que usualmente requieren ficha directa
    const specificModels = ['macbook', 'vostro', 'inspiron', 'thinkpad', 'vivobook', 'zenbook', 'pavilion', 'victus', 'legion', 'alienware'];
    return specificModels.some(model => message.includes(model));
  }

  /**
   * Maneja REGISTRO DE DATOS PARA PRÉSTAMOS
   */
  private async handleBorrowerForm(message: string, chatId: string, userId: string): Promise<SimpleResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bot-intelogente.vercel.app';
    const registerUrl = `${baseUrl}/p/${userId}/datos`;
    
    return {
      text: `🤝 *Registro de Prestatarios*\n\nHola. Para poder procesar tu solicitud de préstamo y realizar el desembolso correctamente, por favor ingresa tus datos en el siguiente enlace seguro:\n\n🔗 ${registerUrl}\n\nAllí podrás registrar tu información personal y los datos de tu cuenta bancaria (Colombia o Internacional). 😊`
    };
  }

  /**
   * Maneja PAGO - Sistema especializado sin IA
   */
  private async handlePayment(message: string, chatId: string, userId: string): Promise<SimpleResponse> {
    const contextKey = this.getContextKey(userId, chatId);
    const product = SimpleConversationHandler.currentProduct.get(contextKey);
    const { PaymentLinkGenerator } = await import('./payment-link-generator');

    if (!product) {
      return {
        text: 'Para generarte el link de pago exacto, necesito saber qué producto deseas. ¿Me dices el nombre? 😊'
      };
    }

    const paymentLinks = await PaymentLinkGenerator.generatePaymentLinks(product.id);

    if (!paymentLinks) {
      return {
        text: `Tuve un pequeño problema técnico generando el link para ${product.name}. Por favor escribe "asesor" para que te ayudemos manualmente. 🙏`
      };
    }

    const lower = message.toLowerCase();
    if (lower.includes('nequi') || lower.includes('daviplata') || lower.includes('paypal') || lower.includes('tarjeta') || lower.includes('transferencia')) {
      const specificMethod = lower.match(/(nequi|daviplata|paypal|tarjeta|transferencia|bancaria)/i)?.[0] || '';
      if (specificMethod) {
        return { text: PaymentLinkGenerator.generateMethodResponse(specificMethod, paymentLinks) };
      }
    }

    return { text: PaymentLinkGenerator.formatForWhatsApp(paymentLinks) };
  }

  /**
   * Maneja BÚSQUEDA - BÚSQUEDA INTELIGENTE + IA + MODO ASESOR
   */
  private async handleSearch(message: string, chatId: string, userId: string): Promise<SimpleResponse> {
    const lower = message.toLowerCase();
    const { PersistentMemoryManager } = await import('./persistent-memory-manager');
    const memory = await PersistentMemoryManager.getMemory(chatId, userId);
    const { ProfessionalResponseFormatter } = await import('./professional-response-formatter');

    // MODO ASESOR: Si es interés general en laptops
    if (/(portátil|laptop|computador|pc)/i.test(lower) && !this.containsSpecificModel(lower)) {
      await PersistentMemoryManager.updateStage(chatId, userId, 'advising_use');
      return {
        text: ProfessionalResponseFormatter.formatAdvisorStep1()
      };
    }

    // Si ya estamos en modo asesor y responde un número
    if (memory.conversationStage.startsWith('advising_') && /^[1-4]$/.test(message.trim())) {
      return await this.handleAdvisor(message.trim(), chatId, userId, memory);
    }

    console.log('[SimpleHandler] 🔍 Búsqueda inteligente iniciada');
    const relevantProducts = await this.smartProductSearch(message, userId);
    
    if (relevantProducts.length === 0) {
      return {
        text: 'No encontré productos que coincidan con tu búsqueda. ¿Podrías ser más específico? 😊\n\n¿O prefieres ver todo nuestro catálogo?'
      };
    }

    // 🚀 DETERMINAR FORMATO SUGERIDO ANTES DE LLAMAR A LA IA
    // Si la búsqueda devuelve solo un producto, es muy probable que sea el interés principal
    const botSettings = await db.botSettings.findUnique({ where: { userId } });
    const suggestedFormat = (relevantProducts.length === 1) 
      ? ProfessionalResponseFormatter.formatAutoCard(relevantProducts[0], botSettings?.businessAddress || '')
      : null;

    const response = await this.generateResponse({
      message,
      products: relevantProducts.slice(0, 5),
      chatId,
      context: 'search',
      userId,
      suggestedFormat
    });

    const mentionedProducts = this.extractMentionedProducts(response.text, relevantProducts);
    
    if (mentionedProducts.length > 0) {
      SimpleConversationHandler.currentProduct.set(this.getContextKey(userId, chatId), mentionedProducts[0]);
    }

    const actions: Array<{ type: string; data: any }> = [];
    
    // Si mencionamos productos con fotos, agregamos la acción de foto al final
    for (const p of (mentionedProducts.length > 0 ? mentionedProducts : relevantProducts.slice(0, 1))) {
      if (p.images && JSON.parse(p.images || '[]').length > 0) {
        actions.push({
          type: 'send_photo_card',
          data: { product: p, useCardFormat: false }
        });
        break; // Solo enviar una foto principal
      }
    }

    return { 
      text: response.text, 
      actions 
    };
  }

  /**
   * Maneja el flujo interactivo de asesoramiento
   */
  private async handleAdvisor(choice: string, chatId: string, userId: string, memory: any): Promise<SimpleResponse> {
    const { PersistentMemoryManager } = await import('./persistent-memory-manager');
    const { ProfessionalResponseFormatter } = await import('./professional-response-formatter');

    if (memory.conversationStage === 'advising_use') {
      const preferences = { ...memory.preferences, use: choice };
      await PersistentMemoryManager.updateMemory(chatId, userId, { 
        preferences,
        conversationStage: 'advising_budget'
      });
      return { text: ProfessionalResponseFormatter.formatAdvisorStep2(choice) };
    }

    if (memory.conversationStage === 'advising_budget') {
      const preferences = { ...memory.preferences, budget_range: choice };
      await PersistentMemoryManager.updateMemory(chatId, userId, { 
        preferences,
        conversationStage: 'browsing'
      });

      // Ejecutar búsqueda real en BD según filtros
      const products = await this.filterProductsByAdvisor(preferences, userId);
      
      if (products.length === 0) {
        return { text: "No encontré opciones exactas con ese presupuesto, pero aquí tienes los mejores disponibles actualmente. 😊" };
      }

      return { text: ProfessionalResponseFormatter.formatAdvisorRecommendations(products) };
    }

    return { text: "Cuéntame más sobre qué buscas. 😊" };
  }

  /**
   * Filtra productos basados en la asesoría
   */
  private async filterProductsByAdvisor(prefs: any, userId: string): Promise<any[]> {
    const budgetMap: Record<string, { min: number, max: number }> = {
      '1': { min: 0, max: 2000000 },
      '2': { min: 2000000, max: 3000000 },
      '3': { min: 3000000, max: 99999999 }
    };

    const range = budgetMap[prefs.budget_range] || { min: 0, max: 99999999 };

    return await db.product.findMany({
      where: {
        userId,
        status: 'AVAILABLE',
        category: 'PHYSICAL',
        price: { gte: range.min, lte: range.max },
        OR: [
          { name: { contains: 'laptop' } },
          { name: { contains: 'portátil' } },
          { description: { contains: 'computador' } }
        ]
      },
      take: 3,
      orderBy: { searchPriority: 'desc' }
    });
  }


  /**
   * BÚSQUEDA INTELIGENTE - Filtra productos relevantes ANTES de enviar a la IA
   */
  private async smartProductSearch(query: string, userId: string): Promise<any[]> {
    const lowerQuery = query.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Quitar acentos
    
    console.log(`[SmartSearch] 🔍 Buscando: "${query}"`);
    
    // Extraer keywords importantes (sin stopwords)
    const stopwords = ['el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'para', 'con', 'en', 'por', 'me', 'te', 'se', 'quiero', 'busco', 'necesito', 'tienes', 'dame', 'interesa'];
    const keywords = lowerQuery
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopwords.includes(w));
    
    console.log(`[SmartSearch] 🔑 Keywords: ${keywords.join(', ')}`);
    
    // Buscar en base de datos con keywords
    const products = await db.product.findMany({
      where: {
        userId,
        status: 'AVAILABLE',
        OR: keywords.flatMap(kw => [
          { name: { contains: kw, mode: 'insensitive' } },
          { description: { contains: kw, mode: 'insensitive' } }
          // Tags: buscar si algún tag contiene el keyword (sin Prisma has)
        ])
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        currency: true,
        category: true,
        images: true,
        tags: true
      },
      take: 10 // Máximo 10 productos relevantes
    });
    
    // Scoring: Ordenar por relevancia
    const scored = products.map(p => {
      let score = 0;
      const nameLower = p.name.toLowerCase();
      const descLower = (p.description || '').toLowerCase();
      
      // Puntos por coincidencia en nombre (más importante)
      keywords.forEach(kw => {
        if (nameLower.includes(kw)) score += 10;
        if (descLower.includes(kw)) score += 3;
        if (p.tags && p.tags.toLowerCase().includes(kw)) score += 5;
      });
      
      // Bonus si coincide con query completa
      if (nameLower.includes(lowerQuery)) score += 20;
      
      return { product: p, score };
    });
    
    // Ordenar por score descendente
    scored.sort((a, b) => b.score - a.score);
    
    console.log(`[SmartSearch] 📊 Scores:`);
    scored.slice(0, 3).forEach(s => {
      console.log(`[SmartSearch]    ${s.product.name}: ${s.score} puntos`);
    });
    
    return scored.map(s => s.product);
  }

  /**
   * Detecta si la búsqueda es específica (quiere UN producto) o genérica (explora opciones)
   */
  private isSpecificProductSearch(message: string): boolean {
    const lower = message.toLowerCase();
    
    // Palabras que indican búsqueda ESPECÍFICA
    const specificKeywords = [
      'quiero el', 'dame el', 'busco el', 'necesito el',
      'me interesa el', 'información del', 'detalles del',
      'cuánto cuesta el', 'precio del', 'foto del',
      'quiero ese', 'ese producto', 'ese curso',
      'el curso de', 'el megapack de', 'la laptop',
      'el portátil', 'la moto'
    ];
    
    // Palabras que indican búsqueda GENÉRICA
    const genericKeywords = [
      'qué tienes', 'qué vendes', 'qué productos',
      'opciones de', 'alternativas', 'recomiéndame',
      'cuáles son', 'tienes cursos', 'tienes laptops',
      'busco algo', 'necesito algo'
    ];
    
    // Si tiene keywords específicos, es búsqueda específica
    if (specificKeywords.some(kw => lower.includes(kw))) {
      return true;
    }
    
    // Si tiene keywords genéricos, es búsqueda genérica
    if (genericKeywords.some(kw => lower.includes(kw))) {
      return false;
    }
    
    // Por defecto: si el mensaje es corto y directo, es específico
    // Ej: "curso de piano", "laptop gaming", "megapack idiomas"
    const words = lower.split(/\s+/).filter(w => w.length > 2);
    return words.length <= 4; // Mensajes cortos = búsqueda específica
  }

  /**
   * Extrae productos mencionados en la respuesta de la IA
   * Busca nombres de productos en el texto de respuesta
   */
  private extractMentionedProducts(responseText: string, allProducts: any[]): any[] {
    const mentioned: any[] = [];
    const responseLower = responseText.toLowerCase();
    
    console.log('[SimpleHandler] 🔍 Extrayendo productos mencionados...');
    
    // Buscar cada producto en la respuesta
    for (const product of allProducts) {
      const nameLower = product.name.toLowerCase();
      
      // Buscar nombre completo o palabras clave del nombre
      const nameWords = nameLower.split(/\s+/).filter(w => w.length > 3);
      
      // Si encuentra el nombre completo o al menos 2 palabras clave
      let matchCount = 0;
      for (const word of nameWords) {
        if (responseLower.includes(word)) {
          matchCount++;
        }
      }
      
      // Si coincide el nombre completo o al menos 50% de las palabras
      if (responseLower.includes(nameLower) || matchCount >= Math.max(2, nameWords.length * 0.5)) {
        mentioned.push(product);
        console.log(`[SimpleHandler] ✅ Producto mencionado: ${product.name}`);
      }
    }
    
    return mentioned;
  }

  /**
   * Maneja SEGUIMIENTO - IA con contexto del producto actual
   */
  private async handleFollowUp(message: string, chatId: string, userId: string): Promise<SimpleResponse> {
    const contextKey = this.getContextKey(userId, chatId);
    const product = SimpleConversationHandler.currentProduct.get(contextKey)!;

    return await this.generateResponse({
      message,
      products: [product],
      chatId,
      context: 'followup',
      userId
    });
  }

  /**
   * Maneja GENERAL - IA libre
   */
  private async handleGeneral(message: string, chatId: string, userId: string): Promise<SimpleResponse> {
    return await this.generateResponse({
      message,
      products: [],
      chatId,
      context: 'general',
      userId
    });
  }

  /**
   * BÚSQUEDA DIRECTA EN BD - Rápida y confiable
   */
  private async searchProducts(query: string, userId: string): Promise<any[]> {
    const stopwords = [
      'para', 'con', 'de', 'del', 'la', 'el', 'un', 'una', 'los', 'las', 'y', 'o', 'en', 'por',
      'busco', 'quiero', 'necesito', 'tienes', 'deseo', 'interesa', 'informacion', 'info',
      'precio', 'costo', 'valor', 'cuanto', 'como', 'donde', 'hola', 'saludos', 'buenos', 'dias',
      // Palabras genéricas que causan "ruido" en búsquedas OR
      'curso', 'cursos', 'pack', 'packs', 'megapack', 'completo', 'programa', 'programas', 'taller', 'talleres',
      'venta', 'comprar', 'mejor', 'oferta', 'promo', 'promocion'
    ];

    const keywords = query.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, "") // Eliminar puntuación
      .split(/\s+/)
      .filter(w => w.length > 2)
      .filter(w => !stopwords.includes(w));

    // Si después de filtrar no queda nada (ej: solo escribió "busco curso"),
    // usamos las originales para no devolver vacío, o devolvemos todo (decisión de diseño).
    // Mejor: Si no queda nada específico, usar las genéricas como fallback.
    if (keywords.length === 0) {
       // Fallback: Si el usuario SOLO escribió "curso", buscar "curso".
       // Pero si escribió "curso piano", keywords será solo ["piano"].
       return []; 
    }

    const products = await db.product.findMany({
      where: {
        userId, // IMPORTANTE: Filtrar por usuario (SaaS)
        status: 'AVAILABLE',
        OR: keywords.flatMap(kw => [
          { name: { contains: kw, mode: 'insensitive' } },
          { description: { contains: kw, mode: 'insensitive' } },
        ])
      },
      take: 5
    });

    console.log(`🔍 [BD] Encontrados ${products.length} productos para: ${keywords.join(', ')} usuario: ${userId}`);
    return products;
  }

  /**
   * GENERADOR DE RESPUESTAS CON IA - PROMPT DINÁMICO SAAS
   */
  private async generateResponse(params: {
    message: string;
    products: any[];
    chatId: string;
    context: 'search' | 'followup' | 'general';
    userId: string;
    paymentLinks?: any;
    suggestedFormat?: string | null;
  }): Promise<SimpleResponse> {
    const { message, products, chatId, context, userId, paymentLinks, suggestedFormat } = params;
    const { AIMultiProvider } = await import('@/lib/ai-multi-provider');

    console.log('\n🤖 [generateResponse] ═══════════════════════════════════════');
    console.log(`[generateResponse] 📝 Mensaje del usuario: "${message}"`);
    console.log(`[generateResponse] 📦 Productos recibidos: ${products.length}`);
    console.log(`[generateResponse] 🎯 Contexto: ${context}`);
    
    // 🔍 LOG CRÍTICO: Mostrar productos de idiomas recibidos
    const idiomasInProducts = products.filter(p => 
      p.name.toLowerCase().includes('idioma') || 
      p.name.toLowerCase().includes('inglés') ||
      p.name.toLowerCase().includes('ingles')
    );
    console.log(`[generateResponse] 🌍 Productos de idiomas en lista: ${idiomasInProducts.length}`);
    idiomasInProducts.forEach(p => {
      console.log(`[generateResponse]    ✅ ${p.name} (ID: ${p.id})`);
    });

    // 1. Obtener Configuración SAAS del Usuario
    const botSettings = await db.botSettings.findUnique({ where: { userId } });
    const paymentConfig = await db.paymentConfig.findUnique({ where: { userId } });

    const businessName = botSettings?.businessName || 'Tienda Virtual';
    const businessPhone = botSettings?.businessPhone || '';
    
    // Construir lista de pagos disponibles dinámicamente
    let paymentMethodsStr = '';
    if (paymentConfig?.nequiEnabled) paymentMethodsStr += `Nequi (${paymentConfig.nequiPhone}), `;
    if (paymentConfig?.daviplataEnabled) paymentMethodsStr += `Daviplata (${paymentConfig.daviplataPhone}), `;
    if (paymentConfig?.mercadoPagoEnabled) paymentMethodsStr += 'MercadoPago (Tarjetas), ';
    if (paymentConfig?.paypalEnabled) paymentMethodsStr += 'PayPal, ';
    if (paymentConfig?.bankTransferEnabled) paymentMethodsStr += `Bancolombia, `;

    // Historial (últimos 5 mensajes) - USA CLAVE COMPUESTA
    const contextKey = this.getContextKey(userId, chatId);
    const history = SimpleConversationHandler.conversationHistory.get(contextKey) || [];
    const recentHistory = history.slice(-5);

    // Prompt Maestro Dinámico - ESTRATEGIA: EJEMPLOS -> AUTONOMÍA
    let systemPrompt = `
${soul}

### 🏢 CONTEXTO DEL NEGOCIO (BASE DE CONOCIMIENTO):
${brainContext}

### 📂 CATÁLOGO DE PRODUCTOS DISPONIBLES:
${catalogHints}

### 🧠 TU MISIÓN:
Eres David, el estratega de ventas de élite de **TecnoVariedades D&S**. Tu objetivo es asesorar con autoridad y cerrar ventas de forma persuasiva.
Analiza la intención del usuario y responde de forma natural. NO eres un bot rígido; tienes autonomía total para decidir cómo estructurar tu respuesta según la necesidad del cliente.

### 🏆 PRINCIPIOS DE VENTA:
1. **Asesoría Técnica**: Si el cliente tiene dudas, respóndelas con conocimiento técnico antes de intentar cerrar.
2. **Personalización**: Usa el contexto para dar recomendaciones que le sirvan realmente al cliente.
3. **Persuasión**: Destaca los beneficios (garantía, calidad, soporte) para generar deseo.
4. **Claridad**: Usa separadores visuales ━━━━━━━━━━━━━━━━━━ y emojis para que el mensaje sea fácil de leer.

### 🎨 EJEMPLOS DE FORMATO (ÚSALOS COMO GUÍA DE ESTILO):
${suggestedFormat ? `👉 FORMATO RECOMENDADO PARA ESTE PRODUCTO:\n${suggestedFormat}\n` : ''}

A continuación, ejemplos de cómo David suele estructurar sus mejores cierres:

**Ejemplo A (Producto Específico):**
¡Excelente elección! Este equipo es de lo mejor que tenemos disponible actualmente:
━━━━━━━━━━━━━━━━━━
💻 *Portátil Core i7 - 11Gen*
💰 Precio: $2.400.000 COP
🚀 Rendimiento: Ideal para edición y gaming
━━━━━━━━━━━━━━━━━━
¿Te gustaría que lo apartemos para envío o prefieres pasar por el local?

**Ejemplo B (Búsqueda General):**
¡Hola! 😊 Claro que sí, tengo estas 3 excelentes opciones que se ajustan a lo que buscas:
1️⃣ *Curso de Piano* - $60.000
2️⃣ *Mega Pack 11* - $20.000
👉 ¿Cuál de estos te llama más la atención para darte todos los detalles?

### ⚠️ REGLAS INNEGOCIABLES:
${this.getSafetyRules()}

Responde siempre en ESPAÑOL (Colombia). NUNCA inventes productos que no estén en el catálogo.
`;

    if (products.length > 0) {
      const productList = products.map((p, i) => {
        const desc = p.description || '';
        return `${i + 1}. ${p.name} - $${p.price.toLocaleString('es-CO')} COP\n   Descripción: ${desc}`;
      }).join('\n\n');

      systemPrompt += `\n🎯 PRODUCTOS DETALLADOS:\n${productList}`;
    }

    // Historial
    if (recentHistory.length > 0) {
      const historyText = recentHistory.map(m =>
        `${m.role === 'user' ? 'Cliente' : 'Tú'}: ${m.content}`
      ).join('\n');
      systemPrompt += `\n\nHISTORIAL:\n${historyText}`;
    }

    systemPrompt += `\n\nResponde como el asesor de ${businessName}:`;

    // 🔍 LOG CRÍTICO: Mostrar prompt completo (truncado si es muy largo)
    console.log(`[generateResponse] 📝 Prompt completo (${systemPrompt.length} caracteres):`);
    if (systemPrompt.length > 1500) {
      console.log(`[generateResponse] ${systemPrompt.substring(0, 700)}...`);
      console.log(`[generateResponse] ... [TRUNCADO] ...`);
      console.log(`[generateResponse] ${systemPrompt.substring(systemPrompt.length - 300)}`);
    } else {
      console.log(`[generateResponse] ${systemPrompt}`);
    }

    // Llamar a IA
    console.log(`[generateResponse] 🚀 Llamando a IA...`);
    const aiResponse = await AIMultiProvider.generateCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ], {
      temperature: 0.4,
      max_tokens: 300,
    });

    // 🔍 LOG CRÍTICO: Mostrar respuesta de la IA
    console.log(`[generateResponse] 🤖 Respuesta de IA (raw): "${aiResponse.content}"`);

    let text = aiResponse.content.trim()
      .replace(/^(Bot:|Respuesta:)\s*/gi, '')
      .replace(/##\s*[^:]+:/gi, '');

    console.log(`[generateResponse] 🧹 Respuesta limpia: "${text}"`);

    // 🚨 VALIDACIÓN CRÍTICA 1: DETECTAR INGLÉS
    const englishPhrases = [
      'I understand', 'Here\'s why', 'I can\'t', 'I don\'t', 'I\'m an AI',
      'Unfortunately', 'However', 'Tell me', 'What languages', 'What kind of',
      'I can help', 'Let me', 'You might', 'Here are', 'I\'ll give you'
    ];
    
    const hasEnglish = englishPhrases.some(phrase => 
      text.toLowerCase().includes(phrase.toLowerCase())
    );

    // 🚨 VALIDACIÓN CRÍTICA 2: DETECTAR INFORMACIÓN GENÉRICA INVENTADA
    const genericPhrases = [
      'flowkey', 'pianote', 'yousician', 'simply piano',
      'cuéntame:', 'necesito saber', 'para encontrar el curso perfecto',
      '¿cuál es tu nivel', '¿qué tipo de aprendizaje', '¿qué tipo de música',
      '¿cuál es tu presupuesto', '¿dónde vives', 'busca escuelas',
      'cursos en línea:', 'cursos presenciales:', 'investigar en línea',
      'con esta información', 'aquí te dejo algunas opciones'
    ];
    
    const hasGenericInfo = genericPhrases.some(phrase => 
      text.toLowerCase().includes(phrase.toLowerCase())
    );

    if (hasEnglish || hasGenericInfo) {
      if (hasEnglish) {
        console.log(`⚠️ [generateResponse] ALERTA: Respuesta en INGLÉS detectada!`);
      }
      if (hasGenericInfo) {
        console.log(`⚠️ [generateResponse] ALERTA: Información GENÉRICA detectada!`);
        console.log(`⚠️ [generateResponse] La IA está inventando cursos externos o haciendo preguntas innecesarias`);
      }
      console.log(`⚠️ [generateResponse] Forzando respuesta CORRECTA con datos REALES...`);
      
      // Respuesta de emergencia con datos REALES del catálogo
      if (products.length > 0) {
        const firstProduct = products[0];
        const price = firstProduct.price.toLocaleString('es-CO');
        const desc = firstProduct.description || 'Producto de alta calidad';
        
        // Formato CARD profesional con datos REALES
        text = `🎯 ${firstProduct.name}

💰 Precio: ${price} COP

📝 ${desc}

💳 ¿Te gustaría proceder con el pago? Puedo enviarte el link ahora mismo 😊`;
        
        console.log(`✅ [generateResponse] Respuesta corregida con datos REALES del producto: ${firstProduct.name}`);
      } else {
        text = `¡Hola! 😊 Soy el asesor de ${businessName}. ¿En qué puedo ayudarte hoy? Tenemos productos increíbles para ti 🚀`;
      }
      
      console.log(`✅ [generateResponse] Respuesta final corregida: "${text}"`);
    }

    // 🎨 LIMPIAR FORMATO ANTIGUO (asteriscos, puntos, etc)
    // 🎨 LIMPIAR FORMATO ANTIGUO (asteriscos, puntos, etc)
    const { ProfessionalResponseFormatter } = await import('./professional-response-formatter');
    text = ProfessionalResponseFormatter.cleanOldFormat(text);

    console.log(`[generateResponse] ✨ Respuesta formateada: "${text}"`);

    // 🔗 INYECCIÓN DE LINKS: Si se generaron links, pegarlos al final
    if (paymentLinks) {
       const { PaymentLinkGenerator } = await import('./payment-link-generator');
       const linksText = PaymentLinkGenerator.formatForWhatsApp(paymentLinks);
       
       // Detectar si la IA ya puso algo similar para no duplicar (simple check)
       if (!text.includes('http')) {
         text += `\n\n${linksText}`;
       }
    }

    console.log(`[generateResponse] ✅ Respuesta final lista (${text.length} caracteres)`);
    console.log('[generateResponse] ═══════════════════════════════════════\n');

    return { text };
  }

  /**
   * Gestión simple de historial
   */
  private async addToHistory(userId: string, chatId: string, message: SimpleMessage) {
    const contextKey = this.getContextKey(userId, chatId);
    
    if (!SimpleConversationHandler.conversationHistory.has(contextKey)) {
      SimpleConversationHandler.conversationHistory.set(contextKey, []);
    }
    const history = SimpleConversationHandler.conversationHistory.get(contextKey)!;
    history.push(message);
    
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
  }

  // Singleton
  private static instance: SimpleConversationHandler;
  static getInstance(): SimpleConversationHandler {
    if (!this.instance) {
      this.instance = new SimpleConversationHandler();
    }
    return this.instance;
  }
}
