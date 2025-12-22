# 🚀 Guía Rápida: Configurar n8n en 10 Minutos

## Paso 1: Instalar n8n (2 minutos)

### Opción A: Docker (Recomendado)

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Opción B: npm

```bash
npm install -g n8n
n8n start
```

Abrir: http://localhost:5678

## Paso 2: Configurar Variables de Entorno (1 minuto)

Agregar a `.env`:

```bash
# n8n
N8N_WEBHOOK_URL=http://localhost:5678/webhook/whatsapp-incoming
N8N_API_KEY=mi-api-key-super-secreta-123

# Ollama (si usas local)
OLLAMA_URL=http://localhost:11434

# PostgreSQL (ya lo tienes)
DATABASE_URL=postgresql://user:pass@localhost:5432/smartsales
```

## Paso 3: Crear Workflow Básico en n8n (5 minutos)

### 1. Crear Nuevo Workflow

1. Abrir n8n: http://localhost:5678
2. Click en "New Workflow"
3. Nombrar: "WhatsApp Bot - Básico"

### 2. Agregar Nodos

#### Nodo 1: Webhook (Recibir mensajes)

- Click en "+" → "Trigger" → "Webhook"
- HTTP Method: `POST`
- Path: `whatsapp-incoming`
- Guardar

**URL del webhook:** `http://localhost:5678/webhook/whatsapp-incoming`

#### Nodo 2: PostgreSQL (Buscar productos)

- Click en "+" → "App" → "PostgreSQL"
- Operation: `Execute Query`
- Query:
```sql
SELECT id, name, description, price, images
FROM "Product"
WHERE LOWER(name) LIKE LOWER('%' || $1 || '%')
   OR LOWER(description) LIKE LOWER('%' || $1 || '%')
LIMIT 5
```
- Parameters: `{{ $json.message }}`

**Configurar conexión PostgreSQL:**
- Host: `localhost`
- Database: `smartsales`
- User: tu usuario
- Password: tu contraseña
- Port: `5432`

#### Nodo 3: HTTP Request (Llamar Ollama)

- Click en "+" → "Action" → "HTTP Request"
- Method: `POST`
- URL: `http://localhost:11434/api/generate`
- Body:
```json
{
  "model": "llama3.1:8b",
  "prompt": "Eres un asistente de ventas profesional en español.\n\nCliente pregunta: {{ $node['Webhook'].json.message }}\n\nProductos disponibles:\n{{ $node['PostgreSQL'].json }}\n\nResponde de forma amigable y profesional:",
  "stream": false
}
```

#### Nodo 4: Function (Procesar respuesta)

- Click en "+" → "Action" → "Function"
- Code:
```javascript
// Extraer respuesta de Ollama
const ollamaResponse = $node['HTTP Request'].json.response

// Preparar mensaje para WhatsApp
return {
  to: $node['Webhook'].json.from,
  message: ollamaResponse
}
```

#### Nodo 5: HTTP Request (Enviar a WhatsApp)

- Click en "+" → "Action" → "HTTP Request"
- Method: `POST`
- URL: `http://localhost:3000/api/whatsapp/send-from-n8n`
- Headers:
  - Name: `x-api-key`
  - Value: `mi-api-key-super-secreta-123`
- Body:
```json
{
  "to": "{{ $json.to }}",
  "message": "{{ $json.message }}"
}
```

### 3. Conectar Nodos

Arrastra líneas entre nodos en este orden:
```
Webhook → PostgreSQL → HTTP Request (Ollama) → Function → HTTP Request (WhatsApp)
```

### 4. Activar Workflow

- Click en "Active" (arriba a la derecha)
- El workflow ahora está escuchando mensajes

## Paso 4: Iniciar Baileys (1 minuto)

Crear archivo: `iniciar-baileys-webhook.bat`

```bash
@echo off
echo Iniciando Baileys Webhook Service...
npx tsx scripts/start-baileys-webhook.ts
```

Crear archivo: `scripts/start-baileys-webhook.ts`

```typescript
import { getBaileysWebhookService } from '../src/lib/baileys-webhook-service'

async function main() {
  console.log('🚀 Iniciando Baileys Webhook Service...')
  
  const baileys = getBaileysWebhookService()
  await baileys.connect()
  
  console.log('✅ Baileys conectado y escuchando mensajes')
  console.log('📨 Mensajes se enviarán a:', process.env.N8N_WEBHOOK_URL)
}

main().catch(console.error)
```

Ejecutar:
```bash
npm run dev  # Terminal 1 (Next.js)
n8n start    # Terminal 2 (n8n)
node scripts/start-baileys-webhook.ts  # Terminal 3 (Baileys)
```

## Paso 5: Probar (1 minuto)

1. Escanear QR en WhatsApp
2. Enviar mensaje: "Hola, busco un portátil"
3. Ver flujo en n8n (pestaña "Executions")
4. Recibir respuesta en WhatsApp

## 🎯 Flujo Completo

```
Cliente (WhatsApp)
  ↓ "Hola, busco un portátil"
Baileys recibe mensaje
  ↓ POST a n8n webhook
n8n Workflow:
  1. Recibe mensaje
  2. Busca productos en PostgreSQL
  3. Llama Ollama para generar respuesta
  4. Procesa respuesta
  5. Envía a Baileys
  ↓ POST a /api/whatsapp/send-from-n8n
Baileys envía mensaje
  ↓
Cliente recibe respuesta
```

## 📊 Monitoreo

### Ver ejecuciones en n8n:
- http://localhost:5678/workflows → Click en workflow → "Executions"
- Puedes ver cada paso con datos reales

### Ver logs de Baileys:
```bash
# En la terminal donde corre Baileys
📨 Mensaje recibido: { from: '573XX', message: 'Hola...' }
✅ Mensaje enviado a n8n
```

## 🔧 Workflows Adicionales

### Workflow 2: Seguimiento Automático

```
Cron Trigger (cada 24h)
  ↓
PostgreSQL: SELECT conversaciones sin respuesta
  ↓
HTTP Request: Generar mensaje de seguimiento (Ollama)
  ↓
HTTP Request: Enviar a Baileys
```

### Workflow 3: Procesamiento de Pagos

```
Webhook: MercadoPago notification
  ↓
PostgreSQL: Actualizar orden
  ↓
Function: Generar mensaje de confirmación
  ↓
HTTP Request: Enviar a Baileys
```

## ✅ Ventajas Inmediatas

1. **Código más simple**: Baileys solo 200 líneas
2. **Debugging visual**: Ver cada paso en n8n
3. **Sin reiniciar**: Modificar workflow sin reiniciar servidor
4. **Logs claros**: Ver datos reales en cada nodo
5. **Fácil testing**: Ejecutar workflow manualmente

## 🚨 Troubleshooting

### n8n no recibe mensajes:
```bash
# Verificar que n8n esté corriendo
curl http://localhost:5678/webhook/whatsapp-incoming

# Verificar variable de entorno
echo $N8N_WEBHOOK_URL
```

### Baileys no envía mensajes:
```bash
# Verificar API key
curl -H "x-api-key: mi-api-key-super-secreta-123" \
  http://localhost:3000/api/whatsapp/send-from-n8n
```

### Ollama no responde:
```bash
# Verificar que Ollama esté corriendo
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Hola",
  "stream": false
}'
```

## 📚 Recursos

- n8n Docs: https://docs.n8n.io
- n8n Community: https://community.n8n.io
- Baileys Docs: https://whiskeysockets.github.io

## 🎉 ¡Listo!

Ahora tienes:
- ✅ Baileys simplificado (solo mensajero)
- ✅ n8n orquestando lógica de negocio
- ✅ Flujo visual fácil de modificar
- ✅ Arquitectura profesional y escalable

**Próximo paso:** Migrar más lógica a n8n workflows
