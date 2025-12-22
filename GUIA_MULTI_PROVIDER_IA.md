# 🤖 Sistema Multi-Provider de IA con Fallback Automático

## 🎯 ¿Qué es esto?

Un sistema inteligente que usa **múltiples APIs de IA** para que tu bot **nunca se quede sin respuestas**. Si una API falla, automáticamente usa las otras.

## ✨ Características

- ✅ **Fallback automático**: Si Groq falla → usa LM Studio → usa OpenAI
- ✅ **Sin límites locales**: LM Studio corre en tu PC sin costos
- ✅ **Configuración flexible**: Elige el orden de prioridad
- ✅ **Detección de errores**: Cambia de API en milisegundos
- ✅ **Fácil de usar**: Solo activa y funciona

## 🔧 Configuración

### 1. Instalar LM Studio

1. Descarga LM Studio: https://lmstudio.ai/
2. Instala y abre LM Studio
3. Descarga el modelo `phi-2` (o cualquier otro)
4. Ve a **Settings** → Activa **"Enable local REST API server"**
5. Asegúrate que esté en el puerto `1234`

### 2. Configurar Variables de Entorno

Tu archivo `.env` ya está configurado con:

```env
# Sistema de Fallback Multi-API
AI_PROVIDER=multi
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=groq,lmstudio,openai

# Groq (Principal - Rápido y gratis)
GROQ_API_KEY=tu_api_key_aqui
GROQ_MODEL=llama-3.1-8b-instant

# LM Studio (Local - Sin límites)
LM_STUDIO_URL=http://localhost:1234/v1/chat/completions
LM_STUDIO_MODEL=phi-2

# OpenAI (Opcional - Premium)
# OPENAI_API_KEY=tu_openai_key_aqui
# OPENAI_MODEL=gpt-3.5-turbo
```

### 3. Orden de Fallback

Puedes cambiar el orden en `AI_FALLBACK_ORDER`:

```env
# Orden recomendado (rápido → local → premium)
AI_FALLBACK_ORDER=groq,lmstudio,openai

# Si prefieres usar LM Studio primero (sin internet)
AI_FALLBACK_ORDER=lmstudio,groq,openai

# Solo Groq y LM Studio (sin OpenAI)
AI_FALLBACK_ORDER=groq,lmstudio
```

## 🚀 Cómo Funciona

### Flujo Automático

```
Cliente envía mensaje
    ↓
Intenta con Groq
    ↓
¿Funcionó? → SÍ → Responde
    ↓ NO
Intenta con LM Studio
    ↓
¿Funcionó? → SÍ → Responde
    ↓ NO
Intenta con OpenAI
    ↓
¿Funcionó? → SÍ → Responde
    ↓ NO
Error: Todas las APIs fallaron
```

### Ejemplo Real

```typescript
// El bot automáticamente hace esto:

// 1. Intenta con Groq
[AI Multi-Provider] 🔄 Intentando con: groq
[AI Multi-Provider] ✅ Éxito con: groq
// Responde al cliente

// Si Groq falla:
[AI Multi-Provider] 🔄 Intentando con: groq
[AI Multi-Provider] ❌ Error con groq: timeout
[AI Multi-Provider] 🔄 Intentando con: lmstudio
[AI Multi-Provider] ✅ Éxito con: lmstudio
// Responde al cliente con LM Studio
```

## 🧪 Probar el Sistema

### Opción 1: Script Automático

```bash
# Ejecuta el archivo .bat
probar-multi-provider.bat
```

### Opción 2: Comando Manual

```bash
npx tsx scripts/test-multi-provider.ts
```

### Qué Verás

```
🧪 Probando Sistema Multi-Provider de IA
============================================================

📡 Paso 1: Probando conectividad de todos los providers...

✅ GROQ: FUNCIONANDO
✅ LMSTUDIO: FUNCIONANDO
❌ OPENAI: NO DISPONIBLE

🤖 Paso 2: Probando generación de respuesta con fallback...

✅ RESPUESTA RECIBIDA:
Provider usado: GROQ
Modelo: llama-3.1-8b-instant

Contenido:
¡Hola! Sí, tenemos laptops disponibles...
```

## 📊 Comparación de Providers

| Provider | Velocidad | Costo | Límites | Requiere Internet |
|----------|-----------|-------|---------|-------------------|
| **Groq** | ⚡⚡⚡ Ultra rápido | 🆓 Gratis | ✅ Generosos | ✅ Sí |
| **LM Studio** | ⚡⚡ Rápido | 🆓 Gratis | ♾️ Sin límites | ❌ No |
| **OpenAI** | ⚡ Normal | 💰 Pago | ⚠️ Por uso | ✅ Sí |

## 💡 Recomendaciones

### Para Máxima Confiabilidad

```env
AI_FALLBACK_ORDER=groq,lmstudio,openai
```

- Groq es ultra rápido (principal)
- LM Studio como respaldo local
- OpenAI como último recurso

### Para Trabajar Sin Internet

```env
AI_FALLBACK_ORDER=lmstudio,groq
```

- LM Studio primero (local)
- Groq como respaldo (si hay internet)

### Para Máxima Calidad

```env
AI_FALLBACK_ORDER=openai,groq,lmstudio
```

- OpenAI primero (mejor calidad)
- Groq como respaldo rápido
- LM Studio como último recurso

## 🔍 Solución de Problemas

### LM Studio no funciona

**Error**: `LM Studio falló: fetch failed`

**Solución**:
1. Abre LM Studio
2. Ve a **Settings**
3. Activa **"Enable local REST API server"**
4. Verifica que esté en `http://localhost:1234`
5. Carga un modelo (phi-2 recomendado)

### Groq da timeout

**Error**: `Groq timeout`

**Solución**:
1. Verifica tu `GROQ_API_KEY` en `.env`
2. Aumenta el timeout:
   ```env
   GROQ_TIMEOUT=15000
   ```
3. Prueba con otro modelo:
   ```env
   GROQ_MODEL=llama-3.3-70b-versatile
   ```

### Todas las APIs fallan

**Error**: `Todas las APIs de IA fallaron`

**Solución**:
1. Verifica tu conexión a internet
2. Asegúrate que LM Studio esté ejecutándose
3. Verifica tus API keys en `.env`
4. Ejecuta el script de prueba:
   ```bash
   probar-multi-provider.bat
   ```

## 🎮 Uso en el Bot

El sistema ya está integrado automáticamente. Solo necesitas:

1. **Activar el sistema**:
   ```env
   AI_FALLBACK_ENABLED=true
   ```

2. **Iniciar tu bot**:
   ```bash
   npm run dev
   ```

3. **¡Listo!** El bot usará automáticamente el sistema multi-provider

## 📈 Monitoreo

El sistema registra en consola qué provider está usando:

```
[AI Multi-Provider] 🔄 Usando sistema multi-provider con fallback automático
[AI Multi-Provider] 🔄 Intentando con: groq
[AI Multi-Provider] ✅ Éxito con: groq
[AI] ✅ Respuesta generada con: groq (llama-3.1-8b-instant)
```

Si un provider falla:

```
[AI Multi-Provider] 🔄 Intentando con: groq
[AI Multi-Provider] ❌ Error con groq: timeout
[AI Multi-Provider] 🔄 Intentando con: lmstudio
[AI Multi-Provider] ✅ Éxito con: lmstudio
[AI] ✅ Respuesta generada con: lmstudio (phi-2)
```

## 🎯 Ventajas del Sistema

1. **Nunca se cae**: Si una API falla, usa otra automáticamente
2. **Sin límites**: LM Studio corre local sin restricciones
3. **Rápido**: Groq responde en milisegundos
4. **Flexible**: Configura el orden que prefieras
5. **Transparente**: Ves qué provider está usando
6. **Fácil**: Solo activa y funciona

## 🚀 Próximos Pasos

1. ✅ Ejecuta `probar-multi-provider.bat` para verificar
2. ✅ Asegúrate que LM Studio esté ejecutándose
3. ✅ Inicia tu bot con `npm run dev`
4. ✅ Envía mensajes de prueba por WhatsApp
5. ✅ Observa los logs para ver qué provider usa

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs en consola
2. Ejecuta el script de prueba
3. Verifica tu configuración en `.env`
4. Asegúrate que LM Studio esté ejecutándose

---

**¡Tu bot ahora tiene respaldo automático de IA! 🎉**

Nunca más te quedarás sin respuestas, incluso si una API falla.
