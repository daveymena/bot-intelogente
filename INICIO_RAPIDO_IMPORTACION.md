# 🚀 Inicio Rápido - Importación/Exportación

## ✅ Sistema Listo

El sistema ya soporta **JSON y CSV/Excel** para importar y exportar productos.

---

## 📥 IMPORTAR PRODUCTOS

### Paso 1: Prepara tu archivo

**Opción A: Usa los ejemplos incluidos**
- `ejemplos/productos-ejemplo.json` (10 productos)
- `ejemplos/productos-ejemplo.csv` (10 productos)

**Opción B: Crea tu propio archivo**

**JSON:**
```json
[
  {
    "name": "Producto 1",
    "price": 10000,
    "category": "PHYSICAL",
    "description": "Descripción del producto"
  }
]
```

**CSV:**
```csv
name,price,category,description
"Producto 1",10000,PHYSICAL,"Descripción del producto"
```

### Paso 2: Importa

1. Inicia el sistema: `npm run dev`
2. Abre: `http://localhost:3000/dashboard`
3. Ve a **Productos**
4. **Arrastra** tu archivo o haz **click** para seleccionar
5. ✅ ¡Listo! Productos importados

---

## 📤 EXPORTAR PRODUCTOS

### Paso 1: Exporta

1. Ve al Dashboard → Productos
2. Click en **"Exportar como JSON"** o **"Exportar como CSV"**
3. El archivo se descarga automáticamente

### Paso 2: Edita (opcional)

**JSON:** Edita con cualquier editor de texto
**CSV:** Abre con Excel o Google Sheets

### Paso 3: Re-importa (opcional)

Si editaste el archivo, simplemente arrástralo de nuevo para actualizar.

---

## 🎯 CASOS DE USO RÁPIDOS

### Actualizar Precios:
```
1. Exporta como CSV
2. Edita columna "price" en Excel
3. Importa de nuevo
✅ Precios actualizados!
```

### Agregar Productos Masivamente:
```
1. Crea archivo JSON o CSV con tus productos
2. Arrastra al dashboard
✅ Productos agregados!
```

### Respaldo:
```
1. Exporta como JSON
2. Guarda en carpeta segura
✅ Respaldo creado!
```

---

## 📋 CAMPOS MÍNIMOS REQUERIDOS

```
name     - Nombre del producto
price    - Precio (número sin puntos ni comas)
category - PHYSICAL, DIGITAL o SERVICE
```

---

## 🧪 PRUEBA RÁPIDA

Ejecuta el script de prueba:

```bash
probar-importacion.bat
```

O manualmente:

```bash
# 1. Inicia el sistema
npm run dev

# 2. Abre el navegador
# http://localhost:3000/dashboard

# 3. Arrastra este archivo:
# ejemplos/productos-ejemplo.json
```

---

## 📚 MÁS INFORMACIÓN

- **Guía Completa:** `GUIA_IMPORTACION_EXPORTACION.md`
- **Resumen Técnico:** `SISTEMA_IMPORTACION_COMPLETADO.md`
- **Ejemplos:** Carpeta `ejemplos/`

---

## ✨ ¡Eso es todo!

El sistema está listo para usar. Importa y exporta productos en segundos.

**¿Preguntas?** Consulta la guía completa.
