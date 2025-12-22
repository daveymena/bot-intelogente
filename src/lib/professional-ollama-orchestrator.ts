/**
 * ORQUESTADOR PROFESIONAL DE OLLAMA
 * Combina inteligencia de IA con plantillas profesionales
 */

import { PROFESSIONAL_TEMPLATES, formatTemplate, getRandomTransition, getRandomValuePhrase } from './professional-response-templates';

interface ConversationContext {
  userId: string;
  userName?: string;
  lastIntent?: string;
  lastProduct?: any;
  conversationStage?: 'greeting' | 'discovery' | 'presentation' | 'negotiation' | 'closing' | 'farewell';
  offTopicCount?: number;
}

interface OllamaResponse {
  intent: 'greeting' | 'product_inquiry' | 'more_info' | 'payment' | 'objection' | 'off_topic' | 'farewell';
  category?: 'computadores' | 'cursos' | 'megapacks' | 'dropshipping';
  sentiment?: 'positive' | 'neutral' | 'negative';
  needsRedirect?: boolean;
  analysis?: string;
}

export class ProfessionalOllamaOrchestrator {
  
  /**
   * Analiza el mensaje del usuario con Ollama
   */
  static async analyzeMessage(message: string, context: ConversationContext): Promise<OllamaResponse> {
    try {
      const prompt = `Eres un analista de intenciones de compra. Analiza este mensaje de un cliente:

"${message}"

Contexto previo: ${JSON.stringify(context)}

Responde SOLO con un JSON válido con esta estructura:
{
  "intent": "greeting|product_inquiry|more_info|payment|objection|off_topic|farewell",
  "category": "computadores|cursos|megapacks|dropshipping|null",
  "sentiment": "positive|neutral|negative",
  "needsRedirect": true|false,
  "analysis": "breve análisis de la intención"
}`;

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1:8b',
          prompt,
          stream: false,
          options: {
            temperature: 0.3,
            num_predict: 200
          }
        })
      });

      const data = await response.json();
      const analysis = JSON.parse(data.response);
      
      return analysis;
      
    } catch (error) {
      console.error('Error analyzing with Ollama:', error);
      // Fallback: análisis básico
      return this.basicAnalysis(message);
    }
  }

  /**
   * Análisis básico sin IA (fallback)
   */
  static basicAnalysis(message: string): OllamaResponse {
    const lower = message.toLowerCase();
    
    // Detectar saludos
    if (/hola|buenos|buenas|hey|hi/i.test(lower)) {
      return { intent: 'greeting', sentiment: 'positive', needsRedirect: false };
    }
    
    // Detectar productos
    if (/computador|laptop|pc|portatil/i.test(lower)) {
      return { intent: 'product_inquiry', category: 'computadores', sentiment: 'positive', needsRedirect: false };
    }
    
    if (/curso|aprender|photoshop|illustrator|diseño/i.test(lower)) {
      return { intent: 'product_inquiry', category: 'cursos', sentiment: 'positive', needsRedirect: false };
    }
    
    if (/megapack|paquete|todo/i.test(lower)) {
      return { intent: 'product_inquiry', category: 'megapacks', sentiment: 'positive', needsRedirect: false };
    }
    
    // Detectar pago
    if (/pago|pagar|comprar|precio|costo/i.test(lower)) {
      return { intent: 'payment', sentiment: 'positive', needsRedirect: false };
    }
    
    // Detectar objeciones
    if (/caro|costoso|mucho|pensarlo|después/i.test(lower)) {
      return { intent: 'objection', sentiment: 'negative', needsRedirect: false };
    }
    
    // Detectar despedida
    if (/gracias|chao|adiós|bye|hasta luego/i.test(lower)) {
      return { intent: 'farewell', sentiment: 'positive', needsRedirect: false };
    }
    
    // Off-topic
    return { intent: 'off_topic', sentiment: 'neutral', needsRedirect: true };
  }

  /**
   * Genera respuesta profesional basada en análisis
   */
  static async generateProfessionalResponse(
    message: string,
    analysis: OllamaResponse,
    context: ConversationContext,
    products?: any[]
  ): Promise<string> {
    
    // ==================== SALUDOS ====================
    if (analysis.intent === 'greeting') {
      if (context.conversationStage === 'greeting') {
        return PROFESSIONAL_TEMPLATES.SALUDO_RETORNO.template;
      }
      return PROFESSIONAL_TEMPLATES.SALUDO_INICIAL.template;
    }

    // ==================== CONSULTA DE PRODUCTOS ====================
    if (analysis.intent === 'product_inquiry') {
      
      // Presentación por categoría
      if (analysis.category === 'computadores') {
        return PROFESSIONAL_TEMPLATES.PRESENTACION_COMPUTADORES.template;
      }
      
      if (analysis.category === 'cursos') {
        return PROFESSIONAL_TEMPLATES.PRESENTACION_CURSOS.template;
      }
      
      if (analysis.category === 'megapacks') {
        return PROFESSIONAL_TEMPLATES.PRESENTACION_MEGAPACKS.template;
      }
      
      // Si hay productos específicos, usar IA para detalles
      if (products && products.length > 0) {
        return await this.generateProductDetails(products[0], message);
      }
    }

    // ==================== MÁS INFORMACIÓN ====================
    if (analysis.intent === 'more_info') {
      if (context.lastProduct) {
        return await this.generateDetailedInfo(context.lastProduct, message);
      }
      
      return formatTemplate(PROFESSIONAL_TEMPLATES.MAS_INFORMACION.template, {
        detalles: 'Con gusto te ayudo. ¿Qué aspecto específico te gustaría conocer mejor?'
      });
    }

    // ==================== PAGO ====================
    if (analysis.intent === 'payment') {
      if (context.lastProduct) {
        return formatTemplate(PROFESSIONAL_TEMPLATES.CIERRE_VENTA.template, {
          beneficio1: 'Acceso inmediato al producto',
          beneficio2: 'Instrucciones claras por WhatsApp'
        });
      }
      
      return PROFESSIONAL_TEMPLATES.METODOS_PAGO.template.replace('{metodos}', 
        '• Nequi\n• Daviplata\n• Bancolombia\n• Transferencia'
      );
    }

    // ==================== OBJECIONES ====================
    if (analysis.intent === 'objection') {
      if (analysis.sentiment === 'negative' && /caro|costoso|mucho/.test(message.toLowerCase())) {
        const category = context.lastProduct?.category || 'CURSOS';
        const valorPhrase = getRandomValuePhrase(category as any);
        
        return formatTemplate(PROFESSIONAL_TEMPLATES.OBJECION_PRECIO.template, {
          justificacion_valor: valorPhrase,
          beneficio_adicional: 'tenemos opciones de pago flexibles'
        });
      }
      
      if (/pensarlo|después|luego/.test(message.toLowerCase())) {
        return PROFESSIONAL_TEMPLATES.OBJECION_TIEMPO.template;
      }
    }

    // ==================== DESPEDIDA ====================
    if (analysis.intent === 'farewell') {
      if (context.lastProduct) {
        return PROFESSIONAL_TEMPLATES.DESPEDIDA_VENTA.template;
      }
      return PROFESSIONAL_TEMPLATES.DESPEDIDA_SIN_VENTA.template;
    }

    // ==================== OFF-TOPIC (CON REDIRECCIÓN) ====================
    if (analysis.intent === 'off_topic' || analysis.needsRedirect) {
      const offTopicResponse = await this.generateOffTopicResponse(message);
      const transition = getRandomTransition();
      
      return formatTemplate(PROFESSIONAL_TEMPLATES.REDIRECCION_SUTIL.template, {
        respuesta_pregunta: offTopicResponse,
        transicion_venta: transition
      });
    }

    // ==================== FALLBACK ====================
    return await this.generateIntelligentFallback(message, context);
  }

  /**
   * Genera detalles de producto usando IA
   */
  static async generateProductDetails(product: any, userMessage: string): Promise<string> {
    try {
      const prompt = `Eres un vendedor profesional de Tecnovariedades D&S.

Producto: ${product.name}
Precio: $${product.price}
Descripción: ${product.description}

Cliente pregunta: "${userMessage}"

Genera una respuesta profesional, elegante y convincente siguiendo este formato:

✨ **[Nombre del producto]**

📝 [Descripción atractiva]

💰 **Precio:** $[precio]

[Características clave con bullets]

👉 ¿Te gustaría más información o proceder con la compra?

Responde SOLO con el mensaje formateado, sin explicaciones adicionales.`;

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1:8b',
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 300
          }
        })
      });

      const data = await response.json();
      return data.response.trim();
      
    } catch (error) {
      console.error('Error generating product details:', error);
      
      // Fallback a plantilla
      return formatTemplate(PROFESSIONAL_TEMPLATES.PRODUCTO_DETALLE.template, {
        nombre: product.name,
        descripcion: product.description || 'Producto de alta calidad',
        precio: product.price.toLocaleString('es-CO'),
        caracteristicas: '• Entrega inmediata\n• Garantía incluida\n• Soporte técnico'
      });
    }
  }

  /**
   * Genera información detallada con IA
   */
  static async generateDetailedInfo(product: any, userMessage: string): Promise<string> {
    try {
      const prompt = `Eres un asesor experto de Tecnovariedades D&S.

Producto: ${product.name}
Cliente pregunta: "${userMessage}"

Genera una respuesta profesional que:
1. Responda específicamente la pregunta
2. Agregue valor con información relevante
3. Mantenga tono profesional y amigable
4. Termine con una pregunta para continuar la conversación

Máximo 150 palabras.`;

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1:8b',
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 250
          }
        })
      });

      const data = await response.json();
      return data.response.trim();
      
    } catch (error) {
      return formatTemplate(PROFESSIONAL_TEMPLATES.MAS_INFORMACION.template, {
        detalles: 'Con gusto te amplío la información. ¿Qué aspecto específico te interesa conocer?'
      });
    }
  }

  /**
   * Responde preguntas off-topic de forma inteligente
   */
  static async generateOffTopicResponse(message: string): Promise<string> {
    try {
      const prompt = `Eres un asistente amigable de Tecnovariedades D&S.

Cliente pregunta algo no relacionado con productos: "${message}"

Responde de forma:
1. Breve (máximo 2 líneas)
2. Amigable
3. Útil si es posible
4. Sin mencionar productos aún

Ejemplo: Si pregunta "¿Qué hora es?" → "No tengo acceso a la hora exacta, pero puedo ayudarte con nuestros productos 😊"`;

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1:8b',
          prompt,
          stream: false,
          options: {
            temperature: 0.8,
            num_predict: 100
          }
        })
      });

      const data = await response.json();
      return data.response.trim();
      
    } catch (error) {
      return 'Interesante pregunta 😊';
    }
  }

  /**
   * Fallback inteligente cuando no hay coincidencia clara
   */
  static async generateIntelligentFallback(message: string, context: ConversationContext): Promise<string> {
    return `Entiendo tu consulta 😊

¿Podrías darme más detalles sobre lo que buscas? Así puedo ayudarte mejor.

Recuerda que tenemos:
🖥️ Computadores
📚 Cursos digitales
💥 Megapacks
🛍️ Dropshipping

¿Cuál te interesa?`;
  }
}
