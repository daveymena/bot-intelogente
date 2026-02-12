/**
 * 📱 Ejemplo de uso completo - App de Recordatorios
 * Basado en Smart Sales Bot Pro
 */

import { ReminderWhatsAppService } from './reminder-app-whatsapp-service'
import { ReminderEmailService } from './reminder-app-email-service'
import { ReminderScheduler } from './reminder-app-scheduler'

// 🔧 Configuración inicial
async function initializeReminderApp() {
  console.log('🚀 Inicializando App de Recordatorios...')
  
  // Iniciar el scheduler
  ReminderScheduler.start()
  
  console.log('✅ App inicializada')
}

// 📱 Ejemplo 1: Conectar WhatsApp
async function connectWhatsApp() {
  const userId = 'user123'
  
  console.log('📱 Conectando WhatsApp...')
  
  // Registrar callback para QR
  ReminderWhatsAppService.onQRCode(userId, (qr) => {
    console.log('📱 QR Code recibido:', qr.substring(0, 50) + '...')
    // Aquí mostrarías el QR en tu interfaz
  })
  
  // Inicializar conexión
  const result = await ReminderWhatsAppService.initializeConnection(userId)
  
  if (result.success) {
    console.log('✅ WhatsApp conectado exitosamente')
  } else {
    console.error('❌ Error conectando WhatsApp:', result.error)
  }
  
  return result.success
}

// 📧 Ejemplo 2: Configurar emails
async function setupEmails() {
  console.log('📧 Configurando sistema de emails...')
  
  // Variables de entorno necesarias:
  process.env.EMAIL_USER = 'tu_email@gmail.com'
  process.env.EMAIL_PASS = 'tu_app_password'
  process.env.EMAIL_FROM = 'tu_email@gmail.com'
  
  // Enviar email de prueba
  const testResult = await ReminderEmailService.sendSimpleReminder(
    'usuario@ejemplo.com',
    'Prueba del sistema',
    'Este es un email de prueba del sistema de recordatorios',
    new Date(Date.now() + 60000), // En 1 minuto
    'normal'
  )
  
  console.log('📧 Email de prueba:', testResult ? '✅ Enviado' : '❌ Error')
}

// ⏰ Ejemplo 3: Programar recordatorios
async function scheduleReminders() {
  console.log('⏰ Programando recordatorios...')
  
  const userId = 'user123'
  
  // Recordatorio simple en 5 minutos
  const reminder1 = ReminderScheduler.scheduleReminder({
    userId,
    title: 'Reunión importante',
    message: 'Tienes una reunión con el equipo en 5 minutos',
    dueDate: new Date(Date.now() + 5 * 60 * 1000), // 5 minutos
    priority: 'high',
    channels: ['whatsapp', 'email'],
    phoneNumber: '573136174267', // Tu número
    email: 'usuario@ejemplo.com'
  })
  
  // Recordatorio recurrente diario
  const reminder2 = ReminderScheduler.scheduleReminder({
    userId,
    title: 'Ejercicio diario',
    message: 'Es hora de hacer ejercicio por 30 minutos',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
    priority: 'normal',
    channels: ['whatsapp'],
    phoneNumber: '573136174267',
    recurring: {
      type: 'daily',
      interval: 1
    }
  })
  
  // Recordatorio semanal por email
  const reminder3 = ReminderScheduler.scheduleReminder({
    userId,
    title: 'Reporte semanal',
    message: 'Preparar y enviar el reporte semanal de actividades',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Próxima semana
    priority: 'normal',
    channels: ['email'],
    email: 'usuario@ejemplo.com',
    recurring: {
      type: 'weekly',
      interval: 1
    }
  })
  
  console.log('✅ Recordatorios programados:', { reminder1, reminder2, reminder3 })
}

// 📤 Ejemplo 4: Enviar recordatorios manuales
async function sendManualReminders() {
  console.log('📤 Enviando recordatorios manuales...')
  
  const userId = 'user123'
  
  // WhatsApp simple
  await ReminderWhatsAppService.sendReminder(
    userId,
    '573136174267',
    'Recordatorio: Revisar documentos pendientes',
    { includeEmoji: true, urgent: false }
  )
  
  // WhatsApp con imagen
  await ReminderWhatsAppService.sendReminderWithImage(
    userId,
    '573136174267',
    'Recordatorio visual: Revisar este diagrama',
    'https://via.placeholder.com/400x300/10b981/ffffff?text=Recordatorio'
  )
  
  // Email urgente
  await ReminderEmailService.sendUrgentAlert(
    'usuario@ejemplo.com',
    'Tarea crítica pendiente',
    'La tarea de backup de datos debe completarse hoy',
    'Ejecutar script de backup antes de las 6 PM'
  )
  
  // Lista de recordatorios
  await ReminderEmailService.sendRemindersList(
    'usuario@ejemplo.com',
    [
      {
        title: 'Llamar al cliente',
        message: 'Seguimiento de propuesta comercial',
        dueDate: new Date(),
        priority: 'high'
      },
      {
        title: 'Actualizar documentación',
        message: 'Revisar y actualizar manual de usuario',
        priority: 'normal'
      },
      {
        title: 'Planificar sprint',
        message: 'Definir tareas para próximo sprint',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        priority: 'low'
      }
    ]
  )
  
  console.log('✅ Recordatorios manuales enviados')
}

// 📊 Ejemplo 5: Gestionar recordatorios
async function manageReminders() {
  console.log('📊 Gestionando recordatorios...')
  
  const userId = 'user123'
  
  // Obtener estadísticas
  const stats = ReminderScheduler.getUserStats(userId)
  console.log('📊 Estadísticas del usuario:', stats)
  
  // Obtener recordatorios pendientes
  const pendingReminders = ReminderScheduler.getUserReminders(userId, 'pending')
  console.log('⏳ Recordatorios pendientes:', pendingReminders.length)
  
  // Marcar como completado (ejemplo)
  if (pendingReminders.length > 0) {
    const completed = ReminderScheduler.completeReminder(pendingReminders[0].id)
    console.log('✅ Recordatorio completado:', completed)
  }
  
  // Enviar reporte semanal
  await ReminderScheduler.sendWeeklyReport(userId, 'usuario@ejemplo.com')
  
  // Estado del sistema
  const systemStatus = ReminderScheduler.getSystemStatus()
  console.log('🖥️ Estado del sistema:', systemStatus)
}

// 🧪 Ejemplo 6: Casos de uso específicos
async function specificUseCases() {
  console.log('🧪 Casos de uso específicos...')
  
  const userId = 'user123'
  
  // Caso 1: Recordatorio de medicamento
  ReminderScheduler.scheduleReminder({
    userId,
    title: 'Tomar medicamento',
    message: 'Es hora de tomar tu medicamento para la presión',
    dueDate: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 horas
    priority: 'high',
    channels: ['whatsapp'],
    phoneNumber: '573136174267',
    recurring: {
      type: 'daily',
      interval: 1
    }
  })
  
  // Caso 2: Recordatorio de cumpleaños
  ReminderScheduler.scheduleReminder({
    userId,
    title: 'Cumpleaños de María',
    message: 'Hoy es el cumpleaños de María. ¡No olvides felicitarla!',
    dueDate: new Date('2024-03-15T09:00:00'), // Fecha específica
    priority: 'normal',
    channels: ['whatsapp', 'email'],
    phoneNumber: '573136174267',
    email: 'usuario@ejemplo.com'
  })
  
  // Caso 3: Recordatorio de trabajo
  ReminderScheduler.scheduleReminder({
    userId,
    title: 'Entrega de proyecto',
    message: 'El proyecto debe estar listo para revisión del cliente',
    dueDate: new Date('2024-02-28T17:00:00'), // Fecha límite
    priority: 'high',
    channels: ['email'],
    email: 'usuario@ejemplo.com'
  })
  
  // Caso 4: Recordatorio de mantenimiento
  ReminderScheduler.scheduleReminder({
    userId,
    title: 'Mantenimiento del servidor',
    message: 'Realizar backup y actualización del servidor de producción',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Próxima semana
    priority: 'high',
    channels: ['email'],
    email: 'admin@empresa.com',
    recurring: {
      type: 'monthly',
      interval: 1
    }
  })
  
  console.log('✅ Casos de uso específicos configurados')
}

// 🚀 Función principal
async function main() {
  try {
    // Inicializar app
    await initializeReminderApp()
    
    // Configurar servicios
    await setupEmails()
    
    // Conectar WhatsApp (opcional, comentar si no tienes WhatsApp)
    // await connectWhatsApp()
    
    // Programar recordatorios
    await scheduleReminders()
    
    // Enviar recordatorios manuales
    await sendManualReminders()
    
    // Gestionar recordatorios
    await manageReminders()
    
    // Casos de uso específicos
    await specificUseCases()
    
    console.log('🎉 ¡App de Recordatorios funcionando correctamente!')
    
  } catch (error) {
    console.error('❌ Error en la aplicación:', error)
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
}

export {
  initializeReminderApp,
  connectWhatsApp,
  setupEmails,
  scheduleReminders,
  sendManualReminders,
  manageReminders,
  specificUseCases
}