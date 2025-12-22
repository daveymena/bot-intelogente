# 🔧 ARREGLO: Métodos de Pago Repetidos

## 🐛 Problema Detectado

El bot estaba mostrando los métodos de pago repetidamente cuando el cliente respondía con un método específico (ej: "mercadopago", "paypal", "nequi").

**Ejemplo del problema:**
```
Cliente: "Mercadopago"
Bot: [Muestra métodos de pago]
Cliente: "Mercadopago" (de nuevo)
Bot: [Muestra métodos de pago otra vez]
Cliente: "Método de pago"
Bot: [Muestra métodos de pago otra vez]
```

## 🔍 Causa Raíz

En `src/lib/plantillas-respuestas-bot.ts`, el método `analyzeIntent()` detectaba que el mensaje contenía palabras relacionadas con pagos ("mercadopago", "pago", etc.), pero:

1. ❌ No detectaba QUÉ método específico eligió el cliente
2. ❌ Siempre mostraba la lista completa de métodos
3. ❌ No generaba el link directamente cuando el cliente ya había elegido

## ✅ Solución Implementada

### 1. Nuevo Método: `detectPaymentMethod()`

Agregado en línea ~1170 de `plantillas-respuestas-bot.ts`:

```typescript
private static detectPaymentMethod(message: string): 'mercadopago' | 'paypal' | 'nequi' | 'daviplata' | null {
  const msg = message.toLowerCase();
  
  // Detectar método específico
  if (msg.includes('mercado') || msg.includes('mercadopago')) return 'mercadopago';
  if (msg.includes('paypal')) return 'paypal';
  if (msg.includes('nequi')) return 'nequi';
  if (msg.includes('daviplata')) return 'daviplata';
  
  return null;
}
```

### 2. Lógica Mejorada en `analyzeIntent()`

Modificado en línea ~956 de `plantillas-respuestas-bot.ts`:

**ANTES:**
```typescript
// 4. SOLICITUDES DE PAGO
if (this.isPaymentRequest(msg)) {
  // Generar todos los links
  // Mostrar mensaje con TODOS los métodos
  return { ... };
}
```

**AHORA:**
```typescript
// 4. SOLICITUDES DE PAGO
if (this.isPaymentRequest(msg)) {
  // 🎯 DETECTAR SI EL CLIENTE YA ELIGIÓ UN MÉTODO ESPECÍFICO
  const selectedMethod = this.detectPaymentMethod(msg);
  
  if (context?.product?.id && userId) {
    // Generar links de pago
    const paymentResult = await BotPaymentLinkGenerator.generatePaymentLinks(...);
    
    // 🎯 Si el cliente eligió un método específico, mostrar SOLO ese link
    if (selectedMethod) {
      console.log(`[SmartResponseEngine] 🎯 Cliente eligió método: ${selectedMethod}`);
      
      // Generar mensaje personalizado según el método elegido
      if (selectedMethod === 'mercadopago' && paymentResult.mercadoPagoLink) {
        finalMessage = `💳 *¡Perfecto! Aquí está tu link de MercadoPago*\n\n`;
        finalMessage += `📦 *Producto:* ${context.product.name}\n`;
        finalMessage += `💰 *Total:* ${price}\n\n`;
        finalMessage += `👉 *LINK DE PAGO:*\n${paymentResult.mercadoPagoLink}\n\n`;
        finalMessage += `✅ Paga con tarjeta, PSE o efectivo\n`;
        finalMessage += `⚡ Acceso inmediato después del pago`;
      }
      // ... (similar para paypal, nequi, daviplata)
    }
  }
}
```

### 3. Arreglo Adicional: SQLite Compatibility

También se arregló un error de compatibilidad con SQLite en línea ~612:

**ANTES:**
```typescript
{ name: { contains: text, mode: 'insensitive' } }
```

**AHORA:**
```typescript
{ name: { contains: text } }
```

SQLite no soporta `mode: 'insensitive'`, así que se removió.

## 🎯 Comportamiento Nuevo

### Flujo Correcto:

1. **Cliente pregunta por un producto:**
   ```
   Cliente: "Curso de Piano"
   Bot: [Muestra el curso con foto y detalles]
   ```

2. **Cliente dice que quiere pagar:**
   ```
   Cliente: "Quiero pagar"
   Bot: [Muestra métodos de pago disponibles]
   ```

3. **Cliente elige un método específico:**
   ```
   Cliente: "Mercadopago"
   Bot: 💳 ¡Perfecto! Aquí está tu link de MercadoPago
        
        📦 Producto: Curso de Piano
        💰 Total: 50.000 COP
        
        👉 LINK DE PAGO:
        https://mpago.la/xxx
        
        ✅ Paga con tarjeta, PSE o efectivo
        ⚡ Acceso inmediato después del pago
   ```

### Mensajes Personalizados por Método:

- **MercadoPago:** Link directo + "Paga con tarjeta, PSE o efectivo"
- **PayPal:** Link directo + "Paga con tarjeta internacional"
- **Nequi:** Número + "Envíanos captura del pago"
- **Daviplata:** Número + "Envíanos captura del pago"

## 📊 Ventajas del Arreglo

✅ **Menos repetición:** El bot no repite los métodos de pago
✅ **Más directo:** Muestra solo el link del método elegido
✅ **Mejor UX:** El cliente obtiene lo que pidió inmediatamente
✅ **Menos confusión:** No hay múltiples opciones cuando ya eligió una

## 🧪 Cómo Probar

1. Envía un mensaje al bot: "Curso de Piano"
2. El bot muestra el curso
3. Responde: "Quiero pagar"
4. El bot muestra los métodos disponibles
5. Responde: "Mercadopago"
6. ✅ El bot debe mostrar SOLO el link de MercadoPago (no repetir métodos)

## 📝 Archivos Modificados

- `src/lib/plantillas-respuestas-bot.ts` (líneas 956-1040, 1170-1180)

## ✅ Estado

**ARREGLADO Y PROBADO** ✅

El servidor está activo y los cambios están aplicados.
