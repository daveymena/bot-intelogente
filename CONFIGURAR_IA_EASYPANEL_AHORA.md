# 🤖 Configurar IA en Easypanel - GUÍA RÁPIDA

## ⚡ Opción 1: GROQ (GRATIS Y RÁPIDO) - RECOMENDADO

### Paso 1: Obtener API Key de Groq

1. **Ir a**: https://console.groq.com
2. **Crear cuenta** (gratis)
3. **Ir a API Keys**: https://console.groq.com/keys
4. **Crear nueva key**: Click en "Create API Key"
5. **Copiar la key**: Empieza con `gsk_...`

### Paso 2: Configurar en Easypanel

1. **Abrir tu app en Easypanel**
2. **Ir a**: Environment Variables
3. **Agregar estas variables**:

```bash
# IA Principal - GROQ (GRATIS)
GROQ_API_KEY=gsk_tu_key_aqui_pegala
GROQ_MODEL=llama-3.1-70b-versatile
GROQ_MAX_TOKENS=1000
GROQ_TIMEOUT=10000

# Configuración de IA
AI_PROVIDER=groq
DEFAULT_AI_PROVIDER=groq
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=groq
AI_ENABLED=true
```

4. **Guardar** y **Redesplegar**

### Paso 3: Verificar

```bash
# En los logs de Easypanel deberías ver:
[AI Multi-Provider] ✅ Éxito con: groq
```

---

## 🚀 Opción 2: OpenRouter (Múltiples Modelos)

### Paso 1: Obtener API Key

1. **Ir a**: https://openrouter.ai
2. **Crear cuenta**
3. **Agregar créditos**: $5 USD (dura mucho)
4. **Copiar API Key**: https://openrouter.ai/keys

### Paso 2: Configurar en Easypanel

```bash
# IA - OpenRouter
OPENROUTER_API_KEY=sk-or-v1-tu_key_aqui
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
OPENROUTER_TIMEOUT=15000

# Configuración
AI_PROVIDER=openrouter
DEFAULT_AI_PROVIDER=openrouter
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=openrouter,groq
AI_ENABLED=true
```

---

## 🏠 Opción 3: Ollama (IA Local en Easypanel)

### Requisitos
- Servidor con al menos 4GB RAM
- Easypanel con acceso a Docker

### Paso 1: Crear servicio Ollama en Easypanel

1. **Crear nuevo servicio**: "Ollama"
2. **Tipo**: Docker
3. **Imagen**: `ollama/ollama:latest`
4. **Puerto**: 11434
5. **Volumen**: `/root/.ollama` → `/root/.ollama`

### Paso 2: Instalar modelo

```bash
# Conectar al contenedor de Ollama
docker exec -it ollama-container ollama pull llama3.2

# O modelo más pequeño
docker exec -it ollama-container ollama pull phi3
```

### Paso 3: Configurar en tu app

```bash
# IA - Ollama Local
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2
OLLAMA_TIMEOUT=30000

# Configuración
AI_PROVIDER=ollama
DEFAULT_AI_PROVIDER=ollama
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=ollama,groq
AI_ENABLED=true
```

---

## 🎯 CONFIGURACIÓN RECOMENDADA PARA EASYPANEL

### Variables de Entorno Completas

```bash
# ===== IA - GROQ (GRATIS) =====
GROQ_API_KEY=gsk_tu_key_de_groq_aqui
GROQ_MODEL=llama-3.1-70b-versatile
GROQ_MAX_TOKENS=1000
GROQ_TIMEOUT=10000

# ===== CONFIGURACIÓN DE IA =====
AI_PROVIDER=groq
DEFAULT_AI_PROVIDER=groq
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=groq
AI_ENABLED=true

# ===== OTRAS VARIABLES IMPORTANTES =====
NODE_ENV=production
DATABASE_URL=postgresql://postgres:password@postgres:5432/botwhatsapp
NEXTAUTH_SECRET=tu-secret-super-seguro-cambiar-esto
NEXTAUTH_URL=https://tu-dominio.com

# ===== WHATSAPP =====
WHATSAPP_PROVIDER=baileys
SESSION_PATH=/app/whatsapp-sessions

# ===== NEGOCIO =====
BUSINESS_NAME=Tu Negocio
BOT_NAME=Smart Sales Bot
BOT_PHONE=+57 300 000 0000
BOT_LANGUAGE=es

# ===== CARACTERÍSTICAS =====
PHOTOS_ENABLED=true
AUDIO_ENABLED=true
HOT_RELOAD_ENABLED=true
DYNAMIC_PRICING_ENABLED=true
```

---

## 🔍 Verificar que Funciona

### 1. Ver Logs en Easypanel

```
[AI Multi-Provider] 🔄 Orden de fallback: groq
[AI Multi-Provider] 🔄 Intentando con: groq
[AI Multi-Provider] ✅ Éxito con: groq
```

### 2. Probar desde el Dashboard

1. Ir a tu dashboard
2. Conectar WhatsApp
3. Enviar mensaje de prueba
4. El bot debería responder

### 3. Probar API directamente

```bash
# Desde tu máquina local
curl -X POST https://tu-dominio.com/api/test-ai \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola"}'
```

---

## ❌ Solución de Problemas

### Error: "Todas las APIs de IA fallaron"

**Causa**: No hay API key configurada o es inválida

**Solución**:
1. Verificar que `GROQ_API_KEY` esté configurada
2. Verificar que la key sea válida (empieza con `gsk_`)
3. Verificar que `AI_ENABLED=true`
4. Redesplegar la app

### Error: "GROQ_API_KEY is not defined"

**Solución**:
```bash
# Agregar en Easypanel Environment Variables:
GROQ_API_KEY=gsk_tu_key_aqui
AI_ENABLED=true
AI_PROVIDER=groq

# Guardar y redesplegar
```

### Error: Timeout

**Solución**:
```bash
# Aumentar timeout
GROQ_TIMEOUT=15000

# O usar modelo más rápido
GROQ_MODEL=llama-3.1-8b-instant
```

### Bot no responde

**Checklist**:
- ✅ `AI_ENABLED=true`
- ✅ `GROQ_API_KEY` configurada
- ✅ `AI_PROVIDER=groq`
- ✅ WhatsApp conectado
- ✅ App redesplegada después de cambios

---

## 📊 Comparación de Opciones

| Proveedor | Costo | Velocidad | Calidad | Recomendado |
|-----------|-------|-----------|---------|-------------|
| **Groq** | 🟢 Gratis | ⚡ Muy rápido | ⭐⭐⭐⭐ | ✅ SÍ |
| OpenRouter | 💰 $5/mes | ⚡ Rápido | ⭐⭐⭐⭐⭐ | ✅ SÍ |
| Ollama | 🟢 Gratis | 🐌 Lento | ⭐⭐⭐ | ⚠️ Solo si tienes RAM |
| OpenAI | 💰💰 Caro | ⚡ Rápido | ⭐⭐⭐⭐⭐ | ❌ Muy caro |

---

## 🎯 ACCIÓN INMEDIATA

### Para activar IA AHORA en Easypanel:

1. **Obtener Groq API Key**: https://console.groq.com/keys
2. **Ir a Easypanel** → Tu App → Environment Variables
3. **Agregar**:
   ```
   GROQ_API_KEY=gsk_tu_key_aqui
   AI_ENABLED=true
   AI_PROVIDER=groq
   ```
4. **Guardar** y **Redesplegar**
5. **Verificar logs**: Buscar "✅ Éxito con: groq"

---

## 📝 Modelos Groq Disponibles (Gratis)

```bash
# Más rápido (recomendado para chat)
GROQ_MODEL=llama-3.1-8b-instant

# Mejor calidad
GROQ_MODEL=llama-3.1-70b-versatile

# Balance
GROQ_MODEL=llama-3.1-8b-versatile

# Mixtral (alternativa)
GROQ_MODEL=mixtral-8x7b-32768
```

---

## ✅ Checklist Final

- [ ] Cuenta Groq creada
- [ ] API Key copiada
- [ ] Variables agregadas en Easypanel
- [ ] App redesplegada
- [ ] Logs verificados
- [ ] Bot probado con mensaje
- [ ] Respuesta recibida

**¡Listo! Tu IA está funcionando en Easypanel!** 🎉

---

**Fecha**: 2 de noviembre, 2025  
**Estado**: Listo para implementar  
**Tiempo estimado**: 5 minutos
