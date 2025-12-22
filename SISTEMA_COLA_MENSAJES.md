# 🔄 SISTEMA DE COLA DE MENSAJES

## 🎯 Problema Detectado

**Situación actual:**
```
Cliente envía: "Hola"           → Bot procesa (15s)
Cliente envía: "Busco laptop"   → Bot procesa (15s) ❌ SIMULTÁNEO
Cliente envía: "Cuánto cuesta?" → Bot procesa (15s) ❌ SIMULTÁNEO
```

**Problemas:**
- ❌ 3 operaciones simultáneas
- ❌ Sobrecarga del servidor
- ❌ Contexto mezclado
- ❌ Respuestas duplicadas o confusas

---

## ✅ Solución: Cola por Usuario

**Comportamiento correcto:**
```
Cliente envía: "Hola"           → Bot procesa (15s) ✅
Cliente envía: "Busco laptop"   → En cola, espera... ⏳
Cliente envía: "Cuánto cuesta?" → En cola, espera... ⏳

Bot termina "Hola"              → Responde
Bot procesa "Busco laptop"      → Procesa (15s) ✅
Bot termina "Busco laptop"      → Responde
Bot procesa "Cuánto cuesta?"    → Procesa (15s) ✅
```

**Ventajas:**
- ✅ Una operación a la vez por usuario
- ✅ Contexto correcto
- ✅ Sin sobrecarga
- ✅ Respuestas ordenadas

---

## 🔧 Implementación

### 1. Sistema de Cola Simple

```typescript
// En ollama-orchestrator-professional.ts

class MessageQueue {
  private queues: Map<string, Array<() => Promise<any>>> = new Map()
  private processing: Set<string> = new Set()

  async add<T>(userId: string, task: () => Promise<T>): Promise<T> {
    // Si no hay cola para este usuario, crear
    if (!this.queues.has(userId)) {
      this.queues.set(userId, [])
    }

    // Agregar tarea a la cola
    return new Promise((resolve, reject) => {
      this.queues.get(userId)!.push(async () => {
        try {
          const result = await task()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      // Procesar cola si no está procesando
      if (!this.processing.has(userId)) {
        this.processQueue(userId)
      }
    })
  }

  private async processQueue(userId: string) {
    if (this.processing.has(userId)) return

    this.processing.add(userId)
    const queue = this.queues.get(userId)!

    while (queue.length > 0) {
      const task = queue.shift()!
      await task()
    }

    this.processing.delete(userId)
  }
}

// Instancia global
const messageQueue = new MessageQueue()

// Usar en processMessage
static async processMessage(...) {
  return messageQueue.add(userId, async () => {
    // Todo el código actual aquí
    ...
  })
}
```

### 2. Indicador Visual (Opcional)

```typescript
// Mostrar al usuario que está en cola
if (queue.length > 0) {
  await sendMessage(phoneNumber, "⏳ Procesando tu mensaje anterior, un momento...")
}
```

---

## 📊 Comparación

### Antes (Sin Cola):
```
Usuario envía 3 mensajes rápido:
├─ Mensaje 1: Procesa (15s) ❌
├─ Mensaje 2: Procesa (15s) ❌ Simultáneo
└─ Mensaje 3: Procesa (15s) ❌ Simultáneo

Resultado:
- 3 operaciones simultáneas
- Servidor sobrecargado
- Respuestas mezcladas
```

### Después (Con Cola):
```
Usuario envía 3 mensajes rápido:
├─ Mensaje 1: Procesa (15s) ✅
├─ Mensaje 2: En cola ⏳
└─ Mensaje 3: En cola ⏳

Mensaje 1 termina → Responde
├─ Mensaje 2: Procesa (15s) ✅
└─ Mensaje 3: En cola ⏳

Mensaje 2 termina → Responde
└─ Mensaje 3: Procesa (15s) ✅

Resultado:
- 1 operación a la vez
- Servidor estable
- Respuestas ordenadas
```

---

## 🎯 Casos de Uso

### Caso 1: Usuario Impaciente
```
Cliente: "Hola"
Cliente: "Hola?"
Cliente: "Estás ahí?"

Sin cola:
- 3 respuestas de "Hola"
- Confusión

Con cola:
- Procesa "Hola" → Responde
- Procesa "Hola?" → Responde
- Procesa "Estás ahí?" → Responde
- Ordenado y claro
```

### Caso 2: Mensajes Rápidos
```
Cliente: "Busco laptop"
Cliente: "Para diseño"
Cliente: "Económica"

Sin cola:
- 3 búsquedas simultáneas
- Resultados mezclados

Con cola:
- Procesa "Busco laptop" → Muestra opciones
- Procesa "Para diseño" → Filtra
- Procesa "Económica" → Filtra más
- Contexto correcto
```

---

## ⚙️ Configuración

### Timeout de Cola
```typescript
// Máximo tiempo en cola
const QUEUE_TIMEOUT = 60000 // 60 segundos

// Si un mensaje espera más de 60s, cancelar
if (waitTime > QUEUE_TIMEOUT) {
  throw new Error('Timeout en cola')
}
```

### Límite de Cola
```typescript
// Máximo mensajes en cola por usuario
const MAX_QUEUE_SIZE = 5

// Si la cola tiene más de 5 mensajes, rechazar
if (queue.length >= MAX_QUEUE_SIZE) {
  return "⚠️ Por favor espera a que responda tus mensajes anteriores."
}
```

---

## 🚀 Implementación Recomendada

### Fase 1: Cola Básica (30 min)
```typescript
// Sistema simple de cola por usuario
// Sin indicadores visuales
// Sin timeouts
```

### Fase 2: Mejoras (1 hora)
```typescript
// Agregar indicador "Procesando..."
// Agregar timeout de 60s
// Agregar límite de 5 mensajes
```

### Fase 3: Avanzado (2 horas)
```typescript
// Prioridad de mensajes
// Cancelación de mensajes antiguos
// Métricas de cola
```

---

## 📝 Código Completo

```typescript
// src/lib/message-queue.ts

export class MessageQueue {
  private queues: Map<string, Array<{
    task: () => Promise<any>
    timestamp: number
  }>> = new Map()
  
  private processing: Set<string> = new Set()
  private readonly MAX_QUEUE_SIZE = 5
  private readonly QUEUE_TIMEOUT = 60000

  async add<T>(userId: string, task: () => Promise<T>): Promise<T> {
    // Verificar límite de cola
    const queue = this.queues.get(userId) || []
    if (queue.length >= this.MAX_QUEUE_SIZE) {
      throw new Error('Cola llena. Espera a que se procesen tus mensajes anteriores.')
    }

    // Crear cola si no existe
    if (!this.queues.has(userId)) {
      this.queues.set(userId, [])
    }

    // Agregar tarea
    return new Promise((resolve, reject) => {
      const queueItem = {
        task: async () => {
          try {
            const result = await task()
            resolve(result)
          } catch (error) {
            reject(error)
          }
        },
        timestamp: Date.now()
      }

      this.queues.get(userId)!.push(queueItem)

      // Procesar si no está procesando
      if (!this.processing.has(userId)) {
        this.processQueue(userId)
      }
    })
  }

  private async processQueue(userId: string) {
    if (this.processing.has(userId)) return

    this.processing.add(userId)
    const queue = this.queues.get(userId)!

    while (queue.length > 0) {
      const item = queue.shift()!
      
      // Verificar timeout
      const waitTime = Date.now() - item.timestamp
      if (waitTime > this.QUEUE_TIMEOUT) {
        console.log(`[Queue] Mensaje expirado para ${userId}`)
        continue
      }

      // Procesar
      await item.task()
    }

    this.processing.delete(userId)
    this.queues.delete(userId)
  }

  getQueueSize(userId: string): number {
    return this.queues.get(userId)?.length || 0
  }

  isProcessing(userId: string): boolean {
    return this.processing.has(userId)
  }
}

// Instancia global
export const messageQueue = new MessageQueue()
```

### Uso en Orchestrator

```typescript
// En ollama-orchestrator-professional.ts
import { messageQueue } from './message-queue'

static async processMessage(
  userMessage: string,
  userId: string,
  conversationHistory: Message[] = [],
  phoneNumber?: string
): Promise<OrchestratorResponse> {
  // Agregar a la cola
  return messageQueue.add(userId, async () => {
    console.log('[Orchestrator] 🎯 Iniciando procesamiento...')
    
    // Todo el código actual aquí
    // ...
    
    return response
  })
}
```

---

## ✅ Beneficios

1. **Estabilidad**
   - Sin sobrecarga del servidor
   - Sin operaciones simultáneas

2. **Contexto Correcto**
   - Mensajes procesados en orden
   - Historial coherente

3. **Mejor Experiencia**
   - Respuestas ordenadas
   - Sin confusión

4. **Escalabilidad**
   - Soporta múltiples usuarios
   - Cada usuario tiene su cola

---

## 🎯 Recomendación

**Implementar cola básica AHORA** (30 minutos):
- Sistema simple de cola por usuario
- Una operación a la vez
- Sin indicadores visuales (por ahora)

**Resultado:**
- ✅ Sin operaciones simultáneas
- ✅ Contexto correcto
- ✅ Servidor estable

---

**¿Implementamos la cola básica ahora?** 🚀
