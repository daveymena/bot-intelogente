# 🔧 Solución: LM Studio Timeout

## ❌ Problema Detectado

```
[AI Multi-Provider] ❌ Error con lmstudio: LM Studio timeout
```

LM Studio está tardando más de 10 segundos en responder, causando timeout.

## ✅ Solución Aplicada

### 1. Timeout Aumentado

En `.env`:
```env
LM_STUDIO_TIMEOUT=30000  # Antes: 10000 (10s) → Ahora: 30000 (30s)
```

### 2. Reiniciar el Bot

```bash
# Detén el bot (Ctrl+C)
# Inicia de nuevo
npm run dev
```

## 🎯 ¿Por Qué Tarda Tanto?

LM Studio puede tardar más por:

1. **Primera carga**: El modelo se está cargando en memoria
2. **PC lento**: Recursos limitados
3. **Modelo grande**: phi-2 necesita procesar
4. **Sin GPU**: Procesamiento solo con CPU

## 💡 Soluciones Alternativas

### Opción 1: Optimizar LM Studio (Recomendado)

1. **Abre LM Studio**
2. **Ve a Settings (⚙️)**
3. **Activa GPU Acceleration** (si tienes GPU)
4. **Reduce Context Length** a 1024
5. **Cierra otros programas** pesados

### Opción 2: Usar Modelo Más Pequeño

Si phi-2 es muy lento, prueba con un modelo más pequeño:

1. En LM Studio, descarga **TinyLlama-1.1B**
2. Carga ese modelo
3. En `.env`:
   ```env
   LM_STUDIO_MODEL=tinyllama-1.1b
   ```

### Opción 3: Volver a Groq + LM Studio

La mejor configuración es usar Groq como principal y LM Studio como respaldo:

1. En `.env`, descomenta:
   ```env
   GROQ_API_KEY=tu_groq_api_key_aqui
   ```

2. Cambia el orden:
   ```env
   AI_FALLBACK_ORDER=groq,lmstudio
   ```

3. Reinicia el bot

**Resultado**:
- Groq responde en 0.5s (99% del tiempo)
- LM Studio solo se usa si Groq falla
- Mejor experiencia para tus clientes

## 📊 Comparación de Velocidad

| Provider | Velocidad | Cuándo Usar |
|----------|-----------|-------------|
| **Groq** | ⚡⚡⚡ 0.5s | Principal (recomendado) |
| **LM Studio** | ⚡ 5-15s | Respaldo o desarrollo |
| **OpenAI** | ⚡⚡ 1-2s | Premium (opcional) |

## 🎯 Recomendación Final

### Para Producción (Clientes Reales)

```env
# Groq principal, LM Studio respaldo
AI_FALLBACK_ORDER=groq,lmstudio
GROQ_API_KEY=tu_groq_api_key_aqui
LM_STUDIO_TIMEOUT=30000
```

**Ventajas**:
- ✅ Respuestas ultra rápidas (0.5s)
- ✅ Respaldo local si Groq falla
- ✅ Mejor experiencia de usuario

### Para Desarrollo/Pruebas

```env
# Solo LM Studio (sin tokens)
AI_FALLBACK_ORDER=lmstudio
LM_STUDIO_TIMEOUT=30000
```

**Ventajas**:
- ✅ Sin consumo de tokens
- ✅ Sin límites
- ✅ 100% local

## ✅ Verificar que Funciona

Después de aplicar los cambios:

```bash
# Probar LM Studio
npx tsx scripts/test-lmstudio-simple.ts

# Si funciona, iniciar bot
npm run dev
```

## 🔍 Monitorear Rendimiento

En los logs verás el tiempo de respuesta:

```
[AI Multi-Provider] 🔄 Intentando con: lmstudio
[LM Studio] Conectando a: http://localhost:1234/v1/chat/completions
[AI Multi-Provider] ✅ Éxito con: lmstudio
⏱️  Tiempo: 8.5 segundos
```

Si ves tiempos > 10 segundos constantemente:
- Optimiza LM Studio (GPU, Context Length)
- O usa Groq como principal

## 📝 Nota Importante

**El bot SÍ respondió** incluso con el timeout de LM Studio. Tiene un sistema de respaldo estático que funciona cuando la IA falla. Pero es mejor que la IA funcione correctamente para respuestas más inteligentes.

---

**Estado Actual**: Timeout aumentado a 30 segundos
**Próximo paso**: Reiniciar bot y probar
**Recomendación**: Usar Groq + LM Studio para mejor rendimiento
