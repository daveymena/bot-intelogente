# 📱 Guía: WhatsApp Multi-Device (Independiente del Celular)

## ¿Qué es Multi-Device?

**Multi-Device** permite que tu bot funcione **independientemente** del celular:
- ✅ El celular puede estar apagado
- ✅ El celular puede estar sin internet
- ✅ El bot sigue funcionando 24/7
- ✅ Hasta 4 dispositivos vinculados simultáneamente

## 🔍 Estado Actual

Tu bot usa **Baileys v7.0.0-rc.6** que ya incluye soporte multi-device por defecto.

### Verificar si está activado:

1. Revisa los logs cuando conectas:
```
[Baileys] 📦 Versión de Baileys: 2.3000.xxxxx
```

2. Si ves esta versión (2.3000+), multi-device está activo ✅

## ✅ Cómo Funciona

### Primera Conexión (Escanear QR):

1. Inicia el bot: `npm run dev`
2. Escanea el QR desde tu celular
3. En WhatsApp, ve a: **Dispositivos vinculados**
4. Verás: "Windows" o "Chrome" (tu bot)

### Después de Vincular:

- El bot guarda las credenciales en `auth_sessions/`
- Ya NO necesita el celular conectado
- Funciona independientemente ✅

## 🔧 Configuración Actual

Tu archivo `baileys-stable-service.ts` ya tiene la configuración correcta:

```typescript
const socket = makeWASocket({
  version,
  logger: this.logger,
  printQRInTerminal: false,
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, this.logger)
  },
  generateHighQualityLinkPreview: true
})
```

Esta configuración usa:
- ✅ `useMultiFileAuthState` (multi-device)
- ✅ Credenciales persistentes
- ✅ Cache de claves

## 🧪 Cómo Probar

### Prueba 1: Apagar el Celular

1. Conecta el bot y espera que esté activo
2. Apaga tu celular completamente
3. Envía un mensaje al bot desde otro número
4. El bot debe responder ✅

### Prueba 2: Desconectar Internet del Celular

1. Conecta el bot
2. Desactiva WiFi y datos móviles en tu celular
3. Envía mensaje al bot
4. El bot debe responder ✅

### Prueba 3: Verificar Dispositivos Vinculados

1. Abre WhatsApp en tu celular
2. Ve a: **Configuración → Dispositivos vinculados**
3. Debes ver tu bot listado
4. Dice "Activo hace X minutos"

## ⚠️ Limitaciones Conocidas

### 1. Máximo 4 Dispositivos
- WhatsApp permite máximo 4 dispositivos vinculados
- Si ya tienes 4, debes desvincular uno

### 2. Primera Conexión Requiere Celular
- Para escanear el QR inicial
- Después ya no lo necesitas

### 3. Sesión Expira si No se Usa
- Si el bot está inactivo por mucho tiempo (semanas)
- WhatsApp puede desvincular el dispositivo
- Solución: Keep-alive automático (ya implementado)

### 4. Cambio de Número
- Si cambias el número del celular
- Debes reconectar el bot

## 🔄 Reconexión Automática

Tu bot ya tiene reconexión automática implementada:

```typescript
// Keep-alive cada 60 segundos
setInterval(() => {
  socket.sendPresenceUpdate('available')
}, 60000)
```

Esto mantiene la sesión activa y evita desconexiones.

## 📊 Verificar Estado Multi-Device

### Logs que Confirman Multi-Device:

```
[Baileys] 📦 Versión de Baileys: 2.3000.1027934701
[Baileys] ✅ Estado de autenticación cargado
[Baileys] ✅ Conexión establecida
[Baileys] 📱 Número de WhatsApp: 573042748687
```

Si ves estos logs, multi-device está funcionando ✅

### Logs de Problema:

```
[Baileys] ❌ Error: Connection Closed
[Baileys] 🔄 Razón: 428 (Connection Lost)
```

Esto indica que el celular se desconectó en modo legacy (sin multi-device).

## 🚨 Si Multi-Device NO Funciona

### Solución 1: Limpiar Sesión y Reconectar

```bash
# Detener el bot
# Eliminar sesión antigua
rm -rf auth_sessions/[tu-user-id]

# Reiniciar bot
npm run dev

# Escanear QR de nuevo
```

### Solución 2: Verificar Versión de Baileys

```bash
npm list @whiskeysockets/baileys
```

Debe ser: `7.0.0-rc.6` o superior

### Solución 3: Actualizar Baileys

```bash
npm install @whiskeysockets/baileys@latest
```

## ✅ Confirmación de Funcionamiento

Para confirmar que multi-device está funcionando:

1. **Conecta el bot** y espera que esté activo
2. **Apaga tu celular** completamente
3. **Envía un mensaje** al bot desde otro número
4. **El bot responde** → Multi-device funciona ✅
5. **El bot no responde** → Necesitas reconectar

## 📱 Gestión de Dispositivos

### Ver Dispositivos Vinculados:

En WhatsApp:
1. Configuración
2. Dispositivos vinculados
3. Lista de dispositivos

### Desvincular el Bot:

1. En "Dispositivos vinculados"
2. Toca el dispositivo del bot
3. "Desvincular"

### Reconectar:

1. El bot detectará la desconexión
2. Generará un nuevo QR
3. Escanea el QR de nuevo

## 🎯 Recomendaciones

### Para Producción:

1. ✅ Usa un servidor dedicado (no tu PC)
2. ✅ Mantén el bot corriendo 24/7
3. ✅ Configura auto-restart (PM2, systemd)
4. ✅ Monitorea la conexión
5. ✅ Backup de `auth_sessions/` regularmente

### Para Desarrollo:

1. ✅ Usa un número de prueba
2. ✅ No uses tu número personal
3. ✅ Prueba desconexiones frecuentemente

## 🔐 Seguridad

### Proteger Sesiones:

```bash
# Las credenciales están en:
auth_sessions/[user-id]/

# NO subas esto a Git
# Ya está en .gitignore
```

### Backup de Sesión:

```bash
# Hacer backup
cp -r auth_sessions/ auth_sessions_backup/

# Restaurar backup
cp -r auth_sessions_backup/ auth_sessions/
```

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs del bot
2. Verifica la versión de Baileys
3. Limpia la sesión y reconecta
4. Verifica que no tengas 4 dispositivos ya vinculados

## ✅ Resumen

**Tu bot YA tiene multi-device activado** porque:
- ✅ Usa Baileys 7.0.0-rc.6
- ✅ Usa `useMultiFileAuthState`
- ✅ Guarda credenciales persistentes
- ✅ Tiene keep-alive automático

**Para confirmar:**
1. Conecta el bot
2. Apaga tu celular
3. Envía mensaje al bot
4. Si responde → Funciona ✅

**Si no funciona:**
1. Limpia sesión: `rm -rf auth_sessions/[user-id]`
2. Reconecta escaneando QR
3. Prueba de nuevo
