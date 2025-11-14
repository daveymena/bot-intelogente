/**
 * Script para mejorar el formato de PayPal en los mensajes de pago
 */

import fs from 'fs'
import path from 'path'

const filePath = path.join(process.cwd(), 'src/lib/bot-payment-link-generator.ts')

// Leer archivo
let content = fs.readFileSync(filePath, 'utf-8')

// Buscar y reemplazar el método buildPaymentMessage
const oldMethod = /private static buildPaymentMessage\([^)]+\): string \{[\s\S]*?return message\s*\n\s*\}/

const newMethod = `private static buildPaymentMessage(
    productName: string,
    formattedPrice: string,
    mercadoPagoLink?: string,
    payPalLink?: string,
    whatsAppLink?: string,
    paymentInfo?: { nequi?: string; daviplata?: string }
  ): string {
    let message = \`🟢 ¡Perfecto! Aquí están tus opciones de pago\\n\\n\`
    message += \`📦 *Producto:* \${productName}\\n\`
    message += \`💰 *Total a Pagar:* $\${formattedPrice} COP\\n\\n\`
    message += \`━━━━━━━━━━━━━━━━━━━━━━\\n\`
    message += \`*MÉTODOS DE PAGO DISPONIBLES:*\\n\`
    message += \`━━━━━━━━━━━━━━━━━━━━━━\\n\\n\`

    // MercadoPago
    if (mercadoPagoLink) {
      message += \`💳 *1. Mercado Pago*\\n\`
      message += \`   💰 Precio: $\${formattedPrice} COP\\n\`
      message += \`   ✅ Tarjetas, PSE, Efectivo\\n\`
      message += \`   🔒 Pago 100% seguro\\n\`
      message += \`   👉 Link: \${mercadoPagoLink}\\n\\n\`
    }

    // PayPal
    if (payPalLink) {
      // Calcular precio aproximado en USD
      const priceNumber = parseFloat(formattedPrice.replace(/\\./g, '').replace(',', '.'))
      const priceUSD = (priceNumber / 4000).toFixed(2)
      
      message += \`💙 *2. PayPal*\\n\`
      message += \`   💰 Precio: $\${formattedPrice} COP\\n\`
      message += \`   💵 Aprox: $\${priceUSD} USD\\n\`
      message += \`   ✅ Tarjetas internacionales\\n\`
      message += \`   🔒 Protección al comprador\\n\`
      message += \`   ℹ️ Te pedirá iniciar sesión en PayPal\\n\`
      message += \`   👉 Link: \${payPalLink}\\n\\n\`
    }

    // Nequi
    if (paymentInfo?.nequi) {
      message += \`📱 *3. Nequi*\\n\`
      message += \`   💰 Precio: $\${formattedPrice} COP\\n\`
      message += \`   📞 Número: \${paymentInfo.nequi}\\n\`
      message += \`   📸 Envía captura del pago\\n\\n\`
    }

    // Daviplata
    if (paymentInfo?.daviplata) {
      message += \`📱 *4. Daviplata*\\n\`
      message += \`   💰 Precio: $\${formattedPrice} COP\\n\`
      message += \`   📞 Número: \${paymentInfo.daviplata}\\n\`
      message += \`   📸 Envía captura del pago\\n\\n\`
    }

    // WhatsApp directo
    if (whatsAppLink) {
      message += \`💬 *5. Contacto Directo*\\n\`
      message += \`   📞 Habla con un asesor\\n\`
      message += \`   👉 \${whatsAppLink}\\n\\n\`
    }

    message += \`━━━━━━━━━━━━━━━━━━━━━━\\n\`
    message += \`✅ *Todos los métodos son seguros*\\n\`
    message += \`📦 *Entrega inmediata* después del pago\\n\`
    message += \`🔒 *Compra protegida*\\n\\n\`
    message += \`¿Con cuál método prefieres pagar? 😊\`

    return message
  }`

if (oldMethod.test(content)) {
  content = content.replace(oldMethod, newMethod)
  fs.writeFileSync(filePath, content, 'utf-8')
  console.log('✅ Archivo actualizado exitosamente')
  console.log('📁 Archivo: src/lib/bot-payment-link-generator.ts')
  console.log('🔄 Reinicia el bot: npm run dev')
} else {
  console.log('❌ No se encontró el método para reemplazar')
  console.log('ℹ️ Revisa el archivo manualmente')
}
