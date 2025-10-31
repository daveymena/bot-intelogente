# 🔧 Solución - Error bufferUtil.mask

## ❌ Problema

Al intentar conectar WhatsApp con Baileys, aparece el error:

```
TypeError: bufferUtil.mask is not a function
```

## ✅ Solución Aplicada

### 1. Instalación de Dependencias Nativas

Se instalaron los módulos nativos necesarios para `ws`:

```bash
npm install bufferutil utf-8-validate
```

### 2. Configuración de Webpack

Se actualizó `next.config.ts` para manejar correctamente los módulos nativos:

```typescript
webpack: (config, { dev, isServer }) => {
  // ... código existente ...

  // Configuración para Baileys y módulos nativos
  if (isServer) {
    config.externals = config.externals || [];
    config.externals.push({
      'bufferutil': 'commonjs bufferutil',
      'utf-8-validate': 'commonjs utf-8-validate',
    });
  }

  // Resolver módulos nativos
  config.resolve = config.resolve || {};
  config.resolve.fallback = {
    ...config.resolve.fallback,
    'bufferutil': false,
    'utf-8-validate': false,
  };

  return config;
}
```

### 3. Eliminación de Opción Deprecated

Se eliminó `printQRInTerminal: true` de la configuración de Baileys y se implementó manualmente:

```typescript
// Antes
const socket = makeWASocket({
  auth: state,
  printQRInTerminal: true, // ❌ Deprecated
  browser: ['WhatsApp Bot', 'Chrome', '1.0.0']
})

// Ahora
const socket = makeWASocket({
  auth: state,
  browser: ['WhatsApp Bot', 'Chrome', '1.0.0']
})

// Y se imprime manualmente cuando se genera
if (qr) {
  const qrTerminal = await QRCode.toString(qr, { type: 'terminal', small: true })
  console.log(qrTerminal)
}
```

## 🚀 Cómo Aplicar la Solución

### Paso 1: Detener el Servidor

Si el servidor está corriendo, detenlo con `Ctrl+C`.

### Paso 2: Limpiar y Reinstalar

```bash
# Limpiar caché de Next.js
rm -rf .next

# En Windows
rmdir /s /q .next
```

### Paso 3: Reiniciar el Servidor

```bash
npm run dev
```

O usar el script:
```bash
iniciar-whatsapp-real.bat
```

## ✅ Verificación

Después de aplicar la solución, deberías ver:

1. **En la terminal:**
   ```
   [Baileys] ✅ QR generado para usuario: xxx
   
   📱 ESCANEA ESTE QR CON WHATSAPP:
   
   [QR en formato ASCII]
   
   [Baileys] ✅ QR guardado en sesión y DB
   ```

2. **En el dashboard:**
   - El QR aparece en la interfaz web
   - Puedes escanearlo con tu teléfono
   - El estado cambia a "CONNECTED" al escanear

## 🐛 Si el Problema Persiste

### Opción 1: Reinstalar Dependencias

```bash
# Eliminar node_modules
rm -rf node_modules

# En Windows
rmdir /s /q node_modules

# Reinstalar
npm install
```

### Opción 2: Verificar Versiones

Asegúrate de tener las versiones correctas:

```json
{
  "@whiskeysockets/baileys": "^6.x.x",
  "bufferutil": "^4.x.x",
  "utf-8-validate": "^6.x.x"
}
```

### Opción 3: Usar el Script de Prueba

Prueba primero con el script independiente:

```bash
node test-baileys.js
```

Si funciona aquí pero no en Next.js, el problema es de configuración de webpack.

## 📝 Notas Técnicas

### ¿Por qué ocurre este error?

- Baileys usa `ws` (WebSocket) que tiene dependencias nativas opcionales
- Next.js con webpack no maneja bien estos módulos nativos por defecto
- `bufferutil` y `utf-8-validate` son optimizaciones de rendimiento para `ws`

### ¿Es necesario instalar estos módulos?

- **Sí**, para producción y mejor rendimiento
- Sin ellos, `ws` usa implementaciones JavaScript más lentas
- Baileys puede funcionar sin ellos, pero con el error

### ¿Qué hace la configuración de webpack?

1. **externals**: Le dice a webpack que no empaquete estos módulos
2. **fallback**: Indica que estos módulos no están disponibles en el cliente
3. **isServer**: Solo aplica la configuración en el servidor

## 🎯 Resultado Esperado

Después de aplicar la solución:

- ✅ No más errores de `bufferUtil.mask`
- ✅ QR se genera correctamente
- ✅ QR aparece en la terminal
- ✅ QR aparece en el dashboard
- ✅ Conexión a WhatsApp funciona

## 📚 Referencias

- [Baileys GitHub](https://github.com/WhiskeySockets/Baileys)
- [ws npm package](https://www.npmjs.com/package/ws)
- [Next.js Webpack Config](https://nextjs.org/docs/api-reference/next.config.js/custom-webpack-config)

---

**Fecha:** 29 de Octubre, 2025  
**Estado:** ✅ Solucionado
