# Fix: Búsqueda por Categorías vs Productos Específicos

## 🐛 Problema Identificado

Cuando el usuario preguntaba por una categoría general como "cursos digitales?", el bot mostraba UN solo producto específico sin preguntar cuál necesitaba.

### Ejemplo del problema:
```
Usuario: "Curso digitales ?"
Bot: 🎯 Mega Pack 11: Cursos Marketing Digital
     💰 PRECIO: 20.000 COP
     ...
```

**Comportamiento esperado**: El bot debería mostrar una LISTA de todos los cursos digitales disponibles y preguntar cuál le interesa.

## 🔍 Causa Raíz

El bot estaba usando la herramienta incorrecta:
- ❌ Usaba `get_product_with_payment` (producto específico)
- ✅ Debería usar `list_products_by_category` (lista de opciones)

El problema estaba en la función `_think` del archivo `src/lib/bot/openclaw-orchestrator.ts`, donde las reglas de decisión no distinguían claramente entre:
- **Búsqueda general**: "cursos digitales", "laptops", "computadores"
- **Búsqueda específica**: "Mega Pack 11", "Laptop Asus Vivobook"

## ✅ Solución Implementada

### 1. Mejora del System Prompt

Se actualizó la sección "REGLA DE ORO" en el system prompt de la función `_think` para ser más explícita:

```typescript
**⚠️ REGLA DE ORO (LEER ESTO PRIMERO):**

**PASO 1: ¿Es una CATEGORÍA GENERAL o un NOMBRE ESPECÍFICO?**

**CATEGORÍAS GENERALES** (usar 'list_products_by_category'):
- Palabras genéricas: "cursos digitales", "laptops", "computadores", "megapacks", "motos"
- Preguntas vagas: "qué tienes?", "muéstrame opciones", "busco laptop"
- **CLAVE**: Si NO menciona un nombre específico de CATÁLOGO HINTS → es categoría general

**NOMBRES ESPECÍFICOS** (usar 'get_product_with_payment'):
- Nombres exactos de CATÁLOGO HINTS: "Mega Pack 11", "Laptop Asus Vivobook"
- Preguntas sobre producto específico: "¿Qué tal es el Mega Pack 11?"
- **CLAVE**: Si menciona un nombre que aparece en CATÁLOGO HINTS → es producto específico

**PASO 2: Aplicar la regla:**
- ❌ "cursos digitales?" → NO es nombre específico → list_products_by_category
- ✅ "Mega Pack 11" → SÍ es nombre específico → get_product_with_payment
- ❌ "laptops?" → NO es nombre específico → list_products_by_category
- ✅ "Laptop Asus Vivobook" → SÍ es nombre específico → get_product_with_payment
```

### 2. Ejemplos Claros

Se agregaron ejemplos explícitos con emojis ❌/✅ para que el AI entienda claramente:
- ❌ = NO es nombre específico → usar `list_products_by_category`
- ✅ = SÍ es nombre específico → usar `get_product_with_payment`

### 3. Proceso de Decisión en 2 Pasos

Se estructuró la decisión en dos pasos claros:
1. **PASO 1**: Identificar si es categoría general o nombre específico
2. **PASO 2**: Aplicar la regla correspondiente

## 🧪 Verificación

Se creó el script `test-category-search.ts` para verificar el comportamiento:

```bash
npx tsx test-category-search.ts
```

### Casos de prueba incluidos:

**Búsquedas Generales** (deben usar `list_products_by_category`):
- "Curso digitales ?"
- "cursos digitales?"
- "laptops?"
- "computadores?"
- "megapacks?"
- "qué productos tienes?"
- "busco laptop"
- "necesito un curso"

**Búsquedas Específicas** (deben usar `get_product_with_payment`):
- "Mega Pack 11"
- "¿Qué tal es el Mega Pack 11?"
- "Laptop Asus Vivobook"
- "Cuánto cuesta la Asus Vivobook?"

**Otros Casos**:
- "hola" → sin herramienta (saludo)
- "cómo puedo pagar?" → `get_payment_info`

## 📊 Comportamiento Esperado Después del Fix

### Antes (❌ Incorrecto):
```
Usuario: "cursos digitales?"
Bot: [Muestra UN solo curso sin preguntar]
```

### Después (✅ Correcto):
```
Usuario: "cursos digitales?"
Bot: 📚 Tenemos estos cursos digitales disponibles:

     1️⃣ Mega Pack 11: Cursos Marketing Digital
        💰 20.000 COP
     
     2️⃣ Curso de Piano Completo
        💰 35.000 COP
     
     3️⃣ Curso de Programación Web
        💰 50.000 COP
     
     ¿Cuál te interesa? 😊
```

## 🔧 Archivos Modificados

- `src/lib/bot/openclaw-orchestrator.ts` (líneas 475-495 aprox)
  - Función `_think`
  - Sección "REGLA DE ORO"

## 📝 Notas Técnicas

### Lógica de Decisión

El AI ahora sigue este flujo:

1. **Recibe el mensaje del usuario**
2. **Revisa CATÁLOGO HINTS** (lista de productos reales)
3. **Pregunta**: ¿El mensaje contiene un nombre exacto de CATÁLOGO HINTS?
   - **NO** → Es búsqueda general → `list_products_by_category`
   - **SÍ** → Es producto específico → `get_product_with_payment`

### Palabras Clave de Categorías

Estas palabras se consideran CATEGORÍAS GENERALES:
- "cursos digitales"
- "laptops"
- "computadores"
- "megapacks"
- "motos"
- "productos digitales"
- "tecnología"

### Detección de Nombres Específicos

El AI busca coincidencias con los nombres en CATÁLOGO HINTS:
- "Mega Pack 11"
- "Laptop Asus Vivobook"
- "Moto Auteco Victory"
- "Curso de Piano"
- etc.

## ✅ Checklist de Verificación

- [x] Actualizado system prompt en `_think`
- [x] Agregados ejemplos claros con ❌/✅
- [x] Creado script de prueba `test-category-search.ts`
- [x] Documentado el fix en `FIX_BUSQUEDA_CATEGORIAS.md`
- [ ] Ejecutar tests: `npx tsx test-category-search.ts`
- [ ] Probar en producción con usuarios reales
- [ ] Monitorear logs para verificar herramienta correcta

## 🚀 Próximos Pasos

1. **Ejecutar tests** para verificar que el fix funciona
2. **Probar manualmente** con mensajes reales de WhatsApp
3. **Monitorear logs** para ver qué herramienta se usa en cada caso
4. **Ajustar** si es necesario basado en comportamiento real

## 📚 Referencias

- Archivo modificado: `src/lib/bot/openclaw-orchestrator.ts`
- Script de prueba: `test-category-search.ts`
- Documentación: `FIX_BUSQUEDA_CATEGORIAS.md`
