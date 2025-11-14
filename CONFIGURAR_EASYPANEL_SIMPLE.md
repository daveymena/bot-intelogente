# 🚀 Configurar IAs en Easypanel - Guía Simple

## 🎯 Lo que vas a hacer

Vas a agregar **2 cosas**:
1. Un servicio nuevo (Ollama)
2. Variables de entorno (Groq, OpenRouter, Ollama)

## ⚠️ IMPORTANTE: No confundirse

| Servicio | ¿Necesita contenedor? | ¿Cómo se configura? |
|----------|----------------------|---------------------|
| **Groq** | ❌ NO | Solo variable de entorno |
| **OpenRouter** | ❌ NO | Solo variable de entorno |
| **Ollama** | ✅ SÍ | Servicio + variable de entorno |

**Razón:** Groq y OpenRouter son APIs externas (como usar una API de clima). Ollama es local (corre en tu servidor).

## 📋 Paso 1: Crear Servicio Ollama (5 minutos)

### En Easypanel:

1. Ve a tu proyecto
2. Click **"Add Service"**
3. Selecciona **"Docker Image"**
4. Llena el formulario:

```yaml
Service Name: ollama
Docker Image: ollama/ollama:latest
Port: 11434
```

5. En **"Volumes"**, agregar:
```yaml
Mount Path: /root/.ollama
Volume Name: ollama-data
```

6. En **"Command Override"**, pegar:
```bash
sh -c "ollama serve & sleep 10 && ollama pull gemma:2b && wait"
```

7. Click **"Deploy"**
8. Esperar 2-3 minutos (descarga el modelo gemma:2b)

## 📋 Paso 2: Agregar Variables de Entorno (2 minutos)

### En tu aplicación del bot:

1. Click en tu aplicación (no en Ollama)
2. Ve a **"Settings"**
3. Click en **"Environment Variables"**
4. Agregar estas variables (una por una o todas juntas):

### Variables Nuevas:

```env
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=gemma:2b
OLLAMA_ENABLED=true
OLLAMA_TIMEOUT=60000
AI_FALLBACK_ORDER=groq,openrouter,ollama
AI_AUTO_MODEL_DETECTION=true
```

### Variables Existentes (verificar que existan):

```env
GROQ_API_KEY=gsk_tu_api_key_actual
GROQ_MODEL=llama-3.1-8b-instant
DEFAULT_AI_PROVIDER=groq
```

5. Click **"Save"**

## 📋 Paso 3: Redeploy (3-5 minutos)

1. En tu aplicación, click **"Redeploy"**
2. Esperar el build
3. Esperar el restart

## 📋 Paso 4: Verificar (1 minuto)

### En los logs de tu aplicación, buscar:

```
✅ [AI Multi-Provider] 🔄 Orden de fallback: groq → openrouter → ollama
✅ [AI Multi-Provider] Groq funcionando
✅ [AI Multi-Provider] OpenRouter funcionando
✅ [AI Multi-Provider] Ollama funcionando
```

### Probar el bot:

Envía un mensaje de WhatsApp y verifica que responde.

## 🎯 Cómo Funciona

```
Usuario envía mensaje
    ↓
Bot intenta con Groq (API externa)
    ↓
¿Funciona? → SÍ → ✅ Respuesta
    ↓
   NO (rate limit)
    ↓
Bot intenta con OpenRouter (API externa)
    ↓
¿Funciona? → SÍ → ✅ Respuesta
    ↓
   NO (50 mensajes agotados)
    ↓
Bot intenta con Ollama (local en Easypanel)
    ↓
✅ Respuesta (siempre funciona)
```

## 💡 Preguntas Frecuentes

### ¿Por qué OpenRouter no necesita servicio?

OpenRouter es una API externa (como Groq). Solo necesitas la API key para conectarte a sus servidores. Es como usar la API de Google Maps, no necesitas instalar Google Maps en tu servidor.

### ¿Por qué Ollama SÍ necesita servicio?

Ollama es una IA que corre en tu servidor. Es como tener tu propia base de datos local. Necesita su propio contenedor para funcionar.

### ¿Qué significa "http://ollama:11434"?

En Easypanel, cuando creas un servicio llamado "ollama", automáticamente puedes acceder a él usando `http://ollama:puerto`. Es como un DNS interno.

### ¿Puedo usar solo Groq y OpenRouter sin Ollama?

Sí, pero perderías el respaldo ilimitado. Con Ollama tienes garantía de que siempre funcionará, incluso si Groq y OpenRouter fallan.

## 🆘 Troubleshooting

### Ollama no responde

```bash
# Verificar que el servicio está corriendo
# En Easypanel: Services → ollama → Logs
# Debe mostrar: "Ollama is running"
```

**Solución:** Esperar 2-3 minutos para que descargue el modelo.

### OpenRouter da error 401

**Solución:** Verificar que la API key no tiene espacios extra y está completa.

### Bot no cambia de provider

**Solución:** Verificar que `AI_FALLBACK_ORDER=groq,openrouter,ollama` está configurado.

## ✅ Checklist Final

- [ ] Servicio Ollama creado y corriendo
- [ ] Variables de entorno agregadas
- [ ] Aplicación redeployada
- [ ] Logs muestran los 3 providers funcionando
- [ ] Bot responde a mensajes de WhatsApp

## 🎉 Resultado

Tu bot ahora tiene:
- ✅ Groq (principal, ultra rápido)
- ✅ OpenRouter (50 msg/día gratis)
- ✅ Ollama (ilimitado, local)
- ✅ Cambio automático sin intervención
- ✅ 150-250+ mensajes/día con respaldo ilimitado

**¡Listo para funcionar 24/7!** 🚀
