# Corrección: Selección de Producto Específico

## Problema Identificado

Cuando el usuario especificaba un producto concreto (ej: "el curso de piano completo"), el bot mostraba múltiples productos irrelevantes en lugar de seleccionar el específico.

### Ejemplo del problema:

```
Usuario: El curso de piano completo
Bot: Tenemos varias opciones disponibles! 💻
     📦 Horno Cafetera Sokany 3 en 1
     📦 Curso Completo de Piano
     📦 PACK COMPLETO 40 Mega Packs
```

## Solución Implementada

### 1. Sistema de Scoring Inteligente

Se implementó un algoritmo de scoring que evalúa la relevancia de cada producto:

**Criterios de puntuación:**
- Match exacto en nombre: +20 puntos
- Nombre contiene query completa: +15 puntos
- Todas las keywords en nombre: +10 puntos
- Keywords individuales en nombre: +3 puntos cada una
- Keywords en descripción: +1 punto cada una
- Keywords en categoría: +2 puntos cada una
- Penalización por palabras no relacionadas: -2 puntos

**Umbral de match exacto:**
- Si un producto tiene score >= 10, se devuelve SOLO ese producto
- Esto evita mostrar productos irrelevantes

### 2. Detección de Selección de Producto

Cuando el usuario ya vio una lista de productos y especifica uno:

```typescript
// Detecta si el usuario está seleccionando un producto de la lista
if (memory.interestedProducts.length > 0) {
  const selectedProduct = this.findProductInList(message, memory.interestedProducts);
  if (selectedProduct) {
    // Seleccionar ese producto específico
    memory.currentProduct = selectedProduct;
    memory.interestedProducts = []; // Limpiar lista
  }
}
```

### 3. Mejoras en el Algoritmo de Búsqueda

**Antes:**
```typescript
// Búsqueda simple por keywords
const products = allProducts.filter(product => {
  return keywords.some(keyword => searchText.includes(keyword));
});
```

**Después:**
```typescript
// Búsqueda con scoring y ranking
const productsWithScore = allProducts.map(product => {
  const score = this.calculateProductScore(product, cleanQuery, keywords);
  return { product, score };
}).filter(p => p.score > 0);

// Ordenar por relevancia
productsWithScore.sort((a, b) => b.score - a.score);

// Si hay match exacto, devolver solo ese
if (productsWithScore[0].score >= 10) {
  return [productsWithScore[0].product];
}
```

## Archivos Modificados

### `src/agents/search-agent.ts`

1. **Nuevo método `calculateProductScore()`**
   - Calcula relevancia de cada producto
   - Considera múltiples factores
   - Penaliza productos irrelevantes

2. **Nuevo método `findProductInList()`**
   - Busca producto específico en lista vista
   - Usa scoring para encontrar mejor match
   - Requiere score mínimo de 2

3. **Método `searchProducts()` mejorado**
   - Usa scoring en lugar de filtrado simple
   - Detecta matches exactos
   - Devuelve solo el mejor si score >= 10

4. **Método `handleLocally()` mejorado**
   - Detecta cuando usuario selecciona de lista
   - Maneja selección específica
   - Limpia lista después de selección

## Flujo Corregido

### Escenario 1: Búsqueda inicial
```
Usuario: "Me interesa un curso de piano"
Bot: Busca productos con "curso" y "piano"
     Encuentra: Curso Completo de Piano (score: 15)
     Encuentra: PACK COMPLETO 40 Mega Packs (score: 3)
     
     Como el mejor tiene score >= 10, devuelve SOLO ese:
     "Encontré esto para ti 😊"
     [Muestra solo Curso Completo de Piano]
```

### Escenario 2: Selección específica
```
Usuario: "El curso de piano completo"
Bot: Detecta que hay productos en memoria
     Busca "curso piano completo" en la lista
     Encuentra match con score alto
     Selecciona ese producto específico
     "Perfecto! Te cuento sobre Curso Completo de Piano 😊"
```

### Escenario 3: Método de pago
```
Usuario: "Me envías el método de pago por nequi?"
Bot: Detecta intención de pago
     Usa producto actual (Curso Completo de Piano)
     Detecta método preferido (nequi)
     Genera link de pago para ese producto y método
```

## Pruebas

### Ejecutar test:
```bash
npx tsx scripts/test-seleccion-producto-especifico.ts
```

### Casos de prueba:
1. ✅ Búsqueda inicial de "curso de piano"
2. ✅ Selección específica "el curso de piano completo"
3. ✅ Solicitud de método de pago con producto correcto

## Beneficios

1. **Precisión mejorada**: El bot selecciona el producto correcto
2. **Menos confusión**: No muestra productos irrelevantes
3. **Flujo natural**: El usuario puede especificar sin repetir
4. **Contexto mantenido**: Recuerda productos vistos
5. **Experiencia mejorada**: Respuestas más relevantes

## Próximos Pasos

- [ ] Probar con más productos
- [ ] Ajustar umbrales de scoring si es necesario
- [ ] Agregar sinónimos y variaciones
- [ ] Implementar búsqueda fuzzy para typos
- [ ] Agregar logging de scoring para análisis

## Notas Técnicas

- Compatible con SQLite y PostgreSQL
- No requiere IA externa para búsqueda básica
- Usa scoring en memoria (rápido)
- Mantiene contexto conversacional
- Limpia memoria después de selección
