# 🔴 Problema: Bot No Recuerda Conversaciones

**Fecha:** 12 de febrero de 2026  
**Reportado por:** Usuario  
**Síntoma:** "Le pregunté 3 veces por el bot y no respondió bien"

---

## 📋 Problema Identificado

### Síntoma
El bot no recuerda conversaciones previas. Si le preguntas algo 3 veces, no usa el contexto de las preguntas anteriores.

### Causa Raíz

**OpenClaw usa memoria en RAM (Map) que se pierde:**

```typescript
// src/lib/bot/openclaw-orchestrator.ts
class OpenClawOrchestrator {
    conversationHistory: Map<string, any[]>;  // ❌ Solo en RAM
    
    constructor() {
        this.conversationHistory = new Map();  // Se pierde al reiniciar
    }
}
```

**Problemas:**
1. ❌ Memoria solo en RAM (se pierde al reiniciar servidor)
2. ❌ No usa `ConversationContextService` (que guarda en DB)
3. ❌ No persiste entre reinicios
4. ❌ No sincroniza con la base de datos

---

## 🔍 Análisis

### Sistema Actual

**OpenClaw (openclaw-orchestrator.ts):**
- Tiene su propia memoria: `Map<string, any[]>`
- Solo en RAM
- Se pierde al reiniciar

**ConversationContextService (conversation-context-service.ts):**
- Memoria persistente en DB
- Duración: 24 horas
- Sincroniza RAM + DB
- ❌ NO está siendo usado por OpenClaw

### Flujo Actual (Problemático)

```
1. Cliente envía mensaje
   ↓
2. AgentRouter llama OpenClaw
   ↓
3. OpenClaw busca en su Map interna
   ↓
4. Si no existe → Crea nueva conversación (sin historial)
   ↓
5. Responde sin contexto previo ❌
```

### Flujo Esperado (Correcto)

```
1. Cliente envía mensaje
   ↓
2. AgentRouter llama OpenClaw
   ↓
3. OpenClaw consulta ConversationContextService
   ↓
4. ConversationContextService carga desde DB
   ↓
5. OpenClaw responde CON contexto previo ✅
```

---

## ✅ Solución

### Opción 1: Integrar ConversationContextService en OpenClaw (Recomendado)

**Modificar:** `src/lib/bot/openclaw-orchestrator.ts`

**Cambios:**

1. **Importar el servicio:**
```typescript
import { ConversationContextService } from '../conversation-context-service';
```

2. **Reemplazar Map por ConversationContextService:**
```typescript
// ANTES
async processMessage(messageText: string, from: string, context: any) {
    if (!this.conversationHistory.has(from)) {
        this.conversationHistory.set(from, []);
    }
    const history = this.conversationHistory.get(from)!;
    // ...
}

// DESPUÉS
async processMessage(messageText: string, from: string, context: any) {
    // Cargar historial desde servicio persistente
    const historyMessages = await ConversationContextService.getMessageHistory(
        from,
        context.userId,
        this.maxHistory
    );
    
    const history = historyMessages.map(msg => ({
        role: msg.role,
        content: msg.content
    }));
    // ...
}
```

3. **Guardar mensajes en el servicio:**
```typescript
// Después de generar respuesta
await ConversationContextService.addMessage(from, context.userId, 'user', messageText);
await ConversationContextService.addMessage(from, context.userId, 'assistant', response);
```

### Opción 2: Usar Redis para Memoria (Avanzado)

Si quieres alta performance:
- Instalar Redis
- Guardar historial en Redis con TTL de 24h
- Fallback a DB si Redis falla

---

## 🔧 Implementación Paso a Paso

### Paso 1: Modificar OpenClaw

**Archivo:** `src/lib/bot/openclaw-orchestrator.ts`

**Línea ~450 (constructor):**
```typescript
constructor() {
    // Ya no necesitamos Map interno
    // this.conversationHistory = new Map();  // ❌ ELIMINAR
    this.maxHistory = 20;
    // ... resto del código
}
```

**Línea ~500 (processMessage):**
```typescript
async processMessage(messageText: string, from: string, context: any) {
    console.log(`[Architect] 🧠 Iniciando Modo Ultra Inteligente para ${from}...`);
    
    // ✅ CARGAR HISTORIAL DESDE SERVICIO PERSISTENTE
    const historyMessages = await ConversationContextService.getMessageHistory(
        from,
        context.userId,
        this.maxHistory
    );
    
    const history = historyMessages.map(msg => ({
        role: msg.role,
        content: msg.content
    }));
    
    // ... resto del código (análisis, herramientas, etc.)
    
    // ✅ GUARDAR MENSAJES EN SERVICIO PERSISTENTE
    await ConversationContextService.addMessage(from, context.userId, 'user', messageText);
    await ConversationContextService.addMessage(from, context.userId, 'assistant', response);
    
    return { text: response, success: true, media, toolData, isSpecific, nextStage };
}
```

### Paso 2: Inicializar el Servicio

**Archivo:** `server.ts`

**Agregar al inicio:**
```typescript
import { ConversationContextService } from './src/lib/conversation-context-service';

// Inicializar servicio de contexto
ConversationContextService.initialize();
```

### Paso 3: Probar

```bash
# Reiniciar bot
npm run dev

# Probar conversación:
1. "Hola, busco un laptop"
2. [Reiniciar servidor]
3. "¿Recuerdas qué estaba buscando?"
   Esperado: "Sí, estabas buscando un laptop"
```

---

## 📊 Comparación

### Antes del Fix

| Característica | Estado |
|---------------|--------|
| Memoria persistente | ❌ No |
| Sobrevive reinicios | ❌ No |
| Sincroniza con DB | ❌ No |
| Duración | ❌ Hasta reinicio |
| Contexto entre mensajes | ⚠️ Solo en sesión actual |

### Después del Fix

| Característica | Estado |
|---------------|--------|
| Memoria persistente | ✅ Sí (DB) |
| Sobrevive reinicios | ✅ Sí |
| Sincroniza con DB | ✅ Sí |
| Duración | ✅ 24 horas |
| Contexto entre mensajes | ✅ Siempre |

---

## 🎯 Beneficios

1. **Memoria persistente:** El bot recuerda conversaciones incluso después de reiniciar
2. **Contexto real:** Usa historial de 24 horas
3. **Mejor experiencia:** Cliente no tiene que repetir información
4. **Sincronización:** Memoria en RAM + DB
5. **Escalabilidad:** Funciona con múltiples instancias del servidor

---

## 🚀 Próximos Pasos

1. **Implementar el fix** (modificar openclaw-orchestrator.ts)
2. **Probar localmente** (conversación → reiniciar → verificar memoria)
3. **Hacer commit y push** (después de resolver el problema de GitHub)
4. **Desplegar en Easypanel**
5. **Probar en producción** (WhatsApp real)

---

## 📝 Archivos a Modificar

1. `src/lib/bot/openclaw-orchestrator.ts` - Integrar ConversationContextService
2. `server.ts` - Inicializar el servicio
3. Tests - Crear tests de memoria persistente

---

**Estado:** Problema identificado ✅  
**Solución:** Integrar ConversationContextService  
**Prioridad:** Alta (afecta experiencia del usuario)
