/**
 * SharedMemoryService
 * Servicio de memoria compartida para mantener listas de productos activas
 * y permitir selección numérica contextual
 */

import { Product } from '@prisma/client'

interface ProductList {
  products: Product[]
  timestamp: number
  expiresAt: number
}

export class SharedMemoryService {
  private static instance: SharedMemoryService
  private productLists: Map<string, ProductList> = new Map()
  private readonly EXPIRATION_TIME = 5 * 60 * 1000 // 5 minutos

  private constructor() {
    // Limpiar listas expiradas cada minuto
    setInterval(() => this.cleanupExpiredLists(), 60000)
  }

  static getInstance(): SharedMemoryService {
    if (!SharedMemoryService.instance) {
      SharedMemoryService.instance = new SharedMemoryService()
    }
    return SharedMemoryService.instance
  }

  /**
   * Guardar lista de productos para un chat
   */
  setProductList(chatId: string, products: Product[]): void {
    const now = Date.now()
    this.productLists.set(chatId, {
      products,
      timestamp: now,
      expiresAt: now + this.EXPIRATION_TIME
    })
    console.log(`[SharedMemory] Lista guardada para ${chatId}: ${products.length} productos`)
  }

  /**
   * Verificar si hay una lista activa
   */
  hasActiveProductList(chatId: string): boolean {
    const list = this.productLists.get(chatId)
    if (!list) return false
    
    if (Date.now() > list.expiresAt) {
      this.productLists.delete(chatId)
      return false
    }
    
    return true
  }

  /**
   * Obtener producto por posición (1-indexed)
   */
  getProductByPosition(chatId: string, position: number): Product | null {
    const list = this.productLists.get(chatId)
    if (!list || Date.now() > list.expiresAt) {
      return null
    }

    const index = position - 1
    if (index < 0 || index >= list.products.length) {
      return null
    }

    return list.products[index]
  }

  /**
   * Obtener toda la lista
   */
  getProductList(chatId: string): Product[] | null {
    const list = this.productLists.get(chatId)
    if (!list || Date.now() > list.expiresAt) {
      return null
    }
    return list.products
  }

  /**
   * Limpiar lista de un chat
   */
  clearProductList(chatId: string): void {
    this.productLists.delete(chatId)
    console.log(`[SharedMemory] Lista limpiada para ${chatId}`)
  }

  /**
   * Limpiar listas expiradas
   */
  private cleanupExpiredLists(): void {
    const now = Date.now()
    let cleaned = 0
    
    for (const [chatId, list] of this.productLists.entries()) {
      if (now > list.expiresAt) {
        this.productLists.delete(chatId)
        cleaned++
      }
    }
    
    if (cleaned > 0) {
      console.log(`[SharedMemory] ${cleaned} listas expiradas limpiadas`)
    }
  }

  /**
   * Obtener estadísticas
   */
  getStats(): { activeLists: number; totalProducts: number } {
    let totalProducts = 0
    for (const list of this.productLists.values()) {
      totalProducts += list.products.length
    }
    
    return {
      activeLists: this.productLists.size,
      totalProducts
    }
  }
}
