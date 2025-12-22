# 🤖 CONFIGURAR OLLAMA COMO IA PRINCIPAL (GRATIS)

## 🎯 ¿POR QUÉ OLLAMA?

- ✅ **100% GRATIS** - Sin límites de uso
- ✅ **Local** - No depende de internet
- ✅ **Rápido** - Respuestas en segundos
- ✅ **Privado** - Datos no salen de tu servidor
- ❌ Groq - Tiene límites de API (6000 tokens/min)

## 📊 PRIORIDAD DEL SISTEMA

```
1️⃣ Ollama (Local, GRATIS) ← PRINCIPAL
    ↓ (si falla)
2️⃣ Groq (Cloud, con límites) ← FALLBACK
    ↓ (si falla)
3️⃣ Plantillas locales ← ÚLTIMO RECURSO
```

## 🚀 INSTALACIÓN DE OLLAMA

### Windows:
```bash
# Descargar desde: https://ollama.ai/download
# O usar winget:
winget install Ollama.Ollama
```

### Linux:
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### macOS:
```bash
brew install ollama
```

## 📦 INSTALAR MODELO RECOMENDADO

```bash
# Modelo ligero y rápido (3B parámetros)
ollama pull llama3.2:3b

# O modelo más potente (8B parámetros)
ollama pull llama3.1:8b
```

## ▶️ INICIAR OLLAMA

```bash
# Iniciar servidor Ollama
ollama serve
```

**IMPORTANTE:** Deja esta terminal abierta mientras el bot esté corriendo.

## ✅ VERIFICAR QUE FUNCIONA

```bash
# 1. Verificar que Ollama está corriendo
curl http://localhost:11434/api/tags

# Debe responder con lista de modelos instalados

# 2. Probar generación de texto
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Hola, ¿cómo estás?",
  "stream": false
}'
```

## ⚙️ CONFIGURACIÓN EN .ENV

```bash
# Ollama (opcional, usa valores por defecto)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b

# Groq (solo como fallback)
GROQ_API_KEY=tu_api_key_aqui
```

## 🧪 PROBAR EL SISTEMA

```bash
# 1. Ejecutar test
npx tsx scripts/test-bot-usa-bd-ollama.ts

# Debe mostrar:
# ✅ Ollama disponible
# ✅ Modelos: llama3.2:3b
# ✅ Sistema híbrido: Funcionando

# 2. Reiniciar bot
npm run dev

# Debe mostrar:
# [Baileys] ✅ Ollama disponible (GRATIS)
# [Baileys] 🎯 Prioridad: 1️⃣ Ollama → 2️⃣ Groq → 3️⃣ Plantillas
```

## 📊 LOGS ESPERADOS

Cuando el bot procesa un mensaje:

```
✅ [OllamaFirst] 🤖 Intentando con Ollama (local, gratis)...
✅ [OllamaFirst] ✅ Respuesta generada con Ollama
✅ [Baileys] ✅ Respuesta generada con sistema híbrido (BD + IA)
```

Si Ollama no está disponible:

```
⚠️ [OllamaFirst] ⚠️ Ollama no disponible: Connection refused
⚠️ [OllamaFirst] 🌐 Usando Groq como fallback...
✅ [OllamaFirst] ✅ Respuesta generada con Groq (fallback)
```

## 🔧 SOLUCIÓN DE PROBLEMAS

### Problema 1: "Connection refused"

```bash
# Verificar que Ollama está corriendo
ps aux | grep ollama

# Si no está corriendo, iniciarlo
ollama serve
```

### Problema 2: "Model not found"

```bash
# Listar modelos instalados
ollama list

# Si no está el modelo, instalarlo
ollama pull llama3.2:3b
```

### Problema 3: Ollama muy lento

```bash
# Usar modelo más ligero
ollama pull llama3.2:1b

# Actualizar .env
OLLAMA_MODEL=llama3.2:1b
```

### Problema 4: Puerto ocupado

```bash
# Cambiar puerto de Ollama
OLLAMA_HOST=0.0.0.0:11435 ollama serve

# Actualizar .env
OLLAMA_URL=http://localhost:11435
```

## 💰 COMPARACIÓN DE COSTOS

| Proveedor | Costo | Límites | Velocidad |
|-----------|-------|---------|-----------|
| **Ollama** | 🆓 GRATIS | ∞ Sin límites | ⚡ Rápido (local) |
| Groq | 🆓 Gratis con límites | 6000 tokens/min | ⚡⚡ Muy rápido |
| OpenAI | 💰 $0.002/1K tokens | Según plan | ⚡ Medio |
| Claude | 💰 $0.003/1K tokens | Según plan | ⚡ Medio |

## 🎯 RECOMENDACIÓN

**Para producción:**
1. Usa Ollama como principal (gratis, sin límites)
2. Configura Groq como fallback (por si Ollama falla)
3. Las plantillas locales son el último recurso

**Ventajas:**
- ✅ 99% de las respuestas serán con Ollama (gratis)
- ✅ Solo usarás Groq si Ollama falla (raro)
- ✅ Nunca te quedarás sin respuestas

## 📝 CHECKLIST FINAL

- [ ] Ollama instalado
- [ ] Modelo descargado (`ollama pull llama3.2:3b`)
- [ ] Ollama corriendo (`ollama serve`)
- [ ] Variables en .env configuradas
- [ ] Test ejecutado exitosamente
- [ ] Bot reiniciado
- [ ] Logs muestran "Ollama disponible (GRATIS)"

## 🚀 SIGUIENTE PASO

Una vez configurado Ollama:

```bash
# Reiniciar el bot
npm run dev

# Probar con WhatsApp
# Enviar: "busco un portátil para diseño"

# Verificar logs:
# Debe usar Ollama (no Groq)
```

---

**Fecha:** 25 de noviembre de 2025  
**Estado:** ✅ Ollama configurado como IA principal  
**Costo:** 🆓 100% GRATIS
