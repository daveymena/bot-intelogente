# 🚨 ARREGLO URGENTE: BÚSQUEDA DE PRODUCTOS

## ❌ PROBLEMA ACTUAL

**Cliente dice:** "Me interesa un portátil"
**Bot envía:** Mouse Trust Fyda ❌

**Hay 10 portátiles en la BD pero el bot envía un mouse.**

## 🔍 DIAGNÓSTICO

### 1. Sistema de Calificación NO se Ejecuta
- ✅ Código implementado en `hybrid-intelligent-response-system.ts`
- ❌ NO se llama en el flujo principal
- ❌ Bot salta directo a buscar productos

### 2. Búsqueda de Productos Está Rota
- ✅ Hay 10 portátiles en BD
- ❌ Bot devuelve un mouse
- ❌ No filtra correctamente

## 🔧 SOLUCIÓN PASO A PASO

### PASO 1: Verificar Qué Sistema Usa el Bot

**Archivo:** `src/lib/baileys-stable-service.ts`
**Método:** `handleConversationalSalesResponse()`

Verificar qué sistema llama:
```typescript
// ¿Usa este?
await this.handleHybridResponse(...)

// ¿O usa este?
await this.handleConversationalSalesResponse(...)
```

### PASO 2: Asegurar que Use el Sistema Híbrido

El sistema híbrido DEBE:
1. Llamar al orquestador
2. El orquestador decide `qualify_customer`
3. Ejecuta la pregunta de calificación
4. Solo después busca productos

**Verificar en:** `src/lib/hybrid-intelligent-response-system.ts`
```typescript
// Línea ~50-100
// PASO 3: 🎯 USAR ORQUESTADOR PARA DECIDIR ACCIÓN
const actionDecision = await AIActionOrchestrator.decideAction(...)

if (actionDecision.action === 'qualify_customer') {
  // Hacer pregunta de calificación
  return await this.generateQualificationQuestion(...)
}
```

### PASO 3: Arreglar Búsqueda de Productos

**Archivo:** `src/lib/intelligent-product-query-system.ts`
**Método:** `searchProducts()`

Debe filtrar correctamente:
```typescript
const products = await db.product.findMany({
  where: {
    OR: [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
      { category: { contains: searchTerm, mode: 'insensitive' } }
    ]
  },
  take: 10
});

// VERIFICAR que searchTerm sea "portátil" o "laptop"
// NO debe devolver "mouse"
```

## 🧪 CÓMO PROBAR

### Test 1: Verificar Búsqueda en BD
```bash
npx tsx scripts/test-busqueda-portatil.ts
```

**Resultado esperado:**
```
✅ Encontrados: 10 productos
1. Portatil Acer...
2. Portatil Asus...
...
```

### Test 2: Probar Bot Real
```bash
npm run dev
```

**Enviar:** "Me interesa un portátil"

**Resultado esperado:**
```
¡Perfecto! 💻 ¿Para qué lo vas a usar principalmente?
1️⃣ Trabajo y estudio
2️⃣ Gaming
3️⃣ Diseño gráfico
4️⃣ Uso básico
```

**Resultado actual:**
```
[Envía mouse] ❌
```

## 📋 CHECKLIST DE ARREGLO

### Verificaciones Básicas
- [ ] Verificar qué método usa baileys-service
- [ ] Confirmar que llama al sistema híbrido
- [ ] Ver logs cuando busca productos
- [ ] Verificar qué devuelve searchProducts()

### Arreglos Necesarios
- [ ] Integrar orquestador en flujo principal
- [ ] Asegurar que califique antes de buscar
- [ ] Arreglar filtro de búsqueda
- [ ] Probar con "portátil", "laptop", "computador"

### Pruebas Finales
- [ ] "Me interesa un portátil" → Debe preguntar
- [ ] "Para trabajo" → Debe mostrar 2-3 portátiles
- [ ] "El primero" → Debe confirmar selección
- [ ] "Envíame foto" → Debe enviar foto correcta

## 🔍 DEBUGGING

### Ver Logs del Bot

Cuando envías "Me interesa un portátil", busca en logs:

```
[Baileys] 📝 Mensaje recibido: "Me interesa un portátil"
[Baileys] 🧠 Procesando con sistema híbrido...
[Hybrid] 🔄 Procesando con sistema híbrido...
[Hybrid] 🧠 Intención: product_search
[Hybrid] 🎯 Consultando orquestador...
[Orchestrator] 🎯 Acción decidida: qualify_customer  ← DEBE APARECER
[Hybrid] 🎯 Calificando necesidades...
```

**Si NO aparece "qualify_customer":**
- El orquestador no se está ejecutando
- O está decidiendo mal

### Ver Qué Productos Devuelve

```
[Hybrid] 📦 Productos encontrados: 1
[Hybrid] 📦 Usando información de 1 producto(s)
```

**Si devuelve 1 producto (mouse):**
- La búsqueda está rota
- No está filtrando por "portátil"

## 💡 SOLUCIÓN RÁPIDA TEMPORAL

Si necesitas que funcione YA, puedes:

### Opción 1: Forzar Calificación en el Prompt

**Archivo:** `src/lib/hybrid-intelligent-response-system.ts`

Agregar al prompt del sistema:
```typescript
## 🚨 REGLA CRÍTICA: SIEMPRE CALIFICAR PRIMERO

Cuando el cliente pregunta por categoría general (portátil, laptop, celular, monitor):
1. NO busques productos todavía
2. HAZ una pregunta de calificación
3. ENTIENDE qué necesita
4. SOLO DESPUÉS recomienda productos específicos

Ejemplo:
Cliente: "Me interesa un portátil"
Bot: "¡Perfecto! 💻 ¿Para qué lo vas a usar principalmente?
      1️⃣ Trabajo y estudio
      2️⃣ Gaming
      3️⃣ Diseño gráfico
      4️⃣ Uso básico"
```

### Opción 2: Filtrar Mejor en Búsqueda

**Archivo:** `src/lib/intelligent-product-query-system.ts`

Mejorar el filtro:
```typescript
// Extraer palabras clave del mensaje
const keywords = message.toLowerCase().match(/portátil|portatil|laptop|computador|pc/g);

if (keywords) {
  // Buscar SOLO productos que contengan esas palabras
  const products = await db.product.findMany({
    where: {
      name: {
        contains: keywords[0],
        mode: 'insensitive'
      }
    }
  });
}
```

## 🎯 OBJETIVO FINAL

```
Cliente: "Me interesa un portátil"
    ↓
Bot: "¡Perfecto! 💻 ¿Para qué lo vas a usar?
      1️⃣ Trabajo y estudio
      2️⃣ Gaming
      3️⃣ Diseño gráfico
      4️⃣ Uso básico"
    ↓
Cliente: "Para trabajo"
    ↓
Bot: [Muestra 2-3 portátiles IDEALES para trabajo]
    📦 Portátil Asus Vivobook 15
    ⚙️ Intel Core i7
    💾 16GB RAM
    💰 $2.249.900 COP
    
    📦 Portátil Acer A15
    ⚙️ Intel Core i5
    💾 16GB RAM
    💰 $1.899.900 COP
```

## 📝 NOTAS

- El código de calificación YA ESTÁ implementado
- El código de selección YA FUNCIONA
- Solo falta CONECTAR todo en el flujo principal
- La búsqueda necesita arreglarse para filtrar correctamente

---

**Prioridad:** 🔴 URGENTE
**Impacto:** 🔴 CRÍTICO (Bot no funciona correctamente)
**Tiempo estimado:** 1-2 horas de debugging e integración
