# 🎯 SISTEMA HÍBRIDO INTELIGENTE - SOLUCIÓN DEFINITIVA

## 🧠 ARQUITECTURA PROPUESTA

```
Usuario pregunta
    ↓
SimpleConversationHandler (Detecta tipo)
    ↓
┌─────────────────────────────────────────┐
│  ¿Es producto ESPECÍFICO (1 solo)?     │
└─────────────────────────────────────────┘
         ↓ SÍ                    ↓ NO
    ┌─────────┐            ┌──────────┐
    │ HÍBRIDO │            │ IA PURA  │
    │ + FOTOS │            │ AVANZADA │
    └─────────┘            └──────────┘
         ↓                       ↓
  RealDataEnforcer      AIMultiProvider
  CardPhotoSender       (Groq/Ollama)
         ↓                       ↓
  Foto + Caption CARD    Respuesta flexible
  Datos REALES BD        Maneja cualquier pregunta
```

## 🎯 ESTRATEGIA

### Caso 1: Producto ESPECÍFICO (1 solo)
**Ejemplo:** "Curso de piano", "Mega Pack 03"

**Flujo:**
1. Buscar en BD → 1 producto encontrado
2. Usar `RealDataEnforcer` → Datos REALES
3. Usar `CardPhotoSender` → Foto con caption CARD
4. Usar IA para texto complementario
5. **Resultado:** Foto + Caption CARD + Texto IA

### Caso 2: Múltiples productos o pregunta compleja
**Ejemplo:** "Tiene portátil Asus", "Cuál es mejor para diseño"

**Flujo:**
1. Buscar en BD → Múltiples productos o pregunta compleja
2. Usar IA avanzada (Groq/Ollama) → Respuesta flexible
3. Verificar datos con `RealDataEnforcer`
4. Enviar foto del primer producto (opcional)
5. **Resultado:** Texto IA + Foto opcional

### Caso 3: Pregunta general sin productos
**Ejemplo:** "Cómo puedo pagar", "Tienen garantía"

**Flujo:**
1. No hay productos específicos
2. Usar IA pura (Groq/Ollama)
3. Respuesta conversacional
4. **Resultado:** Solo texto IA

## 🔧 IMPLEMENTACIÓN

### Modificar SimpleConversationHandler.handleSearch()

```typescript
private async handleSearch(message: string, chatId: string, userId: string): Promise<SimpleResponse> {
  // 🔍 BÚSQUEDA INTELIGENTE
  const { IntelligentSearchFallback } = await import('./intelligent-search-fallback');
  const searchResult = await IntelligentSearchFallback.searchWithFallback(message, userId);
  
  const { products, searchType, reason } = searchResult;

  // ❌ NO ENCONTRADO
  if (products.length === 0) {
    const { ProfessionalCardFormatter } = await import('./professional-card-formatter');
    return {
      text: ProfessionalCardFormatter.formatNotFound(message)
    };
  }

  // ✅ GUARDAR PRIMER PRODUCTO
  SimpleConversationHandler.currentProduct.set(chatId, products[0]);

  // 🎯 DECISIÓN: ¿1 producto específico o múltiples?
  if (products.length === 1) {
    // ═══════════════════════════════════════════════════════
    // CASO 1: PRODUCTO ESPECÍFICO → HÍBRIDO + FOTOS CARD
    // ═══════════════════════════════════════════════════════
    console.log('[SimpleHandler] 🎯 Producto específico → Modo HÍBRIDO + FOTOS CARD');
    
    const product = products[0];
    
    // 1. VERIFICAR DATOS REALES
    const { RealDataEnforcer } = await import('./real-data-enforcer');
    const realData = await RealDataEnforcer.getProductData(product.id);
    
    if (realData) {
      // Actualizar con datos REALES
      product.price = realData.price;
      product.name = realData.name;
      product.description = realData.description;
      product.images = realData.images;
      console.log('[SimpleHandler] ✅ Datos REALES verificados');
    }
    
    // 2. GENERAR RESPUESTA CON IA (para texto natural)
    const responseText = await this.generateResponse({
      message,
      products: [product],
      chatId,
      context: 'search',
      userId
    });
    
    // 3. PREPARAR FOTOS CON CAPTION CARD
    const actions: Array<{ type: string; data: any }> = [];
    if (product.images && product.images.length > 0) {
      actions.push({
        type: 'send_photo_card', // Nuevo tipo específico
        data: { 
          product: product,
          useCardFormat: true // Flag para usar CardPhotoSender
        }
      });
      console.log('[SimpleHandler] 📸 Preparando fotos CARD para: ' + product.name);
    }
    
    return {
      text: responseText.text,
      actions
    };
    
  } else {
    // ═══════════════════════════════════════════════════════
    // CASO 2: MÚLTIPLES PRODUCTOS → IA AVANZADA + FOTO OPCIONAL
    // ═══════════════════════════════════════════════════════
    console.log('[SimpleHandler] 📋 Múltiples productos → Modo IA AVANZADA');
    
    // 1. VERIFICAR DATOS REALES de todos
    const { RealDataEnforcer } = await import('./real-data-enforcer');
    for (const product of products) {
      const realData = await RealDataEnforcer.getProductData(product.id);
      if (realData) {
        product.price = realData.price;
        product.name = realData.name;
      }
    }
    
    // 2. GENERAR RESPUESTA CON IA (maneja comparaciones, preguntas complejas)
    const responseText = await this.generateResponse({
      message,
      products: products,
      chatId,
      context: 'search',
      userId
    });
    
    // 3. FOTO OPCIONAL del primer producto (sin CARD, solo muestra)
    const actions: Array<{ type: string; data: any }> = [];
    if (products[0].images && products[0].images.length > 0) {
      actions.push({
        type: 'send_photo', // Tipo normal (no CARD)
        data: { product: products[0] }
      });
      console.log('[SimpleHandler] 📸 Foto opcional del primero: ' + products[0].name);
    }
    
    return {
      text: responseText.text,
      actions
    };
  }
}
```

### Modificar conversacionController.ts

```typescript
// Procesar acciones (CARD vs Normal)
const fotos: Array<{ url: string; caption?: string }> = [];

if (response.actions && response.actions.length > 0) {
  for (const action of response.actions) {
    
    // ═══════════════════════════════════════════════════════
    // TIPO 1: send_photo_card → FORMATO CARD PROFESIONAL
    // ═══════════════════════════════════════════════════════
    if (action.type === 'send_photo_card' && action.data?.product) {
      const product = action.data.product;
      
      console.log(`[Conversación] 📸 MODO CARD para: ${product.name}`);
      
      const { CardPhotoSender } = await import('@/lib/card-photo-sender');
      
      // Caption CARD profesional
      const caption = CardPhotoSender.generateCardCaption({
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        deliveryLink: product.deliveryLink
      });
      
      // Parsear imágenes
      let images: string[] = [];
      try {
        if (typeof product.images === 'string') {
          images = JSON.parse(product.images);
        } else if (Array.isArray(product.images)) {
          images = product.images;
        }
      } catch (e) {
        console.error('[Conversación] Error parseando imágenes:', e);
      }
      
      images = images.filter(img => img && img.trim() !== '' && img.startsWith('http'));
      
      if (images.length > 0) {
        const maxPhotos = Math.min(images.length, 3);
        for (let i = 0; i < maxPhotos; i++) {
          fotos.push({
            url: images[i],
            caption: i === 0 ? caption : undefined
          });
        }
        console.log(`[Conversación] ✅ ${maxPhotos} fotos CARD agregadas`);
      }
    }
    
    // ═══════════════════════════════════════════════════════
    // TIPO 2: send_photo → FOTO SIMPLE (sin CARD)
    // ═══════════════════════════════════════════════════════
    else if (action.type === 'send_photo' && action.data?.product) {
      const product = action.data.product;
      
      console.log(`[Conversación] 📸 MODO SIMPLE para: ${product.name}`);
      
      // Solo primera foto, sin caption elaborado
      let images: string[] = [];
      try {
        if (typeof product.images === 'string') {
          images = JSON.parse(product.images);
        } else if (Array.isArray(product.images)) {
          images = product.images;
        }
      } catch (e) {
        console.error('[Conversación] Error parseando imágenes:', e);
      }
      
      images = images.filter(img => img && img.trim() !== '' && img.startsWith('http'));
      
      if (images.length > 0) {
        fotos.push({
          url: images[0],
          caption: `📸 ${product.name}` // Caption simple
        });
        console.log(`[Conversación] ✅ 1 foto simple agregada`);
      }
    }
  }
}
```

## ✅ BENEFICIOS

1. **Producto específico:**
   - ✅ Foto con caption CARD profesional
   - ✅ Datos REALES verificados
   - ✅ Texto generado por IA (natural)

2. **Múltiples productos:**
   - ✅ IA avanzada maneja comparaciones
   - ✅ Responde preguntas complejas
   - ✅ Foto opcional del primero

3. **Preguntas generales:**
   - ✅ IA pura sin restricciones
   - ✅ Conversacional y flexible
   - ✅ No se bloquea nunca

4. **Verificación de datos:**
   - ✅ Siempre usa `RealDataEnforcer`
   - ✅ Precios correctos
   - ✅ NO inventa información

## 🎯 RESULTADO ESPERADO

### Usuario: "Curso de piano"
```
Bot: [TEXTO IA]
¡Perfecto! 😊 Tengo el curso ideal para ti...

Bot: [FOTO 1 con CAPTION CARD]
📚 Curso de Piano Completo
━━━━━━━━━━━━━━━━━━━━
💰 PRECIO: 20.000 COP
📝 Aprende piano desde cero...
✅ INCLUYE:
   • Acceso inmediato
   • Entrega por WhatsApp
👉 ¿Te interesa?
━━━━━━━━━━━━━━━━━━━━

Bot: [FOTO 2 sin caption]
Bot: [FOTO 3 sin caption]
```

### Usuario: "Tiene portátil Asus"
```
Bot: [TEXTO IA]
¡Genial elección! 😊 Tenemos estas opciones:

1️⃣ 💻 Portátil Dell Inspiron
   💰 1.200.000 COP
   📝 Intel Core i5, 8GB RAM...

2️⃣ 📦 Megapack de Cursos
   💰 20.000 COP
   📝 Más de 30 cursos...

¿Cuál te interesa más? 😊

Bot: [FOTO SIMPLE]
📸 Portátil Dell Inspiron
```

### Usuario: "Cuál es mejor para diseño gráfico"
```
Bot: [TEXTO IA PURO]
Para diseño gráfico te recomiendo...
[Respuesta inteligente comparando opciones]
```

## 🚀 IMPLEMENTAR AHORA

1. Modificar `SimpleConversationHandler.handleSearch()`
2. Modificar `conversacionController.ts` procesamiento de acciones
3. Reiniciar servidor
4. Probar en WhatsApp

¿Quieres que implemente esta solución híbrida ahora?
