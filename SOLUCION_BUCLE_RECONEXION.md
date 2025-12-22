# ✅ Solución: Bucle Infinito de Reconexiones

## 🎯 Problema Identificado

El sistema estaba entrando en un **bucle infinito de reconexiones**:

```
[Baileys] ✅ Conexión establecida
[Baileys] 🔄 Actualización de conexión: connection: 'close'
[Baileys] 🔌 Conexión cerrada. Reconectar: true
[Baileys] 🔄 Intento de reconexión #1
[Baileys] 🚀 Inicializando conexión...
[Baileys] ✅ Conexión establecida
[Baileys] 🔄 Actualización de conexión: connection: 'close'
[Baileys] 🔌 Conexión cerrada. Reconectar: true
[Baileys] 🔄 Intento de reconexión #2
... (se repite infinitamente)
```

**Causas:**
1. Múltiples instancias intentando conectar simultáneamente
2. No había límite de reintentos
3. No había bloqueo para evitar conexiones concurrentes

## ✅ Solución Implementada

### 1. Sistema de Bloqueo de Conexiones

Agregado un `Map` para bloquear conexiones concurrentes:

```typescript
private static connectionLocks: Map<string, boolean> = new Map()
```

### 2. Verificación Antes de Conectar

```typescript
// 🔒 Verificar si ya hay una conexión en proceso
if (this.connectionLocks.get(userId)) {
  console.log(`[Baileys] ⚠️ Ya hay una conexión en proceso, ignorando...`)
  return { success: false, error: 'Conexión ya en proceso' }
}

// 🔒 Bloquear nuevas conexiones
this.connectionLocks.set(userId, true)
```

### 3. Límite de Reintentos

```typescript
// 🔒 Límite de reintentos para evitar bucle infinito
if (session.reconnectAttempts > 10) {
  console.log(`[Baileys] ❌ Máximo de reintentos alcanzado (10)`)
  session.status = 'DISCONNECTED'
  this.connectionLocks.delete(userId) // 🔓 Desbloquear
  return
}
```

### 4. Desbloqueo en Todos los Casos

**Conexión exitosa:**
```typescript
console.log(`[Baileys] ✅ Conexión registrada en base de datos`)
this.connectionLocks.delete(userId) // 🔓 Desbloquear
```

**Antes de reconectar:**
```typescript
this.connectionLocks.delete(userId) // 🔓 Desbloquear antes de reconectar
const timer = setTimeout(async () => {
  await this.initializeConnection(userId)
}, delay)
```

**En caso de error:**
```typescript
} catch (error) {
  console.error('[Baileys] ❌ Error inicializando conexión:', error)
  this.connectionLocks.delete(userId) // 🔓 Desbloquear
  return { success: false, error: ... }
}
```

**Usuario cierra sesión:**
```typescript
console.log(`[Baileys] 🚪 Usuario cerró sesión, no reconectar`)
this.connectionLocks.delete(userId) // 🔓 Desbloquear
```

## 📊 Flujo Mejorado

### Antes (❌ Bucle infinito):
```
1. Conexión se cierra
2. Intenta reconectar inmediatamente
3. Múltiples instancias intentan conectar
4. Se cierra nuevamente
5. Intenta reconectar infinitamente
```

### Ahora (✅ Controlado):
```
1. Conexión se cierra
2. Verifica si ya hay reconexión en proceso → NO
3. Bloquea nuevas conexiones
4. Espera con backoff exponencial
5. Desbloquea antes de reconectar
6. Intenta reconectar (máximo 10 veces)
7. Si falla 10 veces → Detiene reconexión
```

## 🔍 Logs Mejorados

### Conexión Bloqueada:
```
[Baileys] ⚠️ Ya hay una conexión en proceso para xxx, ignorando...
```

### Máximo de Reintentos:
```
[Baileys] 🔄 Intento de reconexión #10
[Baileys] ❌ Máximo de reintentos alcanzado (10), deteniendo reconexión
```

### Conexión Exitosa:
```
[Baileys] ✅ Conexión establecida para usuario: xxx
[Baileys] ✅ Conexión registrada en base de datos
[Baileys] 🎯 Configurando manejador de mensajes
```

## 📝 Cambios Realizados

1. **src/lib/baileys-stable-service.ts**
   - Agregado `connectionLocks: Map<string, boolean>`
   - Verificación antes de conectar
   - Límite de 10 reintentos
   - Desbloqueo en todos los casos (éxito, error, cierre)

## 🧪 Cómo Probar

### Prueba 1: Reiniciar Servidor

```bash
# 1. Reiniciar servidor
npm run dev

# 2. Observar logs
# Debe ver:
# [Baileys] 🚀 Inicializando conexión...
# [Baileys] ✅ Conexión establecida
# [Baileys] ✅ Conexión registrada
# 
# NO debe ver bucle infinito de reconexiones
```

### Prueba 2: Simular Desconexión

```bash
# 1. Desconecta WhatsApp Web en tu teléfono
# 2. Observa logs
# Debe ver:
# [Baileys] 🔌 Conexión cerrada. Reconectar: true
# [Baileys] 🔄 Intento de reconexión #1
# [Baileys] ⏳ Esperando 1000ms...
# [Baileys] 🔄 Reconectando...
# [Baileys] ✅ Conexión establecida
#
# NO debe ver más de 10 intentos
```

### Prueba 3: Múltiples Conexiones

```bash
# Si intentas conectar múltiples veces rápidamente:
# [Baileys] 🚀 Inicializando conexión...
# [Baileys] ⚠️ Ya hay una conexión en proceso, ignorando...
```

## 📈 Beneficios

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| Bucle infinito | ❌ Sí | ✅ No |
| Conexiones concurrentes | ❌ Permitidas | ✅ Bloqueadas |
| Límite de reintentos | ❌ Ninguno | ✅ 10 intentos |
| Desbloqueo | ❌ No | ✅ En todos los casos |
| Estabilidad | ❌ Baja | ✅ Alta |

## ⚙️ Configuración

### Límite de Reintentos

Por defecto: 10 intentos

Para cambiar, edita en `src/lib/baileys-stable-service.ts`:

```typescript
if (session.reconnectAttempts > 10) { // Cambiar aquí
  console.log(`[Baileys] ❌ Máximo de reintentos alcanzado`)
  ...
}
```

Valores recomendados:
- **Desarrollo**: 5 intentos
- **Producción**: 10 intentos
- **Alta disponibilidad**: 15 intentos

### Backoff Exponencial

```typescript
const delay = Math.min(1000 * Math.pow(2, session.reconnectAttempts - 1), 30000)
```

- Intento 1: 1 segundo
- Intento 2: 2 segundos
- Intento 3: 4 segundos
- Intento 4: 8 segundos
- Intento 5: 16 segundos
- Intento 6+: 30 segundos (máximo)

## 🚨 Manejo de Errores

### Si alcanza el límite de reintentos:

```
[Baileys] ❌ Máximo de reintentos alcanzado (10), deteniendo reconexión
```

El sistema detiene la reconexión automática. Para reconectar:
1. Hacer clic en "Conectar" en el dashboard
2. O esperar a que el sistema de auto-conexión lo intente (cada 30 segundos)

### Si hay conexión en proceso:

```
[Baileys] ⚠️ Ya hay una conexión en proceso, ignorando...
```

El sistema ignora la solicitud duplicada y espera a que termine la conexión actual.

## 💡 Notas Importantes

1. **Bloqueo automático**: Previene conexiones concurrentes
2. **Límite de reintentos**: Evita bucles infinitos
3. **Backoff exponencial**: Reduce carga en el servidor
4. **Desbloqueo garantizado**: En todos los casos (éxito, error, cierre)

---

**Estado**: ✅ Implementado y probado  
**Fecha**: 2025-11-04  
**Impacto**: Crítico - Elimina bucle infinito  
**Riesgo**: Bajo - Solo agrega control de flujo
