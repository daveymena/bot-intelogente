# 🧠 SISTEMA DE MEMORIA DE CONTEXTO

## 🎯 Problema Resuelto

Los clientes asumen que el bot mantiene el contexto de la conversación, por lo que hacen preguntas sin mencionar el producto:

```
Cliente: "Me interesa la moto"
Bot: ✅ "La Moto Bajaj Pulsar NS 160..."

Cliente: "Cuánto cuesta?"  ← NO menciona "moto"
Bot: ❌ "No tengo ese producto..." (perdió contexto)

Cliente: "Tiene garantía?"  ← NO menciona "moto"
Bot: ❌ Responde sobre producto incorrecto
```

## ✅ Solución: Sistema de Dos Memorias

### 1. Memoria de Corto Plazo (RAM)
- Guarda el último producto mencionado por cada conversación
- Clave única: `userId:customerPhone`
- Duración: 10 minutos
- Rápido acceso (no consulta BD)

### 2. Memoria de Búsqueda (Historial)
- Fallback si no hay memoria activa
- Busca en últimos 6 mensajes del usuario
- Guarda resultado en memoria para próximas preguntas

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│  Cliente: "Cuánto cuesta?"                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  1. Buscar producto en mensaje actual                   │
│     ❌ No encontrado                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  2. Buscar en MEMORIA DE CONTEXTO                       │
│     ✅ Encontrado: "Moto Bajaj Pulsar NS 160"          │
│     💾 Recuperado de RAM (rápido)                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  3. Generar respuesta con producto de memoria           │
│     "La moto Bajaj Pulsar NS 160 cuesta..."            │
└─────────────────────────────────────────────────────────┘
```

## 📁 Archivos Creados

### `src/lib/conversation-context-service.ts`
Servicio de memoria de contexto con:
- `setProductContext()`: Guardar producto en memoria
- `getProductContext()`: Recuperar producto de memoria
- `incrementMessageCount()`: Contar mensajes sobre el mismo producto
- `clearContext()`: Limpiar memoria
- `cleanExpiredContexts()`: Limpieza automática cada 5 minutos

### Integración en `src/lib/ai-service.ts`
```typescript
// Crear clave única para conversación
const conversationKey = `${userId}:${customerPhone}`

// Si no encuentra producto en mensaje actual
if (!product) {
  // ESTRATEGIA 1: Buscar en memoria (rápido)
  const context = ConversationContextService.getProductContext(conversationKey)
  if (context) {
    product = await db.product.findUnique({ where: { id: context.lastProductId } })
  }
  
  // ESTRATEGIA 2: Buscar en historial (fallback)
  if (!product && conversationHistory.length > 0) {
    // Buscar en últimos mensajes...
  }
}

// Si encontró producto, guardarlo en memoria
if (product) {
  ConversationContextService.setProductContext(conversationKey, product.id, product.name)
}
```

## 🧪 Pruebas

### Prueba Básica
```bash
npx tsx scripts/test-contexto-conversacion.ts
```

Verifica:
- ✅ Pregunta inicial sobre moto
- ✅ "Que precio tiene" → mantiene contexto
- ✅ "Tienes sus papeles al día?" → mantiene contexto

### Prueba Avanzada
```bash
npx tsx scripts/test-memoria-contexto.ts
```

Verifica:
- ✅ Preguntas sin palabra clave ("Cuánto cuesta?")
- ✅ Preguntas genéricas ("Está disponible?")
- ✅ Cambio de producto ("Y qué laptops tienes?")
- ✅ Mantiene nuevo contexto después del cambio

## 📊 Características

### ⏰ Expiración Automática
- Contexto expira después de 10 minutos de inactividad
- Limpieza automática cada 5 minutos
- Evita memoria infinita

### 📈 Contador de Mensajes
- Cuenta cuántos mensajes se han hecho sobre el mismo producto
- Útil para analytics y entender engagement

### 🔄 Actualización Automática
- Cada mensaje renueva el tiempo de expiración
- Si menciona nuevo producto, actualiza la memoria

### 🗑️ Limpieza Inteligente
- Elimina contextos expirados automáticamente
- No requiere intervención manual

## 🎯 Casos de Uso Resueltos

### Caso 1: Preguntas de Seguimiento
```
Cliente: "Me interesa la moto"
Bot: [Guarda en memoria: Moto Bajaj]

Cliente: "Cuánto cuesta?"
Bot: [Recupera de memoria: Moto Bajaj]
     "La moto cuesta $6.000.000 COP"
```

### Caso 2: Múltiples Preguntas
```
Cliente: "Info sobre la moto"
Bot: [Guarda: Moto Bajaj]

Cliente: "Precio?"
Bot: [Memoria: Moto Bajaj] "$6.000.000"

Cliente: "Tiene papeles?"
Bot: [Memoria: Moto Bajaj] "Sí, todos al día"

Cliente: "Garantía?"
Bot: [Memoria: Moto Bajaj] "3 meses de garantía"
```

### Caso 3: Cambio de Producto
```
Cliente: "Info sobre la moto"
Bot: [Guarda: Moto Bajaj]

Cliente: "Y laptops?"
Bot: [Actualiza memoria: ASUS VivoBook]

Cliente: "Precio?"
Bot: [Memoria: ASUS VivoBook] "$1.200.000"
```

## 📝 Logs Mejorados

```
[Context] 💾 Guardado en memoria: Moto Bajaj Pulsar NS 160 para user123:6988129931330@lid
[AI] 💾 Producto recuperado de memoria: Moto Bajaj Pulsar NS 160
[Context] ✅ Contexto encontrado: Moto Bajaj Pulsar NS 160 (3 mensajes)
[Context] 🧹 Limpiados 2 contextos expirados
```

## 🔍 Estadísticas

Obtener estadísticas de contextos activos:

```typescript
const stats = ConversationContextService.getStats()
console.log(`Total: ${stats.total}`)
stats.contexts.forEach(ctx => {
  console.log(`${ctx.key}: ${ctx.product} (${ctx.messages} mensajes)`)
})
```

## ⚙️ Configuración

### Tiempo de Expiración
Modificar en `conversation-context-service.ts`:
```typescript
private static CONTEXT_TIMEOUT = 10 * 60 * 1000 // 10 minutos
```

### Frecuencia de Limpieza
Modificar al final del archivo:
```typescript
setInterval(() => {
  ConversationContextService.cleanExpiredContexts()
}, 5 * 60 * 1000) // 5 minutos
```

## 🚀 Ventajas

1. **Rápido**: Recupera de RAM, no consulta BD
2. **Inteligente**: Detecta cambios de producto automáticamente
3. **Eficiente**: Limpieza automática de memoria
4. **Escalable**: Soporta múltiples conversaciones simultáneas
5. **Natural**: El cliente no necesita repetir el producto

## 📊 Impacto

### Antes
- ❌ Cliente debe repetir producto en cada pregunta
- ❌ Bot pierde contexto fácilmente
- ❌ Respuestas incorrectas frecuentes
- ❌ Experiencia frustrante

### Después
- ✅ Cliente hace preguntas naturales
- ✅ Bot mantiene contexto automáticamente
- ✅ Respuestas precisas y contextuales
- ✅ Experiencia fluida y natural

## ✅ Estado

- [x] Servicio de memoria de contexto creado
- [x] Integración en AI Service
- [x] Expiración automática
- [x] Limpieza automática
- [x] Contador de mensajes
- [x] Estadísticas
- [x] Scripts de prueba
- [x] Documentación completa

## 🎉 Resultado

El bot ahora mantiene el contexto de la conversación como lo haría un humano, permitiendo que los clientes hagan preguntas naturales sin repetir el producto en cada mensaje.
