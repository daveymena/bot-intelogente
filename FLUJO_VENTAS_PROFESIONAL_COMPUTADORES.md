# 🎯 Flujo de Ventas Profesional para Computadores

## 📋 Problema Actual

El bot está en una etapa intermedia donde:
- Ya preguntó por computadores
- Debe **calificar** al cliente (¿para qué lo necesita?)
- Debe **recomendar** 2-3 opciones específicas
- Cliente **selecciona** una opción
- Bot **presenta** especificaciones y **cierra venta**

Pero actualmente está mostrando productos incorrectos o sin contexto.

## ✅ Solución: Flujo de Ventas en Etapas

### Etapa 1: Calificación 🎯
**Bot pregunta:**
```
¡Perfecto! 😊 Para recomendarte el mejor portátil, cuéntame:

¿Para qué lo vas a usar principalmente?

1️⃣ Trabajo/Oficina (Office, navegación, videollamadas)
2️⃣ Estudio (Tareas, investigación, clases online)
3️⃣ Gaming (Juegos, streaming)
4️⃣ Diseño/Edición (Photoshop, video, 3D)
5️⃣ Uso básico (Internet, redes sociales, videos)

Dime el número o descríbeme tu necesidad 😊
```

### Etapa 2: Recomendación Inteligente 💡
**Bot analiza** la respuesta y busca 2-3 productos que se ajusten:

```
¡Perfecto! Para [trabajo/estudio/gaming], te recomiendo estas opciones:

1️⃣ *Portátil Asus Vivobook 15*
   💰 $1.819.900
   ⚡ Ryzen 7 | 16GB RAM | 1TB SSD
   ✅ Ideal para: Multitarea, Office, navegación rápida

2️⃣ *Portátil Asus Vivobook 16*
   💰 $2.449.900
   ⚡ Intel i7 | 16GB RAM | 512GB SSD
   ✅ Ideal para: Trabajo pesado, diseño ligero

3️⃣ *Portátil Acer AL15*
   💰 $2.179.900
   ⚡ Ryzen 7 | 16GB RAM | 1TB SSD
   ✅ Ideal para: Rendimiento equilibrado

¿Cuál te llama más la atención? 😊
```

### Etapa 3: Selección del Cliente 🎯
**Cliente responde:** "1" o "el primero" o "el Asus 15"

**Bot detecta** la selección y pasa a presentación detallada.

### Etapa 4: Presentación Profesional 🌟
**Bot presenta** el producto seleccionado con detalles:

```
¡Excelente elección! 😊 El *Asus Vivobook 15* es perfecto para ti

[FOTO DEL PRODUCTO]

💻 *Especificaciones Técnicas:*
• Procesador: AMD Ryzen 7 5825U (8 núcleos)
• RAM: 16GB DDR4 (expandible)
• Almacenamiento: 1TB SSD (súper rápido)
• Pantalla: 15.6" Full HD
• Peso: 1.7kg (portátil y ligero)

✅ *¿Por qué es perfecto para ti?*
• Multitarea sin problemas (Office, Chrome, Zoom)
• Arranque en segundos (SSD)
• Batería de larga duración
• Pantalla grande y cómoda

💰 *Precio:* $1.819.900
🎁 *Incluye:* Garantía 1 año

¿Te gustaría comprarlo? Tengo disponibilidad inmediata 😊
```

### Etapa 5: Cierre de Venta 💳
**Bot maneja** objeciones y cierra:

```
Perfecto! Para proceder con tu compra:

💳 *Métodos de pago disponibles:*
• Transferencia bancaria
• Nequi / Daviplata
• Tarjeta de crédito (MercadoPago)
• PayPal

📦 *Envío:* Gratis a toda Colombia
⏱️ *Entrega:* 2-3 días hábiles

¿Con cuál método prefieres pagar? 😊
```

## 🔧 Implementación Técnica

### 1. Sistema de Estados de Conversación

Necesitamos trackear en qué etapa está cada cliente:

```typescript
enum SalesStage {
  INITIAL = 'initial',              // Cliente pregunta por productos
  QUALIFYING = 'qualifying',        // Bot califica necesidades
  RECOMMENDING = 'recommending',    // Bot muestra 2-3 opciones
  SELECTING = 'selecting',          // Cliente selecciona opción
  PRESENTING = 'presenting',        // Bot presenta detalles
  CLOSING = 'closing'               // Bot cierra venta
}
```

### 2. Memoria de Conversación Mejorada

```typescript
interface ConversationState {
  stage: SalesStage
  productCategory: string           // 'computadores'
  clientNeed: string                // 'trabajo', 'gaming', etc.
  recommendedProducts: Product[]    // 2-3 productos recomendados
  selectedProduct: Product | null   // Producto seleccionado
  lastBotMessage: string           // Último mensaje del bot
}
```

### 3. Detector de Etapa Actual

```typescript
class SalesStageDetector {
  static detectStage(
    message: string,
    history: any[],
    currentState: ConversationState
  ): SalesStage {
    // Si el último mensaje del bot preguntó "¿para qué lo necesitas?"
    if (this.isQualificationQuestion(history)) {
      return SalesStage.QUALIFYING
    }
    
    // Si el último mensaje mostró opciones numeradas
    if (this.hasRecommendations(history)) {
      return SalesStage.SELECTING
    }
    
    // Si ya seleccionó un producto
    if (currentState.selectedProduct) {
      return SalesStage.CLOSING
    }
    
    return SalesStage.INITIAL
  }
}
```

### 4. Manejador por Etapa

```typescript
class ProfessionalSalesHandler {
  async handleMessage(
    message: string,
    state: ConversationState
  ): Promise<string> {
    switch (state.stage) {
      case SalesStage.INITIAL:
        return this.handleInitialInquiry(message)
      
      case SalesStage.QUALIFYING:
        return this.handleQualification(message, state)
      
      case SalesStage.SELECTING:
        return this.handleSelection(message, state)
      
      case SalesStage.PRESENTING:
        return this.handlePresentation(message, state)
      
      case SalesStage.CLOSING:
        return this.handleClosing(message, state)
    }
  }
  
  private async handleQualification(
    message: string,
    state: ConversationState
  ): Promise<string> {
    // Analizar respuesta del cliente
    const need = this.detectClientNeed(message)
    
    // Buscar 2-3 productos que se ajusten
    const products = await this.findMatchingProducts(need, state.productCategory)
    
    // Generar recomendación
    return this.generateRecommendation(products, need)
  }
  
  private async handleSelection(
    message: string,
    state: ConversationState
  ): Promise<string> {
    // Detectar qué producto seleccionó (1, 2, 3)
    const selection = this.detectSelection(message)
    const product = state.recommendedProducts[selection - 1]
    
    // Generar presentación profesional
    return this.generateProfessionalPresentation(product)
  }
}
```

## 🎯 Flujo Completo Ejemplo

```
👤: "Hola, tienes computadores?"
🤖: [ETAPA: INITIAL → QUALIFYING]
    "¡Perfecto! Para recomendarte el mejor, ¿para qué lo necesitas?
     1️⃣ Trabajo 2️⃣ Estudio 3️⃣ Gaming 4️⃣ Diseño 5️⃣ Básico"

👤: "Para trabajo"
🤖: [ETAPA: QUALIFYING → RECOMMENDING]
    "¡Perfecto para trabajo! Te recomiendo:
     1️⃣ Asus Vivobook 15 - $1.819.900
     2️⃣ Asus Vivobook 16 - $2.449.900
     3️⃣ Acer AL15 - $2.179.900"

👤: "1"
🤖: [ETAPA: SELECTING → PRESENTING]
    "¡Excelente elección! El Asus Vivobook 15...
     [FOTO + ESPECIFICACIONES DETALLADAS]
     ¿Te gustaría comprarlo?"

👤: "Sí, cómo pago?"
🤖: [ETAPA: PRESENTING → CLOSING]
    "Perfecto! Métodos de pago:
     • Transferencia • Nequi • Tarjeta
     ¿Cuál prefieres?"
```

## 📝 Próximos Pasos

1. **Crear** `src/lib/professional-sales-flow.ts`
2. **Integrar** con `baileys-stable-service.ts`
3. **Agregar** memoria de estado por conversación
4. **Probar** flujo completo

¿Quieres que implemente este flujo completo ahora?
