# ✅ Ollama Configurado - gemma3:4b

## 🎉 Configuración Completada

Ollama está configurado y listo para usar como fallback de Groq.

### 📋 Configuración Actual

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:4b
OLLAMA_ENABLED=true
OLLAMA_TIMEOUT=60000
OLLAMA_MAX_TOKENS=500
```

### 🤖 Modelo Instalado

**gemma3:4b** (3.1GB)
- ✅ Responde en español correctamente
- ✅ Entiende contexto conversacional
- ✅ Detecta intenciones bien
- ⚠️ Velocidad: 8-30 segundos (10-30x más lento que Groq)

### 🔄 Flujo de Fallback

```
1. Groq (8 API keys) → 0.5-1s ⚡ PRINCIPAL
2. Ollama (gemma3:4b) → 8-30s 🐌 FALLBACK
3. Base Conocimiento → Respuestas guardadas
4. Fallback genérico → Último recurso
```

## 🚀 Comandos Disponibles

### Probar Ollama
```bash
npm run ollama:test
```

### Configurar/Reconfigurar
```bash
npm run ollama:config
```

### Probar Velocidad
```bash
npm run ollama:speed
```

### Probar Razonamiento
```bash
npm run ollama:reasoning
```

### Verificar Modelos
```bash
ollama list
```

### Descargar Otro Modelo
```bash
ollama pull gemma2:2b  # Más rápido pero menos inteligente
```

## 📊 Cuándo se Usa Ollama

Ollama se activa automáticamente cuando:

1. ✅ **Groq agota rate limits** - Todas las 8 keys fallan
2. ✅ **Error de conexión** - Groq no responde
3. ✅ **Timeout de Groq** - Tarda más de 60s
4. ✅ **Testing sin tokens** - Desarrollo local

## ⚠️ Importante

### NO usar Ollama para:
- ❌ Conversaciones en tiempo real (muy lento)
- ❌ Respuestas urgentes (clientes esperan)
- ❌ Primera opción (Groq es 30x más rápido)

### SÍ usar Ollama para:
- ✅ Fallback cuando Groq falla
- ✅ Testing sin gastar tokens
- ✅ Desarrollo local
- ✅ Respuestas no críticas

## 🔍 Verificar Estado

### Ver si Ollama está corriendo
```bash
curl http://localhost:11434/api/tags
```

### Ver logs del bot
```bash
# Busca líneas como:
[Ollama] ✅ Conectado exitosamente
[Ollama] 🤖 Generando respuesta con gemma3:4b
```

## 📈 Estadísticas

### Velocidad Promedio
- Primera respuesta: ~17-30s (carga modelo)
- Respuestas siguientes: ~8-20s (modelo en memoria)
- Groq (comparación): ~0.5-1s

### Calidad
- Español: ✅ Excelente
- Contexto: ✅ Bueno
- Intenciones: ✅ Bueno
- Razonamiento: ✅ Aceptable

## 🛠️ Troubleshooting

### Ollama no responde
```bash
# Verificar que esté corriendo
ollama list

# Si no está corriendo, iniciarlo
ollama serve
```

### Modelo no encontrado
```bash
# Descargar gemma3:4b
ollama pull gemma3:4b

# Verificar
ollama list
```

### Muy lento
```bash
# Probar modelo más pequeño
ollama pull gemma2:2b

# Actualizar .env
OLLAMA_MODEL=gemma2:2b
```

### Error de memoria
```bash
# gemma3:4b requiere ~4GB RAM
# Si no tienes suficiente, usa gemma2:2b (1.6GB)
ollama pull gemma2:2b
```

## 📝 Próximos Pasos

1. ✅ Ollama configurado
2. ✅ gemma3:4b instalado
3. ✅ Comandos agregados
4. ⏳ Probar en producción
5. ⏳ Monitorear uso de fallback

## 💡 Recomendaciones

### Para Desarrollo
- Usa Ollama para testing sin gastar tokens
- Prueba diferentes prompts localmente
- Experimenta con temperaturas

### Para Producción
- Mantén Groq como principal (30x más rápido)
- Ollama solo como fallback de emergencia
- Monitorea cuántas veces se usa Ollama
- Si Ollama se usa mucho, revisa Groq keys

## 🎯 Objetivo

**Ollama NO reemplaza a Groq**, es un respaldo para cuando Groq falle.

**Flujo ideal:**
- 99% respuestas con Groq (rápido)
- 1% respuestas con Ollama (cuando Groq falla)
- 0% respuestas genéricas (siempre hay fallback)

---

**Configurado:** 15 Nov 2025  
**Modelo:** gemma3:4b (3.1GB)  
**Estado:** ✅ Activo y funcionando
