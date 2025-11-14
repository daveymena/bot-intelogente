# 🦙 Guía: Desplegar Bot con Ollama en Easypanel

## 🎯 Ventajas de usar Ollama:

- ✅ **100% Gratis** - Sin costos de API
- ✅ **Sin límites** - Tokens ilimitados
- ✅ **Rápido** - Corre en tu VPS
- ✅ **Privado** - Tus datos no salen del servidor
- ✅ **Múltiples modelos** - Llama, Mistral, Phi, etc.

---

## 📋 Paso 1: Instalar Easypanel en tu VPS

```bash
# Conectarte por SSH
ssh usuario@tu-servidor

# Instalar Easypanel
curl -sSL https://get.easypanel.io | sh
```

Espera 2-3 minutos. Luego accede a:
```
http://tu-ip-del-servidor:3000
```

---

## 🦙 Paso 2: Agregar Ollama en Easypanel

### 2.1 Crear Proyecto
1. Click en **"Create Project"**
2. Nombre: `whatsapp-bot`

### 2.2 Agregar Ollama
1. Click **"Add Service"** → **"App"**
2. Nombre: `ollama`
3. **Source:** Docker Image
4. **Image:** `ollama/ollama:latest`
5. **Port:** `11434`

### 2.3 Configurar Volumen para Ollama
1. En la sección **"Mounts"**
2. Click **"Add Mount"**
3. **Path:** `/root/.ollama`
4. **Size:** 10 GB (para almacenar modelos)

### 2.4 Deploy Ollama
Click en **"Deploy"**

---

## 📥 Paso 3: Descargar Modelo en Ollama

Una vez que Ollama esté corriendo:

1. En Easypanel, ve al servicio **"ollama"**
2. Click en **"Terminal"** o **"Console"**
3. Ejecuta:

```bash
# Descargar Llama 3.2 (3B - Rápido y ligero)
ollama pull llama3.2

# O si prefieres Llama 3.1 (8B - Más potente)
ollama pull llama3.1

# O Mistral (7B - Excelente para español)
ollama pull mistral
```

**Recomendado para tu VPS (8GB RAM):**
- `llama3.2` (3B) - Usa ~2GB RAM, muy rápido
- `llama3.1` (8B) - Usa ~5GB RAM, más inteligente
- `mistral` (7B) - Usa ~4GB RAM, excelente español

---

## 🗄️ Paso 4: Agregar PostgreSQL

1. Click **"Add Service"** → **"PostgreSQL"**
2. Nombre: `whatsapp-db`
3. Easypanel lo configura automáticamente
4. Anota la URL de conexión

---

## 🤖 Paso 5: Agregar tu Bot

### 5.1 Crear Servicio
1. Click **"Add Service"** → **"App"**
2. Nombre: `whatsapp-bot`

### 5.2 Configurar GitHub
- **Source:** GitHub
- **Propietario:** `daveymena`
- **Repositorio:** `bot-intelogente`
- **Rama:** `main`
- **Ruta de compilación:** `.`
- **Build Method:** Dockerfile

### 5.3 Variables de Entorno

```env
# Base de Datos
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://postgres:password@whatsapp-db:5432/postgres

# Autenticación
NODE_ENV=production
NEXTAUTH_SECRET=genera-uno-seguro-con-openssl
NEXTAUTH_URL=http://tu-dominio-o-ip

# Ollama (IA Local)
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2
OLLAMA_TIMEOUT=30000

# Configuración de IA
AI_PROVIDER=ollama
DEFAULT_AI_PROVIDER=ollama
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=ollama,openrouter,groq

# Respaldo (Opcional - si Ollama falla)
GROQ_API_KEY=tu_groq_key_opcional
OPENROUTER_API_KEY=tu_openrouter_key_opcional

# WhatsApp
WHATSAPP_PROVIDER=baileys
SESSION_PATH=/app/whatsapp-sessions
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
PUPPETEER_HEADLESS=true
PUPPETEER_SANDBOX=false

# Admin
ADMIN_EMAIL=tu@email.com
ADMIN_PASSWORD=tu-password-seguro
CREATE_ADMIN=true
RUN_MIGRATIONS=true

# Puerto
PORT=3000
```

### 5.4 Agregar Volumen para WhatsApp
1. En **"Mounts"**
2. Click **"Add Mount"**
3. **Path:** `/app/whatsapp-sessions`
4. **Size:** 1 GB

### 5.5 Deploy
Click en **"Deploy"**

---

## ✅ Paso 6: Verificar que Funciona

### 6.1 Verificar Ollama
1. Ve al servicio **"ollama"**
2. Click en **"Logs"**
3. Deberías ver: `Ollama is running`

### 6.2 Verificar Bot
1. Ve al servicio **"whatsapp-bot"**
2. Click en **"Logs"**
3. Busca: `[AI Multi-Provider] ✅ Éxito con: ollama`

### 6.3 Probar el Bot
1. Abre la URL de tu bot
2. Inicia sesión
3. Conecta WhatsApp
4. Envía un mensaje de prueba
5. El bot debería responder usando Ollama

---

## 🎯 Modelos Recomendados por Uso

### Para tu VPS (8GB RAM):

| Modelo | RAM | Velocidad | Calidad | Uso |
|--------|-----|-----------|---------|-----|
| `llama3.2` | 2GB | ⚡⚡⚡ | ⭐⭐⭐ | Respuestas rápidas |
| `llama3.1` | 5GB | ⚡⚡ | ⭐⭐⭐⭐ | Conversaciones complejas |
| `mistral` | 4GB | ⚡⚡ | ⭐⭐⭐⭐ | Excelente español |
| `phi3` | 2GB | ⚡⚡⚡ | ⭐⭐⭐ | Muy rápido |

### Comandos para cambiar modelo:

```bash
# En el terminal de Ollama
ollama pull llama3.1
```

Luego actualiza la variable en Easypanel:
```env
OLLAMA_MODEL=llama3.1
```

---

## 💰 Comparación de Costos

| Proveedor | Costo/mes | Límites |
|-----------|-----------|---------|
| **Ollama** | $0 | Ilimitado |
| OpenRouter | $10-50 | Por tokens |
| Groq | Gratis | 30 req/min |
| OpenAI | $20-100 | Por tokens |

---

## 🔧 Troubleshooting

### Ollama no responde
```bash
# En terminal de Ollama
ollama list  # Ver modelos instalados
ollama ps    # Ver modelos en ejecución
```

### Bot no conecta con Ollama
Verifica que la URL sea correcta:
```env
OLLAMA_URL=http://ollama:11434
```

En Easypanel, los servicios se comunican por nombre.

### Modelo muy lento
Cambia a un modelo más ligero:
```bash
ollama pull llama3.2  # Más rápido
```

### Se queda sin RAM
Usa un modelo más pequeño o aumenta RAM del VPS.

---

## 🎉 ¡Listo!

Tu bot ahora usa Ollama:
- ✅ Sin costos de API
- ✅ Respuestas ilimitadas
- ✅ Privacidad total
- ✅ Fallback a OpenRouter/Groq si falla

---

## 📊 Uso de Recursos

Con Ollama + Bot + PostgreSQL:

| Servicio | CPU | RAM | Disco |
|----------|-----|-----|-------|
| Ollama | 20% | 2-5GB | 10GB |
| Bot | 10% | 300MB | 2GB |
| PostgreSQL | 5% | 100MB | 1GB |
| **Total** | 35% | 2.4-5.4GB | 13GB |

**Tu VPS:** 4 vCPU, 8GB RAM, 75GB
**Sobra:** 65% CPU, 2.6-5.6GB RAM, 62GB disco

¡Perfecto! 🎯
