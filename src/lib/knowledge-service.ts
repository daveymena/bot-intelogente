/**
 * Knowledge Service - Sistema de Conocimiento Basado en Datos Reales
 * 
 * Proporciona respuestas directas a preguntas comunes de clientes
 * basándose ÚNICAMENTE en información real de la base de datos.
 * 
 * REGLA DE ORO: NUNCA inventar información. Si no se sabe, decirlo claramente.
 */

import { db } from './db'

export interface QuestionAnswer {
  question: string
  answer: string
  confidence: 'high' | 'medium' | 'low'
  requiresHumanAssistance: boolean
  relatedProducts?: any[]
}

export class KnowledgeService {
  
  /**
   * Responde preguntas comunes sobre productos
   */
  static async answerProductQuestion(
    question: string,
    productId?: string,
    productName?: string
  ): Promise<QuestionAnswer> {
    const lowerQuestion = question.toLowerCase()

    // 0. PRIMERO: Detectar preguntas FUERA DE ALCANCE (no relacionadas con productos)
    if (this.isOutOfScopeQuestion(lowerQuestion)) {
      return this.handleOutOfScopeQuestion(lowerQuestion)
    }

    // 1. Preguntas sobre PRECIO
    if (this.isPriceQuestion(lowerQuestion)) {
      return await this.answerPriceQuestion(productId, productName)
    }

    // 2. Preguntas sobre DISPONIBILIDAD/STOCK
    if (this.isAvailabilityQuestion(lowerQuestion)) {
      return await this.answerAvailabilityQuestion(productId, productName)
    }

    // 3. Preguntas sobre ENVÍO
    if (this.isShippingQuestion(lowerQuestion)) {
      return this.answerShippingQuestion()
    }

    // 4. Preguntas sobre MÉTODOS DE PAGO
    if (this.isPaymentMethodQuestion(lowerQuestion)) {
      return this.answerPaymentMethodQuestion()
    }

    // 5. Preguntas sobre GARANTÍA
    if (this.isWarrantyQuestion(lowerQuestion)) {
      return this.answerWarrantyQuestion()
    }

    // 6. Preguntas sobre CARACTERÍSTICAS del producto
    if (this.isFeatureQuestion(lowerQuestion)) {
      return await this.answerFeatureQuestion(productId, productName)
    }

    // 7. Preguntas sobre COMPARACIÓN
    if (this.isComparisonQuestion(lowerQuestion)) {
      return await this.answerComparisonQuestion(question)
    }

    // 8. Si no se puede responder, admitirlo
    return {
      question,
      answer: 'No tengo información específica sobre eso. ¿Puedo ayudarte con algo más sobre nuestros productos?',
      confidence: 'low',
      requiresHumanAssistance: true
    }
  }

  // ============================================
  // DETECTORES DE TIPO DE PREGUNTA
  // ============================================

  /**
   * Detecta preguntas FUERA DE ALCANCE (no relacionadas con productos/ventas)
   */
  private static isOutOfScopeQuestion(q: string): boolean {
    const outOfScopePatterns = [
      // Reuniones/citas presenciales
      /ver(nos|te|me)|reunir|reunión|cita|encuentro|persona|presencial|oficina|local|tienda física/,
      
      // Solicitudes personales inapropiadas
      /salir|novio|novia|pareja|amor|cariño|beso|abrazo/,
      
      // Temas no relacionados con ventas
      /clima|tiempo|hora|fecha|noticias|política|religión|fútbol|deportes/,
      
      // Solicitudes de servicios no ofrecidos
      /préstamo|crédito personal|trabajo|empleo|contratar|curriculum/
    ]
    
    return outOfScopePatterns.some(pattern => pattern.test(q))
  }

  /**
   * Maneja preguntas fuera de alcance
   */
  private static handleOutOfScopeQuestion(q: string): QuestionAnswer {
    // Detectar tipo específico
    if (/ver(nos|te|me)|reunir|reunión|cita|encuentro|persona|presencial/.test(q)) {
      return {
        question: 'reunión presencial',
        answer: 'Por el momento solo atendemos por WhatsApp y hacemos envíos a toda Colombia. ¿Te puedo ayudar con algún producto?',
        confidence: 'high',
        requiresHumanAssistance: false
      }
    }

    if (/salir|novio|novia|pareja|amor/.test(q)) {
      return {
        question: 'solicitud personal',
        answer: 'Soy un asistente de ventas. ¿Te puedo ayudar con algún producto?',
        confidence: 'high',
        requiresHumanAssistance: false
      }
    }

    // Respuesta genérica para otros casos
    return {
      question: 'fuera de alcance',
      answer: 'No puedo ayudarte con eso, pero sí con nuestros productos. ¿Qué buscas?',
      confidence: 'high',
      requiresHumanAssistance: false
    }
  }

  private static isPriceQuestion(q: string): boolean {
    return /precio|costo|vale|valor|cuanto|cuánto/.test(q)
  }

  private static isAvailabilityQuestion(q: string): boolean {
    return /disponible|stock|hay|tienen|existe|queda/.test(q)
  }

  private static isShippingQuestion(q: string): boolean {
    return /envío|envio|entrega|llega|demora|tiempo|cuanto tarda/.test(q)
  }

  private static isPaymentMethodQuestion(q: string): boolean {
    return /pago|pagar|metodo|método|forma|transferencia|efectivo|tarjeta/.test(q)
  }

  private static isWarrantyQuestion(q: string): boolean {
    return /garantía|garantia|devol|cambio|reembolso/.test(q)
  }

  private static isFeatureQuestion(q: string): boolean {
    return /característica|especificación|incluye|trae|viene con|funciona|como es/.test(q)
  }

  private static isComparisonQuestion(q: string): boolean {
    return /diferencia|mejor|comparar|cual|cuál|vs|versus/.test(q)
  }

  // ============================================
  // RESPONDEDORES ESPECÍFICOS
  // ============================================

  /**
   * Responde preguntas sobre precio
   */
  private static async answerPriceQuestion(
    productId?: string,
    productName?: string
  ): Promise<QuestionAnswer> {
    
    if (!productId && !productName) {
      return {
        question: 'precio',
        answer: '¿De qué producto quieres saber el precio?',
        confidence: 'low',
        requiresHumanAssistance: false
      }
    }

    try {
      const product = await db.product.findFirst({
        where: productId 
          ? { id: productId }
          : { name: { contains: productName, mode: 'insensitive' } },
        select: { name: true, price: true, currency: true }
      })

      if (!product) {
        return {
          question: 'precio',
          answer: 'No encontré ese producto. ¿Puedes darme más detalles?',
          confidence: 'low',
          requiresHumanAssistance: false
        }
      }

      const formattedPrice = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: product.currency || 'COP'
      }).format(product.price)

      return {
        question: 'precio',
        answer: `${product.name}: ${formattedPrice}`,
        confidence: 'high',
        requiresHumanAssistance: false
      }
    } catch (error) {
      return {
        question: 'precio',
        answer: 'No pude consultar el precio en este momento.',
        confidence: 'low',
        requiresHumanAssistance: true
      }
    }
  }

  /**
   * Responde preguntas sobre disponibilidad
   */
  private static async answerAvailabilityQuestion(
    productId?: string,
    productName?: string
  ): Promise<QuestionAnswer> {
    
    if (!productId && !productName) {
      return {
        question: 'disponibilidad',
        answer: '¿Qué producto buscas?',
        confidence: 'low',
        requiresHumanAssistance: false
      }
    }

    try {
      const product = await db.product.findFirst({
        where: productId 
          ? { id: productId }
          : { name: { contains: productName, mode: 'insensitive' } },
        select: { name: true, stock: true, status: true }
      })

      if (!product) {
        return {
          question: 'disponibilidad',
          answer: 'No encontré ese producto.',
          confidence: 'low',
          requiresHumanAssistance: false
        }
      }

      if (product.status !== 'AVAILABLE') {
        return {
          question: 'disponibilidad',
          answer: `${product.name} no está disponible actualmente.`,
          confidence: 'high',
          requiresHumanAssistance: false
        }
      }

      return {
        question: 'disponibilidad',
        answer: `${product.name} está disponible. Stock: ${product.stock > 10 ? 'Disponible' : `${product.stock} unidades`}`,
        confidence: 'high',
        requiresHumanAssistance: false
      }
    } catch (error) {
      return {
        question: 'disponibilidad',
        answer: 'No pude consultar la disponibilidad.',
        confidence: 'low',
        requiresHumanAssistance: true
      }
    }
  }

  /**
   * Responde preguntas sobre envío
   */
  private static answerShippingQuestion(): QuestionAnswer {
    return {
      question: 'envío',
      answer: 'Hacemos envíos a toda Colombia. El tiempo de entrega es de 2-5 días hábiles según la ciudad.',
      confidence: 'high',
      requiresHumanAssistance: false
    }
  }

  /**
   * Responde preguntas sobre métodos de pago
   */
  private static answerPaymentMethodQuestion(): QuestionAnswer {
    return {
      question: 'métodos de pago',
      answer: 'Aceptamos:\n• MercadoPago\n• PayPal\n• Nequi/Daviplata\n• Contraentrega (pago al recibir)',
      confidence: 'high',
      requiresHumanAssistance: false
    }
  }

  /**
   * Responde preguntas sobre garantía
   */
  private static answerWarrantyQuestion(): QuestionAnswer {
    return {
      question: 'garantía',
      answer: 'Todos nuestros productos tienen garantía de 7 días. Si no estás satisfecho, te devolvemos tu dinero.',
      confidence: 'high',
      requiresHumanAssistance: false
    }
  }

  /**
   * Responde preguntas sobre características
   */
  private static async answerFeatureQuestion(
    productId?: string,
    productName?: string
  ): Promise<QuestionAnswer> {
    
    if (!productId && !productName) {
      return {
        question: 'características',
        answer: '¿De qué producto quieres saber las características?',
        confidence: 'low',
        requiresHumanAssistance: false
      }
    }

    try {
      const product = await db.product.findFirst({
        where: productId 
          ? { id: productId }
          : { name: { contains: productName, mode: 'insensitive' } },
        select: { name: true, description: true }
      })

      if (!product) {
        return {
          question: 'características',
          answer: 'No encontré ese producto.',
          confidence: 'low',
          requiresHumanAssistance: false
        }
      }

      if (!product.description || product.description.length < 10) {
        return {
          question: 'características',
          answer: `${product.name} - Para más detalles específicos, contáctanos por WhatsApp.`,
          confidence: 'medium',
          requiresHumanAssistance: true
        }
      }

      // Limitar descripción a 300 caracteres
      const shortDesc = product.description.substring(0, 300)
      
      return {
        question: 'características',
        answer: `${product.name}:\n${shortDesc}${product.description.length > 300 ? '...' : ''}`,
        confidence: 'high',
        requiresHumanAssistance: false
      }
    } catch (error) {
      return {
        question: 'características',
        answer: 'No pude consultar las características.',
        confidence: 'low',
        requiresHumanAssistance: true
      }
    }
  }

  /**
   * Responde preguntas de comparación
   */
  private static async answerComparisonQuestion(question: string): Promise<QuestionAnswer> {
    // Por ahora, las comparaciones requieren asistencia humana
    // En el futuro se puede implementar lógica más avanzada
    return {
      question: 'comparación',
      answer: 'Para comparar productos específicos, dime cuáles te interesan y te ayudo.',
      confidence: 'medium',
      requiresHumanAssistance: false
    }
  }

  /**
   * Busca productos por categoría
   */
  static async getProductsByCategory(category: string): Promise<any[]> {
    try {
      const products = await db.product.findMany({
        where: {
          OR: [
            { mainCategory: { contains: category, mode: 'insensitive' } },
            { category: { contains: category, mode: 'insensitive' } }
          ],
          status: 'AVAILABLE'
        },
        select: {
          id: true,
          name: true,
          price: true,
          mainCategory: true
        },
        take: 5
      })

      return products
    } catch (error) {
      return []
    }
  }

  /**
   * Busca productos por rango de precio
   */
  static async getProductsByPriceRange(min: number, max: number): Promise<any[]> {
    try {
      const products = await db.product.findMany({
        where: {
          price: {
            gte: min,
            lte: max
          },
          status: 'AVAILABLE'
        },
        select: {
          id: true,
          name: true,
          price: true,
          mainCategory: true
        },
        take: 5,
        orderBy: { price: 'asc' }
      })

      return products
    } catch (error) {
      return []
    }
  }
}
