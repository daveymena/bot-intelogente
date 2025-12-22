# 🚀 Integración n8n Easypanel + Smart Sales Bot

## 🎯 Escenario

Tienes:
- ✅ n8n corriendo en Easypanel
- ✅ Smart Sales Bot en Easypanel (o local)
- ✅ PostgreSQL en Easypanel

Vamos a conectarlos para que n8n orqueste toda la lógica.

## 📋 Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                  ARQUITECTURA EN EASYPANEL                   │
└─────────────────────────────────────────────────────────────┘

Cliente WhatsApp
    ↓
Baileys (tu app en Easypanel)
    ↓ HTTPS POST
n8n (Easypanel)
    ├─ PostgreSQL (Easypanel)
    ├─ Ollama/Groq (API externa)
    └─ Lógica de negocio
    ↓ HTTPS POST
Baileys (tu app)
    ↓
Cliente WhatsApp
```

## 🔧 Paso 1: Obtener URLs de Easypanel

### 1.1 URL de n8n

En Easypanel, ve a tu app de n8n:
- Copia la URL pública, ejemplo: `https://n8n.tudominio.com`
- O si es interna: `http://n8n:5678` (dentro de Easypanel)

### 1.2 URL de tu Bot

En Easypanel, ve a tu app Smart Sales Bot:
- Copia la URL pública, ejemplo: `https://bot.tudominio.com`
- O si es interna: `http://smart-sales-bot:3000`

### 1.3 Datos de PostgreSQL

En Easypanel, ve a tu base de datos:
- Host: `postgres` (interno) o `postgres.tudominio.com` (externo)
- Port: `5432`
- Database: `smartsales`
- User: tu usuario
- Password: tu contraseña

## 🔐 Paso 2: Configurar Variables de Entorno

### 2.1 En tu App Smart Sales Bot (Easypanel)

Agregar estas variables de entorno:

```bash
# n8n Configuration
N8N_WEBHOOK_URL=https://n8n.tudominio.com/webhook/whatsapp-incoming
N8N_API_KEY=genera-una-api-key-segura-aqui-123456

# Si n8n está en la misma red de Easypanel (recomendado):
# N8N_WEBHOOK_URL=http://n8n:5678/webhook/whatsapp-incoming

# PostgreSQL (ya lo tienes)
DATABASE_URL=postgresql://user:pass@postgres:5432/smartsales

# Ollama o Groq
OLLAMA_URL=http://localhost:11434
# o
GROQ_API_KEY=tu-groq-api-key
```

### 2.2 En n8n (Easypanel)

Agregar estas variables de entorno:

```bash
# URL de tu bot para enviar mensajes
SMART_SALES_BOT_URL=https://bot.tudominio.com
# o interno:
# SMART_SALES_BOT_URL=http://smart-sales-bot:3000

# API Key (la misma que en tu bot)
N8N_API_KEY=genera-una-api-key-segura-aqui-123456

# PostgreSQL (para que n8n pueda consultar)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=smartsales
POSTGRES_USER=tu_usuario
POSTGRES_PASSWORD=tu_password

# Ollama o Groq
OLLAMA_URL=http://ollama:11434
# o
GROQ_API_KEY=tu-groq-api-key
```

## 📦 Paso 3: Importar Workflow en n8n

### 3.1 Acceder a n8n

1. Abrir: `https://n8n.tudominio.com`
2. Iniciar sesión

### 3.2 Importar Workflow

1. Click en "Workflows" → "Import from File"
2. Seleccionar: `n8n-workflow-whatsapp-bot-easypanel.json` (lo crearemos)
3. Click "Import"

### 3.3 Configurar Credenciales PostgreSQL

1. Click en nodo "PostgreSQL"
2. Click "Credentials" → "Create New"
3. Llenar:
   - Name: `PostgreSQL - SmartSales`
   - Host: `postgres` (o tu host)
   - Database: `smartsales`
   - User: tu usuario
   - Password: tu contraseña
   - Port: `5432`
   - SSL: `disable` (si es interno)
4. Click "Save"

### 3.4 Activar Workflow

1. Click en "Active" (arriba a la derecha)
2. ✅ Workflow activado

## 🔗 Paso 4: Configurar Webhooks

### 4.1 Webhook de n8n (Recibir mensajes)

En n8n, el webhook será:
```
https://n8n.tudominio.com/webhook/whatsapp-incoming
```

Este es el que usará tu bot para enviar mensajes a n8n.

### 4.2 Webhook de tu Bot (Enviar mensajes)

Tu bot expondrá:
```
https://bot.tudominio.com/api/whatsapp/send-from-n8n
```

Este es el que usará n8n para enviar mensajes de vuelta.

## 🚀 Paso 5: Desplegar Cambios

### 5.1 Actualizar tu Bot en Easypanel

```bash
# Local: Commit y push
git add .
git commit -m "feat: integración con n8n"
git push origin main

# Easypanel: Rebuild automático o manual
# Ve a tu app → "Deploy" → "Rebuild"
```

### 5.2 Reiniciar Servicios

En Easypanel:
1. Reiniciar app Smart Sales Bot
2. Verificar que n8n esté corriendo

## 🧪 Paso 6: Probar Conexión

### 6.1 Test desde tu Bot a n8n

```bash
# Desde tu servidor local o Easypanel console
curl -X POST https://n8n.tudominio.com/webhook/whatsapp-incoming \
  -H "Content-Type: application/json" \
  -d '{
    "from": "573001234567@s.whatsapp.net",
    "message": "Hola, esto es una prueba",
    "timestamp": 1234567890,
    "messageId": "test-123"
  }'
```

Deberías ver la ejecución en n8n: `https://n8n.tudominio.com/workflows` → "Executions"

### 6.2 Test desde n8n a tu Bot

```bash
# Desde n8n o tu servidor
curl -X POST https://bot.tudominio.com/api/whatsapp/send-from-n8n \
  -H "Content-Type: application/json" \
  -H "x-api-key: tu-api-key-123456" \
  -d '{
    "to": "573001234567@s.whatsapp.net",
    "message": "Hola desde n8n"
  }'
```

Deberías recibir: `{"success": true}`

## 📊 Paso 7: Monitoreo

### 7.1 Ver Logs en Easypanel

**Smart Sales Bot:**
- Easypanel → Tu app → "Logs"
- Buscar: `📨 Mensaje recibido` y `✅ Mensaje enviado a n8n`

**n8n:**
- Easypanel → n8n → "Logs"
- O mejor: `https://n8n.tudominio.com/workflows` → "Executions"

### 7.2 Dashboard de n8n

Ver todas las ejecuciones con datos reales:
- `https://n8n.tudominio.com/workflows`
- Click en tu workflow
- Tab "Executions"
- Ver cada paso con input/output

## 🔒 Seguridad

### 7.1 API Key Segura

Generar API key fuerte:
```bash
# En tu terminal local
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Usar esta key en ambas apps (bot y n8n).

### 7.2 Comunicación Interna (Recomendado)

Si ambas apps están en Easypanel, usa URLs internas:

**En tu Bot:**
```bash
N8N_WEBHOOK_URL=http://n8n:5678/webhook/whatsapp-incoming
```

**En n8n:**
```bash
SMART_SALES_BOT_URL=http://smart-sales-bot:3000
```

Ventajas:
- ✅ Más rápido (no sale a internet)
- ✅ Más seguro (red privada)
- ✅ No consume ancho de banda externo

### 7.3 Firewall

En Easypanel, asegúrate de que:
- n8n webhook esté accesible desde tu bot
- Tu bot API esté accesible desde n8n
- PostgreSQL esté accesible desde n8n

## 🎨 Configuración Avanzada

### Opción 1: Todo Interno (Recomendado)

```
Bot → n8n → PostgreSQL → Ollama
(todo en red privada de Easypanel)
```

**Variables en Bot:**
```bash
N8N_WEBHOOK_URL=http://n8n:5678/webhook/whatsapp-incoming
DATABASE_URL=postgresql://user:pass@postgres:5432/smartsales
```

**Variables en n8n:**
```bash
SMART_SALES_BOT_URL=http://smart-sales-bot:3000
POSTGRES_HOST=postgres
OLLAMA_URL=http://ollama:11434
```

### Opción 2: Híbrido (Bot local, n8n en Easypanel)

```
Bot (local) → n8n (Easypanel) → PostgreSQL (Easypanel)
```

**Variables en Bot (local):**
```bash
N8N_WEBHOOK_URL=https://n8n.tudominio.com/webhook/whatsapp-incoming
DATABASE_URL=postgresql://user:pass@postgres.tudominio.com:5432/smartsales
```

**Variables en n8n (Easypanel):**
```bash
SMART_SALES_BOT_URL=https://tu-ip-publica:3000
# o usar ngrok para desarrollo
POSTGRES_HOST=postgres
```

### Opción 3: Todo Externo (Producción)

```
Bot (Easypanel) → n8n (Easypanel) → PostgreSQL (Easypanel)
(URLs públicas con HTTPS)
```

**Variables en Bot:**
```bash
N8N_WEBHOOK_URL=https://n8n.tudominio.com/webhook/whatsapp-incoming
DATABASE_URL=postgresql://user:pass@postgres.tudominio.com:5432/smartsales
```

**Variables en n8n:**
```bash
SMART_SALES_BOT_URL=https://bot.tudominio.com
POSTGRES_HOST=postgres.tudominio.com
```

## 🚨 Troubleshooting

### Error: n8n no recibe mensajes

```bash
# Verificar que n8n esté corriendo
curl https://n8n.tudominio.com/webhook/whatsapp-incoming

# Verificar logs del bot
# Debe mostrar: "✅ Mensaje enviado a n8n"

# Verificar variable de entorno
echo $N8N_WEBHOOK_URL
```

### Error: Bot no recibe mensajes de n8n

```bash
# Verificar API key
curl -H "x-api-key: tu-api-key" \
  https://bot.tudominio.com/api/whatsapp/send-from-n8n

# Verificar que el bot esté corriendo
curl https://bot.tudominio.com/api/health

# Ver logs en Easypanel
```

### Error: PostgreSQL no conecta

```bash
# Desde n8n, probar conexión
# En un nodo PostgreSQL, hacer "Test"

# Verificar que PostgreSQL esté corriendo
# Easypanel → PostgreSQL → "Status"

# Verificar credenciales
psql -h postgres -U tu_usuario -d smartsales
```

### Error: Timeout en Ollama

Si usas Ollama en Easypanel:

```bash
# Verificar que Ollama esté corriendo
curl http://ollama:11434/api/tags

# Si no tienes Ollama, usa Groq:
# En n8n, cambiar URL a:
# https://api.groq.com/openai/v1/chat/completions
```

## 📈 Ventajas de esta Configuración

1. **Todo en Easypanel**: Fácil de gestionar
2. **Red privada**: Comunicación rápida y segura
3. **Escalable**: Puedes agregar más servicios
4. **Monitoreable**: Logs centralizados
5. **Profesional**: Arquitectura de microservicios

## 🎯 Próximos Pasos

1. ✅ Configurar variables de entorno
2. ✅ Importar workflow en n8n
3. ✅ Probar conexión
4. ✅ Enviar mensaje real por WhatsApp
5. ✅ Ver ejecución en n8n
6. 🚀 Crear más workflows

## 📚 Recursos

- **Easypanel Docs**: https://easypanel.io/docs
- **n8n Docs**: https://docs.n8n.io
- **n8n Webhooks**: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/

## ✨ Resultado Final

Tendrás:
- ✅ Bot simplificado (solo WhatsApp)
- ✅ n8n orquestando lógica
- ✅ Todo en Easypanel
- ✅ Comunicación segura
- ✅ Fácil de monitorear
- ✅ Escalable y profesional

**¡Listo para producción!** 🚀
