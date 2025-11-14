# 🚨 CORRECCIÓN URGENTE: Bot Inventando Información Falsa

## Fecha: 2025-11-10
## Prioridad: CRÍTICA

## Problema Detectado

El bot está **inventando información falsa** cuando el cliente solicita métodos de pago:

### Información Inventada ❌
- ✗ Datos bancarios falsos (Bancolombia, cuenta 1234567890)
- ✗ NIT inventado (901.123.456)
- ✗ Correo falso (ventas@tecnovariedades.com)
- ✗ Nombre de destinatario inventado
- ✗ Instrucciones de transferencia que no existen
- ✗ Procesos de pago en tienda que no están configurados

### Ejemplo del Problema

```
Cliente: "cómo puedo pagar?"

Bot (INCORRECTO):
FORMAS DE PAGO:
• Efectivo en tienda
• Transferencia electrónica a nombre de Tecnovariedades D&S
• Tarjetas de crédito: Visa, Mastercard, American Express

DATOS DE TRANSFERENCIA:
Nombre del destinatario: Tecnovariedades D&S
NIT: 901.123.456
Banco: Bancolombia
Cuenta corriente: 1234567890

INSTRUCCIONES:
1. Realiza la transferencia...
2. Envía la copia a ventas@tecnovariedades.com
```

**TODO ESTO ES INVENTADO Y FALSO** ❌

## Causa Raíz

La IA está generando respuestas creativas basándose en su conocimiento general, en lugar de usar únicamente el sistema de generación de links de pago que ya existe.

## Solución Implementada

### 1. Reforzar Instrucciones en Prompts

**Archivo**: `src/conversational-module/ai/promptBuilder.ts`

**Cambios**:

```typescript
⚠️ REGLA CRÍTICA - NO INVENTAR INFORMACIÓN:
❌ NUNCA inventes datos bancarios, números de cuenta, NIT, correos o direcciones
❌ NUNCA menciones "Tecnovariedades D&S" como destinatario de transferencias
❌ NUNCA des instrucciones de transferencia bancaria que no existan
❌ NUNCA inventes procesos de pago que no están implementados

✅ SOLO usa el sistema de generación de links de pago automático
```

### 2. Simplificar Respuesta de Pago

**Antes** (permitía inventar):
```
Genera una respuesta que:
1. Confirme el producto y precio total
2. Liste los métodos de pago disponibles
3. Ofrezca generar link de pago o dar instrucciones
```

**Después** (respuesta fija):
```
¡Perfecto! Voy a generar los métodos de pago para *[producto]*

💰 Total: [precio] COP

⏳ Un momento mientras preparo tus opciones de pago...

[El sistema enviará automáticamente los links en el siguiente mensaje]
```

### 3. Sistema Automático Ya Implementado

El sistema `BotPaymentLinkGenerator` ya genera automáticamente:
- ✅ Links de MercadoPago
- ✅ Links de PayPal
- ✅ Información de Nequi/Daviplata (si está configurada)
- ✅ Link de WhatsApp directo

**La IA NO debe inventar nada, solo esperar a que el sistema genere los links.**

## Flujo Correcto

```
1. Cliente: "cómo puedo pagar?"
   ↓
2. IA responde (SIMPLE):
   "¡Perfecto! Voy a generar los métodos de pago..."
   ↓
3. Sistema llama a BotPaymentLinkGenerator
   ↓
4. Sistema genera links reales:
   - MercadoPago: https://mpago.la/xxxxx (REAL)
   - PayPal: https://paypal.com/xxxxx (REAL)
   - Nequi: [número real de configuración]
   ↓
5. Sistema envía mensaje con links REALES
```

## Información Real vs Inventada

### ❌ NUNCA Inventar:
- Datos bancarios
- Números de cuenta
- NIT o RUT
- Correos electrónicos
- Direcciones físicas
- Nombres de destinatarios
- Procesos de pago manual
- Instrucciones de transferencia

### ✅ SOLO Usar:
- Links generados por `BotPaymentLinkGenerator`
- Información de configuración real del sistema
- Variables de entorno configuradas
- Datos de la base de datos

## Verificación

### Cómo Verificar que Está Corregido

1. **Prueba**: Pregunta por un producto y luego "cómo puedo pagar?"
2. **Verifica**: La respuesta NO debe incluir:
   - Datos bancarios
   - Números de cuenta
   - Correos inventados
   - Instrucciones de transferencia manual
3. **Debe incluir**: Solo un mensaje simple diciendo que generará los métodos
4. **Siguiente mensaje**: Debe ser del sistema con links REALES

### Ejemplo Correcto

```
Cliente: "cómo puedo pagar el curso de piano?"

Bot (IA - Respuesta simple):
¡Perfecto! Voy a generar los métodos de pago para *Curso Completo de Piano*

💰 Total: 60,000 COP

⏳ Un momento mientras preparo tus opciones de pago...

---

Bot (Sistema - Links reales):
🟢 ¡Perfecto! Aquí están tus opciones de pago

💳 *Mercado Pago*
👉 https://mpago.la/2Xk9J7L [LINK REAL]

💙 *PayPal*
👉 https://paypal.com/checkout/xxxxx [LINK REAL]

📱 *Nequi*
Número: 304 274 8687 [NÚMERO REAL DE CONFIGURACIÓN]

...
```

## Impacto del Problema

### Riesgos:
1. 🚨 **Legal**: Dar datos bancarios falsos es fraude
2. 🚨 **Confianza**: Cliente pierde confianza al descubrir datos falsos
3. 🚨 **Pérdida de ventas**: Cliente no puede completar el pago
4. 🚨 **Reputación**: Daña la imagen del negocio

### Urgencia:
- **Prioridad**: CRÍTICA
- **Impacto**: ALTO
- **Acción**: INMEDIATA

## Archivos Modificados

1. ✅ `src/conversational-module/ai/promptBuilder.ts`
   - Función: `construirPromptDigital()`
   - Función: `construirPromptFisico()`
   - Función: `construirPromptPago()`

## Reglas Reforzadas

### Para Todos los Prompts:

```typescript
⚠️ REGLA CRÍTICA - NO INVENTAR INFORMACIÓN:
❌ NUNCA inventes datos bancarios, números de cuenta, NIT, correos o direcciones
❌ NUNCA menciones "Tecnovariedades D&S" como destinatario de transferencias
❌ NUNCA des instrucciones de transferencia bancaria que no existan
❌ NUNCA inventes procesos de pago que no están implementados

✅ SOLO usa el sistema de generación de links de pago automático
✅ El sistema genera links dinámicos de MercadoPago y PayPal
✅ Cuando el cliente pida pagar, el sistema enviará los links automáticamente
✅ NO necesitas dar instrucciones manuales de pago
```

## Monitoreo

### Qué Monitorear:
1. Respuestas de pago del bot
2. Verificar que no incluyan datos inventados
3. Confirmar que usen el sistema de links
4. Revisar logs de generación de links

### Señales de Alerta:
- ❌ Menciona "Bancolombia" o cualquier banco
- ❌ Menciona números de cuenta
- ❌ Menciona NIT o RUT
- ❌ Menciona correos @tecnovariedades.com
- ❌ Da instrucciones de transferencia manual

## Estado

✅ **CORREGIDO**

Las instrucciones han sido reforzadas para que la IA NUNCA invente información y solo use el sistema automático de generación de links.

## Próximos Pasos

1. ✅ Implementado - Instrucciones reforzadas
2. ⏳ URGENTE - Probar inmediatamente
3. ⏳ URGENTE - Verificar que no invente datos
4. ⏳ Monitorear todas las conversaciones de pago
5. ⏳ Revisar logs para detectar cualquier invención

## Nota Importante

**Este problema es CRÍTICO y debe ser verificado inmediatamente antes de usar el bot en producción.**

Dar información bancaria falsa puede tener consecuencias legales graves.

---

**Última actualización**: 2025-11-10
**Prioridad**: 🚨 CRÍTICA
**Estado**: ✅ Corregido - Requiere verificación urgente
