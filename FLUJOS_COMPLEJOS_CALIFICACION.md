# 🎯 FLUJOS COMPLEJOS: CALIFICACIÓN Y ANUNCIOS

## 📋 ESCENARIOS COMPLEJOS

### Escenario 1: Búsqueda Genérica (Calificación)
Cliente pregunta por categoría sin especificar → Bot califica necesidades

### Escenario 2: Producto de Anuncio
Cliente viene de Facebook/Instagram con producto específico → Bot muestra ese producto

---

## 🔄 ESCENARIO 1: BÚSQUEDA GENÉRICA CON CALIFICACIÓN

### Flujo Completo:

```
👤 Cliente: "Busco un PC"
        ↓
🤖 IA detecta: Búsqueda genérica sin especificaciones
        ↓
🎯 Acción: qualify_customer (nueva acción)
        ↓
🤖 Bot: "¡Perfecto! Para recomendarte el PC ideal, cuéntame:
        
        ¿Para qué lo vas a usar principalmente?
        
        1️⃣ Trabajo de oficina (Word, Excel, navegación)
        2️⃣ Diseño gráfico o edición de video
        3️⃣ Gaming o juegos
        4️⃣ Programación o desarrollo
        5️⃣ Uso básico (redes sociales, videos)"
        ↓
👤 Cliente: "Para diseño gráfico"
        ↓
🤖 IA detecta: Respuesta de calificación
        ↓
🎯 Acción: search_qualified_products
        ↓
🔍 Sistema busca: PCs con RAM ≥ 16GB, SSD, pantalla FHD+
        ↓
🤖 Bot: "¡Genial! Para diseño gráfico te recomiendo estos PCs:
        
        1️⃣ **Asus Vivobook 15**
           💰 $2,500,000 COP
           ✨ RAM: 16GB, SSD: 512GB
           🖥️ Pantalla: 15.6" FHD
           
        2️⃣ **Lenovo IdeaPad 3**
           💰 $2,200,000 COP
           ✨ RAM: 16GB, SSD: 256GB
           🖥️ Pantalla: 15.6" FHD
           
        ¿Cuál te interesa más? 😊"
        ↓
👤 Cliente: "El Asus"
        ↓
🧠 Memoria: Guarda Asus Vivobook 15
        ↓
🤖 Bot: [Continúa con flujo normal de venta]
```

---

## 📱 ESCENARIO 2: PRODUCTO DE ANUNCIO

### Flujo Completo:

```
👤 Cliente: "Vi el Asus Vivobook en Facebook, ¿está disponible?"
        ↓
🤖 IA detecta: Mención de producto específico + origen (Facebook)
        ↓
🎯 Acción: search_product (con contexto de anuncio)
        ↓
🔍 Sistema busca: "Asus Vivobook"
        ↓
✅ Encuentra: Asus Vivobook 15 X1502va
        ↓
🧠 Memoria: Guarda producto + origen (Facebook)
        ↓
🤖 Bot: "¡Sí! El **Asus Vivobook 15** que viste en Facebook está disponible 🎉
        
        📦 **Asus Vivobook 15 X1502va**
        💰 **Precio:** $2,500,000 COP
        
        ✨ **Características:**
        • Procesador: Intel Core i7-13620H
        • RAM: 16GB DDR4
        • Almacenamiento: 512GB SSD
        • Pantalla: 15.6" FHD IPS
        • Sistema: Windows 11
        
        ✅ **Disponible para entrega inmediata**
        
        ¿Te gustaría comprarlo o necesitas más información? 😊"
        ↓
👤 Cliente: "¿Cuánto es el envío?"
        ↓
🤖 IA: answer_question (con contexto del producto)
        ↓
🤖 Bot: "El envío del **Asus Vivobook 15** depende de tu ciudad:
        
        🏙️ **Bogotá:** $15,000 (1-2 días)
        🌆 **Ciudades principales:** $20,000 (2-4 días)
        🏘️ **Otras ciudades:** $25,000 (3-5 días)
        
        ¿A qué ciudad lo necesitas? 📍"
```

---

## 🎓 SISTEMA DE ENTRENAMIENTO

### Captura Automática de Conversaciones

Cada conversación exitosa se guarda para entrenar el LLM:

```typescript
interface TrainingConversation {
  id: string;
  scenario: 'generic_search' | 'ad_referral' | 'direct_product' | 'payment';
  product: {
    id: string;
    name: string;
    category: string;
  };
  messages: Array<{
    role: 'customer' | 'bot';
    message: string;
    action?: string;
    timestamp: Date;
  }>;
  outcome: 'sale' | 'abandoned' | 'pending';
  qualificationData?: {
    useCase: string;
    budget?: number;
    preferences: string[];
  };
  metadata: {
    source?: 'facebook' | 'instagram' | 'whatsapp' | 'direct';
    duration: number;
    messagesCount: number;
  };
}
```

### Ejemplo de Conversación Guardada:

```json
{
  "id": "conv-2024-001",
  "scenario": "generic_search",
  "product": {
    "id": "asus-vivobook-15",
    "name": "Asus Vivobook 15 X1502va",
    "category": "PHYSICAL"
  },
  "messages": [
    {
      "role": "customer",
      "message": "Busco un PC",
      "timestamp": "2024-01-15T10:00:00Z"
    },
    {
      "role": "bot",
      "message": "¡Perfecto! Para recomendarte el PC ideal...",
      "action": "qualify_customer",
      "timestamp": "2024-01-15T10:00:03Z"
    },
    {
      "role": "customer",
      "message": "Para diseño gráfico",
      "timestamp": "2024-01-15T10:00:30Z"
    },
    {
      "role": "bot",
      "message": "¡Genial! Para diseño gráfico te recomiendo...",
      "action": "search_qualified_products",
      "timestamp": "2024-01-15T10:00:35Z"
    }
  ],
  "outcome": "sale",
  "qualificationData": {
    "useCase": "diseño gráfico",
    "preferences": ["RAM alta", "pantalla FHD", "SSD"]
  },
  "metadata": {
    "duration": 180,
    "messagesCount": 8
  }
}
```

---

## 🔧 IMPLEMENTACIÓN

### 1. Nueva Acción: qualify_customer

```typescript
// En ai-action-orchestrator.ts

export interface AIAction {
  action: 
    | 'generate_payment_links'
    | 'search_product'
    | 'answer_question'
    | 'send_photo'
    | 'list_products'
    | 'share_catalog'
    | 'qualify_customer'        // ✨ NUEVA
    | 'search_qualified_products'; // ✨ NUEVA
  confidence: number;
  reasoning: string;
  parameters?: any;
}
```

### 2. Detección de Búsqueda Genérica

```typescript
// IA detecta búsqueda genérica
const genericSearchPatterns = [
  'busco un pc',
  'necesito una laptop',
  'quiero comprar un computador',
  'busco una moto',
  'necesito un curso'
];

// Si detecta búsqueda genérica → qualify_customer
if (isGenericSearch && !hasSpecifications) {
  return {
    action: 'qualify_customer',
    confidence: 0.95,
    reasoning: 'Búsqueda genérica sin especificaciones, necesita calificación'
  };
}
```

### 3. Preguntas de Calificación por Categoría

```typescript
const qualificationQuestions = {
  'laptop': {
    question: `¡Perfecto! Para recomendarte el PC ideal, cuéntame:

¿Para qué lo vas a usar principalmente?

1️⃣ Trabajo de oficina (Word, Excel, navegación)
2️⃣ Diseño gráfico o edición de video
3️⃣ Gaming o juegos
4️⃣ Programación o desarrollo
5️⃣ Uso básico (redes sociales, videos)`,
    
    filters: {
      'oficina': { ram: '>=8', storage: 'SSD', price: '<2000000' },
      'diseño': { ram: '>=16', storage: 'SSD', screen: 'FHD+', price: '<3000000' },
      'gaming': { ram: '>=16', gpu: 'dedicated', storage: 'SSD', price: '<4000000' },
      'programacion': { ram: '>=16', storage: 'SSD', processor: 'i5+', price: '<3000000' },
      'basico': { ram: '>=4', storage: 'any', price: '<1500000' }
    }
  },
  
  'moto': {
    question: `¡Genial! Para recomendarte la moto perfecta:

¿Para qué la necesitas?

1️⃣ Ciudad (trabajo, domicilios)
2️⃣ Carretera (viajes largos)
3️⃣ Ambas (ciudad y carretera)
4️⃣ Deportiva (velocidad)`,
    
    filters: {
      'ciudad': { cc: '<=150', type: 'urbana' },
      'carretera': { cc: '>=200', type: 'touring' },
      'ambas': { cc: '150-200', type: 'dual' },
      'deportiva': { cc: '>=200', type: 'sport' }
    }
  }
};
```

### 4. Detección de Origen (Anuncios)

```typescript
// Detectar si viene de anuncio
const adSourcePatterns = [
  /vi.*en\s+(facebook|fb|instagram|ig)/i,
  /viene.*de\s+(facebook|instagram)/i,
  /anuncio.*de\s+(facebook|instagram)/i,
  /publicidad.*de\s+(facebook|instagram)/i
];

if (adSourcePatterns.some(p => p.test(message))) {
  metadata.source = 'facebook'; // o 'instagram'
  metadata.isAdReferral = true;
}
```

---

## 📊 FLUJO DE ENTRENAMIENTO

### Captura Automática:

```typescript
// Después de cada conversación exitosa
async function captureTrainingData(conversation: Conversation) {
  const trainingData = {
    scenario: detectScenario(conversation),
    product: conversation.product,
    messages: conversation.messages,
    outcome: conversation.outcome,
    qualificationData: conversation.qualificationData,
    metadata: {
      source: conversation.source,
      duration: conversation.duration,
      messagesCount: conversation.messages.length
    }
  };
  
  // Guardar en BD
  await db.trainingConversation.create({
    data: trainingData
  });
  
  // Actualizar modelo LLM (periódicamente)
  if (shouldUpdateModel()) {
    await updateLLMWithNewData();
  }
}
```

### Uso del Entrenamiento:

```typescript
// La IA aprende de conversaciones pasadas
const similarConversations = await findSimilarConversations(
  currentMessage,
  currentContext
);

// Usa patrones exitosos
const successfulPatterns = similarConversations
  .filter(c => c.outcome === 'sale')
  .map(c => c.messages);

// Mejora respuestas basándose en éxitos pasados
const improvedResponse = generateResponseWithLearning(
  currentMessage,
  successfulPatterns
);
```

---

## 🎯 VENTAJAS DEL SISTEMA

### 1. Calificación Inteligente
- ✅ No abruma al cliente con todos los productos
- ✅ Hace preguntas relevantes
- ✅ Filtra productos según necesidades reales

### 2. Tracking de Anuncios
- ✅ Sabe de dónde viene el cliente
- ✅ Puede medir ROI de anuncios
- ✅ Personaliza respuesta según origen

### 3. Aprendizaje Continuo
- ✅ Guarda conversaciones exitosas
- ✅ Aprende patrones que funcionan
- ✅ Mejora con cada venta

### 4. Contexto Completo
- ✅ Memoria profesional mantiene todo
- ✅ IA siempre sabe qué producto, origen, necesidades
- ✅ Respuestas coherentes en toda la conversación

---

## 📝 PRÓXIMOS PASOS

1. ✅ Agregar acciones `qualify_customer` y `search_qualified_products`
2. ✅ Implementar preguntas de calificación por categoría
3. ✅ Detectar origen de anuncios (Facebook, Instagram)
4. ✅ Sistema de captura de conversaciones para entrenamiento
5. ✅ Dashboard para ver conversaciones guardadas
6. ✅ Sistema de re-entrenamiento periódico del LLM

---

## 🎉 RESULTADO ESPERADO

**El bot ahora puede:**
- ✅ Calificar clientes con búsquedas genéricas
- ✅ Detectar si vienen de anuncios
- ✅ Recomendar productos según necesidades reales
- ✅ Aprender de conversaciones exitosas
- ✅ Mejorar continuamente con cada venta

**Todo mientras mantiene:**
- 🧠 Memoria profesional completa
- 🎯 Decisiones inteligentes de IA
- 💳 Generación correcta de enlaces
- 📊 Tracking completo de conversaciones
