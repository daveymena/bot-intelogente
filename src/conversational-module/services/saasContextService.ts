import { db } from '@/lib/db';

export interface TenantConfig {
  userId: string;
  businessName: string;
  description?: string;
  phone: string;
  storeSlug?: string;
  
  // Configuración de Identidad
  greetings?: {
    formal?: string[];
    casual?: string[];
    dynamic?: boolean;
  };
  
  // Configuración de Categorías
  categories: {
    active: string[]; // Categorías activas detectadas
    mappings: Record<string, string>; // Alias -> Categoría real
  };
  
  // Configuración de Contacto
  contact: {
    email?: string;
    address?: string;
    website?: string;
    social?: {
      instagram?: string;
      facebook?: string;
      tiktok?: string;
    };
  };
  
  // Configuración del Bot
  botSettings: {
    aiProvider: string;
    tone: 'formal' | 'casual' | 'friendly';
    useEmojis: boolean;
  };
}

// Caché simple en memoria (podría moverse a Redis en el futuro)
const tenantCache = new Map<string, { config: TenantConfig; expiresAt: number }>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutos

/**
 * Servicio para gestionar el contexto SaaS (Multi-Tenant)
 */
export class SaasContextService {
  
  /**
   * Obtiene la configuración del tenant basada en el ID del usuario (dueño del bot)
   */
  static async getTenantConfig(userId: string): Promise<TenantConfig | null> {
    // 1. Revisar caché
    const cached = tenantCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.config;
    }
    
    try {
      // 2. Cargar datos de BD en paralelo
      const [botSettings, storeSettings, products] = await Promise.all([
        db.botSettings.findUnique({ where: { userId } }),
        db.storeSettings.findUnique({ where: { userId } }),
        db.product.findMany({
          where: { userId, status: 'AVAILABLE' },
          select: { category: true, subcategory: true },
          distinct: ['category', 'subcategory']
        })
      ]);

      if (!botSettings) {
        console.warn(`[SaasContext] No bot settings found for user ${userId}`);
        return null;
      }

      // 3. Detectar categorías activas
      const activeCategories = Array.from(new Set(products.map(p => p.category)));
      
      // 4. Construir configuración unificada
      const config: TenantConfig = {
        userId,
        businessName: storeSettings?.storeName || botSettings.businessName || 'Mi Tienda',
        description: storeSettings?.description || undefined,
        phone: botSettings.businessPhone,
        storeSlug: storeSettings?.storeSlug,
        
        categories: {
          active: activeCategories,
          mappings: {} // Se llenará dinámicamente o desde configuración
        },
        
        contact: {
          email: storeSettings?.email || undefined,
          address: storeSettings?.address || botSettings.businessAddress || undefined,
          website: storeSettings?.customDomain || (storeSettings?.storeSlug ? `https://mitienda.com/${storeSettings.storeSlug}` : undefined),
          social: {
            instagram: storeSettings?.instagram || undefined,
            facebook: storeSettings?.facebook || undefined,
            tiktok: storeSettings?.tiktok || undefined
          }
        },
        
        botSettings: {
          aiProvider: botSettings.preferredAiProvider || 'groq',
          tone: 'friendly', // Podría venir de BD
          useEmojis: true   // Podría venir de BD
        }
      };

      // 5. Guardar en caché
      tenantCache.set(userId, {
        config,
        expiresAt: Date.now() + CACHE_TTL
      });

      return config;
      
    } catch (error) {
      console.error(`[SaasContext] Error loading config for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Limpia la caché de un tenant (útil cuando actualizan su configuración)
   */
  static invalidateCache(userId: string) {
    tenantCache.delete(userId);
    console.log(`[SaasContext] Cache invalidated for user ${userId}`);
  }
}
