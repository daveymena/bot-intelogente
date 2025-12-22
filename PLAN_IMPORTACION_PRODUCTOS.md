# 📦 PLAN DE IMPORTACIÓN DE PRODUCTOS CON FOTOS

## 🎯 OBJETIVO
Importar productos con fotos reales desde:
1. ✅ **MegaComputer** (productos físicos con fotos)
2. ✅ **Disyvar** (dropshipping con fotos)
3. ✅ **SmartJoys** (dropshipping con fotos)

## 📋 PASOS A EJECUTAR

### 1️⃣ SCRAPEAR MEGACOMPUTER (Productos con fotos)
```bash
# Ejecutar scraper de MegaComputer
node scripts/scraper-megacomputer-completo.js
```
**Resultado esperado**: `productos-megacomputer-completo.json`
- Portátiles, impresoras, monitores, accesorios
- Todas las fotos desde megacomputer.com.co
- Precios reales

### 2️⃣ IMPORTAR MEGACOMPUTER A LA BASE DE DATOS
```bash
# Crear script de importación
npx tsx scripts/importar-megacomputer-db.ts
```

### 3️⃣ IMPORTAR DISYVAR (Dropshipping)
```bash
# Ya existe el script
node importar-dropshipping-disyvar.js
```
**Características**:
- 30 productos con imágenes
- Margen de ganancia: 30%
- Categoría: PHYSICAL

### 4️⃣ SCRAPEAR SMARTJOYS (Dropshipping)
```bash
# Ejecutar scraper de SmartJoys
npx tsx scripts/scrape-smartjoys-final.ts
```
**Resultado esperado**: `scripts/productos-dropshipping.json`

### 5️⃣ IMPORTAR SMARTJOYS A LA BASE DE DATOS
```bash
# Crear script de importación
npx tsx scripts/importar-smartjoys-db.ts
```

## 📊 RESUMEN ESPERADO

| Fuente | Cantidad | Tipo | Fotos |
|--------|----------|------|-------|
| MegaComputer | ~50-100 | Físicos | ✅ URLs reales |
| Disyvar | 30 | Dropshipping | ✅ URLs reales |
| SmartJoys | ~30 | Dropshipping | ✅ URLs reales |
| **TOTAL** | **~110-160** | **Mixto** | **✅ Todas con fotos** |

## 🚀 EJECUCIÓN RÁPIDA

```bash
# 1. Scrapear MegaComputer
node scripts/scraper-megacomputer-completo.js

# 2. Importar MegaComputer (crear script)
npx tsx scripts/importar-megacomputer-db.ts

# 3. Importar Disyvar
node importar-dropshipping-disyvar.js

# 4. Scrapear SmartJoys
npx tsx scripts/scrape-smartjoys-final.ts

# 5. Importar SmartJoys (crear script)
npx tsx scripts/importar-smartjoys-db.ts
```

## ✅ VENTAJAS
- ✅ Todos los productos tendrán fotos reales
- ✅ Precios actualizados
- ✅ Descripciones completas
- ✅ Links de pago/compra
- ✅ Categorización automática

## 📝 NOTAS
- Los megapacks se dejan como están (con imagen genérica)
- Se puede volver a scrapear cuando sea necesario
- Los productos dropshipping tienen margen de ganancia incluido
