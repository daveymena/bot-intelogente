# 🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA DE AGENTES

## 🎯 Problema Identificado

**Flujo del Cliente:**
1. Cliente: "Estoy interesado en el curso de diseño gráfico"
2. Bot: Muestra "Mega Pack 07: Emprendimiento" y "Mega Pack 01: Diseño Gráfico"
3. Cliente: "más información" (refiriéndose al diseño gráfico)
4. Bot: Muestra "Auriculares" y "Piano" ❌ **ERROR**

**Causa Raíz:**
El bot NO mantiene el contexto del producto cuando el cliente pide "más información". Hace una nueva búsqueda en lugar de usar el producto que ya estaba discutiendo.

## 📊 Análisis de Componentes

### 1. Orchestrator (src/agents/orchestrator.ts)
**Problema:** No detecta correctamente cuando el cliente pide información sobre un producto ya mostrado.

**Intenciones que debería detectar:**
- "más información" → `product_info` (no `search_product`)
- "cuéntame más" → `product_info`
- "qué incluye" → `product_info`
- "detalles" → `product_info`

### 2. SearchAgent (src/agents/search-agent.ts)
**Problema:** No verifica si ya hay un producto en contexto antes de buscar.

**Debería hacer:**
```typescript
// Si ya hay productos interesados y el mensaje es vago
if (memory.interestedProducts.length > 0 && isVagueQuery(message)) {
  // No buscar de nuevo, pasar al ProductAgent
  return { nextAgent: 'product' }
}
```

### 3. ProductAgent (src/agents/product-agent.ts)
**Problema:** No maneja solicitudes de "más información" sobre productos ya mostrados.

**Debería hacer:**
```typescript
// Si hay productos interesados y el mensaje pide información
if (memory.interestedProducts.length > 0) {
  // Dar información del primer producto de la lista
  return showProductDetails(memory.interestedProducts[0])
}
```

### 4. Memoria Compartida (SharedMemory)
**Estado Actual:** Se pierde el contexto entre mensajes.

**Debería mantener:**
- `interestedProducts[]` - Lista de productos mostrados
- `currentProduct` - Producto actual en discusión
- `lastQuery` - Última búsqueda realizada

## 🔧 Soluciones Necesarias

### Solución 1: Mejorar Detección de Intenciones

**Archivo:** `src/agents/utils/intent-detector.ts`

Agregar detección de:
- Solicitudes de información: "más información", "cuéntame más", "detalles"
- Confirmaciones: "sí", "ok", "dale", "ese"
- Selecciones: "el primero", "el segundo", "el de diseño"

### Solución 2: SearchAgent con Contexto

**Archivo:** `src/agents/search-agent.ts`

```typescript
async execute(message: string, memory: SharedMemory) {
  // NUEVO: Si hay productos en contexto y el mensaje es vago
  if (memory.interestedProducts.length > 0) {
    const isVague = this.isVagueQuery(message);
    const isSelection = this.isProductSelection(message);
    
    if (isVague || isSelection) {
      // No buscar de nuevo, dejar que ProductAgent maneje
      return {
        text: '',
        nextAgent: 'product',
        confidence: 0.9
      };
    }
  }
  
  // Continuar con búsqueda normal...
}
```

### Solución 3: ProductAgent Inteligente

**Archivo:** `src/agents/product-agent.ts`

```typescript
async execute(message: string, memory: SharedMemory) {
  // NUEVO: Si hay productos interesados
  if (memory.interestedProducts.length > 0) {
    // Detectar si el cliente está seleccionando uno
    const selected = this.detectSelection(message, memory.interestedProducts);
    
    if (selected) {
      memory.currentProduct = selected;
      memory.interestedProducts = [];
      return this.showFullProductInfo(selected);
    }
    
    // Si pide más información sin especificar, mostrar el primero
    if (this.isInfoRequest(message)) {
      const product = memory.interestedProducts[0];
      memory.currentProduct = product;
      return this.showFullProductInfo(product);
    }
  }
  
  // Continuar con lógica normal...
}
```

### Solución 4: Orchestrator Mejorado

**Archivo:** `src/agents/orchestrator.ts`

```typescript
private detectIntent(message: string, memory: SharedMemory) {
  const clean = message.toLowerCase();
  
  // NUEVO: Si hay productos en contexto
  if (memory.interestedProducts.length > 0 || memory.currentProduct) {
    // Detectar solicitud de información
    if (clean.match(/más|mas|info|información|detalles|cuéntame|cuentame/)) {
      return { intent: 'product_info', confidence: '90%' };
    }
    
    // Detectar selección
    if (clean.match(/primero|segundo|ese|esa|este|esta|si|sí|ok|dale/)) {
      return { intent: 'product_selection', confidence: '85%' };
    }
  }
  
  // Continuar con detección normal...
}
```

## 🧪 Test de Validación

### Escenario 1: Búsqueda y Más Información
```
Cliente: "curso de diseño gráfico"
Bot: Muestra 2 productos (Emprendimiento y Diseño Gráfico)
Cliente: "más información"
Bot: ✅ Muestra detalles del primer producto (Emprendimiento)
Cliente: "no, el de diseño gráfico"
Bot: ✅ Muestra detalles de Diseño Gráfico
```

### Escenario 2: Selección Directa
```
Cliente: "curso de diseño gráfico"
Bot: Muestra 2 productos
Cliente: "el segundo"
Bot: ✅ Muestra detalles de Diseño Gráfico
```

### Escenario 3: Confirmación Implícita
```
Cliente: "curso de diseño gráfico"
Bot: Muestra 2 productos
Cliente: "sí, ese"
Bot: ✅ Muestra detalles del primer producto
```

## 📝 Plan de Implementación

### Fase 1: Detección de Intenciones (CRÍTICO)
1. Actualizar `intent-detector.ts`
2. Agregar patrones de "más información"
3. Agregar patrones de selección

### Fase 2: SearchAgent con Contexto
1. Agregar método `isVagueQuery()`
2. Agregar método `isProductSelection()`
3. Verificar contexto antes de buscar

### Fase 3: ProductAgent Inteligente
1. Agregar método `detectSelection()`
2. Agregar método `isInfoRequest()`
3. Manejar productos en contexto

### Fase 4: Orchestrator Mejorado
1. Priorizar contexto sobre nueva búsqueda
2. Detectar intenciones contextuales
3. Enrutar correctamente según contexto

## ✅ Criterios de Éxito

1. ✅ Cliente pide "más información" → Bot usa producto en contexto
2. ✅ Cliente dice "el segundo" → Bot selecciona el segundo producto
3. ✅ Cliente dice "sí" → Bot confirma el primer producto
4. ✅ Cliente hace nueva búsqueda → Bot limpia contexto y busca
5. ✅ Bot mantiene contexto durante toda la conversación

## 🚀 Próximos Pasos

1. Implementar detección de intenciones contextuales
2. Actualizar SearchAgent para verificar contexto
3. Mejorar ProductAgent para manejar selecciones
4. Actualizar Orchestrator para priorizar contexto
5. Crear tests de validación completos

---

**Estado Actual:** 🔴 Crítico - Bot pierde contexto
**Estado Objetivo:** 🟢 Óptimo - Bot mantiene contexto perfecto
