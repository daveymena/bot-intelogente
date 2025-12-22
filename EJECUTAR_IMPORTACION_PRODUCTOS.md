# 🚀 GUÍA DE IMPORTACIÓN DE PRODUCTOS CON FOTOS

## ⚡ OPCIÓN RÁPIDA (Todo automático)

```bash
# Ejecutar todo el proceso de una vez
importar-todos-productos-con-fotos.bat
```

Este script hará:
1. ✅ Scrapear MegaComputer
2. ✅ Importar MegaComputer a BD
3. ✅ Importar Disyvar (dropshipping)
4. ✅ Scrapear SmartJoys
5. ✅ Importar SmartJoys a BD

---

## 🔧 OPCIÓN MANUAL (Paso a paso)

### PASO 1: Scrapear MegaComputer
```bash
node scripts/scraper-megacomputer-completo.js
```
**Resultado**: `scripts/productos-megacomputer-completo.json`

### PASO 2: Importar MegaComputer a BD
```bash
npx tsx scripts/importar-megacomputer-db.ts
```
**Resultado**: ~50-100 productos físicos con fotos

### PASO 3: Importar Disyvar (Dropshipping)
```bash
node importar-dropshipping-disyvar.js
```
**Resultado**: 30 productos dropshipping con margen 30%

### PASO 4: Scrapear SmartJoys
```bash
npx tsx scripts/scrape-smartjoys-final.ts
```
**Resultado**: `scripts/productos-dropshipping.json`

### PASO 5: Importar SmartJoys a BD
```bash
npx tsx scripts/importar-smartjoys-db.ts
```
**Resultado**: ~30 productos dropshipping con margen $20,000

---

## 📊 RESULTADO ESPERADO

| Fuente | Cantidad | Tipo | Margen | Fotos |
|--------|----------|------|--------|-------|
| **MegaComputer** | 50-100 | Físicos | Precio real | ✅ URLs reales |
| **Disyvar** | 30 | Dropshipping | +30% | ✅ URLs reales |
| **SmartJoys** | 30 | Dropshipping | +$20,000 | ✅ URLs reales |
| **TOTAL** | **110-160** | **Mixto** | **Variable** | **✅ Todas con fotos** |

---

## 🔍 VERIFICAR PRODUCTOS IMPORTADOS

```bash
# Ver productos en la base de datos
npx tsx scripts/ver-productos.js

# Ver solo productos con fotos
npx tsx scripts/ver-productos.js | findstr "images"
```

---

## ⚠️ NOTAS IMPORTANTES

### MegaComputer
- ✅ Productos originales con garantía
- ✅ Precios reales de la tienda
- ✅ Links directos a MegaComputer
- ✅ Fotos desde CDN de MegaComputer

### Disyvar (Dropshipping)
- ✅ Margen de ganancia: 30%
- ✅ Stock: 50 unidades
- ✅ Categoría: PHYSICAL
- ✅ Tiempo de entrega: 3-5 días

### SmartJoys (Dropshipping)
- ✅ Margen de ganancia: $20,000 COP
- ✅ Stock: 50 unidades
- ✅ Categoría: PHYSICAL
- ✅ Tiempo de entrega: 3-5 días

---

## 🛠️ SOLUCIÓN DE PROBLEMAS

### Error: "No se encontró el archivo JSON"
**Solución**: Ejecuta primero el scraper correspondiente

### Error: "No se encontró usuario admin"
**Solución**: Verifica que existe un usuario con email:
- daveymena16@gmail.com
- deinermena25@gmail.com

### Error: "Timeout en scraping"
**Solución**: 
- Verifica tu conexión a internet
- Intenta de nuevo (los scrapers tienen reintentos)

### Error: "Prisma error"
**Solución**:
```bash
npx prisma generate
npx prisma db push
```

---

## 📝 LOGS Y ARCHIVOS GENERADOS

```
scripts/
├── productos-megacomputer-completo.json    # Productos MegaComputer
├── productos-dropshipping.json             # Productos SmartJoys
└── disyvar-productos.json                  # Productos Disyvar (si existe)
```

---

## 🎯 PRÓXIMOS PASOS

Después de importar:

1. **Verificar productos en el dashboard**
   - http://localhost:3000/dashboard

2. **Probar el bot con productos reales**
   ```bash
   npm run dev
   ```

3. **Actualizar fotos de megapacks** (opcional)
   - Los megapacks mantienen su imagen genérica
   - Se pueden actualizar manualmente desde el dashboard

---

## ✅ CHECKLIST

- [ ] Ejecutar scraper MegaComputer
- [ ] Importar MegaComputer a BD
- [ ] Importar Disyvar
- [ ] Ejecutar scraper SmartJoys
- [ ] Importar SmartJoys a BD
- [ ] Verificar productos en dashboard
- [ ] Probar bot con productos reales
- [ ] Verificar que todas las fotos cargan correctamente

---

## 🚀 COMANDO RÁPIDO

```bash
# Todo en uno
importar-todos-productos-con-fotos.bat
```

¡Listo! Tendrás ~110-160 productos con fotos reales en tu base de datos.
