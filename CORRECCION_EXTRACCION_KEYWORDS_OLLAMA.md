# 🔧 CORRECCIÓN: Extracción de Keywords de Ollama

## ❌ Problema Detectado

```
Ollama respondió: "Se parece que el cliente está buscando un curso o clase de piano..."
Keywords extraídas: que, extraigo, son:  ❌ INCORRECTO
```

**Causa**: El método `extractKeywordsFromAI()` no estaba capturando correctamente las palabras clave de la respuesta de Ollama.

## ✅ Solución Implementada

### 1. Prompt Mejorado para Ollama

**ANTES**:
```typescript
"¿Qué está buscando? Extrae las palabras clave para buscar en la base de datos."
```

**AHORA**:
```typescript
const systemPrompt = `Eres un experto en extraer palabras clave de búsqueda.

Tu ÚNICA tarea es identificar QUÉ producto busca el cliente y extraer las palabras clave EXACTAS.

REGLAS IMPORTANTES:
1. Extrae SOLO las palabras del producto (sustantivos)
2. NO incluyas verbos como "busco", "quiero", "necesito"
3. NO incluyas artículos como "el", "la", "un", "una"
4. Responde en formato: "KEYWORDS: palabra1, palabra2, palabra3"

EJEMPLOS:
Cliente: "Curso de Piano"
Respuesta: KEYWORDS: curso, piano

Cliente: "Busco laptop para diseño"
Respuesta: KEYWORDS: laptop, diseño
`;
```

### 2. Extracción Mejorada con Prioridades

```typescript
extractKeywordsFromAI(aiResponse, originalMessage) {
  // 1. PRIORIDAD: Buscar formato "KEYWORDS: palabra1, palabra2"
  const keywordsMatch = lowerResponse.match(/keywords?:\s*([^\n]+)/i);
  if (keywordsMatch) {
    return extractedWords; // ✅ Formato estructurado
  }
  
  // 2. Buscar texto entre comillas
  const quotedMatches = lowerResponse.matchAll(/"([^"]+)"|'([^']+)'/g);
  
  // 3. Buscar después de "buscando", "busca"
  const searchPatterns = [
    /buscando\s+(?:un|una|el|la)?\s*([a-záéíóúñ\s]+?)(?:\.|,|\n|$)/i,
    /busca\s+(?:un|una|el|la)?\s*([a-záéíóúñ\s]+?)(?:\.|,|\n|$)/i,
  ];
  
  // 4. Fallback: Usar mensaje original
  if (keywords.length === 0) {
    return originalMessage.split(/\s+/).filter(stopwords);
  }
}
```

### 3. Stopwords Ampliadas

Agregadas más palabras a ignorar:
```typescript
const stopwords = [
  'el', 'la', 'los', 'las', 'un', 'una',
  'de', 'del', 'en', 'para', 'con', 'y', 'o',
  'que', 'está', 'son', 'extraigo', 'parece',
  'buscando', 'busca', 'palabras', 'clave',
  'respuesta', 'dice', 'quiere', 'necesita', 'ver'
];
```

## 🎯 Flujo Corregido

```
Cliente: "Curso de Piano"
    ↓
Ollama recibe prompt mejorado
    ↓
Ollama responde: "KEYWORDS: curso, piano"
    ↓
extractKeywordsFromAI() detecta formato "KEYWORDS:"
    ↓
Extrae: ["curso", "piano"] ✅
    ↓
simpleSearch("curso piano")
    ↓
Encuentra: "Curso de Piano Completo"
    ↓
Bot responde con foto y detalles ✅
```

## 📊 Resultados Esperados

### Test 1: "Curso de Piano"
```
[Ollama] Respuesta: "KEYWORDS: curso, piano"
[SearchAgent] 🔑 Keywords finales: curso, piano
[SearchAgent] 📦 Encontrados 1 productos
[SearchAgent] ✅ 1 producto encontrado - Mostrando con foto
```

### Test 2: "Busco laptop para diseño"
```
[Ollama] Respuesta: "KEYWORDS: laptop, diseño"
[SearchAgent] 🔑 Keywords finales: laptop, diseño
[SearchAgent] 📦 Encontrados 3 productos
[SearchAgent] 📋 Mostrando lista de productos
```

## 🧪 Probar Ahora

```bash
# Ejecutar test
probar-ollama-forzado.bat
```

Deberías ver:
```
✅ Keywords extraídas: curso, piano
📦 Encontrados 1 productos
✅ 1 producto encontrado por Ollama
```

## 🔍 Logs de Depuración

El sistema ahora muestra:
1. `🔍 Analizando respuesta de Ollama: ...`
2. `✅ Encontrado formato KEYWORDS: ...` (si usa formato estructurado)
3. `🔑 Keywords finales: ...` (resultado final)

## ⚠️ Fallback Inteligente

Si Ollama no responde en el formato esperado:
1. Busca texto entre comillas
2. Busca después de "buscando", "busca"
3. Usa el mensaje original del cliente
4. Filtra stopwords

**Siempre encuentra algo para buscar** ✅

## 📝 Archivos Modificados

- `src/agents/search-agent.ts`
  - Prompt de Ollama mejorado
  - `extractKeywordsFromAI()` con prioridades
  - Stopwords ampliadas
  - Logs de depuración

## 🚀 Siguiente Paso

```bash
# 1. Probar el sistema corregido
probar-ollama-forzado.bat

# 2. Si funciona, iniciar el bot
npm run dev

# 3. Probar en WhatsApp
"Curso de Piano"
```

## ✅ Resultado Esperado

```
Cliente: "Curso de Piano"
Bot: 📸 [Foto del curso]
     🎹 Curso de Piano Completo
     💰 50,000 COP
     📝 Aprende piano desde cero...
     ¿Te interesa? ✅
```
