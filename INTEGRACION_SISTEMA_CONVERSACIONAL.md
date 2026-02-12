# 🔗 GUÍA DE INTEGRACIÓN DEL SISTEMA CONVERSACIONAL

## 📦 COMPONENTES COMPLETADOS

### ✅ Archivos Creados/Reparados

1. **`src/lib/bot/template-renderer.ts`** (NUEVO)
   - Renderiza plantillas con variables dinámicas
   - Obtiene datos del negocio desde DB
   - Formatea precios, métodos de pago, etc.
   - 300+ líneas de código

2. **`src/lib/conversation-context-service.ts`** (NUEVO)
   - Mantiene contexto de 24 horas
   - Almacenamiento en memoria + DB
   - Limpieza automática de contextos expirados
   - 300+ líneas de código

3. **`src/lib/bot/conversation-flow-manager.ts`** (COMPLETADO)
   - Gestión de flujos multi-turno
   - Flujos predefinidos (compra, soporte)
   - Sistema de pasos y condiciones
   - 350+ líneas de código

## 🎯 ARQUITECTURA INTEGRADA

```
┌─────────────────────────────────────────────────────────────┐
│                    MENSAJE DE WHATSAPP                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   AGENT ROUTER                              │
│  - Recibe mensaje                                           │
│  - Crea/actualiza conversación en DB                        │
│  - Guarda mensaje entrante                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              CONVERSATION CONTEXT SERVICE                   │
│  - Carga contexto de 24h                                    │
│  - Historial de mensajes                                    │
│  - Producto actual                                          │
│  - Etapa de conversación                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              CONVERSATION FLOW MANAGER                      │
│  - Verifica si hay flujo activo                             │
│  - Procesa paso actual                                      │
│  - Avanza al siguiente paso                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ (Si no hay flujo activo)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              CONVERSATION MATCHER                           │
│  - Busca plantilla que coincida                             │
│  - Fuzzy matching                                           │
│  - Scoring de coincidencias                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ (Si hay match > 0.3)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              TEMPLATE RENDERER                              │
│  - Renderiza plantilla                                      │
│  - Reemplaza variables dinámicas                            │
│  - Formatea respuesta                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ (Si no hay match o es complejo)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              OPENCLAW ORCHESTRATOR                          │
│  - Razonamiento con IA                                      │
│  - Búsqueda de productos                                    │
│  - Generación de respuestas                                 │
│  - Rotación de API keys                                     │
│  - Fallback a Ollama                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   RESPUESTA AL USUARIO                      │
│  - Texto formateado                                         │
│  - Imágenes (si aplica)                                     │
│  - Follow-ups sugeridos                                     │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 CÓMO INTEGRAR

### Opción 1: Integración Completa (RECOMENDADO)

Modificar `src/lib/bot/core/agentRouter.ts`:

```typescript
import { ConversationFlowManager } from '../conversation-flow-manager';
import { ConversationMatcher } from '../conversation-matcher';
import { TemplateRenderer } from '../template-renderer';
import { ConversationContextService } from '@/lib/conversation-context-service';

export async function routeMessage(
  userId: string,
  customerPhone: string,
  message: string,
  conversationId?: string
): Promise<AgentResponse> {
  try {
    // 1. Actualizar contexto
    await ConversationContextService.addMessage(
      customerPhone,
      userId,
      'user',
      message
    );

    // 2. Verificar si hay flujo activo
    if (ConversationFlowManager.hasActiveFlow(customerPhone)) {
      const flowResponse = await ConversationFlowManager.processMessage(
        customerPhone,
        userId,
        message
      );

      if (flowResponse) {
        await ConversationContextService.addMessage(
          customerPhone,
          userId,
          'assistant',
          flowResponse.text
        );
        return flowResponse;
      }
    }

    // 3. Intentar match con plantillas (respuestas rápidas)
    const match = ConversationMatcher.findBestMatch(message);
    
    if (match && match.confidence > 0.7) {
      // Respuesta rápida con plantilla
      const rendered = await TemplateRenderer.render(match.template, {
        userId,
        customerPhone
      });

      await ConversationContextService.addMessage(
        customerPhone,
        userId,
        'assistant',
        rendered
      );

      return { text: rendered };
    }

    // 4. Usar OpenClaw para casos complejos
    const openClaw = await getOpenClaw();
    const products = await prisma.product.findMany({
      where: { userId, status: 'AVAILABLE' }
    });

    const context = {
      userId,
      products,
      conversationId: conversation.id,
      currentStage: conversation.currentStage,
      activeProduct: conversation.product
    };

    const openClawResponse = await openClaw.processMessage(
      message,
      customerPhone,
      context
    );

    await ConversationContextService.addMessage(
      customerPhone,
      userId,
      'assistant',
      openClawResponse.text
    );

    return {
      text: openClawResponse.text,
      media: openClawResponse.media
    };

  } catch (error) {
    console.error('[AgentRouter] Error:', error);
    return { 
      text: 'Disculpa, tuve un problema. ¿Podrías repetir tu mensaje?' 
    };
  }
}
```

### Opción 2: Integración Gradual

**Fase 1: Solo Templates para Respuestas Rápidas**
```typescript
// En agentRouter.ts, antes de llamar a OpenClaw
const match = ConversationMatcher.findBestMatch(message);
if (match && match.confidence > 0.8) {
  const rendered = await TemplateRenderer.render(match.template, {
    userId,
    customerPhone
  });
  return { text: rendered };
}
```

**Fase 2: Agregar Contexto**
```typescript
// Cargar contexto antes de procesar
const context = await ConversationContextService.getContext(
  customerPhone,
  userId
);

// Pasar historial a OpenClaw
const history = await ConversationContextService.getMessageHistory(
  customerPhone,
  userId,
  10
);
```

**Fase 3: Activar Flujos**
```typescript
// Verificar flujos antes de templates
if (ConversationFlowManager.hasActiveFlow(customerPhone)) {
  const flowResponse = await ConversationFlowManager.processMessage(
    customerPhone,
    userId,
    message
  );
  if (flowResponse) return flowResponse;
}
```

## 📊 CASOS DE USO

### Caso 1: Saludo Simple
```
Usuario: "Hola"
↓
Matcher: Encuentra "greeting_generic" (confidence: 0.95)
↓
Renderer: Renderiza con datos del negocio
↓
Respuesta: "¡Hola! 👋 Soy el asistente virtual de Tecnovariedades D&S..."
```

### Caso 2: Consulta de Producto
```
Usuario: "Cuánto cuesta la laptop ASUS?"
↓
Matcher: No hay match directo (confidence: 0.4)
↓
OpenClaw: Busca producto + genera respuesta
↓
Respuesta: Card del producto con precio, specs, etc.
```

### Caso 3: Flujo de Compra
```
Usuario: "Quiero comprar"
↓
FlowManager: Inicia "purchase_flow"
↓
Paso 1: Confirmar producto
↓
Paso 2: Método de pago
↓
Paso 3: Datos de envío
↓
Paso 4: Confirmación final
```

## 🧪 TESTING

### Script de Prueba Básico

```typescript
// test-conversation-system.ts
import { ConversationMatcher } from './src/lib/bot/conversation-matcher';
import { TemplateRenderer } from './src/lib/bot/template-renderer';
import { ConversationContextService } from './src/lib/conversation-context-service';

async function testSystem() {
  const userId = 'test-user-id';
  const phone = '+573001234567';

  // Test 1: Matcher
  console.log('\n🧪 Test 1: Conversation Matcher');
  const match = ConversationMatcher.findBestMatch('hola buenos días');
  console.log('Match:', match?.template.id, 'Confidence:', match?.confidence);

  // Test 2: Renderer
  console.log('\n🧪 Test 2: Template Renderer');
  if (match) {
    const rendered = await TemplateRenderer.render(match.template, {
      userId,
      customerPhone: phone
    });
    console.log('Rendered:', rendered);
  }

  // Test 3: Context
  console.log('\n🧪 Test 3: Conversation Context');
  await ConversationContextService.addMessage(phone, userId, 'user', 'Hola');
  await ConversationContextService.addMessage(phone, userId, 'assistant', 'Hola! ¿En qué puedo ayudarte?');
  
  const history = await ConversationContextService.getMessageHistory(phone, userId);
  console.log('History:', history.length, 'messages');

  // Test 4: Stats
  console.log('\n🧪 Test 4: Statistics');
  const stats = await ConversationContextService.getContextStats(phone, userId);
  console.log('Stats:', stats);
}

testSystem().catch(console.error);
```

## 🔧 CONFIGURACIÓN

### Variables de Entorno Necesarias

```env
# Ya existentes
DATABASE_URL=...
GROQ_API_KEY=...

# Nuevas (opcionales)
CONVERSATION_CONTEXT_DURATION=86400000  # 24 horas en ms
MAX_CONTEXT_MESSAGES=20
TEMPLATE_CACHE_ENABLED=true
```

### Configuración en Prisma

Agregar al schema si no existe:

```prisma
model ConversationContext {
  id          String   @id @default(cuid())
  phoneNumber String
  userId      String
  messages    Json
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([phoneNumber, userId])
  @@index([userId])
  @@index([phoneNumber])
}
```

## 📈 MÉTRICAS DE ÉXITO

### KPIs a Monitorear

1. **Tasa de Match de Templates**: > 60%
2. **Tiempo de Respuesta**: < 1 segundo (templates), < 3 segundos (OpenClaw)
3. **Contextos Activos**: Monitorear memoria
4. **Flujos Completados**: % de flujos que llegan al final
5. **Satisfacción**: Respuestas útiles vs escalaciones

### Logging Recomendado

```typescript
console.log('[ConversationSystem] Stats:', {
  activeContexts: ConversationContextService.getActiveContexts(),
  flowStats: ConversationFlowManager.getStats(),
  templateCategories: conversationTemplates.length
});
```

## 🚨 TROUBLESHOOTING

### Problema: Templates no se renderizan correctamente
**Solución**: Verificar que las variables existen en la DB
```typescript
const businessData = await TemplateRenderer.getBusinessData(userId);
console.log('Business data:', businessData);
```

### Problema: Contexto no persiste
**Solución**: Verificar que el servicio está inicializado
```typescript
ConversationContextService.initialize();
```

### Problema: Flujos no avanzan
**Solución**: Verificar condiciones de los pasos
```typescript
const flowInfo = ConversationFlowManager.getCurrentFlowInfo(phone);
console.log('Current flow:', flowInfo);
```

## 🎯 PRÓXIMOS PASOS

1. ✅ Integrar en agentRouter.ts
2. ✅ Probar con mensajes reales
3. ✅ Ajustar thresholds de confidence
4. ✅ Agregar más plantillas según necesidad
5. ✅ Monitorear métricas en producción
6. ✅ Optimizar rendimiento si es necesario

## 📚 DOCUMENTACIÓN ADICIONAL

- Ver `ANALISIS_SISTEMA_CONVERSACIONAL.md` para arquitectura completa
- Ver `src/lib/bot/conversation-templates.ts` para todas las plantillas
- Ver `src/lib/bot/conversation-matcher.ts` para lógica de matching
