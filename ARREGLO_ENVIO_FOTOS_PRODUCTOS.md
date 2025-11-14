# 📸 ARREGLO: Envío de Fotos con Información de Productos

## ❌ Problema Original

Cuando el cliente preguntaba por un producto (ej: "curso de piano"), el bot respondía con la información PERO NO enviaba la foto del producto.

**Ejemplo:**
- Cliente: "curso de piano"
- Bot: ✅ Información del Curso Completo de Piano
- Bot: ❌ NO enviaba la foto del curso

## 🔍 Causa del Problema

El sistema tenía una condición muy restrictiva para enviar imágenes:

```typescript
// ANTES: Condición muy restrictiva
const isProductQuery = !lastUserMessage.includes('método') &&
                      !lastUserMessage.includes('metodo') &&
                      !lastUserMessage.includes('pagar') &&
                      !lastUserMessage.includes('link') &&
                      !lastUserMessage.includes('forma de pago');

if (memory.context.currentProduct && !imageAlreadySent && isProductQuery) {
  // Enviar imagen
}
```

**Problemas:**
1. ❌ Si el mensaje incluía "pagar", NO enviaba imagen
2. ❌ Si el mensaje incluía "link", NO enviaba imagen
3. ❌ Demasiado restrictivo para casos normales

## ✅ Solución Implementada

### 1. **Condición más inteligente**

```typescript
// AHORA: Solo bloquear si SOLO pide el link (ya tiene toda la info)
const isOnlyAskingForPaymentLink = (
  (lastUserMessage.includes('link') || lastUserMessage.includes('enlace')) &&
  (lastUserMessage.includes('pago') || lastUserMessage.includes('pagar') || lastUserMessage.includes('comprar')) &&
  lastUserMessage.split(' ').length <= 5 // Mensaje corto
);

const shouldSendImage = memory.context.currentProduct && 
                       !imageAlreadySent && 
                       !isOnlyAskingForPaymentLink;
```

**Lógica:**
- ✅ Envía imagen cuando el cliente pregunta por un producto
- ✅ Envía imagen cuando el cliente pregunta "¿cómo pagar?"
- ✅ Envía imagen cuando el cliente pregunta "precio"
- ❌ NO envía imagen solo si el cliente dice "dame el link de pago" (mensaje corto, ya tiene toda la info)

### 2. **Resetear flag de imagen al cambiar de producto**

```typescript
// Cuando se establece un producto NUEVO
memory.context.currentProduct = products[0];
memory.context.imageSent = null; // 🎯 RESETEAR flag de imagen
```

**Cambios:**
- ✅ Al establecer un producto nuevo → resetear flag
- ✅ Al cambiar de producto → resetear flag
- ✅ Cada producto tiene su propia imagen

## 📊 Comparación de Comportamiento

| Consulta del Cliente | ANTES | AHORA |
|----------------------|-------|-------|
| "curso de piano" | ❌ Solo texto | ✅ Foto + Texto |
| "info del curso de piano" | ❌ Solo texto | ✅ Foto + Texto |
| "precio del curso de piano" | ❌ Solo texto | ✅ Foto + Texto |
| "¿cómo pagar el curso?" | ❌ Solo texto | ✅ Foto + Texto (si no se envió antes) |
| "dame el link de pago" | ✅ Solo texto | ✅ Solo texto (correcto) |
| "link" | ✅ Solo texto | ✅ Solo texto (correcto) |

## 🎯 Flujo Correcto Ahora

### Caso 1: Primera consulta sobre producto
```
Cliente: "curso de piano"
Bot: 
  1. 📸 Envía foto del Curso de Piano
  2. 📝 Envía información completa
  3. 🔖 Marca imagen como enviada
```

### Caso 2: Pregunta sobre precio (mismo producto)
```
Cliente: "¿cuánto cuesta?"
Bot:
  1. 📝 Envía precio (NO envía foto de nuevo)
```

### Caso 3: Cambio de producto
```
Cliente: "¿tienes curso de guitarra?"
Bot:
  1. 🔄 Cambia a Curso de Guitarra
  2. 🔖 Resetea flag de imagen
  3. 📸 Envía foto del Curso de Guitarra
  4. 📝 Envía información completa
```

### Caso 4: Solo pide link de pago
```
Cliente: "link de pago"
Bot:
  1. 💳 Envía link de pago (NO envía foto)
```

## 🧪 Cómo Probar

1. **Reiniciar el servidor:**
   ```bash
   npm run dev
   ```

2. **Probar en WhatsApp:**
   ```
   Cliente: "curso de piano"
   Esperado: 📸 Foto + 📝 Información
   ```

3. **Verificar que NO envía foto dos veces:**
   ```
   Cliente: "curso de piano"
   Bot: 📸 + 📝
   
   Cliente: "¿cuánto cuesta?"
   Bot: 📝 (sin foto)
   ```

4. **Verificar cambio de producto:**
   ```
   Cliente: "curso de piano"
   Bot: 📸 Piano + 📝
   
   Cliente: "¿tienes curso de guitarra?"
   Bot: 📸 Guitarra + 📝
   ```

## 📝 Archivos Modificados

**src/lib/intelligent-conversation-engine.ts**
- ✅ Mejorada condición `shouldSendImage`
- ✅ Agregado reseteo de `imageSent` al establecer producto nuevo
- ✅ Agregado reseteo de `imageSent` al cambiar de producto

## 🎯 Resultado Final

✅ El bot ahora envía la foto CON la información cuando el cliente pregunta por un producto

✅ NO envía la foto dos veces para el mismo producto

✅ Resetea el flag cuando cambia de producto

✅ Solo omite la foto si el cliente SOLO pide el link de pago (mensaje corto)

## 📌 Notas Técnicas

- **Flag `imageSent`**: Guarda el ID del producto para el que se envió la imagen
- **Reseteo automático**: Se resetea al cambiar de producto o establecer uno nuevo
- **Condición inteligente**: Solo bloquea envío si es un mensaje corto pidiendo solo el link
- **Memoria de 24h**: El flag se mantiene durante toda la conversación (24 horas)
