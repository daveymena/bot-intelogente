# Corrección: Búsqueda con Subcategorías

## Problema Identificado

Cuando el usuario busca "portátiles", el bot mostraba productos incorrectos como:
- Cintas para impresora
- Tintas
- Pilas

Esto ocurría porque el sistema de scoring no consideraba las **subcategorías** ni penalizaba productos de categorías completamente diferentes.

## Solución Implementada

### 1. Detección de Categoría desde la Query

Agregamos función `detectCategoryFromQuery()` que identifica la categoría esperada:

```typescript
// Ejemplos:
"portátiles" → ['computador', 'laptop', 'portatil']
"motos" → ['moto', 'motocicleta']
"curso de piano" → ['curso', 'educacion', 'digital']
"tintas" → ['accesorio', 'consumible', 'tinta']
```

### 2. Penalización por Categoría Incorrecta

Si la query sugiere una categoría específica y el producto NO está en esa categoría:

```typescript
score -= 50; // Penalización SEVERA
```

**Ejemplo:**
- Query: "portátiles"
- Categoría esperada: computador, laptop
- Producto: "Tinta HP" (categoría: accesorio)
- Resultado: **-50 puntos** → No aparece en resultados

### 3. Bonus por Subcategoría

Si las keywords coinciden con la subcategoría del producto:

```typescript
score += 15; // Por cada keyword en subcategoría
```

**Ejemplo:**
- Query: "laptop gaming"
- Producto: "Laptop ASUS ROG" (subcategory: "gaming")
- Resultado: **+15 puntos** → Prioridad alta

## Categorías Detectadas

El sistema ahora detecta automáticamente:

1. **Computadores**: portátil, laptop, computador, pc, notebook
2. **Motos**: moto, motocicleta, scooter
3. **Cursos**: curso, aprender, estudiar, clase
4. **Megapacks**: megapack, pack, paquete, colección
5. **Servicios**: reparación, servicio, técnico, arreglo
6. **Accesorios**: tinta, cartucho, toner, cinta, papel
7. **Pilas**: pila, batería, cargador, energía

## Resultado

Ahora cuando buscas "portátiles":
- ✅ Solo muestra laptops y computadores portátiles
- ❌ NO muestra tintas, pilas ni accesorios
- 🎯 Prioriza productos con subcategoría "portátil" o "laptop"

## Archivos Modificados

- `src/agents/search-agent.ts`
  - Agregada función `detectCategoryFromQuery()`
  - Agregada penalización por categoría incorrecta (-50 puntos)
  - Agregado bonus por subcategoría (+15 puntos)
  - Mejorado uso del campo `subcategory` en scoring

## Próximos Pasos

Para mejorar aún más:

1. **Asignar subcategorías a productos existentes** (manual o script)
2. **Agregar más categorías** al detector
3. **Ajustar pesos** según feedback de usuarios

## Probar Ahora

```bash
# Reiniciar el bot
npm run dev

# Probar búsquedas:
# - "portátiles" → Solo laptops
# - "tintas" → Solo tintas/cartuchos
# - "motos" → Solo motocicletas
# - "curso de piano" → Solo cursos de piano
```

---

**Fecha:** 20 Nov 2025  
**Estado:** ✅ Implementado y listo para probar
