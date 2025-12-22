# 🎯 Configuración: Código Local → n8n Easypanel

## 📍 Tu Escenario Actual

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TU CONFIGURACIÓN                                  │
└─────────────────────────────────────────────────────────────────────┘

Local (Tu PC)                    Easypanel (Cloud)
┌──────────────────┐            ┌──────────────────┐
│  Smart Sales Bot │────────────►│      n8n         │
│  (Baileys)       │   HTTPS    │  (Orquestador)   │
│  localhost:3000  │            │  n8n.tudominio   │
└────────┬─────────┘            └────────┬─────────┘
         │                                │
         │                                ▼
         │                       ┌──────────────────┐
         │                       │   PostgreSQL     │
         │                       │   (Easypanel)    │
         │                       └──────────────────┘
         │
         │ ⚠️ PROBLEMA: n8n no puede llamar a localhost
         │
         └─ Necesitas exponer tu localhost a internet
```

## 🔧 Solución: 3 Opciones

### ✅ OPCIÓN 1: ngrok (Desarrollo - Recomendado) ⭐

**Ventajas:**
- ✅ Gratis
- ✅ Fácil de configurar (2 minutos)
- ✅ Perfecto para desarrollo
- ✅ No requiere configurar router

**Cómo funciona:**
```
Local → ngrok → Internet → n8n (Easypanel)
  ↑                              ↓
  └──────────── Internet ─────────┘
```

#### Paso 1: Instalar ngrok

```bash
# Descargar de: https://ngrok.com/download
# O con chocolatey:
choco install ngrok

# O con npm:
npm install -g ngrok
```

#### Paso 2: Crear cuenta en ngrok

1. Ir a: https://dashboard.ngrok.com/signup
2. Crear cuenta gratis
3. Copiar tu authtoken

#### Paso 3: Configurar ngrok

```bash
# Autenticar (solo una vez)
ngrok config add-authtoken TU_AUTHTOKEN_AQUI
```

#### Paso 4: Exponer tu puerto 3000

```bash
# En una terminal, ejecutar:
ngrok http 3000
```

**Resultado:**
```
ngrok                                                                    

Session Status                online
Account                       tu-email@gmail.com
Version                       3.x.x
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Tu URL pública será:** `https://abc123.ngrok-free.app`

#### Paso 5: Configurar Variables de Entorno

**En tu código local (.env):**
```bash
# n8n en Easypanel (URL pública)
N8N_WEBHOOK_URL=https://n8n.tudominio.com/webhook/whatsapp-incoming
N8N_API_KEY=tu-api-key-segura-123

# PostgreSQL en Easypanel (URL pública con puerto expuesto)
DATABASE_URL=postgresql://user:pass@postgres.tudominio.com:5432/smartsales

# Ollama local o Groq
OLLAMA_URL=http://localhost:11434
# o
GROQ_API_KEY=tu-groq-api-key
```

**En n8n (Easypanel):**
```bash
# Tu bot local expuesto con ngrok
SMART_SALES_BOT_URL=https://abc123.ngrok-free.app
N8N_API_KEY=tu-api-key-segura-123

# PostgreSQL (interno en Easypanel)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=smartsales
POSTGRES_USER=tu_usuario
POSTGRES_PASSWORD=tu_password
```

#### Paso 6: Probar

```bash
# Terminal 1: Iniciar tu bot
npm run dev

# Terminal 2: Iniciar ngrok
ngrok http 3000

# Terminal 3: Probar conexión
curl https://abc123.ngrok-free.app/api/health
```

**⚠️ Importante:** Cada vez que reinicies ngrok, la URL cambia. Para URL fija, necesitas plan de pago de ngrok ($8/mes).

---

### ✅ OPCIÓN 2: Cloudflare Tunnel (Gratis, URL Fija) ⭐⭐

**Ventajas:**
- ✅ Gratis
- ✅ URL fija (no cambia)
- ✅ Más rápido que ngrok
- ✅ Más seguro

#### Paso 1: Instalar cloudflared

```bash
# Descargar de: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

# O con chocolatey:
choco install cloudflared
```

#### Paso 2: Autenticar

```bash
cloudflared tunnel login
```

#### Paso 3: Crear tunnel

```bash
cloudflared tunnel create smart-sales-bot
```

#### Paso 4: Configurar tunnel

Crear archivo `config.yml`:

```yaml
tunnel: smart-sales-bot
credentials-file: C:\Users\TuUsuario\.cloudflared\tunnel-id.json

ingress:
  - hostname: bot.tudominio.com
    service: http://localhost:3000
  - service: http_status:404
```

#### Paso 5: Crear DNS record

```bash
cloudflared tunnel route dns smart-sales-bot bot.tudominio.com
```

#### Paso 6: Iniciar tunnel

```bash
cloudflared tunnel run smart-sales-bot
```

**Tu URL será:** `https://bot.tudominio.com`

**Variables de entorno:**

**Local (.env):**
```bash
N8N_WEBHOOK_URL=https://n8n.tudominio.com/webhook/whatsapp-incoming
N8N_API_KEY=tu-api-key-segura-123
```

**n8n (Easypanel):**
```bash
SMART_SALES_BOT_URL=https://bot.tudominio.com
N8N_API_KEY=tu-api-key-segura-123
```

---

### ✅ OPCIÓN 3: Desplegar en Easypanel (Producción) ⭐⭐⭐

**Ventajas:**
- ✅ Todo en la nube
- ✅ Comunicación interna rápida
- ✅ No depende de tu PC
- ✅ Siempre disponible

**Cómo:**

1. **Subir código a GitHub**
```bash
git add .
git commit -m "feat: integración n8n"
git push origin main
```

2. **Crear app en Easypanel**
   - Easypanel → "Create App"
   - Conectar con GitHub
   - Seleccionar repositorio
   - Configurar variables de entorno

3. **Variables en Easypanel (Bot):**
```bash
# n8n interno
N8N_WEBHOOK_URL=http://n8n:5678/webhook/whatsapp-incoming
N8N_API_KEY=tu-api-key-segura-123

# PostgreSQL interno
DATABASE_URL=postgresql://user:pass@postgres:5432/smartsales
```

4. **Variables en Easypanel (n8n):**
```bash
# Bot interno
SMART_SALES_BOT_URL=http://smart-sales-bot:3000
N8N_API_KEY=tu-api-key-segura-123
```

---

## 📊 Comparación de Opciones

| Aspecto | ngrok | Cloudflare | Easypanel |
|---------|-------|------------|-----------|
| **Costo** | Gratis (URL cambia) | Gratis | Gratis/Pago |
| **URL Fija** | ❌ (solo plan pago) | ✅ | ✅ |
| **Velocidad** | Media | Rápida | Muy rápida |
| **Configuración** | 2 min | 10 min | 30 min |
| **Depende de PC** | ✅ | ✅ | ❌ |
| **Producción** | ❌ | ⚠️ | ✅ |
| **Desarrollo** | ✅ | ✅ | ⚠️ |

## 🎯 Recomendación por Caso

### Para Desarrollo (Ahora)
```
✅ Usa ngrok
- Rápido de configurar
- Perfecto para probar
- No importa que la URL cambie
```

### Para Producción (Después)
```
✅ Despliega en Easypanel
- Todo en la nube
- Comunicación interna
- Siempre disponible
```

### Para Desarrollo Largo Plazo
```
✅ Usa Cloudflare Tunnel
- URL fija
- Gratis
- Más profesional
```

---

## 🚀 Configuración Rápida con ngrok (5 minutos)

### Paso 1: Instalar ngrok
```bash
# Descargar: https://ngrok.com/download
# Descomprimir y agregar a PATH
```

### Paso 2: Crear cuenta y autenticar
```bash
# Ir a: https://dashboard.ngrok.com/get-started/your-authtoken
# Copiar authtoken
ngrok config add-authtoken TU_AUTHTOKEN
```

### Paso 3: Iniciar ngrok
```bash
ngrok http 3000
```

### Paso 4: Copiar URL
```
Forwarding: https://abc123.ngrok-free.app -> http://localhost:3000
```

### Paso 5: Configurar n8n en Easypanel
```bash
# Variables de entorno en n8n:
SMART_SALES_BOT_URL=https://abc123.ngrok-free.app
N8N_API_KEY=tu-api-key-segura-123
```

### Paso 6: Configurar tu bot local
```bash
# .env local:
N8N_WEBHOOK_URL=https://n8n.tudominio.com/webhook/whatsapp-incoming
N8N_API_KEY=tu-api-key-segura-123
```

### Paso 7: Probar
```bash
# Terminal 1: Bot
npm run dev

# Terminal 2: ngrok
ngrok http 3000

# Terminal 3: Test
curl https://abc123.ngrok-free.app/api/health
```

---

## 🔒 Seguridad

### Con ngrok/Cloudflare:
- ✅ Usa HTTPS automáticamente
- ✅ Valida API key en cada request
- ⚠️ No expongas endpoints sensibles

### Validación en tu API:
```typescript
// src/app/api/whatsapp/send-from-n8n/route.ts
export async function POST(req: NextRequest) {
  // Validar API key
  const apiKey = req.headers.get('x-api-key')
  if (apiKey !== process.env.N8N_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Validar origen (opcional)
  const origin = req.headers.get('origin')
  if (origin && !origin.includes('tudominio.com')) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  }
  
  // Procesar request...
}
```

---

## 🚨 Troubleshooting

### Error: "Connection refused" desde n8n

**Causa:** n8n no puede alcanzar tu localhost

**Solución:**
1. Verificar que ngrok esté corriendo
2. Verificar URL en n8n: `SMART_SALES_BOT_URL=https://abc123.ngrok-free.app`
3. Probar URL manualmente: `curl https://abc123.ngrok-free.app/api/health`

### Error: "Tunnel not found" en ngrok

**Causa:** ngrok no está corriendo o URL cambió

**Solución:**
1. Reiniciar ngrok: `ngrok http 3000`
2. Copiar nueva URL
3. Actualizar variable en n8n
4. Reiniciar workflow en n8n

### Error: "Invalid API key"

**Causa:** API key diferente en bot y n8n

**Solución:**
1. Verificar que sea la misma en ambos lados
2. Regenerar si es necesario
3. Actualizar en ambos lados

---

## ✅ Checklist

- [ ] ngrok instalado
- [ ] ngrok autenticado
- [ ] ngrok corriendo (`ngrok http 3000`)
- [ ] URL de ngrok copiada
- [ ] Variable `SMART_SALES_BOT_URL` actualizada en n8n
- [ ] Variable `N8N_WEBHOOK_URL` configurada en bot local
- [ ] API key configurada en ambos lados
- [ ] Bot local corriendo (`npm run dev`)
- [ ] Test exitoso

---

## 💡 Tip Pro

**Crear script para iniciar todo:**

`iniciar-desarrollo-n8n.bat`:
```batch
@echo off
echo Iniciando desarrollo con n8n...

start cmd /k "cd /d %~dp0 && echo Iniciando bot... && npm run dev"
timeout /t 3
start cmd /k "cd /d %~dp0 && echo Iniciando ngrok... && ngrok http 3000"

echo.
echo ✅ Todo iniciado!
echo.
echo 📋 Pasos siguientes:
echo 1. Copiar URL de ngrok (https://xxx.ngrok-free.app)
echo 2. Actualizar SMART_SALES_BOT_URL en n8n Easypanel
echo 3. Reiniciar workflow en n8n
echo 4. Probar enviando mensaje por WhatsApp
echo.
pause
```

**¡Listo! Ahora puedes desarrollar localmente y usar n8n en Easypanel!** 🚀
