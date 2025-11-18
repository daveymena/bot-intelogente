# 🖼️ Configuración de Imagen para Compartir en Redes Sociales

## ✅ Cambios Realizados

Se actualizó `src/app/layout.tsx` para forzar el uso de la imagen correcta (`smart-sales-bot-logo.png`) cuando se comparte la URL en redes sociales y WhatsApp.

### Meta Tags Configuradas

```typescript
// Open Graph (Facebook, WhatsApp, LinkedIn)
openGraph: {
  images: [
    {
      url: `${APP_URL}/smart-sales-bot-logo.png`,  // Logo del bot 512x512
      width: 512,
      height: 512,
      alt: "Smart Sales Bot Pro - Bot de WhatsApp con IA",
      type: "image/png",
    }
  ]
}

// Twitter/X
twitter: {
  card: "summary_large_image",
  images: [`${APP_URL}/smart-sales-bot-logo.png`]
}

// Meta tags adicionales en <head>
<meta property="og:image" content="{APP_URL}/smart-sales-bot-logo.png" />
<meta property="og:image:secure_url" content="{APP_URL}/smart-sales-bot-logo.png" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="512" />
<meta property="og:image:height" content="512" />
```

## 🔧 Pasos para Aplicar en Easypanel

### 1. Subir los Cambios

```bash
git add src/app/layout.tsx
git commit -m "fix: forzar imagen correcta para compartir en redes sociales"
git push origin main
```

### 2. Rebuild en Easypanel

En Easypanel:
1. Ve a tu aplicación
2. Click en "Rebuild"
3. Espera a que termine el deploy

### 3. Limpiar Caché de Redes Sociales

Después del deploy, **DEBES limpiar el caché** de las plataformas:

#### 🟢 WhatsApp
WhatsApp cachea las imágenes agresivamente. Para forzar actualización:

1. **Debugger de Facebook** (WhatsApp usa esto):
   - Ve a: https://developers.facebook.com/tools/debug/
   - Pega tu URL: `https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host`
   - Click en "Scrape Again" varias veces
   - Verifica que muestre `og-image.png`

2. **Alternativa - Agregar parámetro temporal**:
   ```
   https://tu-url.com/?v=2
   ```
   El parámetro `?v=2` fuerza a WhatsApp a re-scrapear

#### 🔵 Twitter/X
- Ve a: https://cards-dev.twitter.com/validator
- Pega tu URL
- Click en "Preview card"

#### 🔴 LinkedIn
- Ve a: https://www.linkedin.com/post-inspector/
- Pega tu URL
- Click en "Inspect"

#### 🟣 Telegram
Telegram cachea por 24 horas. Opciones:
- Esperar 24 horas
- Agregar `?v=timestamp` a la URL

### 4. Verificar la Imagen

Asegúrate de que `/og-image.png` sea accesible:

```
https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host/og-image.png
```

Debe mostrar tu imagen de 1200x630px.

## 📋 Checklist de Verificación

- [ ] Código actualizado en `src/app/layout.tsx`
- [ ] Cambios pusheados a Git
- [ ] Rebuild completado en Easypanel
- [ ] Imagen accesible en `/og-image.png`
- [ ] Caché limpiado en Facebook Debugger
- [ ] Probado compartiendo en WhatsApp
- [ ] Imagen correcta aparece en preview

## 🎨 Especificaciones de la Imagen

La imagen `og-image.png` debe tener:

- **Dimensiones**: 1200 x 630 píxeles (ratio 1.91:1)
- **Formato**: PNG o JPG
- **Peso**: Menos de 8 MB (idealmente < 300 KB)
- **Contenido**: Logo + texto descriptivo
- **Texto**: Legible incluso en móvil

### Recomendaciones de Diseño

```
┌─────────────────────────────────────┐
│                                     │
│         [LOGO DEL BOT]              │
│                                     │
│    Smart Sales Bot Pro              │
│    Automatización de Ventas con IA  │
│                                     │
│    ✓ WhatsApp  ✓ IA  ✓ 24/7        │
│                                     │
└─────────────────────────────────────┘
```

## 🐛 Troubleshooting

### Problema: WhatsApp sigue mostrando imagen antigua

**Solución**:
1. Usa Facebook Debugger y haz "Scrape Again" 3-4 veces
2. Agrega `?v=timestamp` a tu URL al compartir
3. Espera 5-10 minutos y prueba de nuevo

### Problema: No aparece ninguna imagen

**Verificar**:
1. ¿La imagen existe en `/public/og-image.png`?
2. ¿Es accesible públicamente?
3. ¿El servidor está sirviendo archivos estáticos?
4. ¿Hay errores en la consola del navegador?

### Problema: Imagen se ve cortada

**Solución**:
- Asegúrate de que la imagen sea exactamente 1200x630px
- Deja márgenes de seguridad (50px) en los bordes
- Centra el contenido importante

## 🔗 URLs Útiles

- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **LinkedIn Inspector**: https://www.linkedin.com/post-inspector/
- **Open Graph Protocol**: https://ogp.me/

## 📝 Notas Importantes

1. **WhatsApp cachea por 7 días**: Una vez que WhatsApp cachea una imagen, puede tardar hasta 7 días en actualizarse naturalmente
2. **HTTPS requerido**: Las imágenes deben servirse por HTTPS
3. **Tamaño importa**: Imágenes muy grandes pueden no cargarse
4. **Formato**: PNG es preferible a JPG para logos con transparencia

---

**Estado**: ✅ Configurado
**Próximo paso**: Deploy a Easypanel y limpiar caché
**Fecha**: 18 de noviembre de 2025
