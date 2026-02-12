# 🎯 Integración del Sistema Multi-Agente con tu Proyecto Existente

## 📊 Situación Actual

Tu proyecto **YA FUNCIONA** en EasyPanel con:
- ✅ Prisma como ORM
- ✅ PostgreSQL conectado
- ✅ WhatsApp con Baileys
- ✅ Next.js + TypeScript
- ✅ Base de datos `whatsappdb` con muchas tablas

## 🔄 Estrategia de Integración

En lugar de crear un proyecto separado, vamos a **integrar el sistema multi-agente** en tu proyecto existente.

### Opción 1: Integrar Agentes en tu Proyecto Actual (RECOMENDADO)

Agregar los agentes como **módulos adicionales** a tu proyecto TypeScript existente:

```
src/
├── lib/
│   ├── bot/
│   │   ├── agents/              # ← NUEVO
│   │   │   ├── salesAgent.ts
│   │   │   ├── supportAgent.ts
│   │   │   ├── technicalAgent.ts
│   │   │   └── adminAgent.ts
│   │   ├── core/                # ← NUEVO
│   │   │   ├── router.ts
│   │   │   ├── intentClassifier.ts
│   │   │   └── agentSelector.ts
│   │   └── openclaw-agent-system.js  # ← YA EXISTE
```

**Ventajas:**
- ✅ Usa tu base de datos existente (Prisma)
- ✅ Usa tu configuración de WhatsApp actual
- ✅ Se integra con tu sistema de usuarios
- ✅ No duplica código

### Opción 2: Adaptar el Sistema Multi-Agente para usar Prisma

Modificar los servicios creados para usar Prisma en lugar de `pg` directo:

**Antes (pg directo):**
```javascript
const pool = require('../database/connection');
const result = await pool.query('SELECT * FROM clients WHERE phone = $1', [phone]);
```

**Después (Prisma):**
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const client = await prisma.user.findUnique({ where: { phone } });
```

## 🚀 Plan de Acción Recomendado

### Paso 1: Crear Agentes en TypeScript

Convertir los agentes JavaScript a TypeScript e integrarlos con Prisma:

```typescript
// src/lib/bot/agents/salesAgent.ts
import { PrismaClient } from '@prisma/client';
import { callGroq } from '../ai/groq';

const prisma = new PrismaClient();

export async function handleSalesIntent(
  userId: string,
  customerPhone: string,
  message: string,
  intentData: any
) {
  // Buscar o crear conversación
  const conversation = await prisma.conversation.findFirst({
    where: { customerPhone, userId },
    include: { messages: { take: 10, orderBy: { createdAt: 'desc' } } }
  });
  
  // Buscar productos relacionados
  const products = await prisma.product.findMany({
    where: { 
      userId,
      OR: [
        { name: { contains: intentData.entities?.product, mode: 'insensitive' } },
        { category: intentData.entities?.category }
      ]
    },
    take: 5
  });
  
  // Construir contexto
  const context = `
    Eres un vendedor experto.
    Productos disponibles: ${JSON.stringify(products)}
    Historial: ${conversation?.messages.map(m => m.content).join('\n')}
  `;
  
  // Llamar a Groq
  const response = await callGroq(context, message);
  
  // Guardar mensaje
  await prisma.message.create({
    data: {
      conversationId: conversation!.id,
      content: response,
      type: 'TEXT',
      direction: 'OUTGOING',
      aiGenerated: true
    }
  });
  
  return response;
}
```

### Paso 2: Integrar con tu Sistema de WhatsApp Actual

Modificar tu handler de mensajes existente para usar el router de agentes:

```typescript
// En tu archivo de WhatsApp actual
import { routeMessage } from './bot/core/router';

// Cuando llega un mensaje
sock.ev.on('messages.upsert', async ({ messages }) => {
  const msg = messages[0];
  const from = msg.key.remoteJid;
  const text = msg.message?.conversation || '';
  
  // Usar el router de agentes
  const response = await routeMessage(userId, from, text);
  
  // Enviar respuesta
  await sock.sendMessage(from, { text: response });
});
```

### Paso 3: Usar las Tablas Existentes

Tu base de datos ya tiene tablas perfectas para el sistema multi-agente:

| Tabla Existente | Uso en Multi-Agente |
|-----------------|---------------------|
| `users` | Información del negocio/tenant |
| `conversations` | Historial de conversaciones |
| `messages` | Mensajes individuales |
| `products` | Catálogo de productos |
| `bot_settings` | Configuración de IA (Groq API Key) |
| `training_data` | Aprendizaje del bot |

**No necesitas crear nuevas tablas**, solo usar las existentes.

## 📝 Archivos a Crear

### 1. Router de Agentes (TypeScript)

```bash
# Crear estructura
mkdir -p src/lib/bot/agents
mkdir -p src/lib/bot/core
```

### 2. Servicios Adaptados

Crear versiones TypeScript de los servicios que usen Prisma:

- `src/lib/bot/services/aiService.ts` (ya tienes uno similar)
- `src/lib/bot/services/memoryService.ts`
- `src/lib/bot/services/productService.ts`

### 3. Configuración

Usar tu `.env` existente que ya tiene:
- `GROQ_API_KEY`
- `DATABASE_URL`
- Otras configuraciones

## 🎯 Siguiente Paso

¿Quieres que:

1. **Cree los agentes en TypeScript** integrados con tu proyecto actual?
2. **Adapte los servicios** para usar Prisma en lugar de pg?
3. **Modifique tu handler de WhatsApp** para usar el sistema multi-agente?

Dime cuál prefieres y lo implemento ahora mismo, aprovechando toda tu infraestructura existente que ya funciona en EasyPanel.
