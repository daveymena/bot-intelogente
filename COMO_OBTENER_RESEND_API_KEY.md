# 🔑 Cómo Obtener tu RESEND_API_KEY

## 📋 Pasos Rápidos

### 1. Crear Cuenta en Resend (GRATIS)

1. **Ve a:** https://resend.com
2. **Click en "Sign Up"** (Registrarse)
3. **Usa tu email:** daveymena16@gmail.com
4. **Verifica tu email** (recibirás un código)
5. **¡Listo!** Ya tienes cuenta gratis

### 2. Obtener tu API Key

1. **Inicia sesión** en https://resend.com
2. **Ve a:** https://resend.com/api-keys
3. **Click en "Create API Key"**
4. **Dale un nombre:** "Smart Sales Bot Production"
5. **Selecciona permisos:** "Full Access" o "Sending Access"
6. **Click "Create"**
7. **COPIA LA KEY** (solo se muestra una vez)
   - Se ve así: `re_xxxxxxxxxxxxxxxxxxxxxxxxxx`

### 3. Configurar en tu Proyecto

#### Opción A: Local (.env)

Ya lo tienes configurado en tu `.env`:
```env
RESEND_API_KEY=re_MMdpZetB_PuLUUbLh6QQMdqvGozjxAGya
```

✅ **Esta key ya funciona** (la probamos y envió el email exitosamente)

#### Opción B: Easypanel (Producción)

1. **Abre Easypanel**
2. **Ve a tu proyecto** → "Environment Variables"
3. **Agrega:**
   ```
   RESEND_API_KEY=re_MMdpZetB_PuLUUbLh6QQMdqvGozjxAGya
   ```
4. **Guarda cambios**
5. **Redeploy** (opcional, Easypanel lo hace automático)

## 🎁 Plan Gratuito de Resend

### Lo que obtienes GRATIS:
- ✅ **3,000 emails/mes** gratis para siempre
- ✅ **100 emails/día** sin verificar dominio
- ✅ **Emails ilimitados** con dominio verificado
- ✅ **API ultra rápida** (~1-2 segundos)
- ✅ **Sin tarjeta de crédito** requerida
- ✅ **Soporte por email**

### Límites del plan gratuito:
- 3,000 emails/mes
- 100 emails/día sin dominio verificado
- Emails desde `onboarding@resend.dev` (dominio de prueba)

### Para más emails:
- **Verifica tu dominio** → Emails ilimitados
- **Upgrade a Pro** → $20/mes = 50,000 emails

## 🌐 Verificar tu Dominio (Opcional)

Si tienes un dominio (ej: `tecnovariedades.com`):

1. **Ve a:** https://resend.com/domains
2. **Click "Add Domain"**
3. **Ingresa tu dominio:** `tecnovariedades.com`
4. **Agrega los registros DNS** que te muestra Resend:
   - SPF
   - DKIM
   - DMARC
5. **Espera verificación** (5-30 minutos)
6. **¡Listo!** Ahora puedes enviar desde `ventas@tecnovariedades.com`

### Actualizar email remitente:

```env
# En .env o Easypanel
RESEND_FROM_EMAIL=ventas@tecnovariedades.com
EMAIL_FROM=Tecnovariedades D&S <ventas@tecnovariedades.com>
```

## 🔒 Seguridad de la API Key

### ✅ Buenas prácticas:

1. **Nunca compartas** tu API key públicamente
2. **No la subas a Git** (está en `.gitignore`)
3. **Usa variables de entorno** (`.env` o Easypanel)
4. **Rota la key** si crees que fue comprometida

### ⚠️ Si tu key se filtra:

1. **Ve a:** https://resend.com/api-keys
2. **Elimina la key comprometida**
3. **Crea una nueva**
4. **Actualiza en `.env` y Easypanel**

## 📊 Monitorear Uso

### Ver emails enviados:

1. **Dashboard:** https://resend.com/emails
2. **Logs:** https://resend.com/logs
3. **Analytics:** https://resend.com/analytics

### Información que verás:
- ✅ Emails enviados exitosamente
- ❌ Emails fallidos
- 📊 Tasa de apertura (con dominio verificado)
- 📈 Uso mensual

## 🧪 Probar tu API Key

### Desde tu proyecto local:

```bash
# Verificar que funciona
npx tsx scripts/verificar-emails-llegan.ts
```

### Desde Easypanel:

```bash
# En terminal de Easypanel
npx tsx scripts/verificar-emails-llegan.ts
```

## 📝 Tu Configuración Actual

### Local (.env) - ✅ FUNCIONANDO

```env
RESEND_API_KEY=re_MMdpZetB_PuLUUbLh6QQMdqvGozjxAGya
RESEND_FROM_EMAIL=onboarding@resend.dev
EMAIL_FROM=Tecnovariedades D&S <onboarding@resend.dev>
```

**Estado:** ✅ Probado y funcionando
**Email enviado:** d7b9a1c7-7c61-4de9-a60b-3393a62f4a30

### Easypanel (Producción) - ⚠️ PENDIENTE

Necesitas agregar en Easypanel → Environment Variables:

```env
RESEND_API_KEY=re_MMdpZetB_PuLUUbLh6QQMdqvGozjxAGya
RESEND_FROM_EMAIL=onboarding@resend.dev
EMAIL_FROM=Tecnovariedades D&S <onboarding@resend.dev>
```

## 🚀 Pasos para Easypanel

### Opción 1: Interfaz Web (Recomendado)

1. **Abre Easypanel:** https://easypanel.io
2. **Selecciona tu proyecto:** "bot-whatsapp" o similar
3. **Ve a "Environment"** o "Environment Variables"
4. **Click "Add Variable"**
5. **Agrega cada variable:**
   ```
   Nombre: RESEND_API_KEY
   Valor: re_MMdpZetB_PuLUUbLh6QQMdqvGozjxAGya
   ```
   ```
   Nombre: RESEND_FROM_EMAIL
   Valor: onboarding@resend.dev
   ```
   ```
   Nombre: EMAIL_FROM
   Valor: Tecnovariedades D&S <onboarding@resend.dev>
   ```
6. **Guarda cambios**
7. **Redeploy** (si no es automático)

### Opción 2: Archivo .env en Easypanel

Si Easypanel usa archivo `.env`:

1. **Conecta por SSH** o usa la terminal de Easypanel
2. **Edita el archivo:**
   ```bash
   nano .env
   ```
3. **Agrega las variables:**
   ```env
   RESEND_API_KEY=re_MMdpZetB_PuLUUbLh6QQMdqvGozjxAGya
   RESEND_FROM_EMAIL=onboarding@resend.dev
   EMAIL_FROM=Tecnovariedades D&S <onboarding@resend.dev>
   ```
4. **Guarda:** `Ctrl + X`, luego `Y`, luego `Enter`
5. **Reinicia la app**

## ✅ Verificar que Funciona en Easypanel

Después de configurar:

```bash
# Desde terminal de Easypanel
npx tsx scripts/verificar-emails-llegan.ts
```

Deberías ver:
```
✅ Email enviado con Resend!
   ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   Revisa tu bandeja de entrada: daveymena16@gmail.com
```

## 🎯 Resumen Rápido

### Ya tienes:
- ✅ Cuenta de Resend creada
- ✅ API Key generada: `re_MMdpZetB_PuLUUbLh6QQMdqvGozjxAGya`
- ✅ Configurado en local (`.env`)
- ✅ Probado y funcionando

### Te falta:
- ⚠️ Configurar en Easypanel (variables de entorno)
- ⚠️ Verificar dominio (opcional, para emails ilimitados)

### Próximo paso:
1. **Abre Easypanel**
2. **Agrega las 3 variables de entorno**
3. **Redeploy**
4. **¡Listo!**

## 📞 Soporte

- **Documentación:** https://resend.com/docs
- **API Reference:** https://resend.com/docs/api-reference
- **Soporte:** support@resend.com
- **Status:** https://status.resend.com

---

**Tu API Key actual:** `re_MMdpZetB_PuLUUbLh6QQMdqvGozjxAGya`  
**Estado:** ✅ Activa y funcionando  
**Uso:** 1 email enviado (de 3,000 mensuales)
