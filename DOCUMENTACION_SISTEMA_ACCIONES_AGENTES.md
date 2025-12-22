# 📋 Documentación: Sistema de Acciones de Agentes

## Resumen Ejecutivo

El sistema de agentes define **acciones** en las respuestas (`AgentResponse.actions`), pero actualmente **NO se ejecutan automáticamente**. El envío de fotos, links de pago y emails se maneja de forma **independiente** en el servicio de Baileys.

---

## 🏗️ Arquitectura Actual

### 1. Definición de Acciones (Base Agent)

**Archivo:** `src/agents/base-agent.ts`

```typescript
export interface AgentAction {
  type: 'send_photo' | 'send_payment_link' | 'mark_as_sold' | 'send_email' | 'update_context' | 'send_specific_payment_method' | 'send_images';
  data?: any;
  method?: string;
  product?: any;
  formattedText?: string;
  images?: string[];
}

export interface AgentResponse {
  text: string;
  nextAgent?: string;
  sendPhotos?: boolean;
  photos?: string[];
  actions?: AgentAction[];  // ← Acciones definidas pero NO ejecutadas
  confidence?: number;
  requiresAI?: boolean;
  context?: any;
  metadata?: any;
}
```

### 2. Generación de Acciones (Photo Agent)

**Archivo:** `src/agents/photo-agent.ts`

```typescript
return {
  text: `¡Claro! Te envío la foto de *${product.name}* 📸`,
  sendPhotos: true,
  photos: product.images,
  nextAgent: 'product',
  confidence: 0.95,
  actions: [
    {
      type: 'send_photo',
      data: { product },
    },
  ],
};
```

**❌ Problema:** Las `actions` se definen pero **nunca se ejecutan**.

### 3. Procesamiento en Orquestador

**Archivo:** `src/agents/orchestrator.ts`

```typescript
// El orquestador procesa el mensaje y devuelve la respuesta
const response = await agent.execute(message, memory);

// Agrega respuesta al historial
this.memoryService.addMessage(chatId, 'assistant', response.text);

// ❌ NO HAY CÓDIGO QUE EJECUTE response.actions
```

### 4. Wrapper del Orquestador

**Archivo:** `src/agents/agent-orchestrator-wrapper.ts`

```typescript
// Convierte la respuesta del orquestador al formato de Baileys
return {
  message: response.text,
  confidence: response.confidence,
  intent: response.context?.salesStage || 'general',
  shouldSendPhotos,  // ← Detecta si debe enviar fotos
  photos,
  productId,
  agentUsed: response.nextAgent || 'orchestrator'
};

// ❌ NO PROCESA response.actions
```

### 5. Ejecución Real (Baileys Service)

**Archivo:** `src/lib/baileys-stable-service.ts`

```typescript
// Procesar mensaje con AI Service
const aiResponse = await AIService.generateResponse(
  userId,
  messageText,
  from,
  history
);

// Enviar respuesta de texto
await socket.sendMessage(from, { text: aiResponse.message });

// ❌ El envío de fotos se maneja INDEPENDIENTEMENTE
// No hay código que procese aiResponse.actions
```

---

## 🔍 Flujo Actual vs Esperado

### Flujo Actual (Fragmentado)

```
Usuario: "Muéstrame fotos del laptop"
    ↓
[Baileys] Recibe mensaje
    ↓
[AIService] Genera respuesta
    ↓
[Baileys] Envía texto: "Te envío las fotos..."
    ↓
❌ Las fotos NO se envían automáticamente
```

### Flujo Esperado (Con Dispatcher)

```
Usuario: "Muéstrame fotos del laptop"
    ↓
[Baileys] Recibe mensaje
    ↓
[Orchestrator] Procesa con PhotoAgent
    ↓
[PhotoAgent] Devuelve:
  - text: "Te envío las fotos..."
  - actions: [{ type: 'send_photo', data: {...} }]
    ↓
[ActionDispatcher] Ejecuta acciones:
  ✅ Envía texto
  ✅ Envía fotos
  ✅ Envía link de pago (si aplica)
```

---

## 🛠️ Solución: Implementar Action Dispatcher

### Paso 1: Crear el Dispatcher

**Archivo:** `src/lib/action-dispatcher.ts`

```typescript
import { WASocket } from '@whiskeysockets/baileys';
import { AgentAction } from '@/agents/base-agent';
import { db } from './db';
import fs from 'fs';
import path from 'path';

export class ActionDispatcher {
  /**
   * Ejecuta todas las acciones de una respuesta de agente
   */
  static async executeActions(
    socket: WASocket,
    userId: string,
    from: string,
    actions: AgentAction[]
  ): Promise<void> {
    if (!actions || actions.length === 0) return;

    console.log(`[ActionDispatcher] 🎬 Ejecutando ${actions.length} acción(es)`);

    for (const action of actions) {
      try {
        await this.executeAction(socket, userId, from, action);
      } catch (error) {
        console.error(`[ActionDispatcher] ❌ Error ejecutando acción ${action.type}:`, error);
      }
    }
  }

  /**
   * Ejecuta una acción individual
   */
  private static async executeAction(
    socket: WASocket,
    userId: string,
    from: string,
    action: AgentAction
  ): Promise<void> {
    console.log(`[ActionDispatcher] 🎯 Ejecutando: ${action.type}`);

    switch (action.type) {
      case 'send_photo':
      case 'send_images':
        await this.sendPhotos(socket, from, action);
        break;

      case 'send_payment_link':
        await this.sendPaymentLink(socket, from, action);
        break;

      case 'send_specific_payment_method':
        await this.sendSpecificPaymentMethod(socket, from, action);
        break;

      case 'send_email':
        await this.sendEmail(action);
        break;

      case 'mark_as_sold':
        await this.markAsSold(action);
        break;

      case 'update_context':
        // Ya se maneja en el orquestador
        console.log('[ActionDispatcher] ℹ️ update_context manejado por orquestador');
        break;

      default:
        console.warn(`[ActionDispatcher] ⚠️ Acción desconocida: ${action.type}`);
    }
  }

  /**
   * Enviar fotos del producto
   */
  private static async sendPhotos(
    socket: WASocket,
    from: string,
    action: AgentAction
  ): Promise<void> {
    const images = action.images || action.data?.product?.images || [];
    
    if (images.length === 0) {
      console.log('[ActionDispatcher] ⚠️ No hay imágenes para enviar');
      return;
    }

    console.log(`[ActionDispatcher] 📸 Enviando ${images.length} foto(s)`);

    for (const imageUrl of images) {
      try {
        // Si es URL, descargar primero
        if (imageUrl.startsWith('http')) {
          const response = await fetch(imageUrl);
          const buffer = Buffer.from(await response.arrayBuffer());
          
          await socket.sendMessage(from, {
            image: buffer,
            caption: action.formattedText || ''
          });
        } else {
          // Si es ruta local
          const imagePath = path.join(process.cwd(), 'public', imageUrl);
          const buffer = await fs.promises.readFile(imagePath);
          
          await socket.sendMessage(from, {
            image: buffer,
            caption: action.formattedText || ''
          });
        }

        console.log('[ActionDispatcher] ✅ Foto enviada');
        
        // Delay entre fotos para evitar spam
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('[ActionDispatcher] ❌ Error enviando foto:', error);
      }
    }
  }

  /**
   * Enviar link de pago
   */
  private static async sendPaymentLink(
    socket: WASocket,
    from: string,
    action: AgentAction
  ): Promise<void> {
    const { product, method } = action.data || {};
    
    if (!product) {
      console.log('[ActionDispatcher] ⚠️ No hay producto para generar link');
      return;
    }

    console.log(`[ActionDispatcher] 💳 Generando link de pago (${method || 'auto'})`);

    try {
      const { PaymentLinkGenerator } = await import('./payment-link-generator');
      
      const link = await PaymentLinkGenerator.generateLink({
        productId: product.id,
        productName: product.name,
        price: product.price,
        method: method || 'mercadopago'
      });

      const message = action.formattedText || 
        `💳 Aquí está tu link de pago para *${product.name}*:\n\n${link}\n\n✅ Pago seguro y verificado`;

      await socket.sendMessage(from, { text: message });
      console.log('[ActionDispatcher] ✅ Link de pago enviado');
    } catch (error) {
      console.error('[ActionDispatcher] ❌ Error generando link:', error);
    }
  }

  /**
   * Enviar método de pago específico
   */
  private static async sendSpecificPaymentMethod(
    socket: WASocket,
    from: string,
    action: AgentAction
  ): Promise<void> {
    const message = action.formattedText || 'Información de pago';
    await socket.sendMessage(from, { text: message });
    console.log('[ActionDispatcher] ✅ Método de pago enviado');
  }

  /**
   * Enviar email
   */
  private static async sendEmail(action: AgentAction): Promise<void> {
    const { to, subject, body } = action.data || {};
    
    if (!to) {
      console.log('[ActionDispatcher] ⚠️ No hay destinatario para email');
      return;
    }

    console.log(`[ActionDispatcher] 📧 Enviando email a ${to}`);

    try {
      const { EmailService } = await import('./email-service');
      
      await EmailService.sendEmail({
        to,
        subject: subject || 'Notificación',
        html: body || '',
        text: body || ''
      });

      console.log('[ActionDispatcher] ✅ Email enviado');
    } catch (error) {
      console.error('[ActionDispatcher] ❌ Error enviando email:', error);
    }
  }

  /**
   * Marcar producto como vendido
   */
  private static async markAsSold(action: AgentAction): Promise<void> {
    const { productId } = action.data || {};
    
    if (!productId) {
      console.log('[ActionDispatcher] ⚠️ No hay productId para marcar como vendido');
      return;
    }

    console.log(`[ActionDispatcher] ✅ Marcando producto ${productId} como vendido`);

    try {
      await db.product.update({
        where: { id: productId },
        data: { stock: 0 }
      });

      console.log('[ActionDispatcher] ✅ Producto marcado como vendido');
    } catch (error) {
      console.error('[ActionDispatcher] ❌ Error marcando producto:', error);
    }
  }
}
```

### Paso 2: Integrar en Baileys Service

**Modificar:** `src/lib/baileys-stable-service.ts`

```typescript
// Después de generar la respuesta con AIService
const aiResponse = await AIService.generateResponse(
  userId,
  messageText,
  from,
  history
);

// Enviar texto
await socket.sendMessage(from, { text: aiResponse.message });

// ✅ NUEVO: Ejecutar acciones si existen
if (aiResponse.actions && aiResponse.actions.length > 0) {
  const { ActionDispatcher } = await import('./action-dispatcher');
  await ActionDispatcher.executeActions(socket, userId, from, aiResponse.actions);
}
```

### Paso 3: Actualizar AIService para devolver acciones

**Modificar:** `src/lib/ai-service.ts`

```typescript
// Después de generar la respuesta, detectar si necesita acciones
const actions: AgentAction[] = [];

// Detectar si debe enviar fotos
if (shouldSendPhotos && product) {
  actions.push({
    type: 'send_photo',
    data: { product },
    images: product.images
  });
}

// Detectar si debe enviar link de pago
if (paymentIntent && product) {
  actions.push({
    type: 'send_payment_link',
    data: { product, method: preferredPaymentMethod }
  });
}

return {
  message: responseText,
  confidence: 0.9,
  actions  // ← Incluir acciones en la respuesta
};
```

---

## 📊 Estado Actual del Sistema

### ✅ Lo que Funciona

1. **Detección de intenciones** - Los agentes detectan correctamente cuando el usuario pide fotos
2. **Generación de respuestas** - Los agentes generan texto apropiado
3. **Definición de acciones** - Los agentes definen qué acciones ejecutar

### ❌ Lo que NO Funciona

1. **Ejecución de acciones** - Las acciones definidas nunca se ejecutan
2. **Envío automático de fotos** - Requiere lógica separada en Baileys
3. **Envío de links de pago** - No se genera automáticamente
4. **Coordinación** - Cada funcionalidad está fragmentada

---

## 🎯 Beneficios de Implementar el Dispatcher

### Antes (Fragmentado)
```typescript
// Código duplicado en múltiples lugares
if (shouldSendPhotos) {
  // Lógica de envío de fotos
}
if (paymentIntent) {
  // Lógica de pago
}
```

### Después (Centralizado)
```typescript
// Una sola línea ejecuta todas las acciones
await ActionDispatcher.executeActions(socket, userId, from, response.actions);
```

### Ventajas

1. **Código limpio** - Una sola responsabilidad por clase
2. **Fácil mantenimiento** - Cambios en un solo lugar
3. **Extensible** - Agregar nuevas acciones es trivial
4. **Testeable** - Cada acción se puede probar independientemente
5. **Consistente** - Todas las acciones se ejecutan de la misma forma

---

## 📝 Próximos Pasos

### Implementación Inmediata

1. ✅ Crear `src/lib/action-dispatcher.ts`
2. ✅ Integrar en `baileys-stable-service.ts`
3. ✅ Actualizar `ai-service.ts` para devolver acciones
4. ✅ Probar con envío de fotos
5. ✅ Probar con links de pago

### Mejoras Futuras

1. **Queue de acciones** - Ejecutar acciones en orden con delays
2. **Retry logic** - Reintentar acciones fallidas
3. **Logging mejorado** - Registrar todas las acciones ejecutadas
4. **Analytics** - Métricas de acciones ejecutadas
5. **Webhooks** - Notificar cuando se ejecutan acciones importantes

---

## 🔗 Archivos Relacionados

- `src/agents/base-agent.ts` - Definición de tipos
- `src/agents/photo-agent.ts` - Ejemplo de generación de acciones
- `src/agents/payment-agent.ts` - Acciones de pago
- `src/agents/orchestrator.ts` - Coordinador principal
- `src/agents/agent-orchestrator-wrapper.ts` - Adaptador
- `src/lib/baileys-stable-service.ts` - Ejecución real
- `src/lib/ai-service.ts` - Generación de respuestas

---

**Fecha:** 21 Nov 2025  
**Estado:** Documentación completa - Listo para implementación

