/**
 * Dynamic Payment Links Service
 * Genera links de pago dinámicos basados en productos y métodos de pago
 */

import { db } from './db'
import crypto from 'crypto'

interface PaymentLinkConfig {
  products: string[] // IDs de productos
  total: number
  userId: string
  paymentMethod?: string
  currency?: string
  expiresIn?: number // minutos
}

interface DynamicPaymentLink {
  url: string
  token: string
  expiresAt: Date
  products: string[]
  total: number
  paymentMethod?: string
}

export class DynamicPaymentLinks {
  private static baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'
  private static tokenSecret = process.env.JWT_SECRET || 'default-secret'

  /**
   * Generar link de pago dinámico
   */
  static async generatePaymentLink(config: PaymentLinkConfig): Promise<DynamicPaymentLink> {
    try {
      console.log('[PaymentLinks] 💳 Generando link de pago dinámico...')

      // Generar token único
      const token = this.generateToken(config)

      // Calcular expiración
      const expiresIn = config.expiresIn || 60 // 60 minutos por defecto
      const expiresAt = new Date(Date.now() + expiresIn * 60 * 1000)

      // Construir URL
      const url = `${this.baseUrl}/payment?token=${token}`

      // Guardar en BD
      await this.savePaymentLink({
        token,
        products: config.products,
        total: config.total,
        userId: config.userId,
        paymentMethod: config.paymentMethod,
        expiresAt
      })

      console.log(`[PaymentLinks] ✅ Link generado: ${url}`)

      return {
        url,
        token,
        expiresAt,
        products: config.products,
        total: config.total,
        paymentMethod: config.paymentMethod
      }
    } catch (error) {
      console.error('[PaymentLinks] ❌ Error generando link:', error)
      throw error
    }
  }

  /**
   * Generar token
   */
  private static generateToken(config: PaymentLinkConfig): string {
    const data = {
      products: config.products.join(','),
      total: config.total,
      userId: config.userId,
      timestamp: Date.now()
    }

    const hash = crypto
      .createHmac('sha256', this.tokenSecret)
      .update(JSON.stringify(data))
      .digest('hex')

    return `${Buffer.from(JSON.stringify(data)).toString('base64')}.${hash}`
  }

  /**
   * Validar token
   */
  static validateToken(token: string): PaymentLinkConfig | null {
    try {
      const [data, hash] = token.split('.')

      if (!data || !hash) return null

      const decodedData = JSON.parse(Buffer.from(data, 'base64').toString())

      // Verificar hash
      const expectedHash = crypto
        .createHmac('sha256', this.tokenSecret)
        .update(data)
        .digest('hex')

      if (hash !== expectedHash) {
        console.log('[PaymentLinks] ⚠️ Token inválido (hash no coincide)')
        return null
      }

      return {
        products: decodedData.products.split(','),
        total: decodedData.total,
        userId: decodedData.userId
      }
    } catch (error) {
      console.error('[PaymentLinks] ❌ Error validando token:', error)
      return null
    }
  }

  /**
   * Guardar link de pago
   */
  private static async savePaymentLink(data: {
    token: string
    products: string[]
    total: number
    userId: string
    paymentMethod?: string
    expiresAt: Date
  }): Promise<void> {
    try {
      await db.paymentLink.create({
        data: {
          token: data.token,
          products: data.products.join(','),
          total: data.total,
          userId: data.userId,
          paymentMethod: data.paymentMethod,
          expiresAt: data.expiresAt,
          status: 'PENDING'
        }
      })

      console.log('[PaymentLinks] 💾 Link guardado en BD')
    } catch (error) {
      console.error('[PaymentLinks] ⚠️ Error guardando link:', error)
    }
  }

  /**
   * Generar link para WhatsApp
   */
  static async generateWhatsAppPaymentLink(
    products: any[],
    userId: string,
    paymentMethod?: string
  ): Promise<string> {
    try {
      // Calcular total
      const total = products.reduce((sum, p) => sum + (p.price || 0), 0)

      // Generar link
      const link = await this.generatePaymentLink({
        products: products.map(p => p.id),
        total,
        userId,
        paymentMethod,
        expiresIn: 120 // 2 horas
      })

      // Crear mensaje para WhatsApp
      const message = `💳 *Link de Pago*\n\n`
        + `Total: $${total.toLocaleString('es-CO')}\n`
        + `Productos: ${products.length}\n\n`
        + `🔗 ${link.url}\n\n`
        + `Válido por 2 horas ⏰`

      console.log('[PaymentLinks] 📱 Link para WhatsApp generado')

      return link.url
    } catch (error) {
      console.error('[PaymentLinks] ❌ Error generando link para WhatsApp:', error)
      throw error
    }
  }

  /**
   * Generar links para múltiples métodos de pago
   */
  static async generateMultiPaymentLinks(
    products: any[],
    userId: string
  ): Promise<{ [key: string]: string }> {
    try {
      const total = products.reduce((sum, p) => sum + (p.price || 0), 0)
      const links: { [key: string]: string } = {}

      // Obtener métodos de pago disponibles
      const paymentMethods = await db.paymentMethod.findMany({
        where: { enabled: true }
      })

      // Generar link para cada método
      for (const method of paymentMethods) {
        try {
          const link = await this.generatePaymentLink({
            products: products.map(p => p.id),
            total,
            userId,
            paymentMethod: method.name,
            expiresIn: 120
          })

          links[method.name] = link.url
        } catch (error) {
          console.error(`[PaymentLinks] ⚠️ Error generando link para ${method.name}:`, error)
        }
      }

      console.log(`[PaymentLinks] ✅ ${Object.keys(links).length} links generados`)

      return links
    } catch (error) {
      console.error('[PaymentLinks] ❌ Error generando links múltiples:', error)
      throw error
    }
  }

  /**
   * Obtener link de pago por token
   */
  static async getPaymentLink(token: string): Promise<any> {
    try {
      const link = await db.paymentLink.findUnique({
        where: { token }
      })

      if (!link) {
        console.log('[PaymentLinks] ⚠️ Link no encontrado')
        return null
      }

      // Verificar expiración
      if (link.expiresAt < new Date()) {
        console.log('[PaymentLinks] ⚠️ Link expirado')
        return null
      }

      return link
    } catch (error) {
      console.error('[PaymentLinks] ❌ Error obteniendo link:', error)
      return null
    }
  }

  /**
   * Marcar link como completado
   */
  static async completePaymentLink(token: string): Promise<void> {
    try {
      await db.paymentLink.update({
        where: { token },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      })

      console.log('[PaymentLinks] ✅ Link marcado como completado')
    } catch (error) {
      console.error('[PaymentLinks] ❌ Error completando link:', error)
    }
  }

  /**
   * Cancelar link de pago
   */
  static async cancelPaymentLink(token: string, reason?: string): Promise<void> {
    try {
      await db.paymentLink.update({
        where: { token },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelReason: reason
        }
      })

      console.log('[PaymentLinks] ❌ Link cancelado')
    } catch (error) {
      console.error('[PaymentLinks] ❌ Error cancelando link:', error)
    }
  }

  /**
   * Limpiar links expirados
   */
  static async cleanupExpiredLinks(): Promise<number> {
    try {
      const result = await db.paymentLink.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          },
          status: 'PENDING'
        }
      })

      console.log(`[PaymentLinks] 🗑️ ${result.count} links expirados eliminados`)

      return result.count
    } catch (error) {
      console.error('[PaymentLinks] ❌ Error limpiando links:', error)
      return 0
    }
  }

  /**
   * Obtener estadísticas de links
   */
  static async getStats(): Promise<{
    total: number
    pending: number
    completed: number
    cancelled: number
    expired: number
  }> {
    try {
      const total = await db.paymentLink.count()
      const pending = await db.paymentLink.count({
        where: { status: 'PENDING' }
      })
      const completed = await db.paymentLink.count({
        where: { status: 'COMPLETED' }
      })
      const cancelled = await db.paymentLink.count({
        where: { status: 'CANCELLED' }
      })
      const expired = await db.paymentLink.count({
        where: {
          expiresAt: { lt: new Date() },
          status: 'PENDING'
        }
      })

      return { total, pending, completed, cancelled, expired }
    } catch (error) {
      console.error('[PaymentLinks] ❌ Error obteniendo estadísticas:', error)
      return { total: 0, pending: 0, completed: 0, cancelled: 0, expired: 0 }
    }
  }

  /**
   * Generar link de pago con descuento
   */
  static async generateDiscountedPaymentLink(
    products: any[],
    userId: string,
    discountPercent: number
  ): Promise<string> {
    try {
      let total = products.reduce((sum, p) => sum + (p.price || 0), 0)
      const discount = (total * discountPercent) / 100
      total = total - discount

      const link = await this.generatePaymentLink({
        products: products.map(p => p.id),
        total,
        userId,
        expiresIn: 120
      })

      const message = `💳 *Link de Pago con Descuento*\n\n`
        + `Subtotal: $${(total + discount).toLocaleString('es-CO')}\n`
        + `Descuento: -$${discount.toLocaleString('es-CO')} (${discountPercent}%)\n`
        + `*Total: $${total.toLocaleString('es-CO')}*\n\n`
        + `🔗 ${link.url}\n\n`
        + `Válido por 2 horas ⏰`

      console.log('[PaymentLinks] 🎉 Link con descuento generado')

      return link.url
    } catch (error) {
      console.error('[PaymentLinks] ❌ Error generando link con descuento:', error)
      throw error
    }
  }
}

export default DynamicPaymentLinks
