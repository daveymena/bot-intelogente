# 🔧 Corrección Urgente - Search Agent

## Problemas Detectados

### 1. ❌ Variable Incorrecta en Consulta
**Línea 236 de `src/agents/search-agent.ts`:**
```typescript
// ANTES (❌ Incorrecto)
userId: memory.userId, // memory no existe en este contexto

// DESPUÉS (✅ Correcto)
userId: userId, // Usar el parámetro de la función
```

### 2. ❌ Extracción de Nombre de Producto
El sistema estaba guardando frases completas como nombre de producto:
- Guardaba: `"piano". ¿te gustaría ver opciones similares o otra categoría?`
- Debería guardar: `piano`

**Solución:** Mejorada función `cleanExtractedProductName` para cortar en signos de interrogación.

## Cambios Aplicados

### 1. Search Agent (`src/agents/search-agent.ts`)
```typescript
const dbProducts = await db.product.findMany({
  where: {
    userId: userId, // ✅ Corregido
    status: 'AVAILABLE',
    OR: orConditions.flatMap(c => c.OR)
  }
});
```

### 2. Deep Reasoning Agent (`src/agents/deep-reasoning-agent.ts`)
```typescript
private static cleanExtractedProductName(productName: string): string {
  let cleaned = productName;

  // 🔪 CORTAR en signos de interrogación o puntos
  cleaned = cleaned.split(/[?¿.]/)[0].trim();

  // Remover comillas y paréntesis
  cleaned = cleaned.replace(/["'()]/g, '').trim();

  // Límite de longitud más estricto
  if (cleaned.length < 3 || cleaned.length > 50) {
    return '';
  }

  return cleaned;
}
```

## Pruebas Realizadas

### Test de Búsqueda Directa
```bash
npx tsx scripts/test-busqueda-curso-piano-directo.ts
```

**Resultado:**
- ✅ Encuentra 10 productos
- ✅ Curso de Piano es el primero
- ✅ Búsqueda funciona correctamente

### Problema Identificado
El search-agent estaba fallando porque `memory.userId` no existe en el contexto de la función `simpleSearch`. Debe usar el parámetro `userId` que recibe.

## Próximos Pasos

1. ✅ Reiniciar el servidor
2. ✅ Probar búsqueda: "me interesa el curso de piano"
3. ✅ Verificar que encuentre el producto
4. ✅ Verificar que no guarde nombres corruptos

## Comandos

```bash
# Reiniciar servidor
npm run dev

# Probar búsqueda
# Enviar por WhatsApp: "me interesa el curso de piano"
```

---

**Fecha:** 22 de noviembre de 2025
**Estado:** ⚠️ Requiere reinicio del servidor
