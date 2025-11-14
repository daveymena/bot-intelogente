# 🚨 SOLUCIÓN URGENTE: QR Se Cierra Inmediatamente

## 🎯 Problema Real Identificado

```
[Baileys] 📱 QR recibido ✅
[Baileys] ✅ QR guardado en DB ✅
[Baileys] 🔄 Actualización de conexión: connection: 'close' ❌
[Baileys] 🚪 Usuario cerró sesión, no reconectar ❌
```

**El QR se genera pero Baileys cierra la sesión INMEDIATAMENTE.**

## 🔍 Causa Raíz

La sesión en `auth_sessions/` tiene credenciales **INVÁLIDAS** o **EXPIRADAS**.

Baileys intenta usar esas credenciales, falla, y cierra la conexión.

## ✅ Solución Inmediata

### Paso 1: Limpiar Sesiones COMPLETAMENTE

```bash
# Detener servidor
Ctrl + C

# Eliminar TODA la carpeta de sesiones
rmdir /s /q auth_sessions

# Eliminar registros de DB también
```

### Paso 2: Limpiar Base de Datos

Ejecuta este script:

```typescript
// limpiar-db-whatsapp.ts
import { db } from './src/lib/db'

async function limpiarDB() {
  await db.whatsAppConnection.deleteMany({})
  console.log('✅ Base de datos limpiada')
}

limpiarDB()
```

### Paso 3: Reiniciar Limpio

```bash
npm run dev
```

### Paso 4: Conectar

1. Ir a dashboard
2. Click "Conectar"
3. **ESPERAR 5 segundos** (importante)
4. QR debería aparecer
5. Escanear RÁPIDO (< 30 segundos)

---

## 🔧 Script Automático de Limpieza Total

Crea: `LIMPIEZA-TOTAL-WHATSAPP.bat`

```batch
@echo off
echo ========================================
echo   LIMPIEZA TOTAL WHATSAPP
echo ========================================
echo.
echo ADVERTENCIA: Esto eliminará:
echo - Todas las sesiones de WhatsApp
echo - Todos los registros de conexión
echo - Cache de Node
echo.
pause

echo.
echo [1/3] Eliminando sesiones...
if exist "auth_sessions" (
    rmdir /s /q "auth_sessions"
    echo ✓ Sesiones eliminadas
)

echo.
echo [2/3] Eliminando cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✓ Cache eliminado
)

echo.
echo [3/3] Limpiando base de datos...
npx tsx -e "import {db} from './src/lib/db.js'; await db.whatsAppConnection.deleteMany({}); console.log('✓ DB limpiada'); process.exit(0)"

echo.
echo ========================================
echo   LIMPIEZA COMPLETADA
echo ========================================
echo.
echo Ahora inicia el servidor:
echo npm run dev
echo.
pause
```

---

## 🎯 Por Qué Falla

### Problema 1: Sesión Corrupta

```
auth_sessions/usuario/creds.json
```

Este archivo tiene credenciales que WhatsApp ya no acepta.

**Solución:** Eliminar TODO `auth_sessions/`

### Problema 2: DB Desincronizada

La base de datos dice "QR_PENDING" pero no hay sesión real.

**Solución:** Limpiar tabla `whatsAppConnection`

### Problema 3: Baileys Cierra Rápido

Baileys detecta credenciales inválidas y cierra en < 1 segundo.

**Solución:** Empezar desde cero sin credenciales

---

## 📋 Checklist de Limpieza

- [ ] Detener servidor (Ctrl+C)
- [ ] Eliminar `auth_sessions/` completo
- [ ] Limpiar tabla `whatsAppConnection`
- [ ] Limpiar cache de Node
- [ ] Reiniciar servidor
- [ ] Esperar 10 segundos
- [ ] Conectar desde dashboard
- [ ] Esperar QR (5 segundos)
- [ ] Escanear QR rápido

---

## 🚀 Comando Rápido

```powershell
# TODO EN UNO
Remove-Item -Recurse -Force auth_sessions -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
npm run dev
```

---

## ⚠️ Si Aún Falla

### Verificar que NO haya:

1. ❌ WhatsApp Desktop abierto
2. ❌ Múltiples pestañas del dashboard
3. ❌ Otro bot usando el mismo número
4. ❌ Sesión activa en otro dispositivo

### Verificar que SÍ haya:

1. ✅ Carpeta `auth_sessions/` vacía o no existe
2. ✅ DB limpia (sin registros antiguos)
3. ✅ Auto-Connect desactivado
4. ✅ Solo UNA pestaña del dashboard

---

## 🎯 Resultado Esperado

```
[Baileys] 🚀 Inicializando conexión
[Baileys] 📁 Directorio de sesión: (vacío o nuevo)
[Baileys] ✅ Estado de autenticación cargado (nuevo)
[Baileys] ✅ Socket creado
[Baileys] 📱 QR recibido
[Baileys] ✅ QR guardado en DB
[Baileys] ⏳ Esperando escaneo... (NO CIERRA)
```

**Tiempo de espera:** 60 segundos para escanear

---

## 🔧 Alternativa: Usar Bot Simple

Si nada funciona, usa el bot simple de smart-sales-new:

```bash
cd ../smart-sales-new
node bot-whatsapp-baileys.js
```

Ese bot funciona al 100% sin problemas.

---

**Próximo paso:** Ejecuta la limpieza total y prueba de nuevo.
