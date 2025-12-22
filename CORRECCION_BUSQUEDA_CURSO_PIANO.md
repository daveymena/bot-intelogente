# Corrección: Búsqueda de "Curso de Piano"

## 🐛 Problema Detectado

Cuando el usuario preguntaba por "curso de piano", el bot respondía con **megapacks genéricos** en lugar del curso específico de piano.

### Causa Raíz

El `ContextualBrain` estaba priorizando **referencias al contexto** sobre **búsquedas específicas**. Cuando el usuario decía "el curso de piano", el sistema detectaba "el" como referencia al contexto anterior y buscaba en los productos mostrados previamente, en lugar de hacer una búsqueda nueva.

## ✅ Solución Implementada

### 1. Priorización de Búsquedas Específicas

**Archivo**: `src/lib/contextual-brain.ts`

Se cambió el orden de prioridad en el razonamiento:

```typescript
// ANTES: Referencias al contexto primero
1. isReferenceToContext()
2. isUsageQuestion()
3. isNewSearch()

// AHORA: Productos específicos primero
1. hasSpecificProductMention() ⭐ NUEVO
2. isNewSearch()
3. isReferenceToContext()
4. isUsageQuestion()
```

### 2. Nuevo Método: `hasSpecificProductMention()`

Detecta cuando el usuario menciona un producto específico, incluso si usa palabras como "el", "la", "ese":

```typescript
const specificProducts = [
  'curso de piano', 'curso piano', 'piano',
  'curso de guitarra', 'curso guitarra',
  'curso de ingles', 'curso diseño',
  'megapack de', 'asus', 'hp pavilion',
  'yamaha', 'bajaj', etc.
];
```

### 3. Mejora en `isNewSearch()`

- Agregado "interesado" como palabra de búsqueda
- Agregados más productos específicos: piano, guitarra, ingles, diseño
- Detecta mención directa de producto sin palabra de búsqueda

### 4. Mejora en `handleNewSearch()`

- Detecta automáticamente búsquedas ESPECÍFICAS cuando se menciona "curso de", "laptop", etc.
- Mejor clasificación de tipo de búsqueda: `specific`, `brand`, `category`

## 🧪 Cómo Probar

### Opción 1: Test Específico de Curso de Piano

```bash
probar-curso-piano.bat
```

Este script:
1. Verifica que existe el curso de piano en la BD
2. Prueba el ContextualBrain con varios mensajes
3. Muestra resultados detallados

### Opción 2: Test de Contexto Completo (RECOMENDADO)

```bash
probar-contexto-completo.bat
```

Este script prueba **5 escenarios diferentes**:
1. ✅ Búsqueda específica nueva (curso de piano)
2. ✅ Referencias al contexto ("el primero", "ese")
3. ✅ Cambio de producto en conversación
4. ✅ Preguntas sobre uso del producto
5. ✅ Múltiples productos en contexto

### Opción 3: Prueba Manual en WhatsApp

Envía estos mensajes al bot:

```
1. "Estoy interesado en el curso de piano"
2. "El curso de piano"
3. "curso de piano"
4. "Quiero el curso de piano"
5. "Me interesa el curso de piano"
```

**Resultado Esperado**: El bot debe mostrar el curso de piano específico, NO megapacks genéricos.

## 📊 Casos de Prueba

| Mensaje | Tipo Detectado | Búsqueda | Resultado Esperado |
|---------|---------------|----------|-------------------|
| "Estoy interesado en el curso de piano" | new_search | specific | Curso de Piano |
| "El curso de piano" | new_search | specific | Curso de Piano |
| "curso de piano" | new_search | specific | Curso de Piano |
| "Quiero el curso de piano" | new_search | specific | Curso de Piano |
| "Me interesa el curso de piano" | new_search | specific | Curso de Piano |

## 🔍 Archivos Modificados

1. **src/lib/contextual-brain.ts**
   - Nuevo método `hasSpecificProductMention()`
   - Reordenamiento de prioridades en `processMessage()`
   - Mejoras en `isNewSearch()`
   - Mejoras en `handleNewSearch()`

2. **scripts/test-curso-piano-especifico.ts** (NUEVO)
   - Script de prueba automatizado

3. **probar-curso-piano.bat** (NUEVO)
   - Comando rápido para ejecutar pruebas

## 🎯 Impacto

### Antes
- ❌ "curso de piano" → Megapacks genéricos
- ❌ "el curso de piano" → Referencia al contexto (productos anteriores)
- ❌ Búsquedas específicas ignoradas

### Después
- ✅ "curso de piano" → Curso de Piano específico
- ✅ "el curso de piano" → Curso de Piano específico
- ✅ Búsquedas específicas priorizadas
- ✅ Mejor comprensión de intención del usuario

## 🚀 Próximos Pasos

1. **Ejecutar pruebas básicas**: `probar-curso-piano.bat`
2. **Ejecutar pruebas completas**: `probar-contexto-completo.bat` ⭐ RECOMENDADO
3. **Verificar en WhatsApp real**: Probar con varios mensajes
4. **Monitorear logs**: Ver que el razonamiento sea correcto
5. **Ajustar si es necesario**: Agregar más productos específicos

## 📝 Notas Técnicas

- El sistema ahora prioriza **especificidad** sobre **contexto**
- Si el usuario menciona un producto específico, SIEMPRE se trata como búsqueda nueva
- El scoring de Levenshtein sigue funcionando para coincidencias fuzzy
- La confianza se mantiene alta (0.85-0.95) para búsquedas específicas

## ✨ Beneficios

1. **Mejor UX**: El usuario obtiene lo que busca inmediatamente
2. **Menos confusión**: No se mezclan productos irrelevantes
3. **Mayor precisión**: Búsquedas específicas funcionan correctamente
4. **Más natural**: El bot entiende mejor la intención del usuario

---

**Fecha**: 22 de Noviembre de 2025
**Estado**: ✅ Implementado y listo para pruebas
