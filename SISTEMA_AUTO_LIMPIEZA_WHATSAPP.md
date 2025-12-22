# 🧹 Sistema de Auto-Limpieza de Sesiones WhatsApp

## Problema Resuelto

El sistema detectaba sesiones WhatsApp que quedaban en "limbo":
- Estado `CONNECTING` por más de 3 minutos
- Estado `QR_PENDING` con QR expirado
- Bucle infinito: "Conectar" → "Busca conectar" → "Conectar" otra vez
- Archivos de sesión corruptos que no se limpiaban

## Solución Implementada

### 1. Servicio de Auto-Limpieza (`SessionCleanupService`)

**Ubicación:** `src/lib/session-cleanup-service.ts`

**Funciones principales:**

#### `checkSessionHealth(userId)`
Verifica la salud de una sesión y detecta:
- ⏱️ Sesiones en CONNECTING por más de 3 minutos
- 📱 QR expirado o pendiente por más de 5 minutos
- 🔄 Más de 5 intentos de conexión fallidos
- 📁 Archivos de sesión corruptos o vacíos

#### `cleanupCorruptedSession(userId)`
Limpia automáticamente:
- 🗑️ Elimina archivos de sesión (`auth_sessions/userId`)
- 🔄 Resetea estado en base de datos a `DISCONNECTED`
- 🧹 Limpia QR codes expirados
- 📊 Resetea contador de intentos

#### `autoCleanup()`
Ejecuta limpieza automática de todas las sesiones corruptas:
- 🔍 Escanea todas las conexiones activas
- 🚨 Detecta sesiones en mal estado
- 🧹 Limpia automáticamente las corruptas
- 📝 Registra log de acciones

#### `cleanupExpiredLocks()`
Limpia locks de conexión expirados:
- 🔒 Detecta locks de más de 2 minutos
- 🔓 Libera locks expirados
- ✅ Permite nuevas conexiones

### 2. API de Limpieza Manual

**Endpoint:** `POST /api/whatsapp/cleanup`

**Acciones disponibles:**

```typescript
// Limpiar sesión del usuario actual
POST /api/whatsapp/cleanup
{
  "action": "cleanup",
  "force": true  // Opcional: forzar limpieza aunque parezca saludable
}

// Solo verificar salud sin limpiar
POST /api/whatsapp/cleanup
{
  "action": "check"
}

// Reporte completo de todas las sesiones
POST /api/whatsapp/cleanup
{
  "action": "diagnostic"
}

// Ejecutar auto-limpieza de todas las sesiones
POST /api/whatsapp/cleanup
{
  "action": "auto-cleanup"
}
```

**Endpoint GET:** `GET /api/whatsapp/cleanup`
- Verifica estado de salud de la sesión del usuario actual

### 3. Servicio Automático Periódico

El servicio se ejecuta automáticamente cada 2 minutos:

```typescript
// En server.ts o donde inicies el servidor
import { SessionCleanupService } from '@/lib/session-cleanup-service'

// Iniciar servicio de auto-limpieza
const cleanupTimer = SessionCleanupService.startAutoCleanupService(2) // cada 2 minutos
```

## Uso

### Desde el Dashboard (Frontend)

```typescript
// Botón de limpieza manual
const handleCleanup = async () => {
  const response = await fetch('/api/whatsapp/cleanup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'cleanup', force: true })
  })
  
  const data = await response.json()
  if (data.success) {
    alert('Sesión limpiada exitosamente')
    // Recargar estado de conexión
  }
}
```

### Desde Scripts

```bash
# Ejecutar diagnóstico y limpieza
npx tsx scripts/test-session-cleanup.ts
```

### Desde Código

```typescript
import { SessionCleanupService } from '@/lib/session-cleanup-service'

// Verificar salud de una sesión
const health = await SessionCleanupService.checkSessionHealth(userId)
console.log('Sesión saludable:', health.isHealthy)
console.log('Problemas:', health.issues)

// Limpiar si es necesario
if (health.shouldCleanup) {
  await SessionCleanupService.cleanupCorruptedSession(userId)
}

// Auto-limpieza de todas las sesiones
await SessionCleanupService.autoCleanup()

// Reporte completo
const diagnostic = await SessionCleanupService.diagnosticReport()
console.log('Sesiones corruptas:', diagnostic.corruptedSessions)
```

## Tiempos de Detección

| Estado | Tiempo Máximo | Acción |
|--------|---------------|--------|
| CONNECTING | 3 minutos | Auto-limpieza |
| QR_PENDING | 5 minutos | Auto-limpieza |
| Lock de conexión | 2 minutos | Liberar lock |
| Intentos fallidos | 5 intentos | Auto-limpieza |

## Logs

El servicio genera logs detallados:

```
[SessionCleanup] 🔄 Iniciando auto-limpieza...
[SessionCleanup] 📊 Encontradas 2 sesiones activas
[SessionCleanup] 🚨 Sesión corrupta detectada: {
  userId: 'user123',
  status: 'CONNECTING',
  issues: ['Sesión en CONNECTING por 245s (máx: 180s)']
}
[SessionCleanup] 🧹 Limpiando sesión corrupta para usuario: user123
[SessionCleanup] 📁 Eliminando directorio: auth_sessions/user123
[SessionCleanup] ✅ Sesión limpiada exitosamente
[SessionCleanup] ✅ Auto-limpieza completada: 1 sesiones limpiadas
```

## Integración con Baileys

El servicio se integra automáticamente con `BaileysStableService`:

1. **Antes de conectar:** Verifica si hay sesión corrupta y limpia
2. **Durante conexión:** Monitorea tiempo en CONNECTING
3. **QR expirado:** Detecta y limpia automáticamente
4. **Locks expirados:** Libera para permitir nueva conexión

## Beneficios

✅ **No más bucles infinitos** de "Conectar → Conectar → Conectar"
✅ **Limpieza automática** cada 2 minutos
✅ **Detección inteligente** de sesiones corruptas
✅ **Liberación de locks** expirados
✅ **Logs detallados** para debugging
✅ **API manual** para forzar limpieza
✅ **Diagnóstico completo** del sistema

## Comandos Rápidos

```bash
# Probar sistema de limpieza
npx tsx scripts/test-session-cleanup.ts

# Ver logs del servidor (incluye auto-limpieza)
npm run dev

# Limpiar manualmente desde curl
curl -X POST http://localhost:3000/api/whatsapp/cleanup \
  -H "Content-Type: application/json" \
  -d '{"action":"cleanup","force":true}'
```

## Próximos Pasos

1. ✅ Agregar botón "Limpiar Sesión" en el dashboard
2. ✅ Mostrar estado de salud en tiempo real
3. ✅ Notificación cuando se detecta sesión corrupta
4. ✅ Historial de limpiezas automáticas

## Notas Técnicas

- El servicio NO afecta sesiones conectadas correctamente
- Solo limpia sesiones en estados problemáticos
- Los archivos de sesión se eliminan físicamente del disco
- El estado en DB se resetea a DISCONNECTED
- Los locks se liberan automáticamente después de 2 minutos
- El servicio es seguro para ejecutar en producción

---

**Creado:** 20 Nov 2025
**Estado:** ✅ Implementado y funcionando
