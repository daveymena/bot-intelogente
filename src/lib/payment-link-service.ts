/**
 * 💳 SERVICIO DE LINKS DE PAGO
 * Extrae y formatea links de pago de productos
 */

export class PaymentLinkService {
  /**
   * Extraer links de pago de un producto
   */
  static extractPaymentLinks(product: any): {
    hotmart?: string
    mercadopago?: string
    paypal?: string
    nequi?: string
    payco?: string
    otros?: string[]
  } {
    const links: any = {}
    
    try {
      const tags = product.tags ? JSON.parse(product.tags) : []
      
      for (const tag of tags) {
        if (typeof tag !== 'string') continue
        
        // Hotmart
        if (tag.startsWith('hotmart:')) {
          links.hotmart = tag.replace('hotmart:', '')
        }
        // Mercado Pago
        else if (tag.startsWith('mercadopago:')) {
          links.mercadopago = tag.replace('mercadopago:', '')
        }
        // PayPal
        else if (tag.startsWith('paypal:')) {
          links.paypal = tag.replace('paypal:', '')
        }
        // Nequi
        else if (tag.startsWith('nequi:')) {
          links.nequi = tag.replace('nequi:', '')
        }
        // Payco
        else if (tag.startsWith('payco:')) {
          links.payco = tag.replace('payco:', '')
        }
        // Otros links
        else if (tag.startsWith('http')) {
          if (!links.otros) links.otros = []
          links.otros.push(tag)
        }
      }
    } catch (error) {
      console.error('[PaymentLinks] Error extrayendo links:', error)
    }
    
    return links
  }

  /**
   * Formatear mensaje con links de pago
   */
  static formatPaymentMessage(product: any): string {
    const links = this.extractPaymentLinks(product)
    const parts: string[] = []

    parts.push(`💳 **MÉTODOS DE PAGO PARA ${product.name.toUpperCase()}:**\n`)

    let count = 1

    // Hotmart
    if (links.hotmart) {
      parts.push(`${count}️⃣ **Hotmart** (Recomendado)`)
      parts.push(`   👉 ${links.hotmart}`)
      parts.push(`   ✅ Pago seguro y acceso inmediato\n`)
      count++
    }

    // Mercado Pago
    if (links.mercadopago) {
      parts.push(`${count}️⃣ **Mercado Pago**`)
      parts.push(`   👉 ${links.mercadopago}`)
      parts.push(`   ✅ Tarjetas, PSE, efectivo\n`)
      count++
    }

    // PayPal
    if (links.paypal) {
      if (links.paypal.includes('http')) {
        parts.push(`${count}️⃣ **PayPal**`)
        parts.push(`   👉 ${links.paypal}`)
        parts.push(`   ✅ Pago internacional seguro\n`)
      } else {
        parts.push(`${count}️⃣ **PayPal**`)
        parts.push(`   📞 Solicita el link por WhatsApp: +57 304 274 8687\n`)
      }
      count++
    }

    // Nequi
    if (links.nequi) {
      parts.push(`${count}️⃣ **Nequi/Daviplata**`)
      parts.push(`   📱 ${links.nequi}`)
      parts.push(`   ✅ Transferencia móvil instantánea\n`)
      count++
    }

    // Payco
    if (links.payco) {
      parts.push(`${count}️⃣ **Tarjeta de Crédito/Débito**`)
      parts.push(`   👉 ${links.payco}`)
      parts.push(`   ✅ Pago con tarjeta\n`)
      count++
    }

    // Otros
    if (links.otros && links.otros.length > 0) {
      parts.push(`\n🔗 **Otros enlaces:**`)
      links.otros.forEach(link => {
        parts.push(`   👉 ${link}`)
      })
    }

    // Contacto
    parts.push(`\n📞 **¿Dudas sobre el pago?**`)
    parts.push(`WhatsApp: +57 304 274 8687`)

    return parts.join('\n')
  }

  /**
   * Verificar si un producto tiene links de pago
   */
  static hasPaymentLinks(product: any): boolean {
    const links = this.extractPaymentLinks(product)
    return !!(links.hotmart || links.mercadopago || links.paypal || links.nequi || links.payco)
  }

  /**
   * Obtener el link principal de pago
   */
  static getPrimaryPaymentLink(product: any): string | null {
    const links = this.extractPaymentLinks(product)
    
    // Prioridad: Hotmart > Mercado Pago > PayPal > Payco
    if (links.hotmart) return links.hotmart
    if (links.mercadopago) return links.mercadopago
    if (links.paypal && links.paypal.includes('http')) return links.paypal
    if (links.payco) return links.payco
    
    return null
  }

  /**
   * Formatear mensaje corto con link principal
   */
  static formatQuickPaymentMessage(product: any): string {
    const primaryLink = this.getPrimaryPaymentLink(product)
    
    if (!primaryLink) {
      return `📞 Para comprar ${product.name}, contáctanos por WhatsApp: +57 304 274 8687`
    }

    return `💳 Compra ${product.name} aquí:\n👉 ${primaryLink}\n\n📞 WhatsApp: +57 304 274 8687`
  }
}
