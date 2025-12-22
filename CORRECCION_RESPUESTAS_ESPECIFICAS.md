# 🔧 CORRECCIÓN: Respuestas Específicas de Productos

## 🎯 Problema Identificado

Cuando el cliente pregunta por un producto específico como:
- "Me interesa el megapack de idiomas"
- "Quiero el curso de piano"
- "Cuánto cuesta el portátil ASUS"

El bot responde con un **menú genérico** en lugar de información **específica del producto**.

## ❌ Comportamiento Actual (INCORRECTO)

```
Cliente: "Me interesa el megapack de idiomas"

Bot: "¡Hola! 👋 Bienvenido a *Tecnovariedades D&S*

Tengo estas opciones para ti:

1️⃣ 📚 *Mega Pack 29: Cursos Administración*
   💰 20.000 COP
   🎓 Mega Pack completo de Administración
   
2️⃣ 📚 *Mega Pack 36: Cursos E-commerce*
   💰 20.000 COP
   🎓 Mega Pack completo de E-commerce
   
3️⃣ 📚 *Mega Pack 28: Cursos Contabilidad*
   💰 20.000 COP
   🎓 Mega Pack completo de Contabilidad..."
```

## ✅ Comportamiento Esperado (CORRECTO)

```
Cliente: "Me interesa el megapack de idiomas"

Bot: "¡Perfecto! 🎓 Te cuento sobre el *Megapack de Idiomas*

📚 *Contenido:*
- Inglés completo (básico a avanzado)
- Francés conversacional
- Alemán para principiantes
- Italiano básico
- Portugués brasileño

💰 *Precio:* 20.000 COP

✨ *Incluye:*
- Videos HD
- Material descargable
- Certificados
- Acceso de por vida

¿Te gustaría comprarlo? Puedo enviarte el link de pago 💳"
```

## 🔍 Causa del Problema

El método `analyzeIntent` en `plantillas-respuestas-bot.ts`:
1. ✅ Detecta correctamente que hay interés en un producto
2. ❌ NO busca ese producto específico en la BD
3. ❌ Responde con plantilla genérica de saludo

## 🛠️ Solución Necesaria

### 1. Agregar Búsqueda de Producto en analyzeIntent

Cuando se detecta interés en un producto específico:
```typescript
// Detectar interés en producto
if (this.isProductInterest(message)) {
  // BUSCAR EL PRODUCTO EN LA BD
  const productName = this.extractProductName(message);
  const products = await db.product.findMany({
    where: {
      userId,
      OR: [
        { name: { contains: productName, mode: 'insensitive' } },
        { description: { contains: productName, mode: 'insensitive' } },
        { tags: { has: productName } }
      ]
    },
    take: 1
  });
  
  if (products.length > 0) {
    const product = products[0];
    
    // Retornar con información específica del producto
    return {
      intent: 'product_interest',
      confidence: 95,
      entities: {
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description
        }
      },
      responseTemplate: 'specific_product_info',
      templateData: {
        product_name: product.name,
        price: Utils.formatPrice(product.price),
        description: product.description
      },
      needsPhoto: false,
      useAI: false
    };
  }
}
```

### 2. Agregar Plantilla para Producto Específico

```typescript
specific_product_info: `¡Perfecto! 🎓 Te cuento sobre *{product_name}*

📚 *Descripción:*
{description}

💰 *Precio:* {price}

✨ *Características:*
- Acceso inmediato
- Material completo
- Soporte incluido

¿Te gustaría comprarlo? Puedo enviarte el link de pago 💳`
```

### 3. Mejorar Extracción de Nombre de Producto

```typescript
private static extractProductName(message: string): string {
  const msg = message.toLowerCase();
  
  // Patrones comunes
  const patterns = [
    /(?:megapack|mega pack|pack)\s+de\s+([a-záéíóúñ\s]+)/i,
    /(?:curso|cursos)\s+de\s+([a-záéíóúñ\s]+)/i,
    /(?:portátil|portatil|laptop)\s+([a-záéíóúñ\s]+)/i,
    /(?:interesa|quiero|necesito)\s+(?:el|la|los|las)?\s*([a-záéíóúñ\s]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = msg.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  // Fallback: toda la frase después de palabras clave
  return msg
    .replace(/^(me interesa|quiero|necesito|busco|dame)\s+/i, '')
    .replace(/^(el|la|los|las)\s+/i, '')
    .trim();
}
```

## 📊 Flujo Correcto

```
1. Cliente: "Me interesa el megapack de idiomas"
   ↓
2. analyzeIntent detecta: product_interest
   ↓
3. Extrae nombre: "idiomas"
   ↓
4. Busca en BD: WHERE name LIKE '%idiomas%'
   ↓
5. Encuentra: "Megapack de Idiomas"
   ↓
6. Retorna análisis con datos del producto
   ↓
7. generateResponse usa plantilla específica
   ↓
8. Bot responde con información del producto encontrado
```

## 🎯 Beneficios

### ✅ Conversación Natural
- Cliente pregunta por producto específico
- Bot responde con ese producto específico
- No muestra menú genérico innecesario

### ✅ Mejor Experiencia
- Respuesta directa y relevante
- Cliente obtiene lo que pidió
- Menos fricción en la conversación

### ✅ Mayor Conversión
- Cliente ve exactamente lo que quiere
- Información clara y concisa
- Call-to-action directo (link de pago)

## 🚀 Implementación

Necesito modificar:
1. `src/lib/plantillas-respuestas-bot.ts` - Método `analyzeIntent`
2. Agregar búsqueda en BD cuando detecta interés en producto
3. Agregar plantilla `specific_product_info`
4. Mejorar método `extractProductName`

## 📝 Ejemplo Completo

### Caso 1: Megapack de Idiomas
```
Cliente: "Me interesa el megapack de idiomas"
Bot: [Busca en BD "idiomas"]
Bot: [Encuentra "Megapack de Idiomas - 20.000 COP"]
Bot: "¡Perfecto! 🎓 Te cuento sobre el *Megapack de Idiomas*..."
```

### Caso 2: Curso de Piano
```
Cliente: "Cuánto cuesta el curso de piano"
Bot: [Busca en BD "piano"]
Bot: [Encuentra "Curso Completo de Piano - 50.000 COP"]
Bot: "¡Hola! 🎹 El *Curso Completo de Piano* cuesta 50.000 COP..."
```

### Caso 3: Portátil ASUS
```
Cliente: "Quiero el portátil ASUS"
Bot: [Busca en BD "asus"]
Bot: [Encuentra "Portátil ASUS ROG - 2.500.000 COP"]
Bot: "¡Excelente elección! 💻 El *Portátil ASUS ROG*..."
```

---

**Estado:** PENDIENTE DE IMPLEMENTACIÓN
**Prioridad:** ALTA (afecta experiencia del usuario)
**Impacto:** CRÍTICO (conversaciones no son naturales)
