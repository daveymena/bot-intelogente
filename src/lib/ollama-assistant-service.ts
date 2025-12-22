/**
 * Ollama Assistant Service
 * Asistente inteligente para el bot local
 * - Interpretación de intenciones
 * - Memoria y contexto conversacional
 * - Respuestas inteligentes cuando el bot local no sabe qué responder
 */

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface IntentAnalysis {
  intent: string;
  confidence: number;
  entities: {
    product?: string;
    category?: string;
    priceRange?: string;
    paymentMethod?: string;
  };
  needsHumanEscalation: boolean;
  suggestedResponse?: string;
}

interface ContextMemory {
  customerPhone: string;
  conversationHistory: Array<{ role: string; content: string; timestamp: Date }>;
  currentProduct?: string;
  currentIntent?: string;
  budget?: number;
  preferences: string[];
  lastUpdate: Date;
}

export class OllamaAssistantService {
  private static baseUrl = process.env.OLLAMA_BASE_URL || 'https://davey-ollama.mapf5v.easypanel.host';
  private static model = process.env.OLLAMA_MODEL || 'llama3:latest';
  private static timeout = 30000; // 30 segundos para respuestas rápidas
  
  // Memoria en caché (en producción usar Redis o base de datos)
  private static contextMemory = new Map<string, ContextMemory>();

  /**
   * Llamada rápida a Ollama
   */
  private static async callOllama(
    messages: Message[],
    maxTokens: number = 300
  ): Promise<string> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: maxTokens
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.message.content;

    } catch (error: any) {
      console.error('❌ Error en Ollama:', error.message);
      throw error;
    }
  }

  /**
   * 1. INTERPRETACIÓN DE INTENCIONES
   * Analiza el mensaje del cliente para entender qué quiere
   */
  static async analyzeIntent(
    userMessage: string,
    conversationContext?: string[]
  ): Promise<IntentAnalysis> {
    console.log('🧠 Ollama: Analizando intención...');

    const contextStr = conversationContext?.join('\n') || 'Sin contexto previo';

    const prompt = `Analiza este mensaje de un cliente y extrae:
1. Intención principal (buscar_producto, consultar_precio, pagar, info_envio, saludo, despedida, queja, otro)
2. Entidades mencionadas (producto, categoría, rango de precio, método de pago)
3. Si necesita escalamiento humano (quejas, problemas complejos)

Contexto previo:
${contextStr}

Mensaje del cliente:
"${userMessage}"

Responde SOLO en formato JSON:
{
  "intent": "buscar_producto",
  "confidence": 0.95,
  "entities": {
    "product": "laptop",
    "category": "computadores",
    "priceRange": "economico"
  },
  "needsHumanEscalation": false
}`;

    try {
      const response = await this.callOllama([
        {
          role: 'system',
          content: 'Eres un experto en análisis de intenciones. Respondes SOLO en JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], 200);

      // Extraer JSON de la respuesta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        console.log('✅ Intención detectada:', analysis.intent);
        return analysis;
      }

      // Fallback si no hay JSON válido
      return {
        intent: 'otro',
        confidence: 0.5,
        entities: {},
        needsHumanEscalation: false
      };

    } catch (error) {
      console.error('❌ Error al analizar intención:', error);
      return {
        intent: 'otro',
        confidence: 0.3,
        entities: {},
        needsHumanEscalation: false
      };
    }
  }

  /**
   * 2. MEMORIA Y CONTEXTO
   * Guarda y recupera el contexto de la conversación
   */
  static saveContext(
    customerPhone: string,
    message: string,
    role: 'user' | 'assistant',
    metadata?: {
      product?: string;
      intent?: string;
      budget?: number;
      preferences?: string[];
    }
  ): void {
    let context = this.contextMemory.get(customerPhone);

    if (!context) {
      context = {
        customerPhone,
        conversationHistory: [],
        preferences: [],
        lastUpdate: new Date()
      };
    }

    // Agregar mensaje al historial
    context.conversationHistory.push({
      role,
      content: message,
      timestamp: new Date()
    });

    // Actualizar metadata
    if (metadata) {
      if (metadata.product) context.currentProduct = metadata.product;
      if (metadata.intent) context.currentIntent = metadata.intent;
      if (metadata.budget) context.budget = metadata.budget;
      if (metadata.preferences) {
        context.preferences = [...new Set([...context.preferences, ...metadata.preferences])];
      }
    }

    context.lastUpdate = new Date();

    // Mantener solo últimos 20 mensajes
    if (context.conversationHistory.length > 20) {
      context.conversationHistory = context.conversationHistory.slice(-20);
    }

    this.contextMemory.set(customerPhone, context);
    console.log(`💾 Contexto guardado para ${customerPhone}`);
  }

  /**
   * Obtener contexto de un cliente
   */
  static getContext(customerPhone: string): ContextMemory | null {
    return this.contextMemory.get(customerPhone) || null;
  }

  /**
   * Obtener resumen del contexto para usar en prompts
   */
  static getContextSummary(customerPhone: string): string {
    const context = this.getContext(customerPhone);
    if (!context) return 'Cliente nuevo, sin historial previo.';

    const recentMessages = context.conversationHistory.slice(-5);
    const summary = recentMessages.map(m => `${m.role}: ${m.content}`).join('\n');

    let metadata = '';
    if (context.currentProduct) metadata += `\nProducto de interés: ${context.currentProduct}`;
    if (context.budget) metadata += `\nPresupuesto: $${context.budget.toLocaleString()}`;
    if (context.preferences.length > 0) metadata += `\nPreferencias: ${context.preferences.join(', ')}`;

    return `Historial reciente:\n${summary}${metadata}`;
  }

  /**
   * 3. RESPUESTA INTELIGENTE CON FORMATO WHATSAPP
   * Genera una respuesta formateada como el bot local
   */
  static async generateIntelligentResponse(
    userMessage: string,
    customerPhone: string,
    availableProducts?: Array<{ name: string; price: number; category: string }>
  ): Promise<string> {
    console.log('🤖 Ollama: Generando respuesta inteligente...');

    const context = this.getContextSummary(customerPhone);
    
    let productsInfo = '';
    if (availableProducts && availableProducts.length > 0) {
      productsInfo = '\n\nProductos disponibles:\n' + 
        availableProducts.slice(0, 5).map((p, i) => 
          `${i + 1}. *${p.name}*\n   💰 $${p.price.toLocaleString()} COP\n   📦 ${p.category}`
        ).join('\n\n');
    }

    const prompt = `Eres un asistente de ventas profesional de Tecnovariedades D&S.

${context}

${productsInfo}

Cliente pregunta: "${userMessage}"

REGLAS DE FORMATO (IMPORTANTE):
1. Saludo breve con emoji � 
2. Una línea en blanco después del saludo
3. Si mencionas características, usa viñetas con ✅
4. Deja línea en blanco entre secciones
5. Termina con pregunta amigable
6. NO uses ** para negritas, usa * (un asterisco)
7. Máximo 6 líneas de texto

EJEMPLO CORRECTO:
¡Claro! 😊

Para diseño gráfico necesitas:
✅ Procesador Intel Core i7
✅ Mínimo 16GB RAM
✅ SSD de 512GB

¿Tienes algún presupuesto en mente?

Respuesta:`;

    try {
      const response = await this.callOllama([
        {
          role: 'system',
          content: 'Eres un asistente de ventas experto. Respondes con formato WhatsApp usando emojis y negritas (*texto*). Eres breve, profesional y amigable.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], 500);

      console.log('✅ Respuesta generada con formato');
      return this.postProcessResponse(response);

    } catch (error) {
      console.error('❌ Error al generar respuesta:', error);
      return '⚠️ Disculpa, estoy procesando tu solicitud. ¿Podrías reformular tu pregunta?';
    }
  }

  /**
   * 4. EXTRACCIÓN DE INFORMACIÓN
   * Extrae información específica del mensaje (presupuesto, preferencias, etc.)
   */
  static async extractInformation(
    userMessage: string,
    infoType: 'budget' | 'preferences' | 'requirements'
  ): Promise<any> {
    console.log(`🔍 Ollama: Extrayendo ${infoType}...`);

    const prompts = {
      budget: `Extrae el presupuesto o rango de precio mencionado en este mensaje. Si dice "económico" o "barato", responde 500000. Si dice "medio", responde 1500000. Si dice "alto" o "premium", responde 3000000. Si menciona un número específico, usa ese.

Mensaje: "${userMessage}"

Responde SOLO con el número, sin símbolos ni texto adicional.`,

      preferences: `Extrae las preferencias o características mencionadas en este mensaje (color, marca, tamaño, uso, etc.).

Mensaje: "${userMessage}"

Responde SOLO con una lista separada por comas.`,

      requirements: `Extrae los requisitos técnicos o necesidades mencionadas en este mensaje.

Mensaje: "${userMessage}"

Responde SOLO con una lista separada por comas.`
    };

    try {
      const response = await this.callOllama([
        {
          role: 'system',
          content: 'Eres un experto en extracción de información. Respondes de forma concisa y precisa.'
        },
        {
          role: 'user',
          content: prompts[infoType]
        }
      ], 100);

      if (infoType === 'budget') {
        const number = parseInt(response.replace(/\D/g, ''));
        return isNaN(number) ? null : number;
      }

      return response.split(',').map(s => s.trim()).filter(s => s.length > 0);

    } catch (error) {
      console.error(`❌ Error al extraer ${infoType}:`, error);
      return null;
    }
  }

  /**
   * 5. VERIFICAR DISPONIBILIDAD
   */
  static async checkAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * 6. FORMATEAR PRODUCTOS PARA WHATSAPP
   * Formatea una lista de productos con estilo profesional y espaciado limpio
   */
  static formatProductsForWhatsApp(
    products: Array<{ name: string; price: number; category?: string; description?: string }>,
    maxProducts: number = 5
  ): string {
    if (!products || products.length === 0) {
      return '';
    }

    const formatted = products.slice(0, maxProducts).map((product, index) => {
      const lines = [];
      
      // Número y nombre
      lines.push(`*${index + 1}. ${product.name}*`);
      
      // Precio
      lines.push(`💰 $${product.price.toLocaleString('es-CO')} COP`);
      
      // Categoría
      if (product.category) {
        lines.push(`📦 ${product.category}`);
      }
      
      // Descripción corta
      if (product.description) {
        const shortDesc = product.description.substring(0, 70);
        lines.push(`${shortDesc}${product.description.length > 70 ? '...' : ''}`);
      }
      
      return lines.join('\n');
    }).join('\n\n');

    return formatted;
  }

  /**
   * 7. GENERAR RESPUESTA CON PRODUCTOS FORMATEADOS
   * Genera respuesta con productos ya formateados
   */
  static async generateResponseWithProducts(
    userMessage: string,
    customerPhone: string,
    products: Array<{ name: string; price: number; category?: string; description?: string }>
  ): Promise<string> {
    console.log('🤖 Ollama: Generando respuesta con productos formateados...');

    const context = this.getContextSummary(customerPhone);
    const formattedProducts = this.formatProductsForWhatsApp(products, 3);

    const prompt = `Eres un asistente de ventas profesional de Tecnovariedades D&S.

${context}

Cliente pregunta: "${userMessage}"

PRODUCTOS ENCONTRADOS (YA FORMATEADOS):
${formattedProducts}

INSTRUCCIONES:
1. Saludo breve: "¡Perfecto! 😊" o similar
2. UNA línea en blanco
3. Frase corta: "Te muestro las mejores opciones:" o similar
4. UNA línea en blanco
5. COPIA EXACTAMENTE los productos formateados (no los modifiques)
6. UNA línea en blanco
7. Pregunta de cierre

EJEMPLO EXACTO:
¡Perfecto! 😊

Te muestro las mejores opciones:

[PRODUCTOS FORMATEADOS AQUÍ - NO MODIFICAR]

¿Cuál te interesa más?

Respuesta:`;

    try {
      const response = await this.callOllama([
        {
          role: 'system',
          content: 'Eres un asistente de ventas. Los productos ya vienen formateados, solo agrega tu mensaje de introducción y cierre.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], 400);

      // Si Ollama no incluyó los productos, los agregamos
      if (!response.includes('$') && !response.includes('COP')) {
        return `¡Hola! 😊 Encontré estas opciones perfectas para ti:\n\n${formattedProducts}\n\n¿Cuál te interesa más?`;
      }

      console.log('✅ Respuesta con productos generada');
      return this.postProcessResponse(response);

    } catch (error) {
      console.error('❌ Error al generar respuesta:', error);
      // Fallback con productos formateados
      return `¡Hola! 😊 Mira estas opciones:\n\n${formattedProducts}\n\n¿Te interesa alguna?`;
    }
  }

  /**
   * 8. POST-PROCESAR RESPUESTA
   * Limpia y organiza la respuesta para formato WhatsApp perfecto
   */
  private static postProcessResponse(response: string): string {
    let cleaned = response.trim();
    
    // Reemplazar ** por * (negritas de markdown a WhatsApp)
    cleaned = cleaned.replace(/\*\*/g, '*');
    
    // Asegurar espaciado correcto después de emojis
    cleaned = cleaned.replace(/([😊🎉💰✅📦💻🏍️📚📱🚚💳])([^\s])/g, '$1 $2');
    
    // Eliminar múltiples líneas en blanco (máximo 2)
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // Asegurar espacio después de viñetas
    cleaned = cleaned.replace(/✅([^\s])/g, '✅ $1');
    
    // Limpiar espacios múltiples
    cleaned = cleaned.replace(/  +/g, ' ');
    
    return cleaned.trim();
  }

  /**
   * Limpiar contexto antiguo (más de 24 horas)
   */
  static cleanOldContexts(): void {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    for (const [phone, context] of this.contextMemory.entries()) {
      if (context.lastUpdate < oneDayAgo) {
        this.contextMemory.delete(phone);
        console.log(`🗑️ Contexto eliminado para ${phone}`);
      }
    }
  }
}

// Limpiar contextos antiguos cada hora
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    OllamaAssistantService.cleanOldContexts();
  }, 60 * 60 * 1000);
}
