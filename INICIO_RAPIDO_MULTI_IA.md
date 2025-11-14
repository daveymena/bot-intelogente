# 🚀 Inicio Rápido: Sistema Multi-Provider de IA

## ⚡ En 3 Pasos

### 1️⃣ Instalar LM Studio (5 minutos)

1. Descarga: https://lmstudio.ai/
2. Instala y abre
3. Descarga el modelo `phi-2`
4. Settings → Activa **"Enable local REST API server"**

### 2️⃣ Activar el Sistema

En tu archivo `.env`, verifica que esté:

```env
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=groq,lmstudio,openai
```

### 3️⃣ Probar

```bash
# Ejecuta el test
probar-multi-provider.bat

# O manualmente
npx tsx scripts/test-multi-provider.ts
```

## ✅ Verificación Rápida

Deberías ver:

```
✅ GROQ: FUNCIONANDO
✅ LMSTUDIO: FUNCIONANDO
```

## 🎯 ¿Qué Hace?

Si Groq falla → usa LM Studio automáticamente
Si LM Studio falla → usa OpenAI (si está configurado)

**Tu bot NUNCA se quedará sin respuestas** 🎉

## 🔧 Configuración Mínima

Solo necesitas:

1. **LM Studio ejecutándose** (local, gratis, sin límites)
2. **GROQ_API_KEY** en `.env` (ya lo tienes)
3. **Activar el sistema** con `AI_FALLBACK_ENABLED=true`

## 📞 Problema Común

**Error: LM Studio no funciona**

Solución:
1. Abre LM Studio
2. Carga el modelo phi-2
3. Settings → Enable local REST API server
4. Verifica que esté en puerto 1234

## 🎮 Usar en el Bot

Ya está integrado automáticamente. Solo:

```bash
npm run dev
```

El bot usará el sistema multi-provider sin configuración adicional.

## 📊 Ver Qué Provider Usa

En los logs verás:

```
[AI] ✅ Respuesta generada con: groq (llama-3.1-8b-instant)
```

O si Groq falla:

```
[AI] ✅ Respuesta generada con: lmstudio (phi-2)
```

---

**¡Listo! Tu bot ahora tiene respaldo automático de IA** 🚀

Lee `GUIA_MULTI_PROVIDER_IA.md` para más detalles.
