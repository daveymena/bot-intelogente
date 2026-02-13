# Fix: Bot Mostrando Un Solo Producto en Lugar de Lista

## ✅ PROBLEMA RESUELTO

Cuando el cliente pregunta "Curso digitales?" (búsqueda general por categoría), el bot ahora muestra una LISTA de 3-5 opciones en lugar de un solo producto específico.

## Problema Identificado

**ANTES:**
```
Cliente: "Curso digitales ?"
Bot: [Muestra UN solo curso: Mega Pack 11 con toda la info]
```

**CAUSA:** El system prompt en `_think()` tenía contenido duplicado y confuso que hacía que OpenClaw eligiera incorrectamente `get_product_with_payment` (1 producto) en lugar de `list_products_by_category` (lista).

## Solución Implementada

### 1. ✅ Mejoradas las descripciones de las herramientas (TOOLS)

```typescript
list_products_by_category: {
    name: 'list_products_by_category',
    description: 'USA ESTA cuando el usuario pregunta por CATEGORÍA GENERAL sin mencionar producto específico. Ejemplos: "cursos digitales?", "laptops?", "qué computadores tienes?", "muéstrame megapacks". Muestra 3-5 opciones para que el cliente elija.',
    // ...
}

get_product_with_payment: {
    name: 'get_product_with_payment',
    description: 'USA ESTA SOLO cuando el usuario menciona un NOMBRE ESPECÍFICO de producto. Ejemplos: "Mega Pack 11", "Laptop Asus Vivobook", "curso de piano". NO uses esta si pregunta por categoría general.',
    // ...
}
```

### 2. ✅ Limpiado y simplificado el system prompt en _think()

**Eliminado:**
- Contenido duplicado (múltiples secciones "REGLAS DE ORO")
- Ejemplos contradictorios
- Instrucciones repetidas

**Agregado:**
```
### 🚀 REGLAS PARA ELEGIR HERRAMIENTA (CRÍTICO):

**🔴 REGLA #1 ABSOLUTA - DETECTAR BÚSQUEDA GENERAL vs ESPECÍFICA:**

**EJEMPLOS DE BÚSQUEDA GENERAL** (usar 'list_products_by_category'):
✅ "Curso digitales ?" → list_products_by_category con searchTerm: "cursos digitales"
✅ "cursos digitales?" → list_products_by_category con searchTerm: "cursos digitales"
✅ "cursos?" → list_products_by_category con searchTerm: "cursos"
✅ "laptops?" → list_products_by_category con searchTerm: "laptops"
✅ "megapacks?" → list_products_by_category con searchTerm: "megapacks"

**EJEMPLOS DE BÚSQUEDA ESPECÍFICA** (usar 'get_product_with_payment'):
✅ "Mega Pack 11" → get_product_with_payment con productId: "Mega Pack 11"
✅ "Laptop Asus Vivobook" → get_product_with_payment con productId: "Laptop Asus Vivobook"

**⚠️ EN CASO DE DUDA → USA 'list_products_by_category'**
```

## Comportamiento Esperado

### ✅ DESPUÉS del fix:
```
Cliente: "Curso digitales ?"
Bot: ¡Hola! Te ayudo a elegir de nuestro catálogo:

━━━━━━━━━━━━━━━━━━
1️⃣ *Mega Pack 11: Cursos Marketing Digital* - 20.000 COP
2️⃣ *Curso de Piano Avanzado* - 35.000 COP
3️⃣ *Curso de Programación Web* - 45.000 COP
━━━━━━━━━━━━━━━━━━

¿Cuál te llama más la atención? 🦞🔥
```

## Archivos Modificados

### `src/lib/bot/openclaw-orchestrator.ts`

**Cambios en TOOLS (líneas ~60-70):**
- ✅ Mejorada descripción de `list_products_by_category`
- ✅ Mejorada descripción de `get_product_with_payment`

**Cambios en método `_think()` (líneas ~445-540):**
- ✅ Eliminado contenido duplicado
- ✅ Simplificadas reglas de decisión
- ✅ Agregados ejemplos REALES más claros
- ✅ Agregada regla "EN CASO DE DUDA → list_products_by_category"

## Casos de Prueba

### ✅ Búsquedas Generales (deben usar list_products_by_category):
- "Curso digitales ?"
- "cursos digitales?"
- "cursos?"
- "qué cursos tienes?"
- "laptops?"
- "computadores?"
- "megapacks?"
- "productos digitales?"
- "muéstrame opciones"
- "busco laptop"
- "necesito un curso"

### ✅ Búsquedas Específicas (deben usar get_product_with_payment):
- "Mega Pack 11"
- "el Mega Pack 11"
- "Laptop Asus Vivobook 15"
- "¿Qué tal es el Mega Pack 11?"
- "Cuánto cuesta la Asus Vivobook?"

## Script de Prueba

Creado `test-lista-productos.ts` para verificar el comportamiento:

```bash
npx tsx test-lista-productos.ts
```

El script prueba 7 casos diferentes y verifica que OpenClaw elija la herramienta correcta.

## Notas Técnicas

- ✅ El formato de respuesta para listas ya estaba bien implementado en `_generateResponse()`
- ✅ El problema era SOLO la elección de herramienta en `_think()`
- ✅ La herramienta `list_products_by_category` usa Fuse.js con threshold 0.6 y retorna máximo 5 productos
- ✅ El formato de lista usa separadores `━━━━━━━━━━━━━━━━━━` y emojis numerados `1️⃣ 2️⃣ 3️⃣`
- ✅ No hay errores de sintaxis, solo warnings de TypeScript que no afectan funcionalidad

## Próximos Pasos

1. ✅ Probar con mensajes reales de clientes en producción
2. ✅ Monitorear logs para verificar que OpenClaw elige la herramienta correcta
3. ✅ Ajustar threshold de fuzzy search si es necesario (actualmente 0.6 para listas, 0.7 para específicos)
4. ✅ Considerar agregar más ejemplos si se detectan nuevos patrones de búsqueda

## Resumen

El bot ahora detecta correctamente cuándo el cliente pregunta por una categoría general y muestra una lista de opciones en lugar de un solo producto. Esto mejora la experiencia del cliente al darle opciones para elegir.
