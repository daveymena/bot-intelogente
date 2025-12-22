# 🚀 Migrar a WhatsApp Business API (Solución Definitiva)

## ¿Por Qué Migrar?

### Problemas con Baileys (Actual)
- ❌ QR se "pega" constantemente
- ❌ Sesiones se corrompen
- ❌ Archivos se pierden en reinicios
- ❌ No es oficial de WhatsApp
- ❌ Puede ser bloqueado en cualquier momento
- ❌ Requiere escanear QR cada vez

### Ventajas de WhatsApp Business API
- ✅ **Oficial de Meta/WhatsApp**
- ✅ **Sin QR** - Conexión directa con número
- ✅ **Más estable** - No se desconecta
- ✅ **Soporte oficial** - Meta lo mantiene
- ✅ **Mejor para producción** - Diseñado para negocios
- ✅ **Webhooks** - Recibe mensajes en tiempo real
- ✅ **No se bloquea** - Cumple con términos de servicio

---

## Opciones de WhatsApp Business API

### Opción 1: Meta Cloud API (GRATIS hasta 1,000 conversaciones/mes) ⭐⭐⭐

**Costo:**
- Gratis: Primeras 1,000 conversaciones/mes
- Después: ~$0.005-0.05 por mensaje (según país)

**Ventajas:**
- ✅ Directo de Meta
- ✅ Gratis para empezar
- ✅ Fácil de configurar
- ✅ Documentación oficial

**Cómo empezar:**
1. Ir a https://developers.facebook.com
2. Crear app de WhatsApp Business
3. Obtener API key
4. Configurar webhook

### Opción 2: Twilio WhatsApp API

**Costo:**
- ~$0.005 por mensaje
- Sin costo mensual fijo

**Ventajas:**
- ✅ Muy fácil de usar
- ✅ Buena documentación
- ✅ SDK en Node.js
- ✅ Soporte 24/7

**Cómo empezar:**
1. Ir a https://www.twilio.com/whatsapp
2. Crear cuenta
3. Solicitar número de WhatsApp
4. Usar SDK de Twilio

### Opción 3: 360Dialog

**Costo:**
- ~€49/mes + mensajes

**Ventajas:**
- ✅ Partner oficial de Meta
- ✅ Soporte en español
- ✅ Fácil configuración

### Opción 4: MessageBird

**Costo:**
- ~$50/mes + mensajes

**Ventajas:**
- ✅ API simple
- ✅ Buena documentación
- ✅ Múltiples canales (SMS, WhatsApp, etc.)

---

## Comparación de Costos

| Proveedor | Costo Mensual | Costo por Mensaje | Gratis |
|-----------|---------------|-------------------|--------|
| Meta Cloud API | $0 | $0.005-0.05 | 1,000 conversaciones |
| Twilio | $0 | $0.005 | No |
| 360Dialog | €49 | Variable | No |
| MessageBird | $50 | Variable | No |

**Recomendación:** Empezar con **Meta Cloud API** (gratis hasta 1,000 conversaciones)

---

## Guía: Migrar a Meta Cloud API

### Paso 1: Crear App en Meta

1. Ve a https://developers.facebook.com
2. Haz clic en **"My Apps"** → **"Create App"**
3. Selecciona **"Business"**
4. Nombre: "Smart Sales Bot"
5. Haz clic en **"Create App"**

### Paso 2: Agregar WhatsApp Product

1. En el dashboard de tu app
2. Busca **"WhatsApp"** en productos
3. Haz clic en **"Set Up"**
4. Sigue el wizard de configuración

### Paso 3: Obtener Credenciales

```
1. Ve a WhatsApp → Getting Started
2. Copia:
   - Phone Number ID
   - WhatsApp Business Account ID
   - Access Token (temporal)
```

### Paso 4: Generar Access Token Permanente

```
1. Ve a Settings → Basic
2. Copia App ID y App Secret
3. Genera System User Token (permanente)
```

### Paso 5: Configurar Webhook

```
1. Ve a WhatsApp → Configuration
2. Webhook URL: https://tu-dominio.com/api/whatsapp/webhook
3. Verify Token: un-token-secreto-que-elijas
4. Subscribe to: messages
```

---

## Implementación en Tu App

### 1. Instalar SDK

```bash
npm install axios
```

### 2. Crear Servicio de WhatsApp Business API

```typescript
// src/lib/whatsapp-business-api.ts

export class WhatsAppBusinessAPI {
  private static PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!
  private static ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!
  private static API_URL = `https://graph.facebook.com/v18.0/${this.PHONE_NUMBER_ID}/messages`

  // Enviar mensaje de texto
  static async sendMessage(to: string, message: string) {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message }
        })
      })

      return await response.json()
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  // Enviar imagen
  static async sendImage(to: string, imageUrl: string, caption?: string) {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'image',
          image: {
            link: imageUrl,
            caption: caption
          }
        })
      })

      return await response.json()
    } catch (error) {
      console.error('Error sending image:', error)
      throw error
    }
  }
}
```

### 3. Crear Webhook para Recibir Mensajes

```typescript
// src/app/api/whatsapp/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server'

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!

// Verificación del webhook (GET)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified')
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

// Recibir mensajes (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Procesar mensaje entrante
    if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const message = body.entry[0].changes[0].value.messages[0]
      const from = message.from
      const text = message.text?.body

      console.log(`Message from ${from}: ${text}`)

      // Aquí procesar con tu IA
      const { AIService } = await import('@/lib/ai-service')
      const response = await AIService.generateResponse(text, from)

      // Enviar respuesta
      const { WhatsAppBusinessAPI } = await import('@/lib/whatsapp-business-api')
      await WhatsAppBusinessAPI.sendMessage(from, response)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

### 4. Configurar Variables de Entorno

```bash
# .env
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxx
WHATSAPP_VERIFY_TOKEN=mi-token-secreto-123
```

---

## Migración Paso a Paso

### Fase 1: Preparación (1 día)
1. ✅ Crear cuenta en Meta Developers
2. ✅ Crear app de WhatsApp Business
3. ✅ Obtener credenciales
4. ✅ Configurar webhook

### Fase 2: Implementación (2-3 días)
1. ✅ Crear servicio de WhatsApp Business API
2. ✅ Crear webhook para recibir mensajes
3. ✅ Adaptar lógica de IA
4. ✅ Probar en sandbox

### Fase 3: Testing (1 día)
1. ✅ Probar envío de mensajes
2. ✅ Probar recepción de mensajes
3. ✅ Probar con IA
4. ✅ Probar con imágenes

### Fase 4: Producción (1 día)
1. ✅ Solicitar número de producción
2. ✅ Verificar negocio (si es necesario)
3. ✅ Desplegar a Easypanel
4. ✅ Monitorear

**Tiempo total:** 5-7 días

---

## Ventajas de la Migración

### Antes (Baileys)
- ❌ QR cada vez que se reinicia
- ❌ Sesiones corruptas
- ❌ Archivos perdidos
- ❌ No oficial
- ❌ Puede ser bloqueado

### Después (WhatsApp Business API)
- ✅ Sin QR, conexión directa
- ✅ Sesión siempre activa
- ✅ Sin archivos locales
- ✅ Oficial de Meta
- ✅ No se bloquea

---

## Costos Estimados

### Escenario 1: Negocio Pequeño (100 clientes/mes)
- Meta Cloud API: **GRATIS** (dentro de 1,000 conversaciones)

### Escenario 2: Negocio Mediano (500 clientes/mes)
- Meta Cloud API: **GRATIS** (dentro de 1,000 conversaciones)

### Escenario 3: Negocio Grande (2,000 clientes/mes)
- Meta Cloud API: ~$50/mes (1,000 gratis + 1,000 pagadas)

---

## Recomendación Final

### Corto Plazo (Esta Semana)
1. Configurar volumen persistente en Easypanel
2. Mejorar limpieza de QR (ya hecho)

### Mediano Plazo (Próximas 2 Semanas)
1. **Migrar a Meta Cloud API** ⭐
2. Eliminar Baileys
3. Disfrutar de estabilidad

### Largo Plazo (1-2 Meses)
1. Escalar con WhatsApp Business API
2. Agregar más funciones (templates, botones, etc.)
3. Integrar con CRM

---

## Recursos

- **Meta Cloud API:** https://developers.facebook.com/docs/whatsapp/cloud-api
- **Twilio WhatsApp:** https://www.twilio.com/docs/whatsapp
- **360Dialog:** https://www.360dialog.com
- **MessageBird:** https://www.messagebird.com

---

## ¿Necesitas Ayuda?

Si decides migrar a WhatsApp Business API, puedo ayudarte con:
1. Configuración de Meta Developers
2. Implementación del código
3. Testing y debugging
4. Despliegue a producción

---

**Conclusión:** La migración a WhatsApp Business API es la **solución definitiva** al problema del QR. Es más estable, oficial y diseñada para producción.
