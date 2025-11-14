# 🎯 Mejora: Consultas Generales y Sin Reenvío de Fotos

## Problemas Resueltos

### 1. ❌ Problema: Reenvío de fotos en cada pregunta
**Antes:** Cada vez que el cliente preguntaba algo sobre el producto (precio, método de pago, etc.), el bot reenviaba la foto del producto.

**Ahora:** ✅ El bot solo envía la foto la primera vez que menciona el producto. Las preguntas de seguimiento se responden solo con texto.

### 2. ❌ Problema: Consultas generales sin opciones
**Antes:** Si el cliente preguntaba "impresora" o "laptop", el bot elegía un producto al azar y lo enviaba.

**Ahora:** ✅ El bot detecta consultas generales y muestra 3-5 opciones numeradas para que el cliente escoja.

## Cambios Implementados

### 📝 Archivo: `src/lib/intelligent-product-search.ts`

#### 1. Nueva interfaz para consultas generales
```typescript
interface ProductMatch {
    product?: any;              // Para consulta específica
    products?: any[];           // Para consulta general (múltiples opciones)
    confidence: number;
    reason: string;
    shouldSendPhoto: boolean;
    isGeneralQuery?: boolean;   // Indica si es consulta general
}
```

#### 2. Prompt mejorado para detectar consultas generales
La IA ahora distingue entre:
- **Consulta GENERAL**: "impresora", "laptop", "moto" → Devuelve múltiples opciones
- **Consulta ESPECÍFICA**: "impresora canon", "laptop ryzen 5" → Devuelve 1 producto

#### 3. Respuesta adaptada según tipo de consulta
```typescript
// CONSULTA GENERAL: Devolver múltiples opciones
if (analysis.isGeneralQuery && analysis.productIndexes) {
    return {
        products: selectedProducts,  // Array de productos
        isGeneralQuery: true,
        shouldSendPhoto: false       // No enviar fotos aún
    };
}

// CONSULTA ESPECÍFICA: Devolver un producto
if (analysis.productIndex) {
    return {
        product: singleProduct,
        isGeneralQuery: false,
        shouldSendPhoto: true        // Enviar foto
    };
}
```

### 📝 Archivo: `src/lib/baileys-stable-service.ts`

#### 1. Manejo de consultas generales
```typescript
// 🔍 CONSULTA GENERAL: Mostrar opciones sin fotos
if (productMatch.isGeneralQuery && productMatch.products) {
    // Crear mensaje con opciones numeradas
    let optionsMessage = '¡Claro! Tengo varias opciones para ti:\n\n'
    
    productMatch.products.forEach((product, index) => {
        optionsMessage += `${index + 1}️⃣ *${product.name}*\n`
        optionsMessage += `   💰 ${product.price} COP\n`
        optionsMessage += `   📝 ${product.description}...\n\n`
    })
    
    optionsMessage += '¿Cuál te interesa? Puedes decirme el número o el nombre 😊'
    
    // Enviar solo texto, sin fotos
    await socket.sendMessage(from, { text: optionsMessage })
}
```

#### 2. Eliminado reenvío de fotos en seguimiento
```typescript
// ❌ ANTES: Reenviaba foto en cada pregunta
if (context && context.lastProductId && asksForMoreInfo) {
    await ProductPhotoSender.sendSingleProductWithPhoto(...)
}

// ✅ AHORA: Solo continúa conversación con texto
console.log('[Baileys] 💬 Continuando conversación sin reenviar fotos')
```

## Ejemplos de Uso

### Ejemplo 1: Consulta General
```
Cliente: "Hola, tienes impresoras?"

Bot: "¡Claro! Tengo varias opciones para ti:

1️⃣ *Impresora Canon Multifuncional G3170*
   💰 899,000 COP
   📝 Tinta continua, WiFi, imprime, escanea y copia...

2️⃣ *Impresora HP DeskJet 2775*
   💰 349,000 COP
   📝 Multifuncional, WiFi, ideal para hogar...

3️⃣ *Impresora Epson EcoTank L3250*
   💰 799,000 COP
   📝 Sistema de tanque de tinta, bajo costo por página...

¿Cuál te interesa? Puedes decirme el número o el nombre 😊"

Cliente: "La 1"

Bot: [Envía foto + información completa de la Canon G3170]
```

### Ejemplo 2: Consulta Específica
```
Cliente: "Tienes la impresora Canon G3170?"

Bot: [Envía directamente foto + información del producto]
```

### Ejemplo 3: Preguntas de Seguimiento (Sin Reenvío)
```
Cliente: "Estoy interesado en una impresora"
Bot: [Envía foto de Impresora Canon G3170]

Cliente: "Tienes más información?"
Bot: "¡Claro! La Impresora Canon G3170 tiene:
     - Sistema de tinta continua
     - Conexión WiFi
     - Imprime, escanea y copia
     - Bajo costo por página
     ¿Te gustaría saber algo más?"
     [NO reenvía la foto]

Cliente: "Y cuál sería el método de pago?"
Bot: "Aceptamos varios métodos:
     💳 Tarjetas de crédito/débito
     📱 Nequi, Daviplata
     💰 Transferencia bancaria
     ¿Cuál prefieres?"
     [NO reenvía la foto]
```

## Beneficios

✅ **Mejor experiencia de usuario**: No spam de fotos repetidas
✅ **Más opciones**: El cliente puede comparar antes de decidir
✅ **Conversación natural**: Flujo de venta más profesional
✅ **Menos consumo de datos**: Solo envía fotos cuando es necesario
✅ **Más control**: El cliente escoge lo que quiere ver

## Próximos Pasos

Para probar los cambios:

1. Reinicia el servidor:
```bash
npm run dev
```

2. Prueba con consultas generales:
   - "Hola, tienes laptops?"
   - "Necesito una impresora"
   - "Qué motos tienes?"

3. Prueba preguntas de seguimiento:
   - Después de recibir un producto, pregunta: "Cuál es el precio?"
   - Verifica que NO reenvíe la foto

## Notas Técnicas

- La IA usa el modelo `llama-3.3-70b-versatile` de Groq
- Confianza mínima: 70% para considerar un match válido
- Máximo de opciones en consulta general: 5 productos
- El contexto de conversación se mantiene por 24 horas
