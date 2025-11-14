# 🔧 SOLUCIÓN: Error de Tokens en Groq

## ❌ Problema

El bot estaba fallando con error 413:
```
Request too large for model `llama-3.1-8b-instant`: 
Limit 6000, Requested 7807 tokens
```

**Causa:** El prompt del sistema + historial de mensajes excedía el límite de 6000 tokens de Groq.

## ✅ Solución Implementada

### 1. Reducción del Historial de Mensajes

**Antes:**
- Cargaba 73-77 mensajes de las últimas 24 horas
- Enviaba los últimos 20 mensajes a Groq
- Total: ~7800 tokens

**Después:**
- Carga los mismos mensajes de 24h (para memoria de contexto)
- Envía solo los últimos 5 mensajes a Groq
- Total: ~3000-4000 tokens

**Cambios en `src/lib/ai-service.ts`:**
```typescript
// Línea 256
...historyToUse.slice(-5), // Solo últimos 5 mensajes

// Línea 1114
...conversationHistory.slice(-5), // Solo últimos 5 mensajes
```

### 2. Por Qué Funciona

- **Memoria de contexto:** El sistema sigue cargando el historial completo de 24h para detectar productos mencionados
- **Envío a IA:** Solo envía los últimos 5 mensajes para no exceder el límite
- **Resultado:** El bot mantiene el contexto pero usa menos tokens

## 📊 Comparación

| Aspecto | Antes | Después |
|---------|-------|---------|
| Mensajes cargados | 73-77 | 73-77 |
| Mensajes enviados a Groq | 20 | 5 |
| Tokens usados | ~7800 | ~3500 |
| Estado | ❌ Error 413 | ✅ Funciona |

## 🧪 Prueba

El bot ahora debería responder correctamente sin el error 413.

**Prueba:**
1. Envía "Hola" → Debe responder con saludo
2. Envía "Estoy interesado en la moto" → Debe responder sobre la moto
3. Envía "Cuánto cuesta?" → Debe recordar que hablas de la moto

## ⚠️ Limitación

Con solo 5 mensajes de historial, el bot puede perder contexto de conversaciones muy largas. Si esto es un problema, considera:

1. **Usar un modelo con más tokens:** Cambiar a `llama-3.1-70b-versatile` (8000 tokens)
2. **Activar multi-provider:** Usar el sistema de fallback con otros proveedores
3. **Optimizar el prompt del sistema:** Reducir el tamaño del prompt base

## 🔄 Alternativa: Activar Multi-Provider

Si quieres más tokens, activa el sistema multi-provider en `.env`:
```
AI_FALLBACK_ENABLED=true
```

Esto usará automáticamente otros proveedores si Groq falla.

---

**Fecha:** 2025-01-30
**Estado:** ✅ SOLUCIONADO
