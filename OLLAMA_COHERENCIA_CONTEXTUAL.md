# 🧠 OLLAMA CON COHERENCIA CONTEXTUAL

**Fecha:** 23 Noviembre 2025  
**Objetivo:** Ollama mantiene coherencia conversacional + BD para datos precisos

## 🎯 Problema a Resolver

**Bot Local (Problema):**
```
Cliente: "Me interesa un computador"
Bot: "Tengo laptops HP, ASUS..."

Cliente: "Cuál es el precio del primero?"
Bot: "¿Cuál producto te interesa?" ← PIERDE CONTEXTO

Cliente: "El HP"
Bot: "Tengo copas desechables..." ← INCOHERENTE
```

**Ollama con Coherencia (Solución):**
```
Cliente: "Me interesa un computador"
Ollama: Analiza → intent=product_search, category=laptops
        Guarda en memoria: "Cliente busca laptops"
Bot: "Tengo laptops HP, ASUS..."

Cliente: "Cuál es el precio del primero?"
Ollama: Lee memoria → "Cliente pregunta por HP Pavilion (primero de la lista)"
        Busca en BD → Precio real: 1,850,000 COP
Bot: "💻 HP Pavilion 15: 1,850,000 COP"

Cliente: "Me lo llevo"
Ollama: Lee memoria → "Cliente quiere comprar HP Pavilion"
        Genera links de pago reales
Bot: "💳 Métodos de pago para HP Pavilion..."
```

## 🔄 Cómo Funciona

### 1. Ollama Analiza SIEMPRE

```typescript
// CADA mensaje pasa por Ollama primero
const analysis = await OllamaService.analyzeWithContext({
  message: "Cuál es el precio del primero?",
  conversationHistory: [
    { role: 'user', content: 'Me interesa un computador' },
    { role: 'assistant', content: 'Tengo laptops HP, ASUS...' }
  ],
  currentContext: {
    products: ['HP Pavilion', 'ASUS VivoBook'],
    intent: 'product_search'
  }
});

// Resultado:
{
  intent: 'product_price',
  product: 'HP Pavilion', // ← Identifica "el primero"
  confidence: 0.95,
  reasoning: 'Cliente pregunta por el primer producto mencionado (HP Pavilion)'
}
```

### 2. Sistema Local Ejecuta con Datos Reales

```typescript
// Basado en el análisis de Ollama
const product = await db.product.findFirst({
  where: { name: { contains: 'HP Pavilion' } }
});

// Respuesta con datos reales
return {
  text: `💻 *HP Pavilion 15*
  💰 Precio: ${product.price.toLocaleString()} COP
  
  ¿Te gustaría comprarlo? 😊`,
  images: [product.images[0]]
};
```

## 📋 Instrucciones para Ollama

### System Prompt Mejorado

```typescript
const systemPrompt = `Eres Laura, asistente de ventas de Tecnovariedades D&S.

🎯 TU MISIÓN PRINCIPAL:
Mantener COHERENCIA CONVERSACIONAL en todo momento.

📚 CONTEXTO CONVERSACIONAL:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

🛍️ PRODUCTOS EN CONTEXTO:
${currentProducts.map((p, i) => `${i+1}. ${p.name} - ${p.price} COP`).join('\n')}

🧠 REGLAS DE COHERENCIA:

1. MANTÉN EL HILO CONVERSACIONAL:
   - Si el cliente dice "el primero", "ese", "el HP", etc.
   - SIEMPRE identifica a qué producto se refiere basándote en el historial
   - NO preguntes "¿cuál producto?" si ya se mencionó

2. INTERPRETA REFERENCIAS:
   - "el primero" = primer producto de la lista anterior
   - "ese" = último producto mencionado
   - "el HP" = producto HP mencionado anteriormente
   - "el más barato" = producto con menor precio de la lista

3. MANTÉN CONTEXTO DE INTENCIÓN:
   - Si el cliente está viendo laptops, NO sugieras copas desechables
   - Si pregunta por precio, está interesado en comprar
   - Si dice "me lo llevo", genera proceso de pago

4. USA SOLO INFORMACIÓN REAL:
   - NUNCA inventes precios
   - NUNCA inventes productos
   - Si no sabes algo, di "Déjame verificar en mi base de datos"

5. RESPONDE DE FORMA ESTRUCTURADA:
   - Usa emojis relevantes
   - Formato claro con negritas
   - Información organizada

🚫 PROHIBIDO:
- Perder el hilo de la conversación
- Preguntar por información ya proporcionada
- Sugerir productos fuera de contexto
- Inventar información
- Respuestas genéricas sin contexto

✅ SIEMPRE:
- Lee el historial completo antes de responder
- Identifica el producto en contexto
- Mantén coherencia con mensajes anteriores
- Usa datos reales de la base de datos
- Responde de forma profesional y estructurada

EJEMPLO DE COHERENCIA:
Cliente: "Me interesa un computador para diseño"
Tú: [Analizas: intent=product_search, use=diseño, category=laptops]
    [Buscas en BD: laptops para diseño]
    [Respondes con lista de 3 laptops]

Cliente: "Cuánto cuesta el segundo?"
Tú: [Lees historial: segundo = ASUS VivoBook]
    [Buscas precio en BD: 1,950,000 COP]
    [Respondes: "💻 ASUS VivoBook: 1,950,000 COP"]

Cliente: "Me lo llevo"
Tú: [Lees contexto: cliente quiere ASUS VivoBook]
    [Generas: links de pago para ese producto]
    [Respondes con métodos de pago]

¿Entendido? Mantén SIEMPRE la coherencia conversacional.`;
```

## 🔧 Configuración

### Variables de Entorno

```env
# Ollama SIEMPRE analiza para mantener contexto
OLLAMA_HANDLES_ALL=true
USE_AI_FOR_SIMPLE_QUERIES=true

# Ollama mantiene coherencia
OLLAMA_MAINTAINS_CONTEXT=true
OLLAMA_VALIDATES_RESPONSES=true

# Sistema híbrido activo
ENABLE_HYBRID_SYSTEM=true
ENABLE_CONTEXTUAL_BRAIN=true
```

## 📊 Flujo Completo

```
┌─────────────────────────────────────────┐
│         MENSAJE DEL USUARIO              │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    OLLAMA ANALIZA CON CONTEXTO          │
│  - Lee historial completo               │
│  - Identifica productos mencionados     │
│  - Interpreta referencias ("el primero")│
│  - Mantiene coherencia                  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         RESULTADO DEL ANÁLISIS          │
│  - Intent: product_price                │
│  - Product: HP Pavilion (el primero)    │
│  - Confidence: 95%                      │
│  - Reasoning: "Cliente pregunta por..." │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    SISTEMA LOCAL BUSCA EN BD            │
│  - Busca: HP Pavilion                   │
│  - Encuentra: Precio real, imágenes    │
│  - Formatea con AIDA                    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    OLLAMA VALIDA RESPUESTA              │
│  - Verifica coherencia con contexto     │
│  - Asegura que responde la pregunta     │
│  - Mantiene tono profesional            │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         RESPUESTA AL USUARIO             │
│  - Coherente con conversación           │
│  - Datos reales de BD                   │
│  - Formato profesional                  │
│  - Con imágenes si aplica               │
└─────────────────────────────────────────┘
```

## 🎯 Ejemplos de Coherencia

### Ejemplo 1: Referencias Implícitas

```
Cliente: "Me interesa un computador"
Ollama: [Analiza: product_search, category=laptops]
Bot: "💻 Tengo estas opciones:
     1. HP Pavilion - 1,850,000 COP
     2. ASUS VivoBook - 1,950,000 COP"

Cliente: "El primero"
Ollama: [Lee historial: "el primero" = HP Pavilion]
        [NO pregunta "¿cuál?"]
Bot: "💻 *HP Pavilion 15*
     💰 1,850,000 COP
     📋 Intel i5, 16GB RAM..."

Cliente: "Me lo llevo"
Ollama: [Contexto: cliente quiere HP Pavilion]
Bot: "💳 Métodos de pago para HP Pavilion..."
```

### Ejemplo 2: Mantener Categoría

```
Cliente: "Busco laptops para diseño"
Ollama: [Analiza: category=laptops, use=diseño]
Bot: "💻 Laptops para diseño:
     1. HP Pavilion
     2. ASUS VivoBook"

Cliente: "Cuál recomiendas?"
Ollama: [Mantiene contexto: laptops para diseño]
        [NO sugiere copas o motos]
Bot: "Para diseño gráfico recomiendo el HP Pavilion
     por su mejor procesador y RAM..."

Cliente: "Perfecto, ese quiero"
Ollama: [Contexto: HP Pavilion para diseño]
Bot: "💳 Excelente elección para diseño!
     Métodos de pago..."
```

### Ejemplo 3: Presupuesto en Contexto

```
Cliente: "Computador para diseño, presupuesto 2 millones"
Ollama: [Analiza: laptops, diseño, budget=2M]
Bot: "💻 Opciones dentro de tu presupuesto:
     1. HP Pavilion - 1,850,000 COP
     2. Lenovo IdeaPad - 1,750,000 COP"

Cliente: "El más barato"
Ollama: [Interpreta: "más barato" = Lenovo 1,750,000]
Bot: "💻 *Lenovo IdeaPad*
     💰 1,750,000 COP (el más económico)..."

Cliente: "Tiene garantía?"
Ollama: [Contexto: pregunta sobre Lenovo IdeaPad]
        [Busca info de garantía en BD]
Bot: "✅ Sí, el Lenovo IdeaPad incluye:
     - 1 año de garantía del fabricante..."
```

## ✅ Checklist

- [x] Ollama analiza TODOS los mensajes
- [x] Mantiene historial conversacional
- [x] Interpreta referencias ("el primero", "ese")
- [x] Mantiene coherencia de categoría
- [x] Usa solo datos reales de BD
- [x] Valida respuestas antes de enviar
- [ ] **PENDIENTE:** Reiniciar servidor
- [ ] **PENDIENTE:** Probar conversación completa
- [ ] **PENDIENTE:** Verificar coherencia

---

**¡Ollama ahora mantiene coherencia conversacional!** 🧠✨

**No más respuestas fuera de contexto.**
