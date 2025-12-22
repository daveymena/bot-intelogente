# 🚀 Guía Completa: Desplegar en Easypanel

## ✅ Sistema de Emails Configurado

Tu sistema de emails con **Resend** está funcionando perfectamente:
- ✅ Envío de códigos de verificación
- ✅ Emails de bienvenida
- ✅ Recuperación de contraseña
- ✅ Reenvío de códigos para usuarios no verificados

## 📋 Pre-requisitos

1. **Cuenta en Easypanel** (https://easypanel.io)
2. **Resend API Key** (ya la tienes: `re_MMdpZetB_PuLUUbLh6QQMdqvGozjxAGya`)
3. **Repositorio Git** (GitHub, GitLab, etc.)

## 🎯 Paso 1: Preparar el Código

### 1.1 Subir a Git

```bash
git add .
git commit -m "Sistema de emails configurado con Resend"
git push origin main
```

### 1.2 Verificar archivos importantes

Asegúrate de que estos archivos estén en tu repo:
- ✅ `Dockerfile` - Para construir la imagen
- ✅ `.env.production` - Template de variables de entorno
- ✅ `prisma/schema.prisma` - Esquema de base de datos
- ✅ `package.json` - Dependencias

## 🎯 Paso 2: Crear Servicios en Easypanel

### 2.1 Crear Base de Datos PostgreSQL

1. En Easypanel, click en **"Create Service"**
2. Selecciona **"PostgreSQL"**
3. Configura:
   - **Name**: `botwhatsapp-db`
   - **Database**: `botwhatsapp`
   - **Username**: `postgres`
   - **Password**: Genera una segura (guárdala)
4. Click **"Create"**

### 2.2 Crear Aplicación Next.js

1. Click en **"Create Service"**
2. Selecciona **"App"**
3. Configura:
   - **Name**: `smart-sales-bot`
   - **Source**: Tu repositorio Git
   - **Branch**: `main`
   - **Build Method**: `Dockerfile`

## 🎯 Paso 3: Configurar Variables de Entorno

En la sección **"Environment"** de tu app, agrega estas variables:

### 🔐 Esenciales (OBLIGATORIAS)

```bash
# General
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://tu-app.easypanel.host

# Base de Datos (usa la que creaste)
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://postgres:TU_PASSWORD@botwhatsapp-db:5432/botwhatsapp

# Seguridad (genera nuevos secrets)
NEXTAUTH_SECRET=genera_con_openssl_rand_base64_32
JWT_SECRET=genera_otro_secret_diferente

# Emails (IMPORTANTE)
RESEND_API_KEY=tu_resend_api_key_aqui
RESEND_FROM_EMAIL=onboarding@resend.dev
EMAIL_FROM=Tecnovariedades D&S <onboarding@resend.dev>

# Admin
ADMIN_EMAIL=daveymena16@gmail.com
ADMIN_PASSWORD=tu_password_seguro
```

### 🤖 IA (Recomendadas)

```bash
# Groq (rápido y gratis)
GROQ_API_KEY=tu_groq_api_key_aqui
GROQ_MODEL=llama-3.1-8b-instant

# OpenRouter (opcional)
OPENROUTER_API_KEY=tu_openrouter_key_aqui

# Configuración IA
AI_PROVIDER=groq
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=groq,openrouter
```

### 📱 WhatsApp

```bash
WHATSAPP_PROVIDER=baileys
BUSINESS_PHONE=+57 300 556 0186
NEXT_PUBLIC_WHATSAPP_NUMBER=573005560186
```

### 💳 Pagos (Opcionales)

```bash
# Mercado Pago
MERCADO_PAGO_PUBLIC_KEY=tu_mercadopago_public_key
MERCADO_PAGO_ACCESS_TOKEN=tu_mercadopago_access_token

# PayPal
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret

# Nequi/Daviplata
NEQUI_NUMBER=3005560186
DAVIPLATA_NUMBER=3005560186
```

## 🎯 Paso 4: Configurar Dominio y Puertos

### 4.1 Dominio

1. En **"Domains"**, agrega tu dominio
2. O usa el subdominio de Easypanel: `tu-app.easypanel.host`
3. Actualiza `NEXT_PUBLIC_APP_URL` con tu dominio

### 4.2 Puerto

- **Port**: `3000` (el que usa Next.js)

## 🎯 Paso 5: Desplegar

1. Click en **"Deploy"**
2. Espera a que se construya (5-10 minutos)
3. Verifica los logs para errores

## 🎯 Paso 6: Inicializar Base de Datos

Una vez desplegado, ejecuta en la terminal de Easypanel:

```bash
# Generar cliente Prisma
npx prisma generate

# Crear tablas
npx prisma db push

# Crear usuario admin
npx tsx scripts/create-admin.ts
```

## 🎯 Paso 7: Probar el Sistema

### 7.1 Registro de Usuario

1. Ve a `https://tu-dominio/register`
2. Regístrate con un email real
3. **Deberías recibir un email con el código de verificación** ✅

### 7.2 Reenviar Código (Si no llegó)

1. Ve a `https://tu-dominio/resend-verification`
2. Ingresa tu email
3. Recibirás un nuevo código

### 7.3 Verificar Email

1. Abre el email
2. Copia el código de 6 dígitos
3. Pégalo en la página de verificación
4. ¡Tu cuenta se activa automáticamente!

## 📧 Sistema de Emails - Cómo Funciona

### Para Usuarios Nuevos

1. Usuario se registra → Recibe email con código
2. Usuario verifica → Cuenta activada + 10 días gratis

### Para Usuarios que No Recibieron el Código

1. Van a `/resend-verification`
2. Ingresan su email
3. Reciben nuevo código
4. Verifican y listo

### Rutas Disponibles

- `/register` - Registro de nuevos usuarios
- `/login` - Inicio de sesión
- `/resend-verification` - Reenviar código de verificación
- `/forgot-password` - Recuperar contraseña
- `/reset-password` - Restablecer contraseña

## 🔧 Troubleshooting

### Los emails no llegan

1. **Verifica Resend API Key**:
   ```bash
   echo $RESEND_API_KEY
   ```

2. **Revisa los logs**:
   ```bash
   # En Easypanel, ve a "Logs"
   # Busca mensajes como:
   # ✅ Email enviado exitosamente
   # ❌ Error al enviar email
   ```

3. **Verifica el email remitente**:
   - Usa `onboarding@resend.dev` (dominio de prueba de Resend)
   - O configura tu propio dominio en Resend

### Base de datos no conecta

1. Verifica que `DATABASE_URL` apunte a `botwhatsapp-db:5432`
2. Asegúrate de que ambos servicios estén en la misma red
3. Verifica el password de PostgreSQL

### Build falla

1. Revisa los logs de build
2. Asegúrate de que `Dockerfile` esté en la raíz
3. Verifica que todas las dependencias estén en `package.json`

## 🎉 ¡Listo!

Tu sistema está desplegado con:

✅ Emails funcionando (Resend)  
✅ Registro de usuarios  
✅ Verificación por email  
✅ Reenvío de códigos  
✅ Recuperación de contraseña  
✅ Base de datos PostgreSQL  
✅ WhatsApp Bot  
✅ IA integrada  
✅ Sistema de pagos  

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Easypanel
2. Verifica las variables de entorno
3. Asegúrate de que Resend API Key sea válida
4. Contacta soporte de Easypanel si es necesario

## 🔄 Actualizar la Aplicación

Para actualizar después de hacer cambios:

```bash
# En tu local
git add .
git commit -m "Descripción de cambios"
git push origin main

# En Easypanel
# Click en "Redeploy" o espera el auto-deploy
```

## 🎁 Bonus: Dominio Personalizado en Resend

Para usar tu propio dominio (ej: `noreply@tudominio.com`):

1. Ve a https://resend.com/domains
2. Agrega tu dominio
3. Configura los registros DNS (MX, TXT, CNAME)
4. Espera verificación (puede tardar 24-48h)
5. Actualiza en Easypanel:
   ```bash
   RESEND_FROM_EMAIL=noreply@tudominio.com
   EMAIL_FROM=Tecnovariedades D&S <noreply@tudominio.com>
   ```

¡Eso es todo! 🚀
