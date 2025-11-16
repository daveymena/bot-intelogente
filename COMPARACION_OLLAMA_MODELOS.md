# Comparación Ollama - Modelos Locales

## 🧪 Pruebas Realizadas

### Velocidad de Respuesta

| Modelo | Tiempo Promedio | Tamaño | Parámetros |
|--------|----------------|--------|------------|
| **gemma2:2b** | ~21-26s | 1.6GB | 2B |
| **gemma3:4b** | ~8-30s | 3.3GB | 4B |
| **qwen3:4b** | ~18-36s | 2.5GB | 4B |
| **Groq (referencia)** | ~0.5-1s | Cloud | 8B |

### Calidad de Razonamiento

#### ✅ gemma3:4b - MEJOR OPCIÓN
```
✓ Responde directamente en español
✓ Entiende contexto conversacional
✓ Detecta intenciones correctamente
✓ Balance velocidad/calidad aceptable
✓ Respuestas naturales y coherentes
```

#### ⚠️ gemma2:2b - Opción Rápida
```
✓ Más rápido que gemma3
✓ Responde en español
✗ Razonamiento más básico
✗ Menos contexto conversacional
```

#### ❌ qwen3:4b - NO RECOMENDADO
```
✗ Piensa en inglés primero
✗ Respuestas en inglés mezcladas
✗ Más lento que gemma3
✗ No apto para bot en español
```

## 📊 Resultados de Pruebas

### Test 1: Inferencia de Necesidad
**Pregunta:** "Necesito algo para trabajar desde casa y hacer videollamadas"

- **gemma3:4b** ✅: Identifica laptop como necesidad principal
- **gemma2:2b** ✅: Identifica laptop pero menos detalle
- **qwen3:4b** ❌: Responde en inglés, analiza en inglés

### Test 2: Comparación de Precios
**Pregunta:** "Tengo $1 millón, qué puedo comprar?"

- **gemma3:4b** ✅: Descarta laptop cara, recomienda curso/megapack
- **gemma2:2b** ✅: Similar pero menos natural
- **qwen3:4b** ❌: Piensa en inglés primero

### Test 3: Detección de Urgencia
**Pregunta:** "Necesito urgente un portátil para mañana"

- **gemma3:4b** ✅: Detecta urgencia, pregunta por disponibilidad
- **gemma2:2b** ✅: Detecta urgencia básica
- **qwen3:4b** ❌: Responde en inglés

### Test 4: Intención vs Consulta
**Pregunta:** "Cuánto cuesta el curso de piano?"

- **gemma3:4b** ✅: Da precio y pregunta si le interesa
- **gemma2:2b** ✅: Similar, menos natural
- **qwen3:4b** ❌: Analiza en inglés

### Test 5: Contexto Conversacional
**Pregunta:** "Y ese viene con garantía?"

- **gemma3:4b** ✅: Entiende que "ese" = laptop HP mencionada antes
- **gemma2:2b** ✅: Entiende referencia
- **qwen3:4b** ❌: Error en ejecución

## 🎯 Conclusión Final

### ⚠️ IMPORTANTE: Ollama NO es Reemplazo de Groq

**Comparación de Velocidad:**
- Groq: 0.5-1 segundo ⚡
- Ollama gemma3:4b: 8-30 segundos 🐌
- **Diferencia: 10-30x más lento**

### 💡 Uso Recomendado

**Ollama debe usarse SOLO como fallback:**

```
1. Groq (8 API keys) → Rápido, preciso, primera opción
2. Ollama (gemma3:4b) → Lento pero gratis, cuando Groq falla
3. Base Conocimiento → Respuestas guardadas
4. Fallback genérico → Último recurso
```

### ✅ Configuración Recomendada

```env
# Ollama (Fallback Local)
OLLAMA_ENABLED=true
OLLAMA_MODEL=gemma3:4b
OLLAMA_URL=http://localhost:11434

# Fallback Multi-Provider
AI_FALLBACK_ENABLED=true
```

### 📝 Cuándo Usar Ollama

**SÍ usar Ollama cuando:**
- ✅ Groq agota rate limits
- ✅ Todas las API keys fallan
- ✅ Problemas de conectividad
- ✅ Desarrollo/testing sin gastar tokens
- ✅ Respuestas no críticas en tiempo

**NO usar Ollama cuando:**
- ❌ Cliente espera respuesta inmediata
- ❌ Conversación en tiempo real
- ❌ Groq está funcionando
- ❌ Necesitas respuesta en <5 segundos

## 🚀 Instalación y Uso

### 1. Instalar Ollama
```bash
# Descargar de: https://ollama.com/download
# Ejecutar instalador
```

### 2. Descargar Modelo
```bash
ollama pull gemma3:4b
```

### 3. Verificar
```bash
ollama list
npm run ollama:test
```

### 4. Probar Velocidad
```bash
npx tsx scripts/test-ollama-velocidad.ts
```

### 5. Probar Razonamiento
```bash
npx tsx scripts/test-razonamiento-ollama.ts
```

## 📈 Ventajas y Desventajas

### Ventajas ✅
- Gratis (no consume tokens)
- Ilimitado (sin rate limits)
- Offline (funciona sin internet)
- Privado (datos no salen de tu PC)
- Buena calidad de respuestas

### Desventajas ❌
- **MUY lento** (10-30x vs Groq)
- Requiere recursos locales (RAM, CPU)
- No apto para tiempo real
- Menor calidad que GPT-4/Claude

## 🎓 Recomendación Final

**Para tu bot de WhatsApp:**

1. **Mantén Groq como principal** - Es 30x más rápido
2. **Usa Ollama como fallback** - Solo cuando Groq falle
3. **Modelo recomendado: gemma3:4b** - Mejor balance
4. **Evita qwen3:4b** - Responde en inglés
5. **Monitorea tiempos** - Alerta si Ollama se usa mucho

**Configuración óptima:**
```
Groq (8 keys) → 99% de las respuestas
Ollama → 1% cuando Groq falla
Base Conocimiento → Respuestas guardadas
```

---

**Fecha:** 15 Nov 2025  
**Modelos probados:** gemma2:2b, gemma3:4b, qwen3:4b  
**Conclusión:** gemma3:4b es el mejor, pero solo como fallback
