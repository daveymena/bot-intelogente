# 🎨 Forzar Logo Nuevo en WhatsApp

## ✅ Cambios Aplicados

He actualizado `src/app/layout.tsx` para forzar el nuevo logo agregando un parámetro de versión:

```typescript
const LOGO_VERSION = '?v=20251120';
```

Todos los meta tags ahora usan:
```
/smart-sales-bot-logo.png?v=20251120
```

Esto fuerza a WhatsApp y otras plataformas a descargar la imagen nueva en lugar de usar el caché.

## 🔄 Cómo Aplicar los Cambios

### 1. Reiniciar el Servidor

```bash
# Detener servidor actual (Ctrl+C)
# Luego iniciar de nuevo
npm run dev
```

### 2. Limpiar Caché de WhatsApp

WhatsApp cachea las imágenes por URL. Para forzar la actualización:

#### Opción A: Usar Herramienta de Facebook (RECOMENDADO)

1. Ir a: https://developers.facebook.com/tools/debug/
2. Ingresar tu URL: `http://localhost:4000` (o tu URL de producción)
3. Click en "Scrape Again" (Volver a Scrapear)
4. Esto fuerza a WhatsApp a descargar la imagen nueva

#### Opción B: Esperar 24-48 horas

WhatsApp eventualmente actualizará el caché automáticamente.

#### Opción C: Cambiar la URL del Logo

Si necesitas actualización inmediata, renombra el archivo:

```bash
# Copiar logo con nuevo nombre
copy public\smart-sales-bot-logo.png public\smart-sales-bot-logo-v2.png
```

Luego actualizar en `layout.tsx`:
```typescript
const LOGO_VERSION = '?v=20251120'; // o cambiar a '-v2.png'
```

## 🧪 Probar el Logo Nuevo

### 1. Verificar en el Navegador

```bash
# Abrir en navegador
http://localhost:4000
```

Ver el código fuente (Ctrl+U) y buscar:
```html
<meta property="og:image" content="http://localhost:4000/smart-sales-bot-logo.png?v=20251120" />
```

### 2. Probar en WhatsApp

1. Enviar un mensaje con tu URL a un contacto de prueba
2. WhatsApp debería mostrar el preview con el logo nuevo
3. Si aún muestra el antiguo, usar la herramienta de Facebook (Opción A)

### 3. Verificar con Link Preview

Usar herramientas online:
- https://www.opengraph.xyz/
- https://metatags.io/
- https://developers.facebook.com/tools/debug/

## 📝 Cambiar el Logo en el Futuro

Cuando necesites cambiar el logo nuevamente:

1. **Reemplazar el archivo**:
   ```bash
   # Guardar nuevo logo como:
   public/smart-sales-bot-logo.png
   ```

2. **Actualizar la versión** en `src/app/layout.tsx`:
   ```typescript
   const LOGO_VERSION = '?v=20251121'; // Cambiar fecha
   ```

3. **Reiniciar servidor**:
   ```bash
   npm run dev
   ```

4. **Limpiar caché de WhatsApp**:
   - Usar herramienta de Facebook
   - O esperar 24-48 horas

## 🎯 Verificación Rápida

```bash
# Ver meta tags actuales
curl http://localhost:4000 | grep "og:image"
```

Deberías ver:
```html
<meta property="og:image" content="http://localhost:4000/smart-sales-bot-logo.png?v=20251120"/>
```

## 🚀 Para Producción (Easypanel)

Cuando despliegues en Easypanel:

1. El logo se actualizará automáticamente
2. Usar herramienta de Facebook con tu URL de producción:
   ```
   https://tu-dominio.easypanel.host
   ```
3. Click en "Scrape Again"
4. Compartir link en WhatsApp para verificar

## 💡 Tips

### Si el Logo No Se Actualiza

1. **Verificar que el archivo existe**:
   ```bash
   dir public\smart-sales-bot-logo.png
   ```

2. **Verificar tamaño de imagen**:
   - Mínimo: 200x200 px
   - Recomendado: 512x512 px o 1200x630 px
   - Formato: PNG o JPG

3. **Verificar meta tags**:
   - Abrir DevTools (F12)
   - Ver código fuente
   - Buscar `og:image`

4. **Limpiar caché del navegador**:
   ```
   Ctrl + Shift + Delete
   ```

### Formato Óptimo para WhatsApp

```
Tamaño: 512x512 px (cuadrado) o 1200x630 px (rectangular)
Formato: PNG con fondo transparente o sólido
Peso: Menos de 300 KB
Nombre: smart-sales-bot-logo.png
```

## 📊 Estado Actual

- ✅ Logo actualizado en `public/smart-sales-bot-logo.png`
- ✅ Meta tags actualizados con parámetro de versión
- ✅ Todos los meta tags (OG, Twitter, WhatsApp) apuntan al logo nuevo
- ⏳ Pendiente: Limpiar caché de WhatsApp con herramienta de Facebook

## 🔗 Herramientas Útiles

- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **OpenGraph Check**: https://www.opengraph.xyz/
- **Meta Tags Validator**: https://metatags.io/
- **WhatsApp Link Preview**: Enviar link a ti mismo en WhatsApp

---

**¡Logo actualizado! Usa la herramienta de Facebook para forzar actualización en WhatsApp. 🎨**
