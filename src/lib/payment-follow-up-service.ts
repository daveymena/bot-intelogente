/**
 * Servicio de Seguimiento de Pagos
 * Envía recordatorios automáticos cada 30 minutos hasta que el cliente complete el pago
 */

import { db } from '@/lib/db';

interface PendingPayment {
  id: string;
  userId: string;
  customerPhone: string;
  productId: string;
  productName: string;
  amount: number;
  paymentMethod: string;
  createdAt: Date;
  lastReminderAt?: Date;
  reminderCount: number;
}

export class PaymentFollowUpService {
  private static instance: PaymentFollowUpService;
  private pendingPayments: Map<string, PendingPayment> = new Map();
  private reminderInterval: NodeJS.Timeout | null = null;
  private readonly REMINDER_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 horas (1 día)
  private readonly MAX_REMINDERS = 3; // Máximo 3 recordatorios (3 días)
  private readonly REMINDERS_ENABLED = false; // ⚠️ DESACTIVADO para evitar ban de Meta

  private constructor() {
    this.startReminderService();
  }

  static getInstance(): PaymentFollowUpService {
    if (!this.instance) {
      this.instance = new PaymentFollowUpService();
    }
    return this.instance;
  }

  /**
   * Registra un pago pendiente para seguimiento
   */
  async registerPendingPayment(params: {
    userId: string;
    customerPhone: string;
    productId: string;
    productName: string;
    amount: number;
    paymentMethod: string;
  }): Promise<string> {
    const paymentId = `${params.userId}-${params.customerPhone}-${params.productId}-${Date.now()}`;
    
    const pendingPayment: PendingPayment = {
      id: paymentId,
      userId: params.userId,
      customerPhone: params.customerPhone,
      productId: params.productId,
      productName: params.productName,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      createdAt: new Date(),
      reminderCount: 0,
    };

    this.pendingPayments.set(paymentId, pendingPayment);
    
    console.log(`[PaymentFollowUp] 📝 Pago pendiente registrado: ${paymentId}`);
    console.log(`[PaymentFollowUp] 📦 Producto: ${params.productName}`);
    console.log(`[PaymentFollowUp] 💰 Monto: $${params.amount.toLocaleString('es-CO')}`);
    
    return paymentId;
  }

  /**
   * Marca un pago como completado
   */
  async markPaymentCompleted(paymentId: string): Promise<void> {
    if (this.pendingPayments.has(paymentId)) {
      this.pendingPayments.delete(paymentId);
      console.log(`[PaymentFollowUp] ✅ Pago completado: ${paymentId}`);
    }
  }

  /**
   * Marca un pago como completado por teléfono y producto
   */
  async markPaymentCompletedByPhone(customerPhone: string, productId: string): Promise<void> {
    for (const [id, payment] of this.pendingPayments.entries()) {
      if (payment.customerPhone === customerPhone && payment.productId === productId) {
        this.pendingPayments.delete(id);
        console.log(`[PaymentFollowUp] ✅ Pago completado por teléfono: ${customerPhone}`);
      }
    }
  }

  /**
   * Inicia el servicio de recordatorios automáticos
   */
  private startReminderService(): void {
    // ⚠️ DESACTIVADO: Recordatorios automáticos pueden causar ban de Meta/WhatsApp
    if (!this.REMINDERS_ENABLED) {
      console.log('[PaymentFollowUp] ⚠️ Servicio de recordatorios DESACTIVADO (protección anti-ban)');
      return;
    }
    
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
    }

    // Verificar cada 5 minutos si hay pagos que necesitan recordatorio
    this.reminderInterval = setInterval(() => {
      this.checkPendingPayments();
    }, 5 * 60 * 1000); // Cada 5 minutos

    console.log('[PaymentFollowUp] 🚀 Servicio de recordatorios iniciado');
  }

  /**
   * Verifica pagos pendientes y envía recordatorios
   */
  private async checkPendingPayments(): Promise<void> {
    // ⚠️ DESACTIVADO: Recordatorios automáticos pueden causar ban de Meta/WhatsApp
    if (!this.REMINDERS_ENABLED) {
      return;
    }
    
    const now = new Date();

    for (const [id, payment] of this.pendingPayments.entries()) {
      // Calcular tiempo desde último recordatorio (o desde creación)
      const lastTime = payment.lastReminderAt || payment.createdAt;
      const timeSinceLastReminder = now.getTime() - lastTime.getTime();

      // Si han pasado 24 horas y no se ha alcanzado el máximo de recordatorios
      if (timeSinceLastReminder >= this.REMINDER_INTERVAL_MS && payment.reminderCount < this.MAX_REMINDERS) {
        await this.sendReminder(payment);
        
        // Actualizar contador y fecha
        payment.lastReminderAt = now;
        payment.reminderCount++;
        
        console.log(`[PaymentFollowUp] 📨 Recordatorio ${payment.reminderCount}/${this.MAX_REMINDERS} enviado`);
      }

      // Si se alcanzó el máximo de recordatorios, eliminar del seguimiento
      if (payment.reminderCount >= this.MAX_REMINDERS) {
        console.log(`[PaymentFollowUp] ⏰ Máximo de recordatorios alcanzado para: ${id}`);
        this.pendingPayments.delete(id);
      }
    }
  }

  /**
   * Envía un recordatorio al cliente
   */
  private async sendReminder(payment: PendingPayment): Promise<void> {
    try {
      // Importar dinámicamente para evitar dependencias circulares
      const { BaileysStableService } = await import('@/lib/baileys-stable-service');
      
      const message = this.generateReminderMessage(payment);
      
      await BaileysStableService.sendMessage(
        payment.userId,
        payment.customerPhone,
        message
      );

      console.log(`[PaymentFollowUp] ✅ Recordatorio enviado a ${payment.customerPhone}`);
    } catch (error) {
      console.error('[PaymentFollowUp] ❌ Error enviando recordatorio:', error);
    }
  }

  /**
   * Genera el mensaje de recordatorio personalizado
   */
  private generateReminderMessage(payment: PendingPayment): string {
    const timeElapsed = Math.floor((Date.now() - payment.createdAt.getTime()) / (60 * 1000));
    const hours = Math.floor(timeElapsed / 60);
    const minutes = timeElapsed % 60;
    
    let timeText = '';
    if (hours > 0) {
      timeText = `${hours} hora${hours > 1 ? 's' : ''}`;
      if (minutes > 0) {
        timeText += ` y ${minutes} minutos`;
      }
    } else {
      timeText = `${minutes} minutos`;
    }

    const messages = [
      // Primer recordatorio (30 min)
      `Hola! 👋

Veo que hace ${timeText} te interesaba *${payment.productName}* 😊

¿Aún te gustaría completar tu compra? Estoy aquí para ayudarte con cualquier duda que tengas 💬

💰 *Monto:* $${payment.amount.toLocaleString('es-CO')} COP
💳 *Método:* ${this.getPaymentMethodName(payment.paymentMethod)}

¿Necesitas ayuda con el pago? 🤝`,

      // Segundo recordatorio (1 hora)
      `Hola de nuevo! 😊

Solo quería recordarte que *${payment.productName}* sigue disponible para ti 🎯

Si tienes alguna pregunta sobre el producto o el proceso de pago, con gusto te ayudo 💬

💰 *Precio:* $${payment.amount.toLocaleString('es-CO')} COP

¿Te gustaría continuar con tu compra? 🛒`,

      // Tercer recordatorio (1.5 horas)
      `Hola! 👋

Estoy muy atento a tu interés en *${payment.productName}* 😊

¿Hay algo que te preocupe o alguna duda que pueda resolver? Estoy aquí para ayudarte 🤝

Si prefieres otro método de pago o necesitas más información, solo dímelo 💬`,

      // Cuarto recordatorio (2 horas)
      `Hola! 😊

Solo quería asegurarme de que no te perdiste la oportunidad de adquirir *${payment.productName}* 🎯

Si decidiste no comprarlo, está bien! Pero si aún te interesa, estoy aquí para ayudarte a completar tu compra 💪

¿Qué te parece? 🤔`,

      // Quinto recordatorio (2.5 horas) - Último
      `Hola! 👋

Este es mi último recordatorio sobre *${payment.productName}* 😊

Si aún te interesa, estaré encantado de ayudarte. Si no, no hay problema! Siempre estaré aquí cuando necesites algo 🤝

¿Te gustaría completar tu compra ahora? 🛒

Si no, entiendo perfectamente y puedes volver cuando quieras 💬`
    ];

    // Seleccionar mensaje según el número de recordatorio
    const messageIndex = Math.min(payment.reminderCount, messages.length - 1);
    return messages[messageIndex];
  }

  /**
   * Obtiene el nombre amigable del método de pago
   */
  private getPaymentMethodName(method: string): string {
    const names: Record<string, string> = {
      'mercadopago': 'MercadoPago',
      'paypal': 'PayPal',
      'nequi': 'Nequi',
      'daviplata': 'Daviplata',
      'consignacion': 'Consignación Bancaria',
      'contraentrega': 'Contraentrega',
    };
    return names[method] || method;
  }

  /**
   * Obtiene todos los pagos pendientes de un usuario
   */
  getPendingPaymentsByUser(userId: string): PendingPayment[] {
    return Array.from(this.pendingPayments.values())
      .filter(p => p.userId === userId);
  }

  /**
   * Obtiene todos los pagos pendientes de un cliente
   */
  getPendingPaymentsByPhone(customerPhone: string): PendingPayment[] {
    return Array.from(this.pendingPayments.values())
      .filter(p => p.customerPhone === customerPhone);
  }

  /**
   * Detiene el servicio de recordatorios
   */
  stop(): void {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
      console.log('[PaymentFollowUp] 🛑 Servicio de recordatorios detenido');
    }
  }
}

// Exportar instancia singleton
export const paymentFollowUpService = PaymentFollowUpService.getInstance();
