"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppVerificationService = void 0;
const whatsapp_web_service_1 = require("./whatsapp-web-service");
const db_1 = require("./db");
/**
 * Servicio de Verificación por WhatsApp
 * Genera y envía códigos de verificación de 6 dígitos
 */
class WhatsAppVerificationService {
    /**
     * Generar código de verificación de 6 dígitos
     */
    static generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    /**
     * Enviar código de verificación por WhatsApp
     */
    static async sendVerificationCode(phone, code, name, userId) {
        try {
            // Obtener conexión activa de WhatsApp
            // Si no hay userId, buscar la primera conexión activa
            let activeUserId = userId;
            if (!activeUserId) {
                const activeConnection = await db_1.db.whatsAppConnection.findFirst({
                    where: { status: 'CONNECTED' },
                    orderBy: { createdAt: 'desc' }
                });
                if (!activeConnection) {
                    console.error('❌ No hay conexión activa de WhatsApp');
                    return false;
                }
                activeUserId = activeConnection.userId;
            }
            // Formatear número de teléfono (asegurar que tenga formato internacional)
            let formattedPhone = phone.replace(/\D/g, ''); // Quitar todo excepto números
            // Si no empieza con código de país, asumir Colombia (+57)
            if (!formattedPhone.startsWith('57') && formattedPhone.length === 10) {
                formattedPhone = '57' + formattedPhone;
            }
            const whatsappNumber = `${formattedPhone}@s.whatsapp.net`;
            // Mensaje de verificación
            const message = `🔐 *Código de Verificación*\n\n${name ? `Hola ${name},\n\n` : ''}Tu código de verificación es:\n\n*${code}*\n\nEste código expira en 5 minutos.\n\n_No compartas este código con nadie._\n\n_Tecnovariedades D&S_`;
            // Enviar mensaje por WhatsApp usando el userId correcto
            const sent = await whatsapp_web_service_1.WhatsAppWebService.sendMessage(activeUserId, whatsappNumber, message);
            if (sent) {
                console.log(`✅ Código de verificación enviado a ${phone}`);
                return true;
            }
            else {
                console.error(`❌ No se pudo enviar código a ${phone}`);
                return false;
            }
        }
        catch (error) {
            console.error('❌ Error enviando código de verificación:', error);
            return false;
        }
    }
    /**
     * Guardar código de verificación en la base de datos
     */
    static async saveVerificationCode(userId, code) {
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5); // Expira en 5 minutos
        await db_1.db.user.update({
            where: { id: userId },
            data: {
                phoneVerificationCode: code,
                phoneVerificationExpires: expiresAt,
                isPhoneVerified: false
            }
        });
    }
    /**
     * Verificar código ingresado por el usuario
     */
    static async verifyCode(userId, code) {
        try {
            const user = await db_1.db.user.findUnique({
                where: { id: userId },
                select: {
                    phoneVerificationCode: true,
                    phoneVerificationExpires: true,
                    isPhoneVerified: true
                }
            });
            if (!user) {
                return { success: false, message: 'Usuario no encontrado' };
            }
            if (user.isPhoneVerified) {
                return { success: true, message: 'Teléfono ya verificado' };
            }
            if (!user.phoneVerificationCode) {
                return { success: false, message: 'No hay código de verificación pendiente' };
            }
            // Verificar si el código expiró
            if (user.phoneVerificationExpires && user.phoneVerificationExpires < new Date()) {
                return { success: false, message: 'El código ha expirado. Solicita uno nuevo.' };
            }
            // Verificar si el código coincide
            if (user.phoneVerificationCode !== code) {
                return { success: false, message: 'Código incorrecto' };
            }
            // Marcar teléfono como verificado
            await db_1.db.user.update({
                where: { id: userId },
                data: {
                    isPhoneVerified: true,
                    phoneVerificationCode: null,
                    phoneVerificationExpires: null
                }
            });
            return { success: true, message: 'Teléfono verificado exitosamente' };
        }
        catch (error) {
            console.error('Error verificando código:', error);
            return { success: false, message: 'Error al verificar el código' };
        }
    }
    /**
     * Reenviar código de verificación
     */
    static async resendCode(userId) {
        try {
            const user = await db_1.db.user.findUnique({
                where: { id: userId },
                select: {
                    phone: true,
                    name: true,
                    isPhoneVerified: true
                }
            });
            if (!user) {
                return { success: false, message: 'Usuario no encontrado' };
            }
            if (user.isPhoneVerified) {
                return { success: false, message: 'Teléfono ya verificado' };
            }
            if (!user.phone) {
                return { success: false, message: 'No hay número de teléfono registrado' };
            }
            // Generar nuevo código
            const code = this.generateCode();
            // Guardar en BD
            await this.saveVerificationCode(userId, code);
            // Enviar por WhatsApp
            const sent = await this.sendVerificationCode(user.phone, code, user.name || undefined);
            if (!sent) {
                return { success: false, message: 'Error al enviar el código' };
            }
            return { success: true, message: 'Código reenviado exitosamente' };
        }
        catch (error) {
            console.error('Error reenviando código:', error);
            return { success: false, message: 'Error al reenviar el código' };
        }
    }
}
exports.WhatsAppVerificationService = WhatsAppVerificationService;
