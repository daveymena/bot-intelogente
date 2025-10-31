// Email Service - Sistema de notificaciones por correo
// En producción, integrar con SendGrid, Resend, o similar

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  private static async sendEmail(options: EmailOptions): Promise<boolean> {
    // En desarrollo, solo logueamos
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email simulado enviado:')
      console.log('Para:', options.to)
      console.log('Asunto:', options.subject)
      console.log('Contenido:', options.text || options.html)
      return true
    }

    // TODO: Integrar con servicio real de email
    // Ejemplo con Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'Smart Sales Bot <noreply@smartsalesbot.com>',
    //   to: options.to,
    //   subject: options.subject,
    //   html: options.html
    // })

    return true
  }

  static async sendVerificationEmail(email: string, token: string, name?: string): Promise<boolean> {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🤖 Smart Sales Bot Pro</h1>
              <p>Verifica tu cuenta</p>
            </div>
            <div class="content">
              <h2>¡Hola ${name || 'Usuario'}!</h2>
              <p>Gracias por registrarte en Smart Sales Bot Pro. Para completar tu registro y activar tu cuenta, por favor verifica tu correo electrónico.</p>
              
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verificar mi correo</a>
              </p>
              
              <p>O copia y pega este enlace en tu navegador:</p>
              <p style="background: white; padding: 15px; border-radius: 5px; word-break: break-all;">
                ${verificationUrl}
              </p>
              
              <p><strong>Este enlace expirará en 24 horas.</strong></p>
              
              <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p><strong>¿Qué puedes hacer con Smart Sales Bot?</strong></p>
                <ul>
                  <li>✅ Automatizar respuestas de WhatsApp con IA</li>
                  <li>✅ Gestionar productos y catálogos</li>
                  <li>✅ Analizar conversaciones y métricas</li>
                  <li>✅ 7 días de prueba gratis</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>Smart Sales Bot Pro - Automatización Inteligente de Ventas</p>
              <p>Este es un correo automático, por favor no respondas.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
      Hola ${name || 'Usuario'},
      
      Gracias por registrarte en Smart Sales Bot Pro.
      
      Para verificar tu cuenta, visita este enlace:
      ${verificationUrl}
      
      Este enlace expirará en 24 horas.
      
      Si no creaste esta cuenta, puedes ignorar este correo.
      
      Saludos,
      El equipo de Smart Sales Bot
    `

    return this.sendEmail({
      to: email,
      subject: '🤖 Verifica tu cuenta de Smart Sales Bot',
      html,
      text
    })
  }

  static async sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
    const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard`
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #10b981; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 ¡Bienvenido a Smart Sales Bot!</h1>
            </div>
            <div class="content">
              <h2>¡Hola ${name || 'Usuario'}!</h2>
              <p>Tu cuenta ha sido verificada exitosamente. ¡Estás listo para comenzar!</p>
              
              <p style="text-align: center;">
                <a href="${dashboardUrl}" class="button">Ir al Dashboard</a>
              </p>
              
              <h3>🚀 Primeros pasos:</h3>
              
              <div class="feature">
                <strong>1. Conecta WhatsApp</strong>
                <p>Escanea el código QR para vincular tu cuenta de WhatsApp</p>
              </div>
              
              <div class="feature">
                <strong>2. Agrega tus productos</strong>
                <p>Crea tu catálogo de productos o servicios</p>
              </div>
              
              <div class="feature">
                <strong>3. Configura la IA</strong>
                <p>Personaliza las respuestas automáticas de tu bot</p>
              </div>
              
              <div class="feature">
                <strong>4. ¡Empieza a vender!</strong>
                <p>Tu bot responderá automáticamente a tus clientes</p>
              </div>
              
              <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 5px;">
                <p><strong>🎁 Tienes 7 días de prueba gratis</strong></p>
                <p>Explora todas las funcionalidades sin compromiso.</p>
              </div>
            </div>
            <div class="footer">
              <p>¿Necesitas ayuda? Contáctanos en soporte@smartsalesbot.com</p>
              <p>Smart Sales Bot Pro - Automatización Inteligente de Ventas</p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: '🎉 ¡Bienvenido a Smart Sales Bot Pro!',
      html,
      text: `¡Bienvenido ${name || 'Usuario'}! Tu cuenta ha sido verificada. Visita ${dashboardUrl} para comenzar.`
    })
  }

  static async sendPasswordResetEmail(email: string, token: string, name?: string): Promise<boolean> {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Restablecer Contraseña</h1>
            </div>
            <div class="content">
              <h2>Hola ${name || 'Usuario'},</h2>
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta de Smart Sales Bot.</p>
              
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Restablecer mi contraseña</a>
              </p>
              
              <p>O copia y pega este enlace en tu navegador:</p>
              <p style="background: white; padding: 15px; border-radius: 5px; word-break: break-all;">
                ${resetUrl}
              </p>
              
              <div class="warning">
                <p><strong>⚠️ Importante:</strong></p>
                <ul>
                  <li>Este enlace expirará en 1 hora</li>
                  <li>Si no solicitaste este cambio, ignora este correo</li>
                  <li>Tu contraseña actual seguirá siendo válida</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>Smart Sales Bot Pro - Automatización Inteligente de Ventas</p>
              <p>Este es un correo automático, por favor no respondas.</p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: '🔐 Restablecer contraseña - Smart Sales Bot',
      html,
      text: `Hola ${name || 'Usuario'}, para restablecer tu contraseña visita: ${resetUrl}. Este enlace expirará en 1 hora.`
    })
  }

  static async sendLoginNotification(email: string, name?: string, ipAddress?: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Nuevo inicio de sesión</h1>
            </div>
            <div class="content">
              <h2>Hola ${name || 'Usuario'},</h2>
              <p>Se ha detectado un nuevo inicio de sesión en tu cuenta de Smart Sales Bot.</p>
              
              <div class="info-box">
                <p><strong>Detalles del inicio de sesión:</strong></p>
                <ul>
                  <li>Fecha: ${new Date().toLocaleString('es-ES')}</li>
                  ${ipAddress ? `<li>IP: ${ipAddress}</li>` : ''}
                  <li>Dispositivo: Navegador web</li>
                </ul>
              </div>
              
              <p>Si fuiste tú, puedes ignorar este correo.</p>
              
              <p><strong>Si no reconoces este inicio de sesión:</strong></p>
              <ol>
                <li>Cambia tu contraseña inmediatamente</li>
                <li>Revisa la actividad de tu cuenta</li>
                <li>Contacta a soporte si necesitas ayuda</li>
              </ol>
            </div>
            <div class="footer">
              <p>Smart Sales Bot Pro - Automatización Inteligente de Ventas</p>
              <p>Este es un correo automático, por favor no respondas.</p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: '🔔 Nuevo inicio de sesión detectado - Smart Sales Bot',
      html,
      text: `Hola ${name || 'Usuario'}, se detectó un nuevo inicio de sesión en tu cuenta el ${new Date().toLocaleString('es-ES')}.`
    })
  }
}
