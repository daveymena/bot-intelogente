# 🚨 CORRECCIÓN URGENTE: BÚSQUEDA ESPECÍFICA

## ❌ PROBLEMA ACTUAL

Cuando el usuario pregunta por algo **ESPECÍFICO**:
```
Usuario: "Estoy interesado en el curso de piano"
```

El bot responde con **MÚLTIPLES PRODUCTOS INCORRECTOS**:
- Mega Pack 21: Pack Sublimado
- Mega Pack 13: Ingeniería y Arquitectura
- Mega Pack 36: Libros de Pedagogía
- Mega Pack 40: Educación
- Mega Pack 32: Universitario

**NINGUNO ES EL CURSO DE PIANO** ❌

## ✅ COMPORTAMIENTO CORRECTO

### Búsqueda ESPECÍFICA (debe mostrar 1 producto)
```
Usuario: "curso de piano"
Usuario: "laptop asus"
Usuario: "moto pulsar"
Usuario: "megapack de diseño"
```
→ **Mostrar SOLO ese producto específico**

### Búsqueda GENERAL (puede mostrar varios)
```
Usuario: "qué cursos tienes?"
Usuario: "muéstrame laptops"
Usuario: "tienes motos?"
```
→ **Mostrar lista de opciones**

## 🔧 SOLUCIÓN

### 1. Detectar si es búsqueda ESPECÍFICA vs GENERAL

**ESPECÍFICA** = Menciona nombre/característica única del producto
- "curso de piano"
- "laptop asus vivobook"
- "moto pulsar 160"
- "megapack 17"

**GENERAL** = Pregunta por categoría sin especificar
- "qué cursos tienes"
- "muéstrame laptops"
- "tienes motos"

### 2. Prioridad de búsqueda

**ORDEN DE PRIORIDAD (de mayor a menor):**

1. **Instrumentos musicales** (piano, guitarra, batería) - Prioridad 100
2. **Cursos específicos** (curso de piano, curso de inglés) - Prioridad 98
3. **Megapacks específicos** (megapack 17, pack de diseño) - Prioridad 98
4. **Productos físicos con marca** (asus, hp, pulsar) - Prioridad 95
5. **Categorías generales** (laptop, moto, curso) - Prioridad 50

### 3. Regla de oro

**SI ENCUENTRA UN PRODUCTO CON ALTA PRIORIDAD (>= 95):**
- ✅ Devolver SOLO ese producto
- ❌ NO buscar más productos
- ❌ NO mostrar lista

**SI NO ENCUENTRA NADA ESPECÍFICO:**
- Entonces sí buscar por categoría
- Mostrar lista de opciones

## 📝 CAMBIOS NECESARIOS

### En `product-intelligence-service.ts`:

```typescript
// DESPUÉS de encontrar un producto específico con alta prioridad
if (found && match.priority >= 95) {
    console.log(`✅ [ESPECÍFICO] Producto encontrado: ${found.name}`)
    // ⚠️ RETORNAR INMEDIATAMENTE - NO SEGUIR BUSCANDO
    return found
}
```

### En el flujo de conversación:

```typescript
// Si encontró UN producto específico
if (product && !isGeneralQuery) {
    // Mostrar SOLO ese producto
    return formatSingleProduct(product)
}

// Si es búsqueda general
if (isGeneralQuery) {
    // Mostrar lista de opciones
    return formatProductList(products)
}
```

## 🎯 RESULTADO ESPERADO

```
Usuario: "Estoy interesado en el curso de piano"

Bot: 🎹 Curso Completo de Piano

💰 15.000 COP
📝 Aprende piano desde cero hasta nivel avanzado
📚 Incluye partituras, ejercicios y videos

¿Te gustaría comprarlo?
```

**UN SOLO PRODUCTO - EL CORRECTO** ✅
