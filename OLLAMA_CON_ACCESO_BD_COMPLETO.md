# 🦙 OLLAMA CON ACCESO COMPLETO A BASE DE DATOS

## 🎯 Problema Identificado

**ANTES**: Ollama NO veía los productos
```
Cliente: "Curso de Piano"
    ↓
Ollama: "El cliente busca un curso de piano"
    ↓
Sistema extrae keywords: "que, extraigo, son" ❌
    ↓
Busca en BD: 0 productos
```

**Causa**: Ollama solo recibía el mensaje del cliente, sin contexto de qué productos existen.

## ✅ Solución Implementada

**AHORA**: Ollama VE TODOS LOS PRODUCTOS

```typescript
// 1. Cargar productos de la BD
const allProducts = await db.product.findMany({
  where: { userId, status: 'AVAILABLE' },
  take: 100
});

// 2. Crear lista para Ollama
const productList = allProducts.map((p, i) => 
  `${i + 1}. ${p.name} - ${p.price} COP (${p.category})`
).join('\n');

// 3. Enviar a Ollama
const systemPrompt = `
PRODUCTOS DISPONIBLES:
1. Curso de Piano Completo - 50,000 COP (DIGITAL)
2. Laptop HP para Diseño - 2,500,000 COP (LAPTOP)
3. Moto Yamaha FZ - 8,000,000 COP (MOTORCYCLE)
...

Cliente dice: "Curso de Piano"
¿Qué productos coinciden?
`;
```

## 🎯 Nuevo Flujo

```
Cliente: "Curso de Piano"
    ↓
Sistema carga 100 productos de BD
    ↓
Ollama recibe lista completa:
  "1. Curso de Piano Completo - 50,000 COP
   2. Laptop HP - 2,500,000 COP
   3. Moto Yamaha - 8,000,000 COP
   ..."
    ↓
Ollama analiza y responde:
  "PRODUCTOS: 1
   KEYWORDS: curso, piano"
    ↓
Sistema extrae producto #1
    ↓
Bot muestra: 📸 Curso de Piano Completo ✅
```

## 📋 Formato de Respuesta de Ollama

Ollama ahora responde en formato estructurado:

```
PRODUCTOS: 1, 5, 12
KEYWORDS: curso, piano, música
```

O si no encuentra:
```
PRODUCTOS: ninguno
KEYWORDS: laptop, diseño
```

## 🔍 Extracción de Productos

```typescript
extractProductsFromAI(aiResponse, allProducts) {
  // Buscar "PRODUCTOS: 1, 5, 12"
  const productMatch = aiResponse.match(/PRODUCTOS?:\s*([^\n]+)/i);
  
  if (productMatch) {
    const numbers = productMatch[1].match(/\d+/g);
    
    // Convertir números a productos
    return numbers.map(num => allProducts[parseInt(num) - 1]);
  }
  
  return [];
}
```

## 🎯 Ventajas del Nuevo Sistema

### 1. **Ollama Ve TODO**
- Acceso a 100 productos de la BD
- Puede comparar y seleccionar
- Entiende el contexto completo

### 2. **Selección Directa**
- Ollama dice: "PRODUCTOS: 1, 5"
- Sistema muestra esos productos
- Sin búsqueda adicional

### 3. **Fallback Inteligente**
- Si Ollama no encuentra, usa keywords
- Doble capa de búsqueda
- Siempre intenta encontrar algo

### 4. **Contexto Conversacional**
- Ollama ve mensajes anteriores
- Entiende referencias ("ese", "el anterior")
- Mantiene coherencia

## 📊 Ejemplo Completo

### Input
```
Cliente: "Curso de Piano"
```

### Ollama Recibe
```
PRODUCTOS DISPONIBLES:
1. Curso de Piano Completo - 50,000 COP (DIGITAL)
2. Megapack de Música - 20,000 COP (DIGITAL)
3. Laptop HP para Diseño - 2,500,000 COP (LAPTOP)
4. Curso de Guitarra - 45,000 COP (DIGITAL)
...

CONTEXTO:
Cliente: Hola
Bot: ¡Hola! ¿En qué puedo ayudarte?
Cliente: Curso de Piano

TU TAREA:
Encuentra los productos que coincidan
```

### Ollama Responde
```
PRODUCTOS: 1
KEYWORDS: curso, piano
```

### Sistema Procesa
```typescript
// Extrae producto #1
const selectedProduct = allProducts[0]; // Curso de Piano Completo

// Muestra con foto
ProductAgent.execute() → 📸 Curso de Piano Completo
```

### Cliente Recibe
```
📸 [Foto del curso]
🎹 Curso de Piano Completo
💰 50,000 COP
📝 Aprende piano desde cero con este curso completo...
¿Te interesa? 😊
```

## 🧪 Probar Ahora

```bash
# Ejecutar test
npx tsx scripts/test-ollama-search.ts
```

### Logs Esperados

```
[SearchAgent] 🦙 Usando Ollama con acceso a base de datos
[SearchAgent] 📦 Cargados 68 productos de la BD
[Ollama] 🚀 Usando modelo: gemma2:4b
[Ollama] ⚡ Respuesta en 4500ms
[SearchAgent] 🦙 Ollama respondió: PRODUCTOS: 1 KEYWORDS: curso, piano
[SearchAgent] 🔢 Ollama seleccionó productos: 1
[SearchAgent] ✅ Ollama seleccionó 1 productos directamente
[ProductAgent] 📸 Enviando foto del producto
```

## 🎯 Resultado Final

**ANTES**:
```
Cliente: "Curso de Piano"
Bot: "No encontré productos" ❌
```

**AHORA**:
```
Cliente: "Curso de Piano"
Bot: 📸 Curso de Piano Completo
     💰 50,000 COP
     ¿Te interesa? ✅
```

## 🔧 Configuración

No necesita cambios en `.env`, solo asegúrate que Ollama esté corriendo:

```bash
ollama serve
```

## 📝 Archivos Modificados

- `src/agents/search-agent.ts`
  - `handleWithAI()` → Carga productos de BD
  - `extractProductsFromAI()` → Nuevo método
  - Prompt mejorado con lista de productos

## 🚀 Siguiente Paso

```bash
# 1. Probar el sistema
npx tsx scripts/test-ollama-search.ts

# 2. Si funciona, iniciar bot
npm run dev

# 3. Probar en WhatsApp
"Curso de Piano"
```

## ✅ Ventajas Clave

1. **Ollama tiene contexto completo** - Ve todos los productos
2. **Selección inteligente** - Elige los productos correctos
3. **Sin búsqueda ciega** - Sabe exactamente qué existe
4. **Respuestas precisas** - No inventa productos
5. **Gratis e ilimitado** - Sin costos de API

---

**¡Ahora Ollama tiene acceso REAL a la base de datos!** 🦙💾✅
