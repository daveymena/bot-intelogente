# 🎯 Sistema Multi-Agente Integrado - TypeScript + Prisma

## ✅ Archivos Creados

He creado el sistema multi-agente **integrado con tu proyecto actual**:

### 1. Agente de Ventas
**Archivo**: `src/lib/bot/agents/salesAgent.ts`

**Características**:
- ✅ Usa Prisma (tu ORM actual)
- ✅ Se conecta a tu base de datos `whatsappdb`
- ✅ Usa tus tablas existentes (`conversations`, `messages`, `products`, `user`)
- ✅ Integrado con Groq
- ✅ Calcula score de probabilidad de compra
- ✅ Maneja consultas de precio, disponibilidad y compras

### 2. Clasificador de Intenciones
**Archivo**: `src/lib/bot/core/intentClassifier.ts`

**Características**:
- ✅ Usa Groq para clasificar intenciones
- ✅ Fallback a palabras clave si Groq falla
- ✅ Extrae entidades (productos, categorías, precios)
- ✅ 10 tipos de intenciones detectadas

**Intenciones Detectadas**:
1. `saludo` - Cliente inicia conversación
2. `consulta_precio` - Pregunta por precios
3. `consulta_disponibilidad` - Pregunta por stock
4. `comparacion` - Compara productos
5. `compra` - Quiere comprar
6. `soporte` - Tiene un problema
7. `informacion_envio` - Pregunta por envío
8. `informacion_pago` - Pregunta por métodos de pago
9. `despedida` - Se despide
10. `otro` - No clasificado

### 3. Router de Agentes
**Archivo**: `src/lib/bot/core/agentRouter.ts`

**Características**:
- ✅ Recibe mensajes de WhatsApp
- ✅ Clasifica la intención
- ✅ Enruta al agente apropiado
- ✅ Guarda mensajes en la BD
- ✅ Actualiza conversaciones
- ✅ Estadísticas del router

## 🔌 Cómo Integrarlo con tu WhatsApp Actual

### Opción 1: Integrar en BaileysStableService

Modifica tu `src/lib/baileys-stable-service.ts`:

```typescript
// Importar el router
import { routeMessage } from './bot/core/agentRouter';

// En tu handler de mensajes (línea ~400)
async setupMessageHandler(socket: WASocket, userId: string) {
  socket.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (msg.key.fromMe) continue;
      
      const from = msg.key.remoteJid!;
      const messageText = msg.message?.conversation || 
                         msg.message?.extendedTextMessage?.text || '';
      
      if (!messageText) continue;

      try {
        // 🚀 USAR EL SISTEMA MULTI-AGENTE
        const response = await routeMessage(userId, from, messageText);
        
        // Enviar respuesta
        await this.sendMessage(userId, from, response);
        
      } catch (error) {
        console.error('Error procesando mensaje:', error);
      }
    }
  });
}
```

### Opción 2: Usar como Módulo Alternativo

Mantener tu sistema actual y usar el multi-agente solo para ciertos casos:

```typescript
// En tu código actual
const useMultiAgent = process.env.USE_MULTI_AGENT === 'true';

if (useMultiAgent) {
  const response = await routeMessage(userId, from, messageText);
} else {
  // Tu sistema actual (OpenClaw)
  const response = await openClawOrchestrator.process(...);
}
```

## 📊 Ventajas de esta Integración

### ✅ Compatible con tu Proyecto
- Usa **TypeScript** (como tu proyecto)
- Usa **Prisma** (tu ORM actual)
- Usa tus **tablas existentes**
- Usa **Groq** (ya configurado)

### ✅ No Rompe Nada
- No modifica tu código actual
- Se integra como módulo adicional
- Puedes activarlo/desactivarlo fácilmente

### ✅ Mejora tu Sistema
- **Clasificación de intenciones** más precisa
- **Agentes especializados** por tipo de consulta
- **Scoring de leads** automático
- **Estadísticas** del router

## 🚀 Pasos para Activarlo

### 1. Verificar Dependencias

```bash
# Verificar que tengas Groq instalado
npm list groq-sdk

# Si no está, instalarlo
npm install groq-sdk
```

### 2. Configurar Variables de Entorno

Tu `.env` ya tiene:
```env
GROQ_API_KEY=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
DATABASE_URL="postgresql://postgres:67I5320D@164.68.122.5:6432/whatsappdb?sslmode=disable"
```

### 3. Probar el Sistema

Crear un archivo de prueba:

```typescript
// test-multi-agent.ts
import { routeMessage } from './src/lib/bot/core/agentRouter';

async function test() {
  const userId = 'tu-user-id'; // Reemplazar con un ID real de tu BD
  const customerPhone = '573001234567';
  const message = '¿Cuánto cuesta una laptop HP?';
  
  const response = await routeMessage(userId, customerPhone, message);
  console.log('Respuesta:', response);
}

test();
```

```bash
# Ejecutar prueba
npx tsx test-multi-agent.ts
```

### 4. Integrar en Producción

Una vez probado localmente, hacer deploy a EasyPanel:

```bash
git add src/lib/bot/
git commit -m "feat: sistema multi-agente integrado"
git push origin main
```

## 📈 Monitoreo

### Ver Estadísticas

```typescript
import { getRouterStats } from './src/lib/bot/core/agentRouter';

const stats = await getRouterStats(userId, 7); // Últimos 7 días
console.log(stats);
// {
//   totalConversations: 45,
//   totalMessages: 320,
//   avgMessagesPerConversation: "7.11",
//   period: "7 días"
// }
```

### Ver Intenciones Más Comunes

```sql
-- En tu base de datos
SELECT 
  content,
  COUNT(*) as total
FROM messages
WHERE direction = 'INCOMING'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY content
ORDER BY total DESC
LIMIT 10;
```

## 🎯 Próximos Pasos

1. **Probar localmente** con el script de prueba
2. **Integrar** en tu `BaileysStableService`
3. **Desplegar** a EasyPanel
4. **Monitorear** las conversaciones
5. **Optimizar** según resultados

## 💡 Notas Importantes

- ✅ El sistema usa tu **base de datos actual** en EasyPanel
- ✅ No necesitas crear nuevas tablas
- ✅ Compatible con tu arquitectura TypeScript
- ✅ Se integra con tu sistema de WhatsApp actual
- ✅ Puedes activarlo gradualmente

¿Quieres que te ayude a:
1. **Probarlo localmente** primero?
2. **Integrarlo** en tu BaileysStableService?
3. **Crear más agentes** (Technical, Support)?
