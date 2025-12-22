# ✅ SOLUCIÓN: Búsqueda de Computadores Corregida

## 🐛 Problema Identificado

Cuando el cliente preguntaba por "computadores" o "portátiles", el bot mostraba productos incorrectos (cursos, megapacks, accesorios) en lugar de los portátiles reales.

### Causa Raíz

1. **Todos los productos tienen categoría `PHYSICAL`** sin subcategorías específicas
2. **No hay tags** en los productos para diferenciar tipos
3. **La búsqueda solo filtraba por categoría** sin considerar el contenido del nombre/descripción
4. **No había ranking de relevancia** - mostraba productos en orden cronológico

## 🔧 Solución Implementada

### 1. Búsqueda Semántica con Expansión de Keywords

**Archivo:** `src/lib/intelligent-product-query-system.ts`

- Agregada función `expandKeywords()` que convierte keywords en sinónimos:
  - `"computador"` → `["portátil", "portatil", "laptop", "notebook"]`
  - `"celular"` → `["celular", "teléfono", "smartphone", "móvil"]`
  - etc.

- Agregada función `extractKeywordsFromMessage()` para detección local cuando la IA falla

### 2. Sistema de Ranking Inteligente

**Función:** `rankProducts()`

Asigna puntos a cada producto:
- ✅ **+100 puntos**: Keyword en el nombre del producto
- ✅ **+10 puntos**: Keyword en la descripción
- ✅ **+20 puntos**: Precio > $1.000.000 (productos principales)
- ✅ **+10 puntos**: Precio > $500.000
- ❌ **-50 puntos**: Palabras de accesorios (base, soporte, protector, ventilador, etc.)

### 3. Búsqueda Ampliada + Ranking

- Busca hasta 20 productos (antes: 4)
- Aplica ranking por relevancia
- Devuelve los top 4 más relevantes

## 📊 Resultados

### Antes
```
Cliente: "Quiero ver portátiles"
Bot: 
  - Curso Completo de Piano Online
  - Mega Pack 02: Cursos Programación Web
  - Mega Pack 04: Cursos Edición de Video
  ❌ INCORRECTO
```

### Después
```
Cliente: "Quiero ver portátiles"
Bot:
  - Portátil Asus Vivobook 16 (Score: 130)
  - Portátil Asus Vivobook 15 (Score: 130)
  - Portátil Asus Vivobook Go (Score: 130)
  - Portátil Acer AL15 (Score: 130)
  ✅ CORRECTO
```

## 🧪 Pruebas Realizadas

**Script:** `scripts/test-busqueda-local.ts`

Resultados:
- ✅ 15 productos encontrados con keywords de "computador"
- ✅ Top 10 son todos portátiles reales (Asus, Acer)
- ✅ Accesorios (bases, protectores) quedan fuera del top 4
- ✅ Ranking funciona correctamente

## 🚀 Próximos Pasos Recomendados

### Opcional: Mejorar Categorización de Productos

Para búsquedas aún más precisas, considera:

1. **Agregar subcategorías:**
   ```typescript
   subcategory: "LAPTOP" | "DESKTOP" | "TABLET" | "PHONE" | "ACCESSORY"
   ```

2. **Agregar tags relevantes:**
   ```typescript
   tags: "laptop,portatil,asus,gaming,trabajo"
   ```

3. **Script de migración:**
   ```bash
   npx tsx scripts/categorizar-productos-automatico.ts
   ```

Pero **NO es necesario** - el sistema actual funciona bien con búsqueda semántica + ranking.

## 📝 Archivos Modificados

- ✅ `src/lib/intelligent-product-query-system.ts` - Sistema de búsqueda mejorado
- ✅ `scripts/test-busqueda-local.ts` - Script de prueba
- ✅ `scripts/test-busqueda-computadores.ts` - Prueba con IA
- ✅ `scripts/debug-productos-categoria.ts` - Diagnóstico

## ✅ Estado

**SOLUCIONADO** - El bot ahora muestra correctamente los portátiles cuando el cliente pregunta por computadores.
