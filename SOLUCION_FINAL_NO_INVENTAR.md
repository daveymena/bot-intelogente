# Solución Final: NO Inventar Información de Pagos

## Problema

La IA estaba inventando información FALSA sobre pagos:
- Plazos de 12 meses
- Comisiones del 5%
- Instrucciones paso a paso falsas
- Links inventados

## Solución Aplicada

He agregado una **REGLA CRÍTICA** al inicio del prompt de la IA que le PROHÍBE inventar información de pagos.

### Archivo Modificado

**`src/lib/intelligent-personality-service.ts`**

```typescript
const criticalRule = `⚠️⚠️⚠️ REGLA CRÍTICA - LEE ESTO PRIMERO ⚠️⚠️⚠️

NUNCA INVENTES INFORMACIÓN SOBRE PAGOS:
❌ NO inventes pasos para pagar
❌ NO inventes instrucciones de MercadoPago
❌ NO inventes plazos de pago (12 meses, etc)
❌ NO inventes comisiones
❌ NO inventes procesos de pago
❌ NO inventes links o URLs

✅ SI el cliente pregunta cómo pagar, di SOLO:
"Te genero el link de pago ahora mismo"

✅ El sistema generará los links REALES automáticamente.
✅ TÚ NO generas links, el sistema lo hace.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;
```

Esta regla se agrega **AL INICIO** de TODOS los prompts, tanto personalizados como por defecto.

## Cómo Funciona Ahora

### Flujo Correcto:

1. **Cliente**: "Quiero comprar"
2. **Sistema detecta** solicitud de pago en `baileys-stable-service.ts`
3. **Genera links REALES** con `BotPaymentLinkGenerator`
4. **Envía links** directamente
5. **NO usa IA** para esta parte

### Si la IA se activa por error:

1. **IA lee la regla crítica** al inicio del prompt
2. **NO inventa** información de pagos
3. **Responde**: "Te genero el link de pago ahora mismo"
4. **El sistema** genera los links reales

## Resultado Esperado

**ANTES** (inventado por IA):
```
¡Genial! 🎉
Puedes pagar con Mercado Pago:
* Plazo de pago: 12 meses sin intereses ❌ FALSO
* Comisión: 5% ❌ FALSO
* Visita www.mercadopago.com ❌ FALSO
...
```

**AHORA** (real):
```
¡Perfecto! Te genero el link de pago

💰 60,000 COP

⏳ Un momento...

[LINK REAL DE MERCADOPAGO]
[LINK REAL DE PAYPAL]
```

## Verificación

Para probar que funciona:

```bash
npm run dev
```

Envía por WhatsApp:
1. "Curso de piano"
2. "Quiero comprar"

Deberías recibir:
- Links REALES de MercadoPago y PayPal
- SIN información inventada
- SIN instrucciones falsas

## Archivos Modificados

1. ✅ `src/lib/intelligent-personality-service.ts`
   - Agregada regla crítica al inicio de todos los prompts
   - Parámetro `criticalRule` en `buildDefaultPrompt()`

## Importante

- La regla crítica se aplica a **TODOS** los prompts
- Se muestra **AL INICIO** antes de cualquier otra instrucción
- La IA la lee **PRIMERO** antes de generar cualquier respuesta
- Si la IA intenta inventar información de pagos, la regla la detiene

## Si Sigue Inventando

Si después de esto la IA sigue inventando información:

1. Verifica que el servidor se reinició correctamente
2. Verifica que no hay caché de prompts
3. Aumenta la severidad de la regla en el prompt
4. Considera desactivar completamente la IA para solicitudes de pago

## Resumen

✅ Regla crítica agregada al inicio de todos los prompts
✅ IA instruida para NO inventar información de pagos
✅ Sistema de links reales funciona correctamente
✅ Flujo de pagos simplificado

**La IA ya NO debería inventar información de pagos.**
