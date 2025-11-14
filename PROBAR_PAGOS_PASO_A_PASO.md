# 🧪 PROBAR PAGOS PASO A PASO

## ⚠️ IMPORTANTE: NO SUBIR HASTA PROBAR

Antes de hacer `git push`, vamos a probar que los pagos funcionen REALMENTE.

## 📋 Checklist de Pruebas

### 1. Verificar Credenciales

Abre `.env` y verifica que tengas:

```env
# MercadoPago
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-8419296773492182-072623-ec7505166228860ec8b43957c948e7da-2021591453

# PayPal
PAYPAL_CLIENT_ID=BAAtdQwVN8LvIoRstmHZWlo2ndcJBP8dFZdXLc8HJGdYUXstriO6mO0GJMZimkBCdZHotBkulELqeFm_R4
PAYPAL_CLIENT_SECRET=EP5jZdzbUuHva4I8ERnbNYSHQ_BNe0niXQe91Bvf33Kl88nRKY-ivRx0_PGERS72JbjQSiMr63y9lEEL
PAYPAL_MODE=live

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=573005560186
```

### 2. Iniciar el Servidor

```bash
npm run dev
```

Espera a que diga: `✓ Ready in X ms`

### 3. Abrir la Consola del Navegador

1. Abre Chrome/Edge
2. Presiona `F12`
3. Ve a la pestaña "Console"
4. Ve a la pestaña "Network"

### 4. Probar con el Script

En otra terminal:

```bash
npx tsx scripts/test-payment-debug.ts
```

**Debes ver:**
```
✅ LINK GENERADO: https://www.mercadopago.com.co/checkout/...
✅ LINK GENERADO: https://www.paypal.com/checkoutnow?token=...
✅ LINK GENERADO: https://wa.me/573005560186?text=...
```

**Si ves `#` o errores:**
- Las credenciales están mal
- El servidor no está corriendo
- Hay un error en el código

### 5. Probar en el Navegador

1. Ve a: `http://localhost:3000/tienda`
2. Haz click en cualquier producto
3. **Abre la consola (F12)**
4. Debes ver logs como:

```
🔄 Generando links de pago para: AirPods Pro Cantidad: 1
📦 Producto: { id: '...', name: '...', price: 150000, quantity: 1 }
💳 Generando link MercadoPago...
✅ MercadoPago response: { paymentLink: 'https://...' }
💰 Generando link PayPal...
✅ PayPal response: { paymentLink: 'https://...' }
💬 Generando link WhatsApp...
✅ WhatsApp response: { paymentLink: 'https://...' }
🔗 Links generados: { mercadopago: 'https://...', paypal: 'https://...', whatsapp: 'https://...' }
```

### 6. Probar Cada Botón

#### MercadoPago:
1. Haz click en el botón "MercadoPago"
2. **Debe redirigir a:** `https://www.mercadopago.com.co/checkout/...`
3. **Debes ver:** Página de pago de MercadoPago con el producto y precio
4. **NO debe:** Refrescar la página o quedarse en `#`

#### PayPal:
1. Haz click en el botón "PayPal"
2. **Debe redirigir a:** `https://www.paypal.com/checkoutnow?token=...`
3. **Debes ver:** Página de pago de PayPal
4. **NO debe:** Pedir login si no tienes cuenta (puedes pagar como invitado)

#### WhatsApp:
1. Haz click en el botón "WhatsApp"
2. **Debe abrir:** WhatsApp Web o la app
3. **Debe tener:** Mensaje pre-escrito con el producto y precio
4. **Número:** 300 556 0186

### 7. Verificar en la Consola del Servidor

En la terminal donde corre `npm run dev`, debes ver:

```
Creating payment link: { method: 'mercadopago', productName: 'AirPods Pro', price: 150000, quantity: 1 }
MercadoPago response: { init_point: 'https://www.mercadopago.com.co/checkout/...' }
Payment link created: https://www.mercadopago.com.co/checkout/...
```

## 🐛 Problemas Comunes

### Problema 1: "Link es #"

**Causa:** Las credenciales no están configuradas o son inválidas

**Solución:**
1. Verifica `.env`
2. Asegúrate de que no haya espacios extra
3. Reinicia el servidor: `Ctrl+C` y `npm run dev`

### Problema 2: "Refresca la página"

**Causa:** El link no se generó correctamente

**Solución:**
1. Abre la consola del navegador (F12)
2. Ve a "Network"
3. Busca la petición a `/api/payments/create-link`
4. Ve la respuesta - debe tener `paymentLink: "https://..."`
5. Si dice `paymentLink: "#"`, ve los logs del servidor

### Problema 3: "PayPal pide login"

**Causa:** Es normal si no tienes cuenta PayPal

**Solución:**
- Puedes crear una cuenta de prueba
- O pagar como invitado con tarjeta
- Verifica que el link empiece con `https://www.paypal.com/checkoutnow`

### Problema 4: "Error 401 Unauthorized"

**Causa:** Token de MercadoPago o PayPal inválido

**Solución:**
1. Ve a tu cuenta de MercadoPago/PayPal
2. Genera nuevas credenciales
3. Actualiza `.env`
4. Reinicia el servidor

## ✅ Checklist Final

Antes de subir a GitHub, verifica:

- [ ] El script `test-payment-debug.ts` genera links reales
- [ ] Los 3 botones redirigen correctamente
- [ ] MercadoPago muestra el producto y precio correcto
- [ ] PayPal muestra el monto en USD correcto
- [ ] WhatsApp abre con el mensaje correcto
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en la consola del servidor
- [ ] Los logs muestran los links generados

## 🚀 Cuando Todo Funcione

Solo cuando TODOS los checks estén ✅:

```bash
git add -A
git commit -m "Fix pagos - links reales funcionando"
git push origin main
```

## 📞 Si Nada Funciona

1. Copia los logs de la consola del servidor
2. Copia los logs de la consola del navegador
3. Copia el contenido de `.env` (SIN las credenciales completas)
4. Comparte los errores

---

**NO SUBIR HASTA QUE TODO FUNCIONE** ⚠️

