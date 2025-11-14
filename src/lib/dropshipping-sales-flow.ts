/**
 * 🛍️ SISTEMA DE FLUJO DE VENTAS DROPSHIPPING
 * 
 * Maneja conversaciones de venta consultiva para productos dropshipping
 * que vienen desde Facebook, Instagram u otras redes sociales.
 * 
 * Flujo:
 * 1. Cliente menciona producto de Facebook
 * 2. Confirmar disponibilidad y ofrecer detalles
 * 3. Mostrar precio y opciones de entrega
 * 4. Capturar datos de envío
 * 5. Confirmar pedido
 */

import { db } from './db'

interface SalesFlowState {
  step: 'initial' | 'details' | 'price' | 'delivery_choice' | 'capture_data' | 'confirm'
  productId?: string
  productName?: string
  deliveryMethod?: 'shipping' | 'pickup'
  customerData?: {
    name?: string
    phone?: string
    address?: string
    city?: string
    color?: string
  }
}

export class DropshippingSalesFlow {
  private static flowStates = new Map<string, SalesFlowState>()

  /**
   * Detectar si el mensaje es una consulta desde Facebook/redes sociales
   */
  static detectSocialMediaInquiry(message: string): boolean {
    const normalized = message.toLowerCase()
    
    const patterns = [
      /vi.*en\s+facebook/i,
      /vi.*en\s+instagram/i,
      /vi.*en\s+fb/i,
      /vi.*en\s+ig/i,
      /vi.*publicaci[oó]n/i,
      /vi.*anuncio/i,
      /vi.*post/i,
      /me\s+interesa.*que\s+publicaron/i,
      /bolso.*antirobo/i,
      /producto.*facebook/i
    ]
    
    return patterns.some(pattern => pattern.test(normalized))
  }

  /**
   * Iniciar flujo de ventas
   */
  static async startSalesFlow(
    from: string,
    message: string,
    userId: string
  ): Promise<{ response: string; inFlow: boolean }> {
    
    // Detectar producto mencionado
    const productName = this.extractProductName(message)
    
    if (!productName) {
      return {
        response: '',
        inFlow: false
      }
    }

    // Buscar producto en BD
    const product = await db.product.findFirst({
      where: {
        userId,
        status: 'AVAILABLE',
        OR: [
          { name: { contains: productName, mode: 'insensitive' } },
          { description: { contains: productName, mode: 'insensitive' } }
        ]
      }
    })

    if (!product) {
      return {
        response: '',
        inFlow: false
      }
    }

    // Inicializar estado del flujo
    this.flowStates.set(from, {
      step: 'initial',
      productId: product.id,
      productName: product.name
    })

    // Respuesta inicial
    const response = `¡Hola 👋! Sí, claro que sí 😎. Soy Laura de MegaComputer.

El *${product.name}* está disponible, ¿verdad?

¿Deseas que te cuente los detalles o prefieres saber directamente el precio y forma de entrega?`

    return {
      response,
      inFlow: true
    }
  }

  /**
   * Continuar flujo de ventas
   */
  static async continueSalesFlow(
    from: string,
    message: string,
    userId: string
  ): Promise<{ response: string; completed: boolean }> {
    
    const state = this.flowStates.get(from)
    
    if (!state || !state.productId) {
      return { response: '', completed: false }
    }

    const product = await db.product.findUnique({
      where: { id: state.productId }
    })

    if (!product) {
      return { response: '', completed: false }
    }

    const normalized = message.toLowerCase()

    // PASO 1: Cliente pide detalles
    if (state.step === 'initial' && this.wantsDetails(normalized)) {
      state.step = 'details'
      this.flowStates.set(from, state)

      const response = `Perfecto 👌 ${product.description || 'Este producto está diseñado para que te muevas cómodo y seguro.'}

¿Te gustaría que te muestre las fotos reales o el color disponible ahora mismo?`

      return { response, completed: false }
    }

    // PASO 2: Cliente pregunta por precio
    if ((state.step === 'initial' || state.step === 'details') && this.asksPrice(normalized)) {
      state.step = 'price'
      this.flowStates.set(from, state)

      const price = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: product.currency || 'COP',
        minimumFractionDigits: 0
      }).format(product.price)

      const response = `El ${product.name} está en *${price}*, y lo mejor 👉 lo puedes pagar al recibirlo (contraentrega) en cualquier ciudad principal de Colombia.

Demora entre 4 a 5 días hábiles dependiendo de tu ubicación 🛵📦

¿Te gustaría que lo enviemos a tu domicilio o prefieres pasar por la tienda y verlo personalmente?`

      return { response, completed: false }
    }

    // PASO 3: Cliente elige método de entrega
    if (state.step === 'price') {
      if (this.wantsShipping(normalized)) {
        state.step = 'capture_data'
        state.deliveryMethod = 'shipping'
        this.flowStates.set(from, state)

        const response = `Perfecto 🙌 Solo necesito estos datos para hacer el registro del envío:

📍 *Nombre completo:*
📞 *Número de contacto:*
🏠 *Dirección exacta (con barrio):*
🏙️ *Ciudad o municipio:*

Con esos datos, te confirmo el pedido y te envío tu guía de entrega.

¿Te gustaría que te llegue en color negro clásico o en gris oscuro?`

        return { response, completed: false }
      }

      if (this.wantsPickup(normalized)) {
        state.step = 'confirm'
        state.deliveryMethod = 'pickup'
        this.flowStates.set(from, state)

        const response = `¡Excelente decisión! 💪 Estamos en nuestra tienda MegaComputer, en [dirección local o ciudad del punto de venta].

Atendemos de lunes a sábado de 9 a.m. a 7 p.m.

Puedo agendarte para que el producto esté apartado y te lo pruebes tranquilo.

¿A qué hora te gustaría pasar hoy o mañana?`

        return { response, completed: false }
      }
    }

    // PASO 4: Capturar datos del cliente
    if (state.step === 'capture_data') {
      const data = this.extractCustomerData(message, state.customerData || {})
      state.customerData = data
      this.flowStates.set(from, state)

      // Verificar si tenemos todos los datos
      if (data && data.name && data.phone && data.address && data.city) {
        state.step = 'confirm'
        this.flowStates.set(from, state)

        const color = data.color || 'negro'
        const price = new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: product.currency || 'COP',
          minimumFractionDigits: 0
        }).format(product.price)

        // Crear orden en la base de datos
        await this.createOrder(userId, from, product, data)

        const response = `Listo 🖤. Entonces te confirmo el pedido del *${product.name}* (color ${color}) con pago contraentrega.

📦 *Resumen del pedido:*
👤 ${data.name}
📞 ${data.phone}
📍 ${data.address}, ${data.city}
💰 ${price}

Te llegará entre 4 y 5 días hábiles, y te enviaremos la guía de envío por WhatsApp una vez salga del almacén 🚚

¿Deseas que te deje el seguimiento por aquí cuando sea despachado?`

        return { response, completed: true }
      }

      // Pedir datos faltantes
      const missing: string[] = []
      if (!data || !data.name) missing.push('nombre completo')
      if (!data || !data.phone) missing.push('número de contacto')
      if (!data || !data.address) missing.push('dirección')
      if (!data || !data.city) missing.push('ciudad')

      const response = `Perfecto, me falta${missing.length > 1 ? 'n' : ''}: *${missing.join(', ')}*

Por favor compárteme ${missing.length > 1 ? 'esos datos' : 'ese dato'} para confirmar tu pedido 😊`

      return { response, completed: false }
    }

    // PASO 5: Confirmación final
    if (state.step === 'confirm') {
      this.flowStates.delete(from) // Limpiar estado

      const response = `Gracias por preferir MegaComputer Colombia 💙

Cualquier duda sobre tu pedido o productos similares (como morrales o accesorios tecnológicos), estoy aquí para ayudarte.

¿Deseas que te muestre también la versión más grande del producto o prefieres cerrar con este modelo?`

      return { response, completed: true }
    }

    return { response: '', completed: false }
  }

  /**
   * Verificar si el cliente está en un flujo activo
   */
  static isInFlow(from: string): boolean {
    return this.flowStates.has(from)
  }

  /**
   * Obtener estado actual del flujo
   */
  static getFlowState(from: string): SalesFlowState | undefined {
    return this.flowStates.get(from)
  }

  /**
   * Limpiar flujo
   */
  static clearFlow(from: string): void {
    this.flowStates.delete(from)
  }

  // ============ MÉTODOS AUXILIARES ============

  private static extractProductName(message: string): string | null {
    const normalized = message.toLowerCase()
    
    // Patrones comunes
    const patterns = [
      /bolso\s+antirobo/i,
      /bolso\s+manos\s+libres/i,
      /morral/i,
      /mochila/i
    ]
    
    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match) return match[0]
    }
    
    return null
  }

  private static wantsDetails(message: string): boolean {
    return /detalles|cu[eé]ntame|informaci[oó]n|m[aá]s|caracter[ií]sticas/i.test(message)
  }

  private static asksPrice(message: string): boolean {
    return /precio|cu[aá]nto|costo|valor|pagar/i.test(message)
  }

  private static wantsShipping(message: string): boolean {
    return /env[ií]o|domicilio|casa|direcci[oó]n|entregar/i.test(message)
  }

  private static wantsPickup(message: string): boolean {
    return /tienda|pasar|recoger|ver|persona|f[ií]sica/i.test(message)
  }

  private static extractCustomerData(
    message: string,
    currentData: Partial<SalesFlowState['customerData']>
  ): SalesFlowState['customerData'] {
    const data = { ...currentData }

    // Extraer nombre (si tiene más de 2 palabras y no tiene números)
    if (!data.name) {
      const nameMatch = message.match(/^([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+)/i)
      if (nameMatch) {
        data.name = nameMatch[1].trim()
      }
    }

    // Extraer teléfono
    if (!data.phone) {
      const phoneMatch = message.match(/\b(\d{10}|\d{3}[-\s]?\d{3}[-\s]?\d{4})\b/)
      if (phoneMatch) {
        data.phone = phoneMatch[1].replace(/[-\s]/g, '')
      }
    }

    // Extraer dirección (línea que contiene calle, carrera, etc.)
    if (!data.address) {
      const addressMatch = message.match(/(calle|carrera|cr|cra|diagonal|transversal|avenida|av)[\s\d#\-a-z]+/i)
      if (addressMatch) {
        data.address = addressMatch[0].trim()
      }
    }

    // Extraer ciudad
    if (!data.city) {
      const cities = ['bogotá', 'medellín', 'cali', 'barranquilla', 'cartagena', 'cúcuta', 'bucaramanga', 'pereira', 'manizales', 'ibagué']
      for (const city of cities) {
        if (message.toLowerCase().includes(city)) {
          data.city = city.charAt(0).toUpperCase() + city.slice(1)
          break
        }
      }
    }

    // Extraer color
    if (!data.color) {
      const colorMatch = message.match(/\b(negro|gris|azul|rojo|blanco|verde)\b/i)
      if (colorMatch) {
        data.color = colorMatch[1].toLowerCase()
      }
    }

    return data
  }

  private static async createOrder(
    userId: string,
    customerPhone: string,
    product: any,
    customerData: SalesFlowState['customerData']
  ): Promise<void> {
    try {
      // Guardar orden en conversación para seguimiento
      const orderData = {
        userId,
        customerName: customerData?.name || 'Cliente',
        customerPhone,
        productId: product.id,
        productName: product.name,
        total: product.price,
        status: 'PENDING',
        paymentMethod: 'CONTRAENTREGA',
        shippingAddress: `${customerData?.address}, ${customerData?.city}`,
        color: customerData?.color || 'negro',
        createdAt: new Date().toISOString()
      }

      console.log(`[DropshippingSalesFlow] ✅ Orden registrada:`, orderData)
      
      // TODO: Aquí puedes integrar con tu sistema de órdenes o CRM
      // Por ahora solo lo registramos en el log
      
    } catch (error) {
      console.error('[DropshippingSalesFlow] ❌ Error registrando orden:', error)
    }
  }
}
