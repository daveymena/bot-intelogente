# 🚨 Error: Container is not running en Easypanel

## El Problema

```
Error response from daemon: container 2959c101d533... is not running
```

Esto significa que **la aplicación está detenida** en Easypanel.

## ✅ Solución Inmediata

### Paso 1: Verificar Estado en Easypanel UI

1. Ve a **Easypanel Dashboard**
2. Selecciona tu aplicación
3. Mira el estado en la parte superior

**Estados posibles:**
- 🔴 **Stopped** - Aplicación detenida
- 🟡 **Starting** - Iniciando
- 🟢 **Running** - Funcionando
- 🔴 **Failed** - Error al iniciar

---

### Paso 2: Iniciar la Aplicación

#### Opción A: Desde la UI (RECOMENDADO)

1. En Easypanel → Tu App
2. Haz clic en **"Start"** o **"Restart"**
3. Espera 30-60 segundos
4. Verifica que el estado cambie a 🟢 **Running**

#### Opción B: Desde la Consola

Si tienes acceso a la consola de Easypanel:

```bash
# Ver estado de contenedores
docker ps -a

# Iniciar el contenedor
docker start CONTAINER_ID

# O reiniciar
docker restart CONTAINER_ID
```

---

### Paso 3: Verificar Logs

Una vez que la app esté corriendo:

1. Easypanel → Tu App → **Logs**
2. Busca errores que puedan haber causado que se detenga

**Errores comunes:**
- ❌ `Error: Cannot find module` - Falta dependencia
- ❌ `ECONNREFUSED` - No puede conectar a DB
- ❌ `Port 3000 already in use` - Puerto ocupado
- ❌ `Out of memory` - Sin memoria

---

## 🔍 Diagnóstico: ¿Por Qué Se Detuvo?

### Causa 1: Error en el Código

**Síntomas:**
- App se detiene inmediatamente después de iniciar
- Logs muestran errores de JavaScript/TypeScript

**Solución:**
```bash
# Ver últimos logs
# En Easypanel UI → Logs

# Buscar líneas con "Error" o "Fatal"
```

### Causa 2: Base de Datos No Disponible

**Síntomas:**
- Error: `Can't reach database server`
- Error: `Connection refused`

**Solución:**
```bash
# Verificar DATABASE_URL
# Easypanel → Tu App → Environment

# Debe ser algo como:
# postgresql://user:pass@host:5432/dbname
```

### Causa 3: Falta de Memoria

**Síntomas:**
- App se detiene aleatoriamente
- Logs: `JavaScript heap out of memory`

**Solución:**
```bash
# Aumentar memoria en Easypanel
# Settings → Resources → Memory: 512MB o más
```

### Causa 4: Puerto Incorrecto

**Síntomas:**
- App inicia pero Easypanel no puede conectarse
- Error: `Connection timeout`

**Solución:**
```bash
# Verificar que la app escuche en el puerto correcto
# En tu código debe ser:
# const PORT = process.env.PORT || 3000

# En Easypanel → Settings → Port: 3000
```

### Causa 5: Build Fallido

**Síntomas:**
- App nunca inicia
- Logs muestran errores de compilación

**Solución:**
```bash
# Rebuild desde Easypanel
# Tu App → Deploy → Rebuild

# O desde Git
# Hacer un commit vacío y push
git commit --allow-empty -m "Trigger rebuild"
git push
```

---

## 🚀 Pasos para Reiniciar Correctamente

### 1. Limpiar y Rebuild

```bash
# En Easypanel UI:
# 1. Stop la aplicación
# 2. Settings → Build → Clear Build Cache
# 3. Deploy → Rebuild
# 4. Esperar a que termine (2-5 minutos)
# 5. Start la aplicación
```

### 2. Verificar Variables de Entorno

Asegúrate de que estas variables estén configuradas:

```bash
# REQUERIDAS
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=tu-secret-aqui
GROQ_API_KEY=tu-api-key

# OPCIONALES
NODE_ENV=production
PORT=3000
```

### 3. Verificar Comandos de Build y Start

En Easypanel → Settings:

```bash
# Build Command:
npm ci && npm run build

# Start Command:
npm start

# O si usas el servidor custom:
node server.js
```

---

## 🔧 Solución Rápida (Si Todo Falla)

### Opción 1: Recrear Contenedor

```bash
# En Easypanel UI:
# 1. Stop la app
# 2. Settings → Advanced → Recreate Container
# 3. Confirmar
# 4. Esperar a que se recree
# 5. Start la app
```

### Opción 2: Recrear Aplicación Completa

Ver: `RECREAR_APP_EASYPANEL.md`

1. **Exportar variables de entorno** (copiar desde UI)
2. **Eliminar aplicación**
3. **Crear nueva** desde GitHub
4. **Importar variables**
5. **Desplegar**

---

## 📋 Checklist de Verificación

Antes de intentar ejecutar comandos:

- [ ] La aplicación está en estado 🟢 **Running** en Easypanel
- [ ] Los logs no muestran errores críticos
- [ ] DATABASE_URL está configurada correctamente
- [ ] El build se completó exitosamente
- [ ] El puerto está configurado (3000)
- [ ] Hay suficiente memoria asignada (512MB+)

---

## 🎯 Ejecutar Diagnóstico Después de Iniciar

Una vez que la app esté corriendo (🟢 Running):

### Desde la Consola de Easypanel

```bash
# Acceder a la consola
# Easypanel → Tu App → Console

# Ejecutar diagnóstico
npx tsx scripts/diagnostico-y-test-qr.ts
```

### Si No Puedes Acceder a la Consola

```bash
# Usar SSH (si está habilitado)
ssh user@tu-servidor

# Navegar al directorio de la app
cd /app

# Ejecutar diagnóstico
npx tsx scripts/diagnostico-y-test-qr.ts
```

---

## 🆘 Si la App No Inicia

### Ver Logs Detallados

```bash
# En Easypanel UI → Logs
# Buscar la última línea antes de que se detenga

# Errores comunes y soluciones:

# Error: Cannot find module '@prisma/client'
→ npm install @prisma/client
→ npx prisma generate

# Error: ECONNREFUSED postgresql
→ Verificar DATABASE_URL
→ Verificar que la DB esté corriendo

# Error: Port 3000 is already in use
→ Cambiar PORT en variables de entorno
→ O reiniciar el contenedor

# Error: JavaScript heap out of memory
→ Aumentar memoria en Settings → Resources
```

---

## 📞 Contactar Soporte de Easypanel

Si después de todo esto la app no inicia:

1. **Captura de pantalla** del estado en Easypanel
2. **Últimas 50 líneas de logs**
3. **Variables de entorno** (sin valores sensibles)
4. **Configuración de Build/Start commands**

Envía esto al soporte de Easypanel.

---

## ✅ Resumen

**El problema:** Contenedor detenido
**La solución:** Iniciar la app desde Easypanel UI
**Después:** Ejecutar diagnóstico de QR

**Pasos:**
1. Easypanel → Tu App → **Start**
2. Esperar a que esté 🟢 **Running**
3. Ir a **Console**
4. Ejecutar: `npx tsx scripts/diagnostico-y-test-qr.ts`

---

**IMPORTANTE:** No puedes ejecutar comandos si el contenedor no está corriendo. Primero inicia la aplicación desde la UI de Easypanel.
