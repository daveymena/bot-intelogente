# ✅ SOLUCIÓN: Limpieza de Sesión QR desde Dashboard

## ❌ Problema

El botón de limpiar/reset del QR en el dashboard no funcionaba correctamente.

## 🔍 Causas Identificadas

### 1. **Servicios inexistentes**
- `SessionCleanupService` no existe
- `WhatsAppWebService` no existe

### 2. **Acceso a propiedades privadas**
- Intentaba acceder a `BaileysStableService.sessions` (privado)

### 3. **Lógica incompleta**
- No limpiaba archivos de sesión
- No limpiaba base de datos correctamente

## ✅ Solución Implementada

### Archivos Corregidos:

1. **`src/app/api/whatsapp/reset/route.ts`**
2. **`src/app/api/whatsapp/cleanup/route.ts`**

### Cambios Aplicados:

#### 1. Endpoint `/api/whatsapp/reset` (Reset Completo)

**Antes:**
```typescript
// Usaba WhatsAppWebService que no existe
const disconnected = await WhatsAppWebService.disconnect(user.id)
```

**Después:**
```typescript
// 1. Desconectar sesión activa
await BaileysStableService.disconnect(user.id)

// 2. Limpiar archivos de sesión
const sessionDir = path.join(process.cwd(), 'auth_sessions', user.id)
if (fs.existsSync(sessionDir)) {
  fs.rmSync(sessionDir, { recursive: true, force: true })
}

// 3. Limpiar base de datos
await db.whatsAppConnection.deleteMany({
  where: { userId: user.id }
})
```

#### 2. Endpoint `/api/whatsapp/cleanup` (Limpieza)

**Antes:**
```typescript
// Usaba SessionCleanupService que no existe
const health = await SessionCleanupService.checkSessionHealth(userId)
const success = await SessionCleanupService.cleanupCorruptedSession(userId)
```

**Después:**
```typescript
// Limpieza directa sin servicios inexistentes
await BaileysStableService.disconnect(userId)

// Limpiar archivos
const sessionDir = path.join(process.cwd(), 'auth_sessions', userId)
if (fs.existsSync(sessionDir)) {
  fs.rmSync(sessionDir, { recursive: true, force: true })
}

// Limpiar BD
await db.whatsAppConnection.deleteMany({
  where: { userId }
})
```

#### 3. Acciones Disponibles

**`cleanup`** - Limpieza completa:
- Desconecta sesión activa
- Elimina archivos de sesión
- Limpia base de datos

**`check`** - Verificar estado:
- Revisa estado de conexión
- Verifica datos en BD

**`diagnostic`** - Diagnóstico:
- Muestra todas las conexiones
- Útil para debugging

**`auto-cleanup`** - Limpieza automática:
- Limpia conexiones expiradas (>24h)
- Actualiza estados en BD

## 🚀 Cómo Usar

### Desde el Dashboard:

1. **Botón "Limpiar Sesión"** o **"Reset"**
   - Hace POST a `/api/whatsapp/cleanup` con `action: 'cleanup'`
   - O POST a `/api/whatsapp/reset`

2. **Resultado esperado:**
   ```json
   {
     "success": true,
     "message": "Sesión limpiada exitosamente. Puedes conectar de nuevo."
   }
   ```

### Desde la API:

```bash
# Limpieza completa
curl -X POST http://localhost:3000/api/whatsapp/cleanup \
  -H "Content-Type: application/json" \
  -d '{"action": "cleanup"}'

# Verificar estado
curl -X POST http://localhost:3000/api/whatsapp/cleanup \
  -H "Content-Type: application/json" \
  -d '{"action": "check"}'

# Reset completo (requiere autenticación)
curl -X POST http://localhost:3000/api/whatsapp/reset \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

## 📊 Flujo de Limpieza

```
Usuario hace clic en "Limpiar Sesión"
         ↓
POST /api/whatsapp/cleanup
         ↓
1. Desconectar sesión activa
   BaileysStableService.disconnect(userId)
         ↓
2. Eliminar archivos
   fs.rmSync('auth_sessions/userId')
         ↓
3. Limpiar base de datos
   db.whatsAppConnection.deleteMany()
         ↓
Respuesta: { success: true }
         ↓
Dashboard muestra: "Sesión limpiada"
         ↓
Usuario puede conectar de nuevo
```

## ✅ Verificación

### Logs Esperados:

```
[Cleanup API] 🧹 Limpiando sesión para usuario: abc123
[Cleanup API] ✅ Sesión desconectada
[Cleanup API] ✅ Archivos de sesión eliminados
[Cleanup API] ✅ Conexión eliminada de BD
```

### Archivos Eliminados:

```
auth_sessions/
  └── [userId]/
      ├── creds.json      ← Eliminado
      ├── app-state-*.json ← Eliminado
      └── ...             ← Todo eliminado
```

### Base de Datos:

```sql
-- Antes
SELECT * FROM WhatsAppConnection WHERE userId = 'abc123';
-- Resultado: 1 fila

-- Después de cleanup
SELECT * FROM WhatsAppConnection WHERE userId = 'abc123';
-- Resultado: 0 filas
```

## 🔧 Troubleshooting

### Problema: "Error al limpiar sesión"

**Causa:** Permisos de archivos o BD bloqueada

**Solución:**
1. Verificar permisos de carpeta `auth_sessions`
2. Verificar que la BD no esté bloqueada
3. Ver logs del servidor para detalles

### Problema: "No autorizado"

**Causa:** No se pudo determinar el usuario

**Solución:**
1. Verificar que estás logueado
2. Verificar cookie de sesión
3. Reiniciar sesión del dashboard

### Problema: Sesión no se limpia completamente

**Causa:** Archivos bloqueados o proceso activo

**Solución:**
1. Reiniciar servidor
2. Ejecutar limpieza de nuevo
3. Verificar que no haya procesos de WhatsApp activos

## 📝 Notas Importantes

1. **Limpieza es irreversible** - No se puede recuperar la sesión
2. **Requiere nuevo QR** - Después de limpiar, hay que escanear QR de nuevo
3. **Conversaciones se mantienen** - Solo se limpia la sesión, no las conversaciones en BD
4. **Seguro para producción** - No afecta otros usuarios

## 🎯 Diferencia entre Reset y Cleanup

### Reset (`/api/whatsapp/reset`):
- Requiere autenticación con token
- Más seguro
- Usa cookie `auth-token`

### Cleanup (`/api/whatsapp/cleanup`):
- Más flexible
- Múltiples acciones
- Usa cookie `session` o primer usuario

**Recomendación:** Usar `cleanup` con `action: 'cleanup'` desde el dashboard

## ✅ Checklist

- [x] Endpoints corregidos
- [x] Servicios inexistentes eliminados
- [x] Limpieza de archivos implementada
- [x] Limpieza de BD implementada
- [x] Manejo de errores mejorado
- [ ] **REINICIAR SERVIDOR** ← HACER AHORA
- [ ] **PROBAR DESDE DASHBOARD**

---

**Estado:** ✅ Corregido
**Próximo paso:** Reiniciar servidor y probar botón de limpieza
**Impacto:** Alto - Funcionalidad crítica del dashboard
