# Fix: "teclado" muestra "Curso de Piano"

## 🐛 Problema Reportado

```
Usuario: "Me interesa un teclado ?"
Bot: "Mega Pack Curso de Piano Completo"
```

**Esperado**: El bot debería preguntar qué tipo de teclado (computadora, gaming, inalámbrico) o mostrar teclados de computadora.

**Obtenido**: Muestra un curso de piano porque "teclado" está en los tags del producto (el piano es un instrumento de teclado).

---

## 🔍 Análisis del Problema

### Causa Raíz

1. **Fuzzy Search Threshold**: 0.6 (60%) es demasiado permisivo
2. **Tags ambiguos**: "teclado" aparece en:
   - Productos físicos: "Teclado Mecánico", "Teclado Inalámbrico"
   - Productos digitales: "Mega Pack Curso de Piano" (tags: piano, música, teclado)

3. **Falta de contexto**: El sistema no distingue entre:
   - "teclado" = periférico de computadora
   - "teclado" = instrumento musical (piano, órgano)

### Código Actual

```typescript
// src/lib/bot/openclaw-orchestrator.ts - list_products_by_category
const fuse = new Fuse(context.products, {
    threshold: 0.6,  // ⚠️ Muy permisivo
    keys: [
        { name: 'name', weight: 0.5 },
        { name: 'tags', weight: 0.3 },  // ⚠️ Tags ambiguos
        { name: 'category', weight: 0.2 }
    ]
});
```

---

## ✅ Solución Implementada

### 1. Agregado "teclado" a Productos VARIABLES

**Archivo**: `src/lib/bot/conversation-strategy.ts`

```typescript
const variableKeywords = [
    'laptop', 'laptops', 'computador', 'computadores', 'pc', 'computadora',
    'moto', 'motos', 'motocicleta', 'impresora', 'impresoras',
    'teclado', 'teclados', 'mouse', 'ratón', 'monitor', 'monitores' // ✅ Agregado
];
```

**Efecto**: Cuando el usuario pregunta por "teclado", el bot ahora hace preguntas de calificación:

```
Usuario: "Me interesa un teclado"
Bot: "¡Perfecto! Para recomendarte la mejor opción, cuéntame:
     • ¿Para qué lo necesitas? (trabajo, gaming, oficina)
     • ¿Qué presupuesto tienes en mente?
     • ¿Prefieres mecánico o de membrana?"
```

---

## 🔧 Soluciones Adicionales Recomendadas

### Opción A: Reducir Threshold del Fuzzy Search (Recomendado)

**Archivo**: `src/lib/bot/openclaw-orchestrator.ts`

```typescript
const fuse = new Fuse(context.products, {
    threshold: 0.4,  // Cambiar de 0.6 a 0.4 (más estricto)
    keys: [
        { name: 'name', weight: 0.6 },      // Aumentar peso del nombre
        { name: 'tags', weight: 0.2 },      // Reducir peso de tags
        { name: 'category', weight: 0.2 }
    ]
});
```

**Ventajas**:
- Más preciso
- Menos falsos positivos
- Mejor experiencia de usuario

**Desventajas**:
- Puede no encontrar productos con typos
- Requiere nombres más exactos

---

### Opción B: Filtrar por Categoría

**Agregar lógica de categoría**:

```typescript
// Detectar si busca producto físico o digital
const isPhysicalProduct = /teclado|mouse|monitor|laptop|moto/i.test(searchTerm);

// Filtrar productos antes del fuzzy search
const productsToSearch = isPhysicalProduct 
    ? context.products.filter(p => p.tipo_producto !== 'DIGITAL')
    : context.products;

const fuse = new Fuse(productsToSearch, { ... });
```

**Ventajas**:
- Separa productos físicos de digitales
- Muy preciso
- Mantiene threshold permisivo

**Desventajas**:
- Más código
- Requiere mantenimiento de keywords

---

### Opción C: Mejorar Tags de Productos

**Cambiar tags del Curso de Piano**:

```typescript
// Antes
tags: ['piano', 'música', 'curso', 'instrumento', 'teclado']

// Después
tags: ['piano', 'música', 'curso', 'instrumento', 'piano-teclado', 'instrumento-teclado']
```

**Ventajas**:
- No requiere cambios en código
- Solución a nivel de datos

**Desventajas**:
- Requiere actualizar todos los productos
- No resuelve el problema de fondo

---

## 🎯 Recomendación Final

**Implementar Opción A + Mantener cambio actual**

1. ✅ **Ya implementado**: "teclado" como producto VARIABLE → Hace preguntas
2. 🔧 **Pendiente**: Reducir threshold de 0.6 a 0.4 en fuzzy search
3. 🔧 **Pendiente**: Aumentar peso de 'name' y reducir peso de 'tags'

### Código Sugerido

```typescript
// src/lib/bot/openclaw-orchestrator.ts - list_products_by_category
const fuse = new Fuse(context.products, {
    threshold: 0.4,  // ✅ Más estricto (antes: 0.6)
    keys: [
        { name: 'name', weight: 0.6 },      // ✅ Más peso (antes: 0.5)
        { name: 'tags', weight: 0.2 },      // ✅ Menos peso (antes: 0.3)
        { name: 'category', weight: 0.2 }   // ✅ Igual
    ]
});
```

---

## 📊 Impacto Esperado

### Antes
```
Usuario: "Me interesa un teclado"
Bot: "Mega Pack Curso de Piano Completo" ❌
```

### Después (con cambio actual)
```
Usuario: "Me interesa un teclado"
Bot: "¡Perfecto! Para recomendarte la mejor opción:
     • ¿Para qué lo necesitas?
     • ¿Qué presupuesto tienes?" ✅
```

### Después (con threshold 0.4)
```
Usuario: "Me interesa un teclado"
Bot: [Lista de teclados de computadora]
     • Teclado Mecánico RGB Gaming
     • Teclado Inalámbrico Combo
     • Teclado Ergonómico ✅✅
```

---

## 🧪 Tests Sugeridos

```typescript
// test-teclado-fix.ts
const testCases = [
    {
        input: "Me interesa un teclado",
        expected: "qualification_questions", // Con cambio actual
        // expected: "list_products_by_category", // Con threshold 0.4
        shouldNotInclude: "piano"
    },
    {
        input: "busco teclado mecánico",
        expected: "get_product_with_payment",
        shouldInclude: "mecánico"
    },
    {
        input: "curso de piano",
        expected: "list_products_by_category",
        shouldInclude: "piano"
    }
];
```

---

## 📝 Estado Actual

- ✅ **Implementado**: "teclado" detectado como producto VARIABLE
- ✅ **Efecto**: Bot hace preguntas de calificación
- ⚠️ **Pendiente**: Ajustar threshold fuzzy search (opcional pero recomendado)
- ⚠️ **Pendiente**: Tests de validación

---

## 🔮 Casos Similares a Considerar

Otros términos ambiguos que podrían tener el mismo problema:

1. **"bajo"**: Instrumento musical vs. "bajo precio"
2. **"batería"**: Instrumento musical vs. batería de laptop
3. **"cable"**: Cable de audio vs. cable de red
4. **"adaptador"**: Audio vs. corriente vs. red

**Solución general**: Implementar Opción B (filtrar por categoría) para todos estos casos.

---

**Fecha**: 12 de Febrero de 2026  
**Estado**: ✅ Parcialmente resuelto (hace preguntas)  
**Mejora recomendada**: Ajustar threshold fuzzy search
