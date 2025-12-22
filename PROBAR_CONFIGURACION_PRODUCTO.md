# 🧪 Cómo Probar la Configuración Personalizada en Productos

## Opción 1: Prueba Visual (Recomendada)

### Paso 1: Iniciar el servidor
```bash
npm run dev
```

Espera a que veas:
```
✓ Ready in X.Xs
○ Local: http://localhost:3000
```

### Paso 2: Configurar tu tienda
1. Abre: http://localhost:3000/dashboard/configuracion
2. Ve a la pestaña **"Configuración de Tienda"**
3. Configura:
   - Nombre de tu tienda
   - Slogan
   - Colores (primario, secundario, acento)
   - Logo (opcional)
4. Haz clic en **"Guardar Configuración"**
5. Espera el mensaje: ✅ Configuración guardada

### Paso 3: Ver tu tienda
1. Abre: http://localhost:3000/tienda
2. Haz clic en cualquier producto
3. **Verifica que veas:**
   - ✅ Tu logo en el header (si lo configuraste)
   - ✅ Tus colores personalizados en header y footer
   - ✅ Tu nombre de tienda en el footer
   - ✅ Tu slogan en el footer (si lo configuraste)

### Paso 4: Verificar que NO veas
- ❌ "Smart Sales Bot" en el footer
- ❌ Colores gris/negro por defecto
- ❌ Logo genérico "SSB"

---

## Opción 2: Prueba con Script

### Paso 1: Iniciar el servidor
```bash
npm run dev
```

### Paso 2: En otra terminal, ejecutar el test
```bash
node test-configuracion-producto.js
```

El script te mostrará:
- El producto de prueba
- La configuración cargada
- La URL para abrir en el navegador

---

## Opción 3: Prueba Manual Rápida

### Sin configurar nada, solo verificar el cambio:

1. Inicia el servidor: `npm run dev`
2. Abre: http://localhost:3000/tienda
3. Haz clic en cualquier producto
4. Abre la consola del navegador (F12)
5. Busca el log: `🎨 Configuración de tienda cargada en producto:`
6. Verifica que muestre el `userId` correcto del producto

---

## Solución de Problemas

### ❌ Aún veo "Smart Sales Bot"

**Causa:** No has guardado tu configuración personalizada

**Solución:**
1. Ve a: http://localhost:3000/dashboard/configuracion
2. Pestaña "Configuración de Tienda"
3. Cambia al menos el nombre de la tienda
4. Guarda
5. Refresca la página del producto con `Ctrl + F5`

### ❌ Los colores no cambian

**Causa:** Caché del navegador

**Solución:**
1. Presiona `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac)
2. O abre en modo incógnito
3. O limpia el caché del navegador

### ❌ Error "fetch failed" en el script

**Causa:** El servidor no está corriendo

**Solución:**
1. Abre otra terminal
2. Ejecuta: `npm run dev`
3. Espera a que inicie
4. Vuelve a ejecutar el script

### ❌ El logo no aparece

**Causa:** La URL del logo no es válida o no está configurada

**Solución:**
1. Verifica que la URL del logo sea accesible
2. Usa una URL completa (https://...)
3. O sube el logo a `/public/` y usa `/logo.png`

---

## Verificación Técnica

### Revisar en la consola del navegador:

1. Abre la página del producto
2. Presiona F12
3. Ve a la pestaña "Console"
4. Busca estos logs:

```
🎨 Configuración de tienda cargada en producto: {settings: {...}}
```

Deberías ver tu configuración con:
- `storeName`: Tu nombre
- `primaryColor`: Tu color
- `secondaryColor`: Tu color
- etc.

### Revisar en Network:

1. F12 → Pestaña "Network"
2. Refresca la página
3. Busca la petición: `store-settings/public?userId=...`
4. Verifica que el `userId` sea el correcto (no "default")
5. Verifica que la respuesta tenga tu configuración

---

## Comandos Rápidos

```bash
# Iniciar servidor
npm run dev

# En otra terminal: Probar script
node test-configuracion-producto.js

# Abrir dashboard
start http://localhost:3000/dashboard/configuracion

# Abrir tienda
start http://localhost:3000/tienda
```

---

## ¿Qué Cambió?

### Antes ❌
- La página de producto siempre cargaba `userId=default`
- Mostraba "Smart Sales Bot" para todos los productos
- Colores genéricos gris/negro

### Ahora ✅
- La página obtiene el `userId` del producto
- Carga la configuración del propietario del producto
- Muestra nombre, colores y logo personalizados
- Soporte multi-tenant (cada usuario su tienda)

---

## Archivos Modificados

- `src/app/tienda/producto/[id]/page.tsx` - Carga dinámica de configuración
- `test-configuracion-producto.js` - Script de prueba
- `ARREGLO_CONFIGURACION_PRODUCTO.md` - Documentación técnica
