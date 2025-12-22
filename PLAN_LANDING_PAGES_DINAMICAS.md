# 🚀 Plan: Landing Pages Dinámicas por Producto

## Objetivo

Crear landing pages profesionales y dinámicas para cada producto que se puedan usar en anuncios de Facebook, Google Ads, Instagram, etc.

## Características

### ✅ Landing Pages Adaptativas por Tipo de Producto

1. **Productos Físicos** (Laptops, Motos, Electrónicos)
   - Hero con imagen grande del producto
   - Especificaciones técnicas destacadas
   - Galería de imágenes
   - Comparación de modelos
   - Garantía y envío
   - Testimonios

2. **Productos Digitales** (Cursos, Megapacks)
   - Video preview o demo
   - Contenido del curso/pack
   - Beneficios y resultados
   - Acceso inmediato
   - Bonos incluidos
   - Garantía de satisfacción

3. **Dropshipping**
   - Urgencia y escasez
   - Envío gratis destacado
   - Descuentos por tiempo limitado
   - Reseñas de clientes
   - FAQ expandido

## Estructura de URL

```
/landing/[productId]
/landing/[productId]/[variant]  // Ej: /landing/123/facebook
```

## Plantillas Disponibles

### 1. **Plantilla "Audifonos M91"** (Referencia)
- Hero full-width con imagen de producto
- Características en grid
- Sección de beneficios
- Call-to-action prominente
- Footer minimalista

### 2. **Plantilla "Tech Product"** (Laptops, Electrónicos)
- Especificaciones técnicas
- Comparación de modelos
- Galería de imágenes
- Video demo
- Garantía destacada

### 3. **Plantilla "Digital Course"** (Cursos, Megapacks)
- Video hero
- Módulos del curso
- Instructor/creador
- Testimonios
- Bonos y garantía

### 4. **Plantilla "Dropshipping"** (Productos importados)
- Urgencia (stock limitado)
- Descuento por tiempo limitado
- Envío gratis
- Reseñas sociales
- FAQ

## Funcionalidades

### ✅ Generación Automática
- Detecta tipo de producto automáticamente
- Aplica plantilla correspondiente
- Personaliza colores según configuración de tienda
- Genera meta tags para SEO y redes sociales

### ✅ Optimización para Anuncios
- Meta tags Open Graph (Facebook, WhatsApp)
- Twitter Cards
- Pixel de Facebook/TikTok
- Google Analytics
- Conversión tracking

### ✅ Elementos Dinámicos
- Contador de visitas
- Stock en tiempo real
- Temporizador de oferta
- Chat de WhatsApp flotante
- Botones de compartir

### ✅ A/B Testing
- Múltiples variantes por producto
- Tracking de conversiones
- Análisis de rendimiento

## Implementación Técnica

### Archivos a Crear

```
src/
├── app/
│   └── landing/
│       └── [productId]/
│           ├── page.tsx              # Landing principal
│           ├── [variant]/
│           │   └── page.tsx          # Variantes A/B
│           └── layout.tsx            # Layout sin header/footer
│
├── components/
│   └── landing/
│       ├── HeroSection.tsx           # Hero dinámico
│       ├── FeaturesGrid.tsx          # Grid de características
│       ├── ProductGallery.tsx        # Galería de imágenes
│       ├── TestimonialsSection.tsx   # Testimonios
│       ├── FAQSection.tsx            # Preguntas frecuentes
│       ├── CTASection.tsx            # Call-to-action
│       ├── CountdownTimer.tsx        # Temporizador
│       ├── SocialProof.tsx           # Prueba social
│       └── templates/
│           ├── PhysicalProductTemplate.tsx
│           ├── DigitalProductTemplate.tsx
│           └── DropshippingTemplate.tsx
│
└── lib/
    └── landing-page-generator.ts     # Lógica de generación
```

### Base de Datos (Prisma)

```prisma
model LandingPage {
  id          Int      @id @default(autoincrement())
  productId   Int
  product     Product  @relation(fields: [productId], references: [id])
  template    String   // 'physical', 'digital', 'dropshipping'
  variant     String?  // 'a', 'b', 'c' para A/B testing
  
  // Personalización
  heroImage   String?
  headline    String?
  subheadline String?
  ctaText     String?
  ctaColor    String?
  
  // Tracking
  views       Int      @default(0)
  clicks      Int      @default(0)
  conversions Int      @default(0)
  
  // SEO
  metaTitle       String?
  metaDescription String?
  ogImage         String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Ejemplo de Uso

### Para el Usuario (Dashboard)

```
1. Ir a Productos → Seleccionar producto
2. Click en "Generar Landing Page"
3. Elegir plantilla (auto-detectada)
4. Personalizar (opcional):
   - Headline
   - Colores
   - CTA
   - Imágenes adicionales
5. Generar URL
6. Copiar link para anuncios
```

### URL Generada

```
https://tu-dominio.com/landing/123
https://tu-dominio.com/landing/123/facebook
https://tu-dominio.com/landing/123/google-ads
```

## Próximos Pasos

1. ✅ Crear estructura de carpetas
2. ✅ Implementar layout sin header/footer
3. ✅ Crear componentes base
4. ✅ Implementar plantillas
5. ✅ Agregar tracking y analytics
6. ✅ Crear generador en dashboard
7. ✅ Agregar A/B testing

## Inspiración (audifonos_m91_original.html)

Elementos a replicar:
- Hero full-width con imagen de producto
- Grid de características con iconos
- Sección de beneficios
- CTA prominente y sticky
- Diseño limpio y moderno
- Optimizado para móvil

¿Quieres que empiece a implementar esto ahora?
