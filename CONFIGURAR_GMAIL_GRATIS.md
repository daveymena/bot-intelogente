# 📧 CONFIGURAR GMAIL PARA EMAILS (100% GRATIS)

## 🎯 POR QUÉ GMAIL

- ✅ **100% Gratis** - Sin límites de pago
- ✅ **500 emails/día** - Más que suficiente
- ✅ **Sin verificación de dominio** - Funciona inmediatamente
- ✅ **Confiable** - Los emails no van a spam
- ✅ **Fácil de configurar** - 5 minutos

---

## 📋 PASOS PARA CONFIGURAR

### 1. Crear Contraseña de Aplicación en Gmail

#### Paso 1: Ir a tu cuenta de Google
```
https://myaccount.google.com/
```

#### Paso 2: Activar verificación en 2 pasos (si no la tienes)
```
1. Ve a "Seguridad"
2. Busca "Verificación en 2 pasos"
3. Actívala (necesaria para contraseñas de aplicación)
```

#### Paso 3: Crear contraseña de aplicación
```
1. Ve a "Seguridad"
2. Busca "Contraseñas de aplicaciones"
3. Selecciona "Correo" y "Otro (nombre personalizado)"
4. Escribe: "Smart Sales Bot"
5. Haz clic en "Generar"
6. Copia la contraseña de 16 caracteres
   Ejemplo: "abcd efgh ijkl mnop"
```

### 2. Configurar en .env

Agrega estas líneas a tu archivo `.env`:

```env
# Gmail para envío de emails (GRATIS)
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop  # Sin espacios
APP_NAME=Smart Sales Bot
```

**Ejemplo real:**
```env
GMAIL_USER=daveymena16@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
APP_NAME=Tecnovariedades D&S
```

### 3. Instalar Nodemailer

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### 4. Actualizar auth.ts

Cambiar de Resend a Gmail en el registro.

---

## 🧪 PROBAR QUE FUNCIONA

### Script de Prueba

```bash
npx tsx scripts/test-gmail.ts
```

Debería enviar un email de prueba a tu Gmail.

---

## ✅ VENTAJAS vs RESEND

| Característica | Gmail | Resend (Gratis) |
|---|---|---|
| **Costo** | Gratis | Gratis |
| **Emails/día** | 500 | 100 |
| **Verificación dominio** | No requiere | Requiere |
| **Enviar a cualquier email** | ✅ Sí | ❌ Solo a tu email |
| **Configuración** | 5 minutos | 30 minutos |
| **Confiabilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Error: "Invalid login"
```
❌ Problema: Contraseña incorrecta
✅ Solución: 
   1. Verifica que copiaste la contraseña completa
   2. Quita los espacios
   3. Genera una nueva contraseña de aplicación
```

### Error: "Less secure app access"
```
❌ Problema: Cuenta sin verificación en 2 pasos
✅ Solución:
   1. Activa verificación en 2 pasos
   2. Luego crea contraseña de aplicación
```

### Emails van a spam
```
❌ Problema: Gmail nuevo o poco usado
✅ Solución:
   1. Envía algunos emails manualmente primero
   2. Pide a los usuarios que marquen como "No es spam"
   3. Después de unos días, mejorará
```

---

## 🎯 ALTERNATIVA: Desactivar Verificación de Email

Si prefieres no usar emails, puedes desactivar la verificación:

### Opción 1: Solo WhatsApp

```typescript
// En src/lib/auth.ts
// Comentar el envío de email:

// await EmailService.sendVerificationEmail(...)

// Activar cuenta inmediatamente:
const user = await db.user.create({
  data: {
    ...
    isEmailVerified: true,  // ← Activar directamente
    isActive: true,         // ← Activar directamente
  }
})
```

### Opción 2: Verificación Manual

Los admins pueden verificar usuarios manualmente desde el dashboard.

---

## 📊 COMPARACIÓN DE SERVICIOS

### Gmail (Recomendado) ⭐
- ✅ Gratis
- ✅ 500 emails/día
- ✅ Sin verificación de dominio
- ✅ Configuración rápida

### Resend
- ✅ Gratis (100 emails/día)
- ❌ Requiere verificación de dominio
- ❌ Solo envía a tu email en plan gratuito

### Brevo (Sendinblue)
- ✅ Gratis (300 emails/día)
- ✅ Sin verificación de dominio
- ⚠️  Requiere API key

### Mailgun
- ⚠️  Gratis (100 emails/día)
- ❌ Requiere tarjeta de crédito
- ❌ Configuración compleja

---

## 🚀 RESUMEN

**Para empezar rápido:**

1. Usa tu Gmail personal
2. Crea contraseña de aplicación (5 min)
3. Agrega a .env
4. ¡Listo! 500 emails/día gratis

**Para producción:**

1. Crea Gmail específico para el bot
   Ejemplo: bot@tuempresa.com (Gmail)
2. Configura contraseña de aplicación
3. Usa ese Gmail en producción

---

## 📝 EJEMPLO COMPLETO

```env
# .env
GMAIL_USER=bot-tecnovariedades@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
APP_NAME=Tecnovariedades D&S
NEXTAUTH_URL=https://tu-dominio.com
```

```typescript
// src/lib/auth.ts
import { GmailEmailService } from './email-service-gmail'

// En el registro:
await GmailEmailService.sendVerificationEmail(
  user.email,
  verificationToken,
  user.name
)
```

---

## ✅ CHECKLIST

- [ ] Cuenta Gmail lista
- [ ] Verificación en 2 pasos activada
- [ ] Contraseña de aplicación generada
- [ ] Variables en .env configuradas
- [ ] Nodemailer instalado
- [ ] Script de prueba ejecutado
- [ ] Email de prueba recibido

---

**¡Con Gmail puedes enviar emails gratis y sin complicaciones!** 📧✨
