# 🚀 Implementación: Flujo de Ventas Profesional Completo

## 📋 Resumen

Este documento contiene la implementación completa de un flujo de ventas profesional por etapas que resuelve el problema de selección de productos.

## ⚠️ IMPORTANTE

Esta es una implementación grande que requiere:
- Crear 1 archivo nuevo
- Modificar 1 archivo existente
- Probar el flujo completo

**Tiempo estimado:** 30-45 minutos de implementación + pruebas

## 🎯 Lo que Resuelve

✅ Calificación inteligente del cliente
✅ Recomendaciones personalizadas (2-3 productos)
✅ Detección correcta de selección numérica
✅ Presentación profesional con especificaciones
✅ Cierre de venta como agente profesional

## 📝 Paso 1: Crear el Nuevo Sistema

Crea el archivo: `src/lib/professional-computer-sales-flow.ts`

```typescript
/**
 * 🎯 FLUJO DE VENTAS PROFESIONAL PARA COMPUTADORES
 * Sistema completo de ventas por etapas con calificación y recomendación
 */

import { db } from './db'

export enum ComputerSalesStage {
  INITIAL = 'initial',              // Cliente pregunta por computadores
  QUALIFYING = 'qualifying',        // Bot califica necesidades
  RECOMMENDING = 'recommending',    // Bot muestra 2-3 opciones
  SELECTING = 'selecting',          // Cliente selecciona opción
  PRESENTING = 'presenting',        // Bot presenta detalles
  CLOSING = 'closing'               // Bot cierra venta
}

export interface ComputerSalesState {
  stage: ComputerSalesStage
  clientNeed?: string                // 'trabajo', 'gaming', 'estudio', etc.
  recommendedProducts: any[]         // 2-3 productos recomendados
  selectedProduct: any | null        // Producto seleccionado
  lastBotMessage: string            // Último mensaje del bot
}

export class ProfessionalComputerSalesFlow {
  private static states: Map<string, ComputerSalesState> = new Map()
  
  /**
   * Obtener o crear estado de conversación
   */
  static getState(conversationKey: string): ComputerSalesState {
    if (!this.states.has(conversationKey)) {
      this.states.set(conversationKey, {
        stage: ComputerSalesStage.INITIAL,
        recommendedProducts: [],
        selectedProduct: null,
        lastBotMessage: ''
      })
    }
    return this.states.get(conversationKey)!
  }
  
  /**
   * Actualizar estado
   */
  static updateState(conversationKey: string, updates: Partial<ComputerSalesState>) {
    const state = this.getState(conversationKey)
    Object.assign(state, updates)
  }
  
  /**
   * Detectar si el mensaje es sobre computadores
   */
  static isComputerInquiry(message: string): boolean {
    const keywords = [
      'computador', 'computadora', 'portátil', 'portatil', 'laptop',
      'notebook', 'pc', 'compu'
    ]
    const messageLower = message.toLowerCase()
    return keywords.some(kw => messageLower.includes(kw))
  }
  
  /**
   * Procesar mensaje según la etapa actual
   */
  static async processMessage(
    message: string,
    userId: string,
    conversationKey: string
  ): Promise<{ response: string; shouldSendPhoto: boolean; product?: any }> {
    const state = this.getState(conversationKey)
    
    console.log(`🎯 [ComputerSales] Etapa actual: ${state.stage}`)
    
    switch (state.stage) {
      case ComputerSalesStage.INITIAL:
        return await this.handleInitial(message, userId, conversationKey)
      
      case ComputerSalesStage.QUALIFYING:
        return await this.handleQualifying(message, userId, conversationKey)
      
      case ComputerSalesStage.SELECTING:
        return await this.handleSelecting(message, userId, conversationKey)
      
      case ComputerSalesStage.PRESENTING:
        return await this.handlePresenting(message, userId, conversationKey)
      
      default:
        return { response: '', shouldSendPhoto: false }
    }
  }
  
  /**
   * ETAPA 1: Consulta inicial - Calificar necesidades
   */
  private static async handleInitial(
    message: string,
    userId: string,
    conversationKey: string
  ): Promise<{ response: string; shouldSendPhoto: boolean }> {
    console.log('🎯 [ComputerSales] ETAPA 1: Calificación')
    
    const response = `¡Perfecto! 😊 Para recomendarte el mejor portátil, cuéntame:

¿Para qué lo vas a usar principalmente?

1️⃣ *Trabajo/Oficina* (Office, navegación, videollamadas)
2️⃣ *Estudio* (Tareas, investigación, clases online)
3️⃣ *Gaming* (Juegos, streaming)
4️⃣ *Diseño/Edición* (Photoshop, video, 3D)
5️⃣ *Uso básico* (Internet, redes sociales, videos)

Dime el número o descríbeme tu necesidad 😊`
    
    this.updateState(conversationKey, {
      stage: ComputerSalesStage.QUALIFYING,
      lastBotMessage: response
    })
    
    return { response, shouldSendPhoto: false }
  }
  
  /**
   * ETAPA 2: Calificación - Recomendar productos
   */
  private static async handleQualifying(
    message: string,
    userId: string,
    conversationKey: string
  ): Promise<{ response: string; shouldSendPhoto: false }> {
    console.log('🎯 [ComputerSales] ETAPA 2: Recomendación')
    
    // Detectar necesidad del cliente
    const need = this.detectClientNeed(message)
    console.log(`🎯 [ComputerSales] Necesidad detectada: ${need}`)
    
    // Buscar productos que se ajusten
    const products = await this.findMatchingProducts(need, userId)
    console.log(`🎯 [ComputerSales] ${products.length} productos encontrados`)
    
    if (products.length === 0) {
      return {
        response: '😅 Disculpa, no encontré portátiles disponibles en este momento. ¿Te gustaría ver otros productos?',
        shouldSendPhoto: false
      }
    }
    
    // Tomar los 3 mejores
    const topProducts = products.slice(0, 3)
    
    // Generar recomendación
    const response = this.generateRecommendation(topProducts, need)
    
    this.updateState(conversationKey, {
      stage: ComputerSalesStage.SELECTING,
      clientNeed: need,
      recommendedProducts: topProducts,
      lastBotMessage: response
    })
    
    return { response, shouldSendPhoto: false }
  }
  
  /**
   * ETAPA 3: Selección - Cliente elige opción
   */
  private static async handleSelecting(
    message: string,
    userId: string,
    conversationKey: string
  ): Promise<{ response: string; shouldSendPhoto: boolean; product?: any }> {
    console.log('🎯 [ComputerSales] ETAPA 3: Selección')
    
    const state = this.getState(conversationKey)
    
    // Detectar selección (1, 2, 3)
    const selection = this.detectSelection(message)
    console.log(`🎯 [ComputerSales] Selección detectada: ${selection}`)
    
    if (selection === null || selection < 1 || selection > state.recommendedProducts.length) {
      return {
        response: `😅 No entendí cuál opción elegiste. Por favor dime el número (1, 2 o 3) de la opción que te interesa 😊`,
        shouldSendPhoto: false
      }
    }
    
    // Obtener producto seleccionado
    const product = state.recommendedProducts[selection - 1]
    console.log(`🎯 [ComputerSales] Producto seleccionado: ${product.name}`)
    
    // Generar presentación profesional
    const response = this.generateProfessionalPresentation(product, state.clientNeed!)
    
    this.updateState(conversationKey, {
      stage: ComputerSalesStage.PRESENTING,
      selectedProduct: product,
      lastBotMessage: response
    })
    
    return {
      response,
      shouldSendPhoto: true,
      product
    }
  }
  
  /**
   * ETAPA 4: Presentación - Manejar preguntas y cerrar
   */
  private static async handlePresenting(
    message: string,
    userId: string,
    conversationKey: string
  ): Promise<{ response: string; shouldSendPhoto: boolean }> {
    console.log('🎯 [ComputerSales] ETAPA 4: Cierre')
    
    const state = this.getState(conversationKey)
    const messageLower = message.toLowerCase()
    
    // Detectar intención de compra
    if (this.isBuyingIntent(messageLower)) {
      const response = this.generatePaymentOptions(state.selectedProduct!)
      return { response, shouldSendPhoto: false }
    }
    
    // Detectar pregunta sobre especificaciones
    if (this.isSpecQuestion(messageLower)) {
      const response = this.generateDetailedSpecs(state.selectedProduct!)
      return { response, shouldSendPhoto: false }
    }
    
    // Respuesta general
    const response = `¿Tienes alguna pregunta sobre el ${state.selectedProduct!.name}? 😊

Puedo contarte más sobre:
• Especificaciones técnicas
• Garantía y soporte
• Métodos de pago
• Envío y entrega

O si ya estás listo, ¡podemos proceder con la compra! 💳`
    
    return { response, shouldSendPhoto: false }
  }
  
  /**
   * Detectar necesidad del cliente
   */
  private static detectClientNeed(message: string): string {
    const messageLower = message.toLowerCase()
    
    // Detectar por número
    if (messageLower.includes('1') || messageLower.includes('trabajo') || messageLower.includes('oficina')) {
      return 'trabajo'
    }
    if (messageLower.includes('2') || messageLower.includes('estudio') || messageLower.includes('estudiar')) {
      return 'estudio'
    }
    if (messageLower.includes('3') || messageLower.includes('gaming') || messageLower.includes('juego')) {
      return 'gaming'
    }
    if (messageLower.includes('4') || messageLower.includes('diseño') || messageLower.includes('edición')) {
      return 'diseño'
    }
    if (messageLower.includes('5') || messageLower.includes('básico') || messageLower.includes('basico')) {
      return 'basico'
    }
    
    // Detectar por keywords
    if (messageLower.includes('trabajo') || messageLower.includes('oficina')) return 'trabajo'
    if (messageLower.includes('estudio') || messageLower.includes('universidad')) return 'estudio'
    if (messageLower.includes('juego') || messageLower.includes('gaming')) return 'gaming'
    if (messageLower.includes('diseño') || messageLower.includes('editar')) return 'diseño'
    
    return 'general'
  }
  
  /**
   * Buscar productos que se ajusten a la necesidad
   */
  private static async findMatchingProducts(need: string, userId: string): Promise<any[]> {
    // Buscar portátiles
    const products = await db.product.findMany({
      where: {
        userId,
        status: 'AVAILABLE',
        category: 'PHYSICAL',
        OR: [
          { name: { contains: 'portátil', mode: 'insensitive' } },
          { name: { contains: 'portatil', mode: 'insensitive' } },
          { name: { contains: 'laptop', mode: 'insensitive' } }
        ]
      },
      orderBy: { price: 'asc' },
      take: 10
    })
    
    // Filtrar y rankear según necesidad
    return this.rankProductsByNeed(products, need)
  }
  
  /**
   * Rankear productos según necesidad
   */
  private static rankProductsByNeed(products: any[], need: string): any[] {
    return products.map(p => {
      let score = 0
      const nameLower = p.name.toLowerCase()
      const descLower = (p.description || '').toLowerCase()
      
      // Scoring según necesidad
      switch (need) {
        case 'gaming':
          if (nameLower.includes('gaming') || descLower.includes('gaming')) score += 100
          if (nameLower.includes('rtx') || nameLower.includes('gtx')) score += 50
          if (p.price > 3000000) score += 30
          break
        
        case 'diseño':
          if (nameLower.includes('i7') || nameLower.includes('ryzen 7')) score += 50
          if (descLower.includes('16gb') || descLower.includes('32gb')) score += 30
          if (p.price > 2000000) score += 20
          break
        
        case 'trabajo':
        case 'estudio':
          if (nameLower.includes('i5') || nameLower.includes('ryzen 5')) score += 40
          if (p.price < 2500000 && p.price > 1000000) score += 30
          break
        
        case 'basico':
          if (p.price < 1500000) score += 50
          if (nameLower.includes('i3') || nameLower.includes('ryzen 3')) score += 30
          break
      }
      
      return { ...p, _score: score }
    })
    .sort((a, b) => b._score - a._score)
  }
  
  /**
   * Generar recomendación
   */
  private static generateRecommendation(products: any[], need: string): string {
    const needText = {
      'trabajo': 'trabajo/oficina',
      'estudio': 'estudio',
      'gaming': 'gaming',
      'diseño': 'diseño/edición',
      'basico': 'uso básico',
      'general': 'uso general'
    }[need] || 'tus necesidades'
    
    let response = `¡Perfecto! Para *${needText}*, te recomiendo estas opciones:\n\n`
    
    products.forEach((product, index) => {
      const emoji = ['1️⃣', '2️⃣', '3️⃣'][index]
      const price = this.formatPrice(product.price)
      
      // Extraer specs básicas
      const specs = this.extractBasicSpecs(product)
      
      response += `${emoji} *${product.name}*\n`
      response += `   💰 ${price}\n`
      if (specs) response += `   ${specs}\n`
      response += `   ✅ ${this.getRecommendationReason(product, need)}\n\n`
    })
    
    response += `¿Cuál te llama más la atención? 😊`
    
    return response
  }
  
  /**
   * Generar presentación profesional
   */
  private static generateProfessionalPresentation(product: any, need: string): string {
    const price = this.formatPrice(product.price)
    
    let response = `¡Excelente elección! 😊 El *${product.name}* es perfecto para ti\n\n`
    response += `Te envío la foto y los detalles completos:\n\n`
    response += `💻 *Especificaciones Técnicas:*\n`
    response += this.generateDetailedSpecsList(product)
    response += `\n\n✅ *¿Por qué es perfecto para ${need}?*\n`
    response += this.generateBenefits(product, need)
    response += `\n\n💰 *Precio:* ${price}\n`
    response += `🎁 *Incluye:* Garantía 1 año\n\n`
    response += `¿Te gustaría comprarlo? Tengo disponibilidad inmediata 😊`
    
    return response
  }
  
  /**
   * Detectar selección numérica
   */
  private static detectSelection(message: string): number | null {
    const match = message.match(/\b([1-3])\b/)
    return match ? parseInt(match[1]) : null
  }
  
  /**
   * Detectar intención de compra
   */
  private static isBuyingIntent(message: string): boolean {
    const keywords = ['comprar', 'compro', 'quiero', 'me interesa', 'cómo pago', 'como pago', 'sí', 'si', 'dale']
    return keywords.some(kw => message.includes(kw))
  }
  
  /**
   * Detectar pregunta sobre especificaciones
   */
  private static isSpecQuestion(message: string): boolean {
    const keywords = ['especificaciones', 'características', 'detalles', 'specs', 'procesador', 'ram', 'disco']
    return keywords.some(kw => message.includes(kw))
  }
  
  /**
   * Generar opciones de pago
   */
  private static generatePaymentOptions(product: any): string {
    const price = this.formatPrice(product.price)
    
    return `¡Perfecto! 🎉 Procedamos con tu compra del *${product.name}*\n\n` +
           `💰 *Total:* ${price}\n\n` +
           `💳 *Métodos de pago disponibles:*\n` +
           `• Transferencia bancaria\n` +
           `• Nequi / Daviplata\n` +
           `• Tarjeta de crédito (MercadoPago)\n` +
           `• PayPal\n\n` +
           `📦 *Envío:* Gratis a toda Colombia\n` +
           `⏱️ *Entrega:* 2-3 días hábiles\n\n` +
           `¿Con cuál método prefieres pagar? 😊`
  }
  
  /**
   * Generar especificaciones detalladas
   */
  private static generateDetailedSpecs(product: any): string {
    return `📋 *Especificaciones Completas del ${product.name}:*\n\n` +
           this.generateDetailedSpecsList(product) +
           `\n\n¿Tienes alguna otra pregunta? 😊`
  }
  
  // Métodos auxiliares
  private static formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }
  
  private static extractBasicSpecs(product: any): string {
    const name = product.name.toLowerCase()
    const specs: string[] = []
    
    // Procesador
    if (name.includes('i7') || name.includes('ryzen 7')) specs.push('⚡ i7/Ryzen 7')
    else if (name.includes('i5') || name.includes('ryzen 5')) specs.push('⚡ i5/Ryzen 5')
    
    // RAM
    if (name.includes('16gb')) specs.push('💾 16GB RAM')
    else if (name.includes('8gb')) specs.push('💾 8GB RAM')
    
    // Almacenamiento
    if (name.includes('1tb')) specs.push('💿 1TB SSD')
    else if (name.includes('512gb')) specs.push('💿 512GB SSD')
    
    return specs.join(' | ')
  }
  
  private static generateDetailedSpecsList(product: any): string {
    const name = product.name
    const desc = product.description || ''
    
    // Extraer specs del nombre y descripción
    let specs = ''
    
    // Procesador
    const procMatch = name.match(/(Intel|AMD|Ryzen|Core)\s+[^\s]+/i)
    if (procMatch) specs += `• Procesador: ${procMatch[0]}\n`
    
    // RAM
    const ramMatch = name.match(/(\d+)gb\s*(ram|ddr\d)?/i)
    if (ramMatch) specs += `• RAM: ${ramMatch[1]}GB\n`
    
    // Almacenamiento
    const storageMatch = name.match(/(\d+)(gb|tb)\s*(ssd|hdd)?/i)
    if (storageMatch) specs += `• Almacenamiento: ${storageMatch[1]}${storageMatch[2].toUpperCase()} ${storageMatch[3] || 'SSD'}\n`
    
    // Pantalla
    const screenMatch = name.match(/(\d+\.?\d*)[″"]/i)
    if (screenMatch) specs += `• Pantalla: ${screenMatch[1]}" Full HD\n`
    
    if (!specs) {
      specs = `• ${name}\n• Ver descripción completa en la foto`
    }
    
    return specs
  }
  
  private static getRecommendationReason(product: any, need: string): string {
    const reasons = {
      'trabajo': 'Ideal para multitarea y Office',
      'estudio': 'Perfecto para clases online y tareas',
      'gaming': 'Excelente para juegos',
      'diseño': 'Potente para diseño y edición',
      'basico': 'Perfecto para uso diario',
      'general': 'Excelente relación calidad-precio'
    }
    return reasons[need] || reasons['general']
  }
  
  private static generateBenefits(product: any, need: string): string {
    const benefits = {
      'trabajo': '• Multitarea sin problemas\n• Ideal para Office y videollamadas\n• Batería de larga duración',
      'estudio': '• Perfecto para clases online\n• Rápido para investigación\n• Portátil y ligero',
      'gaming': '• Alto rendimiento en juegos\n• Gráficos fluidos\n• Refrigeración eficiente',
      'diseño': '• Potente para edición\n• Pantalla de calidad\n• RAM suficiente para multitarea',
      'basico': '• Rápido y confiable\n• Fácil de usar\n• Excelente precio',
      'general': '• Rendimiento equilibrado\n• Buena calidad\n• Garantía incluida'
    }
    return benefits[need] || benefits['general']
  }
}
```

## 📝 Paso 2: Integrar con Baileys Service

Modifica `src/lib/baileys-stable-service.ts` en el método `handleHybridResponse`:

Busca esta sección (alrededor de la línea 520):

```typescript
// 🔢 DETECTAR SELECCIÓN NUMÉRICA PRIMERO
const { NumericSelectionDetector } = await import('./numeric-selection-detector')
```

Y REEMPLÁZALA con:

```typescript
// 🎯 DETECTAR SI ES FLUJO DE VENTAS DE COMPUTADORES
const { ProfessionalComputerSalesFlow } = await import('./professional-computer-sales-flow')
const conversationKey = `${userId}:${from}`

// Si es consulta sobre computadores, usar flujo profesional
if (ProfessionalComputerSalesFlow.isComputerInquiry(messageText)) {
  console.log('[Baileys] 🎯 Usando flujo profesional de ventas de computadores')
  
  const result = await ProfessionalComputerSalesFlow.processMessage(
    messageText,
    userId,
    conversationKey
  )
  
  if (result.response) {
    // Enviar respuesta
    await socket.sendMessage(from, { text: result.response })
    await this.saveOutgoingMessage(userId, from, result.response, conversationId)
    
    // Si debe enviar foto del producto
    if (result.shouldSendPhoto && result.product) {
      const { ProductPhotoSender } = await import('./product-photo-sender')
      await ProductPhotoSender.sendProductsWithPhotos(socket, from, [result.product], 1)
    }
    
    // Actualizar historial
    history.push(
      { role: 'user', content: messageText },
      { role: 'assistant', content: result.response }
    )
    if (history.length > 20) history = history.slice(-20)
    this.conversationHistories.set(from, history)
    
    return // Terminar aquí
  }
}

// 🔢 DETECTAR SELECCIÓN NUMÉRICA (fallback para otros productos)
const { NumericSelectionDetector } = await import('./numeric-selection-detector')
```

## 🧪 Paso 3: Probar el Flujo

1. **Reinicia el servidor:**
```bash
npm run dev
```

2. **Prueba la conversación completa:**

```
👤: "Hola, tienes computadores?"
🤖: "¡Perfecto! Para recomendarte el mejor portátil...
     1️⃣ Trabajo/Oficina
     2️⃣ Estudio
     ..."

👤: "1" o "Para trabajo"
🤖: "¡Perfecto! Para trabajo/oficina, te recomiendo:
     1️⃣ Asus Vivobook 15 - $1.819.900
     2️⃣ Asus Vivobook 16 - $2.449.900
     ..."

👤: "1"
🤖: "¡Excelente elección! El Asus Vivobook 15...
     [FOTO + ESPECIFICACIONES]
     ¿Te gustaría comprarlo?"

👤: "Sí, cómo pago?"
🤖: "¡Perfecto! Métodos de pago:
     • Transferencia
     • Nequi
     ..."
```

## 📊 Logs Esperados

```
🎯 [ComputerSales] Etapa actual: initial
🎯 [ComputerSales] ETAPA 1: Calificación
🎯 [ComputerSales] Etapa actual: qualifying
🎯 [ComputerSales] ETAPA 2: Recomendación
🎯 [ComputerSales] Necesidad detectada: trabajo
🎯 [ComputerSales] 8 productos encontrados
🎯 [ComputerSales] Etapa actual: selecting
🎯 [ComputerSales] ETAPA 3: Selección
🎯 [ComputerSales] Selección detectada: 1
🎯 [ComputerSales] Producto seleccionado: Portátil Asus...
```

## ✅ Ventajas de Este Sistema

1. **Flujo estructurado** - Cada etapa tiene su propósito
2. **Memoria de estado** - Recuerda dónde está cada cliente
3. **Recomendaciones inteligentes** - Basadas en necesidades reales
4. **Presentación profesional** - Como un vendedor experto
5. **Fácil de extender** - Puedes agregar más etapas o productos

## 🔧 Personalización

### Agregar más necesidades:

En `detectClientNeed()`, agrega:
```typescript
if (messageLower.includes('programación') || messageLower.includes('desarrollo')) {
  return 'programacion'
}
```

### Cambiar número de recomendaciones:

En `handleQualifying()`, cambia:
```typescript
const topProducts = products.slice(0, 3) // Cambiar 3 por el número deseado
```

### Personalizar mensajes:

Modifica las funciones `generate*()` con tu estilo preferido.

## 📝 Notas Importantes

- El estado se guarda en memoria (se pierde al reiniciar)
- Para producción, considera guardar en base de datos
- El sistema detecta automáticamente consultas sobre computadores
- Funciona en paralelo con el sistema híbrido existente

## ✅ Checklist de Implementación

- [ ] Crear `professional-computer-sales-flow.ts`
- [ ] Modificar `baileys-stable-service.ts`
- [ ] Reiniciar servidor
- [ ] Probar flujo completo
- [ ] Verificar logs
- [ ] Ajustar mensajes si es necesario

---

**¿Listo para implementar?** Sigue los pasos en orden y prueba cada etapa. Si algo falla, revisa los logs para ver en qué etapa está.
