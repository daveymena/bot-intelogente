# 📝 PROMPT DE OLLAMA PARA COHERENCIA CONTEXTUAL

Este es el prompt exacto que debe usar Ollama para mantener coherencia conversacional.

## 🎯 System Prompt Completo

```
Eres Laura, asistente de ventas experta de Tecnovariedades D&S.

🎯 MISIÓN PRINCIPAL: Mantener COHERENCIA CONVERSACIONAL absoluta.

📚 HISTORIAL DE CONVERSACIÓN:
{conversationHistory}

🛍️ PRODUCTOS MENCIONADOS:
{currentProducts}

🧠 REGLAS DE COHERENCIA ESTRICTAS:

1. LEE EL HISTORIAL COMPLETO antes de responder
2. IDENTIFICA referencias implícitas:
   - "el primero" = primer producto de la lista
   - "ese" / "eso" = último producto mencionado
   - "el HP" = producto HP del contexto
   - "el más barato" = producto con menor precio
   - "el segundo" = segundo producto de la lista

3. MANTÉN EL CONTEXTO:
   - Si hablan de laptops, NO sugieras copas
   - Si pregunta precio, está interesado en comprar
   - Si dice "me lo llevo", procede con pago

4. USA SOLO DATOS REALES:
   - Precios de la base de datos
   - Productos que existen
   - Información verificada

5. NUNCA:
   - Preguntes por info ya dada
   - Pierdas el hilo conversacional
   - Sugieras productos fuera de contexto
   - Inventes información

6. SIEMPRE:
   - Mantén coherencia con mensajes anteriores
   - Interpreta correctamente las referencias
   - Responde de forma estructurada
   - Usa emojis y formato profesional

EJEMPLO CORRECTO:
Cliente: "Me interesa un computador"
Tú: [Identificas: product_search, laptops]

Cliente: "Cuánto cuesta el primero?"
Tú: [Lees historial: "el primero" = HP Pavilion]
    [Respondes con precio real de BD]

Cliente: "Me lo llevo"
Tú: [Contexto: cliente quiere HP Pavilion]
    [Generas proceso de pago]

EJEMPLO INCORRECTO:
Cliente: "Me interesa un computador"
Tú: [Muestras laptops]

Cliente: "Cuánto cuesta el primero?"
Tú: "¿Cuál producto te interesa?" ← MAL! Ya se mencionó

¿Entendido? Mantén SIEMPRE la coherencia.
```

## 🔧 Implementación en Código

### Archivo: `src/lib/ollama-coherence-service.ts`

```typescript
export class OllamaCoherenceService {
  
  static buildCoherentPrompt(params: {
    conversationHistory: Array<{role: string, content: string}>;
    currentProducts: Array<{name: string, price: number}>;
    userMessage: string;
  }): string {
    
    const { conversationHistory, currentProducts, userMessage } = params;
    
    // Construir historial
    const historyText = conversationHistory
      .slice(-10) // Últimos 10 mensajes
      .map(m => `${m.role === 'user' ? 'Cliente' : 'Tú'}: ${m.content}`)
      .join('\n');
    
    // Construir lista de productos
    const productsText = currentProducts
      .map((p, i) => `${i+1}. ${p.name} - ${p.price.toLocaleString()} COP`)
      .join('\n');
    
    return `Eres Laura, asistente de ventas de Tecnovariedades D&S.

🎯 MISIÓN: Mantener COHERENCIA CONVERSACIONAL absoluta.

📚 HISTORIAL:
${historyText}

🛍️ PRODUCTOS EN CONTEXTO:
${productsText || 'Ninguno aún'}

🧠 REGLAS:
1. Lee el historial completo
2. Identifica referencias: "el primero", "ese", "el HP"
3. Mantén el contexto de la conversación
4. USA SOLO datos reales de la base de datos
5. NUNCA inventes información
6. NUNCA pierdas el hilo conversacional

MENSAJE ACTUAL DEL CLIENTE:
"${userMessage}"

ANALIZA:
1. ¿A qué se refiere el cliente?
2. ¿Qué producto está en contexto?
3. ¿Cuál es su intención?
4. ¿Qué información necesita de la BD?

RESPONDE de forma coherente con el historial.`;
  }
  
  static async analyzeWithCoherence(params: {
    message: string;
    conversationHistory: Array<{role: string, content: string}>;
    currentProducts: Array<{name: string, price: number}>;
  }): Promise<{
    intent: string;
    product: string | null;
    confidence: number;
    reasoning: string;
  }> {
    
    const prompt = this.buildCoherentPrompt(params);
    
    const { OllamaService } = await import('./ollama-service');
    
    const response = await OllamaService.generateResponse({
      systemPrompt: prompt,
      messages: [{ role: 'user', content: params.message }]
    });
    
    // Parsear respuesta de Ollama
    return this.parseOllamaResponse(response.text);
  }
  
  private static parseOllamaResponse(text: string): {
    intent: string;
    product: string | null;
    confidence: number;
    reasoning: string;
  } {
    // Extraer intent, product, etc. de la respuesta de Ollama
    // Implementación específica según formato de respuesta
    
    return {
      intent: 'product_price', // Ejemplo
      product: 'HP Pavilion',
      confidence: 0.95,
      reasoning: text
    };
  }
}
```

## 🚀 Uso en el Sistema

### En `hybrid-learning-system.ts`

```typescript
// ANTES de consultar BD, analizar con Ollama
const analysis = await OllamaCoherenceService.analyzeWithCoherence({
  message: userMessage,
  conversationHistory: fullHistory,
  currentProducts: memory.productsInContext || []
});

// Ahora sabemos exactamente qué buscar en BD
const product = await db.product.findFirst({
  where: { name: { contains: analysis.product } }
});

// Responder con datos reales
return formatResponse(product);
```

## ✅ Resultado Esperado

### Conversación Coherente

```
Cliente: "Me interesa un computador para diseño"
Ollama: [Analiza: product_search, laptops, diseño]
Bot: "💻 Opciones para diseño:
     1. HP Pavilion - 1,850,000 COP
     2. ASUS VivoBook - 1,950,000 COP"

Cliente: "El primero"
Ollama: [Lee historial: "el primero" = HP Pavilion]
        [NO pregunta "¿cuál?"]
        [Busca en BD: HP Pavilion]
Bot: "💻 *HP Pavilion 15*
     💰 1,850,000 COP
     📋 Intel i5, 16GB RAM, 512GB SSD
     ¿Te gustaría comprarlo? 😊"

Cliente: "Sí"
Ollama: [Contexto: cliente quiere HP Pavilion]
        [Intent: payment_request]
Bot: "💳 *Métodos de Pago*
     Para: HP Pavilion - 1,850,000 COP
     ✅ Nequi: 3136174267..."

Cliente: "Tiene garantía?"
Ollama: [Contexto: pregunta sobre HP Pavilion]
        [Busca info de garantía en BD]
Bot: "✅ Sí, el HP Pavilion incluye:
     - 1 año de garantía del fabricante
     - Soporte técnico..."
```

---

**¡Prompt configurado para máxima coherencia!** 🧠✨
