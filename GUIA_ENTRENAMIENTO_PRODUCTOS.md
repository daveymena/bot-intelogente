# 🎓 Guía de Entrenamiento con Productos

## 🎯 ¿Qué hace?

Este sistema **genera automáticamente ejemplos de entrenamiento** para cada producto en tu base de datos, enseñándole al bot cómo responder sobre cada uno.

---

## 🚀 Uso Rápido

```bash
# Generar entrenamiento con todos los productos
npm run train:products
# o
entrenar-con-productos.bat
```

---

## 📊 Lo Que Genera

### Para Cada Producto

El sistema genera **8 ejemplos de entrenamiento** por producto:

1. **Búsqueda directa**
   ```
   Cliente: "busco laptop HP"
   Bot: "¡Perfecto! Tengo el laptop HP disponible por $2,500,000..."
   ```

2. **Pregunta por precio**
   ```
   Cliente: "cuánto cuesta laptop HP"
   Bot: "El laptop HP tiene un precio de $2,500,000..."
   ```

3. **Pregunta por disponibilidad**
   ```
   Cliente: "tienes laptop HP"
   Bot: "¡Sí! Tengo el laptop HP disponible por $2,500,000..."
   ```

4. **Búsqueda por categoría**
   ```
   Cliente: "busco laptops"
   Bot: "Tengo varias opciones de laptops. Una de ellas es..."
   ```

5. **Pregunta por características**
   ```
   Cliente: "qué características tiene laptop HP"
   Bot: "El laptop HP tiene procesador Intel i5, 8GB RAM..."
   ```

6. **Objeción de precio**
   ```
   Cliente: "laptop HP es muy caro"
   Bot: "Entiendo tu preocupación. El laptop HP está en $2,500,000..."
   ```

7. **Solicitud de fotos**
   ```
   Cliente: "me envías fotos de laptop HP"
   Bot: "¡Claro! Te envío las fotos del laptop HP ahora mismo..."
   ```

8. **Intención de compra**
   ```
   Cliente: "quiero comprar laptop HP"
   Bot: "¡Excelente elección! El laptop HP cuesta $2,500,000..."
   ```

### Ejemplos Generales por Categoría

Además, genera ejemplos para cada categoría:

- Búsqueda general de categoría
- Recomendación de categoría
- Rango de precios por categoría

---

## 📁 Archivos Generados

### 1. product-training-examples.ts

Archivo TypeScript con todos los ejemplos:

```typescript
export const PRODUCT_TRAINING_EXAMPLES = [
  // ========================================
  // LAPTOPS (24 ejemplos)
  // ========================================
  
  {
    userMessage: "busco laptop HP",
    botResponse: "¡Perfecto! Tengo el laptop HP...",
    context: "product_search",
    intent: "search_by_name",
    productId: "abc123",
    category: "Laptops"
  },
  
  // ... más ejemplos
]

export const PRODUCT_TRAINING_METADATA = {
  totalExamples: 240,
  generatedAt: "2025-01-09T...",
  categories: ["Laptops", "Motos", "Cursos", ...],
  examplesByCategory: {
    "Laptops": 80,
    "Motos": 60,
    ...
  }
}
```

### 2. product-training-report.json

Reporte detallado del entrenamiento:

```json
{
  "timestamp": "2025-01-09T...",
  "summary": {
    "totalProducts": 30,
    "totalExamples": 240,
    "examplesPerProduct": "8.0",
    "categories": 5
  },
  "byCategory": [
    {
      "category": "Laptops",
      "examples": 80,
      "intents": ["search_by_name", "ask_price", ...]
    }
  ],
  "intents": {
    "search_by_name": 30,
    "ask_price": 30,
    "check_availability": 30,
    ...
  }
}
```

---

## 🔄 Flujo de Trabajo

### 1. Agregar Productos a la BD

```bash
# Asegúrate de tener productos en la base de datos
# Puedes agregarlos desde el dashboard o con scripts
```

### 2. Generar Entrenamiento

```bash
npm run train:products
```

### 3. Revisar Ejemplos Generados

```bash
# Abre el archivo generado
src/lib/product-training-examples.ts
```

### 4. Integrar con el Bot

El bot automáticamente usará estos ejemplos. Solo necesitas reiniciar:

```bash
npm run dev
```

---

## 🎯 Intenciones Detectadas

El sistema genera ejemplos para estas intenciones:

| Intención | Descripción | Ejemplo |
|-----------|-------------|---------|
| `search_by_name` | Búsqueda directa | "busco laptop HP" |
| `ask_price` | Pregunta por precio | "cuánto cuesta" |
| `check_availability` | Disponibilidad | "tienes laptop HP" |
| `search_by_category` | Por categoría | "busco laptops" |
| `ask_features` | Características | "qué tiene laptop HP" |
| `handle_price_objection` | Objeción precio | "es muy caro" |
| `request_photos` | Solicitud fotos | "envía fotos" |
| `buy_product` | Intención compra | "quiero comprar" |

---

## 📊 Estadísticas

### Por Producto

- **8 ejemplos** por producto
- Cubre todas las intenciones principales
- Incluye precio formateado
- Usa descripción del producto

### Por Categoría

- **3 ejemplos** por categoría
- Búsqueda general
- Recomendaciones
- Rangos de precio

### Total

Si tienes **30 productos** en **5 categorías**:
- Ejemplos de productos: 30 × 8 = **240**
- Ejemplos de categorías: 5 × 3 = **15**
- **Total: 255 ejemplos**

---

## 🔧 Personalización

### Modificar Ejemplos Generados

Edita `scripts/entrenar-con-productos.ts`:

```typescript
function generateProductTrainingExamples(product: any): TrainingExample[] {
  const examples: TrainingExample[] = []
  
  // Agregar tus propios ejemplos aquí
  examples.push({
    userMessage: `tu ejemplo personalizado`,
    botResponse: `tu respuesta personalizada`,
    context: 'custom_context',
    intent: 'custom_intent',
    productId: product.id,
    productName: product.name,
    category: product.category
  })
  
  return examples
}
```

### Agregar Más Intenciones

```typescript
// 9. Nueva intención: Comparación
examples.push({
  userMessage: `compara ${name} con otros`,
  botResponse: `El ${name} se destaca por...`,
  context: 'product_comparison',
  intent: 'compare_products',
  productId: product.id,
  productName: name,
  category
})
```

---

## 🎓 Integración con Otros Sistemas

### Con Aprendizaje Automático

```bash
# 1. Generar entrenamiento con productos
npm run train:products

# 2. Dejar que el bot converse
npm run dev

# 3. Aprender de conversaciones reales
npm run learn

# 4. Combinar ambos entrenamientos
```

### Con Aprendizaje Reforzado

```bash
# 1. Generar entrenamiento con productos
npm run train:products

# 2. Dejar que el bot converse
npm run dev

# 3. Entrenar con feedback
npm run train
```

---

## 📈 Mejores Prácticas

### 1. Actualizar Regularmente

```bash
# Cada vez que agregues productos nuevos
npm run train:products
```

### 2. Mantener Descripciones Actualizadas

- Agrega descripciones completas a tus productos
- El bot usará estas descripciones en las respuestas
- Mejores descripciones = mejores respuestas

### 3. Categorizar Correctamente

- Asigna categorías claras a cada producto
- El bot generará ejemplos por categoría
- Facilita la búsqueda para los clientes

### 4. Revisar Ejemplos Generados

```bash
# Después de generar, revisa el archivo
src/lib/product-training-examples.ts

# Ajusta manualmente si es necesario
```

---

## 🚨 Troubleshooting

### Problema: No se generan ejemplos

**Solución:**
```bash
# Verificar que hay productos en la BD
# Ejecutar desde el dashboard o con script
```

### Problema: Ejemplos con información incorrecta

**Solución:**
```bash
# 1. Actualizar información de productos en BD
# 2. Regenerar entrenamiento
npm run train:products
```

### Problema: Muchos ejemplos duplicados

**Solución:**
```bash
# Esto es normal si tienes productos similares
# El bot aprenderá a diferenciarlos por contexto
```

---

## 📝 Ejemplo Completo

### Antes del Entrenamiento

```
Cliente: "busco laptop HP"
Bot: "No tengo información sobre ese producto"
```

### Después del Entrenamiento

```
Cliente: "busco laptop HP"
Bot: "¡Perfecto! Tengo el laptop HP Pavilion disponible por $2,500,000. 
     Cuenta con procesador Intel i5, 8GB RAM y 256GB SSD. 
     ¿Te gustaría más información?"
```

---

## 🎯 Casos de Uso

### Caso 1: Tienda Nueva

```bash
# 1. Agregar productos al dashboard
# 2. Generar entrenamiento
npm run train:products

# 3. Iniciar bot
npm run dev

# ¡Listo! El bot ya conoce todos tus productos
```

### Caso 2: Actualización de Catálogo

```bash
# 1. Agregar/actualizar productos
# 2. Regenerar entrenamiento
npm run train:products

# 3. Reiniciar bot
npm run dev
```

### Caso 3: Múltiples Categorías

```bash
# El sistema automáticamente:
# - Agrupa productos por categoría
# - Genera ejemplos por categoría
# - Crea rangos de precio por categoría
```

---

## ✅ Checklist

- [ ] Productos agregados a la base de datos
- [ ] Descripciones completas en productos
- [ ] Categorías asignadas correctamente
- [ ] Precios actualizados
- [ ] Ejecutar `npm run train:products`
- [ ] Revisar `product-training-examples.ts`
- [ ] Revisar `product-training-report.json`
- [ ] Reiniciar bot con `npm run dev`
- [ ] Probar con clientes reales

---

## 📚 Archivos Relacionados

- `scripts/entrenar-con-productos.ts` - Script principal
- `src/lib/product-training-examples.ts` - Ejemplos generados
- `product-training-report.json` - Reporte de entrenamiento
- `src/lib/sales-training-data.ts` - Ejemplos manuales
- `src/lib/learned-training-examples.ts` - Ejemplos aprendidos

---

## 🎉 Resultado

Después de ejecutar este entrenamiento:

✅ El bot conoce **todos** tus productos
✅ Puede responder sobre **cualquier** producto
✅ Maneja **8 tipos** de consultas por producto
✅ Entiende **búsquedas por categoría**
✅ Responde con **precios actualizados**
✅ Usa **descripciones reales**
✅ Genera respuestas **naturales**

---

**¡Tu bot ahora es un experto en tu catálogo! 🎓**

---

**Última actualización**: 2025-01-09
