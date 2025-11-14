# 📦 Guía de Importación/Exportación de Productos

## ✅ Sistema Completado

El sistema ahora soporta **DOS FORMATOS** para importar y exportar productos:
- **JSON** (Recomendado para desarrolladores)
- **CSV/Excel** (Recomendado para usuarios no técnicos)

---

## 📥 IMPORTACIÓN

### Formato JSON

**Ventajas:**
- ✅ Más flexible y fácil de editar
- ✅ Soporta estructuras complejas
- ✅ Ideal para desarrolladores

**Ejemplo de archivo JSON:**

```json
[
  {
    "name": "iPhone 14 Pro",
    "description": "Smartphone Apple de última generación",
    "price": 4500000,
    "currency": "COP",
    "category": "PHYSICAL",
    "status": "AVAILABLE",
    "images": "[\"https://ejemplo.com/iphone.jpg\"]",
    "tags": "[\"smartphone\", \"apple\", \"premium\"]",
    "autoResponse": "¡Excelente elección! El iPhone 14 Pro está disponible.",
    "stock": 10
  },
  {
    "name": "Curso de Marketing Digital",
    "description": "Aprende marketing desde cero",
    "price": 150000,
    "currency": "COP",
    "category": "DIGITAL",
    "status": "AVAILABLE"
  }
]
```

### Formato CSV/Excel

**Ventajas:**
- ✅ Fácil de editar en Excel o Google Sheets
- ✅ Ideal para usuarios no técnicos
- ✅ Importación masiva rápida

**Ejemplo de archivo CSV:**

```csv
name,description,price,currency,category,status,images,tags,autoResponse,stock
"iPhone 14 Pro","Smartphone Apple",4500000,COP,PHYSICAL,AVAILABLE,"[""https://ejemplo.com/iphone.jpg""]","[""smartphone"",""apple""]","¡Disponible!",10
"Curso Marketing","Aprende marketing",150000,COP,DIGITAL,AVAILABLE,"[]","[""curso"",""digital""]","Curso disponible",999
```

---

## 📤 EXPORTACIÓN

### Exportar como JSON

1. Ve al Dashboard → Productos
2. Click en "Exportar como JSON"
3. Se descarga: `productos-2025-10-31.json`

**Usa JSON cuando:**
- Necesites editar datos complejos
- Quieras hacer respaldo técnico
- Vayas a migrar a otro sistema

### Exportar como CSV

1. Ve al Dashboard → Productos
2. Click en "Exportar como CSV"
3. Se descarga: `productos-2025-10-31.csv`
4. Abre con Excel o Google Sheets

**Usa CSV cuando:**
- Necesites editar en Excel
- Quieras compartir con equipo no técnico
- Hagas análisis de datos

---

## 🔄 FLUJO DE TRABAJO RECOMENDADO

### Para Edición Masiva:

1. **Exporta** tus productos actuales (JSON o CSV)
2. **Edita** el archivo con tu editor favorito
3. **Importa** el archivo modificado
4. ✅ Los productos se actualizan automáticamente

### Para Respaldo:

1. **Exporta** regularmente (recomendado: semanal)
2. Guarda en carpeta segura
3. En caso de problema, **importa** el respaldo

---

## 📋 CAMPOS DISPONIBLES

### Campos Requeridos:
- `name` - Nombre del producto
- `price` - Precio (número)
- `category` - Categoría: PHYSICAL, DIGITAL, SERVICE

### Campos Opcionales:
- `description` - Descripción del producto
- `currency` - Moneda (default: COP)
- `status` - Estado: AVAILABLE, OUT_OF_STOCK, DISCONTINUED
- `images` - Array de URLs de imágenes (JSON string)
- `tags` - Array de etiquetas (JSON string)
- `autoResponse` - Respuesta automática del bot
- `stock` - Cantidad en inventario

---

## 🎯 CASOS DE USO

### 1. Importar Catálogo de Proveedor

Si tu proveedor te envía un Excel:

```bash
1. Guarda el Excel como CSV
2. Asegúrate que tenga las columnas: name, price, category
3. Importa en el dashboard
4. ✅ Listo!
```

### 2. Actualizar Precios Masivamente

```bash
1. Exporta productos como CSV
2. Abre en Excel
3. Edita la columna "price"
4. Guarda como CSV
5. Importa de nuevo
6. ✅ Precios actualizados!
```

### 3. Agregar Imágenes a Todos los Productos

```bash
1. Exporta como JSON
2. Edita el campo "images" de cada producto
3. Importa de nuevo
4. ✅ Imágenes agregadas!
```

### 4. Migrar de Otro Sistema

```bash
1. Exporta desde tu sistema actual
2. Convierte a formato JSON o CSV compatible
3. Importa en este sistema
4. ✅ Migración completa!
```

---

## ⚠️ NOTAS IMPORTANTES

### Validación Automática:
- ✅ El sistema valida todos los datos antes de importar
- ✅ Si hay errores, te muestra qué filas tienen problemas
- ✅ Solo importa productos válidos

### Formato de Arrays:
- En JSON: `["valor1", "valor2"]`
- En CSV: `"[""valor1"",""valor2""]"` (con comillas escapadas)

### Precios:
- Siempre en número entero (sin puntos ni comas)
- Ejemplo: 4500000 (no "4.500.000")

### Categorías Válidas:
- `PHYSICAL` - Productos físicos
- `DIGITAL` - Productos digitales
- `SERVICE` - Servicios

### Estados Válidos:
- `AVAILABLE` - Disponible
- `OUT_OF_STOCK` - Agotado
- `DISCONTINUED` - Descontinuado

---

## 🚀 INICIO RÁPIDO

### Importar Productos:

1. Prepara tu archivo (JSON o CSV)
2. Ve al Dashboard → Productos
3. Arrastra el archivo o haz click para seleccionar
4. Espera la confirmación
5. ✅ Productos importados!

### Exportar Productos:

1. Ve al Dashboard → Productos
2. Click en "Exportar como JSON" o "Exportar como CSV"
3. El archivo se descarga automáticamente
4. ✅ Listo para editar!

---

## 📞 SOPORTE

Si tienes problemas:
1. Verifica que el formato del archivo sea correcto
2. Revisa que los campos requeridos estén presentes
3. Asegúrate que los valores sean válidos
4. Consulta los ejemplos en esta guía

---

## ✨ PRÓXIMAS MEJORAS

- [ ] Importación desde URL
- [ ] Sincronización automática con proveedores
- [ ] Validación avanzada de imágenes
- [ ] Importación programada
- [ ] Historial de importaciones

---

**¡Sistema de Importación/Exportación Completado! 🎉**
