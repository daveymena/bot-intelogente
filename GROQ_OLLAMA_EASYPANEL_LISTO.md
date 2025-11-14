# 🚀 Groq + Ollama en Easypanel - Configuración Completa

## 🎯 Estrategia: Groq Principal + Ollama Fallback

**Ventajas:**
- ✅ Groq: Gratis, rápido, sin límites estrictos
- ✅ Ollama: Backup local, sin costos externos
- ✅ Fallback automático si Groq falla
- ✅ 100% gratis

---

## 📋 PASO 1: Configurar Groq (Principal)

### 1.1 Obtener API Key de Groq

1. **Ir a**: https://console.groq.com
2. **Crear cuenta** (gratis, sin tarjeta)
3. **Ir a API Keys**: https://console.groq.com/keys
4. **Crear nueva key**: Click "Create API Key"
5. **Copiar**: Empieza con `gsk_...`

### 1.2 Configurar en Easypanel

**Ir a**: Tu App → Environment Variables → Agregar:

```bash
# ===== GROQ (PRINCIPAL) =====
GROQ_API_KEY=gsk_tu_key_aqui_pegala
GROQ_MODEL=llama-3.1-70b-versatile
GROQ_MAX_TOKENS=1000
GROQ_TIMEOUT=10000
```

---

## 📋 PASO 2: Configurar Ollama (Fallback)

### 2.1 Crear Servicio Ollama en Easypanel

1. **Ir a Easypanel** → Services → **Create Service**
2. **Nombre**: `ollama`
3. **Tipo**: App
4. **Source**: Docker Image
5. **Configuración**:

```yaml
Image: ollama/ollama:latest
Port: 11434
Volumes:
  - /root/.ollama:/root/.ollama
Environment:
  OLLAMA_HOST: 0.0.0.0:11434
```

6. **Deploy** el servicio

### 2.2 Instalar Modelo en Ollama

**Opción A: Desde Easypanel Terminal**

1. Ir a Ollama service → Terminal
2. Ejecutar:

```bash
# Modelo pequeño y rápido (recomendado)
ollama pull llama3.2

# O modelo más pequeño si tienes poca RAM
ollama pull phi3
```

**Opción B: Desde SSH**

```bash
# Conectar al contenedor
docker exec -it ollama ollama pull llama3.2
```

### 2.3 Verificar Ollama

```bash
# Probar que funciona
curl http://ollama:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Hola",
  "stream": false
}'
```

---

## 📋 PASO 3: Configurar Variables de Entorno

### En tu App Principal (Bot)

**Ir a**: Tu App → Environment Variables → Agregar TODAS estas:

```bash
# ===== GROQ (PRINCIPAL - GRATIS) =====
GROQ_API_KEY=gsk_tu_key_de_groq_aqui
GROQ_MODEL=llama-3.1-70b-versatile
GROQ_MAX_TOKENS=1000
GROQ_TIMEOUT=10000

# ===== OLLAMA (FALLBACK - LOCAL) =====
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2
OLLAMA_TIMEOUT=30000

# ===== CONFIGURACIÓN DE IA =====
AI_PROVIDER=groq
DEFAULT_AI_PROVIDER=groq
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=groq,ollama
AI_ENABLED=true

# ===== OTRAS VARIABLES IMPORTANTES =====
NODE_ENV=production
DATABASE_URL=postgresql://postgres:password@postgres:5432/botwhatsapp
NEXTAUTH_SECRET=tu-secret-super-seguro-cambiar
NEXTAUTH_URL=https://tu-dominio.com

# ===== WHATSAPP =====
WHATSAPP_PROVIDER=baileys
SESSION_PATH=/app/whatsapp-sessions

# ===== NEGOCIO =====
BUSINESS_NAME=Tecnovariedades D&S
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

## 📋 PASO 4: Redesplegar

1. **Guardar** todas las variables
2. **Redesplegar** la app
3. **Esperar** 2-3 minutos

---

## 🔍 PASO 5: Verificar que Funciona

### 5.1 Ver Logs

**En Easypanel** → Tu App → Logs

Buscar:
```
[AI Multi-Provider] 🔄 Orden de fallback: groq,ollama
[AI Multi-Provider] 🔄 Intentando con: groq
[AI Multi-Provider] ✅ Éxito con: groq
```

### 5.2 Probar el Bot

1. **Conectar WhatsApp** desde el dashboard
2. **Enviar mensaje** de prueba
3. **Verificar respuesta** del bot

### 5.3 Probar Fallback

**Simular fallo de Groq** (temporal):

```bash
# Quitar temporalmente GROQ_API_KEY
# El bot debería usar Ollama automáticamente
```

Logs esperados:
```
[AI Multi-Provider] ❌ Error con groq: Invalid API key
[AI Multi-Provider] 🔄 Intentando con: ollama
[AI Multi-Provider] ✅ Éxito con: ollama
```

---

## 🎯 Arquitectura del Sistema

```
Cliente WhatsApp
      ↓
   Tu Bot
      ↓
  AI Service
      ↓
   ┌─────────────┐
   │ 1. GROQ     │ ← Intenta primero (gratis, rápido)
   │ (Principal) │
   └─────────────┘
      ↓ (si falla)
   ┌─────────────┐
   │ 2. OLLAMA   │ ← Fallback automático (local)
   │ (Backup)    │
   └─────────────┘
```

---

## 📊 Comparación de Modelos

### Groq (Principal)

| Modelo | Velocidad | Calidad | Uso |
|--------|-----------|---------|-----|
| `llama-3.1-8b-instant` | ⚡⚡⚡ | ⭐⭐⭐ | Chat rápido |
| `llama-3.1-70b-versatile` | ⚡⚡ | ⭐⭐⭐⭐⭐ | **Recomendado** |
| `mixtral-8x7b-32768` | ⚡⚡ | ⭐⭐⭐⭐ | Alternativa |

### Ollama (Fallback)

| Modelo | RAM | Velocidad | Calidad |
|--------|-----|-----------|---------|
| `phi3` | 2GB | ⚡⚡ | ⭐⭐⭐ |
| `llama3.2` | 4GB | ⚡ | ⭐⭐⭐⭐ |
| `llama3.1` | 8GB | 🐌 | ⭐⭐⭐⭐⭐ |

---

## ⚙️ Configuración Avanzada

### Ajustar Timeouts

```bash
# Si Groq es lento
GROQ_TIMEOUT=15000

# Si Ollama es lento
OLLAMA_TIMEOUT=45000
```

### Cambiar Orden de Fallback

```bash
# Ollama primero, Groq segundo
AI_FALLBACK_ORDER=ollama,groq

# Solo Groq (sin fallback)
AI_FALLBACK_ORDER=groq
AI_FALLBACK_ENABLED=false
```

### Agregar Más Proveedores

```bash
# Groq → Ollama → OpenRouter
AI_FALLBACK_ORDER=groq,ollama,openrouter

# Necesitas agregar:
OPENROUTER_API_KEY=sk-or-v1-tu_key
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
```

---

## ❌ Solución de Problemas

### Error: "GROQ_API_KEY is not defined"

**Solución**:
```bash
# Verificar que la variable esté en Easypanel
# Debe empezar con: gsk_
GROQ_API_KEY=gsk_tu_key_aqui

# Redesplegar después de agregar
```

### Error: "Cannot connect to Ollama"

**Solución**:
```bash
# Verificar que el servicio Ollama esté corriendo
# En Easypanel → Ollama service → Status: Running

# Verificar URL
OLLAMA_URL=http://ollama:11434

# Probar conexión
curl http://ollama:11434/api/tags
```

### Error: "Model not found"

**Solución**:
```bash
# Instalar el modelo en Ollama
docker exec -it ollama ollama pull llama3.2

# Verificar modelos instalados
docker exec -it ollama ollama list
```

### Bot no responde

**Checklist**:
- [ ] `AI_ENABLED=true`
- [ ] `GROQ_API_KEY` configurada
- [ ] `AI_FALLBACK_ORDER=groq,ollama`
- [ ] Servicio Ollama corriendo
- [ ] Modelo instalado en Ollama
- [ ] WhatsApp conectado
- [ ] App redesplegada

---

## 📈 Monitoreo

### Ver qué proveedor está usando

**En los logs**:
```bash
# Usando Groq
[AI Multi-Provider] ✅ Éxito con: groq

# Usando Ollama (fallback)
[AI Multi-Provider] ❌ Error con groq
[AI Multi-Provider] ✅ Éxito con: ollama
```

### Estadísticas de Uso

```bash
# Ver logs en tiempo real
# Easypanel → Tu App → Logs → Live

# Contar usos de cada proveedor
grep "Éxito con: groq" logs.txt | wc -l
grep "Éxito con: ollama" logs.txt | wc -l
```

---

## 🎯 Configuración Recomendada Final

```bash
# ===== IA: GROQ + OLLAMA =====
GROQ_API_KEY=gsk_tu_key_aqui
GROQ_MODEL=llama-3.1-70b-versatile
GROQ_MAX_TOKENS=1000
GROQ_TIMEOUT=10000

OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2
OLLAMA_TIMEOUT=30000

AI_PROVIDER=groq
DEFAULT_AI_PROVIDER=groq
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=groq,ollama
AI_ENABLED=true

# ===== BASE DE DATOS =====
DATABASE_URL=postgresql://postgres:password@postgres:5432/botwhatsapp

# ===== AUTENTICACIÓN =====
NEXTAUTH_SECRET=cambiar-por-secret-seguro
NEXTAUTH_URL=https://tu-dominio.com

# ===== WHATSAPP =====
WHATSAPP_PROVIDER=baileys
SESSION_PATH=/app/whatsapp-sessions

# ===== NEGOCIO =====
BUSINESS_NAME=Tecnovariedades D&S
BOT_NAME=Smart Sales Bot
BOT_LANGUAGE=es

# ===== CARACTERÍSTICAS =====
PHOTOS_ENABLED=true
AUDIO_ENABLED=true
HOT_RELOAD_ENABLED=true
```

---

## ✅ Checklist de Implementación

### Groq
- [ ] Cuenta creada en console.groq.com
- [ ] API Key obtenida (gsk_...)
- [ ] Variable `GROQ_API_KEY` agregada
- [ ] Modelo configurado: `llama-3.1-70b-versatile`

### Ollama
- [ ] Servicio Ollama creado en Easypanel
- [ ] Puerto 11434 expuesto
- [ ] Modelo `llama3.2` instalado
- [ ] Variable `OLLAMA_URL` configurada

### Configuración
- [ ] `AI_FALLBACK_ORDER=groq,ollama`
- [ ] `AI_ENABLED=true`
- [ ] Todas las variables agregadas
- [ ] App redesplegada

### Verificación
- [ ] Logs muestran "✅ Éxito con: groq"
- [ ] Bot responde en WhatsApp
- [ ] Fallback funciona (probado)

---

## 🚀 Resultado Final

**Sistema de IA con:**
- ✅ Groq como principal (gratis, rápido)
- ✅ Ollama como fallback (local, confiable)
- ✅ Fallback automático si Groq falla
- ✅ 100% funcional en Easypanel
- ✅ Sin costos de IA
- ✅ Alta disponibilidad

**¡Tu bot está listo para producción!** 🎉

---

**Fecha**: 2 de noviembre, 2025  
**Estado**: Listo para implementar  
**Tiempo estimado**: 15 minutos  
**Costo**: $0 (100% gratis)
