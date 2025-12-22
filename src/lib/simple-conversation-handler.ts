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
  // STATIC para persistir entre requests
  private static conversationHistory: Map<string, SimpleMessage[]> = new Map();
  private static currentProduct: Map<string, any> = new Map();

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

    // 1. Agregar mensaje a historial
    await this.addToHistory(chatId, { role: 'user', content: message });

    // 2. Detectar tipo de mensaje (4 tipos simples)
    const type = this.detectMessageType(message, chatId);
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
      default:
        response = await this.handleGeneral(message, chatId, userId);
    }

    // 3. Agregar respuesta a historial
    await this.addToHistory(chatId, { role: 'assistant', content: response.text });

    console.log(`✅ [SIMPLE] Bot: "${response.text.substring(0, 50)}..."`);
    return response;
  }

  /**
   * Detecta el tipo de mensaje (simple, 4 categorías)
   */
  private detectMessageType(message: string, chatId: string): 'payment' | 'search' | 'followup' | 'general' {
    const lower = message.toLowerCase();

    // 1. PAGO (prioridad máxima)
    if (/(pagar|pago|comprar|link|mercadopago|paypal|nequi|métodos?.*pago)/i.test(lower)) {
      return 'payment';
    }

    // 2. SEGUIMIENTO (pregunta sobre producto actual) - PRIORIDAD ALTA si hay contexto
    if (SimpleConversationHandler.currentProduct.has(chatId)) {
      // Palabras típicas de seguimiento o preguntas detalle
      if (/(incluye|contiene|foto|imagen|precio|cómo|cuánto|qué|tienes|trae|detalles?|info|información)/i.test(lower)) {
        return 'followup';
      }
    }

    // 3. BÚSQUEDA (tiene keywords de productos)
    // Solo si no es seguimiento
    if (/(busco|quiero|necesito|tienes|curso|laptop|moto|megapack|mega|pack|interesa|precio)/i.test(lower)) {
      return 'search';
    }

    // 4. GENERAL (saludos, despedidas, preguntas generales)
    return 'general';
  }

  /**
   * Maneja PAGO - Sistema especializado sin IA
   */
  private async handlePayment(message: string, chatId: string, userId: string): Promise<SimpleResponse> {
    const product = SimpleConversationHandler.currentProduct.get(chatId);
    const { PaymentLinkGenerator } = await import('./payment-link-generator');

    if (!product) {
      return {
        text: 'Para generarte el link de pago exacto, necesito saber qué producto deseas. ¿Me dices el nombre? 😊'
      };
    }

    // Generar links reales y dinámicos (Usando userId para obtener config correcta)
    // PaymentLinkGenerator ya obtiene userId del producto
    const paymentLinks = await PaymentLinkGenerator.generatePaymentLinks(product.id);

    if (!paymentLinks) {
      // Fallback por si falla la generación
      return {
        text: `Tuve un pequeño problema técnico generando el link para ${product.name}. Por favor escribe "asesor" para que te ayudemos manualmente. 🙏`
      };
    }

    // Si el usuario mencionó un método específico, mostrar solo ese
    const lower = message.toLowerCase();
    if (lower.includes('nequi') || lower.includes('daviplata') || lower.includes('paypal') || lower.includes('tarjeta') || lower.includes('transferencia')) {
      const specificMethod = lower.match(/(nequi|daviplata|paypal|tarjeta|transferencia|bancaria)/i)?.[0] || '';
      if (specificMethod) {
        return { text: PaymentLinkGenerator.generateMethodResponse(specificMethod, paymentLinks) };
      }
    }

    // Si no, mostrar todos (instrucciones generales)
    return { text: PaymentLinkGenerator.formatForWhatsApp(paymentLinks) };
  }

  /**
   * Maneja BÚSQUEDA - BÚSQUEDA INTELIGENTE + IA
   */
  private async handleSearch(message: string, chatId: string, userId: string): Promise<SimpleResponse> {
    console.log('[SimpleHandler] 🔍 Búsqueda inteligente iniciada');
    console.log('[SimpleHandler] 📝 Query del usuario:', message);
    
    // 1. BÚSQUEDA INTELIGENTE PREVIA - Filtrar productos relevantes
    const relevantProducts = await this.smartProductSearch(message, userId);
    
    console.log(`[SimpleHandler] 📊 Productos relevantes encontrados: ${relevantProducts.length}`);
    
    // 🔍 LOG: Mostrar productos encontrados
    if (relevantProducts.length > 0) {
      console.log(`[SimpleHandler] 🎯 Top productos relevantes:`);
      relevantProducts.slice(0, 5).forEach((p, i) => {
        console.log(`[SimpleHandler]    ${i + 1}. ${p.name} - ${p.price.toLocaleString('es-CO')} COP`);
      });
    }

    // ❌ NO HAY PRODUCTOS RELEVANTES
    if (relevantProducts.length === 0) {
      return {
        text: 'No encontré productos que coincidan con tu búsqueda. ¿Podrías ser más específico? 😊\n\n¿O prefieres ver todo nuestro catálogo?'
      };
    }

    // 2. ENVIAR SOLO PRODUCTOS RELEVANTES A LA IA
    // La IA recibirá productos PRE-FILTRADOS (máximo 10)
    const responseText = await this.generateResponse({
      message,
      products: relevantProducts, // ✅ Solo productos RELEVANTES pre-filtrados
      chatId,
      context: 'search',
      userId
    });

    // 3. EXTRAER PRODUCTOS MENCIONADOS EN LA RESPUESTA DE LA IA
    // La IA debe mencionar los productos relevantes en su respuesta
    const mentionedProducts = this.extractMentionedProducts(responseText.text, relevantProducts);
    
    console.log(`[SimpleHandler] 🎯 Productos mencionados por IA: ${mentionedProducts.length}`);

    // ❌ LA IA NO ENCONTRÓ PRODUCTOS RELEVANTES
    if (mentionedProducts.length === 0) {
      // La IA tiene libertad para responder naturalmente sin productos
      return {
        text: responseText.text || 'No encontré productos que coincidan con tu búsqueda. ¿Podrías ser más específico? 😊'
      };
    }

    // ✅ GUARDAR PRIMER PRODUCTO
    SimpleConversationHandler.currentProduct.set(chatId, mentionedProducts[0]);

    // 🎯 DECISIÓN INTELIGENTE: ¿Búsqueda específica o genérica?
    const isSpecificSearch = this.isSpecificProductSearch(message);
    
    console.log(`[SimpleHandler] 🤔 Tipo de búsqueda: ${isSpecificSearch ? 'ESPECÍFICA' : 'GENÉRICA'}`);
    console.log(`[SimpleHandler] 📊 Productos encontrados: ${mentionedProducts.length}`);

    if (isSpecificSearch && mentionedProducts.length === 1) {
      // ═══════════════════════════════════════════════════════
      // CASO 1: PRODUCTO ESPECÍFICO → HÍBRIDO + FOTOS CARD
      // ═══════════════════════════════════════════════════════
      console.log('[SimpleHandler] 🎯 Producto específico → Modo HÍBRIDO + FOTOS CARD');
      
      const product = mentionedProducts[0];
      
      // 1. VERIFICAR DATOS REALES
      const { RealDataEnforcer } = await import('./real-data-enforcer');
      const realData = await RealDataEnforcer.getProductData(product.id);
      
      if (realData) {
        // Actualizar con datos REALES
        product.price = realData.price;
        product.name = realData.name;
        product.description = realData.description;
        product.images = realData.images;
        console.log('[SimpleHandler] ✅ Datos REALES verificados');
        console.log('[SimpleHandler]    Precio REAL: ' + RealDataEnforcer.formatPrice(realData.price));
        console.log('[SimpleHandler]    Imágenes: ' + realData.images.length);
      }
      
      // 2. PREPARAR FOTOS CON CAPTION CARD
      const actions: Array<{ type: string; data: any }> = [];
      if (product.images && product.images.length > 0) {
        actions.push({
          type: 'send_photo_card', // Nuevo tipo específico para CARD
          data: { 
            product: product,
            useCardFormat: true // Flag para usar CardPhotoSender
          }
        });
        console.log('[SimpleHandler] 📸 Preparando fotos CARD para: ' + product.name);
      } else {
        console.log('[SimpleHandler] ⚠️ Producto sin imágenes: ' + product.name);
      }
      
      return {
        text: responseText.text,
        actions
      };
      
    } else if (mentionedProducts.length >= 2 && mentionedProducts.length <= 3) {
      // ═══════════════════════════════════════════════════════
      // CASO 2: 2-3 PRODUCTOS → OPCIONES PARA ELEGIR
      // ═══════════════════════════════════════════════════════
      console.log('[SimpleHandler] 📋 Búsqueda genérica → Mostrando 2-3 opciones');
      
      // 1. VERIFICAR DATOS REALES de todos
      const { RealDataEnforcer } = await import('./real-data-enforcer');
      for (const product of mentionedProducts) {
        const realData = await RealDataEnforcer.getProductData(product.id);
        if (realData) {
          product.price = realData.price;
          product.name = realData.name;
          console.log('[SimpleHandler] ✅ Datos REALES: ' + product.name + ' - ' + RealDataEnforcer.formatPrice(realData.price));
        }
      }
      
      // 2. FOTO del primer producto (para dar contexto visual)
      const actions: Array<{ type: string; data: any }> = [];
      if (mentionedProducts[0].images && mentionedProducts[0].images.length > 0) {
        actions.push({
          type: 'send_photo',
          data: { product: mentionedProducts[0] }
        });
        console.log('[SimpleHandler] 📸 Foto del primero: ' + mentionedProducts[0].name);
      }
      
      return {
        text: responseText.text,
        actions
      };
      
    } else {
      // ═══════════════════════════════════════════════════════
      // CASO 3: MUCHOS PRODUCTOS → IA LIBRE PARA FILTRAR
      // ═══════════════════════════════════════════════════════
      console.log('[SimpleHandler] 🎯 Muchos productos → IA filtra y recomienda');
      
      // La IA tiene libertad total para analizar y recomendar
      // Solo enviamos el texto, sin fotos (para no saturar)
      return {
        text: responseText.text
      };
    }
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
        if (p.tags?.some(t => t.toLowerCase().includes(kw))) score += 5;
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
    const product = SimpleConversationHandler.currentProduct.get(chatId)!;

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
    paymentLinks?: any; // Nuevo parámetro opcional
  }): Promise<SimpleResponse> {
    const { message, products, chatId, context, userId, paymentLinks } = params;
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

    // Historial (últimos 5 mensajes)
    const history = SimpleConversationHandler.conversationHistory.get(chatId) || [];
    const recentHistory = history.slice(-5);

    // Prompt Maestro Dinámico - FORZAR ESPAÑOL SIEMPRE
    let systemPrompt = `🇪🇸 IDIOMA OBLIGATORIO: ESPAÑOL (COLOMBIA) 🇪🇸
⚠️ NUNCA RESPONDAS EN INGLÉS - SOLO ESPAÑOL ⚠️

Eres el Asesor de Ventas de ${businessName}.
Tu misión es AYUDAR al cliente y CERRAR VENTAS de forma amable.

🚨 REGLA CRÍTICA DE IDIOMA:
- SIEMPRE responde en ESPAÑOL (Colombia)
- NUNCA uses inglés, ni una sola palabra
- Si el cliente pregunta en inglés, responde en ESPAÑOL
- Eres un vendedor colombiano, NO un asistente genérico de IA

IDENTIDAD:
- Trabajas para: ${businessName}
- Vendes: Productos reales de nuestro catálogo
- NO eres ChatGPT, Claude, ni asistente genérico
- Eres un VENDEDOR PROFESIONAL colombiano

REGLAS DE ACTITUD:
1. Sé EMPÁTICO y PROFESIONAL
2. USA EMOJIS para dar vida al texto (😊, 💻, 💰, ✅, 🚀)
3. ORGANIZACIÓN VISUAL: Usa listas numeradas y espaciado claro
4. TEXTO LIMPIO: NO uses asteriscos ni guiones bajos para formato

🚨 FORMATO CRÍTICO - LEE ESTO:
❌ NO uses asteriscos (*)
❌ NO uses guiones bajos (_)
❌ NO uses puntos para separar (...)
❌ NO des consejos genéricos de IA
❌ NO digas "I understand" o "Here's why" (INGLÉS PROHIBIDO)
✅ USA emojis para destacar
✅ USA espaciado elegante (doble salto de línea)
✅ USA bullets (•) para listas
✅ USA números con emojis (1️⃣ 2️⃣ 3️⃣)
✅ VENDE productos reales de nuestro catálogo

FORMATO DEL MENSAJE (EJEMPLO CORRECTO EN ESPAÑOL):
"¡Excelente elección! 😊 Tenemos estas opciones para ti:

1️⃣ 💻 Portátil Dell Inspiron
   💰 1.200.000 COP
   📝 Intel Core i5, 8GB RAM, 256GB SSD

2️⃣ 📦 Megapack de Cursos
   💰 20.000 COP
   📝 Más de 30 cursos incluidos

¿Cuál te interesa más? 😊"

REGLAS DE NEGOCIO:
1. PAGOS ACEPTADOS: ${paymentMethodsStr || 'Acordar con asesor'}
2. OBJETIVO: Resolver dudas y guiar al pago
3. IDIOMA: SIEMPRE ESPAÑOL (Colombia) - NUNCA INGLÉS
4. PRODUCTOS: Solo los de nuestro catálogo real

`;

    // Contexto según tipo
    if (products.length > 0) {
      const productList = products.map((p, i) => {
        const showFull = context === 'followup' || products.length === 1;
        const desc = p.description || '';
        const descTxt = showFull ? desc : (desc.substring(0, 200) + (desc.length > 200 ? '...' : ''));
        return `${i + 1}. ${p.name} - $${p.price.toLocaleString('es-CO')} COP${descTxt ? `\n   Descripción: ${descTxt}` : ''}`;
      }).join('\n\n');

      if (context === 'followup') {
        systemPrompt += `
🎯 PRODUCTO QUE EL CLIENTE YA VIO:
${productList}

🚨 INSTRUCCIÓN CRÍTICA:
- El cliente pregunta sobre ESTE producto específico
- MUESTRA la información REAL: nombre, precio, descripción
- NO hagas preguntas genéricas como "¿Qué nivel tienes?"
- USA EXACTAMENTE los datos de arriba
- Enfócate en CERRAR LA VENTA con este producto`;
      } else {
        systemPrompt += `
🎯 PRODUCTOS DISPONIBLES EN NUESTRO CATÁLOGO:
${productList}

🧠 TU MISIÓN COMO VENDEDOR INTELIGENTE:

Eres un vendedor PROFESIONAL y PERSUASIVO. Tu objetivo es CERRAR VENTAS usando tu inteligencia natural.

📋 REGLAS FUNDAMENTALES:

1️⃣ **SOLO VENDES LO QUE ESTÁ ARRIBA**
   - Si NO está en el catálogo de arriba, NO existe
   - NUNCA inventes productos externos (Flowkey, Pianote, Yousician, etc.)
   - NUNCA sugieras buscar en internet o escuelas locales

2️⃣ **USA TU INTELIGENCIA PARA VENDER**
   - Analiza qué busca el cliente
   - Si busca algo ESPECÍFICO → Muestra ESE producto con detalles completos
   - Si busca algo GENÉRICO → Muestra 2-3 opciones para que elija
   - Usa técnicas de venta: beneficios, urgencia, valor

3️⃣ **SÉ NATURAL Y PERSUASIVO**
   - Habla como un vendedor colombiano profesional
   - Destaca BENEFICIOS, no solo características
   - Crea DESEO por el producto
   - Usa emojis para dar vida al mensaje

4️⃣ **FORMATO SEGÚN EL CASO**

   📌 CASO A: Cliente busca producto ESPECÍFICO (ej: "quiero el curso de piano")
   → Muestra TODO sobre ESE producto:
   
   "🎹 [NOMBRE EXACTO]
   
   💰 Precio: [PRECIO EXACTO] COP
   
   ✨ [DESCRIPCIÓN COMPLETA + BENEFICIOS]
   
   🎁 [AGREGA VALOR: "Acceso de por vida", "Soporte incluido", etc.]
   
   💳 ¿Listo para empezar? Te envío el link de pago 😊"

   📌 CASO B: Cliente busca opciones GENÉRICAS (ej: "qué cursos tienes")
   → Muestra 2-3 opciones para que elija:
   
   "¡Tengo varias opciones increíbles! 😊
   
   1️⃣ [PRODUCTO 1] - [PRECIO] COP
      [Beneficio principal]
   
   2️⃣ [PRODUCTO 2] - [PRECIO] COP
      [Beneficio principal]
   
   ¿Cuál te llama más la atención? 💬"

🚨 VALIDACIÓN AUTOMÁTICA:
Si mencionas Flowkey, Pianote, Yousician, o pides información innecesaria,
el sistema te BLOQUEARÁ y mostrará el producto real automáticamente.

💡 RECUERDA: Eres un VENDEDOR INTELIGENTE, no un asistente genérico.
Tu trabajo es ATRAER, CONVENCER y CERRAR VENTAS usando los productos del catálogo.`;
      }
      
      // 🔍 LOG CRÍTICO: Mostrar lista de productos en el prompt
      console.log(`[generateResponse] 📋 Lista de productos en prompt (primeros 5):`);
      const firstFive = productList.split('\n\n').slice(0, 5);
      firstFive.forEach(line => console.log(`[generateResponse]    ${line}`));
      if (products.length > 5) {
        console.log(`[generateResponse]    ... y ${products.length - 5} más`);
      }
    } else {
      systemPrompt += `No hay productos en contexto. Responde amablemente.`;
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
    const { ProfessionalCardFormatter } = await import('./professional-card-formatter');
    text = ProfessionalCardFormatter.cleanOldFormat(text);

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
  private async addToHistory(chatId: string, message: SimpleMessage) {
    if (!SimpleConversationHandler.conversationHistory.has(chatId)) {
      SimpleConversationHandler.conversationHistory.set(chatId, []);
    }
    const history = SimpleConversationHandler.conversationHistory.get(chatId)!;
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
