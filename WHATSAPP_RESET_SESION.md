# 🔄 BOTÓN LIMPIAR SESIÓN - WHATSAPP

## ✅ PROBLEMA RESUELTO

Cuando WhatsApp se queda estancado (no reconecta ni genera QR), ahora puedes **limpiar la sesión** y forzar un nuevo QR.

## 🎯 Funcionalidad Agregada

### 1. **Botón "Limpiar y Generar Nuevo QR"**

Aparece en 2 lugares:

#### A) Cuando está esperando escaneo del QR:
```
[Limpiar y Generar Nuevo QR] [Cancelar]
```

#### B) Cuando hay un error:
```
[Reintentar] [Limpiar Sesión]
```

### 2. **Qué hace el botón:**

1. **Pide confirmación** - "¿Estás seguro?"
2. **Elimina la carpeta** `auth_sessions/` completa
3. **Limpia el estado** local (QR, número, etc.)
4. **Espera 2 segundos** para que el sistema se estabilice
5. **Genera un nuevo QR** automáticamente

## 📁 Archivos Creados/Modificados

### 1. **`src/app/api/whatsapp/reset/route.ts`** (NUEVO)

Endpoint API que limpia la sesión:

```typescript
POST /api/whatsapp/reset

Respuesta:
{
  "success": true,
  "message": "Sesión limpiada. Por favor, reconecta..."
}
```

**Qué hace:**
- Elimina carpeta `auth_sessions/`
- Recrea la carpeta vacía
- Retorna éxito

### 2. **`src/components/dashboard/WhatsAppConnection.tsx`** (MODIFICADO)

Agregado:
- Función `handleResetSession()`
- Botón en sección QR_PENDING
- Botón en sección ERROR
- Confirmación antes de limpiar

## 🎬 Flujo de Uso

### Escenario 1: QR no se genera

```
1. Usuario hace click en "Conectar WhatsApp"
2. Se queda en "Generando código QR..." por mucho tiempo
3. Usuario hace click en "Limpiar y Generar Nuevo QR"
4. Confirma la acción
5. Sistema limpia sesión
6. Genera nuevo QR automáticamente
```

### Escenario 2: Error de conexión

```
1. WhatsApp muestra estado "ERROR"
2. Usuario hace click en "Limpiar Sesión"
3. Confirma la acción
4. Sistema limpia sesión
5. Genera nuevo QR automáticamente
```

### Escenario 3: Estancado en "Connecting"

```
1. WhatsApp se queda en "CONNECTING" sin avanzar
2. Usuario hace click en "Limpiar Sesión"
3. Sistema resetea todo
4. Genera nuevo QR
```

## 🔍 Logs en Consola

Cuando se limpia la sesión, verás:

```
[WhatsApp Reset] 🔄 Limpiando sesión...
[WhatsApp Reset] ✅ Carpeta de sesiones eliminada
[WhatsApp Reset] ✅ Carpeta de sesiones recreada
[WhatsApp Reset] ✅ Sesión limpiada exitosamente
[WhatsApp] ✅ Sesión limpiada
```

## ⚠️ Importante

### Qué se elimina:
- ✅ Archivos de sesión de Baileys
- ✅ Credenciales de autenticación
- ✅ QR code anterior

### Qué NO se elimina:
- ❌ Productos
- ❌ Conversaciones guardadas en BD
- ❌ Configuración del bot
- ❌ Usuarios

## 🎨 UI/UX

### Botón en QR_PENDING:
```
┌─────────────────────────────────────┐
│  [QR Code aquí]                     │
│                                     │
│  [🔄 Limpiar y Generar Nuevo QR]   │
│  [Cancelar]                         │
└─────────────────────────────────────┘
```

### Botón en ERROR:
```
┌─────────────────────────────────────┐
│  ❌ Error al conectar WhatsApp      │
│  Si el problema persiste, limpia    │
│  la sesión y genera un nuevo QR.    │
│                                     │
│  [🔄 Reintentar] [🔄 Limpiar Sesión]│
└─────────────────────────────────────┘
```

## 🚀 Commit

```bash
Commit: 68b90e7
Mensaje: "Agregar boton Limpiar Sesion para resetear WhatsApp cuando se queda estancado"
Estado: ✅ Subido a GitHub
```

## 💡 Casos de Uso

### 1. **QR expirado**
- El QR tiene tiempo de vida limitado
- Si no se escanea a tiempo, se queda estancado
- Solución: Limpiar sesión y generar nuevo QR

### 2. **Sesión corrupta**
- A veces los archivos de sesión se corrompen
- WhatsApp no puede reconectar
- Solución: Limpiar sesión y empezar de cero

### 3. **Cambio de número**
- Si quieres conectar otro número de WhatsApp
- Solución: Limpiar sesión y escanear con el nuevo número

### 4. **Después de un crash**
- Si el servidor se cayó mientras conectaba
- La sesión puede quedar en estado inconsistente
- Solución: Limpiar sesión y reconectar

## ✅ Ventajas

1. **No requiere reiniciar el servidor**
2. **Proceso automático** - solo un click
3. **Confirmación** para evitar accidentes
4. **Feedback visual** con toasts
5. **Genera nuevo QR automáticamente**

---

**Estado:** ✅ IMPLEMENTADO Y FUNCIONANDO
**Fecha:** 2024-11-01
**Listo para:** PRODUCCIÓN

