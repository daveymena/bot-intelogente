# 🧠 BÚSQUEDA SEMÁNTICA CON OLLAMA

**Sistema inteligente que ENTIENDE el contexto completo, no solo keywords**

---

## 🎯 EL PROBLEMA QUE RESUELVE

### ❌ Sistema anterior (búsqueda por keywords):
```
Cliente: "curso de piano"
Sistema: Busca palabra "piano" en nombres
Resultado: No encuentra match exacto → Devuelve producto random ❌
```

### ✅ Sistema nuevo (búsqueda semántica):
```
Cliente: "curso de piano"
Ollama analiza: "Cliente busca curso educativo de música, específicamente piano"
Ollama compara: Productos semánticamente similares
Resultado: Encuentra "Curso Completo de Piano Online" ✅
```

---

## 🧠 CÓMO FUNCIONA

### 1. Cliente envía mensaje
```
"curzo de piyano"
```

### 2. Sistema obtiene productos de BD
```sql
SELECT * FROM products WHERE status = 'AVAILABLE'
```

### 3. Ollama analiza el mensaje completo
```
Prompt a Ollama:
- Mensaje del cliente: "curzo de piyano"
- Lista de productos disponibles
- Contexto de conversación previa

Ollama razona:
1. "curzo" → corrige a "curso"
2. "piyano" → corrige a "piano"
3. Cliente busca: curso educativo de piano
4. Busca en productos: "Curso Completo de Piano Online"
5. Devuelve: ID del producto + razonamiento
```

### 4. Sistema retorna producto correcto
```json
{
  "product": {
    "name": "Curso Completo de Piano Online",
    "price": 49000,
    "category": "DIGITAL"
  },
  "confidence": 90,
  "reason": "Cliente busca curso de piano",
  "isGeneralQuery": false
}
```

---

## 🎨 EJEMPLOS DE RAZONAMIENTO

### Ejemplo 1: Corrección ortográfica
```
Cliente: "curzo de piyano"
Ollama: "Corrige 'curzo' → 'curso', 'piyano' → 'piano'"
Resultado: Curso Completo de Piano Online ✅
```

### Ejemplo 2: Intención implícita
```
Cliente: "algo para trabajar desde casa"
Ollama: "Cliente necesita herramienta de trabajo → laptop para oficina"
Resultado: Laptop HP para oficina ✅
```

### Ejemplo 3: Sinónimos
```
Cliente: "portátil gamer"
Ollama: "portátil = laptop, gamer = gaming → laptop con buenas specs"
Resultado: Laptop gaming con Ryzen 5 ✅
```

### Ejemplo 4: Contexto completo
```
Cliente: "quiero aprender inglés"
Ollama: "aprender inglés → curso de idiomas o megapack de idiomas"
Resultado: Megapack de Idiomas ✅
```

### Ejemplo 5: Consulta general
```
Cliente: "qué laptops tienes"
Ollama: "Consulta general sobre laptops → mostrar múltiples opciones"
Resultado: Lista de 5 laptops ✅
```

---

## 📋 VENTAJAS DEL SISTEMA

### ✅ Entiende contexto completo
- No solo busca palabras exactas
- Analiza la intención real del cliente
- Considera conversación previa

### ✅ Corrige errores automáticamente
- "curzo" → "curso"
- "piyano" → "piano"
- "mega pack" → "megapack"
- "portatil" → "portátil"

### ✅ Infiere necesidades
- "algo para trabajar" → laptop para oficina
- "quiero aprender inglés" → curso de idiomas
- "para juegos" → laptop gaming

### ✅ Entiende sinónimos
- "laptop" = "portátil" = "computador"
- "curso" = "capacitación" = "entrenamiento"
- "megapack" = "paquete completo"

### ✅ Razona sobre características
- "para gaming" → busca Ryzen 5+, 16GB RAM
- "para diseño" → busca specs altas
- "económico" → busca precios bajos

---

## 🔧 ARQUITECTURA

```
┌─────────────────────────────────────────┐
│         Cliente envía mensaje           │
│      "curzo de piyano"                  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    semantic-product-search.ts           │
│  - Obtiene productos de BD              │
│  - Prepara prompt para Ollama           │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         OLLAMA (gemma2:2b)              │
│  - Analiza mensaje completo             │
│  - Corrige ortografía                   │
│  - Infiere intención                    │
│  - Razona sobre productos               │
│  - Devuelve IDs + razonamiento          │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    semantic-product-search.ts           │
│  - Convierte IDs a productos            │
│  - Retorna resultado                    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Bot responde al cliente         │
│  Con producto correcto + CARD + AIDA    │
└─────────────────────────────────────────┘
```

---

## 🚀 CÓMO USAR

### 1. Verificar configuración
```env
USE_OLLAMA=true
OLLAMA_BASE_URL=https://ollama-ollama.ginee6.easypanel.host
OLLAMA_MODEL=gemma2:2b
```

### 2. Probar búsqueda semántica
```bash
probar-busqueda-semantica.bat
```

### 3. Integrar en el bot
```typescript
import { semanticProductSearch } from '@/lib/semantic-product-search';

// En lugar de búsqueda por keywords
const result = await semanticProductSearch(
  userMessage,
  conversationContext
);

if (result) {
  if (result.isGeneralQuery && result.products) {
    // Mostrar múltiples opciones
  } else if (result.product) {
    // Mostrar producto específico
  }
}
```

---

## 📊 COMPARACIÓN

### Búsqueda por Keywords (anterior):
```
Cliente: "curso de piano"
Sistema: Busca "piano" en nombres
Encuentra: "Mega Pack 40: Cursos Completos" ❌ (incorrecto)
Razón: Contiene la palabra "piano" pero no es lo que busca
```

### Búsqueda Semántica (nueva):
```
Cliente: "curso de piano"
Ollama: Analiza intención → busca curso individual de piano
Encuentra: "Curso Completo de Piano Online" ✅ (correcto)
Razón: Entiende que busca curso específico, no megapack
```

---

## 🎯 CASOS DE USO

### Caso 1: Errores ortográficos
```
Input: "curzo de piyano"
Ollama: Corrige → "curso de piano"
Output: Curso Completo de Piano Online ✅
```

### Caso 2: Consulta vaga
```
Input: "algo para trabajar"
Ollama: Infiere → necesita laptop para oficina
Output: Laptop HP para oficina ✅
```

### Caso 3: Sinónimos
```
Input: "portátil gamer"
Ollama: Traduce → laptop gaming
Output: Laptop gaming con Ryzen 5 ✅
```

### Caso 4: Contexto previo
```
Contexto: Cliente preguntó por laptops antes
Input: "el más económico"
Ollama: Usa contexto → busca laptop más barato
Output: Laptop más económico ✅
```

### Caso 5: Intención implícita
```
Input: "quiero aprender inglés"
Ollama: Infiere → busca curso de idiomas
Output: Megapack de Idiomas ✅
```

---

## 🔧 CONFIGURACIÓN AVANZADA

### Ajustar temperatura (creatividad)
```env
# Más creativo (puede inferir más)
OLLAMA_TEMPERATURE=0.5

# Más preciso (más literal)
OLLAMA_TEMPERATURE=0.2

# Balanceado (recomendado)
OLLAMA_TEMPERATURE=0.3
```

### Ajustar timeout
```env
# Más rápido (puede fallar si Ollama es lento)
OLLAMA_TIMEOUT=15000

# Balanceado (recomendado)
OLLAMA_TIMEOUT=30000

# Más tolerante
OLLAMA_TIMEOUT=60000
```

### Ajustar tokens
```env
# Respuestas cortas
OLLAMA_MAX_TOKENS=200

# Balanceado (recomendado)
OLLAMA_MAX_TOKENS=300

# Respuestas detalladas
OLLAMA_MAX_TOKENS=500
```

---

## 🐛 TROUBLESHOOTING

### Problema: Ollama no responde
```bash
# Verificar conexión
curl https://ollama-ollama.ginee6.easypanel.host/api/tags

# Si falla, el sistema usa fallback por keywords automáticamente
```

### Problema: Resultados incorrectos
```env
# Ajustar temperatura (más preciso)
OLLAMA_TEMPERATURE=0.2

# Aumentar timeout
OLLAMA_TIMEOUT=60000
```

### Problema: Muy lento
```env
# Reducir tokens
OLLAMA_MAX_TOKENS=200

# Reducir timeout
OLLAMA_TIMEOUT=15000
```

---

## 📈 MÉTRICAS DE ÉXITO

### Indicadores de que funciona bien:

✅ **Encuentra productos con errores ortográficos**  
✅ **Entiende intenciones implícitas**  
✅ **Diferencia consultas generales vs específicas**  
✅ **Usa contexto de conversación previa**  
✅ **Corrige sinónimos automáticamente**  
✅ **Razona sobre características del producto**  

---

## 🎉 RESULTADO

**Sistema de búsqueda inteligente que:**

✅ Entiende contexto completo  
✅ Corrige errores automáticamente  
✅ Infiere necesidades implícitas  
✅ Razona sobre productos  
✅ Usa conversación previa  
✅ Diferencia consultas generales vs específicas  
✅ Fallback automático si Ollama falla  

**¡Búsqueda verdaderamente inteligente! 🧠**

---

## 📚 ARCHIVOS RELACIONADOS

```
src/lib/
└── semantic-product-search.ts     ← Sistema de búsqueda semántica

tests/
└── test-busqueda-semantica.js     ← Test de verificación

batch/
└── probar-busqueda-semantica.bat  ← Ejecutar test

docs/
└── BUSQUEDA_SEMANTICA_OLLAMA.md   ← Este archivo
```

---

**¡Ahora el bot entiende de verdad lo que quiere el cliente! 🎯**
