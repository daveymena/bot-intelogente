# 🔍 DIAGNÓSTICO COMPLETO: Por qué devuelve producto incorrecto

## ✅ Lo que SÍ funciona:

1. **Base de datos:** El curso de piano existe
   - Nombre: "Curso Piano Profesional Completo"
   - ID: cmiy3asdi007rkma4dqwp2dio
   - Precio: $60.000
   - Tags: ["piano","música","curso","educación","aprendizaje"]

2. **Configuración:** Ollama está activo
   - `USE_OLLAMA=true` ✅
   - `OLLAMA_BASE_URL` configurada ✅
   - `OLLAMA_TIMEOUT=30000` ✅

## ❌ El Problema:

**Usuario pidió:** "Me interesa el curso de piano"
**Bot respondió:** "Mega Pack 21: Pack Sublimado"

## 🔍 Análisis del Flujo

### Flujo Normal (Esperado):

```
1. Usuario: "curso de piano"
   ↓
2. detectarIntencion() → "busqueda_producto"
   ↓
3. buscarYResponderProducto()
   ↓
4. semanticProductSearch() con Ollama
   ↓
5. Ollama analiza y devuelve: Curso de Piano
   ↓
6. Bot presenta: Curso de Piano ✅
```

### Flujo Actual (Problema):

```
1. Usuario: "curso de piano"
   ↓
2. detectarIntencion() → "busqueda_producto" ✅
   ↓
3. buscarYResponderProducto()
   ↓
4. semanticProductSearch() con Ollama
   ↓
5. Ollama analiza y devuelve: ??? (Pack Sublimado) ❌
   ↓
6. Bot presenta: Pack Sublimado ❌
```

## 🎯 Posibles Causas

### Causa 1: Ollama está confundido (70% probable)

**Síntoma:**
- Ollama recibe el prompt correcto
- Pero devuelve producto incorrecto
- El prompt tiene 100 productos en la lista
- Ollama se confunde con tantas opciones

**Solución:**
- Reducir número de productos en el prompt
- Mejorar el prompt para ser más específico
- Aumentar temperatura para mejor razonamiento

### Causa 2: Servidor no reiniciado (20% probable)

**Síntoma:**
- Cambios en código no se aplicaron
- Sigue usando versión antigua

**Solución:**
- Reiniciar servidor completamente
- Verificar que carga la nueva configuración

### Causa 3: Fallback activándose (5% probable)

**Síntoma:**
- Ollama falla (timeout/error)
- Activa fallback de keywords
- Fallback devuelve producto incorrecto

**Solución:**
- Aumentar timeout
- Mejorar fallback de keywords

### Causa 4: Prompt de Ollama mal formado (5% probable)

**Síntoma:**
- Ollama no entiende el prompt
- Devuelve respuesta aleatoria

**Solución:**
- Simplificar prompt
- Hacer más explícito

## 🔧 Soluciones Propuestas

### Solución 1: Filtrar productos ANTES de enviar a Ollama

En lugar de enviar 100 productos, filtrar primero por keywords:

```typescript
// ANTES: Enviar todos los productos
const allProducts = await prisma.product.findMany({
  where: { status: 'AVAILABLE' },
  take: 100
});

// DESPUÉS: Filtrar primero
const keywords = extractKeywords(userMessage); // ["curso", "piano"]
const filteredProducts = await prisma.product.findMany({
  where: {
    status: 'AVAILABLE',
    OR: keywords.map(k => ({
      OR: [
        { name: { contains: k, mode: 'insensitive' } },
        { description: { contains: k, mode: 'insensitive' } }
      ]
    }))
  },
  take: 10 // Solo 10 productos relevantes
});
```

**Ventaja:** Ollama recibe menos productos, más fácil de analizar

### Solución 2: Mejorar el prompt de Ollama

Hacer el prompt más explícito sobre qué buscar:

```typescript
const prompt = `
MENSAJE DEL CLIENTE: "${userMessage}"

INSTRUCCIÓN CRÍTICA:
El cliente dijo "${userMessage}".
Busca el producto que MEJOR coincida con estas palabras clave: ${keywords.join(', ')}

PRODUCTOS DISPONIBLES (solo los relevantes):
${productList}

RESPONDE EN JSON con el ID del producto MÁS RELEVANTE.
`;
```

### Solución 3: Agregar validación post-Ollama

Después de que Ollama devuelve un producto, validar que sea correcto:

```typescript
const resultado = await analyzeWithOllama(...);

// Validar que el producto devuelto contiene las keywords
const productoNombre = resultado.product.name.toLowerCase();
const tieneKeywords = keywords.some(k => productoNombre.includes(k));

if (!tieneKeywords) {
  console.log('⚠️ Ollama devolvió producto incorrecto, usando fallback');
  return fallbackKeywordSearch(userMessage, products);
}
```

### Solución 4: Usar búsqueda híbrida

Combinar Ollama con búsqueda por keywords:

```typescript
// 1. Buscar por keywords primero (rápido y confiable)
const keywordResults = await searchByKeywords(userMessage);

// 2. Si hay pocos resultados, usar Ollama para elegir el mejor
if (keywordResults.length <= 5) {
  return await analyzeWithOllama(userMessage, keywordResults);
}

// 3. Si hay muchos, devolver el primero
return keywordResults[0];
```

## 📊 Recomendación

**Implementar Solución 1 + Solución 3:**

1. Filtrar productos por keywords ANTES de Ollama
2. Validar resultado de Ollama DESPUÉS
3. Si falla validación, usar fallback

Esto garantiza:
- ✅ Ollama recibe menos productos (más preciso)
- ✅ Resultado siempre es relevante
- ✅ Fallback confiable si Ollama falla

## 🚀 Implementación

Ver archivo: `CORRECCION_BUSQUEDA_HIBRIDA.md`

---

**Conclusión:** El problema es que Ollama recibe demasiados productos (100) y se confunde. La solución es filtrar primero por keywords y luego usar Ollama para elegir el mejor.
