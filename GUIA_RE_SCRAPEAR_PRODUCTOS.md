# 🔄 Guía: Re-Scrapear y Actualizar Productos con Fotos

## 📋 Resumen

Esta guía te ayudará a actualizar todos tus productos existentes con fotos reales extraídas de sus tiendas originales.

---

## 🎯 ¿Qué hace este sistema?

1. **Detecta productos sin fotos** en tu base de datos
2. **Identifica el origen** (MegaComputer, SmartJoys, Disyvar, Megapacks)
3. **Re-scrapea** la tienda original para obtener fotos reales
4. **Actualiza automáticamente** la base de datos

---

## 🚀 Opciones de Ejecución

### Opción 1: Solo Productos Sin Fotos (Rápido)

```bash
re-scrapear-fotos-ahora.bat
```

**Qué hace:**
- ✅ Busca productos sin fotos (máximo 50)
- ✅ Re-scrapea según origen detectado
- ✅ Actualiza solo los que no tienen imágenes

**Tiempo:** 15-30 minutos

**Ideal para:** Primera actualización o mantenimiento rápido

---

### Opción 2: Re-importar MegaComputer Completo

```bash
re-importar-megacomputer-ahora.bat
```

**Qué hace:**
- ✅ Scrapea catálogo completo de MegaComputer
- ✅ Extrae todas las fotos de cada producto
- ✅ Actualiza productos existentes
- ✅ Crea productos nuevos

**Tiempo:** 30-60 minutos

**Ideal para:** Actualizar catálogo completo de MegaComputer

---

### Opción 3: Actualización Completa (Todo)

```bash
actualizar-todo-con-fotos.bat
```

**Qué hace:**
- ✅ Re-scrapea productos sin fotos
- ✅ Re-importa MegaComputer completo
- ✅ Actualiza SmartJoys
- ✅ Actualiza Disyvar

**Tiempo:** 1-2 horas

**Ideal para:** Actualización mensual completa

---

## 📊 Detección Automática de Origen

El sistema detecta automáticamente de dónde viene cada producto:

### MegaComputer
- Tags: `megacomputer`
- Metadata: `supplier: 'MegaComputer'`
- Busca en: https://megacomputer.com.co

### SmartJoys
- Tags: `smartjoys`
- Metadata: `supplier: 'SmartJoys'`
- Busca en: https://smartjoys.co

### Disyvar
- Tags: `disyvar`
- Metadata: `supplier: 'Disyvar'`
- Busca en: https://disyvar.com.co

### Megapacks
- Tags: `megapack`
- Nombre contiene: "megapack" o "mega pack"
- Usa imágenes genéricas o de Google Drive

### Dropshipping General
- Tags: `dropshipping`
- Busca en múltiples tiendas

---

## 🔍 Proceso de Búsqueda

Para cada producto sin fotos:

1. **Detecta origen** del producto
2. **Busca en la tienda** usando el nombre del producto
3. **Encuentra el primer resultado** que coincida
4. **Visita la página del producto**
5. **Extrae todas las imágenes** disponibles
6. **Actualiza la base de datos**

---

## 📈 Salida Esperada

```
🚀 RE-SCRAPEANDO PRODUCTOS Y ACTUALIZANDO FOTOS

============================================================

📦 Productos a actualizar: 45

[1/45] Laptop HP 15-dy2021la
------------------------------------------------------------
   🏪 Origen detectado: MEGACOMPUTER
   🔍 Buscando en MegaComputer...
   ✅ Actualizado: 5 imágenes
      1. https://megacomputer.com.co/images/laptop-hp-1.jpg
      2. https://megacomputer.com.co/images/laptop-hp-2.jpg
      3. https://megacomputer.com.co/images/laptop-hp-3.jpg
      4. https://megacomputer.com.co/images/laptop-hp-4.jpg
      5. https://megacomputer.com.co/images/laptop-hp-5.jpg

[2/45] Audífonos Bluetooth TWS
------------------------------------------------------------
   🏪 Origen detectado: SMARTJOYS
   🔍 Buscando en SmartJoys...
   ✅ Actualizado: 3 imágenes

...

============================================================
📊 RESUMEN FINAL
============================================================
✅ Actualizados: 42
⚠️  Sin cambios: 3
❌ Errores: 0
📦 Total procesados: 45
============================================================

✨ Proceso completado!
```

---

## ⚙️ Configuración

### Ajustar Velocidad

Edita `scripts/re-scrapear-y-actualizar-fotos.ts`:

```typescript
const DELAY_ENTRE_PRODUCTOS = 3000; // 3 segundos (aumentar si hay errores)
```

### Cambiar Límite de Productos

```typescript
const MAX_PRODUCTOS_POR_LOTE = 50; // Procesar 50 a la vez
```

### Timeout de Navegación

```typescript
const TIMEOUT_NAVEGACION = 30000; // 30 segundos
```

---

## 🐛 Solución de Problemas

### "No se encontraron productos sin fotos"

✅ **Solución:** Todos tus productos ya tienen fotos. ¡Excelente!

Para verificar:
```bash
ver-productos-sin-fotos.bat
```

---

### "Error en [Tienda]: timeout"

⚠️ **Causa:** La tienda tardó mucho en responder

✅ **Solución:** 
1. Aumentar `TIMEOUT_NAVEGACION` a 60000 (60 segundos)
2. Verificar conexión a internet
3. Intentar de nuevo más tarde

---

### "Origen detectado: DESCONOCIDO"

⚠️ **Causa:** El producto no tiene tags o metadata de origen

✅ **Solución:** El script intentará buscar en todas las tiendas automáticamente

---

### "No se encontraron imágenes"

⚠️ **Causa:** El producto no existe en la tienda o cambió de nombre

✅ **Solución:** 
1. Verificar manualmente en la tienda
2. Actualizar nombre del producto
3. Agregar fotos manualmente desde el dashboard

---

### Puppeteer no funciona

⚠️ **Causa:** Chrome no está instalado o falta dependencia

✅ **Solución:**
```bash
npm install puppeteer
```

---

## 📝 Comandos Útiles

### Ver Estadísticas

```bash
# Ver productos sin fotos
ver-productos-sin-fotos.bat

# Ver todos los productos
ver-productos.bat

# Ver productos por categoría
npx tsx scripts/ver-productos.ts
```

### Actualizar Fotos

```bash
# Solo sin fotos
re-scrapear-fotos-ahora.bat

# MegaComputer completo
re-importar-megacomputer-ahora.bat

# Todo
actualizar-todo-con-fotos.bat
```

### Importar Nuevos Productos

```bash
# SmartJoys
npx tsx scripts/scrape-smartjoys-final.ts
npx tsx scripts/importar-smartjoys.ts

# Disyvar
npx tsx scripts/scrape-disyvar.ts
npx tsx scripts/import-disyvar.ts
```

---

## 🎯 Workflow Recomendado

### Primera Vez

1. **Verificar estado actual**
   ```bash
   ver-productos-sin-fotos.bat
   ```

2. **Actualizar productos sin fotos**
   ```bash
   re-scrapear-fotos-ahora.bat
   ```

3. **Verificar resultados**
   - Ir al dashboard
   - Revisar productos actualizados
   - Verificar que las fotos sean correctas

---

### Mantenimiento Semanal

1. **Actualizar productos sin fotos**
   ```bash
   re-scrapear-fotos-ahora.bat
   ```

2. **Importar nuevos productos de SmartJoys**
   ```bash
   npx tsx scripts/scrape-smartjoys-final.ts
   npx tsx scripts/importar-smartjoys.ts
   ```

---

### Actualización Mensual

1. **Actualización completa**
   ```bash
   actualizar-todo-con-fotos.bat
   ```

2. **Revisar y ajustar precios**
   - Dashboard → Productos
   - Ajustar márgenes si es necesario

3. **Verificar catálogo público**
   - http://localhost:3000/catalogo
   - Probar búsquedas
   - Verificar imágenes

---

## 📊 Métricas de Éxito

### Objetivo Mínimo
- ✅ 80% productos con ≥1 foto
- ✅ 50% productos con ≥2 fotos

### Objetivo Ideal
- ✅ 95% productos con ≥1 foto
- ✅ 70% productos con ≥3 fotos
- ✅ 40% productos con ≥5 fotos

---

## 🔗 Archivos Relacionados

### Scripts TypeScript
- `scripts/re-scrapear-y-actualizar-fotos.ts` - Script principal
- `scripts/re-importar-megacomputer.ts` - Re-importar MegaComputer
- `scripts/scrape-smartjoys-final.ts` - Scrapear SmartJoys
- `scripts/scrape-disyvar.ts` - Scrapear Disyvar

### Archivos Batch
- `re-scrapear-fotos-ahora.bat` - Solo sin fotos
- `re-importar-megacomputer-ahora.bat` - MegaComputer completo
- `actualizar-todo-con-fotos.bat` - Todo

### Documentación
- `ESTADO_SCRAPERS_Y_DROPSHIPPING.md` - Estado general
- `README_SCRAPER_FOTOS.md` - Sistema de fotos
- `GUIA_RAPIDA_SMARTJOYS.md` - Guía SmartJoys
- `DROPSHIPPING_DISYVAR.md` - Guía Disyvar

---

## ✨ Próximos Pasos

1. ✅ **Ejecuta:** `re-scrapear-fotos-ahora.bat`
2. ✅ **Espera:** 15-30 minutos
3. ✅ **Verifica:** Dashboard → Productos
4. ✅ **Prueba:** Bot de WhatsApp con productos actualizados

---

## 💡 Consejos

### Para Mejores Resultados

1. **Ejecutar en horarios de baja demanda** (noche/madrugada)
2. **No interrumpir el proceso** una vez iniciado
3. **Verificar conexión a internet** antes de empezar
4. **Revisar logs** si hay errores
5. **Ejecutar por lotes** si tienes muchos productos

### Para Evitar Bloqueos

1. **No ejecutar muy seguido** (máximo 1 vez al día por tienda)
2. **Respetar delays** configurados
3. **Usar User-Agent realista** (ya configurado)
4. **No hacer requests paralelos** masivos

---

## 🎉 ¡Listo!

Tu sistema está configurado para mantener todos los productos con fotos reales actualizadas.

**Comando recomendado para empezar:**

```bash
re-scrapear-fotos-ahora.bat
```

---

**Última actualización:** 25 de noviembre de 2025
