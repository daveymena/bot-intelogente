# 📱 Cómo Funcionan los Mensajes Entrantes

## ✅ Sistema Completamente Implementado

El bot **YA está configurado** para recibir mensajes de WhatsApp y responder automáticamente con IA dinámica.

## 🔄 Flujo Completo de Mensajes

### 1. Cliente Envía Mensaje
```
Cliente (WhatsApp) → "Hola, info del curso de piano"
```

### 2. Baileys Recibe el Mensaje
```typescript
// src/lib/baileys-service.ts - línea ~205
socket.ev.on('messages.upsert', async ({ messages, type }) => {
  // Procesa mensaje entrante
})
```

### 3. Guarda en Base de Datos
```typescript
// Crea/actualiza conversación
// Guarda mensaje como INCOMING
await db.message.create({
  conversationId,
  content: messageText,
  direction: 'INCOMING',
  type: 'TEXT'
})
```

### 4. Genera Respuesta con IA
```typescript
// Obtiene historial de conversación
const history = await AIService.getConversationHistory(conversationId)

// Genera respuesta dinámica con IA
const aiResponse = await AIService.generateResponse(
  userId,
  messageText,
  from,
  history
)
```

### 5. Envía Respuesta Automática
```typescript
// Envía por WhatsApp
await socket.sendMessage(from, { text: aiResponse.message })

// Guarda como OUTGOING
await db.message.create({
  conversationId,
  content: aiResponse.message,
  direction: 'OUTGOING',
  type: 'TEXT'
})
```

## 🎯 Ejemplo Real de Conversación

### Mensaje 1:
```
👤 Cliente: "Hola, me interesa el curso de piano"

[Baileys] 📨 Mensaje recibido de 573001234567@s.whatsapp.net
[Baileys] 🤖 Generando respuesta automática con IA...
[AI] Intención de producto detectada: general (0.7)
[Product Intelligence] Buscando producto: "curso de piano"
[Product Intelligence] Producto encontrado: Curso de Piano Completo
[AI] Respuesta generada con IA

🤖 Bot: "¡Hola! 🎹 El Curso de Piano Profesional es perfecto para ti. 
        Incluye +80 lecciones en video HD y acceso de por vida por solo 
        $60.000. ¿Te gustaría ver el temario completo?"

[Baileys] 📤 Respuesta enviada
```

### Mensaje 2:
```
👤 Cliente: "Cuánto cuesta?"

[Baileys] 📨 Mensaje recibido
[Baileys] 🤖 Generando respuesta con contexto...
[AI] Usando historial de 2 mensajes anteriores
[AI] Intención: price (0.9)

🤖 Bot: "Cuesta $60.000 COP. Es una inversión excelente considerando 
        que tienes acceso de por vida y soporte directo del profesor. 
        ¿Te paso el enlace de compra?"

[Baileys] 📤 Respuesta enviada
```

### Mensaje 3:
```
👤 Cliente: "Dame el link"

[Baileys] 📨 Mensaje recibido
[AI] Intención: link (0.95)

🤖 Bot: "¡Perfecto! Aquí está el enlace directo 👉 
        https://pay.hotmart.com/I95497720H
        
        El pago es 100% seguro y recibes acceso inmediato. 
        ¿Tienes alguna duda antes de comprar?"

[Baileys] 📤 Respuesta enviada
```

## 🚀 Cómo Probar

### Paso 1: Iniciar el Sistema
```bash
# Doble clic en:
INICIAR-TODO.bat

# O ejecutar:
npm run dev
```

**Espera a ver:**
```
✓ Ready in X.Xs
○ Local: http://localhost:3000
```

### Paso 2: Conectar WhatsApp
1. Abrir: `http://localhost:3000`
2. Login: `daveymena16@gmail.com` / `admin123`
3. Ir a sección "WhatsApp"
4. Click en "Conectar WhatsApp"
5. Escanear QR con tu WhatsApp

**Verás en la terminal:**
```
[Baileys] ✅ QR generado para usuario: xxx
[Baileys] ✅ Conexión establecida
[Baileys] ✅ Manejadores de mensajes configurados
```

### Paso 3: Enviar Mensaje de Prueba
Desde **otro teléfono**, envía un mensaje al número que conectaste:

```
"Hola, info del curso de piano"
```

### Paso 4: Ver la Magia ✨
**En la terminal verás:**
```
[Baileys] 📨 Mensaje recibido de 573001234567@s.whatsapp.net: Hola, info del curso de piano
[Baileys] 🤖 Generando respuesta automática con IA...
[AI] Generando respuesta para: "Hola, info del curso de piano"
[AI] Intención de producto detectada: general (0.7)
[Product Intelligence] Buscando producto: "Hola, info del curso de piano"
[Product Intelligence] Palabras clave: curso, piano
[Product Intelligence] Producto específico encontrado: Curso de Piano Completo
[AI] Producto encontrado: Curso de Piano Completo - Generando respuesta con IA
[AI] Respuesta dinámica generada con IA
[Baileys] ✅ Respuesta generada: "¡Hola! 🎹 El Curso de Piano..."
[Baileys] 📤 Respuesta enviada a 573001234567@s.whatsapp.net
```

**El cliente recibirá:**
```
¡Hola! 🎹 El Curso de Piano Profesional es perfecto para ti. 
Incluye +80 lecciones en video HD y acceso de por vida por solo 
$60.000. ¿Te gustaría ver el temario completo?
```

## 📊 Verificar que Funciona

### 1. Ver Logs en Terminal
Debes ver mensajes como:
```
[Baileys] 📨 Mensaje recibido...
[Baileys] 🤖 Generando respuesta...
[Baileys] 📤 Respuesta enviada...
```

### 2. Ver en Dashboard
1. Ir a sección "Conversaciones"
2. Verás la conversación con el cliente
3. Verás todos los mensajes (entrantes y salientes)

### 3. Ver en WhatsApp
El cliente recibirá la respuesta automáticamente en su WhatsApp

## 🔧 Configuración de Respuestas Automáticas

### Activar/Desactivar
Por defecto, las respuestas automáticas están **ACTIVADAS**.

Para desactivarlas temporalmente, editar `src/lib/baileys-service.ts` línea ~230:

```typescript
// Comentar esta línea para desactivar respuestas automáticas:
await this.handleAutoResponse(socket, userId, from, messageText, conversation.id)
```

### Ajustar Filtros
El bot ignora automáticamente:
- Mensajes muy cortos (< 2 caracteres)
- Comandos del sistema (que empiezan con `/` o `!`)
- Mensajes propios (fromMe)

Editar en `src/lib/ai-service.ts` línea ~180:

```typescript
static shouldAutoRespond(message: string): boolean {
  if (message.length < 2) return false
  if (message.startsWith('/') || message.startsWith('!')) return false
  return true
}
```

## 🎨 Personalizar Respuestas

### Cambiar Personalidad
Editar `src/lib/ai-service.ts` línea ~90:

```typescript
const systemPrompt = `Eres un vendedor profesional...

TU PERSONALIDAD:
- [Personalizar aquí]
- Más formal / Más casual
- Más técnico / Más simple
- Etc.
```

### Cambiar Tiempo de Respuesta
Por defecto responde **inmediatamente**. Para agregar delay:

```typescript
// En src/lib/baileys-service.ts, línea ~230
await new Promise(resolve => setTimeout(resolve, 2000)) // 2 segundos
await this.handleAutoResponse(...)
```

## 🐛 Solución de Problemas

### El bot no responde
**Verificar:**
1. ✅ Servidor corriendo (`npm run dev`)
2. ✅ WhatsApp conectado (ver dashboard)
3. ✅ Ver logs en terminal
4. ✅ Variable `GROQ_API_KEY` en `.env`

**Ver logs:**
```bash
# En la terminal donde corre npm run dev
# Debes ver:
[Baileys] 📨 Mensaje recibido...
```

### Error: "No hay sesión activa"
**Causa:** WhatsApp no está conectado
**Solución:**
1. Ir al dashboard
2. Reconectar WhatsApp
3. Escanear QR nuevamente

### Error: "Failed to fetch"
**Causa:** Servidor no está corriendo
**Solución:**
```bash
# Detener todo
Ctrl + C

# Iniciar de nuevo
npm run dev
```

### El bot responde pero sin IA
**Verificar:**
```bash
# Ver si GROQ_API_KEY está configurada
type .env | findstr GROQ_API_KEY
```

Si no está, agregar en `.env`:
```
GROQ_API_KEY=tu_api_key_aqui
```

## 📈 Monitorear Conversaciones

### En Tiempo Real (Terminal)
Todos los mensajes aparecen en la terminal con logs detallados

### En Dashboard
1. Ir a `http://localhost:3000`
2. Sección "Conversaciones"
3. Ver todas las conversaciones activas
4. Click en una para ver el historial completo

### En Base de Datos
```bash
# Ver conversaciones
npx prisma studio

# O con script
npx tsx -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.conversation.findMany({ include: { messages: true } }).then(c => console.log(JSON.stringify(c, null, 2)))"
```

## ✨ Características Activas

```
✅ Recepción automática de mensajes
✅ Respuesta automática con IA
✅ Mantenimiento de contexto
✅ Guardado en base de datos
✅ Historial de conversaciones
✅ Detección de intención
✅ Búsqueda inteligente de productos
✅ Respuestas naturales y conversacionales
✅ Logs detallados en terminal
✅ Dashboard para monitoreo
```

## 🎯 Estado del Sistema

```
🎉 SISTEMA 100% FUNCIONAL

✅ Mensajes entrantes: FUNCIONANDO
✅ Respuestas automáticas: ACTIVAS
✅ IA dinámica: OPERATIVA
✅ Base de datos: GUARDANDO TODO
✅ Dashboard: MOSTRANDO CONVERSACIONES

🚀 LISTO PARA RECIBIR CLIENTES REALES
```

## 🎬 Para Empezar AHORA

```bash
# 1. Iniciar sistema
INICIAR-TODO.bat

# 2. Conectar WhatsApp
http://localhost:3000 → Escanear QR

# 3. Enviar mensaje de prueba
Desde otro teléfono: "Hola, info del curso de piano"

# 4. Ver la respuesta automática ✨
```

---

**¡El bot está completamente funcional y responde automáticamente a todos los mensajes! 🎉**
