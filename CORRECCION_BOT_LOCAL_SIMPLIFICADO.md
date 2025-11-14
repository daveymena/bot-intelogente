# Corrección Bot Local - Respuestas Simplificadas

## Problemas Identificados

### 1. Error `userId is not defined`
**Ubicación**: `src/conversational-module/ai/conversacionController.ts:233`

**Causa**: Se usaba `userId` en lugar de `contexto.userId`

**Solución**: ✅ CORREGIDO
```typescript
// ANTES (línea 233)
const conversationKey = `${conversation.userId}:${userId}`;

// DESPUÉS
const conversationKey = `${conversation.userId}:${contexto.userId}`;
```

### 2. Respuestas muy largas y complejas
**Problema**: El bot genera respuestas de 10-15 líneas cuando debería ser directo

**Causa**: Prompts muy largos y detallados en `promptBuilder.ts`

**Solución**: ✅ IMPLEMENTADO
- Creado `promptBuilder-simple.ts` con prompts minimalistas
- Actualizado `flujoDigital.ts` para usar prompts simples
- Reducido `maxTokens` de 500 a 150

### 3. Contexto no se guarda para pagos
**Problema**: Cuando el cliente dice "quiero comprar", el sistema no encuentra el producto

**Causa**: El contexto se guarda pero con una clave diferente a la que se busca

**Estado**: ⚠️ PARCIALMENTE CORREGIDO
- El código guarda el contexto correctamente
- Pero hay que verificar que la clave sea consistente

## Cambios Aplicados

### 1. Nuevo archivo: `promptBuilder-simple.ts`
```typescript
// Prompt ULTRA SIMPLE para productos digitales
export function construirPromptDigitalSimple(producto: ProductoInfo): string {
  return `PRODUCTO DIGITAL: ${producto.nombre}
Precio: ${producto.precio.toLocaleString('es-CO')} COP

REGLAS CRÍTICAS:
1. Respuesta CORTA (máximo 4 líneas)
2. NO preguntes por recogida o envío (es digital)
3. NO inventes datos bancarios
4. Si piden comprar, di: "Te genero el link de pago"

FORMATO OBLIGATORIO:
✅ *${producto.nombre}*
💰 ${producto.precio.toLocaleString('es-CO')} COP
📲 Entrega digital inmediata

¿Quieres comprarlo? Te genero el link de pago 🔗

Responde SOLO con esto. NO agregues más información.`;
}
```

### 2. Actualizado `flujoDigital.ts`
```typescript
// ANTES: Prompt largo + historial + 500 tokens
const messages: GroqMessage[] = [
  {
    role: 'system',
    content: construirPromptSistema() + '\n\n' + construirPromptDigital(producto),
  },
];
const historial = obtenerHistorialParaIA(contexto, 4);
messages.push(...historial);
messages.push({ role: 'user', content: mensaje });

const respuesta = await sendWithFallback(messages, {
  temperature: 0.7,
  maxTokens: 500,
});

// DESPUÉS: Prompt simple + sin historial + 150 tokens
const messages: GroqMessage[] = [
  {
    role: 'system',
    content: construirPromptDigitalSimple(producto),
  },
  {
    role: 'user',
    content: mensaje,
  },
];

const respuesta = await sendWithFallback(messages, {
  temperature: 0.5,
  maxTokens: 150, // Respuestas MÁS CORTAS
});
```

### 3. Simplificado `generarInformacionPago()`
```typescript
// ANTES: Intentaba usar IA si fallaba la generación de links
// DESPUÉS: Solo genera links o respuesta simple

if (paymentResult.success && paymentResult.message) {
  return paymentResult.message; // SOLO el mensaje con links
}

// Fallback simple
return `¡Perfecto! Te genero el link de pago para *${producto.name}*

💰 Total: ${producto.price.toLocaleString('es-CO')} COP

⏳ Un momento...`;
```

### 4. Respuesta fallback simplificada
```typescript
// ANTES (en flujoDigital.ts)
function generarRespuestaDigitalSegura(producto: ProductoInfo): string {
  return `¡Perfecto! Te cuento sobre *${producto.nombre}* 💎

${producto.descripcion ? producto.descripcion.substring(0, 200) + '...\n\n' : ''}💰 *Precio:* ${producto.precio.toLocaleString('es-CO')} COP
✅ *Disponibilidad:* Inmediata (producto digital)
📲 *Entrega:* Automática por WhatsApp/Email después del pago
⚡ *Acceso:* Instantáneo sin esperas

💳 *Métodos de pago:*
• MercadoPago (link de pago)
• PayPal (link de pago)
• Nequi / Daviplata
• Transferencia bancaria

¿Te gustaría proceder con la compra? Puedo generarte el link de pago ahora mismo 🔗`;
}

// DESPUÉS
function generarRespuestaDigitalSegura(producto: ProductoInfo): string {
  return `✅ *${producto.nombre}*

💰 Precio: ${producto.precio.toLocaleString('es-CO')} COP
📲 Entrega digital inmediata

¿Quieres comprarlo? Te genero el link de pago 🔗`;
}
```

## Flujo Esperado Ahora

### Conversación Ideal:

**Cliente**: "Estoy interesado en el curso de piano"

**Bot**: 
```
✅ *Curso Completo de Piano Online*

💰 Precio: 150,000 COP
📲 Entrega digital inmediata

¿Quieres comprarlo? Te genero el link de pago 🔗
```

**Cliente**: "Sí quiero comprar"

**Bot**:
```
¡Perfecto! Te genero el link de pago para *Curso Completo de Piano Online*

💰 Total: 150,000 COP

⏳ Un momento...

[Sistema envía automáticamente los links de MercadoPago y PayPal]
```

## Próximos Pasos

### 1. Verificar que funciona
```bash
npm run dev
```

Probar:
1. "Curso de piano" → Debe responder corto
2. "Quiero comprar" → Debe generar link de pago

### 2. Si sigue sin encontrar contexto
Verificar en consola:
```
[Conversación] ✅ Producto guardado en contexto para pagos: Curso... (clave)
[Baileys] 💳 Solicitud de pago detectada
[Context] ❌ No hay contexto para [clave]
```

Si las claves no coinciden, hay que ajustar la lógica de guardado/búsqueda.

### 3. Aplicar lo mismo a otros flujos
- `flujoFisico.ts`
- `flujoDropshipping.ts`
- `flujoServicio.ts`

## Resumen de Mejoras

✅ Error `userId is not defined` corregido
✅ Prompts simplificados (de 200 líneas a 15 líneas)
✅ Respuestas más cortas (150 tokens vs 500 tokens)
✅ Fallbacks simplificados (4 líneas vs 15 líneas)
✅ Generación de pagos directa (sin IA intermedia)

⚠️ Pendiente: Verificar que el contexto se guarda/busca con la misma clave

## Archivos Modificados

1. ✅ `src/conversational-module/ai/conversacionController.ts` - Error userId corregido
2. ✅ `src/conversational-module/ai/promptBuilder-simple.ts` - Nuevo archivo con prompts simples
3. ✅ `src/conversational-module/flows/flujoDigital.ts` - Usa prompts simples
4. ✅ `src/conversational-module/flows/flujoDigital.ts` - Fallback simplificado

## Resultado Esperado

**ANTES**:
- Respuestas de 10-15 líneas
- Muchas preguntas innecesarias
- Da vueltas antes de dar información
- Error al solicitar pago

**DESPUÉS**:
- Respuestas de 3-4 líneas
- Directo al grano
- Información clara y concisa
- Link de pago inmediato cuando se solicita
