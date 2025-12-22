# 💰 Optimización de Tokens - Groq API

## Estrategias para Reducir Consumo

### 1. 🎯 Usar Modelos Más Pequeños

Groq ofrece varios modelos con diferentes tamaños:

```typescript
// ACTUAL (Más tokens)
model: "llama-3.1-70b-versatile"  // Modelo grande

// OPTIMIZADO (Menos tokens)
model: "llama-3.1-8b-instant"     // Modelo pequeño y rápido
model: "mixtral-8x7b-32768"       // Balance entre calidad y tokens
```

**Ventajas:**
- ✅ Hasta 8x menos tokens
- ✅ Respuestas más rápidas
- ✅ Mismo nivel de calidad para tareas simples

### 2. 📏 Limitar Longitud de Respuestas

```typescript
// ACTUAL
maxTokens: 500  // Respuestas largas

// OPTIMIZADO
maxTokens: 150  // Respuestas concisas
```

**Configuración recomendada:**
- Búsqueda de productos: 100 tokens
- Información de producto: 150 tokens
- Preguntas generales: 200 tokens
- Conversación compleja: 300 tokens

### 3. 🧠 Sistema Híbrido Inteligente

**Usar IA solo cuando sea necesario:**

```typescript
// ❌ ANTES: Siempre usa IA
Todas las respuestas → Groq API

// ✅ DESPUÉS: Híbrido inteligente
Respuestas simples → Bot local (0 tokens)
Respuestas complejas → Groq API (tokens)
```

**Ejemplos:**

| Mensaje | Sistema | Tokens |
|---------|---------|--------|
| "Hola" | Local | 0 |
| "Cuánto cuesta X" | Local | 0 |
| "Muéstrame fotos" | Local | 0 |
| "Compara laptop vs desktop" | Groq | ~150 |
| "Qué me recomiendas para diseño" | Groq | ~200 |

### 4. 📝 Prompts Más Cortos

```typescript
// ❌ ANTES: Prompt largo (muchos tokens)
const prompt = `
Eres un asistente de ventas experto en tecnología...
[500 palabras de contexto]
Productos disponibles:
[Lista completa de 50 productos]
Historial de conversación:
[Últimos 20 mensajes]
`;

// ✅ DESPUÉS: Prompt optimizado (pocos tokens)
const prompt = `
Asistente de ventas. Responde conciso.
Productos relevantes: [Solo 3-5 productos filtrados]
Último mensaje: [Solo el más reciente]
`;
```

### 5. 🎯 Filtrado Inteligente de Contexto

**Solo enviar información relevante:**

```typescript
// ❌ Enviar todo el catálogo (1000+ tokens)
const productos = await getAllProducts();

// ✅ Enviar solo productos relevantes (50-100 tokens)
const productos = await searchRelevantProducts(query);
```

## 🔧 Implementación Práctica

### Opción 1: Cambiar a Modelo Pequeño

```typescript
// src/lib/ai-multi-provider.ts
const GROQ_MODELS = {
  fast: 'llama-3.1-8b-instant',      // ⚡ Rápido y económico
  balanced: 'mixtral-8x7b-32768',    // ⚖️ Balance
  powerful: 'llama-3.1-70b-versatile' // 💪 Potente pero costoso
};

// Usar modelo rápido por defecto
model: GROQ_MODELS.fast
```

### Opción 2: Reducir maxTokens

```typescript
// src/agents/base-agent.ts
const AI_CONFIG = {
  search: { maxTokens: 100 },      // Búsquedas simples
  product: { maxTokens: 150 },     // Info de producto
  general: { maxTokens: 200 },     // Preguntas generales
  complex: { maxTokens: 300 }      // Análisis complejo
};
```

### Opción 3: Sistema Híbrido Mejorado

```typescript
// Decidir cuándo usar IA
function shouldUseAI(message: string, context: any): boolean {
  // Respuestas locales (0 tokens)
  if (isGreeting(message)) return false;
  if (isPriceQuery(message)) return false;
  if (isPhotoRequest(message)) return false;
  
  // Usar IA solo para casos complejos
  if (needsComparison(message)) return true;
  if (needsRecommendation(message)) return true;
  
  return false;
}
```

## 📊 Comparación de Consumo

### Escenario: 100 conversaciones/día

| Estrategia | Tokens/día | Costo estimado |
|------------|------------|----------------|
| Actual (70B, 500 tokens) | 50,000 | $0.50 |
| Modelo 8B (500 tokens) | 50,000 | $0.10 |
| Modelo 8B (150 tokens) | 15,000 | $0.03 |
| Híbrido (50% local) | 7,500 | $0.015 |

**Ahorro potencial: 97%** 💰

## 🎯 Configuración Recomendada

### Para Máximo Ahorro:
```typescript
{
  model: "llama-3.1-8b-instant",
  maxTokens: 150,
  temperature: 0.7,
  useHybrid: true,  // 50% respuestas locales
  cacheProducts: true
}
```

### Para Balance Calidad/Costo:
```typescript
{
  model: "mixtral-8x7b-32768",
  maxTokens: 200,
  temperature: 0.7,
  useHybrid: true,
  cacheProducts: true
}
```

### Para Máxima Calidad:
```typescript
{
  model: "llama-3.1-70b-versatile",
  maxTokens: 300,
  temperature: 0.8,
  useHybrid: false,
  cacheProducts: true
}
```

## 🔧 Scripts de Configuración

### Cambiar a Modelo Económico
```bash
npx tsx scripts/configurar-modelo-economico.ts
```

### Reducir maxTokens
```bash
npx tsx scripts/optimizar-tokens.ts
```

### Activar Sistema Híbrido
```bash
npx tsx scripts/activar-hibrido-optimizado.ts
```

## 💡 Mejores Prácticas

1. **Cache de Productos**: No enviar catálogo completo cada vez
2. **Respuestas Cortas**: Configurar maxTokens según tipo de consulta
3. **Modelo Adecuado**: Usar 8B para tareas simples, 70B solo cuando sea necesario
4. **Sistema Híbrido**: Responder localmente cuando sea posible
5. **Filtrado Inteligente**: Solo enviar productos relevantes a la IA

## 📈 Monitoreo de Uso

```typescript
// Agregar logging de tokens
console.log(`🔢 Tokens usados: ${response.usage.total_tokens}`);
console.log(`💰 Costo estimado: $${(response.usage.total_tokens / 1000000) * 0.10}`);
```

## ✅ Recomendación Final

**Para tu caso (Smart Sales Bot):**

```typescript
// Configuración óptima
{
  model: "llama-3.1-8b-instant",  // Rápido y económico
  maxTokens: 150,                  // Respuestas concisas
  temperature: 0.7,                // Balance creatividad/precisión
  useHybrid: true,                 // 60% respuestas locales
  
  // Reglas híbridas
  localResponses: [
    'greetings',      // Saludos
    'price_queries',  // Precios
    'photo_requests', // Fotos
    'simple_info'     // Info simple
  ],
  
  aiResponses: [
    'comparisons',    // Comparaciones
    'recommendations',// Recomendaciones
    'complex_queries' // Consultas complejas
  ]
}
```

**Resultado esperado:**
- ✅ 80% menos tokens
- ✅ Respuestas igual de buenas
- ✅ Más rápido
- ✅ Mucho más económico

---

**Fecha:** 22 de noviembre de 2025
**Ahorro estimado:** 80-97% en tokens
