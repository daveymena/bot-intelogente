# 🚨 PROBLEMAS CRÍTICOS PENDIENTES

## Fecha: 15 Noviembre 2025

## 🔴 Problema Principal: IA Inventa Productos

### Ejemplo Real del Problema
```
Cliente: "Económico para tareas"

Bot INVENTA:
- "Portátil Básico: $800.000" ❌ NO EXISTE
- "Intel Celeron, 4GB RAM" ❌ NO EXISTE
- "Portátil Económico: $1.200.000" ❌ NO EXISTE
```

### Causa
La IA genera productos cuando NO encuentra resultados en la base de datos.

### Solución Implementada (Parcial)
✅ Agregada regla en el prompt:
```
🚨 REGLA CRÍTICA #1 - PROHIBIDO INVENTAR PRODUCTOS:
- SI NO HAY PRODUCTOS EN LA LISTA, di: "No tengo ese producto disponible"
- NUNCA inventes nombres, precios, especificaciones
```

### Lo que FALTA
⏳ Agregar verificación cuando `products.length === 0`:
```typescript
if (!hasProducts) {
  prompt += `\n\n⚠️ NO HAY PRODUCTOS DISPONIBLES\n`;
  prompt += `Debes responder: "No tengo ese producto disponible"\n`;
}
```

## 🔴 Problema 2: Cambia de Producto Sin Razón

### Ejemplo Real
```
Cliente: "Si la marca y foto" (hablando de portátiles)

Bot cambia a:
- "Mega Pack 06: Cursos Fotografía" ❌
- Envía métodos de pago del megapack ❌
```

### Causa
El sistema de búsqueda encuentra "foto" y lo asocia con "Fotografía".

### Solución Necesaria
⏳ Mejorar la búsqueda para que NO cambie de producto si:
1. Ya hay un producto en contexto
2. El cliente NO menciona explícitamente otro producto
3. Solo está pidiendo información adicional

## 🔴 Problema 3: Envía Métodos de Pago Sin Solicitud

### Ejemplo Real
```
Cliente: "Si la marca y foto"

Bot:
- Envía métodos de pago ❌
- Envía links de MercadoPago ❌
```

### Causa
El sistema detecta palabras clave y activa el flujo de pago prematuramente.

### Solución Necesaria
⏳ Solo enviar métodos de pago cuando el cliente:
1. Dice explícitamente "cómo pago", "métodos de pago", etc.
2. Selecciona un método específico
3. NO cuando solo pide información del producto

## 📊 Estado de Implementaciones

### ✅ Completado
1. Links de pago reales
2. Formatter de productos con separadores
3. Sistema de entrenamiento
4. Detección de cambio de producto (parcial)
5. Manejo de múltiples productos (implementado pero no probado)

### ⏳ Pendiente
1. **Verificación de productos vacíos** - Crítico
2. **Mejorar búsqueda de productos** - Crítico
3. **Detección de solicitud de pago** - Crítico
4. **Probar sistema de múltiples productos** - Importante
5. **Entrenar el bot** - Importante

## 🔧 Acciones Inmediatas Requeridas

### 1. Agregar Verificación de Productos Vacíos

**Archivo:** `src/lib/intelligent-conversation-engine.ts`

**Ubicación:** En la función `buildSystemPrompt()`, después de la línea donde se agregan productos

**Código a agregar:**
```typescript
} else {
  prompt += `\n\n⚠️ NO HAY PRODUCTOS DISPONIBLES EN LA BÚSQUEDA\n`;
  prompt += `RESPONDE: "Disculpa, no tengo ese producto disponible en este momento."\n`;
  prompt += `NO inventes productos, precios ni especificaciones.\n`;
}
```

### 2. Mejorar Detección de Solicitud de Pago

**Archivo:** `src/lib/intelligent-conversation-engine.ts`

**Ubicación:** En la función `generateActions()`, en la sección de `isPaymentMethodRequest`

**Cambio necesario:**
```typescript
const isPaymentMethodRequest = 
  !isFarewellMessage && 
  !isProcessQuestion && (
    // SOLO estas frases EXPLÍCITAS
    lastUserMessage.includes('cómo pago') ||
    lastUserMessage.includes('como pago') ||
    lastUserMessage.includes('métodos de pago') ||
    lastUserMessage.includes('metodos de pago') ||
    lastUserMessage.includes('formas de pago') ||
    lastUserMessage.includes('quiero pagar') ||
    lastUserMessage === 'pago' ||
    lastUserMessage === 'pagar'
  );
```

**ELIMINAR:**
- `lastUserMessage.includes('puedo pagar')`
- `lastUserMessage.includes('aceptan')`
- Cualquier detección ambigua

### 3. Mejorar Búsqueda de Productos

**Archivo:** `src/lib/intelligent-conversation-engine.ts`

**Ubicación:** En la función `searchRelevantProducts()`

**Cambio necesario:**
- NO buscar si el cliente solo pide información adicional
- Mantener producto actual si ya hay uno en contexto
- Solo buscar si menciona EXPLÍCITAMENTE un producto nuevo

## 🧪 Casos de Prueba Necesarios

### Test 1: Sin Productos Disponibles
```
Input: "Portátil económico para tareas"
Productos encontrados: 0
Expected: "Disculpa, no tengo ese producto disponible"
Actual: INVENTA productos ❌
```

### Test 2: Solicitud de Información
```
Input: "Si la marca y foto"
Contexto: Portátil Acer en memoria
Expected: Info del Acer + foto
Actual: Cambia a Megapack Fotografía ❌
```

### Test 3: Métodos de Pago
```
Input: "Si la marca y foto"
Expected: NO enviar métodos de pago
Actual: Envía métodos de pago ❌
```

## 📝 Prioridades

### 🔴 CRÍTICO (Hacer HOY)
1. Agregar verificación de productos vacíos
2. Mejorar detección de solicitud de pago
3. Probar y ajustar

### 🟡 IMPORTANTE (Hacer MAÑANA)
1. Mejorar búsqueda de productos
2. Probar sistema de múltiples productos
3. Entrenar el bot

### 🟢 OPCIONAL (Hacer DESPUÉS)
1. Optimizar prompts
2. Agregar más casos de prueba
3. Documentar flujos

## 💡 Recomendación

**DETENER desarrollo de nuevas features** y **ARREGLAR estos 3 problemas críticos** primero:

1. ✅ Productos vacíos → No inventar
2. ✅ Búsqueda → No cambiar sin razón
3. ✅ Pago → Solo cuando se solicita

Una vez arreglados, el bot funcionará correctamente y podrás:
- Probarlo con usuarios reales
- Entrenarlo
- Desplegarlo en producción

---

**Estado:** 🔴 CRÍTICO  
**Acción:** ARREGLAR ANTES DE CONTINUAR  
**Tiempo estimado:** 2-3 horas
