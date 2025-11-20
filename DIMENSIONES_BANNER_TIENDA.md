# 📐 Dimensiones del Banner de la Tienda

## Dimensiones Recomendadas

### Banner Principal (Hero)
- **Ancho:** 1920px (mínimo 1200px)
- **Alto:** 400px - 600px
- **Relación de aspecto:** 16:9 o 21:9
- **Formato:** JPG, PNG, WebP
- **Peso máximo:** 500KB (optimizado)

### Dimensiones por Dispositivo

#### Desktop (1920x500px)
```
Ancho: 1920px
Alto: 500px
Ratio: 3.84:1
```
Ideal para pantallas grandes, muestra todo el contenido sin scroll.

#### Tablet (1024x400px)
```
Ancho: 1024px
Alto: 400px
Ratio: 2.56:1
```
Se adapta automáticamente con CSS responsive.

#### Mobile (768x300px)
```
Ancho: 768px
Alto: 300px
Ratio: 2.56:1
```
Versión compacta para móviles.

---

## Recomendaciones de Diseño

### ✅ Buenas Prácticas

1. **Área segura de texto:**
   - Deja 100px de margen en los lados
   - Deja 80px arriba y abajo
   - Coloca texto importante en el centro

2. **Colores:**
   - Usa colores que contrasten con tu marca
   - Asegúrate de que el texto sea legible
   - Considera modo oscuro/claro

3. **Contenido:**
   - Logo o nombre de la tienda
   - Slogan o mensaje principal
   - Call-to-action (CTA) visible
   - Máximo 2-3 elementos de texto

4. **Optimización:**
   - Comprime la imagen (TinyPNG, Squoosh)
   - Usa WebP para mejor rendimiento
   - Considera lazy loading

### ❌ Evitar

- Texto muy pequeño (mínimo 24px)
- Demasiados elementos
- Imágenes muy pesadas (>1MB)
- Colores que no contrasten

---

## Ejemplos de Dimensiones

### Opción 1: Banner Ancho (Recomendado)
```
1920 x 500px
- Perfecto para mostrar productos
- Espacio para texto y CTA
- Se ve bien en todas las pantallas
```

### Opción 2: Banner Alto
```
1920 x 600px
- Más espacio vertical
- Ideal para storytelling
- Mejor para imágenes de productos
```

### Opción 3: Banner Compacto
```
1920 x 400px
- Más espacio para productos
- Carga más rápida
- Menos scroll necesario
```

---

## Herramientas para Crear el Banner

### Diseño Gratuito
- **Canva:** https://www.canva.com
  - Plantilla: "Banner Web" → 1920x500px
  - Miles de plantillas gratuitas
  
- **Figma:** https://www.figma.com
  - Más profesional
  - Control total del diseño

- **Photopea:** https://www.photopea.com
  - Photoshop online gratis
  - Soporta PSD

### Optimización de Imágenes
- **TinyPNG:** https://tinypng.com
- **Squoosh:** https://squoosh.app
- **ImageOptim:** https://imageoptim.com

### Bancos de Imágenes Gratuitas
- **Unsplash:** https://unsplash.com
- **Pexels:** https://www.pexels.com
- **Pixabay:** https://pixabay.com

---

## Cómo Agregar el Banner

### Opción 1: URL Externa
```typescript
// En el dashboard de configuración
bannerUrl: "https://tu-dominio.com/banner.jpg"
```

### Opción 2: Subir a /public
```
1. Guarda tu banner como: banner.jpg
2. Colócalo en: /public/banners/banner.jpg
3. Usa la ruta: /banners/banner.jpg
```

### Opción 3: Servicio de Hosting
- **Cloudinary:** Gratis hasta 25GB
- **ImgBB:** Hosting gratuito de imágenes
- **Imgur:** Hosting simple

---

## Plantilla de Banner

### Estructura Recomendada

```
┌─────────────────────────────────────────────┐
│  [Logo]                    [Redes Sociales] │ ← 80px padding
│                                              │
│         🎯 TEXTO PRINCIPAL                   │ ← Centro
│         Slogan o mensaje corto               │
│                                              │
│         [Botón CTA: Ver Productos]           │
│                                              │
└─────────────────────────────────────────────┘
  ← 100px →                        ← 100px →
```

### Ejemplo de Contenido

**Para Tecnovariedades D&S:**
```
Título: "Tecnología y Variedad a tu Alcance"
Subtítulo: "Laptops, Motos, Cursos y Más"
CTA: "Explorar Productos"
```

---

## Implementación Técnica

El banner se agregará en la configuración de la tienda:

```typescript
interface StoreSettings {
  // ... otros campos
  bannerUrl?: string
  bannerMobileUrl?: string  // Opcional: banner para móvil
  bannerAlt?: string        // Texto alternativo
  bannerLink?: string       // Link al hacer clic
}
```

---

## Próximos Pasos

1. **Diseña tu banner** (1920x500px recomendado)
2. **Optimiza la imagen** (máximo 500KB)
3. **Sube a un hosting** o coloca en `/public/`
4. **Configura en el dashboard** (próxima actualización)
5. **Verifica en móvil y desktop**

---

## ¿Necesitas Ayuda?

Si quieres que agregue el campo de banner al dashboard de configuración, solo dime y lo implemento ahora mismo.

También puedo:
- Crear un componente de banner responsive
- Agregar soporte para múltiples banners (slider)
- Implementar lazy loading
- Agregar animaciones de entrada
