/**
 * 📧 Email Service para App de Recordatorios
 * Basado en Smart Sales Bot Pro - Adaptado para recordatorios
 */

import nodemailer from 'nodemailer'

export interface ReminderEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  priority?: 'high' | 'normal' | 'low'
}

export class ReminderEmailService {
  private static getTransporter() {
    const emailUser = process.env.EMAIL_USER
    const emailPass = process.env.EMAIL_PASS
    const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com'
    const emailPort = parseInt(process.env.EMAIL_PORT || '587')
    
    if (!emailUser || !emailPass) {
      console.log('⚠️  EMAIL no configurado - Simulando envío...')
      return null
    }
    
    return nodemailer.createTransporter({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    })
  }

  /**
   * 📤 Enviar email genérico
   */
  static async sendEmail(options: ReminderEmailOptions): Promise<boolean> {
    try {
      const transporter = this.getTransporter()
      
      if (!transporter) {
        console.log('📧 EMAIL SIMULADO:')
        console.log('   Para:', options.to)
        console.log('   Asunto:', options.subject)
        console.log('   Contenido:', options.text || 'Ver HTML')
        return true
      }

      const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@reminderapp.com'
      
      const info = await transporter.sendMail({
        from: `"Reminder App" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        priority: options.priority || 'normal'
      })

      console.log('✅ Email enviado:', info.messageId)
      return true
    } catch (error: any) {
      console.error('❌ Error enviando email:', error.message)
      return false
    }
  }

  /**
   * ⏰ Enviar recordatorio simple por email
   */
  static async sendSimpleReminder(
    email: string,
    title: string,
    message: string,
    dueDate?: Date,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<boolean> {
    const priorityEmoji = {
      high: '🚨',
      normal: '⏰',
      low: '📝'
    }

    const priorityColor = {
      high: '#ef4444',
      normal: '#3b82f6',
      low: '#6b7280'
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { 
              background: linear-gradient(135deg, ${priorityColor[priority]} 0%, ${priorityColor[priority]}dd 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .reminder-box { 
              background: white; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
              border-left: 4px solid ${priorityColor[priority]}; 
            }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .priority-badge {
              display: inline-block;
              background: ${priorityColor[priority]};
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${priorityEmoji[priority]} Recordatorio</h1>
              <span class="priority-badge">Prioridad ${priority}</span>
            </div>
            <div class="content">
              <div class="reminder-box">
                <h2>${title}</h2>
                <p>${message}</p>
                ${dueDate ? `
                  <p><strong>📅 Fecha límite:</strong> ${dueDate.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                ` : ''}
              </div>
              
              <p>Este es un recordatorio automático. Si ya completaste esta tarea, puedes ignorar este mensaje.</p>
            </div>
            <div class="footer">
              <p>Reminder App - Tu asistente personal de recordatorios</p>
              <p>Enviado el ${new Date().toLocaleString('es-ES')}</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
      RECORDATORIO: ${title}
      
      ${message}
      
      ${dueDate ? `Fecha límite: ${dueDate.toLocaleString('es-ES')}` : ''}
      
      Prioridad: ${priority.toUpperCase()}
      
      Reminder App - ${new Date().toLocaleString('es-ES')}
    `

    return this.sendEmail({
      to: email,
      subject: `${priorityEmoji[priority]} Recordatorio: ${title}`,
      html,
      text,
      priority
    })
  }

  /**
   * 📋 Enviar lista de recordatorios pendientes
   */
  static async sendRemindersList(
    email: string,
    reminders: Array<{
      title: string
      message: string
      dueDate?: Date
      priority: 'high' | 'normal' | 'low'
    }>
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { 
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .reminder-item { 
              background: white; 
              padding: 15px; 
              margin: 10px 0; 
              border-radius: 8px; 
              border-left: 4px solid #3b82f6; 
            }
            .reminder-item.high { border-left-color: #ef4444; }
            .reminder-item.normal { border-left-color: #3b82f6; }
            .reminder-item.low { border-left-color: #6b7280; }
            .priority { 
              font-size: 12px; 
              font-weight: bold; 
              text-transform: uppercase; 
              color: #6b7280; 
            }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Resumen de Recordatorios</h1>
              <p>Tienes ${reminders.length} recordatorio(s) pendiente(s)</p>
            </div>
            <div class="content">
              ${reminders.map(reminder => `
                <div class="reminder-item ${reminder.priority}">
                  <div class="priority">${reminder.priority === 'high' ? '🚨' : reminder.priority === 'normal' ? '⏰' : '📝'} ${reminder.priority}</div>
                  <h3>${reminder.title}</h3>
                  <p>${reminder.message}</p>
                  ${reminder.dueDate ? `<p><strong>📅 Vence:</strong> ${reminder.dueDate.toLocaleDateString('es-ES')}</p>` : ''}
                </div>
              `).join('')}
              
              <p style="margin-top: 30px;">¿Ya completaste alguna tarea? ¡Excelente! Puedes marcarla como completada en tu app.</p>
            </div>
            <div class="footer">
              <p>Reminder App - Tu asistente personal de recordatorios</p>
              <p>Enviado el ${new Date().toLocaleString('es-ES')}</p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: `📋 Tienes ${reminders.length} recordatorio(s) pendiente(s)`,
      html,
      text: `Recordatorios pendientes:\n\n${reminders.map(r => `- ${r.title}: ${r.message}`).join('\n')}`
    })
  }

  /**
   * 🎉 Enviar confirmación de tarea completada
   */
  static async sendTaskCompletedEmail(
    email: string,
    taskTitle: string,
    completedAt: Date = new Date()
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { 
              background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { 
              background: #ecfdf5; 
              border: 1px solid #10b981; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
            }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 ¡Tarea Completada!</h1>
            </div>
            <div class="content">
              <div class="success-box">
                <h2>✅ ${taskTitle}</h2>
                <p>¡Felicitaciones! Has completado esta tarea exitosamente.</p>
                <p><strong>📅 Completada el:</strong> ${completedAt.toLocaleString('es-ES')}</p>
              </div>
              
              <p>¡Excelente trabajo! Mantén el buen ritmo con tus tareas pendientes.</p>
            </div>
            <div class="footer">
              <p>Reminder App - Tu asistente personal de recordatorios</p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: `🎉 Tarea completada: ${taskTitle}`,
      html,
      text: `¡Tarea completada!\n\n${taskTitle}\n\nCompletada el: ${completedAt.toLocaleString('es-ES')}`
    })
  }

  /**
   * 🚨 Enviar alerta urgente
   */
  static async sendUrgentAlert(
    email: string,
    title: string,
    message: string,
    actionRequired?: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { 
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { 
              background: #fef2f2; 
              border: 2px solid #ef4444; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
            }
            .action-box {
              background: #fff7ed;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 15px 0;
            }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 ALERTA URGENTE</h1>
            </div>
            <div class="content">
              <div class="alert-box">
                <h2>⚠️ ${title}</h2>
                <p>${message}</p>
              </div>
              
              ${actionRequired ? `
                <div class="action-box">
                  <h3>🎯 Acción Requerida:</h3>
                  <p>${actionRequired}</p>
                </div>
              ` : ''}
              
              <p><strong>Este es un recordatorio de alta prioridad que requiere tu atención inmediata.</strong></p>
            </div>
            <div class="footer">
              <p>Reminder App - Alerta enviada el ${new Date().toLocaleString('es-ES')}</p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: `🚨 URGENTE: ${title}`,
      html,
      text: `ALERTA URGENTE: ${title}\n\n${message}\n\n${actionRequired ? `Acción requerida: ${actionRequired}` : ''}`,
      priority: 'high'
    })
  }

  /**
   * 📊 Enviar reporte semanal
   */
  static async sendWeeklyReport(
    email: string,
    stats: {
      completedTasks: number
      pendingTasks: number
      overdueTask: number
      totalTasks: number
    }
  ): Promise<boolean> {
    const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { 
              background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
            .stat-card { 
              background: white; 
              padding: 20px; 
              border-radius: 8px; 
              text-align: center; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
            }
            .stat-number { font-size: 32px; font-weight: bold; color: #8b5cf6; }
            .stat-label { color: #6b7280; font-size: 14px; margin-top: 5px; }
            .progress-bar { 
              background: #e5e7eb; 
              height: 20px; 
              border-radius: 10px; 
              overflow: hidden; 
              margin: 20px 0; 
            }
            .progress-fill { 
              background: linear-gradient(90deg, #10b981, #059669); 
              height: 100%; 
              width: ${completionRate}%; 
              transition: width 0.3s; 
            }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Reporte Semanal</h1>
              <p>Tu productividad de esta semana</p>
            </div>
            <div class="content">
              <div class="progress-bar">
                <div class="progress-fill"></div>
              </div>
              <p style="text-align: center; font-size: 18px; font-weight: bold;">
                ${completionRate}% de tareas completadas
              </p>
              
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-number">${stats.completedTasks}</div>
                  <div class="stat-label">✅ Completadas</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.pendingTasks}</div>
                  <div class="stat-label">⏳ Pendientes</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.overdueTask}</div>
                  <div class="stat-label">🚨 Vencidas</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.totalTasks}</div>
                  <div class="stat-label">📋 Total</div>
                </div>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <h3>💡 Consejos para la próxima semana:</h3>
                <ul>
                  ${completionRate >= 80 ? '<li>🎉 ¡Excelente trabajo! Mantén este ritmo</li>' : ''}
                  ${stats.overdueTask > 0 ? '<li>⚠️ Prioriza las tareas vencidas</li>' : ''}
                  ${stats.pendingTasks > 5 ? '<li>📝 Considera dividir tareas grandes en subtareas</li>' : ''}
                  <li>⏰ Programa recordatorios para tareas importantes</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>Reminder App - Reporte generado el ${new Date().toLocaleString('es-ES')}</p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: `📊 Tu reporte semanal - ${completionRate}% completado`,
      html,
      text: `Reporte Semanal:\n\nCompletadas: ${stats.completedTasks}\nPendientes: ${stats.pendingTasks}\nVencidas: ${stats.overdueTask}\nTotal: ${stats.totalTasks}\n\nTasa de completación: ${completionRate}%`
    })
  }
}