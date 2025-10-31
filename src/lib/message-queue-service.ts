/**
 * 📬 SERVICIO DE COLA DE MENSAJES
 * Maneja mensajes pendientes cuando el bot se desconecta
 */

import { db } from './db'

interface QueuedMessage {
  id: string
  phoneNumber: string
  message: string
  type: 'text' | 'image' | 'audio'
  metadata?: any
  attempts: number
  createdAt: Date
}

export class MessageQueueService {
  private static processingQueue = false

  /**
   * Agregar mensaje a la cola
   */
  static async enqueue(
    phoneNumber: string,
    message: string,
    type: 'text' | 'image' | 'audio' = 'text',
    metadata?: any
  ): Promise<void> {
    try {
      console.log('[Queue] 📬 Agregando mensaje a la cola:', { phoneNumber, type })

      // Guardar en base de datos
      await db.messageQueue.create({
        data: {
          phoneNumber,
          message,
          type,
          metadata: metadata ? JSON.stringify(metadata) : null,
          attempts: 0,
          status: 'PENDING'
        }
      })

      console.log('[Queue] ✅ Mensaje agregado a la cola')
    } catch (error) {
      console.error('[Queue] ❌ Error agregando mensaje a la cola:', error)
    }
  }

  /**
   * Procesar mensajes pendientes
   */
  static async processPendingMessages(sendFunction: (phone: string, msg: string, metadata?: any) => Promise<boolean>): Promise<void> {
    if (this.processingQueue) {
      console.log('[Queue] ⏳ Ya hay un proceso de cola en ejecución')
      return
    }

    try {
      this.processingQueue = true
      console.log('[Queue] 🔄 Procesando mensajes pendientes...')

      // Obtener mensajes pendientes (máximo 50 a la vez)
      const pendingMessages = await db.messageQueue.findMany({
        where: {
          status: 'PENDING',
          attempts: { lt: 3 } // Máximo 3 intentos
        },
        orderBy: { createdAt: 'asc' },
        take: 50
      })

      if (pendingMessages.length === 0) {
        console.log('[Queue] ✅ No hay mensajes pendientes')
        return
      }

      console.log(`[Queue] 📨 Procesando ${pendingMessages.length} mensajes pendientes...`)

      for (const msg of pendingMessages) {
        try {
          // Incrementar intentos
          await db.messageQueue.update({
            where: { id: msg.id },
            data: { attempts: msg.attempts + 1 }
          })

          // Parsear metadata si existe
          const metadata = msg.metadata ? JSON.parse(msg.metadata as string) : undefined

          // Intentar enviar
          const success = await sendFunction(msg.phoneNumber, msg.message, metadata)

          if (success) {
            // Marcar como enviado
            await db.messageQueue.update({
              where: { id: msg.id },
              data: { 
                status: 'SENT',
                sentAt: new Date()
              }
            })
            console.log(`[Queue] ✅ Mensaje enviado: ${msg.id}`)
          } else {
            // Si falló y ya tiene 3 intentos, marcar como fallido
            if (msg.attempts + 1 >= 3) {
              await db.messageQueue.update({
                where: { id: msg.id },
                data: { status: 'FAILED' }
              })
              console.log(`[Queue] ❌ Mensaje fallido después de 3 intentos: ${msg.id}`)
            }
          }

          // Pequeña pausa entre mensajes para no saturar
          await new Promise(resolve => setTimeout(resolve, 1000))

        } catch (error) {
          console.error(`[Queue] ❌ Error procesando mensaje ${msg.id}:`, error)
          
          // Si ya tiene 3 intentos, marcar como fallido
          if (msg.attempts + 1 >= 3) {
            await db.messageQueue.update({
              where: { id: msg.id },
              data: { status: 'FAILED' }
            })
          }
        }
      }

      console.log('[Queue] ✅ Procesamiento de cola completado')

    } catch (error) {
      console.error('[Queue] ❌ Error procesando cola:', error)
    } finally {
      this.processingQueue = false
    }
  }

  /**
   * Limpiar mensajes antiguos (más de 7 días)
   */
  static async cleanOldMessages(): Promise<void> {
    try {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const result = await db.messageQueue.deleteMany({
        where: {
          OR: [
            { status: 'SENT', sentAt: { lt: sevenDaysAgo } },
            { status: 'FAILED', createdAt: { lt: sevenDaysAgo } }
          ]
        }
      })

      console.log(`[Queue] 🧹 Limpiados ${result.count} mensajes antiguos`)
    } catch (error) {
      console.error('[Queue] ❌ Error limpiando mensajes antiguos:', error)
    }
  }

  /**
   * Obtener estadísticas de la cola
   */
  static async getQueueStats(): Promise<{
    pending: number
    sent: number
    failed: number
  }> {
    try {
      const [pending, sent, failed] = await Promise.all([
        db.messageQueue.count({ where: { status: 'PENDING' } }),
        db.messageQueue.count({ where: { status: 'SENT' } }),
        db.messageQueue.count({ where: { status: 'FAILED' } })
      ])

      return { pending, sent, failed }
    } catch (error) {
      console.error('[Queue] ❌ Error obteniendo estadísticas:', error)
      return { pending: 0, sent: 0, failed: 0 }
    }
  }
}
