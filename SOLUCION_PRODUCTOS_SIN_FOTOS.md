# 🔧 Solución: Productos Importados Sin Fotos

## 🎯 Problema

Importaste productos desde el dashboard pero las fotos no aparecen en el catálogo.

## ✅ Solución Implementada

Se corrigió el código de importación para manejar correctamente arrays de imágenes.

---

## 🚀 Pasos para Corregir

### 1. Ejecutar Script de Corrección

```bash
corregir-productos-sin-fotos.bat
```

Este script:
- ✅ Busca productos sin fotos en tu BD
- ✅ Lee los archivos JSON originales en `C:\catalogos`
- ✅ Actualiza los productos con sus fotos

---

### 2. Verificar Resultados

```
http://localhost:3000/dashboard
```

Ve a "Productos" y verifica que ahora tengan fotos.

---

## 📊 Qué se Corrigió

### Antes (Problema)

El código guardaba las imágenes como string vacío:

```typescript
images: product.images || '[]'  // ❌ No convertía arrays
```

### Después (Solución)

Ahora convierte correctamente arrays a JSON:

```typescript
images: z.union([
  z.string(),
  z.array(z.string())
]).transform((val) => {
  if (Array.isArray(val)) return JSON.stringify(val)
  // ... más lógica
})
```

---

## 📝 Formato Correcto para Importar

### JSON (Recomendado)

```json
[
  {
    "name": "Laptop HP 15",
    "description": "Laptop HP con Intel Core i5",
    "price": 2499000,
    "category": "PHYSICAL",
    "images": [
      "https://megacomputer.com.co/images/laptop-1.jpg",
      "https://megacomputer.com.co/images/laptop-2.jpg",
      "https://megacomputer.com.co/images/laptop-3.jpg"
    ]
  }
]
```

### CSV

```csv
name,description,price,category,images
Laptop HP 15,Laptop HP con Intel Core i5,2499000,PHYSICAL,"[""https://megacomputer.com.co/images/laptop-1.jpg"",""https://megacomputer.com.co/images/laptop-2.jpg""]"
```

**Nota:** En CSV, el array de imágenes debe ser un string JSON válido.

---

## 🔄 Para Futuras Importaciones

### Opción 1: Usar el Dashboard (Ya Corregido)

1. Ir a Dashboard → Productos
2. Click en "Importar"
3. Seleccionar archivo JSON con formato correcto
4. Las fotos ahora se importarán correctamente ✅

### Opción 2: Usar Script de Catálogos Locales

```bash
analizar-catalogos-locales.bat
```

Este script lee archivos en `C:\catalogos` y actualiza automáticamente.

---

## 🐛 Si Aún No Aparecen las Fotos

### Verificar Formato del JSON

```bash
# Ver un producto en la BD
npx tsx scripts/ver-productos.ts
```

Las imágenes deben estar como string JSON:
```
images: '["url1.jpg","url2.jpg"]'
```

### Verificar URLs de Imágenes

Las URLs deben ser válidas y accesibles:
- ✅ `https://megacomputer.com.co/images/laptop.jpg`
- ✅ `https://smartjoys.co/cdn/producto.jpg`
- ❌ `unsplash.com/...` (placeholder)
- ❌ URLs rotas o inválidas

### Re-importar con Formato Correcto

1. Exportar productos actuales:
   ```
   Dashboard → Productos → Exportar JSON
   ```

2. Editar el JSON exportado y agregar fotos:
   ```json
   {
     "name": "Producto X",
     "images": ["url1.jpg", "url2.jpg"]
   }
   ```

3. Eliminar productos sin fotos del dashboard

4. Re-importar el JSON corregido

---

## 📊 Comandos Útiles

### Ver Productos Sin Fotos

```bash
npx tsx scripts/ver-productos-sin-fotos.ts
```

### Corregir Productos

```bash
corregir-productos-sin-fotos.bat
```

### Verificar en Dashboard

```
http://localhost:3000/dashboard
```

---

## 💡 Recomendaciones

### Para Evitar el Problema

1. **Usar formato JSON** (más confiable que CSV)
2. **Verificar el JSON** antes de importar
3. **Probar con 1-2 productos** primero
4. **Verificar en dashboard** después de importar

### Para Mejores Resultados

1. **URLs completas** - Incluir `https://`
2. **Múltiples fotos** - 3-5 fotos por producto
3. **Fotos reales** - No usar placeholders
4. **URLs válidas** - Verificar que funcionen

---

## 🎯 Resumen

### Problema
- ✅ Identificado: Importación no convertía arrays a JSON

### Solución
- ✅ Código corregido en `src/app/api/import-export/route.ts`
- ✅ Script creado: `corregir-productos-sin-fotos.bat`

### Próximos Pasos
1. ✅ Ejecutar: `corregir-productos-sin-fotos.bat`
2. ✅ Verificar en dashboard
3. ✅ Futuras importaciones funcionarán correctamente

---

## 🚀 Ejecutar Ahora

```bash
corregir-productos-sin-fotos.bat
```

Esto corregirá todos los productos que importaste sin fotos.

---

**Última actualización:** 25 de noviembre de 2025
