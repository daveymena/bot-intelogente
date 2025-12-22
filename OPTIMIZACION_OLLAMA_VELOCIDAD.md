# ⚡ Optimización: Velocidad de Ollama

## 🔍 Problema Detectado

**Test**: Ollama responde en **2 segundos** ✅
**Bot**: Ollama tarda **30+ segundos** y hace timeout ❌

## 🎯 Causa

Cuando hay productos encontrados, el bot:
1. Busca productos (rápido)
2. Construye prompt largo
3. Envía historial de conversación
4. Espera respuesta de Ollama (30+ segundos)
5. Timeout ❌

**Problema**: No necesitamos IA para decir "Te envié el producto"

## ✅ Solución Implementada

### Estrategia Inteligente

```typescript
if (products.length > 0) {
  // ⚡ Respuesta local directa (instantánea)
  return "¡Perfecto! Te envié la info del [producto]"
} else {
  // 🤖 Usar Ollama solo para conversación general
  return await callOllama(...)
}
```

### Cuándo Usar Cada Uno

**Respuesta Local** (instantánea):
- ✅ Usuario busca producto → Producto encontrado
- ✅ "Me interesa el curso de piano" → Curso encontrado
- ✅ "Busco portátil" → Portátiles encontrados

**Ollama** (2-4 segundos):
- ✅ "Hola" → Sin productos
- ✅ "Gracias" → Sin productos
- ✅ "Cómo estás?" → Sin productos

## 📊 Resultados

### Antes
```
Usuario: "Me interesa el curso de piano"
[Buscar productos: 500ms]
[Llamar Ollama: 30000ms] ❌ TIMEOUT
[Fallback local: 0ms]
Total: 30500ms
```

### Ahora
```
Usuario: "Me interesa el curso de piano"
[Buscar productos: 500ms]
[Respuesta local: 0ms] ✅ DIRECTO
Total: 500ms
```

**Mejora**: 60x más rápido 🚀

## 🎯 Optimizaciones Adicionales

### 1. Historial Reducido

**Antes**: Últimos 8 mensajes
**Ahora**: Últimos 2 mensajes (solo para Ollama)

Esto reduce el tamaño del prompt y acelera la respuesta.

### 2. Timeout Aumentado

Para los casos donde SÍ usamos Ollama:

```env
OLLAMA_TIMEOUT=90000  # 90 segundos
```

### 3. Caché de Respuestas

Respuestas comunes ya están en caché:
- "Hola" → Respuesta instantánea
- "Gracias" → Respuesta instantánea
- "Ok" → Respuesta instantánea

## 🚀 Resultado Final

### Flujo Optimizado

```
┌─────────────────────────────────────────────────────────────┐
│  USUARIO: "Me interesa el curso de piano"                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Buscar productos (500ms)                                │
│     ✅ Curso de Piano encontrado                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  2. ¿Hay productos?                                          │
│     ✅ SÍ → Respuesta local directa (0ms)                   │
│     ❌ NO → Llamar Ollama (2-4s)                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Enviar respuesta                                         │
│     "¡Perfecto! Te envié la info del Curso..."             │
│     Total: 500ms ⚡                                          │
└─────────────────────────────────────────────────────────────┘
```

## 📝 Logs Esperados

### Con Productos (Rápido)
```
[Orchestrator] 🔍 Productos encontrados: 1
[Orchestrator] ⚡ Usando respuesta local directa (más rápido)
[Baileys] ✅ Respuesta generada con LOCAL (confianza: 80%)
```

### Sin Productos (Ollama)
```
[Orchestrator] 🔍 Productos encontrados: 0
[Orchestrator] 🤖 Usando Ollama para conversación general
[Ollama] 🌐 Conectando a: https://davey-ollama2.mapf5v.easypanel.host
[Ollama] ✅ Respuesta recibida (2500ms)
[Baileys] ✅ Respuesta generada con OLLAMA (confianza: 85%)
```

## 🎯 Resumen

**Problema**: Ollama tardaba 30+ segundos para respuestas simples
**Solución**: Usar respuesta local cuando hay productos encontrados
**Resultado**: 60x más rápido (500ms vs 30000ms)

Ollama ahora solo se usa para:
- Saludos
- Preguntas generales
- Conversación sin productos

Todo lo demás usa respuestas locales instantáneas. ⚡
