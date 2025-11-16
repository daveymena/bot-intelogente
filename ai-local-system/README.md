# 🧠 Sistema de IA Local - Tecnovariedades D&S

Sistema híbrido de inteligencia artificial local para ventas, soporte y servicios por WhatsApp.

## 🎯 Características

- ✅ **100% Local** - Sin dependencias de APIs externas (OpenAI, Groq, etc)
- 🧠 **Mini-LLM Integrado** - Modelo 0.5B-2B parámetros (Qwen, Phi, TinyLlama)
- 🔍 **RAG Semántico** - Embeddings + Qdrant para búsqueda inteligente
- 🎭 **Motor de Reglas** - Lógica de negocio para ventas, citas, fiados
- 📚 **Base de Conocimiento** - KB entrenable con productos, FAQs, procedimientos
- 🔄 **Auto-entrenamiento** - Aprende de conversaciones reales 24/7
- 🚀 **Despliegue Fácil** - Docker Compose + EasyPanel ready

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    WHATSAPP (Baileys)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              Gateway WhatsApp (Node.js)                     │
│  - Recibe mensajes                                          │
│  - Maneja sesiones                                          │
│  - Ejecuta acciones (pagos, reservas)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│           Core AI Service (Python FastAPI)                  │
│  ┌──────────────────────────────────────────────┐          │
│  │ 1. Intent Classifier (fastText/NN)           │          │
│  │ 2. Query Encoder (MiniLM embeddings)         │          │
│  │ 3. Retriever (Qdrant/FAISS)                  │          │
│  │ 4. Rules Engine (transacciones)              │          │
│  │ 5. Mini-LLM Rewriter (Qwen/Phi)              │          │
│  │ 6. Template Filler (respuestas)              │          │
│  └──────────────────────────────────────────────┘          │
└────────────┬───────────────────────┬────────────────────────┘
             │                       │
┌────────────▼──────────┐  ┌────────▼─────────────────────────┐
│  PostgreSQL           │  │  Qdrant Vector DB                │
│  - Productos          │  │  - Embeddings KB                 │
│  - Órdenes            │  │  - Embeddings catálogo           │
│  - Citas              │  │  - Búsqueda semántica            │
│  - Conversaciones     │  └──────────────────────────────────┘
└───────────────────────┘
```

## 📦 Servicios

### 1. Core AI Service (Python)
- **Puerto**: 8000
- **Función**: Motor de IA principal
- **Componentes**:
  - Intent Classifier (fastText)
  - Embeddings (sentence-transformers)
  - Vector Search (Qdrant)
  - Mini-LLM (transformers 4bit)
  - Rules Engine

### 2. Gateway WhatsApp (Node.js)
- **Puerto**: 4000
- **Función**: Integración con WhatsApp
- **Componentes**:
  - Baileys client
  - Session manager
  - Action executor

### 3. Dashboard Frontend (React)
- **Puerto**: 3000
- **Función**: Panel de administración
- **Componentes**:
  - Gestión de KB
  - Logs de conversaciones
  - Métricas y analytics
  - Configuración de plantillas

### 4. PostgreSQL
- **Puerto**: 5432
- **Función**: Base de datos principal

### 5. Qdrant
- **Puerto**: 6333
- **Función**: Base de datos vectorial

## 🚀 Inicio Rápido

### Requisitos
- Docker & Docker Compose
- 4GB RAM mínimo (8GB recomendado)
- 10GB espacio en disco

### Instalación

```bash
# 1. Clonar repositorio
cd ai-local-system

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Iniciar servicios
docker-compose up -d

# 4. Cargar base de conocimiento inicial
docker-compose exec core-ai python scripts/load_kb.py

# 5. Entrenar intent classifier
docker-compose exec core-ai python scripts/train_intent.py

# 6. Crear embeddings
docker-compose exec core-ai python scripts/create_embeddings.py
```

### Verificar instalación

```bash
# Health check
curl http://localhost:8000/health

# Test query
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "text": "¿Cuánto cuesta el Macbook?"}'
```

## 📚 Uso

### Conectar WhatsApp

1. Acceder al dashboard: http://localhost:3000
2. Ir a "Conexión WhatsApp"
3. Escanear código QR
4. ¡Listo! El bot responderá automáticamente

### Agregar productos al catálogo

```bash
# Importar desde JSON
docker-compose exec core-ai python scripts/import_catalog.py \
  --file /data/productos.json

# Crear embeddings automáticamente
docker-compose exec core-ai python scripts/reindex_catalog.py
```

### Entrenar con conversaciones reales

```bash
# El sistema auto-entrena cada 24h
# Para forzar entrenamiento manual:
docker-compose exec core-ai python scripts/train_from_logs.py
```

## 🎓 Entrenamiento Continuo

El sistema aprende automáticamente de:
- ✅ Conversaciones exitosas (venta completada)
- ✅ Preguntas frecuentes nuevas
- ✅ Correcciones manuales desde dashboard
- ✅ Feedback de usuarios

### Pipeline de entrenamiento

```
Conversación → Log → Extracción → Validación → Dataset → Re-entrenamiento
```

## 🔧 Configuración

### Variables de entorno principales

```env
# Core AI
AI_MODEL=Qwen/Qwen2.5-0.5B-Instruct
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
INTENT_MODEL_PATH=/models/intent_ft.bin

# Vector DB
QDRANT_HOST=qdrant
QDRANT_PORT=6333

# Database
DATABASE_URL=postgresql://user:pass@postgres:5432/tecnovariedades

# WhatsApp
WHATSAPP_SESSION_PATH=/sessions
```

## 📊 Métricas y Monitoreo

- **Latencia promedio**: 50-150ms por query
- **Accuracy intent**: >95%
- **Recall@5 retriever**: >90%
- **Memoria RAM**: 2-4GB
- **CPU**: 2 cores recomendado

## 🎯 Casos de Uso

### 1. Ventas de Tecnología
```
Usuario: "Necesito un portátil para diseño gráfico"
Bot: "Te recomiendo el Macbook Pro M4 16GB ($4.500.000) o el Dell XPS 15 
     ($3.800.000). Ambos excelentes para diseño. ¿Cuál prefieres?"
```

### 2. Dropshipping
```
Usuario: "Quiero el reloj smartwatch"
Bot: "Perfecto! ETA 5-7 días. Necesito:
     - Nombre completo
     - Dirección de envío
     - Teléfono
     Total: $180.000 + envío $15.000"
```

### 3. Agendamiento de Citas
```
Usuario: "Quiero cita para corte de cabello"
Bot: "Horarios disponibles mañana:
     1. 10:00 AM
     2. 2:00 PM
     3. 4:00 PM
     ¿Cuál prefieres?"
```

### 4. Fiados
```
Usuario: "Necesito fiado de $50.000"
Bot: "Hola María! Tu historial es excelente.
     Aprobado: $50.000
     Fecha límite: 30 Nov
     ¿Confirmas?"
```

## 🛠️ Desarrollo

### Estructura del proyecto

```
ai-local-system/
├── core-ai/              # Servicio Python de IA
│   ├── app/
│   │   ├── main.py       # FastAPI app
│   │   ├── intent.py     # Intent classifier
│   │   ├── embeddings.py # Encoder
│   │   ├── retriever.py  # RAG
│   │   ├── rules.py      # Motor de reglas
│   │   ├── llm.py        # Mini-LLM
│   │   └── templates.py  # Template filler
│   ├── models/           # Modelos entrenados
│   ├── scripts/          # Scripts de entrenamiento
│   └── requirements.txt
│
├── gateway-whatsapp/     # Gateway Node.js
│   ├── src/
│   │   ├── index.ts
│   │   ├── baileys.ts
│   │   ├── ai-client.ts
│   │   └── actions.ts
│   └── package.json
│
├── dashboard/            # Frontend React
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── api/
│   └── package.json
│
├── data/                 # Datos y KB
│   ├── kb/              # Base de conocimiento
│   ├── training/        # Datasets de entrenamiento
│   └── catalog/         # Catálogo de productos
│
├── docker-compose.yml
└── README.md
```

## 🚢 Despliegue en EasyPanel

1. Crear nueva aplicación
2. Conectar repositorio Git
3. Configurar variables de entorno
4. Deploy automático

Ver: [EASYPANEL_DEPLOY.md](./EASYPANEL_DEPLOY.md)

## 📖 Documentación

- [Arquitectura Detallada](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Guía de Entrenamiento](./docs/TRAINING.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)

## 🤝 Contribuir

Este es un sistema privado para Tecnovariedades D&S.

## 📄 Licencia

Propietario - Tecnovariedades D&S © 2025
