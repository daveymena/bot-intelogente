# 🔗 Integración de Base de Conocimiento con AI Service

## 📋 Cómo Integrar

Para que el bot use automáticamente la base de conocimiento en las conversaciones, sigue estos pasos:

## 1️⃣ Importar los Servicios

En `src/lib/ai-service.ts`, agrega estas importaciones:

```typescript
import { KnowledgeEnhancedAI } from './knowledge-enhanced-ai';
import { IntelligentAdvisorService } from './intelligent-advisor-service';
```

## 2️⃣ Enriquecer Contexto con Conocimiento

Después de buscar productos relevantes, agrega:

```typescript
// Buscar productos relevantes
const relevantProducts = await ProductIntelligenceService.findRelevantProducts(
  userId,
  customerMessage
);

// 🧠 ENRIQUECER CON BASE DE CONOCIMIENTO
let knowledgeContext = '';
if (relevantProducts.length > 0) {
  const productIds = relevantProducts.map(p => p.id);
  
  // Intentar respuesta directa desde base de conocimiento
  const directResponse = await KnowledgeEnhancedAI.generateKnowledgeBasedResponse(
    productIds,
    customerMessage
  );
  
  if (directResponse) {
    console.log('[AI] ✅ Usando respuesta desde base de conocimiento');
    return {
      message: directResponse,
      confidence: 0.95,
      intent: 'product_info'
    };
  }
  
  // Si no hay respuesta directa, enriquecer contexto
  knowledgeContext = await KnowledgeEnhancedAI.enrichContextWithKnowledge(
    productIds,
    customerMessage
  );
}
```

## 3️⃣ Agregar Conocimiento al Prompt

En el prompt del sistema, agrega el contexto de conocimiento:

```typescript
const systemPrompt = `
${BOT_RULES}

${knowledgeContext}

${productContext}

... resto del prompt
`;
```

## 4️⃣ Ejemplo Completo de Integración

```typescript
static async generateResponse(
  userId: string,
  customerMessage: string,
  customerPhone: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<AIResponse> {
  try {
    console.log(`[AI] Generando respuesta para: "${customerMessage}"`);

    // Cargar historial
    const fullHistory = await this.loadFullConversationHistory(userId, customerPhone);
    
    // Buscar productos relevantes
    const relevantProducts = await ProductIntelligenceService.findRelevantProducts(
      userId,
      customerMessage
    );

    // 🧠 INTEGRACIÓN DE BASE DE CONOCIMIENTO
    let knowledgeContext = '';
    
    if (relevantProducts.length > 0) {
      const productIds = relevantProducts.map(p => p.id);
      
      // Verificar si debe usar respuesta directa de conocimiento
      if (KnowledgeEnhancedAI.shouldUseKnowledgeBase(customerMessage)) {
        const directResponse = await IntelligentAdvisorService.generateAdvisoryResponse(
          productIds,
          customerMessage,
          fullHistory.map(h => h.content).join('\n')
        );
        
        if (directResponse && directResponse.length > 50) {
          console.log('[AI] ✅ Respuesta directa desde base de conocimiento');
          return {
            message: directResponse,
            confidence: 0.95,
            intent: 'product_advisory',
            productMentioned: relevantProducts[0].name
          };
        }
      }
      
      // Enriquecer contexto para la IA
      knowledgeContext = await KnowledgeEnhancedAI.generateKnowledgeInstructions(
        productIds,
        customerMessage
      );
      
      console.log('[AI] 🧠 Contexto enriquecido con base de conocimiento');
    }

    // Construir prompt con conocimiento
    const systemPrompt = `
${BOT_RULES}

${knowledgeContext}

${productContext}

IMPORTANTE: Si hay información de productos arriba, úsala EXACTAMENTE como está.
NO inventes precios, características o detalles que no estén en la información proporcionada.
`;

    // Continuar con generación normal de IA...
    const messages = [
      { role: 'system', content: systemPrompt },
      ...fullHistory,
      { role: 'user', content: customerMessage }
    ];

    // Llamar a la IA...
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    });

    return {
      message: response.choices[0].message.content || '',
      confidence: 0.9,
      intent: 'general'
    };

  } catch (error) {
    console.error('[AI] Error:', error);
    throw error;
  }
}
```

## 5️⃣ Configuración de Prioridades

El sistema debe seguir este orden:

```
1. Detectar escalamiento a humano (máxima prioridad)
2. Detectar saludos
3. Buscar productos relevantes
4. 🧠 Intentar respuesta desde base de conocimiento
5. 🧠 Enriquecer contexto con conocimiento
6. Generar respuesta con IA
7. Aplicar personalidad y formato
```

## 6️⃣ Logs para Debugging

Agrega estos logs para monitorear:

```typescript
console.log('[Knowledge] 🧠 Productos encontrados:', productIds.length);
console.log('[Knowledge] 🎯 Tipo de pregunta:', questionType);
console.log('[Knowledge] ✅ Respuesta directa:', !!directResponse);
console.log('[Knowledge] 📝 Contexto enriquecido:', knowledgeContext.length, 'chars');
```

## 7️⃣ Manejo de Errores

```typescript
try {
  const directResponse = await IntelligentAdvisorService.generateAdvisoryResponse(
    productIds,
    customerMessage
  );
  
  if (directResponse) {
    return { message: directResponse, confidence: 0.95 };
  }
} catch (error) {
  console.error('[Knowledge] ❌ Error en asesoría:', error);
  // Continuar con flujo normal de IA
}
```

## 8️⃣ Variables de Entorno (Opcional)

Puedes agregar configuración:

```env
# Base de Conocimiento
KNOWLEDGE_BASE_ENABLED=true
KNOWLEDGE_DIRECT_RESPONSE=true
KNOWLEDGE_ENRICH_CONTEXT=true
```

Y usarlas:

```typescript
const USE_KNOWLEDGE_BASE = process.env.KNOWLEDGE_BASE_ENABLED === 'true';
const USE_DIRECT_RESPONSE = process.env.KNOWLEDGE_DIRECT_RESPONSE === 'true';
```

## 9️⃣ Verificar Integración

Después de integrar, prueba con:

```bash
# Iniciar el bot
npm run dev

# En WhatsApp, envía:
"¿Qué incluye el Mega Pack 01?"
"¿Cuánto cuesta el curso de piano?"
"¿Los papeles de la moto están al día?"
```

Deberías ver en los logs:

```
[Knowledge] 🧠 Productos encontrados: 1
[Knowledge] 🎯 Tipo de pregunta: FEATURES
[Knowledge] ✅ Respuesta directa: true
[AI] ✅ Respuesta directa desde base de conocimiento
```

## 🎯 Beneficios de la Integración

✅ **Respuestas más precisas** - Usa información real
✅ **Menos alucinaciones** - No inventa datos
✅ **Respuestas más rápidas** - Respuesta directa sin IA
✅ **Mejor conversión** - Información detallada y confiable
✅ **Escalable** - Funciona con productos nuevos automáticamente

## 📊 Flujo Completo

```
Cliente pregunta sobre producto
    ↓
Buscar productos relevantes
    ↓
¿Pregunta específica? (precio, características, etc.)
    ↓ Sí
Generar respuesta directa desde conocimiento
    ↓
Enviar al cliente
    
    ↓ No
Enriquecer contexto con conocimiento
    ↓
Generar respuesta con IA + contexto
    ↓
Enviar al cliente
```

## ✅ Checklist de Integración

- [ ] Importar servicios de conocimiento
- [ ] Agregar detección de productos relevantes
- [ ] Implementar respuesta directa desde conocimiento
- [ ] Enriquecer contexto para IA
- [ ] Agregar logs de debugging
- [ ] Probar con diferentes tipos de preguntas
- [ ] Verificar que no inventa información
- [ ] Documentar cambios

## 🔧 Troubleshooting

### El bot no usa la base de conocimiento
- Verifica que los servicios estén importados
- Revisa los logs con `[Knowledge]`
- Asegúrate de que `base-conocimiento-productos.json` existe

### Respuestas genéricas
- Verifica que los productos se estén encontrando
- Revisa que el contexto se esté enriqueciendo
- Chequea los logs de `ProductIntelligenceService`

### Errores al generar conocimiento
- Verifica la conexión a la base de datos
- Asegúrate de que los productos existen
- Revisa los logs de error

## 📝 Notas Importantes

1. La base de conocimiento se genera **automáticamente** para productos nuevos
2. No necesitas regenerar el conocimiento cada vez
3. El sistema usa el precio **actual** de la base de datos
4. Las respuestas se adaptan al **tipo de producto** (digital/físico)
5. El conocimiento se **actualiza** automáticamente al consultar

---

**Próximo paso**: Integrar en `src/lib/ai-service.ts` siguiendo estos pasos
**Documentación completa**: Ver `SISTEMA_BASE_CONOCIMIENTO.md`
