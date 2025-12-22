# 🎯 SISTEMA DE PREGUNTAS DE SEGUIMIENTO

## ¿Qué es?

Sistema inteligente que permite al bot responder preguntas de seguimiento usando el contexto de la conversación, sin necesidad de que el usuario repita el producto.

## ✅ Problema Resuelto

**ANTES:**
```
Usuario: "Megapack de Piano"
Bot: "El Megapack de Piano cuesta $20.000..."
Usuario: "más información"
Bot: "¿Sobre qué producto quieres más información?" ❌
```

**AHORA:**
```
Usuario: "Megapack de Piano"
Bot: "El Megapack de Piano cuesta $20.000..."
Usuario: "más información"
Bot: "El Megapack de Piano es un producto digital..." ✅
```

## 🎯 Tipos de Preguntas de Seguimiento Detectadas

### 1. Más Información
- "más información"
- "cuéntame más"
- "qué más"
- "más detalles"
- "dime más"
- "quiero saber más"

### 2. Métodos de Pago
- "métodos de pago"
- "cómo pago"
- "formas de pago"
- "puedo pagar con"
- "aceptan nequi"
- "tarjeta"

### 3. Confirmación
- "sí quiero"
- "lo compro"
- "proceder"
- "adelante"
- "ok"
- "dale"
- "listo"
- "me interesa"

### 4. Precio
- "cuánto cuesta"
- "precio"
- "valor"
- "cuánto es"
- "cuánto vale"
- "costo"

### 5. Especificaciones
- "especificaciones"
- "características"
- "qué incluye"
- "qué trae"
- "detalles técnicos"

### 6. Disponibilidad
- "disponible"
- "hay stock"
- "tienen"
- "cuándo llega"
- "en stock"

### 7. Entrega
- "entrega"
- "envío"
- "cuándo llega"
- "tiempo de entrega"
- "cómo lo recibo"

### 8. Garantía
- "garantía"
- "devolución"
- "cambio"
- "reembolso"

## 🔧 Cómo Funciona

### 1. Detección de Intención
```typescript
const followUpIntent = FollowUpIntentDetector.detect(userMessage)
// Retorna: { type: 'more_info', confidence: 0.9, needsContext: true }
```

### 2. Recuperación de Contexto
```typescript
const memory = ProfessionalConversationMemory.getMemory(conversationKey)
// Retorna el producto actual de la conversación
```

### 3. Generación de Respuesta Contextual
```typescript
const response = FollowUpIntentDetector.generateContextualResponse(
  followUpIntent,
  {
    productName: 'Megapack de Piano',
    productDetails: {
      price: 20000,
      category: 'Cursos',
      type: 'digital'
    }
  }
)
```

## 📊 Flujo de Procesamiento

```
1. Usuario envía mensaje
   ↓
2. Detectar si es pregunta de seguimiento
   ↓
3. ¿Es pregunta de seguimiento?
   ├─ SÍ → Buscar contexto en memoria
   │        ↓
   │        ¿Hay producto en contexto?
   │        ├─ SÍ → Generar respuesta contextual ✅
   │        └─ NO → Preguntar "¿sobre qué producto?"
   │
   └─ NO → Buscar producto normalmente
```

## 🎨 Ejemplos de Respuestas

### Más Información (Producto Digital)
```
📚 *Megapack de Piano "De Cero a Avanzado"* es un producto digital:

✅ Acceso inmediato después del pago
✅ Entrega automática por WhatsApp
✅ Disponible 24/7 (stock ilimitado)
✅ Acceso de por vida
💰 Precio: $20.000 COP

¿Te gustaría proceder con la compra? 😊
```

### Métodos de Pago
```
💳 *Métodos de pago disponibles para Megapack de Piano:*

1️⃣ Nequi
2️⃣ Daviplata
3️⃣ Tarjeta de crédito
4️⃣ PSE

💰 Precio: $20.000 COP

¿Con cuál prefieres pagar? 😊
```

### Precio
```
💰 *Precio de Megapack de Piano:*

💵 $20.000 COP

📲 Entrega inmediata por WhatsApp

¿Te interesa? 😊
```

### Disponibilidad (Producto Digital)
```
✅ *Megapack de Piano* está disponible ahora mismo!

🚀 Stock ilimitado (producto digital)
⚡ Acceso inmediato después del pago
📲 Entrega automática por WhatsApp

¿Quieres comprarlo? 😊
```

## 🧠 Memoria de Conversación

### Información Guardada
```typescript
{
  lastProductId: "prod_123",
  lastProductName: "Megapack de Piano",
  lastMentionedAt: Date,
  messageCount: 5,
  lastIntent: "product_search",
  lastAction: "product_shown",
  conversationHistory: [
    { role: 'user', message: '...', intent: '...', timestamp: Date },
    { role: 'bot', message: '...', intent: '...', timestamp: Date }
  ],
  productDetails: {
    price: 20000,
    category: "Cursos",
    type: "digital",
    paymentMethods: ["Nequi", "Daviplata"]
  }
}
```

### Duración de la Memoria
- **Tiempo máximo:** 30 minutos
- **Renovación:** Cada mensaje renueva el tiempo
- **Limpieza:** Automática cada 5 minutos

## 🚀 Cómo Probar

### 1. Ejecutar Test Automatizado
```bash
npx tsx scripts/test-preguntas-seguimiento.ts
```

### 2. Prueba Manual en WhatsApp
```
1. Envía: "Megapack de Piano"
2. Espera respuesta del bot
3. Envía: "más información"
4. Verifica que responda sobre el Piano (no pregunta "¿de qué?")
5. Envía: "métodos de pago"
6. Verifica que muestre métodos para el Piano
7. Envía: "cuánto cuesta"
8. Verifica que muestre el precio del Piano
```

## 📝 Reglas de Implementación

### ✅ Hacer
1. Detectar pregunta de seguimiento ANTES de buscar producto
2. Usar contexto si existe
3. Actualizar contexto cuando cambia el producto
4. Incluir precio en cada respuesta
5. Terminar con pregunta para continuar

### ❌ No Hacer
1. Preguntar "¿de qué producto?" si hay contexto
2. Buscar producto nuevo si es pregunta de seguimiento
3. Ignorar el contexto de conversación
4. Responder sin incluir el precio
5. Dejar la conversación sin continuación

## 🔍 Debugging

### Ver Memoria Actual
```typescript
const memory = ProfessionalConversationMemory.getMemory(conversationKey)
console.log('Producto actual:', memory?.currentProduct?.name)
```

### Ver Historial de Conversación
```typescript
console.log('Historial:', memory?.conversationHistory)
```

### Ver Intenciones Detectadas
```typescript
console.log('Intenciones:', memory?.state.intentions)
```

## 📊 Métricas

### Confianza de Detección
- **Alta (0.9):** Patrón exacto encontrado
- **Media (0.7):** Mensaje corto que parece seguimiento
- **Baja (0.0):** No es pregunta de seguimiento

### Uso de Contexto
- **Exitoso:** Respuesta generada con contexto
- **Fallido:** No hay contexto, pregunta al usuario

## 🎯 Beneficios

1. **Conversación Natural:** El bot entiende el contexto
2. **Menos Fricción:** Usuario no repite información
3. **Más Ventas:** Proceso de compra más fluido
4. **Mejor UX:** Experiencia más humana
5. **Menos Confusión:** Respuestas directas y claras

## 🔄 Integración con Otros Sistemas

### Bot 24/7 Orchestrator
- Detecta seguimiento antes de buscar producto
- Usa memoria profesional para contexto
- Registra interacciones para aprendizaje

### Training Service
- Aprende de interacciones exitosas
- Mejora detección con el tiempo
- Genera respuestas más precisas

### Neural Learning
- Registra patrones de seguimiento
- Mejora confianza de detección
- Adapta respuestas al usuario

## 📚 Archivos Relacionados

- `src/lib/follow-up-intent-detector.ts` - Detector de intenciones
- `src/lib/conversation-context-service.ts` - Servicio de contexto
- `src/lib/bot-24-7-orchestrator.ts` - Orquestador principal
- `data/entrenamiento-preguntas-seguimiento.json` - Datos de entrenamiento
- `scripts/test-preguntas-seguimiento.ts` - Script de prueba

## ✅ Checklist de Verificación

- [ ] Bot detecta "más información" correctamente
- [ ] Bot usa contexto del producto anterior
- [ ] Bot responde "métodos de pago" con producto correcto
- [ ] Bot maneja "cuánto cuesta" sin preguntar "¿de qué?"
- [ ] Bot actualiza contexto cuando cambia producto
- [ ] Memoria se mantiene por 30 minutos
- [ ] Memoria se limpia automáticamente
- [ ] Test automatizado pasa exitosamente

## 🎉 Resultado Final

El bot ahora puede mantener conversaciones naturales donde el usuario puede hacer preguntas de seguimiento sin tener que repetir el producto cada vez. Esto hace que la experiencia sea mucho más fluida y profesional.

**Ejemplo de conversación completa:**
```
Usuario: "Megapack de Piano"
Bot: "El Megapack de Piano cuesta $20.000..."

Usuario: "más información"
Bot: "Es un producto digital con acceso inmediato..."

Usuario: "métodos de pago"
Bot: "Puedes pagar con Nequi, Daviplata..."

Usuario: "cuánto cuesta"
Bot: "El Megapack de Piano cuesta $20.000 COP"

Usuario: "sí quiero"
Bot: "¡Excelente! Aquí está tu resumen..."
```

¡Todo sin que el usuario tenga que repetir "Megapack de Piano" en cada mensaje! 🎉
