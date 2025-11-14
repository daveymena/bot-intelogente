/**
 * 💬 SISTEMA DE CONVERSACIÓN DE VENTAS NATURAL
 * 
 * Estilo de vendedor profesional de WhatsApp:
 * - Conversación natural y amigable
 * - Emojis relevantes
 * - Formato claro con viñetas
 * - Flujo comercial completo
 */

import { db } from './db'

export interface ConversationStage {
  stage: 'greeting' | 'presentation' | 'interest' | 'details' | 'objection' | 'closing' | 'completed'
  productId?: string
  productName?: string
  selectedColor?: string
  selectedVariant?: string
  customerData?: {
    name?: string
    address?: string
    phone?: string
    city?: string
  }
}

export class ConversationalSalesFlow {
  private static conversations = new Map<string, ConversationStage>()

  /**
   * Generar saludo inicial profesional
   */
  static generateGreeting(agentName: string = 'Laura'): string {
    const greetings = [
      `👋 ¡Hola! 😊 Bienvenido a Tecnovariedades D&S

Soy ${agentName}, tu asesora de ventas. ¿En qué puedo ayudarte hoy? 🎯`,

      `¡Hola! 👋 Qué bueno verte por aquí 😊

Soy ${agentName} de Tecnovariedades D&S. ¿Buscas algo en especial o quieres que te muestre nuestros productos destacados? ✨`,

      `👋 ¡Hola! Bienvenido 😄

Soy ${agentName}, tu asesora personal. Estoy aquí para ayudarte a encontrar exactamente lo que necesitas. ¿Qué te interesa? 🛍️`
    ]

    return greetings[Math.floor(Math.random() * greetings.length)]
  }

  /**
   * Presentar producto de forma atractiva
   */
  static generateProductPresentation(product: any): string {
    const price = product.price.toLocaleString('es-CO')
    const originalPrice = product.originalPrice 
      ? product.originalPrice.toLocaleString('es-CO') 
      : null

    let presentation = `¡Claro! 😍 Te cuento sobre nuestro ${product.name}

✨ Características principales:\n`

    // Extraer características del producto
    const features = this.extractFeatures(product)
    features.forEach(feature => {
      presentation += `• ${feature}\n`
    })

    presentation += `\n💰 Precio especial: $${price}`
    
    if (originalPrice) {
      presentation += ` (antes $${originalPrice})`
    }

    // Agregar beneficios adicionales
    presentation += `\n\n🎁 Incluye:`
    presentation += `\n• 🆓 Envío gratis a todo el país`
    presentation += `\n• 🛡️ Garantía de 6 meses`

    presentation += `\n\n¿Quieres que te envíe fotos del producto? 📸`

    return presentation
  }

  /**
   * Ofrecer envío de fotos
   */
  static generatePhotoOffer(product: any): string {
    return `📸 Aquí tienes algunas imágenes del ${product.name} 👇

[Las fotos se enviarán automáticamente]

Además, por hoy incluye:
• 🆓 Envío gratis a todo el país
• 🛡️ Garantía de 6 meses
• 💳 Pago seguro

¿Qué te parece hasta ahora? 😊`
  }

  /**
   * Mostrar opciones de colores/variantes
   */
  static generateVariantOptions(product: any): string {
    let response = `Excelente pregunta 😄 `

    // Extraer variantes del producto
    const variants = this.extractVariants(product)

    if (variants.colors && variants.colors.length > 0) {
      response += `Tenemos disponibles estos colores:\n\n`
      response += `🎨 ${variants.colors.join(', ')}\n`
      response += `(Todos vienen con las mismas funciones)\n\n`
      response += `¿Cuál color te gustaría?`
    } else if (variants.sizes && variants.sizes.length > 0) {
      response += `Tenemos estas tallas disponibles:\n\n`
      response += `📏 ${variants.sizes.join(', ')}\n\n`
      response += `¿Cuál talla necesitas?`
    } else {
      response += `Este producto viene en su versión estándar, listo para usar 😊\n\n`
      response += `¿Te gustaría comprarlo?`
    }

    return response
  }

  /**
   * Solicitar datos para el pedido
   */
  static generateOrderDataRequest(product: any, variant?: string): string {
    const variantText = variant ? ` ${variant}` : ''
    
    return `¡Perfecto! 😎 Te reservo entonces un ${product.name}${variantText} por solo $${product.price.toLocaleString('es-CO')} con envío gratis.

🛍️ Para completar tu pedido necesito:
• Nombre completo
• Ciudad y dirección de envío
• Teléfono de contacto

¿Podrías enviármelos para continuar? 📝`
  }

  /**
   * Confirmar pedido
   */
  static generateOrderConfirmation(
    product: any,
    customerData: any,
    variant?: string
  ): string {
    const variantText = variant ? ` ${variant}` : ''
    
    return `¡Excelente! 🙌 Ya registré tu pedido ✅

En unos minutos te llegará un mensaje de confirmación con los datos de tu compra.

🎁 Resumen del pedido:
• Producto: ${product.name}${variantText}
• Precio: $${product.price.toLocaleString('es-CO')}
• Envío: Gratis 🚚
• Garantía: 6 meses

Gracias por confiar en Tecnovariedades D&S 💙

Si deseas, puedo agregarte a nuestra lista VIP 🔔 para enterarte de las próximas ofertas. ¿Te gustaría que te inscriba?`
  }

  /**
   * Cierre profesional
   */
  static generateProfessionalClosing(): string {
    return `Perfecto 💫 Ya estás en nuestra lista exclusiva 🎉

¡Gracias por tu compra! 🙏

💬 Si necesitas soporte o tienes dudas, puedes escribirme en cualquier momento.

¡Te deseo un excelente día y disfruta tu nuevo producto! ✨`
  }

  /**
   * Manejar objeción de precio
   */
  static handlePriceObjection(product: any): string {
    const price = product.price.toLocaleString('es-CO')
    
    return `Entiendo tu preocupación 😊 Déjame explicarte por qué vale la pena:

💡 Beneficios que obtienes:
• Calidad premium garantizada
• Ahorro a largo plazo
• Garantía de 6 meses incluida
• Envío gratis (ahorras $15.000)

Además, puedes pagarlo en cuotas con Mercado Pago 💳

Muchos clientes pensaban igual al inicio, pero después de usarlo nos dicen que fue la mejor inversión 😄

¿Te gustaría que te muestre opciones de pago? O si prefieres, tengo productos similares en otros rangos de precio.`
  }

  /**
   * Ofrecer alternativas
   */
  static async offerAlternatives(
    userId: string,
    currentProduct: any,
    maxBudget?: number
  ): Promise<string> {
    // Buscar productos similares más económicos
    const alternatives = await db.product.findMany({
      where: {
        userId,
        status: 'AVAILABLE',
        category: currentProduct.category,
        price: maxBudget ? { lte: maxBudget } : { lt: currentProduct.price }
      },
      take: 2,
      orderBy: { price: 'desc' }
    })

    if (alternatives.length === 0) {
      return `Entiendo 😊 Este es nuestro mejor producto en esta categoría.

¿Cuál sería tu presupuesto ideal? Así puedo buscar otras opciones que se ajusten mejor a lo que buscas.`
    }

    let response = `¡Claro! 😊 Tengo estas excelentes alternativas:\n\n`

    alternatives.forEach((alt, index) => {
      response += `${index + 1}. 💼 ${alt.name}\n`
      response += `   💰 $${alt.price.toLocaleString('es-CO')}\n`
      response += `   ✅ ${alt.description?.substring(0, 60)}...\n\n`
    })

    response += `¿Cuál te llama más la atención? 😊`

    return response
  }

  /**
   * Extraer características del producto
   */
  private static extractFeatures(product: any): string[] {
    const features: string[] = []

    // Características desde descripción
    if (product.description) {
      const desc = product.description
      
      // Buscar características comunes
      if (desc.includes('laptop') || desc.includes('computador')) {
        features.push('💻 Ideal para trabajo y estudio')
      }
      if (desc.includes('RAM') || desc.includes('memoria')) {
        const ram = desc.match(/(\d+GB)/i)
        if (ram) features.push(`🧠 ${ram[0]} de RAM`)
      }
      if (desc.includes('SSD') || desc.includes('almacenamiento')) {
        const storage = desc.match(/(\d+GB|\d+TB)/i)
        if (storage) features.push(`💾 ${storage[0]} de almacenamiento`)
      }
      if (desc.includes('garantía')) {
        features.push('🛡️ Garantía incluida')
      }
    }

    // Características desde tags
    try {
      const tags = product.tags ? JSON.parse(product.tags) : []
      tags.forEach((tag: string) => {
        if (!tag.includes(':') && !tag.includes('http')) {
          features.push(`✨ ${tag}`)
        }
      })
    } catch (e) {
      // Ignorar errores de parsing
    }

    // Si no hay características, agregar genéricas
    if (features.length === 0) {
      features.push('✨ Producto de alta calidad')
      features.push('🎯 Diseño moderno y funcional')
      features.push('💪 Resistente y duradero')
    }

    return features.slice(0, 5) // Máximo 5 características
  }

  /**
   * Extraer variantes del producto
   */
  private static extractVariants(product: any): {
    colors?: string[]
    sizes?: string[]
  } {
    const variants: any = {}

    try {
      const tags = product.tags ? JSON.parse(product.tags) : []
      
      // Buscar colores
      const colorKeywords = ['negro', 'blanco', 'gris', 'azul', 'rojo', 'verde', 'amarillo', 'rosa']
      const colors = tags.filter((tag: string) => 
        colorKeywords.some(color => tag.toLowerCase().includes(color))
      )
      if (colors.length > 0) variants.colors = colors

      // Buscar tallas
      const sizeKeywords = ['S', 'M', 'L', 'XL', 'pequeño', 'mediano', 'grande']
      const sizes = tags.filter((tag: string) =>
        sizeKeywords.some(size => tag.toUpperCase().includes(size))
      )
      if (sizes.length > 0) variants.sizes = sizes

    } catch (e) {
      // Ignorar errores
    }

    return variants
  }

  /**
   * Obtener o crear estado de conversación
   */
  static getConversationStage(customerId: string): ConversationStage {
    if (!this.conversations.has(customerId)) {
      this.conversations.set(customerId, { stage: 'greeting' })
    }
    return this.conversations.get(customerId)!
  }

  /**
   * Actualizar estado de conversación
   */
  static updateConversationStage(
    customerId: string,
    updates: Partial<ConversationStage>
  ): void {
    const current = this.getConversationStage(customerId)
    this.conversations.set(customerId, { ...current, ...updates })
  }

  /**
   * Limpiar conversación
   */
  static clearConversation(customerId: string): void {
    this.conversations.delete(customerId)
  }
}
