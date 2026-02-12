/**
 * 📅 Scheduler Service para App de Recordatorios
 * Sistema de programación de recordatorios automáticos
 */

import { ReminderWhatsAppService } from './reminder-app-whatsapp-service'
import { ReminderEmailService } from './reminder-app-email-service'

export interface ScheduledReminder {
  id: string
  userId: string
  title: string
  message: string
  dueDate: Date
  priority: 'high' | 'normal' | 'low'
  channels: ('whatsapp' | 'email')[]
  phoneNumber?: string
  email?: string
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly'
    interval: number
  }
  status: 'pending' | 'sent' | 'completed' | 'cancelled'
  createdAt: Date
  sentAt?: Date
}

export class ReminderScheduler {
  private static reminders: Map<string, ScheduledReminder> = new Map()
  private static timers: Map<string, NodeJS.Timeout> = new Map()
  private static isRunning = false

  /**
   * 🚀 Iniciar el scheduler
   */
  static start() {
    if (this.isRunning) return

    console.log('[Scheduler] 🚀 Iniciando sistema de recordatorios...')
    this.isRunning = true

    // Verificar recordatorios cada minuto
    setInterval(() => {
      this.checkPendingReminders()
    }, 60000) // 1 minuto

    // Verificar recordatorios vencidos cada 5 minutos
    setInterval(() => {
      this.checkOverdueReminders()
    }, 300000) // 5 minutos

    console.log('[Scheduler] ✅ Sistema iniciado')
  }

  /**
   * 📝 Programar nuevo recordatorio
   */
  static scheduleReminder(reminder: Omit<ScheduledReminder, 'id' | 'status' | 'createdAt'>): string {
    const id = `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const scheduledReminder: ScheduledReminder = {
      ...reminder,
      id,
      status: 'pending',
      createdAt: new Date()
    }

    this.reminders.set(id, scheduledReminder)

    // Programar timer si es para el futuro cercano (próximas 24 horas)
    const timeUntilDue = scheduledReminder.dueDate.getTime() - Date.now()
    if (timeUntilDue > 0 && timeUntilDue <= 24 * 60 * 60 * 1000) {
      const timer = setTimeout(() => {
        this.sendReminder(id)
      }, timeUntilDue)
      
      this.timers.set(id, timer)
    }

    console.log(`[Scheduler] 📝 Recordatorio programado: ${id} para ${scheduledReminder.dueDate.toLocaleString()}`)
    return id
  }

  /**
   * 📤 Enviar recordatorio
   */
  static async sendReminder(reminderId: string): Promise<boolean> {
    const reminder = this.reminders.get(reminderId)
    if (!reminder || reminder.status !== 'pending') {
      return false
    }

    console.log(`[Scheduler] 📤 Enviando recordatorio: ${reminder.title}`)

    let success = false

    // Enviar por WhatsApp
    if (reminder.channels.includes('whatsapp') && reminder.phoneNumber) {
      try {
        const whatsappSuccess = await ReminderWhatsAppService.sendReminder(
          reminder.userId,
          reminder.phoneNumber,
          `📋 *${reminder.title}*\n\n${reminder.message}`,
          {
            includeEmoji: true,
            urgent: reminder.priority === 'high'
          }
        )
        if (whatsappSuccess) success = true
      } catch (error) {
        console.error('[Scheduler] ❌ Error WhatsApp:', error)
      }
    }

    // Enviar por Email
    if (reminder.channels.includes('email') && reminder.email) {
      try {
        const emailSuccess = await ReminderEmailService.sendSimpleReminder(
          reminder.email,
          reminder.title,
          reminder.message,
          reminder.dueDate,
          reminder.priority
        )
        if (emailSuccess) success = true
      } catch (error) {
        console.error('[Scheduler] ❌ Error Email:', error)
      }
    }

    // Actualizar estado
    if (success) {
      reminder.status = 'sent'
      reminder.sentAt = new Date()
      
      // Programar recordatorio recurrente si aplica
      if (reminder.recurring) {
        this.scheduleRecurringReminder(reminder)
      }
    }

    // Limpiar timer
    const timer = this.timers.get(reminderId)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(reminderId)
    }

    return success
  }

  /**
   * 🔄 Programar recordatorio recurrente
   */
  private static scheduleRecurringReminder(originalReminder: ScheduledReminder) {
    if (!originalReminder.recurring) return

    const { type, interval } = originalReminder.recurring
    let nextDate = new Date(originalReminder.dueDate)

    switch (type) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + interval)
        break
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (interval * 7))
        break
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + interval)
        break
    }

    // Crear nuevo recordatorio
    this.scheduleReminder({
      userId: originalReminder.userId,
      title: originalReminder.title,
      message: originalReminder.message,
      dueDate: nextDate,
      priority: originalReminder.priority,
      channels: originalReminder.channels,
      phoneNumber: originalReminder.phoneNumber,
      email: originalReminder.email,
      recurring: originalReminder.recurring
    })
  }

  /**
   * ⏰ Verificar recordatorios pendientes
   */
  private static checkPendingReminders() {
    const now = new Date()
    
    for (const [id, reminder] of this.reminders.entries()) {
      if (reminder.status === 'pending' && reminder.dueDate <= now) {
        this.sendReminder(id)
      }
    }
  }

  /**
   * 🚨 Verificar recordatorios vencidos
   */
  private static checkOverdueReminders() {
    const now = new Date()
    const overdueThreshold = 24 * 60 * 60 * 1000 // 24 horas

    for (const [id, reminder] of this.reminders.entries()) {
      if (
        reminder.status === 'sent' && 
        reminder.sentAt &&
        (now.getTime() - reminder.sentAt.getTime()) > overdueThreshold
      ) {
        // Enviar recordatorio de seguimiento para tareas de alta prioridad
        if (reminder.priority === 'high' && reminder.email) {
          ReminderEmailService.sendUrgentAlert(
            reminder.email,
            `Recordatorio vencido: ${reminder.title}`,
            `Esta tarea sigue pendiente desde hace más de 24 horas: ${reminder.message}`,
            'Por favor, completa esta tarea lo antes posible o reprograma la fecha límite.'
          )
        }
      }
    }
  }

  /**
   * ✅ Marcar recordatorio como completado
   */
  static completeReminder(reminderId: string): boolean {
    const reminder = this.reminders.get(reminderId)
    if (!reminder) return false

    reminder.status = 'completed'

    // Enviar confirmación por email si está configurado
    if (reminder.email) {
      ReminderEmailService.sendTaskCompletedEmail(
        reminder.email,
        reminder.title
      )
    }

    console.log(`[Scheduler] ✅ Recordatorio completado: ${reminder.title}`)
    return true
  }

  /**
   * ❌ Cancelar recordatorio
   */
  static cancelReminder(reminderId: string): boolean {
    const reminder = this.reminders.get(reminderId)
    if (!reminder) return false

    reminder.status = 'cancelled'

    // Limpiar timer si existe
    const timer = this.timers.get(reminderId)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(reminderId)
    }

    console.log(`[Scheduler] ❌ Recordatorio cancelado: ${reminder.title}`)
    return true
  }

  /**
   * 📋 Obtener recordatorios de un usuario
   */
  static getUserReminders(userId: string, status?: ScheduledReminder['status']): ScheduledReminder[] {
    const userReminders = Array.from(this.reminders.values())
      .filter(r => r.userId === userId)

    if (status) {
      return userReminders.filter(r => r.status === status)
    }

    return userReminders
  }

  /**
   * 📊 Obtener estadísticas de un usuario
   */
  static getUserStats(userId: string): {
    total: number
    pending: number
    sent: number
    completed: number
    cancelled: number
    overdue: number
  } {
    const userReminders = this.getUserReminders(userId)
    const now = new Date()

    return {
      total: userReminders.length,
      pending: userReminders.filter(r => r.status === 'pending').length,
      sent: userReminders.filter(r => r.status === 'sent').length,
      completed: userReminders.filter(r => r.status === 'completed').length,
      cancelled: userReminders.filter(r => r.status === 'cancelled').length,
      overdue: userReminders.filter(r => 
        r.status === 'sent' && 
        r.dueDate < now && 
        (!r.sentAt || (now.getTime() - r.sentAt.getTime()) > 24 * 60 * 60 * 1000)
      ).length
    }
  }

  /**
   * 📧 Enviar reporte semanal a usuario
   */
  static async sendWeeklyReport(userId: string, email: string): Promise<boolean> {
    const stats = this.getUserStats(userId)
    
    return ReminderEmailService.sendWeeklyReport(email, {
      completedTasks: stats.completed,
      pendingTasks: stats.pending + stats.sent,
      overdueTask: stats.overdue,
      totalTasks: stats.total
    })
  }

  /**
   * 🧹 Limpiar recordatorios antiguos (más de 30 días completados/cancelados)
   */
  static cleanup() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    let cleaned = 0

    for (const [id, reminder] of this.reminders.entries()) {
      if (
        (reminder.status === 'completed' || reminder.status === 'cancelled') &&
        reminder.createdAt < thirtyDaysAgo
      ) {
        this.reminders.delete(id)
        
        // Limpiar timer si existe
        const timer = this.timers.get(id)
        if (timer) {
          clearTimeout(timer)
          this.timers.delete(id)
        }
        
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`[Scheduler] 🧹 Limpiados ${cleaned} recordatorios antiguos`)
    }
  }

  /**
   * 📊 Obtener estado del sistema
   */
  static getSystemStatus() {
    return {
      isRunning: this.isRunning,
      totalReminders: this.reminders.size,
      activeTimers: this.timers.size,
      reminders: Array.from(this.reminders.values()).map(r => ({
        id: r.id,
        title: r.title,
        status: r.status,
        dueDate: r.dueDate,
        priority: r.priority
      }))
    }
  }
}