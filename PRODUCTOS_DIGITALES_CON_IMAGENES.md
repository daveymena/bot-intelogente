# 📸 PRODUCTOS DIGITALES CON IMÁGENES

## ✅ Imágenes Disponibles

### 🏍️ Moto Bajaj Pulsar NS 160
**Ubicación:** `public/fotos/`
- moto2.jpg
- moto 3.jpg
- moto4.jpg
- moto5.png
- moto6.png

**Ruta para JSON/Excel:** `/fotos/moto2.jpg` (principal)

### 📦 Megapacks
**Ubicación:** `public/fotos/`
- megapack2.jpg
- megapack completo.png

**Ruta para JSON/Excel:** `/fotos/megapack completo.png` (principal)

### 🎹 Curso de Piano
**Ubicación:** `public/fotos/`
- curso de piano completo .jpg

**Ruta para JSON/Excel:** `/fotos/curso de piano completo .jpg`

## 📋 Formato para Excel

### Columna "images"
Para productos con múltiples imágenes, separar con comas:

```
Moto: /fotos/moto2.jpg,/fotos/moto 3.jpg,/fotos/moto4.jpg,/fotos/moto5.png,/fotos/moto6.png
Megapack: /fotos/megapack completo.png,/fotos/megapack2.jpg
Piano: /fotos/curso de piano completo .jpg
```

## 📄 Formato para JSON

### Moto Bajaj Pulsar
```json
{
  "name": "Moto Bajaj Pulsar NS 160 FI1 (2020)",
  "images": [
    "/fotos/moto2.jpg",
    "/fotos/moto 3.jpg",
    "/fotos/moto4.jpg",
    "/fotos/moto5.png",
    "/fotos/moto6.png"
  ]
}
```

### Megapacks (todos)
```json
{
  "name": "Megapack [Nombre]",
  "images": [
    "/fotos/megapack completo.png",
    "/fotos/megapack2.jpg"
  ]
}
```

### Curso de Piano
```json
{
  "name": "Curso Completo de Piano Online",
  "images": [
    "/fotos/curso de piano completo .jpg"
  ]
}
```

## 🔧 Actualización Necesaria

Los archivos JSON actuales tienen rutas incorrectas. Necesitan actualizarse a:

### Antes (Incorrecto):
```json
"images": ["/fotos/megapack2.jpg"]  // Imagen genérica
```

### Después (Correcto):
```json
"images": [
  "/fotos/megapack completo.png",
  "/fotos/megapack2.jpg"
]
```

## 📊 Resumen de Cambios

| Producto | Imagen Actual | Imagen Correcta |
|----------|---------------|-----------------|
| Moto Bajaj | ❌ No tiene | ✅ /fotos/moto2.jpg + 4 más |
| Megapacks (40+) | ⚠️ megapack2.jpg | ✅ megapack completo.png + megapack2.jpg |
| Curso Piano | ✅ URL externa | ✅ /fotos/curso de piano completo .jpg |

## 🚀 Próximos Pasos

1. Actualizar archivo JSON con rutas correctas
2. Actualizar archivo Excel con rutas correctas
3. Importar productos a la base de datos
4. Verificar que las imágenes se muestren correctamente

---

**Nota:** Todas las imágenes ya están en `public/fotos/`, solo necesitas actualizar las rutas en tus archivos.
