# 🐢 ¿Por qué Ollama es más lento en el sistema real?

## 📊 Comparación de Velocidades

| Escenario | Tiempo | Descripción |
|-----------|--------|-------------|
| **Test Simple** | 2-3s | Llamada directa a Ollama |
| **Sistema Real** | 5-15s+ | Proceso completo del bot |

## 🔍 Análisis del Flujo Real

### Test Simple (2-3s)
```
1. Enviar prompt a Ollama → 2-3s
✅ TOTAL: 2-3s
```

### Sistema Real (5-15s+)
```
1. Recibir mensaje de WhatsApp → 100-500ms
2. Guardar mensaje en BD (Prisma) → 200-500ms
3. Cargar historial de conversación → 100-300ms
4. Búsqueda local en BD (50 productos) → 300-800ms
   ├─ Query con OR conditions
   ├─ Búsqueda en name, description, tags
   └─ Mode insensitive (case-insensitive)
5. Si no encuentra: Cargar TODOS los productos → 500-1000ms
   └─ Hasta 50 productos con todos sus campos
6. Llamar a Ollama con prompt LARGO → 5-10s
   ├─ Prompt incluye lista de 50 productos
   ├─ Instrucciones detalladas
   └─ Formato JSON esperado
7. Parsear respuesta JSON → 50-100ms
8. Buscar producto en BD por ID → 100-200ms
9. Generar respuesta personalizada → 200-500ms
10. Enviar mensaje por WhatsApp → 200-500ms
11. Guardar respuesta en BD → 200-500ms
12. Actualizar historial en memoria → 50-100ms

✅ TOTAL: 7-15s (o más)
```

## 🎯 Factores que Aumentan la Lentitud

### 1. **Consultas a Base de Datos** (1-2s total)
```typescript
// Primera búsqueda local
const localResults = await prisma.product.findMany({
  where: {
    status: 'AVAILABLE',
    OR: [
      { name: { contains: searchTerms, mode: 'insensitive' } },
      { description: { contains: searchTerms, mode: 'insensitive' } },
      { tags: { contains: searchTerms, mode: 'insensitive' } }
    ]
  },
  take: 10
});

// Si no encuentra, carga TODOS los productos
const allProducts = await prisma.product.findMany({
  where: { status: 'AVAILABLE' },
  take: 50
});
```

**Problema:** Dos consultas a BD, la segunda carga 50 productos completos.

### 2. **Prompt Muy Largo para Ollama** (5-10s)
```typescript
const prompt = `Analiza este mensaje: "${userMessage}"

Productos disponibles:
1. Laptop HP 15-dy2795wm - Intel Core i5 - $2,500,000 - Laptop potente...
2. Laptop Dell Inspiron 15 - AMD Ryzen 5 - $2,200,000 - Excelente para...
3. Laptop Lenovo IdeaPad 3 - Intel Core i3 - $1,800,000 - Económica...
... (hasta 50 productos)

Responde con JSON...`;
```

**Problema:** Ollama tarda más con prompts largos (50 productos = mucho texto).

### 3. **Procesamiento Secuencial** (no paralelo)
```
BD → Ollama → BD → WhatsApp → BD
```

**Problema:** Cada paso espera al anterior, no hay paralelización.

### 4. **Historial de Conversación**
```typescript
// Cargar y procesar historial
let history = this.conversationHistories.get(from) || []
const previousProducts = history
  .filter((msg: any) => msg.role === 'assistant')
  .map((msg: any) => {
    const match = msg.content.match(/\*([^*]+)\*/);
    return match ? match[1] : null;
  })
  .filter(Boolean);
```

**Problema:** Procesamiento adicional de regex en cada mensaje.

## 🚀 Optimizaciones Posibles

### 1. **Reducir Productos Enviados a Ollama**
```typescript
// Antes: 50 productos
take: 50

// Después: 20 productos
take: 20
```
**Ganancia:** -2s en respuesta de Ollama

### 2. **Caché de Productos en Memoria**
```typescript
// Cargar productos una vez al inicio
private static productsCache: Product[] = []

// Actualizar cada 5 minutos
setInterval(() => {
  this.productsCache = await prisma.product.findMany(...)
}, 5 * 60 * 1000)
```
**Ganancia:** -1s en consultas a BD

### 3. **Usar Modelo Más Pequeño**
```env
# Antes
OLLAMA_MODEL=llama3.2:3b

# Después
OLLAMA_MODEL=llama3.2:1b
```
**Ganancia:** -1-2s en respuesta de Ollama

### 4. **Reducir Tokens Máximos**
```env
# Antes
OLLAMA_MAX_TOKENS=600

# Después
OLLAMA_MAX_TOKENS=300
```
**Ganancia:** -0.5-1s en respuesta de Ollama

### 5. **Paralelizar Operaciones**
```typescript
// Antes (secuencial)
const products = await getProducts()
const response = await callOllama(products)
await saveToDb(response)

// Después (paralelo donde sea posible)
const [products, history] = await Promise.all([
  getProducts(),
  getHistory()
])
```
**Ganancia:** -0.5-1s

### 6. **Timeout Más Corto**
```env
# Antes
OLLAMA_TIMEOUT=15000

# Después
OLLAMA_TIMEOUT=8000
```
**Ganancia:** Falla más rápido si Ollama está lento

### 7. **Habilitar Fallback Inteligente**
```env
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=ollama,groq

# Si Ollama tarda > 5s, usar Groq
OLLAMA_TIMEOUT=5000
```
**Ganancia:** Respuestas rápidas cuando Ollama está lento

## 📈 Velocidades Esperadas Después de Optimizar

| Optimización | Tiempo Estimado |
|--------------|-----------------|
| Sin optimizar | 7-15s |
| Reducir productos (50→20) | 5-10s |
| + Modelo pequeño (3b→1b) | 4-8s |
| + Reducir tokens (600→300) | 3-6s |
| + Caché de productos | 2-5s |
| + Paralelización | 2-4s |

## 🎯 Recomendación

**Para producción:**
```env
# Ollama optimizado
OLLAMA_MODEL=llama3.2:1b
OLLAMA_MAX_TOKENS=300
OLLAMA_TIMEOUT=5000

# Fallback a Groq si Ollama falla o es lento
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=ollama,groq
GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
```

**Código:**
```typescript
// Reducir productos enviados a Ollama
take: 20 // en lugar de 50

// Caché de productos
private static productsCache: Product[] = []
```

## 💡 Conclusión

El test es más rápido porque:
1. ✅ No consulta BD
2. ✅ Prompt corto y simple
3. ✅ No procesa historial
4. ✅ No guarda resultados
5. ✅ No envía por WhatsApp

El sistema real es más lento porque:
1. ❌ 2-3 consultas a BD
2. ❌ Prompt largo (50 productos)
3. ❌ Procesa historial
4. ❌ Guarda en BD
5. ❌ Envía por WhatsApp
6. ❌ Todo es secuencial

**Solución:** Aplicar las optimizaciones sugeridas para reducir de 7-15s a 2-4s.
