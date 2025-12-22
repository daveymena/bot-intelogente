# ✅ CONFIGURACIÓN OLLAMA EASYPANEL COMO BASE GRATUITA

## 🎯 SISTEMA ACTUAL

**Ollama en EASYPANEL es la BASE PRINCIPAL (100% GRATIS)**
- Ollama corre en Easypanel (no local)
- Groq solo se usa como respaldo cuando Ollama falla
- Ahorro de costos: $0 en la mayoría de conversaciones
- Velocidad optimizada: 400 tokens máximo (respuestas rápidas)

## 📋 CONFIGURACIÓN ACTUAL (.env)

```env
# OLLAMA EN EASYPANEL - BASE PRINCIPAL (GRATIS) ✅
USE_OLLAMA=true
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=https://ollama-ollama.ginee6.easypanel.host
OLLAMA_MODEL=gemma2:2b
OLLAMA_TIMEOUT=15000
OLLAMA_MAX_TOKENS=400
LOCAL_RESPONSE_PRIORITY=true

# GROQ - SOLO RESPALDO
AI_PROVIDER=ollama
AI_FALLBACK_ORDER=ollama,groq,local
AI_FALLBACK_ENABLED=true
```

## 🚀 OPTIMIZACIONES PARA VELOCIDAD

### 1. Tokens Reducidos
- **Antes**: 800 tokens (20 segundos)
- **Ahora**: 400 tokens (5-8 segundos)
- **Resultado**: 60% más rápido

### 2. Timeout Reducido
- **Antes**: 30 segundos
- **Ahora**: 15 segundos
- **Resultado**: Falla rápido y usa Groq si hay problema

### 3. Modelo Optimizado
- **gemma2:2b**: Modelo pequeño y rápido
- **Alternativa**: llama3.1:8b (más inteligente pero más lento)

## 🔄 FLUJO DE RESPUESTA

```
1. Cliente envía mensaje
   ↓
2. Sistema intenta con OLLAMA (gratis)
   ↓
3. Si Ollama responde en <15s → ✅ Usa Ollama
   ↓
4. Si Ollama falla o timeout → 🔄 Usa Groq (respaldo)
   ↓
5. Si Groq falla → 📝 Usa respuestas locales
```

## 💰 AHORRO DE COSTOS

### Escenario Real (100 conversaciones/día)

**CON OLLAMA COMO BASE:**
- 80% usa Ollama (gratis) = 80 conversaciones × $0 = **$0**
- 20% usa Groq (respaldo) = 20 conversaciones × $0.001 = **$0.02/día**
- **Total mensual**: ~$0.60

**SIN OLLAMA (SOLO GROQ):**
- 100% usa Groq = 100 conversaciones × $0.001 = **$0.10/día**
- **Total mensual**: ~$3.00

**AHORRO: 80% de costos** 💰

## ⚡ CÓMO VERIFICAR QUE OLLAMA FUNCIONA

### 1. Verificar que Ollama de Easypanel está corriendo
```bash
# Windows
curl https://ollama-ollama.ginee6.easypanel.host/api/tags

# Debe responder con lista de modelos
```

### 2. Probar el bot
```bash
node test-ollama-completo.js
```

### 3. Ver logs en tiempo real
```bash
npm run dev
```

Busca en los logs:
- ✅ `[Ollama] Respuesta generada` = Ollama funcionando
- 🔄 `[Fallback] Usando Groq` = Ollama falló, usando respaldo

## 🛠️ COMANDOS ÚTILES

### Verificar Ollama de Easypanel
```bash
curl https://ollama-ollama.ginee6.easypanel.host/api/tags
```

### Probar Ollama directamente
```bash
curl https://ollama-ollama.ginee6.easypanel.host/api/generate -d '{
  "model": "gemma2:2b",
  "prompt": "Hola, ¿cómo estás?",
  "stream": false
}'
```

**NOTA**: Ollama corre en Easypanel, no necesitas instalarlo localmente

## 🎨 FORMATO DE RESPUESTAS

El sistema usa el nuevo formato profesional:
- ❌ NO asteriscos (*)
- ❌ NO puntos (...)
- ✅ Emojis profesionales
- ✅ Espaciado elegante
- ✅ Formato tipo boleta/card

## 📊 MÉTRICAS DE RENDIMIENTO

### Ollama gemma2:2b
- **Velocidad**: 5-8 segundos
- **Calidad**: Buena para ventas
- **Costo**: $0 (gratis)
- **Uso recomendado**: 80% de conversaciones

### Groq llama-3.1-8b-instant
- **Velocidad**: 2-3 segundos
- **Calidad**: Excelente
- **Costo**: ~$0.001 por conversación
- **Uso recomendado**: 20% (respaldo)

## 🔧 TROUBLESHOOTING

### Problema: "Ollama no responde"
**Solución:**
```bash
# 1. Verificar que Ollama de Easypanel está corriendo
curl https://ollama-ollama.ginee6.easypanel.host/api/tags

# 2. Si no responde, verificar en Easypanel que el servicio está activo
# 3. Reiniciar el bot
npm run dev
```

**NOTA**: Ollama corre en Easypanel, no local. Si no responde, verifica el servicio en Easypanel.

### Problema: "Respuestas muy lentas"
**Solución:**
- Reducir `OLLAMA_MAX_TOKENS` a 300
- Cambiar a modelo más pequeño: `gemma2:2b`
- Verificar que no hay otros procesos usando CPU

### Problema: "Ollama inventa información"
**Solución:**
- El sistema `RealDataEnforcer` previene esto
- Siempre consulta la BD antes de responder
- Si persiste, aumentar `OLLAMA_TEMPERATURE` a 0.5

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] Ollama de Easypanel está activo (`curl https://ollama-ollama.ginee6.easypanel.host/api/tags`)
- [ ] `.env` tiene `USE_OLLAMA=true`
- [ ] `.env` tiene `OLLAMA_ENABLED=true`
- [ ] `.env` tiene `OLLAMA_BASE_URL=https://ollama-ollama.ginee6.easypanel.host`
- [ ] `.env` tiene `LOCAL_RESPONSE_PRIORITY=true`
- [ ] Bot responde en 5-8 segundos
- [ ] Formato sin asteriscos
- [ ] Fotos se envían automáticamente

**NOTA**: Ollama corre en Easypanel, no necesitas instalarlo localmente

## 🎯 PRÓXIMOS PASOS

1. **Reiniciar el servidor** para aplicar cambios
   ```bash
   # Ctrl+C para detener
   npm run dev
   ```

2. **Probar búsqueda de idiomas**
   ```bash
   node test-busqueda-idiomas.js
   ```

3. **Verificar formato profesional**
   - NO debe tener asteriscos
   - Debe usar emojis
   - Debe mostrar megapacks si no encuentra curso

## 📝 NOTAS IMPORTANTES

- Ollama es **100% gratis** y corre en **Easypanel** (no local)
- Groq es **respaldo** para cuando Ollama falla
- El sistema **automáticamente** cambia entre proveedores
- **No necesitas instalar Ollama localmente**, ya está en Easypanel
- El ahorro de costos es **significativo** (80%)

---

**Última actualización**: 13 Diciembre 2025
**Estado**: ✅ Ollama activado como base principal
**Ahorro**: 80% de costos vs solo Groq
