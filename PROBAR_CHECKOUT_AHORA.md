# 🛒 Probar Sistema de Checkout - AHORA

## ✅ Cambios Aplicados

### 1. **Logging Mejorado**
- ✅ Agregado logging detallado en el endpoint `/api/payments/create`
- ✅ Agregado logging en el cliente (checkout page)
- ✅ Ahora puedes ver exactamente qué datos se envían y reciben
- ✅ Logging del estado del método de pago

### 2. **Manejo de Errores Mejorado**
- ✅ Validación de respuesta HTTP antes de procesar
- ✅ Mensajes de error más descriptivos
- ✅ Logging de errores en consola

### 3. **Fix del Método de Pago Undefined**
- ✅ Valor por defecto 'mercadopago' si el estado es undefined
- ✅ Indicador visual del método seleccionado
- ✅ Logging cuando cambia el método de pago

## 🧪 Cómo Probar

### Paso 1: Reiniciar el Servidor
```bash
# Detener el servidor actual (Ctrl+C)
# Luego iniciar de nuevo:
npm run dev
```

### Paso 2: Abrir la Consola del Navegador
1. Abre Chrome DevTools (F12)
2. Ve a la pestaña "Console"
3. Limpia la consola (botón 🚫)

### Paso 3: Hacer una Compra de Prueba
1. Ve a http://localhost:3000/tienda
2. Agrega productos al carrito
3. Ve al checkout
4. Llena el formulario
5. Selecciona un método de pago
6. Haz clic en "Proceder al Pago"

### Paso 4: Revisar los Logs

#### En la Consola del Navegador verás:
```
📤 Enviando datos: { items: [...], paymentMethod: "..." }
📥 Respuesta status: 200
📥 Respuesta data: { ... }
✅ Redirigiendo a MercadoPago: https://...
```

#### En la Terminal del Servidor verás:
```
📦 Datos recibidos: {
  "items": [...],
  "paymentMethod": "mercadopago",
  "metadata": {...}
}
```

## 🔍 Qué Buscar

### Si Todo Funciona Bien:
- ✅ Status 200 en la respuesta
- ✅ `init_point` o `approvalUrl` en la respuesta
- ✅ Redirección automática a la pasarela de pago

### Si Hay Errores:
- ❌ Status 400 o 500
- ❌ Mensaje de error en `data.error`
- ❌ Ver el log detallado en la terminal

## 🐛 Errores Comunes y Soluciones

### Error: "Items requeridos"
**Causa:** El carrito está vacío o los items no se formatearon correctamente
**Solución:** 
1. Verifica que el carrito tenga productos
2. Revisa el log "📤 Enviando datos" en la consola

### Error: "Método de pago no válido"
**Causa:** El método de pago no es reconocido
**Solución:**
1. Verifica que el método sea uno de: mercadopago, paypal, nequi, daviplata, bank, cash
2. Revisa el log "📦 Datos recibidos" en la terminal

### Error: "Error de Mercado Pago" o "Error de PayPal"
**Causa:** Problema con las credenciales o la API
**Solución:**
1. Verifica que las variables de entorno estén configuradas:
   - `MERCADO_PAGO_ACCESS_TOKEN`
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
2. Verifica que las credenciales sean válidas

## 📝 Información de Debug

### Formato de Items Esperado:
```json
{
  "items": [
    {
      "title": "Nombre del Producto",
      "description": "Descripción",
      "quantity": 1,
      "unit_price": 50000,
      "currency_id": "COP"
    }
  ],
  "paymentMethod": "mercadopago",
  "metadata": {
    "customerInfo": {
      "name": "...",
      "email": "...",
      "phone": "...",
      "address": "...",
      "city": "..."
    }
  }
}
```

## 🎯 Próximos Pasos

Una vez que funcione correctamente:
1. ✅ Probar con diferentes métodos de pago
2. ✅ Probar con múltiples productos
3. ✅ Verificar que la redirección funcione
4. ✅ Probar el flujo completo de pago

## 📞 Si Necesitas Ayuda

Copia y pega:
1. Los logs de la consola del navegador
2. Los logs de la terminal del servidor
3. El método de pago que estás usando
4. Los productos en el carrito

---

**Fecha:** $(date)
**Estado:** Listo para probar
