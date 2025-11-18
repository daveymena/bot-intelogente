# 🚀 HACER AHORA - CORRECCIONES BASADAS EN AUDITORÍA REAL

**Auditoría completada**: ✅  
**Problemas encontrados**: 19 (10 críticos)  
**Tiempo estimado**: 2.5 horas

---

## ⚡ PASO 1: Configurar Variables de Entorno (2 minutos)

Abrir `.env` y agregar:

```env
# PayPal - Links Dinámicos
PAYPAL_LINK_TEMPLATE=https://www.paypal.com/ncp/payment/TU_BUSINESS_ID_AQUI
PAYPAL_BUSINESS_ID=tu_business_id_aqui
```

**¿Dónde conseguir tu Business ID de PayPal?**
1. Ir a https://www.paypal.com/businessprofile/settings
2. Copiar tu Business ID
3. Pegar en las variables de arriba

---

## ⚡ PASO 2: Configurar Links de Pago Masivamente (5 minutos)

```bash
npx tsx scripts/configurar-links-pago-masivo.ts
```

Esto configurará automáticamente los 288 productos sin links de pago.

---

## ⚡ PASO 3: Modificar Código (2 horas)

### 3.1 Modificar `src/agents/shared-memory.ts`

**Buscar el interface Memory y agregar**:

```typescript
interface Memory {
  conversationHistory: Message[];
  lastIntent: string;
  selectedProduct?: {  // ← AGREGAR ESTO
    id: string;
    name: string;
    price: number;
    timestamp: Date;
  };
}
```

**Agregar estos métodos a la clase SharedMemory**:

```typescript
static setSelectedProduct(userId: string, product: any) {
  const memory = this.getMemory(userId);
  memory.selectedProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    timestamp: new Date()
  };
}

static getSelectedProduct(userId: string) {
  const memory = this.getMemory(userId);
  if (memory.selectedProduct) {
    const elapsed = Date.now() - memory.selectedProduct.timestamp.getTime();
    if (elapsed < 30 * 60 * 1000) { // 30 minutos
      return memory.selectedProduct;
    }
  }
  return null;
}

static clearSelectedProduct(userId: string) {
  const memory = this.getMemory(userId);
  memory.selectedProduct = undefined;
}
```

---

### 3.2 Modificar `src/agents/product-agent.ts`

**Buscar donde se muestra información del producto y agregar**:

```typescript
// Después de mostrar info del producto, guardar en contexto
SharedMemory.setSelectedProduct(userId, {
  id: product.id,
  name: product.name,
  price: product.price
});
```

---

### 3.3 Modificar `src/agents/payment-agent.ts`

**Buscar donde se genera el link de pago y reemplazar**:

```typescript
// ❌ ELIMINAR ESTO:
const paypalEmail = process.env.PAYPAL_EMAIL;
response = `Puedes pagar a: ${paypalEmail}`;

// ✅ AGREGAR ESTO:
import { SharedMemory } from './shared-memory';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// En el método handlePaymentRequest:
const product = SharedMemory.getSelectedProduct(userId);

if (!product) {
  return {
    response: "¿Para qué producto quieres el link de pago? 🤔",
    needsClarification: true
  };
}

// Obtener link del producto
const productData = await prisma.product.findUnique({
  where: { id: product.id },
  select: {
    paymentLinkPayPal: true,
    paymentLinkMercadoPago: true,
    paymentLinkCustom: true
  }
});

const paypalLink = productData?.paymentLinkPayPal;

if (!paypalLink) {
  return {
    response: "Este producto aún no tiene link de pago configurado. Contacta al administrador.",
    needsAdmin: true
  };
}

const response = `¡Perfecto! Para el ${product.name} 💳

💰 Precio: $${product.price.toLocaleString()} COP

🔗 Link de pago PayPal:
${paypalLink}

Haz clic en el link, completa el pago y envíame el comprobante 📸✨`;

return { response, success: true };
```

---

### 3.4 Modificar `src/lib/product-intelligence-service.ts`

**Buscar MIN_SCORE y cambiar**:

```typescript
// ❌ ANTES:
const MIN_SCORE = 0.3;

// ✅ DESPUÉS:
const MIN_SCORE = 0.6;
```

**Buscar donde se filtran los resultados y agregar validación de tags**:

```typescript
.filter(r => {
  // Score mínimo
  if (r.score < MIN_SCORE) return false;
  
  // Validar tags
  const queryWords = query.toLowerCase().split(' ');
  const productTags = r.producto.tags ? JSON.parse(r.producto.tags) : [];
  
  const hasMatchingTag = queryWords.some(word => 
    productTags.some((tag: string) => tag.toLowerCase().includes(word))
  );
  
  // Permitir si tiene tag coincidente O score muy alto
  return hasMatchingTag || r.score > 0.8;
})
```

---

### 3.5 Modificar `src/agents/search-agent.ts`

**Al inicio del método search(), agregar**:

```typescript
import { SharedMemory } from './shared-memory';

// Al inicio del método search:
const selected = SharedMemory.getSelectedProduct(userId);

if (selected) {
  // Usuario ya tiene producto seleccionado
  return {
    products: [selected],
    message: `Hablamos del ${selected.name}. ¿Qué más quieres saber? 😊`
  };
}

// Si no hay producto seleccionado, buscar normalmente...
```

---

### 3.6 Modificar `src/agents/orchestrator.ts`

**Buscar donde se limpia el contexto y modificar**:

```typescript
// ❌ NO hacer esto hasta que se complete la venta:
// SharedMemory.clearMemory(userId);

// ✅ Solo limpiar si:
// 1. Usuario dice "gracias", "adiós", etc.
// 2. Usuario pregunta por otro producto diferente
// 3. Han pasado más de 30 minutos

// Ejemplo:
if (userMessage.includes('gracias') || userMessage.includes('adiós')) {
  SharedMemory.clearSelectedProduct(userId);
}
```

---

## ⚡ PASO 4: Verificar (10 minutos)

```bash
# 1. Test específico del problema
npx tsx scripts/test-problema-imagen.ts

# Debe mostrar:
# ✅ Producto encontrado
# ✅ Links de pago: Configurados ✅
# ✅ Contexto mantenido
# ✅ NO productos irrelevantes

# 2. Test de PayPal
npx tsx scripts/test-paypal-dinamico.ts

# 3. Test de búsqueda
npx tsx scripts/test-busqueda-simple.ts

# 4. Probar con bot real
npm run dev
```

---

## ⚡ PASO 5: Probar Conversación Real (5 minutos)

Iniciar el bot y probar esta conversación EXACTA:

```
Tú: "MegaPack de idiomas"

Bot debe:
✅ Dar información del MegaPack de idiomas
✅ Guardar producto en contexto

───────────────────────────────────

Tú: "mercado libre"

Bot debe:
✅ Recordar que hablabas del MegaPack de idiomas
✅ Decir "Para el MegaPack de Idiomas..."
✅ Enviar LINK de PayPal (no email)
✅ NO mostrar Curso de Piano ni Auriculares
```

---

## 📊 CHECKLIST COMPLETO

### Configuración
- [ ] Agregar `PAYPAL_LINK_TEMPLATE` a `.env`
- [ ] Agregar `PAYPAL_BUSINESS_ID` a `.env`
- [ ] Ejecutar `npx tsx scripts/configurar-links-pago-masivo.ts`

### Código
- [ ] Modificar `src/agents/shared-memory.ts` (agregar selectedProduct)
- [ ] Modificar `src/agents/product-agent.ts` (guardar en contexto)
- [ ] Modificar `src/agents/payment-agent.ts` (usar link dinámico)
- [ ] Modificar `src/lib/product-intelligence-service.ts` (MIN_SCORE = 0.6)
- [ ] Modificar `src/agents/search-agent.ts` (verificar contexto)
- [ ] Modificar `src/agents/orchestrator.ts` (no limpiar contexto)

### Verificación
- [ ] Ejecutar `npx tsx scripts/test-problema-imagen.ts`
- [ ] Verificar que NO hay productos irrelevantes
- [ ] Verificar que links de pago funcionan
- [ ] Probar conversación real: "MegaPack idiomas" → "mercado libre"
- [ ] Verificar que bot recuerda el producto
- [ ] Verificar que envía link de PayPal (no email)

---

## 🎯 RESULTADO ESPERADO

Después de todas las correcciones:

```
Usuario: "MegaPack de idiomas"
Bot: ✅ [Da información del MegaPack de idiomas]
     ✅ [Guarda en contexto]

Usuario: "mercado libre"
Bot: ✅ "¡Perfecto! Para el MegaPack de Idiomas 💳"
     ✅ "💰 Precio: $60,000 COP"
     ✅ "🔗 Link de pago: https://paypal.com/..."
     ✅ [Recuerda el producto]
     ✅ [NO muestra productos irrelevantes]
```

---

## 📁 ARCHIVOS DE REFERENCIA

- **Resultados de auditoría**: `RESULTADOS_AUDITORIA_REAL.md`
- **Reporte JSON**: `auditoria-reporte.json`
- **Pasos detallados**: `PASOS_FINALES_AUDITORIA.txt`
- **Resumen visual**: `RESUMEN_VISUAL_PROBLEMAS.md`

---

## ⏱️ TIEMPO ESTIMADO

- Configuración: 15 min
- Código: 2 horas
- Verificación: 15 min
- **TOTAL**: 2.5 horas

---

## 🚀 EMPEZAR AHORA

```bash
# 1. Configurar .env
code .env

# 2. Configurar links de pago
npx tsx scripts/configurar-links-pago-masivo.ts

# 3. Modificar archivos según PASO 3

# 4. Verificar
npx tsx scripts/test-problema-imagen.ts
```

---

**Prioridad**: 🔴 CRÍTICA  
**Impacto**: Alto - Afecta ventas directamente  
**Deadline**: HOY
