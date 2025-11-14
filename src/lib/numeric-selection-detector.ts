/**
 * 🔢 DETECTOR DE SELECCIÓN NUMÉRICA
 * Detecta cuando el cliente está seleccionando una opción de una lista previa
 */

import { db } from './db'

export interface NumericSelection {
  isSelection: boolean
  selectedNumber?: number
  selectedProduct?: any
  confidence: number
}

export class NumericSelectionDetector {
  /**
   * Detectar si el mensaje es una selección numérica
   */
  static async detectSelection(
    message: string,
    conversationHistory: any[],
    userId: string
  ): Promise<NumericSelection> {
    const messageLower = message.toLowerCase().trim()
    
    // Buscar números en el mensaje
    const numberMatch = messageLower.match(/\b([1-9]|10)\b/)
    if (!numberMatch) {
      return { isSelection: false, confidence: 0 }
    }
    
    const selectedNumber = parseInt(numberMatch[1])
    console.log(`🔢 [NumericSelection] Número detectado: ${selectedNumber}`)
    
    // Verificar si el mensaje anterior del bot contenía una lista numerada
    const lastBotMessage = this.getLastBotMessage(conversationHistory)
    if (!lastBotMessage) {
      console.log('🔢 [NumericSelection] No hay mensaje previo del bot')
      return { isSelection: false, confidence: 0 }
    }
    
    // Verificar si el mensaje del bot tenía opciones numeradas
    const hasNumberedList = this.hasNumberedOptions(lastBotMessage)
    if (!hasNumberedList) {
      console.log('🔢 [NumericSelection] El mensaje previo no tenía lista numerada')
      return { isSelection: false, confidence: 0 }
    }
    
    console.log('🔢 [NumericSelection] ✅ Lista numerada detectada en mensaje previo')
    
    // Extraer productos de la lista
    const products = await this.extractProductsFromList(lastBotMessage, userId)
    if (products.length === 0) {
      console.log('🔢 [NumericSelection] No se pudieron extraer productos de la lista')
      return { isSelection: false, confidence: 0 }
    }
    
    console.log(`🔢 [NumericSelection] ${products.length} productos extraídos de la lista`)
    
    // Verificar que el número seleccionado esté en rango
    if (selectedNumber < 1 || selectedNumber > products.length) {
      console.log(`🔢 [NumericSelection] Número ${selectedNumber} fuera de rango (1-${products.length})`)
      return { isSelection: false, confidence: 0 }
    }
    
    // Obtener el producto seleccionado
    const selectedProduct = products[selectedNumber - 1]
    console.log(`🔢 [NumericSelection] ✅ Producto seleccionado: ${selectedProduct.name}`)
    
    return {
      isSelection: true,
      selectedNumber,
      selectedProduct,
      confidence: 95
    }
  }
  
  /**
   * Obtener el último mensaje del bot
   */
  private static getLastBotMessage(history: any[]): string | null {
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === 'assistant') {
        return history[i].content
      }
    }
    return null
  }
  
  /**
   * Verificar si el mensaje tiene opciones numeradas
   */
  private static hasNumberedOptions(message: string): boolean {
    // Buscar patrones como "1️⃣", "1.", "1)", etc.
    const patterns = [
      /[1-9]️⃣/,           // Emoji numerado
      /\n\s*[1-9]\./,     // 1. al inicio de línea
      /\n\s*[1-9]\)/,     // 1) al inicio de línea
      /\n\s*[1-9]\s*-/,   // 1 - al inicio de línea
    ]
    
    return patterns.some(pattern => pattern.test(message))
  }
  
  /**
   * Extraer productos de una lista numerada
   */
  private static async extractProductsFromList(
    message: string,
    userId: string
  ): Promise<any[]> {
    const products: any[] = []
    
    // MÉTODO 1: Buscar nombres entre asteriscos (formato: *Nombre del Producto*)
    const productNameRegex = /\*([^*]+)\*/g
    let matches = [...message.matchAll(productNameRegex)]
    
    if (matches.length > 0) {
      console.log(`🔢 [NumericSelection] ${matches.length} nombres encontrados entre asteriscos`)
      
      // Buscar cada producto en la base de datos
      for (const match of matches) {
        const productName = match[1].trim()
        
        // Ignorar textos que no son nombres de productos
        if (productName.includes('💰') || productName.includes('$') || 
            productName.length < 5 || productName.includes('Disponibles')) {
          continue
        }
        
        // Buscar producto por nombre
        const product = await db.product.findFirst({
          where: {
            userId,
            status: 'AVAILABLE',
            name: {
              contains: productName,
              mode: 'insensitive'
            }
          }
        })
        
        if (product) {
          products.push(product)
          console.log(`🔢 [NumericSelection] ✅ Producto encontrado: ${product.name}`)
        }
      }
      
      if (products.length > 0) {
        return products
      }
    }
    
    // MÉTODO 2: Buscar por líneas numeradas (1️⃣, 2️⃣, etc.) - ORDEN PRESERVADO
    console.log('🔢 [NumericSelection] Intentando método 2: líneas numeradas')
    const lines = message.split('\n')
    const numberedLines: Array<{ position: number; text: string }> = []
    
    for (const line of lines) {
      // Buscar líneas que empiecen con emoji numerado o número
      let position = -1
      let text = ''
      
      if (/^[1-9]️⃣/.test(line.trim())) {
        const match = line.match(/^([1-9])️⃣\s*(.+)/)
        if (match) {
          position = parseInt(match[1])
          text = match[2].trim()
        }
      } else if (/^[1-9]\./.test(line.trim())) {
        const match = line.match(/^([1-9])\.\s*(.+)/)
        if (match) {
          position = parseInt(match[1])
          text = match[2].trim()
        }
      } else if (/^[1-9]\)/.test(line.trim())) {
        const match = line.match(/^([1-9])\)\s*(.+)/)
        if (match) {
          position = parseInt(match[1])
          text = match[2].trim()
        }
      }
      
      if (position > 0 && text.length > 5) {
        numberedLines.push({ position, text })
      }
    }
    
    // Ordenar por posición para mantener el orden correcto
    numberedLines.sort((a, b) => a.position - b.position)
    
    console.log(`🔢 [NumericSelection] ${numberedLines.length} líneas numeradas encontradas (ordenadas)`)
    
    // Buscar productos por las líneas numeradas EN ORDEN
    for (const item of numberedLines) {
      // Extraer palabras clave (ignorar emojis y precios)
      const cleanLine = item.text.replace(/[💰$\d,\.]/g, '').trim()
      const keywords = cleanLine.split(' ').filter(w => w.length > 3).slice(0, 3).join(' ')
      
      if (keywords.length < 5) {
        console.log(`🔢 [NumericSelection] ⚠️ Posición ${item.position}: keywords muy cortos, saltando`)
        continue
      }
      
      console.log(`🔢 [NumericSelection] Posición ${item.position}: Buscando con keywords: "${keywords}"`)
      
      const product = await db.product.findFirst({
        where: {
          userId,
          status: 'AVAILABLE',
          name: {
            contains: keywords,
            mode: 'insensitive'
          }
        }
      })
      
      if (product) {
        products.push(product)
        console.log(`🔢 [NumericSelection] ✅ Posición ${item.position}: ${product.name}`)
      } else {
        console.log(`🔢 [NumericSelection] ❌ Posición ${item.position}: No encontrado`)
      }
    }
    
    if (products.length === 0) {
      console.log('🔢 [NumericSelection] ❌ No se pudieron extraer productos con ningún método')
    }
    
    return products
  }
}
