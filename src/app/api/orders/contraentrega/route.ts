import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { EmailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      productId,
      productName,
      quantity,
      price,
      total,
      color,
      customerData,
      paymentMethod,
      userId
    } = body

    // Validar datos requeridos
    if (!productId || !productName || !quantity || !customerData?.name || !customerData?.phone) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // Obtener información del negocio
    const businessInfo = await prisma.businessInfo.findFirst({
      where: { userId: userId || undefined }
    })

    // Crear el pedido en la base de datos
    const order = await prisma.order.create({
      data: {
        userId: userId || undefined,
        productId,
        quantity,
        total,
        status: 'pending',
        paymentMethod: 'contraentrega',
        customerName: customerData.name,
        customerEmail: customerData.email || undefined,
        customerPhone: customerData.phone,
        customerAddress: customerData.address,
        customerCity: customerData.city,
        shippingAddress: `${customerData.address}, ${customerData.city}, ${customerData.department}`,
        notes: color ? `Color: ${color}` : undefined
      }
    })

    // Preparar email para el vendedor
    const emailSubject = `🛒 Nuevo Pedido Contraentrega - ${productName}`
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🛒 Nuevo Pedido Contraentrega</h2>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">📦 Información del Producto</h3>
          <p><strong>Producto:</strong> ${productName}</p>
          <p><strong>Cantidad:</strong> ${quantity}</p>
          <p><strong>Precio Unitario:</strong> $${price.toLocaleString('es-CO')} COP</p>
          <p><strong>Total:</strong> $${total.toLocaleString('es-CO')} COP</p>
          ${color ? `<p><strong>Color:</strong> ${color}</p>` : ''}
        </div>

        <div style="background: #dbeafe; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">👤 Datos del Cliente</h3>
          <p><strong>Nombre:</strong> ${customerData.name}</p>
          <p><strong>Teléfono:</strong> ${customerData.phone}</p>
          ${customerData.email ? `<p><strong>Email:</strong> ${customerData.email}</p>` : ''}
          <p><strong>Dirección:</strong> ${customerData.address}</p>
          <p><strong>Ciudad:</strong> ${customerData.city}</p>
          <p><strong>Departamento:</strong> ${customerData.department}</p>
        </div>

        <div style="background: #dcfce7; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">💳 Método de Pago</h3>
          <p><strong>Contraentrega</strong> - El cliente pagará al recibir el producto</p>
        </div>

        <div style="background: #fef3c7; padding: 15px; border-radius: 10px; margin: 20px 0;">
          <p style="margin: 0;"><strong>⚠️ Acción Requerida:</strong> Contacta al cliente para confirmar el pedido y coordinar la entrega.</p>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Pedido ID: #${order.id}<br>
          Fecha: ${new Date().toLocaleString('es-CO')}
        </p>
      </div>
    `

    // Enviar email al vendedor
    if (businessInfo?.email) {
      try {
        await EmailService.sendEmail(
          businessInfo.email,
          emailSubject,
          emailBody
        )
      } catch (emailError) {
        console.error('Error enviando email:', emailError)
        // No fallar si el email falla, el pedido ya está guardado
      }
    }

    // Enviar email de confirmación al cliente (si proporcionó email)
    if (customerData.email) {
      const customerEmailSubject = `✅ Confirmación de Pedido - ${productName}`
      const customerEmailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">✅ ¡Pedido Recibido!</h2>
          
          <p>Hola <strong>${customerData.name}</strong>,</p>
          
          <p>Hemos recibido tu pedido y pronto nos pondremos en contacto contigo para confirmar la entrega.</p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">📦 Resumen de tu Pedido</h3>
            <p><strong>Producto:</strong> ${productName}</p>
            <p><strong>Cantidad:</strong> ${quantity}</p>
            <p><strong>Total:</strong> $${total.toLocaleString('es-CO')} COP</p>
            ${color ? `<p><strong>Color:</strong> ${color}</p>` : ''}
          </div>

          <div style="background: #dcfce7; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">🚚 Dirección de Entrega</h3>
            <p>${customerData.address}<br>
            ${customerData.city}, ${customerData.department}</p>
          </div>

          <div style="background: #dbeafe; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">💳 Método de Pago</h3>
            <p><strong>Contraentrega</strong> - Pagarás al recibir tu producto</p>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Pedido ID: #${order.id}<br>
            Fecha: ${new Date().toLocaleString('es-CO')}
          </p>

          <p style="margin-top: 30px;">
            Si tienes alguna pregunta, contáctanos por WhatsApp: ${businessInfo?.whatsappNumber || ''}
          </p>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Gracias por tu compra,<br>
            <strong>${businessInfo?.businessName || 'Smart Sales Bot'}</strong>
          </p>
        </div>
      `

      try {
        await EmailService.sendEmail(
          customerData.email,
          customerEmailSubject,
          customerEmailBody
        )
      } catch (emailError) {
        console.error('Error enviando email al cliente:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: 'Pedido creado exitosamente'
    })

  } catch (error) {
    console.error('Error procesando pedido contraentrega:', error)
    return NextResponse.json(
      { error: 'Error procesando el pedido' },
      { status: 500 }
    )
  }
}
