# 🤖 INTEGRACIÓN OLLAMA EN EASYPANEL

**URL:** https://bot-whatsapp-ollama.sqaoeo.easypanel.host  
**Modelo:** qwen2.5:7b (Mejor compresión y respuesta en español)  
**Estado:** ✅ ACTIVADO

---

## 🎯 Ventajas de Usar Ollama

### 1. **Ilimitado y Gratis**
- ✅ Sin límites de tokens
- ✅ Sin costos por uso
- ✅ Perfecto para entrenamiento masivo

### 2. **Rápido**
- ✅ Respuestas en 1-3 segundos
- ✅ Respuestas en 1-3 segundos
- ✅ Modelo potente (qwen2.5:7b)
- ✅ Optimizado para español y compresión razonada

### 3. **Ahorra Groq**
- ✅ Groq solo como respaldo
- ✅ 800k tokens/día reservados para producción
- ✅ Entrenamiento sin límites

---

## 🔄 Flujo de Prioridades

```
Cliente envía mensaje
   ↓
1. Intentar con Ollama (Easypanel)
   ├─ ✅ Éxito → Responder
   └─ ❌ Falla → Siguiente
   ↓
2. Intentar con Groq (8 API keys)
   ├─ ✅ Éxito → Responder
   └─ ❌ Falla → Siguiente
   ↓
3. Buscar en Base de Conocimiento Local
   ├─ ✅ Encontrado → Responder
   └─ ❌ No encontrado → Mensaje de error
```

---

## ⚙️ Configuración

### Variables de Entorno (.env):

```env
OLLAMA_BASE_URL=https://bot-whatsapp-ollama.sqaoeo.easypanel.host
OLLAMA_MODEL=qwen2.5:7b
OLLAMA_ENABLED=true
OLLAMA_TIMEOUT=30000
OLLAMA_MAX_TOKENS=500
```

---

## 🧪 Verificar Ollama

```bash
npx tsx scripts/verificar-ollama.ts
```

**Salida esperada:**
```
✅ Ollama está corriendo
✅ Modelo qwen2.5:7b disponible
✅ Generación de respuestas funciona
```

---

## 🎓 Entrenar con Ollama

### Entrenamiento Rápido (5-10 min):
```bash
npx tsx scripts/entrenar-bot-automatico.ts
```

### Entrenamiento Completo (20-25 min):
```bash
npx tsx scripts/entrenar-conversaciones-completas.ts
```

**Ventaja:** Usa Ollama = Sin consumir tokens de Groq

---

## 📊 Comparación

### Antes (Solo Groq):
- ❌ Límite: 800k tokens/día
- ❌ Entrenamiento consume tokens
- ❌ Producción compite con entrenamiento

### Ahora (Ollama + Groq):
- ✅ Ollama: Ilimitado para entrenamiento
- ✅ Groq: 800k tokens/día para producción
- ✅ Sin competencia de recursos

---

## 🚀 Despliegue en Easypanel

### Variables a Agregar:

En Easypanel → Environment:

```env
OLLAMA_BASE_URL=https://bot-whatsapp-ollama.sqaoeo.easypanel.host
OLLAMA_MODEL=qwen2.5:7b
OLLAMA_ENABLED=true
OLLAMA_TIMEOUT=30000
OLLAMA_MAX_TOKENS=500
```

---

## ✅ Resultado

El bot ahora tiene **3 niveles de respaldo**:

1. 🤖 **Ollama** (Easypanel) - Ilimitado, rápido
2. 🔄 **Groq** (8 keys) - 800k tokens/día
3. 🧠 **Conocimiento Local** - Respuestas aprendidas

**= Bot que NUNCA se detiene**

---

**Fecha:** 2025-11-11  
**Estado:** ✅ LISTO PARA USAR
