# 🔄 Reconexión Automática de WhatsApp

## ✅ Sistema Implementado

El bot **YA TIENE** reconexión automática implementada. Una vez que escaneas el QR por primera vez, la sesión se guarda y el bot se reconecta automáticamente.

## 🎯 Cómo Funciona

### Primera Vez (Escanear QR):
1. Abres el dashboard
2. Escaneas el QR con tu WhatsApp
3. La sesión se guarda en `auth_sessions/[userId]/`
4. Bot conectado ✅

### Siguientes Veces (Automático):
1. Bot inicia
2. Detecta sesión guardada
3. Se reconecta automáticamente
4. **NO necesitas escanear QR** ✅

## 📁 Dónde se Guarda la Sesión

```
auth_sessions/
└── [userId]/
    ├── creds.json          # Credenciales de WhatsApp
    ├── app-state-sync-key-*.json
    └── pre-key-*.json
```

## 🔧 Configuración en Easypanel

### ⚠️ IMPORTANTE: Volumen Persistente

Para que la sesión se mantenga después de reinicios, necesitas configurar un **volumen persistente** en Easypanel:

### Paso 1: Crear Volumen Persistente

1. Ve a **Easypanel** → Tu proyecto
2. Click en **"Mounts"** (menú lateral)
3. Click en **"Add Mount"**
4. Configura:
   ```
   Type: Volume
   Mount Path: /app/auth_sessions
   Size: 1 GB
   ```
5. Click en **"Save"**

### Paso 2: Rebuild

1. Ve a **"Source"** → **"Rebuild"**
2. Espera 2-5 minutos

## ✅ Verificar que Funciona

### Primera Conexión:
```
[Baileys] 📱 Iniciando conexión para usuario: abc123
[Baileys] 📁 Directorio de sesión creado
[Baileys] 📱 QR generado
[Baileys] ✅ Conectado exitosamente
[Baileys] 💾 Sesión guardada
```

### Reconexión Automática:
```
[Baileys] 📱 Iniciando conexión para usuario: abc123
[Baileys] 📂 Sesión existente encontrada
[Baileys] 🔄 Restaurando sesión...
[Baileys] ✅ Reconectado automáticamente
```

## 🛡️ Protección Anti-Ban

El sistema incluye protección anti-ban:
- ✅ Máximo 100 intentos de reconexión
- ✅ Delays progresivos entre intentos
- ✅ Detección de desconexiones sospechosas
- ✅ Modo conservador activado

**Archivo**: `src/lib/safe-reconnect-manager.ts`

## 🔄 Reconexión Inteligente

### Cuándo se Reconecta:
- ✅ Pérdida de conexión a internet
- ✅ Reinicio del servidor
- ✅ Error temporal de WhatsApp
- ✅ Timeout de conexión

### Cuándo NO se Reconecta:
- ❌ Sesión cerrada manualmente (logout)
- ❌ WhatsApp desvinculado desde el teléfono
- ❌ Máximo de intentos alcanzado (protección)

## 💓 Keep-Alive

El bot envía "pings" cada 10 segundos para mantener la conexión activa:

```typescript
HEARTBEAT_INTERVAL=10000  // 10 segundos
```

Esto evita que WhatsApp cierre la conexión por inactividad.

## 🔧 Variables de Entorno Relevantes

```bash
# Reconexión
RECONNECT_ATTEMPTS_MAX=100
RECONNECT_DELAY_BASE=500
RECONNECT_DELAY_MAX=60000

# Keep-Alive
HEARTBEAT_INTERVAL=10000
ENABLE_CONNECTION_MONITOR=true

# Recuperación
ENABLE_SESSION_RECOVERY=true
SESSION_RECOVERY_TIMEOUT=30000

# Protección
ENABLE_CONSERVATIVE_MODE=true
MAX_CONSECUTIVE_FAILURES=5
```

Todas estas variables **YA ESTÁN CONFIGURADAS** en Easypanel.

## 🚨 Problemas Comunes

### Problema 1: Bot no se reconecta después de reinicio

**Causa**: No hay volumen persistente configurado

**Solución**: 
1. Configurar volumen persistente (ver arriba)
2. Rebuild del proyecto

### Problema 2: Pide QR cada vez

**Causa**: Sesión no se está guardando

**Solución**:
1. Verificar que existe carpeta `auth_sessions/`
2. Verificar permisos de escritura
3. Verificar volumen persistente en Easypanel

### Problema 3: Desconexiones frecuentes

**Causa**: WhatsApp detecta actividad sospechosa

**Solución**:
- ✅ Ya está activado modo conservador
- ✅ Ya está activada protección anti-ban
- ✅ Ya están activados delays humanos

## 📊 Monitoreo

### Ver Estado de Conexión:

En el dashboard verás:
- 🟢 **Conectado**: Bot funcionando
- 🟡 **Conectando**: Reconectando automáticamente
- 🔴 **Desconectado**: Necesita escanear QR

### Logs de Reconexión:

```
[Baileys] 🔌 Conexión cerrada. Código: 428, Reconectar: true
[Baileys] 🔄 Intento de reconexión #1
[Baileys] 🔄 Reconectando con protección anti-ban...
[Baileys] ✅ Reconectado exitosamente
```

## ✅ Checklist

- [x] Sistema de reconexión implementado
- [x] Sesiones se guardan automáticamente
- [x] Protección anti-ban activa
- [x] Keep-alive funcionando
- [ ] Volumen persistente en Easypanel (debes configurar)
- [ ] Verificar que funciona después de reinicio

## 🎯 Resumen

**El bot YA SE RECONECTA AUTOMÁTICAMENTE** ✅

Solo necesitas:
1. Escanear QR **una vez**
2. Configurar **volumen persistente** en Easypanel
3. El bot se reconectará solo después de reinicios

**Sin volumen persistente**: Perderás la sesión en cada reinicio y tendrás que escanear QR de nuevo.

**Con volumen persistente**: La sesión se mantiene y el bot se reconecta automáticamente siempre.

---

**Fecha**: 20 Noviembre 2025
**Estado**: Implementado y funcionando
**Acción requerida**: Configurar volumen persistente en Easypanel
