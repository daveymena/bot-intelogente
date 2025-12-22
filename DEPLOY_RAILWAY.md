# 🚂 Guía de Despliegue en Railway

Railway es otra excelente opción para desplegar tu bot, con mejor pricing que Render.

## 📋 Requisitos Previos

1. Cuenta en [Railway](https://railway.app) (gratis con $5 de crédito)
2. Repositorio en GitHub
3. API Keys de IA

## 🚀 Paso 1: Crear Proyecto en Railway

1. Ve a [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Conecta tu repositorio
5. Railway detectará automáticamente que es un proyecto Node.js

## 🗄️ Paso 2: Agregar PostgreSQL

1. En tu proyecto, click **"+ New"**
2. Selecciona **"Database"** → **"PostgreSQL"**
3. Railway creará automáticamente la base de datos
4. La variable `DATABASE_URL` se agregará automáticamente

## ⚙️ Paso 3: Configurar Variables de Entorno

1. Click en tu servicio web
2. Ve a **"Variables"**
3. Agrega estas variables:

```env
# Base de datos (Railway la crea automáticamente)
DATABASE_PROVIDER=postgresql

# Autenticación
NODE_ENV=production
NEXTAUTH_SECRET=genera-uno-seguro-aqui
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}

# IA
GROQ_API_KEY=tu_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
OPENROUTER_API_KEY=tu_openrouter_api_key
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
AI_PROVIDER=openrouter
DEFAULT_AI_PROVIDER=openrouter
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=openrouter,groq

# WhatsApp
WHATSAPP_PROVIDER=baileys
SESSION_PATH=/app/whatsapp-sessions

# Puppeteer
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
PUPPETEER_HEADLESS=true
PUPPETEER_SANDBOX=false

# Admin
ADMIN_EMAIL=tu@email.com
ADMIN_PASSWORD=tu-password-seguro
CREATE_ADMIN=true
RUN_MIGRATIONS=true

# Configuración
PORT=3000
```

## 📦 Paso 4: Configurar Build

Railway detecta automáticamente los comandos, pero puedes personalizarlos:

1. Ve a **"Settings"**
2. En **"Build Command"** (opcional):
   ```bash
   npm install && npx prisma generate && npm run build
   ```
3. En **"Start Command"**:
   ```bash
   npm start
   ```

## 💾 Paso 5: Agregar Volumen Persistente

Para guardar las sesiones de WhatsApp:

1. Ve a **"Settings"**
2. Scroll hasta **"Volumes"**
3. Click **"+ Add Volume"**
4. Configura:
   - **Mount Path:** `/app/whatsapp-sessions`
   - **Size:** 1 GB

## 🚀 Paso 6: Deploy

1. Railway comenzará el deploy automáticamente
2. Espera 5-10 minutos
3. Una vez completado, verás la URL pública

## ✅ Verificar

1. Click en la URL generada
2. Deberías ver la página de login
3. Inicia sesión con tus credenciales de admin

## 💰 Costos en Railway

Railway cobra por uso:
- **$5 gratis al mes** (suficiente para empezar)
- Después: ~$0.000463/GB-hora
- Estimado: **$5-10/mes** para uso normal

**Ventajas sobre Render:**
- Más barato
- No se duerme (siempre activo)
- Deploy más rápido
- Mejor UI

## 🔄 Actualizaciones

Railway detecta automáticamente cambios en GitHub:

```bash
git push origin main
```

Railway hace redeploy automático.

## 🐛 Troubleshooting

### Error de Prisma
```bash
# Asegúrate de tener en package.json:
"postinstall": "prisma generate"
```

### WhatsApp no conecta
- Verifica que el volumen esté montado
- Revisa los logs en Railway

### Base de datos no conecta
- Railway crea `DATABASE_URL` automáticamente
- Verifica que `DATABASE_PROVIDER=postgresql`

---

¡Railway es perfecto para tu bot! 🎉
