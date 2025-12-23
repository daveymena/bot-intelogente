/**
 * 🏢 BusinessContextDetector
 * 
 * Detecta automáticamente el tipo de negocio basándose en los productos/servicios
 * del tenant. Usa análisis de palabras clave y opcionalmente IA para casos ambiguos.
 */

import { prisma } from '@/lib/db'

// Tipos de negocio soportados
export type BusinessType = 'STORE' | 'SERVICE' | 'RESTAURANT' | 'HYBRID' | 'UNKNOWN'

// Subtipos específicos
export type BusinessSubType = 
  | 'electronics' | 'clothing' | 'accessories' | 'home' | 'sports'  // STORE
  | 'consulting' | 'health' | 'beauty' | 'education' | 'repair' | 'legal' | 'accounting'  // SERVICE
  | 'fast-food' | 'restaurant' | 'cafe' | 'bakery' | 'delivery'  // RESTAURANT
  | 'digital-products' | 'courses' | 'software'  // DIGITAL
  | 'general'

export interface BusinessContext {
  type: BusinessType
  confidence: number // 0-1
  subType?: BusinessSubType
  features: {
    hasPhysicalProducts: boolean
    hasDigitalProducts: boolean
    hasServices: boolean
    hasAppointments: boolean
    hasDelivery: boolean
    hasLocation: boolean
    hasFood: boolean
  }
}

// Palabras clave para detección
const KEYWORDS = {
  // Tienda de productos físicos
  STORE: {
    electronics: ['laptop', 'computador', 'pc', 'celular', 'tablet', 'monitor', 'teclado', 'mouse', 'auriculares', 'audifonos', 'impresora', 'router', 'cable', 'cargador', 'bateria', 'disco', 'memoria', 'ram', 'ssd', 'procesador', 'tarjeta', 'grafica', 'gaming', 'gamer'],
    clothing: ['camisa', 'pantalon', 'vestido', 'falda', 'zapatos', 'tenis', 'chaqueta', 'abrigo', 'ropa', 'moda', 'talla', 'color', 'algodon', 'jean', 'camiseta', 'blusa', 'sudadera'],
    accessories: ['bolso', 'cartera', 'reloj', 'gafas', 'collar', 'anillo', 'pulsera', 'aretes', 'cinturon', 'bufanda', 'sombrero', 'gorra'],
    home: ['mueble', 'sofa', 'mesa', 'silla', 'cama', 'colchon', 'lampara', 'cortina', 'alfombra', 'decoracion', 'cocina', 'electrodomestico'],
    sports: ['bicicleta', 'moto', 'motocicleta', 'casco', 'guantes', 'balon', 'raqueta', 'pesas', 'gimnasio', 'deporte', 'fitness']
  },
  
  // Servicios
  SERVICE: {
    consulting: ['consultoria', 'asesoria', 'coaching', 'mentoria', 'estrategia', 'negocio', 'empresa', 'marketing', 'ventas', 'finanzas'],
    health: ['medico', 'doctor', 'clinica', 'salud', 'consulta', 'cita', 'tratamiento', 'terapia', 'fisioterapia', 'psicologia', 'nutricion', 'odontologia', 'dentista'],
    beauty: ['peluqueria', 'salon', 'corte', 'cabello', 'manicure', 'pedicure', 'spa', 'masaje', 'facial', 'maquillaje', 'uñas', 'depilacion', 'estetica'],
    education: ['clase', 'curso', 'taller', 'capacitacion', 'tutoria', 'profesor', 'maestro', 'leccion', 'idioma', 'ingles', 'matematicas'],
    repair: ['reparacion', 'arreglo', 'mantenimiento', 'servicio tecnico', 'instalacion', 'plomeria', 'electricidad', 'mecanico', 'taller'],
    legal: ['abogado', 'legal', 'juridico', 'contrato', 'demanda', 'asesoria legal', 'notaria'],
    accounting: ['contador', 'contabilidad', 'impuestos', 'declaracion', 'facturacion', 'nomina', 'auditoria']
  },
  
  // Restaurante/Comida
  RESTAURANT: {
    'fast-food': ['hamburguesa', 'pizza', 'hot dog', 'perro', 'papas', 'fritas', 'combo', 'rapida'],
    restaurant: ['almuerzo', 'cena', 'desayuno', 'plato', 'menu', 'entrada', 'postre', 'bebida', 'restaurante'],
    cafe: ['cafe', 'cappuccino', 'latte', 'espresso', 'te', 'pastel', 'torta', 'galleta', 'cafeteria'],
    bakery: ['pan', 'panaderia', 'pasteleria', 'croissant', 'empanada', 'arepa', 'buñuelo'],
    delivery: ['domicilio', 'delivery', 'envio', 'pedido', 'llevar', 'rappi', 'uber eats']
  },
  
  // Productos digitales
  DIGITAL: {
    'digital-products': ['digital', 'descarga', 'pdf', 'ebook', 'plantilla', 'template', 'recurso', 'archivo'],
    courses: ['curso', 'megapack', 'pack', 'bundle', 'masterclass', 'programa', 'formacion', 'certificado', 'online', 'virtual'],
    software: ['software', 'app', 'aplicacion', 'licencia', 'suscripcion', 'saas', 'herramienta']
  }
}

// Palabras que indican servicios con citas
const APPOINTMENT_KEYWORDS = ['cita', 'agendar', 'reservar', 'hora', 'disponibilidad', 'turno', 'sesion', 'consulta']

// Palabras que indican delivery/ubicación
const LOCATION_KEYWORDS = ['domicilio', 'direccion', 'zona', 'barrio', 'ciudad', 'envio', 'entrega', 'delivery']

export class BusinessContextDetector {
  
  /**
   * Detecta el tipo de negocio basándose en los items del tenant
   */
  static async detectFromItems(items: Array<{ name: string; description?: string | null; price: number; category?: string }>): Promise<BusinessContext> {
    if (!items || items.length === 0) {
      return this.getDefaultContext()
    }
    
    // Extraer todas las palabras de los items
    const allText = items.map(item => 
      `${item.name} ${item.description || ''} ${item.category || ''}`
    ).join(' ').toLowerCase()
    
    const words = this.normalizeText(allText).split(/\s+/)
    
    // Contar coincidencias por categoría
    const scores = {
      STORE: { total: 0, subTypes: {} as Record<string, number> },
      SERVICE: { total: 0, subTypes: {} as Record<string, number> },
      RESTAURANT: { total: 0, subTypes: {} as Record<string, number> },
      DIGITAL: { total: 0, subTypes: {} as Record<string, number> }
    }
    
    // Analizar palabras clave
    for (const [mainType, subTypes] of Object.entries(KEYWORDS)) {
      for (const [subType, keywords] of Object.entries(subTypes)) {
        let count = 0
        for (const keyword of keywords) {
          if (allText.includes(keyword)) {
            count++
          }
        }
        if (count > 0) {
          scores[mainType as keyof typeof scores].total += count
          scores[mainType as keyof typeof scores].subTypes[subType] = count
        }
      }
    }
    
    // Detectar features
    const features = {
      hasPhysicalProducts: scores.STORE.total > 0,
      hasDigitalProducts: scores.DIGITAL.total > 0,
      hasServices: scores.SERVICE.total > 0,
      hasAppointments: APPOINTMENT_KEYWORDS.some(k => allText.includes(k)),
      hasDelivery: LOCATION_KEYWORDS.some(k => allText.includes(k)),
      hasLocation: LOCATION_KEYWORDS.some(k => allText.includes(k)),
      hasFood: scores.RESTAURANT.total > 0
    }
    
    // Determinar tipo principal
    const totalScores = [
      { type: 'STORE' as BusinessType, score: scores.STORE.total + scores.DIGITAL.total },
      { type: 'SERVICE' as BusinessType, score: scores.SERVICE.total },
      { type: 'RESTAURANT' as BusinessType, score: scores.RESTAURANT.total }
    ].sort((a, b) => b.score - a.score)
    
    const topScore = totalScores[0]
    const secondScore = totalScores[1]
    
    // Calcular confianza
    const totalPoints = totalScores.reduce((sum, s) => sum + s.score, 0)
    let confidence = totalPoints > 0 ? topScore.score / totalPoints : 0
    
    // Determinar si es híbrido
    let type: BusinessType = topScore.type
    if (secondScore.score > 0 && secondScore.score >= topScore.score * 0.5) {
      type = 'HYBRID'
      confidence *= 0.8 // Reducir confianza para híbridos
    }
    
    if (topScore.score === 0) {
      type = 'UNKNOWN'
      confidence = 0
    }
    
    // Determinar subtipo
    let subType: BusinessSubType = 'general'
    if (type === 'STORE' || type === 'HYBRID') {
      const storeSubTypes = { ...scores.STORE.subTypes, ...scores.DIGITAL.subTypes }
      const topSubType = Object.entries(storeSubTypes).sort((a, b) => b[1] - a[1])[0]
      if (topSubType) subType = topSubType[0] as BusinessSubType
    } else if (type === 'SERVICE') {
      const topSubType = Object.entries(scores.SERVICE.subTypes).sort((a, b) => b[1] - a[1])[0]
      if (topSubType) subType = topSubType[0] as BusinessSubType
    } else if (type === 'RESTAURANT') {
      const topSubType = Object.entries(scores.RESTAURANT.subTypes).sort((a, b) => b[1] - a[1])[0]
      if (topSubType) subType = topSubType[0] as BusinessSubType
    }
    
    return {
      type,
      confidence: Math.min(confidence, 1),
      subType,
      features
    }
  }
  
  /**
   * Actualiza el contexto cuando se agregan nuevos items
   */
  static async updateContext(
    currentContext: BusinessContext, 
    newItems: Array<{ name: string; description?: string | null; price: number }>
  ): Promise<BusinessContext> {
    // Re-detectar con todos los items
    return this.detectFromItems(newItems)
  }
  
  /**
   * Extrae palabras clave de los items
   */
  static getKeywords(items: Array<{ name: string; description?: string | null }>): string[] {
    const allText = items.map(item => 
      `${item.name} ${item.description || ''}`
    ).join(' ')
    
    const normalized = this.normalizeText(allText)
    const words = normalized.split(/\s+/).filter(w => w.length > 3)
    
    // Contar frecuencia
    const frequency: Record<string, number> = {}
    for (const word of words) {
      frequency[word] = (frequency[word] || 0) + 1
    }
    
    // Retornar las más frecuentes
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word)
  }
  
  /**
   * Detecta y guarda el contexto del negocio para un usuario
   */
  static async detectAndSave(userId: string): Promise<BusinessContext> {
    // Obtener productos del usuario
    const products = await prisma.product.findMany({
      where: { userId },
      select: { name: true, description: true, price: true, category: true }
    })
    
    const context = await this.detectFromItems(products)
    
    // Guardar en la base de datos
    await prisma.businessSettings.upsert({
      where: { userId },
      create: {
        userId,
        detectedType: context.type,
        detectedSubType: context.subType,
        confidence: context.confidence,
        enableBooking: context.features.hasAppointments || context.features.hasServices,
        enableCart: context.features.hasPhysicalProducts || context.features.hasDigitalProducts,
        enableDelivery: context.features.hasDelivery,
        enableLocation: context.features.hasLocation,
        lastDetectedAt: new Date(),
        itemsAnalyzed: products.length
      },
      update: {
        detectedType: context.type,
        detectedSubType: context.subType,
        confidence: context.confidence,
        enableBooking: context.features.hasAppointments || context.features.hasServices,
        enableCart: context.features.hasPhysicalProducts || context.features.hasDigitalProducts,
        enableDelivery: context.features.hasDelivery,
        enableLocation: context.features.hasLocation,
        lastDetectedAt: new Date(),
        itemsAnalyzed: products.length
      }
    })
    
    return context
  }
  
  /**
   * Obtiene el contexto guardado de un usuario
   */
  static async getContext(userId: string): Promise<BusinessContext | null> {
    const settings = await prisma.businessSettings.findUnique({
      where: { userId }
    })
    
    if (!settings) return null
    
    return {
      type: settings.detectedType as BusinessType,
      confidence: settings.confidence,
      subType: settings.detectedSubType as BusinessSubType | undefined,
      features: {
        hasPhysicalProducts: settings.enableCart,
        hasDigitalProducts: settings.enableCart,
        hasServices: settings.enableBooking,
        hasAppointments: settings.enableBooking,
        hasDelivery: settings.enableDelivery,
        hasLocation: settings.enableLocation,
        hasFood: settings.detectedType === 'RESTAURANT'
      }
    }
  }
  
  /**
   * Normaliza texto para análisis
   */
  private static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }
  
  /**
   * Retorna contexto por defecto
   */
  private static getDefaultContext(): BusinessContext {
    return {
      type: 'UNKNOWN',
      confidence: 0,
      features: {
        hasPhysicalProducts: false,
        hasDigitalProducts: false,
        hasServices: false,
        hasAppointments: false,
        hasDelivery: false,
        hasLocation: false,
        hasFood: false
      }
    }
  }
}

export default BusinessContextDetector
