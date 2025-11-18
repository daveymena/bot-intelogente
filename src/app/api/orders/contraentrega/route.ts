import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerData, cart, total } = body

    // Crear mensaje para email y WhatsApp
    const orderMessage = `
🛒 NUEVO PEDIDO - CONTRAENTREGA

👤 DATOS DEL CLIENTE:
━━━━━━━━━━━━━━━━━━━━━━
Nombre: ${customerData.name}
Email: ${customerData.email}
Teléfono: ${customerData.phone}
Dirección: ${customerData.address}
Ciudad: ${customerData.city}

📦 PRODUCTOS:
━━━━━━━━━━━━━━━━━━━━━━
${cart.map((item: any) => `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString('es-CO')} COP`).join('\n')}

💰 TOTAL: $${total.toLocaleString('es-CO')} COP

📝 NOTAS:
${customerData.notes || 'Ninguna'}

━━━━━━━━━━━━━━━━━━━━━━
Fecha: ${new Date().toLocaleString('es-CO')}
    `.trim()

    // Enviar por email
    const emailSent = await sendEmail(customerData.email, orderMessage)

    // Generar link de WhatsApp
    const whatsappMessage = orderMessage.replace(/━/g, '-')
    const whatsappLink = `https://wa.me/573136174267?text=${encodeURIComponent(whatsappMessage)}`

    return NextResponse.json({
      success: true,
      emailSent,
      whatsappLink,
      message: 'Pedido procesado correctamente'
    })

  } catch (error) {
    console.error('[Contraentrega API] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Error procesando pedido'
    }, { status: 500 })
  }
}

async function sendEmail(customerEmail: string, message: string): Promise<boolean> {
  try {
    const EMAIL_USER = process.env.EMAIL_USER
    const EMAIL_PASS = process.env.EMAIL_PASS
    const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER

    if (!EMAIL_USER || !EMAIL_PASS) {
      console.log('[Email] Credenciales no configuradas')
      return false
    }

    // Crear transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      }
    })

    // Enviar email al vendedor
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: EMAIL_USER, // Enviar al mismo email del negocio
      subject: '🛒 Nuevo Pedido - Contraentrega',
      text: message,
      html: `<pre style="font-family: monospace; white-space: pre-wrap;">${message}</pre>`
    })

    // Enviar confirmación al cliente
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: customerEmail,
      subject: '✅ Pedido Recibido - Smart Sales Bot',
      text: `Hola,\n\nHemos recibido tu pedido correctamente.\n\nNos pondremos en contacto contigo pronto para coordinar la entrega.\n\n${message}\n\nGracias por tu compra!\n\nSmart Sales Bot`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #EC4899;">✅ Pedido Recibido</h2>
          <p>Hola <strong>${customerEmail}</strong>,</p>
          <p>Hemos recibido tu pedido correctamente.</p>
          <p>Nos pondremos en contacto contigo pronto para coordinar la entrega.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <pre style="font-family: monospace; white-space: pre-wrap; margin: 0;">${message}</pre>
          </div>
          <p>Gracias por tu compra!</p>
          <p style="color: #6b7280; font-size: 14px;">Smart Sales Bot</p>
        </div>
      `
    })

    console.log('[Email] Emails enviados correctamente')
    return true

  } catch (error) {
    console.error('[Email] Error enviando:', error)
    return false
  }
}
