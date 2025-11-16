# 🚀 Inicio Rápido SIN Docker (Windows)

## ⚠️ Problema Detectado

Docker Desktop no está corriendo o no está instalado. No te preocupes, puedes usar el sistema **sin Docker**.

## ✅ Solución: Instalación Local

### Opción 1: Solo Generación de Dataset (Recomendado para empezar)

No necesitas Core AI para generar el dataset. Solo necesitas:

1. **Node.js** (ya lo tienes ✅)
2. **Groq API** o **Ollama**

```bash
# 1. Configurar Groq API
# En tu .env:
GROQ_API_KEY=tu_api_key_aqui

# 2. Generar dataset
npx tsx scripts/generar-dataset-completo.ts

# Esto generará:
# - data/training/dataset_completo_*.json
# - data/training/intent_training.txt
# - data/training/conversations.jsonl
# - data/training/qdrant_documents.json
```

**Tiempo**: 30-60 minutos  
**Resultado**: 1,000+ conversaciones listas para entrenar

### Opción 2: Usar Ollama Local (Sin Docker)

Si tienes Ollama instalado localmente:

```bash
# 1. Verificar Ollama
ollama list

# 2. Si no tienes el modelo, descargarlo
ollama pull gemma2:27b

# 3. Generar dataset (usará Ollama automáticamente)
npx tsx scripts/generar-dataset-completo.ts
```

### Opción 3: Instalar Python Local (Para Core AI)

Si quieres el sistema completo sin Docker:

#### Paso 1: Instalar Python 3.11

```bash
# Descargar de: https://www.python.org/downloads/
# Asegúrate de marcar "Add Python to PATH"
```

#### Paso 2: Crear entorno virtual

```bash
cd ai-local-system/core-ai

# Crear entorno virtual
python -m venv venv

# Activar (Windows)
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

#### Paso 3: Iniciar Core AI

```bash
# Entrenar modelo inicial
python scripts/train_intent.py

# Cargar KB
python scripts/load_kb.py

# Iniciar servidor
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### Paso 4: Instalar Qdrant Local

```bash
# Opción A: Descargar binario
# https://github.com/qdrant/qdrant/releases

# Opción B: Usar Docker solo para Qdrant
docker run -p 6333:6333 qdrant/qdrant:latest

# Opción C: Usar FAISS en lugar de Qdrant (sin servidor)
# Modificar código para usar FAISS local
```

## 🎯 Recomendación para Windows

### Plan Simplificado (Sin Docker):

```bash
# 1. Solo generar dataset con Groq
npx tsx scripts/generar-dataset-completo.ts

# 2. Usar el dataset para entrenar tu sistema actual
# El dataset se puede usar con:
# - Tu sistema actual de Ollama
# - Groq API
# - Cualquier otro LLM
```

### Ventajas:
- ✅ No necesitas Docker
- ✅ No necesitas instalar Python
- ✅ Solo usas Node.js (que ya tienes)
- ✅ Generas 1,000+ conversaciones realistas
- ✅ Puedes usar el dataset como quieras

## 📝 Script Simplificado para Windows

Voy a crear un script que funcione sin Docker:
