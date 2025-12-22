# ✅ Correcciones para Arquitectura Asíncrona en Baileys

## 🚨 Problema Detectado

El archivo `src/lib/baileys-stable-service.ts` se corrompió durante los cambios. Tiene:
- Código duplicado
- Funciones incompletas
- Sintaxis incorrecta
- Bloques de código cortados

## 🎯 Solución Recomendada

**NO EDITAR EL ARCHIVO CORRUPTO**. En su lugar:

### Opción 1: Restaurar desde Git (RECOMENDADO)

```bash
# Ver el último commit bueno
git log --oneline src/lib/baileys-stable-service.ts

# Restaurar el archivo
git checkout HEAD~1 -- src/lib/baileys-stable-service.ts

# O restaurar desde un commit específico
git checkout <commit-hash> -- src/lib/baileys-stable-service.ts
```

### Opción 2: Revertir Cambios de Kiro

Usar el botón "Revert" en la interfaz de Kiro para deshacer los últimos cambios en `baileys-stable-service.ts`.

## 📋 Cambios que se Necesitan Aplicar (DESPUÉS de restaurar)

Una vez que tengas el archivo limpio, aplicar estos cambios:

### 1. En `setupMessageHandler()` - Línea ~400

**REEMPLAZAR** el bloque completo de procesamiento de mensajes (desde `// 🚀 ARQUITECTURA ASÍNCRONA` hasta el final del try-catch) con:

```typescript
// 🚀 ARQUITECTURA ASÍNCRONA (RESPUESTA INMEDIATA + ANÁLISIS BACKGROUND)
console.log('[Baileys] 🚀 Usando ARQUITECTURA ASÍNCRONA')

try {
  const conversationKey = `${userId}:${from}`
  
  // 1️⃣ RESPUESTA INMEDIATA (< 1s)
  console.log('[Baileys] ⚡ Enviando respuesta inmediata...')
  const immediateResponse = '🔍 Un momento, buscando la mejor opción para ti...'
  
  await HumanTypingSimulator.quickHumanizedSend(socket, from, immediateResponse)
  await this.saveOutgoingMessage(userId, from, immediateResponse, conversation.id)
  
  console.log('[Baileys] ✅ Respuesta inmediata enviada')

  // 2️⃣ INICIAR ANÁLISIS CON OLLAMA (background, no espera)
  console.log('[Baileys] 🤖 Iniciando análisis con Ollama en background...')
  const { AsyncOllamaAnalyzer } = await import('./async-ollama-analyzer')
  
  // Iniciar análisis (no await, se ejecuta en paralelo)
  AsyncOllamaAnalyzer.startAnalysis(conversationKey, messageText, userId)
  
  // 3️⃣ ESPERAR RESULTADO DEL ANÁLISIS (máximo 20s)
  console.log('[Baileys] ⏳ Esperando resultado de Ollama...')
  const analysisResult = await AsyncOllamaAnalyzer.getAnalysisResult(conversationKey)
  
  let responseText = ''
  
  if (analysisResult && analysisResult.products.length > 0) {
    // 4️⃣ FORMATEAR CON GROQ (2-3s)
    console.log('[Baileys] 🎨 Formateando respuesta con Groq...')
    const { GroqResponseFormatter } = await import('./groq-response-formatter')
    
    responseText = await GroqResponseFormatter.formatResponse(
      messageText,
      analysisResult.context,
      analysisResult.products
    )
    
    console.log('[Baileys] ✅ Respuesta formateada con Groq')
  } else {
    // FALLBACK: Si Ollama no encontró nada, usar sistema híbrido tradicional
    console.log('[Baileys] ⚠️ Ollama no encontró productos, usando sistema híbrido tradicional...')
    
    // Obtener historial
    const historyMessages = await db.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const history = historyMessages.reverse().map(msg => ({
      role: msg.direction === 'INCOMING' ? 'user' : 'assistant',
      content: msg.content
    }))

    // Inicializar sistema híbrido si no está listo
    if (!this.hybridSystem) {
      await this.initializeHybridSystem()
    }

    if (this.hybridSystem) {
      responseText = await this.hybridSystem.processMessage(
        messageText,
        userId,
        history,
        from
      )
      console.log('[Baileys] ✅ Respuesta generada con sistema híbrido (fallback)')
    } else {
      responseText = '😅 No encontré productos exactos con esa búsqueda.\n\n¿Podrías darme más detalles de lo que buscas? 🤔'
    }
  }

  // 5️⃣ ENVIAR RESPUESTA FINAL
  if (responseText) {
    console.log('[Baileys] 📤 Enviando respuesta final...')
    await HumanTypingSimulator.humanizedSend(socket, from, responseText, messageText.length)
    await this.saveOutgoingMessage(userId, from, responseText, conversation.id)
    console.log('[Baileys] ✅ Respuesta final enviada')
  }
  
} catch (error) {
  console.error('[Baileys] ❌ Error con arquitectura asíncrona:', error)
  
  // FALLBACK FINAL: Respuesta simple
  const fallbackResponse = '😅 Disculpa, tuve un problema. ¿Puedes intentar de nuevo?'
  await socket.sendMessage(from, { text: fallbackResponse })
  await this.saveOutgoingMessage(userId, from, fallbackResponse, conversation.id)
}
```

## 🔍 Verificar Después de Aplicar

```bash
# Verificar sintaxis TypeScript
npx tsc --noEmit

# Verificar imports
npm run lint

# Probar el bot
npm run dev
```

## 📊 Flujo de la Arquitectura Asíncrona

```
Usuario envía mensaje
    ↓
1️⃣ RESPUESTA INMEDIATA (< 1s)
   "🔍 Un momento, buscando..."
    ↓
2️⃣ ANÁLISIS OLLAMA (background)
   - Buscar productos
   - Analizar contexto
   - Scoring inteligente
    ↓
3️⃣ ESPERAR RESULTADO (máx 20s)
   - Si encuentra → continuar
   - Si timeout → fallback
    ↓
4️⃣ FORMATEAR CON GROQ (2-3s)
   - Respuesta natural
   - Emojis
   - Personalidad
    ↓
5️⃣ ENVIAR RESPUESTA FINAL
   Con simulación humana
```

## ⚡ Beneficios

- ✅ Usuario recibe respuesta inmediata (< 1s)
- ✅ Ollama analiza en background (gratis)
- ✅ Groq solo formatea (rápido y barato)
- ✅ Fallback automático si falla
- ✅ Experiencia fluida

## 🚨 Importante

**NO INTENTAR EDITAR EL ARCHIVO CORRUPTO DIRECTAMENTE**

Primero restaurar desde Git, luego aplicar los cambios limpios.
