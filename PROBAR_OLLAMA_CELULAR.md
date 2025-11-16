# 📱 Probar Ollama desde tu Celular

## ✅ Ollama Activado como Principal

Ollama está configurado temporalmente como proveedor principal para que puedas probarlo desde WhatsApp.

## ⚠️ IMPORTANTE

**Ollama es 30x más lento que Groq:**
- Primera respuesta: ~48 segundos ⏱️
- Respuestas siguientes: ~15-30 segundos ⏱️
- Groq (normal): 0.5-1 segundo ⚡

**Esto es SOLO para pruebas**, no para producción.

## 🚀 Pasos para Probar

### 1. Reiniciar el Bot

```bash
# Detener el bot si está corriendo (Ctrl+C)
# Luego iniciar de nuevo:
npm run dev
```

### 2. Esperar a que Cargue

Verás en la consola:
```
[Ollama] 🚀 Usando modelo: gemma3:4b
[AI Multi-Provider] 🔄 Orden de fallback: ollama → groq
```

### 3. Probar desde WhatsApp

Envía mensajes como:
- "Hola, qué productos vendes?"
- "Necesito un portátil para diseño"
- "Cuánto cuesta el curso de piano?"

### 4. Esperar Respuesta

⏱️ **Primera vez:** ~48 segundos (carga el modelo)
⏱️ **Siguientes:** ~15-30 segundos

## 📊 Qué Observar

### ✅ Cosas Buenas
- Responde en español correctamente
- Entiende el contexto
- No inventa información
- Detecta intenciones

### ⚠️ Cosas a Notar
- **MUY lento** (clientes reales no esperarían)
- Primera respuesta especialmente lenta
- Puede parecer que el bot no responde

## 🔍 Ver Logs en Tiempo Real

Mientras pruebas, observa la consola del bot:

```
[Ollama] 🚀 Usando modelo: gemma3:4b en http://localhost:11434
[Ollama] ⏱️ Generando respuesta... (esto tarda)
[Ollama] ✅ Respuesta generada en 15382ms
```

## 🔄 Volver a Groq (Rápido)

Cuando termines de probar:

```bash
npm run activar:groq
```

Luego reinicia el bot:
```bash
npm run dev
```

## 💡 Comparación en Vivo

### Con Ollama (Actual)
```
Cliente: "Hola"
Bot: ... (espera 15-30s) ...
Bot: "¡Hola! ¿En qué puedo ayudarte?"
```

### Con Groq (Normal)
```
Cliente: "Hola"
Bot: "¡Hola! ¿En qué puedo ayudarte?" (0.5-1s)
```

## 📱 Pruebas Sugeridas

### Test 1: Saludo Simple
```
Tú: "Hola"
Espera: ~48s (primera vez)
Bot: Debe responder en español
```

### Test 2: Consulta de Producto
```
Tú: "Necesito un portátil"
Espera: ~15-30s
Bot: Debe preguntar qué tipo de portátil
```

### Test 3: Contexto Conversacional
```
Tú: "Tengo una laptop HP"
Bot: (responde)
Tú: "Y esa viene con garantía?"
Espera: ~15-30s
Bot: Debe entender que "esa" = laptop HP
```

### Test 4: Precio
```
Tú: "Cuánto cuesta el curso de piano?"
Espera: ~15-30s
Bot: Debe dar precio y preguntar si te interesa
```

## ⚠️ Problemas Comunes

### "El bot no responde"
- **Normal:** Ollama tarda 15-30s
- **Espera:** Mira los logs en la consola
- **Si tarda >60s:** Puede haber error, revisa logs

### "Respuesta en inglés"
- **No debería pasar** con gemma3:4b
- **Si pasa:** Avísame para revisar

### "Error de timeout"
- **Causa:** Ollama tardó >60s
- **Solución:** Reinicia Ollama o usa Groq

## 📊 Configuración Actual

```env
AI_PROVIDER=ollama
AI_FALLBACK_ORDER=ollama,groq
OLLAMA_ENABLED=true
OLLAMA_MODEL=gemma3:4b
OLLAMA_BASE_URL=http://localhost:11434
```

## 🎯 Objetivo de la Prueba

Verificar que Ollama:
- ✅ Funciona correctamente
- ✅ Responde en español
- ✅ Entiende contexto
- ✅ Detecta intenciones
- ⚠️ Es muy lento (esperado)

## 🔄 Después de Probar

**IMPORTANTE:** Vuelve a Groq para uso normal:

```bash
npm run activar:groq
npm run dev
```

No dejes Ollama como principal en producción.

## 💬 Feedback

Después de probar, anota:
- ¿Cuánto tardó cada respuesta?
- ¿Las respuestas fueron buenas?
- ¿Entendió el contexto?
- ¿Aceptable para fallback?

---

**Configurado:** 15 Nov 2025  
**Modelo:** gemma3:4b  
**Modo:** Temporal para pruebas  
**Recuerda:** Volver a Groq después
