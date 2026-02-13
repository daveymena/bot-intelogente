# Fix: Bot Mostrando Un Solo Producto en Búsqueda General

## 🐛 Problema Identificado

Cuando un cliente preguntaba por una **categoría general** de productos (ej: "Curso digitales?", "cursos?", "megapacks?"), el bot mostraba **UN SOLO producto específico** en lugar de mostrar una **LISTA de 3-5 opciones** para que el cliente eligiera.

### Ejemplo del Problema:
```
Cliente: "Curso digitales ?"
Bot: 🎯 *Mega Pack 11: Cursos Marketing Digital*
     💰 PRECIO: 20.000 COP
     [Muestra solo UN producto sin saber cuál necesita el cliente]
```

### Comportamiento Esperado:
```
Cliente: "Curso digitales ?"
Bot: ¡Hola! Te ayudo a elegir de nuestro catálogo:
     
     ━━━━━━━━━━━━━━━━━━
     1️⃣ Mega Pack 11: Cursos Marketing Digital - 20.000 COP
     2️⃣ Mega Pack 12: Cursos Programación - 25.000 COP
     3️⃣ Curso de Piano Avanzado - 30.000 COP
     ━━━━━━━━━━━━━━━━━━
     
     ¿Cuál te llama más la atención? 🦞🔥
```

## 🔍 Causa Raíz

El problema estaba en la función `_think()` del archivo `src/lib/bot/openclaw-orchestrator.ts`. Aunque las reglas para detectar búsquedas generales existían, no eran lo suficientemente **explícitas y enfáticas** para que el modelo de IA las siguiera correctamente.

El modelo estaba confundiendo:
- ❌ "Curso digitales?" → Interpretaba como búsqueda específica
- ✅ "Curso digitales?" → Debería interpretar como categoría general

## ✅ Solución Implementada

### 1. Reglas Más Explícitas y Enfáticas

Se reescribieron las reglas en el prompt de `_think()` con:

- **Emojis de alerta** (🔴🔴🔴) para llamar la atención
- **Ejemplos REALES** del problema específico reportado
- **Pregunta de verificación** antes de elegir tool
- **Porcentajes** para indicar frecuencia (90% vs 10%)
- **Ejemplos de errores comunes** a evitar

### 2. Estructura de Reglas Mejorada

```typescript
### 🚀 REGLAS DE ORO PARA EL PENSAMIENTO (CRÍTICO):

**🔴🔴🔴 REGLA #1 ABSOLUTA - SIEMPRE VERIFICA PRIMERO 🔴🔴🔴**
ANTES de elegir herramienta, pregúntate:
❓ "¿El usuario mencionó un nombre ESPECÍFICO que aparece en CATÁLOGO HINTS?"
   → SI aparece nombre específico → get_product_with_payment
   → NO aparece nombre específico → list_products_by_category

**🔴 BÚSQUEDA GENERAL (90% de los casos) → USA 'list_products_by_category':**
EJEMPLOS REALES QUE DEBES DETECTAR:
  ✅ "Curso digitales ?" → list_products_by_category con searchTerm: "cursos digitales"
  ✅ "cursos digitales?" → list_products_by_category con searchTerm: "cursos digitales"
  ✅ "cursos?" → list_products_by_category con searchTerm: "cursos"
  ✅ "qué cursos tienes?" → list_products_by_category con searchTerm: "cursos"
  [... más ejemplos ...]

**🟡 BÚSQUEDA ESPECÍFICA (10% de los casos) → USA 'get_product_with_payment':**
SOLO cuando el usuario menciona un nombre COMPLETO y ESPECÍFICO:
  ✅ "Mega Pack 11" (si aparece en HINTS) → get_product_with_payment
  ❌ "mega pack" (genérico) → list_products_by_category

**❌ ERRORES COMUNES QUE DEBES EVITAR:**
❌ INCORRECTO: "Curso digitales ?" → get_product_with_payment
✅ CORRECTO: "Curso digitales ?" → list_products_by_category
```

### 3. Eliminación de Contenido Duplicado

Se eliminaron secciones duplicadas en el prompt que podían confundir al modelo.

## 🧪 Verificación

Se creó un script de prueba `test-busqueda-general.ts` que verifica:

1. ✅ "Curso digitales ?" → Muestra LISTA
2. ✅ "cursos digitales?" → Muestra LISTA
3. ✅ "cursos?" → Muestra LISTA
4. ✅ "qué cursos tienes?" → Muestra LISTA
5. ✅ "megapacks?" → Muestra LISTA
6. ✅ "laptops?" → Muestra LISTA
7. ✅ "Mega Pack 11" → Muestra UN producto (correcto)

### Ejecutar Tests:
```bash
npx tsx test-busqueda-general.ts
```

## 📊 Impacto Esperado

### Antes del Fix:
- Cliente pregunta por categoría → Bot muestra 1 producto aleatorio
- Cliente no sabe qué otras opciones hay
- Cliente tiene que preguntar múltiples veces
- Experiencia frustrante

### Después del Fix:
- Cliente pregunta por categoría → Bot muestra 3-5 opciones
- Cliente ve el catálogo completo de esa categoría
- Cliente elige el que más le interesa
- Experiencia fluida y profesional

## 🔧 Archivos Modificados

1. **`src/lib/bot/openclaw-orchestrator.ts`**
   - Función `_think()` (líneas ~465-530)
   - Reglas de detección de búsqueda general mejoradas
   - Eliminación de contenido duplicado

## 📝 Notas Técnicas

### Tools Involucrados:

1. **`list_products_by_category`**: 
   - Usa búsqueda fuzzy con Fuse.js
   - Retorna hasta 5 productos
   - Threshold: 0.6 (60% de similitud)
   - Busca en: name, tags, category

2. **`get_product_with_payment`**:
   - Búsqueda por ID o nombre específico
   - Retorna UN solo producto
   - Genera links de pago dinámicos

### Flujo de Decisión:

```
Usuario envía mensaje
    ↓
_think() analiza el mensaje
    ↓
¿Menciona nombre específico de CATÁLOGO HINTS?
    ↓                           ↓
   SÍ                          NO
    ↓                           ↓
get_product_with_payment   list_products_by_category
    ↓                           ↓
Muestra 1 producto         Muestra 3-5 productos
```

## ✅ Checklist de Verificación

- [x] Reglas reescritas con mayor énfasis
- [x] Ejemplos del caso real agregados
- [x] Contenido duplicado eliminado
- [x] Script de prueba creado
- [x] Documentación actualizada
- [ ] Tests ejecutados y pasando
- [ ] Verificación en producción con cliente real

## 🚀 Próximos Pasos

1. Ejecutar `npx tsx test-busqueda-general.ts` para verificar
2. Probar en WhatsApp real con mensajes:
   - "Curso digitales ?"
   - "cursos?"
   - "megapacks?"
   - "laptops?"
3. Verificar que muestra LISTA de 3-5 productos
4. Confirmar que el cliente puede elegir de la lista

## 📚 Referencias

- **Archivo principal**: `src/lib/bot/openclaw-orchestrator.ts`
- **Tool de lista**: Línea ~60 (`list_products_by_category`)
- **Tool específico**: Línea ~120 (`get_product_with_payment`)
- **Función de decisión**: Línea ~440 (`_think()`)
- **Función de respuesta**: Línea ~580 (`_generateResponse()`)
