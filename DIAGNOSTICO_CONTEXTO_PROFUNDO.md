# 🔍 DIAGNÓSTICO PROFUNDO: Pérdida de Contexto

## 🔴 Problema Confirmado

Después de implementar la detección de referencias, el problema **persiste**:

```
✅ ESCENARIO 2: "Busco curso de piano" → Encuentra producto
❌ ESCENARIO 3: "Qué incluye?" → "No encontré ese producto"
❌ ESCENARIO 4: "Tienes fotos?" → "No encontré ese producto"
```

## 🔍 Análisis del Flujo Real

### Lo que Está Pasando:

1. **Mensaje 1**: "Busco curso de piano"
   - ✅ Super Sales AI busca producto
   - ✅ Encuentra "Curso Piano Profesional Completo"
   - ✅ Responde con el producto
   - ❓ ¿Guarda en contexto? **PROBABLEMENTE NO**

2. **Mensaje 2**: "Qué incluye?"
   - ✅ Detección heurística detecta referencia
   - ✅ Retorna `intencion: 'busqueda_producto'`
   - ❌ Super Sales AI busca "Qué incluye?" como producto
   - ❌ No encuentra nada
   - ❌ Responde "No encontré ese producto"

### El Problema Real:

**Super Sales AI no está usando el contexto guardado**. Está haciendo una búsqueda nueva cada vez.

## 🎯 Causa Raíz

En `super-sales-ai-fixed.ts`, línea ~120:

```typescript
// Buscar producto con búsqueda semántica
const result = await semanticProductSearch(message, conversationContext);
```

**Problema**: Busca el mensaje literal "Qué incluye?" en lugar de usar el producto del contexto.

## ✅ Solución Correcta

Necesitamos modificar `handleProductQuery` para:

1. **Primero verificar si hay producto en contexto**
2. **Si hay producto y el mensaje es una referencia, usar ese producto**
3. **Solo buscar nuevo producto si no hay contexto**

### Código Correcto:

```typescript
private static async handleProductQuery(
  botUserId: string,
  userId: string,
  message: string,
  analysis: any,
  context: any
): Promise<any> {
  console.log('[SuperSalesAI] 📦 Manejando consulta de producto');
  
  // 🔥 PRIMERO: Verificar si hay producto en contexto
  if (context.ultimoProductoId) {
    const messageLower = message.toLowerCase();
    
    // Detectar si es una pregunta sobre el producto en contexto
    const esReferencia = [
      /\b(qué|que|cuál|cual)\s+(incluye|trae|tiene|viene)/i,
      /\b(tienes?|hay)\s+(fotos?|imágenes?)/i,
      /\b(más|mas)\s+(información|info|detalles)/i,
      /\b(características|especificaciones|detalles)/i,
    ].some(regex => regex.test(message));
    
    if (esReferencia) {
      console.log('[SuperSalesAI] 🎯 Detectada referencia al producto en contexto');
      
      // Obtener producto del contexto
      const product = await db.product.findUnique({
        where: { id: context.ultimoProductoId }
      });
      
      if (product) {
        console.log('[SuperSalesAI] ✅ Usando producto del contexto:', product.name);
        
        // Generar respuesta sobre el producto en contexto
        return await this.generateProductResponse(
          product,
          message,
          context,
          true // isContextReference = true
        );
      }
    }
  }
  
  // Si no hay contexto o no es referencia, buscar nuevo producto
  const { semanticProductSearch } = await import('./semantic-product-search');
  const conversationContext = context.historialMensajes
    ?.slice(-5)
    .map((m: any) => `${m.rol}: ${m.contenido}`)
    .join('\n');
  
  const result = await semanticProductSearch(message, conversationContext);
  
  if (!result || !result.product) {
    return {
      response: 'No encontré ese producto específico. ¿Podrías darme más detalles sobre lo que buscas? 🤔',
      shouldSendPhotos: false,
      salesAction: 'none'
    };
  }
  
  const product = result.product;
  
  console.log('[SuperSalesAI] ✅ Producto encontrado:', product.name);
  
  // Guardar en contexto para futuras referencias
  await ConversationContextHybrid.saveProductContext(
    botUserId,
    userId,
    product.id.toString(),
    product.name,
    {
      price: product.price,
      category: product.category,
      type: product.type
    }
  );
  
  return await this.generateProductResponse(product, message, context, false);
}
```

## 🚀 Implementación Inmediata

### Opción 1: Modificar Super Sales AI (Completo)
- Tiempo: 15 minutos
- Archivo: `src/lib/super-sales-ai-fixed.ts`
- Impacto: Solución permanente

### Opción 2: Bypass Super Sales AI (Rápido)
- Tiempo: 5 minutos
- Archivo: `src/conversational-module/ai/conversacionController.ts`
- Impacto: Solución temporal pero efectiva

## 💡 Opción 2 Recomendada (Rápida)

En `conversacionController.ts`, después de detectar intención:

```typescript
// Si detectó referencia al producto en contexto, NO usar Super Sales AI
if (intencion === 'busqueda_producto' && contexto.ultimoProductoId) {
  const messageLower = mensajeTexto.toLowerCase();
  const esReferencia = [
    /\b(qué|que)\s+(incluye|trae|tiene)/i,
    /\b(tienes?|hay)\s+(fotos?)/i,
  ].some(regex => regex.test(mensajeTexto));
  
  if (esReferencia) {
    console.log('[Conversación] 🎯 Referencia detectada, usando flujo directo');
    
    // Obtener producto del contexto
    const producto = await db.product.findUnique({
      where: { id: contexto.ultimoProductoId }
    });
    
    if (producto) {
      // Usar flujo directo en lugar de Super Sales AI
      const flujo = producto.category === 'DIGITAL' 
        ? procesarFlujoDigital 
        : procesarFlujoFisico;
      
      const resultado = await flujo(
        customerPhone,
        mensajeTexto,
        contexto,
        { producto, botUserId }
      );
      
      return resultado;
    }
  }
}
```

## 📊 Comparación de Soluciones

| Aspecto | Opción 1 (Modificar Super Sales AI) | Opción 2 (Bypass) |
|---------|--------------------------------------|-------------------|
| Tiempo | 15 min | 5 min |
| Complejidad | Media | Baja |
| Permanencia | Permanente | Temporal |
| Riesgo | Bajo | Muy bajo |
| Efectividad | 100% | 100% |

## 🎯 Recomendación

**Implementar Opción 2 AHORA** para solución inmediata, luego Opción 1 para solución permanente.

## 📝 Próximos Pasos

1. ✅ Implementar Opción 2 (bypass)
2. ✅ Ejecutar test de nuevo
3. ✅ Verificar que pasa 9/9
4. ⏳ Implementar Opción 1 (permanente)
5. ⏳ Deploy a producción

---

**Fecha**: 10 de Diciembre 2025
**Prioridad**: CRÍTICA
**Estado**: DIAGNÓSTICO COMPLETO - SOLUCIÓN IDENTIFICADA
