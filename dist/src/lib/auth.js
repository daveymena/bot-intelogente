"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
const email_service_1 = require("./email-service");
const crypto_1 = __importDefault(require("crypto"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d'; // 30 días para mayor persistencia
class AuthService {
    // Hash password
    static async hashPassword(password) {
        return bcryptjs_1.default.hash(password, 12);
    }
    // Verify password
    static async verifyPassword(password, hashedPassword) {
        return bcryptjs_1.default.compare(password, hashedPassword);
    }
    // Generate JWT token
    static generateToken(user) {
        return jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            name: user.name || undefined,
            role: user.role,
            membershipType: user.membershipType,
            membershipEnds: user.membershipEnds || undefined,
            trialEnds: user.trialEnds || undefined
        }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }
    // Verify JWT token
    static verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (error) {
            return null;
        }
    }
    // Get user from token
    static async getUserFromToken(token) {
        try {
            const decoded = this.verifyToken(token);
            if (!decoded) {
                console.log('❌ Token verification failed');
                return null;
            }
            // console.log('✅ Token decoded:', { id: decoded.id, email: decoded.email })
            const user = await this.getUserById(decoded.id);
            // console.log('👤 User fetched:', user ? { id: user.id, email: user.email } : 'null')
            return user;
        }
        catch (error) {
            console.error('❌ Error in getUserFromToken:', error);
            return null;
        }
    }
    // Check subscription
    static async checkSubscription(userId) {
        const status = await this.getSubscriptionStatus(userId);
        return {
            hasAccess: status.status === 'ACTIVE',
            type: status.type,
            status: status.status
        };
    }
    // Generate verification token
    static generateVerificationToken() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    // Register new user
    static async register(data) {
        // Check if user already exists
        const existingUser = await db_1.db.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) {
            throw new Error('User already exists');
        }
        // Validar que tenga teléfono
        if (!data.phone) {
            throw new Error('Phone number is required');
        }
        // Hash password
        const hashedPassword = await this.hashPassword(data.password);
        // Create user with 10-day trial (activates when phone is verified)
        const trialEnds = new Date();
        trialEnds.setDate(trialEnds.getDate() + 10);
        const user = await db_1.db.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                phone: data.phone,
                businessName: data.businessName,
                membershipType: 'TRIAL',
                trialEnds,
                membershipEnds: trialEnds,
                isActive: true, // ✅ Usuario activo inmediatamente (sin verificación por ahora)
                isPhoneVerified: false, // ❌ Teléfono sin verificar
                isEmailVerified: true // ✅ Email verificado automáticamente (temporal)
            }
        });
        // Create subscription record
        await db_1.db.subscription.create({
            data: {
                userId: user.id,
                status: 'TRIAL',
                trialStart: new Date(),
                trialEnd: trialEnds
            }
        });
        // Create default bot settings
        await db_1.db.botSettings.create({
            data: {
                userId: user.id,
                businessName: data.businessName || 'Mi Negocio',
                businessPhone: data.phone || '+57 300 000 0000',
                responseDelay: 2,
                autoResponseEnabled: true,
                smartWaitingEnabled: true,
                maxTokens: 500,
                temperature: 0.7
            }
        });
        // Create default AI prompts
        const defaultPrompts = [
            {
                name: 'Bienvenida',
                prompt: '¡Hola! 😊 Bienvenido a mi negocio. Soy tu asistente virtual y estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?',
                type: 'WELCOME',
                isActive: true
            },
            {
                name: 'Información de Producto',
                prompt: 'Aquí tienes la información del producto: {product_name} - Precio: {price}. ¿Te gustaría saber más?',
                type: 'PRODUCT_INFO',
                isActive: true
            },
            {
                name: 'Precios',
                prompt: 'El precio es {price}. Aceptamos múltiples métodos de pago. ¿Te interesa?',
                type: 'PRICING',
                isActive: true
            },
            {
                name: 'Soporte',
                prompt: 'Entiendo tu consulta. Estoy aquí para ayudarte. ¿Qué necesitas saber?',
                type: 'SUPPORT',
                isActive: true
            },
            {
                name: 'Cierre',
                prompt: '¡Gracias por contactarnos! 🎉 Espero haberte sido de ayuda. ¡Vuelve pronto!',
                type: 'CLOSING',
                isActive: true
            }
        ];
        for (const promptData of defaultPrompts) {
            await db_1.db.aIPrompt.create({
                data: {
                    ...promptData,
                    userId: user.id
                }
            });
        }
        // Crear configuración de pagos por defecto
        await db_1.db.paymentConfig.create({
            data: {
                userId: user.id,
                // Los valores por defecto ya están en el schema
                // El usuario podrá configurarlos desde el dashboard
            }
        });
        // Temporalmente desactivado: envío de código de verificación
        // Los usuarios se registran directamente sin verificación
        console.log('✅ Usuario registrado sin verificación (temporal)');
        // TODO: Reactivar cuando se configure dominio propio en Resend
        /*
        try {
          const { EmailVerificationService } = await import('./email-verification-service')
          const code = EmailVerificationService.generateCode()
          await EmailVerificationService.saveVerificationCode(user.id, code, 'email')
    
          const emailSent = await EmailVerificationService.sendVerificationCode(
            user.email,
            code,
            user.name || undefined,
            'registration'
          )
    
          console.log(emailSent ? '✅ Código enviado por email' : '⚠️ Error enviando email')
    
          if (user.phone) {
            try {
              const { WhatsAppVerificationService } = await import('./whatsapp-verification-service')
              await WhatsAppVerificationService.saveVerificationCode(user.id, code)
              await WhatsAppVerificationService.sendVerificationCode(user.phone, code, user.name || undefined)
              console.log('✅ Código también enviado por WhatsApp')
            } catch (whatsappError) {
              console.log('⚠️ WhatsApp no disponible, pero email enviado')
            }
          }
        } catch (error) {
          console.error('Error sending verification code:', error)
        }
        */
        // Generate token (but user can't login until verified)
        const token = this.generateToken(user);
        return { user, token, requiresVerification: false, userId: user.id };
    }
    // Verify email
    static async verifyEmail(token) {
        const user = await db_1.db.user.findFirst({
            where: { emailVerificationToken: token }
        });
        if (!user) {
            throw new Error('Invalid verification token');
        }
        // Update user as verified and active
        const updatedUser = await db_1.db.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                isActive: true,
                emailVerificationToken: null
            }
        });
        // Send welcome email
        try {
            await email_service_1.EmailService.sendWelcomeEmail(updatedUser.email, updatedUser.name || undefined);
        }
        catch (error) {
            console.error('Error sending welcome email:', error);
        }
        return { success: true, user: updatedUser };
    }
    // Resend verification email
    static async resendVerificationEmail(email) {
        const user = await db_1.db.user.findUnique({
            where: { email }
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.isEmailVerified) {
            throw new Error('Email already verified');
        }
        // Generate new token
        const verificationToken = this.generateVerificationToken();
        await db_1.db.user.update({
            where: { id: user.id },
            data: { emailVerificationToken: verificationToken }
        });
        // Send email
        await email_service_1.EmailService.sendVerificationEmail(user.email, verificationToken, user.name || undefined);
        return true;
    }
    // Login user
    static async login(credentials) {
        const user = await db_1.db.user.findUnique({
            where: { email: credentials.email },
            include: {
                subscriptions: true,
                settings: true
            }
        });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        // Temporalmente desactivado: verificar si el email está verificado
        // if (!user.isEmailVerified) {
        //   throw new Error('EMAIL_NOT_VERIFIED')
        // }
        if (!user.isActive) {
            throw new Error('Account is deactivated');
        }
        const isPasswordValid = await this.verifyPassword(credentials.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }
        // Update last login
        await db_1.db.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        });
        // Send login notification (optional, can be disabled)
        if (process.env.SEND_LOGIN_NOTIFICATIONS === 'true') {
            try {
                await email_service_1.EmailService.sendLoginNotification(user.email, user.name || undefined);
            }
            catch (error) {
                console.error('Error sending login notification:', error);
            }
        }
        // Generate token
        const token = this.generateToken(user);
        return { user, token };
    }
    // Get user by ID
    static async getUserById(id) {
        return db_1.db.user.findUnique({
            where: { id },
            include: {
                subscriptions: true,
                settings: true,
                whatsappConnection: true
            }
        });
    }
    // Check if user has active subscription
    static async hasActiveSubscription(userId) {
        const user = await db_1.db.user.findUnique({
            where: { id: userId },
            include: {
                subscriptions: {
                    where: {
                        status: 'ACTIVE'
                    }
                }
            }
        });
        if (!user)
            return false;
        // Check trial
        if (user.trialEnds && user.trialEnds > new Date()) {
            return true;
        }
        // Check active subscription
        if (user.membershipEnds && user.membershipEnds > new Date()) {
            return true;
        }
        return user.subscriptions.length > 0;
    }
    // Get subscription status
    static async getSubscriptionStatus(userId) {
        const user = await db_1.db.user.findUnique({
            where: { id: userId },
            include: {
                subscriptions: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });
        if (!user) {
            throw new Error('User not found');
        }
        const now = new Date();
        // Check trial
        if (user.trialEnds && user.trialEnds > now) {
            const daysLeft = Math.ceil((user.trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return {
                type: 'TRIAL',
                status: 'ACTIVE',
                endsAt: user.trialEnds,
                isTrial: true,
                daysLeft
            };
        }
        // Check paid subscription
        if (user.membershipEnds && user.membershipEnds > now) {
            const daysLeft = Math.ceil((user.membershipEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return {
                type: user.membershipType,
                status: 'ACTIVE',
                endsAt: user.membershipEnds,
                isTrial: false,
                daysLeft
            };
        }
        return {
            type: user.membershipType,
            status: 'EXPIRED',
            isTrial: false
        };
    }
    // Create session
    static async createSession(userId) {
        const token = jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
        await db_1.db.session.create({
            data: {
                userId,
                token,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
        });
        return token;
    }
    // Validate session
    static async validateSession(token) {
        const session = await db_1.db.session.findUnique({
            where: { token },
            include: { user: true }
        });
        if (!session || session.expiresAt < new Date()) {
            return null;
        }
        return session.user;
    }
    // Logout user
    static async logout(token) {
        await db_1.db.session.delete({
            where: { token }
        });
    }
    // Request password reset
    static async requestPasswordReset(email) {
        const user = await db_1.db.user.findUnique({
            where: { email }
        });
        if (!user) {
            throw new Error('User not found');
        }
        const resetToken = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await db_1.db.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: resetToken,
                passwordResetExpires: resetExpires
            }
        });
        // Send password reset email
        try {
            await email_service_1.EmailService.sendPasswordResetEmail(user.email, resetToken, user.name || undefined);
        }
        catch (error) {
            console.error('Error sending password reset email:', error);
            throw new Error('Failed to send password reset email');
        }
        return resetToken;
    }
    // Reset password
    static async resetPassword(token, newPassword) {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await db_1.db.user.findUnique({
            where: { id: decoded.userId }
        });
        if (!user || !user.passwordResetToken || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
            throw new Error('Invalid or expired reset token');
        }
        const hashedPassword = await this.hashPassword(newPassword);
        await db_1.db.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null
            }
        });
    }
    // Resend verification email with 6-digit code
    static async resendVerificationEmail(email) {
        // Find user
        const user = await db_1.db.user.findUnique({
            where: { email }
        });
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        // Check if already verified
        if (user.isEmailVerified) {
            throw new Error('Este email ya está verificado');
        }
        // Generate new 6-digit code
        const { EmailVerificationService } = await Promise.resolve().then(() => __importStar(require('./email-verification-service')));
        const code = EmailVerificationService.generateCode();
        // Save code to database (replaces any existing code)
        await EmailVerificationService.saveVerificationCode(user.id, code, 'email');
        // Send code by email
        const emailSent = await EmailVerificationService.sendVerificationCode(user.email, code, user.name || undefined, 'resend');
        if (!emailSent) {
            throw new Error('Error al enviar el código de verificación');
        }
        console.log(`✅ Código de verificación reenviado a: ${user.email}`);
    }
}
exports.AuthService = AuthService;
