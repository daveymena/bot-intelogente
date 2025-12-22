# ⚠️ PROBLEMA DETECTADO: Pérdida de Contexto en Conversación

## 🔴 Problema

El bot **pierde el contexto del producto** después del segundo mensaje en la conversación.

### Evidencia del Test

```
✅ ESCENARIO 2: "Busco un curso de piano para principiantes"
   Bot: "Curso Piano Profesional Completo... 60.000 COP"
   ✓ Encontró el producto

❌ ESCENARIO 3: "Qué incluye el curso?"
   Bot: "No encontré ese producto específico"
   ✗ Perdió el contexto

❌ ESCENARIO 4: "Tienes fotos del curso?"
   Bot: "No encontré ese producto específico"
   ✗ Perdió el contexto

✅ ESCENARIO 6: "Cómo puedo pagar?"
   Bot: "Generando link para Curso Piano Profesional Completo"
   ✓ Recuperó el contexto (por keyword "pagar")
```

## 🔍 Causa Raíz

El sistema de **contexto conversacional** no está guardando correctamente el producto seleccionado entre mensajes.

### Flujo Actual (Incorrecto):

```
Mensaje 1: "curso de piano"
  → Busca producto ✓
  → Guarda en contexto ✓
  → Responde con producto ✓

Mensaje 2: "qué incluye el curso?"
  → Lee contexto ❌ (no encuentra producto guardado)
  → Intenta buscar "qué incluye el curso" como producto ❌
  → Responde "no encontré ese producto" ❌
```

### Flujo Esperado (Correcto):

```
Mensaje 1: "curso de piano"
  → Busca producto ✓
  → Guarda en contexto ✓
  → Responde con producto ✓

Mensaje 2: "qué incluye el curso?"
  → Lee contexto ✓
  → Detecta que pregunta sobre producto anterior ✓
  → Responde con detalles del producto guardado ✓
```

## 🎯 Archivos Involucrados

1. **`src/lib/conversation-context-hybrid.ts`** - Gestión de contexto
2. **`src/conversational-module/ai/conversacionController.ts`** - Controlador principal
3. **`src/conversational-module/utils/obtenerContexto.ts`** - Obtención de contexto
4. **`src/conversational-module/utils/detectarIntencion.ts`** - Detección de intención

## 🔧 Solución Propuesta

### Opción 1: Mejorar Detección de Referencias (Rápido)

Actualizar `detectarIntencion.ts` para detectar referencias al producto anterior:

```typescript
// Detectar referencias al producto en contexto
if (contexto.productoActual) {
  const referencias = [
    'incluye', 'tiene', 'trae', 'viene con',
    'foto', 'imagen', 'ver',
    'precio', 'cuesta', 'valor',
    'ese', 'este', 'el curso', 'el producto'
  ];
  
  const tieneReferencia = referencias.some(ref => 
    mensajeLower.includes(ref)
  );
  
  if (tieneReferencia && !mensajeLower.includes('busco')) {
    return {
      tipo: 'informacion_producto',
      productoId: contexto.productoActual.id,
      producto: contexto.productoActual
    };
  }
}
```

### Opción 2: Mejorar Persistencia de Contexto (Completo)

Actualizar `conversation-context-hybrid.ts` para:

1. Guardar producto con TTL más largo (30 minutos)
2. Incluir producto en TODOS los contextos
3. Limpiar solo cuando usuario busca nuevo producto

```typescript
async guardarProductoEnContexto(userId: string, producto: any) {
  const contexto = await this.obtenerContexto(userId);
  
  contexto.productoActual = {
    ...producto,
    timestamp: Date.now(),
    ttl: 30 * 60 * 1000 // 30 minutos
  };
  
  await this.guardarContexto(userId, contexto);
}

async obtenerProductoActual(userId: string) {
  const contexto = await this.obtenerContexto(userId);
  
  if (contexto.productoActual) {
    const edad = Date.now() - contexto.productoActual.timestamp;
    
    if (edad < contexto.productoActual.ttl) {
      return contexto.productoActual;
    }
  }
  
  return null;
}
```

### Opción 3: Usar Prompt Mejorado (Inmediato)

Actualizar el prompt en `promptBuilder.ts` para incluir producto actual:

```typescript
if (contexto.productoActual) {
  prompt += `\n\n📦 PRODUCTO EN CONVERSACIÓN:
Nombre: ${contexto.productoActual.nombre}
Precio: ${contexto.productoActual.precio}
Descripción: ${contexto.productoActual.descripcion}

Si el usuario pregunta sobre "el curso", "ese producto", "incluye", "fotos", etc.,
está preguntando sobre este producto específico.`;
}
```

## 🚀 Implementación Recomendada

### Paso 1: Fix Rápido (5 minutos)

Actualizar el prompt para incluir producto actual explícitamente.

### Paso 2: Fix Completo (15 minutos)

Mejorar la detección de referencias y persistencia de contexto.

### Paso 3: Testing (5 minutos)

Ejecutar el test de nuevo para verificar:

```bash
node test-conversacion-real-completa.js
```

## 📊 Resultado Esperado Después del Fix

```
✅ ESCENARIO 2: "Busco un curso de piano"
   ✓ Encontró el producto

✅ ESCENARIO 3: "Qué incluye el curso?"
   ✓ Mantiene contexto del producto
   ✓ Responde con detalles del curso

✅ ESCENARIO 4: "Tienes fotos del curso?"
   ✓ Mantiene contexto del producto
   ✓ Responde sobre fotos del curso

✅ ESCENARIO 5: "Me parece caro"
   ✓ Mantiene contexto del producto
   ✓ Justifica valor del curso específico
```

## 🔍 Cómo Verificar el Problema

### Ver logs del servidor:

Busca en los logs:

```
[Contexto] Producto actual: undefined
[Búsqueda] No se encontró producto para: "qué incluye el curso"
```

Esto confirma que el contexto no se está guardando/recuperando correctamente.

## 📝 Archivos a Revisar

1. `src/lib/conversation-context-hybrid.ts` - Líneas 50-100
2. `src/conversational-module/ai/conversacionController.ts` - Líneas 30-80
3. `src/conversational-module/utils/detectarIntencion.ts` - Líneas 20-60
4. `src/conversational-module/ai/promptBuilder.ts` - Líneas 10-50

## 🎯 Prioridad

**ALTA** - Este problema afecta la experiencia de usuario en conversaciones reales.

El bot debe poder mantener una conversación fluida sobre un producto sin que el usuario tenga que repetir "curso de piano" en cada mensaje.

## 💡 Workaround Temporal

Mientras se implementa el fix, el usuario puede:

1. Mencionar el producto en cada pregunta:
   - ❌ "Qué incluye el curso?"
   - ✅ "Qué incluye el curso de piano?"

2. Usar keywords de pago para recuperar contexto:
   - ✅ "Cómo puedo pagar?" (funciona porque detecta intención de pago)

---

**Fecha**: 10 de Diciembre 2025
**Prioridad**: ALTA
**Estado**: DETECTADO - PENDIENTE FIX
