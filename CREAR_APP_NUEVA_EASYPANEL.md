# 🚀 Crear Nueva App en Easypanel - Guía Completa

## ¿Por Qué Crear una Nueva App?

Si la app actual tiene problemas persistentes:
- ❌ Contenedor no inicia
- ❌ QR de WhatsApp no funciona
- ❌ Errores de configuración
- ❌ Build corrupto

**Crear una nueva app desde cero es más rápido que intentar arreglar.**

---

## 📋 ANTES DE EMPEZAR: Guardar Información

### 1. Exportar Variables de Entorno

Ve a tu app actual en Easypanel → **Environment** y copia TODAS las variables:

```bash
# CRÍTICAS (sin estas no funciona)
DATABASE_URL=postgresql://user:pass@host:5432/dbname
NEXTAUTH_SECRET=tu-secret-largo-aqui
GROQ_API_KEY=gsk_xxxxxxxxxxxxx

# IMPORTANTES
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=https://tu-dominio.com

# OPCIONALES (AI fallback)
OPENAI_API_KEY=sk-xxxxx
CLAUDE_API_KEY=sk-ant-xxxxx
GEMINI_API_KEY=xxxxx
MISTRAL_API_KEY=xxxxx
AI_FALLBACK_ENABLED=true

# PAGOS
MERCADOPAGO_ACCESS_TOKEN=xxxxx
MERCADOPAGO_PUBLIC_KEY=xxxxx

# EMAIL
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@tu-dominio.com

# OTROS
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

**⚠️ IMPORTANTE:** Guarda esto en un archivo de texto seguro.

### 2. Verificar Base de Datos

Tu base de datos PostgreSQL **NO se eliminará** al borrar la app. Está en un servicio separado.

Verifica que tengas el `DATABASE_URL` correcto.

### 3. Hacer Backup de Productos (Opcional)

Si quieres estar seguro:

```bash
# Desde la consola de la app actual (si funciona)
npx tsx scripts/exportar-productos-completo.ts

# Esto crea: productos-YYYY-MM-DD.json
# Descárgalo desde Easypanel → Files
```

---

## 🗑️ PASO 1: Eliminar App Actual

1. Ve a **Easypanel Dashboard**
2. Selecciona tu aplicación
3. Ve a **Settings** (abajo a la izquierda)
4. Scroll hasta el final
5. Haz clic en **"Delete Application"**
6. Confirma escribiendo el nombre de la app
7. Haz clic en **"Delete"**

**✅ La app se eliminará pero la base de datos NO.**

---

## 🆕 PASO 2: Crear Nueva Aplicación

### 2.1 Crear App desde GitHub

1. En Easypanel, haz clic en **"+ Create"**
2. Selecciona **"App"**
3. Selecciona **"GitHub"**
4. Autoriza Easypanel si es necesario
5. Selecciona tu repositorio
6. Selecciona la rama: **`main`** o **`master`**

### 2.2 Configurar Build

En la pantalla de configuración:

```bash
# App Name
smart-sales-bot-pro

# Build Method
Nixpacks (recomendado)
# O si prefieres: Dockerfile

# Build Command (si usas Nixpacks)
npm ci && npm run build

# Start Command
npm start

# Port
3000

# Root Directory
/ (dejar vacío si el código está en la raíz)
```

### 2.3 Configurar Dominio (Opcional)

Si tienes un dominio:

```bash
# Domain
tu-dominio.com

# O usar el dominio de Easypanel:
tu-app.easypanel.host
```

---

## 🔧 PASO 3: Configurar Variables de Entorno

1. En la nueva app, ve a **Environment**
2. Haz clic en **"Add Variable"**
3. Pega TODAS las variables que guardaste antes

**Variables mínimas requeridas:**

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
NEXTAUTH_SECRET=tu-secret-aqui
GROQ_API_KEY=gsk_xxxxx
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=https://tu-dominio.com
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

**⚠️ IMPORTANTE:** 
- Actualiza `NEXTAUTH_URL` con el nuevo dominio si cambió
- Actualiza `NEXT_PUBLIC_APP_URL` también

---

## 🚀 PASO 4: Desplegar

1. Haz clic en **"Deploy"**
2. Espera 3-5 minutos (primera vez tarda más)
3. Observa los logs en tiempo real

**Logs esperados:**

```bash
✓ Installing dependencies...
✓ Building Next.js app...
✓ Generating Prisma client...
✓ Build completed
✓ Starting server...
✓ Server listening on port 3000
```

---

## ✅ PASO 5: Verificar que Funciona

### 5.1 Verificar que la App Está Corriendo

1. Ve a tu app en Easypanel
2. El estado debe ser 🟢 **Running**
3. Haz clic en el dominio para abrir la app

### 5.2 Verificar Login

1. Ve a `https://tu-dominio.com`
2. Intenta hacer login con tu usuario
3. Deberías poder acceder al dashboard

### 5.3 Verificar Base de Datos

Los datos deben estar intactos:
- ✅ Usuarios
- ✅ Productos
- ✅ Conversaciones

Si no ves productos, importa el backup:

```bash
# Desde la consola de la nueva app
npx tsx scripts/importar-desde-json.ts productos-2025-11-04.json
```

---

## 🔍 PASO 6: Ejecutar Diagnóstico de WhatsApp

Ahora que la app está limpia, ejecuta el diagnóstico:

1. Ve a **Console** en Easypanel
2. Ejecuta:

```bash
npx tsx scripts/diagnostico-y-test-qr.ts
```

3. Espera 2 minutos
4. Sigue las recomendaciones

**Resultado esperado:**

```bash
✅ PROCESO COMPLETADO

📊 Resumen:
   ✅ Diagnóstico: OK
   ✅ Test de QR: OK
   ✅ Estado en DB: Verificado

💡 Próximos pasos:
   1. Ve al dashboard
   2. Conecta WhatsApp
   3. Escanea el QR
```

---

## 🎯 PASO 7: Conectar WhatsApp

1. Ve al dashboard: `https://tu-dominio.com`
2. Haz clic en **"Conectar WhatsApp"**
3. Escanea el QR con tu teléfono
4. ✅ Listo

---

## 🔧 Configuración Avanzada (Opcional)

### Aumentar Memoria

Si la app se queda sin memoria:

1. Settings → **Resources**
2. Memory: **512 MB** o más
3. CPU: **0.5** o más

### Configurar Health Check

1. Settings → **Health Check**
2. Path: `/api/health`
3. Port: `3000`
4. Interval: `30s`

### Configurar Persistent Storage

Si necesitas guardar archivos (sesiones de WhatsApp):

1. Settings → **Mounts**
2. Add Mount:
   - Host Path: `/data/auth_sessions`
   - Container Path: `/app/auth_sessions`

---

## 🐛 Solución de Problemas

### Problema: Build Falla

**Error:** `Cannot find module`

**Solución:**
```bash
# Verificar que package.json tenga todas las dependencias
# Hacer commit y push si falta algo
```

### Problema: App No Inicia

**Error:** `ECONNREFUSED postgresql`

**Solución:**
```bash
# Verificar DATABASE_URL
# Debe ser el mismo de la app anterior
# Verificar que la base de datos esté corriendo
```

### Problema: Login No Funciona

**Error:** `Invalid credentials`

**Solución:**
```bash
# Verificar NEXTAUTH_SECRET
# Debe ser el mismo de la app anterior
# Si cambió, los tokens antiguos no funcionarán
```

### Problema: No Hay Productos

**Solución:**
```bash
# Importar desde backup
npx tsx scripts/importar-desde-json.ts productos-2025-11-04.json

# O importar desde catálogo
npx tsx scripts/importar-megacomputer-completo.ts
```

---

## 📊 Checklist Final

Verifica que todo funcione:

- [ ] App está 🟢 Running
- [ ] Puedes acceder al dominio
- [ ] Login funciona
- [ ] Dashboard se carga
- [ ] Productos aparecen
- [ ] Diagnóstico de WhatsApp: OK
- [ ] QR se genera correctamente
- [ ] WhatsApp conecta exitosamente

---

## 🎉 Ventajas de la Nueva App

✅ **Configuración limpia** - Sin archivos corruptos
✅ **Build fresco** - Última versión del código
✅ **Sin conflictos** - Sesiones de WhatsApp limpias
✅ **Mejor rendimiento** - Sin caché antiguo
✅ **Fácil de diagnosticar** - Logs claros desde cero

---

## 📞 Si Algo Sale Mal

### Logs en Tiempo Real

```bash
# En Easypanel → Logs
# Buscar errores específicos
```

### Rollback

Si la nueva app no funciona, puedes:

1. Mantener la app antigua (no la borres hasta estar seguro)
2. Crear otra app nueva con diferente configuración
3. Probar diferentes settings

### Contactar Soporte

Si nada funciona:

1. Captura de pantalla de los logs
2. Variables de entorno (sin valores sensibles)
3. Descripción del problema
4. Enviar a soporte de Easypanel

---

## 🚀 Resumen Rápido

```bash
# 1. Guardar variables de entorno
# 2. Eliminar app actual
# 3. Crear nueva app desde GitHub
# 4. Configurar variables
# 5. Desplegar
# 6. Verificar que funciona
# 7. Ejecutar diagnóstico de WhatsApp
# 8. Conectar WhatsApp
# 9. ✅ Listo
```

**Tiempo estimado:** 15-20 minutos

---

**IMPORTANTE:** No elimines la app actual hasta que la nueva esté funcionando correctamente.
