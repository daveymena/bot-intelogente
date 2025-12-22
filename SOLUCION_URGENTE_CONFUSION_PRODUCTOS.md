# 🚨 Solución Urgente: Confusión de Productos

## 🎯 Problema Detectado

**Usuario busca**: "uno para diseñar" (portátil para diseño)

**Bot responde**:
1. ✅ Portátiles para diseño (correcto)
2. ❌ Mega Pack 40 de cursos (incorrecto)

## 🔍 Causa Raíz

El bot está buscando por la palabra "diseñar" y encuentra:
- Portátiles para diseño ✅
- Cursos de diseño ❌ (no es lo que busca)

## ✅ Solución Inmediata

### Opción 1: Filtrar por Categoría de Producto

```typescript
// En product-intelligence-service.ts
static async findProduct(query: string, userId: string) {
  // Detectar si busca producto físico o digital
  const isPhysicalProduct = query.match(/portátil|laptop|computador|pc/i)
  
  const products = await db.product.findMany({
    where: {
      userId,
      status: 'AVAILABLE',
      // 🎯 Filtrar por tipo de producto
      category: isPhysicalProduct ? 'PHYSICAL' : undefined
    }
  })
}
```

### Opción 2: Usar Categorización Inteligente (Mejor)

```typescript
// Después de ejecutar npm run categorize:push
const products = await db.product.findMany({
  where: {
    userId,
    mainCategory: 'Tecnología',  // No "Cursos Digitales"
    subCategory: 'Laptops',
    isAccessory: false
  }
})
```

## 🚀 Implementación Rápida

### Paso 1: Ejecutar Categorización

```bash
npm run categorize:push
```

Esto categorizará:
- Portátiles → `mainCategory: "Tecnología"`, `subCategory: "Laptops"`
- Cursos → `mainCategory: "Cursos Digitales"`, `subCategory: "Diseño"`

### Paso 2: Actualizar Búsqueda

Modificar `product-intelligence-service.ts` para usar categorías:

```typescript
// Detectar intención
const intent = detectIntent(query)

if (intent.type === 'laptop_search') {
  // Buscar SOLO laptops
  const laptops = await db.product.findMany({
    where: {
      userId,
      mainCategory: 'Tecnología',
      subCategory: 'Laptops',
      isAccessory: false
    }
  })
  return laptops
}

if (intent.type === 'course_search') {
  // Buscar SOLO cursos
  const courses = await db.product.findMany({
    where: {
      userId,
      mainCategory: 'Cursos Digitales'
    }
  })
  return courses
}
```

## 🎯 Resultado Esperado

**Usuario busca**: "uno para diseñar"

**Bot responde**:
1. ✅ Portátil Asus Vivobook (para diseño)
2. ✅ Portátil HP (para diseño)
3. ✅ Portátil Lenovo (para diseño)

❌ NO muestra cursos de diseño

## 📊 Detección de Intención

```typescript
function detectIntent(query: string) {
  const queryLower = query.toLowerCase()
  
  // Busca portátil/laptop
  if (queryLower.match(/portátil|laptop|computador|pc|uno para/i)) {
    return {
      type: 'laptop_search',
      category: 'Tecnología',
      subCategory: 'Laptops'
    }
  }
  
  // Busca curso
  if (queryLower.match(/curso|aprender|capacitación|mega pack/i)) {
    return {
      type: 'course_search',
      category: 'Cursos Digitales'
    }
  }
  
  return { type: 'general' }
}
```

## 🔧 Implementación Completa

Voy a crear el código actualizado ahora mismo...
