# Arreglo: Contexto en Búsqueda de Respuestas Entrenadas

## Problema Original
El bot respondía incorrectamente cuando el usuario pedía más información sobre un producto anterior. Por ejemplo:
- Usuario: "Tienes curso de piano?" → Bot responde sobre piano ✅
- Usuario: "Me das más información" → Bot responde sobre descuentos ❌

La respuesta no tenía nada que ver con la pregunta anterior.

## Causa Raíz
1. **No detectaba "más información" como intención especial** - Trataba "Me das más información" como una pregunta genérica
2. **No usaba el contexto en la búsqueda de respuestas** - El algoritmo de similitud no consideraba el producto anterior
3. **No guardaba el producto automáticamente** - Sin productos en BD, no había contexto para futuras preguntas

## Soluciones Implementadas

### 1. Detección Prioritaria de "Más Información"
**Archivo**: `src/lib/local-ai-only-service.ts`

Cambio en `processMessage()`:
```typescript
// ANTES: Detectaba intención primero, luego verificaba si pedía más info
let intent = this.detectIntent(userMessage, userId, from)
let lastProduct = null
if (ConversationMemoryService.isAskingForMoreInfo(...)) {
  lastProduct = ConversationMemoryService.getLastProduct(...)
  intent = 'product_info'
}

// DESPUÉS: Verifica si pide más info PRIMERO
let lastProduct: any = null
let intent = 'general'

if (ConversationMemoryService.isAskingForMoreInfo(...)) {
  lastProduct = ConversationMemoryService.getLastProduct(...)
  if (lastProduct && lastProduct.name) {
    intent = 'product_info'
  }
}

if (intent === 'general') {
  intent = this.detectIntent(userMessage, userId, from)
}
```

**Beneficio**: Ahora detecta correctamente cuando el usuario pide más información sobre un producto anterior.

### 2. Bonus de Contexto en Búsqueda de Respuestas
**Archivo**: `src/lib/local-ai-only-service.ts`

Mejorado `findSimilarTrainedResponse()`:
```typescript
// Si hay contexto y la respuesta menciona el producto, aumentar similitud
if (contextualKeywords && response.toLowerCase().includes(contextualKeywords)) {
  similarity += 0.4 // Bonus significativo por contexto
}

// Si la intención coincide, aumentar similitud
if (trainedIntent === intent) {
  similarity += 0.15
}
```

**Beneficio**: Las respuestas que mencionan el producto anterior reciben un bonus de 40%, haciendo que sean más relevantes.

### 3. Extracción Automática de Productos
**Archivo**: `src/lib/local-ai-only-service.ts`

Nueva función `extractProductFromResponse()`:
```typescript
private static extractProductFromResponse(response: string, intent: string): any | null {
  const productKeywords: { [key: string]: { name: string; price: number } } = {
    'piano': { name: 'Curso de Piano', price: 65000 },
    'laptop': { name: 'Laptop', price: 0 },
    'moto': { name: 'Motocicleta', price: 0 },
    // ... más productos
  }

  for (const [keyword, product] of Object.entries(productKeywords)) {
    if (lowerResponse.includes(keyword)) {
      return {
        id: keyword.replace(/\s+/g, '-'),
        name: product.name,
        description: `Producto mencionado en respuesta entrenada`,
        price: product.price
      }
    }
  }
  return null
}
```

**Beneficio**: Cuando el bot responde sobre un producto, lo extrae automáticamente y lo guarda en memoria para futuras preguntas.

### 4. Guardado Mejorado en Memoria
**Archivo**: `src/lib/local-ai-only-service.ts`

En `processMessage()`:
```typescript
// Guardar producto si hay
if (relevantProducts.length > 0) {
  ConversationMemoryService.setLastProduct(...)
} else if (lastProduct) {
  // Si no hay productos relevantes pero hay uno en contexto, mantenerlo
  ConversationMemoryService.setLastProduct(userId, from, lastProduct)
} else {
  // Intentar extraer producto de la respuesta entrenada
  const extractedProduct = this.extractProductFromResponse(response, intent)
  if (extractedProduct) {
    ConversationMemoryService.setLastProduct(userId, from, extractedProduct)
  }
}
```

**Beneficio**: El producto se guarda automáticamente incluso si no hay productos en BD.

## Resultados

### Test: Flujo Real de Contexto
```
✅ Mensaje 1: "Tienes curso de piano?"
   - Respuesta: Sobre piano (95% similitud)
   - Producto guardado: Curso de Piano

✅ Mensaje 2: "Me das más información"
   - Respuesta: Sobre detalles del curso (55% + 40% bonus = 95% efectivo)
   - Contexto: Usa producto anterior
   - CORRECTO: Respuesta sobre piano

✅ Mensaje 3: "¿Cuál es el precio?"
   - Respuesta: Sobre precio del curso (93% + 40% bonus = 133% → 100%)
   - Contexto: Usa producto anterior
   - CORRECTO: Respuesta sobre precio del curso
```

## Cambios de Código

### Archivos Modificados
1. `src/lib/local-ai-only-service.ts`
   - Reorganizado flujo de detección de intención
   - Mejorado algoritmo de similitud con bonus de contexto
   - Agregada función `extractProductFromResponse()`
   - Mejorado guardado de productos en memoria

### Archivos de Test Creados
1. `scripts/test-contexto-mejorado.ts` - Test con guardado manual
2. `scripts/test-flujo-real-contexto.ts` - Test con flujo real

## Cómo Funciona Ahora

1. **Usuario pregunta por un producto**: "Tienes curso de piano?"
   - Bot busca respuesta entrenada (95% similitud)
   - Bot extrae "Curso de Piano" de la respuesta
   - Bot guarda en memoria: `lastProduct = { name: 'Curso de Piano', ... }`

2. **Usuario pide más información**: "Me das más información"
   - Bot detecta que pide más info (palabra clave: "más")
   - Bot recupera `lastProduct` de memoria
   - Bot busca respuestas que mencionen "Curso de Piano"
   - Bot aplica bonus de contexto (+40%)
   - Bot encuentra respuesta relevante (55% + 40% = 95% efectivo)

3. **Usuario hace otra pregunta sobre el mismo producto**: "¿Cuál es el precio?"
   - Bot detecta que pide más info (palabra clave: "precio")
   - Bot recupera `lastProduct` de memoria
   - Bot busca respuestas sobre precio del "Curso de Piano"
   - Bot aplica bonus de contexto (+40%)
   - Bot encuentra respuesta relevante

## Ventajas

✅ **Contexto persistente**: El bot recuerda el producto anterior
✅ **Respuestas relevantes**: Usa el contexto para buscar respuestas apropiadas
✅ **Extracción automática**: No necesita BD de productos para funcionar
✅ **Bonus de similitud**: Las respuestas contextuales son más relevantes
✅ **Flujo natural**: La conversación fluye naturalmente sin saltos de tema

## Próximos Pasos (Opcional)

1. Agregar más palabras clave de productos en `extractProductFromResponse()`
2. Mejorar el algoritmo de similitud con TF-IDF en lugar de Jaccard
3. Agregar embeddings para búsqueda semántica más avanzada
4. Guardar contexto en BD para conversaciones de múltiples días
