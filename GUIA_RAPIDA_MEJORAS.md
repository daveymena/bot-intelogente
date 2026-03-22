# 🚀 GUÍA RÁPIDA - CÓMO USAR LAS MEJORAS

## 1️⃣ Configuración Inicial

### Instala dependencias
```bash
npm install
```

### Configura variables de entorno
```bash
cp .env.example .env
# Edita .env y añade tu GROQ_API_KEY
```

### Inicializa la base de datos
```bash
npm run db:push
```

---

## 2️⃣ Prueba el Bot Refactorizado

### Opción A: Tests automatizados
```bash
npx tsx scripts/test-bot-refactored.ts
```

Esto ejecutará:
- ✅ Test del motor conversacional
- ✅ Test del pipeline de ventas
- ✅ Test de manejo de objeciones
- ✅ Test de cierre de venta
- ✅ Test de transiciones de etapas

### Opción B: En tu aplicación
```typescript
import { createConversationalEngine } from '@/lib/bot/conversational-engine';
import { createSalesFlowManager } from '@/lib/bot/sales-flow-manager';

const engine = createConversationalEngine(process.env.GROQ_API_KEY!);
const salesManager = createSalesFlowManager(process.env.GROQ_API_KEY!);
```

---

## 3️⃣ Flujo Típico de Venta

### Paso 1: Inicia una conversación
```typescript
const result = await salesManager.initiateSale(
  {
    id: 'customer_123',
    name: 'Juan',
    phone: '3001234567',
    interests: ['laptops', 'gaming'],
    budget: 3000000
  },
  '¿Tienes laptops gaming?'
);

console.log(result.opportunityId);  // Guarda este ID
console.log(result.message);         // Respuesta del bot
console.log(result.stage);           // 'needs_analysis'
```

### Paso 2: Continúa la conversación
```typescript
const next = await salesManager.continueConversation(
  result.opportunityId,
  '¿Cuánto cuesta la mejor que tienes?'
);

console.log(next.message);          // Bot responde con precios
console.log(next.stage);            // 'pricing'
```

### Paso 3: Cierra la venta
```typescript
const closure = await salesManager.closeSale(
  result.opportunityId,
  [products]
);

console.log(closure.paymentLink);        // Link para pagar
console.log(closure.confirmationMessage); // Mensaje para cliente
```

---

## 4️⃣ Usa los Nuevos Componentes UI

### Chat Premium
```tsx
import { PremiumChatInterface } from '@/components/bot/PremiumChatInterface';

export default function ChatPage() {
  return <PremiumChatInterface />;
}
```

### Tarjeta de Negocio
```tsx
import { BusinessPreview } from '@/components/bot/PremiumChatInterface';

export default function InfoPage() {
  return (
    <BusinessPreview 
      businessInfo={{
        name: "Tecnovariedades D&S",
        phone: "+57 300 123 4567",
        address: "Cra 5 #12-34, Bogotá",
        hours: "Lun-Sab 8am-6pm",
        rating: 4.8
      }}
    />
  );
}
```

---

## 5️⃣ API Endpoints

### Procesar Mensaje
```bash
POST /api/bot/message
Content-Type: application/json

{
  "opportunityId": "opp_123...",  // Opcional
  "message": "¿Tienes laptops?",
  "customer": {
    "id": "cust_123",
    "name": "Juan",
    "phone": "3001234567",
    "interests": ["laptops"],
    "budget": 3000000
  }
}

Response:
{
  "success": true,
  "opportunityId": "opp_123...",
  "stage": "product_discovery",
  "message": "Perfecto, tengo varias opciones...",
  "recommendedProducts": [...]
}
```

### Cerrar Venta
```bash
POST /api/bot/close
Content-Type: application/json

{
  "opportunityId": "opp_123...",
  "products": [...]
}

Response:
{
  "success": true,
  "paymentLink": "https://pago.app/checkout/...",
  "confirmationMessage": "¡Excelente! Tu pedido...",
  "deliveryInfo": "Se entregará en 1-3 días..."
}
```

---

## 6️⃣ Personalización de Prompts

Todos los prompts están centralizados en:
```typescript
// src/lib/bot/conversational-engine.ts
const PROFESSIONAL_PROMPTS = {
  system: "...",
  greeting: "...",
  needsAnalysis: "...",
  productDiscovery: "...",
  objectionHandling: "...",
  pricing: "...",
  closing: "..."
}
```

Edita estos prompts para ajustar al tono de tu negocio.

---

## 7️⃣ Añade Productos

```typescript
const salesManager = createSalesFlowManager(groqApiKey);

salesManager.addProduct({
  id: 'prod_laptop_1',
  name: 'Laptop Gaming ASUS ROG',
  description: 'Potente laptop para gaming',
  price: 2500000,
  category: 'laptops',
  images: ['https://example.com/image.jpg'],
  stock: 10,
  digitalDelivery: false,
  benefits: [
    'RTX 4080',
    '32GB RAM',
    'Pantalla 165Hz',
    'SSD 1TB'
  ]
});

// O desde API
fetch('/api/bot/products', {
  method: 'POST',
  body: JSON.stringify({
    products: [...]
  })
});
```

---

## 8️⃣ Monitorea Oportunidades

```typescript
const opportunity = salesManager.getOpportunity(opportunityId);

console.log({
  stage: opportunity.stage,
  conversionProbability: opportunity.conversionProbability,
  products: opportunity.products,
  value: opportunity.value,
  lastInteraction: opportunity.lastInteraction
});
```

---

## 🎯 Mejores Prácticas

### 1. Sé específico en las necesidades del cliente
```typescript
// ❌ Malo
customer.interests = ['laptops'];

// ✅ Bueno
customer.interests = ['gaming', 'streaming', 'portabilidad'];
```

### 2. Usa presupuestos realistas
```typescript
// El bot recomendará productos dentro del presupuesto
customer.budget = 3000000;
```

### 3. Personaliza los prompts
Edita `PROFESSIONAL_PROMPTS` en `conversational-engine.ts` para ajustar al tono de tu negocio.

### 4. Monitorea la probabilidad de conversión
```typescript
if (opportunity.conversionProbability > 0.7) {
  // El cliente está listo para comprar
}
```

### 5. Usa el historial completo
Guarda `opportunityId` para mantener contexto en la conversación.

---

## 🧪 Pruebas Rápidas

```bash
# Test unitario
npm run test:bot

# Test de integración
npx tsx scripts/test-bot-refactored.ts

# Build
npm run build

# Producción
npm run start
```

---

## 📞 Soporte

Para dudas o problemas:
1. Revisa `MEJORAS_PROFESIONALES_APLICADAS.md`
2. Consulta el código comentado en `src/lib/bot/`
3. Ejecuta los tests: `npm run test:bot`

---

## ✨ Próximos Pasos

1. **Integración WhatsApp**: Conecta con Baileys o Evolution
2. **Base de datos**: Migra productos a PostgreSQL
3. **Métricas**: Implementa dashboard de conversiones
4. **Multiidioma**: Añade soporte para otros idiomas
5. **CRM**: Integra con tu sistema de gestión de clientes

¡Tu bot profesional está listo! 🚀
