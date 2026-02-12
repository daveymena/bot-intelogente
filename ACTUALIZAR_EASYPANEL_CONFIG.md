# 🚀 Actualizar Configuración en Easypanel

## ✅ Cambios Realizados en `.env.easypanel.optimizado`

### 🔄 Cambios Importantes:

1. **Groq Optimizado:**
   - `GROQ_MAX_TOKENS=500` (antes 350)
   - `GROQ_TIMEOUT=60000` (antes 30000)

2. **Ollama Habilitado:**
   - `OLLAMA_ENABLED=true` (antes false)
   - `OLLAMA_BASE_URL=https://bot-whatsapp-ollama.sqaoeo.easypanel.host`
   - `OLLAMA_TIMEOUT=30000` (antes 5000)
   - `OLLAMA_MAX_TOKENS=400` (antes 300)

3. **OpenRouter Eliminado:**
   - Ya no está en el sistema de fallback

4. **Fallback Actualizado:**
   - `AI_FALLBACK_ORDER=groq,ollama` (antes groq,openrouter)

## 📋 Variables de Entorno para Easypanel

Copia y pega estas variables en Easypanel:

```env
# ===== INTELIGENCIA ARTIFICIAL =====
GROQ_API_KEY=gsk_TU_API_KEY_AQUI
GROQ_MODEL=llama-3.1-8b-instant
GROQ_FALLBACK_MODELS=llama-3.3-70b-versatile
GROQ_MAX_TOKENS=500
GROQ_TIMEOUT=60000

OLLAMA_BASE_URL=https://bot-whatsapp-ollama.sqaoeo.easypanel.host
OLLAMA_MODEL=llama3.2:1b # ⚡ ULTRA-RÁPIDO (RECOMENDADO PARA EASYPANEL)
OLLAMA_ENABLED=true
AI_FALLBACK_ORDER=groq,ollama
AI_USE_REASONING=false
```

### ⚡ Notas de Rendimiento:
- Para máxima velocidad usa: `llama3.2:1b` (1-2s response)
- Para mejor inteligencia usa: `qwen2.5:3b` (5-10s response)
- `qwen2.5:7b` puede demorar 15-30s en Easypanel sin GPU.

## 🎯 Cómo Actualizar en Easypanel

### Opción 1: Desde la Interfaz Web

1. Ve a tu proyecto en Easypanel
2. Click en "Environment Variables"
3. Busca y actualiza estas variables:
   - `GROQ_MAX_TOKENS` → `500`
   - `GROQ_TIMEOUT` → `60000`
   - `OLLAMA_ENABLED` → `true`
   - `OLLAMA_BASE_URL` → `https://bot-whatsapp-ollama.sqaoeo.easypanel.host`
   - `OLLAMA_TIMEOUT` → `30000`
   - `OLLAMA_MAX_TOKENS` → `400`
   - `AI_FALLBACK_ORDER` → `groq,ollama`
4. Elimina estas variables (si existen):
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_MODEL`
5. Click en "Save"
6. Reinicia el servicio

### Opción 2: Desde Git

1. Commit los cambios:
```bash
git add .env.easypanel.optimizado
git commit -m "feat: Ollama como fallback ilimitado"
git push origin main
```

2. En Easypanel:
   - Ve a tu proyecto
   - Click en "Deploy"
   - Espera a que se despliegue

## ✅ Verificar que Funciona

### 1. Ver Logs:
```bash
# En Easypanel, ve a "Logs" y busca:
[AI Multi-Provider] 🔄 Orden de fallback: groq → ollama
```

### 2. Probar Respuesta:
- Envía un mensaje al bot
- Debe responder normalmente con Groq
- Si Groq falla, usará Ollama automáticamente

### 3. Verificar Ollama:
```bash
# Verifica que Ollama esté corriendo
curl https://bot-whatsapp-ollama.sqaoeo.easypanel.host/api/tags
```

## 🎯 Resultado Esperado

### Escenario Normal:
```
Cliente: "Tienes laptops?"
→ Groq responde en 2 segundos ✅
```

### Escenario Sin Tokens:
```
Cliente: "Tienes laptops?"
→ Groq falla (sin tokens) ❌
→ Ollama responde en 15 segundos ✅
→ Bot nunca deja de funcionar!
```

## ⚠️ Notas Importantes

1. **Ollama es más lento** (10-30 segundos)
   - Pero la demora humana lo hace parecer natural
   - El cliente no notará tanto la diferencia

2. **Ollama es ilimitado**
   - No tiene límite de tokens
   - Funciona 24/7
   - Garantiza que el bot siempre responda

3. **OpenRouter eliminado**
   - Ya no es necesario
   - Simplifica el sistema
   - Reduce costos

## 🚀 Beneficios

✅ Bot nunca se queda sin IA
✅ Respuestas garantizadas 24/7
✅ Más económico (Ollama es gratis)
✅ Más simple (solo 2 providers)
✅ Más confiable (fallback ilimitado)

---

**Fecha:** 2025-11-04
**Estado:** ✅ Listo para Desplegar
**Archivo:** `.env.easypanel.optimizado`
