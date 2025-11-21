"use strict";
/**
 * Servicio de Verificación por Email
 * Sistema principal de envío de códigos (no depende de WhatsApp)
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
exports.EmailVerificationService = void 0;
const db_1 = require("./db");
class EmailVerificationService {
    /**
     * Generar código de verificación de 6 dígitos
     */
    static generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    /**
     * Enviar código de verificación por email
     */
    static async sendVerificationCode(email, code, name, type = 'registration') {
        try {
            const subject = type === 'registration'
                ? '🔐 Código de Verificación - Smart Sales Bot'
                : '🔐 Recuperación de Contraseña - Smart Sales Bot';
            const html = this.getEmailTemplate(code, name, type);
            // Usar Resend como método principal (más confiable)
            if (process.env.RESEND_API_KEY) {
                return await this.sendWithResend(email, subject, html);
            }
            // Fallback a Gmail OAuth
            if (process.env.GMAIL_USER && process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN) {
                return await this.sendWithGmail(email, subject, html);
            }
            // Fallback a SendGrid
            if (process.env.SENDGRID_API_KEY) {
                return await this.sendWithSendGrid(email, subject, html);
            }
            // Fallback a SMTP (Gmail, etc.)
            if (process.env.EMAIL_HOST) {
                return await this.sendWithSMTP(email, subject, html);
            }
            console.error('❌ No hay servicio de email configurado');
            console.log('💡 Configura RESEND_API_KEY, SENDGRID_API_KEY o EMAIL_HOST en .env');
            // En desarrollo, mostrar el código en consola
            if (process.env.NODE_ENV === 'development') {
                console.log('\n' + '='.repeat(60));
                console.log('📧 CÓDIGO DE VERIFICACIÓN (DESARROLLO)');
                console.log('='.repeat(60));
                console.log(`Email: ${email}`);
                console.log(`Código: ${code}`);
                console.log(`Tipo: ${type}`);
                console.log('='.repeat(60) + '\n');
                return true; // En desarrollo, simular éxito
            }
            return false;
        }
        catch (error) {
            console.error('❌ Error enviando código por email:', error);
            return false;
        }
    }
    /**
     * Enviar con Resend (Recomendado)
     */
    static async sendWithResend(email, subject, html) {
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: process.env.EMAIL_FROM || 'Smart Sales Bot <noreply@smartsalesbot.com>',
                    to: email,
                    subject,
                    html
                })
            });
            if (response.ok) {
                console.log(`✅ Email enviado con Resend a ${email}`);
                return true;
            }
            else {
                const error = await response.text();
                console.error('❌ Error de Resend:', error);
                return false;
            }
        }
        catch (error) {
            console.error('❌ Error con Resend:', error);
            return false;
        }
    }
    /**
     * Enviar con SendGrid
     */
    static async sendWithSendGrid(email, subject, html) {
        try {
            const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    personalizations: [{ to: [{ email }] }],
                    from: { email: process.env.EMAIL_FROM || 'noreply@smartsalesbot.com' },
                    subject,
                    content: [{ type: 'text/html', value: html }]
                })
            });
            if (response.ok) {
                console.log(`✅ Email enviado con SendGrid a ${email}`);
                return true;
            }
            else {
                const error = await response.text();
                console.error('❌ Error de SendGrid:', error);
                return false;
            }
        }
        catch (error) {
            console.error('❌ Error con SendGrid:', error);
            return false;
        }
    }
    /**
     * Enviar con Gmail OAuth (Método principal)
     */
    static async sendWithGmail(email, subject, html) {
        try {
            const nodemailer = await Promise.resolve().then(() => __importStar(require('nodemailer')));
            // Crear transporter con OAuth2
            const transporter = nodemailer.default.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: process.env.GMAIL_USER,
                    clientId: process.env.GMAIL_CLIENT_ID,
                    clientSecret: process.env.GMAIL_CLIENT_SECRET,
                    refreshToken: process.env.GMAIL_REFRESH_TOKEN
                }
            });
            await transporter.sendMail({
                from: `${process.env.BUSINESS_NAME || 'Tecnovariedades D&S'} <${process.env.GMAIL_USER}>`,
                to: email,
                subject,
                html
            });
            console.log(`✅ Email enviado con Gmail OAuth a ${email}`);
            return true;
        }
        catch (error) {
            console.error('❌ Error con Gmail OAuth:', error);
            return false;
        }
    }
    /**
     * Enviar con SMTP (Gmail, etc.)
     */
    static async sendWithSMTP(email, subject, html) {
        try {
            // Usar nodemailer
            const nodemailer = await Promise.resolve().then(() => __importStar(require('nodemailer')));
            const transporter = nodemailer.default.createTransport({
                host: process.env.EMAIL_HOST,
                port: parseInt(process.env.EMAIL_PORT || '587'),
                secure: process.env.EMAIL_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
            await transporter.sendMail({
                from: process.env.EMAIL_FROM || 'Smart Sales Bot <noreply@smartsalesbot.com>',
                to: email,
                subject,
                html
            });
            console.log(`✅ Email enviado con SMTP a ${email}`);
            return true;
        }
        catch (error) {
            console.error('❌ Error con SMTP:', error);
            return false;
        }
    }
    /**
     * Template de email profesional
     */
    static getEmailTemplate(code, name, type) {
        const title = type === 'registration'
            ? 'Verifica tu cuenta'
            : 'Recupera tu contraseña';
        const message = type === 'registration'
            ? 'Gracias por registrarte en Smart Sales Bot Pro. Para completar tu registro, ingresa el siguiente código:'
            : 'Recibimos una solicitud para recuperar tu contraseña. Usa el siguiente código para continuar:';
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🤖 Smart Sales Bot Pro</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    ${name ? `<p style="font-size: 16px; color: #333; margin: 0 0 20px;">Hola ${name},</p>` : ''}
                    
                    <p style="font-size: 16px; color: #666; line-height: 1.6; margin: 0 0 30px;">
                      ${message}
                    </p>
                    
                    <!-- Code Box -->
                    <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 30px; text-align: center; margin: 0 0 30px;">
                      <p style="font-size: 14px; color: #666; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px;">Tu código de verificación</p>
                      <p style="font-size: 36px; font-weight: bold; color: #667eea; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${code}
                      </p>
                    </div>
                    
                    <p style="font-size: 14px; color: #999; line-height: 1.6; margin: 0;">
                      ⏱️ Este código expira en <strong>10 minutos</strong>.<br>
                      🔒 Por seguridad, no compartas este código con nadie.<br>
                      ${type === 'password-reset' ? '❓ Si no solicitaste este código, ignora este mensaje.' : ''}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="font-size: 12px; color: #999; margin: 0;">
                      © ${new Date().getFullYear()} Smart Sales Bot Pro - Tecnovariedades D&S<br>
                      Automatización de Ventas con IA para WhatsApp
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
    }
    /**
     * Guardar código de verificación en la base de datos
     */
    static async saveVerificationCode(userId, code, type = 'email') {
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expira en 10 minutos
        if (type === 'email') {
            await db_1.db.user.update({
                where: { id: userId },
                data: {
                    emailVerificationToken: code
                }
            });
        }
        else {
            await db_1.db.user.update({
                where: { id: userId },
                data: {
                    phoneVerificationCode: code,
                    phoneVerificationExpires: expiresAt
                }
            });
        }
    }
    /**
     * Verificar código
     */
    static async verifyCode(userId, code, type = 'email') {
        try {
            const user = await db_1.db.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                return { success: false, message: 'Usuario no encontrado' };
            }
            const storedCode = type === 'email' ? user.emailVerificationToken : user.phoneVerificationCode;
            const expiresAt = type === 'phone' ? user.phoneVerificationExpires : null;
            if (!storedCode) {
                return { success: false, message: 'No hay código de verificación pendiente' };
            }
            // Verificar expiración
            if (expiresAt && expiresAt < new Date()) {
                return { success: false, message: 'El código ha expirado. Solicita uno nuevo.' };
            }
            // Verificar código
            if (storedCode !== code) {
                return { success: false, message: 'Código incorrecto' };
            }
            // Marcar como verificado
            if (type === 'email') {
                await db_1.db.user.update({
                    where: { id: userId },
                    data: {
                        isEmailVerified: true,
                        emailVerificationToken: null,
                        isActive: true
                    }
                });
            }
            else {
                await db_1.db.user.update({
                    where: { id: userId },
                    data: {
                        isPhoneVerified: true,
                        phoneVerificationCode: null,
                        phoneVerificationExpires: null
                    }
                });
            }
            return { success: true, message: 'Verificación exitosa' };
        }
        catch (error) {
            console.error('Error verificando código:', error);
            return { success: false, message: 'Error al verificar el código' };
        }
    }
}
exports.EmailVerificationService = EmailVerificationService;
