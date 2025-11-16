# 📋 Sistema de Formato para Múltiples Productos

## 🎯 Objetivo

Cuando el cliente pregunta por una categoría (ej: "portátiles"), el bot debe:
1. Enviar **foto + info de cada producto por separado**
2. Usar **separadores visuales claros**
3. **Formato organizado y fácil de leer**

## ✨ Formato Ideal

### Mensaje Inicial
```
👍 Sí, tenemos portátiles disponibles.

Te muestro las mejores opciones organizadas por precio:
```

### Por Cada Producto
```
📸 [FOTO DEL PRODUCTO 1]

━━━━━━━━━━━━━━━━━━━━━━
💻 1️⃣ Portátil Acer A15-51p-591e
━━━━━━━━━━━━━━━━━━━━━━

🔥 Ideal para trabajo multitarea y estudio

🧩 Especificaciones:
⚙️ Intel Core i5 Serie 1 (120U)
🧠 16GB LPDDR5
💾 512GB SSD
📺 Pantalla 15.6" FHD IPS
🔋 Bajo consumo, liviano

💰 Precio: $1.899.900 COP
📦 Stock: Disponible
🚚 Envío: Gratis
🛡️ Garantía: 12 meses

━━━━━━━━━━━━━━━━━━━━━━
```

```
📸 [FOTO DEL PRODUCTO 2]

━━━━━━━━━━━━━━━━━━━━━━
💻 2️⃣ Portátil Acer A15-41p-R8f7
━━━━━━━━━━━━━━━━━━━━━━

🔥 Alto rendimiento para trabajo pesado

🧩 Especificaciones:
⚙️ AMD Ryzen 7 7500U
🧠 16GB DDR4
💾 1TB SSD
📺 Pantalla 15.6" FHD IPS
🔥 Excelente para diseño y edición

💰 Precio: $2.179.000 COP
📦 Stock: Disponible
🚚 Envío: Gratis
🛡️ Garantía: 12 meses

━━━━━━━━━━━━━━━━━━━━━━
```

### Mensaje Final
```
¿Quieres que te envíe más opciones según tu presupuesto 💰 o según el uso (estudio 🎓, trabajo 💼, juegos 🎮)?

Estoy aquí para ayudarte 😄💬
```

## 🔧 Implementación

### 1. Nueva Acción en el Motor

```typescript
// En intelligent-conversation-engine.ts
actions.push({
  type: 'send_multiple_products',
  products: relevantProducts.slice(0, 3),
  category: 'portátiles'
});
```

### 2. Manejo en Baileys Integration

```typescript
// En intelligent-baileys-integration.ts
if (action.type === 'send_multiple_products') {
  // Enviar mensaje inicial
  await sock.sendMessage(from, {
    text: `👍 Sí, tenemos ${action.category} disponibles.\n\nTe muestro las mejores opciones:`
  });
  
  // Por cada producto
  for (let i = 0; i < action.products.length; i++) {
    const product = action.products[i];
    
    // 1. Enviar foto
    if (product.images && product.images[0]) {
      await sock.sendMessage(from, {
        image: { url: product.images[0] },
        caption: `📸 ${product.name}`
      });
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 2. Enviar info formateada
    const info = formatProductInfo(product, i + 1);
    await sock.sendMessage(from, { text: info });
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  
  // Mensaje final
  await sock.sendMessage(from, {
    text: '¿Quieres más opciones según tu presupuesto 💰 o uso? 😄'
  });
}
```

### 3. Función de Formato

```typescript
function formatProductInfo(product: any, index: number): string {
  const emoji = getProductEmoji(product);
  
  return `
━━━━━━━━━━━━━━━━━━━━━━
${emoji} ${index}️⃣ ${product.name}
━━━━━━━━━━━━━━━━━━━━━━

${getProductHighlight(product)}

🧩 Especificaciones:
${formatSpecs(product)}

💰 Precio: ${product.price.toLocaleString('es-CO')} COP
📦 Stock: ${product.stock > 0 ? 'Disponible' : 'Consultar'}
🚚 Envío: Gratis a toda Colombia
🛡️ Garantía: 12 meses

━━━━━━━━━━━━━━━━━━━━━━
`.trim();
}
```

## 📊 Ventajas del Nuevo Formato

### ✅ Claridad Visual
- Separadores claros entre productos
- Emojis que identifican cada sección
- Fácil de escanear visualmente

### ✅ No Confunde
- Cada foto va con su info
- No hay ambigüedad
- Cliente sabe exactamente qué está viendo

### ✅ Profesional
- Formato consistente
- Información completa
- Fácil de leer en móvil

## 🎨 Elementos Visuales

### Separadores
```
━━━━━━━━━━━━━━━━━━━━━━  (línea superior)
━━━━━━━━━━━━━━━━━━━━━━  (línea inferior)
```

### Emojis por Sección
- 💻 Nombre del producto
- 🔥 Destacado/Beneficio
- 🧩 Especificaciones
- ⚙️ Procesador
- 🧠 RAM
- 💾 Almacenamiento
- 📺 Pantalla
- 💰 Precio
- 📦 Stock
- 🚚 Envío
- 🛡️ Garantía

### Numeración
- 1️⃣ Primer producto
- 2️⃣ Segundo producto
- 3️⃣ Tercer producto

## 🔄 Flujo Completo

```
Cliente: "Tienes portátiles?"
  ↓
Bot: "👍 Sí, tenemos portátiles disponibles..."
  ↓
Bot: 📸 [Foto Producto 1]
Bot: [Info Producto 1 con separadores]
  ↓
Bot: 📸 [Foto Producto 2]
Bot: [Info Producto 2 con separadores]
  ↓
Bot: 📸 [Foto Producto 3]
Bot: [Info Producto 3 con separadores]
  ↓
Bot: "¿Quieres más opciones...?"
```

## 📝 Próximos Pasos

1. ✅ Crear función `formatProductInfo()`
2. ✅ Agregar acción `send_multiple_products`
3. ✅ Implementar en Baileys integration
4. ✅ Actualizar prompt del sistema
5. ✅ Probar con diferentes categorías

---

**Estado:** 📋 Documentado  
**Próximo:** Implementación
