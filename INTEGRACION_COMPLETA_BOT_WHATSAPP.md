# 🤖 Integración Completa: Bot WhatsApp con Fotos + Links Dinámicos

## 🎯 Flujo Completo Integrado

El bot debe hacer esto en cada conversación:

### 1️⃣ **Búsqueda de Producto**
```
Usuario: "¿tienen laptops?"
Bot: "Sí, tenemos 3 opciones..."
Bot: 📸 ENVÍA FOTOS de las 3 laptops
Bot: "¿Cuál te interesa?"
```

### 2️⃣ **Información del Producto**
```
Usuario: "La HP, ¿qué especificaciones tiene?"
Bot: "Intel Core i5, 8GB RAM, 256GB SSD..."
Bot: 📸 ENVÍA FOTO de la Laptop HP
Bot: "¿Te interesa?"
```

### 3️⃣ **Métodos de Pago Dinámicos**
```
Usuario: "¿método de pago?"
Bot: "Nequi, Daviplata, Tarjeta, PayPal..."
Bot: 🔗 GENERA LINKS DINÁMICOS para cada método
Bot: "¿Cuál prefieres?"
```

### 4️⃣ **Confirmación con Link**
```
Usuario: "por tarjeta"
Bot: "Aquí está tu link de pago:"
Bot: 🔗 ENVÍA LINK DINÁMICO (precio actualizado)
Bot: "Válido por 2 horas ⏰"
```

## 🔧 Servicios a Integrar

### Servicio 1: Links Dinámicos
**Archivo**: `src/lib/dynamic-payment-links.ts`

```typescript
// Generar link dinámico con precio actualizado
const link = await DynamicPaymentLinks.generatePaymentLink({
  products: ['laptop-hp-001'],
  total: 2500000,  // Precio actualizado de BD
  userId: userId,
  paymentMethod: 'tarjeta',
  expiresIn: 120  // 2 horas
})

// Resultado: URL con token único
// https://app.com/payment?token=eyJ...
```

### Servicio 2: Envío de Fotos
**Archivo**: `src/lib/local-ai-smart-photos.ts`

```typescript
// Enviar fotos inteligentemente
const result = await LocalAISmartPhotos.sendSmartPhotos(
  socket,
  from,
  products,  // Array de productos
  'search',  // Intención (search=3 fotos, purchase=1 foto)
  userId
)

// Resultado: { sent: 3, failed: 0, errors: [] }
```

## 📋 Implementación en el Bot

### Paso 1: Cuando Busca Productos
```typescript
// En baileys-local-ai-integration.ts
if (aiResponse.shouldSendPhotos && aiResponse.photoProductIds) {
  // Obtener productos
  const products = await db.product.findMany({
    where: { id: { in: aiResponse.photoProductIds } }
  })

  // ENVIAR FOTOS
  await LocalAISmartPhotos.sendSmartPhotos(
    socket,
    from,
    products,
    aiResponse.intent,
    userId
  )
}
```

### Paso 2: Cuando Muestra Métodos de Pago
```typescript
// Generar links dinámicos para cada método
const paymentLinks = await DynamicPaymentLinks.generateMultiPaymentLinks(
  products,
  userId
)

// Resultado:
// {
//   "Nequi": "https://app.com/payment?token=...",
//   "Daviplata": "https://app.com/payment?token=...",
//   "Tarjeta": "https://app.com/payment?token=..."
// }

// Enviar links en el mensaje
const message = `💳 Métodos de pago:\n\n`
  + `💚 Nequi: ${paymentLinks.Nequi}\n`
  + `💙 Daviplata: ${paymentLinks.Daviplata}\n`
  + `💳 Tarjeta: ${paymentLinks.Tarjeta}`

await socket.sendMessage(from, { text: message })
```

### Paso 3: Cuando Usuario Elige Método
```typescript
// Generar link específico con precio actualizado
const link = await DynamicPaymentLinks.generatePaymentLink({
  products: productIds,
  total: precioActualizado,  // Desde BD
  userId: userId,
  paymentMethod: metodoElegido,
  expiresIn: 120
})

// Enviar link
const message = `¡Perfecto! 💳\n\n🔗 ${link.url}\n\nVálido por 2 horas ⏰`
await socket.sendMessage(from, { text: message })
```

## 🎨 Flujo Completo en Código

```typescript
// En local-ai-only-service.ts
async processMessage(userMessage, userId, history, from) {
  // 1. Detectar intención
  const intent = this.detectIntent(userMessage)
  
  // 2. Buscar productos
  let products = this.findRelevantProducts(userMessage, intent)
  
  // 3. Generar respuesta
  const response = this.generateResponse(userMessage, intent, products)
  
  // 4. ENVIAR FOTOS si es necesario
  if (intent === 'product_search' || intent === 'product_info') {
    await LocalAISmartPhotos.sendSmartPhotos(
      socket,
      from,
      products,
      intent,
      userId
    )
  }
  
  // 5. GENERAR LINKS DINÁMICOS si es pago
  if (intent === 'payment') {
    const paymentLinks = await DynamicPaymentLinks.generateMultiPaymentLinks(
      products,
      userId
    )
    
    // Incluir links en respuesta
    response += '\n\n💳 Links de pago:\n'
    for (const [method, link] of Object.entries(paymentLinks)) {
      response += `${method}: ${link}\n`
    }
  }
  
  return {
    message: response,
    intent,
    confidence,
    shouldSendPhotos: true,  // Ya enviadas
    paymentLinks: paymentLinks || {}
  }
}
```

## 📊 Flujo Completo Paso a Paso

```
┌─────────────────────────────────────────────────────────────┐
│ 1. BÚSQUEDA                                                 │
├─────────────────────────────────────────────────────────────┤
│ Usuario: "¿tienen laptops?"                                 │
│ Bot: "Sí, tenemos 3 opciones..."                           │
│ Bot: 📸 ENVÍA 3 FOTOS (LocalAISmartPhotos)                │
│ Bot: "¿Cuál te interesa?"                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. INFORMACIÓN                                              │
├─────────────────────────────────────────────────────────────┤
│ Usuario: "La HP, ¿especificaciones?"                       │
│ Bot: "Intel Core i5, 8GB RAM, 256GB SSD..."               │
│ Bot: 📸 ENVÍA 1 FOTO (LocalAISmartPhotos)                 │
│ Bot: "¿Te interesa?"                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. COMPRA                                                   │
├─────────────────────────────────────────────────────────────┤
│ Usuario: "Quiero comprarla"                                │
│ Bot: "Aquí está tu resumen: $2.500.000"                   │
│ Bot: "¿Método de pago?"                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. MÉTODOS DE PAGO (LINKS DINÁMICOS)                       │
├─────────────────────────────────────────────────────────────┤
│ Bot: "Métodos disponibles:"                                │
│ Bot: 🔗 GENERA LINKS (DynamicPaymentLinks)                │
│ Bot: "💚 Nequi: https://app.com/payment?token=..."        │
│ Bot: "💙 Daviplata: https://app.com/payment?token=..."    │
│ Bot: "💳 Tarjeta: https://app.com/payment?token=..."      │
│ Bot: "¿Cuál prefieres?"                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. CONFIRMACIÓN                                             │
├─────────────────────────────────────────────────────────────┤
│ Usuario: "Por tarjeta"                                      │
│ Bot: "¡Perfecto! 💳"                                       │
│ Bot: 🔗 ENVÍA LINK DINÁMICO (precio actualizado)          │
│ Bot: "https://app.com/payment?token=..."                  │
│ Bot: "Válido por 2 horas ⏰"                               │
└─────────────────────────────────────────────────────────────┘
```

## ✅ Checklist de Integración

- [ ] Importar `LocalAISmartPhotos` en `baileys-local-ai-integration.ts`
- [ ] Importar `DynamicPaymentLinks` en `baileys-local-ai-integration.ts`
- [ ] Agregar envío de fotos después de respuesta de búsqueda
- [ ] Agregar generación de links dinámicos en métodos de pago
- [ ] Actualizar precios desde BD (no hardcodeados)
- [ ] Probar flujo completo en WhatsApp
- [ ] Verificar que fotos se envían correctamente
- [ ] Verificar que links dinámicos funcionan
- [ ] Verificar que precios son dinámicos

## 🚀 Comandos para Probar

```bash
# 1. Iniciar bot
npm run dev

# 2. Enviar mensaje en WhatsApp
"¿tienen laptops?"

# 3. Verificar que:
# ✅ Bot responde
# ✅ Envía 3 fotos
# ✅ Pregunta cuál interesa

# 4. Enviar siguiente mensaje
"La HP, ¿especificaciones?"

# 5. Verificar que:
# ✅ Bot muestra especificaciones
# ✅ Envía 1 foto
# ✅ Pregunta si interesa

# 6. Enviar siguiente mensaje
"Quiero comprarla"

# 7. Verificar que:
# ✅ Bot muestra resumen
# ✅ Pregunta método de pago

# 8. Enviar siguiente mensaje
"¿método de pago?"

# 9. Verificar que:
# ✅ Bot genera links dinámicos
# ✅ Envía links con precios actualizados
# ✅ Links son únicos (tokens diferentes)

# 10. Enviar siguiente mensaje
"por tarjeta"

# 11. Verificar que:
# ✅ Bot envía link específico
# ✅ Link tiene precio correcto
# ✅ Link es válido por 2 horas
```

## 📝 Resumen

El bot ahora debe:
1. ✅ **Enviar fotos** de productos (LocalAISmartPhotos)
2. ✅ **Generar links dinámicos** con precios actualizados (DynamicPaymentLinks)
3. ✅ **Mantener flujo completo** sin estancarse
4. ✅ **Responder contextuales** en cada etapa

---

**Última actualización**: 2025-11-15
**Versión**: 4.0 (Integración Completa)
**Estado**: 🟢 Listo para Implementar
