# 🚨 RESUMEN DE PROBLEMAS - Para Solucionar en Visual Studio Code

## Contexto

El autofix de Kiro IDE está eliminando código crítico constantemente. Necesitamos aplicar estos cambios en **Visual Studio Code** donde NO hay autofix agresivo.

---

## PROBLEMA 1: Saludos Ofrecen Productos Inmediatamente ❌

### Síntoma
```
Cliente: "Hola"
Bot: "¡Hola! 👋 ¿Qué te parece el curso de piano?
     📚 Incluye: [descripción]
     💰 Precio: $60,000 COP"
```

### Causa
El bot NO detecta saludos simples y busca productos inmediatamente.

### Solución
**Archivo**: `src/lib/intelligent-conversation-engine.ts`

**1. Agregar import (línea ~10):**
```typescript
import { GreetingDetector } from './greeting-detector';
```

**2. Agregar detección ANTES de buscar productos (línea ~105):**
```typescript
// Agregar mensaje del usuario a la memoria
this.addToMemory(memory, 'user', message);

// 👋 DETECTAR SALUDOS SIMPLES (sin buscar productos ni gastar tokens)
if (GreetingDetector.isGreeting(message)) {
  console.log('[IntelligentEngine] 👋 Saludo detectado - Respuesta rápida sin IA');
  const greetingResponse = GreetingDetector.generateGreetingResponse(userName);
  this.addToMemory(memory, 'assistant', greetingResponse);
  
  return {
    text: greetingResponse,
    actions: [],
    context: memory.context,
    confidence: 1.0
  };
}

// 👋 DETECTAR DESPEDIDAS (sin buscar productos ni gastar tokens)
if (GreetingDetector.isFarewell(message)) {
  console.log('[IntelligentEngine] 👋 Despedida detectada - Respuesta rápida sin IA');
  const farewellResponse = GreetingDetector.generateFarewellResponse();
  this.addToMemory(memory, 'assistant', farewellResponse);
  
  return {
    text: farewellResponse,
    actions: [],
    context: memory.context,
    confidence: 1.0
  };
}

// Buscar productos relevantes en la base de datos (SOLO si NO es saludo/despedida)
const relevantProducts = await this.searchRelevantProducts(message, userId);
```

---

## PROBLEMA 2: Scoring Incorrecto - Todos los Productos Tienen 35 Puntos ❌

### Síntoma
```
[IntelligentEngine] 📊 Mega Pack 03 (Inglés): 35 puntos
[IntelligentEngine] 📊 Mega Pack 02 (Programación): 35 puntos
[IntelligentEngine] 📊 Curso de Piano: 35 puntos
```

**Debería ser:**
```
[IntelligentEngine] 📊 Mega Pack 03 (Inglés): 190 puntos  ✅
[IntelligentEngine] 📊 Mega Pack 02 (Programación): 10 puntos
```

### Causa
El scoring básico no diferencia palabras específicas (inglés, diseño) de palabras genéricas (curso, mega).

### Solución
**Archivo**: `src/lib/intelligent-conversation-engine.ts`

**Buscar la sección de scoring (línea ~612) y reemplazar:**

**ANTES (Scoring básico):**
```typescript
// Calcular relevancia de cada producto
const scoredProducts = allProducts.map(product => {
  let score = 0;
  const productText = `${product.name} ${product.description || ''} ${product.subcategory || ''}`.toLowerCase();
  
  // Dar puntos por cada palabra clave encontrada
  keywords.forEach(keyword => {
    if (productText.includes(keyword)) {
      // Más puntos si está en el nombre
      if (product.name.toLowerCase().includes(keyword)) {
        score += 10;
      } else {
        score += 5;
      }
    }
  });

  // Bonus si contiene TODAS las palabras clave
  const containsAll = keywords.every(kw => productText.includes(kw));
  if (containsAll) {
    score += 20;
  }

  // Bonus si el nombre empieza con la primera palabra clave
  if (product.name.toLowerCase().startsWith(keywords[0])) {
    score += 15;
  }

  return { product, score };
});
```

**DESPUÉS (Scoring inteligente):**
```typescript
// 🎯 SCORING INTELIGENTE INLINE (sin imports para evitar autofix)
const GENERIC_WORDS = ['curso', 'cursos', 'mega', 'pack', 'megapack', 'de', 'el', 'la'];

const scoredProducts = allProducts.map(product => {
  let score = 0;
  const productName = product.name.toLowerCase();
  const productDesc = (product.description || '').toLowerCase();
  const productSubcat = (product.subcategory || '').toLowerCase();
  const productText = `${productName} ${productDesc} ${productSubcat}`;

  // Procesar cada palabra clave
  keywords.forEach((keyword, index) => {
    const keywordLower = keyword.toLowerCase();
    const isGeneric = GENERIC_WORDS.includes(keywordLower);

    // PRIORIDAD MÁXIMA: Coincidencia en el nombre
    if (productName.includes(keywordLower)) {
      if (!isGeneric) {
        // Palabra específica (inglés, diseño, programación, etc.)
        score += 50;
        console.log(`[Scoring] 🎯 "${keyword}" en nombre de "${product.name}": +50 puntos`);
      } else {
        // Palabra genérica (curso, mega, pack)
        score += 10;
      }

      // Bonus si está al inicio
      if (productName.startsWith(keywordLower)) {
        score += 15;
        console.log(`[Scoring] 🚀 "${keyword}" al inicio de "${product.name}": +15 puntos`);
      }
    }
    // PRIORIDAD MEDIA: En subcategoría
    else if (productSubcat.includes(keywordLower)) {
      score += 30;
      console.log(`[Scoring] 📂 "${keyword}" en subcategoría de "${product.name}": +30 puntos`);
    }
    // PRIORIDAD BAJA: En descripción
    else if (productDesc.includes(keywordLower)) {
      score += 5;
    }

    // Bonus por primera palabra clave (más importante)
    if (index === 0 && productText.includes(keywordLower) && !isGeneric) {
      score += 10;
    }
  });

  // MEGA BONUS: Contiene TODAS las palabras clave importantes
  const importantKeywords = keywords.filter(
    kw => !GENERIC_WORDS.includes(kw.toLowerCase()) && kw.length > 3
  );

  if (importantKeywords.length > 0) {
    const containsAllImportant = importantKeywords.every(kw =>
      productText.includes(kw.toLowerCase())
    );
    if (containsAllImportant) {
      score += 100;
      console.log(`[Scoring] 🌟 "${product.name}" contiene TODAS las palabras importantes: +100 MEGA BONUS`);
    }
  }

  return { product, score };
});
```

---

## PROBLEMA 3: Ollama Activado - Muy Lento ❌

### Síntoma
```
[IntelligentEngine] 🤖 Groq agotado, intentando con Ollama (gemma:2b)...
[Ollama] 🤖 Generando respuesta con gemma:2b
(demora 30+ segundos y no responde bien)
```

### Solución
**Archivo**: `.env`

**Cambiar:**
```env
OLLAMA_ENABLED=true
AI_FALLBACK_ENABLED=true
```

**Por:**
```env
OLLAMA_ENABLED=false
AI_FALLBACK_ENABLED=false
```

---

## PROBLEMA 4: Groq API Keys Restringidas ❌

### Síntoma
```
[IntelligentEngine] ❌ Error con Groq: 400 
{"error":{"message":"Organization has been restricted"}}
```

### Causa
Las API keys de Groq están bloqueadas o tienen rate limit.

### Solución
**Archivo**: `.env`

**Necesitas conseguir nuevas API keys de Groq:**

1. Ve a: https://console.groq.com/keys
2. Crea nuevas API keys
3. Reemplaza en `.env`:

```env
GROQ_API_KEY=gsk_NUEVA_KEY_AQUI
GROQ_API_KEY_2=gsk_OTRA_KEY_AQUI
# ... etc
```

**Alternativa temporal**: Usar solo 1 key válida y desactivar rotación:
```env
GROQ_API_KEY=gsk_TU_KEY_VALIDA_AQUI
# Comentar o eliminar las demás keys
```

---

## PROBLEMA 5: Error de Base de Datos ❌

### Síntoma
```
Error [PrismaClientKnownRequestError]: 
The column `bot_settings.businessHours` does not exist in the current database.
```

### Solución
**Ejecutar en terminal:**

```bash
# Sincronizar schema con base de datos
npx prisma db push

# O si hay migraciones pendientes
npx prisma migrate deploy
```

---

## PASOS PARA APLICAR EN VISUAL STUDIO CODE

### 1. Abrir Proyecto en VSCode
```bash
code .
```

### 2. Aplicar Cambios en Este Orden

1. ✅ **Desactivar Ollama** (`.env`)
2. ✅ **Agregar import GreetingDetector** (`src/lib/intelligent-conversation-engine.ts`)
3. ✅ **Agregar detección de saludos** (`src/lib/intelligent-conversation-engine.ts`)
4. ✅ **Reemplazar scoring básico con inteligente** (`src/lib/intelligent-conversation-engine.ts`)
5. ✅ **Sincronizar base de datos** (`npx prisma db push`)

### 3. Guardar y Probar

```bash
# Reiniciar bot
npm run dev

# Probar saludo
Envía: "Hola"
Espera: Bienvenida SIN productos

# Probar búsqueda
Envía: "quiero aprender inglés"
Espera: Mega Pack 03 (Inglés) - 190 puntos
```

---

## VERIFICACIÓN FINAL

### ✅ Saludo Funciona
```
Cliente: "Hola"
Bot: "¡Hola! 😊 Bienvenido a Tecnovariedades D&S 🎉
     ¿En qué puedo ayudarte hoy?"
```

### ✅ Scoring Funciona
```
[Scoring] 🎯 "ingles" en nombre de "Mega Pack 03": +50 puntos
[Scoring] 🌟 "Mega Pack 03" contiene TODAS las palabras: +100 MEGA BONUS
[Scoring] 📊 Mega Pack 03 (Inglés): 190 puntos
```

### ✅ Sin Ollama
```
[IntelligentEngine] 🚀 Intentando con Groq (llama-3.3-70b)...
(respuesta en 1-2 segundos)
```

---

## ARCHIVOS A MODIFICAR

1. `.env` - Desactivar Ollama
2. `src/lib/intelligent-conversation-engine.ts` - Agregar saludos y scoring
3. Terminal - Sincronizar base de datos

---

**Última actualización**: 2025-11-13
**Estado**: Listo para aplicar en VSCode
**Tiempo estimado**: 10-15 minutos
