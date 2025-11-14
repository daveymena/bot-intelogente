# 📸 Sistema de Extracción de Fotos MegaComputer

## ✅ Scripts Creados

Sistema completo para extraer fotos de productos desde MegaComputer y asignarlas a productos sin imagen.

## 🎯 Objetivo

Extraer fotos de alta calidad desde https://megacomputer.com.co/ para productos de tecnología que no tienen imagen:
- Portátiles
- Monitores
- Accesorios (mouse, teclados, diademas)
- Componentes (RAM, SSD, etc.)
- Impresoras
- Audio (parlantes)

## 📋 Comandos

### 1. Ver productos sin fotos
```bash
npx tsx scripts/ver-productos-sin-fotos.ts
```

Muestra:
- Total de productos sin fotos
- Agrupados por categoría y subcategoría
- Cuántos son de tecnología (candidatos para MegaComputer)

### 2. Extraer fotos de MegaComputer
```bash
npx tsx scripts/extraer-fotos-megacomputer.ts
```

Este script:
- Busca productos de tecnología sin fotos
- Los busca en MegaComputer usando Puppeteer
- Extrae todas las imágenes del producto
- Actualiza la base de datos con las URLs
- Genera un reporte JSON

### 3. Scraper universal (todas las tiendas)
```bash
# Solo productos sin fotos
npx tsx scripts/scraper-fotos-todas-tiendas.ts sin-fotos

# Productos con pocas fotos (menos de 2)
npx tsx scripts/scraper-fotos-todas-tiendas.ts pocas-fotos

# Todos los productos
npx tsx scripts/scraper-fotos-todas-tiendas.ts todos
```

Busca en múltiples tiendas:
- MegaComputer
- Disyvar
- SmartJoys
- Alkosto
- Éxito

## 🔧 Cómo Funciona

### Script Específico MegaComputer

1. **Filtrado inteligente**: Solo busca productos físicos de tecnología
2. **Búsqueda**: Usa el nombre del producto en el buscador de MegaComputer
3. **Extracción**: Entra al primer resultado y extrae todas las imágenes
4. **Validación**: Filtra logos, iconos, placeholders
5. **Actualización**: Guarda las URLs en formato JSON en la base de datos
6. **Reporte**: Genera un archivo con los resultados

### Ventajas

- ✅ Fotos de alta calidad
- ✅ Múltiples ángulos del producto
- ✅ Imágenes reales (no stock photos)
- ✅ Actualización automática
- ✅ Pausa entre requests (no satura el servidor)

## 📊 Reportes

Los scripts generan reportes JSON:
- `scripts/reporte-fotos-megacomputer.json` - Específico MegaComputer
- `scripts/reporte-fotos.json` - Universal (todas las tiendas)

Contienen:
- ID del producto
- Nombre
- Subcategoría
- Cantidad de imágenes
- URLs extraídas

## ⚙️ Requisitos

- Puppeteer instalado (ya está en el proyecto)
- Base de datos accesible
- Conexión a internet

## 🚀 Flujo Recomendado

### Paso 0: Probar el scraper (sin DB) ✅ FUNCIONA
```bash
npx tsx scripts/test-scraper-megacomputer-v2.ts
```
✅ **Probado y funcionando**: Extrae 15-18 imágenes por producto navegando por categorías.

### Paso 1: Ver estado actual
```bash
npx tsx scripts/ver-productos-sin-fotos.ts
```

### Paso 2: Extraer fotos de MegaComputer (RECOMENDADO)
```bash
npx tsx scripts/extraer-fotos-megacomputer-final.ts
```
Este script:
- Navega por categorías de MegaComputer
- Busca productos por coincidencia de nombre
- Extrae imágenes reales de cada producto
- Actualiza la base de datos

### Paso 3: Si quedan productos sin fotos, usar el scraper universal
```bash
npx tsx scripts/scraper-fotos-todas-tiendas.ts sin-fotos
```

### Paso 4: Verificar resultados en el catálogo

## 💡 Notas

- El script hace pausas de 3 segundos entre productos
- Usa headless browser (no abre ventanas)
- Filtra automáticamente imágenes no válidas
- Guarda múltiples imágenes por producto (galería)
- Las URLs se guardan en formato JSON array

## 🔄 Mantenimiento

Para actualizar fotos de productos existentes:
```bash
npx tsx scripts/scraper-fotos-todas-tiendas.ts pocas-fotos
```

Esto actualizará productos que tienen menos de 2 imágenes.
