# 🧪 GUÍA DE PRUEBAS Y CORRECCIONES DEL BOT

## 📋 Cómo Ejecutar las Pruebas

```bash
# Ejecutar pruebas completas
probar-flujo-ventas-completo.bat
```

## 🎯 Qué Prueba el Sistema

### 1. **Productos Digitales vs Físicos**
- **Digital**: Cursos, Megapacks
  - Métodos de pago: MercadoPago, PayPal, Nequi, Transferencia
  - Entrega: Acceso inmediato, descarga instantánea
  - NO debe mencionar: envío, domicilio, contraentrega

- **Físico**: Laptops, Motos, Accesorios
  - Métodos de pago: Contraentrega, Efectivo, Transferencia, Nequi
  - Entrega: Envío a domicilio, 1-3 días hábiles
  - NO debe mencionar: acceso inmediato, descarga

### 2. **Flujo de Venta Completo**
```
Saludo → Búsqueda → Información → Precio → Métodos de Pago → Confirmación → Cierre
```

### 3. **Manejo de Objeciones**
- "Es muy caro" → Ofrecer alternativas más económicas
- "No estoy seguro" → Dar más información, beneficios
- "Tienes más barato" → Buscar productos similares de menor precio

### 4. **Mantenimiento de Contexto**
- El bot debe recordar el producto durante toda la conversación
- NO debe buscar productos nuevos cuando ya hay uno en contexto
- Debe responder preguntas sobre el producto actual sin perder el hilo

## 🔍 Interpretación de Resultados

### ✅ Prueba Exitosa
```
✅ PRUEBA EXITOSA
```
El bot respondió correctamente según las expectativas.

### ❌ Prueba Fallida
```
❌ PRUEBA FALLIDA
   ❌ NO contiene: "Piano"
   ❌ SÍ contiene (no debería): "laptop"
```

**Qué significa:**
- El bot NO mencionó el producto correcto (Piano)
- El bot mencionó un producto incorrecto (laptop)

## 🛠️ Cómo Corregir Errores Comunes

### Error 1: Bot pierde el contexto
**Síntoma:** Cliente pregunta "cuánto cuesta" y el bot busca productos nuevos

**Solución:**
1. Revisar `src/agents/search-agent.ts` → `canHandleLocally()`
2. Asegurar que detecta cuando hay producto en contexto
3. Verificar que `memory.currentProduct` se mantiene

**Archivo a modificar:**
```typescript
// src/agents/search-agent.ts
canHandleLocally(message: string, memory: SharedMemory): boolean {
  // Si hay producto en contexto, NO buscar nuevos
  if (memory.currentProduct) {
    const isNewSearch = this.isExplicitNewSearch(cleanMsg);
    if (!isNewSearch) {
      return false; // Dejar que otro agente maneje
    }
  }
  // ...
}
```

### Error 2: Bot no detecta intención de pago
**Síntoma:** Cliente dice "quiero pagar" y el bot envía info del producto de nuevo

**Solución:**
1. Revisar `src/agents/deep-reasoning-agent.ts` → `analyzeUserIntent()`
2. Agregar más patrones de detección de pago
3. Verificar que `isPaymentMethodRequest()` funciona

**Archivo a modificar:**
```typescript
// src/agents/deep-reasoning-agent.ts
private static isPaymentMethodRequest(message: string): boolean {
  const paymentMethodKeywords = [
    'pagar por', 'quiero pagar', 'como pago',
    'transferencia', 'nequi', 'mercadopago', // etc.
  ];
  return paymentMethodKeywords.some(k => message.includes(k));
}
```

### Error 3: Respuesta incorrecta para tipo de producto
**Síntoma:** Producto digital menciona "envío a domicilio" o físico menciona "acceso inmediato"

**Solución:**
1. Revisar `src/agents/product-agent.ts` → `formatProductInfo()`
2. Verificar detección de categoría: `product.category === 'DIGITAL'`
3. Asegurar que las respuestas se diferencian correctamente

**Archivo a modificar:**
```typescript
// src/agents/product-agent.ts
private formatProductInfo(product: any): string {
  const isCourse = product.category === 'DIGITAL';
  
  if (isCourse) {
    // Respuesta para productos digitales
    text += `⚡ Acceso INMEDIATO después del pago\n`;
  } else {
    // Respuesta para productos físicos
    text += `🚚 Envío a domicilio\n`;
  }
}
```

### Error 4: Bot no maneja objeciones
**Síntoma:** Cliente dice "es muy caro" y el bot no ofrece alternativas

**Solución:**
1. Crear detección de objeciones en `DeepReasoningAgent`
2. Agregar lógica en `ProductAgent` para manejar objeciones
3. Buscar productos alternativos más económicos

**Archivo a modificar:**
```typescript
// src/agents/deep-reasoning-agent.ts
private static isPriceObjection(message: string): boolean {
  return message.includes('caro') || 
         message.includes('costoso') ||
         message.includes('más barato');
}
```

## 📊 Métricas de Éxito

### Objetivo: 90%+ de pruebas exitosas

- **Excelente**: 95-100% ✅
- **Bueno**: 85-94% ⚠️
- **Necesita mejoras**: <85% ❌

## 🔄 Proceso de Mejora Continua

1. **Ejecutar pruebas** → `probar-flujo-ventas-completo.bat`
2. **Identificar errores** → Ver reporte de errores
3. **Corregir código** → Modificar agentes según guía
4. **Re-ejecutar pruebas** → Verificar que se corrigió
5. **Repetir** hasta lograr 90%+ de éxito

## 📝 Agregar Nuevos Casos de Prueba

Para agregar un nuevo caso de prueba, edita:
`scripts/test-flujo-ventas-completo.ts`

```typescript
{
  nombre: 'Tu Nuevo Caso',
  tipo: 'DIGITAL', // o 'PHYSICAL'
  mensajes: [
    'Mensaje 1',
    'Mensaje 2',
    // ...
  ],
  expectativas: [
    {
      mensaje: 'Mensaje 1',
      debeContener: ['palabra1', 'palabra2'],
      noDebeContener: ['palabra3'],
      agenteEsperado: 'greeting'
    },
    // ...
  ]
}
```

## 🎯 Checklist de Verificación Manual

Después de las pruebas automáticas, verifica manualmente:

- [ ] Saludo natural sin productos
- [ ] Información breve + foto en un mensaje
- [ ] Mantiene contexto durante toda la conversación
- [ ] Diferencia productos digitales vs físicos
- [ ] Maneja objeciones de precio
- [ ] Detecta intenciones de pago correctamente
- [ ] Responde a "luego te envío" sin buscar productos
- [ ] No inventa información
- [ ] Usa información real de la base de datos

## 🚀 Próximos Pasos

1. Ejecutar pruebas ahora
2. Revisar errores detectados
3. Corregir según esta guía
4. Re-ejecutar hasta lograr 90%+
5. Probar manualmente con WhatsApp real
6. Ajustar según feedback real de clientes

---

**Recuerda:** Cada error detectado es una oportunidad de mejorar el bot. 
El objetivo es que el bot maneje ventas de forma natural y profesional. 🎯
