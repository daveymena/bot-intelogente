# 🧹 Limpieza de Productos Duplicados

## 🎯 Objetivo

Verificar y eliminar productos duplicados, y limpiar imágenes de Unsplash para que puedas agregar las fotos reales manualmente.

---

## 📋 Pasos

### 1️⃣ Verificar Duplicados (Sin Eliminar)

Primero, verifica qué productos están duplicados:

```bash
npm run verificar-duplicados
```

**Esto mostrará:**
- ✅ Total de productos
- ❌ Productos duplicados (con sus IDs)
- 🖼️ Productos con/sin imagen
- 🌅 Productos con imágenes de Unsplash

**Ejemplo de salida:**
```
🔍 VERIFICACIÓN DE PRODUCTOS

📦 Total de productos: 45

🔍 PRODUCTOS DUPLICADOS:

❌ "iPhone 14 Pro" (2 copias)
   1. ID: abc123 | Precio: $4500000 | Imagen: ✅
   2. ID: def456 | Precio: $4500000 | Imagen: ❌

🖼️  VERIFICACIÓN DE IMÁGENES:

✅ Con imagen: 20
❌ Sin imagen: 25
🌅 Con Unsplash: 15
```

---

### 2️⃣ Limpiar Duplicados y Unsplash

Una vez verificado, ejecuta la limpieza:

```bash
npm run limpiar-duplicados
```

**Esto hará:**
1. ✅ Eliminar productos duplicados (mantiene el más antiguo)
2. ✅ Limpiar todas las imágenes de Unsplash
3. ✅ Mostrar lista de productos sin imagen

**Ejemplo de salida:**
```
🗑️  Eliminando 5 productos duplicados...
✅ Eliminados 5 productos duplicados

🖼️  Limpiando imágenes de Unsplash...
✅ Limpiadas 15 imágenes de Unsplash

📸 Productos sin imagen (listos para agregar fotos):

   Total: 25 productos

   1. iPhone 14 Pro
      ID: abc123
      Precio: $4,500,000 COP
      Categoría: PHYSICAL

   2. Samsung Galaxy S23
      ID: def456
      Precio: $4,200,000 COP
      Categoría: PHYSICAL
```

---

### 3️⃣ Agregar Fotos Manualmente

Después de la limpieza:

1. **Ve al Dashboard:**
   ```
   http://localhost:3000/dashboard
   ```

2. **Ve a Productos**

3. **Edita cada producto sin imagen:**
   - Click en el botón de editar (✏️)
   - Agrega la URL de la imagen real
   - Guarda

---

## 🔍 Qué Hace Cada Script

### `verificar-duplicados`
- ✅ Solo muestra información
- ❌ NO elimina nada
- 📊 Genera reporte completo
- 💡 Da recomendaciones

### `limpiar-duplicados`
- ⚠️ ELIMINA productos duplicados
- ⚠️ ELIMINA imágenes de Unsplash
- ✅ Mantiene el producto más antiguo
- 📋 Muestra lista de productos sin imagen

---

## 🎯 Criterio de Duplicados

**Se considera duplicado cuando:**
- Dos productos tienen el mismo nombre (ignorando mayúsculas/minúsculas)
- Ejemplo: "iPhone 14 Pro" y "iphone 14 pro" son duplicados

**Qué se mantiene:**
- El producto más antiguo (creado primero)
- Se elimina el más reciente

---

## 🖼️ Imágenes de Unsplash

**Por qué se eliminan:**
- Son imágenes genéricas de prueba
- No son las fotos reales de tus productos
- Mejor dejarlos sin imagen para agregar las reales

**Qué pasa después:**
- Los productos quedan con `images: []`
- Puedes agregar las fotos reales desde el dashboard
- O importarlas con un CSV/JSON con las URLs correctas

---

## 📊 Ejemplo Completo

### Antes de la limpieza:
```
Total productos: 50
- iPhone 14 Pro (3 copias)
- Samsung S23 (2 copias)
- MacBook Pro (2 copias)
- 15 con imágenes de Unsplash
```

### Después de la limpieza:
```
Total productos: 45
- iPhone 14 Pro (1 copia) ✅
- Samsung S23 (1 copia) ✅
- MacBook Pro (1 copia) ✅
- 0 con imágenes de Unsplash ✅
- 25 sin imagen (listos para fotos reales) 📸
```

---

## 🚀 Flujo Recomendado

1. **Verificar:**
   ```bash
   npm run verificar-duplicados
   ```

2. **Revisar el reporte**
   - ¿Hay duplicados?
   - ¿Cuántos productos sin imagen?

3. **Limpiar:**
   ```bash
   npm run limpiar-duplicados
   ```

4. **Agregar fotos reales:**
   - Desde el dashboard
   - O importar CSV con URLs reales

---

## ⚠️ Advertencias

- ⚠️ `limpiar-duplicados` ELIMINA datos permanentemente
- ⚠️ Siempre ejecuta `verificar-duplicados` primero
- ⚠️ Haz un respaldo si tienes dudas:
  ```bash
  npm run db:backup  # Si tienes este script
  ```

---

## 💡 Tips

### Si quieres mantener un duplicado específico:
1. Ejecuta `verificar-duplicados`
2. Anota el ID del producto que quieres mantener
3. Elimina manualmente los otros desde el dashboard

### Si tienes muchos productos sin imagen:
1. Exporta los productos: Dashboard → Productos → Exportar CSV
2. Agrega las URLs de imágenes en Excel
3. Importa el CSV actualizado

---

## ✅ Checklist

Antes de limpiar:
- [ ] Ejecuté `verificar-duplicados`
- [ ] Revisé el reporte
- [ ] Entiendo qué se va a eliminar
- [ ] Tengo las fotos reales listas (opcional)

Después de limpiar:
- [ ] Verifiqué que se eliminaron los duplicados
- [ ] Revisé la lista de productos sin imagen
- [ ] Agregué las fotos reales (o las tengo listas)

---

## 📞 Soporte

Si algo sale mal:
1. Los productos eliminados NO se pueden recuperar
2. Pero puedes volver a importarlos desde un CSV
3. O crearlos manualmente desde el dashboard

---

**¡Listo para limpiar tu catálogo! 🧹✨**
