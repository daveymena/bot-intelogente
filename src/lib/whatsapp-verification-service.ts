import { BaileysService } from './baileys-service'
import { db } from './db'

/**
 * Servicio de Verificación por WhatsApp
 * Genera y envía códigos de verificación de 6 dígitos
 */
export class WhatsAppVerificationService {
  /**
   * Generar código de verificación de 6 dígitos
   */
  static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  /**
   * Enviar código de verificación por WhatsApp
   */
  static async sendVerificationCode(phone: string, code: string, name?: string): Promise<boolean> {
    try {
      // Formatear número de teléfono (asegurar que tenga formato internacional)
      const formattedPhone = phone.startsWith('+') ? phone.slice(1) : phone
      const whatsappNumber = `${formattedPhone}@s.whatsapp.net`

      // Mensaje de verificación
      const message = `🔐 *Código de Verificación*\n\n${name ? `Hola ${name},\n\n` : ''}Tu código de verificación es:\n\n*${code}*\n\nEste código expira en 5 minutos.\n\n_No compartas este código con nadie._`

      // Enviar mensaje por WhatsApp
      await BaileysService.sendMessage(whatsappNumber, message)

      console.log(`✅ Código de verificación enviado a ${phone}`)
      return true
    } catch (error) {
      console.error('❌ Error enviando código de verificación:', error)
      return false
    }
  }

  /**
   * Guardar código de verificación en la base de datos
   */
  static async saveVerificationCode(userId: string, code: string): Promise<void> {
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 5) // Expira en 5 minutos

    await db.user.update({
      where: { id: userId },
      data: {
        phoneVerificationCode: code,
        phoneVerificationExpires: expiresAt,
        isPhoneVerified: false
      }
    })
  }

  /**
   * Verificar código ingresado por el usuario
   */
  static async verifyCode(userId: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          phoneVerificationCode: true,
          phoneVerificationExpires: true,
          isPhoneVerified: true
        }
      })

      if (!user) {
        return { success: false, message: 'Usuario no encontrado' }
      }

      if (user.isPhoneVerified) {
        return { success: true, message: 'Teléfono ya verificado' }
      }

      if (!user.phoneVerificationCode) {
        return { success: false, message: 'No hay código de verificación pendiente' }
      }

      // Verificar si el código expiró
      if (user.phoneVerificationExpires && user.phoneVerificationExpires < new Date()) {
        return { success: false, message: 'El código ha expirado. Solicita uno nuevo.' }
      }

      // Verificar si el código coincide
      if (user.phoneVerificationCode !== code) {
        return { success: false, message: 'Código incorrecto' }
      }

      // Marcar teléfono como verificado
      await db.user.update({
        where: { id: userId },
        data: {
          isPhoneVerified: true,
          phoneVerificationCode: null,
          phoneVerificationExpires: null
        }
      })

      return { success: true, message: 'Teléfono verificado exitosamente' }
    } catch (error) {
      console.error('Error verificando código:', error)
      return { success: false, message: 'Error al verificar el código' }
    }
  }

  /**
   * Reenviar código de verificación
   */
  static async resendCode(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          phone: true,
          name: true,
          isPhoneVerified: true
        }
      })

      if (!user) {
        return { success: false, message: 'Usuario no encontrado' }
      }

      if (user.isPhoneVerified) {
        return { success: false, message: 'Teléfono ya verificado' }
      }

      if (!user.phone) {
        return { success: false, message: 'No hay número de teléfono registrado' }
      }

      // Generar nuevo código
      const code = this.generateCode()

      // Guardar en BD
      await this.saveVerificationCode(userId, code)

      // Enviar por WhatsApp
      const sent = await this.sendVerificationCode(user.phone, code, user.name || undefined)

      if (!sent) {
        return { success: false, message: 'Error al enviar el código' }
      }

      return { success: true, message: 'Código reenviado exitosamente' }
    } catch (error) {
      console.error('Error reenviando código:', error)
      return { success: false, message: 'Error al reenviar el código' }
    }
  }
}
