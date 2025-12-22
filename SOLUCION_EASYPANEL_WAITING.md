# 🔧 Solución: "Waiting for service to start" en Easypanel

## Problema Identificado

Tu app se queda en "Waiting..." porque:

1. **El servidor escucha en `127.0.0.1`** (localhost) en lugar de `0.0.0.0`
2. Easypanel no puede conectarse desde fuera del contenedor
3. El health check falla y el servicio nunca se marca como "ready"

## ✅ Solución Rápida

### 1. Actualizar `server.ts`

Cambia la línea del hostname:

```typescript
// ANTES:
const hostname = '127.0.0.1';

// DESPUÉS:
const hostname = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
```

### 2. Verificar Variables de Entorno en Easypanel

Asegúrate de tener estas variables configuradas:

```env
# Base de datos (obtén la URL real de tu servicio PostgreSQL en Easypanel)
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://postgres:password@postgres:5432/botdb
NODE_ENV=production

# Auth (genera un secret nuevo)
NEXTAUTH_SECRET=tu-secret-generado-con-openssl
NEXTAUTH_URL=https://tu-app.easypanel.host

# IA
GROQ_API_KEY=tu-groq-api-key-aqui
OPENROUTER_API_KEY=tu-openrouter-api-key-aqui
AI_PROVIDER=openrouter
DEFAULT_AI_PROVIDER=openrouter
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=openrouter,groq

# WhatsApp
WHATSAPP_PROVIDER=baileys
SESSION_PATH=/app/whatsapp-sessions
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
PUPPETEER_HEADLESS=true
PUPPETEER_SANDBOX=false

# Admin
ADMIN_EMAIL=daveymena16@gmail.com
ADMIN_PASSWORD=6715320Dvd.
CREATE_ADMIN=true
RUN_MIGRATIONS=true

# Puerto
PORT=3000
```

### 3. Verificar Dockerfile

Tu Dockerfile está correcto, solo asegúrate que tenga `EXPOSE 3000`.

### 4. Configuración en Easypanel

En la configuración de tu app:

- **Puerto**: 3000
- **Health Check Path**: `/` (opcional, pero recomendado)
- **Compilación**: Dockerfile
- **Archivo**: Dockerfile

## 🚀 Pasos para Aplicar

1. Haz el cambio en `server.ts`
2. Commit y push a GitHub:
   ```bash
   git add server.ts
   git commit -m "fix: escuchar en 0.0.0.0 en producción"
   git push origin main
   ```
3. En Easypanel, haz clic en "Rebuild" o "Redeploy"
4. Espera 2-3 minutos mientras compila
5. Revisa los logs en Easypanel

## 📋 Verificar Logs

Si sigue fallando, ve a la pestaña "Logs" en Easypanel y busca:

- ✅ `> Ready on http://0.0.0.0:3000` (bueno)
- ❌ Errores de conexión a base de datos
- ❌ Errores de módulos faltantes
- ❌ Errores de Prisma

## 🔍 Diagnóstico Adicional

Si después del cambio sigue sin funcionar, copia los logs y compártelos para diagnosticar el problema específico.

### Comandos útiles para generar NEXTAUTH_SECRET:

```bash
# En tu terminal local:
openssl rand -base64 32
```

O usa este generado:
```
wK9xP2mN8vL5qR7tY4uI6oP3aS1dF8gH9jK0lZ2xC4vB6nM7
```
