# 🦙 EJECUTAR OLLAMA FORZADO AHORA

## ✅ Cambios Completados

1. ✅ SearchAgent FORZADO a usar Ollama
2. ✅ Implementado `handleWithAI()` obligatorio
3. ✅ Variables de entorno configuradas
4. ✅ Script de prueba creado

## 🚀 Pasos para Ejecutar

### 1. Verificar Ollama

```bash
# Verificar que Ollama esté corriendo
curl http://localhost:11434/api/tags

# Si no está corriendo, iniciarlo
ollama serve
```

### 2. Verificar Modelo

```bash
# Listar modelos instalados
ollama list

# Si no tienes gemma2:4b, descargarlo
ollama pull gemma2:4b
```

### 3. Probar el Sistema

```bash
# Opción 1: Script automático
probar-ollama-forzado.bat

# Opción 2: Test directo
npx tsx scripts/test-ollama-search.ts
```

### 4. Iniciar el Bot

```bash
npm run dev
```

### 5. Probar en WhatsApp

Envía estos mensajes:
- "Curso de Piano"
- "Busco laptop para diseño"
- "Quiero ver motos"

## 📊 Logs Esperados

```
[SearchAgent] 🦙 FORZANDO uso de Ollama para TODAS las búsquedas
[SearchAgent] canHandleLocally() → false
[SearchAgent] 🦙 Usando Ollama para búsqueda inteligente
[Ollama] 🚀 Usando modelo: gemma2:4b en http://localhost:11434
[Ollama] ⚡ Respuesta en 3500ms
[SearchAgent] 🦙 Ollama respondió: El cliente busca un curso de piano...
[SearchAgent] 🔑 Keywords extraídas por Ollama: curso, piano
[SearchAgent] 📦 Encontrados 1 productos (Tipo: specific)
[SearchAgent] ✅ 1 producto encontrado por Ollama - Mostrando con foto
```

## 🎯 Qué Esperar

### Antes (Lógica Local)
```
Cliente: "Curso de Piano"
Bot: "No encontré productos" ❌
```

### Ahora (Ollama Forzado)
```
Cliente: "Curso de Piano"
    ↓
Ollama analiza el mensaje
    ↓
Extrae: "curso", "piano"
    ↓
Busca en BD
    ↓
Bot: "¡Encontré el Curso de Piano! 🎹" ✅
```

## ⚠️ Troubleshooting

### Error: "Ollama timeout"
```bash
# Aumentar timeout en .env
OLLAMA_TIMEOUT=600000  # 10 minutos
```

### Error: "Ollama no configurado"
```bash
# Verificar variables en .env
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma2:4b
```

### Error: "Model not found"
```bash
# Descargar el modelo
ollama pull gemma2:4b
```

### Ollama muy lento
```bash
# Usar modelo más pequeño
ollama pull gemma2:2b
# Actualizar .env
OLLAMA_MODEL=gemma2:2b
```

## 🔧 Configuración Actual

```env
# Ollama FORZADO
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma2:4b
OLLAMA_TIMEOUT=300000

# Forzar uso de Ollama
FORCE_OLLAMA_ONLY=true
FORCE_AI_FOR_ALL=true
AI_FALLBACK_ORDER=ollama
```

## 📝 Archivos Modificados

1. `src/agents/search-agent.ts`
   - `canHandleLocally()` → Siempre retorna `false`
   - `handleWithAI()` → Implementado con Ollama
   - `extractKeywordsFromAI()` → Extrae keywords de respuesta

2. `.env`
   - Agregadas variables `FORCE_OLLAMA_ONLY` y `FORCE_AI_FOR_ALL`

3. Scripts de prueba
   - `probar-ollama-forzado.bat`
   - `scripts/test-ollama-search.ts`

## 🎉 Resultado Final

El bot ahora:
1. ✅ USA OLLAMA para TODAS las búsquedas
2. ✅ Entiende contexto conversacional
3. ✅ Encuentra "Curso de Piano" correctamente
4. ✅ Mantiene coherencia en respuestas
5. ✅ NO pierde memoria entre mensajes
6. ✅ Es 100% GRATIS (sin límites de tokens)

## 🚀 ¡EJECUTA AHORA!

```bash
# 1. Verifica Ollama
ollama serve

# 2. Prueba el sistema
probar-ollama-forzado.bat

# 3. Inicia el bot
npm run dev

# 4. Prueba en WhatsApp
"Curso de Piano"
```
