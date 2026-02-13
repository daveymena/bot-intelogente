# Fix: Ambigüedad Semántica "Teclado"

## 🚨 Problema Detectado

```
Usuario: "Me interesa un teclado ?"
Bot: [Muestra "Mega Pack Curso de Piano Completo"]
```

**Esperado**: Mostrar teclados de computadora (periféricos)  
**Obtenido**: Muestra curso de piano

---

## 🔍 Causa Raíz

El "Mega Pack Curso de Piano" tiene "teclado" en sus tags porque se refiere al **teclado del piano** (instrumento musical):

```typescript
// scripts/agregar-curso-piano.ts línea 89
const tags = [
  'piano', 'música', 'curso', 'instrumento', 'teclado', // ← AQUÍ
  'clásico', 'jazz', 'blues', 'pop', 'balada', 'dance',
  ...
];
```

El fuzzy search en `openclaw-orchestrator.ts` busca en los tags sin considerar el contexto:

```typescript
const fuse = new Fuse(context.products, { 
  threshold: 0.6, 
  keys: ['name', 'tags', 'description', 'category'] // ← Busca en tags
});
```

---

## 💡 Soluciones Propuestas

### Solución 1: Filtrar por Categoría (RECOMENDADA)

Mejorar el fuzzy search para priorizar la categoría del producto:

```typescript
// En openclaw-orchestrator.ts
const fuse = new Fuse(context.products, {
  threshold: 0.6,
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'category', weight: 0.3 }, // ← Mayor peso a categoría
    { name: 'tags', weight: 0.2 },
    { name: 'description', weight: 0.1 }
  ]
});

// Filtrar por tipo de producto
if (messageLower.includes('teclado')) {
  // Si menciona "piano", "música", "curso" → Cursos
  // Si menciona "computador", "pc", "gaming" → Periféricos
  // Si solo dice "teclado" → Periféricos (más común)
}
```

### Solución 2: Remover "teclado" de tags del curso de piano

```typescript
// scripts/agregar-curso-piano.ts
const tags = [
  'piano', 'música', 'curso', 'instrumento', // ← Sin "teclado"
  'clásico', 'jazz', 'blues', 'pop', 'balada',
  'aprender piano', 'tocar piano', 'improvisación',
  ...
];
```

**Pros**: Solución rápida  
**Contras**: Pierde capacidad de búsqueda para "teclado piano"

### Solución 3: Detección de Contexto en conversation-strategy.ts

Agregar lógica para detectar el contexto de "teclado":

```typescript
private static detectProductContext(messageLower: string): string {
  // Contexto musical
  if (messageLower.match(/piano|música|musica|tocar|aprender|curso.*piano/i)) {
    return 'musical';
  }
  
  // Contexto computación
  if (messageLower.match(/computador|pc|gaming|mecanico|rgb|inalambrico/i)) {
    return 'computer';
  }
  
  // Por defecto: computación (más común)
  return 'computer';
}
```

---

## ✅ Solución Implementada

### Opción Rápida: Agregar "teclado" como producto variable

Actualizar `conversation-strategy.ts` para que "teclado" se trate como producto variable (periférico de computadora):

```typescript
const variableKeywords = [
  'laptop', 'laptops', 'computador', 'computadores', 'pc', 'computadora',
  'moto', 'motos', 'motocicleta', 'impresora', 'impresoras',
  'teclado', 'teclados', 'mouse', 'monitor' // ← Agregado
];
```

**Resultado**:
- "Me interesa un teclado" → Hace preguntas de calificación
- Bot pregunta: "¿Para qué lo necesitas? ¿Gaming o trabajo?"
- Usuario responde y bot muestra teclados de computadora

**Ventaja**: No rompe la búsqueda de curso de piano  
**Desventaja**: No resuelve completamente la ambigüedad

---

## 🎯 Solución Definitiva (Recomendada)

Implementar detección de contexto en el fuzzy search:

```typescript
// En openclaw-orchestrator.ts, método _think()

// Detectar contexto de "teclado"
let contextFilter = null;
if (messageText.toLowerCase().includes('teclado')) {
  const musicalContext = /piano|música|musica|tocar|aprender|curso/i.test(messageText);
  const computerContext = /computador|pc|gaming|mecanico|rgb|inalambrico|periférico/i.test(messageText);
  
  if (musicalContext) {
    contextFilter = (product: any) => 
      product.category?.toLowerCase().includes('curso') || 
      product.category?.toLowerCase().includes('digital');
  } else if (computerContext || (!musicalContext && !computerContext)) {
    // Por defecto: periféricos de computadora
    contextFilter = (product: any) => 
      !product.category?.toLowerCase().includes('curso') &&
      !product.category?.toLowerCase().includes('digital');
  }
}

// Aplicar filtro al fuzzy search
let productsToSearch = context.products;
if (contextFilter) {
  productsToSearch = context.products.filter(contextFilter);
}

const fuse = new Fuse(productsToSearch, { threshold: 0.6, keys: [...] });
```

---

## 📊 Casos de Prueba

### Caso 1: Teclado de computadora (sin contexto)
```
Usuario: "Me interesa un teclado"
Esperado: Preguntas de calificación → Teclados de computadora
```

### Caso 2: Teclado de computadora (con contexto)
```
Usuario: "Busco un teclado mecánico para gaming"
Esperado: Lista de teclados mecánicos gaming
```

### Caso 3: Teclado de piano (con contexto)
```
Usuario: "Quiero aprender a tocar el teclado de piano"
Esperado: Curso de piano
```

### Caso 4: Teclado de piano (explícito)
```
Usuario: "Curso de piano"
Esperado: Mega Pack Curso de Piano
```

---

## 🔧 Implementación Paso a Paso

1. **Corto plazo** (Ya implementado):
   - Agregar "teclado" a productos variables
   - Bot hace preguntas de calificación

2. **Mediano plazo** (Recomendado):
   - Implementar detección de contexto en fuzzy search
   - Filtrar productos por categoría según contexto

3. **Largo plazo** (Opcional):
   - Machine Learning para detectar intención
   - Historial conversacional para contexto

---

## 📝 Notas

- Este es un problema común en e-commerce: **ambigüedad semántica**
- Palabras como "teclado", "mouse", "monitor" pueden tener múltiples significados
- La solución ideal combina:
  1. Detección de contexto
  2. Filtrado por categoría
  3. Preguntas de calificación

---

**Fecha**: 12 de Febrero de 2026  
**Estado**: ⚠️ Solución parcial implementada  
**Prioridad**: Media (afecta experiencia de usuario)  
**Solución definitiva**: Pendiente (detección de contexto en fuzzy search)
