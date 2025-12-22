# 📸 Cómo Agregar Fotos a los Productos

## ✅ Problema Resuelto

Se limpiaron todas las URLs de ejemplo y arrays vacíos. Ahora los productos sin fotos muestran el placeholder SVG correctamente.

## 🎯 Cómo Agregar Fotos Reales

### Opción 1: Desde el Dashboard (Recomendado)

1. **Ir al Dashboard**
   ```
   http://localhost:3000/dashboard
   ```

2. **Ir a "Productos"**
   - Click en el menú lateral

3. **Editar un Producto**
   - Click en el botón "Editar" del producto

4. **Agregar URLs de Imágenes**
   - En el campo "Imágenes", agregar URLs separadas por comas:
   ```
   https://tu-servidor.com/foto1.jpg,https://tu-servidor.com/foto2.jpg
   ```
   
   O en formato JSON:
   ```json
   ["https://tu-servidor.com/foto1.jpg", "https://tu-servidor.com/foto2.jpg"]
   ```

5. **Guardar**
   - Click en "Guardar Cambios"

### Opción 2: Subir Imágenes a un Servicio

#### Servicios Recomendados (Gratis):

1. **Cloudinary** (Recomendado)
   - https://cloudinary.com
   - Plan gratuito: 25GB
   - Optimización automática
   - CDN global

2. **ImgBB**
   - https://imgbb.com
   - Gratis ilimitado
   - API disponible

3. **Imgur**
   - https://imgur.com
   - Gratis
   - Fácil de usar

#### Pasos:

1. **Subir la imagen** al servicio
2. **Copiar la URL** de la imagen
3. **Agregar al producto** en el dashboard

### Opción 3: Usar Imágenes Locales (Desarrollo)

1. **Crear carpeta public/products**
   ```bash
   mkdir public/products
   ```

2. **Copiar imágenes** a esa carpeta
   ```
   public/products/producto1.jpg
   public/products/producto2.jpg
   ```

3. **Usar URLs relativas** en el dashboard:
   ```
   /products/producto1.jpg,/products/producto2.jpg
   ```

### Opción 4: Script de Actualización Masiva

Si tienes muchos productos, puedes usar un script:

```javascript
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function actualizarImagenes() {
  // Actualizar un producto específico
  await prisma.product.update({
    where: { id: 'ID_DEL_PRODUCTO' },
    data: {
      images: JSON.stringify([
        'https://tu-servidor.com/foto1.jpg',
        'https://tu-servidor.com/foto2.jpg'
      ])
    }
  })
  
  console.log('✅ Imágenes actualizadas')
  await prisma.$disconnect()
}

actualizarImagenes()
```

## 📋 Formatos Soportados

El sistema soporta **3 formatos** de imágenes:

### 1. Array JSON (Recomendado)
```json
["https://ejemplo.com/foto1.jpg", "https://ejemplo.com/foto2.jpg"]
```

### 2. String CSV
```
https://ejemplo.com/foto1.jpg,https://ejemplo.com/foto2.jpg
```

### 3. URL Única
```
https://ejemplo.com/foto.jpg
```

## ✅ Verificación

Después de agregar las fotos:

1. **Ir a la tienda**
   ```
   http://localhost:3000/tienda
   ```

2. **Verificar que se muestran**
   - Las fotos deben aparecer en las tarjetas de productos
   - Si no hay foto, se muestra el placeholder SVG

3. **Ver detalle del producto**
   - Click en "Ver Producto"
   - Debe mostrar la galería de imágenes

## 🎨 Recomendaciones de Imágenes

### Tamaño Óptimo:
- **Ancho:** 800-1200px
- **Alto:** 800-1200px
- **Formato:** JPG o PNG
- **Peso:** < 500KB por imagen

### Calidad:
- Fondo blanco o neutro
- Buena iluminación
- Producto centrado
- Alta resolución

### Cantidad:
- **Mínimo:** 1 imagen
- **Recomendado:** 3-5 imágenes
- **Máximo:** 10 imágenes

## 🔧 Troubleshooting

### Las fotos no se ven

1. **Verificar la URL**
   - Abrir la URL en el navegador
   - Debe mostrar la imagen

2. **Verificar CORS**
   - Si usas un servidor externo, debe permitir CORS

3. **Verificar formato**
   - Debe ser JPG, PNG, WebP o SVG

4. **Ver consola del navegador**
   - F12 → Console
   - Buscar errores de carga

### Placeholder no se muestra

1. **Verificar que existe**
   ```bash
   ls public/placeholder-product.svg
   ```

2. **Reiniciar el servidor**
   ```bash
   npm run dev
   ```

## 📝 Ejemplo Completo

### Producto con Múltiples Fotos:

```javascript
{
  "name": "iPhone 15 Pro Max",
  "description": "El mejor iPhone hasta ahora",
  "price": 5499000,
  "currency": "COP",
  "category": "PHYSICAL",
  "status": "AVAILABLE",
  "images": [
    "https://cloudinary.com/iphone-frente.jpg",
    "https://cloudinary.com/iphone-atras.jpg",
    "https://cloudinary.com/iphone-lateral.jpg",
    "https://cloudinary.com/iphone-camara.jpg"
  ]
}
```

## 🚀 Próximos Pasos

1. **Subir fotos** a un servicio de hosting
2. **Actualizar productos** con las URLs reales
3. **Verificar** en la tienda que se muestran correctamente
4. **Optimizar** las imágenes para web (compresión)

---

**Estado Actual:**
- ✅ Placeholder SVG funcionando
- ✅ Manejo robusto de 3 formatos
- ✅ URLs inválidas limpiadas
- ⏳ Pendiente: Agregar fotos reales

**Siguiente Paso:** Subir fotos reales de tus productos
