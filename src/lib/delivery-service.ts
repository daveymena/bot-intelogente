/**
 * 📦 SERVICIO DE ENTREGA AUTOMÁTICA
 * Envía links de Google Drive automáticamente después del pago
 * - Por WhatsApp usando Baileys
 * - Por Email usando el servicio de email
 */

import { db } from './db'
import { EmailService } from './email-service'

interface DeliveryResult {
  success: boolean
  whatsappSent: boolean
  emailSent: boolean
  productName: string
  deliveryLink: string
  error?: string
}

interface CustomerInfo {
  phone?: string
  email?: string
  name?: string
}

/**
 * Enviar link de entrega después del pago
 */
export async function sendDeliveryLink(
  productId: string,
  customer: CustomerInfo
): Promise<DeliveryResult> {
  console.log(`📦 [Delivery] Iniciando entrega para producto: ${productId}`)
  
  let whatsappSent = false
  let emailSent = false
  
  try {
    // 1. Buscar producto con su link de entrega
    const product = await db.product.findUnique({
      where: { id: productId }
    })
    
    if (!product) {
      console.error(`[Delivery] ❌ Producto no encontrado: ${productId}`)
      return {
        success: false,
        whatsappSent: false,
        emailSent: false,
        productName: 'Desconocido',
        deliveryLink: '',
        error: 'Producto no encontrado'
      }
    }
    
    if (!product.deliveryLink) {
      console.error(`[Delivery] ❌ Producto sin link de entrega: ${product.name}`)
      return {
        success: false,
        whatsappSent: false,
        emailSent: false,
        productName: product.name,
        deliveryLink: '',
        error: 'Producto sin link de entrega configurado'
      }
    }
    
    console.log(`[Delivery] ✅ Producto encontrado: ${product.name}`)
    console.log(`[Delivery] 📎 Link: ${product.deliveryLink}`)
    
    // 2. Preparar mensaje de entrega
    const deliveryMessage = generateDeliveryMessage(product.name, product.deliveryLink)
    
    // 3. Enviar por WhatsApp si hay número
    if (customer.phone) {
      whatsappSent = await sendWhatsAppDelivery(customer.phone, deliveryMessage)
    }
    
    // 4. Enviar por Email si hay correo
    if (customer.email) {
      emailSent = await sendEmailDelivery(
        customer.email,
        customer.name || 'Cliente',
        product.name,
        product.deliveryLink
      )
    }
    
    const success = whatsappSent || emailSent
    
    console.log(`[Delivery] 📊 Resultado: WhatsApp=${whatsappSent}, Email=${emailSent}`)
    
    return {
      success,
      whatsappSent,
      emailSent,
      productName: product.name,
      deliveryLink: product.deliveryLink
    }
    
  } catch (error) {
    console.error('[Delivery] ❌ Error en entrega:', error)
    return {
      success: false,
      whatsappSent: false,
      emailSent: false,
      productName: '',
      deliveryLink: '',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Generar mensaje de entrega para WhatsApp
 */
function generateDeliveryMessage(productName: string, deliveryLink: string): string {
  return `🎉 *¡PAGO CONFIRMADO!*

¡Gracias por tu compra! 🙏

📦 *Producto:* ${productName}

🔗 *Tu acceso está listo:*
${deliveryLink}

📝 *Instrucciones:*
1. Haz clic en el enlace
2. Inicia sesión con tu cuenta de Google
3. ¡Disfruta tu contenido!

💡 *Importante:*
- El acceso es de por vida
- Puedes descargar el contenido
- Guarda este mensaje

❓ ¿Tienes alguna duda?
Escríbenos y te ayudamos 😊

_Tecnovariedades D&S_
_Tu tienda de confianza_ ✨`
}

/**
 * Enviar entrega por WhatsApp usando Baileys
 */
async function sendWhatsAppDelivery(phone: string, message: string): Promise<boolean> {
  try {
    // Formatear número de teléfono
    let formattedPhone = phone.replace(/\D/g, '')
    if (!formattedPhone.startsWith('57')) {
      formattedPhone = '57' + formattedPhone
    }
    
    console.log(`[Delivery] 📱 Enviando WhatsApp a: ${formattedPhone}`)
    
    // Importar dinámicamente el servicio de Baileys
    const { BaileysService } = await import('./baileys-service')
    
    // Verificar si hay conexión activa
    const status = BaileysService.getStatus()
    if (status.status !== 'connected') {
      console.error('[Delivery] ❌ WhatsApp no conectado')
      return false
    }
    
    // Enviar mensaje
    await BaileysService.sendMessage(formattedPhone, message)
    
    console.log(`[Delivery] ✅ WhatsApp enviado exitosamente`)
    return true
    
  } catch (error) {
    console.error('[Delivery] ❌ Error enviando WhatsApp:', error)
    return false
  }
}

/**
 * Enviar entrega por Email
 */
async function sendEmailDelivery(
  email: string,
  name: string,
  productName: string,
  deliveryLink: string
): Promise<boolean> {
  try {
    console.log(`[Delivery] 📧 Enviando email a: ${email}`)
    
    const subject = `🎉 ¡Tu compra está lista! - ${productName}`
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .product-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .btn { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .btn:hover { background: #5a6fd6; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .instructions { background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .instructions li { margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 ¡Pago Confirmado!</h1>
      <p>Gracias por tu compra, ${name}</p>
    </div>
    
    <div class="content">
      <div class="product-box">
        <h2>📦 Tu Producto</h2>
        <p><strong>${productName}</strong></p>
      </div>
      
      <h3>🔗 Accede a tu contenido:</h3>
      <p style="text-align: center;">
        <a href="${deliveryLink}" class="btn">📥 ACCEDER AHORA</a>
      </p>
      
      <div class="instructions">
        <h4>📝 Instrucciones:</h4>
        <ol>
          <li>Haz clic en el botón "ACCEDER AHORA"</li>
          <li>Inicia sesión con tu cuenta de Google</li>
          <li>¡Disfruta tu contenido!</li>
        </ol>
      </div>
      
      <p><strong>💡 Importante:</strong></p>
      <ul>
        <li>✅ El acceso es de por vida</li>
        <li>✅ Puedes descargar el contenido</li>
        <li>✅ Guarda este correo para futuras referencias</li>
      </ul>
      
      <p>¿Tienes alguna duda? Responde a este correo y te ayudamos 😊</p>
    </div>
    
    <div class="footer">
      <p><strong>Tecnovariedades D&S</strong></p>
      <p>Tu tienda de confianza ✨</p>
      <p>WhatsApp: 3136174267</p>
    </div>
  </div>
</body>
</html>
`
    
    // Usar el servicio de email existente
    await EmailService.sendCustomEmail(email, subject, htmlContent)
    
    console.log(`[Delivery] ✅ Email enviado exitosamente`)
    return true
    
  } catch (error) {
    console.error('[Delivery] ❌ Error enviando email:', error)
    return false
  }
}

/**
 * Procesar entrega después de pago confirmado
 * Esta función se llama desde los webhooks de MercadoPago y PayPal
 */
export async function processPaymentDelivery(
  productId: string,
  payerEmail?: string,
  payerPhone?: string,
  payerName?: string
): Promise<DeliveryResult> {
  console.log(`[Delivery] 🔄 Procesando entrega post-pago`)
  console.log(`[Delivery] - Producto: ${productId}`)
  console.log(`[Delivery] - Email: ${payerEmail || 'N/A'}`)
  console.log(`[Delivery] - Teléfono: ${payerPhone || 'N/A'}`)
  
  return sendDeliveryLink(productId, {
    email: payerEmail,
    phone: payerPhone,
    name: payerName
  })
}

/**
 * Enviar entrega manual (desde el dashboard)
 */
export async function sendManualDelivery(
  productId: string,
  phone?: string,
  email?: string
): Promise<DeliveryResult> {
  console.log(`[Delivery] 📤 Entrega manual solicitada`)
  
  return sendDeliveryLink(productId, { phone, email })
}

export const DeliveryService = {
  sendDeliveryLink,
  processPaymentDelivery,
  sendManualDelivery
}
