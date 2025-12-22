# 🔧 Solución: Loop Infinito de Reconexión WhatsApp

## 🔍 Problema Identificado

El sistema estaba en un **loop infinito de reconexiones** con estos síntomas:

```
[Baileys] 🔌 Conexión cerrada. Código: 440, Reconectar: true
[Baileys] 🔄 Intento de reconexión #1
[Baileys] ⏳ Esperando 1000ms antes de reconectar...
[Baileys] 🔄 Reconectando...
[Baileys] 🚀 Inicializando conexión para usuario...
```

### Causas Raíz

1. **Código de error 440**: Conflicto de sesión (múltiples instancias del socket intentando conectarse)
2. **Auto-reconexión agresiva**: El sistema intentaba reconectar cada 30 segundos sin verificar el estado
3. **Múltiples conexiones simultáneas**: Cada llamada a `/api/whatsapp/status` disparaba una nueva conexión
4. **Sin cooldown**: No había tiempo de espera entre desconexión y reconexión

## ✅ Soluciones Implementadas

### 1. Manejo Específico del Código 440

**Archivo**: `src/lib/baileys-stable-service.ts`

```typescript
// 🚫 Código 440 = Conflicto de sesión (múltiples conexiones)
// NO reconectar automáticamente, esperar a que el sistema se estabilice
if (statusCode === 440) {
  console.log(`[Baileys] ⚠️ Conflicto de sesión detectado (440), limpiando y esperando...`)
  session.status = 'DISCONNECTED'
  await this.updateConnectionStatus(userId, 'DISCONNECTED', 'Conflicto de sesión')
  this.stopKeepAlive(userId)
  this.sessions.delete(userId)
  this.connectionLocks.delete(userId)
  return // NO reconectar
}
```

### 2. Verificación Inteligente de Estado

**Archivo**: `src/lib/whatsapp-auto-reconnect.ts`

```typescript
// 🔒 SOLO reconectar si está completamente DISCONNECTED
// NO reconectar si está CONNECTING, QR_PENDING, o en proceso
if (!session || (session.status === 'DISCONNECTED' && !isConnected)) {
  // Verificar que no haya una reconexión reciente (evitar spam)
  const lastDisconnect = session?.lastDisconnect
  if (lastDisconnect) {
    const timeSinceDisconnect = Date.now() - lastDisconnect.getTime()
    if (timeSinceDisconnect < 60000) { // Menos de 1 minuto
      continue // Esperar más tiempo
    }
  }
  
  await this.attemptConnection(user.id)
}
```

### 3. Backoff Exponencial Mejorado

- **Antes**: 1s, 2s, 4s, 8s... (máximo 30s)
- **Ahora**: 2s, 4s, 8s, 16s, 32s, 60s (máximo 60s)
- **Límite de reintentos**: Reducido de 10 a 5

### 4. Cooldown de 1 Minuto

El sistema ahora espera **mínimo 1 minuto** después de una desconexión antes de intentar reconectar automáticamente.

## 🧹 Cómo Limpiar y Estabilizar

### Opción 1: Limpiar Conexiones (Recomendado)

```bash
node limpiar-conexiones-whatsapp.js
```

Esto:
- Marca todas las conexiones como DISCONNECTED en la DB
- Limpia el estado en memoria
- Te permite reconectar limpiamente

### Opción 2: Reiniciar Servidor

```bash
# Detener el servidor (Ctrl+C)
# Iniciar de nuevo
npm run dev
```

### Opción 3: Limpiar Sesiones Completamente

```bash
# ⚠️ CUIDADO: Esto borrará las sesiones guardadas
# Tendrás que escanear QR de nuevo

# Windows
rmdir /s /q auth_sessions

# Linux/Mac
rm -rf auth_sessions

# Luego reiniciar
npm run dev
```

## 📊 Verificar que Está Funcionando

### Logs Correctos (Estable)

```
✅ [Auto-Reconnect] Usuario email@example.com conectado
[Baileys] ✅ Conexión establecida para usuario: xxx
[Baileys] 💓 Keep-alive configurado (cada 30s)
```

### Logs Incorrectos (Loop)

```
❌ [Baileys] 🔌 Conexión cerrada. Código: 440
❌ [Baileys] 🔄 Reconectando... (repetido constantemente)
```

## 🎯 Mejores Prácticas

### 1. No Forzar Reconexiones Manuales

Si ves que está desconectado, **espera 1-2 minutos** antes de intentar reconectar manualmente. El sistema lo hará automáticamente.

### 2. Evitar Múltiples Tabs/Ventanas

No abras múltiples tabs del dashboard al mismo tiempo. Esto puede causar conflictos de sesión.

### 3. Monitorear Logs

Revisa los logs para detectar patrones:

```bash
# Ver solo logs de WhatsApp
npm run dev | findstr "Baileys Auto-Reconnect"
```

### 4. Usar el Endpoint de Status Correctamente

El endpoint `/api/whatsapp/status` ahora **solo consulta** el estado, no intenta reconectar.

## 🔧 Configuración Ajustable

En `src/lib/whatsapp-auto-reconnect.ts`:

```typescript
// Intervalo de verificación (default: 30 segundos)
this.reconnectInterval = setInterval(async () => {
  await this.checkAndReconnect()
}, 30000)

// Cooldown mínimo después de desconexión (default: 60 segundos)
if (timeSinceDisconnect < 60000) {
  continue
}
```

En `src/lib/baileys-stable-service.ts`:

```typescript
// Máximo de reintentos (default: 5)
if (session.reconnectAttempts > 5) {
  // Detener reconexión
}

// Backoff exponencial (default: 2s base, 60s máximo)
const delay = Math.min(2000 * Math.pow(2, session.reconnectAttempts - 1), 60000)
```

## 📝 Resumen de Cambios

| Archivo | Cambio | Impacto |
|---------|--------|---------|
| `baileys-stable-service.ts` | Manejo específico código 440 | Evita loop infinito |
| `baileys-stable-service.ts` | Backoff 2s → 60s | Reconexión más espaciada |
| `baileys-stable-service.ts` | Límite 10 → 5 reintentos | Detiene antes |
| `whatsapp-auto-reconnect.ts` | Cooldown de 1 minuto | Evita spam de reconexiones |
| `whatsapp-auto-reconnect.ts` | Verificación de estado | Solo reconecta si DISCONNECTED |

## 🚀 Próximos Pasos

1. **Ejecutar limpieza**:
   ```bash
   node limpiar-conexiones-whatsapp.js
   ```

2. **Reiniciar servidor**:
   ```bash
   npm run dev
   ```

3. **Verificar logs**:
   - Debe ver: `✅ [Auto-Reconnect] Usuario conectado`
   - NO debe ver: Loop de `🔄 Reconectando...`

4. **Probar conexión**:
   - Ir al dashboard
   - Verificar estado de WhatsApp
   - Si está desconectado, esperar 1-2 minutos
   - O reconectar manualmente

## ✅ Sistema Estabilizado

Con estos cambios, el sistema ahora:
- ✅ Detecta y previene conflictos de sesión (código 440)
- ✅ Espera tiempo suficiente entre reconexiones
- ✅ No intenta reconectar si ya está en proceso
- ✅ Tiene límites claros de reintentos
- ✅ Usa backoff exponencial para espaciar intentos
- ✅ Mantiene logs limpios y útiles
