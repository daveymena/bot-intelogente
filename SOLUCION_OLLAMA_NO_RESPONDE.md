# 🔧 SOLUCIÓN: OLLAMA NO RESPONDE

**Problema**: Ollama se queda colgado y no envía respuestas

---

## ⚡ SOLUCIÓN INMEDIATA (Usar Groq)

### Opción 1: Desactivar Ollama temporalmente

Edita `.env`:
```env
# Cambiar esto:
USE_OLLAMA=true

# Por esto:
USE_OLLAMA=false
```

**Resultado**: El sistema usará Groq (rápido y confiable) en lugar de Ollama

---

## 🔍 DIAGNÓSTICO

### Verificar si Ollama responde:
```bash
curl https://ollama-ollama.ginee6.easypanel.host/api/tags
```

**Si no responde**: Ollama está caído en Easypanel

**Si responde**: El problema es el timeout

---

## 🛠️ SOLUCIONES

### Solución 1: Usar Groq (Recomendado ahora)
```env
USE_OLLAMA=false
AI_FALLBACK_ENABLED=true
```

**Ventajas**:
- ✅ Respuestas en < 2 segundos
- ✅ Muy confiable
- ✅ Búsqueda semántica funciona igual
- ⚠️ Usa API key (pero tienes 3 con rotación)

### Solución 2: Aumentar timeout de Ollama
```env
USE_OLLAMA=true
OLLAMA_TIMEOUT=60000  # 60 segundos
```

**Ventajas**:
- ✅ Sin costos
- ⚠️ Más lento (puede tardar 30-60s)

### Solución 3: Usar modelo más pequeño
```env
USE_OLLAMA=true
OLLAMA_MODEL=gemma2:2b  # Ya es el más pequeño
```

---

## 🚀 RECOMENDACIÓN INMEDIATA

**Usa Groq ahora** y luego investigamos por qué Ollama está lento:

1. Editar `.env`:
```env
USE_OLLAMA=false
```

2. Reiniciar servidor:
```bash
Ctrl+C
npm run dev
```

3. Probar de nuevo

**El bot funcionará perfecto con Groq** (rápido y confiable)

---

## 📊 COMPARACIÓN

| Característica | Ollama | Groq |
|----------------|--------|------|
| Velocidad | 10-30s ⏱️ | < 2s ⚡ |
| Costo | Gratis ✅ | API key ⚠️ |
| Confiabilidad | Variable 🔄 | Alta ✅ |
| Búsqueda semántica | ✅ | ✅ |
| Formato CARD | ✅ | ✅ |
| AIDA | ✅ | ✅ |

---

## 💡 POR QUÉ OLLAMA ESTÁ LENTO

Posibles causas:
1. **Servidor Easypanel sobrecargado**
2. **Modelo gemma2:2b es lento** para prompts largos
3. **Red lenta** entre tu servidor y Ollama
4. **Ollama necesita reinicio** en Easypanel

---

## 🔄 PARA VOLVER A OLLAMA DESPUÉS

Cuando Ollama esté más rápido:

1. Verificar que responde rápido:
```bash
node test-ollama-completo.js
```

2. Si responde en < 5 segundos, activar:
```env
USE_OLLAMA=true
```

3. Reiniciar y probar

---

## ✅ ESTADO ACTUAL

**Sistema funcionando con**:
- ❌ Ollama (muy lento, se queda colgado)
- ✅ Groq (rápido, confiable, recomendado)
- ✅ Búsqueda semántica (funciona con ambos)
- ✅ Formato CARD + AIDA
- ✅ Memoria conversacional
- ✅ Fotos automáticas
- ✅ Links de pago

**Cambio recomendado**: `USE_OLLAMA=false`

---

**Próxima acción**: Desactivar Ollama y usar Groq
