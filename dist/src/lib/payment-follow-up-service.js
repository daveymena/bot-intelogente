"use strict";
/**
 * Servicio de Seguimiento de Pagos
 * Envía recordatorios automáticos cada 30 minutos hasta que el cliente complete el pago
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentFollowUpService = exports.PaymentFollowUpService = void 0;
class PaymentFollowUpService {
    constructor() {
        this.pendingPayments = new Map();
        this.reminderInterval = null;
        this.REMINDER_INTERVAL_MS = 30 * 60 * 1000; // 30 minutos
        this.MAX_REMINDERS = 5; // Máximo 5 recordatorios (2.5 horas)
        this.startReminderService();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new PaymentFollowUpService();
        }
        return this.instance;
    }
    /**
     * Registra un pago pendiente para seguimiento
     */
    async registerPendingPayment(params) {
        const paymentId = `${params.userId}-${params.customerPhone}-${params.productId}-${Date.now()}`;
        const pendingPayment = {
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
    async markPaymentCompleted(paymentId) {
        if (this.pendingPayments.has(paymentId)) {
            this.pendingPayments.delete(paymentId);
            console.log(`[PaymentFollowUp] ✅ Pago completado: ${paymentId}`);
        }
    }
    /**
     * Marca un pago como completado por teléfono y producto
     */
    async markPaymentCompletedByPhone(customerPhone, productId) {
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
    startReminderService() {
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
    async checkPendingPayments() {
        const now = new Date();
        for (const [id, payment] of this.pendingPayments.entries()) {
            // Calcular tiempo desde último recordatorio (o desde creación)
            const lastTime = payment.lastReminderAt || payment.createdAt;
            const timeSinceLastReminder = now.getTime() - lastTime.getTime();
            // Si han pasado 30 minutos y no se ha alcanzado el máximo de recordatorios
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
    async sendReminder(payment) {
        try {
            // Importar dinámicamente para evitar dependencias circulares
            const { BaileysStableService } = await Promise.resolve().then(() => __importStar(require('@/lib/baileys-stable-service')));
            const message = this.generateReminderMessage(payment);
            await BaileysStableService.sendMessage(payment.userId, payment.customerPhone, message);
            console.log(`[PaymentFollowUp] ✅ Recordatorio enviado a ${payment.customerPhone}`);
        }
        catch (error) {
            console.error('[PaymentFollowUp] ❌ Error enviando recordatorio:', error);
        }
    }
    /**
     * Genera el mensaje de recordatorio personalizado
     */
    generateReminderMessage(payment) {
        const timeElapsed = Math.floor((Date.now() - payment.createdAt.getTime()) / (60 * 1000));
        const hours = Math.floor(timeElapsed / 60);
        const minutes = timeElapsed % 60;
        let timeText = '';
        if (hours > 0) {
            timeText = `${hours} hora${hours > 1 ? 's' : ''}`;
            if (minutes > 0) {
                timeText += ` y ${minutes} minutos`;
            }
        }
        else {
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
    getPaymentMethodName(method) {
        const names = {
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
    getPendingPaymentsByUser(userId) {
        return Array.from(this.pendingPayments.values())
            .filter(p => p.userId === userId);
    }
    /**
     * Obtiene todos los pagos pendientes de un cliente
     */
    getPendingPaymentsByPhone(customerPhone) {
        return Array.from(this.pendingPayments.values())
            .filter(p => p.customerPhone === customerPhone);
    }
    /**
     * Detiene el servicio de recordatorios
     */
    stop() {
        if (this.reminderInterval) {
            clearInterval(this.reminderInterval);
            this.reminderInterval = null;
            console.log('[PaymentFollowUp] 🛑 Servicio de recordatorios detenido');
        }
    }
}
exports.PaymentFollowUpService = PaymentFollowUpService;
// Exportar instancia singleton
exports.paymentFollowUpService = PaymentFollowUpService.getInstance();
