# 🚀 Activar FlowEngine Inteligente - AHORA

## ✅ Sistema Implementado

El **FlowEngine** ya está completamente implementado y listo para usar. Este sistema mejora dramáticamente la detección de intenciones de pago y la generación de links dinámicos.

## 🎯 ¿Qué Hace el FlowEngine?

### Antes (clean-bot):
```
Usuario: "Quiero pagar"
Bot: "No entendí, ¿qué producto quieres?"
```

### Ahora (FlowEngine):
```
Usuario: "Quiero pagar"
Bot: "💳 ¡Perfecto! Aquí tienes tu link de pago..."
     👉 https://mpago.la/xxx
     [Botones: Ya pagué | Cambiar método | Ver otros]
```

## 📦 Archivos Creados

```
✅ src/lib/plantillas-respuestas-bot.ts       # Motor principal
✅ src/lib/flow-integration.ts                # Integración con Baileys
✅ src/lib/flow-baileys-integration.ts       # Wrapper de reemplazo
✅ scripts/test-flow-engine.ts               # Pruebas
✅ SISTEMA_FLOW_ENGINE_INTELIGENTE.md        # Documentación completa
✅ activar-flow-engine.bat                   # Script de activación
```

## 🧪 Paso 1: Probar el Sistema

```bash
# Ejecutar pruebas
npx tsx scripts/test-flow-engine.ts
```

Esto probará:
- ✅ Detección de intenciones de pago
- ✅ Detección de métodos de pago
- ✅ Flujo completo de conversación
- ✅ Generación de links
- ✅ Manejo de contexto

## 🔧 Paso 2: Activar en Producción

### Opción A: Reemplazo Completo (Recomendado)

Editar `src/lib/baileys-stable-service.ts`:

```typescript
// ❌ ANTES (línea ~390)
const { handleMessage } = await import('../clean-bot')
const response = await handleMessage(from, messageText, userId)

await socket.sendMessage(from, { text: response.text })

// ✅ DESPUÉS
import { handleMessageWithFlowEngine } from './flow-baileys-integration'

const result = await handleMessageWithFlowEngine({
  sock: socket,
  userId,
  from,
  messageText,
  conversationId: conversation.id
})
```

### Opción B: Activación Condicional

```typescript
// Usar FlowEngine solo para intenciones de pago
import { FlowBaileysIntegration } from './flow-baileys-integration'

if (FlowBaileysIntegration.isPaymentIntent(messageText)) {
  // Usar FlowEngine
  await handleMessageWithFlowEngine({
    sock: socket,
    userId,
    from,
    messageText,
    conversationId: conversation.id
  })
} else {
  // Usar clean-bot para el resto
  const { handleMessage } = await import('../clean-bot')
  const response = await handleMessage(from, messageText, userId)
  await socket.sendMessage(from, { text: response.text })
}
```

## 🎨 Paso 3: Personalizar Plantillas

Editar `src/lib/plantillas-respuestas-bot.ts`:

```typescript
export const Templates = {
  meta: {
    brandName: 'Tecnovariedades D&S',  // ← Cambiar aquí
    businessPhone: '+57 300 123 4567',  // ← Tu número
    supportEmail: 'soporte@tecnovariedades.com'  // ← Tu email
  },
  messages: {
    welcome: `Tu mensaje personalizado...`,
    // ... más plantillas
  }
};
```

## 🚀 Paso 4: Reiniciar Servidor

```bash
# Detener servidor actual
Ctrl + C

# Reiniciar
npm run dev
```

## 📊 Verificar Funcionamiento

### Prueba Manual en WhatsApp:

1. **Saludo:**
   ```
   Tú: Hola
   Bot: ¡Hola! 👋 Bienvenido a Tecnovariedades D&S...
   ```

2. **Consulta de producto:**
   ```
   Tú: Quiero ver laptops
   Bot: 🔎 *Laptop Pro X14*
        Precio: $1,899,000 COP
        [Botones: Fotos | Comprar | Comparar]
   ```

3. **Intención de pago:**
   ```
   Tú: Quiero pagar
   Bot: 💰 Actualmente aceptamos...
        [Botones: MercadoPago | PayPal | Nequi]
   ```

4. **Solicitar link:**
   ```
   Tú: Envíame el link de MercadoPago
   Bot: 💳 ¡Perfecto!
        👉 https://mpago.la/xxx
        [Botones: Ya pagué | Cambiar método]
   ```

## 🎯 Frases que Detecta Automáticamente

### Intenciones de Pago:
- "Quiero pagar"
- "Envíame el link"
- "¿Cómo puedo pagar?"
- "Dame el enlace"
- "Link de compra"
- "Finalizar compra"
- "Pago ahora"
- "Quiero el link"

### Métodos de Pago:
- "MercadoPago" / "Mercado Pago"
- "PayPal"
- "Nequi"
- "Daviplata"

### Consultas Generales:
- "¿Qué métodos de pago tienen?"
- "Formas de pago"
- "Cómo pago"

## 🔍 Monitoreo

### Ver logs en tiempo real:

```bash
# El servidor mostrará:
[FlowBaileys] 🎯 Procesando mensaje con FlowEngine
💡 Intención detectada: payment_request
💳 Método de pago detectado: mercadopago
[FlowBaileys] ✅ 2 respuestas enviadas
```

### Obtener estadísticas de sesión:

```typescript
import { FlowBaileysIntegration } from './lib/flow-baileys-integration'

const stats = FlowBaileysIntegration.getSessionStats(chatId)
console.log(stats)
// {
//   state: 'awaiting_payment',
//   messageCount: 15,
//   hasProduct: true,
//   hasOrder: true,
//   paymentMethod: 'mercadopago'
// }
```

## 🛠️ Solución de Problemas

### Problema: "No detecta intenciones de pago"

**Solución:**
```typescript
// Agregar más frases en src/lib/plantillas-respuestas-bot.ts
private static paymentIntents = [
  'quiero pagar',
  'enviame el link',
  // ... agregar más aquí
  'tu frase personalizada'
];
```

### Problema: "Links no se generan"

**Verificar:**
1. ✅ `NEXT_PUBLIC_APP_URL` en `.env`
2. ✅ API `/api/payments/generate-link` funciona
3. ✅ Credenciales de MercadoPago/PayPal configuradas

### Problema: "Respuestas duplicadas"

**Solución:**
- Asegúrate de usar SOLO FlowEngine O clean-bot, no ambos
- Comenta el código del sistema que no uses

## 📈 Ventajas del FlowEngine

| Característica | clean-bot | FlowEngine |
|---------------|-----------|------------|
| Detección de pago | ❌ Básica | ✅ Inteligente |
| Links dinámicos | ❌ Manual | ✅ Automático |
| Contexto de conversación | ❌ Limitado | ✅ Completo |
| Manejo de estados | ❌ No | ✅ Sí |
| Botones interactivos | ❌ No | ✅ Sí |
| Historial de mensajes | ❌ No | ✅ Sí (20 últimos) |
| Personalización | ❌ Difícil | ✅ Fácil |

## 🎓 Próximos Pasos

1. ✅ Probar el sistema con `test-flow-engine.ts`
2. ✅ Activar en producción (Opción A o B)
3. ✅ Personalizar plantillas
4. ✅ Reiniciar servidor
5. ✅ Probar en WhatsApp real
6. ✅ Monitorear logs
7. ✅ Ajustar según necesidad

## 📚 Documentación Completa

Lee `SISTEMA_FLOW_ENGINE_INTELIGENTE.md` para:
- API completa
- Ejemplos avanzados
- Personalización profunda
- Integración con webhooks
- Persistencia de sesiones

## ✨ Resultado Final

Con el FlowEngine activado, tu bot:

✅ Detecta automáticamente intenciones de pago  
✅ Genera links dinámicos al instante  
✅ Mantiene contexto de conversación  
✅ Ofrece botones interactivos  
✅ Maneja múltiples métodos de pago  
✅ Responde de forma natural y profesional  
✅ Guía al usuario paso a paso  

---

**¿Listo para activar?**

```bash
# Ejecutar pruebas
npx tsx scripts/test-flow-engine.ts

# O usar el script de activación
activar-flow-engine.bat
```

**¡Tu bot ahora es mucho más inteligente! 🚀**
