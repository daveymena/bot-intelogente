# 🔍 DIAGNÓSTICO: Por Qué No Encuentra Productos

## ❌ Problemas Detectados

### 1. Responde en Otro Idioma
- Qwen2.5 a veces responde en inglés o mezcla idiomas
- No está forzado a responder en español

### 2. No Encuentra Productos
- Los productos ESTÁN en la BD
- Pero Qwen2.5 no los encuentra
- Responde genéricamente sin productos específicos

## 🔍 Posibles Causas

### Causa 1: Prompt No Fuerza Español
```typescript
// Prompt actual NO especifica idioma
const systemPrompt = `Eres vendedor de Tecnovariedades D&S...`;

// Debería ser:
const systemPrompt = `Eres vendedor de Tecnovariedades D&S.
IMPORTANTE: Responde SIEMPRE en español.
...`;
```

### Causa 2: Lista de Productos Muy Larga
```typescript
// Si hay 100 productos, el prompt es ENORME
PRODUCTOS:
1. Producto 1 - $1000
2. Producto 2 - $2000
...
100. Producto 100 - $5000

// Qwen2.5:3b (modelo pequeño) se pierde con tanto texto
```

### Causa 3: Formato del Prompt
```typescript
// Prompt actual pide que Ollama genere TODO
"Genera una respuesta completa con formato profesional..."

// Debería pedir SOLO buscar productos
"Responde SOLO con los números de productos relevantes"
```

### Causa 4: Temperatura Alta
```typescript
// Temperatura 0.7 = más creativo pero menos preciso
temperature: 0.7

// Para búsqueda debería ser:
temperature: 0.1 // Más preciso, menos creativo
```

## ✅ Soluciones

### Solución 1: Forzar Español en Prompt

```typescript
const systemPrompt = `IMPORTANTE: Responde SIEMPRE en ESPAÑOL.

Eres el asistente de ventas de **Tecnovariedades D&S**.

PRODUCTOS DISPONIBLES:
${productList}

INSTRUCCIONES:
1. Responde SIEMPRE en español
2. Usa el formato de las plantillas
3. Menciona "Tecnovariedades D&S"
4. Incluye emojis apropiados

Cliente: "${message}"

Responde en ESPAÑOL:`;
```

### Solución 2: Simplificar Lista de Productos

```typescript
// En lugar de enviar 100 productos, filtrar primero
const productosRelevantes = products
  .filter(p => {
    const query = message.toLowerCase();
    const productText = `${p.name} ${p.description}`.toLowerCase();
    return productText.includes(query.split(' ')[0]); // Primera palabra
  })
  .slice(0, 20); // Máximo 20 productos

// Enviar solo productos relevantes a Ollama
```

### Solución 3: Usar Búsqueda en 2 Pasos

```typescript
// PASO 1: Búsqueda local rápida (filtrar)
const candidatos = busquedaLocal(message, products); // 20 productos

// PASO 2: Ollama selecciona el mejor
const mejores = await ollama.seleccionar(message, candidatos); // 3 productos

// PASO 3: Generar respuesta con plantilla local
const respuesta = generarRespuesta(mejores);
```

### Solución 4: Bajar Temperatura

```typescript
const response = await AIMultiProvider.generateCompletion(messages, {
  temperature: 0.1, // Más preciso
  max_tokens: 100,  // Respuestas cortas
  top_p: 0.9
});
```

## 🧪 Test de Diagnóstico

Voy a crear un test que:
1. ✅ Muestra TODOS los productos de la BD
2. ✅ Prueba búsqueda local vs IA
3. ✅ Compara resultados
4. ✅ Identifica el problema exacto

## 📊 Resultados Esperados

### Con Búsqueda Local
```
Cliente: "laptop"
Búsqueda local: Encuentra 5 laptops en 10ms ✅
```

### Con Qwen2.5 Actual
```
Cliente: "laptop"
Qwen2.5: No encuentra productos ❌
Razón: Prompt muy largo o temperatura alta
```

### Con Qwen2.5 Mejorado
```
Cliente: "laptop"
Paso 1: Búsqueda local filtra a 5 laptops
Paso 2: Qwen2.5 selecciona las 2 mejores
Paso 3: Plantilla genera respuesta profesional
Resultado: ✅ Respuesta perfecta en 2 segundos
```

## 🎯 Recomendación

**Usar sistema híbrido de 3 pasos:**

1. **Búsqueda local** (filtrar 100 → 20 productos)
2. **Qwen2.5** (seleccionar 20 → 3 mejores)
3. **Plantilla local** (generar respuesta profesional)

**Ventajas:**
- ✅ Rápido (búsqueda local es instantánea)
- ✅ Preciso (Qwen2.5 solo elige entre pocos)
- ✅ Profesional (plantilla consistente)
- ✅ Escalable (funciona con 1000+ productos)

---

**Próximo paso:** Ejecutar `probar-forzar-productos.bat` para confirmar diagnóstico
