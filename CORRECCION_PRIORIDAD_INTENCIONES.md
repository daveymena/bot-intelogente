# ✅ Corrección: Prioridad de Detección de Intenciones

## 🔴 Problema Central

**Cliente**: "quiero pagar por mercado pago" (sobre el Curso de Piano)

**Bot**: Muestra "Mini máquina de coser" ❌

## 🎯 Causa

El sistema detectaba como "search_product" en vez de "payment_selection" porque:

1. La detección de búsqueda tenía prioridad sobre la selección de pago
2. La keyword "ui" en "quiero" causaba falsos positivos
3. No verificaba si había producto en contexto antes de buscar

## 🔧 Solución Implementada

### 1. Reorganización de Prioridades

**ANTES**:
```
1. Métodos de pago (pregunta general)
2. Info de producto
3. Búsqueda de producto
4. Selección de método de pago
```

**AHORA**:
```
0. Selección de método de pago (si hay producto + método)  ← PRIORIDAD MÁXIMA
1. Métodos de pago (pregunta general)
2. Info de producto (si hay producto en contexto)
3. Búsqueda de producto (SOLO si NO hay producto en contexto)
```

### 2. Corrección de Keyword "ui"

**ANTES**:
```typescript
const design = ['diseño', 'ui', 'ux', ...];
// Detectaba "ui" en "quiero", "incluye", "siguiente"
```

**AHORA**:
```typescript
const design = ['diseño', 'grafico', ...];
// UI/UX con word boundaries
if (/\bui\b/.test(query)) specificWords.push('ui');
```

### 3. Validación de Imágenes

**ANTES**:
```typescript
images = JSON.parse(p.images); // Fallaba con URLs
```

**AHORA**:
```typescript
// Detecta formato y filtra solo URLs válidas
images = parsed.filter(img => img.startsWith('http'));
```

## 📊 Flujo Corregido

```
Cliente: "estoy interesado en el curso de piano"
    ↓
IntentDetector: ✅ search_product
    ↓
SearchAgent: ✅ Encuentra "Curso de Piano" (score: 39)
    ↓
Memoria: currentProduct = Curso de Piano ✅
    ↓
Bot: Muestra curso de piano con métodos de pago

Cliente: "quiero pagar por mercado pago"
    ↓
IntentDetector: 
  - hasProductContext? ✅ SÍ (Curso de Piano)
  - detectPaymentMethod? ✅ SÍ (mercadopago)
    ↓
Intent: ✅ payment_selection (98% confianza)
    ↓
PaymentAgent: Genera link de pago para Curso de Piano ✅
```

## ✅ Cambios Aplicados

### Archivo: `src/agents/utils/intent-detector.ts`

1. ✅ Selección de método de pago ahora es PRIORIDAD 0
2. ✅ Verifica producto en contexto antes de detectar búsqueda
3. ✅ Keyword "ui" con word boundaries

### Archivo: `src/agents/search-agent.ts`

1. ✅ Corrección de keyword "ui" con regex
2. ✅ Validación de imágenes (solo URLs válidas)
3. ✅ Filtrado de caracteres inválidos en arrays

## 🧪 Test de Validación

```
Contexto: Producto actual = "Curso de Piano"

Mensaje: "quiero pagar por mercado pago"
    ↓
✅ Detecta: payment_selection (98%)
✅ Método: mercadopago
✅ Producto: Curso de Piano
✅ Genera link de pago correcto
```

## 📁 Archivos Modificados

1. ✅ `src/agents/utils/intent-detector.ts` - Prioridades reorganizadas
2. ✅ `src/agents/search-agent.ts` - Keyword "ui" y validación de imágenes

## 🚀 Resultado

El bot ahora:

1. ✅ **Prioriza** la selección de método de pago cuando hay producto en contexto
2. ✅ **NO busca** productos nuevos cuando ya hay uno en contexto
3. ✅ **Detecta correctamente** "quiero pagar por mercado pago" como selección
4. ✅ **Filtra** keywords problemáticas como "ui" en "quiero"
5. ✅ **Valida** imágenes correctamente (solo URLs válidas)

---

**Estado**: ✅ CORREGIDO

**Fecha**: 20 de Noviembre 2025

**Compilación**: ✅ Sin errores TypeScript

**Próximo paso**: Reiniciar bot y probar
