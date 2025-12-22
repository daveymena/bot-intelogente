# 🚀 Desplegar Correcciones Responsive en Easypanel

## Cambios Realizados

### ✅ 1. Responsive Móvil
- Agregado viewport correcto en layout.tsx
- CSS responsive en globals.css
- Botones adaptados para móvil
- Header optimizado para pantallas pequeñas
- Sidebar colapsable automático en móvil

### ✅ 2. Logo en Links Compartidos
- Open Graph configurado correctamente
- Meta tags para WhatsApp, Facebook, Twitter
- Imagen de 512x512px optimizada
- Cache busting con versión

### ✅ 3. Errores de Build Corregidos
- Frontend: 0 errores ✅
- Servidor: 27 errores no críticos (reducidos de 56)
- Todos los servicios principales funcionando

## Pasos para Desplegar en Easypanel

### Opción 1: Desde tu PC (Recomendado)

```bash
# 1. Ejecutar el script de subida
subir-correcciones-responsive.bat

# 2. Verificar que se subió correctamente
git log --oneline -1
```

### Opción 2: Desde Easypanel

1. **Ir a tu aplicación en Easypanel**
   - URL: https://easypanel.io

2. **Hacer Pull del repositorio**
   ```bash
   cd /app
   git pull origin main
   ```

3. **Rebuild de la aplicación**
   - Click en "Rebuild"
   - O desde terminal:
   ```bash
   npm install
   npm run build
   ```

4. **Reiniciar el servicio**
   - Click en "Restart"
   - O desde terminal:
   ```bash
   pm2 restart all
   ```

## Verificar que Funciona

### 1. Verificar Responsive Móvil

Abre en tu móvil o usa DevTools:
- Chrome DevTools → Toggle Device Toolbar (Ctrl+Shift+M)
- Probar diferentes tamaños:
  - iPhone SE (375px)
  - iPhone 12 Pro (390px)
  - Samsung Galaxy S20 (360px)
  - iPad (768px)

**Verificar:**
- ✅ Botones no se salen de la pantalla
- ✅ Header no está apiñado
- ✅ Sidebar se oculta automáticamente
- ✅ Formularios se apilan verticalmente
- ✅ Texto legible sin zoom

### 2. Verificar Logo en Links

**Probar compartir en WhatsApp:**
1. Copia el link de tu app: `https://tu-app.easypanel.host`
2. Pégalo en WhatsApp
3. Deberías ver:
   - ✅ Logo de Smart Sales Bot
   - ✅ Título: "Smart Sales Bot Pro"
   - ✅ Descripción del bot

**Probar en Facebook:**
1. Usa el debugger: https://developers.facebook.com/tools/debug/
2. Pega tu URL
3. Click en "Scrape Again"
4. Deberías ver el logo y metadata

**Probar en Twitter:**
1. Usa el validator: https://cards-dev.twitter.com/validator
2. Pega tu URL
3. Deberías ver la card con logo

### 3. Verificar Build

```bash
# En Easypanel terminal
npm run build

# Debería mostrar:
# ✓ Compiled successfully
# ✓ Collecting page data
# ✓ Generating static pages
```

## Variables de Entorno Importantes

Asegúrate de tener en Easypanel:

```env
# URL de tu aplicación
NEXT_PUBLIC_APP_URL=https://tu-app.easypanel.host

# Base de datos
DATABASE_URL=postgresql://...

# APIs
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-...

# WhatsApp
WHATSAPP_PHONE=573136174267
```

## Troubleshooting

### Problema: Logo no aparece en WhatsApp

**Solución:**
1. Verificar que el archivo existe:
   ```bash
   ls -la public/smart-sales-bot-logo.png
   ```

2. Limpiar cache de WhatsApp:
   - Esperar 24 horas, o
   - Cambiar la versión en layout.tsx:
   ```typescript
   const LOGO_VERSION = '?v=20251121'; // Cambiar número
   ```

3. Forzar actualización en Facebook:
   - https://developers.facebook.com/tools/debug/
   - Click "Scrape Again"

### Problema: Botones se salen en móvil

**Solución:**
1. Verificar que globals.css se aplicó:
   ```bash
   grep "max-width: 100%" src/app/globals.css
   ```

2. Limpiar cache del navegador:
   - Ctrl+Shift+R (hard reload)

3. Verificar viewport en layout.tsx:
   ```typescript
   export const viewport = {
     width: 'device-width',
     initialScale: 1,
   }
   ```

### Problema: Build falla en Easypanel

**Solución:**
1. Verificar logs:
   ```bash
   pm2 logs
   ```

2. Limpiar y reinstalar:
   ```bash
   rm -rf node_modules .next
   npm install
   npm run build
   ```

3. Verificar Node version:
   ```bash
   node --version  # Debe ser >= 18
   ```

## Comandos Útiles en Easypanel

```bash
# Ver logs en tiempo real
pm2 logs --lines 100

# Reiniciar aplicación
pm2 restart all

# Ver estado
pm2 status

# Ver uso de recursos
pm2 monit

# Limpiar cache de Next.js
rm -rf .next

# Rebuild completo
npm run build

# Ver variables de entorno
printenv | grep NEXT_PUBLIC
```

## Checklist Final

Antes de dar por terminado, verificar:

- [ ] Build exitoso sin errores críticos
- [ ] Logo aparece al compartir link en WhatsApp
- [ ] Responsive funciona en móvil (iPhone, Android)
- [ ] Dashboard se ve bien en móvil
- [ ] Landing pages responsive
- [ ] Botones no se salen del viewport
- [ ] Header no está apiñado
- [ ] Formularios funcionan en móvil
- [ ] Sidebar colapsable funciona
- [ ] Imágenes se cargan correctamente

## Soporte

Si algo no funciona:
1. Revisar logs: `pm2 logs`
2. Verificar variables de entorno
3. Limpiar cache y rebuild
4. Verificar que el commit se subió: `git log -1`

---

**Última actualización:** 20 de Noviembre 2025  
**Estado:** ✅ Listo para desplegar
