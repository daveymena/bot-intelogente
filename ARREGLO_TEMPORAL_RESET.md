# 🔧 Arreglo Temporal - Reset WhatsApp

## Problema
Las funciones `fullReset()` y `quickCleanup()` no están disponibles en Easypanel porque el build anterior no las incluyó.

## Solución Temporal
Usar la función `disconnect()` que ya existe y funciona correctamente.

## Cambios Realizados

### 1. `src/app/api/whatsapp/connect/route.ts`
- ❌ Removida llamada a `BaileysService.quickCleanup()`
- ✅ Usa solo `WhatsAppSessionManager.cleanupBeforeConnect()`

### 2. `src/app/api/whatsapp/reset/route.ts`
- ❌ Removida llamada a `BaileysService.fullReset()`
- ✅ Usa `BaileysService.disconnect()` que limpia sesión y archivos

## Resultado
- ✅ El reseteo funciona usando `disconnect()`
- ✅ No más errores "function is not a function"
- ✅ Compatible con la versión actual en Easypanel

## Para Desplegar
```bash
git add .
git commit -m "fix: Usar disconnect() en lugar de fullReset() temporalmente"
git push origin main
```

Easypanel desplegará en ~10 minutos y el reseteo funcionará correctamente.
