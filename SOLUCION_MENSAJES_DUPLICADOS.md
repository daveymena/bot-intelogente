# 🔧 Solución: Mensajes Duplicados

## 🐛 Problema Identificado

El bot está enviando mensajes duplicados:
1. Primera vez: Mensaje mal formateado o incompleto
2. Segunda vez: Mensaje correcto

## 🔍 Causas Posibles

### 1. Retry Automático
El sistema tiene un mecanismo de retry que puede estar causando duplicados si el primer envío "falla" pero en realidad se envió.

### 2. Múltiples Manejadores
Aunque solo se llama `handleConversationalSalesResponse`, puede haber condiciones de carrera.

### 3. Formato en Dos Pasos
El mensaje se formatea y envía, luego se mejora con fotos, lo que puede causar confusión.

## ✅ Solución Implementada

### Paso 1: Agregar Control de Duplicados

Voy a agregar un sistema de deduplicación basado en hash de mensajes.

### Paso 2: Mejorar Logs

Agregar logs más detallados para identificar exactamente dónde se duplica.

### Paso 3: Eliminar Retry Innecesario

Si el mensaje se envió correctamente la primera vez, no reintentar.

## 🔧 Implementación

### 1. Sistema de Deduplicación

```typescript
// Mapa para rastrear mensajes enviados recientemente
private static recentMessages: Map<string, number> = new Map()

// Verificar si un mensaje es duplicado
private static isDuplicate(from: string, message: string): boolean {
  const key = `${from}:${message.substring(0, 100)}`
  const now = Date.now()
  const lastSent = this.recentMessages.get(key)
  
  // Si se envió hace menos de 5 segundos, es duplicado
  if (lastSent && (now - lastSent) < 5000) {
    return true
  }
  
  // Registrar este mensaje
  this.recentMessages.set(key, now)
  
  // Limpiar mensajes antiguos (más de 1 minuto)
  for (const [k, time] of this.recentMessages.entries()) {
    if (now - time > 60000) {
      this.recentMessages.delete(k)
    }
  }
  
  return false
}
```

### 2. Usar en el Envío

```typescript
// Antes de enviar, verificar duplicados
if (this.isDuplicate(from, formattedResponse)) {
  console.log('[Baileys] ⚠️ Mensaje duplicado detectado, omitiendo envío')
  return
}

// Enviar respuesta formateada
await socket.sendMessage(from, { text: formattedResponse })
```

## 🎯 Solución Temporal (Mientras se Implementa)

### Opción 1: Aumentar Delay entre Mensajes

En `.env`:
```env
MESSAGE_DELAY=2000  # 2 segundos entre mensajes
```

### Opción 2: Desactivar Retry

Comentar el código de retry en `handleAutoResponse`:

```typescript
// Enviar sin retry
await socket.sendMessage(from, { text: intelligentResponse.message })
```

### Opción 3: Verificar Logs

Buscar en los logs cuál de los dos mensajes se envía primero:

```
[Baileys] ✅ Respuesta enviada al cliente
[Baileys] 📸 Foto de "..." enviada automáticamente
```

Si ves dos veces "Respuesta enviada al cliente", entonces hay duplicación.

## 🔍 Debugging

### Ver Logs Detallados

```bash
npm run dev | grep "Respuesta enviada"
```

Deberías ver solo UNA línea por cada mensaje del cliente.

### Verificar Historial

El historial en memoria debería tener solo un par de mensajes por interacción:

```typescript
// Correcto:
[
  { role: 'user', content: 'hola' },
  { role: 'assistant', content: 'Hola! ¿En qué puedo ayudarte?' }
]

// Incorrecto (duplicado):
[
  { role: 'user', content: 'hola' },
  { role: 'assistant', content: 'Hola! ¿En qué puedo ayudarte?' },
  { role: 'assistant', content: 'Hola! ¿En qué puedo ayudarte?' }
]
```

## 📝 Próximos Pasos

1. Implementar sistema de deduplicación
2. Agregar logs más detallados
3. Probar con cliente real
4. Verificar que no haya duplicados

## 🚨 Si el Problema Persiste

### Verificar:

1. **¿El mensaje duplicado es idéntico?**
   - Sí → Problema de deduplicación
   - No → Problema de formato/procesamiento

2. **¿Cuánto tiempo pasa entre mensajes?**
   - < 1 segundo → Mismo proceso
   - > 1 segundo → Procesos diferentes

3. **¿Qué dice el log?**
   - Buscar: `[Baileys] ✅ Respuesta enviada`
   - Contar cuántas veces aparece por mensaje

## 🔧 Solución Rápida

Mientras implemento la solución completa, puedes:

1. **Reiniciar el bot**
   ```bash
   npm run dev
   ```

2. **Limpiar sesión de WhatsApp**
   - Desconectar y reconectar

3. **Verificar que solo haya un proceso corriendo**
   ```bash
   # Windows
   tasklist | findstr node
   
   # Matar procesos duplicados si hay
   taskkill /F /PID <pid>
   ```

---

**Estado**: 🔍 Investigando
**Prioridad**: Alta
**Próximo paso**: Implementar deduplicación
