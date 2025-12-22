# 🧠 Evaluación de Razonamiento de Ollama

## 🎯 Objetivo

Probar qué tan bien Ollama:
1. Entiende búsquedas de clientes
2. Selecciona productos relevantes
3. Extrae keywords correctamente
4. Razona sobre las coincidencias
5. Responde en formato estructurado

## 🧪 Tests Incluidos

### 1. Búsqueda Específica
```
Query: "Curso de Piano"
Esperado: Encuentra curso de piano exacto
```

### 2. Búsqueda con Contexto
```
Query: "laptop para diseño gráfico"
Esperado: Encuentra laptops con buenas specs
```

### 3. Búsqueda Ambigua
```
Query: "algo para aprender"
Esperado: Encuentra cursos y megapacks
```

### 4. Búsqueda por Precio
```
Query: "algo económico"
Esperado: Encuentra productos baratos
```

### 5. Búsqueda por Categoría
```
Query: "motos"
Esperado: Encuentra productos de categoría MOTORCYCLE
```

## 📊 Criterios de Evaluación

### Formato (30 puntos)
- ✅ Responde con "PRODUCTOS: X, Y, Z"
- ✅ Formato estructurado
- ✅ Números de productos correctos

### Razonamiento (20 puntos)
- ✅ Incluye "RAZONAMIENTO: ..."
- ✅ Explica por qué seleccionó esos productos
- ✅ Lógica coherente

### Keywords (20 puntos)
- ✅ Incluye "KEYWORDS: ..."
- ✅ Extrae palabras clave relevantes
- ✅ Filtra stopwords

### Velocidad (15 puntos)
- ✅ Responde en < 5 segundos
- ⚠️ 5-10 segundos: aceptable
- ❌ > 10 segundos: muy lento

### Longitud (15 puntos)
- ✅ 50-500 caracteres
- ⚠️ < 50: muy corto
- ⚠️ > 500: muy largo

## 🎯 Escala de Puntuación

- **80-100**: 🎉 EXCELENTE - Ollama razona muy bien
- **60-79**: 👍 BUENO - Razonamiento aceptable
- **40-59**: ⚠️ REGULAR - Necesita ajustes
- **0-39**: ❌ MALO - Considerar otro modelo

## 🚀 Ejecutar Test

```bash
# Opción 1: Script automático
probar-razonamiento-ollama.bat

# Opción 2: Directo
npx tsx scripts/test-razonamiento-ollama.ts
```

## 📋 Ejemplo de Salida

```
🧠 TEST DE RAZONAMIENTO DE OLLAMA
============================================================

📦 Cargados 68 productos de la BD

────────────────────────────────────────────────────────────

📝 TEST: Búsqueda Específica
💬 Query: "Curso de Piano"
────────────────────────────────────────────────────────────

⏱️  Tiempo de respuesta: 3500ms

🦙 Respuesta de Ollama:
────────────────────────────────────────────────────────────
PRODUCTOS: 5
RAZONAMIENTO: El cliente busca específicamente un curso de piano, 
el producto #5 "Curso de Piano Completo" coincide exactamente.
KEYWORDS: curso, piano
────────────────────────────────────────────────────────────

📊 Análisis:
✅ Productos: 5
📦 Cantidad: 1 producto(s)
   5. Curso de Piano Completo

🧠 Razonamiento: El cliente busca específicamente un curso de piano...
🔑 Keywords: curso, piano

⭐ Evaluación:
   ✅ Formato correcto (+30)
   ✅ Incluye razonamiento (+20)
   ✅ Extrae keywords (+20)
   ✅ Respuesta rápida (+15)
   ✅ Longitud apropiada (+15)

   📊 Score Total: 100/100
   🎉 EXCELENTE
```

## 🔍 Qué Buscar en los Resultados

### ✅ Señales Positivas

1. **Formato Correcto**
   ```
   PRODUCTOS: 1, 5, 12
   RAZONAMIENTO: ...
   KEYWORDS: ...
   ```

2. **Razonamiento Lógico**
   ```
   "El cliente busca X porque menciona Y"
   "Seleccioné estos productos porque..."
   ```

3. **Keywords Relevantes**
   ```
   KEYWORDS: curso, piano (✅ correcto)
   NO: que, está, son (❌ stopwords)
   ```

4. **Velocidad Aceptable**
   ```
   < 5s: Excelente
   5-10s: Aceptable
   > 10s: Muy lento
   ```

### ❌ Señales Negativas

1. **Sin Formato**
   ```
   "El cliente busca un curso de piano..."
   (Sin PRODUCTOS:, RAZONAMIENTO:, etc.)
   ```

2. **Razonamiento Pobre**
   ```
   "Porque sí"
   "Es lo que busca"
   (Sin explicación real)
   ```

3. **Keywords Incorrectas**
   ```
   KEYWORDS: que, está, son, el, la
   (Solo stopwords)
   ```

4. **Muy Lento**
   ```
   > 15 segundos por respuesta
   ```

## 🎯 Interpretación de Resultados

### Si Score > 80
- ✅ Ollama funciona EXCELENTE
- ✅ Puede usarse en producción
- ✅ Razonamiento confiable

### Si Score 60-79
- ⚠️ Ollama funciona BIEN
- ⚠️ Puede necesitar ajustes en prompts
- ⚠️ Considerar optimizaciones

### Si Score < 60
- ❌ Ollama tiene problemas
- ❌ Considerar:
  - Cambiar modelo (gemma2:9b, llama3:8b)
  - Mejorar prompts
  - Usar Groq como principal

## 🔧 Mejoras Según Resultados

### Si falla en Formato
```typescript
// Mejorar prompt con ejemplos más claros
const systemPrompt = `
FORMATO OBLIGATORIO:
PRODUCTOS: 1, 5, 12
RAZONAMIENTO: porque...
KEYWORDS: palabra1, palabra2

EJEMPLO:
Cliente: "laptop para diseño"
PRODUCTOS: 3, 7
RAZONAMIENTO: Laptops con buenas specs para diseño
KEYWORDS: laptop, diseño
`;
```

### Si falla en Velocidad
```bash
# Usar modelo más pequeño
ollama pull gemma2:2b

# O ajustar timeout
OLLAMA_TIMEOUT=10000
```

### Si falla en Razonamiento
```typescript
// Agregar más contexto
const systemPrompt = `
Analiza CUIDADOSAMENTE qué busca el cliente.
Considera:
- Palabras clave exactas
- Contexto de uso
- Categoría del producto
- Precio si lo menciona
`;
```

## 📝 Próximos Pasos

1. **Ejecutar test**: `probar-razonamiento-ollama.bat`
2. **Revisar scores**: Ver qué tests pasan/fallan
3. **Analizar patrones**: ¿Qué tipo de búsquedas funcionan mejor?
4. **Optimizar**: Ajustar prompts según resultados
5. **Re-test**: Verificar mejoras

---

**¡Ejecuta el test y veamos qué tan bien razona Ollama!** 🧠🚀
