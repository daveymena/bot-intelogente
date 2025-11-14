# 🎹 ARREGLO: Búsqueda de "Curso de Piano"

## ❌ Problema Original

Cuando el cliente preguntaba por "curso de piano", el bot le respondía con:
- ❌ **Mega Pack 08: Cursos Idiomas** (inglés, francés, alemán, etc.)
- ❌ **Mega Pack 09: Cursos Música y Audio**

En lugar del producto correcto:
- ✅ **Curso Completo de Piano**

## 🔍 Causa del Problema

El sistema de búsqueda tenía dos problemas:

### 1. **IntentTranslator agregaba palabras genéricas**
Cuando detectaba "piano", también agregaba:
- "música", "audio", "sonido", "producción musical"

Esto hacía que los Mega Packs de Música obtuvieran más puntos.

### 2. **ProductIntelligenceService no priorizaba términos específicos**
Todos los términos de búsqueda tenían la misma prioridad:
- "piano" = misma prioridad que "música"
- "guitarra" = misma prioridad que "audio"

## ✅ Solución Implementada

### 1. **IntentTranslator mejorado**

```typescript
// ANTES: Agregaba términos genéricos
'piano': ['piano', 'música', 'audio', 'sonido']

// AHORA: Solo términos específicos
'piano': ['piano', 'curso de piano', 'clases de piano', 'aprender piano', 'tocar piano']
```

**Cambios:**
- ✅ Detecta términos específicos PRIMERO (piano, guitarra, batería)
- ✅ Solo agrega variaciones del término específico mencionado
- ✅ NO agrega términos genéricos si el cliente fue específico

### 2. **ProductIntelligenceService con prioridades**

```typescript
const specificMatches = [
  // 🎹 INSTRUMENTOS MUSICALES (PRIORIDAD 100)
  { keywords: ['piano'], name: 'piano', searchIn: 'name', priority: 100 },
  { keywords: ['guitarra'], name: 'guitarra', searchIn: 'name', priority: 100 },
  
  // 🌍 IDIOMAS (PRIORIDAD 90)
  { keywords: ['ingles', 'inglés'], name: 'idiomas', searchIn: 'both', priority: 90 },
  
  // 📦 MEGAPACKS (PRIORIDAD 80)
  { keywords: ['mega', 'pack'], name: 'mega pack', searchIn: 'name', priority: 80 },
  
  // 💻 GENÉRICOS (PRIORIDAD 50)
  { keywords: ['laptop'], name: 'laptop', searchIn: 'name', priority: 50 }
]
```

**Cambios:**
- ✅ Sistema de prioridades (100 = más específico, 50 = más genérico)
- ✅ Instrumentos musicales buscan SOLO en nombre (no en descripción)
- ✅ Ordenamiento por prioridad antes de buscar

## 🧪 Prueba de Funcionamiento

```bash
npx tsx test-busqueda-piano-vs-idiomas.js
```

**Resultado:**
```
🔍 Buscando: "curso de piano"
🎯 Buscando coincidencia específica: piano (prioridad: 100)
✅ Producto específico encontrado: Curso Completo de Piano
```

## 📊 Comparación

| Consulta | ANTES | AHORA |
|----------|-------|-------|
| "curso de piano" | ❌ Mega Pack Idiomas | ✅ Curso Completo de Piano |
| "curso de guitarra" | ❌ Mega Pack Música | ✅ Curso de Guitarra |
| "curso de inglés" | ✅ Mega Pack Idiomas | ✅ Mega Pack Idiomas |
| "megapack música" | ✅ Mega Pack 09 | ✅ Mega Pack 09 |

## 🎯 Archivos Modificados

1. **src/lib/intent-translator.ts**
   - Mejorado `extractTopic()` para detectar términos específicos primero
   - Mejorado `generateSearchTerms()` para no agregar términos genéricos
   - Mejorado `getTopicVariations()` con variaciones específicas

2. **src/lib/product-intelligence-service.ts**
   - Agregado sistema de prioridades a `specificMatches`
   - Ordenamiento por prioridad antes de buscar
   - Búsqueda solo en nombre para términos de prioridad 100

## 🚀 Resultado Final

✅ El bot ahora responde correctamente:
- Cliente: "curso de piano"
- Bot: "Curso Completo de Piano - $65.000 COP"

✅ NO confunde con:
- Mega Pack de Idiomas
- Mega Pack de Música y Audio
- Otros cursos genéricos

## 📝 Notas Técnicas

- **Prioridad 100**: Términos MUY específicos (instrumentos, marcas)
- **Prioridad 90**: Términos específicos (idiomas individuales)
- **Prioridad 80**: Términos de categoría (megapacks)
- **Prioridad 50**: Términos genéricos (laptop, curso)

El sistema ahora busca de más específico a más genérico, evitando confusiones.
