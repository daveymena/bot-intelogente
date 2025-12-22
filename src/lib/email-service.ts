// Email Service - Sistema de notificaciones por correo con Nodemailer
import nodemailer from 'nodemailer'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  private static getTransporter() {
    const emailUser = process.env.EMAIL_USER
    const emailPass = process.env.EMAIL_PASS
    const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com'
    const emailPort = parseInt(process.env.EMAIL_PORT || '587')
    
    if (!emailUser || !emailPass) {
      return null
    }
    
    return nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465, // true para 465, false para otros puertos
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    })
  }

  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const transporter = this.getTransporter()
      
      // Si no hay configuración, solo loguear
      if (!transporter) {
        console.log('⚠️  EMAIL no configurado - Email simulado:')
        console.log('📧 Para:', options.to)
        console.log('📧 Asunto:', options.subject)
        console.log('📧 Contenido:', options.text || 'Ver HTML')
        console.log('\n💡 Para enviar emails reales:')
        console.log('   1. Ir a: https://myaccount.google.com/apppasswords')
        console.log('   2. Crear contraseña de aplicación')
        console.log('   3. Agregar a .env:')
        console.log('      EMAIL_USER=tu_email@gmail.com')
        console.log('      EMAIL_PASS=tu_app_password')
        console.log('      EMAIL_FROM=tu_email@gmail.com')
        console.log('      EMAIL_HOST=smtp.gmail.com')
        console.log('      EMAIL_PORT=587\n')
        return true
      }

      // Enviar email real con Nodemailer
      const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@smartsalesbot.com'
      
      console.log(`📧 Enviando email a ${options.to}...`)
      
      const info = await transporter.sendMail({
        from: `"Smart Sales Bot Pro" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      })

      console.log('✅ Email enviado exitosamente:', info.messageId)
      return true

    } catch (error: any) {
      console.error('❌ Error en sendEmail:', error.message)
      return false
    }
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

  static async sendPasswordResetEmail(params: {
    to: string;
    userName: string;
    resetUrl: string;
  }): Promise<boolean> {
    const { to, userName, resetUrl } = params;
    
    console.log('[EmailService] Enviando email de recuperación a:', to);
    console.log('[EmailService] URL de reset:', resetUrl);
    
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
              <h2>Hola ${userName},</h2>
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
      to,
      subject: '🔐 Restablecer contraseña - Smart Sales Bot',
      html,
      text: `Hola ${userName}, para restablecer tu contraseña visita: ${resetUrl}. Este enlace expirará en 1 hora.`
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

  /**
   * Enviar email personalizado con HTML
   */
  static async sendCustomEmail(to: string, subject: string, html: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject,
      html,
      text: html.replace(/<[^>]*>/g, '') // Versión texto plano
    })
  }

  /**
   * Enviar confirmación de pago con link de entrega
   */
  static async sendPaymentConfirmation(
    email: string,
    name: string,
    details: {
      planName?: string
      productName?: string
      amount: number
      currency: string
      expiresAt?: string
      paymentId: string
      deliveryLink?: string
    }
  ): Promise<boolean> {
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
            .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .details-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 ¡Pago Confirmado!</h1>
              <p>Gracias por tu compra</p>
            </div>
            <div class="content">
              <h2>Hola ${name},</h2>
              <p>Tu pago ha sido procesado exitosamente.</p>
              
              <div class="details-box">
                <h3>📋 Detalles de la compra:</h3>
                <ul>
                  ${details.productName ? `<li><strong>Producto:</strong> ${details.productName}</li>` : ''}
                  ${details.planName ? `<li><strong>Plan:</strong> ${details.planName}</li>` : ''}
                  <li><strong>Monto:</strong> $${details.amount.toLocaleString()} ${details.currency}</li>
                  <li><strong>ID de pago:</strong> ${details.paymentId}</li>
                  ${details.expiresAt ? `<li><strong>Válido hasta:</strong> ${new Date(details.expiresAt).toLocaleDateString('es-ES')}</li>` : ''}
                </ul>
              </div>
              
              ${details.deliveryLink ? `
              <div style="text-align: center; margin: 30px 0;">
                <h3>🔗 Tu acceso está listo:</h3>
                <a href="${details.deliveryLink}" class="button">📥 ACCEDER AL CONTENIDO</a>
                <p style="font-size: 12px; color: #666; margin-top: 10px;">
                  O copia este enlace: ${details.deliveryLink}
                </p>
              </div>
              ` : ''}
              
              <p>¿Tienes alguna pregunta? Responde a este correo o escríbenos por WhatsApp al 3136174267.</p>
            </div>
            <div class="footer">
              <p><strong>Tecnovariedades D&S</strong></p>
              <p>Tu tienda de confianza ✨</p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: `🎉 Pago Confirmado - ${details.productName || details.planName || 'Tu compra'}`,
      html,
      text: `Hola ${name}, tu pago de $${details.amount} ${details.currency} ha sido confirmado. ${details.deliveryLink ? `Accede a tu contenido: ${details.deliveryLink}` : ''}`
    })
  }

  // Email de prueba profesional
  static async sendTestEmail(email: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #1f2937;
              background-color: #f3f4f6;
            }
            .email-wrapper { 
              background-color: #f3f4f6; 
              padding: 40px 20px; 
            }
            .email-container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
              color: white; 
              padding: 50px 40px; 
              text-align: center;
            }
            .header h1 { 
              font-size: 32px; 
              font-weight: 700; 
              margin-bottom: 10px;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header p { 
              font-size: 18px; 
              opacity: 0.95;
            }
            .content { 
              padding: 40px; 
            }
            .content h2 { 
              color: #10b981; 
              font-size: 24px; 
              margin-bottom: 20px;
              font-weight: 600;
            }
            .content p { 
              margin-bottom: 16px; 
              color: #4b5563;
              font-size: 16px;
            }
            .feature-grid {
              display: grid;
              gap: 16px;
              margin: 30px 0;
            }
            .feature-card { 
              background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
              padding: 24px; 
              border-radius: 12px; 
              border-left: 4px solid #10b981;
              transition: transform 0.2s;
            }
            .feature-card h3 {
              color: #059669;
              font-size: 18px;
              margin-bottom: 8px;
              font-weight: 600;
            }
            .feature-card p {
              color: #065f46;
              margin: 0;
              font-size: 14px;
            }
            .cta-button { 
              display: inline-block; 
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white; 
              padding: 16px 40px; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 30px 0;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
              transition: all 0.3s;
            }
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
            }
            .stats-container {
              background: #f9fafb;
              padding: 30px;
              border-radius: 12px;
              margin: 30px 0;
              text-align: center;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin-top: 20px;
            }
            .stat-item {
              padding: 20px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            .stat-number {
              font-size: 32px;
              font-weight: 700;
              color: #10b981;
              display: block;
            }
            .stat-label {
              font-size: 14px;
              color: #6b7280;
              margin-top: 8px;
            }
            .highlight-box { 
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border-left: 4px solid #f59e0b;
              padding: 24px; 
              margin: 30px 0; 
              border-radius: 12px;
            }
            .highlight-box strong {
              color: #92400e;
              font-size: 18px;
            }
            .highlight-box p {
              color: #78350f;
              margin-top: 8px;
            }
            .footer { 
              background: #1f2937;
              color: #9ca3af;
              text-align: center; 
              padding: 40px;
              font-size: 14px;
            }
            .footer p {
              color: #9ca3af;
              margin: 8px 0;
            }
            .footer strong {
              color: #10b981;
              font-size: 16px;
            }
            .social-links {
              margin-top: 20px;
            }
            .social-links a {
              color: #10b981;
              text-decoration: none;
              margin: 0 10px;
              font-weight: 500;
            }
            @media only screen and (max-width: 600px) {
              .email-wrapper { padding: 20px 10px; }
              .header { padding: 30px 20px; }
              .header h1 { font-size: 24px; }
              .content { padding: 24px; }
              .stats-grid { grid-template-columns: 1fr; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-container">
              <div class="header">
                <h1>🤖 Smart Sales Bot Pro</h1>
                <p>Sistema de Automatización Inteligente de Ventas</p>
              </div>
              
              <div class="content">
                <h2>¡Email de Prueba Exitoso! ✅</h2>
                
                <p>Este es un email de prueba del sistema de notificaciones de <strong>Smart Sales Bot Pro</strong>. Si estás viendo este mensaje, significa que el servicio de emails está configurado correctamente y funcionando perfectamente.</p>
                
                <div class="stats-container">
                  <h3 style="color: #1f2937; margin-bottom: 10px;">Rendimiento del Sistema</h3>
                  <div class="stats-grid">
                    <div class="stat-item">
                      <span class="stat-number">99.9%</span>
                      <span class="stat-label">Uptime</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-number">&lt;2s</span>
                      <span class="stat-label">Respuesta</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-number">24/7</span>
                      <span class="stat-label">Disponible</span>
                    </div>
                  </div>
                </div>
                
                <h3 style="color: #1f2937; margin-top: 30px; margin-bottom: 16px;">🚀 Características Principales</h3>
                
                <div class="feature-grid">
                  <div class="feature-card">
                    <h3>🤖 Inteligencia Artificial Avanzada</h3>
                    <p>Respuestas naturales y contextuales con múltiples proveedores de IA (Groq, OpenAI, Claude, Gemini)</p>
                  </div>
                  
                  <div class="feature-card">
                    <h3>💬 WhatsApp Real Integrado</h3>
                    <p>Conexión directa con WhatsApp usando Baileys. No necesitas WhatsApp Business API</p>
                  </div>
                  
                  <div class="feature-card">
                    <h3>🎯 Búsqueda Inteligente de Productos</h3>
                    <p>Sistema semántico que entiende las intenciones del cliente y recomienda productos relevantes</p>
                  </div>
                  
                  <div class="feature-card">
                    <h3>💳 Generación Automática de Pagos</h3>
                    <p>Links de pago personalizados para MercadoPago, PayPal, Nequi y más</p>
                  </div>
                  
                  <div class="feature-card">
                    <h3>🎤 Transcripción de Audio</h3>
                    <p>Convierte mensajes de voz en texto usando Groq Whisper API</p>
                  </div>
                  
                  <div class="feature-card">
                    <h3>📊 Analytics en Tiempo Real</h3>
                    <p>Dashboard completo con métricas de conversaciones, ventas y rendimiento</p>
                  </div>
                </div>
                
                <div class="highlight-box">
                  <strong>🎁 Oferta Especial</strong>
                  <p>Obtén 7 días de prueba gratis con acceso completo a todas las funcionalidades. Sin tarjeta de crédito requerida.</p>
                </div>
                
                <div style="text-align: center;">
                  <a href="${process.env.NEXTAUTH_URL || 'http://localhost:4000'}" class="cta-button">
                    Acceder al Dashboard
                  </a>
                </div>
                
                <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #e5e7eb;">
                  <h3 style="color: #1f2937; margin-bottom: 16px;">📧 Tipos de Notificaciones</h3>
                  <p>Este sistema envía notificaciones profesionales para:</p>
                  <ul style="color: #4b5563; margin-left: 20px; margin-top: 12px;">
                    <li style="margin-bottom: 8px;">✅ Verificación de cuenta</li>
                    <li style="margin-bottom: 8px;">🎉 Bienvenida a nuevos usuarios</li>
                    <li style="margin-bottom: 8px;">🔐 Restablecimiento de contraseña</li>
                    <li style="margin-bottom: 8px;">🔔 Alertas de inicio de sesión</li>
                    <li style="margin-bottom: 8px;">💰 Confirmaciones de pago</li>
                    <li style="margin-bottom: 8px;">📦 Actualizaciones de pedidos</li>
                  </ul>
                </div>
              </div>
              
              <div class="footer">
                <strong>Smart Sales Bot Pro</strong>
                <p>Automatización Inteligente de Ventas por WhatsApp</p>
                <p style="margin-top: 20px;">Fecha de envío: ${new Date().toLocaleString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
                <div class="social-links">
                  <a href="#">Soporte</a> • 
                  <a href="#">Documentación</a> • 
                  <a href="#">Blog</a>
                </div>
                <p style="margin-top: 20px; font-size: 12px;">
                  Este es un correo automático de prueba. No es necesario responder.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
      SMART SALES BOT PRO - Email de Prueba
      
      ¡Email de prueba exitoso!
      
      Este es un email de prueba del sistema de notificaciones de Smart Sales Bot Pro.
      Si estás viendo este mensaje, el servicio de emails está funcionando correctamente.
      
      Características principales:
      - Inteligencia Artificial Avanzada
      - WhatsApp Real Integrado
      - Búsqueda Inteligente de Productos
      - Generación Automática de Pagos
      - Transcripción de Audio
      - Analytics en Tiempo Real
      
      Visita: ${process.env.NEXTAUTH_URL || 'http://localhost:4000'}
      
      Fecha: ${new Date().toLocaleString('es-ES')}
      
      Smart Sales Bot Pro - Automatización Inteligente de Ventas
    `

    return this.sendEmail({
      to: email,
      subject: '✅ Email de Prueba - Smart Sales Bot Pro',
      html,
      text
    })
  }
}

