# ✅ Ollama Configurado como Fallback Ilimitado

## 🎯 Configuración Implementada

### Orden de Fallback (AI_FALLBACK_ORDER)

```
1. Groq (Principal) → Rápido, confiable, pero con límite de tokens
2. Ollama (Fallback) → ILIMITADO, local, más lento pero siempre disponible
```

## 🦙 Ollama - Características

### Ventajas:
- ✅ **Ilimitado** - Sin límite de tokens ni requests
- ✅ **Gratis** - No cuesta nada
- ✅ **Siempre disponible** - Servidor local/VPS
- ✅ **Privado** - Los datos no salen de tu servidor

### Desventajas:
- ⏱️ **Más lento** - Tarda 10-30 segundos en responder
- 🧠 **Menos inteligente** - Modelos más pequeños (gemma:2b)
- 💻 **Requiere recursos** - Necesita servidor con RAM/CPU

## ⚙️ Configuración en .env

```env
# Ollama (IA local - HABILITADO como último fallback)
OLLAMA_BASE_URL=https://bot-whatsapp-ollama.sqaoeo.easypanel.host
OLLAMA_MODEL=gemma:2b
OLLAMA_ENABLED=true
OLLAMA_TIMEOUT=30000        # 30 segundos (aumentado para dar tiempo)
OLLAMA_MAX_TOKENS=400       # Respuestas completas

# Sistema de Fallback
AI_FALLBACK_ORDER=groq,ollama
```

## 🔄 Cómo Funciona el Fallback

### Escenario 1: Todo Normal
```
Cliente: "Tienes laptops?"
→ Groq responde en 2 segundos ✅
```

### Escenario 2: Groq sin Tokens
```
Cliente: "Tienes laptops?"
→ Groq falla (sin tokens) ❌
→ Ollama responde en 15 segundos ✅ (ILIMITADO)
```

## 📊 Tiempos de Respuesta Esperados

| Provider | Tiempo Normal | Timeout |
|----------|---------------|---------|
| Groq | 1-3 segundos | 15s |
| Ollama | 10-30 segundos | 30s |

## 🧪 Probar Ollama

### 1. Verificar que Ollama esté corriendo:
```bash
curl https://bot-whatsapp-ollama.sqaoeo.easypanel.host/api/tags
```

### 2. Probar respuesta:
```bash
npx tsx scripts/test-ollama.ts
```

### 3. Forzar uso de Ollama:
```bash
# Temporalmente deshabilitar Groq
GROQ_API_KEY="" npm run dev
```

## 🚀 Modelos Recomendados para Ollama

### Para Velocidad (Recomendado):
- `gemma:2b` - Muy rápido, respuestas básicas (ACTUAL)
- `phi3:mini` - Rápido, mejor calidad
- `tinyllama` - El más rápido, calidad básica

### Para Calidad (Más lento):
- `llama3.2:3b` - Balance velocidad/calidad
- `mistral:7b` - Mejor calidad, más lento
- `llama3.1:8b` - Excelente calidad, muy lento

## 📝 Cambiar Modelo de Ollama

1. Editar `.env`:
```env
OLLAMA_MODEL=phi3:mini
```

2. Descargar modelo en servidor Ollama:
```bash
# En el servidor donde corre Ollama
ollama pull phi3:mini
```

3. Reiniciar bot:
```bash
npm run dev
```

## ⚠️ Consideraciones Importantes

### Demora Humana:
- Ollama tarda más, pero el bot ya tiene demora humana configurada (2-10s)
- El cliente no notará tanto la diferencia
- La demora hace que parezca más natural

### Calidad de Respuestas:
- Ollama con gemma:2b es menos inteligente que Groq
- Pero sigue el mismo prompt del sistema
- Las respuestas serán correctas pero quizás menos naturales

### Cuándo se Usará:
- Solo cuando Groq falle o se quede sin tokens
- Es un "salvavidas" para que el bot nunca deje de funcionar
- Garantiza respuestas ilimitadas 24/7

## ✅ Ventajas de Esta Configuración

1. **Nunca se cae** - Siempre hay un fallback disponible
2. **Optimizado** - Usa el más rápido primero
3. **Económico** - Ollama es gratis e ilimitado
4. **Transparente** - El cliente no nota el cambio de provider

## 🔧 Troubleshooting

### Ollama no responde:
```bash
# Verificar que esté corriendo
curl https://bot-whatsapp-ollama.sqaoeo.easypanel.host/api/tags

# Ver logs del bot
npm run dev
# Buscar: [Ollama] en los logs
```

### Ollama muy lento:
```bash
# Cambiar a modelo más rápido
OLLAMA_MODEL=tinyllama

# O reducir max_tokens
OLLAMA_MAX_TOKENS=200
```

### Ollama da respuestas malas:
```bash
# Cambiar a modelo mejor
OLLAMA_MODEL=llama3.2:3b

# O aumentar timeout
OLLAMA_TIMEOUT=60000
```

---

**Estado:** ✅ Configurado y Listo
**Fecha:** 2025-11-04
**Beneficio:** Bot nunca se queda sin IA, siempre responde
