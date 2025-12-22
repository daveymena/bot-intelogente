# 🖼️ Arreglar Logo en WhatsApp - Guía Completa

## 🎯 Problema

Cuando compartes el link de tu app en WhatsApp, no aparece el logo, solo aparece un ícono genérico.

## ✅ Solución Implementada

### 1. Archivos Creados/Actualizados:

- ✅ `src/app/opengraph-image.tsx` - Imagen dinámica de Open Graph
- ✅ `src/app/landing/opengraph-image.tsx` - Imagen para landing
- ✅ `src/app/layout.tsx` - Meta tags actualizados
- ✅ `public/index.html` - Meta tags estáticos

### 2. Meta Tags Configurados:

```html
<!-- Open Graph (WhatsApp, Facebook) -->
<meta property="og:image" content="https://tu-dominio.com/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:type" content="image/png">
<meta property="og:image:secure_url" content="https://tu-dominio.com/og-image.png">
<meta property="og:title" content="Smart Sales Bot Pro">
<meta property="og:description" content="Bot inteligente de WhatsApp con IA">
```

## 🚀 Pasos para Aplicar

### Paso 1: Desplegar Cambios

```bash
# Commit y push
git add .
git commit -m "fix: Agregar meta tags de Open Graph para WhatsApp"
git push origin main
```

### Paso 2: Verificar que la Imagen Existe

Verifica que estos archivos existan en `public/`:
- ✅ `og-image.png` (1200x630px)
- ✅ `logo.png` (512x512px)
- ✅ `icon-512.png` (512x512px)

### Paso 3: Limpiar Cache de WhatsApp

WhatsApp cachea las previews de links. Para forzar actualización:

#### Opción A: Usar Herramienta de Facebook (Recomendado)

1. Ve a: https://developers.facebook.com/tools/debug/
2. Pega tu URL: `https://bot-whatsapp-bot-automatizado.sqaoeo.easypanel.host/`
3. Click en "Debug"
4. Click en "Scrape Again" para forzar actualización
5. Verifica que aparezca la imagen correcta

#### Opción B: Agregar Parámetro a la URL

Agrega un parámetro único al final de tu URL:
```
https://bot-whatsapp-bot-automatizado.sqaoeo.easypanel.host/?v=2
```

Cada vez que cambies el número, WhatsApp lo verá como URL nueva.

#### Opción C: Esperar (24-48 horas)

WhatsApp eventualmente actualizará el cache automáticamente.

### Paso 4: Verificar en WhatsApp

1. Abre WhatsApp
2. Envía el link a ti mismo o a un contacto
3. Verifica que aparezca:
   - ✅ Logo/imagen
   - ✅ Título: "Smart Sales Bot Pro"
   - ✅ Descripción

## 🔧 Troubleshooting

### Problema 1: Imagen No Aparece

**Causa:** La imagen no es accesible públicamente

**Solución:**
```bash
# Verificar que la imagen existe
curl -I https://bot-whatsapp-bot-automatizado.sqaoeo.easypanel.host/og-image.png

# Debe devolver: HTTP/1.1 200 OK
```

### Problema 2: Imagen Incorrecta

**Causa:** Cache de WhatsApp

**Solución:**
1. Usa el debugger de Facebook (Opción A arriba)
2. O agrega `?v=2` al final de la URL

### Problema 3: Solo Funciona en Algunas URLs

**Causa:** Cada página necesita sus propios meta tags

**Solución:**
- Landing: `/landing` tiene su propio `opengraph-image.tsx`
- Dashboard: `/dashboard` usa el del layout principal
- Catálogo: `/catalogo` puede necesitar su propio

## 📊 Verificar Meta Tags

### Herramientas Online:

1. **Facebook Debugger** (Mejor para WhatsApp)
   - https://developers.facebook.com/tools/debug/

2. **Twitter Card Validator**
   - https://cards-dev.twitter.com/validator

3. **LinkedIn Post Inspector**
   - https://www.linkedin.com/post-inspector/

4. **Open Graph Check**
   - https://www.opengraph.xyz/

### Verificar Manualmente:

```bash
# Ver meta tags de tu página
curl -s https://bot-whatsapp-bot-automatizado.sqaoeo.easypanel.host/ | grep "og:image"
```

## 🎨 Crear Imagen Personalizada

Si quieres cambiar la imagen de preview:

### Opción 1: Usar Imagen Estática

1. Crea una imagen 1200x630px
2. Guárdala como `public/og-image.png`
3. Asegúrate que sea PNG o JPG
4. Tamaño máximo: 8MB

### Opción 2: Usar Imagen Dinámica (Actual)

El archivo `src/app/opengraph-image.tsx` genera la imagen dinámicamente.

Para personalizarla:
```tsx
// Cambiar colores
background: 'linear-gradient(135deg, #TU_COLOR_1 0%, #TU_COLOR_2 100%)'

// Cambiar texto
<div>Tu Texto Aquí</div>

// Agregar logo
// Puedes usar una imagen desde public/
```

## 📝 URLs a Actualizar

Actualiza estas URLs en los archivos:

1. **`.env`**
```env
NEXT_PUBLIC_APP_URL=https://bot-whatsapp-bot-automatizado.sqaoeo.easypanel.host
```

2. **`src/app/layout.tsx`**
```tsx
metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://...')
```

3. **`public/index.html`**
```html
<meta property="og:url" content="https://tu-dominio.com/">
<meta property="og:image" content="https://tu-dominio.com/og-image.png">
```

## ✅ Checklist Final

- [ ] Archivos creados/actualizados
- [ ] Cambios desplegados en Easypanel
- [ ] Imagen `og-image.png` existe en `public/`
- [ ] URL actualizada en `.env`
- [ ] Cache de WhatsApp limpiado (Facebook Debugger)
- [ ] Verificado en WhatsApp que aparece el logo
- [ ] Verificado en otras redes (Facebook, Twitter, LinkedIn)

## 🚀 Resultado Esperado

Cuando compartas el link en WhatsApp, debe verse así:

```
┌─────────────────────────────┐
│  [LOGO/IMAGEN GRANDE]       │
│                             │
│  Smart Sales Bot Pro        │
│  Bot inteligente de         │
│  WhatsApp con IA avanzada   │
│                             │
│  bot-whatsapp-bot-...       │
└─────────────────────────────┘
```

## 📞 Soporte

Si después de seguir todos los pasos el logo no aparece:

1. Verifica que la imagen sea accesible públicamente
2. Usa el Facebook Debugger para ver errores
3. Revisa los logs de Easypanel
4. Verifica que Next.js esté sirviendo la imagen correctamente

---

**Fecha:** 2025-11-04
**Estado:** ✅ Implementado
**Próximo paso:** Desplegar y limpiar cache de WhatsApp
