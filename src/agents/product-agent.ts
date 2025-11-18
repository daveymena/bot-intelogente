/**
 * Agente de Producto
 * Muestra información detallada de UN producto
 * Puede funcionar CON o SIN IA externa
 */

import { BaseAgent, AgentResponse } from './base-agent';
import { SharedMemory } from './shared-memory';

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
    
    const product = memory.currentProduct;
    
    if (!product) {
      return {
        text: `¿Qué producto te interesa? 🤔

Puedo ayudarte a buscar lo que necesitas.`,
        nextAgent: 'search',
        confidence: 0.8,
      };
    }
    
    // Marcar que se envió info del producto
    memory.productInfoSent = true;
    
    // Agregar a productos vistos
    if (!memory.viewedProducts.includes(product.id)) {
      memory.viewedProducts.push(product.id);
    }
    
    // Generar descripción formateada
    const description = this.formatProductInfo(product);
    
    // 📸 SIEMPRE enviar foto cuando se muestra un producto por primera vez
    // El flag photoSent se resetea cuando cambia el producto
    const shouldSendPhoto = product.images && product.images.length > 0;
    
    // Marcar que se envió foto de este producto
    if (shouldSendPhoto) {
      memory.photoSent = true;
    }
    
    return {
      text: description,
      sendPhotos: shouldSendPhoto,
      photos: shouldSendPhoto ? product.images : undefined,
      nextAgent: 'payment',
      confidence: 0.9,
      actions: shouldSendPhoto ? [
        { type: 'send_photo', data: { product } }
      ] : undefined,
    };
  }
  
  /**
   * Formatea la información del producto usando metodología AIDA
   * (Atención, Interés, Deseo, Acción)
   */
  private formatProductInfo(product: any): string {
    const price = this.formatPrice(product.price);
    const category = (product.category || '').toLowerCase();
    const isCourse = category.includes('curso') || category.includes('digital') || product.name.toLowerCase().includes('curso') || product.name.toLowerCase().includes('mega pack');
    
    let text = '';
    
    // 🎯 ATENCIÓN: Gancho inicial emocionante
    text += `¡Perfecto! 😊 Te cuento sobre el *${product.name}*\n\n`;
    
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
    
    // Disponibilidad
    if (product.stock !== undefined) {
      if (product.stock > 0) {
        text += `✅ *Disponible ahora* (${product.stock} unidades)\n\n`;
      } else {
        text += `⚠️ *Agotado temporalmente* - ¡Avísame si te interesa para notificarte!\n\n`;
      }
    } else {
      text += `✅ *Disponible para entrega inmediata*\n\n`;
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

Puedo ayudarte a buscar lo que necesitas.`,
      nextAgent: 'search',
      confidence: 0.7,
      requiresAI: true,
    };
  }
}
