# 🚀 GUÍA - TEST 24/7 CON GROQ + IA LOCAL

**Objetivo**: Agotar todos los tokens de Groq y luego activar el bot con IA local (Ollama)

---

## 📋 FLUJO

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. TEST 24/7 CON GROQ                                     │
│     ├─ Ejecuta 1000+ requests                             │
│     ├─ Usa todos los modelos disponibles                  │
│     ├─ Agota todos los tokens                             │
│     └─ Genera reporte detallado                           │
│                                                             │
│  2. ACTIVAR BOT CON IA LOCAL                              │
│     ├─ Verifica Ollama disponible                         │
│     ├─ Actualiza configuración (.env)                     │
│     ├─ Crea config de IA local                            │
│     └─ Genera script de inicio                            │
│                                                             │
│  3. INICIAR BOT                                            │
│     ├─ npm run dev                                         │
│     ├─ Usa Ollama en lugar de Groq                        │
│     └─ Funciona 24/7 sin límites de tokens                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 INICIO RÁPIDO

### Opción 1: Ejecutar Todo Automáticamente
```bash
node ejecutar-test-24-7-completo.js
```

Esto ejecutará:
1. Test 24/7 con Groq
2. Activar bot con IA local

**Tiempo**: 30-60 minutos (depende de tokens disponibles)

---

### Opción 2: Ejecutar Paso a Paso

#### Paso 1: Test 24/7 con Groq
```bash
node test-24-7-groq.js
```

**Qué hace**:
- Ejecuta 1000+ requests
- Usa todos los modelos disponibles
- Agota todos los tokens
- Genera reporte

**Genera**:
- `test-24-7-reporte.json`

**Tiempo**: 30-60 minutos

#### Paso 2: Activar Bot con IA Local
```bash
node activar-bot-ia-local.js
```

**Qué hace**:
- Verifica Ollama disponible
- Actualiza .env
- Crea configuración
- Genera script de inicio

**Genera**:
- `config-ia-local.json`
- `start-bot-local.sh`

**Tiempo**: 1-2 minutos

---

## 📊 TEST 24/7 CON GROQ

### Configuración
```
API Keys: 3 (rotación automática)
Modelos: 3 (llama-3.1-8b-instant, llama-3.1-70b-versatile, gemma2-9b-it)
Preguntas: 10 (variadas)
Max Requests: 1000
```

### Estadísticas Esperadas
```
Total de requests: 1000+
Exitosos: 900+ (90%)
Fallidos: 100- (10%)
Total de tokens: 500,000+
Costo estimado: $0.02-0.05
Duración: 30-60 minutos
Requests/segundo: 0.3-0.5
```

### Reporte Generado
```json
{
  "timestamp": "2025-11-15T23:30:00.000Z",
  "duracion": "3600 segundos",
  "stats": {
    "totalRequests": 1000,
    "successfulRequests": 900,
    "failedRequests": 100,
    "totalTokens": 500000,
    "totalCost": 0.025,
    "requestsByModel": {
      "llama-3.1-8b-instant": { "count": 333, "tokens": 166500 },
      "llama-3.1-70b-versatile": { "count": 333, "tokens": 166500 },
      "gemma2-9b-it": { "count": 334, "tokens": 167000 }
    },
    "requestsByApiKey": {
      "0": { "count": 333, "tokens": 166500 },
      "1": { "count": 333, "tokens": 166500 },
      "2": { "count": 334, "tokens": 167000 }
    }
  }
}
```

---

## 🤖 ACTIVAR BOT CON IA LOCAL

### Requisitos
- Ollama instalado
- Modelo descargado (llama2, mistral, etc.)
- Ollama ejecutándose en puerto 11434

### Instalación de Ollama

#### Windows
1. Descarga desde: https://ollama.ai
2. Ejecuta el instalador
3. Abre terminal y ejecuta:
```bash
ollama serve
```

#### macOS
```bash
brew install ollama
ollama serve
```

#### Linux
```bash
curl https://ollama.ai/install.sh | sh
ollama serve
```

### Descargar Modelo
```bash
ollama pull llama2
# o
ollama pull mistral
# o
ollama pull neural-chat
```

### Verificar Ollama
```bash
# Ver modelos disponibles
ollama list

# Probar modelo
ollama run llama2 "Hola, ¿cómo estás?"
```

---

## 🔧 CONFIGURACIÓN APLICADA

### .env
```bash
AI_PROVIDER=ollama
DEFAULT_AI_PROVIDER=ollama
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
AI_FALLBACK_ENABLED=false
```

### config-ia-local.json
```json
{
  "provider": "ollama",
  "settings": {
    "baseUrl": "http://localhost:11434",
    "model": "llama2",
    "temperature": 0.7,
    "topP": 0.9,
    "topK": 40,
    "repeatPenalty": 1.1,
    "numPredict": 500
  },
  "modelos": ["llama2", "mistral", "neural-chat"],
  "fallback": {
    "enabled": false,
    "providers": []
  }
}
```

---

## 🚀 INICIAR BOT

### Opción 1: Comando Directo
```bash
npm run dev
```

### Opción 2: Script Generado
```bash
bash start-bot-local.sh
```

### Verificar que Funciona
```bash
# En otra terminal
curl http://localhost:4000/api/health
```

---

## 📈 MONITOREO

### Ver Logs en Tiempo Real
```bash
npm run dev
```

### Verificar Ollama
```bash
# Ver modelos cargados
ollama list

# Ver uso de memoria
ollama ps

# Probar modelo
ollama run llama2 "Test"
```

### Verificar Bot
```bash
# Ver procesos Node
tasklist | findstr node

# Ver puertos en uso
netstat -ano | findstr LISTENING
```

---

## 🎯 CASOS DE USO

### Caso 1: Agotar Tokens de Groq
```bash
node test-24-7-groq.js
# Ejecuta 1000+ requests hasta agotar tokens
```

### Caso 2: Cambiar a IA Local
```bash
node activar-bot-ia-local.js
# Configura bot para usar Ollama
```

### Caso 3: Ejecutar Todo
```bash
node ejecutar-test-24-7-completo.js
# Ejecuta test + activa IA local
```

---

## ⚙️ CONFIGURACIÓN AVANZADA

### Cambiar Modelo
```bash
# En .env
OLLAMA_MODEL=mistral

# O en config-ia-local.json
"model": "mistral"
```

### Ajustar Parámetros
```json
{
  "temperature": 0.5,      // Más bajo = más determinístico
  "topP": 0.8,             // Nucleus sampling
  "topK": 30,              // Top-K sampling
  "repeatPenalty": 1.2,    // Penalizar repeticiones
  "numPredict": 1000       // Máximo de tokens
}
```

### Usar Múltiples Modelos
```bash
ollama pull llama2
ollama pull mistral
ollama pull neural-chat

# Cambiar en .env según necesidad
OLLAMA_MODEL=llama2
```

---

## 🔍 SOLUCIÓN DE PROBLEMAS

### Problema: "Ollama no está disponible"
**Solución**:
```bash
ollama serve
# En otra terminal
node activar-bot-ia-local.js
```

### Problema: "No hay modelos descargados"
**Solución**:
```bash
ollama pull llama2
```

### Problema: "Bot lento con Ollama"
**Solución**:
- Usar modelo más pequeño: `ollama pull neural-chat`
- Aumentar RAM disponible
- Reducir `numPredict` en config

### Problema: "Tokens agotados en Groq"
**Solución**:
- Esperar a que se reinicien (generalmente cada 24h)
- Usar IA local (Ollama)
- Agregar más API keys

---

## 📊 COMPARACIÓN: GROQ vs OLLAMA

| Aspecto | Groq | Ollama |
|---------|------|--------|
| Velocidad | Ultra rápido | Rápido |
| Costo | $0.05/M tokens | Gratis |
| Límite de tokens | Sí (rate limit) | No |
| Disponibilidad | Online | Local |
| Modelos | Limitados | Muchos |
| Configuración | Fácil | Fácil |
| Escalabilidad | Limitada | Ilimitada |

---

## ✅ CHECKLIST

- [ ] Groq API keys configuradas
- [ ] Ollama instalado
- [ ] Modelo Ollama descargado
- [ ] Ejecutar test 24/7
- [ ] Activar IA local
- [ ] Iniciar bot
- [ ] Pruebas en WhatsApp
- [ ] Monitorear rendimiento

---

## 📞 SOPORTE

**¿Cuánto tiempo tarda el test?**
→ 30-60 minutos para agotar tokens

**¿Puedo interrumpir el test?**
→ Sí, pero perderás datos del reporte

**¿Qué pasa después de agotar tokens?**
→ El bot usa Ollama automáticamente

**¿Puedo usar ambos (Groq + Ollama)?**
→ Sí, configura fallback en .env

---

## 🎓 CONCLUSIÓN

Sistema de IA **híbrido y resiliente**:
- ✅ Groq para máxima velocidad
- ✅ Ollama para disponibilidad 24/7
- ✅ Fallback automático
- ✅ Sin límites de tokens

**Próximo paso**: Ejecutar test 24/7 y activar IA local.

---

**Generado**: 15 de Noviembre de 2025  
**Estado**: ✅ LISTO PARA EJECUTAR
