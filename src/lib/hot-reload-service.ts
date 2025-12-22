/**
 * 🔥 SERVICIO DE HOT RELOAD
 * Recarga automáticamente configuraciones y datos sin reiniciar el servidor
 */

import { watch } from 'fs'
import path from 'path'
import { db } from './db'

export class HotReloadService {
  private static watchers: Map<string, any> = new Map()
  private static isEnabled = process.env.HOT_RELOAD_ENABLED !== 'false'

  /**
   * Inicializar sistema de hot reload
   */
  static initialize() {
    if (!this.isEnabled) {
      console.log('[Hot Reload] ⚠️ Hot reload deshabilitado')
      return
    }

    console.log('[Hot Reload] 🔥 Inicializando sistema de hot reload...')

    // Vigilar cambios en productos
    this.watchProducts()

    // Vigilar cambios en configuración
    this.watchSettings()

    // Vigilar cambios en archivos de prompts
    this.watchPrompts()

    console.log('[Hot Reload] ✅ Sistema de hot reload activo')
  }

  /**
   * Vigilar cambios en productos de la base de datos
   */
  private static watchProducts() {
    // Recargar productos cada 30 segundos si hay cambios
    setInterval(async () => {
      try {
        const products = await db.product.findMany({
          where: { status: 'AVAILABLE' },
          orderBy: { updatedAt: 'desc' },
          take: 1
        })

        if (products.length > 0) {
          const lastUpdate = products[0].updatedAt
          const cacheKey = 'last_product_update'
          const cached = this.getCache(cacheKey)

          if (!cached || cached !== lastUpdate.toISOString()) {
            console.log('[Hot Reload] 🔄 Productos actualizados, recargando caché...')
            this.setCache(cacheKey, lastUpdate.toISOString())
            
            // Emitir evento de recarga
            this.emit('products:updated')
          }
        }
      } catch (error) {
        // Silencioso, no molestar con errores de polling
      }
    }, 30000) // Cada 30 segundos
  }

  /**
   * Vigilar cambios en configuración (usando productos como proxy)
   */
  private static watchSettings() {
    // Por ahora, usar cambios en productos como indicador de configuración
    // En el futuro se puede agregar una tabla Settings si es necesario
    setInterval(async () => {
      try {
        // Verificar si hay cambios en la configuración del sistema
        // Por ahora solo emitimos el evento para mantener la estructura
        this.emit('settings:updated')
      } catch (error) {
        // Silencioso
      }
    }, 60000) // Cada 60 segundos (menos frecuente)
  }

  /**
   * Vigilar cambios en archivos de prompts
   */
  private static watchPrompts() {
    const scriptsDir = path.join(process.cwd(), 'scripts')
    
    try {
      const watcher = watch(scriptsDir, { recursive: false }, (eventType, filename) => {
        if (filename && filename.startsWith('agregar-prompt-')) {
          console.log(`[Hot Reload] 🔄 Archivo de prompt modificado: ${filename}`)
          this.emit('prompts:updated', filename)
        }
      })

      this.watchers.set('prompts', watcher)
    } catch (error) {
      console.log('[Hot Reload] ⚠️ No se pudo vigilar directorio de scripts')
    }
  }

  /**
   * Sistema simple de caché en memoria
   */
  private static cache: Map<string, any> = new Map()

  private static getCache(key: string): any {
    return this.cache.get(key)
  }

  private static setCache(key: string, value: any): void {
    this.cache.set(key, value)
  }

  /**
   * Sistema simple de eventos
   */
  private static listeners: Map<string, Array<(payload?: unknown) => void>> = new Map()

  static on(event: string, callback: (payload?: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  private static emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event) || []
    callbacks.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`[Hot Reload] Error en listener de ${event}:`, error)
      }
    })
  }

  /**
   * Detener todos los watchers
   */
  static stop() {
    console.log('[Hot Reload] 🛑 Deteniendo hot reload...')
    this.watchers.forEach(watcher => {
      try {
        watcher.close()
      } catch (error) {
        // Ignorar errores al cerrar
      }
    })
    this.watchers.clear()
  }

  /**
   * Forzar recarga de productos
   */
  static async reloadProducts() {
    console.log('[Hot Reload] 🔄 Forzando recarga de productos...')
    this.emit('products:updated')
  }

  /**
   * Forzar recarga de configuración
   */
  static async reloadSettings() {
    console.log('[Hot Reload] 🔄 Forzando recarga de configuración...')
    this.emit('settings:updated')
  }
}

// Inicializar automáticamente si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  HotReloadService.initialize()
}
