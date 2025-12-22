/**
 * 📧 SERVICIO DE EMAIL CON GMAIL (GRATIS)
 * Alternativa gratuita a Resend usando Gmail + Nodemailer
 */

import nodemailer from 'nodemailer'

export class GmailEmailService {
  private static transporter: any = null

  /**
   * Inicializar transporter de Gmail
   */
  private static getTransporter() {
    if (this.transporter) {
      return this.transporter
    }

    const gmailUser = process.env.GMAIL_USER
    const gmailPassword = process.env.GMAIL_APP_PASSWORD

    if (!gmailUser || !gmailPassword) {
      throw new Error('Gmail no configurado. Configura GMAIL_USER y GMAIL_APP_PASSWORD en .env')
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword
      }
    })

    return this.transporter
  }

  /**
   * Enviar email de verificación
   */
  static async sendVerificationEmail(to: string, token: string, name?: string) {
    try {
      const transporter = this.getTransporter()
      
      const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:4000'}/verify-email?token=${token}`
      
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Smart Sales Bot'}" <${process.env.GMAIL_USER}>`,
        to,
        subject: '✅ Verifica tu correo electrónico',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 ¡Bienvenido${name ? ` ${name}` : ''}!</h1>
              </div>
              <div class="content">
                <p>Gracias por registrarte. Para activar tu cuenta, por favor verifica tu correo electrónico.</p>
                
                <p style="text-align: center;">
                  <a href="${verificationUrl}" class="button">✅ Verificar Email</a>
                </p>
                
                <p>O copia y pega este enlace en tu navegador:</p>
                <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">
                  ${verificationUrl}
                </p>
                
                <p><strong>🎁 Al verificar tu email:</strong></p>
                <ul>
                  <li>✅ Acceso completo al dashboard</li>
                  <li>✅ 10 días de prueba gratuita</li>
                  <li>✅ Todas las funcionalidades desbloqueadas</li>
                </ul>
                
                <p style="color: #666; font-size: 14px; margin-top: 20px;">
                  Si no creaste esta cuenta, puedes ignorar este email.
                </p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} ${process.env.APP_NAME || 'Smart Sales Bot'}. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `
      }

      await transporter.sendMail(mailOptions)
      console.log(`✅ Email de verificación enviado a ${to}`)
      
    } catch (error) {
      console.error('❌ Error enviando email:', error)
      throw error
    }
  }

  /**
   * Enviar email de bienvenida
   */
  static async sendWelcomeEmail(to: string, name?: string) {
    try {
      const transporter = this.getTransporter()
      
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Smart Sales Bot'}" <${process.env.GMAIL_USER}>`,
        to,
        subject: '🎉 ¡Bienvenido a Smart Sales Bot!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 ¡Tu cuenta está activa!</h1>
              </div>
              <div class="content">
                <p>Hola${name ? ` ${name}` : ''},</p>
                
                <p>¡Tu email ha sido verificado exitosamente! Ya puedes empezar a usar todas las funcionalidades.</p>
                
                <p><strong>🚀 Próximos pasos:</strong></p>
                <ol>
                  <li>Conecta tu WhatsApp</li>
                  <li>Agrega tus productos</li>
                  <li>Configura tus métodos de pago</li>
                  <li>¡Empieza a vender!</li>
                </ol>
                
                <p style="text-align: center;">
                  <a href="${process.env.NEXTAUTH_URL || 'http://localhost:4000'}" class="button">🚀 Ir al Dashboard</a>
                </p>
                
                <p>Si tienes alguna pregunta, estamos aquí para ayudarte.</p>
              </div>
            </div>
          </body>
          </html>
        `
      }

      await transporter.sendMail(mailOptions)
      console.log(`✅ Email de bienvenida enviado a ${to}`)
      
    } catch (error) {
      console.error('❌ Error enviando email de bienvenida:', error)
      // No lanzar error para no bloquear el flujo
    }
  }
}

