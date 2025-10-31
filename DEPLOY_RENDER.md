# 🚀 Guía de Despliegue en Render

Esta guía te ayudará a desplegar tu bot de WhatsApp en Render.

## 📋 Requisitos Previos

1. Cuenta en [Render](https://render.com) (gratis)
2. Repositorio en GitHub/GitLab
3. API Keys de IA (Groq, OpenRouter, etc.)

## 🔧 Paso 1: Preparar el Proyecto

### 1.1 Actualizar .env local

Agrega esta variable a tu `.env` local:

```env
DATABASE_PROVIDER=sqlite
```

### 1.2 Crear migraciones de Prisma

```bash
# En tu máquina local
npx prisma migrate dev --name init
```

Esto creará las migraciones en `prisma/migrations/`

### 1.3 Subir a GitHub

```bash
git add .
git commit -m "Preparar para deploy en Render"
git push origin main
```

## 🌐 Paso 2: Crear Base de Datos en Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en **"New +"** → **"PostgreSQL"**
3. Configura:
   - **Name:** `whatsapp-bot-db`
   - **Database:** `whatsapp_bot`
   - **User:** `whatsapp_bot_user`
   - **Region:** Oregon (o el más cercano)
   - **Plan:** Free (o Starter si necesitas más)
4. Click **"Create Database"**
5. **IMPORTANTE:** Copia la **Internal Database URL** (la usaremos después)

## 🤖 Paso 3: Crear Web Service

1. En Render Dashboard, click **"New +"** → **"Web Service"**
2. Conecta tu repositorio de GitHub
3. Configura:

### Configuración Básica
- **Name:** `whatsapp-bot`
- **Region:** Oregon (mismo que la BD)
- **Branch:** `main`
- **Root Directory:** (dejar vacío)
- **Runtime:** Node
- **Build Command:**
  ```bash
  npm install && npx prisma generate && npm run build
  ```
- **Start Command:**
  ```bash
  npm start
  ```

### Variables de Entorno

Click en **"Advanced"** y agrega estas variables:

#### Base de Datos
```
DATABASE_PROVIDER=postgresql
DATABASE_URL=[Pega aquí la Internal Database URL que copiaste]
```

#### Autenticación
```
NODE_ENV=production
NEXTAUTH_SECRET=[Genera uno con: openssl rand -base64 32]
NEXTAUTH_URL=https://tu-app.onrender.com
```

#### Inteligencia Artificial
```
GROQ_API_KEY=tu_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
OPENROUTER_API_KEY=tu_openrouter_api_key
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
AI_PROVIDER=openrouter
DEFAULT_AI_PROVIDER=openrouter
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=openrouter,groq
```

#### WhatsApp
```
WHATSAPP_PROVIDER=baileys
SESSION_PATH=/opt/render/project/src/whatsapp-sessions
```

#### Puppeteer (para QR de WhatsApp)
```
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
PUPPETEER_HEADLESS=true
PUPPETEER_SANDBOX=false
```

#### Admin
```
ADMIN_EMAIL=tu@email.com
ADMIN_PASSWORD=tu-password-seguro
CREATE_ADMIN=true
RUN_MIGRATIONS=true
```

### Plan
- **Instance Type:** Starter ($7/mes) o Free (con limitaciones)
  - **IMPORTANTE:** El plan Free se duerme después de 15 min de inactividad
  - Para WhatsApp 24/7, necesitas plan Starter mínimo

### Disco Persistente (IMPORTANTE para WhatsApp)

1. Scroll hasta **"Disk"**
2. Click **"Add Disk"**
3. Configura:
   - **Name:** `whatsapp-sessions`
   - **Mount Path:** `/opt/render/project/src/whatsapp-sessions`
   - **Size:** 1 GB (suficiente)

4. Click **"Create Web Service"**

## ⏳ Paso 4: Esperar el Deploy

Render comenzará a:
1. Clonar tu repositorio
2. Instalar dependencias
3. Ejecutar migraciones
4. Compilar Next.js
5. Iniciar el servidor

Esto toma 5-10 minutos la primera vez.

## ✅ Paso 5: Verificar que Funciona

1. Una vez que el deploy termine, verás **"Live"** en verde
2. Click en la URL de tu app (ej: `https://whatsapp-bot-abc123.onrender.com`)
3. Deberías ver la página de login
4. Inicia sesión con:
   - Email: El que configuraste en `ADMIN_EMAIL`
   - Password: El que configuraste en `ADMIN_PASSWORD`

## 📱 Paso 6: Conectar WhatsApp

1. En el dashboard, ve a **"WhatsApp"**
2. Click **"Conectar WhatsApp"**
3. Escanea el código QR con tu WhatsApp
4. ¡Listo! El bot está funcionando

## 🔄 Actualizaciones Automáticas

Render detecta automáticamente cambios en tu repositorio:

```bash
# En tu máquina local
git add .
git commit -m "Actualización del bot"
git push origin main
```

Render automáticamente:
1. Detecta el push
2. Hace rebuild
3. Redeploy sin downtime

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
# Asegúrate de que package.json tenga:
"postinstall": "prisma generate"
```

### Error: "Database connection failed"
- Verifica que `DATABASE_URL` esté correcta
- Usa la **Internal Database URL**, no la External

### WhatsApp se desconecta constantemente
- Verifica que el disco persistente esté montado
- Asegúrate de estar en plan Starter (no Free)

### El bot no responde
- Revisa los logs en Render Dashboard → Logs
- Verifica que las API keys de IA estén correctas

## 💰 Costos Estimados

### Plan Mínimo Recomendado:
- **Web Service Starter:** $7/mes
- **PostgreSQL Starter:** $7/mes
- **Disco 1GB:** Incluido
- **Total:** ~$14/mes

### Plan Free (Limitado):
- Web Service se duerme después de 15 min
- PostgreSQL 256MB (limitado)
- No recomendado para producción 24/7

## 🎯 Próximos Pasos

1. Configura un dominio personalizado (opcional)
2. Agrega productos desde el dashboard
3. Prueba el bot enviando mensajes
4. Monitorea las conversaciones

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Render
2. Verifica las variables de entorno
3. Consulta la documentación de Render

---

¡Tu bot está listo para vender 24/7! 🎉
