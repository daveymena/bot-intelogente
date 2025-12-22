# 💳 SISTEMA DE PAGOS COMPLETO

## 🎯 Funcionalidades Implementadas

### 1. Generación Automática de Links de Pago

El sistema ahora genera links de pago dinámicos para cada producto usando:

- **MercadoPago** - Tarjetas de crédito/débito
- **PayPal** - Pagos internacionales
- **Nequi/Daviplata** - Transferencias instantáneas
- **Transferencia bancaria** - Pagos tradicionales

### 2. Asistente Virtual de la Página

Un chatbot inteligente que ayuda a los usuarios a:

- Configurar el sistema
- Conectar WhatsApp
- Agregar productos
- Configurar métodos de pago
- Resolver problemas comunes

## 📁 Archivos Creados

### 1. `src/lib/payment-link-generator.ts`
**Generador de links de pago**

Funciones principales:
- `generateMercadoPagoLink()` - Crea link de MercadoPago
- `generatePayPalLink()` - Crea link de PayPal
- `generatePaymentLinks()` - Genera todos los métodos
- `generateMethodResponse()` - Respuesta según método elegido

### 2. `src/app/api/payments/generate-links/route.ts`
**API endpoint para generar links**

```typescript
POST /api/payments/generate-links
Body: { productId: string }
Response: { paymentLinks: PaymentLinks }
```

### 3. `src/components/PageAssistant.tsx`
**Asistente virtual flotante**

Características:
- Botón flotante en esquina inferior derecha
- Chat interactivo
- Respuestas inteligentes
- Guías paso a paso

## 🔧 Configuración

### 1. Variables de Entorno

Agrega en tu archivo `.env`:

```env
# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_aqui
MERCADOPAGO_PUBLIC_KEY=tu_public_key_aqui

# PayPal
PAYPAL_CLIENT_ID=tu_client_id_aqui
PAYPAL_CLIENT_SECRET=tu_client_secret_aqui

# URL de tu aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Obtener Credenciales de MercadoPago

1. Ve a https://www.mercadopago.com.co/developers
2. Crea una aplicación
3. Ve a "Credenciales"
4. Copia:
   - Access Token (producción)
   - Public Key (producción)
5. Pégalos en `.env`

### 3. Obtener Credenciales de PayPal

1. Ve a https://developer.paypal.com
2. Crea una aplicación
3. Ve a "Credentials"
4. Copia:
   - Client ID
   - Secret
5. Pégalos en `.env`

### 4. Configurar Nequi/Daviplata

Edita en `src/lib/payment-link-generator.ts`:

```typescript
private static readonly NEQUI_NUMBER = '3136174267'  // Tu número
private static readonly DAVIPLATA_NUMBER = '3136174267'  // Tu número
```

### 5. Configurar Transferencia Bancaria

Edita en `src/lib/payment-link-generator.ts`:

```typescript
transferencia: {
  banco: 'Bancolombia',  // Tu banco
  cuenta: '12345678901',  // Tu cuenta
  titular: 'Tecnovariedades D&S'  // Tu nombre
}
```

## 🚀 Cómo Funciona

### Flujo de Pago

```
1. Cliente pregunta: "Dame el link de pago"
   ↓
2. Bot detecta intención: request_payment_link
   ↓
3. Bot busca producto en contexto
   ↓
4. Bot genera links dinámicos:
   - MercadoPago (si está configurado)
   - PayPal (si está configurado)
   - Nequi/Daviplata (siempre)
   - Transferencia (siempre)
   ↓
5. Bot envía opciones al cliente
   ↓
6. Cliente elige método
   ↓
7. Bot envía instrucciones específicas
```

### Ejemplo de Conversación

```
Cliente: "Info del curso de piano"

Bot: "🎹 Curso Piano Profesional Completo
     ✅ +80 lecciones en video HD
     ✅ Acceso de por vida
     💰 $60.000 COP"

Cliente: "Dame el link de pago"

Bot: "💳 MÉTODOS DE PAGO PARA Curso Piano

     💰 Precio: 60.000 COP

     Elige tu método preferido:

     1️⃣ NEQUI / DAVIPLATA
        📱 Número: 3136174267
        ✅ Transferencia instantánea

     2️⃣ TARJETA DE CRÉDITO/DÉBITO
        💳 Pago seguro con MercadoPago
        👉 https://mpago.li/abc123
        ✅ Acceso inmediato

     3️⃣ PAYPAL
        🌎 Pago internacional
        👉 https://paypal.com/xyz789
        ✅ Seguro y confiable

     4️⃣ TRANSFERENCIA BANCARIA
        🏦 Banco: Bancolombia
        📋 Cuenta: 12345678901

     ¿Con cuál método deseas pagar?"

Cliente: "Nequi"

Bot: "✅ PAGO POR NEQUI

     📱 Número: 3136174267
     💰 Monto: 60.000 COP

     Pasos:
     1. Abre tu app Nequi
     2. Envía 60.000 COP al número 3136174267
     3. Toma captura del comprobante
     4. Envíalo por este chat

     ✅ Recibirás tu producto inmediatamente"
```

## 🎨 Asistente Virtual

### Ubicación

El asistente aparece como un botón flotante verde en la esquina inferior derecha de todas las páginas.

### Temas que Maneja

1. **Configuración inicial**
   - Crear cuenta
   - Conectar WhatsApp
   - Agregar productos

2. **WhatsApp**
   - Cómo escanear QR
   - Solucionar desconexiones
   - Verificar estado

3. **Productos**
   - Agregar individual
   - Importar masivo
   - Editar y eliminar

4. **Pagos**
   - Configurar MercadoPago
   - Configurar PayPal
   - Configurar Nequi
   - Configurar transferencias

5. **Bot IA**
   - Cómo funciona
   - Personalización
   - Razonamiento profundo

6. **Conversaciones**
   - Ver chats
   - Responder manualmente
   - Estadísticas

7. **Problemas comunes**
   - WhatsApp desconectado
   - Bot no responde
   - Links no funcionan

### Personalizar Respuestas

Edita `src/components/PageAssistant.tsx`:

```typescript
const generateResponse = (question: string): string => {
  // Agrega tus propias respuestas aquí
  if (q.includes('tu_tema')) {
    return `Tu respuesta personalizada`
  }
}
```

## 📊 Integración con el Bot

El sistema de razonamiento profundo ahora:

1. **Detecta intención de pago**
   - "Dame el link"
   - "Cómo pago?"
   - "Métodos de pago"

2. **Busca producto en contexto**
   - Mensaje actual
   - Memoria (24h)
   - Historial

3. **Genera links automáticamente**
   - Llama a `PaymentLinkGenerator`
   - Crea links de MercadoPago y PayPal
   - Formatea respuesta

4. **Envía opciones al cliente**
   - Lista todos los métodos
   - Incluye instrucciones
   - Espera elección

5. **Responde según método elegido**
   - Instrucciones específicas
   - Links directos
   - Pasos a seguir

## 🧪 Probar el Sistema

### 1. Verificar Configuración

```bash
npx tsx scripts/verificar-sistema-razonamiento.ts
```

### 2. Probar Generación de Links

```bash
# Crear script de prueba
npx tsx scripts/test-payment-links.ts
```

### 3. Probar en WhatsApp

1. Inicia el servidor:
   ```bash
   npm run dev
   ```

2. Conecta WhatsApp

3. Envía mensajes de prueba:
   - "Info del curso de piano"
   - "Dame el link de pago"
   - "Nequi"

### 4. Probar Asistente

1. Abre http://localhost:3000
2. Haz clic en el botón verde flotante
3. Pregunta: "Cómo configurar pagos?"

## 🔒 Seguridad

### Webhooks de MercadoPago

Crea endpoint para recibir notificaciones:

```typescript
// src/app/api/payments/webhook/mercadopago/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Verificar firma
  // Procesar pago
  // Activar producto
  
  return NextResponse.json({ success: true })
}
```

### Webhooks de PayPal

```typescript
// src/app/api/payments/webhook/paypal/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Verificar webhook
  // Procesar pago
  // Activar producto
  
  return NextResponse.json({ success: true })
}
```

## 📈 Métricas

El sistema registra:

- Links generados
- Método de pago elegido
- Conversiones
- Tiempo de respuesta

Ver en Dashboard > Estadísticas

## 🚨 Solución de Problemas

### Links no se generan

1. Verifica credenciales en `.env`
2. Revisa logs en consola
3. Verifica conexión a internet
4. Prueba credenciales manualmente

### MercadoPago falla

1. Verifica Access Token
2. Revisa que sea de producción
3. Verifica que la app esté activa
4. Revisa límites de la cuenta

### PayPal falla

1. Verifica Client ID y Secret
2. Usa credenciales de producción
3. Verifica que la cuenta esté verificada
4. Revisa límites de transacciones

### Asistente no aparece

1. Verifica que esté en `layout.tsx`
2. Limpia caché del navegador
3. Reinicia el servidor
4. Revisa consola de errores

## 📚 Documentación Adicional

- **MercadoPago:** https://www.mercadopago.com.co/developers/es/docs
- **PayPal:** https://developer.paypal.com/docs/api/overview/
- **Nequi:** https://www.nequi.com.co/
- **Daviplata:** https://www.daviplata.com/

## ✅ Checklist de Implementación

- [x] Generador de links creado
- [x] API endpoint creado
- [x] Asistente virtual creado
- [x] Integrado con razonamiento
- [x] Documentación completa
- [ ] Configurar credenciales de producción
- [ ] Probar en WhatsApp real
- [ ] Configurar webhooks
- [ ] Activar en producción

---

**Creado:** 31 de Octubre, 2025
**Versión:** 1.0.0
**Estado:** ✅ Listo para configurar
