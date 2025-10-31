# 🚀 Configuración Completa para Easypanel

## ✅ Configuración Garantizada Sin Errores

Esta guía asegura que tu bot funcione perfectamente en Easypanel.

---

## 📋 Paso 1: Servicios Necesarios

Tu proyecto necesita 3 servicios en Easypanel:

1. **PostgreSQL** - Base de datos
2. **Ollama** - IA local (opcional pero recomendado)
3. **WhatsApp Bot** - Tu aplicación

---

## 🗄️ Paso 2: Crear PostgreSQL

1. Click **"Add Service"** → **"PostgreSQL"**
2. **Nombre:** `whatsapp-db`
3. **Database:** `whatsapp_bot`
4. **User:** `postgres`
5. Click **"Deploy"**

**Anota la URL interna:** `postgresql://postgres:password@whatsapp-db:5432/whatsapp_bot`

---

## 🦙 Paso 3: Crear Ollama (Opcional)

1. Click **"Add Service"** → **"App"**
2. **Nombre:** `ollama`
3. **Source:** Docker Image
4. **Image:** `ollama/ollama:latest`
5. **Port:** `11434`

### Agregar Volumen:
- **Path:** `/root/.ollama`
- **Size:** 10 GB

6. Click **"Deploy"**

### Descargar Modelo:
Una vez desplegado, abre el **Terminal** del servicio y ejecuta:
```bash
ollama pull llama3.2
```

---

## 🤖 Paso 4: Crear Bot de WhatsApp

### 4.1 Configuración Básica

1. Click **"Add Service"** → **"App"**
2. **Nombre:** `whatsapp-bot`
3. **Source:** GitHub

### 4.2 GitHub

- **Propietario:** `daveymena`
- **Repositorio:** `bot-intelogente`
- **Rama:** `main`
- **Ruta de compilación:** `.` (punto solo)

### 4.3 Build

- **Build Method:** Dockerfile
- **Dockerfile Path:** `Dockerfile` (default)

### 4.4 Variables de Entorno

**IMPORTANTE:** Copia TODAS estas variables:

```env
# Base de Datos
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://postgres:TU_PASSWORD@whatsapp-db:5432/whatsapp_bot

# Node
NODE_ENV=production
PORT=3000

# Autenticación (Genera NEXTAUTH_SECRET con: openssl rand -base64 32)
NEXTAUTH_SECRET=TU_SECRET_GENERADO_AQUI
NEXTAUTH_URL=http://tu-dominio-o-ip:3000

# Ollama (IA Local - Gratis)
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2
OLLAMA_TIMEOUT=30000

# Configuración de IA
AI_PROVIDER=ollama
DEFAULT_AI_PROVIDER=ollama
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=ollama,openrouter,groq

# APIs de Respaldo (Opcional)
GROQ_API_KEY=tu-groq-api-key-aqui
GROQ_MODEL=llama-3.1-8b-instant
OPENROUTER_API_KEY=tu-openrouter-api-key-aqui
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet

# WhatsApp
WHATSAPP_PROVIDER=baileys
SESSION_PATH=/app/whatsapp-sessions

# Puppeteer
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
PUPPETEER_HEADLESS=true
PUPPETEER_SANDBOX=false

# Admin
ADMIN_EMAIL=daveymena16@gmail.com
ADMIN_PASSWORD=6715320Dvd.
CREATE_ADMIN=true
RUN_MIGRATIONS=true
```

### 4.5 Volumen Persistente

**CRÍTICO para WhatsApp:**

1. En **"Mounts"**
2. Click **"Add Mount"**
3. **Path:** `/app/whatsapp-sessions`
4. **Size:** 1 GB

### 4.6 Puerto

- **Port:** `3000`
- **Protocol:** HTTP

### 4.7 Deploy

Click **"Deploy"** y espera 5-10 minutos.

---

## ✅ Paso 5: Verificar Funcionamiento

### 5.1 Ver Logs

1. Ve al servicio **"whatsapp-bot"**
2. Click en **"Logs"**
3. Busca:
   - ✅ `Prisma Client generated`
   - ✅ `Ready on http://0.0.0.0:3000`
   - ✅ `[AI Multi-Provider] ✅ Éxito con: ollama`

### 5.2 Acceder al Dashboard

1. Click en la URL del servicio
2. Deberías ver la página de login
3. Inicia sesión con:
   - Email: `daveymena16@gmail.com`
   - Password: `6715320Dvd.`

### 5.3 Conectar WhatsApp

1. Ve a la sección **"WhatsApp"**
2. Click **"Conectar WhatsApp"**
3. Escanea el código QR
4. ¡Listo!

---

## 🔧 Troubleshooting

### Error: "Cannot find module '@tailwindcss/postcss'"

**Solución:** El Dockerfile ya está corregido. Si ves este error:
1. En Easypanel, ve a tu servicio
2. Click **"Rebuild"** (no "Redeploy")
3. Esto forzará un build limpio

### Error: "Database connection failed"

**Solución:** Verifica que `DATABASE_URL` tenga:
- El password correcto de PostgreSQL
- El nombre correcto del servicio: `whatsapp-db`

### Ollama no responde

**Solución:**
1. Ve al servicio **"ollama"**
2. Abre el **Terminal**
3. Ejecuta: `ollama list`
4. Si no hay modelos, ejecuta: `ollama pull llama3.2`

### WhatsApp se desconecta

**Solución:** Verifica que el volumen esté montado:
- Path: `/app/whatsapp-sessions`
- Size: 1 GB

---

## 💡 Optimizaciones

### Usar Dominio Personalizado

1. En Easypanel, ve a tu servicio
2. Click en **"Domains"**
3. Agrega tu dominio
4. Actualiza `NEXTAUTH_URL` con tu dominio

### Aumentar Recursos

Si el bot es lento:
1. Ve a **"Resources"**
2. Aumenta:
   - CPU: 1 → 2 cores
   - RAM: 512MB → 1GB

### Backup Automático

1. Ve a PostgreSQL
2. Click en **"Backups"**
3. Configura backup diario

---

## 📊 Uso de Recursos Esperado

| Servicio | CPU | RAM | Disco |
|----------|-----|-----|-------|
| PostgreSQL | 5% | 100MB | 500MB |
| Ollama | 20% | 2-5GB | 10GB |
| Bot | 10% | 300MB | 2GB |
| **Total** | 35% | 2.4-5.4GB | 12.5GB |

**Tu VPS:** 4 vCPU, 8GB RAM, 75GB
**Sobra:** 65% CPU, 2.6-5.6GB RAM, 62.5GB

---

## 🎯 Checklist Final

Antes de dar por terminado, verifica:

- [ ] PostgreSQL corriendo
- [ ] Ollama corriendo (si lo usas)
- [ ] Bot desplegado sin errores
- [ ] Logs muestran "Ready on http://0.0.0.0:3000"
- [ ] Dashboard accesible
- [ ] Login funciona
- [ ] WhatsApp conectado
- [ ] Bot responde mensajes
- [ ] Volumen persistente montado

---

## 🎉 ¡Listo!

Tu bot está funcionando en Easypanel con:
- ✅ IA local gratis (Ollama)
- ✅ Base de datos PostgreSQL
- ✅ WhatsApp conectado
- ✅ Sesiones persistentes
- ✅ Fallback a APIs cloud

**Costo total:** Solo el VPS (~$6-8/mes)

---

## 📞 Comandos Útiles

### Ver modelos de Ollama:
```bash
ollama list
```

### Descargar nuevo modelo:
```bash
ollama pull mistral
```

### Ver logs en tiempo real:
En Easypanel, click en **"Logs"** y activa **"Follow"**

### Reiniciar servicio:
Click en **"Restart"**

### Rebuild completo:
Click en **"Rebuild"**
