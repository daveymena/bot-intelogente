# 🚀 GUÍA - ENTRENAMIENTO GROQ + OLLAMA

**Objetivo**: Entrenar rápidamente con Groq y preparar datos para Ollama

---

## 📋 FLUJO DE ENTRENAMIENTO

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. GROQ (Rápido)                                          │
│     ├─ Analiza cada producto                              │
│     ├─ Genera descripciones mejoradas                     │
│     ├─ Clasifica por categoría                            │
│     ├─ Extrae palabras clave                              │
│     └─ Detecta intenciones                                │
│                                                             │
│  2. PREPARACIÓN PARA OLLAMA                               │
│     ├─ Convierte datos a formato Ollama                   │
│     ├─ Genera contexto de búsqueda                        │
│     ├─ Crea ejemplos de entrenamiento                     │
│     └─ Prepara embeddings                                 │
│                                                             │
│  3. OLLAMA (Mejora)                                        │
│     ├─ Genera embeddings semánticos                       │
│     ├─ Mejora descripciones                               │
│     ├─ Optimiza búsqueda                                  │
│     └─ Refina respuestas                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 INICIO RÁPIDO

### Opción 1: Ejecutar Todo Automáticamente
```bash
ejecutar-entrenamiento-completo.bat
```

Esto ejecutará:
1. Entrenamiento con Groq
2. Preparación para Ollama
3. Generación de reportes

**Tiempo**: 10-15 minutos

---

### Opción 2: Ejecutar Paso a Paso

#### Paso 1: Entrenamiento con Groq
```bash
node entrenamiento-rapido-groq.js
```

**Qué hace**:
- Analiza 68 productos
- Genera descripciones mejoradas
- Clasifica por categoría
- Extrae palabras clave
- Detecta intenciones

**Genera**:
- `training-data-groq.json`
- `training-report-groq.json`

**Tiempo**: 5-10 minutos

#### Paso 2: Preparar para Ollama
```bash
node preparar-datos-ollama.js
```

**Qué hace**:
- Convierte datos a formato Ollama
- Genera contexto de búsqueda
- Crea ejemplos de entrenamiento
- Prepara embeddings

**Genera**:
- `ollama-training-data.json`
- `search-context.json`
- `training-examples.json`
- `ollama-training-report.json`

**Tiempo**: 1-2 minutos

---

## 📊 ARCHIVOS GENERADOS

### Archivos de Groq

**training-data-groq.json**
```json
{
  "generatedAt": "2025-11-15T...",
  "totalProducts": 68,
  "products": [
    {
      "id": 1,
      "nombre": "Laptop Dell XPS 13",
      "categoria": "Laptop",
      "precio": 1500000,
      "descripcion": "...",
      "keywords": ["laptop", "dell", "xps", "portátil", "ultrabook"],
      "intent": "recommendation",
      "ejemplos": [...]
    }
  ],
  "categories": ["Laptop", "Moto", "Curso", ...],
  "keywords": ["laptop", "moto", "curso", ...],
  "intents": {
    "search": [...],
    "recommendation": [...],
    "price_inquiry": [...],
    "purchase_intent": [...]
  }
}
```

**training-report-groq.json**
```json
{
  "generatedAt": "2025-11-15T...",
  "totalProducts": 68,
  "categories": ["Laptop", "Moto", "Curso", ...],
  "keywords": ["laptop", "moto", "curso", ...],
  "intents": {
    "search": 20,
    "recommendation": 15,
    "price_inquiry": 18,
    "purchase_intent": 15
  },
  "stats": {
    "totalProducts": 68,
    "processed": 68,
    "errors": 0,
    "successRate": "100%"
  }
}
```

### Archivos para Ollama

**ollama-training-data.json**
```json
{
  "version": "1.0",
  "generatedAt": "2025-11-15T...",
  "source": "Groq Training",
  "documents": [
    {
      "id": 1,
      "title": "Laptop Dell XPS 13",
      "category": "Laptop",
      "price": 1500000,
      "content": "Producto: Laptop Dell XPS 13\nCategoría: Laptop\n...",
      "metadata": {
        "keywords": ["laptop", "dell", "xps", ...],
        "intent": "recommendation",
        "ejemplos": [...]
      }
    }
  ],
  "metadata": {
    "totalProducts": 68,
    "categories": [...],
    "keywords": [...]
  }
}
```

**search-context.json**
```json
{
  "categories": {
    "Laptop": [
      {
        "nombre": "Laptop Dell XPS 13",
        "precio": 1500000,
        "keywords": ["laptop", "dell", "xps", ...]
      }
    ]
  },
  "keywords": {
    "laptop": ["Laptop Dell XPS 13", "Laptop HP Pavilion", ...],
    "moto": ["Moto Honda CB 500", "Moto Yamaha YZF", ...]
  },
  "intents": {
    "search": ["Laptop Dell XPS 13", ...],
    "recommendation": ["Moto Honda CB 500", ...],
    "price_inquiry": [...],
    "purchase_intent": [...]
  }
}
```

**training-examples.json**
```json
{
  "search": [
    {
      "query": "¿Tienes Laptop Dell XPS 13?",
      "response": "Sí, tenemos Laptop Dell XPS 13 a $1500000",
      "product": "Laptop Dell XPS 13"
    }
  ],
  "recommendation": [
    {
      "query": "¿Qué laptop me recomiendas?",
      "response": "Te recomiendo Laptop Dell XPS 13. ...",
      "product": "Laptop Dell XPS 13"
    }
  ],
  "price_inquiry": [...],
  "purchase_intent": [...]
}
```

---

## 🔍 INTERPRETACIÓN DE RESULTADOS

### Categorías Identificadas
```
Laptop: 15 productos
Moto: 12 productos
Curso: 18 productos
Megapack: 15 productos
Accesorio: 8 productos
```

### Palabras Clave Principales
```
laptop: 15 productos
moto: 12 productos
curso: 18 productos
digital: 10 productos
online: 8 productos
```

### Intenciones Detectadas
```
search: 20 productos
recommendation: 15 productos
price_inquiry: 18 productos
purchase_intent: 15 productos
```

---

## 🎯 PRÓXIMOS PASOS

### 1. Revisar Datos Generados
```bash
# Ver datos de Groq
type training-data-groq.json

# Ver contexto de búsqueda
type search-context.json

# Ver ejemplos de entrenamiento
type training-examples.json
```

### 2. Usar con Ollama
```bash
# Cargar datos en Ollama
ollama run llama2 < ollama-training-data.json

# Generar embeddings
ollama embed ollama-training-data.json

# Mejorar descripciones
ollama run llama2 "Mejora esta descripción: ..."
```

### 3. Integrar en el Bot
```bash
# Actualizar training-data.ts
# Usar search-context.json para búsqueda
# Usar training-examples.json para respuestas
```

---

## ⚙️ CONFIGURACIÓN

### Variables de Entorno Requeridas
```bash
# Groq API Key (REQUERIDO)
set GROQ_API_KEY=tu_clave_aqui

# Ollama (OPCIONAL)
set OLLAMA_HOST=http://localhost:11434
```

### Modelos Utilizados
```
Groq:
  - mixtral-8x7b-32768 (Descripción y categorización)
  - mixtral-8x7b-32768 (Palabras clave)

Ollama (próximo):
  - llama2 (Embeddings)
  - mistral (Mejora de descripciones)
```

---

## 📈 ESTADÍSTICAS ESPERADAS

```
Productos procesados: 68/68 (100%)
Categorías identificadas: 5
Palabras clave únicas: 150+
Intenciones detectadas: 4
Ejemplos de entrenamiento: 270+
Tiempo total: 10-15 minutos
```

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Problema: "GROQ_API_KEY no configurada"
**Solución**:
```bash
set GROQ_API_KEY=tu_clave_aqui
ejecutar-entrenamiento-completo.bat
```

### Problema: "Error de conexión a Groq"
**Solución**:
- Verificar que la API key sea válida
- Verificar conexión a internet
- Reintentar en unos minutos

### Problema: "Archivo no encontrado"
**Solución**:
- Verificar que `catalogo-completo-68-productos.json` existe
- Ejecutar desde el directorio correcto

### Problema: "Proceso lento"
**Solución**:
- Es normal, Groq procesa cada producto
- Tiempo estimado: 5-10 minutos
- No interrumpir el proceso

---

## 📊 MONITOREO

### Ver Progreso
```bash
# En tiempo real
node entrenamiento-rapido-groq.js

# Ver archivos generados
dir *.json | findstr training
```

### Verificar Resultados
```bash
# Ver reporte
type training-report-groq.json

# Ver contexto
type search-context.json

# Ver ejemplos
type training-examples.json
```

---

## 🎓 CONCEPTOS CLAVE

### Groq (Rápido)
- Procesa cada producto
- Genera descripciones
- Clasifica categorías
- Extrae palabras clave
- Detecta intenciones

### Ollama (Mejora)
- Genera embeddings semánticos
- Mejora descripciones
- Optimiza búsqueda
- Refina respuestas
- Aprende del contexto

### Integración
- Groq: Base rápida
- Ollama: Mejora continua
- Bot: Usa ambos

---

## ✅ CHECKLIST

- [ ] GROQ_API_KEY configurada
- [ ] Catálogo cargado (68 productos)
- [ ] Ejecutar entrenamiento Groq
- [ ] Revisar datos generados
- [ ] Preparar para Ollama
- [ ] Revisar contexto de búsqueda
- [ ] Revisar ejemplos de entrenamiento
- [ ] Usar con Ollama
- [ ] Integrar en el bot
- [ ] Pruebas en vivo

---

## 📞 SOPORTE

**¿Cuánto tiempo tarda?**
→ 10-15 minutos para 68 productos

**¿Puedo interrumpir?**
→ No, espera a que termine

**¿Qué pasa si falla?**
→ Ejecuta nuevamente, Groq reintentar

**¿Cómo uso los datos?**
→ Carga en Ollama o integra en el bot

---

**Generado**: 15 de Noviembre de 2025  
**Estado**: ✅ LISTO PARA USAR
