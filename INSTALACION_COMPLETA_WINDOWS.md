# 🪟 Instalación Completa en Windows

## 📋 Dos Opciones Disponibles

### Opción 1: Solo Generación de Dataset (Más Rápido)
- ✅ Solo Node.js (ya lo tienes)
- ✅ Groq API (gratis)
- ⏱️ Tiempo: 5 minutos
- 📦 Genera 1,000+ conversaciones

### Opción 2: Sistema Completo con Core AI (Recomendado)
- ✅ Node.js (ya lo tienes)
- ✅ Python 3.11
- ✅ Dependencias Python
- ✅ Groq API (gratis)
- ⏱️ Tiempo: 20-30 minutos
- 🧠 Sistema neuronal completo

---

## 🚀 OPCIÓN 1: Solo Generación de Dataset

### Paso 1: Configurar Groq API (2 min)

```bash
# 1. Ir a: https://console.groq.com/
# 2. Crear cuenta gratis
# 3. Obtener API key
# 4. Agregar a .env:
GROQ_API_KEY=gsk_tu_api_key_aqui
```

### Paso 2: Generar Dataset (30-60 min)

```bash
# Ejecutar generador
scripts\generar-dataset-simple.bat
```

**¡Listo!** Tendrás 1,000+ conversaciones en `data/training/`

---

## 🧠 OPCIÓN 2: Sistema Completo con Core AI

### Paso 1: Instalar Python 3.11 (5 min)

#### Descargar Python

1. Ir a: https://www.python.org/downloads/
2. Descargar **Python 3.11.x** (no 3.12, usar 3.11)
3. **IMPORTANTE**: Marcar "Add Python to PATH"
4. Instalar

#### Verificar Instalación

```bash
# Abrir CMD y verificar
python --version
# Debe mostrar: Python 3.11.x

pip --version
# Debe mostrar: pip 23.x.x
```

### Paso 2: Instalar Dependencias Python (10 min)

```bash
# Ir a la carpeta del Core AI
cd ai-local-system\core-ai

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual (Windows)
venv\Scripts\activate

# Deberías ver (venv) al inicio de la línea

# Actualizar pip
python -m pip install --upgrade pip

# Instalar dependencias
pip install -r requirements.txt
```

**Nota**: Esto instalará ~30 paquetes, puede tomar 5-10 minutos.

#### Posibles Errores y Soluciones

**Error: "Microsoft Visual C++ 14.0 is required"**

```bash
# Solución: Instalar Build Tools
# Descargar de: https://visualstudio.microsoft.com/visual-cpp-build-tools/
# Instalar "Desktop development with C++"
```

**Error: "torch" no se instala**

```bash
# Instalar PyTorch manualmente (CPU version)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

**Error: "fasttext-wheel" no se instala**

```bash
# Instalar fasttext alternativo
pip install fasttext
```

### Paso 3: Entrenar Modelo Inicial (2 min)

```bash
# Asegúrate de estar en ai-local-system\core-ai con (venv) activo

# Entrenar clasificador de intenciones
python scripts/train_intent.py

# Deberías ver:
# ✅ Modelo guardado en: /app/models/intent_ft.bin
```

### Paso 4: Cargar Base de Conocimiento (1 min)

```bash
# Cargar KB inicial
python scripts/load_kb.py

# Deberías ver:
# ✅ Base de conocimiento cargada correctamente!
```

### Paso 5: Iniciar Core AI Server (1 min)

```bash
# Iniciar servidor FastAPI
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Deberías ver:
# INFO:     Uvicorn running on http://0.0.0.0:8000
# ✅ Core AI Service iniciado correctamente
```

**Dejar esta ventana abierta** (servidor corriendo)

### Paso 6: Probar Core AI (1 min)

Abrir **nueva ventana CMD**:

```bash
# Health check
curl http://localhost:8000/health

# Debería responder:
# {"status":"healthy","timestamp":"...","services":{...}}

# Test query
curl -X POST http://localhost:8000/query ^
  -H "Content-Type: application/json" ^
  -d "{\"user_id\":\"test\",\"text\":\"Hola\"}"

# Debería responder con intent y reply
```

### Paso 7: Instalar Qdrant (Opcional - 5 min)

#### Opción A: Qdrant con Docker (Si tienes Docker)

```bash
docker run -d -p 6333:6333 -p 6334:6334 ^
  -v qdrant_storage:/qdrant/storage ^
  qdrant/qdrant:latest
```

#### Opción B: Qdrant Binario (Sin Docker)

```bash
# 1. Descargar de: https://github.com/qdrant/qdrant/releases
# 2. Descargar: qdrant-x86_64-pc-windows-msvc.zip
# 3. Extraer y ejecutar: qdrant.exe
```

#### Opción C: Sin Qdrant (Usar FAISS local)

Si no quieres instalar Qdrant, el sistema puede funcionar sin él usando FAISS (ya incluido en requirements.txt).

### Paso 8: Generar Dataset Completo (30-60 min)

Abrir **nueva ventana CMD**:

```bash
# Volver a la raíz del proyecto
cd C:\davey\bot-whatsapp

# Configurar Groq API en .env
# GROQ_API_KEY=gsk_tu_api_key_aqui

# Generar dataset
npx tsx scripts/generar-dataset-completo.ts
```

### Paso 9: Entrenar Red Neuronal (10-20 min)

```bash
# Entrenar con el dataset generado
npx tsx scripts/entrenar-red-neuronal-completa.ts
```

---

## 📝 Script de Instalación Automática

Voy a crear un script que haga todo automáticamente:

