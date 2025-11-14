# 🚀 CÓMO USAR LOS LINKS DE PAGO DINÁMICOS

## ✅ ¿Qué se ha integrado?

El bot ahora genera automáticamente links de pago de **MercadoPago** y **PayPal** cuando el cliente confirma el método de pago.

## 🎯 Flujo de Uso

### 1. Cliente Pregunta por un Producto
```
Cliente: "Hola, me interesa el Curso de Piano"
Bot: [Muestra información del producto con imagen]
```

### 2. Cliente Pregunta Cómo Pagar
```
Cliente: "¿Cómo puedo pagar?"
Bot: [Lista todos los métodos: MercadoPago, PayPal, Nequi, Daviplata]
```

### 3. Cliente Confirma el Método
```
Cliente: "MercadoPago"
Bot: [Genera link dinámico de MercadoPago con instrucciones]
```

## 🔧 Configuración Inicial

### Paso 1: Configurar Variables de Entorno

Edita tu archivo `.env` y agrega:

```bash
# MercadoPago (OBLIGATORIO para links dinámicos)
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_aqui
MERCADOPAGO_PUBLIC_KEY=tu_public_key_aqui

# PayPal (OPCIONAL)
PAYPAL_CLIENT_ID=tu_client_id_aqui
PAYPAL_CLIENT_SECRET=tu_client_secret_aqui

# URL de tu aplicación
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### Paso 2: Obtener Credenciales de MercadoPago

1. Ve a: https://www.mercadopago.com.co/developers
2. Inicia sesión con tu cuenta
3. Crea una nueva aplicación
4. Copia el **Access Token** y **Public Key**
5. Pégalos en tu `.env`

### Paso 3: Obtener Credenciales de PayPal (Opcional)

1. Ve a: https://developer.paypal.com
2. Inicia sesión
3. Crea una aplicación
4. Copia **Client ID** y **Client Secret**
5. Pégalos en tu `.env`

## 🧪 Probar el Sistema

### Opción 1: Test Rápido (Recomendado)
```bash
probar-links-pago.bat
```

O manualmente:
```bash
npx tsx scripts/test-payment-links-rapido.ts
```

### Opción 2: Test Completo con Conversación
```bash
npx tsx scripts/test-payment-links-integration.ts
```

### Opción 3: Prueba Real por WhatsApp

1. Inicia el bot:
```bash
npm run dev
```

2. Escanea el QR con WhatsApp

3. Envía un mensaje desde otro teléfono:
```
"Hola, me interesa el Curso de Piano"
```

4. Cuando el bot responda, pregunta:
```
"¿Cómo puedo pagar?"
```

5. Confirma el método:
```
"MercadoPago"
```

6. El bot generará automáticamente el link de pago

## 📱 Métodos de Pago Disponibles

### 1. MercadoPago (Con Link Dinámico)
- ✅ Tarjetas de crédito/débito
- ✅ PSE
- ✅ Efectivo (Efecty, Baloto, etc.)
- ✅ Link único por transacción
- ✅ Confirmación automática

### 2. PayPal (Con Link Dinámico)
- ✅ Tarjetas internacionales
- ✅ Cuenta PayPal
- ✅ Link único por transacción
- ✅ Conversión automática COP → USD

### 3. Nequi (Transferencia Manual)
- 📱 Número: 3136174267
- 📸 Cliente envía comprobante
- ✅ Verificación manual

### 4. Daviplata (Transferencia Manual)
- 📱 Número: 3136174267
- 📸 Cliente envía comprobante
- ✅ Verificación manual

### 5. Transferencia Bancaria (Manual)
- 🏦 Banco: Bancolombia
- 📋 Cuenta: 12345678901
- 👤 Titular: Tecnovariedades D&S
- 📸 Cliente envía comprobante

## 🎨 Ejemplo de Respuesta del Bot

Cuando el cliente confirma "MercadoPago", el bot responde:

```
✅ PAGO CON TARJETA 💻

💳 Pago seguro con MercadoPago
💰 Monto: 60,000 COP

👉 Link de pago:
https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=123456789

Pasos:
1. Haz clic en el link
2. Ingresa los datos de tu tarjeta
3. Confirma el pago

✅ Acceso inmediato después del pago
```

## 🔍 Verificar que Funciona

### Señales de Éxito:

1. **En los logs del servidor:**
```
[IntelligentEngine] 💳 Generando link de pago:
  producto: Curso de Piano
  metodo: mercadopago
  precio: 60000

[PaymentLink] Generando links para: Curso de Piano
[PaymentLink] MercadoPago link generado: https://...
[IntelligentBot] ✅ Links de pago agregados
```

2. **En WhatsApp:**
- El bot envía un mensaje con el link de pago
- El link es clickeable
- Al hacer clic, abre la página de pago de MercadoPago/PayPal

### Señales de Problema:

1. **Si dice "No configurado":**
   - Verifica que las variables de entorno estén en `.env`
   - Reinicia el servidor: `npm run dev`

2. **Si el link no funciona:**
   - Verifica las credenciales en el dashboard de MercadoPago/PayPal
   - Asegúrate de usar credenciales de **producción** (no sandbox)

3. **Si no genera el link:**
   - Revisa los logs del servidor
   - Verifica que el producto exista en la base de datos

## 🚨 Solución de Problemas

### Problema: "MercadoPago no configurado"
**Solución:**
1. Verifica que `MERCADOPAGO_ACCESS_TOKEN` esté en `.env`
2. Reinicia el servidor
3. Prueba de nuevo

### Problema: "Error generando link MercadoPago"
**Solución:**
1. Verifica que el Access Token sea válido
2. Revisa que la cuenta de MercadoPago esté activa
3. Verifica los logs para más detalles

### Problema: El bot no detecta el método de pago
**Solución:**
1. Asegúrate de escribir el método correctamente: "MercadoPago", "PayPal", "Nequi"
2. El mensaje debe ser corto (menos de 30 caracteres)
3. Debe haber un producto en contexto (pregunta primero por un producto)

## 📊 Monitoreo

Para ver los logs en tiempo real:
```bash
npm run dev
```

Los logs mostrarán:
- 🧠 Contexto de la conversación
- 💳 Generación de links
- ✅ Acciones ejecutadas
- ❌ Errores (si los hay)

## 🎉 ¡Listo para Producción!

Una vez configurado y probado:

1. ✅ El bot genera links automáticamente
2. ✅ Los clientes pueden pagar con un clic
3. ✅ El sistema mantiene contexto de la conversación
4. ✅ Funciona con múltiples clientes simultáneamente

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del servidor
2. Ejecuta el test: `probar-links-pago.bat`
3. Verifica las credenciales en `.env`
4. Consulta `INTEGRACION_LINKS_PAGO_COMPLETA.md` para más detalles

---

**¡El sistema está listo para generar links de pago dinámicos!** 🚀
