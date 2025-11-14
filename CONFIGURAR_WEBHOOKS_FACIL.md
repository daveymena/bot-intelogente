# 🔔 Configurar Webhooks de Pagos - Guía Visual

## ¿Qué son los Webhooks?

Los webhooks son notificaciones automáticas que MercadoPago y PayPal envían a tu servidor cuando un pago es completado. Esto permite activar automáticamente las membresías sin intervención manual.

## 📍 URL del Webhook

Después del deploy en Easypanel, tu URL será:

```
https://bot-whatsapp-what-auto.sqaoeo.easypanel.host/api/payments/webhook
```

O si configuras dominio propio:
```
https://tudominio.com/api/payments/webhook
```

---

## 💳 Configurar MercadoPago

### Paso 1: Ir a Configuración de Webhooks

1. Ingresa a tu cuenta de MercadoPago
2. Ve a **"Tu negocio" → "Configuración" → "Webhooks"**
3. O accede directo: https://www.mercadopago.com.co/developers/panel/webhooks

### Paso 2: Crear Nuevo Webhook

1. Haz clic en **"Crear webhook"** o **"Agregar URL"**
2. En **"URL de producción"**, pega:
   ```
   https://bot-whatsapp-what-auto.sqaoeo.easypanel.host/api/payments/webhook
   ```
3. En **"Eventos"**, selecciona:
   - ✅ `payment` (Pagos)
   - ✅ `payment.updated` (Actualización de pagos)

### Paso 3: Guardar

1. Haz clic en **"Guardar"** o **"Crear"**
2. MercadoPago enviará una notificación de prueba
3. Si ves ✅ verde, ¡está funcionando!

---

## 💰 Configurar PayPal

### Paso 1: Ir a Webhooks

1. Ingresa a tu cuenta de PayPal Developer
2. Ve a: https://developer.paypal.com/dashboard/
3. Selecciona tu aplicación
4. Ve a la pestaña **"Webhooks"**

### Paso 2: Agregar Webhook

1. Haz clic en **"Add Webhook"**
2. En **"Webhook URL"**, pega:
   ```
   https://bot-whatsapp-what-auto.sqaoeo.easypanel.host/api/payments/webhook
   ```

### Paso 3: Seleccionar Eventos

Marca estos eventos:

- ✅ `PAYMENT.CAPTURE.COMPLETED` (Pago capturado)
- ✅ `CHECKOUT.ORDER.APPROVED` (Orden aprobada)
- ✅ `PAYMENT.SALE.COMPLETED` (Venta completada)

### Paso 4: Guardar

1. Haz clic en **"Save"**
2. PayPal mostrará tu webhook activo
3. Puedes hacer clic en **"Test"** para verificar

---

## ✅ Verificar que Funciona

### Opción 1: Verificar en el navegador

Abre en tu navegador:
```
https://bot-whatsapp-what-auto.sqaoeo.easypanel.host/api/payments/webhook
```

Deberías ver:
```json
{
  "status": "ok",
  "message": "Webhook endpoint activo",
  "providers": ["MercadoPago", "PayPal"]
}
```

### Opción 2: Hacer un pago de prueba

1. Ve a tu página de membresías
2. Selecciona un plan
3. Completa el pago con MercadoPago o PayPal
4. Verifica que:
   - ✅ El pago se marca como completado
   - ✅ La membresía se activa automáticamente
   - ✅ Recibes un email de confirmación

---

## 🔍 Monitorear Webhooks

### En MercadoPago

1. Ve a **"Webhooks"** en tu panel
2. Verás un historial de notificaciones enviadas
3. Puedes ver el estado (exitoso/fallido) de cada una

### En PayPal

1. Ve a tu webhook en el Developer Dashboard
2. Haz clic en **"Show"** para ver detalles
3. Puedes ver el historial de eventos enviados

---

## 🐛 Solución de Problemas

### El webhook no recibe notificaciones

1. **Verifica la URL**: Debe ser HTTPS (no HTTP)
2. **Verifica que el servidor esté corriendo**: Abre la URL en el navegador
3. **Revisa los logs**: En Easypanel, ve a los logs de tu aplicación

### Los pagos no se activan automáticamente

1. **Verifica que el webhook esté configurado** en MercadoPago/PayPal
2. **Revisa los logs** de tu aplicación para ver si llegan las notificaciones
3. **Verifica las credenciales** de MercadoPago/PayPal en las variables de entorno

### El email no llega

1. **Verifica RESEND_API_KEY** en las variables de entorno
2. **Verifica RESEND_FROM_EMAIL** (debe estar verificado en Resend)
3. **Revisa la carpeta de spam** del email

---

## 📝 Resumen

✅ **MercadoPago**: Configurar webhook con eventos `payment` y `payment.updated`  
✅ **PayPal**: Configurar webhook con eventos de pago completado  
✅ **Verificar**: Abrir la URL del webhook en el navegador  
✅ **Probar**: Hacer un pago de prueba y verificar que se active la membresía  

---

## 🎯 Próximos Pasos

Después de configurar los webhooks:

1. ✅ Hacer un pago de prueba
2. ✅ Verificar que la membresía se active
3. ✅ Verificar que llegue el email de confirmación
4. ✅ ¡Listo para producción!

---

**Tiempo estimado**: 5-10 minutos por proveedor  
**Dificultad**: Fácil 🟢
