# 🎯 Mejora de Respuesta Local con AIDA

## Código a Reemplazar

En `src/lib/intelligent-conversation-engine.ts`, línea ~605, reemplazar el bloque que genera la respuesta local:

```typescript
// ANTES (línea ~605)
if (foundProducts.length > 0) {
  console.log(`[IntelligentEngine] ✅ Encontrados ${foundProducts.length} productos, generando respuesta local...`);
  
  const product = foundProducts[0];
  
  let response = `¡Claro! 😊 Tengo información sobre *${product.name}*\n\n`;
  
  if (product.description) {
    response += `📝 *Descripción:*\n${product.description}\n\n`;
  }
  
  response += `💰 *Precio:* ${product.price.toLocaleString('es-CO')} COP\n`;
  response += `📦 *Categoría:* ${product.category}\n\n`;
  
  if (foundProducts.length > 1) {
    response += `También tengo ${foundProducts.length - 1} producto(s) similar(es). ¿Te gustaría ver más opciones?\n\n`;
  }
  
  response += `¿Te interesa este producto? Puedo darte más información o los métodos de pago 😊`;
  
  return {
    text: response,
    confidence: 0.7,
    context: {
      currentProduct: {
        id: product.id,
        name: product.name,
        price: product.price
      }
    }
  };
}
```

## NUEVO CÓDIGO (con AIDA + Imagen)

```typescript
if (foundProducts.length > 0) {
  console.log(`[IntelligentEngine] ✅ Encontrados ${foundProducts.length} productos, generando respuesta local con AIDA...`);
  
  const product = foundProducts[0];
  
  // 🎯 METODOLOGÍA AIDA (Atención, Interés, Deseo, Acción)
  
  // A - ATENCIÓN: Confirmar que tenemos lo que busca
  let response = `¡Sí! 😊 Tenemos disponible el *${product.name}*\n\n`;
  
  // I - INTERÉS: Descripción atractiva
  if (product.description) {
    const desc = product.description.substring(0, 200);
    response += `✨ ${desc}${product.description.length > 200 ? '...' : ''}\n\n`;
  }
  
  // D - DESEO: Precio y beneficios
  response += `💰 *Precio:* $${product.price.toLocaleString('es-CO')} COP\n\n`;
  
  // Beneficios según categoría
  if (product.category === 'DIGITAL') {
    response += `✅ *Incluye:*\n`;
    response += `• Acceso inmediato después del pago\n`;
    response += `• Contenido descargable\n`;
    response += `• Acceso de por vida\n`;
    response += `• Soporte incluido\n\n`;
  }
  
  // A - ACCIÓN: Call to action natural
  response += `¿Te gustaría conocer los métodos de pago? 😊`;
  
  // Preparar imagen para enviar
  let imageUrl = null;
  if (product.images) {
    try {
      const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      if (Array.isArray(images) && images.length > 0) {
        imageUrl = images[0];
      }
    } catch (e) {
      console.log('[IntelligentEngine] ⚠️ Error parseando imágenes');
    }
  }
  
  return {
    text: response,
    confidence: 0.8,
    context: {
      currentProduct: {
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images
      }
    },
    // Marcar que debe enviar imagen
    actions: imageUrl ? [{
      type: 'send_image',
      imageUrl: imageUrl,
      product: product
    }] : []
  };
}
```

## Cambios Principales

### 1. Metodología AIDA
- **A**tención: "¡Sí! Tenemos disponible..."
- **I**nterés: Descripción atractiva con emoji
- **D**eseo: Precio + beneficios específicos
- **A**cción: "¿Te gustaría conocer los métodos de pago?"

### 2. Envío de Imagen
- Parsea las imágenes del producto
- Agrega acción `send_image` para que el bot envíe la foto
- El sistema de integración de Baileys procesará esta acción

### 3. Beneficios Dinámicos
- Para productos DIGITALES: acceso inmediato, descargable, de por vida
- Se puede extender para productos FÍSICOS

## Resultado

**ANTES:**
```
¡Claro! 😊 Tengo información sobre *Mega Pack 08: Cursos Idiomas*

📝 *Descripción:*
Más de 90 cursos de idiomas...

💰 *Precio:* 20.000 COP
📦 *Categoría:* DIGITAL

¿Te interesa este producto? Puedo darte más información o los métodos de pago 😊
```

**AHORA:**
```
[IMAGEN DEL PRODUCTO]

¡Sí! 😊 Tenemos disponible el *Mega Pack 08: Cursos Idiomas*

✨ Más de 90 cursos de idiomas. Inglés, francés, alemán, italiano, portugués, chino, japonés. Desde nivel básico hasta avanzado...

💰 *Precio:* $20.000 COP

✅ *Incluye:*
• Acceso inmediato después del pago
• Contenido descargable
• Acceso de por vida
• Soporte incluido

¿Te gustaría conocer los métodos de pago? 😊
```

## Instrucciones

1. Abre `src/lib/intelligent-conversation-engine.ts`
2. Busca la línea ~605 donde dice "generando respuesta local"
3. Reemplaza todo el bloque `if (foundProducts.length > 0) { ... }` con el nuevo código
4. Guarda el archivo
5. Reinicia el bot

El bot ahora enviará la imagen del producto y usará AIDA para persuadir al cliente.
