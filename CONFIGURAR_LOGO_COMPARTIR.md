# 🖼️ Configurar Logo al Compartir Links

## 🎯 Objetivo

Cuando compartas un link de tu sitio (por WhatsApp, Facebook, etc.), que se vea así:

```
┌─────────────────────────────────────┐
│  [LOGO DE TU EMPRESA]               │
│                                     │
│  Catálogo - Tecnovariedades D&S 🛍️  │
│  Descubre nuestros productos...     │
│                                     │
│  tu-dominio.com                     │
└─────────────────────────────────────┘
```

## 📋 Pasos para Configurar

### PASO 1: Crear la Imagen del Logo (Open Graph)

#### Especificaciones:
- **Tamaño:** 1200 x 630 píxeles (recomendado)
- **Formato:** PNG o JPG
- **Peso:** Máximo 8 MB (recomendado < 300 KB)
- **Nombre:** `logo-og.png` o `og-image.png`

#### Herramientas para Crear:

**Opción A: Canva (Gratis)**
1. Ir a https://www.canva.com
2. Crear diseño → Tamaño personalizado: 1200 x 630 px
3. Agregar:
   - Logo de tu empresa
   - Nombre: "Tecnovariedades D&S"
   - Slogan: "Tecnología y Soluciones Digitales"
   - Colores de tu marca
4. Descargar como PNG

**Opción B: Figma (Gratis)**
1. Crear frame de 1200 x 630 px
2. Diseñar tu imagen
3. Exportar como PNG

**Opción C: Photoshop/GIMP**
1. Nuevo documento: 1200 x 630 px
2. Diseñar
3. Guardar como PNG

#### Ejemplo de Diseño:

```
┌────────────────────────────────────────────────┐
│                                                │
│         [LOGO]  Tecnovariedades D&S            │
│                                                │
│    Tecnología • Cursos • Servicios             │
│                                                │
│         📱 💻 🎓 🛠️                             │
│                                                │
│    Cali, Colombia                              │
│                                                │
└────────────────────────────────────────────────┘
```

### PASO 2: Subir la Imagen

#### Opción A: En tu proyecto (Recomendado)

```bash
# Crear carpeta public si no existe
mkdir -p public

# Copiar tu imagen
# Coloca logo-og.png en: public/logo-og.png
```

La imagen estará disponible en: `https://tu-dominio.com/logo-og.png`

#### Opción B: Usar un servicio externo

**Cloudinary (Gratis):**
1. Crear cuenta en https://cloudinary.com
2. Subir imagen
3. Copiar URL pública

**ImgBB (Gratis):**
1. Ir a https://imgbb.com
2. Subir imagen
3. Copiar "Direct link"

**GitHub (Gratis):**
1. Subir a tu repositorio en `/public`
2. URL: `https://raw.githubusercontent.com/tu-usuario/tu-repo/main/public/logo-og.png`

### PASO 3: Actualizar el Código

Ya creé el archivo `src/app/catalogo/layout.tsx` con la configuración.

**Solo necesitas cambiar:**

```typescript
// En src/app/catalogo/layout.tsx

openGraph: {
  url: 'https://TU-DOMINIO-AQUI.com/catalogo',  // ← Cambiar
  images: [
    {
      url: 'https://TU-DOMINIO-AQUI.com/logo-og.png',  // ← Cambiar
      width: 1200,
      height: 630,
    },
  ],
},
```

### PASO 4: Configurar para Toda la Aplicación

Crear `src/app/layout.tsx` con metadata global:

```typescript
// src/app/layout.tsx

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Tecnovariedades D&S',
    template: '%s | Tecnovariedades D&S'
  },
  description: 'Tecnología, cursos digitales y servicios en Cali, Colombia',
  
  openGraph: {
    title: 'Tecnovariedades D&S',
    description: 'Tecnología, cursos digitales y servicios',
    url: 'https://tu-dominio.com',
    siteName: 'Tecnovariedades D&S',
    images: [
      {
        url: 'https://tu-dominio.com/logo-og.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'es_CO',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
```

### PASO 5: Agregar Favicon

```bash
# Coloca estos archivos en /public:
# - favicon.ico (16x16 o 32x32)
# - apple-touch-icon.png (180x180)
# - icon.png (cualquier tamaño)
```

Next.js los detectará automáticamente.

### PASO 6: Probar

#### Herramientas de Prueba:

**1. Facebook Debugger:**
- URL: https://developers.facebook.com/tools/debug/
- Pegar tu URL
- Click en "Scrape Again"

**2. WhatsApp:**
- Enviar el link a ti mismo
- Ver cómo se ve la preview

**3. LinkedIn Post Inspector:**
- URL: https://www.linkedin.com/post-inspector/
- Pegar tu URL

**4. Twitter Card Validator:**
- URL: https://cards-dev.twitter.com/validator
- Pegar tu URL

### PASO 7: Limpiar Caché

Si ya compartiste el link antes y no se ve el logo:

**WhatsApp:**
```
No hay forma directa de limpiar caché.
Solución: Agregar ?v=2 al final del link
Ejemplo: https://tu-dominio.com/catalogo?v=2
```

**Facebook:**
```
Usar Facebook Debugger y click en "Scrape Again"
```

## 🎨 Plantilla de Imagen Open Graph

### Diseño Recomendado:

```
┌────────────────────────────────────────────────┐
│  Fondo: Color de tu marca o degradado         │
│                                                │
│         [LOGO GRANDE]                          │
│                                                │
│    Tecnovariedades D&S                         │
│    Tecnología • Cursos • Servicios             │
│                                                │
│    📱 +57 300 556 0186                         │
│    📍 Cali, Colombia                           │
│                                                │
└────────────────────────────────────────────────┘
```

### Colores Sugeridos:

```css
/* Opción 1: Profesional */
Fondo: #1e3a8a (azul oscuro)
Texto: #ffffff (blanco)
Acento: #3b82f6 (azul)

/* Opción 2: Moderno */
Fondo: Degradado de #667eea a #764ba2
Texto: #ffffff
Acento: #fbbf24 (amarillo)

/* Opción 3: Tecnológico */
Fondo: #0f172a (azul muy oscuro)
Texto: #ffffff
Acento: #06b6d4 (cyan)
```

## 📱 Configuración Específica por Plataforma

### WhatsApp

WhatsApp usa Open Graph. Asegúrate de tener:

```typescript
openGraph: {
  title: 'Título corto y atractivo',
  description: 'Descripción de 2-3 líneas máximo',
  images: [{
    url: 'https://tu-dominio.com/logo-og.png',
    width: 1200,
    height: 630,
  }],
}
```

### Facebook

Igual que WhatsApp, usa Open Graph.

### Twitter

Usa Twitter Cards:

```typescript
twitter: {
  card: 'summary_large_image',
  title: 'Título',
  description: 'Descripción',
  images: ['https://tu-dominio.com/logo-og.png'],
}
```

### LinkedIn

Usa Open Graph, similar a Facebook.

## 🔧 Configuración Avanzada

### Imágenes Dinámicas por Producto

```typescript
// src/app/catalogo/[id]/page.tsx

export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.id)
  
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [
        {
          url: product.images[0] || 'https://tu-dominio.com/logo-og.png',
          width: 1200,
          height: 630,
        },
      ],
    },
  }
}
```

### Generar Imágenes Automáticamente

Usar `@vercel/og` para generar imágenes dinámicas:

```typescript
// src/app/api/og/route.tsx

import { ImageResponse } from '@vercel/og'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'Tecnovariedades D&S'

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom, #1e3a8a, #3b82f6)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <h1 style={{ fontSize: 60 }}>{title}</h1>
        <p style={{ fontSize: 30 }}>Tecnovariedades D&S</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
```

Luego usar:
```typescript
images: [{
  url: 'https://tu-dominio.com/api/og?title=Mi+Producto',
}]
```

## ✅ Checklist

- [ ] Crear imagen 1200x630 px
- [ ] Subir a `/public/logo-og.png`
- [ ] Actualizar `src/app/catalogo/layout.tsx`
- [ ] Cambiar URL del dominio
- [ ] Desplegar a producción
- [ ] Probar en Facebook Debugger
- [ ] Probar en WhatsApp
- [ ] Limpiar caché si es necesario

## 🎯 Resultado Final

Cuando compartas: `https://tu-dominio.com/catalogo`

Se verá:
```
┌─────────────────────────────────────┐
│  [TU LOGO]                          │
│                                     │
│  Catálogo - Tecnovariedades D&S 🛍️  │
│  Descubre nuestros productos:       │
│  Tecnología, Cursos Digitales...    │
│                                     │
│  tu-dominio.com                     │
└─────────────────────────────────────┘
```

---

¿Necesitas ayuda para crear la imagen del logo o configurar algo específico?
