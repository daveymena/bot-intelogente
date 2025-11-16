# 🚀 GUÍA: Implementar Envío de Múltiples Productos

## 📋 Resumen de Cambios Necesarios

Hemos identificado y arreglado los problemas de contexto. Ahora necesitas implementar el formato mejorado para múltiples productos.

## ✅ Lo que YA está Arreglado

1. ✅ **Contexto de conversación** - Ya no se confunde al cambiar de producto
2. ✅ **Links de pago** - Ya genera links reales
3. ✅ **"Mercado Libre"** - Ya no lo confunde con MercadoPago
4. ✅ **"Me interesa"** - Ya maneja correctamente el cambio de producto

## 🔧 Lo que Falta Implementar

### Sistema de Múltiples Productos con Fotos

**Problema Actual:**
- Envía 1 foto arriba
- Envía info de 3 productos abajo
- Cliente se confunde

**Solución:**
- Enviar foto + info de cada producto por separado
- Usar separadores visuales
- Formato claro y organizado

## 📝 Archivos a Modificar

### 1. `src/lib/product-formatter.ts` (CREAR NUEVO)
```typescript
/**
 * Formatea información de productos para WhatsApp
 */

export class ProductFormatter {
  static formatSingleProduct(product: any, index?: number): string {
    const emoji = this.getProductEmoji(product);
    const number = index ? `${index}️⃣ ` : '';
    
    return `
━━━━━━━━━━━━━━━━━━━━━━
${emoji} ${number}${product.name}
━━━━━━━━━━━━━━━━━━━━━━

${this.getHighlight(product)}

🧩 Especificaciones:
${this.formatSpecs(product)}

💰 Precio: ${product.price.toLocaleString('es-CO')} COP
📦 Stock: ${product.stock > 0 ? 'Disponible' : 'Consultar'}
🚚 Envío: Gratis a toda Colombia
🛡️ Garantía: 12 meses

━━━━━━━━━━━━━━━━━━━━━━
`.trim();
  }

  private static getProductEmoji(product: any): string {
    const name = product.name.toLowerCase();
    if (name.includes('portátil') || name.includes('laptop')) return '💻';
    if (name.includes('mouse') || name.includes('teclado')) return '⌨️';
    if (name.includes('monitor')) return '🖥️';
    if (name.includes('curso')) return '📚';
    if (name.includes('mega')) return '📦';
    return '✨';
  }

  private static getHighlight(product: any): string {
    // Extraer el primer beneficio de la descripción
    const desc = product.description || '';
    if (desc.includes('ideal para')) {
      const match = desc.match(/ideal para [^.]+/i);
      return match ? `🔥 ${match[0]}` : '';
    }
    return '🔥 Excelente opción';
  }

  private static formatSpecs(product: any): string {
    const desc = product.description || '';
    const specs: string[] = [];
    
    // Extraer especificaciones comunes
    if (desc.match(/intel|amd|ryzen|core/i)) {
      const cpu = desc.match(/(intel|amd|ryzen)[^,\n]+/i);
      if (cpu) specs.push(`⚙️ ${cpu[0]}`);
    }
    
    if (desc.match(/\d+gb.*ram/i)) {
      const ram = desc.match(/\d+gb[^,\n]*ram/i);
      if (ram) specs.push(`🧠 ${ram[0]}`);
    }
    
    if (desc.match(/\d+gb.*ssd|hdd/i)) {
      const storage = desc.match(/\d+[gt]b[^,\n]*(ssd|hdd)/i);
      if (storage) specs.push(`💾 ${storage[0]}`);
    }
    
    if (desc.match(/pantalla|display|\d+["\s]*(pulgadas|inch)/i)) {
      const screen = desc.match(/pantalla[^,\n]+|\d+\.?\d*["\s]*(pulgadas|inch|fhd|hd)/i);
      if (screen) specs.push(`📺 ${screen[0]}`);
    }
    
    return specs.length > 0 ? specs.join('\n') : '📋 Ver descripción completa';
  }
}
```

### 2. `src/lib/intelligent-baileys-integration.ts` (MODIFICAR)

Agregar después de la línea ~100:

```typescript
// 🆕 NUEVA ACCIÓN: Enviar múltiples productos con fotos
if (action.type === 'send_multiple_products') {
  console.log('[IntelligentBot] 📦 Enviando múltiples productos...');
  
  // Importar formatter
  const { ProductFormatter } = await import('./product-formatter');
  
  // Mensaje inicial
  const category = action.category || 'productos';
  await sock.sendMessage(from, {
    text: `👍 Sí, tenemos ${category} disponibles.\n\nTe muestro las mejores opciones:`
  });
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Por cada producto
  for (let i = 0; i < action.products.length; i++) {
    const product = action.products[i];
    
    // 1. Enviar foto
    if (product.images) {
      const images = typeof product.images === 'string' 
        ? JSON.parse(product.images) 
        : product.images;
      
      if (images[0]) {
        await sock.sendMessage(from, {
          image: { url: images[0] },
          caption: `📸 ${product.name}`
        });
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // 2. Enviar info formateada
    const info = ProductFormatter.formatSingleProduct(product, i + 1);
    await sock.sendMessage(from, { text: info });
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  
  // Mensaje final
  await sock.sendMessage(from, {
    text: '¿Quieres más opciones según tu presupuesto 💰 o uso (estudio 🎓, trabajo 💼, juegos 🎮)?\n\nEstoy aquí para ayudarte 😄💬'
  });
  
  console.log('[IntelligentBot] ✅ Múltiples productos enviados');
  
  // NO enviar el texto de la IA, ya enviamos todo
  finalText = ''; // Vaciar para no duplicar
}
```

### 3. `src/lib/intelligent-conversation-engine.ts` (MODIFICAR)

En la función `generateActions()`, agregar detección de múltiples productos:

```typescript
// Después de la línea ~1200, agregar:

// 📦 DETECTAR SI HAY MÚLTIPLES PRODUCTOS PARA MOSTRAR
const isGeneralProductQuery = 
  lastUserMessage.includes('tienes') ||
  lastUserMessage.includes('vendes') ||
  lastUserMessage.includes('hay') ||
  lastUserMessage.includes('disponibles');

if (isGeneralProductQuery && memory.context.interestedProducts && memory.context.interestedProducts.length > 1) {
  console.log('[IntelligentEngine] 📦 Detectada consulta general con múltiples productos');
  
  // Determinar categoría
  let category = 'productos';
  if (lastUserMessage.includes('portátil') || lastUserMessage.includes('laptop')) {
    category = 'portátiles';
  } else if (lastUserMessage.includes('curso')) {
    category = 'cursos';
  } else if (lastUserMessage.includes('mega')) {
    category = 'megapacks';
  }
  
  actions.push({
    type: 'send_multiple_products',
    products: memory.context.interestedProducts.slice(0, 3),
    category
  });
}
```

## 🧪 Cómo Probar

1. **Reiniciar servidor:**
   ```bash
   npm run dev
   ```

2. **Probar en WhatsApp:**
   ```
   Cliente: "Tienes portátiles?"
   
   Esperado:
   - Mensaje inicial
   - Foto 1 + Info 1
   - Foto 2 + Info 2
   - Foto 3 + Info 3
   - Mensaje final
   ```

## 📊 Resultado Esperado

```
Bot: "👍 Sí, tenemos portátiles disponibles.
     Te muestro las mejores opciones:"

Bot: 📸 [Foto Portátil 1]

Bot: "━━━━━━━━━━━━━━━━━━━━━━
     💻 1️⃣ Portátil Acer A15...
     ━━━━━━━━━━━━━━━━━━━━━━
     
     🔥 Ideal para trabajo...
     
     🧩 Especificaciones:
     ⚙️ Intel Core i5...
     🧠 16GB RAM...
     💾 512GB SSD...
     
     💰 Precio: $1.899.900 COP
     📦 Stock: Disponible
     ━━━━━━━━━━━━━━━━━━━━━━"

Bot: 📸 [Foto Portátil 2]

Bot: "━━━━━━━━━━━━━━━━━━━━━━
     💻 2️⃣ Portátil Acer A15...
     ..."

Bot: "¿Quieres más opciones...?"
```

## ⚠️ Importante

1. **No duplicar mensajes** - Si se activa `send_multiple_products`, vaciar `finalText`
2. **Pausas entre mensajes** - 500ms entre foto e info, 800ms entre productos
3. **Máximo 3 productos** - Para no saturar al cliente

## 🎯 Estado

- ✅ Documentado
- ⏳ Pendiente de implementar
- 📝 Archivos listos para crear/modificar

---

**Próximo Paso:** Crear `src/lib/product-formatter.ts` y modificar los otros 2 archivos.
