# 💳 Métodos de Pago Disponibles

## Configuración Actual

Tu bot puede aceptar los siguientes métodos de pago:

### 🇨🇴 Métodos Locales (Colombia)

#### 1. Nequi
- **Número:** Configura en `.env` → `NEQUI_NUMBER`
- **Proceso:**
  1. Cliente solicita producto
  2. Bot envía número de Nequi
  3. Cliente hace transferencia
  4. Cliente envía captura de pantalla
  5. Confirmas y procesas pedido

#### 2. Daviplata
- **Número:** Configura en `.env` → `DAVIPLATA_NUMBER`
- **Proceso:** Igual que Nequi

#### 3. Transferencia Bancaria
- **Banco:** Configura en `.env` → `BANK_NAME`
- **Tipo de cuenta:** `BANK_ACCOUNT_TYPE`
- **Número de cuenta:** `BANK_ACCOUNT_NUMBER`
- **Titular:** `BANK_ACCOUNT_HOLDER`

#### 4. Efectivo (Contra Entrega)
- **Zonas:** Configura en `.env` → `DELIVERY_ZONES`
- **Habilitado:** `CASH_ON_DELIVERY_ENABLED=true`

### 🌎 Métodos Internacionales

#### 5. Stripe (Tarjetas)
- Acepta: Visa, Mastercard, American Express
- Requiere: Cuenta en stripe.com
- Comisión: ~2.9% + $0.30 USD por transacción

#### 6. Mercado Pago
- Acepta: Tarjetas, PSE, efectivo en puntos
- Países: Colombia, Argentina, México, Chile, Perú, Brasil
- Requiere: Cuenta en mercadopago.com

#### 7. PayPal
- Acepta: PayPal balance, tarjetas
- Internacional
- Requiere: Cuenta Business en paypal.com

## Cómo Responde el Bot

Cuando un cliente pregunta por métodos de pago, el bot automáticamente:

1. Lista los métodos configurados en tu `.env`
2. Proporciona instrucciones específicas
3. Envía datos de cuenta (Nequi, banco, etc.)
4. Guía al cliente en el proceso

## Configuración Rápida

### Para Nequi/Daviplata:
```env
NEQUI_NUMBER=3001234567
DAVIPLATA_NUMBER=3001234567
```

### Para Banco:
```env
BANK_NAME=Bancolombia
BANK_ACCOUNT_TYPE=Ahorros
BANK_ACCOUNT_NUMBER=12345678901
BANK_ACCOUNT_HOLDER=Juan Pérez
```

### Para Efectivo:
```env
CASH_ON_DELIVERY_ENABLED=true
DELIVERY_ZONES=Bogotá,Medellín,Cali
```

## Ejemplo de Conversación

**Cliente:** "¿Cómo puedo pagar?"

**Bot:** "¡Claro! Aceptamos los siguientes métodos de pago:

💚 **Nequi:** 300 123 4567
💙 **Daviplata:** 300 123 4567
🏦 **Bancolombia:** 
   - Tipo: Ahorros
   - Cuenta: 12345678901
   - Titular: Juan Pérez
💵 **Efectivo:** Contra entrega en Bogotá, Medellín, Cali

¿Cuál prefieres?"

## Notas Importantes

- Los métodos comentados en `.env` NO aparecerán en las respuestas del bot
- Solo configura los métodos que realmente uses
- Actualiza los números/cuentas con tus datos reales
- El bot detecta automáticamente qué métodos están activos
