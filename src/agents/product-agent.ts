/**
 * Agente de Producto
 * Muestra información detallada de UN producto
 * Puede funcionar CON o SIN IA externa
 */

import { BaseAgent, AgentResponse } from './base-agent';
import { SharedMemory, Product } from './shared-memory';
import { GoogleDriveConverter } from '@/lib/google-drive-converter';

export class ProductAgent extends BaseAgent {
  constructor() {
    super('ProductAgent');
  }
  
  /**
   * Ejecuta el agente
   */
  async execute(message: string, memory: SharedMemory): Promise<AgentResponse> {
    // 🔍 DEBUG: Ver qué hay en memoria
    this.log('🔍 DEBUG - Estado de memoria:');
    this.log(`  - currentProduct: ${memory.currentProduct?.name || 'ninguno'}`);
    this.log(`  - interestedProducts: ${memory.interestedProducts?.length || 0}`);
    if (memory.interestedProducts && memory.interestedProducts.length > 0) {
      memory.interestedProducts.forEach((p, i) => {
        this.log(`    ${i + 1}. ${p.name}`);
      });
    }
    
    // 🔥 CORRECCIÓN CRÍTICA: Si hay productos en interestedProducts pero no hay currentProduct,
    // establecer el primero como currentProduct
    if (!memory.currentProduct && memory.interestedProducts && memory.interestedProducts.length > 0) {
      this.log('⚠️ Detectado: hay productos interesados pero no hay currentProduct');
      this.log(`Estableciendo ${memory.interestedProducts[0].name} como currentProduct`);
      memory.currentProduct = memory.interestedProducts[0];
    }
    
    // Intentar manejar localmente primero
    if (this.canHandleLocally(message, memory)) {
      return this.handleLocally(message, memory);
    }
    
    // Si no, usar IA
    return this.handleWithAI(message, memory);
  }
  
  /**
   * Determina si puede manejar localmente
   */
  canHandleLocally(message: string, memory: SharedMemory): boolean {
    const product = memory.currentProduct;
    
    // Si no hay producto, no puede manejar localmente
    if (!product) {
      return false;
    }
    
    const cleanMsg = this.cleanMessage(message);
    
    // Puede manejar localmente si es:
    // - Consulta de precio simple
    // - Consulta de disponibilidad simple
    // - Solicitud de información básica
    
    const simpleQueries = [
      'cuanto cuesta',
      'cuanto vale',
      'precio',
      'valor',
      'disponible',
      'tienen',
      'hay',
      'stock',
      'caracteristicas',
      'especificaciones',
      'info',
      'informacion',
      'mas informacion',
      'mas info',
      'quiero mas',
      'dame mas',
      'cuentame mas',
      'dime mas',
    ];
    
    return simpleQueries.some(q => cleanMsg.includes(q));
  }
  
  /**
   * Maneja localmente (sin IA)
   */
  async handleLocally(message: string, memory: SharedMemory): Promise<AgentResponse> {
    this.log('Manejando producto localmente');
    
    const { SharedMemoryService } = await import('./shared-memory');
    const memoryService = SharedMemoryService.getInstance();
    
    let product = memory.currentProduct;
    
    // 🧠 Si no hay producto en contexto, BUSCAR EN HISTORIAL
    if (!product) {
      this.log('⚠️ No hay producto en memoria, buscando en historial...');
      
      // 1️⃣ Intentar obtener del historial de productos (más confiable)
      product = memoryService.findProductInHistory(memory.chatId);
      
      if (product) {
        this.log(`✅ Producto recuperado del historial: ${product.name}`);
        memoryService.setCurrentProduct(memory.chatId, product, 'interested');
        memory.currentProduct = product;
      }
      
      // 2️⃣ Si no está en historial, buscar en mensajes del asistente
      if (!product) {
        const recentMessages = memory.messages.slice(-10);
        
        for (const msg of recentMessages.reverse()) {
          if (msg.role === 'assistant') {
            const productMention = await this.extractProductFromMessage(msg.content, memory.userId);
            if (productMention) {
              this.log(`✅ Producto extraído de mensajes: ${productMention.name}`);
              product = productMention;
              memoryService.setCurrentProduct(memory.chatId, productMention, 'interested');
              memory.currentProduct = productMention;
              break;
            }
          }
        }
      }
      
      // 3️⃣ Si aún no hay producto, buscar en productos interesados
      if (!product && memory.interestedProducts?.length > 0) {
        const lastInterested = memory.interestedProducts[memory.interestedProducts.length - 1];
        this.log(`✅ Usando último producto de interestedProducts: ${lastInterested.name}`);
        product = lastInterested;
        memoryService.setCurrentProduct(memory.chatId, lastInterested, 'interested');
        memory.currentProduct = lastInterested;
      }
      
      // 4️⃣ Si definitivamente no hay producto
      if (!product) {
        return {
          text: `¿Qué producto te interesa? 🤔

Desde Tecnovariedades D&S puedo ayudarte a buscar lo que necesitas.`,
          nextAgent: 'search',
          confidence: 0.8,
        };
      }
    }
    
    // Si hay múltiples productos interesados, guardarlos para selección
    if (memory.interestedProducts.length > 1) {
      const { SharedMemoryService } = await import('./shared-memory');
      const memoryService = SharedMemoryService.getInstance();
      memoryService.setProductList(memory.chatId, memory.interestedProducts);
    }
    
    // Agregar a productos vistos
    if (!memory.viewedProducts.includes(product.id)) {
      memory.viewedProducts.push(product.id);
    }
    
    // 🎯 DECISIÓN: ¿Información breve o completa?
    const cleanMsg = this.cleanMessage(message);
    const wantsMoreInfo = cleanMsg.includes('mas informacion') || 
                          cleanMsg.includes('mas info') || 
                          cleanMsg.includes('mas detalles') ||
                          cleanMsg.includes('cuentame mas') ||
                          cleanMsg.includes('dime mas') ||
                          cleanMsg.includes('quiero saber mas') ||
                          cleanMsg.includes('caracteristicas') ||
                          cleanMsg.includes('especificaciones');
    
    // Si ya se envió info breve y ahora piden más, enviar completa
    const shouldSendFullInfo = wantsMoreInfo || memory.productInfoSent;
    
    // Generar descripción formateada (breve o completa)
    const description = shouldSendFullInfo 
      ? this.formatProductInfo(product)  // Información completa
      : this.formatProductInfoBrief(product);  // Información breve
    
    // Marcar que se envió info del producto
    if (!memory.productInfoSent) {
      memory.productInfoSent = true;
    }
    
    // 📸 Determinar si enviar foto automáticamente usando lógica inteligente
    const { ProductPhotoSender } = await import('../lib/product-photo-sender')
    const photoDecision = ProductPhotoSender.shouldSendPhotosAutomatically(
      message,
      !!(product.images && product.images.length > 0),
      memory.photoSent,
      product.id,
      (memory as any).imageSent
    )

    const shouldSendPhoto = photoDecision.shouldSend

    this.log(`📸 Decisión de foto para ${product.name}: ${photoDecision.shouldSend ? 'ENVIAR' : 'NO ENVIAR'} - ${photoDecision.reason}`)
    
    // Marcar que se envió foto de este producto
    if (shouldSendPhoto) {
      memory.photoSent = true;
      // Marcar con el ID del producto para evitar confusiones
      if (memory.currentProduct) {
        (memory as any).imageSent = memory.currentProduct.id;
        this.log(`📸 Marcando fotos enviadas para producto: ${memory.currentProduct.name}`);
      }
    }
    
    // 🎯 CORRECCIÓN: Enviar foto CON el texto como caption, no como mensajes separados
    return {
      text: description,
      sendPhotos: shouldSendPhoto,
      photos: shouldSendPhoto ? product.images : undefined,
      nextAgent: 'payment',
      confidence: 0.9,
      // 📸 Usar metadata para indicar que la foto debe enviarse CON el texto
      metadata: shouldSendPhoto && product.images ? {
        sendAsImageWithCaption: true,
        productId: product.id,
        imageUrl: this.getValidImageUrl(product.images)  // Pasar todo el campo images
      } : undefined
    };
  }
  
  /**
   * Formatea información BREVE del producto (para primera mención)
   */
  private formatProductInfoBrief(product: any): string {
    const price = this.formatPrice(product.price);
    const category = (product.category || '').toLowerCase();
    const isCourse = category.includes('curso') || category.includes('digital') || product.name.toLowerCase().includes('curso') || product.name.toLowerCase().includes('mega pack');
    
    let text = '';
    
    // 🎯 Presentación breve
    text += `🎯 *${product.name}*\n\n`;
    
    // 💡 Descripción corta (máximo 2 líneas)
    if (product.description) {
      const shortDesc = product.description.substring(0, 150);
      text += `${shortDesc}${product.description.length > 150 ? '...' : ''}\n\n`;
    }
    
    // 💰 Precio
    text += `💰 *Precio:* ${price}\n\n`;
    
    // ✅ Disponibilidad y entrega
    if (isCourse) {
      text += `⚡ *Entrega:* Acceso inmediato por enlace\n`;
      text += `📦 *Formato:* Digital (descarga directa)\n`;
    } else {
      text += `✅ *Disponibilidad:* En stock\n`;
      text += `🚚 *Envío:* A toda Colombia\n`;
    }
    
    // 💬 Invitación a preguntar más
    text += `\n¿Te gustaría saber más detalles o proceder con la compra? 😊`;
    
    return text;
  }

  /**
   * Formatea la información COMPLETA del producto usando metodología AIDA
   * (Atención, Interés, Deseo, Acción)
   */
  private formatProductInfo(product: any): string {
    const price = this.formatPrice(product.price);
    const category = (product.category || '').toLowerCase();
    const isCourse = category.includes('curso') || category.includes('digital') || product.name.toLowerCase().includes('curso') || product.name.toLowerCase().includes('mega pack');
    
    let text = '';
    
    // 🎯 ATENCIÓN: Gancho inicial emocionante
    text += `¡Perfecto! 😊 En Tecnovariedades D&S te cuento sobre el *${product.name}*\n\n`;
    
    // 💡 INTERÉS: Descripción + Beneficios
    if (product.description) {
      text += `${product.description}\n\n`;
    }
    
    // 🎁 DESEO: Qué aprenderás / Qué obtendrás (enriquecido con AIDA)
    if (isCourse) {
      text += this.generateCourseAIDAContent(product);
    } else {
      text += this.generatePhysicalProductAIDAContent(product);
    }
    
    // Especificaciones técnicas (si existen)
    if (product.specs && product.specs.length > 0) {
      text += `\n📋 *Especificaciones:*\n`;
      product.specs.forEach((spec: string) => {
        text += `• ${spec}\n`;
      });
      text += `\n`;
    }
    
    // 💰 Precio con valor percibido
    text += `💰 *Inversión:* ${price}`;
    if (isCourse) {
      text += ` _(acceso de por vida)_`;
    }
    text += `\n\n`;
    
    // 📦 ENTREGA Y DISPONIBILIDAD - DIFERENTE para digital vs físico
    if (isCourse) {
      // PRODUCTOS DIGITALES
      text += `📦 *ENTREGA Y ACCESO:*\n`;
      text += `⚡ Acceso INMEDIATO después del pago\n`;
      text += `📥 Descarga INSTANTÁNEA por enlace\n`;
      text += `♾️ Acceso de por vida (sin límite de tiempo)\n`;
      text += `📱 Disponible en todos tus dispositivos\n\n`;
      text += `💳 *MÉTODOS DE PAGO:*\n`;
      text += `• MercadoPago (tarjetas, PSE)\n`;
      text += `• PayPal (internacional)\n`;
      text += `• Nequi / Daviplata\n`;
      text += `• Transferencia bancaria\n\n`;
    } else {
      // PRODUCTOS FÍSICOS
      text += `📦 *DISPONIBILIDAD Y ENVÍO:*\n`;
      if (product.stock !== undefined) {
        if (product.stock > 0) {
          text += `✅ En stock (${product.stock} unidades disponibles)\n`;
        } else {
          text += `⚠️ Agotado temporalmente\n`;
          text += `💬 Avísame si te interesa para notificarte\n`;
        }
      } else {
        text += `✅ Disponible para entrega inmediata\n`;
      }
      text += `🚚 Envío GRATIS a toda Colombia\n`;
      text += `📍 Entrega en 2-5 días hábiles\n\n`;
      text += `💳 *MÉTODOS DE PAGO:*\n`;
      text += `• 💵 Contraentrega (pagas al recibir)\n`;
      text += `• 💳 Tarjeta de crédito/débito\n`;
      text += `• 📱 Nequi / Daviplata\n`;
      text += `• 🏦 Transferencia bancaria\n\n`;
    }
    
    // 🚀 ACCIÓN: Call to action persuasivo
    if (isCourse) {
      text += `🎯 *¿Listo para transformar tu carrera?*\n`;
      text += `Escribe "Sí" o "Quiero comprarlo" para continuar 🚀`;
    } else {
      text += `🛒 *¿Te gustaría adquirirlo?*\n`;
      text += `Escribe "Sí" para proceder con la compra`;
    }
    
    return text;
  }
  
  /**
   * Genera contenido AIDA enriquecido para cursos/megapacks
   */
  private generateCourseAIDAContent(product: any): string {
    const name = product.name.toLowerCase();
    let content = '';
    
    // Detectar tipo de curso y generar contenido específico
    if (name.includes('diseño') || name.includes('diseno')) {
      content += `✨ *Lo que aprenderás:*\n`;
      content += `• Dominar herramientas profesionales de diseño\n`;
      content += `• Crear proyectos que impresionen a clientes\n`;
      content += `• Técnicas usadas por diseñadores top del mercado\n`;
      content += `• Desarrollar tu portafolio profesional\n\n`;
      content += `🎯 *Perfecto para:* Emprendedores, freelancers y creativos que quieren monetizar su talento\n\n`;
    } else if (name.includes('emprendimiento') || name.includes('negocio')) {
      content += `✨ *Lo que aprenderás:*\n`;
      content += `• Crear y escalar tu propio negocio\n`;
      content += `• Estrategias de ventas que funcionan\n`;
      content += `• Gestión financiera y productividad\n`;
      content += `• Modelos de negocio digitales rentables\n\n`;
      content += `🎯 *Perfecto para:* Emprendedores que quieren generar ingresos desde casa\n\n`;
    } else if (name.includes('marketing')) {
      content += `✨ *Lo que aprenderás:*\n`;
      content += `• Estrategias de marketing digital efectivas\n`;
      content += `• Cómo atraer clientes por internet\n`;
      content += `• Publicidad en redes sociales\n`;
      content += `• Embudos de venta que convierten\n\n`;
      content += `🎯 *Perfecto para:* Negocios que quieren vender más online\n\n`;
    } else if (name.includes('programacion') || name.includes('programación') || name.includes('web')) {
      content += `✨ *Lo que aprenderás:*\n`;
      content += `• Programar desde cero hasta nivel avanzado\n`;
      content += `• Crear aplicaciones y sitios web profesionales\n`;
      content += `• Tecnologías demandadas por empresas\n`;
      content += `• Conseguir trabajo como desarrollador\n\n`;
      content += `🎯 *Perfecto para:* Personas que quieren una carrera en tecnología\n\n`;
    } else if (name.includes('excel') || name.includes('office')) {
      content += `✨ *Lo que aprenderás:*\n`;
      content += `• Dominar Excel de básico a avanzado\n`;
      content += `• Automatizar tareas y ahorrar tiempo\n`;
      content += `• Análisis de datos profesional\n`;
      content += `• Herramientas que usan las empresas\n\n`;
      content += `🎯 *Perfecto para:* Profesionales que quieren ser más productivos\n\n`;
    } else if (name.includes('ingles') || name.includes('inglés') || name.includes('idioma')) {
      content += `✨ *Lo que aprenderás:*\n`;
      content += `• Hablar inglés con fluidez y confianza\n`;
      content += `• Gramática y vocabulario práctico\n`;
      content += `• Conversaciones del día a día\n`;
      content += `• Inglés para negocios y viajes\n\n`;
      content += `🎯 *Perfecto para:* Personas que quieren mejores oportunidades laborales\n\n`;
    } else if (name.includes('fotografia') || name.includes('fotografía') || name.includes('video')) {
      content += `✨ *Lo que aprenderás:*\n`;
      content += `• Técnicas profesionales de fotografía/video\n`;
      content += `• Edición como los profesionales\n`;
      content += `• Crear contenido que vende\n`;
      content += `• Monetizar tu pasión por la imagen\n\n`;
      content += `🎯 *Perfecto para:* Creativos y creadores de contenido\n\n`;
    } else {
      // Contenido genérico para otros cursos
      content += `✨ *Lo que obtendrás:*\n`;
      content += `• Conocimientos prácticos y aplicables\n`;
      content += `• Contenido actualizado y de calidad\n`;
      content += `• Aprende a tu propio ritmo\n`;
      content += `• Acceso inmediato y de por vida\n\n`;
      content += `🎯 *Perfecto para:* Personas que quieren aprender y crecer profesionalmente\n\n`;
    }
    
    // Agregar valor percibido
    content += `💎 *¿Por qué este curso?*\n`;
    content += `• Contenido que el mercado demanda\n`;
    content += `• Aprende habilidades rentables\n`;
    content += `• Invierte en tu futuro profesional\n\n`;
    
    return content;
  }
  
  /**
   * Genera contenido AIDA para productos físicos
   */
  private generatePhysicalProductAIDAContent(product: any): string {
    const name = product.name.toLowerCase();
    let content = '';
    
    if (name.includes('laptop') || name.includes('portatil') || name.includes('computador')) {
      content += `✨ *Beneficios clave:*\n`;
      content += `• Rendimiento para trabajo y entretenimiento\n`;
      content += `• Portabilidad y diseño moderno\n`;
      content += `• Ideal para productividad diaria\n\n`;
    } else if (name.includes('moto')) {
      content += `✨ *Beneficios clave:*\n`;
      content += `• Movilidad rápida y económica\n`;
      content += `• Ahorro en combustible\n`;
      content += `• Perfecta para la ciudad\n\n`;
    } else {
      content += `✨ *Beneficios:*\n`;
      content += `• Calidad garantizada\n`;
      content += `• Excelente relación precio-valor\n`;
      content += `• Entrega rápida y segura\n\n`;
    }
    
    return content;
  }
  
  /**
   * Extrae producto mencionado en un mensaje del historial
   */
  private async extractProductFromMessage(messageContent: string, userId: string): Promise<Product | null> {
    try {
      // Importar dinámicamente para evitar dependencias circulares
      const { db } = await import('@/lib/db');
      
      // Buscar productos que coincidan con el contenido del mensaje
      const products = await db.product.findMany({
        where: {
          userId,
          status: 'AVAILABLE'
        }
      });
      
      // Buscar el producto cuyo nombre aparece en el mensaje
      for (const p of products) {
        if (messageContent.includes(p.name)) {
          return {
            id: p.id,
            name: p.name,
            description: p.description || undefined,
            price: p.price,
            category: p.category,
            images: p.images ? [p.images] : undefined,
            stock: p.stock || undefined,
            specs: undefined
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('[ProductAgent] Error extrayendo producto del historial:', error);
      return null;
    }
  }

  /**
   * Maneja con IA (para consultas complejas)
   */
  async handleWithAI(message: string, memory: SharedMemory): Promise<AgentResponse> {
    this.log('Manejando producto con IA');
    
    // 🔍 DEBUG: Ver qué hay en memoria
    this.log('🔍 DEBUG - Estado de memoria:');
    this.log(`  - currentProduct: ${memory.currentProduct?.name || 'ninguno'}`);
    this.log(`  - interestedProducts: ${memory.interestedProducts?.length || 0}`);
    if (memory.interestedProducts && memory.interestedProducts.length > 0) {
      memory.interestedProducts.forEach((p, i) => {
        this.log(`    ${i + 1}. ${p.name}`);
      });
    }
    
    // 🔥 CORRECCIÓN CRÍTICA: Si hay productos en interestedProducts pero no hay currentProduct,
    // establecer el primero como currentProduct
    if (!memory.currentProduct && memory.interestedProducts && memory.interestedProducts.length > 0) {
      this.log('⚠️ Detectado: hay productos interesados pero no hay currentProduct');
      this.log(`Estableciendo ${memory.interestedProducts[0].name} como currentProduct`);
      memory.currentProduct = memory.interestedProducts[0];
    }
    
    const product = memory.currentProduct;
    
    // 🔥 CORRECCIÓN: Si hay producto, siempre mostrar su información
    if (product) {
      this.log(`✅ Hay producto en contexto: ${product.name}`);
      // Fallback a respuesta local que funciona bien
      return this.handleLocally(message, memory);
    }
    
    // Si no hay producto, pedir que especifique
    this.log('❌ No hay producto en contexto');
    return {
      text: `¿Qué producto te interesa? 🤔

Desde Tecnovariedades D&S puedo ayudarte a buscar lo que necesitas.`,
      nextAgent: 'search',
      confidence: 0.7,
      requiresAI: true,
    };
  }
  
  /**
   * Valida y limpia la URL de imagen (igual que ProductPhotoSender)
   */
  private getValidImageUrl(images: any): string | undefined {
    if (!images) {
      this.log('⚠️ No hay imágenes');
      return undefined;
    }
    
    let photos: string[] = [];
    
    try {
      // Parsear igual que ProductPhotoSender
      const parsed = typeof images === 'string' ? JSON.parse(images) : images;
      photos = Array.isArray(parsed) ? parsed : [parsed];
      this.log(`📸 Fotos encontradas: ${photos.length}`);
    } catch (e) {
      this.log('⚠️ Error parseando imágenes');
      return undefined;
    }
    
    if (photos.length === 0 || !photos[0]) {
      this.log('⚠️ No hay fotos válidas');
      return undefined;
    }
    
    let imageUrl = photos[0].trim();
    
    // Convertir URLs de Google Drive (igual que ProductPhotoSender)
    const converted = GoogleDriveConverter.convertMultipleUrls([imageUrl]);
    imageUrl = converted[0];
    
    // Validar que sea una URL válida
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      this.log(`⚠️ URL inválida: ${imageUrl}`);
      return undefined;
    }
    
    // Validar longitud mínima
    if (imageUrl.length < 10) {
      this.log(`⚠️ URL demasiado corta: ${imageUrl}`);
      return undefined;
    }
    
    this.log(`✅ URL válida: ${imageUrl.substring(0, 60)}...`);
    return imageUrl;
  }
}
