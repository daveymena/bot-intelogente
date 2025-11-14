# ✅ Imagen Open Graph Lista

## 🎯 Problema Resuelto

Ahora cuando compartas el link de tu sitio en WhatsApp, Facebook, Twitter, etc., aparecerá una imagen profesional con tu marca.

## ✅ Lo que se Hizo

### 1. **Imagen Generada**
- ✅ `public/og-image.png` (1200x630px)
- ✅ `public/og-image-twitter.png` (1200x600px)
- ✅ Diseño profesional con degradado morado
- ✅ Iconos de WhatsApp e IA
- ✅ Texto: "Smart Sales Bot Pro"

### 2. **URLs Absolutas Configuradas**
```typescript
// Antes (no funcionaba):
url: "/og-image.png"

// Ahora (funciona):
url: "https://tu-dominio.com/og-image.png"
```

### 3. **Variable de Entorno**
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📱 Dónde Aparecerá

Cuando compartas tu link, la imagen aparecerá en:
- ✅ WhatsApp
- ✅ Facebook
- ✅ Twitter/X
- ✅ LinkedIn
- ✅ Telegram
- ✅ Discord
- ✅ Slack
- ✅ iMessage

## 🚀 Para Producción

### 1. Actualizar URL en .env:
```env
# Desarrollo
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Producción (cambiar por tu dominio real)
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### 2. Subir a Git:
```bash
git add .
git commit -m "feat: agregar imagen Open Graph para compartir"
git push origin main
```

### 3. Redesplegar en Easypanel

### 4. Configurar Variable en Easypanel:
```
NEXT_PUBLIC_APP_URL=https://tu-app.easypanel.host
```

## 🧪 Probar

### Herramientas Online:
1. **Open Graph Debugger**: https://www.opengraph.xyz/
2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
3. **Facebook Debugger**: https://developers.facebook.com/tools/debug/

### Prueba Manual:
1. Compartir link en WhatsApp
2. Ver que aparece la imagen
3. ✅ Listo!

## 🎨 Personalizar

Si quieres cambiar el diseño de la imagen:

1. Editar: `scripts/generar-og-image-profesional.ts`
2. Cambiar colores, texto, iconos, etc.
3. Ejecutar: `npx tsx scripts/generar-og-image-profesional.ts`
4. La nueva imagen se generará en `public/og-image.png`

## 📊 Especificaciones Técnicas

### Tamaños Recomendados:
- **Facebook/WhatsApp**: 1200x630px (ratio 1.91:1)
- **Twitter**: 1200x600px (ratio 2:1)
- **LinkedIn**: 1200x627px (ratio 1.91:1)

### Formato:
- PNG o JPG
- Peso máximo: 1MB
- Resolución: 72 DPI mínimo

### Meta Tags Generados:
```html
<!-- Open Graph -->
<meta property="og:image" content="https://tu-dominio.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://tu-dominio.com/og-image.png" />
```

## ⚠️ Importante

1. **URL Absoluta**: Debe incluir `https://` completo
2. **Caché**: Las redes sociales cachean las imágenes. Si cambias la imagen:
   - Usa el Facebook Debugger para limpiar caché
   - O cambia el nombre del archivo
3. **Tamaño**: No exceder 1MB de peso
4. **Formato**: PNG o JPG (PNG recomendado)

## 🔍 Verificar

### En el Código Fuente:
1. Abrir tu sitio
2. Ver código fuente (Ctrl+U)
3. Buscar `og:image`
4. Debe mostrar URL completa: `https://tu-dominio.com/og-image.png`

### En WhatsApp:
1. Compartir link de tu sitio
2. Esperar 2-3 segundos
3. Debe aparecer la imagen
4. ✅ Si aparece, funciona!

## 📁 Archivos

### Modificados:
- `src/app/layout.tsx` - URLs absolutas para OG
- `.env` - NEXT_PUBLIC_APP_URL configurado

### Creados:
- `scripts/generar-og-image-profesional.ts` - Generador
- `public/og-image.png` - Imagen principal
- `public/og-image-twitter.png` - Imagen para Twitter
- `IMAGEN_OG_PARA_COMPARTIR.txt` - Instrucciones
- `IMAGEN_OG_LISTA.md` - Este archivo

## ✅ Checklist

- [x] Imagen generada (1200x630px)
- [x] URLs absolutas configuradas
- [x] Variable NEXT_PUBLIC_APP_URL en .env
- [ ] Actualizar URL para producción
- [ ] Subir a Git
- [ ] Redesplegar
- [ ] Probar compartiendo en WhatsApp

## 🚀 Próximos Pasos

1. **Desarrollo**: Ya funciona con localhost
2. **Producción**: 
   - Actualizar `NEXT_PUBLIC_APP_URL` con tu dominio real
   - Subir cambios a Git
   - Redesplegar
   - Probar compartiendo el link

---

**Estado**: ✅ Listo para Desarrollo  
**Pendiente**: Configurar URL de producción  
**Fecha**: 2 de Noviembre, 2025
