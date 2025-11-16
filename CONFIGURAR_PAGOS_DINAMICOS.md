# 💳 Configurar Pagos Dinámicos

## 🎯 Objetivo
Configurar MercadoPago y PayPal para generar links de pago automáticos.

## 📋 Paso 1: MercadoPago

### 1.1 Crear cuenta
- Ir a https://www.mercadopago.com.co
- Registrarse o iniciar sesión

### 1.2 Obtener credenciales
1. Ir a https://www.mercadopago.com.co/developers
2. Clic en "Tus aplicaciones"
3. Crear nueva aplicación
4. Copiar:
   - `Access Token` (Producción)
   - `Public Key` (Producción)

### 1.3 Agregar a .env
```bash
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxx
MERCADO_PAGO_PUBLIC_KEY=APP_USR-xxxxxxxxx
```

## 📋 Paso 2: PayPal

### 2.1 Crear cuenta developer
- Ir a https://developer.paypal.com
- Registrarse con tu cuenta PayPal

### 2.2 Crear aplicación
1. Dashboard → My Apps & Credentials
2. Create App
3. Copiar:
   - `Client ID`
   - `Secret`

### 2.3 Agregar a .env
```bash
# Para pruebas (sandbox)
PAYPAL_CLIENT_ID=tu_client_id_sandbox
PAYPAL_CLIENT_SECRET=tu_secret_sandbox
PAYPAL_MODE=sandbox
PAYPAL_API_URL=https://api-m.sandbox.paypal.com

# Para producción
PAYPAL_CLIENT_ID=tu_client_id_live
PAYPAL_CLIENT_SECRET=tu_secret_live
PAYPAL_MODE=live
PAYPAL_API_URL=https://api-m.paypal.com
```

## 📋 Paso 3: Información de Negocio

Agregar a `.env`:
```bash
NEQUI_NUMBER=3136174267
DAVIPLATA_NUMBER=3136174267
BANK_NAME=Bancolombia
BANK_ACCOUNT_NUMBER=12345678901
BANK_ACCOUNT_HOLDER=Tecnovariedades D&S
BUSINESS_PHONE=+57 300 556 0186
BUSINESS_EMAIL=deinermena25@gmail.com
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

## ✅ Verificar Configuración

```bash
npx tsx scripts/test-payment-links-dinamicos.ts
```

Deberías ver:
```
✅ Links generados exitosamente:
📱 Nequi/Daviplata: 3136174267
💳 MercadoPago: https://mpago.la/xxx
🌎 PayPal: https://paypal.com/checkoutnow?token=xxx
```

¡Listo! 🎉
