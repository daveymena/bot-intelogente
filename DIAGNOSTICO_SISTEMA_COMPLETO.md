# 🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA

## 📊 Estado Actual vs Estado Esperado

### ❌ Problemas Actuales

1. **Bot inventa información**
   - Dice "curso de inglés" cuando debería decir "Mega Pack 08: Cursos Idiomas"
   - No usa la información real de la base de datos

2. **Modelo Groq deprecado**
   - Error: `llama-3.1-70b-versatile has been decommissioned`
   - Necesita actualizar a `llama-3.3-70b-versatile`

3. **Orden de prioridades incorrecto**
   - Detecta pago ANTES de buscar producto
   - Cliente dice "link de pago del curso de piano" y no encuentra el producto

4. **SmartEnhancer envía foto incorrecta**
   - Cliente habla de inglés
   - Envía foto de Mega Pack 03 (Marketing Digital) en lugar del 08 (Idiomas)

5. **Pérdida de contexto**
   - Cliente pregunta por inglés
   - Bot cambia a Macbook Pro

## ✅ Sistema Original que Funcionaba

Según tus documentos, tenías:

1. **Sistema de Razonamiento** (`reasoning-service.ts`)
   - Análisis inteligente de intenciones
   - Contexto conversacional

2. **Formato con Emojis y Cards**
   - Respuestas visuales atractivas
   - Cards de producto con foto e información

3. **Smart Product Response Enhancer**
   - Envío automático de fotos
   - Información formateada

4. **Sistema Híbrido Inteligente**
   - Respuestas directas para casos simples
   - IA para casos complejos

## 🔧 Archivos Clave que Necesitan Revisión

### 1. Flujo Principal
- `src/lib/baileys-stable-service.ts` - Maneja mensajes entrantes
- `src/lib/ai-service.ts` - Genera respuestas con IA
- `src/lib/smart-ai-router.ts` - Decide qué sistema usar

### 2. Sistemas de Inteligencia
- `src/lib/reasoning-service.ts` - Razonamiento y análisis
- `src/lib/intelligent-product-query-system.ts` - Búsqueda inteligente
- `src/lib/product-intelligence-service.ts` - Inteligencia de productos

### 3. Mejoras Visuales
- `src/lib/smart-product-response-enhancer.ts` - Envío de fotos
- `src/lib/response-formatter.ts` - Formato de respuestas
- `src/lib/product-photo-sender.ts` - Envío de imágenes

### 4. Sistemas de Ventas
- `src/lib/universal-sales-flow.ts` - Flujo universal
- `src/lib/conversational-sales-flow.ts` - Ventas conversacionales
- `src/lib/professional-sales-engine.ts` - Motor de ventas

## 📋 Plan de Restauración

### Fase 1: Corregir Modelo Groq (URGENTE)
```typescript
// Buscar TODOS los lugares donde se usa:
// llama-3.1-70b-versatile
// Y cambiar a:
// llama-3.3-70b-versatile
```

### Fase 2: Restaurar Orden de Prioridades
```
CORRECTO:
1. Buscar producto (si se menciona)
2. Guardar en contexto
3. Detectar intención (pago, info, fotos)
4. Ejecutar acción correspondiente
```

### Fase 3: Verificar System Prompt
```
El prompt debe instruir:
- Usar SOLO información de la base de datos
- NO inventar detalles
- Mencionar nombre EXACTO del producto
- Usar precio EXACTO de la BD
```

### Fase 4: Restaurar SmartEnhancer
```
Debe:
- Detectar producto correcto del contexto
- Enviar foto del producto mencionado
- No confundir productos similares
```

### Fase 5: Mantener Contexto
```
- Guardar producto cuando se menciona
- Mantener durante toda la conversación
- Solo cambiar si cliente pide otro producto explícitamente
```

## 🎯 Sistemas que Deben Trabajar Juntos

```
Cliente envía mensaje
    ↓
BaileysStableService (recibe)
    ↓
SmartAIRouter (decide ruta)
    ↓
┌─────────────────┬──────────────────┐
│ Respuesta       │ IA Compleja      │
│ Directa         │                  │
└─────────────────┴──────────────────┘
                      ↓
            AIService.generateResponse
                      ↓
        ┌─────────────┴─────────────┐
        │                           │
    Buscar Producto          Detectar Intención
        │                           │
        └─────────────┬─────────────┘
                      ↓
            Generar Respuesta
                      ↓
        SmartProductResponseEnhancer
                      ↓
            Enviar Foto (si aplica)
                      ↓
            Respuesta al Cliente
```

## 📝 Checklist de Verificación

- [ ] Modelo Groq actualizado en TODOS los archivos
- [ ] Orden de prioridades: Producto → Intención → Acción
- [ ] System prompt instruye usar solo info real
- [ ] SmartEnhancer detecta producto correcto
- [ ] Contexto se mantiene correctamente
- [ ] Fotos se envían del producto correcto
- [ ] Formato con emojis funciona
- [ ] Enlaces dinámicos se generan
- [ ] Respuestas usan nombre exacto del producto
- [ ] Precios son exactos de la BD

## 🚨 Acciones Inmediatas Necesarias

1. **Actualizar modelo Groq** en:
   - `intelligent-payment-detector.ts`
   - Cualquier otro archivo que use Groq

2. **Revisar ai-service.ts**:
   - Verificar orden de prioridades
   - Asegurar que busca producto primero
   - Verificar system prompt

3. **Revisar smart-product-response-enhancer.ts**:
   - Verificar detección de producto
   - Asegurar que usa contexto correcto

4. **Probar flujo completo**:
   ```
   Cliente: "Hola, curso de inglés?"
   Esperado: Info del Mega Pack 08 + Foto
   
   Cliente: "Más información"
   Esperado: Más detalles del Mega Pack 08
   
   Cliente: "Dame el link"
   Esperado: Enlaces de pago del Mega Pack 08
   ```

## 💡 Recomendación

Necesitamos revisar sistemáticamente cada archivo del flujo para restaurar el sistema original que funcionaba. Los cambios que hicimos (detección inteligente de pago, orden de prioridades) son buenos, pero rompieron el flujo existente.

¿Quieres que:
1. Restaure el sistema original completo?
2. O corrija los problemas manteniendo las mejoras?

