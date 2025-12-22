# 🤖 Sistema Híbrido: Bot Local + Ollama Assistant

## 🎯 Concepto

**Ollama como asistente inteligente del bot local** para:
1. ⚡ **Bot Local**: Respuestas instantáneas predefinidas (gratis)
2. 🧠 **Ollama**: Interpretación inteligente y contexto (cuando se necesita)

## 🔄 Flujo de Funcionamiento

```
Cliente envía mensaje
        ↓
┌───────────────────┐
│   Bot Local       │ ← Intenta responder primero (instantáneo)
│   (Reglas)        │
└───────────────────┘
        ↓
    ¿Sabe responder?
        ↓
    NO  │  SÍ → Respuesta inmediata ✅
        ↓
┌───────────────────┐
│ Ollama Assistant  │ ← Analiza intención (23s)
│ (Inteligencia)    │
└───────────────────┘
        ↓
┌───────────────────┐
│ Memoria/Contexto  │ ← Guarda conversación
└───────────────────┘
        ↓
┌───────────────────┐
│ Búsqueda Productos│ ← Si es necesario
└───────────────────┘
        ↓
┌───────────────────┐
│ Respuesta Final   │ ← Inteligente y contextual
└───────────────────┘
```

## ✨ Características

### Bot Local (Instantáneo)
- ✅ Saludos y despedidas
- ✅ Agradecimientos
- ✅ Métodos de pago
- ✅ Información de envío
- ✅ Preguntas frecuentes
- ⚡ **Tiempo**: < 100ms
- 💰 **Costo**: $0

### Ollama Assistant (Inteligente)
- 🧠 Interpretación de intenciones complejas
- 💾 Memoria conversacional (24 horas)
- 🎯 Extracción de entidades (producto, precio, categoría)
- 🔍 Análisis de contexto
- 💬 Respuestas naturales y personalizadas
- ⏱️ **Tiempo**: ~23s
- 💰 **Costo**: Gratis (servidor propio)

## 📊 Ejemplos de Uso

### Ejemplo 1: Saludo (Bot Local)
```
Cliente: "Hola"
Bot Local: ✅ Responde instantáneamente
Respuesta: "¡Hola! 👋 Bienvenido a Tecnovariedades D&S..."
Tiempo: 50ms
```

### Ejemplo 2: Consulta Simple (Bot Local)
```
Cliente: "¿Cómo puedo pagar?"
Bot Local: ✅ Responde con info predefinida
Respuesta: "Aceptamos varios métodos de pago:
💳 Tarjetas de crédito/débito
💰 Nequi y Daviplata..."
Tiempo: 80ms
```

### Ejemplo 3: Búsqueda Compleja (Ollama)
```
Cliente: "Necesito una laptop para diseño gráfico"
Bot Local: ❌ No tiene respuesta predefinida
Ollama: 🧠 Analiza intención
  - Intent: buscar_producto
  - Entities: { product: "laptop", category: "computadores" }
  - Busca productos en BD
  - Genera respuesta personalizada
Respuesta: "¡Perfecto! Para diseño gráfico te recomiendo..."
Tiempo: 23s
```

### Ejemplo 4: Contexto (Ollama)
```
Cliente: "Busco un computador económico"
Ollama: 💾 Guarda: budget=500000, product=computador

Cliente: "¿Y ese cuánto cuesta?"
Ollama: 🧠 Usa contexto previo
  - Recuerda que habló de computador
  - Responde sobre el producto mencionado
Respuesta: "El computador que te mencioné cuesta..."
Tiempo: 20s
```

## 🛠️ Implementación

### 1. Servicios Creados

#### `ollama-assistant-service.ts`
Funciones principales:
- `analyzeIntent()` - Analiza intención del mensaje
- `saveContext()` - Guarda memoria conversacional
- `getContext()` - Recupera contexto del cliente
- `generateIntelligentResponse()` - Genera respuesta IA
- `extractInformation()` - Extrae presupuesto, preferencias

#### `hybrid-bot-service.ts`
Sistema completo:
- `processMessage()` - Método principal
- Detecta intención local primero
- Usa Ollama si es necesario
- Mantiene memoria y contexto

### 2. Uso en tu Bot

```typescript
import { HybridBotService } from '@/lib/hybrid-bot-service';

// En tu handler de mensajes de WhatsApp
async function handleIncomingMessage(message: string, phone: string) {
  const response = await HybridBotService.processMessage(
    message,
    phone,
    userId
  );

  console.log('Fuente:', response.source); // 'local' o 'ollama' o 'hybrid'
  console.log('Confianza:', response.confidence);
  console.log('Intención:', response.intent);

  // Enviar respuesta al cliente
  await sendWhatsAppMessage(phone, response.message);

  // Si necesita escalamiento humano
  if (response.needsHumanEscalation) {
    await notifyHuman(phone, message);
  }
}
```

### 3. Configuración en .env

```env
# Ollama Assistant
OLLAMA_BASE_URL=https://davey-ollama.mapf5v.easypanel.host
OLLAMA_MODEL=llama3:latest
OLLAMA_ENABLED=true

# Sistema Híbrido
HYBRID_SYSTEM_ENABLED=true
LOCAL_RESPONSE_PRIORITY=true
```

## 📈 Ventajas del Sistema

### 1. Velocidad Optimizada
- 60% de consultas respondidas instantáneamente (bot local)
- 40% requieren análisis inteligente (Ollama)
- Tiempo promedio: ~10s (vs 23s si todo fuera IA)

### 2. Costo Optimizado
- Bot local: $0 (respuestas predefinidas)
- Ollama: $0 (servidor propio en Easypanel)
- Sin límites de uso ni tokens

### 3. Inteligencia Contextual
- Memoria de 24 horas por cliente
- Entiende referencias ("ese", "el anterior")
- Aprende preferencias del cliente

### 4. Fallback Automático
- Si Ollama falla → Bot local responde
- Nunca deja al cliente sin respuesta
- Sistema resiliente

## 🧪 Probar el Sistema

### Test Rápido
```bash
npx tsx test-bot-hibrido.ts
```

Este test demuestra:
- ✅ Respuestas locales instantáneas
- ✅ Análisis inteligente con Ollama
- ✅ Memoria y contexto funcionando
- ✅ Búsqueda de productos integrada
- ✅ Tiempos de respuesta reales

### Test Manual
```typescript
import { HybridBotService } from './src/lib/hybrid-bot-service';

// Test 1: Saludo (local)
const r1 = await HybridBotService.processMessage('Hola', '+573001234567');
console.log(r1.source); // 'local'

// Test 2: Búsqueda (ollama)
const r2 = await HybridBotService.processMessage(
  'Necesito una laptop para diseño',
  '+573001234567'
);
console.log(r2.source); // 'hybrid' o 'ollama'
```

## 📊 Estadísticas Esperadas

### Distribución de Respuestas
- **60% Bot Local**: Saludos, FAQ, info básica
- **30% Ollama**: Búsquedas, consultas complejas
- **10% Híbrido**: Búsqueda + respuesta inteligente

### Tiempos de Respuesta
- **Bot Local**: 50-100ms (instantáneo)
- **Ollama Simple**: 15-20s (análisis de intención)
- **Ollama Completo**: 20-25s (búsqueda + respuesta)

### Satisfacción del Cliente
- ✅ Respuestas rápidas para consultas simples
- ✅ Respuestas inteligentes para consultas complejas
- ✅ Conversación natural y contextual
- ✅ Sin límites ni costos adicionales

## 🎯 Casos de Uso Ideales

### Bot Local Responde
- "Hola", "Buenos días"
- "Gracias", "Muchas gracias"
- "¿Cómo puedo pagar?"
- "¿Hacen envíos?"
- "Adiós", "Hasta luego"

### Ollama Responde
- "Busco una laptop para diseño gráfico"
- "Necesito algo económico pero bueno"
- "¿Ese cuánto cuesta?" (con contexto)
- "Quiero comparar estos dos productos"
- "¿Cuál me recomiendas para mi presupuesto?"

## 🔧 Personalización

### Agregar Respuestas Locales
Edita `hybrid-bot-service.ts`:

```typescript
private static localResponses = {
  // Agregar nuevas respuestas
  horarios: `Nuestro horario de atención:
📅 Lunes a Viernes: 8am - 6pm
📅 Sábados: 9am - 2pm
📅 Domingos: Cerrado`,
  
  ubicacion: `Estamos ubicados en:
📍 Calle 123 #45-67, Bogotá
🗺️ Ver en Google Maps: [link]`
};
```

### Ajustar Timeouts
```typescript
// En ollama-assistant-service.ts
private static timeout = 30000; // 30 segundos
```

### Configurar Memoria
```typescript
// Mantener últimos N mensajes
if (context.conversationHistory.length > 20) {
  context.conversationHistory = context.conversationHistory.slice(-20);
}
```

## 📝 Mejores Prácticas

1. **Priorizar Bot Local**
   - Agregar respuestas predefinidas para consultas frecuentes
   - Más rápido y sin costo

2. **Usar Ollama para Complejidad**
   - Búsquedas de productos
   - Análisis de requisitos
   - Recomendaciones personalizadas

3. **Mantener Contexto**
   - Guardar cada interacción
   - Usar contexto en respuestas siguientes

4. **Monitorear Rendimiento**
   - Medir tiempos de respuesta
   - Ajustar distribución local/ollama

## 🚀 Próximos Pasos

1. ✅ Probar el sistema: `npx tsx test-bot-hibrido.ts`
2. ✅ Integrar en tu bot de WhatsApp
3. ✅ Agregar más respuestas locales
4. ✅ Monitorear y optimizar

---

**Sistema**: Bot Local + Ollama Assistant  
**Estado**: ✅ Listo para usar  
**Ventaja**: Lo mejor de ambos mundos (velocidad + inteligencia)
