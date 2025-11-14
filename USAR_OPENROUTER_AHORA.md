# 🚀 USAR OPENROUTER AHORA - GUÍA RÁPIDA

## ⚡ INICIO RÁPIDO (2 MINUTOS)

### 1. Probar que funciona
```bash
probar-openrouter.bat
```

Deberías ver:
```
✅ Respuesta recibida en XXXms
   Provider: openrouter
   Modelo: anthropic/claude-3.5-sonnet
   Contenido: [Respuesta del bot]
```

### 2. Iniciar el bot
```bash
npm run dev
```

### 3. Conectar WhatsApp
1. Ve a http://localhost:3000
2. Escanea el QR
3. Espera a que conecte

### 4. Probar en WhatsApp
Envía cualquier mensaje y verifica que responda.

---

## 🎯 CONFIGURACIÓN ACTUAL

Tu bot está configurado para usar:

**Principal:** OpenRouter (Claude 3.5 Sonnet)
- ⭐ Excelente calidad
- 💬 Conversaciones naturales
- 🚀 Respuestas inteligentes

**Respaldo 1:** Groq (Llama 3.1)
- ⚡ Ultra rápido
- 💰 Económico
- 🔄 Si OpenRouter falla

**Respaldo 2:** LM Studio (Local)
- 🏠 Sin internet
- 💰 Gratis
- 🔄 Si ambos fallan

---

## 💡 CAMBIAR DE MODELO (OPCIONAL)

Si quieres probar otro modelo, edita `.env`:

### Opción 1: Llama 3.1 70B (GRATIS)
```env
OPENROUTER_MODEL=meta-llama/llama-3.1-70b-instruct
```
✅ Gratis e ilimitado
✅ Muy buena calidad
✅ Ideal para desarrollo

### Opción 2: GPT-4 Turbo (Premium)
```env
OPENROUTER_MODEL=openai/gpt-4-turbo
```
✅ Máxima inteligencia
✅ Mejor para tareas complejas
❌ Más caro (~$3 por 1000 mensajes)

### Opción 3: GPT-3.5 Turbo (Económico)
```env
OPENROUTER_MODEL=openai/gpt-3.5-turbo
```
✅ Muy rápido
✅ Económico (~$0.15 por 1000 mensajes)
✅ Buena calidad

### Opción 4: Gemini Pro (Google)
```env
OPENROUTER_MODEL=google/gemini-pro-1.5
```
✅ Muy rápido
✅ Buena calidad
✅ Precio medio

Después de cambiar, reinicia el bot:
```bash
# Ctrl+C para detener
npm run dev
```

---

## 📊 VER LOGS

Cuando el bot responda, verás en la consola:

```
[AI Multi-Provider] 🔄 Orden de fallback: openrouter → groq → lmstudio
[AI Multi-Provider] 🔄 Intentando con: openrouter
[OpenRouter] Usando modelo: anthropic/claude-3.5-sonnet
[AI Multi-Provider] ✅ Éxito con: openrouter
```

Esto confirma que está usando OpenRouter correctamente.

---

## 🔍 VERIFICAR QUE FUNCIONA

### Test 1: Mensaje simple
```
Cliente: "Hola"
Bot: [Debe responder con saludo personalizado]
```

### Test 2: Consulta de producto
```
Cliente: "Cuánto cuesta la laptop ASUS?"
Bot: [Debe dar precio exacto: $1.189.000]
```

### Test 3: Conversación con contexto
```
Cliente: "Info del curso de piano"
Bot: [Debe dar info del curso]
Cliente: "Cuánto cuesta?"
Bot: [Debe recordar que hablan del piano: $60.000]
```

Si todos funcionan → ✅ OpenRouter está trabajando perfectamente

---

## 🚨 SI ALGO FALLA

### Error: "OpenRouter no configurado"
**Causa:** API key no está en `.env`
**Solución:** Verifica que `.env` tenga:
```env
OPENROUTER_API_KEY=tu_openrouter_api_key_aqui
```

### Error: "HTTP 401"
**Causa:** API key inválida
**Solución:** Verifica la key en https://openrouter.ai/

### Error: "Timeout"
**Causa:** Modelo muy lento o sin conexión
**Solución:** Cambia a un modelo más rápido:
```env
OPENROUTER_MODEL=openai/gpt-3.5-turbo
```

### Bot no responde
**Causa:** Puede estar usando fallback
**Solución:** Revisa los logs, puede estar usando Groq o LM Studio

---

## 💰 MONITOREAR COSTOS

### Ver uso en OpenRouter:
1. Ve a https://openrouter.ai/
2. Inicia sesión
3. Ve a "Activity"
4. Verás:
   - Cuántas peticiones
   - Cuánto gastaste
   - Qué modelos usaste

### Establecer límites:
1. En OpenRouter dashboard
2. Ve a "Settings"
3. Configura límite de gasto mensual

---

## 🎯 RECOMENDACIONES

### Para Desarrollo:
```env
OPENROUTER_MODEL=meta-llama/llama-3.1-70b-instruct
```
✅ Gratis
✅ Sin límites
✅ Buena calidad

### Para Producción:
```env
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
```
✅ Mejor calidad
✅ Conversaciones naturales
✅ Precio razonable

### Para Alto Tráfico:
```env
OPENROUTER_MODEL=openai/gpt-3.5-turbo
```
✅ Más económico
✅ Muy rápido
✅ Buena calidad

---

## 📈 OPTIMIZAR RENDIMIENTO

### 1. Ajustar max_tokens
En `.env` o en el código:
```typescript
max_tokens: 300  // Respuestas más cortas = más rápido y barato
```

### 2. Ajustar temperature
```typescript
temperature: 0.5  // Más consistente (0.0 - 1.0)
temperature: 0.9  // Más creativo
```

### 3. Usar caché
Para preguntas frecuentes, guarda respuestas en memoria.

---

## ✅ CHECKLIST

- [ ] Ejecuté `probar-openrouter.bat` y funcionó
- [ ] Inicié el bot con `npm run dev`
- [ ] Conecté WhatsApp
- [ ] Probé enviar mensajes
- [ ] El bot responde correctamente
- [ ] Los logs muestran "openrouter"
- [ ] Configuré límite de gasto (opcional)

---

## 🎉 LISTO!

Tu bot ahora usa OpenRouter con:
- ✅ Claude 3.5 Sonnet (excelente calidad)
- ✅ Fallback automático (mayor confiabilidad)
- ✅ Acceso a múltiples modelos
- ✅ Fácil de cambiar de modelo

**Disfruta tu bot más inteligente!** 🚀

---

## 📚 MÁS INFORMACIÓN

- **Guía completa:** `OPENROUTER_CONFIGURADO.md`
- **Resumen:** `RESUMEN_OPENROUTER.md`
- **Dashboard:** https://openrouter.ai/
- **Modelos:** https://openrouter.ai/models
