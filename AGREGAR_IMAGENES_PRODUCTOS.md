# 📸 Cómo Agregar Imágenes Reales a los Productos

## 🎯 Opciones para Agregar Imágenes

Tienes 3 opciones para agregar imágenes reales a tus productos:

---

## ✅ OPCIÓN 1: Subir a un Servicio de Imágenes (RECOMENDADO)

### Servicios Gratuitos:

**1. ImgBB** (https://imgbb.com)
- Gratis, sin registro
- Sube la imagen
- Copia el "Direct link"
- Pega en el producto

**2. Imgur** (https://imgur.com)
- Gratis, sin registro
- Sube la imagen
- Clic derecho → "Copiar dirección de imagen"
- Pega en el producto

**3. Cloudinary** (https://cloudinary.com)
- Gratis hasta 25GB
- Más profesional
- Mejor para muchas imágenes

### Pasos:

1. **Sube tu imagen** a ImgBB o Imgur
2. **Copia la URL** de la imagen
3. **En el dashboard:**
   - Ve a "Productos"
   - Haz clic en el producto
   - Pega la URL en "Imágenes"
   - Guarda

**Ejemplo de URL:**
```
https://i.ibb.co/abc123/laptop-hp.jpg
```

---

## ✅ OPCIÓN 2: Agregar URLs al JSON

Si tienes las URLs de las imágenes, agrégalas directamente al JSON:

### Editar `scripts/productos-completos.json`:

```json
{
  "codigo": "2671",
  "procesador": "AMD Ryzen 3 7320U",
  "precio": 1189000,
  "imagen": "https://i.ibb.co/abc123/asus-vivobook.jpg"
}
```

### Luego actualiza el script de importación:

En `scripts/import-productos-completos.ts`, cambia:

```typescript
// Antes:
images: JSON.stringify(['https://images.unsplash.com/photo-xxx?w=500']),

// Después:
images: JSON.stringify([laptop.imagen || 'https://images.unsplash.com/photo-xxx?w=500']),
```

---

## ✅ OPCIÓN 3: Carpeta Local (Para Desarrollo)

### Crear carpeta de imágenes:

1. Crea la carpeta: `public/images/productos/`
2. Coloca tus imágenes ahí
3. Usa rutas relativas

**Estructura:**
```
public/
  images/
    productos/
      laptops/
        asus-vivobook-2671.jpg
        hp-core-i5-2568.jpg
      componentes/
        ram-attech-16gb.jpg
      accesorios/
        morral-hp-gris.jpg
```

**En el producto:**
```
/images/productos/laptops/asus-vivobook-2671.jpg
```

---

## 📋 Guía Rápida: Subir Imágenes con ImgBB

### Paso 1: Ir a ImgBB
```
https://imgbb.com
```

### Paso 2: Subir Imagen
- Haz clic en "Start uploading"
- Selecciona tu imagen
- Espera a que suba

### Paso 3: Copiar URL
- Haz clic en "Direct link"
- Se copia automáticamente

### Paso 4: Agregar al Producto
1. Dashboard → Productos
2. Edita el producto
3. Campo "Imágenes" → Pega la URL
4. Guarda

---

## 🔄 Actualizar Productos Masivamente

Si tienes muchas imágenes, puedes actualizar el JSON y reimportar:

### 1. Sube todas las imágenes a ImgBB/Imgur

### 2. Crea un archivo con las URLs:

`scripts/imagenes-productos.json`:
```json
{
  "2671": "https://i.ibb.co/abc123/asus-2671.jpg",
  "2486": "https://i.ibb.co/def456/asus-2486.jpg",
  "2910": "https://i.ibb.co/ghi789/asus-2910.jpg"
}
```

### 3. Actualiza el script de importación:

```typescript
import imagenesMap from './imagenes-productos.json'

// Al crear el producto:
images: JSON.stringify([imagenesMap[laptop.codigo] || 'placeholder.jpg'])
```

---

## 🎨 Optimizar Imágenes

### Antes de subir:

**Tamaño recomendado:**
- Ancho: 800px
- Alto: 600px
- Formato: JPG o WebP
- Peso: Menos de 200KB

**Herramientas gratuitas:**
- TinyPNG: https://tinypng.com
- Squoosh: https://squoosh.app
- Compressor.io: https://compressor.io

---

## 📝 Plantilla para Organizar URLs

Crea un archivo Excel o Google Sheets:

| Código | Producto | URL Imagen | Estado |
|--------|----------|------------|--------|
| 2671 | ASUS Ryzen 3 | https://i.ibb.co/... | ✅ |
| 2486 | ASUS Core i5 | https://i.ibb.co/... | ✅ |
| 2910 | ASUS Ryzen 5 | Pendiente | ❌ |

---

## 🤖 Script para Actualizar Imágenes

Voy a crear un script que te ayude a actualizar las imágenes:

`scripts/actualizar-imagenes.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mapa de código → URL de imagen
const imagenes = {
  "2671": "https://i.ibb.co/abc123/asus-2671.jpg",
  "2486": "https://i.ibb.co/def456/asus-2486.jpg",
  // Agrega más aquí...
}

async function actualizarImagenes() {
  for (const [codigo, url] of Object.entries(imagenes)) {
    // Buscar producto por nombre que contenga el código
    const productos = await prisma.product.findMany({
      where: {
        name: {
          contains: codigo
        }
      }
    })

    for (const producto of productos) {
      await prisma.product.update({
        where: { id: producto.id },
        data: {
          images: JSON.stringify([url])
        }
      })
      console.log(`✅ Actualizado: ${producto.name}`)
    }
  }
}

actualizarImagenes()
```

---

## 💡 Tips

### Para Laptops:
- Usa fotos del fabricante (ASUS, HP, Lenovo)
- Busca en Google Images → Herramientas → Tamaño: Grande
- Asegúrate de que sea la imagen correcta del modelo

### Para Componentes:
- Fotos del producto en fondo blanco
- Muestra el producto claramente
- Evita imágenes con mucho texto

### Para Mega Packs:
- Usa imágenes de cursos/educación
- Iconos o ilustraciones relacionadas
- Colores llamativos

---

## 🚀 Proceso Recomendado

### Para empezar rápido:

1. **Importa los productos** con imágenes placeholder:
   ```bash
   importar-catalogo-completo.bat
   ```

2. **Ve agregando imágenes reales** poco a poco:
   - Empieza con los productos más importantes
   - Usa ImgBB para subir
   - Edita desde el dashboard

3. **Prioriza:**
   - Laptops más vendidas
   - Productos destacados
   - Mega Packs populares

---

## 📊 Ejemplo Completo

### Producto: ASUS VivoBook Ryzen 3

**1. Buscar imagen:**
- Google: "ASUS VivoBook GO 15 Ryzen 3 7320U"
- Descargar imagen oficial

**2. Optimizar:**
- TinyPNG → Reducir tamaño
- Resultado: 150KB

**3. Subir:**
- ImgBB → Upload
- URL: `https://i.ibb.co/xyz789/asus-vivobook-ryzen3.jpg`

**4. Agregar al producto:**
- Dashboard → Productos
- Buscar "ASUS Ryzen 3"
- Editar → Imágenes → Pegar URL
- Guardar

**5. Verificar:**
- Recargar página de productos
- Ver imagen real del producto

---

## ✅ Checklist

- [ ] Decidir qué opción usar (ImgBB recomendado)
- [ ] Recopilar imágenes de productos
- [ ] Optimizar imágenes (TinyPNG)
- [ ] Subir a ImgBB/Imgur
- [ ] Copiar URLs
- [ ] Actualizar productos en dashboard
- [ ] Verificar que se vean correctamente

---

**¿Necesitas ayuda?**

Si tienes las imágenes listas, puedo ayudarte a:
1. Crear el script de actualización masiva
2. Generar el JSON con las URLs
3. Automatizar el proceso

**¡Las imágenes reales harán que tus productos se vean mucho más profesionales!** 📸
