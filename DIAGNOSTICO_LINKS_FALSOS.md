# 🔍 Diagnóstico: Links de Pago Falsos

## 🎯 Problema Reportado

El bot está enviando links de pago FALSOS:

```
https://www.mercadopago.com/mla/payments/00000  ❌ FALSO
https://www.paypal.com/cgi-bin/webscr?...       ❌ FALSO
```

## 🔍 Posibles Causas

### 1. Variables de Entorno NO Configuradas

Si `MERCADOPAGO_ACCESS_TOKEN` no está configurado:
- ❌ No se puede generar link real de MercadoPago
- ❌ El sistema devuelve `undefined`
- ❌ Se muestra un placeholder o link falso

Si `PAYPAL_CLIENT_ID` o `PAYPAL_CLIENT_SECRET` no están configurados:
- ❌ No se puede generar link real de PayPal
- ❌ El sistema devuelve `undefined`
- ❌ Se muestra un placeholder o link falso

### 2. Error en la API de MercadoPago/PayPal

Si las credenciales son incorrectas:
- ❌ La API rechaza la solicitud
- ❌ No se genera el link
- ❌ Se muestra un fallback

### 3. Producto No Encontrado

Si el producto no existe en la BD:
- ❌ No se puede generar el link
- ❌ Se retorna error

## 🔧 Cómo Diagnosticar

### Paso 1: Ejecutar Script de Prueba

```bash
PROBAR_GENERACION_LINKS.bat
```

O directamente:
```bash
npx tsx scripts/test-generacion-links-pago.ts
```

Este script te mostrará:
- ✅ Si las variables de entorno están configuradas
- ✅ Si los links se generan correctamente
- ✅ Si los links son reales o placeholders

### Paso 2: Verificar Variables de Entorno

Abre tu archivo `.env` y verifica:

```env
# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX

# PayPal
PAYPAL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PAYPAL_CLIENT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**IMPORTANTE:**
- Los valores deben ser REALES de tus cuentas
- NO deben tener espacios al inicio o final
- NO deben tener comillas

### Paso 3: Verificar Logs del Servidor

Cuando el bot genera links, deberías ver:

```
[Baileys] 🔄 Generando links para producto ID: xxx, Usuario: xxx
[BotPaymentLinkGenerator] ✅ Link MercadoPago generado
[BotPaymentLinkGenerator] ✅ Link PayPal generado
[Baileys] 📊 Resultado de generación: {
  success: true,
  hasMercadoPago: true,
  hasPayPal: true
}
```

Si ves:
```
[BotPaymentLinkGenerator] MercadoPago no configurado
[BotPaymentLinkGenerator] PayPal no configurado
```

Entonces las variables de entorno NO están configuradas.

## ✅ Solución

### Opción 1: Configurar MercadoPago

1. **Obtener Access Token:**
   - Ve a https://www.mercadopago.com.co/developers
   - Crea una aplicación
   - Copia el `Access Token` de producción

2. **Agregar al `.env`:**
   ```env
   MERCADOPAGO_ACCESS_TOKEN=APP_USR-tu-token-aqui
   ```

3. **Reiniciar el servidor:**
   ```bash
   npm run dev
   ```

### Opción 2: Configurar PayPal

1. **Obtener Credenciales:**
   - Ve a https://developer.paypal.com
   - Crea una aplicación
   - Copia `Client ID` y `Secret`

2. **Agregar al `.env`:**
   ```env
   PAYPAL_CLIENT_ID=tu-client-id-aqui
   PAYPAL_CLIENT_SECRET=tu-secret-aqui
   ```

3. **Reiniciar el servidor:**
   ```bash
   npm run dev
   ```

### Opción 3: Usar Solo Nequi/Daviplata

Si NO quieres configurar MercadoPago/PayPal, el bot puede funcionar solo con:
- 📱 Nequi
- 📱 Daviplata
- 🏦 Transferencia bancaria
- 💵 Efectivo

En este caso, el mensaje mostrará solo estos métodos.

## 🧪 Probar la Solución

### 1. Ejecutar el Script de Prueba

```bash
PROBAR_GENERACION_LINKS.bat
```

Deberías ver:
```
✅ MERCADOPAGO_ACCESS_TOKEN: Configurado
✅ PAYPAL_CLIENT_ID: Configurado
✅ PAYPAL_CLIENT_SECRET: Configurado

💳 MercadoPago:
   https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=XXXXX

💙 PayPal:
   https://www.paypal.com/checkoutnow?token=XXXXX

✅ Link de MercadoPago parece ser real
✅ Link de PayPal parece ser real
```

### 2. Probar en WhatsApp

```
Tú: "Curso de piano"
Bot: [Envía información]

Tú: "Quiero pagar"
Bot: [Envía links REALES de pago] ✅
```

## 📊 Checklist de Verificación

- [ ] Variables de entorno configuradas en `.env`
- [ ] Servidor reiniciado después de agregar variables
- [ ] Script de prueba ejecutado exitosamente
- [ ] Links generados son reales (no placeholders)
- [ ] Probado en WhatsApp con cliente real

## 🔍 Si Sigue Sin Funcionar

### Verificar Logs Detallados

Busca en los logs del servidor:

```
[BotPaymentLinkGenerator] Error MercadoPago: [mensaje de error]
[BotPaymentLinkGenerator] Error PayPal: [mensaje de error]
```

Estos mensajes te dirán exactamente qué está fallando.

### Errores Comunes

1. **"Invalid credentials"**
   - Las credenciales son incorrectas
   - Verifica que copiaste bien el token

2. **"Unauthorized"**
   - El token no tiene permisos
   - Usa el token de PRODUCCIÓN, no de pruebas

3. **"Product not found"**
   - El producto no existe en la BD
   - Verifica que el ID del producto sea correcto

## 📝 Archivos Creados

1. ✅ `scripts/test-generacion-links-pago.ts` - Script de prueba
2. ✅ `PROBAR_GENERACION_LINKS.bat` - Ejecutar prueba fácilmente
3. ✅ Logs mejorados en `baileys-stable-service.ts`

## 🎯 Resultado Esperado

**Mensaje con links REALES:**

```
🟢 ¡Perfecto! Aquí están tus opciones de pago

📦 *Producto:* Curso Completo de Piano Online
💰 *Total a Pagar:* 60,000 COP

━━━━━━━━━━━━━━━━━━━━━━
*MÉTODOS DE PAGO DISPONIBLES:*
━━━━━━━━━━━━━━━━━━━━━━

💳 *1. Mercado Pago*
   💰 Precio: 60,000 COP
   ✅ Tarjetas, PSE, Efectivo
   🔒 Pago 100% seguro
   👉 Link: https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=XXXXX

💙 *2. PayPal*
   💰 Precio: 60,000 COP
   💵 Aprox: 15.00 USD
   ✅ Tarjetas internacionales
   🔒 Protección al comprador
   👉 Link: https://www.paypal.com/checkoutnow?token=XXXXX

📱 *3. Nequi*
   💰 Precio: 60,000 COP
   📞 Número: 304 274 8687
   📸 Envía captura del pago

📱 *4. Daviplata*
   💰 Precio: 60,000 COP
   📞 Número: 304 274 8687
   📸 Envía captura del pago

━━━━━━━━━━━━━━━━━━━━━━
✅ *Todos los métodos son seguros*
📦 *Entrega inmediata* después del pago
🔒 *Compra protegida*

¿Con cuál método prefieres pagar? 😊
```

---

**Fecha:** 2024-11-10
**Estado:** 🔍 DIAGNÓSTICO COMPLETO
**Próximo Paso:** Ejecutar script de prueba y configurar variables
