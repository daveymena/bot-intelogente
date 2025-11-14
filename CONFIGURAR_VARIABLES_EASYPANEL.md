# 🔐 CONFIGURAR VARIABLES DE ENTORNO EN EASYPANEL

## ⚠️ IMPORTANTE: NO SUBIR SECRETOS A GIT

Este archivo te guía para configurar las variables sin exponer tus secretos.

---

## 📋 PASO 1: VARIABLES DE BASE DE DATOS

En Easypanel, ve a tu servicio PostgreSQL y copia:

```bash
DATABASE_URL=postgresql://postgres:TU_PASSWORD@provedor-ia_bot-whatsapp-db:5432/botwhatsapp
DATABASE_PROVIDER=postgresql
```

**Dónde encontrar**: Easypanel → PostgreSQL Service → Connection String

---

## 🌐 PASO 2: VARIABLES DE URL

Reemplaza con tu dominio de Easypanel:

```bash
NEXT_PUBLIC_APP_URL=https://tu-app.easypanel.host
NEXTAUTH_URL=https://tu-app.easypanel.host
```

**Dónde encontrar**: Easypanel → Tu App → Domains

---

## 🔒 PASO 3: SECRETOS DE SEGURIDAD

Genera secretos únicos:

```bash
# En tu terminal local, ejecuta:
openssl rand -base64 32

# Usa el resultado para:
NEXTAUTH_SECRET=resultado_del_comando_aqui
JWT_SECRET=otro_resultado_diferente_aqui
```

---

## 🤖 PASO 4: API KEYS DE IA

### Groq (Recomendado - Gratis)
1. Ve a: https://console.groq.com
2. Crea una cuenta
3. Genera una API key
4. Copia y pega:

```bash
GROQ_API_KEY=tu_groq_api_key_aqui
GROQ_MODEL=llama-3.1-8b-instant
GROQ_FALLBACK_MODELS=llama-3.3-70b-versatile
GROQ_MAX_TOKENS=350
GROQ_TIMEOUT=5000
```

### OpenRouter (Opcional)
1. Ve a: https://openrouter.ai
2. Genera API key
3. Configura:

```bash
OPENROUTER_API_KEY=tu_openrouter_key
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
```

### Ollama (IA Local en Easypanel)
```bash
OLLAMA_BASE_URL=https://tu-ollama.easypanel.host
OLLAMA_MODEL=gemma:2b
OLLAMA_ENABLED=true
OLLAMA_TIMEOUT=10000
OLLAMA_MAX_TOKENS=300
```

### Configuración de Fallback
```bash
AI_PROVIDER=ollama
DEFAULT_AI_PROVIDER=ollama
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=ollama,groq,openrouter
AI_USE_REASONING=true
```

---

## 📧 PASO 5: EMAIL (RESEND)

1. Ve a: https://resend.com
2. Crea cuenta gratis
3. Genera API key
4. Configura:

```bash
RESEND_API_KEY=tu_resend_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
EMAIL_FROM=Tecnovariedades D&S <onboarding@resend.dev>
```

---

## 📱 PASO 6: WHATSAPP

```bash
WHATSAPP_PROVIDER=baileys
HEARTBEAT_INTERVAL=10000
RECONNECT_ATTEMPTS_MAX=100
RECONNECT_DELAY_BASE=500
RECONNECT_DELAY_MAX=60000
MAX_CONSECUTIVE_FAILURES=5
CONNECTION_HEALTH_THRESHOLD=80
ENABLE_CONNECTION_MONITOR=true
ENABLE_SESSION_RECOVERY=true
ENABLE_SOFT_RESET=true
ENABLE_AGGRESSIVE_RESET=true
ENABLE_CONSERVATIVE_MODE=true
PUPPETEER_HEADLESS=true
PUPPETEER_SANDBOX=false
PUPPETEER_SHM_USAGE=false
PUPPETEER_GPU=false
PUPPETEER_WEB_SECURITY=false
SESSION_PATH=./whatsapp-sessions
SESSION_BACKUP_COUNT=3
SESSION_RECOVERY_TIMEOUT=30000
```

---

## 💼 PASO 7: CONFIGURACIÓN DE NEGOCIO

```bash
BUSINESS_NAME=Tecnovariedades D&S
BUSINESS_ADDRESS=Colombia
BOT_NAME=Tecnovariedades D&S Bot
BOT_PHONE=+57 300 556 0186
BUSINESS_PHONE=+57 300 556 0186
BUSINESS_EMAIL=tu_email@gmail.com
BOT_LANGUAGE=es
NEXT_PUBLIC_WHATSAPP_NUMBER=573005560186
```

---

## 💳 PASO 8: MÉTODOS DE PAGO

### Nequi y Daviplata
```bash
NEQUI_NUMBER=tu_numero
DAVIPLATA_NUMBER=tu_numero
```

### Bancolombia
```bash
BANK_NAME=Bancolombia
BANK_ACCOUNT_TYPE=Ahorros
BANK_ACCOUNT_NUMBER=tu_numero_cuenta
BANK_ACCOUNT_HOLDER=Tu Nombre
```

### MercadoPago
1. Ve a: https://www.mercadopago.com.co/developers
2. Crea una aplicación
3. Obtén credenciales:

```bash
MERCADO_PAGO_PUBLIC_KEY=tu_public_key
MERCADO_PAGO_ACCESS_TOKEN=tu_access_token
MERCADO_PAGO_CLIENT_ID=tu_client_id
```

### PayPal
1. Ve a: https://developer.paypal.com
2. Crea una app
3. Obtén credenciales:

```bash
PAYPAL_CLIENT_ID=tu_client_id
PAYPAL_CLIENT_SECRET=tu_secret
PAYPAL_MODE=live
PAYPAL_API_URL=https://api-m.paypal.com
```

### Efectivo
```bash
CASH_ON_DELIVERY_ENABLED=true
DELIVERY_ZONES=Bogotá,Medellín,Cali
```

---

## 🛍️ PASO 9: DROPSHIPPING (DROPI)

Si usas Dropi:

1. Ve a: https://app.dropi.co
2. Genera token de integración
3. Configura:

```bash
DROPI_AGENT_TOKEN=tu_dropi_token
DROPI_API_URL=https://app.dropi.co/api/v1
DROPI_ENABLED=true
DROPSHIPPING_SHIPPING_MIN=15000
DROPSHIPPING_SHIPPING_MAX=20000
DROPSHIPPING_PROFIT_MIN=20000
DROPSHIPPING_PROFIT_MAX=30000
```

---

## 👤 PASO 10: ADMIN

```bash
ADMIN_EMAIL=tu_email@gmail.com
ADMIN_PASSWORD=tu_password_seguro
```

---

## 🎛️ PASO 11: CARACTERÍSTICAS

```bash
NODE_ENV=production
PORT=3000
PHOTOS_ENABLED=true
AUDIO_ENABLED=true
HOT_RELOAD_ENABLED=true
AI_ENABLED=true
DYNAMIC_PRICING_ENABLED=true
WEB_ENABLED=true
WEB_AUTH=false
LOG_LEVEL=info
LOG_CONNECTION_EVENTS=true
LOG_HEARTBEAT_EVENTS=true
LOG_RECONNECTION_EVENTS=true
MAX_CONCURRENT_CONNECTIONS=1
CONNECTION_TIMEOUT=60000
MESSAGE_QUEUE_SIZE=100
```

---

## ✅ CHECKLIST DE CONFIGURACIÓN

- [ ] Variables de base de datos configuradas
- [ ] URLs de Easypanel configuradas
- [ ] Secretos de seguridad generados
- [ ] API key de Groq obtenida
- [ ] API key de Resend obtenida
- [ ] Configuración de WhatsApp lista
- [ ] Información de negocio actualizada
- [ ] Métodos de pago configurados (opcional)
- [ ] Credenciales de admin configuradas
- [ ] Todas las variables guardadas en Easypanel

---

## 🚀 DESPUÉS DE CONFIGURAR

1. Guarda todas las variables en Easypanel
2. Click en "Deploy" o "Redeploy"
3. Espera 2-3 minutos
4. Abre la terminal de Easypanel:
   ```bash
   npx prisma db push
   npx tsx scripts/create-admin.ts
   ```
5. Accede a tu app y prueba el login

---

## 🔐 SEGURIDAD

**NUNCA** subas a Git:
- API keys
- Passwords
- Tokens
- Secretos
- Credenciales de pago

Usa siempre variables de entorno en Easypanel.
