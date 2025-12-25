import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './db'
import { EmailService } from './email-service'
import crypto from 'crypto'

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '30d' // 30 días para mayor persistencia

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  role: string
  membershipType: string
  membershipEnds?: Date | null
  trialEnds?: Date | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name?: string
  phone?: string
  businessName?: string
}

export class AuthService {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  // Generate JWT token
  static generateToken(user: AuthUser): string {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role,
      membershipType: user.membershipType,
      membershipEnds: user.membershipEnds?.toISOString(),
      trialEnds: user.trialEnds?.toISOString()
    }
    
    // @ts-ignore - JWT types issue with expiresIn
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  }

  // Verify JWT token
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return null
    }
  }

  // Get user from token
  static async getUserFromToken(token: string): Promise<any> {
    try {
      const decoded = this.verifyToken(token)
      if (!decoded) {
        console.log('❌ Token verification failed')
        return null
      }

      // console.log('✅ Token decoded:', { id: decoded.id, email: decoded.email })
      const user = await this.getUserById(decoded.id)
      // console.log('👤 User fetched:', user ? { id: user.id, email: user.email } : 'null')
      return user
    } catch (error) {
      console.error('❌ Error in getUserFromToken:', error)
      return null
    }
  }

  // Check subscription
  static async checkSubscription(userId: string): Promise<{ hasAccess: boolean; type?: string; status?: string }> {
    const status = await this.getSubscriptionStatus(userId)

    return {
      hasAccess: status.status === 'ACTIVE',
      type: status.type,
      status: status.status
    }
  }

  // Generate verification token
  static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  // Register new user
  static async register(data: RegisterData): Promise<{ user: any; token: string; requiresVerification: boolean; userId: string }> {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      throw new Error('El usuario ya existe')
    }

    // Validar que tenga teléfono
    if (!data.phone) {
      throw new Error('El número de teléfono es requerido')
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password)

    // Create user with 10-day trial (activates when phone is verified)
    const trialEnds = new Date()
    trialEnds.setDate(trialEnds.getDate() + 10)

    const user = await db.user.create({
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
    })

    // Create subscription record
    await db.subscription.create({
      data: {
        userId: user.id,
        status: 'TRIAL',
        trialStart: new Date(),
        trialEnd: trialEnds
      }
    })

    // Create default bot settings
    await db.botSettings.create({
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
    })

    // Create default AI prompts
    const defaultPrompts = [
      {
        name: 'Bienvenida',
        prompt: '¡Hola! 😊 Bienvenido a mi negocio. Soy tu asistente virtual y estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?',
        type: 'WELCOME' as const,
        isActive: true
      },
      {
        name: 'Información de Producto',
        prompt: 'Aquí tienes la información del producto: {product_name} - Precio: {price}. ¿Te gustaría saber más?',
        type: 'PRODUCT_INFO' as const,
        isActive: true
      },
      {
        name: 'Precios',
        prompt: 'El precio es {price}. Aceptamos múltiples métodos de pago. ¿Te interesa?',
        type: 'PRICING' as const,
        isActive: true
      },
      {
        name: 'Soporte',
        prompt: 'Entiendo tu consulta. Estoy aquí para ayudarte. ¿Qué necesitas saber?',
        type: 'SUPPORT' as const,
        isActive: true
      },
      {
        name: 'Cierre',
        prompt: '¡Gracias por contactarnos! 🎉 Espero haberte sido de ayuda. ¡Vuelve pronto!',
        type: 'CLOSING' as const,
        isActive: true
      }
    ]

    for (const promptData of defaultPrompts) {
      await db.aIPrompt.create({
        data: {
          ...promptData,
          userId: user.id
        }
      })
    }

    // Crear configuración de pagos por defecto
    await db.paymentConfig.create({
      data: {
        userId: user.id,
        // Los valores por defecto ya están en el schema
        // El usuario podrá configurarlos desde el dashboard
      }
    })

    // Temporalmente desactivado: envío de código de verificación
    // Los usuarios se registran directamente sin verificación
    console.log('✅ Usuario registrado sin verificación (temporal)')

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
    const token = this.generateToken(user)

    return { user, token, requiresVerification: false, userId: user.id }
  }

  // Verify email
  static async verifyEmail(token: string): Promise<{ success: boolean; user?: any }> {
    const user = await db.user.findFirst({
      where: { emailVerificationToken: token }
    })

    if (!user) {
      throw new Error('Invalid verification token')
    }

    // Update user as verified and active
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        isActive: true,
        emailVerificationToken: null
      }
    })

    // Send welcome email
    try {
      await EmailService.sendWelcomeEmail(updatedUser.email, updatedUser.name || undefined)
    } catch (error) {
      console.error('Error sending welcome email:', error)
    }

    return { success: true, user: updatedUser }
  }

  // Resend verification email - Ver implementación más abajo con código de 6 dígitos

  // Login user
  static async login(credentials: LoginCredentials): Promise<{ user: any; token: string }> {
    const user = await db.user.findUnique({
      where: { email: credentials.email },
      include: {
        subscriptions: true,
        settings: true
      }
    })

    if (!user) {
      throw new Error('Credenciales inválidas')
    }

    // Temporalmente desactivado: verificar si el email está verificado
    // if (!user.isEmailVerified) {
    //   throw new Error('EMAIL_NOT_VERIFIED')
    // }

    if (!user.isActive) {
      throw new Error('La cuenta está desactivada')
    }

    const isPasswordValid = await this.verifyPassword(credentials.password, user.password)
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas')
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Send login notification (optional, can be disabled)
    if (process.env.SEND_LOGIN_NOTIFICATIONS === 'true') {
      try {
        await EmailService.sendLoginNotification(user.email, user.name || undefined)
      } catch (error) {
        console.error('Error sending login notification:', error)
      }
    }

    // Generate token
    const token = this.generateToken(user)

    return { user, token }
  }

  // Get user by ID
  static async getUserById(id: string): Promise<any> {
    return db.user.findUnique({
      where: { id },
      include: {
        subscriptions: true,
        settings: true,
        whatsappConnection: true
      }
    })
  }

  // Check if user has active subscription
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: true
      }
    })

    if (!user) return false

    // 👑 ACCESO PERMANENTE PARA EL DUEÑO
    if (user.email === 'daveymena16@gmail.com') {
      return true
    }

    // Check trial
    if (user.trialEnds && user.trialEnds > new Date()) {
      return true
    }

    // Check active subscription
    if (user.membershipEnds && user.membershipEnds > new Date()) {
      return true
    }

    return (user.subscriptions as any)?.status === 'ACTIVE'
  }

  // Get subscription status
  static async getSubscriptionStatus(userId: string): Promise<{
    type: string
    status: string
    endsAt?: Date
    isTrial: boolean
    daysLeft?: number
  }> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: true
      }
    })

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    // 👑 ACCESO PERMANENTE PARA EL DUEÑO
    if (user.email === 'daveymena16@gmail.com') {
      return {
        type: 'ENTERPRISE',
        status: 'ACTIVE',
        endsAt: new Date('2099-12-31'), // Fecha muy lejana
        isTrial: false,
        daysLeft: 99999
      }
    }

    const now = new Date()

    // Check trial
    if (user.trialEnds && user.trialEnds > now) {
      const daysLeft = Math.ceil((user.trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return {
        type: 'TRIAL',
        status: 'ACTIVE',
        endsAt: user.trialEnds,
        isTrial: true,
        daysLeft
      }
    }

    // Check paid subscription
    if (user.membershipEnds && user.membershipEnds > now) {
      const daysLeft = Math.ceil((user.membershipEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return {
        type: user.membershipType,
        status: 'ACTIVE',
        endsAt: user.membershipEnds,
        isTrial: false,
        daysLeft
      }
    }

    return {
      type: user.membershipType,
      status: 'EXPIRED',
      isTrial: false
    }
  }

  // Create session
  static async createSession(userId: string): Promise<string> {
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })

    await db.session.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    })

    return token
  }

  // Validate session
  static async validateSession(token: string): Promise<any> {
    const session = await db.session.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!session || session.expiresAt < new Date()) {
      return null
    }

    return session.user
  }

  // Logout user
  static async logout(token: string): Promise<void> {
    await db.session.delete({
      where: { token }
    })
  }

  // Request password reset
  static async requestPasswordReset(email: string): Promise<string> {
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const resetToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' })
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      }
    })

    // Send password reset email
    try {
      await EmailService.sendPasswordResetEmail({
        to: user.email,
        userName: user.name || 'Usuario',
        resetUrl: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
      })
    } catch (error) {
      console.error('Error sending password reset email:', error)
      throw new Error('Failed to send password reset email')
    }

    return resetToken
  }

  // Reset password
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const user = await db.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || !user.passwordResetToken || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new Error('Invalid or expired reset token')
    }

    const hashedPassword = await this.hashPassword(newPassword)

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    })
  }

  // Resend verification email with 6-digit code
  static async resendVerificationEmail(email: string): Promise<void> {
    // Find user
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    // Check if already verified
    if (user.isEmailVerified) {
      throw new Error('Este email ya está verificado')
    }

    // Generate new 6-digit code
    const { EmailVerificationService } = await import('./email-verification-service')
    const code = EmailVerificationService.generateCode()

    // Save code to database (replaces any existing code)
    await EmailVerificationService.saveVerificationCode(user.id, code, 'email')

    // Send code by email
    const emailSent = await EmailVerificationService.sendVerificationCode(
      user.email,
      code,
      user.name || undefined,
      'registration'
    )

    if (!emailSent) {
      throw new Error('Error al enviar el código de verificación')
    }

    console.log(`✅ Código de verificación reenviado a: ${user.email}`)
  }
}


/**
 * Verificar autenticación desde request
 * Función helper para API routes
 */
export async function verifyAuth(request: Request | NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const user = await AuthService.verifyToken(token)
    return user
  } catch (error) {
    console.error('Error verifying auth:', error)
    return null
  }
}

// Importar NextRequest si no está importado
import type { NextRequest } from 'next/server'
