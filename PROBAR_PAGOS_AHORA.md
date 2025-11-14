# 🧪 PROBAR PAGOS REALES

## ✅ Cambios Aplicados

Moví toda la lógica de generación de links de pago al **servidor** (API route) para que tenga acceso a las variables de entorno.

### 📝 Archivo Actualizado

**`src/app/api/payments/create-link/route.ts`**
- ✅ Genera links de MercadoPago usando la API real
- ✅ Genera links de PayPal usando la API real
- ✅ Genera links de WhatsApp con el número real
- ✅ Logs detallados para debugging
- ✅ Manejo de errores mejorado

## 🚀 Cómo Probar

### 1. Inicia el servidor

```bash
npm run dev
```

### 2. Abre la tienda

```
http://localhost:3000/tienda
```

### 3. Entra a un producto

```
http://localhost:3000/tienda/[id]
```

### 4. Haz click en los botones de pago

**MercadoPago:**
- Debe redirigir a: `https://www.mercadopago.com.co/checkout/...`
- Verás el producto con el precio real
- Podrás pagar con tarjeta, PSE, etc.

**PayPal:**
- Debe redirigir a: `https://www.paypal.com/checkoutnow?token=...`
- Verás el producto con el precio en USD
- Podrás pagar con PayPal o tarjeta

**WhatsApp:**
- Debe abrir: `https://wa.me/573005560186?text=...`
- Abrirá WhatsApp con el mensaje pre-formateado
- Incluye nombre del producto, precio y cantidad

## 🔍 Debugging

### Ver logs en la consola del servidor

Cuando hagas click en un botón de pago, verás en la terminal:

```
Creating payment link: { method: 'mercadopago', productName: 'AirPods Pro', price: 150000, quantity: 1 }
MercadoPago response: { init_point: 'https://...' }
Payment link created: https://www.mercadopago.com.co/checkout/...
```

### Si algo falla

1. **Verifica las credenciales en `.env`:**
   ```env
   MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
   PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...
   ```

2. **Verifica que el servidor esté corriendo:**
   ```bash
   npm run dev
   ```

3. **Abre la consola del navegador (F12):**
   - Ve a la pestaña "Network"
   - Busca la petición a `/api/payments/create-link`
   - Ve la respuesta

## 🧪 Script de Prueba

También puedes probar con el script:

```bash
# Asegúrate de que el servidor esté corriendo
npm run dev

# En otra terminal:
npx tsx scripts/test-payment-links-real.ts
```

Esto probará los 3 métodos de pago y mostrará los links generados.

## ✅ Qué Esperar

### MercadoPago
```
https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=471208-abc123...
```

### PayPal
```
https://www.paypal.com/checkoutnow?token=EC-12345ABCDE...
```

### WhatsApp
```
https://wa.me/573005560186?text=Hola%20Tecnovariedades%20D%26S!...
```

## 🐛 Problemas Comunes

### 1. "Link es #"
- Las credenciales no están configuradas
- Verifica `.env`

### 2. "Error 401 Unauthorized"
- Token de MercadoPago o PayPal inválido
- Genera nuevas credenciales

### 3. "Redirige a la misma página"
- El link no se generó correctamente
- Ve los logs del servidor

### 4. "PayPal pide login"
- Es normal si no tienes cuenta PayPal
- Puedes crear una cuenta o usar tarjeta como invitado

## 📊 Commit

```bash
Commit: 013d958
Mensaje: "Arreglar generacion de links de pago - mover logica al servidor"
Estado: ✅ Subido a GitHub
```

## 🎯 Próximos Pasos

1. ✅ Probar cada método de pago
2. ✅ Verificar que los precios sean correctos
3. ✅ Hacer una compra de prueba
4. ✅ Configurar webhooks para confirmar pagos
5. ✅ Deploy a producción

---

**Estado:** ✅ LISTO PARA PROBAR
**Fecha:** 2024-11-01

