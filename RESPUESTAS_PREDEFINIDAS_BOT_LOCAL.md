# 📝 RESPUESTAS PREDEFINIDAS DEL BOT LOCAL

## 🎯 Ubicación

**Archivo**: `src/lib/product-intelligence-service.ts`

El bot local tiene respuestas predefinidas según la **intención** del cliente.

## 🔍 Tipos de Intenciones

El sistema detecta 6 tipos de intenciones:

1. **info** - Quiere información del producto
2. **price** - Pregunta por el precio
3. **link** - Quiere el enlace de compra
4. **buy** - Quiere comprar
5. **availability** - Pregunta si está disponible
6. **general** - Pregunta general

## 📋 Respuestas Predefinidas

### 1. INFORMACIÓN (`info`)

**Cuándo se usa**: Cliente pide información, detalles, características

**Respuesta**:
```
🎹 **Curso de Piano Completo**

✅ +80 lecciones en video HD
✅ Acceso de por vida
✅ Soporte directo del profesor
✅ Certificado al finalizar

💰 Precio: 60,000 COP
📦 Producto digital - Disponible
📸 3 fotos disponibles

¿Te interesa?
```

**Código**:
```typescript
private static generateInfoResponse(product, emoji, links, images) {
  let response = `${emoji} **${product.name}**\n\n`
  
  // Características del producto
  if (product.description) {
    const lines = product.description.split(/[,\n]/)
    lines.slice(0, 5).forEach(line => {
      response += `✅ ${line.trim()}\n`
    })
  }
  
  response += `\n💰 Precio: ${product.price.toLocaleString('es-CO')} COP\n`
  
  if (product.stock) {
    response += `📦 ${product.stock} unidades disponibles\n`
  }
  
  response += `\n¿Te interesa?`
  return response
}
```

---

### 2. PRECIO (`price`)

**Cuándo se usa**: Cliente pregunta "cuánto cuesta", "precio", "valor"

**Respuesta**:
```
El Curso de Piano Completo cuesta 60,000 COP 🎹

Tenemos stock disponible.
¿Deseas el enlace de compra?
```

**Código**:
```typescript
private static generatePriceResponse(product, emoji, links) {
  let response = `El ${product.name} cuesta ${product.price.toLocaleString('es-CO')} COP ${emoji}\n\n`
  
  if (product.stock) {
    response += `Tenemos ${product.stock} unidades disponibles.\n`
  }
  
  if (links.buy) {
    response += `¿Deseas el enlace de compra?`
  } else {
    response += `¿Deseas más información o hacer el pedido?`
  }
  
  return response
}
```

---

### 3. LINK (`link`)

**Cuándo se usa**: Cliente pide "link", "enlace", "url", "página"

**Respuesta con enlace**:
```
¡Perfecto! 🎹

Aquí está el enlace de compra:
👉 https://pay.hotmart.com/I95497720H?checkoutMode=2&bid=1760738599205

Acceso inmediato después del pago ✅
```

**Respuesta sin enlace**:
```
Para adquirir Curso de Piano Completo 🎹, contáctanos:

📱 WhatsApp: +57 304 274 8687
📧 Email: deinermen25@gmail.com
```

**Código**:
```typescript
private static generateLinkResponse(product, emoji, links) {
  if (!links.buy && !links.info) {
    return `Para adquirir ${product.name} ${emoji}, contáctanos:\n\n📱 WhatsApp: +57 304 274 8687\n📧 Email: deinermen25@gmail.com`
  }
  
  let response = `¡Perfecto! ${emoji}\n\n`
  
  if (links.buy) {
    response += `Aquí está el enlace de compra:\n👉 ${links.buy}\n\n`
  }
  
  response += `Acceso inmediato después del pago ✅`
  return response
}
```

---

### 4. COMPRA (`buy`)

**Cuándo se usa**: Cliente dice "quiero comprar", "compra", "pedido"

**Respuesta con enlace**:
```
¡Excelente decisión! 🎉

Curso de Piano Completo: 60,000 COP

Compra aquí:
👉 https://pay.hotmart.com/...

Acceso inmediato después del pago ✅
```

**Respuesta sin enlace**:
```
¡Excelente decisión! 🎉

Curso de Piano Completo: 60,000 COP

Para hacer tu pedido:
📱 WhatsApp: +57 304 274 8687
📧 Email: deinermen25@gmail.com

¿Necesitas ayuda con algo más?
```

**Código**:
```typescript
private static generateBuyResponse(product, emoji, links) {
  let response = `¡Excelente decisión! 🎉\n\n`
  response += `${product.name}: ${product.price.toLocaleString('es-CO')} COP\n\n`
  
  if (links.buy) {
    response += `Compra aquí:\n👉 ${links.buy}\n\n`
    response += `Acceso inmediato después del pago ✅`
  } else {
    response += `Para hacer tu pedido:\n📱 WhatsApp: +57 304 274 8687\n📧 Email: deinermen25@gmail.com\n\n`
    response += `¿Necesitas ayuda con algo más?`
  }
  
  return response
}
```

---

### 5. DISPONIBILIDAD (`availability`)

**Cuándo se usa**: Cliente pregunta "disponible", "hay", "tienes", "stock"

**Respuesta con stock**:
```
🎹 Curso de Piano Completo

✅ Disponible: 5 unidades

¿Te gustaría hacer el pedido?
```

**Respuesta producto digital**:
```
🎹 Curso de Piano Completo

✅ Disponible (producto digital)

Acceso inmediato después de la compra
```

**Respuesta sin stock**:
```
🎹 Curso de Piano Completo

⚠️ Consultar disponibilidad

Contáctanos para verificar stock:
📱 +57 304 274 8687
```

**Código**:
```typescript
private static generateAvailabilityResponse(product, emoji) {
  let response = `${emoji} ${product.name}\n\n`
  
  if (product.stock && product.stock > 0) {
    response += `✅ Disponible: ${product.stock} unidad${product.stock > 1 ? 'es' : ''}\n\n`
    response += `¿Te gustaría hacer el pedido?`
  } else if (product.category === 'DIGITAL') {
    response += `✅ Disponible (producto digital)\n\n`
    response += `Acceso inmediato después de la compra`
  } else {
    response += `⚠️ Consultar disponibilidad\n\n`
    response += `Contáctanos para verificar stock:\n📱 +57 304 274 8687`
  }
  
  return response
}
```

---

### 6. GENERAL (`general`)

**Cuándo se usa**: Pregunta general que no encaja en las anteriores

**Respuesta**:
```
🎹 **Curso de Piano Completo**

💰 60,000 COP
📦 5 disponibles
📸 3 fotos

¿Qué te gustaría saber?
```

**Código**:
```typescript
private static generateGeneralResponse(product, emoji, links, images) {
  let response = `${emoji} **${product.name}**\n\n`
  response += `💰 ${product.price.toLocaleString('es-CO')} COP\n`
  
  if (product.stock) {
    response += `📦 ${product.stock} disponibles\n`
  }
  
  if (images.length > 0) {
    response += `📸 ${images.length} fotos\n`
  }
  
  response += `\n¿Qué te gustaría saber?`
  return response
}
```

---

## 🎨 Emojis por Producto

El bot usa emojis específicos según el tipo de producto:

```typescript
private static getProductEmoji(product) {
  const name = product.name.toLowerCase()
  
  if (name.includes('piano') || name.includes('música')) return '🎹'
  if (name.includes('laptop') || name.includes('computador')) return '💻'
  if (name.includes('macbook') || name.includes('apple')) return '🍎'
  if (name.includes('moto') || name.includes('pulsar')) return '🏍️'
  if (name.includes('curso') || name.includes('mega pack')) return '📚'
  if (name.includes('memoria') || name.includes('ram')) return '💾'
  if (name.includes('ssd') || name.includes('disco')) return '💿'
  if (name.includes('morral') || name.includes('mochila')) return '🎒'
  
  return '✨'
}
```

## 🔗 Enlaces Dinámicos

El bot genera enlaces automáticamente:

### Hotmart (si existe en tags)
```
https://pay.hotmart.com/I95497720H?checkoutMode=2&bid=1760738599205
```

### Mercado Pago (generado dinámicamente)
```
https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=curso-piano-completo-abc123&amount=60000&title=Curso%20de%20Piano%20Completo
```

### PayPal (generado dinámicamente)
```
https://www.paypal.com/paypalme/TecnovariedadesDS/60000?description=Curso%20de%20Piano%20Completo&invoice=INV-ABC123
```

## 📊 Cuándo se Usan

Estas respuestas predefinidas se usan cuando:

1. ✅ El sistema decide usar **Bot Local** (no Groq)
2. ✅ Se detecta un **producto específico**
3. ✅ Se identifica la **intención** del cliente
4. ✅ El mensaje es **simple y directo**

## 🎯 Ventajas

1. **Instantáneas**: No espera respuesta de IA
2. **Gratis**: No usa tokens de Groq
3. **Consistentes**: Siempre la misma estructura
4. **Precisas**: Información exacta de la BD
5. **Rápidas**: Responde en milisegundos

## 🔧 Cómo Personalizar

Para modificar las respuestas, edita las funciones en `src/lib/product-intelligence-service.ts`:

- `generateInfoResponse()` - Respuesta de información
- `generatePriceResponse()` - Respuesta de precio
- `generateLinkResponse()` - Respuesta de link
- `generateBuyResponse()` - Respuesta de compra
- `generateAvailabilityResponse()` - Respuesta de disponibilidad
- `generateGeneralResponse()` - Respuesta general

## ✅ Estado

Estas respuestas están activas y funcionando. El bot las usa automáticamente cuando detecta preguntas simples sobre productos.
