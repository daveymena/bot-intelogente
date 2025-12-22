# 🛡️ Guía Anti-Ban para Baileys

## ✅ Sistema de Protección Implementado

Se han creado 3 módulos de protección anti-ban:

### 1. **AntiBanMiddleware** (`src/lib/anti-ban-middleware.ts`)
Protección principal contra bloqueos de WhatsApp.

**Características:**
- ✅ Rate limiting (máx 15 mensajes/minuto)
- ✅ Delays humanos aleatorios (800-2500ms)
- ✅ Detección de spam por frase repetida
- ✅ Detección de spam por destinatario
- ✅ Humanización de texto (variaciones automáticas)
- ✅ Exponential backoff para reconexiones
- ✅ Limpieza automática de métricas

### 2. **SafeBaileysSender** (`src/lib/safe-baileys-sender.ts`)
Wrapper seguro para enviar mensajes.

**Características:**
- ✅ Envío de texto con protección
- ✅ Envío de media con delays extra
- ✅ Envío en batch con delays
- ✅ Verificación pre-envío
- ✅ Estadísticas de envío

### 3. **SafeReconnectManager** (`src/lib/safe-reconnect-manager.ts`)
Manejo seguro de reconexiones.

**Características:**
- ✅ Exponential backoff (1s, 2s, 4s, 8s, 16s, max 60s)
- ✅ Límite de intentos de reconexión
- ✅ Prevención de reconexiones simultáneas
- ✅ Reset automático después de 5 minutos

## 📖 Cómo Usar

### Enviar Mensaje de Texto

```typescript
import { SafeBaileysSender } from '@/lib/safe-baileys-sender'

// Enviar mensaje seguro
const success = await SafeBaileysSender.sendText(sock, {
  userId: 'user123',
  recipient: '573001234567@s.whatsapp.net',
  message: 'Hola! ¿Cómo estás?',
  forceHumanize: true // Agrega variaciones automáticas
})

if (success) {
  console.log('✅ Mensaje enviado')
} else {
  console.log('⚠️ No se pudo enviar (rate limit o spam)')
}
```

### Enviar Media

```typescript
const success = await SafeBaileysSender.sendMedia(sock, {
  userId: 'user123',
  recipient: '573001234567@s.whatsapp.net',
  message: 'Aquí está tu producto',
  mediaUrl: 'https://example.com/image.jpg',
  mediaType: 'image'
})
```

### Enviar Múltiples Mensajes

```typescript
const messages = [
  { recipient: '573001234567@s.whatsapp.net', message: 'Hola cliente 1' },
  { recipient: '573007654321@s.whatsapp.net', message: 'Hola cliente 2' }
]

const successCount = await SafeBaileysSender.sendBatch(
  sock,
  'user123',
  messages
)

console.log(`✅ ${successCount}/${messages.length} mensajes enviados`)
```

### Reconexión Segura

```typescript
import { SafeReconnectManager } from '@/lib/safe-reconnect-manager'

// Registrar desconexión
SafeReconnectManager.recordDisconnect(userId)

// Verificar si puede reconectar
if (SafeReconnectManager.canReconnect(userId)) {
  // Reconectar con delay automático
  await SafeReconnectManager.startReconnect(userId, async () => {
    // Tu código de reconexión aquí
    await connectToWhatsApp()
  })
}
```

### Verificar Estadísticas

```typescript
// Obtener stats de envío
const stats = SafeBaileysSender.getStats('user123')
console.log(stats)
// {
//   messageCount: 5,
//   lastMessageTime: '2025-11-16T...',
//   uniqueRecipients: 3,
//   uniquePhrases: 4,
//   canSendMessage: true
// }

// Obtener stats de reconexión
const reconnectStats = SafeReconnectManager.getReconnectState('user123')
console.log(reconnectStats)
// {
//   disconnectCount: 2,
//   reconnectAttempts: 1,
//   isReconnecting: false,
//   lastDisconnectTime: '2025-11-16T...',
//   canReconnect: true
// }
```

## 🔧 Integración con tu Sistema

### En el Servicio de Baileys

Reemplaza los envíos directos:

```typescript
// ❌ ANTES (sin protección)
await sock.sendMessage(jid, { text: message })

// ✅ DESPUÉS (con protección)
await SafeBaileysSender.sendText(sock, {
  userId: user.id,
  recipient: jid,
  message: message
})
```

### En el Manejador de Desconexiones

```typescript
// ❌ ANTES (reconexión inmediata)
if (connection === 'close') {
  await connectToWhatsApp()
}

// ✅ DESPUÉS (reconexión segura)
if (connection === 'close') {
  SafeReconnectManager.recordDisconnect(userId)
  
  if (SafeReconnectManager.canReconnect(userId)) {
    await SafeReconnectManager.startReconnect(userId, async () => {
      await connectToWhatsApp()
    })
  }
}
```

## 🎯 Reglas de Oro Anti-Ban

### ✅ LO QUE SÍ DEBES HACER

1. **Responder solo a quien te escribe primero**
   - El cliente inicia la conversación
   - Tu bot responde de forma natural

2. **Usar delays humanos**
   - El sistema ya los implementa automáticamente
   - 800-2500ms entre mensajes

3. **Variar las respuestas**
   - Usa `forceHumanize: true`
   - Agrega emojis aleatorios

4. **Mantener sesión estable**
   - Evita desconexiones frecuentes
   - Usa servidor estable (EasyPanel)

5. **Respetar rate limits**
   - Máximo 15 mensajes/minuto
   - El sistema lo controla automáticamente

### ❌ LO QUE NO DEBES HACER

1. **NO enviar mensajes masivos**
   - No broadcasts a listas grandes
   - No spam a números desconocidos

2. **NO repetir el mismo mensaje**
   - El sistema detecta y bloquea
   - Usa variaciones

3. **NO reconectar en bucle**
   - El sistema usa exponential backoff
   - Espera entre intentos

4. **NO enviar archivos muy rápido**
   - El sistema agrega delays extra
   - 2-3.5 segundos para media

5. **NO ignorar los límites**
   - Si `canSend()` retorna false, NO envíes
   - Respeta el rate limiting

## 📊 Límites Configurados

```typescript
MAX_MESSAGES_PER_MINUTE = 15      // Mensajes por minuto
MAX_SAME_PHRASE_COUNT = 3         // Veces que se puede repetir una frase
MIN_DELAY_MS = 800                // Delay mínimo entre mensajes
MAX_DELAY_MS = 2500               // Delay máximo entre mensajes
COOLDOWN_PERIOD_MS = 60000        // Período de cooldown (1 minuto)
MAX_RECONNECT_ATTEMPTS = 5        // Intentos máximos de reconexión
RESET_PERIOD_MS = 300000          // Reset de contador (5 minutos)
```

## 🔍 Monitoreo

### Dashboard de Estadísticas

Puedes crear un endpoint para monitorear:

```typescript
// GET /api/anti-ban/stats/:userId
export async function GET(request: Request, { params }: any) {
  const { userId } = params
  
  const sendStats = SafeBaileysSender.getStats(userId)
  const reconnectStats = SafeReconnectManager.getReconnectState(userId)
  
  return Response.json({
    sending: sendStats,
    reconnection: reconnectStats
  })
}
```

### Logs Automáticos

El sistema ya incluye logs detallados:
- ✅ Mensajes enviados
- ⚠️ Rate limits alcanzados
- ⚠️ Spam detectado
- 🔄 Reconexiones
- ❌ Errores

## 🚀 Nivel Avanzado

### Personalizar Límites por Usuario

```typescript
// Crear configuración personalizada
const premiumLimits = {
  maxMessagesPerMinute: 30,  // Usuarios premium pueden más
  minDelay: 500,
  maxDelay: 1500
}

// Aplicar en el middleware
// (requiere modificar el código para aceptar configuración)
```

### Integrar con WhatsApp Cloud API

Si quieres **cero riesgo de ban**:

```typescript
// Usar WhatsApp Cloud API oficial
// Costo: ~$0.005 por mensaje
// Ventaja: Sin límites, sin bans
// Desventaja: Cuesta dinero

// Implementación disponible si lo necesitas
```

## 📞 Soporte

Si necesitas:
- ✅ Ajustar límites
- ✅ Agregar más protecciones
- ✅ Integrar con Cloud API
- ✅ Monitoreo avanzado
- ✅ Multi-tenant con límites por plan

Solo avísame y lo implemento.

---

**Versión:** 1.0  
**Fecha:** 2025-11-16  
**Estado:** ✅ Listo para producción
