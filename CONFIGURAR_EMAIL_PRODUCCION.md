# 📧 Configurar Email en Producción

## 🎯 Objetivo
Configurar un servicio de email real para enviar notificaciones a los usuarios.

## 🚀 Opciones Disponibles

### Opción 1: Resend (Recomendado) ⭐

**Ventajas:**
- ✅ Fácil de configurar
- ✅ API moderna y simple
- ✅ 100 emails gratis al día
- ✅ Excelente deliverability
- ✅ Dashboard intuitivo

**Pasos:**

1. **Crear cuenta en Resend**
   ```
   https://resend.com/signup
   ```

2. **Obtener API Key**
   - Ve a Settings → API Keys
   - Crea una nueva API Key
   - Copia la key

3. **Instalar dependencia**
   ```bash
   npm install resend
   ```

4. **Configurar en .env**
   ```env
   RESEND_API_KEY=re_123456789abcdefghijklmnop
   ```

5. **Actualizar src/lib/email-service.ts**
   ```typescript
   import { Resend } from 'resend'

   export class EmailService {
     private static resend = new Resend(process.env.RESEND_API_KEY)

     private static async sendEmail(options: EmailOptions): Promise<boolean> {
       if (process.env.NODE_ENV === 'development') {
         console.log('📧 Email simulado:', options)
         return true
       }

       try {
         await this.resend.emails.send({
           from: 'Smart Sales Bot <noreply@smartsalesbot.com>',
           to: options.to,
           subject: options.subject,
           html: options.html
         })
         return true
       } catch (error) {
         console.error('Error sending email:', error)
         return false
       }
     }
   }
   ```

6. **Verificar dominio (opcional pero recomendado)**
   - Ve a Domains en Resend
   - Agrega tu dominio
   - Configura los registros DNS
   - Verifica el dominio

---

### Opción 2: SendGrid

**Ventajas:**
- ✅ 100 emails gratis al día
- ✅ Muy confiable
- ✅ Analytics detallados

**Pasos:**

1. **Crear cuenta**
   ```
   https://signup.sendgrid.com/
   ```

2. **Obtener API Key**
   - Settings → API Keys
   - Create API Key
   - Full Access

3. **Instalar**
   ```bash
   npm install @sendgrid/mail
   ```

4. **Configurar .env**
   ```env
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
   ```

5. **Actualizar código**
   ```typescript
   import sgMail from '@sendgrid/mail'

   export class EmailService {
     private static init() {
       sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
     }

     private static async sendEmail(options: EmailOptions): Promise<boolean> {
       if (process.env.NODE_ENV === 'development') {
         console.log('📧 Email simulado:', options)
         return true
       }

       this.init()

       try {
         await sgMail.send({
           from: 'noreply@smartsalesbot.com',
           to: options.to,
           subject: options.subject,
           html: options.html
         })
         return true
       } catch (error) {
         console.error('Error sending email:', error)
         return false
       }
     }
   }
   ```

---

### Opción 3: Nodemailer (SMTP)

**Ventajas:**
- ✅ Funciona con cualquier proveedor SMTP
- ✅ Gmail, Outlook, etc.
- ✅ Muy flexible

**Pasos:**

1. **Instalar**
   ```bash
   npm install nodemailer
   npm install --save-dev @types/nodemailer
   ```

2. **Configurar .env**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=tu-app-password
   ```

3. **Para Gmail:**
   - Ve a tu cuenta de Google
   - Seguridad → Verificación en 2 pasos
   - Contraseñas de aplicaciones
   - Genera una contraseña para "Correo"

4. **Actualizar código**
   ```typescript
   import nodemailer from 'nodemailer'

   export class EmailService {
     private static transporter = nodemailer.createTransporter({
       host: process.env.SMTP_HOST,
       port: parseInt(process.env.SMTP_PORT || '587'),
       secure: false,
       auth: {
         user: process.env.SMTP_USER,
         pass: process.env.SMTP_PASS
       }
     })

     private static async sendEmail(options: EmailOptions): Promise<boolean> {
       if (process.env.NODE_ENV === 'development') {
         console.log('📧 Email simulado:', options)
         return true
       }

       try {
         await this.transporter.sendMail({
           from: `"Smart Sales Bot" <${process.env.SMTP_USER}>`,
           to: options.to,
           subject: options.subject,
           html: options.html
         })
         return true
       } catch (error) {
         console.error('Error sending email:', error)
         return false
       }
     }
   }
   ```

---

### Opción 4: Amazon SES

**Ventajas:**
- ✅ Muy económico
- ✅ Alta escalabilidad
- ✅ Integración con AWS

**Pasos:**

1. **Crear cuenta AWS**
   ```
   https://aws.amazon.com/ses/
   ```

2. **Verificar email/dominio**
   - Ve a SES Console
   - Verified Identities
   - Verifica tu email o dominio

3. **Obtener credenciales**
   - IAM → Users → Create User
   - Attach policy: AmazonSESFullAccess
   - Create access key

4. **Instalar**
   ```bash
   npm install @aws-sdk/client-ses
   ```

5. **Configurar .env**
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   ```

---

## 🔧 Configuración Recomendada

### Para Desarrollo
```env
NODE_ENV=development
# Los emails se mostrarán en la consola
```

### Para Producción
```env
NODE_ENV=production
RESEND_API_KEY=tu_api_key_aqui
```

## 📊 Comparación de Servicios

| Servicio | Gratis/Mes | Precio | Facilidad | Recomendado |
|----------|------------|--------|-----------|-------------|
| Resend | 3,000 | $20/10k | ⭐⭐⭐⭐⭐ | ✅ Sí |
| SendGrid | 100/día | $15/40k | ⭐⭐⭐⭐ | ✅ Sí |
| Nodemailer | Depende | Gratis | ⭐⭐⭐ | Para pruebas |
| AWS SES | 62,000 | $0.10/1k | ⭐⭐⭐ | Para escala |

## ✅ Verificación

Después de configurar, prueba enviando un email:

```typescript
// En tu código
await EmailService.sendVerificationEmail(
  'test@example.com',
  'test-token-123',
  'Usuario Test'
)
```

Verifica:
1. ✅ Email recibido
2. ✅ No está en spam
3. ✅ Formato correcto
4. ✅ Enlaces funcionan

## 🐛 Solución de Problemas

### Email no llega
- Verifica API key
- Revisa carpeta de spam
- Verifica dominio verificado
- Revisa logs del servidor

### Email en spam
- Verifica dominio
- Configura SPF, DKIM, DMARC
- Usa dominio verificado
- Evita palabras spam

### Error de autenticación
- Verifica credenciales
- Regenera API key
- Verifica permisos
- Revisa límites de cuenta

## 📞 Soporte

- **Resend:** https://resend.com/docs
- **SendGrid:** https://docs.sendgrid.com
- **Nodemailer:** https://nodemailer.com
- **AWS SES:** https://docs.aws.amazon.com/ses

## 🎉 ¡Listo!

Una vez configurado, tu sistema enviará emails reales a los usuarios para:
- ✅ Verificación de cuenta
- ✅ Bienvenida
- ✅ Recuperación de contraseña
- ✅ Notificaciones de login

**¡Tu sistema de emails está listo para producción! 📧**
