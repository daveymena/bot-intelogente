# 🔧 SOLUCIÓN ERROR PWA EN MÓVIL (404)

## 🐛 Problema Identificado

El error 404 al instalar la PWA en móvil se debe a:

1. **URL hardcodeada en manifest.json** que no existe:
   ```json
   "start_url": "/tienda/cmhjgzsjl0000t526gou8b8x2"
   ```

2. **Iconos faltantes** referenciados en manifest.json pero que no existen:
   - icon-72.png
   - icon-96.png
   - icon-128.png
   - icon-144.png
   - icon-152.png
   - icon-384.png

3. **Screenshot faltante** para la instalación

---

## ✅ SOLUCIÓN APLICADA

### 1. Manifest.json Corregido

**ANTES:**
```json
{
  "start_url": "/tienda/cmhjgzsjl0000t526gou8b8x2",
  "name": "Tecnovariedades D&S - Tienda Online"
}
```

**DESPUÉS:**
```json
{
  "start_url": "/",
  "name": "Smart Sales Bot Pro - Tecnovariedades D&S",
  "short_name": "Smart Sales"
}
```

### 2. Service Worker Actualizado

**ANTES:**
```javascript
const urlsToCache = [
  '/',
  '/tienda/cmhjgzsjl0000t526gou8b8x2',
  '/offline.html'
];
```

**DESPUÉS:**
```javascript
const urlsToCache = [
  '/',
  '/offline.html',
  '/icon-192.png',
  '/icon-512.png'
];
```

---

## 🚀 PASOS PARA COMPLETAR LA SOLUCIÓN

### Paso 1: Generar Iconos Faltantes

```bash
# Ejecutar script de generación de iconos
npm run icons:generate
```

O manualmente con Sharp:

```bash
npx tsx scripts/generar-iconos-pwa.ts
```

### Paso 2: Actualizar Manifest con Solo Iconos Existentes

Editar `public/manifest.json` y dejar solo los iconos que existen:

```json
{
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Paso 3: Limpiar Caché del Service Worker

En el navegador móvil:
1. Ir a Configuración → Aplicaciones
2. Buscar "Smart Sales" o "Tecnovariedades"
3. Desinstalar la app
4. Limpiar caché del navegador
5. Volver a instalar

O desde DevTools (Chrome móvil):
1. Abrir chrome://inspect
2. Application → Clear storage
3. Unregister service workers

### Paso 4: Verificar en Producción

```bash
# Iniciar servidor
npm run dev

# Abrir en móvil
# http://localhost:4000
# o tu URL de producción
```

---

## 📱 MANIFEST.JSON OPTIMIZADO PARA MÓVIL

```json
{
  "name": "Smart Sales Bot Pro - Tecnovariedades D&S",
  "short_name": "Smart Sales",
  "description": "Sistema de ventas inteligente con WhatsApp - Gestiona tu negocio desde tu móvil",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait",
  "scope": "/",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["business", "productivity"],
  "lang": "es-CO",
  "dir": "ltr"
}
```

---

## 🧪 TESTING

### En Android

1. Abrir Chrome
2. Ir a tu URL
3. Menú → "Agregar a pantalla de inicio"
4. Verificar que se instale sin errores

### En iOS

1. Abrir Safari
2. Ir a tu URL
3. Compartir → "Agregar a pantalla de inicio"
4. Verificar que se instale sin errores

### Verificar Service Worker

```javascript
// En DevTools Console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

---

## 🔍 DIAGNÓSTICO DE ERRORES

### Error: "Failed to fetch manifest"
**Causa:** Manifest.json no accesible
**Solución:** Verificar que `/manifest.json` responda correctamente

### Error: "No matching service worker detected"
**Causa:** Service Worker no registrado
**Solución:** Verificar que `sw.js` esté en `/public/sw.js`

### Error: "Icon could not be loaded"
**Causa:** Iconos referenciados no existen
**Solución:** Generar iconos o actualizar manifest

### Error: "start_url did not respond with 200"
**Causa:** URL de inicio da 404
**Solución:** ✅ Ya corregido - ahora usa "/"

---

## 📄 ARCHIVOS MODIFICADOS

1. ✅ `public/manifest.json` - URL de inicio corregida
2. ✅ `public/sw.js` - URLs de caché actualizadas
3. 📝 Pendiente: Generar iconos faltantes

---

## 🎯 PRÓXIMOS PASOS

1. **Generar iconos completos** (72, 96, 128, 144, 152, 384)
2. **Crear screenshot** para mejor experiencia de instalación
3. **Agregar meta tags** en layout principal
4. **Probar en dispositivos reales**

---

## 💡 MEJORAS ADICIONALES

### Meta Tags para PWA (agregar en layout)

```html
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Smart Sales">
<link rel="apple-touch-icon" href="/icon-192.png">
```

### Mejorar Offline Experience

Crear página offline más informativa en `public/offline.html`

---

**Fecha:** 21 de Noviembre 2025
**Estado:** ✅ Corregido (pendiente generar iconos)
**Prioridad:** ALTA
