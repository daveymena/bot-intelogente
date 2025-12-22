# ⚡ Ollama Optimizado para Velocidad

## 🎯 Objetivo

Configurar Ollama para que las respuestas del bot sean **ultra rápidas** (< 3 segundos) manteniendo buena calidad.

## ✅ Configuración Actual

Tu Ollama ya está funcionando en:
```
URL: https://bot-whatsapp-ollama.sqaoeo.easypanel.host
Modelo: gemma:2b
Estado: ✅ ACTIVO
```

## 🚀 Optimizaciones Implementadas

### 1. Configuración en `.env`

```env
# Ollama OPTIMIZADO
OLLAMA_BASE_URL=https://bot-whatsapp-ollama.sqaoeo.easypanel.host
OLLAMA_MODEL=gemma:2b
OLLAMA_ENABLED=true
OLLAMA_TIMEOUT=10000          # 10 segundos máximo
OLLAMA_MAX_TOKENS=300         # Respuestas concisas

# Ollama como prioridad (más rápido que Groq)
AI_PROVIDER=ollama
AI_FALLBACK_ORDER=ollama,groq,openrouter
```

### 2. Parámetros de Rendimiento

El código ahora usa:
```typescript
{
  num_predict: 300,      // Tokens máximos (respuestas cortas)
  num_ctx: 2048,         // Contexto reducido (más rápido)
  num_batch: 512,        // Procesamiento por lotes
  num_gpu: 1,            // Usar GPU si disponible
  num_thread: 4,         // Threads CPU
  temperature: 0.7,      // Balance creatividad/velocidad
  top_k: 40,            // Muestreo eficiente
  top_p: 0.9,           // Nucleus sampling
  repeat_penalty: 1.1    // Evitar repeticiones
}
```

### 3. Timeout Optimizado

- **Antes:** 30 segundos (muy lento)
- **Ahora:** 10 segundos (rápido)
- **Fallback:** Si falla, usa Groq automáticamente

## 📊 Velocidades Esperadas

### Con gemma:2b (Recomendado)
```
Saludo simple:        0.5 - 1.5 segundos  ⚡⚡⚡
Consulta producto:    1.0 - 2.5 segundos  ⚡⚡
Respuesta detallada:  2.0 - 4.0 segundos  ⚡
```

### Con otros modelos
```
phi:2.7b:            1.0 - 3.0 segundos  ⚡⚡
llama3.2:3b:         2.0 - 5.0 segundos  ⚡
llama3.1:8b:         4.0 - 8.0 segundos  (más lento)
```

## 🧪 Probar Velocidad

```bash
npx tsx scripts/test-ollama-velocidad.ts
```

Este script te mostrará:
- ✅ Conexión con Ollama
- ⚡ Tiempo de respuesta real
- 📊 Estadísticas de rendimiento
- 💡 Recomendaciones personalizadas

## 🎯 Modelos Recomendados por Velocidad

### 1. gemma:2b (ULTRA RÁPIDO) ⚡⚡⚡
```bash
# En tu servidor Ollama
ollama pull gemma:2b
```
- **Tamaño:** 2GB
- **Velocidad:** Excelente
- **Calidad:** Buena para conversaciones
- **Uso:** Respuestas rápidas, saludos, consultas simples

### 2. phi:2.7b (MUY RÁPIDO) ⚡⚡
```bash
ollama pull phi:2.7b
```
- **Tamaño:** 2.7GB
- **Velocidad:** Muy buena
- **Calidad:** Muy buena
- **Uso:** Balance perfecto velocidad/calidad

### 3. llama3.2:3b (RÁPIDO) ⚡
```bash
ollama pull llama3.2:3b
```
- **Tamaño:** 3GB
- **Velocidad:** Buena
- **Calidad:** Excelente
- **Uso:** Respuestas más elaboradas

## ⚙️ Configuración por Tipo de Respuesta

### Saludos y Respuestas Simples
```typescript
{
  max_tokens: 50,
  temperature: 0.7
}
// Tiempo esperado: < 1 segundo
```

### Consultas de Productos
```typescript
{
  max_tokens: 150,
  temperature: 0.7
}
// Tiempo esperado: 1-2 segundos
```

### Respuestas Detalladas
```typescript
{
  max_tokens: 300,
  temperature: 0.8
}
// Tiempo esperado: 2-3 segundos
```

## 🔧 Optimizaciones Adicionales

### 1. En tu Servidor Ollama (Easypanel)

Verifica que tenga recursos suficientes:
```bash
# Memoria recomendada
RAM: 4GB mínimo (8GB ideal)
CPU: 2 cores mínimo (4 cores ideal)
GPU: Opcional pero mejora mucho
```

### 2. Variables de Entorno en Easypanel

Agrega estas variables en tu servicio Ollama:
```env
OLLAMA_NUM_PARALLEL=2
OLLAMA_MAX_LOADED_MODELS=1
OLLAMA_KEEP_ALIVE=5m
```

### 3. Usar GPU (Si disponible)

Si tu servidor tiene GPU:
```env
OLLAMA_GPU_LAYERS=35
```

## 📈 Monitoreo de Rendimiento

El sistema ahora registra tiempos de respuesta:
```
[Ollama] 🚀 Usando modelo: gemma:2b
[Ollama] ⚡ Respuesta en 1234ms
```

Busca estos logs para monitorear velocidad.

## 🎛️ Ajustes Finos

### Si las respuestas son muy lentas (> 5 segundos)

1. **Cambiar a modelo más pequeño:**
   ```env
   OLLAMA_MODEL=gemma:2b
   ```

2. **Reducir tokens:**
   ```env
   OLLAMA_MAX_TOKENS=200
   ```

3. **Reducir contexto:**
   ```typescript
   num_ctx: 1024  // En lugar de 2048
   ```

### Si las respuestas son muy cortas

1. **Aumentar tokens:**
   ```env
   OLLAMA_MAX_TOKENS=400
   ```

2. **Ajustar temperatura:**
   ```typescript
   temperature: 0.8  // Más creativo
   ```

## 🔄 Sistema de Fallback

Si Ollama falla o es muy lento, el sistema automáticamente usa:

1. **Ollama** (Primero - Local y rápido)
2. **Groq** (Segundo - Cloud ultra rápido)
3. **OpenRouter** (Tercero - Respaldo premium)

Configurado en:
```env
AI_FALLBACK_ORDER=ollama,groq,openrouter
```

## 💡 Mejores Prácticas

### 1. Usa Ollama para:
- ✅ Saludos y respuestas simples
- ✅ Consultas de productos
- ✅ Conversaciones normales
- ✅ Respuestas que no requieren razonamiento complejo

### 2. Usa Groq (fallback) para:
- ✅ Análisis complejos
- ✅ Razonamiento profundo
- ✅ Cuando Ollama falla
- ✅ Respuestas muy largas

### 3. Optimiza según uso:
```typescript
// Conversación normal
max_tokens: 150-200

// Descripción de producto
max_tokens: 200-300

// Análisis complejo
max_tokens: 300-500 (usa Groq)
```

## 🧪 Comandos de Prueba

### Test rápido
```bash
npx tsx scripts/test-ollama-velocidad.ts
```

### Test de conversación real
```bash
npx tsx scripts/test-bot-conversacion.ts
```

### Ver logs en tiempo real
```bash
npm run dev
# Luego envía mensajes por WhatsApp
```

## 📊 Métricas de Éxito

### Excelente ⚡⚡⚡
- Respuesta < 2 segundos
- Cliente no nota espera
- Conversación fluida

### Bueno ⚡⚡
- Respuesta 2-4 segundos
- Espera tolerable
- Experiencia aceptable

### Mejorable ⚡
- Respuesta > 4 segundos
- Cliente puede impacientarse
- Considera optimizar

## 🎯 Configuración Recomendada Final

```env
# .env
OLLAMA_BASE_URL=https://bot-whatsapp-ollama.sqaoeo.easypanel.host
OLLAMA_MODEL=gemma:2b
OLLAMA_ENABLED=true
OLLAMA_TIMEOUT=10000
OLLAMA_MAX_TOKENS=300

AI_PROVIDER=ollama
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=ollama,groq,openrouter

GROQ_API_KEY=tu_key_aqui
GROQ_MODEL=llama-3.1-8b-instant
GROQ_TIMEOUT=5000
```

## ✅ Checklist de Optimización

- [x] Ollama configurado y funcionando
- [x] Modelo pequeño y rápido (gemma:2b)
- [x] Timeout optimizado (10 segundos)
- [x] Max tokens reducido (300)
- [x] Parámetros de rendimiento configurados
- [x] Sistema de fallback activo
- [x] Logs de tiempo de respuesta
- [ ] Probar con `test-ollama-velocidad.ts`
- [ ] Monitorear tiempos reales
- [ ] Ajustar según necesidad

## 🚀 Próximos Pasos

1. **Ejecutar test de velocidad:**
   ```bash
   npx tsx scripts/test-ollama-velocidad.ts
   ```

2. **Probar en conversación real:**
   - Envía mensajes por WhatsApp
   - Observa tiempos de respuesta
   - Ajusta si es necesario

3. **Monitorear logs:**
   ```bash
   npm run dev
   # Busca: [Ollama] ⚡ Respuesta en XXXms
   ```

4. **Optimizar según resultados:**
   - Si muy lento: modelo más pequeño
   - Si muy corto: aumentar tokens
   - Si falla mucho: verificar servidor

## 📞 Soporte

Si tienes problemas:

1. Verifica que Ollama esté corriendo en Easypanel
2. Ejecuta el test de velocidad
3. Revisa los logs del servidor
4. Ajusta configuración según recomendaciones

---

**¡Ollama optimizado y listo para respuestas ultra rápidas!** ⚡🚀
