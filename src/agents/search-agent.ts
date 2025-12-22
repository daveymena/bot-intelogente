// SearchAgent - Simplified and fully functional
/**
 * Agente de Búsqueda SIMPLIFICADO
 * Usa ContextualBrain para razonamiento inteligente
 * SIN sistema de puntos, SOLO lógica contextual
 */

import { BaseAgent, AgentResponse } from './base-agent';
import { SharedMemory, Product } from './shared-memory';
import { db } from '@/lib/db';
import { ContextualBrain, Message } from '@/lib/contextual-brain';

export class SearchAgent extends BaseAgent {
  constructor() {
    super('SearchAgent');
  }

  /** Verifica si puede manejar el mensaje localmente */
  canHandleLocally(message: string, memory: SharedMemory): boolean {
    // Forzamos siempre el uso de Ollama
    this.log('🦙 FORZANDO uso de Ollama para TODAS las búsquedas');
    return false;
  }

  /** Maneja el mensaje localmente (solo delega a execute) */
  async handleLocally(message: string, memory: SharedMemory): Promise<AgentResponse> {
    return this.execute(message, memory);
  }

  /** Ejecuta el agente delegando totalmente a Ollama */
  async execute(message: string, memory: SharedMemory): Promise<AgentResponse> {
    this.log('🧠 CONFIANDO EN OLLAMA: razonamiento completo de IA');
    return this.handleWithAI(message, memory);
  }

  /** Maneja la lógica con Ollama (obligatorio) */
  async handleWithAI(message: string, memory: SharedMemory): Promise<AgentResponse> {
    this.log('🦙 Usando Ollama con acceso a base de datos');
    try {
      const { AIMultiProvider } = await import('@/lib/ai-multi-provider');

      // 1. BÚSQUEDA DIRECTA EN BD usando keywords del mensaje
      const searchKeywords = message.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .split(/\s+/)
        .filter(w => w.length > 2)
        .filter(w => !['para', 'con', 'de', 'del','la', 'el', 'un', 'una', 'los', 'las', 'quiero', 'busco', 'necesito', 'me', 'interesa'].includes(w));

      this.log(`🔑 Keywords: ${searchKeywords.join(', ')}`);

      const dbProducts = searchKeywords.length > 0 ? await db.product.findMany({
        where: {
          userId: memory.userId,
          status: 'AVAILABLE',
          OR: searchKeywords.flatMap(kw => [
            { name: { contains: kw, mode: 'insensitive' } },
            { description: { contains: kw, mode: 'insensitive' } },
          ])
        },
        select: {
          id: true,
          name: true,
          price: true,
          category: true,
          description: true,
          images: true,
          smartTags: true,
        },
        take: 15,
      }) : await db.product.findMany({
        where: { userId: memory.userId, status: 'AVAILABLE' },
        select: {
          id: true,
          name: true,
          price: true,
          category: true,
          description: true,
          images: true,
          smartTags: true,
        },
        take: 15,
      });

      this.log(`🔍 Buscando productos para userId: ${memory.userId}`);
      this.log(`📦 Cargados ${dbProducts.length} productos de la BD`);

      const allProducts: Product[] = dbProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        description: p.description || undefined,
        images: p.images ? JSON.parse(p.images) : [],
        smartTags: p.smartTags || undefined,
      }));

      // 2. Filtrar si hay demasiados productos (simple keyword filter mejorado)
      let productsToContext = allProducts;
      if (allProducts.length > 50) {
        // Función para normalizar texto (quitar tildes y minúsculas)
        const normalize = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        const messageKeywords = normalize(message).split(' ').filter(w => w.length > 3);
        
        // Agregar sinónimos comunes para búsqueda
        if (normalize(message).includes('portatil')) messageKeywords.push('laptop', 'computador', 'pc');
        if (normalize(message).includes('laptop')) messageKeywords.push('portatil', 'computador');
        if (normalize(message).includes('computador')) messageKeywords.push('portatil', 'laptop', 'pc');
        
        productsToContext = allProducts.filter(p => {
          const text = normalize(p.name + ' ' + p.category + ' ' + (p.description || ''));
          return messageKeywords.some(k => text.includes(k));
        });
        
        // Si el filtro fue muy agresivo y dejó sin nada, recuperar algunos populares o aleatorios
        if (productsToContext.length < 5) {
          this.log('⚠️ Filtro muy estricto, agregando productos populares al contexto');
          const remaining = allProducts.filter(p => !productsToContext.includes(p));
          productsToContext = [...productsToContext, ...remaining.slice(0, 20)];
        }
      }

      const productList = productsToContext
        .map(p => `ID:${p.id} | ${p.name} | $${p.price} | ${p.category}`)
        .join('\n');

      this.log(`📦 Enviando ${productsToContext.length} productos a Ollama (primeros 3):`);
      productsToContext.slice(0, 3).forEach(p => this.log(`- ${p.name}`));

      // 3. Construir contexto de conversación
      const conversationContext = memory.messages
        .slice(-5)
        .map(m => `${m.role === 'user' ? 'Cliente' : 'Bot'}: ${m.content}`)
        .join('\n');

      const currentProductContext = memory.currentProduct
        ? `\n\nProducto actual en conversación:\n- ${memory.currentProduct.name}\n- Precio: ${memory.currentProduct.price.toLocaleString('es-CO')} COP`
        : '';


      // 4. Prompt inteligente para Ollama - Maneja TODO tipo de conversación
      const systemPrompt = `Eres el Asistente de Ventas Profesional e Inteligente de "Tecnovariedades D&S".

⚠️ REGLA DE ORO: TU TRABAJO ES **SELECCIONAR**, NO DESCRIBIR.
NUNCA escribas listas de productos con precios en tu respuesta de texto.
Deja que el sistema muestre las fotos y precios bonitos.

⚠️ FORMATO DE RESPUESTA OBLIGATORIO:

RAZONAMIENTO: [tu análisis breve]
PRODUCTOS: [IDs de productos relevantes separados por coma, o "ninguno"]
KEYWORDS: [palabras clave]
RESPUESTA_SUGERIDA: [tu respuesta conversacional CORTA]

🎯 CÓMO RESPONDER:

1. **SI ENCUENTRAS PRODUCTOS**:
   - En PRODUCTOS: Pon los IDs (Ej: 5, 12, 8).
   - En RESPUESTA_SUGERIDA: Solo una frase invitando a verlos.
   - ✅ BIEN: "¡Claro! Aquí tienes las mejores opciones de portátiles:"

2. **SI EL USUARIO PIDE "LAPTOP", "PORTÁTIL" O "COMPUTADOR"**:
   - Busca productos que sean computadores (Asus, HP, Lenovo, etc).
   - ❌ NO selecciones "Bases", "Fundas" o "Accesorios" a menos que los pidan explícitamente.
   - ✅ Selecciona SOLO computadores reales.

3. **SI ES SOLO CHARLA**:
   - PRODUCTOS: ninguno
   - RESPUESTA_SUGERIDA: Tu respuesta amable.

📍 INFORMACIÓN DEL NEGOCIO:
- Nombre: Tecnovariedades D&S
- WhatsApp: 3136174267
- Email: daveymena16@gmail.com
- Envíos: Físicos (1-3 días) y Digitales (Inmediato).

⚠️ REGLA CRÍTICA SOBRE PAGOS:
SI preguntan por PAGOS:
- PRODUCTOS: ninguno
- RESPUESTA_SUGERIDA: "Te mostraré los métodos de pago disponibles"`;


      const aiMessages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: `${conversationContext}\n${currentProductContext}\n${productList}` },
      ];

      const aiResponse = await AIMultiProvider.generateCompletion(aiMessages, {
        temperature: 0.1,
        max_tokens: 200,
      });

      // 5. Extraer respuesta sugerida (fallback si no sigue formato)
      let suggestedResponse: string | null = null;
      const respIndex = aiResponse.content.indexOf('RESPUESTA_SUGERIDA:');
      if (respIndex !== -1) {
        suggestedResponse = aiResponse.content.substring(respIndex + 'RESPUESTA_SUGERIDA:'.length).trim();
      } else {
        const hasFormatKeywords =
          aiResponse.content.includes('RAZONAMIENTO:') ||
          aiResponse.content.includes('PRODUCTOS:') ||
          aiResponse.content.includes('KEYWORDS:');
        if (!hasFormatKeywords && aiResponse.content.length > 10 && aiResponse.content.length < 500) {
          this.log('⚠️ Ollama no siguió formato, usando respuesta completa como sugerencia');
          suggestedResponse = aiResponse.content.trim();
        }
      }

      this.log(`📝 RESPUESTA_SUGERIDA extraída: "${suggestedResponse?.substring(0, 100)}..."`);

      // 6. Obtener productos seleccionados por Ollama
      const selectedProducts = this.extractProductsFromAI(aiResponse.content, allProducts);

      // 7. Si no hay productos pero hay respuesta sugerida, devolverla
      if (selectedProducts.length === 0 && suggestedResponse && suggestedResponse.length > 5) {
        this.log(`🗣️ Usando respuesta sugerida por Ollama: "${suggestedResponse}"`);
        return { text: suggestedResponse, confidence: 0.9 };
      }

      // 8. Si Ollama seleccionó productos, generar respuestas apropiadas
      if (selectedProducts.length > 0) {
        this.log(`✅ Ollama seleccionó ${selectedProducts.length} producto(s) directamente`);
        const { SharedMemoryService } = await import('./shared-memory');
        const memoryService = SharedMemoryService.getInstance();
        if (selectedProducts.length === 1) {
          memoryService.setCurrentProduct(memory.chatId, selectedProducts[0], 'viewed');
          memory.currentProduct = selectedProducts[0];
          return await this.generateProfessionalResponse(selectedProducts[0], message, memory);
        } else {
          const topProducts = selectedProducts.slice(0, 3);
          memory.interestedProducts = topProducts;
          memoryService.setProductList(memory.chatId, topProducts);
          return await this.generateProductListResponse(topProducts, message, memory);
        }
      }

      // 9. Fallback: buscar por keywords extraídas de la respuesta de Ollama
      this.log('⚠️ Ollama no seleccionó productos, usando keywords');
      const keywords = this.extractKeywordsFromAI(aiResponse.content, message);
      this.log(`🔑 Keywords: ${keywords.join(', ')}`);
      
      // Búsqueda simple por keywords
      const fallbackProducts = await db.product.findMany({
        where: {
          userId: memory.userId,
          status: 'AVAILABLE',
          OR: keywords.map(kw => ({
            OR: [
              { name: { contains: kw, mode: 'insensitive' } },
              { description: { contains: kw, mode: 'insensitive' } },
              { smartTags: { contains: kw, mode: 'insensitive' } },
            ]
          }))
        },
        take: 3
      }).then(products => products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        description: p.description || undefined,
        images: p.images ? JSON.parse(p.images) : [],
        smartTags: p.smartTags || undefined,
      })));

      if (fallbackProducts.length === 0) {
        if (suggestedResponse && suggestedResponse.length > 5) {
          return { text: suggestedResponse, confidence: 0.8 };
        }
        return { text: `No encontré productos para "${message}". ¿Quieres ver otras opciones?`, confidence: 0.6 };
      }

      const { SharedMemoryService } = await import('./shared-memory');
      const memoryService = SharedMemoryService.getInstance();
      if (fallbackProducts.length === 1) {
        memoryService.setCurrentProduct(memory.chatId, fallbackProducts[0], 'viewed');
        memory.currentProduct = fallbackProducts[0];
        // 🔧 FIX: Usar generateProfessionalResponse en vez de ProductAgent para evitar duplicados
        return await this.generateProfessionalResponse(fallbackProducts[0], message, memory);
      }

      const topProducts = fallbackProducts.slice(0, 3);
      memory.interestedProducts = topProducts;
      memoryService.setProductList(memory.chatId, topProducts);
      return await this.generateProductListResponse(topProducts, message, memory);
    } catch (error) {
      this.log('❌ Error usando Ollama:', error);
      return { text: 'Disculpa, tuve un problema procesando tu búsqueda. ¿Puedes intentar de nuevo?', confidence: 0.3 };
    }
  }

  /** Extrae productos seleccionados por Ollama */
  private extractProductsFromAI(aiResponse: string, allProducts: any[]): Product[] {
    const selected: Product[] = [];
    const match = aiResponse.match(/PRODUCTOS?:\s*([^\n]+)/i);
    if (match && match[1]) {
      const line = match[1].toLowerCase();
      if (line.includes('ninguno') || line.includes('none')) {
        this.log('🔍 Ollama no encontró productos coincidentes');
        return [];
      }
      const numbers = line.match(/\d+/g);
      if (numbers) {
        this.log(`🔢 Ollama seleccionó productos: ${numbers.join(', ')}`);
        numbers.forEach(num => {
          const idx = parseInt(num) - 1;
          if (idx >= 0 && idx < allProducts.length) {
            selected.push(allProducts[idx] as Product);
          }
        });
      }
    }
    return selected;
  }

  /** Genera respuesta profesional para un solo producto */
  private async generateProfessionalResponse(product: Product, message: string, memory: SharedMemory): Promise<AgentResponse> {
    this.log(`🎨 Generando respuesta profesional para: ${product.name}`);
    
    // Respuesta simple y directa
    return {
      text: `¡Perfecto! 🎯 Aquí está el **${product.name}**\n\n💰 Precio: $${product.price.toLocaleString('es-CO')} COP\n\n✅ Disponible ahora mismo.\n\n¿Te gustaría conocer más detalles o proceder con la compra?`,
      confidence: 0.9,
      actions: [{ type: 'send_photo', data: { product } }],
    };
  }

  /** Genera respuesta profesional para múltiples productos */
  private async generateProductListResponse(products: Product[], message: string, memory: SharedMemory): Promise<AgentResponse> {
    this.log(`🎨 Generando lista profesional (plantilla local) de ${products.length} productos`);
    const categoryEmojis: { [key: string]: string } = {
      DIGITAL: '📚',
      LAPTOP: '💻',
      MOTORCYCLE: '🏍️',
      PHONE: '📱',
      GAMING: '🎮',
      ACCESSORY: '⌨️',
      COMPONENT: '🔧',
    };
    let response = `¡Hola! 👋 Bienvenido a **Tecnovariedades D&S**\n\n`;
    response += `Tengo estas opciones para ti:\n\n`;
    products.forEach((p, i) => {
      const emoji = categoryEmojis[p.category] || '📦';
      const numberEmoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'][i] || `${i + 1}️⃣`;
      response += `${numberEmoji} ${emoji} **${p.name}**\n`;
      response += `   💰 ${p.price.toLocaleString('es-CO')} COP\n`;
      if (p.description) {
        const shortDesc = p.description.substring(0, 60);
        response += `   ${shortDesc}${p.description.length > 60 ? '...' : ''}\n`;
      }
      response += `\n`;
    });
    response += `¿Cuál te interesa más? Dime el número y te doy todos los detalles 😊`;
    return { text: response, confidence: 0.9 };
  }

  /** Extrae keywords de la respuesta de Ollama */
  private extractKeywordsFromAI(aiResponse: string, originalMessage: string): string[] {
    this.log(`🔍 Analizando respuesta de Ollama: ${aiResponse.substring(0, 150)}...`);
    const stopwords = [
      'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
      'de', 'del', 'en', 'para', 'con', 'y', 'o', 'por', 'sobre',
      'que', 'está', 'son', 'extraigo', 'parece', 'cliente',
      'buscando', 'busca', 'palabras', 'clave', 'keywords',
      'me', 'te', 'se', 'nos', 'les', 'mi', 'tu', 'su',
      'este', 'ese', 'aquel', 'esta', 'esa', 'aquella',
      'respuesta', 'dice', 'quiere', 'necesita', 'ver',
    ];
    const keywords: string[] = [];
    const lower = aiResponse.toLowerCase();
    // 1. Formato KEYWORDS:
    const kwMatch = lower.match(/keywords?:\s*([^\n]+)/i);
    if (kwMatch && kwMatch[1]) {
      const words = kwMatch[1]
        .split(/[,\s]+/)
        .map(w => w.trim())
        .filter(w => w.length > 2 && !stopwords.includes(w));
      if (words.length) {
        this.log(`✅ Encontrado formato KEYWORDS: ${words.join(', ')}`);
        return words;
      }
    }
    // 2. Texto entre comillas
    const quoted = lower.matchAll(/"([^"]+)"|'([^']+)'/g);
    for (const m of quoted) {
      const txt = m[1] || m[2];
      if (txt) {
        const ws = txt.split(/\s+/).filter(w => w.length > 2 && !stopwords.includes(w));
        keywords.push(...ws);
      }
    }
    // 3. Después de "buscando" o "busca"
    const patterns = [
      /buscando\s+(?:un|una|el|la)?\s*([a-záéíóúñ\s]+?)(?:\.|,|\n|$)/i,
      /busca\s+(?:un|una|el|la)?\s*([a-záéíóúñ\s]+?)(?:\.|,|\n|$)/i,
    ];
    for (const pat of patterns) {
      const m = lower.match(pat);
      if (m && m[1]) {
        const ws = m[1]
          .trim()
          .split(/\s+/)
          .filter(w => w.length > 2 && !stopwords.includes(w));
        keywords.push(...ws);
      }
    }
    // 4. Si nada, usar mensaje original
    if (keywords.length === 0) {
      this.log('⚠️ No se encontraron keywords en respuesta de Ollama, usando mensaje original');
      const orig = originalMessage
        .toLowerCase()
        .replace(/[¿?¡!.,;:]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopwords.includes(w));
      keywords.push(...orig);
    }
    const unique = [...new Set(keywords)].map(k => k.trim()).filter(k => k.length > 2);
    this.log(`🔑 Keywords finales: ${unique.join(', ')}`);
    return unique;
  }

  // Placeholder for other helper methods (simpleSearch, showProductList, etc.) that exist elsewhere in the class.
}
