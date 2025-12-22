import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Clave secreta para encriptación (cambiar en producción)
const SECRET_KEY = process.env.LICENSE_SECRET_KEY || 'TecnovariedadesDS2024SecretKey';
const LICENSE_FILE = path.join(process.cwd(), '.license');
const TRIAL_FILE = path.join(process.cwd(), '.trial');

export interface License {
  key: string;
  email: string;
  machineId: string;
  expiresAt: Date;
  type: 'trial' | 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  activated: boolean;
  activatedAt?: Date;
}

export class LicenseService {
  private static instance: LicenseService;
  private currentLicense: License | null = null;
  private lastCheck: Date | null = null;

  private constructor() {
    this.loadLicense();
  }

  static getInstance(): LicenseService {
    if (!LicenseService.instance) {
      LicenseService.instance = new LicenseService();
    }
    return LicenseService.instance;
  }

  /**
   * Genera un ID único de la máquina basado en hardware
   */
  static getMachineId(): string {
    const networkInterfaces = os.networkInterfaces();
    const cpus = os.cpus();
    
    // Obtener MAC address de la primera interfaz de red
    let macAddress = '';
    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      if (interfaces) {
        for (const iface of interfaces) {
          if (!iface.internal && iface.mac !== '00:00:00:00:00:00') {
            macAddress = iface.mac;
            break;
          }
        }
      }
      if (macAddress) break;
    }

    // Combinar información del sistema
    const systemInfo = [
      macAddress,
      os.hostname(),
      os.platform(),
      os.arch(),
      cpus[0]?.model || '',
    ].join('|');

    // Generar hash SHA256
    return crypto.createHash('sha256').update(systemInfo).digest('hex');
  }

  /**
   * Encripta datos usando AES-256
   */
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(SECRET_KEY, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Desencripta datos
   */
  private decrypt(text: string): string {
    try {
      const parts = text.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encryptedText = parts[1];
      
      const key = crypto.scryptSync(SECRET_KEY, 'salt', 32);
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error('Licencia corrupta o inválida');
    }
  }

  /**
   * Genera una clave de licencia
   */
  static generateLicenseKey(
    email: string,
    type: 'trial' | 'monthly' | 'yearly' | 'lifetime',
    machineId?: string
  ): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    
    const data = {
      email,
      type,
      timestamp,
      machineId: machineId || 'ANY',
      random,
    };

    const dataString = JSON.stringify(data);
    const signature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(dataString)
      .digest('hex')
      .substring(0, 16);

    // Formato: XXXX-XXXX-XXXX-XXXX
    const key = `${signature.substring(0, 4)}-${signature.substring(4, 8)}-${signature.substring(8, 12)}-${signature.substring(12, 16)}`.toUpperCase();
    
    return key;
  }

  /**
   * Valida una clave de licencia
   */
  static validateLicenseKey(key: string): boolean {
    // Formato básico
    const keyRegex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return keyRegex.test(key);
  }

  /**
   * Activa una licencia con una clave
   */
  async activateLicense(
    key: string,
    email: string,
    type: 'trial' | 'monthly' | 'yearly' | 'lifetime' = 'monthly'
  ): Promise<{ success: boolean; message: string; license?: License }> {
    try {
      // Validar formato
      if (!LicenseService.validateLicenseKey(key)) {
        return { success: false, message: 'Formato de clave inválido' };
      }

      const machineId = LicenseService.getMachineId();

      // Calcular fecha de expiración
      let expiresAt = new Date();
      switch (type) {
        case 'trial':
          expiresAt.setDate(expiresAt.getDate() + 10);
          break;
        case 'monthly':
          expiresAt.setMonth(expiresAt.getMonth() + 1);
          break;
        case 'yearly':
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          break;
        case 'lifetime':
          expiresAt.setFullYear(expiresAt.getFullYear() + 100);
          break;
      }

      const license: License = {
        key,
        email,
        machineId,
        expiresAt,
        type,
        features: this.getFeaturesForType(type),
        activated: true,
        activatedAt: new Date(),
      };

      // Guardar licencia encriptada
      this.saveLicense(license);
      this.currentLicense = license;

      // Eliminar archivo de trial si existe
      if (fs.existsSync(TRIAL_FILE)) {
        fs.unlinkSync(TRIAL_FILE);
      }

      return {
        success: true,
        message: `Licencia activada exitosamente hasta ${expiresAt.toLocaleDateString()}`,
        license,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al activar licencia',
      };
    }
  }

  /**
   * Inicia el período de prueba
   */
  async startTrial(): Promise<{ success: boolean; message: string; expiresAt?: Date }> {
    try {
      // Verificar si ya existe trial
      if (fs.existsSync(TRIAL_FILE)) {
        const trialData = JSON.parse(fs.readFileSync(TRIAL_FILE, 'utf8'));
        const startDate = new Date(trialData.startDate);
        const expiresAt = new Date(startDate);
        expiresAt.setDate(expiresAt.getDate() + 10);

        if (new Date() < expiresAt) {
          return {
            success: false,
            message: 'Ya tienes un período de prueba activo',
            expiresAt,
          };
        }
      }

      const machineId = LicenseService.getMachineId();
      const startDate = new Date();
      const expiresAt = new Date(startDate);
      expiresAt.setDate(expiresAt.getDate() + 10);

      const trialData = {
        machineId,
        startDate: startDate.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      // Guardar datos de trial encriptados
      const encrypted = this.encrypt(JSON.stringify(trialData));
      fs.writeFileSync(TRIAL_FILE, encrypted, 'utf8');

      return {
        success: true,
        message: `Período de prueba iniciado. Expira el ${expiresAt.toLocaleDateString()}`,
        expiresAt,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al iniciar período de prueba',
      };
    }
  }

  /**
   * Verifica si la licencia es válida
   */
  async checkLicense(): Promise<{
    valid: boolean;
    message: string;
    daysRemaining?: number;
    type?: string;
  }> {
    try {
      // Verificar licencia activada
      if (this.currentLicense) {
        const now = new Date();
        const expiresAt = new Date(this.currentLicense.expiresAt);

        // Verificar machine ID
        const currentMachineId = LicenseService.getMachineId();
        if (this.currentLicense.machineId !== currentMachineId) {
          return {
            valid: false,
            message: 'Licencia vinculada a otra máquina. Contacta soporte.',
          };
        }

        // Verificar expiración
        if (now > expiresAt) {
          return {
            valid: false,
            message: 'Licencia expirada. Renueva tu suscripción.',
          };
        }

        const daysRemaining = Math.ceil(
          (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        this.lastCheck = now;

        return {
          valid: true,
          message: 'Licencia válida',
          daysRemaining,
          type: this.currentLicense.type,
        };
      }

      // Verificar trial
      if (fs.existsSync(TRIAL_FILE)) {
        const encrypted = fs.readFileSync(TRIAL_FILE, 'utf8');
        const trialData = JSON.parse(this.decrypt(encrypted));
        
        const expiresAt = new Date(trialData.expiresAt);
        const now = new Date();

        // Verificar machine ID
        const currentMachineId = LicenseService.getMachineId();
        if (trialData.machineId !== currentMachineId) {
          return {
            valid: false,
            message: 'Trial vinculado a otra máquina',
          };
        }

        if (now > expiresAt) {
          return {
            valid: false,
            message: 'Período de prueba expirado. Activa una licencia.',
          };
        }

        const daysRemaining = Math.ceil(
          (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          valid: true,
          message: 'Período de prueba activo',
          daysRemaining,
          type: 'trial',
        };
      }

      return {
        valid: false,
        message: 'No hay licencia activa. Inicia el período de prueba o activa una licencia.',
      };
    } catch (error) {
      return {
        valid: false,
        message: 'Error al verificar licencia',
      };
    }
  }

  /**
   * Guarda la licencia en archivo encriptado
   */
  private saveLicense(license: License): void {
    const licenseData = JSON.stringify(license);
    const encrypted = this.encrypt(licenseData);
    fs.writeFileSync(LICENSE_FILE, encrypted, 'utf8');
  }

  /**
   * Carga la licencia desde archivo
   */
  private loadLicense(): void {
    try {
      if (fs.existsSync(LICENSE_FILE)) {
        const encrypted = fs.readFileSync(LICENSE_FILE, 'utf8');
        const decrypted = this.decrypt(encrypted);
        this.currentLicense = JSON.parse(decrypted);
      }
    } catch (error) {
      console.error('Error al cargar licencia:', error);
      this.currentLicense = null;
    }
  }

  /**
   * Obtiene características según tipo de licencia
   */
  private getFeaturesForType(type: string): string[] {
    const baseFeatures = ['whatsapp', 'ai_responses', 'product_management'];
    
    switch (type) {
      case 'trial':
        return [...baseFeatures, 'limited_messages'];
      case 'monthly':
        return [...baseFeatures, 'unlimited_messages', 'analytics'];
      case 'yearly':
        return [...baseFeatures, 'unlimited_messages', 'analytics', 'priority_support'];
      case 'lifetime':
        return [...baseFeatures, 'unlimited_messages', 'analytics', 'priority_support', 'custom_features'];
      default:
        return baseFeatures;
    }
  }

  /**
   * Obtiene información de la licencia actual
   */
  getLicenseInfo(): License | null {
    return this.currentLicense;
  }

  /**
   * Desactiva la licencia actual
   */
  deactivateLicense(): void {
    if (fs.existsSync(LICENSE_FILE)) {
      fs.unlinkSync(LICENSE_FILE);
    }
    this.currentLicense = null;
  }

  /**
   * Verifica si una característica está disponible
   */
  hasFeature(feature: string): boolean {
    if (!this.currentLicense) return false;
    return this.currentLicense.features.includes(feature);
  }
}

export default LicenseService;
