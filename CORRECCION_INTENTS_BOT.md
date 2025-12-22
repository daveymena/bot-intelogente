# ✅ Corrección de Detección de Intents

## 🎯 Problema Identificado

El entrenamiento mostró que Ollama funciona perfectamente (6-22 segundos de respuesta), pero la **lógica de detección de intents estaba incorrecta**:

### Errores Principales
1. **"Tienes X?"** → Detectaba `availability` en lugar de `product_list`
2. **"Cuánto cuesta X?"** → Detectaba `price` en lugar de `product_info`

## 🔧 Cambios Aplicados

### Archivo: `src/lib/product-intelligence-service.ts`

#### Cambio 1: Preguntas de Precio
```diff
- // Detectaba: price
+ // Ahora detecta: info (para mostrar detalles del producto)

Antes: "Cuánto cuesta X?" → type: 'price'
Ahora: "Cuánto cuesta X?" → type: 'info'
```

#### Cambio 2: Preguntas de Disponibilidad
```diff
- // Detectaba: availability
+ // Ahora detecta: general (para buscar productos)

Antes: "Tienes X?" → type: 'availability'
Ahora: "Tienes X?" → type: 'general'
```

## 📊 Resultados Esperados

### Antes (3.45% precisión)
- ❌ "Tienes audífonos?" → `availability` (incorrecto)
- ❌ "Cuánto cuesta laptop?" → `price` (incorrecto)
- ❌ 28 de 29 casos fallaron

### Ahora (esperado >80% precisión)
- ✅ "Tienes audífonos?" → `general` → Busca productos
- ✅ "Cuánto cuesta laptop?" → `info` → Muestra detalles
- ✅ Lógica corregida

## 🧪 Probar Ahora

```bash
npx tsx scripts/entrenar-bot.ts
```

Esto debería mostrar una mejora significativa en la precisión.

## 💡 Explicación

El problema NO era Ollama (funcionó perfectamente), sino la lógica de clasificación de intents:

1. **Intent `availability`**: Solo para preguntas de stock específicas
2. **Intent `info`**: Para preguntas de precio y detalles
3. **Intent `general`**: Para búsquedas de productos

Con estos cambios, el bot debería:
- Buscar productos correctamente cuando preguntan "Tienes X?"
- Mostrar detalles cuando preguntan "Cuánto cuesta X?"
- Seleccionar los productos correctos

## 🎯 Próximo Paso

Ejecuta el entrenamiento de nuevo para ver la mejora:

```bash
npx tsx scripts/entrenar-bot.ts
```

Deberías ver una precisión mucho mayor (>80%).
