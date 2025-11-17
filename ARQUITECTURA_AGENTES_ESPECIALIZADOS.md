# 🏗️ ARQUITECTURA DE AGENTES ESPECIALIZADOS - Sistema Completo de Ventas

## 📊 ANÁLISIS DE PROBLEMAS DETECTADOS

### Problemas Recurrentes que Hemos Resuelto:

1. **Contexto de Producto Inconsistente**
   - Bot cambiaba de producto cuando preguntaban por métodos de pago
   - No mantenía memoria del producto de interés

2. **Envío de Fotos Confuso**
   - Enviaba 1 foto pero mostraba múltiples productos
   - No detectaba solicitudes explícitas de fotos
   - Enviaba fotos cuando no debía

3. **Información Sin Formato**
   - Texto regado, difícil de leer
   - Sin emojis, sin estructura
   - Respuestas muy largas o muy cortas

4. **IAs Desactivadas**
   - Sistema sin IA funcional
   - Sin fallback cuando una IA falla
   - Sin rotación de API keys

5. **Falta de Especialización**
   - Un solo sistema intentando hacer todo
   - Sin agentes especializados por tarea
   - Lógica mezclada y difícil de mantener

## 🎯 SOLUCIÓN: ARQUITECTURA DE AGENTES ESPECIALIZADOS

Inspirada en ChatGPT, Claude y otros sistemas avanzados de IA.

### Principios de Diseño:

1. **Un Agente = Una Responsabilidad**
2. **Comunicación Clara entre Agentes**
3. **Memoria Compartida Centralizada**
4. **Orquestador que Coordina Todo**
5. **Cada Agente es Experto en su Dominio**

---

## 🏛️ ARQUITECTURA PROPUESTA

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO (WhatsApp)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              🎯 ORQUESTADOR PRINCIPAL                       │
│         (Decide qué agente debe responder)                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   AGENTE     │ │   AGENTE     │ │   AGENTE     │
│   SALUDO     │ │  BÚSQUEDA    │ │   PRODUCTO   │
└──────────────┘ └──────────────┘ └──────────────┘
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   AGENTE     │ │   AGENTE     │ │   AGENTE     │
│    PAGO      │ │    FOTO      │ │   CIERRE     │
└──────────────┘ └──────────────┘ └──────────────┘
        │              │              │
        └──────────────┼──────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              💾 MEMORIA COMPARTIDA                          │
│    (Contexto, Historial, Producto Actual, Estado)          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 AGENTES ESPECIALIZADOS

### 1. 🎯 **Orquestador Principal** (Supervisor)

**Responsabilidad:** Decidir qué agente debe manejar cada mensaje

**Funciones:**
- Analizar el mensaje del usuario
- Detectar la intención (saludo, búsqueda, pago, etc.)
- Llamar al agente apropiado
- Coordinar respuestas de múltiples agentes
- Mantener el flujo de conversación

**Archivo:** `src/agents/orchestrator.ts`

```typescript
class Orchestrator {
  async processMessage(message: string, context: Context) {
    // 1. Detectar intención
    const intent = await this.detectIntent(message, context);
    
    // 2. Seleccionar agente
    const agent = this.selectAgent(intent, context);
    
    // 3. Ejecutar agente
    const response = await agent.execute(message, context);
    
    // 4. Actualizar contexto
    await this.updateContext(response, context);
    
    // 5. Retornar respuesta
    return response;
  }
  
  private selectAgent(intent: Intent, context: Context): Agent {
    // Lógica de selección de agente
    switch(intent.type) {
      case 'greeting': return new GreetingAgent();
      case 'search': return new SearchAgent();
      case 'product_info': return new ProductAgent();
      case 'payment': return new PaymentAgent();
      case 'photo': return new PhotoAgent();
      case 'closing': return new ClosingAgent();
      default: return new GeneralAgent();
    }
  }
}
```

---

### 2. 👋 **Agente de Saludo** (Greeting Agent)

**Responsabilidad:** Manejar saludos y bienvenidas

**Funciones:**
- Responder saludos de forma natural
- Presentar el negocio brevemente
- Ofrecer ayuda inicial
- Detectar si es cliente nuevo o recurrente

**Archivo:** `src/agents/greeting-agent.ts`

```typescript
class GreetingAgent extends BaseAgent {
  async execute(message: string, context: Context): Promise<Response> {
    const isReturningCustomer = context.messageCount > 1;
    
    if (isReturningCustomer) {
      return {
        text: `¡Hola de nuevo! 😊 ¿En qué puedo ayudarte hoy?`,
        nextAgent: 'search'
      };
    }
    
    return {
      text: `¡Hola! 👋 Bienvenido a *Tecnovariedades D&S*

¿Qué te gustaría ver?
💻 Computadores
🏍️ Motos  
💎 Cursos digitales
🔧 Servicios`,
      nextAgent: 'search'
    };
  }
}
```

---

### 3. 🔍 **Agente de Búsqueda** (Search Agent)

**Responsabilidad:** Buscar productos según la consulta del usuario

**Funciones:**
- Interpretar consultas (incluso con jerga)
- Buscar productos relevantes
- Decidir si mostrar 1 o múltiples productos
- Pasar al Agente de Producto si encuentra 1
- Mostrar lista si encuentra múltiples

**Archivo:** `src/agents/search-agent.ts`

```typescript
class SearchAgent extends BaseAgent {
  async execute(message: string, context: Context): Promise<Response> {
    // 1. Interpretar consulta (con razonamiento profundo)
    const interpretation = await this.interpretQuery(message);
    
    // 2. Buscar productos
    const products = await this.searchProducts(interpretation);
    
    // 3. Decidir flujo
    if (products.length === 0) {
      return this.handleNoProducts(message);
    }
    
    if (products.length === 1) {
      // Pasar al Agente de Producto
      context.currentProduct = products[0];
      return {
        text: `Encontré esto para ti 😊`,
        nextAgent: 'product',
        data: { product: products[0] }
      };
    }
    
    // Múltiples productos
    return this.showProductList(products);
  }
  
  private showProductList(products: Product[]): Response {
    let text = `Tenemos varias opciones disponibles! 💻\n\n`;
    
    products.slice(0, 3).forEach((p, i) => {
      text += `📦 *${p.name}*\n`;
      text += `• ${p.shortDescription}\n`;
      text += `💰 ${p.price.toLocaleString('es-CO')} COP\n\n`;
    });
    
    text += `¿Cuál te interesa más? 🤔`;
    
    return {
      text,
      nextAgent: 'product',
      sendPhotos: false // NO enviar fotos con múltiples productos
    };
  }
}
```

---

### 4. 📦 **Agente de Producto** (Product Agent)

**Responsabilidad:** Mostrar información detallada de UN producto

**Funciones:**
- Mostrar especificaciones completas
- Enviar foto del producto
- Responder preguntas sobre el producto
- Detectar interés de compra

**Archivo:** `src/agents/product-agent.ts`

```typescript
class ProductAgent extends BaseAgent {
  async execute(message: string, context: Context): Promise<Response> {
    const product = context.currentProduct;
    
    if (!product) {
      return {
        text: `¿Qué producto te interesa? 🤔`,
        nextAgent: 'search'
      };
    }
    
    // Generar descripción formateada
    const description = this.formatProductInfo(product);
    
    return {
      text: description,
      sendPhotos: true, // SÍ enviar foto de UN producto
      photos: product.images,
      nextAgent: 'payment', // Preparar para pago
      actions: [
        { type: 'send_photo', product }
      ]
    };
  }
  
  private formatProductInfo(product: Product): string {
    return `¡Claro! 😊 Te cuento sobre el *${product.name}*

💻 *Especificaciones:*
${product.specs.map(s => `• ${s}`).join('\n')}

💰 *Precio:* ${product.price.toLocaleString('es-CO')} COP

✅ Disponible para entrega inmediata

¿Te gustaría comprarlo? 🛒`;
  }
}
```

---

### 5. 💳 **Agente de Pago** (Payment Agent)

**Responsabilidad:** Manejar todo el proceso de pago

**Funciones:**
- Mostrar métodos de pago disponibles
- Generar links de pago dinámicos
- Responder preguntas sobre pagos
- Confirmar selección de método

**Archivo:** `src/agents/payment-agent.ts`

```typescript
class PaymentAgent extends BaseAgent {
  async execute(message: string, context: Context): Promise<Response> {
    const product = context.currentProduct;
    
    if (!product) {
      return {
        text: `Primero necesito saber qué producto quieres comprar 😊`,
        nextAgent: 'search'
      };
    }
    
    // Detectar si está preguntando por métodos o seleccionando uno
    const selectedMethod = this.detectPaymentMethod(message);
    
    if (selectedMethod) {
      // Generar link específico
      return await this.generatePaymentLink(product, selectedMethod);
    }
    
    // Mostrar todos los métodos
    return this.showAllPaymentMethods(product);
  }
  
  private async generatePaymentLink(
    product: Product, 
    method: string
  ): Promise<Response> {
    const link = await PaymentLinkGenerator.generate(product.id, method);
    
    return {
      text: `¡Perfecto! 💳 Aquí está tu link de pago:

📦 *Producto:* ${product.name}
💰 *Monto:* ${product.price.toLocaleString('es-CO')} COP

🔗 *Link de ${method}:*
${link.url}

*Pasos:*
1️⃣ Haz clic en el link
2️⃣ Completa el pago
3️⃣ Recibirás tu producto inmediatamente ✅`,
      nextAgent: 'closing'
    };
  }
}
```

---

### 6. 📸 **Agente de Foto** (Photo Agent)

**Responsabilidad:** Manejar solicitudes de fotos

**Funciones:**
- Detectar solicitudes de fotos
- Enviar fotos del producto correcto
- Manejar múltiples fotos
- Confirmar envío

**Archivo:** `src/agents/photo-agent.ts`

```typescript
class PhotoAgent extends BaseAgent {
  async execute(message: string, context: Context): Promise<Response> {
    const product = context.currentProduct;
    
    if (!product) {
      return {
        text: `¿De qué producto quieres ver la foto? 🤔`,
        nextAgent: 'search'
      };
    }
    
    if (!product.images || product.images.length === 0) {
      return {
        text: `Lo siento, no tengo fotos disponibles de ese producto 😔`,
        nextAgent: 'product'
      };
    }
    
    return {
      text: `¡Claro! Te envío la foto de *${product.name}* 📸`,
      sendPhotos: true,
      photos: product.images,
      nextAgent: 'product'
    };
  }
}
```

---

### 7. ✅ **Agente de Cierre** (Closing Agent)

**Responsabilidad:** Cerrar la venta y dar seguimiento

**Funciones:**
- Confirmar compra
- Agradecer al cliente
- Ofrecer soporte post-venta
- Invitar a futuras compras

**Archivo:** `src/agents/closing-agent.ts`

```typescript
class ClosingAgent extends BaseAgent {
  async execute(message: string, context: Context): Promise<Response> {
    const product = context.currentProduct;
    
    return {
      text: `¡Excelente! 🎉

Gracias por tu compra de *${product.name}*

📧 Recibirás un correo con:
• Confirmación de pago
• Instrucciones de entrega
• Información de soporte

¿Necesitas algo más? 😊

Estamos aquí para ayudarte 24/7 💙`,
      nextAgent: 'greeting',
      actions: [
        { type: 'mark_as_sold', product },
        { type: 'send_confirmation_email' }
      ]
    };
  }
}
```

---

## 💾 MEMORIA COMPARTIDA

Todos los agentes acceden a una memoria centralizada:

**Archivo:** `src/agents/shared-memory.ts`

```typescript
interface SharedMemory {
  // Identificación
  userId: string;
  chatId: string;
  userName?: string;
  
  // Contexto de Conversación
  currentProduct?: Product;
  interestedProducts: Product[];
  lastQuery: string;
  messageCount: number;
  
  // Estado de Venta
  salesStage: 'greeting' | 'search' | 'product' | 'payment' | 'closing';
  paymentIntent: boolean;
  preferredPaymentMethod?: string;
  
  // Historial
  messages: Message[];
  lastUpdate: Date;
  
  // Flags
  photoSent: boolean;
  paymentLinkSent: boolean;
  
  // Metadata
  needs: string[];
  objections: string[];
}

class SharedMemoryService {
  private memories: Map<string, SharedMemory> = new Map();
  
  get(chatId: string): SharedMemory {
    return this.memories.get(chatId) || this.createNew(chatId);
  }
  
  update(chatId: string, updates: Partial<SharedMemory>): void {
    const memory = this.get(chatId);
    Object.assign(memory, updates);
    memory.lastUpdate = new Date();
  }
  
  clear(chatId: string): void {
    this.memories.delete(chatId);
  }
}
```

---

## 🔄 FLUJO COMPLETO DE CONVERSACIÓN

### Ejemplo: Cliente Compra un Portátil

```
1. USUARIO: "Hola"
   ↓
   ORQUESTADOR → Detecta: saludo
   ↓
   AGENTE SALUDO → Responde con bienvenida
   ↓
   MEMORIA: salesStage = 'greeting'

2. USUARIO: "Busco un portátil para diseño"
   ↓
   ORQUESTADOR → Detecta: búsqueda de producto
   ↓
   AGENTE BÚSQUEDA → Busca portátiles para diseño
   ↓
   Encuentra 3 productos
   ↓
   Muestra lista SIN fotos
   ↓
   MEMORIA: salesStage = 'search', interestedProducts = [3 productos]

3. USUARIO: "Me interesa el Asus Vivobook"
   ↓
   ORQUESTADOR → Detecta: interés en producto específico
   ↓
   AGENTE PRODUCTO → Muestra info del Asus Vivobook
   ↓
   Envía foto del producto
   ↓
   MEMORIA: salesStage = 'product', currentProduct = Asus Vivobook, photoSent = true

4. USUARIO: "¿Cómo puedo pagar?"
   ↓
   ORQUESTADOR → Detecta: pregunta sobre pago
   ↓
   AGENTE PAGO → Muestra métodos de pago
   ↓
   MEMORIA: salesStage = 'payment', paymentIntent = true

5. USUARIO: "Quiero pagar con MercadoPago"
   ↓
   ORQUESTADOR → Detecta: selección de método de pago
   ↓
   AGENTE PAGO → Genera link de MercadoPago
   ↓
   Envía link de pago
   ↓
   MEMORIA: preferredPaymentMethod = 'mercadopago', paymentLinkSent = true

6. USUARIO: "Listo, ya pagué"
   ↓
   ORQUESTADOR → Detecta: confirmación de pago
   ↓
   AGENTE CIERRE → Agradece y confirma
   ↓
   Envía instrucciones post-venta
   ↓
   MEMORIA: salesStage = 'closing'
```

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
src/agents/
├── base-agent.ts                 # Clase base para todos los agentes
├── orchestrator.ts               # Orquestador principal
├── shared-memory.ts              # Memoria compartida
│
├── greeting-agent.ts             # Agente de saludo
├── search-agent.ts               # Agente de búsqueda
├── product-agent.ts              # Agente de producto
├── payment-agent.ts              # Agente de pago
├── photo-agent.ts                # Agente de foto
├── closing-agent.ts              # Agente de cierre
│
├── utils/
│   ├── intent-detector.ts        # Detector de intención
│   ├── product-matcher.ts        # Matcher de productos
│   ├── response-formatter.ts     # Formateador de respuestas
│   └── context-manager.ts        # Gestor de contexto
│
└── index.ts                      # Exportaciones
```

---

## 🎯 VENTAJAS DE ESTA ARQUITECTURA

### 1. **Separación de Responsabilidades**
- Cada agente hace UNA cosa bien
- Fácil de mantener y debuggear
- Fácil de agregar nuevos agentes

### 2. **Escalabilidad**
- Agregar nuevo agente = crear nuevo archivo
- No afecta a otros agentes
- Fácil de extender

### 3. **Testabilidad**
- Cada agente se puede probar independientemente
- Mocks fáciles de crear
- Tests unitarios simples

### 4. **Claridad**
- Código limpio y organizado
- Fácil de entender el flujo
- Documentación natural

### 5. **Flexibilidad**
- Cambiar comportamiento de un agente no afecta a otros
- Fácil de personalizar por tipo de negocio
- Reutilizable en otros proyectos

---

## 🚀 IMPLEMENTACIÓN

### Fase 1: Estructura Base (1-2 días)
1. Crear clase BaseAgent
2. Crear Orchestrator
3. Crear SharedMemory
4. Crear IntentDetector

### Fase 2: Agentes Básicos (2-3 días)
1. GreetingAgent
2. SearchAgent
3. ProductAgent

### Fase 3: Agentes Avanzados (2-3 días)
1. PaymentAgent
2. PhotoAgent
3. ClosingAgent

### Fase 4: Integración (1-2 días)
1. Integrar con Baileys
2. Migrar lógica existente
3. Testing completo

### Fase 5: Optimización (1-2 días)
1. Ajustar prompts
2. Mejorar detección de intención
3. Optimizar rendimiento

**Total: 7-12 días de desarrollo**

---

## 📊 COMPARACIÓN: ANTES vs DESPUÉS

### ANTES (Sistema Monolítico)
```
❌ Un archivo gigante con toda la lógica
❌ Difícil de mantener
❌ Bugs afectan todo el sistema
❌ Difícil de agregar funcionalidades
❌ Código mezclado y confuso
```

### DESPUÉS (Sistema de Agentes)
```
✅ Múltiples agentes especializados
✅ Fácil de mantener
✅ Bugs aislados por agente
✅ Agregar agente = agregar archivo
✅ Código limpio y organizado
```

---

## 🎯 PRÓXIMOS PASOS

1. **Revisar y Aprobar Arquitectura**
2. **Crear Estructura de Carpetas**
3. **Implementar BaseAgent**
4. **Implementar Orchestrator**
5. **Crear Agentes Uno por Uno**
6. **Integrar con Sistema Actual**
7. **Testing Completo**
8. **Deploy a Producción**

---

¿Quieres que empiece a implementar esta arquitectura? 🚀
