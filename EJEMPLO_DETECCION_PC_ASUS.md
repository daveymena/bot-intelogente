# Ejemplo: Detección de "PC Asus para diseño gráfico"

**Pregunta del Cliente**: "busco un PC Asus para diseño gráfico"

---

## 🔄 Flujo Completo Paso a Paso

### 1️⃣ **InterpreterAgent** - Primera Clasificación

```typescript
Mensaje: "busco un PC Asus para diseño gráfico"
  ↓
detectIntent(message)
  ↓
Resultado: "product_search"
  - Detecta "busco" (palabra de búsqueda)
  - Detecta "PC" (producto)
  - Detecta "Asus" (marca específica)
  - Detecta "diseño gráfico" (propósito)
  ↓
Clasificación: specific_product (búsqueda específica, no general)
  ↓
Agente sugerido: SearchAgent
```

---

### 2️⃣ **DeepReasoningAgent** - Análisis Profundo

```typescript
analyzeContext(chatId, message, memory)
  ↓
Extracción de información:
{
  userIntent: {
    primary: "search_product",
    confidence: 0.95
  },
  extractedInfo: {
    category: "laptop/computador",
    brand: "Asus",
    purpose: "diseño gráfico",
    keywords: ["pc", "asus", "diseño", "gráfico"],
    specificTerms: ["asus", "diseño gráfico"]
  },
  suggestedAgent: "search",
  currentProduct: null
}
```

---

### 3️⃣ **SearchAgent** - Búsqueda con Scoring

#### A. Normalización de Query

```typescript
Query original: "busco un PC Asus para diseño gráfico"
  ↓
Limpieza:
  - Elimina: "busco", "un", "para"
  - Normaliza: "pc" → "portatil"
  ↓
Query procesado: "asus diseño gráfico portatil"
  ↓
Keywords extraídas: ["asus", "diseño", "gráfico", "portatil"]
Specific keywords: ["asus", "diseño gráfico"]
```

#### B. Búsqueda en Base de Datos

```sql
SELECT * FROM products 
WHERE status = 'AVAILABLE'
AND (
  name LIKE '%asus%' OR
  description LIKE '%asus%' OR
  name LIKE '%diseño%' OR
  description LIKE '%diseño%'
)
```

#### C. Sistema de Scoring (Cada Producto)

**Ejemplo con productos reales**:

##### Producto 1: "Portátil Asus Vivobook 15 Intel Core i7 16GB RAM"

```typescript
Score inicial: 0

1. Categoría detectada: "laptop/computador" ✅
   + 200 puntos (PRODUCTO PRINCIPAL)
   Score: 200

2. Marca en nombre: "Asus" ✅
   + 50 puntos (MATCH ESPECÍFICO)
   Score: 250

3. Keywords en nombre:
   - "asus" ✅ → +10 puntos
   - "portatil" ✅ → +10 puntos
   - "diseño" ❌
   - "gráfico" ❌
   Score: 270

4. Especificaciones técnicas:
   - "Intel Core i7" → Bueno para diseño
   - "16GB RAM" → Suficiente para diseño
   + 15 puntos (specs relevantes)
   Score: 285

5. Descripción menciona "trabajo" o "profesional"
   + 10 puntos
   Score: 295

SCORE FINAL: 295 ⭐⭐⭐
```

##### Producto 2: "Portátil HP Pavilion Intel Core i5 8GB RAM"

```typescript
Score inicial: 0

1. Categoría detectada: "laptop/computador" ✅
   + 200 puntos (PRODUCTO PRINCIPAL)
   Score: 200

2. Marca en nombre: "HP" (no "Asus") ❌
   + 0 puntos
   Score: 200

3. Keywords en nombre:
   - "asus" ❌
   - "portatil" ✅ → +10 puntos
   - "diseño" ❌
   - "gráfico" ❌
   Score: 210

4. Especificaciones técnicas:
   - "Intel Core i5" → Aceptable
   - "8GB RAM" → Justo para diseño
   + 5 puntos
   Score: 215

SCORE FINAL: 215 ⭐⭐
```

##### Producto 3: "Mega Pack 40: Cursos Completos"

```typescript
Score inicial: 0

1. Categoría detectada: "megapack" ❌
   - 100 puntos (PENALIZACIÓN - no coincide)
   Score: -100

2. Es un pack genérico y usuario NO buscó pack ❌
   - 50 puntos (PENALIZACIÓN MASIVA)
   Score: -150

3. Keywords en nombre:
   - "asus" ❌
   - "portatil" ❌
   - "diseño" ❌
   - "gráfico" ❌
   Score: -150

SCORE FINAL: -150 ❌
```

##### Producto 4: "Mouse Asus ROG Gaming"

```typescript
Score inicial: 0

1. Categoría detectada: "accesorio" ⚠️
   + 50 puntos (ACCESORIO relacionado)
   Score: 50

2. Marca en nombre: "Asus" ✅
   + 50 puntos
   Score: 100

3. Keywords en nombre:
   - "asus" ✅ → +10 puntos
   - "portatil" ❌
   - "diseño" ❌
   - "gráfico" ❌
   Score: 110

4. Es accesorio, no producto principal ⚠️
   - 50 puntos (penalización menor)
   Score: 60

SCORE FINAL: 60 ⭐
```

#### D. Ordenamiento y Selección

```typescript
Productos ordenados por score:
1. Portátil Asus Vivobook 15 (295) ⭐⭐⭐
2. Portátil HP Pavilion (215) ⭐⭐
3. Mouse Asus ROG (60) ⭐
4. Mega Pack 40 (-150) ❌

Diferencia entre 1° y 2°: 80 puntos (>10)
  ↓
Decisión: Mostrar SOLO el primero (match específico)
```

---

### 4️⃣ **Respuesta del Bot**

```
🎯 *Portátil Asus Vivobook 15*

💻 Intel Core i7-13620H
🧠 16GB RAM DDR4
💾 512GB SSD
📺 Pantalla 15.6" FHD

✅ Perfecto para diseño gráfico
✅ Procesador potente
✅ RAM suficiente para Adobe Creative Suite

💰 *Precio:* $1.749.900 COP

¿Te interesa? 😊
```

---

## 🎯 Factores de Scoring

### Puntos Positivos (+)

| Factor | Puntos | Ejemplo |
|--------|--------|---------|
| Producto principal de categoría | +200 | Laptop cuando busca laptop |
| Match exacto de marca | +50 | "Asus" en nombre |
| Keyword específica en nombre | +50 | "diseño" en nombre |
| Todas keywords importantes | +25 | "asus" + "diseño" |
| Keyword en subcategoría | +15 | "diseño gráfico" |
| Keyword normal en nombre | +10 | "portátil" |
| Specs relevantes | +5-15 | i7, 16GB RAM |

### Puntos Negativos (-)

| Factor | Puntos | Ejemplo |
|--------|--------|---------|
| Categoría no coincide | -100 | Busca laptop, encuentra curso |
| Pack genérico no buscado | -50 | Mega Pack cuando busca específico |
| Es accesorio, no principal | -50 | Mouse cuando busca laptop |
| Falta keyword específica | -20 | No tiene "Asus" |

---

## 🔍 Casos Especiales

### Caso 1: "Asus para diseño"
```
Keywords: ["asus", "diseño"]
  ↓
Busca: Productos Asus + mencionen diseño
  ↓
Prioriza: Laptops con specs altas (i7, 16GB+)
```

### Caso 2: "PC económico Asus"
```
Keywords: ["pc", "economico", "asus"]
  ↓
Busca: Productos Asus categoría laptop
  ↓
Ordena: Por precio ascendente (más barato primero)
  ↓
Muestra: Top 3 más económicos
```

### Caso 3: "Asus gaming"
```
Keywords: ["asus", "gaming"]
  ↓
Busca: Productos Asus + "gaming" en nombre/descripción
  ↓
Prioriza: ROG, TUF, specs gaming (GPU dedicada)
```

### Caso 4: Solo "Asus"
```
Keywords: ["asus"]
  ↓
Busca: Todos los productos Asus
  ↓
Ordena: Por precio (más económico primero)
  ↓
Muestra: Top 3 productos Asus
```

---

## 📊 Matriz de Decisión

| Búsqueda | Score Mínimo | Acción |
|----------|--------------|--------|
| Score >= 200 | Match fuerte | Mostrar 1 producto |
| Score 100-199 | Match medio | Mostrar top 3 |
| Score 50-99 | Match débil | Mostrar top 5 + sugerencias |
| Score < 50 | Sin match | "No encontré, ¿buscas...?" |

---

## ✅ Ventajas del Sistema

1. **Preciso**: Detecta marca, modelo, propósito
2. **Inteligente**: Penaliza productos irrelevantes
3. **Flexible**: Funciona con búsquedas vagas o específicas
4. **Contextual**: Considera specs técnicas
5. **Escalable**: Fácil agregar nuevos factores

---

## 🔧 Cómo Mejorar el Scoring

### Agregar Nueva Marca

```typescript
// En search-agent.ts, método calculateProductScore
const brands = ['asus', 'hp', 'dell', 'lenovo', 'acer', 'apple'];
const brandInQuery = brands.find(b => fullQuery.includes(b));
const brandInProduct = brands.find(b => name.includes(b));

if (brandInQuery && brandInQuery === brandInProduct) {
  score += 50; // Match de marca
}
```

### Agregar Propósito Específico

```typescript
const purposes = {
  'diseño': ['i7', 'i9', '16gb', '32gb', 'nvidia', 'amd radeon'],
  'gaming': ['rtx', 'gtx', 'gaming', 'rog', 'tuf'],
  'oficina': ['i3', 'i5', '8gb', 'ssd'],
};

// Verificar si el producto tiene specs del propósito
if (purposeInQuery && hasMatchingSpecs) {
  score += 15;
}
```

---

**Conclusión**: El sistema ya es muy robusto y detecta correctamente productos específicos por marca, modelo, propósito y especificaciones técnicas.
