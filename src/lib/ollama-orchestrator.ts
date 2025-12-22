/**
 * 🦙 OLLAMA ORCHESTRATOR con QWEN2.5:3B
 * Ollama maneja TODO usando base de conocimiento JSON
 */

import { AIMultiProvider } from './ai-multi-provider';
import { db } from './db';
import fs from 'fs';
import path from 'path';

export interface OllamaContext {
  products: any[];
  businessInfo: any;
  paymentMethods: any;
  conversationHistory: any[];
  currentProduct?: any;
}

export class OllamaOrchestrator {
  
  /**
   * Carga TODO el contexto necesario para Ollama
   */
  static async loadFullContext(userId: string, chatId: string): Promise<OllamaContext> {
    console.log('🦙 [OLLAMA] Cargando contexto completo...');
    
    // 1. Cargar TODOS los productos del usuario
    const products = await db.product.findMany({
      where: {
        userId,
        status: 'AVAILABLE'
      },
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        description: true,
        images: true,
        stock: true,
        tags: true,
        smartTags: true
      },
      take: 100
    });
    
    console.log(`📦 [OLLAMA] Cargados ${products.length} productos`);
    
    // 2. Información del negocio
    const businessInfo = {
      name: 'Tecnovariedades D&S',
      description: 'Tu tienda de tecnología, cursos digitales y más',
      categories: ['Laptops', 'Motos', 'Cursos Digitales', 'Megapacks', 'Accesorios']
    };
    
    // 3. Métodos de pago
    const paymentMethods = {
      online: ['MercadoPago', 'PayPal'],
      local: ['Nequi', 'Daviplata', 'Transferencia', 'Efectivo']
    };
    
    // 4. Historial de conversación (últimos 10 mensajes)
    const conversationHistory = await db.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        role: true,
        content: true,
        createdAt: true
      }
    }).catch(() => []);
    
    return {
      products,
      businessInfo,
      paymentMethods,
      conversationHistory: conversationHistory.reverse()
    };
  }
  
  /**
   * Genera respuesta COMPLETA usando Ollama SOLO para buscar + Plantillas locales para formato
   */
  static async generateIntelligentResponse(
    message: string,
    context: OllamaContext
  ): Promise<{
    text: string;
    selectedProducts: any[];
    intent: string;
    confidence: number;
  }> {
    console.log('🦙 [OLLAMA] Analizando mensaje...');
    
    // Detectar intención simple
    const intent = this.detectIntent(message);
    console.log(`🎯 [OLLAMA] Intención detectada: ${intent}`);
    
    // Si es saludo, usar plantilla local
    if (intent === 'saludo') {
      return {
        text: this.generateGreeting(),
        selectedProducts: [],
        intent: 'saludo',
        confidence: 0.95
      };
    }
    
    // Si pregunta por pago, usar plantilla local
    if (intent === 'pago') {
      return {
        text: this.generatePaymentInfo(context.paymentMethods),
        selectedProducts: [],
        intent: 'pago',
        confidence: 0.95
      };
    }
    
    // Para búsquedas, intentar con Ollama primero, luego búsqueda local
    console.log('🔍 [OLLAMA] Buscando productos...');
    
    let selectedProducts: any[] = [];
    
    try {
      // Intentar con Ollama si está disponible
      const productList = context.products.map((p, i) => 
        `${i + 1}. ${p.name} - ${p.price.toLocaleString('es-CO')} COP`
      ).join('\n');
      
      const systemPrompt = `Analiza qué producto busca el cliente.

PRODUCTOS:
${productList}

Responde SOLO con números de productos relevantes separados por comas.
Si NO hay productos relevantes, responde "ninguno".

EJEMPLOS:
Cliente: "Curso de Piano" → 5
Cliente: "laptop" → 3, 7, 12
Cliente: "algo económico" → 1, 2, 5
Cliente: "Hola" → ninguno`;

      const aiMessages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: `Cliente: "${message}"` }
      ];
      
      const response = await AIMultiProvider.generateCompletion(aiMessages, {
        temperature: 0.3,
        max_tokens: 50
      });
      
      console.log(`🦙 [OLLAMA] Respuesta: ${response.content}`);
      
      // Extraer números de productos
      const productLine = response.content.toLowerCase();
      
      if (!productLine.includes('ninguno') && !productLine.includes('none')) {
        const numbers = response.content.match(/\d+/g);
        if (numbers) {
          selectedProducts = numbers
            .map(num => {
              const index = parseInt(num) - 1;
              return index >= 0 && index < context.products.length 
                ? context.products[index] 
                : null;
            })
            .filter(p => p !== null);
        }
      }
      
      console.log(`📦 [OLLAMA] Productos encontrados: ${selectedProducts.length}`);
      
    } catch (error) {
      // Fallback: Búsqueda local por keywords
      console.log('⚠️ [OLLAMA] No disponible, usando búsqueda local...');
      selectedProducts = this.searchProductsLocally(message, context.products);
      console.log(`📦 [LOCAL] Productos encontrados: ${selectedProducts.length}`);
    }
    
    // Generar respuesta con plantilla local
    let responseText: string;
    
    if (selectedProducts.length === 0) {
      responseText = this.generateNoProductsResponse();
    } else if (selectedProducts.length === 1) {
      responseText = this.generateSingleProductResponse(selectedProducts[0]);
    } else {
      responseText = this.generateMultipleProductsResponse(selectedProducts);
    }
    
    return {
      text: responseText,
      selectedProducts,
      intent: 'búsqueda',
      confidence: 0.9
    };
  }
  
  /**
   * Detecta intención simple sin IA
   */
  private static detectIntent(message: string): string {
    const lower = message.toLowerCase();
    
    if (/^(hola|buenas|buenos|hey|saludos)/i.test(lower)) {
      return 'saludo';
    }
    
    if (/pago|pagar|nequi|daviplata|mercadopago|paypal|transferencia/i.test(lower)) {
      return 'pago';
    }
    
    return 'búsqueda';
  }
  
  /**
   * Búsqueda local de productos por keywords (sin IA)
   * Mejorada con scoring inteligente
   */
  private static searchProductsLocally(query: string, products: any[]): any[] {
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(/\s+/).filter(k => k.length > 2); // Ignorar palabras cortas
    
    // Buscar productos que coincidan con las keywords
    const matches = products.map(product => {
      let score = 0;
      const productName = product.name.toLowerCase();
      const productDesc = (product.description || '').toLowerCase();
      const productTags = (product.tags?.join(' ') || '').toLowerCase();
      const productText = `${productName} ${productDesc} ${productTags}`;
      
      // 1. Coincidencia exacta en el nombre (máxima prioridad)
      if (productName.includes(queryLower)) {
        score += 100;
      }
      
      // 2. Todas las keywords en el nombre
      const allKeywordsInName = keywords.every(k => productName.includes(k));
      if (allKeywordsInName && keywords.length > 0) {
        score += 50;
      }
      
      // 3. Contar coincidencias de keywords en nombre (alta prioridad)
      keywords.forEach(keyword => {
        if (productName.includes(keyword)) {
          score += 10;
        }
      });
      
      // 4. Coincidencias en descripción (media prioridad)
      keywords.forEach(keyword => {
        if (productDesc.includes(keyword)) {
          score += 3;
        }
      });
      
      // 5. Coincidencias en tags (baja prioridad)
      keywords.forEach(keyword => {
        if (productTags.includes(keyword)) {
          score += 2;
        }
      });
      
      // 6. Penalizar si tiene keywords que NO están en la búsqueda
      const irrelevantKeywords = ['moto', 'laptop', 'curso', 'megapack', 'phone'];
      irrelevantKeywords.forEach(irrelevant => {
        if (!queryLower.includes(irrelevant) && productName.includes(irrelevant)) {
          score -= 5; // Penalización por categoría diferente
        }
      });
      
      return { product, score };
    })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(m => m.product);
    
    return matches;
  }
  
  /**
   * Genera saludo con plantilla local
   */
  private static generateGreeting(): string {
    return `¡Hola! 👋 Bienvenido a **Tecnovariedades D&S**

Aquí encontrarás:
💻 Laptops y computadores
🏍️ Motos
🎓 Cursos digitales y megapacks
📱 Accesorios tecnológicos

¿Qué estás buscando? 🔍`;
  }
  
  /**
   * Genera info de pago con plantilla local
   */
  private static generatePaymentInfo(paymentMethods: any): string {
    return `💳 **Métodos de Pago Disponibles:**

🌐 **Online:**
• MercadoPago (tarjetas, PSE)
• PayPal (internacional)

📱 **Local:**
• Nequi: 313 617 4267
• Daviplata: 313 617 4267
• Transferencia bancaria
• Efectivo (contraentrega)

¿Con cuál método prefieres pagar? 😊`;
  }
  
  /**
   * Genera respuesta para un solo producto
   */
  private static generateSingleProductResponse(product: any): string {
    const emoji = this.getCategoryEmoji(product.category);
    
    return `¡Hola! 👋 Bienvenido a **Tecnovariedades D&S**

${emoji} **${product.name}**

${product.description || 'Excelente opción para ti'}

💰 **Precio:** ${product.price.toLocaleString('es-CO')} COP

✨ **Características destacadas:**
• Excelente calidad
• Disponible inmediatamente
• Garantía incluida

📦 **Disponible ahora**

💳 **¿Cómo prefieres pagar?**
- MercadoPago / PayPal
- Nequi / Daviplata`;
  }
  
  /**
   * Genera respuesta para múltiples productos
   */
  private static generateMultipleProductsResponse(products: any[]): string {
    let response = `¡Hola! 👋 Bienvenido a **Tecnovariedades D&S**\n\nTengo estas opciones para ti:\n\n`;
    
    products.slice(0, 3).forEach((p, i) => {
      const emoji = this.getCategoryEmoji(p.category);
      const numberEmoji = ['1️⃣', '2️⃣', '3️⃣'][i];
      response += `${numberEmoji} ${emoji} **${p.name}**\n`;
      response += `   💰 ${p.price.toLocaleString('es-CO')} COP\n\n`;
    });
    
    response += `¿Cuál te interesa más? Dime el número 😊`;
    
    return response;
  }
  
  /**
   * Genera respuesta cuando no hay productos
   */
  private static generateNoProductsResponse(): string {
    return `¡Hola! 👋 Bienvenido a **Tecnovariedades D&S**

No encontré productos específicos para esa búsqueda.

¿Quieres ver nuestras categorías?
💻 Laptops y computadores
🏍️ Motos
🎓 Cursos digitales
📱 Accesorios

¿Qué te interesa? 🔍`;
  }
  
  /**
   * Obtiene emoji según categoría
   */
  private static getCategoryEmoji(category: string): string {
    const emojis: { [key: string]: string } = {
      'DIGITAL': '📚',
      'LAPTOP': '💻',
      'MOTORCYCLE': '🏍️',
      'PHONE': '📱',
      'GAMING': '🎮',
      'ACCESSORY': '⌨️'
    };
    return emojis[category] || '📦';
  }
  
  /**
   * 🧠 VERSIÓN CON BASE DE CONOCIMIENTO
   * Ollama (Qwen2.5:3b) maneja TODO usando knowledge-base.json
   * PRODUCTOS SIEMPRE DESDE BD (actualizados en tiempo real)
   */
  static async generateWithKnowledgeBase(
    message: string,
    userId: string
  ): Promise<{
    text: string;
    selectedProducts: any[];
    intent: string;
    confidence: number;
  }> {
    console.log('🧠 [Qwen2.5] Generando respuesta con base de conocimiento...');
    
    try {
      // 1. Cargar base de conocimiento (solo plantillas y config)
      const knowledgeBase = this.loadKnowledgeBase();
      
      // 2. Cargar productos SIEMPRE desde BD (actualizados en tiempo real)
      const userProducts = await db.product.findMany({
        where: {
          userId,
          status: 'AVAILABLE'
        },
        select: {
          id: true,
          name: true,
          price: true,
          category: true,
          description: true,
          tags: true
        },
        take: 100 // Aumentado a 100 productos
      });
      
      console.log(`📦 Productos cargados desde BD: ${userProducts.length}`);
      
      // 3. Crear prompt con base de conocimiento + plantillas
      const systemPrompt = this.buildKnowledgeBasePrompt(knowledgeBase, userProducts);
      
      // 4. Generar respuesta con IA (usa modelo del .env)
      const response = await AIMultiProvider.generateCompletion([
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: `Cliente: "${message}"` }
      ], {
        // No especificar modelo - usa el del .env automáticamente
        temperature: 0.7,
        max_tokens: 500
      });
      
      console.log(`🤖 Respuesta generada: ${response.content.substring(0, 100)}...`);
      
      // 5. Extraer productos mencionados
      const selectedProducts = this.extractProductsFromResponse(
        response.content,
        userProducts
      );
      
      return {
        text: response.content,
        selectedProducts,
        intent: 'ai_generated',
        confidence: 0.95
      };
      
    } catch (error) {
      console.error('❌ [Qwen2.5] Error:', error);
      throw error;
    }
  }
  
  /**
   * Carga la base de conocimiento desde JSON
   * NOTA: Solo carga plantillas y configuración, NO productos
   * Los productos se cargan SIEMPRE desde la BD
   */
  private static loadKnowledgeBase(): any {
    try {
      const kbPath = path.join(process.cwd(), 'knowledge-base-compact.json');
      
      if (!fs.existsSync(kbPath)) {
        console.warn('⚠️ knowledge-base-compact.json no existe, usando datos por defecto');
        return this.getDefaultKnowledgeBase();
      }
      
      const content = fs.readFileSync(kbPath, 'utf-8');
      const kb = JSON.parse(content);
      
      // Eliminar productos del JSON (se cargan desde BD)
      delete kb.productos;
      
      console.log('✅ Base de conocimiento cargada (plantillas y config)');
      return kb;
      
    } catch (error) {
      console.error('❌ Error cargando knowledge base:', error);
      return this.getDefaultKnowledgeBase();
    }
  }
  
  /**
   * Base de conocimiento por defecto
   */
  private static getDefaultKnowledgeBase(): any {
    return {
      negocio: 'Tecnovariedades D&S',
      telefono: '313 617 4267',
      productos: [],
      pagos: {
        online: ['MercadoPago', 'PayPal'],
        local: ['Nequi: 313 617 4267', 'Daviplata: 313 617 4267']
      },
      plantillas: {
        greeting: '¡Hola! 👋 Bienvenido a **Tecnovariedades D&S**\n\n¿Qué estás buscando? 🔍',
        paymentInfo: '💳 **Métodos de Pago:**\n\n🌐 Online: MercadoPago, PayPal\n📱 Local: Nequi, Daviplata'
      }
    };
  }
  
  /**
   * Construye el prompt con base de conocimiento + plantillas
   */
  private static buildKnowledgeBasePrompt(kb: any, products: any[]): string {
    // Lista de productos
    const productList = products.map((p, i) => 
      `${i + 1}. ${p.name} - $${p.price.toLocaleString('es-CO')} COP`
    ).join('\n');
    
    return `⚠️ IMPORTANTE: Responde SIEMPRE en ESPAÑOL. Nunca en inglés u otro idioma.

Eres el asistente de ventas de **${kb.negocio}**.

📋 INFORMACIÓN DEL NEGOCIO:
- Nombre: ${kb.negocio}
- Teléfono: ${kb.telefono}
- Categorías: Laptops, Motos, Cursos Digitales, Megapacks

📦 PRODUCTOS DISPONIBLES (${products.length}):
${productList}

💳 MÉTODOS DE PAGO:
🌐 Online: ${kb.pagos.online.join(', ')}
📱 Local: ${kb.pagos.local.join(', ')}

📝 PLANTILLAS DE RESPUESTA:

1️⃣ SALUDO:
${kb.plantillas.greeting}

2️⃣ UN PRODUCTO:
¡Hola! 👋 Bienvenido a **${kb.negocio}**

{emoji} **{nombre del producto}**

{descripción breve}

💰 **Precio:** {precio} COP

✨ **Características destacadas:**
• Excelente calidad
• Disponible inmediatamente
• Garantía incluida

📦 **Disponible ahora**

💳 **¿Cómo prefieres pagar?**
- MercadoPago / PayPal
- Nequi / Daviplata

3️⃣ VARIOS PRODUCTOS:
¡Hola! 👋 Bienvenido a **${kb.negocio}**

Tengo estas opciones para ti:

1️⃣ {emoji} **{producto 1}**
   💰 {precio} COP

2️⃣ {emoji} **{producto 2}**
   💰 {precio} COP

¿Cuál te interesa más? 😊

4️⃣ MÉTODOS DE PAGO:
${kb.plantillas.paymentInfo}

🎯 INSTRUCCIONES:
1. SIEMPRE menciona "${kb.negocio}" en tu respuesta
2. USA emojis apropiados (💻 laptops, 🏍️ motos, 🎓 cursos, 📱 accesorios)
3. COPIA el formato de las plantillas exactamente
4. Incluye precios en formato colombiano (ej: 1.500.000 COP)
5. Menciona métodos de pago al final
6. Sé profesional pero amigable
7. Si preguntan por pago, usa la plantilla 4️⃣
8. Si es saludo, usa la plantilla 1️⃣

Ahora responde al cliente siguiendo EXACTAMENTE el formato de las plantillas:`;
  }
  
  /**
   * Extrae productos mencionados en la respuesta
   */
  private static extractProductsFromResponse(response: string, products: any[]): any[] {
    const mentioned: any[] = [];
    
    products.forEach(product => {
      // Buscar por nombre o ID
      if (response.includes(product.name) || 
          response.includes(product.id.toString())) {
        mentioned.push(product);
      }
    });
    
    return mentioned.slice(0, 3); // Máximo 3 productos
  }
  
  /**
   * Versión simplificada: Solo genera respuesta sin analizar
   */
  static async quickResponse(
    message: string,
    products: any[],
    businessName: string = 'Tecnovariedades D&S'
  ): Promise<string> {
    const productList = products.slice(0, 20).map((p, i) => 
      `${i + 1}. ${p.name} - ${p.price.toLocaleString('es-CO')} COP`
    ).join('\n');
    
    const systemPrompt = `Eres vendedor de ${businessName}.

PRODUCTOS:
${productList}

Responde de forma profesional con emojis.
Formato: Saludo + Info + "¿Cómo prefieres pagar?"`;

    const response = await AIMultiProvider.generateCompletion([
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: message }
    ], {
      temperature: 0.7,
      max_tokens: 400
    });
    
    return response.content;
  }
}
