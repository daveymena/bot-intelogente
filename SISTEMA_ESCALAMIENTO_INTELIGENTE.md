# 🚀 SISTEMA DE ESCALAMIENTO INTELIGENTE

## 🎯 Objetivo

Crear un bot que pueda manejar **CUALQUIER** pregunta del cliente con un sistema de 3 niveles:

1. **Nivel 1:** Plantillas locales (rápido, gratis, 80% de casos)
2. **Nivel 2:** IA (Groq/Ollama) para casos complejos (15% de casos)
3. **Nivel 3:** Escalamiento a humano (5% de casos)

## 📊 Flujo de Decisión

```
Cliente envía mensaje
    ↓
┌─────────────────────────────────────┐
│ NIVEL 1: Plantillas Locales        │
│ - Saludos                           │
│ - Productos específicos             │
│ - Métodos de pago                   │
│ - Preguntas frecuentes              │
└─────────────────────────────────────┘
    ↓ ¿Confianza > 70%?
    ├─ SÍ → Responder
    └─ NO ↓
┌─────────────────────────────────────┐
│ NIVEL 2: IA (Groq/Ollama)          │
│ - Búsquedas complejas               │
│ - Comparaciones                     │
│ - Recomendaciones personalizadas    │
│ - Lenguaje coloquial                │
└─────────────────────────────────────┘
    ↓ ¿Confianza > 50%?
    ├─ SÍ → Responder
    └─ NO ↓
┌─────────────────────────────────────┐
│ NIVEL 3: Escalamiento a Humano     │
│ - Cliente pide hablar con persona   │
│ - Confianza < 50%                   │
│ - No se encontró información        │
│ - Consulta muy compleja             │
└─────────────────────────────────────┘
    ↓
Conectar con asesor: 3136174267
```

## 🔍 Criterios de Escalamiento

### Escalamiento Inmediato (100% confianza):
- Cliente dice: "quiero hablar con alguien"
- Cliente dice: "necesito un asesor"
- Cliente dice: "no me ayudas"
- Cliente dice: "hablar con una persona"

### Escalamiento por Baja Confianza:
- Confianza < 40% → Escalar
- Confianza < 50% + No encontró productos → Escalar
- Confianza < 60% + Consulta compleja → Escalar

### Escalamiento por Contexto:
- Bot pide aclaración 2+ veces seguidas → Escalar
- Cliente repite la misma pregunta 3+ veces → Escalar
- Bot responde "no encontré" 2+ veces → Escalar

## 💬 Mensajes de Escalamiento

### Opción 1: Formal
```
👨‍💼 *Te conecto con un asesor humano*

Entiendo que necesitas ayuda más personalizada.
Un asesor experto te atenderá de inmediato.

📱 *Contacta directamente:*
WhatsApp: 3136174267

O espera un momento, te contactaremos enseguida. ⏱️
```

### Opción 2: Amigable
```
🤝 *Déjame conectarte con nuestro equipo*

Para brindarte la mejor atención, te paso con un asesor
que podrá ayudarte de forma personalizada.

📞 *Llama o escribe:*
3136174267

¡Estamos aquí para ayudarte! 😊
```

### Opción 3: Directa
```
💬 *Asesoría personalizada disponible*

Veo que necesitas ayuda especializada.
Nuestro equipo está listo para atenderte.

📱 *Contacto directo:*
WhatsApp: 3136174267

Respuesta inmediata garantizada ⚡
```

## 🎯 Casos de Uso

### Caso 1: Pregunta Simple
```
Cliente: "Curso de piano"
Bot: [Plantilla local] → Muestra curso
Nivel: 1 | Confianza: 95% | No escala
```

### Caso 2: Pregunta Compleja
```
Cliente: "Necesito laptop gaming barata"
Bot: [Plantilla local] → Confianza: 40%
Bot: [Intenta con IA] → Busca laptops gaming
Bot: [Responde con productos] → Confianza: 75%
Nivel: 2 | No escala
```

### Caso 3: No Encuentra Respuesta
```
Cliente: "Tienen cursos de cocina molecular?"
Bot: [Plantilla local] → No encuentra
Bot: [Intenta con IA] → No encuentra
Bot: [Confianza: 30%] → ESCALA
Bot: "Te conecto con un asesor..."
Nivel: 3 | Escala a humano
```

### Caso 4: Cliente Pide Humano
```
Cliente: "Quiero hablar con alguien"
Bot: [Detecta keyword] → ESCALA INMEDIATO
Bot: "Te conecto con un asesor..."
Nivel: 3 | Escala a humano
```

### Caso 5: Comparación Compleja
```
Cliente: "Qué es mejor, piano o guitarra?"
Bot: [Plantilla local] → Confianza: 50%
Bot: [Intenta con IA] → Genera comparación
Bot: [Responde] → Confianza: 70%
Nivel: 2 | No escala
```

## 📊 Métricas de Éxito

### Objetivo:
- **80%** resuelto con plantillas locales (Nivel 1)
- **15%** resuelto con IA (Nivel 2)
- **5%** escalado a humano (Nivel 3)

### KPIs:
- Tiempo promedio de respuesta < 2 segundos
- Satisfacción del cliente > 85%
- Tasa de escalamiento < 10%
- Resolución en primer contacto > 75%

## 🔧 Implementación

### Archivo: `src/lib/intelligent-escalation-system.ts`
- ✅ Creado
- Funciones:
  - `shouldEscalateToHuman()` - Evalúa si escalar
  - `generateEscalationMessage()` - Genera mensaje
  - `generateWhatsAppLink()` - Link directo a WhatsApp
  - `isResponseSatisfactory()` - Valida respuesta
  - `logEscalation()` - Registra para analytics

### Integración en `plantillas-respuestas-bot.ts`:
```typescript
// Después de generar respuesta
const escalation = IntelligentEscalationSystem.shouldEscalateToHuman(
  userMessage,
  response,
  confidence,
  ['local', 'ai']
);

if (escalation.shouldEscalate) {
  return IntelligentEscalationSystem.generateEscalationMessage(
    escalation.reason
  );
}

return response;
```

### Integración en `baileys-stable-service.ts`:
```typescript
// En setupMessageHandler
const response = await SmartResponseEngine.analyzeIntent(...);

// Verificar si debe escalar
if (response.shouldEscalate) {
  await socket.sendMessage(from, {
    text: response.escalationMessage
  });
  return;
}

// Continuar con respuesta normal
```

## 🎯 Próximos Pasos

1. ✅ Crear sistema de escalamiento
2. ⏳ Integrar en flujo de respuestas
3. ⏳ Probar con casos reales
4. ⏳ Ajustar umbrales de confianza
5. ⏳ Implementar analytics de escalamiento

## ✅ Beneficios

- ✅ Bot puede manejar CUALQUIER pregunta
- ✅ No deja al cliente sin respuesta
- ✅ Escalamiento automático e inteligente
- ✅ Experiencia de usuario mejorada
- ✅ Reduce frustración del cliente
- ✅ Aumenta tasa de conversión

## 🚀 Resultado Final

Un bot que:
- Responde rápido a preguntas simples
- Usa IA para casos complejos
- Escala a humano cuando es necesario
- **NUNCA deja al cliente sin ayuda**
