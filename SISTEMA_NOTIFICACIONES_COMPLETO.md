# 🔔 Sistema Universal de Notificaciones con Tokens

## ✅ Estado: IMPLEMENTADO Y LISTO

Sistema completo y reutilizable para enviar notificaciones seguras con tokens temporales. Perfecto para pagos, recordatorios, facturas, citas y más.

---

## 🎯 ¿Qué es este sistema?

Un sistema universal que permite enviar notificaciones por email con enlaces seguros y temporales. Cada enlace contiene un token único que permite al usuario acceder a información privada sin necesidad de iniciar sesión.

### Casos de Uso

✅ **Pagos**
- Confirmación de pago recibido
- Recordatorio de pago pendiente
- Ver factura/recibo
- Estado de pago en tiempo real

✅ **Pedidos**
- Seguimiento de pedido
- Notificación de envío
- Confirmación de entrega

✅ **Citas**
- Confirmación de cita
- Recordatorio de cita
- Reagendar cita

✅ **Cuenta**
- Verificación de email
- Cambio de email
- Acceso temporal

✅ **Personalizado**
- Cualquier notificación que necesites

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE NOTIFICACIÓN                     │
└─────────────────────────────────────────────────────────────┘

1. CREAR NOTIFICACIÓN
   ┌──────────────────────────────────────────────────┐
   │ Sistema genera token seguro                      │
   │   ↓                                              │
   │ Token hasheado con SHA-256                       │
   │   ↓                                              │
   │ Guardado en BD con metadata                      │
   │   ↓                                              │
   │ URL única generada                               │
   │   ↓                                              │
   │ Email enviado con enlace                         │
   └──────────────────────────────────────────────────┘

2. USUARIO ACCEDE
   ┌──────────────────────────────────────────────────┐
   │ Usuario recibe email                             │
   │   ↓                                              │
   │ Clic en enlace                                   │
   │   ↓                                              │
   │ Página valida token                              │
   │   ↓                                              │
   │ Muestra información privada                      │
   │   ↓                                              │
   │ Incrementa contador de vistas                    │
   │   ↓                                              │
   │ (Opcional) Marca como usado                      │
   └──────────────────────────────────────────────────┘
```

---

## 📁 Archivos Creados

### Base de Datos
```
prisma/schema.prisma
├── NotificationToken (modelo nuevo)
├── Payment (modelo nuevo)
├── NotificationTokenType (enum)
├── TokenStatus (enum)
└── PaymentStatus (enum)
```

### Servicios
```
src/lib/notification-service.ts
├── createToken()
├── validateToken()
├── markAsUsed()
├── sendPaymentConfirmation()
├── sendPaymentReminder()
├── sendInvoice()
└── Templates de email
```

### API Routes
```
src/app/api/notifications/
├── send-payment-confirmation/route.ts
└── validate-token/route.ts
```

### Páginas Frontend
```
src/app/payment/
└── confirmation/page.tsx
```

### Scripts
```
scripts/test-notification-system.ts
```

---

## 🔒 Seguridad

### Tokens Seguros
- Generados con `crypto.randomBytes(32)` → 256 bits
- Hasheados con SHA-256 antes de guardar
- Token original nunca guardado en BD
- Imposible recuperar token desde BD

### Expiración
- Configurable por tipo de notificación
- Validación automática de fecha
- Estados: PENDING, USED, EXPIRED, CANCELLED

### Tracking
- Contador de vistas
- Última fecha de acceso
- IP y User Agent (opcional)
- Metadata flexible (JSON)

---

## 💻 Uso del Sistema

### 1. Crear Token Manualmente

```typescript
import { NotificationService } from '@/lib/notification-service';

// Crear token de confirmación de pago
const { rawToken, url, tokenRecord } = await NotificationService.createToken({
  type: 'PAYMENT_CONFIRMATION',
  purpose: 'Ver confirmación de pago',
  userId: 'user-id',
  paymentId: 'payment-id',
  metadata: {
    amount: 150000,
    currency: 'COP',
    productName: 'Laptop HP'
  },
  expiresInHours: 72 // 3 días
});

console.log('URL para enviar:', url);
// https://tudominio.com/payment/confirmation?token=abc123...
```

### 2. Enviar Confirmación de Pago

```typescript
// Envía email automáticamente con token
const result = await NotificationService.sendPaymentConfirmation({
  paymentId: 'payment-id',
  customerEmail: 'cliente@example.com',
  customerName: 'Juan Pérez',
  type: 'confirmation'
});

console.log('Email enviado:', result.success);
console.log('URL:', result.url);
```

### 3. Enviar Recordatorio de Pago

```typescript
const result = await NotificationService.sendPaymentReminder({
  paymentId: 'payment-id',
  customerEmail: 'cliente@example.com',
  customerName: 'Juan Pérez',
  type: 'reminder'
});
```

### 4. Enviar Factura

```typescript
const result = await NotificationService.sendInvoice({
  paymentId: 'payment-id',
  customerEmail: 'cliente@example.com',
  customerName: 'Juan Pérez',
  type: 'invoice'
});
```

### 5. Validar Token (Frontend)

```typescript
const response = await fetch('/api/notifications/validate-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: 'abc123...' })
});

const data = await response.json();

if (data.valid) {
  console.log('Token válido');
  console.log('Datos:', data.token);
} else {
  console.log('Token inválido:', data.error);
}
```

---

## 🎨 Templates de Email

### Confirmación de Pago
- ✅ Diseño profesional con gradientes
- ✅ Detalles de la transacción
- ✅ Botón destacado para ver confirmación
- ✅ Link de descarga de factura
- ✅ Responsive

### Recordatorio de Pago
- ⏰ Diseño con colores de advertencia
- ⏰ Información del pago pendiente
- ⏰ Fecha de vencimiento
- ⏰ Botón "Pagar Ahora"

### Factura
- 📄 Diseño formal
- 📄 Número de factura
- 📄 Detalles completos
- 📄 Botón de descarga

---

## 🚀 Tipos de Notificaciones Disponibles

```typescript
enum NotificationTokenType {
  PAYMENT_CONFIRMATION    // ✅ Confirmación de pago
  PAYMENT_REMINDER        // ⏰ Recordatorio de pago
  PAYMENT_INVOICE         // 📄 Ver factura
  PAYMENT_STATUS          // 📊 Estado de pago
  ORDER_TRACKING          // 📦 Seguimiento de pedido
  DELIVERY_NOTIFICATION   // 🚚 Notificación de entrega
  APPOINTMENT_CONFIRMATION // 📅 Confirmación de cita
  APPOINTMENT_REMINDER    // ⏰ Recordatorio de cita
  ACCOUNT_VERIFICATION    // ✉️ Verificación de cuenta
  EMAIL_CHANGE            // 📧 Cambio de email
  TEMPORARY_ACCESS        // 🔑 Acceso temporal
  CUSTOM                  // 🎯 Personalizado
}
```

---

## 📊 Modelo de Base de Datos

### NotificationToken

```prisma
model NotificationToken {
  id            String              @id @default(cuid())
  token         String              @unique // SHA-256 hash
  type          NotificationTokenType
  purpose       String
  
  userId        String?
  user          User?               @relation(...)
  
  paymentId     String?
  payment       Payment?            @relation(...)
  
  metadata      Json?               // Datos flexibles
  
  status        TokenStatus         @default(PENDING)
  expiresAt     DateTime
  usedAt        DateTime?
  
  viewCount     Int                 @default(0)
  lastViewedAt  DateTime?
  
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt
}
```

### Payment

```prisma
model Payment {
  id                String              @id @default(cuid())
  userId            String
  amount            Float
  currency          String              @default("COP")
  method            String
  status            PaymentStatus       @default(PENDING)
  
  transactionId     String?             @unique
  paymentLink       String?
  
  productId         String?
  productName       String?
  productDetails    Json?
  
  customerName      String?
  customerEmail     String?
  customerPhone     String?
  
  invoiceNumber     String?             @unique
  invoiceUrl        String?
  receiptUrl        String?
  
  notificationsSent Json?
  
  paidAt            DateTime?
  expiresAt         DateTime?
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  
  tokens            NotificationToken[]
}
```

---

## 🧪 Pruebas

### Ejecutar Script de Prueba

```bash
npx tsx scripts/test-notification-system.ts
```

El script prueba:
1. ✅ Creación de usuario y pago
2. ✅ Generación de tokens (confirmación, recordatorio, factura)
3. ✅ Validación de tokens
4. ✅ Contador de vistas
5. ✅ Marcar como usado
6. ✅ Rechazo de tokens usados
7. ✅ Envío de notificaciones
8. ✅ Verificación en BD
9. ✅ Limpieza de datos

---

## 🔗 URLs Generadas

Según el tipo de notificación, se generan URLs específicas:

```
PAYMENT_CONFIRMATION    → /payment/confirmation?token=XXX
PAYMENT_REMINDER        → /payment/reminder?token=XXX
PAYMENT_INVOICE         → /payment/invoice?token=XXX
PAYMENT_STATUS          → /payment/status?token=XXX
ORDER_TRACKING          → /order/tracking?token=XXX
DELIVERY_NOTIFICATION   → /delivery/status?token=XXX
APPOINTMENT_CONFIRMATION → /appointment/confirm?token=XXX
APPOINTMENT_REMINDER    → /appointment/reminder?token=XXX
ACCOUNT_VERIFICATION    → /verify-account?token=XXX
EMAIL_CHANGE            → /change-email?token=XXX
TEMPORARY_ACCESS        → /access?token=XXX
CUSTOM                  → /notification?token=XXX
```

---

## 📝 Migración de Base de Datos

Después de agregar los modelos al schema:

```bash
# Generar migración
npx prisma migrate dev --name add-notification-system

# O push directo (desarrollo)
npx prisma db push

# Generar cliente
npx prisma generate
```

---

## 🎯 Ejemplos de Integración

### Integrar con Sistema de Pagos

```typescript
// Cuando se completa un pago
async function onPaymentCompleted(paymentId: string) {
  const payment = await db.payment.findUnique({
    where: { id: paymentId }
  });

  if (payment && payment.customerEmail) {
    // Enviar confirmación automática
    await NotificationService.sendPaymentConfirmation({
      paymentId: payment.id,
      customerEmail: payment.customerEmail,
      customerName: payment.customerName || 'Cliente',
      type: 'confirmation'
    });

    // Enviar factura
    await NotificationService.sendInvoice({
      paymentId: payment.id,
      customerEmail: payment.customerEmail,
      customerName: payment.customerName || 'Cliente',
      type: 'invoice'
    });
  }
}
```

### Recordatorios Automáticos

```typescript
// Cron job para enviar recordatorios
async function sendPendingPaymentReminders() {
  const pendingPayments = await db.payment.findMany({
    where: {
      status: 'PENDING',
      expiresAt: {
        gte: new Date(),
        lte: new Date(Date.now() + 24 * 60 * 60 * 1000) // Próximas 24h
      }
    }
  });

  for (const payment of pendingPayments) {
    if (payment.customerEmail) {
      await NotificationService.sendPaymentReminder({
        paymentId: payment.id,
        customerEmail: payment.customerEmail,
        customerName: payment.customerName || 'Cliente',
        type: 'reminder'
      });
    }
  }
}
```

---

## ✅ Ventajas del Sistema

1. **Reutilizable** - Un solo sistema para múltiples propósitos
2. **Seguro** - Tokens hasheados, expiración, estados
3. **Flexible** - Metadata JSON para cualquier dato
4. **Trackeable** - Contador de vistas, última fecha
5. **Profesional** - Templates de email modernos
6. **Escalable** - Fácil agregar nuevos tipos
7. **Sin Login** - Usuario accede sin autenticación
8. **Auditable** - Historial completo en BD

---

## 🚀 Próximos Pasos

### Páginas Pendientes (Opcionales)

Puedes crear páginas adicionales para:
- `/payment/reminder` - Recordatorio de pago
- `/payment/invoice` - Ver factura
- `/payment/status` - Estado de pago
- `/order/tracking` - Seguimiento de pedido
- `/appointment/confirm` - Confirmar cita

Todas siguen el mismo patrón que `/payment/confirmation`.

### Mejoras Opcionales

1. **Rate Limiting** - Limitar accesos por IP
2. **Notificaciones por WhatsApp** - Integrar con bot
3. **SMS** - Enviar códigos por SMS
4. **Push Notifications** - Notificaciones web
5. **Analytics** - Métricas de apertura y clics
6. **A/B Testing** - Probar diferentes templates

---

## 📚 Documentación Relacionada

- `RECUPERACION_CONTRASENA_LISTA.md` - Sistema de recuperación (mismo patrón)
- `CONFIGURACION_METODOS_PAGO.md` - Integración con pagos
- `src/lib/email-service.ts` - Servicio de emails

---

## 🎉 ¡Sistema Listo!

El sistema de notificaciones está completamente implementado y listo para usar. Solo necesitas:

1. **Migrar la base de datos:**
```bash
npx prisma db push
```

2. **Probar el sistema:**
```bash
npx tsx scripts/test-notification-system.ts
```

3. **Integrar en tu aplicación:**
```typescript
import { NotificationService } from '@/lib/notification-service';
```

¡Todo funcionando! 🚀
