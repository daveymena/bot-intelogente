# 🔍 Problema Detectado en Scraper MegaComputer

## ❌ Problema

El buscador de MegaComputer redirige todas las búsquedas a la página de categoría `/categoria-producto/computadores/portatiles/` en lugar de mostrar resultados de búsqueda específicos.

### Evidencia:
```
Buscando: "Mouse Logitech"
→ Redirige a: https://megacomputer.com.co/categoria-producto/computadores/portatiles/

Buscando: "Monitor LG 24"
→ Redirige a: https://megacomputer.com.co/categoria-producto/computadores/portatiles/

Buscando: "Impresora HP"
→ Redirige a: https://megacomputer.com.co/categoria-producto/computadores/portatiles/
```

Resultado: Extrae las mismas 24 imágenes de la página de categoría (no del producto específico).

## ✅ Soluciones Implementadas

### Solución 1: Mejorar detección de URLs
- Filtrar URLs que contengan `/categoria-producto/` o `/categoria/`
- Buscar solo enlaces que apunten a `/producto/` o productos individuales
- Validar que la URL no sea una categoría antes de extraer imágenes

**Archivo**: `scripts/extraer-fotos-megacomputer.ts` (actualizado)

### Solución 2: Estrategia alternativa - Navegar por categorías
Crear un scraper que:
1. Navega directamente a categorías conocidas
2. Extrae URLs de productos individuales
3. Visita cada producto y extrae sus imágenes

**Archivo**: `scripts/test-scraper-megacomputer-v2.ts` (nuevo)

## 🧪 Cómo Probar

### Probar scraper mejorado (Solución 1):
```bash
npx tsx scripts/test-scraper-megacomputer.ts
```

### Probar estrategia por categorías (Solución 2):
```bash
npx tsx scripts/test-scraper-megacomputer-v2.ts
```

Este navegará por categorías reales:
- `computadores/portatiles`
- `perifericos/mouse`
- `perifericos/teclados`
- `monitores`
- `impresoras`

## 📋 Categorías de MegaComputer

```
/categoria-producto/computadores/portatiles/
/categoria-producto/computadores/todo-en-uno/
/categoria-producto/perifericos/mouse/
/categoria-producto/perifericos/teclados/
/categoria-producto/perifericos/diademas/
/categoria-producto/monitores/
/categoria-producto/impresoras/
/categoria-producto/componentes/memorias-ram/
/categoria-producto/componentes/discos-ssd/
/categoria-producto/accesorios/
```

## 🎯 Estrategia Recomendada

### Para productos existentes en la DB:

1. **Mapear productos a categorías**:
   - Portátiles → `computadores/portatiles`
   - Mouse/Teclados → `perifericos/mouse` o `perifericos/teclados`
   - Monitores → `monitores`
   - Impresoras → `impresoras`
   - RAM/SSD → `componentes/memorias-ram` o `componentes/discos-ssd`

2. **Buscar por marca y modelo**:
   - Extraer marca del nombre (Asus, Lenovo, HP, etc.)
   - Navegar a la categoría correspondiente
   - Buscar productos de esa marca
   - Comparar nombres para encontrar coincidencia

3. **Fallback a búsqueda manual**:
   - Si no se encuentra automáticamente
   - Guardar lista de productos sin foto
   - Buscar manualmente y agregar URLs

## 🔧 Script Mejorado Final

Crear un script híbrido que:
1. Intente buscar por nombre (si funciona)
2. Si falla, navegue por categoría según subcategoría del producto
3. Busque por marca dentro de la categoría
4. Compare nombres para encontrar el producto correcto

## 💡 Alternativa: Usar API o Scraping Directo

Si el sitio tiene una API o estructura predecible de URLs:
```
https://megacomputer.com.co/producto/portatil-asus-vivobook-...
```

Podríamos construir URLs directamente basadas en el nombre del producto.

## 📝 Próximos Pasos

1. ✅ Probar `test-scraper-megacomputer-v2.ts` para ver si navegar por categorías funciona
2. Si funciona, crear script que mapee productos DB → categorías MegaComputer
3. Implementar búsqueda por marca dentro de categoría
4. Ejecutar con productos reales cuando DB esté disponible

## 🚨 Nota Importante

El buscador de MegaComputer parece tener un problema o redirección configurada. La estrategia de navegar por categorías es más confiable que usar el buscador.
