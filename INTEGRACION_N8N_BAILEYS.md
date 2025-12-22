# 🔗 Integración n8n + Baileys - Arquitectura Profesional

## 🎯 Objetivo

Separar responsabilidades:
- **Baileys**: Solo maneja la conexión con WhatsApp (enviar/recibir)
- **n8n**: Orquesta toda la lógica de negocio, IA, base de datos, pagos

## ✅ Ventajas de esta Arquitectura

### 1. **Simplicidad**
- Baileys se vuelve un simple "mensajero"
- n8n maneja toda la complejidad
- Código más limpio y mantenible

### 2. **Escalabilidad**
- Fácil agregar nuevos flujos sin tocar código
- n8n tiene UI visual para crear workflows
- Puedes tener múltiples instancias de Baileys

### 3. **Flexibilidad**
- Cambiar IA (Ollama → Groq → GPT) sin tocar código
- Agregar integraciones (CRM, Email, etc.) desde n8n
- A/B testing de flujos conversacionales

### 4. **Mantenibilidad**
- Menos código = menos bugs
- Flujos visuales fáciles de entender
- Logs centralizados en n8n

## 🏗️ Arquitectura Detallada

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE MENSAJE ENTRANTE                     │
└─────────────────────────────────────────────────────────────────┘

1. Cliente envía mensaje por WhatsApp
   ↓
2. Baileys recibe el mensaje
   ↓
3. Baileys hace POST a n8n webhook
   POST http://localhost:5678/webhook/whatsapp-incoming
   Body: { from, message, timestamp, mediaUrl }
   ↓
4. n8n procesa el mensaje:
   ├─ Consulta PostgreSQL (historial, productos)
   ├─ Llama a Ollama/Groq (genera respuesta)
   ├─ Aplica lógica de negocio (pagos, escalamiento)
   └─ Decide qué responder
   ↓
5. n8n hace POST a Baileys
   POST http://localhost:3000/api/whatsapp/send
   Body: { to, message, mediaUrl }
   ↓
6. Baileys envía mensaje a WhatsApp
   ↓
7. Cliente recibe respuesta
```

## 📦 Componentes

### 1. Baileys Service (Simplificado)

**Responsabilidades:**
- ✅ Conectar con WhatsApp
- ✅ Recibir mensajes → enviar a n8n
- ✅ Enviar mensajes desde n8n → WhatsApp
- ✅ Mantener sesión estable
- ❌ NO procesa lógica de negocio
- ❌ NO llama IA directamente
- ❌ NO consulta base de datos

### 2. n8n Workflows

**Workflow 1: Mensaje Entrante**
```
Webhook Trigger
  ↓
PostgreSQL: Buscar historial conversación
  ↓
PostgreSQL: Buscar productos relacionados
  ↓
HTTP Request: Llamar Ollama/Groq
  ↓
Function: Procesar respuesta IA
  ↓
Switch: ¿Es consulta de pago?
  ├─ Sí → Generar link MercadoPago
  └─ No → Continuar
  ↓
HTTP Request: Enviar respuesta a Baileys
```

**Workflow 2: Seguimiento Automático**
```
Cron Trigger (cada 24h)
  ↓
PostgreSQL: Buscar conversaciones sin respuesta
  ↓
HTTP Request: Generar mensaje de seguimiento (IA)
  ↓
HTTP Request: Enviar a Baileys
```

**Workflow 3: Procesamiento de Pagos**
```
Webhook: MercadoPago notification
  ↓
PostgreSQL: Actualizar orden
  ↓
HTTP Request: Generar mensaje confirmación
  ↓
HTTP Request: Enviar a Baileys
```

### 3. PostgreSQL

**Tablas principales:**
- `conversations` - Historial completo
- `products` - Catálogo
- `orders` - Órdenes de compra
- `users` - Clientes

## 🔧 Implementación Paso a Paso

### Paso 1: Instalar n8n

```bash
# Opción 1: Docker (recomendado)
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Opción 2: npm
npm install -g n8n
n8n start
```

### Paso 2: Simplificar Baileys

Crear archivo: `src/lib/baileys-webhook-service.ts`

```typescript
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'
import axios from 'axios'

const N8N_WEBHOOK = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/whatsapp-incoming'

export class BaileysWebhookService {
  private sock: any
  
  async connect() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_sessions')
    
    this.sock = makeWASocket({
      auth: state,
      printQRInTerminal: true
    })
    
    // Guardar credenciales
    this.sock.ev.on('creds.update', saveCreds)
    
    // Escuchar mensajes → enviar a n8n
    this.sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) {
        if (msg.key.fromMe) continue
        
        await this.sendToN8N({
          from: msg.key.remoteJid,
          message: msg.message?.conversation || msg.message?.extendedTextMessage?.text,
          timestamp: msg.messageTimestamp,
          hasMedia: !!msg.message?.imageMessage
        })
      }
    })
  }
  
  private async sendToN8N(data: any) {
    try {
      await axios.post(N8N_WEBHOOK, data)
    } catch (error) {
      console.error('Error enviando a n8n:', error)
    }
  }
  
  async sendMessage(to: string, message: string) {
    await this.sock.sendMessage(to, { text: message })
  }
}
```

### Paso 3: API para que n8n envíe mensajes

Crear archivo: `src/app/api/whatsapp/send-from-n8n/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { BaileysWebhookService } from '@/lib/baileys-webhook-service'

const baileys = new BaileysWebhookService()

export async function POST(req: NextRequest) {
  try {
    const { to, message, mediaUrl } = await req.json()
    
    // Validar API key de n8n
    const apiKey = req.headers.get('x-api-key')
    if (apiKey !== process.env.N8N_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    await baileys.sendMessage(to, message)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

### Paso 4: Crear Workflow en n8n

1. Abrir n8n: `http://localhost:5678`
2. Crear nuevo workflow
3. Agregar nodos:

**Nodo 1: Webhook**
- Method: POST
- Path: `whatsapp-incoming`

**Nodo 2: PostgreSQL**
- Operation: Execute Query
- Query: 
```sql
SELECT * FROM conversations 
WHERE phone = '{{ $json.from }}' 
ORDER BY created_at DESC 
LIMIT 10
```

**Nodo 3: HTTP Request (Ollama)**
- Method: POST
- URL: `http://localhost:11434/api/generate`
- Body:
```json
{
  "model": "llama3.1:8b",
  "prompt": "Eres un asistente de ventas. Historial: {{ $node['PostgreSQL'].json.messages }}. Mensaje nuevo: {{ $node['Webhook'].json.message }}. Responde:",
  "stream": false
}
```

**Nodo 4: HTTP Request (Enviar a Baileys)**
- Method: POST
- URL: `http://localhost:3000/api/whatsapp/send-from-n8n`
- Headers: `x-api-key: tu-api-key-secreta`
- Body:
```json
{
  "to": "{{ $node['Webhook'].json.from }}",
  "message": "{{ $node['HTTP Request'].json.response }}"
}
```

### Paso 5: Variables de Entorno

Agregar a `.env`:

```bash
# n8n
N8N_WEBHOOK_URL=http://localhost:5678/webhook/whatsapp-incoming
N8N_API_KEY=tu-api-key-secreta-aqui

# Ollama
OLLAMA_URL=http://localhost:11434

# PostgreSQL (ya lo tienes)
DATABASE_URL=postgresql://...
```

## 🚀 Ventajas Inmediatas

### 1. **Código más simple**
Antes: 2000+ líneas en `baileys-service.ts`
Después: 200 líneas (solo conexión)

### 2. **Flujos visuales**
Puedes ver y modificar la lógica sin tocar código

### 3. **Fácil debugging**
n8n muestra cada paso del workflow con datos reales

### 4. **Integraciones listas**
n8n tiene 400+ integraciones pre-construidas:
- Gmail, Slack, Telegram
- Stripe, PayPal, MercadoPago
- Google Sheets, Airtable
- OpenAI, Anthropic, Cohere

## 📊 Comparación

| Aspecto | Antes (Todo en código) | Después (Baileys + n8n) |
|---------|------------------------|-------------------------|
| Líneas de código | ~5000 | ~500 |
| Complejidad | Alta | Baja |
| Mantenibilidad | Difícil | Fácil |
| Escalabilidad | Limitada | Excelente |
| Debugging | Console.log | UI visual |
| Agregar features | Programar | Arrastrar nodos |
| Testing | Complejo | Simple |

## 🎯 Próximos Pasos

1. **Instalar n8n** (5 minutos)
2. **Simplificar Baileys** (30 minutos)
3. **Crear workflow básico** (15 minutos)
4. **Probar flujo completo** (10 minutos)
5. **Migrar lógica gradualmente** (1-2 horas)

## 💡 Ejemplo de Workflow Completo

```
┌─────────────────────────────────────────────────────────────┐
│              WORKFLOW: Consulta de Producto                  │
└─────────────────────────────────────────────────────────────┘

1. Webhook recibe: "Hola, busco un portátil para diseño"
   ↓
2. PostgreSQL: Buscar historial del cliente
   ↓
3. PostgreSQL: Buscar productos con tags "portátil", "diseño"
   ↓
4. Function: Preparar contexto para IA
   {
     historial: [...],
     productos: [...],
     mensaje: "Hola, busco un portátil para diseño"
   }
   ↓
5. HTTP Request: Ollama genera respuesta
   "¡Hola! Tengo 3 portátiles perfectos para diseño..."
   ↓
6. Switch: ¿Cliente preguntó por precio?
   ├─ Sí → Agregar link de pago
   └─ No → Continuar
   ↓
7. PostgreSQL: Guardar conversación
   ↓
8. HTTP Request: Enviar a Baileys
   ↓
9. Cliente recibe respuesta en WhatsApp
```

## 🔐 Seguridad

- API key para comunicación Baileys ↔ n8n
- n8n puede estar en red privada
- PostgreSQL con credenciales seguras
- Rate limiting en webhooks

## 📈 Escalabilidad Futura

Con esta arquitectura puedes:
- Agregar más canales (Telegram, Instagram)
- Múltiples bots de WhatsApp
- A/B testing de respuestas
- Analytics avanzados
- Integración con CRM
- Automatizaciones complejas

## ✅ Conclusión

Esta arquitectura es **profesional, escalable y mantenible**. Separas claramente:
- **Baileys**: Transporte (WhatsApp)
- **n8n**: Cerebro (lógica de negocio)
- **PostgreSQL**: Memoria (datos)
- **Ollama/Groq**: Inteligencia (IA)

¿Quieres que te ayude a implementar esto paso a paso?
