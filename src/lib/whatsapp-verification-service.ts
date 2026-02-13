/**
 * 📱 WHATSAPP VERIFICATION SERVICE
 * Servicio para verificación de números de teléfono vía WhatsApp
 */

import { db } from './db'

interface VerificationResult {
  success: boolean
  message: string
  phoneNumber?: string
}

export class WhatsAppVerificationService {
  private static verificationCodes = new Map<string, { code: string; expiresAt: Date; phoneNumber: string }>()

  /**
   * Generate and send verification code
   */
  static async sendVerificationCode(userId: string, phoneNumber: string): Promise<VerificationResult> {
    try {
      // Generate 6-digit code
      const code = this.generateCode()
      
      // Store code with expiration (10 minutes)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
      this.verificationCodes.set(userId, { code, expiresAt, phoneNumber })

      // In production, send via WhatsApp API
      // For now, just log it (you'll need to integrate with Baileys)
      console.log(`Verification code for ${phoneNumber}: ${code}`)

      // TODO: Integrate with Baileys to send actual WhatsApp message
      // await this.sendWhatsAppMessage(phoneNumber, `Tu código de verificación es: ${code}`)

      return {
        success: true,
        message: 'Código de verificación enviado',
        phoneNumber
      }
    } catch (error) {
      console.error('Error sending verification code:', error)
      return {
        success: false,
        message: 'Error al enviar código de verificación'
      }
    }
  }

  /**
   * Verify code entered by user
   */
  static async verifyCode(userId: string, code: string): Promise<VerificationResult> {
    try {
      const stored = this.verificationCodes.get(userId)

      if (!stored) {
        return {
          success: false,
          message: 'No se encontró código de verificación. Solicita uno nuevo.'
        }
      }

      // Check if code expired
      if (new Date() > stored.expiresAt) {
        this.verificationCodes.delete(userId)
        return {
          success: false,
          message: 'El código ha expirado. Solicita uno nuevo.'
        }
      }

      // Verify code
      if (stored.code !== code) {
        return {
          success: false,
          message: 'Código incorrecto. Intenta de nuevo.'
        }
      }

      // Code is valid - update user's phone verification status
      await db.user.update({
        where: { id: userId },
        data: { 
          phoneVerified: true,
          phone: stored.phoneNumber
        }
      })

      // Clean up
      this.verificationCodes.delete(userId)

      return {
        success: true,
        message: 'Teléfono verificado exitosamente',
        phoneNumber: stored.phoneNumber
      }
    } catch (error) {
      console.error('Error verifying code:', error)
      return {
        success: false,
        message: 'Error al verificar código'
      }
    }
  }

  /**
   * Resend verification code
   */
  static async resendCode(userId: string): Promise<VerificationResult> {
    try {
      const stored = this.verificationCodes.get(userId)

      if (!stored) {
        return {
          success: false,
          message: 'No hay código pendiente. Solicita uno nuevo.'
        }
      }

      // Resend the same code with new expiration
      return await this.sendVerificationCode(userId, stored.phoneNumber)
    } catch (error) {
      console.error('Error resending code:', error)
      return {
        success: false,
        message: 'Error al reenviar código'
      }
    }
  }

  /**
   * Check if phone number is already verified
   */
  static async isPhoneVerified(userId: string): Promise<boolean> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { phoneVerified: true }
      })

      return user?.phoneVerified || false
    } catch (error) {
      console.error('Error checking phone verification:', error)
      return false
    }
  }

  /**
   * Generate 6-digit verification code
   */
  private static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  /**
   * Send WhatsApp message (to be implemented with Baileys)
   */
  private static async sendWhatsAppMessage(phoneNumber: string, message: string): Promise<void> {
    // TODO: Implement actual WhatsApp sending using Baileys
    // This is a placeholder for the integration
    console.log(`Sending to ${phoneNumber}: ${message}`)
  }

  /**
   * Clean up expired codes (call periodically)
   */
  static cleanupExpiredCodes(): void {
    const now = new Date()
    for (const [userId, data] of this.verificationCodes.entries()) {
      if (now > data.expiresAt) {
        this.verificationCodes.delete(userId)
      }
    }
  }
}

// Clean up expired codes every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    WhatsAppVerificationService.cleanupExpiredCodes()
  }, 5 * 60 * 1000)
}
