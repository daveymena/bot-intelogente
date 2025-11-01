import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './db'
import { EmailService } from './email-service'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

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
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        role: user.role,
        membershipType: user.membershipType,
        membershipEnds: user.membershipEnds || undefined,
        trialEnds: user.trialEnds || undefined
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
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

      console.log('✅ Token decoded:', { id: decoded.id, email: decoded.email })
      const user = await this.getUserById(decoded.id)
      console.log('👤 User fetched:', user ? { id: user.id, email: user.email } : 'null')
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
      throw new Error('User already exists')
    }

    // Validar que tenga teléfono
    if (!data.phone) {
      throw new Error('Phone number is required')
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
        membershipEnds: trialEnds, // Same as trial for now
        isActive: false, // Inactive until phone verified
        isPhoneVerified: false
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

    // Enviar código de verificación por WhatsApp
    try {
      const { WhatsAppVerificationService } = await import('./whatsapp-verification-service')
      const code = WhatsAppVerificationService.generateCode()
      await WhatsAppVerificationService.saveVerificationCode(user.id, code)
      await WhatsAppVerificationService.sendVerificationCode(user.phone, code, user.name || undefined)
    } catch (error) {
      console.error('Error sending verification code:', error)
      // Don't fail registration if WhatsApp fails
    }

    // Generate token (but user can't login until verified)
    const token = this.generateToken(user)

    return { user, token, requiresVerification: true, userId: user.id }
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

  // Resend verification email
  static async resendVerificationEmail(email: string): Promise<boolean> {
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (user.isEmailVerified) {
      throw new Error('Email already verified')
    }

    // Generate new token
    const verificationToken = this.generateVerificationToken()

    await db.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: verificationToken }
    })

    // Send email
    await EmailService.sendVerificationEmail(user.email, verificationToken, user.name || undefined)

    return true
  }

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
      throw new Error('Invalid credentials')
    }

    // VERIFICACIÓN DE EMAIL DESACTIVADA TEMPORALMENTE
    // if (!user.isEmailVerified) {
    //   throw new Error('Email not verified. Please check your inbox.')
    // }

    if (!user.isActive) {
      throw new Error('Account is deactivated')
    }

    const isPasswordValid = await this.verifyPassword(credentials.password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
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
        subscriptions: {
          where: {
            status: 'ACTIVE'
          }
        }
      }
    })

    if (!user) return false

    // Check trial
    if (user.trialEnds && user.trialEnds > new Date()) {
      return true
    }

    // Check active subscription
    if (user.membershipEnds && user.membershipEnds > new Date()) {
      return true
    }

    return user.subscriptions.length > 0
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
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!user) {
      throw new Error('User not found')
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
      await EmailService.sendPasswordResetEmail(user.email, resetToken, user.name || undefined)
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
}