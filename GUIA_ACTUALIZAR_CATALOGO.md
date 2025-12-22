# 🔄 Guía: Actualizar Catálogo con Scrapers

## 🎯 Resumen

Usa los scrapers que ya funcionan bien para actualizar tu catálogo completo.

---

## 🚀 Opciones Disponibles

### 1️⃣ Actualización Completa (TODO)

```bash
actualizar-catalogo-completo.bat
```

**Incluye:**
- ✅ SmartJoys (20-30 productos)
- ✅ Disyvar (100-200 productos)
- ✅ MegaComputer (50-100 productos)

**Tiempo:** 1-2 horas  
**Ideal para:** Actualización mensual

---

### 2️⃣ SmartJoys Solo

```bash
actualizar-smartjoys.bat
```

**Productos:** 20-30  
**Tiempo:** 10-15 minutos  
**Ideal para:** Actualización semanal rápida

---

### 3️⃣ Disyvar Solo

```bash
actualizar-disyvar.bat
```

**Productos:** 100-200  
**Tiempo:** 20-30 minutos  
**Ideal para:** Ampliar catálogo de tecnología

---

### 4️⃣ MegaComputer Solo

```bash
actualizar-megacomputer.bat
```

**Productos:** 50-100  
**Tiempo:** 30-45 minutos  
**Ideal para:** Laptops y computadores

---

## 📊 Proceso de Cada Scraper

### SmartJoys
```
1. Abre navegador (Puppeteer)
2. Visita smartjoys.co
3. Extrae hasta 30 productos
4. Guarda en JSON
5. Importa a BD con margen 20%
```

### Disyvar
```
1. Scrapea con Cheerio (rápido)
2. Descubre categorías automáticamente
3. Extrae 100-200 productos
4. Guarda en JSON
5. Importa a BD
```

### MegaComputer
```
1. Abre navegador (Puppeteer)
2. Visita múltiples categorías
3. Extrae productos con fotos
4. Guarda en JSON
5. Importa/actualiza en BD
```

---

## 📈 Salida Esperada

```
🚀 ACTUALIZACIÓN COMPLETA DEL CATÁLOGO

============================================================
Este proceso va a:
1. ✅ Scrapear SmartJoys (productos nuevos)
2. ✅ Importar SmartJoys a la BD
3. ✅ Scrapear Disyvar (catálogo amplio)
4. ✅ Importar Disyvar a la BD
5. ✅ Scrapear MegaComputer (tecnología)
6. ✅ Importar MegaComputer a la BD
============================================================

📦 Productos actuales en BD: 102

████████████████████████████████████████████████████████████
█  PASO 1/3: SMARTJOYS
████████████████████████████████████████████████████████████

🏪 SCRAPEANDO: SMARTJOYS
📝 Comando: npx tsx scripts/scrape-smartjoys-final.ts

🚀 Scrapeando SmartJoys con Puppeteer...
📥 Cargando página principal...
🔍 Buscando productos en la página...
✅ Encontrados 25 productos

📦 [1/25] Visitando producto...
   ✅ Audífonos Bluetooth TWS
   💰 89,900

...

✅ SmartJoys completado: +25 productos en 420s

████████████████████████████████████████████████████████████
█  PASO 2/3: DISYVAR
████████████████████████████████████████████████████████████

...

============================================================
📊 RESUMEN FINAL DE ACTUALIZACIÓN
============================================================

📦 Productos iniciales: 102
📦 Productos finales: 289
✨ Productos nuevos: 187
⏱️  Tiempo total: 95m 30s

📊 Detalle por tienda:
------------------------------------------------------------
✅ SmartJoys      | +25 productos | 420s
✅ Disyvar        | +142 productos | 1800s
✅ MegaComputer   | +20 productos | 2450s

============================================================
✨ ACTUALIZACIÓN COMPLETADA
============================================================
```

---

## 🎯 Workflow Recomendado

### Primera Vez (Hoy)

```bash
# Opción 1: Todo de una vez
actualizar-catalogo-completo.bat

# Opción 2: Por partes (recomendado)
actualizar-smartjoys.bat      # 15 min
actualizar-disyvar.bat         # 30 min
actualizar-megacomputer.bat    # 45 min
```

### Mantenimiento Semanal

```bash
actualizar-smartjoys.bat
```

### Actualización Mensual

```bash
actualizar-catalogo-completo.bat
```

---

## 💰 Márgenes de Ganancia

### SmartJoys
- **Margen:** 20% sobre precio original
- **Ejemplo:** $50,000 → $60,000

### Disyvar
- **Margen:** Configurable en `import-disyvar.ts`
- **Por defecto:** Sin margen (precio original)

### MegaComputer
- **Margen:** Configurable en `re-importar-megacomputer.ts`
- **Por defecto:** Sin margen (precio original)

### Ajustar Márgenes

Edita los archivos de importación:

```typescript
// scripts/importar-smartjoys.ts
const MARGEN_GANANCIA = 0.20; // 20%

// scripts/import-disyvar.ts
const MARGEN_GANANCIA = 0.15; // 15%

// scripts/re-importar-megacomputer.ts
const MARGEN_GANANCIA = 0.25; // 25%
```

---

## 🔧 Configuración

### Cambiar Cantidad de Productos

**SmartJoys:**
```typescript
// scripts/scrape-smartjoys-final.ts
for (let i = 0; i < Math.min(productosEncontrados.length, 30); i++) {
//                                                          ^^
// Cambiar 30 por el número deseado
```

**Disyvar:**
```typescript
// scripts/scrape-disyvar.ts
const productsToEnrich = Math.min(uniqueProducts.length, 50);
//                                                       ^^
// Cambiar 50 por el número deseado
```

**MegaComputer:**
```typescript
// scripts/re-importar-megacomputer.ts
for (let i = 0; i < Math.min(productosCategoria.length, 10); i++) {
//                                                          ^^
// Cambiar 10 por el número deseado (por categoría)
```

---

## 🐛 Solución de Problemas

### "Error: Puppeteer no funciona"

```bash
npm install puppeteer
```

### "Error: timeout"

Aumentar timeout en el script:
```typescript
timeout: 60000, // 60 segundos
```

### "No se encontraron productos"

1. Verificar conexión a internet
2. Verificar que el sitio esté disponible
3. Revisar logs para ver el error específico

### "Productos duplicados"

Los scripts ya manejan duplicados automáticamente:
- Buscan por nombre
- Actualizan si existe
- Crean si no existe

---

## 📊 Verificar Resultados

### En Terminal

```bash
# Ver total de productos
npx tsx scripts/ver-productos.ts

# Ver productos sin fotos
ver-productos-sin-fotos.bat

# Ver productos por categoría
npx tsx scripts/ver-productos.ts --categoria Laptops
```

### En Dashboard

```
http://localhost:3000/dashboard
```

1. Ir a "Productos"
2. Verificar productos nuevos
3. Revisar fotos
4. Ajustar precios si es necesario

### En Catálogo Público

```
http://localhost:3000/catalogo
```

1. Probar búsquedas
2. Verificar imágenes
3. Revisar descripciones

---

## 📝 Archivos Generados

Cada scraper genera un archivo JSON:

```
scripts/productos-dropshipping.json    (SmartJoys)
scripts/disyvar-productos.json         (Disyvar)
scripts/productos-megacomputer-completo.json (MegaComputer)
```

Estos archivos se pueden:
- ✅ Revisar manualmente
- ✅ Editar antes de importar
- ✅ Usar como backup
- ✅ Compartir con otros

---

## 🎯 Próximos Pasos

### Después de Actualizar

1. **Verificar productos**
   - Dashboard → Productos
   - Revisar que se importaron correctamente

2. **Ajustar precios**
   - Agregar márgenes de ganancia
   - Considerar competencia

3. **Mejorar descripciones**
   ```bash
   npx tsx scripts/mejorar-descripciones-ia.ts
   ```

4. **Probar bot**
   - Enviar mensaje de prueba
   - Verificar respuestas
   - Probar envío de fotos

---

## 📚 Documentación Relacionada

- `ESTADO_SCRAPERS_Y_DROPSHIPPING.md` - Estado general
- `GUIA_RAPIDA_SMARTJOYS.md` - Guía SmartJoys
- `DROPSHIPPING_DISYVAR.md` - Guía Disyvar
- `README_SCRAPER_FOTOS.md` - Sistema de fotos

---

## 🚀 Comando Recomendado para EMPEZAR

```bash
actualizar-smartjoys.bat
```

Este es el más rápido (10-15 min) y te dará 20-30 productos nuevos para probar.

---

## ✨ Tips

### Para Mejores Resultados

1. **Ejecutar en horarios de baja demanda** (noche)
2. **Mantener conexión estable**
3. **No interrumpir el proceso**
4. **Revisar logs si hay errores**

### Para Evitar Bloqueos

1. **No ejecutar muy seguido** (máximo 1 vez al día)
2. **Respetar delays** configurados
3. **No hacer múltiples scrapers simultáneos**

### Para Optimizar

1. **Empezar con SmartJoys** (más rápido)
2. **Luego Disyvar** (más productos)
3. **Finalmente MegaComputer** (más completo)

---

## 🎉 ¡Listo!

Tu sistema está configurado para actualizar el catálogo usando los scrapers que ya funcionan bien.

**Comando para empezar:**

```bash
actualizar-smartjoys.bat
```

O si tienes tiempo:

```bash
actualizar-catalogo-completo.bat
```

---

**Última actualización:** 25 de noviembre de 2025
