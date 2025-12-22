# 📍 Ubicación de Archivos de Productos

## 📂 Ubicación Principal

**Carpeta del proyecto**: `C:\Users\ADMIN\Music\botexperimento\`

---

## 📄 ARCHIVOS DE PRODUCTOS

### 1. JSON Completo (68 productos)
```
📁 catalogo-completo-68-productos.json
📍 C:\Users\ADMIN\Music\botexperimento\catalogo-completo-68-productos.json
📦 68 productos (42 digitales + 26 físicos)
💾 39 KB
📅 Última actualización: 3 nov 2025, 8:25 PM
```

**Contenido**:
- Todos los productos con estructura completa
- Imágenes como array
- Tags como array
- Listo para importar programáticamente

### 2. CSV/Excel (68 productos)
```
📁 catalogo-completo-68-productos.csv
📍 C:\Users\ADMIN\Music\botexperimento\catalogo-completo-68-productos.csv
📦 68 productos (42 digitales + 26 físicos)
💾 23 KB
📅 Última actualización: 3 nov 2025, 8:25 PM
```

**Contenido**:
- Formato CSV compatible con Excel
- Imágenes separadas por `|`
- Tags separados por `|`
- Editable en Excel

---

## 📄 ARCHIVOS FUENTE (Para importación inicial)

### 3. Productos MegaComputer
```
📁 productos-megacomputer-completo.json
📍 C:\Users\ADMIN\Music\botexperimento\productos-megacomputer-completo.json
📦 24 productos (12 laptops + 12 impresoras)
💾 18 KB
```

### 4. Productos Digitales y Moto
```
📁 productos-digitales-moto.json
📍 C:\Users\ADMIN\Music\botexperimento\productos-digitales-moto.json
📦 3 productos (Piano + Pack Completo + Moto)
💾 3 KB
```

---

## 🔧 SCRIPTS DE IMPORTACIÓN/EXPORTACIÓN

### Exportar productos actuales
```bash
# Opción 1: Usar .bat
exportar-productos.bat

# Opción 2: Comando directo
npx tsx scripts/exportar-productos-completo.ts
```

**Resultado**: Crea 2 archivos:
- `catalogo-completo-68-productos.json`
- `catalogo-completo-68-productos.csv`

### Importar desde JSON
```bash
# Opción 1: Usar .bat
importar-desde-json.bat

# Opción 2: Comando directo
npx tsx scripts/importar-desde-json.ts
```

**Fuente**: Lee `catalogo-completo-68-productos.json`

### Importar catálogo completo (desde cero)
```bash
# Importa todo desde los archivos fuente
importar-productos-completo.bat
```

**Fuente**: Lee:
- `productos-megacomputer-completo.json`
- `productos-digitales-moto.json`
- Crea los 40 megapacks programáticamente

---

## 📊 ESTRUCTURA DE LOS ARCHIVOS

### JSON (catalogo-completo-68-productos.json)
```json
[
  {
    "name": "Nombre del producto",
    "description": "Descripción completa",
    "price": 60000,
    "currency": "COP",
    "category": "DIGITAL",
    "status": "AVAILABLE",
    "images": [
      "/fotos/imagen1.jpg",
      "/fotos/imagen2.jpg"
    ],
    "tags": [
      "tag1",
      "tag2"
    ],
    "stock": null,
    "paymentLinkCustom": "https://..."
  }
]
```

### CSV (catalogo-completo-68-productos.csv)
```csv
name,description,price,currency,category,status,images,tags,stock,paymentLinkCustom
"Curso de Piano","Descripción...",60000,COP,DIGITAL,AVAILABLE,"/fotos/piano.jpg","curso|piano|musica",,""
```

**Nota**: 
- Imágenes separadas por `|`
- Tags separados por `|`
- Compatible con Excel

---

## 🖼️ UBICACIÓN DE FOTOS

### Fotos Locales
```
📁 public/fotos/
📍 C:\Users\ADMIN\Music\botexperimento\public\fotos\

Archivos:
- megapack completo.png  (Pack Completo)
- megapack2.jpg          (40 Megapacks individuales)
```

### Fotos Externas
- **MegaComputer**: `https://megacomputer.com.co/wp-content/uploads/...`
- **Curso Piano**: `https://landein-page-pian2.vercel.app/piano-curso.jpg`
- **Moto**: `https://images.unsplash.com/photo-...`

---

## 🎯 CASOS DE USO

### 1. Editar productos en Excel
```bash
1. exportar-productos.bat
2. Abrir catalogo-completo-68-productos.csv en Excel
3. Editar lo que necesites
4. Guardar como CSV
5. importar-desde-json.bat (después de convertir CSV a JSON)
```

### 2. Backup de productos
```bash
exportar-productos.bat
# Guarda los archivos generados en un lugar seguro
```

### 3. Restaurar productos
```bash
# Coloca el archivo catalogo-completo-68-productos.json en la raíz
importar-desde-json.bat
```

### 4. Importar desde cero
```bash
importar-productos-completo.bat
# Importa todo desde los archivos fuente
```

---

## 📋 COMANDOS RÁPIDOS

### Ver productos actuales
```bash
ver-productos.bat
```

### Exportar a JSON y CSV
```bash
exportar-productos.bat
```

### Importar desde JSON
```bash
importar-desde-json.bat
```

### Importar todo desde cero
```bash
importar-productos-completo.bat
```

### Ver solo MegaComputer
```bash
importar-megacomputer.bat
```

---

## 🗂️ RESUMEN DE ARCHIVOS

| Archivo | Ubicación | Productos | Uso |
|---------|-----------|-----------|-----|
| `catalogo-completo-68-productos.json` | Raíz | 68 | Importar/Exportar |
| `catalogo-completo-68-productos.csv` | Raíz | 68 | Editar en Excel |
| `productos-megacomputer-completo.json` | Raíz | 24 | Fuente MegaComputer |
| `productos-digitales-moto.json` | Raíz | 3 | Fuente digitales |

---

## ✅ VERIFICACIÓN

Para verificar que todo está correcto:

```bash
# 1. Ver productos en BD
ver-productos.bat

# 2. Exportar a archivos
exportar-productos.bat

# 3. Verificar archivos creados
dir catalogo-completo-68-productos.*
```

---

**Fecha**: 3 de noviembre de 2025  
**Total productos**: 68 (42 digitales + 26 físicos)  
**Estado**: ✅ COMPLETO
