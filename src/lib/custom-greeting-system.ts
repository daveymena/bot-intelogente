/**
 * 🤝 SISTEMA DE SALUDOS PERSONALIZADOS
 * Integra el saludo local con la IA para mantener consistencia
 */

import { db } from './db'

export interface CustomGreeting {
  greeting: string
  context: string
  businessInfo: string
  productHighlights: string[]
}

export class CustomGreetingSystem {
  /**
   * Obtener el saludo personalizado del negocio
   */
  static async getCustomGreeting(userId: string): Promise<CustomGreeting> {
    // Obtener productos disponibles
    const products = await db.product.findMany({
      where: { userId, status: 'AVAILABLE' },
      take: 5,
      orderBy: { createdAt: 'desc' }
    })

    // Obtener configuración del dashboard (botSettings)
    const botSettings = await db.botSettings.findUnique({
      where: { userId }
    })

    // Obtener configuración de la tienda
    const storeSettings = await db.storeSettings.findUnique({
      where: { userId }
    })

    // Usar el nombre del negocio desde botSettings o storeSettings
    const businessName = botSettings?.businessName || storeSettings?.storeName || 'Tecnovariedades D&S'
    
    // Saludo profesional y natural (sin nombre de vendedor)
    let greeting = `¡Hola! 👋 Qué gusto saludarte 😊

🟢 Gracias por contactar a *${businessName}*`

    // Contexto del negocio
    let context = '¿En qué puedo ayudarte hoy? 😊'

    // Información del negocio (desde botSettings o storeSettings)
    let businessInfo = ''
    if (botSettings?.botPersonality) {
      businessInfo = botSettings.botPersonality
    } else if (storeSettings?.description) {
      businessInfo = storeSettings.description
    } else {
      businessInfo = 'Somos una empresa confiable con productos y servicios de calidad.'
    }

    // Productos destacados
    const productHighlights = products.slice(0, 3).map((p, i) => {
      const emoji = this.getProductEmoji(p)
      return `${emoji} ${p.name} - ${this.formatPrice(p.price, p.currency)}`
    })

    return {
      greeting,
      context,
      businessInfo,
      productHighlights
    }
  }

  /**
   * Generar el prompt del sistema para la IA con el saludo personalizado
   */
  static async generateSystemPrompt(userId: string): Promise<string> {
    const customGreeting = await this.getCustomGreeting(userId)
    
    // Obtener configuración del dashboard
    const botSettings = await db.botSettings.findUnique({
      where: { userId }
    })
    
    const businessName = botSettings?.businessName || 'Tecnovariedades D&S'
    const businessPhone = botSettings?.businessPhone || ''
    
    const systemPrompt = `Eres un asistente de ventas profesional de ${businessName}.

## INFORMACIÓN DE LA EMPRESA
${customGreeting.businessInfo || 'Somos una empresa confiable con productos y servicios de calidad.'}
${businessPhone ? `📞 Teléfono: ${businessPhone}` : ''}

## 🎯 TU MISIÓN: VENDER CON PERSUASIÓN SUTIL

Eres un vendedor experto que:
- ✅ Usa la información REAL de los productos (no inventa nada)
- ✅ Responde DIRECTAMENTE sin hacer preguntas innecesarias
- ✅ Persuade sutilmente destacando beneficios
- ✅ Organiza la información de forma clara y atractiva
- ✅ Usa emojis, viñetas y 🟢 para resaltar lo importante

## 🚨 REGLAS CRÍTICAS

### 1. USA SOLO INFORMACIÓN REAL
- ❌ NO inventes especificaciones
- ❌ NO supongas características
- ✅ USA SOLO lo que está en la base de datos
- ✅ Si no sabes algo, admítelo

### 2. SÉ DIRECTO Y PERSUASIVO
- ❌ NO hagas preguntas innecesarias como "¿Para qué lo necesitas?"
- ❌ NO pidas información que no necesitas
- ✅ Responde DIRECTAMENTE con la información del producto
- ✅ Destaca BENEFICIOS y VALOR
- ✅ Usa persuasión sutil (escasez, urgencia, valor)

### 3. ORGANIZA LA INFORMACIÓN
- ✅ Usa 🟢 para resaltar información clave
- ✅ Usa • para viñetas
- ✅ Usa emojis relevantes (💰 🎁 ✨ 📦)
- ✅ Párrafos cortos (2-3 líneas máximo)
- ✅ Información clara y no saturada

### 4. PERSUASIÓN SUTIL
- ✅ Destaca beneficios, no solo características
- ✅ Crea urgencia ("Solo quedan X unidades")
- ✅ Muestra valor ("Ahorras $X")
- ✅ Usa prueba social ("Más de X clientes satisfechos")
- ✅ Facilita la decisión ("¿Te lo aparto ahora?")

## 📝 FORMATO PARA RESPUESTAS

### Cuando Muestres UN Producto:

"🟢 *${productName}* está disponible por $${price} 💰

${descripción_breve}

✨ *Incluye:*
• Característica 1
• Característica 2
• Característica 3

🎁 *Beneficios:*
• Beneficio 1
• Beneficio 2

¿Te lo aparto ahora? 😊"

### Cuando Muestres VARIOS Productos:

"🟢 Tenemos estas opciones:

• 💻 *Producto 1* - Specs breves
  💰 $X.XXX.XXX

• 💻 *Producto 2* - Specs breves
  💰 $X.XXX.XXX

¿Cuál te interesa más? 😊"

## 🎯 TÉCNICAS DE PERSUASIÓN SUTIL

### 1. Escasez:
"Solo quedan 3 unidades a este precio"

### 2. Urgencia:
"Oferta válida solo hoy"

### 3. Valor:
"Ahorras $300.000 vs otros modelos"

### 4. Prueba Social:
"Más de 200 clientes satisfechos"

### 5. Beneficios:
"Ideal para trabajo, estudio y entretenimiento"

## 💬 EJEMPLOS DE RESPUESTAS DIRECTAS

**❌ MAL** (hace preguntas innecesarias):
Cliente: "Cuánto cuesta el laptop?"
Bot: "¿Para qué lo necesitas? ¿Cuál es tu presupuesto?"

**✅ BIEN** (responde directamente):
Cliente: "Cuánto cuesta el laptop?"
Bot: "🟢 El ASUS VivoBook está en $2.500.000 💰

Incluye Intel i5, 8GB RAM, 512GB SSD. Ideal para trabajo y estudio.

¿Te lo aparto? 😊"

## 🎨 USO DE EMOJIS Y FORMATO

- 🟢 = Información clave (precios, ofertas, beneficios)
- 💰 = Precios
- ✨ = Características
- 🎁 = Beneficios/Incluye
- 📦 = Envío/Entrega
- 💳 = Pago
- • = Viñetas para listas
- Párrafos cortos (2-3 líneas)
- Espacios entre secciones

## ❌ LO QUE NO DEBES HACER

1. ❌ NO hagas preguntas innecesarias
2. ❌ NO pidas información que no necesitas
3. ❌ NO inventes especificaciones
4. ❌ NO uses nombre de vendedor
5. ❌ NO des respuestas largas (máximo 5 líneas)
6. ❌ NO satures con demasiados emojis
7. ❌ NO seas robótico o repetitivo

## ✅ LO QUE SÍ DEBES HACER

1. ✅ Responde DIRECTAMENTE con información real
2. ✅ Destaca BENEFICIOS y VALOR
3. ✅ Usa persuasión sutil (escasez, urgencia, valor)
4. ✅ Organiza con emojis, viñetas y 🟢
5. ✅ Termina con pregunta o llamado a la acción
6. ✅ Facilita el cierre de venta

Recuerda: Tu objetivo es VENDER usando información REAL, persuasión SUTIL y formato ATRACTIVO.`

    return systemPrompt
  }

  /**
   * Verificar si el mensaje es un saludo
   */
  static isGreeting(message: string): boolean {
    const messageLower = message.toLowerCase().trim()
    
    const greetings = [
      'hola',
      'buenas',
      'buenos dias',
      'buenos días',
      'buenas tardes',
      'buenas noches',
      'buen dia',
      'buen día',
      'hey',
      'ey',
      'saludos',
      'que tal',
      'qué tal',
      'como estas',
      'cómo estás',
      'holi',
      'holaaa'
    ]

    // Si es exactamente un saludo
    if (greetings.includes(messageLower)) {
      return true
    }

    // Si empieza con saludo y tiene menos de 20 caracteres
    const startsWithGreeting = greetings.some(greeting => 
      messageLower.startsWith(greeting) && messageLower.length < 20
    )

    return startsWithGreeting
  }

  /**
   * Obtener emoji según categoría del producto
   */
  private static getProductEmoji(product: any): string {
    const name = product.name.toLowerCase()
    const category = product.category

    // Por categoría
    if (category === 'DIGITAL') {
      if (name.includes('curso') || name.includes('megapack')) return '📚'
      if (name.includes('software')) return '💻'
      if (name.includes('ebook') || name.includes('libro')) return '📖'
      return '💾'
    }

    // Por nombre del producto
    if (name.includes('celular') || name.includes('phone')) return '📱'
    if (name.includes('laptop') || name.includes('portátil')) return '💻'
    if (name.includes('audífono') || name.includes('headphone')) return '🎧'
    if (name.includes('reloj') || name.includes('watch')) return '⌚'
    if (name.includes('tablet')) return '📱'
    if (name.includes('cámara') || name.includes('camera')) return '📷'
    if (name.includes('consola') || name.includes('playstation') || name.includes('xbox')) return '🎮'
    if (name.includes('teclado') || name.includes('keyboard')) return '⌨️'
    if (name.includes('mouse') || name.includes('ratón')) return '🖱️'
    if (name.includes('monitor') || name.includes('pantalla')) return '🖥️'

    return '📦'
  }

  /**
   * Formatear precio
   */
  private static formatPrice(price: number, currency: string = 'COP'): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price)
  }
}
