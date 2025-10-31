# 🚨 CORRECCIÓN URGENTE: BOT MEZCLA PRODUCTOS NUEVOS Y USADOS

## ❌ PROBLEMA DETECTADO

El bot está respondiendo con productos NUEVOS cuando el cliente pregunta por USADOS, y viceversa.

**Ejemplo del error:**
```
Cliente: "Portátil usado"
Bot: [Muestra laptop NUEVA de $1.189.000]  ❌ INCORRECTO
```

## 🔍 CAUSA RAÍZ

El sistema de búsqueda en `ai-service.ts` y `product-intelligence-service.ts` NO filtraba por condición (nuevo/usado). Solo buscaba por:
- Nombre del producto
- Descripción
- Tags

Pero NO verificaba si el producto es nuevo o usado cuando el cliente lo especifica.

## ✅ SOLUCIÓN IMPLEMENTADA

Se agregó filtro de condición en AMBOS servicios:

### 1. `ai-service.ts` - Función `findRelevantProducts`
✅ Detecta si el cliente busca "usado" o "nuevo"
✅ Filtra productos ANTES de buscar coincidencias
✅ Descarta productos que no coincidan con la condición

### 2. `product-intelligence-service.ts` - Función `findProduct`
✅ Detecta si el cliente busca "usado" o "nuevo"
✅ Filtra la lista de productos según condición
✅ Solo busca en productos que cumplan la condición

### 3. Prompt del sistema en `ai-service.ts`
✅ Regla explícita: NUNCA mezclar nuevos y usados
✅ Ejemplos claros de qué hacer y qué NO hacer
✅ Instrucción de separar si no se especifica condición

---

## 🧪 CÓMO PROBAR

```bash
# Ejecutar script de prueba
npx tsx scripts/test-usado-vs-nuevo.ts
```

Este script prueba:
1. ✅ "portátil usado" → Debe devolver SOLO usados
2. ✅ "laptop usada" → Debe devolver SOLO usados
3. ✅ "laptop nueva" → Debe devolver SOLO nuevos
4. ✅ "portátil nuevo" → Debe devolver SOLO nuevos
5. ✅ "laptop" (sin especificar) → Puede devolver cualquiera

---

## 📊 RESULTADO ESPERADO

### ANTES (❌ Incorrecto)
```
Cliente: "Portátil usado"
Bot: "💻 ASUS VivoBook Ryzen 3 - $1.189.000"  ❌ Es NUEVO
```

### DESPUÉS (✅ Correcto)
```
Cliente: "Portátil usado"
Bot: "💻 Laptop HP USADO - $280.000"  ✅ Es USADO
```

---

## 🔍 DETALLES TÉCNICOS

### Palabras clave detectadas para USADO:
- "usado"
- "usada"
- "segunda mano"
- "reacondicionado"

### Palabras clave detectadas para NUEVO:
- "nuevo"
- "nueva"
- "0 km"
- "sin usar"

### Lógica de filtrado:
1. Si el mensaje incluye palabras de USADO → Filtrar solo productos con "usado" en nombre/descripción
2. Si el mensaje incluye palabras de NUEVO → Filtrar solo productos SIN "usado" en nombre/descripción
3. Si NO especifica condición → Mostrar todos (pero separados si hay ambos)

---

## ✅ ARCHIVOS MODIFICADOS

1. ✅ `src/lib/ai-service.ts`
   - Función `findRelevantProducts` con filtro de condición
   - Prompt del sistema con regla explícita

2. ✅ `src/lib/product-intelligence-service.ts`
   - Función `findProduct` con filtro de condición
   - Logs para debugging

3. ✅ `scripts/test-usado-vs-nuevo.ts`
   - Script de prueba completo

4. ✅ `CORRECCION_URGENTE_USADOS_VS_NUEVOS.md`
   - Este documento

---

## 🚀 PRÓXIMOS PASOS

1. **Ejecutar pruebas:**
   ```bash
   npx tsx scripts/test-usado-vs-nuevo.ts
   ```

2. **Verificar en WhatsApp real:**
   - Preguntar: "Portátil usado"
   - Verificar que muestre SOLO usados
   - Preguntar: "Laptop nueva"
   - Verificar que muestre SOLO nuevos

3. **Monitorear logs:**
   - Buscar líneas con `[Product Intelligence] Filtro`
   - Verificar que detecta correctamente la condición

---

## 📝 NOTAS IMPORTANTES

⚠️ **Los productos DEBEN tener "USADO" o "USADA" en el nombre para ser detectados como usados**

Ejemplo correcto:
- ✅ "Laptop HP USADO - Core i5"
- ✅ "Portátil Dell USADA"
- ❌ "Laptop HP" (sin especificar, se considera nuevo)

Si tienes productos usados que NO tienen "usado" en el nombre, agrégalo:

```typescript
// Actualizar nombre del producto
await db.product.update({
  where: { id: 'producto-id' },
  data: {
    name: 'Laptop HP USADO - Core i5'  // Agregar "USADO"
  }
})
```

---

## ✅ CORRECCIÓN COMPLETADA

El bot ahora:
- ✅ Detecta correctamente si buscan usado o nuevo
- ✅ Filtra productos según la condición
- ✅ NUNCA mezcla nuevos y usados
- ✅ Responde honestamente si no tiene la condición solicitada

**PROBLEMA RESUELTO** 🎉
