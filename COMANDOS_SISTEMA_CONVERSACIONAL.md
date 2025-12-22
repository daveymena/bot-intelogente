# 🚀 COMANDOS RÁPIDOS - SISTEMA CONVERSACIONAL

## 🧪 PROBAR EL SISTEMA

### Test completo del sistema conversacional
```bash
npx tsx scripts/test-sistema-conversacional-completo.ts
```

Este test ejecuta:
- ✅ Flujo completo de venta (saludo → cierre)
- ✅ Manejo de objeciones (precio, calidad, tiempo, etc.)
- ✅ Generación de preguntas (descubrimiento, calificación, cierre)
- ✅ Análisis de flujo conversacional
- ✅ Estadísticas del sistema

---

## 🤖 INICIAR EL BOT

### Desarrollo (con hot reload)
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

---

## 📊 VERIFICAR ESTADO

### Ver conversaciones activas
```bash
# El sistema mantiene estadísticas en memoria
# Acceder vía API: GET /api/agents/stats
```

### Ver memoria de una conversación
```bash
# Acceder vía API: GET /api/agents/memory/:chatId
```

---

## 🔧 CONFIGURACIÓN

### Variables de entorno necesarias
```env
# Base de datos
DATABASE_URL="postgresql://..."

# IA (Groq)
GROQ_API_KEY="gsk_..."

# WhatsApp
WHATSAPP_ENABLED="true"

# Agentes
AGENTS_ENABLED="true"
CONVERSATION_FLOW_ENABLED="true"
OBJECTION_HANDLING_ENABLED="true"
```

---

## 📝 ARCHIVOS IMPORTANTES

### Componentes del sistema conversacional
```
src/agents/
├── orchestrator.ts                  # Orquestador principal
├── conversation-flow-manager.ts     # Gestor de flujo
├── question-generator.ts            # Generador de preguntas
├── objection-handler.ts             # Manejador de objeciones
├── shared-memory.ts                 # Memoria compartida
├── base-agent.ts                    # Clase base de agentes
├── greeting-agent.ts                # Agente de saludos
├── search-agent.ts                  # Agente de búsqueda
├── product-agent.ts                 # Agente de productos
├── payment-agent.ts                 # Agente de pagos
├── photo-agent.ts                   # Agente de fotos
└── closing-agent.ts                 # Agente de cierre
```

### Utilidades
```
src/agents/utils/
├── intent-detector.ts               # Detector de intenciones
└── product-matcher.ts               # Matcher de productos
```

---

## 🎯 EJEMPLOS DE USO

### Ejemplo 1: Integrar en API route
```typescript
import { Orchestrator } from '@/agents/orchestrator';

const orchestrator = new Orchestrator();

export async function POST(req: Request) {
  const { chatId, userId, message, userName } = await req.json();
  
  const response = await orchestrator.processMessage({
    chatId,
    userId,
    message,
    userName,
  });
  
  return Response.json(response);
}
```

### Ejemplo 2: Usar en servicio de WhatsApp
```typescript
import { Orchestrator } from '@/agents/orchestrator';

const orchestrator = new Orchestrator();

// En el handler de mensajes de WhatsApp
sock.ev.on('messages.upsert', async ({ messages }) => {
  const msg = messages[0];
  
  const response = await orchestrator.processMessage({
    chatId: msg.key.remoteJid!,
    userId: 'user-id',
    message: msg.message?.conversation || '',
    userName: msg.pushName,
  });
  
  // Enviar respuesta
  await sock.sendMessage(msg.key.remoteJid!, {
    text: response.text,
  });
  
  // Ejecutar acciones adicionales
  if (response.actions) {
    for (const action of response.actions) {
      if (action.type === 'send_photo') {
        // Enviar foto
      } else if (action.type === 'send_payment_link') {
        // Enviar link de pago
      }
    }
  }
});
```

### Ejemplo 3: Analizar flujo manualmente
```typescript
import { ConversationFlowManager } from '@/agents/conversation-flow-manager';
import { SharedMemoryService } from '@/agents/shared-memory';

const memoryService = SharedMemoryService.getInstance();
const memory = memoryService.get(chatId, userId);

const flowDecision = ConversationFlowManager.analyzeFlow(
  memory,
  userMessage
);

console.log('Stage actual:', flowDecision.currentStage);
console.log('Siguiente stage:', flowDecision.nextStage);
console.log('Debe preguntar:', flowDecision.shouldAskQuestion);
console.log('Pregunta sugerida:', flowDecision.suggestedQuestion);
```

### Ejemplo 4: Manejar objeción manualmente
```typescript
import { ObjectionHandler } from '@/agents/objection-handler';

const objectionResponse = ObjectionHandler.handleObjection(
  userMessage,
  memory,
  currentProduct
);

if (objectionResponse) {
  console.log('Tipo de objeción:', objectionResponse.type);
  console.log('Respuesta:', objectionResponse.response);
  console.log('Siguiente acción:', objectionResponse.nextAction);
}
```

### Ejemplo 5: Generar pregunta contextual
```typescript
import { QuestionGenerator } from '@/agents/question-generator';

// Pregunta de descubrimiento
const discoveryQ = QuestionGenerator.generateDiscoveryQuestion(memory);

// Pregunta de calificación
const qualificationQ = QuestionGenerator.generateQualificationQuestion(
  memory,
  currentProduct
);

// Pregunta de cierre
const closingQ = QuestionGenerator.generateClosingQuestion(memory);

// Pregunta de seguimiento
const followUpQ = QuestionGenerator.generateFollowUpQuestion(
  memory,
  lastUserMessage
);
```

---

## 🐛 DEBUGGING

### Ver logs del orquestador
```bash
# Los logs se muestran en consola con prefijos:
# [Orchestrator] - Orquestador principal
# [FlowManager] - Gestor de flujo
# [ObjectionHandler] - Manejador de objeciones
# [QuestionGenerator] - Generador de preguntas
# [SearchAgent] - Agente de búsqueda
# [ProductAgent] - Agente de productos
# [PaymentAgent] - Agente de pagos
```

### Limpiar memoria de conversaciones
```typescript
import { SharedMemoryService } from '@/agents/shared-memory';

const memoryService = SharedMemoryService.getInstance();

// Limpiar una conversación específica
memoryService.clear(chatId);

// Limpiar todas las conversaciones antiguas
memoryService.cleanOldMemories();
```

---

## 📚 DOCUMENTACIÓN

### Documentos principales
- `SISTEMA_CONVERSACIONAL_COMPLETO_IMPLEMENTADO.md` - Documentación completa
- `ARQUITECTURA_AGENTES_ESPECIALIZADOS.md` - Arquitectura de agentes
- `SISTEMA_AGENTES_LISTO.md` - Sistema de agentes implementado

### Tests
- `scripts/test-sistema-conversacional-completo.ts` - Test completo
- `scripts/test-bot-24-7-complete.ts` - Test del bot 24/7

---

## 🎉 PRÓXIMOS PASOS

1. **Probar el sistema**:
   ```bash
   npx tsx scripts/test-sistema-conversacional-completo.ts
   ```

2. **Iniciar el bot**:
   ```bash
   npm run dev
   ```

3. **Conectar WhatsApp**:
   - Escanear QR
   - Enviar mensaje de prueba

4. **Monitorear conversaciones**:
   - Ver logs en consola
   - Verificar flujo conversacional
   - Revisar manejo de objeciones

5. **Ajustar según necesidad**:
   - Personalizar preguntas
   - Agregar más tipos de objeciones
   - Mejorar detección de intenciones

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] Sistema conversacional instalado
- [ ] Tests ejecutados exitosamente
- [ ] Bot iniciado y conectado
- [ ] WhatsApp funcionando
- [ ] Flujo conversacional probado
- [ ] Objeciones manejadas correctamente
- [ ] Preguntas generadas apropiadamente
- [ ] Memoria de conversaciones funcionando
- [ ] Logs claros y útiles
- [ ] Documentación revisada

---

## 🆘 SOPORTE

Si encuentras problemas:

1. Revisa los logs en consola
2. Verifica las variables de entorno
3. Ejecuta los tests para identificar el problema
4. Revisa la documentación completa
5. Contacta al equipo de desarrollo

---

**¡El sistema conversacional está listo para vender! 🚀**
