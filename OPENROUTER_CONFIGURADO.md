# 🌐 OpenRouter Configurado y Listo

## ✅ QUÉ ES OPENROUTER

OpenRouter es una API unificada que te da acceso a **múltiples modelos de IA** con una sola API key:

- 🤖 **GPT-4** (OpenAI)
- 🧠 **Claude 3.5 Sonnet** (Anthropic) ← Configurado por defecto
- 🦙 **Llama 3.1 70B** (Meta)
- 💎 **Gemini Pro** (Google)
- Y muchos más...

**Ventaja:** Si un modelo falla o está saturado, puedes cambiar a otro sin cambiar código.

---

## 🔧 CONFIGURACIÓN ACTUAL

### En `.env`:
```env
# OpenRouter (Acceso a múltiples modelos)
OPENROUTER_API_KEY=tu_openrouter_api_key_aqui
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet

# Sistema de Fallback
AI_PROVIDER=openrouter
DEFAULT_AI_PROVIDER=openrouter
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=openrouter,groq,lmstudio
```

### Orden de Fallback:
1. **OpenRouter** (Claude 3.5 Sonnet) - Principal
2. **Groq** (Llama 3.1) - Si OpenRouter falla
3. **LM Studio** (Local) - Si ambos fallan

---

## 🎯 MODELOS DISPONIBLES

Puedes cambiar el modelo editando `OPENROUTER_MODEL` en `.env`:

### Recomendados para Ventas:

```env
# Claude 3.5 Sonnet (Mejor para conversaciones naturales) ⭐
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet

# GPT-4 Turbo (Muy inteligente, más caro)
OPENROUTER_MODEL=openai/gpt-4-turbo

# GPT-3.5 Turbo (Rápido y económico)
OPENROUTER_MODEL=openai/gpt-3.5-turbo

# Llama 3.1 70B (Gratis, muy bueno)
OPENROUTER_MODEL=meta-llama/llama-3.1-70b-instruct

# Gemini Pro 1.5 (Google, muy rápido)
OPENROUTER_MODEL=google/gemini-pro-1.5
```

### Comparación:

| Modelo | Velocidad | Calidad | Costo | Mejor para |
|--------|-----------|---------|-------|------------|
| Claude 3.5 Sonnet | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | 💰💰💰 | Conversaciones naturales |
| GPT-4 Turbo | ⚡⚡ | ⭐⭐⭐⭐⭐ | 💰💰💰💰 | Tareas complejas |
| GPT-3.5 Turbo | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | 💰 | Uso general |
| Llama 3.1 70B | ⚡⚡⚡ | ⭐⭐⭐⭐ | GRATIS | Presupuesto limitado |
| Gemini Pro 1.5 | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | 💰💰 | Respuestas rápidas |

---

## 🧪 CÓMO PROBAR

### Opción 1: Script de prueba
```bash
npx tsx scripts/test-openrouter.ts
```

Esto probará:
- ✅ Conexión con OpenRouter
- ✅ Respuesta simple
- ✅ Consulta sobre productos
- ✅ Conversación con contexto

### Opción 2: Probar en WhatsApp
1. Inicia el bot: `npm run dev`
2. Conecta WhatsApp
3. Envía un mensaje de prueba
4. Verifica en los logs que use OpenRouter

---

## 📊 VENTAJAS DE OPENROUTER

### 1. Múltiples Modelos
- Acceso a GPT-4, Claude, Llama, Gemini con una sola API
- Cambia de modelo sin cambiar código

### 2. Fallback Automático
- Si un modelo falla, prueba con otro
- Mayor confiabilidad

### 3. Precios Competitivos
- Algunos modelos son gratis (Llama)
- Precios más bajos que APIs directas

### 4. Sin Límites de Rate
- No te bloquean por muchas peticiones
- Ideal para bots con alto tráfico

### 5. Monitoreo
- Dashboard en openrouter.ai
- Ve cuánto gastas y qué modelos usas

---

## 💰 COSTOS APROXIMADOS

Por 1,000 mensajes (promedio 500 tokens):

| Modelo | Costo |
|--------|-------|
| Claude 3.5 Sonnet | ~$1.50 |
| GPT-4 Turbo | ~$3.00 |
| GPT-3.5 Turbo | ~$0.15 |
| Llama 3.1 70B | **GRATIS** |
| Gemini Pro 1.5 | ~$0.50 |

**Recomendación:** Usa Claude 3.5 Sonnet para calidad o Llama 3.1 70B si quieres gratis.

---

## 🔄 CÓMO CAMBIAR DE MODELO

### Método 1: Editar .env
```env
# Cambiar esta línea:
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet

# Por ejemplo, a GPT-4:
OPENROUTER_MODEL=openai/gpt-4-turbo
```

### Método 2: Probar varios modelos
Crea un script para comparar:

```typescript
const modelos = [
  'anthropic/claude-3.5-sonnet',
  'openai/gpt-4-turbo',
  'meta-llama/llama-3.1-70b-instruct'
]

for (const modelo of modelos) {
  const response = await AIMultiProvider.generateCompletion(messages, {
    model: modelo
  })
  console.log(`${modelo}: ${response.content}`)
}
```

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### Error: "OpenRouter no configurado"
**Solución:** Verifica que `OPENROUTER_API_KEY` esté en `.env`

### Error: "HTTP 401"
**Solución:** API key inválida, verifica en openrouter.ai

### Error: "HTTP 429"
**Solución:** Límite de rate alcanzado, espera un momento

### Error: "Model not found"
**Solución:** Verifica que el nombre del modelo sea correcto

### Respuestas lentas
**Solución:** Cambia a un modelo más rápido (GPT-3.5 o Gemini)

---

## 📈 MONITOREO

### Ver uso en OpenRouter:
1. Ve a https://openrouter.ai/
2. Inicia sesión con tu API key
3. Ve a "Activity" para ver:
   - Cuántas peticiones hiciste
   - Cuánto gastaste
   - Qué modelos usaste
   - Errores si los hubo

### Ver logs en tu bot:
```bash
# Los logs mostrarán:
[AI Multi-Provider] 🔄 Intentando con: openrouter
[OpenRouter] Usando modelo: anthropic/claude-3.5-sonnet
[AI Multi-Provider] ✅ Éxito con: openrouter
```

---

## 🎯 RECOMENDACIONES

### Para Producción:
1. **Usa Claude 3.5 Sonnet** - Mejor balance calidad/precio
2. **Habilita fallback** - Mayor confiabilidad
3. **Monitorea costos** - Revisa dashboard semanalmente

### Para Desarrollo:
1. **Usa Llama 3.1 70B** - Gratis e ilimitado
2. **Prueba varios modelos** - Encuentra el mejor para tu caso

### Para Alto Tráfico:
1. **Usa GPT-3.5 Turbo** - Más económico
2. **Implementa caché** - Reduce peticiones repetidas
3. **Usa sistema de patrones** - Para respuestas comunes

---

## ✅ ARCHIVOS MODIFICADOS

1. ✅ `.env` - API key y configuración
2. ✅ `src/lib/ai-multi-provider.ts` - Función `tryOpenRouter`
3. ✅ `scripts/test-openrouter.ts` - Script de prueba
4. ✅ `OPENROUTER_CONFIGURADO.md` - Este documento

---

## 🚀 PRÓXIMOS PASOS

1. **Probar:**
   ```bash
   npx tsx scripts/test-openrouter.ts
   ```

2. **Verificar en WhatsApp:**
   - Inicia el bot
   - Envía mensajes de prueba
   - Verifica que responda correctamente

3. **Optimizar:**
   - Prueba diferentes modelos
   - Ajusta temperatura y max_tokens
   - Monitorea costos

4. **Producción:**
   - Configura límites de gasto en OpenRouter
   - Implementa caché si es necesario
   - Monitorea rendimiento

---

## 📚 RECURSOS

- **OpenRouter Dashboard:** https://openrouter.ai/
- **Documentación:** https://openrouter.ai/docs
- **Modelos disponibles:** https://openrouter.ai/models
- **Precios:** https://openrouter.ai/docs#models

---

**🎉 OpenRouter está configurado y listo para usar!**

Tu bot ahora tiene acceso a los mejores modelos de IA del mercado con fallback automático.
