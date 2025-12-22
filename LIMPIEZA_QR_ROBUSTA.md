# 🧹 Sistema de Limpieza Robusta de QR WhatsApp

## Problema Resuelto

El QR de WhatsApp no se limpiaba correctamente y quedaba "pegado" en el sistema, causando:
- ❌ QR antiguo que no se puede escanear
- ❌ Estado "pending" permanente
- ❌ No se puede generar un nuevo QR
- ❌ Archivos de sesión corruptos

## Solución Implementada

### Sistema de Limpieza en 3 Niveles

1. **Nivel 1: Memoria** - Limpia sesiones activas en RAM
2. **Nivel 2: Archivos** - Elimina archivos de sesión del disco
3. **Nivel 3: Base de Datos** - Limpia registros de conexión

---

## Archivos Creados

### 1. API de Limpieza Robusta

**`src/app/api/whatsapp/cleanup/route.ts`**

Nueva ruta API que ejecuta limpieza completa:

```typescript
POST /api/whatsapp/cleanup

Limpia:
✅ Sesiones en memoria (BaileysService)
✅ Archivos en auth_sessions/
✅ Registros en base de datos
```

**Características:**
- ✅ Limpieza en 3 pasos secuenciales
- ✅ Manejo robusto de errores
- ✅ Logs detallados en consola
- ✅ Respuesta con detalles de lo que se limpió

### 2. Componente Mejorado

**`src/components/dashboard/WhatsAppConnection.tsx`**

Función `handleResetSession` mejorada:

```typescript
// Antes
- Limpieza básica
- Sin verificación de éxito
- No limpiaba archivos

// Ahora
✅ Limpieza robusta en 3 niveles
✅ Verificación de cada paso
✅ Espera 3 segundos para asegurar limpieza
✅ Genera nuevo QR automáticamente
```

### 3. Script de Consola

**`scripts/limpiar-whatsapp-robusto.ts`**

Script para ejecutar desde Easypanel:

```bash
npx tsx scripts/limpiar-whatsapp-robusto.ts
```

**Qué hace:**
- ✅ Elimina TODOS los archivos de auth_sessions/
- ✅ Elimina TODOS los registros de WhatsApp en DB
- ✅ Muestra resumen detallado
- ✅ Maneja errores sin fallar

### 4. Archivo Bat (Windows)

**`limpiar-whatsapp-robusto.bat`**

Para ejecutar en Windows local:

```bash
limpiar-whatsapp-robusto.bat
```

---

## Cómo Usar

### Opción 1: Desde el Dashboard (RECOMENDADO)

1. Ve al dashboard
2. Sección "WhatsApp"
3. Haz clic en **"Limpiar Sesión"** o **"Reset"**
4. Confirma la acción
5. Espera 3 segundos
6. Se generará un nuevo QR automáticamente

**Resultado esperado:**
```
🧹 Iniciando limpieza robusta...
✅ Limpieza completa exitosa
Esperando limpieza completa...
Generando nuevo código QR...
✅ ¡Código QR generado! Escanéalo con WhatsApp
```

### Opción 2: Desde Easypanel Console

Si el botón del dashboard no funciona:

```bash
# Conectar a la consola de Easypanel
# Ejecutar:
npx tsx scripts/limpiar-whatsapp-robusto.ts
```

**Resultado esperado:**
```
═══════════════════════════════════════════════════════════════
🧹 LIMPIEZA ROBUSTA DE WHATSAPP
═══════════════════════════════════════════════════════════════

📋 PASO 1: Limpiando archivos de sesión...
   ✅ Limpiado: user-id-123 (15 archivos)
   ✅ Total: 15 archivos, 2 directorios eliminados

📋 PASO 2: Limpiando base de datos...
   ✅ 1 conexión(es) eliminada(s) de DB

═══════════════════════════════════════════════════════════════
📊 RESUMEN DE LIMPIEZA
═══════════════════════════════════════════════════════════════
✅ Archivos eliminados: 15
✅ Directorios eliminados: 2
✅ Registros de DB eliminados: 1
✅ Sin errores
═══════════════════════════════════════════════════════════════

✅ LIMPIEZA COMPLETA EXITOSA
   Ahora puedes conectar WhatsApp desde el dashboard
```

### Opción 3: Desde Windows Local

```bash
limpiar-whatsapp-robusto.bat
```

---

## Flujo de Limpieza

```
Usuario hace clic en "Limpiar Sesión"
    ↓
Confirmación: "¿Estás seguro?"
    ↓
POST /api/whatsapp/cleanup
    ↓
┌─────────────────────────────────────┐
│ PASO 1: Limpiar Memoria             │
│ - Desconectar sesión activa         │
│ - Eliminar de Map en memoria        │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ PASO 2: Limpiar Archivos            │
│ - Buscar auth_sessions/user-id/     │
│ - Eliminar todos los archivos       │
│ - Eliminar directorio                │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ PASO 3: Limpiar Base de Datos       │
│ - DELETE FROM whatsAppConnection    │
│ - WHERE userId = user.id             │
└──────────────┬──────────────────────┘
               ↓
Limpiar estado local del componente
    ↓
Esperar 3 segundos
    ↓
Generar nuevo QR automáticamente
    ↓
✅ Listo para escanear
```

---

## Qué se Limpia

### 1. Memoria (RAM)

```typescript
// Sesiones activas en BaileysService
BaileysService.sessions.delete(userId)

// Callbacks de QR
BaileysService.qrCallbacks.delete(userId)
```

### 2. Archivos (Disco)

```bash
# Directorio de sesión del usuario
auth_sessions/
  └── user-id-123/
      ├── creds.json          ❌ ELIMINADO
      ├── app-state-sync-*.json  ❌ ELIMINADO
      ├── session-*.json      ❌ ELIMINADO
      └── ...                 ❌ TODO ELIMINADO
```

### 3. Base de Datos

```sql
-- Eliminar registro de conexión
DELETE FROM WhatsAppConnection
WHERE userId = 'user-id-123';
```

---

## Manejo de Errores

### Error: No se pueden eliminar archivos

**Causa:** Archivos en uso o permisos insuficientes

**Solución:**
```bash
# En Easypanel, verificar permisos
ls -la auth_sessions/

# Cambiar permisos si es necesario
chmod -R 755 auth_sessions/

# Reintentar limpieza
npx tsx scripts/limpiar-whatsapp-robusto.ts
```

### Error: Base de datos no responde

**Causa:** DATABASE_URL incorrecta o DB no disponible

**Solución:**
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Probar conexión
npx prisma db push
```

### Error: Limpieza parcial

**Resultado:** Algunos pasos fallaron pero otros sí

**Acción:** El sistema continúa de todos modos

```json
{
  "success": false,
  "message": "⚠️ Limpieza parcial. Algunos pasos fallaron.",
  "details": {
    "memoryCleared": true,
    "filesDeleted": false,  // ❌ Falló
    "databaseCleared": true,
    "errors": ["Error eliminando archivos: EACCES"]
  }
}
```

---

## Logs Detallados

### En el Dashboard

```
🧹 Iniciando limpieza robusta...
✅ Limpieza completa exitosa
Esperando limpieza completa...
Generando nuevo código QR...
✅ ¡Código QR generado! Escanéalo con WhatsApp
```

### En la Consola del Servidor

```
═══════════════════════════════════════════════════════════════
🧹 LIMPIEZA ROBUSTA DE WHATSAPP
═══════════════════════════════════════════════════════════════
👤 Usuario: user@example.com (abc123)

📋 PASO 1: Limpiando sesión en memoria...
   ✅ Sesión desconectada
   ✅ Memoria limpiada

📋 PASO 2: Eliminando archivos de sesión...
   ✅ 15 archivo(s) eliminado(s)

📋 PASO 3: Limpiando base de datos...
   ✅ 1 conexión(es) eliminada(s) de DB

═══════════════════════════════════════════════════════════════
📊 RESUMEN DE LIMPIEZA
═══════════════════════════════════════════════════════════════
✅ Memoria limpiada: Sí
✅ Archivos eliminados: Sí
✅ Base de datos limpiada: Sí
✅ Sin errores
═══════════════════════════════════════════════════════════════
```

---

## Testing

### Test 1: Limpieza desde Dashboard

```bash
# 1. Conectar WhatsApp
# 2. Hacer clic en "Limpiar Sesión"
# 3. Confirmar
# 4. Verificar que se genera nuevo QR
```

### Test 2: Limpieza desde Consola

```bash
# En Easypanel Console
npx tsx scripts/limpiar-whatsapp-robusto.ts

# Verificar output
# Debe mostrar: ✅ LIMPIEZA COMPLETA EXITOSA
```

### Test 3: Verificar Archivos Eliminados

```bash
# Antes de limpiar
ls -la auth_sessions/
# Debe mostrar directorios de usuarios

# Después de limpiar
ls -la auth_sessions/
# Debe estar vacío o no existir
```

### Test 4: Verificar DB Limpia

```bash
# Ejecutar script de verificación
npx tsx scripts/verificar-estado-whatsapp.ts

# Debe mostrar: ❌ No hay conexiones registradas
```

---

## Troubleshooting

### Problema: El botón no hace nada

**Solución:**
1. Abrir DevTools → Console
2. Buscar errores
3. Verificar que la ruta `/api/whatsapp/cleanup` existe
4. Probar desde consola de Easypanel

### Problema: QR sigue apareciendo después de limpiar

**Causa:** Caché del navegador

**Solución:**
```bash
# Limpiar caché del navegador
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)

# O limpiar cookies manualmente
DevTools → Application → Cookies → Clear
```

### Problema: Error de permisos en archivos

**Solución:**
```bash
# En Easypanel Console
chmod -R 755 auth_sessions/
npx tsx scripts/limpiar-whatsapp-robusto.ts
```

---

## Comparación: Antes vs Ahora

### Antes

```
❌ Limpieza básica
❌ Solo limpiaba memoria
❌ Archivos quedaban en disco
❌ DB no se limpiaba
❌ QR quedaba "pegado"
❌ Sin logs detallados
❌ Sin manejo de errores
```

### Ahora

```
✅ Limpieza robusta en 3 niveles
✅ Limpia memoria + archivos + DB
✅ Todos los archivos eliminados
✅ DB completamente limpia
✅ QR se genera desde cero
✅ Logs detallados en cada paso
✅ Manejo robusto de errores
✅ Continúa incluso si algo falla
```

---

## Resumen

✅ **Nueva API:** `/api/whatsapp/cleanup` - Limpieza en 3 niveles
✅ **Componente mejorado:** Botón de limpieza robusto
✅ **Script de consola:** Para Easypanel
✅ **Archivo bat:** Para Windows
✅ **Logs detallados:** En cada paso
✅ **Manejo de errores:** Robusto y completo

**Resultado:** El QR se limpia COMPLETAMENTE y se puede generar uno nuevo sin problemas.

---

**Fecha:** 2025-11-04
**Versión:** 3.0
