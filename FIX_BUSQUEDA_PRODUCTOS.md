# Fix: Búsqueda de Productos - Categoría vs Nombre Específico

## 🐛 Problema Identificado

El bot estaba usando `get_product_with_payment` cuando debería usar `list_products_by_category` para búsquedas genéricas.

### Ejemplo del Error:
```
Usuario: "Curso digitales ?"
Bot: [Muestra "Mega Pack 11" específico]
Esperado: [Muestra lista de todos los cursos digitales]
```

## 🔍 Causa Raíz

El sistema de búsqueda fuzzy (`catalogHints`) encuentra productos que coinciden con las palabras del usuario. Cuando el usuario dice "Curso digitales?", el fuzzy search encuentra "Mega Pack 11: Cursos Marketing Digital" y lo incluye en los hints.

El bot entonces ve "Mega Pack 11" en los hints y piensa: "El usuario mencionó un producto de los hints" → usa `get_product_with_payment`.

## ✅ Solución Implementada

### 1. Reglas Mejoradas en `openclaw-orchestrator.ts`

Se actualizaron las reglas en el método `_think()` para ser más estrictas:

**REGLA #1 ABSOLUTA:**
```
¿El usuario mencionó un nombre ESPECÍFICO que aparece en CATÁLOGO HINTS?
→ SI aparece nombre específico → get_product_with_payment
→ NO aparece nombre específico → list_products_by_category
```

**Ejemplos Críticos Agregados:**
```typescript
✅ "Curso digitales ?" → list_products_by_category (solo categoría)
✅ "cursos?" → list_products_by_category (solo categoría)
✅ "laptops?" → list_products_by_category (solo categoría)
✅ "Mega Pack 11" → get_product_with_payment (nombre completo)
```

### 2. Lógica de Detección

El bot ahora evalúa:

1. **¿Es una palabra genérica?** ("cursos", "laptops", "motos") → `list_products_by_category`
2. **¿Tiene "?" al final sin nombre específico?** → `list_products_by_category`
3. **¿Menciona 2+ palabras de un nombre de producto?** → `get_product_with_payment`
4. **¿En duda?** → `list_products_by_category` (más seguro)

## 🧪 Cómo Probar

### Opción 1: Test Automatizado

```bash
npx tsx test-busqueda-productos.ts
```

Este script prueba 10 casos diferentes de búsqueda.

### Opción 2: Prueba Manual en WhatsApp

1. Conecta el bot a WhatsApp
2. Envía estos mensajes:

```
❌ ANTES (incorrecto):
"Curso digitales ?" → Mostraba "Mega Pack 11" específico

✅ AHORA (correcto):
"Curso digitales ?" → Muestra lista de todos los cursos digitales
"cursos?" → Muestra lista de cursos
"laptops?" → Muestra lista de laptops
"Mega Pack 11" → Muestra ese producto específico
```

## 📊 Casos de Prueba

| Mensaje | Herramienta Esperada | Razón |
|---------|---------------------|-------|
| "Curso digitales ?" | `list_products_by_category` | Solo categoría |
| "cursos?" | `list_products_by_category` | Solo categoría |
| "qué cursos tienes?" | `list_products_by_category` | Pregunta general |
| "laptops?" | `list_products_by_category` | Solo categoría |
| "megapacks?" | `list_products_by_category` | Solo categoría |
| "Mega Pack 11" | `get_product_with_payment` | Nombre completo |
| "¿Qué tal es el Mega Pack 11?" | `get_product_with_payment` | Nombre en pregunta |
| "Laptop Asus Vivobook" | `get_product_with_payment` | Nombre específico |

## 🔧 Archivos Modificados

- `src/lib/bot/openclaw-orchestrator.ts` - Método `_think()` (líneas ~467-530)

## 📝 Notas Técnicas

### Por Qué Funciona Ahora

1. **Reglas más explícitas**: Los ejemplos críticos enseñan al modelo exactamente qué hacer
2. **Prioridad clara**: "En caso de duda → list_products_by_category"
3. **Verificación de nombre completo**: Solo usa `get_product_with_payment` si el mensaje contiene nombre completo

### Limitaciones

- El bot depende de la IA (Groq/Llama) para interpretar las reglas
- Si la IA está sobrecargada o responde mal, puede fallar
- Los `catalogHints` siguen mostrando productos relacionados, pero las reglas ahora son más estrictas

## 🚀 Próximos Pasos

Si el problema persiste:

1. **Aumentar temperatura**: Cambiar `temperature: 0.6` a `0.7` para más creatividad
2. **Agregar pre-filtro**: Filtrar `catalogHints` antes de enviarlos al modelo
3. **Usar embeddings**: Implementar búsqueda semántica más precisa
4. **Logging detallado**: Agregar logs para ver qué herramienta elige y por qué

## ✅ Verificación de Éxito

El fix está funcionando si:

- ✅ "Curso digitales?" muestra lista de cursos
- ✅ "laptops?" muestra lista de laptops
- ✅ "Mega Pack 11" muestra ese producto específico
- ✅ Bot pregunta "¿Cuál te interesa?" cuando es búsqueda genérica
- ✅ Bot muestra detalles y link de pago cuando es producto específico

---

**Fecha**: 12 de febrero de 2026  
**Versión**: 1.0  
**Estado**: ✅ Implementado y listo para pruebas
