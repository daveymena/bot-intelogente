# 🔍 AUDITORÍA COMPLETA DEL BOT - EJECUTAR AHORA

## Problema Identificado en la Imagen

El bot tiene 3 problemas críticos:

1. **Pérdida de contexto**: Usuario pregunta por "MegaPack de idiomas", luego por "mercado libre" y el bot olvida el producto
2. **PayPal por email**: Está enviando email en vez del link dinámico
3. **Productos irrelevantes**: Muestra "Curso de Piano" y "Auriculares" cuando pregunta por idiomas

## Pasos para Ejecutar la Auditoría

### 1. Auditoría Completa (Encuentra TODOS los problemas)

```bash
npx tsx scripts/auditoria-bot-completa.ts
```

Esto generará:
- ✅ Reporte en consola con todos los problemas
- ✅ Archivo `auditoria-reporte.json` con detalles
- ✅ Plan de acción priorizado

### 2. Test Específico del Problema de la Imagen

```bash
npx tsx scripts/test-problema-imagen.ts
```

Esto verificará:
- ✅ Si el MegaPack de idiomas existe
- ✅ Si se mantiene el contexto
- ✅ Si PayPal usa link dinámico
- ✅ Si NO aparecen productos irrelevantes

### 3. Corrección Automática de Problemas Críticos

```bash
npx tsx scripts/corregir-problemas-criticos.ts
```

Esto corregirá automáticamente:
- ✅ Productos sin métodos de pago
- ✅ Configuración de PayPal
- ✅ Identificación de productos duplicados

## Problemas Críticos Identificados

### 🔴 CRÍTICO 1: Pérdida de Contexto

**Ubicación**: `src/agents/shared-memory.ts`

**Problema**: El bot no mantiene el producto seleccionado cuando el usuario pregunta por método de pago

**Solución**:
```typescript
// Agregar a SharedMemory
interface Memory {
  selectedProduct?: {
    id: number;
    name: string;
    price: number;
  };
  // ... resto
}

// Guardar cuando se selecciona producto
static setSelectedProduct(userId: string, product: any) {
  const memory = this.getMemory(userId);
  memory.selectedProduct = {
    id: product.id,
    name: product.name,
    price: product.price
  };
}

// Recuperar antes de generar link de pago
static getSelectedProduct(userId: string) {
  return this.getMemory(userId).selectedProduct;
}
```

### 🔴 CRÍTICO 2: PayPal por Email

**Ubicación**: `src/agents/payment-agent.ts`

**Problema**: Está usando `PAYPAL_EMAIL` en vez de link dinámico

**Solución**:
```typescript
// ANTES (INCORRECTO):
const paypalEmail = process.env.PAYPAL_EMAIL;
response = `Puedes pagar a: ${paypalEmail}`;

// DESPUÉS (CORRECTO):
import { generatePaymentLink } from '@/lib/payment-link-generator';

const paypalLink = await generatePaymentLink({
  productId: product.id,
  amount: product.price,
  method: 'PAYPAL'
});

response = `🔗 Link de pago: ${paypalLink}`;
```

### 🔴 CRÍTICO 3: Productos Irrelevantes

**Ubicación**: `src/lib/product-intelligence-service.ts`

**Problema**: El scoring no filtra bien productos no relacionados

**Solución**:
```typescript
// Agregar filtro de score mínimo
const MIN_SCORE = 0.6;

const resultados = productos
  .map(p => ({
    producto: p,
    score: calcularScore(query, p)
  }))
  .filter(r => r.score >= MIN_SCORE) // ← AGREGAR ESTO
  .sort((a, b) => b.score - a.score);
```

## Verificación Final

Después de aplicar las correcciones, ejecutar:

```bash
# 1. Test de contexto
npx tsx scripts/test-contexto-producto-corregido.ts

# 2. Test de PayPal dinámico
npx tsx scripts/test-paypal-dinamico.ts

# 3. Test de búsqueda
npx tsx scripts/test-busqueda-simple.ts

# 4. Test completo de conversación
npx tsx scripts/test-bot-conversacion-real.js
```

## Archivos a Modificar

1. **src/agents/shared-memory.ts** - Agregar persistencia de producto
2. **src/agents/payment-agent.ts** - Usar link dinámico de PayPal
3. **src/agents/search-agent.ts** - Mejorar filtrado de productos
4. **src/lib/product-intelligence-service.ts** - Aumentar score mínimo
5. **src/agents/orchestrator.ts** - Validar contexto antes de cambiar de agente

## Variables de Entorno Requeridas

Verificar que estén en `.env`:

```env
# PayPal - DEBE usar link dinámico
PAYPAL_LINK_TEMPLATE=https://www.paypal.com/ncp/payment/YOUR_BUSINESS_ID
PAYPAL_BUSINESS_ID=tu_business_id

# NO usar esto (obsoleto):
# PAYPAL_EMAIL=tu@email.com  ← ELIMINAR
```

## Próximos Pasos

1. ✅ Ejecutar auditoría completa
2. ✅ Revisar reporte generado
3. ✅ Aplicar correcciones automáticas
4. ✅ Modificar archivos manualmente
5. ✅ Ejecutar tests de verificación
6. ✅ Probar con conversación real

## Comandos Rápidos

```bash
# Todo en uno
npx tsx scripts/auditoria-bot-completa.ts && \
npx tsx scripts/corregir-problemas-criticos.ts && \
npx tsx scripts/test-problema-imagen.ts
```

---

**Fecha**: 2024-11-17
**Prioridad**: 🔴 CRÍTICA
**Tiempo estimado**: 30-45 minutos
