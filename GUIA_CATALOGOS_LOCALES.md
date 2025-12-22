# 📁 Guía: Analizar Catálogos Locales

## 🎯 Objetivo

Analizar archivos de catálogos en `C:\catalogos` y actualizar la base de datos con **fotos reales** (no Unsplash).

---

## 📋 Preparación

### 1. Crear Carpeta

```
C:\catalogos
```

### 2. Colocar Archivos

Coloca tus archivos JSON o CSV en esa carpeta:

```
C:\catalogos\
├── catalogo-megacomputer.json
├── productos-smartjoys.json
├── catalogo-disyvar.csv
└── productos-completos.json
```

---

## 🚀 Ejecutar

```bash
analizar-catalogos-locales.bat
```

---

## 📊 Qué Hace

### 1. Busca Archivos
- Lee todos los `.json` y `.csv` en `C:\catalogos`
- Analiza estructura de cada archivo

### 2. Identifica Fotos Reales
- ✅ **Acepta:** URLs de tiendas reales (MegaComputer, SmartJoys, Disyvar, CDN, Shopify, etc.)
- ❌ **Rechaza:** Unsplash, placeholders, dummyimage

### 3. Busca en Base de Datos
- Busca productos por nombre
- Usa búsqueda inteligente (palabras clave)

### 4. Actualiza Productos
- Reemplaza fotos de Unsplash con fotos reales
- Mantiene fotos reales existentes
- No duplica imágenes

---

## 📈 Salida Esperada

```
🔍 ANALIZANDO CATÁLOGOS LOCALES

============================================================
📁 Ruta: C:\catalogos

📚 Archivos encontrados: 3

📄 Analizando: catalogo-megacomputer.json
   📦 Total productos: 156
   📸 Con fotos reales: 142
   🖼️  Total fotos reales: 487

📄 Analizando: productos-smartjoys.json
   📦 Total productos: 25
   📸 Con fotos reales: 25
   🖼️  Total fotos reales: 68

📄 Analizando: catalogo-disyvar.csv
   📦 Total productos: 89
   📸 Con fotos reales: 76
   🖼️  Total fotos reales: 234

============================================================
📊 RESUMEN DE ANÁLISIS
============================================================

📦 Total productos en catálogos: 270
📸 Productos con fotos reales: 243
🖼️  Total fotos reales: 789

📄 catalogo-megacomputer.json
   Productos: 156 | Con fotos: 142 | Fotos: 487
📄 productos-smartjoys.json
   Productos: 25 | Con fotos: 25 | Fotos: 68
📄 catalogo-disyvar.csv
   Productos: 89 | Con fotos: 76 | Fotos: 234

============================================================
💾 ACTUALIZANDO BASE DE DATOS
============================================================

📄 Procesando: catalogo-megacomputer.json
   ✅ Actualizado: Laptop HP 15-dy2021la (+5 fotos)
   ✅ Actualizado: Monitor LG 24" Full HD (+3 fotos)
   ⚠️  No encontrado: Teclado Mecánico RGB Pro
   ✅ Actualizado: Mouse Gamer Logitech G502 (+2 fotos)
   ...

📄 Procesando: productos-smartjoys.json
   ✅ Actualizado: Audífonos Bluetooth TWS (+3 fotos)
   ✅ Actualizado: Smartwatch Y68 (+2 fotos)
   ...

============================================================
📊 RESUMEN FINAL
============================================================
✅ Actualizados: 187
⚠️  No encontrados en BD: 56
⏭️  Sin cambios: 0
📦 Total procesados: 243
============================================================

✨ Proceso completado!
```

---

## 📝 Formato de Archivos

### JSON (Recomendado)

```json
[
  {
    "name": "Laptop HP 15-dy2021la",
    "description": "Laptop HP con Intel Core i5...",
    "price": 2499000,
    "images": [
      "https://megacomputer.com.co/images/laptop-hp-1.jpg",
      "https://megacomputer.com.co/images/laptop-hp-2.jpg",
      "https://megacomputer.com.co/images/laptop-hp-3.jpg"
    ],
    "category": "Laptops"
  },
  {
    "nombre": "Audífonos Bluetooth TWS",
    "descripcion": "Audífonos inalámbricos...",
    "precio": 89900,
    "imagenes": [
      "https://smartjoys.co/cdn/audifonos-1.jpg",
      "https://smartjoys.co/cdn/audifonos-2.jpg"
    ]
  }
]
```

### CSV

```csv
name,description,price,images,category
Laptop HP 15-dy2021la,Laptop HP con Intel Core i5,2499000,"https://megacomputer.com.co/images/laptop-hp-1.jpg|https://megacomputer.com.co/images/laptop-hp-2.jpg",Laptops
Monitor LG 24,Monitor Full HD,599000,https://megacomputer.com.co/images/monitor-lg.jpg,Monitores
```

**Nota:** En CSV, múltiples imágenes se separan con `|`

---

## 🔍 Detección de Fotos Reales

### ✅ Acepta (Fotos Reales)

- URLs con: `megacomputer`, `smartjoys`, `disyvar`, `dropi`
- URLs con: `cdn`, `cloudinary`, `shopify`, `woocommerce`
- URLs con extensiones: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`

### ❌ Rechaza (Placeholders)

- URLs con: `unsplash.com`
- URLs con: `placeholder`, `placehold`
- URLs con: `lorempixel`, `dummyimage`

---

## 🎯 Casos de Uso

### Caso 1: Catálogo de MegaComputer

```
C:\catalogos\megacomputer.json
```

Contiene productos con fotos reales de MegaComputer.

**Resultado:** Actualiza productos existentes con fotos reales.

---

### Caso 2: Productos de SmartJoys

```
C:\catalogos\smartjoys.json
```

Contiene productos scrapeados de SmartJoys.

**Resultado:** Reemplaza fotos de Unsplash con fotos reales.

---

### Caso 3: Múltiples Catálogos

```
C:\catalogos\
├── megacomputer.json
├── smartjoys.json
├── disyvar.csv
```

**Resultado:** Procesa todos y actualiza base de datos.

---

## 🔧 Configuración

### Cambiar Ruta de Catálogos

Edita `scripts/analizar-catalogos-locales.ts`:

```typescript
const RUTA_CATALOGOS = 'C:\\catalogos';
//                      ^^^^^^^^^^^^^^
// Cambiar por tu ruta
```

### Agregar Más Tiendas Aceptadas

```typescript
function esFotoReal(url: string): boolean {
  // ...
  if (urlLower.includes('mitienda')) return true;
  // ...
}
```

---

## 🐛 Solución de Problemas

### "No existe la carpeta"

```bash
# Crear carpeta
mkdir C:\catalogos
```

### "No se encontraron archivos"

Verifica que los archivos sean `.json` o `.csv`

### "No encontrado en BD"

El producto no existe en tu base de datos. Opciones:
1. Importar primero con scrapers
2. Crear producto manualmente
3. Ajustar nombre en catálogo

### "Sin cambios"

El producto ya tiene esas fotos reales.

---

## 📊 Verificar Resultados

### En Dashboard

```
http://localhost:3000/dashboard
```

1. Ir a "Productos"
2. Buscar productos actualizados
3. Verificar que tengan fotos reales

### En Base de Datos

```bash
npx tsx scripts/ver-productos.ts
```

---

## 💡 Tips

### Para Mejores Resultados

1. **Nombres consistentes** - Usa los mismos nombres que en BD
2. **URLs completas** - Incluye `https://` en las URLs
3. **Múltiples fotos** - Más fotos = mejor presentación
4. **Fotos de calidad** - Verifica que las URLs funcionen

### Para Evitar Problemas

1. **No usar Unsplash** - Solo fotos reales de tiendas
2. **Verificar formato** - JSON o CSV válido
3. **Revisar logs** - Si hay errores, revisar el output

---

## 🎯 Workflow Recomendado

### 1. Preparar Catálogos

```bash
# Crear carpeta
mkdir C:\catalogos

# Copiar archivos JSON/CSV
copy productos.json C:\catalogos\
```

### 2. Analizar

```bash
analizar-catalogos-locales.bat
```

### 3. Verificar

```
http://localhost:3000/dashboard
```

### 4. Probar Bot

Enviar mensaje de prueba para verificar que envíe fotos reales.

---

## 📚 Archivos Relacionados

- `scripts/analizar-catalogos-locales.ts` - Script principal
- `analizar-catalogos-locales.bat` - Ejecutable
- `GUIA_CATALOGOS_LOCALES.md` - Esta guía

---

## ✨ Ejemplo Completo

### 1. Crear carpeta y archivo

```bash
mkdir C:\catalogos
```

### 2. Crear `C:\catalogos\productos.json`

```json
[
  {
    "name": "Laptop HP 15",
    "images": [
      "https://megacomputer.com.co/images/laptop-hp-1.jpg",
      "https://megacomputer.com.co/images/laptop-hp-2.jpg"
    ]
  }
]
```

### 3. Ejecutar

```bash
analizar-catalogos-locales.bat
```

### 4. Resultado

```
✅ Actualizado: Laptop HP 15 (+2 fotos)
```

---

## 🚀 Comando para Empezar

```bash
analizar-catalogos-locales.bat
```

---

**Última actualización:** 25 de noviembre de 2025
