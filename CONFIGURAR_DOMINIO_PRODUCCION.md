# 🌐 Configurar Dominio para Compartir Links

## ✅ Ya Está Listo

Tu proyecto ya tiene:
- ✅ Logo: `public/logo.png`
- ✅ Imagen Open Graph: `public/og-image.png`
- ✅ Imagen Twitter: `public/og-image-twitter.png`
- ✅ Código configurado en `src/app/catalogo/layout.tsx`

## 🔧 Solo Falta Configurar el Dominio

### En Easypanel

Agregar esta variable de entorno:

```env
NEXT_PUBLIC_APP_URL=https://tu-dominio-easypanel.com
```

**Ejemplo:**
```env
NEXT_PUBLIC_APP_URL=https://bot-whatsapp.sqaoeo.easypanel.host
```

### Pasos:

1. **Ir a Easypanel** → Tu aplicación
2. **Environment Variables**
3. **Buscar** `NEXT_PUBLIC_APP_URL`
4. **Cambiar** de `http://localhost:3000` a tu dominio de Easypanel
5. **Guardar** y **Redesplegar**

## 🎯 Resultado

Cuando compartas el link del catálogo:

```
https://tu-dominio.easypanel.host/catalogo
```

Se verá con:
- ✅ Tu logo (`og-image.png`)
- ✅ Título: "Catálogo - Tecnovariedades D&S 🛍️"
- ✅ Descripción: "Descubre nuestros productos..."
- ✅ URL del sitio

## 🧪 Probar

### 1. Localmente (Desarrollo)

```bash
# Actualizar .env local
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Reiniciar servidor
npm run dev

# Abrir: http://localhost:3000/catalogo
# Ver código fuente (Ctrl+U) y buscar "og:image"
```

### 2. En Producción (Easypanel)

```bash
# Después de actualizar la variable en Easypanel:

# Probar en Facebook Debugger
https://developers.facebook.com/tools/debug/
# Pegar: https://tu-dominio.easypanel.host/catalogo

# Probar en WhatsApp
# Enviar el link a ti mismo
```

## 📱 Cómo Se Verá

### WhatsApp
```
┌─────────────────────────────────────┐
│  [TU LOGO DE og-image.png]          │
│                                     │
│  Catálogo - Tecnovariedades D&S 🛍️  │
│  Descubre nuestros productos:       │
│  Tecnología, Cursos Digitales...    │
│                                     │
│  tu-dominio.easypanel.host          │
└─────────────────────────────────────┘
```

### Facebook / LinkedIn
Igual que WhatsApp, usa la misma imagen.

### Twitter
Usa `og-image-twitter.png` (si existe) o `og-image.png`

## ✅ Checklist

- [x] Logo existe en `public/og-image.png`
- [x] Código configurado en `src/app/catalogo/layout.tsx`
- [ ] Variable `NEXT_PUBLIC_APP_URL` actualizada en Easypanel
- [ ] Aplicación redesplegada
- [ ] Probado en Facebook Debugger
- [ ] Probado en WhatsApp

## 🔍 Verificar que Funciona

### Ver el HTML generado:

```bash
# Abrir tu sitio
https://tu-dominio.easypanel.host/catalogo

# Ver código fuente (Ctrl+U o Click derecho → Ver código fuente)

# Buscar estas líneas:
<meta property="og:image" content="https://tu-dominio.../og-image.png" />
<meta property="og:title" content="Catálogo - Tecnovariedades D&S 🛍️" />
<meta property="og:description" content="Descubre nuestros productos..." />
```

Si ves esas líneas, ¡está funcionando! ✅

## 🐛 Si No Se Ve el Logo

### Problema 1: Caché de WhatsApp/Facebook

**Solución:**
```
Agregar ?v=2 al final del link
Ejemplo: https://tu-dominio.com/catalogo?v=2
```

### Problema 2: Variable no actualizada

**Verificar:**
```bash
# En Easypanel, ver logs
# Buscar: NEXT_PUBLIC_APP_URL

# Debe mostrar tu dominio, no localhost
```

### Problema 3: Imagen no accesible

**Verificar:**
```bash
# Abrir directamente la imagen
https://tu-dominio.easypanel.host/og-image.png

# Debe mostrar tu logo
# Si da 404, la imagen no está en public/
```

## 📝 Resumen

**Ya tienes todo listo**, solo necesitas:

1. Actualizar `NEXT_PUBLIC_APP_URL` en Easypanel
2. Redesplegar
3. Probar compartiendo el link

¡Eso es todo! 🎉
