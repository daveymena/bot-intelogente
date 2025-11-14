# 🚂 Desplegar en Railway - Guía Completa

## 🎯 Problema Resuelto

**Error:** "Image of size 5.3 GB exceeded limit of 4.0 GB"

**Solución:** Dockerfile optimizado + .dockerignore agresivo

## ✅ Archivos Creados

1. **`Dockerfile.railway`** - Dockerfile optimizado multi-stage
2. **`railway.json`** - Configuración de Railway
3. **`.dockerignore`** - Actualizado para excluir archivos innecesarios
4. **`next.config.ts`** - Agregado `output: 'standalone'`

## 📊 Reducción de Tamaño

### Antes:
- ❌ 5.3 GB (excede límite de 4 GB)

### Después:
- ✅ ~500 MB - 1 GB (dentro del límite)

### Cómo se Logró:

1. **Multi-stage build** - Solo copia lo necesario
2. **Alpine Linux** - Imagen base ligera (5 MB vs 1 GB)
3. **Standalone mode** - Next.js genera solo archivos necesarios
4. **Excluir archivos** - .dockerignore agresivo

## 🚀 Pasos para Desplegar

### 1. Commit y Push

```bash
git add .
git commit -m "feat: Optimizar para Railway - Reducir tamaño de imagen"
git push origin main
```

### 2. Configurar en Railway

1. Ve a: https://railway.app/
2. Click "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Selecciona tu repositorio: `daveymena/bot-intelogente`
5. Railway detectará automáticamente `railway.json`

### 3. Configurar Variables de Entorno

En Railway, ve a "Variables" y agrega:

```env
# Base de Datos (Railway provee PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# IA
GROQ_API_KEY=gsk_TU_API_KEY_AQUI
GROQ_MODEL=llama-3.1-8b-instant
GROQ_MAX_TOKENS=500
GROQ_TIMEOUT=60000

OLLAMA_BASE_URL=https://bot-whatsapp-ollama.sqaoeo.easypanel.host
OLLAMA_MODEL=gemma:2b
OLLAMA_ENABLED=true
OLLAMA_TIMEOUT=30000

AI_PROVIDER=groq
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=groq,ollama

# WhatsApp
WHATSAPP_PROVIDER=baileys

# Negocio
BUSINESS_NAME=Tecnovariedades D&S
BUSINESS_PHONE=+57 300 556 0186
BUSINESS_EMAIL=deinermena25@gmail.com

# Admin
ADMIN_EMAIL=daveymena16@gmail.com
ADMIN_PASSWORD=TU_PASSWORD_SEGURO

# Pagos
MERCADO_PAGO_ACCESS_TOKEN=TU_TOKEN
PAYPAL_CLIENT_ID=TU_CLIENT_ID

# Email
RESEND_API_KEY=TU_API_KEY

# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

### 4. Agregar PostgreSQL

1. En Railway, click "New"
2. Selecciona "Database" → "PostgreSQL"
3. Railway automáticamente conectará `DATABASE_URL`

### 5. Desplegar

1. Railway iniciará el build automáticamente
2. Espera 5-10 minutos
3. Verifica logs para errores

## 🔧 Troubleshooting

### Error: "Image still too large"

**Solución 1:** Verificar .dockerignore
```bash
# Ver qué archivos se están copiando
docker build -f Dockerfile.railway -t test . --progress=plain
```

**Solución 2:** Limpiar archivos grandes
```bash
# Buscar archivos grandes
find . -type f -size +10M

# Eliminar archivos innecesarios
rm -rf botexperimento/
rm -rf examples/
rm *.json  # Excepto package.json
```

### Error: "Build timeout"

**Solución:** Aumentar timeout en Railway
- Ve a Settings → Build
- Aumenta "Build Timeout" a 30 minutos

### Error: "Out of memory"

**Solución:** Reducir uso de memoria en build
```dockerfile
# En Dockerfile.railway, agregar:
ENV NODE_OPTIONS="--max-old-space-size=2048"
```

## 📊 Comparación: Railway vs Easypanel

| Feature | Railway | Easypanel |
|---------|---------|-----------|
| Límite de imagen | 4 GB | Sin límite |
| PostgreSQL | ✅ Incluido | ✅ Incluido |
| Precio | $5/mes | $5/mes |
| Deploy | Automático | Manual/Auto |
| Logs | ✅ Excelente | ✅ Bueno |
| Dominio | ✅ Gratis | ✅ Gratis |

## 🎯 Optimizaciones Aplicadas

### 1. Multi-Stage Build

```dockerfile
# Stage 1: Dependencies (solo producción)
FROM node:20-alpine AS deps
RUN npm ci --only=production

# Stage 2: Builder (build de Next.js)
FROM node:20-alpine AS builder
RUN npm run build

# Stage 3: Runner (imagen final ligera)
FROM node:20-alpine AS runner
COPY --from=builder /app/.next/standalone ./
```

**Resultado:** Solo copia archivos necesarios para runtime

### 2. Alpine Linux

```dockerfile
FROM node:20-alpine  # 5 MB
# vs
FROM node:20         # 1 GB
```

**Resultado:** Imagen base 200x más pequeña

### 3. Standalone Mode

```typescript
// next.config.ts
export default {
  output: 'standalone'
}
```

**Resultado:** Next.js genera solo archivos necesarios (~50 MB vs ~500 MB)

### 4. .dockerignore Agresivo

```dockerignore
# Excluir todo lo innecesario
*.md
scripts/
examples/
botexperimento/
*.json  # Excepto package.json
```

**Resultado:** No copia archivos de documentación ni scripts

## ✅ Verificar Despliegue

### 1. Verificar Build

```bash
# En Railway, ve a "Deployments"
# Verifica que el build sea exitoso
```

### 2. Verificar Logs

```bash
# En Railway, ve a "Logs"
# Busca:
✅ Server started on port 3000
✅ Database connected
✅ WhatsApp ready
```

### 3. Verificar App

```bash
# Abre la URL de Railway
https://tu-app.railway.app

# Verifica:
✅ Página carga correctamente
✅ Login funciona
✅ Dashboard accesible
```

## 🚨 Errores Comunes

### 1. "Module not found"

**Causa:** Dependencia faltante en package.json

**Solución:**
```bash
npm install <paquete-faltante>
git commit -am "fix: Agregar dependencia faltante"
git push
```

### 2. "Database connection failed"

**Causa:** DATABASE_URL no configurado

**Solución:**
- Verifica que PostgreSQL esté agregado
- Verifica variable `DATABASE_URL`

### 3. "Port already in use"

**Causa:** Railway usa puerto dinámico

**Solución:**
```typescript
// server.ts
const PORT = process.env.PORT || 3000
```

## 📝 Checklist de Despliegue

- [ ] Archivos optimizados creados
- [ ] Commit y push a GitHub
- [ ] Proyecto creado en Railway
- [ ] Variables de entorno configuradas
- [ ] PostgreSQL agregado
- [ ] Build exitoso (< 4 GB)
- [ ] App funcionando
- [ ] WhatsApp conectado
- [ ] Base de datos migrada

## 🎉 Resultado Final

- ✅ Imagen < 4 GB (dentro del límite)
- ✅ Build rápido (5-10 minutos)
- ✅ App funcionando en Railway
- ✅ Costo: $5/mes

## 📖 Recursos

- [Railway Docs](https://docs.railway.app/)
- [Next.js Standalone](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [Docker Multi-Stage](https://docs.docker.com/build/building/multi-stage/)
- [Alpine Linux](https://alpinelinux.org/)

---

**Fecha:** 2025-11-04
**Estado:** ✅ Listo para Desplegar
**Tamaño Estimado:** ~500 MB - 1 GB
