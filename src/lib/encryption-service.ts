/**
 * 🔐 Servicio de Encriptación para API Keys y Datos Sensibles
 * 
 * Usa AES-256-GCM para encriptación segura de credenciales de pago
 * y otros datos sensibles almacenados en la base de datos.
 */

import crypto from 'crypto'

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm'
  private static readonly IV_LENGTH = 16
  private static readonly AUTH_TAG_LENGTH = 16
  
  /**
   * Obtiene la clave de encriptación desde variables de entorno
   * Si no existe, genera una advertencia (solo en desarrollo)
   */
  private static getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY
    
    if (!key) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('ENCRYPTION_KEY no está configurada en producción')
      }
      
      // En desarrollo, usar una clave temporal (NO SEGURO PARA PRODUCCIÓN)
      console.warn('⚠️ ADVERTENCIA: Usando clave de encriptación temporal. Configura ENCRYPTION_KEY en .env')
      return crypto.scryptSync('temporary-dev-key-not-secure', 'salt', 32)
    }
    
    // Convertir hex string a Buffer
    return Buffer.from(key, 'hex')
  }
  
  /**
   * Encripta un texto usando AES-256-GCM
   * 
   * @param text - Texto a encriptar
   * @returns String en formato: iv:authTag:encryptedData (todo en hex)
   */
  static encrypt(text: string): string {
    if (!text) return ''
    
    try {
      const key = this.getEncryptionKey()
      const iv = crypto.randomBytes(this.IV_LENGTH)
      
      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv)
      
      let encrypted = cipher.update(text, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      const authTag = cipher.getAuthTag()
      
      // Formato: iv:authTag:encryptedData
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
    } catch (error) {
      console.error('[Encryption] Error encriptando:', error)
      throw new Error('Error al encriptar datos sensibles')
    }
  }
  
  /**
   * Desencripta un texto encriptado con encrypt()
   * 
   * @param encryptedData - String en formato iv:authTag:encryptedData
   * @returns Texto desencriptado
   */
  static decrypt(encryptedData: string): string {
    if (!encryptedData) return ''
    
    try {
      const key = this.getEncryptionKey()
      const parts = encryptedData.split(':')
      
      if (parts.length !== 3) {
        throw new Error('Formato de datos encriptados inválido')
      }
      
      const [ivHex, authTagHex, encryptedText] = parts
      
      const iv = Buffer.from(ivHex, 'hex')
      const authTag = Buffer.from(authTagHex, 'hex')
      
      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv)
      decipher.setAuthTag(authTag)
      
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      console.error('[Encryption] Error desencriptando:', error)
      throw new Error('Error al desencriptar datos sensibles')
    }
  }
  
  /**
   * Ofusca un valor para mostrarlo en UI (ej: ****1234)
   * 
   * @param value - Valor a ofuscar
   * @param visibleChars - Número de caracteres visibles al final
   * @returns Valor ofuscado
   */
  static mask(value: string | null | undefined, visibleChars: number = 4): string {
    if (!value) return ''
    if (value.length <= visibleChars) return '****'
    
    const masked = '*'.repeat(Math.min(value.length - visibleChars, 20))
    const visible = value.slice(-visibleChars)
    
    return `${masked}${visible}`
  }
  
  /**
   * Genera una clave de encriptación segura (para setup inicial)
   * 
   * @returns Clave en formato hex (64 caracteres)
   */
  static generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex')
  }
  
  /**
   * Verifica si un valor está encriptado (tiene el formato correcto)
   * 
   * @param value - Valor a verificar
   * @returns true si parece estar encriptado
   */
  static isEncrypted(value: string): boolean {
    if (!value) return false
    
    const parts = value.split(':')
    if (parts.length !== 3) return false
    
    // Verificar que cada parte sea hex válido
    const hexRegex = /^[0-9a-f]+$/i
    return parts.every(part => hexRegex.test(part))
  }
  
  /**
   * Hash de un valor (para comparaciones sin revelar el original)
   * Útil para tokens, verificación de contraseñas, etc.
   * 
   * @param value - Valor a hashear
   * @returns Hash SHA-256 en hex
   */
  static hash(value: string): string {
    return crypto
      .createHash('sha256')
      .update(value)
      .digest('hex')
  }
  
  /**
   * Genera un token aleatorio seguro
   * 
   * @param length - Longitud en bytes (default: 32)
   * @returns Token en formato hex
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }
}

// Exportar también como default para imports flexibles
export default EncryptionService
