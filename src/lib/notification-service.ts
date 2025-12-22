/**
 * 🔔 Servicio Universal de Notificaciones con Tokens
 * 
 * Sistema reutilizable para enviar notificaciones seguras con tokens temporales.
 * Soporta: pagos, recordatorios, facturas, citas, acceso temporal, etc.
 */

import { db } from '@/lib/db';
import { EmailService } from '@/lib/email-service';
import crypto from 'crypto';
import { NotificationTokenType, TokenStatus, PaymentStatus } from '@prisma/client';

export interface CreateNotificationTokenParams {
  type: NotificationTokenType;
  purpose: string;
  userId?: string;
  paymentId?: string;
  metadata?: any;
  expiresInHours?: number;
}

export interface SendPaymentNotificationParams {
  paymentId: string;
  type: 'confirmation' | 'reminder' | 'invoice';
  customerEmail: string;
  customerName?: string;
}

export class NotificationService {
  /**
   * Genera un token seguro y lo guarda en la base de datos
   */
  static async createToken(params: CreateNotificationTokenParams) {
    const {
      type,
      purpose,
      userId,
      paymentId,
      metadata,
      expiresInHours = 24
    } = params;

    // Generar token seguro
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    // Calcular expiración
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    // Guardar en BD
    const tokenRecord = await db.notificationToken.create({
      data: {
        token: hashedToken,
        type,
        purpose,
        userId,
        paymentId,
        metadata,
        expiresAt,
        status: 'PENDING'
      }
    });

    console.log(`[NotificationService] Token creado: ${type} - ${purpose}`);

    return {
      tokenRecord,
      rawToken, // Este es el que se envía al usuario
      url: this.generateUrl(type, rawToken)
    };
  }

  /**
   * Valida un token y lo marca como usado
   */
  static async validateToken(rawToken: string) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const tokenRecord = await db.notificationToken.findFirst({
      where: {
        token: hashedToken,
        status: 'PENDING',
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true,
        payment: true
      }
    });

    if (!tokenRecord) {
      return { valid: false, error: 'Token inválido o expirado' };
    }

    // Actualizar contador de vistas
    await db.notificationToken.update({
      where: { id: tokenRecord.id },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date()
      }
    });

    return {
      valid: true,
      token: tokenRecord
    };
  }

  /**
   * Marca un token como usado
   */
  static async markAsUsed(tokenId: string) {
    await db.notificationToken.update({
      where: { id: tokenId },
      data: {
        status: 'USED',
        usedAt: new Date()
      }
    });
  }

  /**
   * Genera URL según el tipo de notificación
   */
  private static generateUrl(type: NotificationTokenType, token: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000';
    
    const urlMap: Record<NotificationTokenType, string> = {
      PAYMENT_CONFIRMATION: `/payment/confirmation?token=${token}`,
      PAYMENT_REMINDER: `/payment/reminder?token=${token}`,
      PAYMENT_INVOICE: `/payment/invoice?token=${token}`,
      PAYMENT_STATUS: `/payment/status?token=${token}`,
      ORDER_TRACKING: `/order/tracking?token=${token}`,
      DELIVERY_NOTIFICATION: `/delivery/status?token=${token}`,
      APPOINTMENT_CONFIRMATION: `/appointment/confirm?token=${token}`,
      APPOINTMENT_REMINDER: `/appointment/reminder?token=${token}`,
      ACCOUNT_VERIFICATION: `/verify-account?token=${token}`,
      EMAIL_CHANGE: `/change-email?token=${token}`,
      TEMPORARY_ACCESS: `/access?token=${token}`,
      CUSTOM: `/notification?token=${token}`
    };

    return `${baseUrl}${urlMap[type] || `/notification?token=${token}`}`;
  }

  /**
   * 💳 Envía notificación de confirmación de pago
   */
  static async sendPaymentConfirmation(
    userId: string,
    paymentId: string,
    customerEmail: string,
    amount: number,
    currency: string = 'COP',
    customerName?: string
  ) {

    // Obtener información del pago
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: { user: true }
    });

    if (!payment) {
      throw new Error('Pago no encontrado');
    }

    // Parsear metadata si existe
    const metadata = payment.metadata ? JSON.parse(payment.metadata) : {};
    const productName = metadata.productName || payment.description || 'Producto';
    const transactionId = metadata.transactionId || payment.stripePaymentId || payment.id;

    // Crear token
    const { rawToken, url } = await this.createToken({
      type: 'PAYMENT_CONFIRMATION',
      purpose: 'Ver confirmación de pago',
      userId: payment.userId,
      paymentId: payment.id,
      metadata: {
        amount: payment.amount,
        currency: payment.currency,
        productName
      },
      expiresInHours: 72 // 3 días
    });

    // Enviar email
    const emailSent = await EmailService.sendEmail({
      to: customerEmail,
      subject: '✅ Pago Recibido - Smart Sales Bot Pro',
      html: this.generatePaymentConfirmationEmail({
        customerName: customerName || 'Cliente',
        amount: payment.amount,
        currency: payment.currency,
        productName,
        transactionId,
        confirmationUrl: url,
        invoiceUrl: metadata.invoiceUrl || null
      }),
      text: `Pago recibido: ${payment.amount} ${payment.currency}. Ver detalles: ${url}`
    });

    // Registrar notificación enviada en metadata
    const updatedMetadata = {
      ...metadata,
      notificationsSent: {
        ...(metadata.notificationsSent || {}),
        confirmation: {
          sentAt: new Date().toISOString(),
          email: customerEmail,
          success: emailSent
        }
      }
    };

    await db.payment.update({
      where: { id: paymentId },
      data: {
        metadata: JSON.stringify(updatedMetadata)
      }
    });

    console.log(`[NotificationService] Confirmación de pago enviada a ${customerEmail}`);

    return { success: emailSent, url };
  }

  /**
   * 🔔 Envía recordatorio de pago pendiente
   */
  static async sendPaymentReminder(params: SendPaymentNotificationParams) {
    const { paymentId, customerEmail, customerName } = params;

    const payment = await db.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new Error('Pago no encontrado');
    }

    // Parsear metadata
    const metadata = payment.metadata ? JSON.parse(payment.metadata) : {};
    const productName = metadata.productName || payment.description || 'Producto';

    // Crear token
    const { rawToken, url } = await this.createToken({
      type: 'PAYMENT_REMINDER',
      purpose: 'Recordatorio de pago pendiente',
      userId: payment.userId,
      paymentId: payment.id,
      metadata: {
        amount: payment.amount,
        currency: payment.currency,
        productName
      },
      expiresInHours: 48
    });

    // Enviar email
    const emailSent = await EmailService.sendEmail({
      to: customerEmail,
      subject: '⏰ Recordatorio de Pago Pendiente',
      html: this.generatePaymentReminderEmail({
        customerName: customerName || 'Cliente',
        amount: payment.amount,
        currency: payment.currency,
        productName,
        paymentUrl: url,
        expiresAt: metadata.expiresAt ? new Date(metadata.expiresAt) : null
      }),
      text: `Recordatorio: Tienes un pago pendiente de ${payment.amount} ${payment.currency}. Pagar ahora: ${url}`
    });

    console.log(`[NotificationService] Recordatorio de pago enviado a ${customerEmail}`);

    return { success: emailSent, url };
  }

  /**
   * 📄 Envía factura/recibo
   */
  static async sendInvoice(params: SendPaymentNotificationParams) {
    const { paymentId, customerEmail, customerName } = params;

    const payment = await db.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new Error('Pago no encontrado');
    }

    // Parsear metadata
    const metadata = payment.metadata ? JSON.parse(payment.metadata) : {};
    const productName = metadata.productName || payment.description || 'Producto';
    const invoiceNumber = metadata.invoiceNumber || payment.id;

    // Crear token
    const { rawToken, url } = await this.createToken({
      type: 'PAYMENT_INVOICE',
      purpose: 'Ver factura/recibo',
      userId: payment.userId,
      paymentId: payment.id,
      metadata: {
        invoiceNumber,
        amount: payment.amount,
        currency: payment.currency
      },
      expiresInHours: 720 // 30 días
    });

    // Enviar email
    const emailSent = await EmailService.sendEmail({
      to: customerEmail,
      subject: '📄 Tu Factura - Smart Sales Bot Pro',
      html: this.generateInvoiceEmail({
        customerName: customerName || 'Cliente',
        invoiceNumber,
        amount: payment.amount,
        currency: payment.currency,
        productName,
        invoiceUrl: url,
        paidAt: metadata.paidAt ? new Date(metadata.paidAt) : null
      }),
      text: `Tu factura está lista. Ver factura: ${url}`
    });

    console.log(`[NotificationService] Factura enviada a ${customerEmail}`);

    return { success: emailSent, url };
  }

  /**
   * 📧 Templates de Email
   */
  private static generatePaymentConfirmationEmail(data: {
    customerName: string;
    amount: number;
    currency: string;
    productName: string;
    transactionId: string;
    confirmationUrl: string;
    invoiceUrl?: string | null;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ ¡Pago Recibido!</h1>
            </div>
            <div class="content">
              <div class="success-icon">🎉</div>
              
              <h2>Hola ${data.customerName},</h2>
              <p>Tu pago ha sido procesado exitosamente. ¡Gracias por tu compra!</p>
              
              <div class="info-box">
                <h3>Detalles de la Transacción</h3>
                <p><strong>Producto:</strong> ${data.productName}</p>
                <p><strong>Monto:</strong> ${data.amount.toLocaleString()} ${data.currency}</p>
                <p><strong>ID de Transacción:</strong> ${data.transactionId}</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
              </div>
              
              <p style="text-align: center;">
                <a href="${data.confirmationUrl}" class="button">Ver Confirmación Completa</a>
              </p>
              
              ${data.invoiceUrl ? `
                <p style="text-align: center;">
                  <a href="${data.invoiceUrl}" style="color: #10b981;">Descargar Factura</a>
                </p>
              ` : ''}
              
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            </div>
            <div class="footer">
              <p>Smart Sales Bot Pro - Automatización Inteligente de Ventas</p>
              <p>Este es un correo automático, por favor no respondas.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static generatePaymentReminderEmail(data: {
    customerName: string;
    amount: number;
    currency: string;
    productName: string;
    paymentUrl: string;
    expiresAt?: Date | null;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Recordatorio de Pago</h1>
            </div>
            <div class="content">
              <h2>Hola ${data.customerName},</h2>
              <p>Te recordamos que tienes un pago pendiente:</p>
              
              <div class="info-box">
                <p><strong>Producto:</strong> ${data.productName}</p>
                <p><strong>Monto:</strong> ${data.amount.toLocaleString()} ${data.currency}</p>
                ${data.expiresAt ? `<p><strong>Vence:</strong> ${data.expiresAt.toLocaleString('es-ES')}</p>` : ''}
              </div>
              
              ${data.expiresAt ? `
                <div class="warning-box">
                  <p><strong>⚠️ Importante:</strong> Este pago vence pronto. Completa tu pago para no perder tu reserva.</p>
                </div>
              ` : ''}
              
              <p style="text-align: center;">
                <a href="${data.paymentUrl}" class="button">Pagar Ahora</a>
              </p>
              
              <p>Si ya realizaste el pago, puedes ignorar este mensaje.</p>
            </div>
            <div class="footer">
              <p>Smart Sales Bot Pro</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static generateInvoiceEmail(data: {
    customerName: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    productName: string;
    invoiceUrl: string;
    paidAt?: Date | null;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #e5e7eb; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📄 Tu Factura</h1>
            </div>
            <div class="content">
              <h2>Hola ${data.customerName},</h2>
              <p>Tu factura está lista para descargar.</p>
              
              <div class="info-box">
                <h3>Factura #${data.invoiceNumber}</h3>
                <p><strong>Producto:</strong> ${data.productName}</p>
                <p><strong>Monto:</strong> ${data.amount.toLocaleString()} ${data.currency}</p>
                ${data.paidAt ? `<p><strong>Fecha de Pago:</strong> ${data.paidAt.toLocaleString('es-ES')}</p>` : ''}
              </div>
              
              <p style="text-align: center;">
                <a href="${data.invoiceUrl}" class="button">Ver/Descargar Factura</a>
              </p>
              
              <p>Guarda esta factura para tus registros.</p>
            </div>
            <div class="footer">
              <p>Smart Sales Bot Pro</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

