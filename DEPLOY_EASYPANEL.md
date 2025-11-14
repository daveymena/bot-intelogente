# 🚀 Deploy en Easypanel

## Variables de Entorno Requeridas

Configura estas variables en Easypanel:

### IA - Groq (Principal)
```
GROQ_API_KEY=gsk_tu_api_key_aqui
GROQ_MODEL=llama-3.1-8b-instant
GROQ_MAX_TOKENS=400
GROQ_TIMEOUT=15000
```

### IA - OpenRouter (Respaldo)
```
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free
```

### IA - Ollama (Local en Easypanel)
```
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=gemma:2b
OLLAMA_ENABLED=true
OLLAMA_TIMEOUT=60000
```

### Sistema de IA
```
AI_FALLBACK_ORDER=groq,openrouter,ollama
AI_AUTO_MODEL_DETECTION=true
DEFAULT_AI_PROVIDER=groq
```

### Next.js
```
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### WhatsApp
```
WHATSAPP_PROVIDER=baileys
SESSION_PATH=/data/whatsapp-sessions
```

### Base de Datos
```
DATABASE_URL=file:/data/dev.db
```

### Autenticación
```
NEXTAUTH_SECRET=genera-un-secret-aleatorio-aqui
NEXTAUTH_URL=https://tu-dominio.com
JWT_SECRET=genera-otro-secret-aleatorio-aqui
```

## Servicios Necesarios en Easypanel

### 1. Ollama (Servicio separado)
- Imagen: `ollama/ollama:latest`
- Puerto: 11434
- Volumen: `/root/.ollama`
- Comando inicial: `ollama pull gemma:2b`

### 2. Bot (Aplicación principal)
- Build: Next.js
- Puerto: 3000
- Volúmenes:
  - `/data` para persistencia
  - `/app/.wwebjs_auth` para WhatsApp

## Comandos de Build

```bash
npm install
npm run build
```

## Comando de Start

```bash
npm start
```

## Healthcheck

```bash
curl -f http://localhost:3000/api/health || exit 1
```

## Notas Importantes

1. **Ollama debe estar corriendo** antes de iniciar el bot
2. **Volúmenes persistentes** son críticos para WhatsApp
3. **Variables de entorno** deben estar todas configuradas
4. **Puerto 3000** debe estar expuesto

## Orden de Deploy

1. Crear servicio Ollama
2. Esperar a que Ollama descargue el modelo
3. Crear aplicación del bot
4. Configurar variables de entorno
5. Conectar servicios (bot → ollama)
6. Deploy!
