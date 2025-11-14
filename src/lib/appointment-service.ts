/**
 * 📅 SERVICIO DE AGENDAMIENTO DE CITAS
 * Maneja solicitudes de citas con notificación al admin
 */

import { db } from './db'
import { WASocket } from '@whiskeysockets/baileys'

export class AppointmentService {
  /**
   * Detectar si el cliente quiere agendar una cita
   */
  static detectAppointmentRequest(message: string): boolean {
    const normalized = message.toLowerCase().trim()
    
    const appointmentPatterns = [
      /\b(agendar|agenda|cita|visita|ir|ver|conocer|visitar)\b/i,
      /\b(puedo\s+(ir|ver|visitar|pasar))\b/i,
      /\b(quiero\s+(ir|ver|visitar|conocer))\b/i,
      /\b(dónde\s+(están|esta|quedan|queda))\b/i,
      /\b(ubicación|dirección|direccion)\b/i,
      /\b(horario|hora|cuando)\s+(atienden|abren|cierran)\b/i
    ]
    
    return appointmentPatterns.some(pattern => pattern.test(normalized))
  }

  /**
   * Crear solicitud de cita y notificar al admin
   */
  static async createAppointmentRequest(
    socket: WASocket,
    userId: string,
    customerPhone: string,
    customerName: string,
    customerMessage: string,
    conversationId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`[Appointment] 📅 Creando solicitud de cita para ${customerName}`)

      // Obtener información del usuario/negocio
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          businessName: true,
          businessAddress: true,
          businessPhone: true,
          businessHours: true,
          adminNotificationPhone: true
        }
      })

      if (!user) {
        throw new Error('Usuario no encontrado')
      }

      // Crear registro de cita
      const appointment = await db.appointment.create({
        data: {
          userId,
          customerPhone,
          customerName,
          conversationId,
          status: 'PENDING_ADMIN_APPROVAL',
          customerMessage
        }
      })

      console.log(`[Appointment] ✅ Cita creada: ${appointment.id}`)

      // Notificar al admin
      const adminPhone = user.adminNotificationPhone || '3005560186'
      const adminPhoneFormatted = `57${adminPhone}@s.whatsapp.net`

      const notificationMessage = `🔔 *NUEVA SOLICITUD DE CITA*

👤 *Cliente:* ${customerName}
📱 *Teléfono:* ${customerPhone}
💬 *Mensaje:* ${customerMessage}

📅 *ID de Cita:* ${appointment.id}

⏰ *Para confirmar la cita:*
Responde con: CITA ${appointment.id} [FECHA] [HORA]

Ejemplo:
CITA ${appointment.id} 2025-11-10 14:00

El bot enviará automáticamente la confirmación al cliente.`

      try {
        await socket.sendMessage(adminPhoneFormatted, { text: notificationMessage })
        console.log(`[Appointment] ✅ Notificación enviada al admin: ${adminPhone}`)
      } catch (notifyError) {
        console.error(`[Appointment] ⚠️ Error enviando notificación al admin:`, notifyError)
        // No fallar si no se puede notificar
      }

      // Responder al cliente
      const clientResponse = `📅 *Solicitud de Cita Recibida*

¡Perfecto! He recibido tu solicitud para visitarnos 😊

📍 *Ubicación:*
${user.businessAddress || 'Centro Comercial El Diamante 2, San Nicolás, Cali'}

📞 *Contacto:*
${user.businessPhone || '+57 304 274 8687'}

⏰ *Horario:*
${user.businessHours || 'Lunes a Sábado: 9:00 AM - 6:00 PM'}

🔔 He notificado a nuestro equipo sobre tu solicitud.
Te confirmaremos la disponibilidad en breve.

¿Hay algo más en lo que pueda ayudarte mientras tanto?`

      return {
        success: true,
        message: clientResponse
      }

    } catch (error) {
      console.error('[Appointment] ❌ Error creando cita:', error)
      return {
        success: false,
        message: 'Disculpa, hubo un error procesando tu solicitud. Por favor intenta de nuevo.'
      }
    }
  }

  /**
   * Procesar respuesta del admin con disponibilidad
   */
  static async processAdminResponse(
    socket: WASocket,
    adminMessage: string,
    userId: string
  ): Promise<boolean> {
    try {
      // Formato: CITA [ID] [FECHA] [HORA]
      const match = adminMessage.match(/CITA\s+([a-z0-9]+)\s+(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/i)
      
      if (!match) {
        return false // No es una respuesta de cita
      }

      const [, appointmentId, date, time] = match

      console.log(`[Appointment] 📅 Procesando respuesta del admin para cita: ${appointmentId}`)

      // Buscar la cita
      const appointment = await db.appointment.findFirst({
        where: {
          id: appointmentId,
          userId,
          status: 'PENDING_ADMIN_APPROVAL'
        }
      })

      if (!appointment) {
        console.log(`[Appointment] ⚠️ Cita no encontrada o ya procesada: ${appointmentId}`)
        await socket.sendMessage(`57${process.env.ADMIN_PHONE || '3005560186'}@s.whatsapp.net`, {
          text: `⚠️ Cita ${appointmentId} no encontrada o ya fue procesada.`
        })
        return true
      }

      // Actualizar cita con la disponibilidad
      await db.appointment.update({
        where: { id: appointmentId },
        data: {
          status: 'CONFIRMED',
          confirmedDate: new Date(date),
          confirmedTime: time,
          adminResponse: adminMessage
        }
      })

      console.log(`[Appointment] ✅ Cita confirmada: ${appointmentId}`)

      // Notificar al cliente
      const customerPhoneFormatted = appointment.customerPhone.includes('@') 
        ? appointment.customerPhone 
        : `${appointment.customerPhone}@s.whatsapp.net`

      const confirmationMessage = `✅ *Cita Confirmada*

¡Excelente noticia! Tu cita ha sido confirmada 🎉

📅 *Fecha:* ${new Date(date).toLocaleDateString('es-CO', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}

⏰ *Hora:* ${time}

📍 *Ubicación:*
Centro Comercial El Diamante 2, San Nicolás, Cali

📞 *Contacto:*
+57 304 274 8687

💡 *Recuerda:*
- Llegar 5 minutos antes
- Si necesitas cambiar la cita, avísanos con anticipación

¡Te esperamos! 😊`

      await socket.sendMessage(customerPhoneFormatted, { text: confirmationMessage })
      console.log(`[Appointment] ✅ Confirmación enviada al cliente`)

      // Confirmar al admin
      await socket.sendMessage(`57${process.env.ADMIN_PHONE || '3005560186'}@s.whatsapp.net`, {
        text: `✅ Cita ${appointmentId} confirmada y notificada al cliente.`
      })

      return true

    } catch (error) {
      console.error('[Appointment] ❌ Error procesando respuesta del admin:', error)
      return false
    }
  }

  /**
   * Obtener información del negocio para respuestas
   */
  static async getBusinessInfo(userId: string): Promise<string> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          businessName: true,
          businessAddress: true,
          businessPhone: true,
          businessHours: true,
          businessDescription: true
        }
      })

      if (!user) {
        return ''
      }

      let info = ''
      
      if (user.businessName) {
        info += `📍 *${user.businessName}*\n\n`
      }

      if (user.businessDescription) {
        info += `${user.businessDescription}\n\n`
      }

      if (user.businessAddress) {
        info += `📍 *Ubicación:*\n${user.businessAddress}\n\n`
      }

      if (user.businessPhone) {
        info += `📞 *Contacto:*\n${user.businessPhone}\n\n`
      }

      if (user.businessHours) {
        info += `⏰ *Horario:*\n${user.businessHours}\n\n`
      }

      return info

    } catch (error) {
      console.error('[Appointment] ❌ Error obteniendo info del negocio:', error)
      return ''
    }
  }
}
