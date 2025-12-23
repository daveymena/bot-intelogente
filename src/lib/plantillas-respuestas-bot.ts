/**
 * Smart Sales Bot Pro — Flujo conversacional completo para Baileys + Groq
 * Proyecto: Tecnovariedades D&S
 * 
 * Motor modular de plantillas, manejador de estados, integraciones
 * y ejemplos listos para conectar con Baileys (WhatsApp) y Groq (Llama 3.1)
 */

import axios from 'axios';
import { db as prisma } from './db';
import { ProductClassifier } from './product-classifier';
import { TemplateGenerator } from './template-generator';
import { AutoTrainingSystem } from './auto-training-system';

// --------------------------- HELPERS ---------------------------
export const Utils = {
  fill(template: string = '', data: Record<string, any> = {}): string {
    return template.replace(/\{(.*?)\}/g, (_, k) => {
      const key = k.trim();
      return (data[key] !== undefined && data[key] !== null) ? data[key] : `{${key}}`;
    });
  },

  shortId(): string {
    return Math.random().toString(36).slice(2, 9);
  },

  norm(text: string = ''): string {
    return (text || '').toLowerCase().trim();
  },

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }
};

// --------------------------- TEMPLATES ---------------------------
export const Templates = {
  meta: {
    brandName: 'Tecnovariedades D&S',
    businessPhone: '+57 300 123 4567',
    supportEmail: 'soporte@tecnovariedades.com'
  },

  messages: {
    // SALUDOS Y BIENVENIDA
    welcome: `¡Hola! 👋 Bienvenido a *{brandName}* — soy tu asistente virtual inteligente.

¿En qué te puedo ayudar hoy? 🤖

Puedes preguntarme por:
• 📚 *Cursos y Megapacks* de capacitación
• 💻 *Productos tecnológicos* (laptops, accesorios)
• 🔧 *Servicio técnico* y reparaciones
• 💰 *Métodos de pago* y precios`,

    welcome_returning: `¡Hola de nuevo! 😊 Bienvenido de vuelta a *{brandName}*.

¿Sigues interesado en *{last_product}* o necesitas ayuda con algo más?`,

    // PRODUCTOS INDIVIDUALES
    course_info: `🎹 *{product_name}*

{description}

💰 *Precio:* {price} COP
📚 *Tipo:* Curso individual
⏱️ *Duración:* {duration}
🎯 *Nivel:* {level}

¿Te interesa este curso? Responde "Sí" para generar tu link de pago 💳`,

    megapack_info: `🎓 *MEGAPACK: {product_name}*

📚 *Incluye:* {courses_count} cursos completos
🔓 *Acceso:* Vitalicio
💰 *Precio especial:* {price} COP
💵 *Ahorro:* {savings}

Cursos incluidos:
{courses_list}

¿Quieres este megapack completo? 💪`,

    laptop_info: `💻 *{product_name}*

{description}

⚡ *Procesador:* {processor}
🧠 *RAM:* {ram}
💾 *Almacenamiento:* {storage}
🖥️ *Pantalla:* {screen}
💰 *Precio:* {price} COP

¿Te gusta esta laptop? Podemos generar tu link de pago al instante ⚡`,

    // RESPUESTAS DE BÚSQUEDA
    course_found: `¡Perfecto! 🎹 Encontré el curso que buscas:

*{product_name}*
💰 {price} COP

¿Quieres que te envíe más detalles y el link de pago?`,

    megapack_found: `¡Excelente! 🎓 Tengo este megapack perfecto para ti:

*{product_name}*
💰 {price} COP ({courses_count} cursos incluidos)

¿Te envío la información completa?`,

    multiple_options: `¡Claro! 🤔 Tengo varias opciones que te pueden interesar:

{options_list}

¿Cuál te llama más la atención? Dime el número o el nombre.`,

    // PAGOS Y COMPRA
    payment_link: `💳 *¡Perfecto! Aquí tienes tu link de pago*

📦 *Producto:* {product_name}
💰 *Total:* {price} COP
💳 *Método:* {payment_method}

👉 *LINK:* {payment_link}

⚡ Una vez pagues, recibirás acceso inmediato.
📱 Envíanos captura del pago para confirmar.`,

    payment_methods: `💰 *Métodos de pago disponibles:*

• 💳 *MercadoPago* - Tarjetas, PSE, efectivo
• 🌍 *PayPal* - Tarjetas internacionales
• 📱 *Nequi al 3136174267* - Transferencia inmediata
• 💰 *Daviplata al 3136174267* - Transferencia rápida

¿Con cuál prefieres pagar?`,

    payment_links_generated: `{paymentMessage}`,

    // CONFIRMACIÓN DE COMPRA
    purchase_success: `✅ *¡Compra confirmada!*

🎉 ¡Felicitaciones! Tu pago fue procesado correctamente.

📦 *Producto:* {product_name}
💰 *Pagaste:* {price} COP
📧 *Recibirás:* Acceso inmediato por email

¿Necesitas ayuda para acceder al contenido? 🤝`,

    // OBJECIONES Y PREGUNTAS FRECUENTES
    price_objection: `💰 *Entiendo tu preocupación por el precio*

Este curso tiene un valor real de *{original_price}* COP, pero te lo ofrecemos en *{discounted_price}* COP por tiempo limitado.

Además incluye:
✅ Acceso vitalicio
✅ Acceso inmediato
✅ Soporte técnico
✅ Actualizaciones gratuitas

¿Te parece justo el precio? 🤔`,

    quality_question: `🌟 *Calidad garantizada*

Todos nuestros cursos incluyen:
• ✅ *Contenido actualizado* (2024)
• ✅ *Profesores expertos* con años de experiencia
• ✅ *Material descargable* en HD
• ✅ *Certificación oficial*
• ✅ *Garantía de satisfacción* (30 días)

¿Te gustaría ver una muestra del contenido? 📚`,

    // FOTOS Y DEMOS
    sending_photo: `📸 *Te envío la información del producto*

Aquí tienes los detalles de *{product_name}* con foto:`,

    sending_demo: `🎬 *¡Mira esta demo!*

Te envío un adelanto del contenido de *{product_name}*:

[Demo enviado]

¿Te gusta lo que ves? Podemos proceder con la compra 💳`,

    // ERRORES Y FALLBACKS
    not_found: `😅 No encontré exactamente lo que buscas.

¿Podrías darme más detalles? Por ejemplo:
• "¿Cursos de piano para principiantes?"
• "¿Laptop gaming con RTX?"
• "¿Megapack completo de diseño?"

¡Dime qué necesitas y te ayudo! 🤖`,

    clarification_needed: `🤔 Para ayudarte mejor, ¿podrías aclarar:

{clarification_question}

Así te doy la información exacta que necesitas. 😊`,

    // SOPORTE Y CIERRE
    human_escalation: `👨‍💼 *Te conecto con un asesor humano*

Un momento, te paso con uno de nuestros especialistas que te puede ayudar personalmente.

¿Puedes esperar un minuto? ⏳`,

    goodbye: `🙌 *¡Gracias por contactarnos!*

Fue un placer atenderte. Si necesitas cualquier cosa más, estoy aquí 24/7.

¡Que tengas un excelente día! 🌟`,

    // PLANTILLAS LEGACY PARA COMPATIBILIDAD
    product_info: `🔎 *{product_name}*

{description}

💰 Precio: {price}
📦 Disponibilidad: {stock}
✨ Uso recomendado: {use}

Puedes responder: "Fotos", "Especificaciones", "Comprar" o "Comparar"`,

    bundle_info: `🎓 *Megapack: {pack_name}*

📚 Incluye: {count} cursos
🔓 Acceso: {access}
💰 Precio pack: {price_pack}
💵 Precio por unidad: {price_unit}

Responde: "Demo", "Comprar Pack" o "Ver lista completa"`,

    purchase_confirmation: `✅ *Compra confirmada*

📋 Orden: {order_id}
📦 Producto: {product_name}
💰 Total: {total}
💳 Método: {payment_method}

Recibirás enlace y acceso en {delivery_time}.

¿Deseas factura o comprobante? Responde "Factura"`,

    fallback: `Lo siento, no entendí eso. Puedes escribir:
- "Ver productos"
- "Cursos"
- "Servicio"
- "Hablar con asesor"`
  }
};

// --------------------------- PAYMENT INTENT DETECTOR ---------------------------
export class PaymentIntentDetector {
  private static paymentIntents = [
    'quiero pagar',
    'enviame el link',
    'cómo puedo pagar',
    'pago ahora',
    'dame el enlace',
    'pasame el pago',
    'link de compra',
    'finalizar compra',
    'quiero el link',
    'link de mercado pago',
    'link de paypal',
    'enviar link',
    'método de pago',
    'formas de pago',
    'como pago',
    'quiero comprar',
    'realizar pago'
  ];

  static detectIntent(text: string): 'payment_request' | 'payment_methods' | null {
    const norm = Utils.norm(text);

    // Detectar solicitud directa de link de pago
    if (this.paymentIntents.some(intent => norm.includes(intent))) {
      return 'payment_request';
    }

    // Detectar consulta sobre métodos de pago
    if (norm.includes('metodo') || norm.includes('formas de pago') || norm.includes('como pago')) {
      return 'payment_methods';
    }

    return null;
  }

  static detectPaymentMethod(text: string): 'mercadopago' | 'paypal' | 'nequi' | 'daviplata' | null {
    const norm = Utils.norm(text);

    if (norm.includes('mercado') || norm.includes('mercadopago')) return 'mercadopago';
    if (norm.includes('paypal')) return 'paypal';
    if (norm.includes('nequi')) return 'nequi';
    if (norm.includes('daviplata')) return 'daviplata';

    return null;
  }
}

// --------------------------- PAYMENT LINK GENERATOR ---------------------------
export class PaymentLinkGenerator {
  static async generateLink(params: {
    productId: string;
    productName: string;
    amount: number;
    method: string;
    userId?: string;
  }): Promise<string> {
    try {
      // Llamar a la API de generación de links de pago
      const response = await axios.post(`${process.env.NEXT_PUBLIC_APP_URL}/api/payments/generate-link`, {
        productId: params.productId,
        productName: params.productName,
        amount: params.amount,
        method: params.method,
        userId: params.userId
      });

      return response.data.paymentLink || response.data.link;
    } catch (error) {
      console.error('Error generando link de pago:', error);
      
      // Fallback: generar link manual según el método
      return this.generateFallbackLink(params);
    }
  }

  private static generateFallbackLink(params: {
    productName: string;
    amount: number;
    method: string;
  }): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000';
    
    switch (params.method.toLowerCase()) {
      case 'mercadopago':
        return `${baseUrl}/payment/mercadopago?product=${encodeURIComponent(params.productName)}&amount=${params.amount}`;
      case 'paypal':
        return `${baseUrl}/payment/paypal?product=${encodeURIComponent(params.productName)}&amount=${params.amount}`;
      default:
        return `${baseUrl}/payment?product=${encodeURIComponent(params.productName)}&amount=${params.amount}`;
    }
  }
}

// --------------------------- BAILEYS HELPERS ---------------------------
export const BaileysHelpers = {
  textMessage(text: string) {
    return { type: 'text', text };
  },

  buttonsMessage(text: string, buttons: Array<{ id: string; text: string }>) {
    return { type: 'buttons', text, buttons };
  },

  listMessage(title: string, sections: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }>) {
    return { type: 'list', title, sections };
  },

  mediaMessage(url: string, caption: string = '') {
    return { type: 'image', url, caption };
  }
};

// --------------------------- SESSION INTERFACE ---------------------------
interface ConversationSession {
  id: string;
  state: string;
  context: {
    product?: any;
    order?: any;
    paymentMethod?: string;
    userName?: string;
  };
  history: Array<{ from: string; text: string; ts: number }>;
}

// --------------------------- FLOW ENGINE ---------------------------
export class FlowEngine {
  private sessions: Map<string, ConversationSession>;

  constructor() {
    this.sessions = new Map();
  }

  getSession(chatId: string): ConversationSession {
    if (!this.sessions.has(chatId)) {
      this.sessions.set(chatId, {
        id: chatId,
        state: 'welcome',
        context: {},
        history: []
      });
    }
    return this.sessions.get(chatId)!;
  }

  pushHistory(chatId: string, from: string, text: string) {
    const session = this.getSession(chatId);
    session.history.push({ from, text, ts: Date.now() });
    
    // Mantener solo últimos 20 mensajes
    if (session.history.length > 20) {
      session.history = session.history.slice(-20);
    }
  }

  async handleIncoming(params: {
    chatId: string;
    userName?: string;
    text: string;
    raw?: any;
  }) {
    const { chatId, userName, text } = params;
    const session = this.getSession(chatId);
    
    if (userName) session.context.userName = userName;
    
    this.pushHistory(chatId, 'user', text);

    const responses: any[] = [];

    // 1. DETECTAR INTENCIÓN DE PAGO PRIMERO
    const paymentIntent = PaymentIntentDetector.detectIntent(text);
    
    if (paymentIntent === 'payment_methods') {
      const msg = Templates.messages.payment_methods;
      responses.push(BaileysHelpers.buttonsMessage(msg, [
        { id: 'pay_mercadopago', text: '💳 MercadoPago' },
        { id: 'pay_paypal', text: '🌍 PayPal' },
        { id: 'pay_nequi', text: '📱 Nequi' }
      ]));
      return responses;
    }

    if (paymentIntent === 'payment_request') {
      return await this.handlePaymentRequest(chatId, text, session, responses);
    }

    // 2. DETECCIÓN DE INTENCIONES GENERALES
    const norm = Utils.norm(text);
    let intent = 'unknown';

    if (session.state === 'welcome') {
      if (/hola|buenas|buenos|hey/.test(norm)) intent = 'greet';
      else if (/curso|megapack|pack|curso completo/.test(norm)) intent = 'digital';
      else if (/comprar|precio|tiene|disponible|stock/.test(norm)) intent = 'product_inquiry';
      else if (/repar|servicio|soporte|arreglar/.test(norm)) intent = 'service';
      else intent = 'greet';
    } else {
      if (/comprar|aceptar|pagar|si,? quiero/.test(norm)) intent = 'buy_confirm';
      else if (/foto|fotos|imagenes|video/.test(norm)) intent = 'media_request';
      else if (/precio|cuanto|costo/.test(norm)) intent = 'price';
      else if (/ayuda|soporte|problema/.test(norm)) intent = 'support';
      else intent = 'unknown';
    }

    // 3. MANEJAR INTENCIONES
    return await this.handleIntent(intent, chatId, text, session, responses);
  }

  private async handlePaymentRequest(
    chatId: string,
    text: string,
    session: ConversationSession,
    responses: any[]
  ) {
    const product = session.context.product;

    if (!product) {
      responses.push(BaileysHelpers.textMessage(
        '¿Qué producto deseas comprar? Por favor, selecciona un producto primero escribiendo su nombre o "Ver productos".'
      ));
      return responses;
    }

    // Detectar método de pago preferido
    let method = PaymentIntentDetector.detectPaymentMethod(text) || session.context.paymentMethod || 'mercadopago';
    session.context.paymentMethod = method;

    // Generar link de pago
    const paymentLink = await PaymentLinkGenerator.generateLink({
      productId: product.id,
      productName: product.name,
      amount: product.price,
      method
    });

    // Crear orden
    const orderId = 'ORD-' + Utils.shortId().toUpperCase();
    session.context.order = {
      id: orderId,
      product,
      total: product.price,
      paymentLink,
      method
    };

    session.state = 'awaiting_payment';

    const msg = Utils.fill(Templates.messages.payment_link, {
      customer_name: session.context.userName || 'amigo',
      payment_method: method.toUpperCase(),
      product_name: product.name,
      total: Utils.formatPrice(product.price),
      payment_link: paymentLink
    });

    responses.push(BaileysHelpers.textMessage(msg));
    responses.push(BaileysHelpers.buttonsMessage('¿Qué deseas hacer?', [
      { id: 'payment_done', text: '✅ Ya pagué' },
      { id: 'change_method', text: '🔄 Cambiar método' },
      { id: 'view_products', text: '🛒 Ver otros productos' }
    ]));

    this.pushHistory(chatId, 'bot', msg);
    return responses;
  }

  private async handleIntent(
    intent: string,
    chatId: string,
    text: string,
    session: ConversationSession,
    responses: any[]
  ) {
    if (intent === 'greet') {
      session.state = 'awaiting_choice';
      const txt = Utils.fill(Templates.messages.welcome, Templates.meta);
      responses.push(BaileysHelpers.textMessage(txt));
      this.pushHistory(chatId, 'bot', txt);
      return responses;
    }

    if (intent === 'digital') {
      return await this.handleDigitalProducts(chatId, session, responses);
    }

    if (intent === 'product_inquiry') {
      return await this.handleProductInquiry(chatId, text, session, responses);
    }

    if (intent === 'buy_confirm') {
      return await this.handleBuyConfirm(chatId, session, responses);
    }

    if (intent === 'media_request') {
      return await this.handleMediaRequest(chatId, session, responses);
    }

    // Fallback
    const txt = Templates.messages.fallback;
    responses.push(BaileysHelpers.textMessage(txt));
    return responses;
  }

  private async handleDigitalProducts(chatId: string, session: ConversationSession, responses: any[]) {
    session.state = 'browsing_digital';

    try {
      const products = await prisma.product.findMany({
        where: { 
          category: 'DIGITAL'
        },
        take: 5
      });

      if (products.length > 0) {
        const prod = products[0];
        session.context.product = prod;

        const txt = Utils.fill(Templates.messages.bundle_info, {
          pack_name: prod.name,
          count: prod.stock || 0,
          access: 'vitalicio',
          price_pack: Utils.formatPrice(prod.price),
          price_unit: 'Desde $9.99'
        });

        responses.push(BaileysHelpers.buttonsMessage(txt, [
          { id: 'demo', text: 'Ver demo' },
          { id: 'buy_pack', text: 'Comprar pack' }
        ]));

        this.pushHistory(chatId, 'bot', txt);
      }
    } catch (error) {
      console.error('Error cargando productos digitales:', error);
      responses.push(BaileysHelpers.textMessage('Disculpa, hubo un error cargando los productos. Intenta de nuevo.'));
    }

    return responses;
  }

  private async handleProductInquiry(chatId: string, text: string, session: ConversationSession, responses: any[]) {
    session.state = 'browsing_physical';

    try {
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: text } },
            { description: { contains: text } }
          ]
        },
        take: 1
      });

      const found = products[0];

      if (!found) {
        responses.push(BaileysHelpers.textMessage(Templates.messages.fallback));
        return responses;
      }

      session.context.product = found;

      const txt = Utils.fill(Templates.messages.product_info, {
        product_name: found.name,
        description: found.description || '',
        price: Utils.formatPrice(found.price),
        stock: found.stock || 0,
        use: found.category || ''
      });

      responses.push(BaileysHelpers.buttonsMessage(txt, [
        { id: `pics_${found.id}`, text: 'Fotos' },
        { id: `buy_${found.id}`, text: 'Comprar' },
        { id: `compare_${found.id}`, text: 'Comparar' }
      ]));

      this.pushHistory(chatId, 'bot', txt);
    } catch (error) {
      console.error('Error buscando productos:', error);
      responses.push(BaileysHelpers.textMessage('Disculpa, hubo un error buscando productos. Intenta de nuevo.'));
    }

    return responses;
  }

  private async handleBuyConfirm(chatId: string, session: ConversationSession, responses: any[]) {
    const prod = session.context.product;

    if (!prod) {
      responses.push(BaileysHelpers.textMessage('¿Qué producto deseas comprar? Escríbelo o selecciona del catálogo.'));
      return responses;
    }

    // Preguntar método de pago
    responses.push(BaileysHelpers.textMessage(Templates.messages.payment_methods));
    responses.push(BaileysHelpers.buttonsMessage('Selecciona tu método de pago:', [
      { id: 'pay_mercadopago', text: '💳 MercadoPago' },
      { id: 'pay_paypal', text: '🌍 PayPal' },
      { id: 'pay_nequi', text: '📱 Nequi' }
    ]));

    session.state = 'selecting_payment';
    return responses;
  }

  private async handleMediaRequest(chatId: string, session: ConversationSession, responses: any[]) {
    const prod = session.context.product;

    if (prod && prod.images && prod.images.length > 0) {
      responses.push(BaileysHelpers.mediaMessage(prod.images[0], `Imagen de ${prod.name}`));
      responses.push(BaileysHelpers.buttonsMessage('¿Deseas más fotos o ver precio?', [
        { id: 'more_pics', text: 'Más fotos' },
        { id: 'buy', text: 'Comprar ahora' }
      ]));
    } else {
      responses.push(BaileysHelpers.textMessage('No tenemos fotos reales disponibles para este producto, ¿deseas ver especificaciones o comparar?'));
    }

    return responses;
  }
}

// --------------------------- SISTEMA INTELIGENTE DE RESPUESTAS ---------------------------
// --------------------------- SISTEMA INTELIGENTE DE RESPUESTAS ---------------------------
// --------------------------- SISTEMA INTELIGENTE DE RESPUESTAS ---------------------------

/**
 * 🤖 SISTEMA INTELIGENTE BAJO COSTO
 *
 * Usa IA solo para análisis de intención (prompt corto, bajo costo)
 * Genera respuestas desde plantillas locales (cero costo)
 */
export class SmartResponseEngine {
  private static groqRotator: any = null;

  /**
   * Inicializar el sistema inteligente
   */
  static async initialize() {
    if (!this.groqRotator) {
      try {
        const { GroqAPIRotator } = await import('./groq-api-rotator');
        this.groqRotator = GroqAPIRotator;
      } catch (error) {
        console.log('⚠️ Groq no disponible, usando modo local');
      }
    }
  }

  /**
   * 🎯 ANALIZAR INTENCIÓN CON IA CONTEXTUAL
   * Usa IA para interpretar el contexto y la intención real del cliente
   */
  static async analyzeIntent(
    userMessage: string,
    conversationHistory: string[] = [],
    context?: any,
    userId?: string
  ): Promise<{
    intent: string;
    confidence: number;
    entities: any;
    responseTemplate: string;
    templateData: any;
    needsPhoto: boolean;
    needsPayment: boolean;
    useAI: boolean; // Si necesita IA para casos complejos
  }> {
    const msg = Utils.norm(userMessage);

    // 🧠 USAR IA PARA INTERPRETAR CONTEXTO (SIEMPRE)
    // Esto permite entender intenciones complejas como:
    // - "por mercadopago" después de ver un producto = generar link
    // - "método de pago" sin producto = mostrar opciones
    // - "mercado libre" = probablemente quiere mercadopago
    
    if (context?.product?.id && this.isPaymentRequest(msg)) {
      console.log('[SmartResponseEngine] 🧠 Usando IA para interpretar intención de pago con contexto');
      
      try {
        const { AIMultiProvider } = await import('./ai-multi-provider');
        
        // Construir prompt para IA
        const systemPrompt = `Eres un asistente que interpreta intenciones de pago.

CONTEXTO:
- El cliente está viendo el producto: "${context.product.name}"
- Precio: ${typeof context.product.price === 'number' ? Utils.formatPrice(context.product.price) : context.product.price}
- Historial reciente: ${conversationHistory.slice(-3).join(' | ')}

MÉTODOS DISPONIBLES:
1. MercadoPago (tarjetas, PSE, efectivo)
2. PayPal (internacional)
3. Nequi (3136174267)
4. Daviplata (3136174267)

MENSAJE DEL CLIENTE: "${userMessage}"

ANALIZA:
¿El cliente está pidiendo un método específico o solo preguntando por opciones?

RESPONDE EN FORMATO JSON:
{
  "intent": "generate_link" o "show_methods",
  "method": "mercadopago" | "paypal" | "nequi" | "daviplata" | null,
  "confidence": 0-100,
  "reasoning": "explicación breve"
}

REGLAS:
- Si dice "mercadopago", "mercado pago", "mercado libre" → method: "mercadopago", intent: "generate_link"
- Si dice "paypal" → method: "paypal", intent: "generate_link"
- Si dice "nequi" → method: "nequi", intent: "generate_link"
- Si dice "daviplata" → method: "daviplata", intent: "generate_link"
- Si solo pregunta "método de pago", "cómo pago" → intent: "show_methods"`;

        const aiMessages = [
          { role: 'system' as const, content: systemPrompt },
          { role: 'user' as const, content: userMessage }
        ];

        const aiResponse = await AIMultiProvider.generateCompletion(aiMessages, {
          temperature: 0.1,
          max_tokens: 150
        });

        console.log('[SmartResponseEngine] 🤖 Respuesta de IA:', aiResponse.content);

        // Parsear respuesta de IA
        try {
          const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            
            console.log('[SmartResponseEngine] 📊 Análisis:', analysis);
            
            // Si la IA detectó que quiere generar link
            if (analysis.intent === 'generate_link' && analysis.method) {
              console.log(`[SmartResponseEngine] 🎯 IA detectó: generar link de ${analysis.method}`);
              
              // Generar link directamente
              try {
                console.log('[SmartResponseEngine] 🔄 Intentando generar links de pago...');
                const { BotPaymentLinkGenerator } = await import('./bot-payment-link-generator');
                const paymentResult = await BotPaymentLinkGenerator.generatePaymentLinks(
                  context.product.id,
                  userId || 'default',
                  1
                );

                console.log('[SmartResponseEngine] 📊 Resultado:', { success: paymentResult.success, hasMessage: !!paymentResult.message });

                if (paymentResult.success) {
                  console.log('[SmartResponseEngine] ✅ Generando respuesta de pago');
                  
                  // Generar mensaje personalizado según el método
                  let finalMessage = '';
                  const productName = context.product.name;
                  const productPrice = typeof context.product.price === 'number' ? Utils.formatPrice(context.product.price) : context.product.price;
                  
                  if (analysis.method === 'mercadopago') {
                    if (paymentResult.mercadoPagoLink) {
                      finalMessage = `💳 *¡Perfecto! Aquí está tu link de MercadoPago*\n\n`;
                      finalMessage += `📦 *Producto:* ${productName}\n`;
                      finalMessage += `💰 *Total:* ${productPrice}\n\n`;
                      finalMessage += `👉 *LINK DE PAGO:*\n${paymentResult.mercadoPagoLink}\n\n`;
                      finalMessage += `✅ Paga con tarjeta, PSE o efectivo\n`;
                      finalMessage += `⚡ Acceso inmediato después del pago`;
                    } else {
                      // Fallback: mostrar Nequi/Daviplata
                      finalMessage = `📱 *¡Perfecto! Puedes pagar con:*\n\n`;
                      finalMessage += `📦 *Producto:* ${productName}\n`;
                      finalMessage += `💰 *Total:* ${productPrice}\n\n`;
                      finalMessage += `📱 *Nequi:* ${paymentResult.nequiInfo || '3136174267'}\n`;
                      finalMessage += `📱 *Daviplata:* ${paymentResult.daviplataInfo || '3136174267'}\n\n`;
                      finalMessage += `📸 Envíanos captura del pago para confirmar`;
                    }
                  } else if (analysis.method === 'paypal') {
                    if (paymentResult.payPalLink) {
                      finalMessage = `🌍 *¡Perfecto! Aquí está tu link de PayPal*\n\n`;
                      finalMessage += `📦 *Producto:* ${productName}\n`;
                      finalMessage += `💰 *Total:* ${productPrice}\n\n`;
                      finalMessage += `👉 *LINK DE PAGO:*\n${paymentResult.payPalLink}\n\n`;
                      finalMessage += `✅ Paga con tarjeta internacional\n`;
                      finalMessage += `⚡ Acceso inmediato después del pago`;
                    } else {
                      // Fallback: mostrar Nequi/Daviplata
                      finalMessage = `📱 *¡Perfecto! Puedes pagar con:*\n\n`;
                      finalMessage += `📦 *Producto:* ${productName}\n`;
                      finalMessage += `💰 *Total:* ${productPrice}\n\n`;
                      finalMessage += `📱 *Nequi:* ${paymentResult.nequiInfo || '3136174267'}\n`;
                      finalMessage += `📱 *Daviplata:* ${paymentResult.daviplataInfo || '3136174267'}\n\n`;
                      finalMessage += `📸 Envíanos captura del pago para confirmar`;
                    }
                  } else if (analysis.method === 'nequi') {
                    finalMessage = `📱 *¡Perfecto! Aquí está la info para Nequi*\n\n`;
                    finalMessage += `📦 *Producto:* ${productName}\n`;
                    finalMessage += `💰 *Total:* ${productPrice}\n\n`;
                    finalMessage += `📱 *Número Nequi:* ${paymentResult.nequiInfo || '3136174267'}\n\n`;
                    finalMessage += `📸 Envíanos captura del pago para confirmar`;
                  } else if (analysis.method === 'daviplata') {
                    finalMessage = `📱 *¡Perfecto! Aquí está la info para Daviplata*\n\n`;
                    finalMessage += `📦 *Producto:* ${productName}\n`;
                    finalMessage += `💰 *Total:* ${productPrice}\n\n`;
                    finalMessage += `📱 *Número Daviplata:* ${paymentResult.daviplataInfo || '3136174267'}\n\n`;
                    finalMessage += `📸 Envíanos captura del pago para confirmar`;
                  } else {
                    // Sin método específico, mostrar todos
                    finalMessage = paymentResult.message;
                  }
                  
                  // SIEMPRE retornar si tenemos mensaje
                  if (finalMessage) {
                    console.log('[SmartResponseEngine] 📤 Retornando respuesta de pago');
                    return {
                      intent: 'payment_link_generated',
                      confidence: analysis.confidence || 95,
                      entities: {
                        paymentLinks: paymentResult,
                        product: context.product,
                        selectedMethod: analysis.method
                      },
                      responseTemplate: 'payment_links_generated',
                      templateData: {
                        paymentMessage: finalMessage
                      },
                      needsPhoto: false,
                      needsPayment: false,
                      useAI: true
                    };
                  }
                }
              } catch (error) {
                console.error('[SmartResponseEngine] ❌ Error generando link:', error);
              }
            }
          }
        } catch (parseError) {
          console.error('[SmartResponseEngine] ❌ Error parseando respuesta de IA:', parseError);
        }
      } catch (error) {
        console.error('[SmartResponseEngine] ❌ Error usando IA:', error);
      }
    }

    // 🎯 ANÁLISIS LOCAL COMO FALLBACK

    // 0. INTERÉS EN PRODUCTO ESPECÍFICO (PRIORIDAD MÁXIMA - ANTES DE SALUDOS)
    // Detectar frases como "me interesa el megapack de idiomas", "quiero el curso de piano"
    const interestKeywords = ['me interesa', 'quiero', 'necesito', 'busco', 'dame', 'quisiera'];
    const hasInterest = interestKeywords.some(keyword => msg.includes(keyword));
    
    if (hasInterest && userId) {
      console.log('[SmartResponseEngine] 🎯 Detectado interés en producto específico');
      
      // Extraer nombre del producto
      let productQuery = msg;
      interestKeywords.forEach(keyword => {
        productQuery = productQuery.replace(keyword, '').trim();
      });
      productQuery = productQuery.replace(/^(el|la|los|las)\s+/i, '').trim();
      
      console.log(`[SmartResponseEngine] 🔍 Buscando producto: "${productQuery}"`);
      
      try {
        // 🔧 USAR BÚSQUEDA INTELIGENTE CON TOLERANCIA A ERRORES
        const { intelligentProductSearch } = await import('./intelligent-product-search');
        
        const searchResult = await intelligentProductSearch({
          userMessage: productQuery,
          previousProducts: [],
          conversationHistory: conversationHistory
        });
        
        if (searchResult && searchResult.product) {
          const product = searchResult.product;
          console.log(`[SmartResponseEngine] ✅ Producto encontrado: ${product.name} (confianza: ${searchResult.confidence}%)`);
          
          // Intentar usar plantilla entrenada
          const trainedTemplate = await AutoTrainingSystem.getTrainedTemplate(userId, product.id);
          if (trainedTemplate) {
            return {
              intent: 'product_interest',
              confidence: searchResult.confidence,
              entities: {
                product: product.name,
                productId: product.id,
                price: product.price,
                category: product.category,
                description: product.description
              },
              responseTemplate: 'custom_product_template',
              templateData: {
                customTemplate: trainedTemplate,
                product_name: product.name,
                price: Utils.formatPrice(product.price)
              },
              needsPhoto: searchResult.shouldSendPhoto,
              needsPayment: false,
              useAI: false
            };
          }
          
          // Fallback: generar plantilla personalizada
          const classification = ProductClassifier.classifyProduct(product);
          const customTemplate = TemplateGenerator.generateProductFoundTemplate(product, classification);
          
          return {
            intent: 'product_interest',
            confidence: searchResult.confidence,
            entities: {
              product: product.name,
              productId: product.id,
              price: product.price,
              category: product.category,
              description: product.description,
              classification: classification
            },
            responseTemplate: 'custom_product_template',
            templateData: {
              customTemplate: customTemplate,
              product_name: product.name,
              price: Utils.formatPrice(product.price)
            },
            needsPhoto: searchResult.shouldSendPhoto,
            needsPayment: false,
            useAI: false
          };
        } else {
          console.log('[SmartResponseEngine] ⚠️ Producto no encontrado con búsqueda inteligente');
        }
      } catch (error) {
        console.error('[SmartResponseEngine] Error buscando producto:', error);
      }
    }

    // 1. SALUDOS Y BIENVENIDA
    if (this.isGreeting(msg)) {
      return {
        intent: 'greeting',
        confidence: 95,
        entities: {},
        responseTemplate: context?.lastProduct ? 'welcome_returning' : 'welcome',
        templateData: { last_product: context?.lastProduct || '' },
        needsPhoto: false,
        needsPayment: false,
        useAI: false
      };
    }

    // 2. CURSOS ESPECÍFICOS (PRIORIDAD MÁXIMA) - BUSCAR EN BD REAL
    if (msg.includes('curso de') || (msg.includes('curso ') && !msg.includes('cursos'))) {
      const courseName = this.extractCourseName(userMessage);

      // Verificar que el cliente esté entrenado
      if (userId) {
        await AutoTrainingSystem.ensureClientIsTrained(userId);
      }

      try {
        // 🔧 USAR BÚSQUEDA INTELIGENTE CON TOLERANCIA A ERRORES
        const { intelligentProductSearch } = await import('./intelligent-product-search');
        
        const searchResult = await intelligentProductSearch({
          userMessage: userMessage, // Usar mensaje completo para mejor contexto
          previousProducts: [],
          conversationHistory: conversationHistory
        });

        if (searchResult && searchResult.product) {
          const product = searchResult.product;
          console.log(`[SmartResponseEngine] ✅ Curso encontrado: ${product.name} (confianza: ${searchResult.confidence}%)`);
          
          // Intentar usar plantilla entrenada primero
          if (userId) {
            const trainedTemplate = await AutoTrainingSystem.getTrainedTemplate(userId, product.id);
            if (trainedTemplate) {
              return {
                intent: 'course_search',
                confidence: searchResult.confidence,
                entities: {
                  product: product.name,
                  productId: product.id,
                  price: product.price,
                  category: product.category,
                  description: product.description
                },
                responseTemplate: 'custom_product_template',
                templateData: {
                  customTemplate: trainedTemplate,
                  product_name: product.name,
                  price: Utils.formatPrice(product.price)
                },
                needsPhoto: searchResult.shouldSendPhoto,
                needsPayment: false,
                useAI: false
              };
            }
          }

          // Fallback: generar plantilla personalizada basada en clasificación
          const classification = ProductClassifier.classifyProduct(product);
          const customTemplate = TemplateGenerator.generateProductFoundTemplate(product, classification);

          return {
            intent: 'course_search',
            confidence: searchResult.confidence,
            entities: {
              product: product.name,
              productId: product.id,
              price: product.price,
              category: product.category,
              description: product.description,
              classification: classification
            },
            responseTemplate: 'custom_product_template',
            templateData: {
              customTemplate: customTemplate,
              product_name: product.name,
              price: Utils.formatPrice(product.price)
            },
            needsPhoto: searchResult.shouldSendPhoto,
            needsPayment: false,
            useAI: false
          };
        } else {
          console.log('[SmartResponseEngine] ⚠️ Curso no encontrado con búsqueda inteligente');
        }
      } catch (error) {
        console.error('[SmartResponseEngine] Error buscando curso:', error);
      }

      // Si no encontró, usar respuesta genérica
      return {
        intent: 'course_search',
        confidence: 70,
        entities: { product: courseName },
        responseTemplate: 'clarification_needed',
        templateData: {
          clarification_question: `No encontré el curso "${courseName}". ¿Podrías especificar mejor el nombre del curso que buscas?`
        },
        needsPhoto: false,
        needsPayment: false,
        useAI: false
      };
    }

    // 3. MEGAPACKS - BUSCAR EN BD REAL
    if (msg.includes('megapack') || msg.includes('mega pack')) {
      const packName = this.extractProductName(userMessage);

      // Verificar que el cliente esté entrenado
      if (userId) {
        await AutoTrainingSystem.ensureClientIsTrained(userId);
      }

      try {
        // Buscar megapack real en BD (SQLite compatible)
        const product = await prisma.product.findFirst({
          where: {
            AND: [
              { status: 'AVAILABLE' },
              { category: 'DIGITAL' },
              {
                OR: [
                  { name: { contains: packName.toLowerCase() } },
                  { name: { contains: packName.toUpperCase() } },
                  { name: { contains: packName } }
                ]
              }
            ]
          }
        });

        if (product) {
          // Intentar usar plantilla entrenada primero
          if (userId) {
            const trainedTemplate = await AutoTrainingSystem.getTrainedTemplate(userId, product.id);
            if (trainedTemplate) {
              return {
                intent: 'megapack_search',
                confidence: 90,
                entities: {
                  product: product.name,
                  productId: product.id,
                  price: product.price,
                  category: product.category,
                  description: product.description
                },
                responseTemplate: 'custom_product_template',
                templateData: {
                  customTemplate: trainedTemplate,
                  product_name: product.name,
                  price: Utils.formatPrice(product.price),
                  courses_count: product.stock || 'múltiples'
                },
                needsPhoto: false,
                needsPayment: false,
                useAI: false
              };
            }
          }

          // Fallback: generar plantilla personalizada basada en clasificación
          const classification = ProductClassifier.classifyProduct(product);
          const customTemplate = TemplateGenerator.generateProductFoundTemplate(product, classification);

          return {
            intent: 'megapack_search',
            confidence: 90,
            entities: {
              product: product.name,
              productId: product.id,
              price: product.price,
              category: product.category,
              description: product.description,
              classification: classification
            },
            responseTemplate: 'custom_product_template',
            templateData: {
              customTemplate: customTemplate,
              product_name: product.name,
              price: Utils.formatPrice(product.price),
              courses_count: product.stock || 'múltiples'
            },
            needsPhoto: false,
            needsPayment: false,
            useAI: false
          };
        }
      } catch (error) {
        console.error('[SmartResponseEngine] Error buscando megapack:', error);
      }

      // Si no encontró, usar respuesta genérica
      return {
        intent: 'megapack_search',
        confidence: 70,
        entities: { product: packName },
        responseTemplate: 'clarification_needed',
        templateData: {
          clarification_question: `No encontré el megapack "${packName}". ¿Podrías especificar mejor el nombre del paquete que buscas?`
        },
        needsPhoto: false,
        needsPayment: false,
        useAI: false
      };
    }

    // 4. SOLICITUDES DE PAGO
    if (this.isPaymentRequest(msg)) {
      // 🎯 DETECTAR SI EL CLIENTE YA ELIGIÓ UN MÉTODO ESPECÍFICO
      const selectedMethod = this.detectPaymentMethod(msg);
      
      // Si hay un producto en contexto, generar links de pago reales
      if (context?.product?.id && userId) {
        try {
          // ⚡ USAR SERVICIO DE CACHE (respuesta instantánea)
          const { PaymentLinkCacheService } = await import('./payment-link-cache-service');
          const paymentResult = await PaymentLinkCacheService.getPaymentLinks(
            context.product.id,
            userId,
            1
          );

          if (paymentResult.fromCache) {
            console.log('[SmartResponseEngine] ⚡ Links obtenidos del cache (instantáneo)');
          } else {
            console.log('[SmartResponseEngine] 🔄 Links generados dinámicamente');
          }

          if (paymentResult.success && paymentResult.message) {
            // 🎯 Si el cliente eligió un método específico, mostrar SOLO ese link
            let finalMessage = paymentResult.message;
            
            if (selectedMethod) {
              console.log(`[SmartResponseEngine] 🎯 Cliente eligió método: ${selectedMethod}`);
              
              // Generar mensaje personalizado según el método elegido
              if (selectedMethod === 'mercadopago' && paymentResult.mercadoPagoLink) {
                finalMessage = `💳 *¡Perfecto! Aquí está tu link de MercadoPago*\n\n`;
                finalMessage += `📦 *Producto:* ${context.product.name}\n`;
                finalMessage += `💰 *Total:* ${typeof context.product.price === 'number' ? Utils.formatPrice(context.product.price) : context.product.price}\n\n`;
                finalMessage += `👉 *LINK DE PAGO:*\n${paymentResult.mercadoPagoLink}\n\n`;
                finalMessage += `✅ Paga con tarjeta, PSE o efectivo\n`;
                finalMessage += `⚡ Acceso inmediato después del pago`;
              } else if (selectedMethod === 'paypal' && paymentResult.payPalLink) {
                finalMessage = `🌍 *¡Perfecto! Aquí está tu link de PayPal*\n\n`;
                finalMessage += `📦 *Producto:* ${context.product.name}\n`;
                finalMessage += `💰 *Total:* ${typeof context.product.price === 'number' ? Utils.formatPrice(context.product.price) : context.product.price}\n\n`;
                finalMessage += `👉 *LINK DE PAGO:*\n${paymentResult.payPalLink}\n\n`;
                finalMessage += `✅ Paga con tarjeta internacional\n`;
                finalMessage += `⚡ Acceso inmediato después del pago`;
              } else if (selectedMethod === 'nequi' && paymentResult.nequiInfo) {
                finalMessage = `📱 *¡Perfecto! Aquí está la info para Nequi*\n\n`;
                finalMessage += `📦 *Producto:* ${context.product.name}\n`;
                finalMessage += `💰 *Total:* ${typeof context.product.price === 'number' ? Utils.formatPrice(context.product.price) : context.product.price}\n\n`;
                finalMessage += `${paymentResult.nequiInfo}\n\n`;
                finalMessage += `📸 Envíanos captura del pago para confirmar`;
              } else if (selectedMethod === 'daviplata' && paymentResult.daviplataInfo) {
                finalMessage = `📱 *¡Perfecto! Aquí está la info para Daviplata*\n\n`;
                finalMessage += `📦 *Producto:* ${context.product.name}\n`;
                finalMessage += `💰 *Total:* ${typeof context.product.price === 'number' ? Utils.formatPrice(context.product.price) : context.product.price}\n\n`;
                finalMessage += `${paymentResult.daviplataInfo}\n\n`;
                finalMessage += `📸 Envíanos captura del pago para confirmar`;
              }
            }
            
            return {
              intent: 'payment_request',
              confidence: 95,
              entities: {
                paymentLinks: paymentResult,
                product: context.product,
                selectedMethod: selectedMethod
              },
              responseTemplate: 'payment_links_generated',
              templateData: {
                paymentMessage: finalMessage,
                mercadoPagoLink: paymentResult.mercadoPagoLink,
                payPalLink: paymentResult.payPalLink,
                nequiInfo: paymentResult.nequiInfo,
                daviplataInfo: paymentResult.daviplataInfo
              },
              needsPhoto: false,
              needsPayment: false, // Ya generado
              useAI: false
            };
          }
        } catch (error) {
          console.error('[SmartResponseEngine] Error generando links de pago:', error);
        }
      }

      // Fallback: mostrar métodos de pago disponibles SOLO si no hay producto en contexto
      return {
        intent: 'payment_request',
        confidence: 95,
        entities: {},
        responseTemplate: 'payment_methods',
        templateData: {},
        needsPhoto: false,
        needsPayment: false,
        useAI: false
      };
    }

    // 5. SOLICITUDES DE FOTOS
    if (this.isPhotoRequest(msg)) {
      return {
        intent: 'photo_request',
        confidence: 90,
        entities: {},
        responseTemplate: 'sending_photo',
        templateData: {},
        needsPhoto: true,
        needsPayment: false,
        useAI: false
      };
    }

    // 6. MÉTODOS DE PAGO
    if (msg.includes('metodo') || msg.includes('formas de pago') || msg.includes('como pago')) {
      return {
        intent: 'payment_methods',
        confidence: 90,
        entities: {},
        responseTemplate: 'payment_methods',
        templateData: {},
        needsPhoto: false,
        needsPayment: false,
        useAI: false
      };
    }

    // 7. OBJECIONES DE PRECIO
    if (this.isPriceObjection(msg)) {
      return {
        intent: 'price_objection',
        confidence: 85,
        entities: {},
        responseTemplate: 'price_objection',
        templateData: {
          original_price: context?.product?.price * 1.5 || '75.000',
          discounted_price: context?.product?.price || '50.000'
        },
        needsPhoto: false,
        needsPayment: false,
        useAI: false
      };
    }

    // 8. PREGUNTAS DE CALIDAD
    if (this.isQualityQuestion(msg)) {
      return {
        intent: 'quality_question',
        confidence: 80,
        entities: {},
        responseTemplate: 'quality_question',
        templateData: {},
        needsPhoto: false,
        needsPayment: false,
        useAI: false
      };
    }

    // 9. CASOS COMPLEJOS - USAR IA
    if (this.needsAI(msg, conversationHistory)) {
      console.log('[SmartResponseEngine] 🧠 Caso complejo, usando IA...');
      const aiResult = await this.aiAnalysisFallback(userMessage, conversationHistory, context);
      
      // Si la IA tiene baja confianza, considerar escalamiento
      if (aiResult.confidence < 50) {
        console.log('[SmartResponseEngine] ⚠️ IA con baja confianza, evaluando escalamiento...');
        return {
          intent: 'escalate_to_human',
          confidence: aiResult.confidence,
          entities: { reason: 'IA no pudo ayudar con confianza suficiente' },
          responseTemplate: 'human_escalation',
          templateData: {},
          needsPhoto: false,
          needsPayment: false,
          useAI: true
        };
      }
      
      return aiResult;
    }

    // 10. FALLBACK FINAL - EVALUAR ESCALAMIENTO
    console.log('[SmartResponseEngine] ⚠️ Llegó al fallback final, evaluando escalamiento...');
    
    // Si el mensaje parece una pregunta legítima pero no pudimos ayudar, escalar
    const seemsLegitimate = msg.length > 10 && 
                           (msg.includes('?') || 
                            msg.includes('quiero') || 
                            msg.includes('necesito') ||
                            msg.includes('busco') ||
                            msg.includes('tienen'));
    
    if (seemsLegitimate) {
      console.log('[SmartResponseEngine] 🚨 Pregunta legítima sin respuesta, escalando a humano');
      return {
        intent: 'escalate_to_human',
        confidence: 30,
        entities: { reason: 'No se pudo encontrar información relevante' },
        responseTemplate: 'human_escalation',
        templateData: {},
        needsPhoto: false,
        needsPayment: false,
        useAI: false
      };
    }
    
    // Último recurso: pedir aclaración
    return {
      intent: 'clarification_needed',
      confidence: 60,
      entities: {},
      responseTemplate: 'clarification_needed',
      templateData: {
        clarification_question: '¿Podrías especificar qué producto o curso te interesa?'
      },
      needsPhoto: false,
      needsPayment: false,
      useAI: false
    };
  }

  /**
   * 🤖 ANÁLISIS CON IA SOLO PARA CASOS COMPLEJOS (MÍNIMO USO)
   */
  private static async aiAnalysisFallback(
    userMessage: string,
    conversationHistory: string[],
    context?: any
  ): Promise<any> {
    console.log('[SmartResponseEngine] 🧠 Usando IA para caso complejo...');
    
    try {
      const { AIMultiProvider } = await import('./ai-multi-provider');
      
      // Construir prompt inteligente
      const systemPrompt = `Eres un asistente de ventas conversacional para Tecnovariedades D&S.

CONTEXTO:
${context?.product ? `- Producto actual: ${context.product.name} ($${context.product.price})` : '- Sin producto en contexto'}
${conversationHistory.length > 0 ? `- Historial: ${conversationHistory.slice(-3).join(' | ')}` : ''}

MENSAJE DEL CLIENTE: "${userMessage}"

ANALIZA:
1. ¿Qué quiere el cliente?
2. ¿Es una pregunta sobre pago, producto, o general?
3. ¿Necesita que le genere un link de pago?

RESPONDE de forma natural y conversacional (máximo 3 líneas).
Si pregunta por pago y hay producto en contexto, menciona que puedes generar el link.`;

      const aiMessages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userMessage }
      ];

      const aiResponse = await AIMultiProvider.generateCompletion(aiMessages, {
        temperature: 0.7,
        max_tokens: 200
      });

      console.log('[SmartResponseEngine] ✅ IA respondió:', aiResponse.content.substring(0, 100));

      return {
        intent: 'ai_response',
        confidence: 85,
        entities: {},
        responseTemplate: 'ai_generated',
        templateData: {
          aiResponse: aiResponse.content
        },
        needsPhoto: false,
        needsPayment: false,
        useAI: true
      };
    } catch (error) {
      console.error('[SmartResponseEngine] ❌ Error con IA:', error);
      
      // Fallback si falla la IA
      return {
        intent: 'complex_query',
        confidence: 70,
        entities: {},
        responseTemplate: 'clarification_needed',
        templateData: {
          clarification_question: 'Para ayudarte mejor, ¿podrías ser más específico sobre qué necesitas?'
        },
        needsPhoto: false,
        needsPayment: false,
        useAI: false
      };
    }
  }



  /**
   * 📝 GENERAR RESPUESTA DESDE PLANTILLA (SIN IA) O IA
   */
  static generateResponse(
    analysis: any,
    context?: any
  ): string {
    // Si es una respuesta generada por IA, devolverla directamente
    if (analysis.responseTemplate === 'ai_generated' && analysis.templateData?.aiResponse) {
      return analysis.templateData.aiResponse;
    }

    // Si es una plantilla personalizada, devolverla directamente
    if (analysis.responseTemplate === 'custom_product_template' && analysis.templateData?.customTemplate) {
      return analysis.templateData.customTemplate;
    }

    // 💳 CASO ESPECIAL: Links de pago generados dinámicamente
    if (analysis.responseTemplate === 'payment_links_generated' && analysis.templateData?.paymentMessage) {
      console.log('[SmartResponseEngine] 💳 Usando mensaje de pago dinámico generado');
      return analysis.templateData.paymentMessage;
    }

    // Usar plantillas estándar para otros casos
    const template = Templates.messages[analysis.responseTemplate];
    if (!template) {
      return Templates.messages.not_found;
    }

    // Completar datos de plantilla con contexto disponible
    const data = {
      ...Templates.meta,
      ...analysis.templateData,
      // Agregar datos del contexto si están disponibles
      product_name: context?.product?.name || analysis.templateData?.product_name || 'Producto',
      price: context?.product?.price ? Utils.formatPrice(context.product.price) : analysis.templateData?.price || 'Consultar precio',
      payment_method: context?.paymentMethod || 'MercadoPago',
      payment_link: context?.paymentLink || 'https://link-de-pago.com',
      last_product: context?.lastProduct || '',
      ...context
    };

    return Utils.fill(template, data);
  }

  // ========== UTILIDADES ==========

  private static isGreeting(message: string): boolean {
    const greetings = ['hola', 'buenos', 'buenas', 'hey', 'hi', 'hello', 'saludos'];
    return greetings.some(greet => message.includes(greet));
  }

  private static extractCourseName(message: string): string {
    const courseMatch = message.match(/curso\s+de\s+([a-zA-Záéíóúñ\s]+)/i);
    return courseMatch ? courseMatch[1].trim() : 'curso solicitado';
  }

  private static extractProductName(message: string): string {
    // Extraer nombre de producto de la consulta
    return message.replace(/^(quiero|necesito|busco|dame)\s+/i, '').trim();
  }

  private static isPaymentRequest(message: string): boolean {
    const paymentKeywords = [
      'pagar', 'comprar', 'link', 'pago', 'mercado', 'paypal', 'nequi', 'daviplata',
      'quiero pagar', 'como pago', 'metodo de pago', 'forma de pago',
      'generar link', 'enviar link', 'dame el link', 'pasame el link',
      'quiero el link', 'link de pago', 'realizar pago', 'finalizar compra',
      'proceder con el pago', 'hacer el pago', 'efectuar pago'
    ];
    return paymentKeywords.some(keyword => message.includes(keyword));
  }

  private static detectPaymentMethod(message: string): 'mercadopago' | 'paypal' | 'nequi' | 'daviplata' | null {
    const msg = message.toLowerCase();
    
    // Detectar método específico (con variaciones)
    if (msg.includes('mercado pago') || msg.includes('mercadopago') || msg.includes('mercado libre') || msg.includes('mercado')) return 'mercadopago';
    if (msg.includes('paypal') || msg.includes('pay pal')) return 'paypal';
    if (msg.includes('nequi')) return 'nequi';
    if (msg.includes('daviplata') || msg.includes('davi plata')) return 'daviplata';
    
    return null;
  }

  private static isPhotoRequest(message: string): boolean {
    const photoKeywords = ['foto', 'imagen', 'ver', 'mostrar', 'picture', 'fotos'];
    return photoKeywords.some(keyword => message.includes(keyword));
  }

  private static isPriceObjection(message: string): boolean {
    const priceWords = ['caro', 'precio', 'cuesta', 'cuanto', 'vale', 'barato'];
    return priceWords.some(word => message.includes(word));
  }

  private static isQualityQuestion(message: string): boolean {
    const qualityWords = ['calidad', 'bueno', 'malo', 'certificado', 'profesor', 'contenido'];
    return qualityWords.some(word => message.includes(word));
  }

  private static needsAI(message: string, history: string[]): boolean {
    // 🎯 USAR IA PARA CONVERSACIONES NATURALES Y CONTEXTUALES
    
    // 1. Preguntas complejas o comparativas
    const complexIndicators = [
      'comparar', 'diferencia', 'vs', 'versus', 'cual es mejor',
      'recomendacion', 'aconsejar', 'que me sugieres',
      'complejo', 'detallado', 'explicar', 'por que', 'como funciona'
    ];

    // 2. Conversaciones contextuales (referencia a mensajes anteriores)
    const contextualIndicators = [
      'ese', 'eso', 'el que', 'la que', 'lo que',
      'el anterior', 'el de antes', 'el mismo',
      'tambien', 'ademas', 'y si', 'pero'
    ];

    // 3. Preguntas abiertas que necesitan interpretación
    const openQuestions = [
      'como puedo', 'de que forma', 'que tal si',
      'seria posible', 'podria', 'me gustaria',
      'estoy buscando', 'necesito algo', 'tienen algo'
    ];

    // 4. Mensajes con múltiples intenciones
    const hasMultipleIntents = (message.match(/\?/g) || []).length > 1 ||
                               (message.match(/\by\b/g) || []).length > 2;

    // Usar IA si:
    return complexIndicators.some(indicator => message.includes(indicator)) ||
           contextualIndicators.some(indicator => message.includes(indicator)) ||
           openQuestions.some(indicator => message.includes(indicator)) ||
           hasMultipleIntents ||
           message.length > 150 || // Mensajes largos
           (history.length > 3 && message.length > 30); // Conversación larga con mensaje contextual
  }
}

// --------------------------- EXPORTS ---------------------------
export function createFlowEngine(): FlowEngine {
  return new FlowEngine();
}

export function createSmartResponseEngine(): typeof SmartResponseEngine {
  return SmartResponseEngine;
}

