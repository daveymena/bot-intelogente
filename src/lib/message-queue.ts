/**
 * 🔄 SISTEMA DE COLA DE MENSAJES
 * 
 * Asegura que cada usuario procese un mensaje a la vez,
 * evitando operaciones simultáneas y contexto mezclado.
 */

interface QueueItem {
  task: () => Promise<any>
  timestamp: number
}

export class MessageQueue {
  private queues: Map<string, QueueItem[]> = new Map()
  private processing: Set<string> = new Set()
  
  private readonly MAX_QUEUE_SIZE = 5
  private readonly QUEUE_TIMEOUT = 60000 // 60 segundos

  /**
   * Agregar tarea a la cola del usuario
   */
  async add<T>(userId: string, task: () => Promise<T>): Promise<T> {
    // Verificar límite de cola
    const queue = this.queues.get(userId) || []
    if (queue.length >= this.MAX_QUEUE_SIZE) {
      console.log(`[Queue] ⚠️ Cola llena para ${userId}`)
      throw new Error('Por favor espera a que responda tus mensajes anteriores.')
    }

    // Crear cola si no existe
    if (!this.queues.has(userId)) {
      this.queues.set(userId, [])
    }

    // Agregar tarea a la cola
    return new Promise((resolve, reject) => {
      const queueItem: QueueItem = {
        task: async () => {
          try {
            const result = await task()
            resolve(result)
          } catch (error) {
            reject(error)
          }
        },
        timestamp: Date.now()
      }

      this.queues.get(userId)!.push(queueItem)
      console.log(`[Queue] 📝 Mensaje agregado a cola de ${userId} (${this.queues.get(userId)!.length} en cola)`)

      // Procesar cola si no está procesando
      if (!this.processing.has(userId)) {
        this.processQueue(userId)
      }
    })
  }

  /**
   * Procesar cola del usuario
   */
  private async processQueue(userId: string) {
    if (this.processing.has(userId)) {
      console.log(`[Queue] ⏳ Ya procesando cola de ${userId}`)
      return
    }

    this.processing.add(userId)
    console.log(`[Queue] 🔄 Iniciando procesamiento de cola para ${userId}`)

    const queue = this.queues.get(userId)!

    while (queue.length > 0) {
      const item = queue.shift()!
      
      // Verificar timeout
      const waitTime = Date.now() - item.timestamp
      if (waitTime > this.QUEUE_TIMEOUT) {
        console.log(`[Queue] ⏰ Mensaje expirado para ${userId} (esperó ${waitTime}ms)`)
        continue
      }

      // Procesar tarea
      console.log(`[Queue] ⚙️ Procesando mensaje de ${userId} (${queue.length} restantes)`)
      await item.task()
    }

    // Limpiar
    this.processing.delete(userId)
    this.queues.delete(userId)
    console.log(`[Queue] ✅ Cola completada para ${userId}`)
  }

  /**
   * Obtener tamaño de cola del usuario
   */
  getQueueSize(userId: string): number {
    return this.queues.get(userId)?.length || 0
  }

  /**
   * Verificar si está procesando
   */
  isProcessing(userId: string): boolean {
    return this.processing.has(userId)
  }

  /**
   * Obtener estadísticas
   */
  getStats() {
    return {
      totalQueues: this.queues.size,
      processing: this.processing.size,
      queues: Array.from(this.queues.entries()).map(([userId, queue]) => ({
        userId,
        size: queue.length,
        isProcessing: this.processing.has(userId)
      }))
    }
  }
}

// Instancia global
export const messageQueue = new MessageQueue()
