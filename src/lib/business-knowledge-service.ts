/**
 * 🧠 SISTEMA DE CONOCIMIENTO DINÁMICO
 * Carga contexto completo del negocio para el orquestador
 */

import { db } from './db';
import fs from 'fs';
import path from 'path';

interface BusinessKnowledge {
  businessInfo: {
    name: string;
    description?: string;
    phone?: string;
    address?: string;
    workingHours?: string;
  };
  paymentMethods: {
    mercadoPago: boolean;
    paypal: boolean;
    nequi: boolean;
    daviplata: boolean;
    bankTransfer: boolean;
    details: any;
  };
  shippingPolicies: {
    enabled: boolean;
    freeShippingThreshold?: number;
    defaultCost?: number;
    estimatedDays?: string;
  };
  products: {
    total: number;
    byCategory: Record<string, number>;
    featured: any[];
  };
  personality: {
    tone: string;
    style: string;
    specialInstructions?: string;
  };
}

export class BusinessKnowledgeService {
  private static cache: BusinessKnowledge | null = null;
  private static lastUpdate: number = 0;
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtiene el conocimiento completo del negocio
   */
  static async getKnowledge(userId: string): Promise<BusinessKnowledge> {
    // Usar caché si está fresco
    const now = Date.now();
    if (this.cache && (now - this.lastUpdate) < this.CACHE_DURATION) {
      console.log('[Knowledge] 📚 Usando caché de conocimiento');
      return this.cache;
    }

    console.log('[Knowledge] 🔄 Actualizando conocimiento del negocio...');

    try {
      // 1. Información del negocio
      const botSettings = await db.botSettings.findUnique({
        where: { userId }
      });

      const businessInfo = {
        name: botSettings?.businessName || 'Mi Tienda',
        description: 'Tienda de productos de calidad',
        phone: botSettings?.businessPhone || '',
        address: botSettings?.businessAddress || '',
        workingHours: botSettings?.businessHours || 'Lunes a Viernes, 9am - 6pm'
      };

      // 2. Métodos de pago
      const paymentConfig = await db.paymentConfig.findUnique({
        where: { userId }
      });

      const paymentMethods = {
        mercadoPago: paymentConfig?.mercadoPagoEnabled || false,
        paypal: paymentConfig?.paypalEnabled || false,
        nequi: paymentConfig?.nequiEnabled || false,
        daviplata: paymentConfig?.daviplataEnabled || false,
        bankTransfer: paymentConfig?.bankTransferEnabled || false,
        details: {
          nequiPhone: paymentConfig?.nequiPhone,
          daviplataPhone: paymentConfig?.daviplataPhone,
          bankName: paymentConfig?.bankName,
          bankAccount: paymentConfig?.bankAccountNumber
        }
      };

      // 3. Políticas de envío
      const storeSettings = await db.storeSettings.findUnique({
        where: { userId }
      });

      const shippingPolicies = {
        enabled: storeSettings?.isActive || false,
        freeShippingThreshold: 100000, // Default
        defaultCost: 10000, // Default
        estimatedDays: '3-5 días hábiles'
      };

      // 4. Productos
      const products = await db.product.findMany({
        where: { userId, status: 'AVAILABLE' },
        select: {
          id: true,
          name: true,
          price: true,
          category: true,
          images: true,
          description: true,
          tags: true
        }
      });

      const productsByCategory: Record<string, number> = {};
      products.forEach(p => {
        productsByCategory[p.category] = (productsByCategory[p.category] || 0) + 1;
      });

      const productsInfo = {
        total: products.length,
        byCategory: productsByCategory,
        featured: products.slice(0, 10) // Solo top 10 para no saturar el prompt de sistema
      };

      // 5. Personalidad del bot (desde SOUL.md si existe)
      let personality = {
        tone: 'profesional y cercano',
        style: 'colombiano, empático',
        specialInstructions: ''
      };

      try {
        const soulPath = path.join(process.cwd(), '.openclaw-workspace', 'SOUL.md');
        if (fs.existsSync(soulPath)) {
          const soulContent = fs.readFileSync(soulPath, 'utf-8');
          // Extraer instrucciones especiales si existen
          const match = soulContent.match(/## Instrucciones Especiales\n([\s\S]*?)(?=\n##|$)/);
          if (match) {
            personality.specialInstructions = match[1].trim();
          }
        }
      } catch (e) {
        console.log('[Knowledge] ⚠️ No se pudo leer SOUL.md');
      }

      // Construir conocimiento completo
      const knowledge: BusinessKnowledge = {
        businessInfo,
        paymentMethods,
        shippingPolicies,
        products: productsInfo,
        personality
      };

      // Actualizar caché
      this.cache = knowledge;
      this.lastUpdate = now;

      console.log('[Knowledge] ✅ Conocimiento actualizado:', {
        business: businessInfo.name,
        products: productsInfo.total,
        payments: Object.keys(paymentMethods).filter(k => (paymentMethods as any)[k] === true).length
      });

      return knowledge;

    } catch (error: any) {
      console.error('[Knowledge] ❌ Error cargando conocimiento:', error.message);
      
      // Retornar conocimiento mínimo en caso de error
      return {
        businessInfo: {
          name: 'Mi Tienda',
          workingHours: '24/7'
        },
        paymentMethods: {
          mercadoPago: false,
          paypal: false,
          nequi: false,
          daviplata: false,
          bankTransfer: false,
          details: {}
        },
        shippingPolicies: {
          enabled: false
        },
        products: {
          total: 0,
          byCategory: {},
          featured: []
        },
        personality: {
          tone: 'profesional',
          style: 'amigable'
        }
      };
    }
  }

  /**
   * Genera un resumen textual del conocimiento para inyectar en prompts
   */
  static formatForPrompt(knowledge: BusinessKnowledge): string {
    const paymentsList: string[] = [];
    if (knowledge.paymentMethods.mercadoPago) paymentsList.push('MercadoPago (Tarjetas, PSE, Efectivo)');
    if (knowledge.paymentMethods.paypal) paymentsList.push('PayPal (Internacional)');
    if (knowledge.paymentMethods.nequi) paymentsList.push(`Nequi (${knowledge.paymentMethods.details.nequiPhone || 'Disponible'})`);
    if (knowledge.paymentMethods.daviplata) paymentsList.push(`Daviplata (${knowledge.paymentMethods.details.daviplataPhone || 'Disponible'})`);
    if (knowledge.paymentMethods.bankTransfer) paymentsList.push(`Transferencia Bancaria (${knowledge.paymentMethods.details.bankName || 'Bancolombia'})`);

    return `
📋 CONTEXTO DEL NEGOCIO (Actualizado: ${new Date().toLocaleString('es-CO')})

🏢 NEGOCIO:
- Nombre: ${knowledge.businessInfo.name}
- Descripción: ${knowledge.businessInfo.description || 'N/A'}
- Teléfono: ${knowledge.businessInfo.phone || 'N/A'}
- Horario: ${knowledge.businessInfo.workingHours}

💳 MÉTODOS DE PAGO DISPONIBLES:
${paymentsList.length > 0 ? paymentsList.map(p => `- ${p}`).join('\n') : '- Consultar con asesor'}

📦 INVENTARIO DISPONIBLE:
- Total de productos: ${knowledge.products.total}
- Categorías: ${Object.entries(knowledge.products.byCategory).map(([cat, count]) => `${cat} (${count})`).join(', ')}

🔥 PRODUCTOS PRINCIPALES (Nombre y Precio):
${knowledge.products.featured.map(p => `- ${p.name}: $${p.price.toLocaleString('es-CO')}`).join('\n')}

${knowledge.products.total > 10 ? '(Hay más productos disponibles que puedes buscar con herramientas)' : ''}

🚚 ENVÍOS:
${knowledge.shippingPolicies.enabled 
  ? `- Costo: $${knowledge.shippingPolicies.defaultCost?.toLocaleString('es-CO') || 'Variable'}
- Envío gratis desde: $${knowledge.shippingPolicies.freeShippingThreshold?.toLocaleString('es-CO') || 'N/A'}
- Tiempo estimado: ${knowledge.shippingPolicies.estimatedDays}` 
  : '- No disponible (Solo productos digitales o retiro en tienda)'}

🎭 PERSONALIDAD:
- Tono: ${knowledge.personality.tone}
- Estilo: ${knowledge.personality.style}
${knowledge.personality.specialInstructions ? `- Instrucciones especiales: ${knowledge.personality.specialInstructions}` : ''}
`;
  }

  /**
   * Limpia el caché (útil después de cambios en configuración)
   */
  static clearCache(): void {
    this.cache = null;
    this.lastUpdate = 0;
    console.log('[Knowledge] 🧹 Caché limpiado');
  }
}
