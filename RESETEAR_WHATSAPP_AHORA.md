# 🔄 Resetear WhatsApp AHORA

## 🔴 Problema Actual

El bot tiene conflictos de sesión y no puede conectarse correctamente. Los logs muestran:
- `⚠️ Conflicto detectado: otra sesión está activa`
- `⚠️ No se puede procesar cola: bot no conectado`
- `Foreign key constraint violated` (usuario fantasma)

## ✅ Solución Inmediata

### Opción 1: Desde el Dashboard (MÁS RÁPIDO)

1. **Abre tu Dashboard** en Easypanel
2. **Ve a WhatsApp** (menú lateral)
3. **Clic en "Desconectar"**
4. **Espera 5 segundos**
5. **Clic en "Conectar"**
6. **Escanea el QR** con tu WhatsApp

### Opción 2: Desde la API

Ejecuta este comando en tu terminal local:

```bash
curl -X POST https://tu-dominio.com/api/whatsapp/reset \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN"
```

### Opción 3: Desde Easypanel Terminal

1. Ve a Easypanel → Tu servicio → Terminal
2. Ejecuta:

```bash
npx tsx scripts/reset-whatsapp-session.ts
```

## 🎯 Después del Reset

1. **Escanea el QR** inmediatamente
2. **Espera 10 segundos** para sincronización
3. **Envía un mensaje de prueba** al bot
4. **Verifica** que responda correctamente

## 📊 Verificar Estado

Después del reset, verifica en los logs que veas:

```
✅ Bot listo para enviar mensajes
✅ Conexión establecida
[Queue] ✅ No hay mensajes pendientes
```

## ⚠️ Si Sigue Fallando

Si después del reset sigue con problemas:

1. **Reinicia el contenedor** en Easypanel
2. **Espera 30 segundos**
3. **Vuelve a conectar** WhatsApp
4. **Escanea el QR** nuevamente

## 🔧 Limpiar Sesiones Fantasma

El error `cmhc22zw20000kmhgvx5ubazy` indica una sesión huérfana. Para limpiarla:

```sql
-- Conecta a la BD de PostgreSQL en Easypanel
DELETE FROM whatsapp_connections 
WHERE userId NOT IN (SELECT id FROM users);
```

O desde el Dashboard:
1. Ve a Base de Datos
2. Ejecuta la query de limpieza
3. Reinicia el bot

## 📝 Resumen

**Acción inmediata:**
1. Desconectar WhatsApp
2. Esperar 5 segundos
3. Conectar de nuevo
4. Escanear QR
5. Probar con un mensaje

**Tiempo estimado:** 2 minutos

¡El bot debería funcionar correctamente después de esto!
