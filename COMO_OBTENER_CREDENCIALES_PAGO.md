# 🔑 CÓMO OBTENER CREDENCIALES DE PAGO

## 📋 RESUMEN

Para generar links de pago automáticamente necesitas configurar las credenciales reales de Mercado Pago y PayPal en el archivo `.env`.

---

## 💳 MERCADO PAGO

### 1. Crear cuenta en Mercado Pago
- Ve a: https://www.mercadopago.com.co/
- Crea una cuenta o inicia sesión

### 2. Obtener credenciales
1. Ve a: https://www.mercadopago.com.co/developers/panel
2. Crea una aplicación nueva
3. Ve a "Credenciales"
4. Copia:
   - **Public Key**: `APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Access Token**: `APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### 3. Configurar en .env
```env
MERCADO_PAGO_PUBLIC_KEY=APP_USR-tu-public-key-aqui
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-tu-access-token-aqui
```

### 4. Tipos de links que puedes crear:
- **Preference**: Link de pago con carrito
- **Payment Link**: Link directo de pago
- **Button**: Botón de pago

---

## 💰 PAYPAL

### 1. Crear cuenta PayPal Business
- Ve a: https://www.paypal.com/co/business
- Crea una cuenta Business o convierte tu cuenta personal

### 2. Obtener credenciales
1. Ve a: https://developer.paypal.com/dashboard/
2. Crea una aplicación en "My Apps & Credentials"
3. Copia:
   - **Client ID**: `AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxA`
   - **Secret**: `ExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxE`

### 3. Configurar en .env
```env
PAYPAL_CLIENT_ID=tu-client-id-aqui
PAYPAL_CLIENT_SECRET=tu-secret-aqui
```

### 4. Tipos de links que puedes crear:
- **Invoice**: Factura con link de pago
- **Payment Button**: Botón de pago
- **Subscription**: Suscripción recurrente

---

## 🚀 OPCIÓN RÁPIDA: USAR LINKS MANUALES

Si no quieres usar la API, puedes crear links manualmente:

### Mercado Pago (Método Manual):
1. Ve a: https://www.mercadopago.com.co/tools/create
2. Crea un link de pago para $20.000 COP
3. Copia el link (ejemplo: `https://mpago.li/2Ld7Yx8`)
4. Usa ese mismo link para todos los megapacks de $20.000

### PayPal (Método Manual):
1. Ve a: https://www.paypal.com/invoice/create
2. Crea una factura para $20.000 COP (o equivalente en USD)
3. Copia el link de la factura
4. Usa ese mismo link para todos los megapacks de $20.000

---

## ✅ RECOMENDACIÓN ACTUAL

**Para simplificar, te recomiendo usar solo Nequi y Payco que ya funcionan:**

```
Métodos de pago para megapacks ($20.000):
✅ Nequi/Daviplata: 313 617 4267
✅ Payco (tarjeta): https://payco.link/3798e2c6-3888-4cdf-bfd5-5d1761f5a4cf
✅ Transferencia bancaria: Disponible
```

**Ventajas:**
- Ya están configurados y funcionan
- No necesitas credenciales de API
- Los clientes pueden pagar inmediatamente
- Cubre la mayoría de métodos de pago en Colombia

**Si quieres agregar Mercado Pago y PayPal:**
1. Crea los links manualmente (más rápido)
2. O configura las credenciales de API (más automatizado)

---

## 📝 SIGUIENTE PASO

¿Qué prefieres?

**OPCIÓN A: Usar solo Nequi + Payco** (ya funciona)
```bash
# No hacer nada, ya está configurado
```

**OPCIÓN B: Agregar links manuales de Mercado Pago y PayPal**
```bash
# 1. Crea los links manualmente en las plataformas
# 2. Edita el script con tus links reales
# 3. Ejecuta: npx tsx scripts/agregar-links-megapacks-simple.ts
```

**OPCIÓN C: Configurar API para generar links automáticamente**
```bash
# 1. Obtén las credenciales de las APIs
# 2. Configura el .env con las credenciales reales
# 3. Ejecuta: npx tsx scripts/generar-links-con-api.ts
```
