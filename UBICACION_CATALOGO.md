# 📍 Ubicación del Catálogo Completo

## 🎯 Archivo Principal

**Nombre:** `catalogo-completo-importar.json`

**Ruta completa:**
```
C:\Users\ADMIN\Music\botexperimento\catalogo-completo-importar.json
```

**Ruta relativa (desde el proyecto):**
```
./catalogo-completo-importar.json
```

## 📊 Contenido

- **102 productos** con fotos
- **Formato:** JSON listo para importar
- **Tamaño:** ~77 KB

## 🔍 Cómo Verlo

### Opción 1: Abrir en VS Code
```bash
code catalogo-completo-importar.json
```

### Opción 2: Ver en el Explorador
```bash
explorer.exe /select,catalogo-completo-importar.json
```

### Opción 3: Ver contenido en terminal
```bash
cat catalogo-completo-importar.json
```

### Opción 4: Ver resumen
```bash
npx tsx -e "const j=require('./catalogo-completo-importar.json'); console.log('Total:', j.length, 'productos')"
```

## 📦 Otros Archivos Relacionados

En la misma carpeta también tienes:

```
botexperimento/
├── catalogo-completo-importar.json          ← 102 productos (USAR ESTE)
├── productos-megacomputer-completo.json     ← 24 productos (laptops + impresoras)
├── laptops-megacomputer.json                ← 12 laptops
├── impresoras-megacomputer.json             ← 12 impresoras
└── productos-listos-importar.json           ← Versión anterior
```

## 🚀 Para Importar

### Desde el Dashboard:

1. Abrir: http://localhost:3000
2. Ir a **Productos**
3. Click en **Importar**
4. Seleccionar: `catalogo-completo-importar.json`
5. Click en **Importar**

### Con Script:

```bash
# Crear script de importación
npx tsx scripts/import-catalogo-completo.ts
```

## 📝 Estructura del Archivo

```json
[
  {
    "name": "Nombre del producto",
    "description": "Descripción completa",
    "price": 1899900,
    "currency": "COP",
    "category": "PHYSICAL",
    "status": "AVAILABLE",
    "images": ["https://..."],
    "tags": ["laptop", "asus", "nuevo"],
    "stock": 5,
    "paymentLinkCustom": "https://..."
  },
  // ... 101 productos más
]
```

## ✅ Verificación

Para verificar que el archivo existe:

```bash
# Windows
dir catalogo-completo-importar.json

# PowerShell
Test-Path catalogo-completo-importar.json

# Ver primeros productos
npx tsx -e "console.log(require('./catalogo-completo-importar.json').slice(0,3))"
```

---

**El archivo está en la raíz del proyecto** ✅
