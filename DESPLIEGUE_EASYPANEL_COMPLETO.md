# 🚀 Guía Completa de Despliegue en Easypanel

## 📋 Resumen de Cambios a Desplegar

Todos los cambios realizados el 13 de Noviembre de 2025 que corrigen:
- ✅ Sistema de puntuación/recomendación de productos
- ✅ Normalización de acentos en búsquedas
- ✅ Sistema de tags inteligentes
- ✅ Envío automático de fotos
- ✅ Memoria conversacional mejorada
- ✅ Fallback local inteligente

---

## 🎯 OPCIÓN 1: Despliegue Automático desde GitHub (RECOMENDADO)

### Paso 1: Subir Cambios a GitHub

```bash
# Ejecutar el script de subida segura
SUBIR_CAMBIOS_SEGURO.bat
```

### Paso 2: En Easypanel - Redesplegar

1. **Ir a tu aplicación** en Easypanel
2. **Pestaña "Deploy"**
3. **Click en "Redeploy"** o "Deploy Latest"
4. **Esperar** a que termine el build (~3-5 minutos)
5. **Verificar logs** para confirmar que no hay errores

### Paso 3: Reiniciar Aplicación

1. **Pestaña "Settings"**
2. **Click en "Restart"**
3. **Esperar** ~30 segundos

---

## 🔧 OPCIÓN 2: Despliegue Manual (Si GitHub falla)

### Archivos Críticos a Actualizar

#### 📁 Servicios Core (src/lib/)

```
src/lib/
├── local-knowledge-base.ts          ⭐ CRÍTICO - Normalización de acentos
├── intelligent-conversation-engine.ts ⭐ CRÍTICO - Lógica mejorada
├── product-intelligence-service.ts   ⭐ CRÍTICO - Búsqueda mejorada
├── local-product-matcher.ts          ⭐ CRÍTICO - Matching preciso
├── product-flow-handler.ts           ⭐ IMPORTANTE - Flujos por tipo
├── intent-translator.ts              ⭐ IMPORTANTE - Detección de intención
├── baileys-stable-service.ts         - Estabilidad WhatsApp
└── intelligent-baileys-integration.ts - Integración inteligente
```

#### 🎨 Componentes UI (src/components/)

```
src/components/
└── ProductTagConfigurator.tsx        - Configurador de tags (nuevo)
```

#### 🔌 API Routes (src/app/api/)

```
src/app/api/
├── products/tags/route.ts            - API de tags inteligentes (nuevo)
├── whatsapp/reconnect/route.ts       - Reconexión automática
└── whatsapp/cleanup/route.ts         - Limpieza de sesiones
```

#### 📄 Páginas (src/app/)

```
src/app/
└── admin/products/new/page.tsx       - Página de administración mejorada
```

#### 🗄️ Base de Datos

```
prisma/
└── schema.prisma                     - Schema actualizado (si hay cambios)
```

### Comandos para Copiar Archivos Manualmente

Si usas SFTP/SCP para subir archivos:

```bash
# Conectar a tu servidor Easypanel
scp src/lib/local-knowledge-base.ts usuario@servidor:/ruta/app/src/lib/
scp src/lib/intelligent-conversation-engine.ts usuario@servidor:/ruta/app/src/lib/
scp src/lib/product-intelligence-service.ts usuario@servidor:/ruta/app/src/lib/
# ... repetir para cada archivo crítico
```

---

## 🔑 Variables de Entorno en Easypanel

### Variables OBLIGATORIAS

Verifica que estas variables estén configuradas en Easypanel:

```env
# Base de Datos
DATABASE_URL=postgresql://usuario:password@host:5432/database

# AI Principal (Groq)
GROQ_API_KEY=gsk_tu_key_aqui

# AI Fallback (Opcional pero recomendado)
OPENAI_API_KEY=sk-tu_key_aqui
CLAUDE_API_KEY=sk-ant-tu_key_aqui
GEMINI_API_KEY=tu_key_aqui

# Configuración AI
AI_FALLBACK_ENABLED=true
AI_PROVIDER=groq

# Rotación de Keys Groq (Opcional - para evitar rate limits)
GROQ_API_KEY_2=gsk_segunda_key
GROQ_API_KEY_3=gsk_tercera_key
GROQ_API_KEY_4=gsk_cuarta_key
# ... hasta GROQ_API_KEY_8

# WhatsApp
WHATSAPP_SESSION_PATH=/app/auth_sessions

# Pagos
MERCADOPAGO_ACCESS_TOKEN=APP_USR_tu_token
PAYPAL_CLIENT_ID=tu_client_id
PAYPAL_CLIENT_SECRET=tu_secret

# JWT
JWT_SECRET=tu_secret_muy_seguro_aqui

# URLs
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
NEXT_PUBLIC_API_URL=https://tu-dominio.com/api

# Email (Opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_app

# Modo
NODE_ENV=production
```

### Variables NUEVAS (Agregar si no existen)

```env
# Sistema de Tags Inteligentes
ENABLE_SMART_TAGS=true

# Sistema de Respuestas Progresivas
ENABLE_PROGRESSIVE_RESPONSES=true

# Fallback Local Mejorado
ENABLE_LOCAL_FALLBACK=true

# Razonamiento Profundo
ENABLE_DEEP_REASONING=true

# Normalización de Acentos
ENABLE_ACCENT_NORMALIZATION=true
```

---

## 📊 Pasos Detallados en Easypanel

### 1. Acceder a Variables de Entorno

```
Dashboard → Tu App → Environment Variables
```

### 2. Agregar/Actualizar Variables

Para cada variable:
1. Click en **"Add Variable"**
2. **Name**: Nombre de la variable (ej: `GROQ_API_KEY`)
3. **Value**: Valor de la variable (ej: `gsk_...`)
4. **Click "Save"**

### 3. Verificar Variables Críticas

Asegúrate de que estas estén configuradas:
- ✅ `DATABASE_URL` - Conexión a PostgreSQL
- ✅ `GROQ_API_KEY` - API principal de IA
- ✅ `JWT_SECRET` - Seguridad de autenticación
- ✅ `NEXT_PUBLIC_APP_URL` - URL de tu app

### 4. Configurar Volúmenes Persistentes

Para mantener las sesiones de WhatsApp:

```
Dashboard → Tu App → Volumes
```

Agregar volumen:
- **Mount Path**: `/app/auth_sessions`
- **Size**: 1GB (suficiente)

### 5. Redesplegar

```
Dashboard → Tu App → Deploy → Redeploy
```

### 6. Verificar Logs

```
Dashboard → Tu App → Logs
```

Buscar mensajes como:
```
✓ Compiled successfully
✓ Ready in X ms
Server running on port 3000
WhatsApp service initialized
Database connected
```

---

## 🗄️ Migraciones de Base de Datos

### Si hay cambios en el schema de Prisma:

#### Opción A: Desde Easypanel Terminal

```bash
# Abrir terminal en Easypanel
Dashboard → Tu App → Terminal

# Ejecutar migraciones
npm run db:migrate:deploy

# O si prefieres push directo
npm run db:push
```

#### Opción B: Desde tu máquina local

```bash
# Conectar a la base de datos de producción
# (Actualizar DATABASE_URL en .env temporalmente)

# Ejecutar migración
npm run db:migrate:deploy

# Restaurar .env local
```

---

## ✅ Checklist de Verificación Post-Despliegue

### 1. Verificar Aplicación Corriendo

```bash
curl https://tu-dominio.com/api/health
```

Debe responder: `{"status": "ok"}`

### 2. Verificar WhatsApp

1. Ir a tu dashboard
2. Sección "WhatsApp Connection"
3. Verificar estado: **"Connected"** ✅

### 3. Verificar Base de Datos

```bash
# En terminal de Easypanel
npm run db:push
```

Debe responder: `Database is up to date`

### 4. Probar Búsqueda de Productos

Enviar mensaje de prueba a WhatsApp:
```
"Hola, estoy interesado en el curso de piano"
```

Debe responder con:
- ✅ Producto correcto (Curso de Piano)
- ✅ Foto del producto
- ✅ Descripción precisa
- ✅ Link de pago

### 5. Verificar Logs

```bash
# En Easypanel Logs, buscar:
✓ "Product found: Curso Completo de Piano"
✓ "Sending product image"
✓ "Context saved successfully"
```

---

## 🚨 Solución de Problemas Comunes

### Problema 1: "Build Failed"

**Causa**: Dependencias faltantes o errores de TypeScript

**Solución**:
```bash
# En terminal local
npm install
npm run build

# Si funciona local, subir package-lock.json
git add package-lock.json
git commit -m "fix: Update dependencies"
git push
```

### Problema 2: "Database Connection Failed"

**Causa**: `DATABASE_URL` incorrecta

**Solución**:
1. Verificar formato: `postgresql://user:pass@host:5432/db`
2. Verificar que la base de datos exista
3. Verificar credenciales
4. Reiniciar app después de corregir

### Problema 3: "WhatsApp Not Connecting"

**Causa**: Sesión corrupta o volumen no persistente

**Solución**:
```bash
# En terminal de Easypanel
rm -rf auth_sessions/*
# Luego escanear QR nuevamente
```

### Problema 4: "AI Responses Not Working"

**Causa**: API keys inválidas o rate limit

**Solución**:
1. Verificar `GROQ_API_KEY` en variables
2. Agregar keys adicionales (`GROQ_API_KEY_2`, etc.)
3. Habilitar fallback: `AI_FALLBACK_ENABLED=true`
4. Verificar logs para ver qué provider está fallando

### Problema 5: "Products Not Found"

**Causa**: Base de datos vacía o migración pendiente

**Solución**:
```bash
# Verificar productos en BD
npm run db:push
npx tsx scripts/ver-productos.ts

# Si está vacía, importar productos
npx tsx scripts/import-productos-completos.ts
```

---

## 📞 Comandos Útiles en Terminal Easypanel

```bash
# Ver estado de la aplicación
pm2 status

# Ver logs en tiempo real
pm2 logs

# Reiniciar aplicación
pm2 restart all

# Ver productos en base de datos
npx tsx scripts/ver-productos.ts

# Verificar conexión a base de datos
npx tsx scripts/test-db-connection.ts

# Limpiar sesiones de WhatsApp
npx tsx scripts/limpiar-sesiones.ts

# Verificar API keys
npx tsx scripts/verificar-api-keys.js
```

---

## 🎯 Orden Recomendado de Despliegue

### Fase 1: Preparación (Local)
1. ✅ Ejecutar `SUBIR_CAMBIOS_SEGURO.bat`
2. ✅ Verificar que se subió a GitHub
3. ✅ Hacer backup de `.env` de producción

### Fase 2: Easypanel - Variables
1. ✅ Actualizar variables de entorno
2. ✅ Agregar variables nuevas
3. ✅ Verificar `DATABASE_URL`

### Fase 3: Easypanel - Despliegue
1. ✅ Click en "Redeploy"
2. ✅ Esperar build completo
3. ✅ Verificar logs (sin errores)

### Fase 4: Base de Datos
1. ✅ Ejecutar migraciones si es necesario
2. ✅ Verificar productos en BD
3. ✅ Importar productos si falta

### Fase 5: Verificación
1. ✅ Probar conexión WhatsApp
2. ✅ Probar búsqueda de productos
3. ✅ Verificar envío de fotos
4. ✅ Verificar links de pago

### Fase 6: Monitoreo
1. ✅ Revisar logs por 10 minutos
2. ✅ Probar con clientes reales
3. ✅ Verificar métricas de respuesta

---

## 📈 Mejoras Implementadas - Resumen

### ⭐ Correcciones Críticas
- **Normalización de acentos**: "piano" vs "inglés" ahora se diferencian correctamente
- **Sistema de puntuación**: Recomendaciones precisas (71 puntos para match exacto)
- **Envío de fotos**: Automático y sin duplicados
- **Memoria conversacional**: Contexto persistente entre mensajes

### 🚀 Nuevas Funcionalidades
- **Tags inteligentes**: Sistema SaaS de categorización
- **Respuestas progresivas**: AIDA framework implementado
- **Fallback local**: Respuestas sin depender 100% de IA
- **Razonamiento profundo**: Análisis contextual mejorado

### 🔧 Optimizaciones
- **Rotación de API keys**: Hasta 8 keys de Groq
- **Búsqueda mejorada**: Matching por tags y palabras clave
- **Flujos por tipo**: Productos físicos vs digitales
- **Prevención de errores**: No inventa información

---

## 📝 Notas Finales

### Tiempo Estimado de Despliegue
- **Opción 1 (GitHub)**: 5-10 minutos
- **Opción 2 (Manual)**: 20-30 minutos

### Downtime Esperado
- **Redespliegue**: ~2-3 minutos
- **Migraciones BD**: ~1 minuto
- **Total**: ~5 minutos máximo

### Backup Recomendado
Antes de desplegar:
```bash
# Backup de base de datos
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Backup de sesiones WhatsApp
tar -czf auth_sessions_backup.tar.gz auth_sessions/
```

---

## 🎉 Resultado Esperado

Después del despliegue:

**ANTES**:
- ❌ "curso de piano" → Recomendaba "Mega Pack Idiomas"
- ❌ Fotos no se enviaban automáticamente
- ❌ Contexto se perdía entre mensajes
- ❌ Respuestas genéricas sin personalización

**AHORA**:
- ✅ "curso de piano" → Recomienda "Curso Completo de Piano"
- ✅ Fotos se envían automáticamente
- ✅ Contexto persiste 24 horas
- ✅ Respuestas personalizadas con AIDA

---

**Fecha**: 13 de Noviembre de 2025  
**Versión**: Smart Sales Bot Pro v2.0  
**Estado**: ✅ Listo para producción
