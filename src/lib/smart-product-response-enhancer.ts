/**
 * 🎯 MEJORADOR INTELIGENTE DE RESPUESTAS DE PRODUCTOS
 * 
 * Detecta cuando Groq responde sobre un producto específico y:
 * 1. Envía la foto del producto automáticamente
 * 2. Mejora el formato de la respuesta
 * 3. Guarda el producto en contexto
 */

import { WASocket } from '@whiskeysockets/baileys'
import { db } from './db'
import { ProductPhotoSender } from './product-photo-sender'
import { ConversationContextService } from './conversation-context-service'

export class SmartProductResponseEnhancer {
  
  /**
   * Detectar si la respuesta de Groq menciona un producto específico
   * y enviar su foto automáticamente
   */
  static async enhanceProductResponse(
    socket: WASocket,
    userId: string,
    from: string,
    userMessage: string,
    aiResponse: string,
    conversationId: string
  ): Promise<{ enhanced: boolean; productSent?: string }> {
    
    try {
      console.log('[SmartEnhancer] 🔍 Analizando respuesta para detectar productos...')
      
      // 🚨 NO ENVIAR si la respuesta es negativa
      if (this.isNegativeResponse(aiResponse)) {
        console.log('[SmartEnhancer] ❌ Respuesta negativa detectada - NO enviar producto')
        return { enhanced: false }
      }
      
      // 🎯 PRIORIDAD 1: Usar el producto del contexto de conversación
      const conversationKey = `${userId}:${from}`
      const context = ConversationContextService.getProductContext(conversationKey)
      
      let product: any = null
      
      if (context && context.lastProductId) {
        console.log(`[SmartEnhancer] 💾 Usando producto del contexto: ${context.lastProductName}`)
        
        // Obtener producto de la BD
        product = await db.product.findUnique({
          where: { id: context.lastProductId }
        })
        
        if (product) {
          console.log(`[SmartEnhancer] ✅ Producto del contexto encontrado: ${product.name}`)
        }
      }
      
      // 🚨 SI NO HAY PRODUCTO EN CONTEXTO, NO ENVIAR NADA
      // Esto evita confusiones y envíos de productos incorrectos
      if (!product) {
        console.log('[SmartEnhancer] ⚠️ NO hay producto en contexto - NO enviar nada')
        console.log('[SmartEnhancer] ℹ️ El producto debe estar en memoria para enviar foto')
        return { enhanced: false }
      }
      
      console.log(`[SmartEnhancer] 📦 Producto final: ${product.name}`)
      
      // Enviar foto del producto automáticamente
      const photoResult = await ProductPhotoSender.sendProductsWithPhotos(
        socket,
        from,
        [product],
        1
      )
      
      if (photoResult.sent > 0) {
        console.log('[SmartEnhancer] 📸 Foto enviada automáticamente')
        
        // Guardar producto en contexto
        const conversationKey = `${userId}:${from}`
        ConversationContextService.setProductContext(
          conversationKey,
          product.id,
          product.name
        )
        
        // Guardar en BD
        await db.message.create({
          data: {
            conversationId,
            content: `[Foto de ${product.name} enviada automáticamente]`,
            direction: 'OUTGOING',
            type: 'IMAGE'
          }
        })
        
        return { enhanced: true, productSent: product.name }
      }
      
      return { enhanced: false }
      
    } catch (error) {
      console.error('[SmartEnhancer] ❌ Error mejorando respuesta:', error)
      return { enhanced: false }
    }
  }
  
  /**
   * Detectar si la respuesta es negativa (no tiene el producto)
   */
  private static isNegativeResponse(response: string): boolean {
    const normalized = response.toLowerCase()
    
    const negativePatterns = [
      /no tengo/i,
      /no cuento con/i,
      /no dispongo/i,
      /no está disponible/i,
      /no lo tengo/i,
      /no tenemos/i,
      /lo siento.*no/i,
      /disculpa.*no/i,
      /lamentablemente.*no/i,
      /no encontré/i,
      /no hay/i
    ]
    
    return negativePatterns.some(pattern => pattern.test(normalized))
  }

  /**
   * Detectar si la respuesta menciona un producto específico
   */
  private static detectProductMention(response: string): boolean {
    const normalized = response.toLowerCase()
    
    // Patrones que indican mención de producto específico
    const patterns = [
      /te recomiendo (el|la|este|esta)/i,
      /perfecto para ti (es|sería)/i,
      /tengo (el|la|este|esta)/i,
      /curso de/i,
      /laptop.*para/i,
      /moto.*modelo/i,
      /megapack de/i,
      /incluye.*módulos/i,
      /aprenderás.*con/i,
      /precio.*\$[\d,]+/i
    ]
    
    return patterns.some(pattern => pattern.test(normalized))
  }
  
  /**
   * Buscar el producto mencionado en la base de datos
   */
  private static async findProductInDatabase(
    userId: string,
    aiResponse: string,
    userMessage: string
  ): Promise<any> {
    
    try {
      // Extraer palabras clave del mensaje del usuario y la respuesta de IA
      const keywords = this.extractKeywords(userMessage + ' ' + aiResponse)
      
      console.log('[SmartEnhancer] 🔑 Palabras clave:', keywords.join(', '))
      
      // Buscar productos que coincidan con las palabras clave
      const products = await db.product.findMany({
        where: {
          userId,
          OR: keywords.map(keyword => ({
            OR: [
              { name: { contains: keyword, mode: 'insensitive' } },
              { description: { contains: keyword, mode: 'insensitive' } }
            ]
          }))
        },
        take: 5
      })
      
      if (products.length === 0) {
        return null
      }
      
      // Si hay múltiples productos, elegir el más relevante
      if (products.length === 1) {
        return products[0]
      }
      
      // Calcular relevancia de cada producto
      const scored = products.map(product => {
        let score = 0
        const productText = `${product.name} ${product.description}`.toLowerCase()
        
        keywords.forEach(keyword => {
          if (productText.includes(keyword.toLowerCase())) {
            score += 1
          }
        })
        
        // Bonus si el nombre del producto aparece en la respuesta de IA
        if (aiResponse.toLowerCase().includes(product.name.toLowerCase())) {
          score += 5
        }
        
        return { product, score }
      })
      
      // Ordenar por score y devolver el más relevante
      scored.sort((a, b) => b.score - a.score)
      
      console.log('[SmartEnhancer] 📊 Producto más relevante:', scored[0].product.name, 'Score:', scored[0].score)
      
      return scored[0].product
      
    } catch (error) {
      console.error('[SmartEnhancer] ❌ Error buscando producto:', error)
      return null
    }
  }
  
  /**
   * Extraer palabras clave relevantes
   */
  private static extractKeywords(text: string): string[] {
    const normalized = text.toLowerCase()
    
    const keywords: string[] = []
    
    // Palabras clave de cursos
    const coursePatterns = [
      /curso de ([a-záéíóúñ\s]+)/gi,
      /aprende ([a-záéíóúñ\s]+)/gi,
      /aprender ([a-záéíóúñ\s]+)/gi
    ]
    
    coursePatterns.forEach(pattern => {
      const matches = normalized.matchAll(pattern)
      for (const match of matches) {
        if (match[1]) {
          keywords.push(match[1].trim())
        }
      }
    })
    
    // Palabras clave de productos físicos
    const productKeywords = [
      'laptop', 'computador', 'portátil',
      'moto', 'motocicleta',
      'megapack', 'mega pack',
      'piano', 'guitarra', 'música',
      'diseño', 'gráfico', 'edición',
      'programación', 'desarrollo', 'web',
      'marketing', 'digital', 'ventas'
    ]
    
    productKeywords.forEach(keyword => {
      if (normalized.includes(keyword)) {
        keywords.push(keyword)
      }
    })
    
    // Remover duplicados
    return [...new Set(keywords)]
  }
}
