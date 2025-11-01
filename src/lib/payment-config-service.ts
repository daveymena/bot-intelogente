/**
 * 💳 SERVICIO DE CONFIGURACIÓN DE PAGOS
 * Usa la configuración de la base de datos en lugar de variables de entorno
 */

import { db } from './db'

export class PaymentConfigService {
  /**
   * Obtener configuración de pagos del usuario
   */
  static async getConfig(userId: string) {
    let config = await db.paymentConfig.findUnique({
      where: { userId }
    })

    // Si no existe, crear configuración por defecto
    if (!config) {
      config = await db.paymentConfig.create({
        data: { userId }
      })
    }

    return config
  }

  /**
   * Generar respuesta de métodos de pago para WhatsApp
   */
  static async generatePaymentMessage(userId: string, productName: string, price: number, productId?: string) {
    const config = await this.getConfig(userId)
    
    // Verificar si el producto tiene links manuales
    let product = null
    if (productId) {
      product = await db.product.findUnique({
        where: { id: productId }
      })
    }

    let message = `💳 **MÉTODOS DE PAGO PARA ${productName}**\n\n`
    message += `💰 Precio: ${price.toLocaleString('es-CO')} COP\n\n`
    message += `Elige tu método de pago preferido:\n\n`

    let methodNumber = 1

    // Links manuales del producto (prioridad)
    if (product?.paymentLinkMercadoPago) {
      message += `${methodNumber}️⃣ **MERCADOPAGO**\n`
      message += `   🔗 ${product.paymentLinkMercadoPago}\n\n`
      methodNumber++
    } else if (config.mercadoPagoEnabled && config.mercadoPagoPublicKey) {
      message += `${methodNumber}️⃣ **MERCADOPAGO**\n`
      message += `   💳 Paga con tarjeta o PSE\n`
      message += `   🔗 Generando link...\n\n`
      methodNumber++
    }

    if (product?.paymentLinkPayPal) {
      message += `${methodNumber}️⃣ **PAYPAL**\n`
      message += `   🔗 ${product.paymentLinkPayPal}\n\n`
      methodNumber++
    } else if (config.paypalEnabled && config.paypalClientId) {
      message += `${methodNumber}️⃣ **PAYPAL**\n`
      message += `   💳 Paga con PayPal\n`
      message += `   🔗 Generando link...\n\n`
      methodNumber++
    }

    if (product?.paymentLinkCustom) {
      message += `${methodNumber}️⃣ **LINK DE PAGO**\n`
      message += `   🔗 ${product.paymentLinkCustom}\n\n`
      methodNumber++
    }

    // Nequi
    if (config.nequiEnabled && config.nequiPhone) {
      message += `${methodNumber}️⃣ **NEQUI**\n`
      message += `   📱 Número: ${config.nequiPhone}\n`
      message += `   ✅ Transferencia instantánea\n\n`
      methodNumber++
    }

    // Daviplata
    if (config.daviplataEnabled && config.daviplataPhone) {
      message += `${methodNumber}️⃣ **DAVIPLATA**\n`
      message += `   📱 Número: ${config.daviplataPhone}\n`
      message += `   ✅ Transferencia instantánea\n\n`
      methodNumber++
    }

    // Transferencia bancaria
    if (config.bankTransferEnabled && config.bankAccountNumber) {
      message += `${methodNumber}️⃣ **TRANSFERENCIA BANCARIA**\n`
      message += `   🏦 Banco: ${config.bankName || 'Bancolombia'}\n`
      message += `   📋 Cuenta: ${config.bankAccountNumber}\n`
      message += `   👤 Titular: ${config.bankAccountHolder || 'Tecnovariedades D&S'}\n`
      message += `   📝 Tipo: ${config.bankAccountType || 'Ahorros'}\n\n`
      methodNumber++
    }

    // Información de contacto
    if (config.contactPhone) {
      message += `📞 **Soporte:** ${config.contactPhone}\n`
    }
    if (config.contactEmail) {
      message += `📧 **Email:** ${config.contactEmail}\n`
    }
    if (config.contactAddress) {
      message += `📍 **Ubicación:** ${config.contactAddress}\n`
    }

    message += `\n¿Con cuál método deseas pagar?`

    return message
  }

  /**
   * Verificar si hay al menos un método de pago configurado
   */
  static async hasPaymentMethods(userId: string): Promise<boolean> {
    const config = await this.getConfig(userId)
    
    return !!(
      (config.mercadoPagoEnabled && config.mercadoPagoPublicKey) ||
      (config.paypalEnabled && config.paypalClientId) ||
      (config.nequiEnabled && config.nequiPhone) ||
      (config.daviplataEnabled && config.daviplataPhone) ||
      (config.bankTransferEnabled && config.bankAccountNumber)
    )
  }
}
