# 🔧 Arreglo del Schema - Instrucciones Exactas

## Problema
El archivo `prisma/schema.prisma` tiene modelos y enums duplicados que causan errores.

## Solución Manual (Más Segura)

### Opción 1: Editar en VS Code

1. Abre `prisma/schema.prisma` en VS Code
2. Presiona `Ctrl+F` para buscar
3. Busca: `// 💳 Modelo de Pagos Mejorado`
4. Elimina TODO desde esa línea hasta el final del archivo (incluyendo el enum PaymentStatus duplicado)
5. Guarda el archivo

### Opción 2: Comando PowerShell

Ejecuta este comando para eliminar las últimas 70 líneas (donde están los duplicados):

```powershell
$lines = Get-Content prisma/schema.prisma
$lines[0..($lines.Count - 71)] | Set-Content prisma/schema.prisma
```

## Verificar

Después de eliminar, verifica que solo quede:
- 1 modelo `Payment` (el original, simple)
- 1 enum `PaymentStatus` (el original)
- El modelo `NotificationToken` debe quedarse
- Los enums `NotificationTokenType` y `TokenStatus` deben quedarse

## Comandos Después del Arreglo

```bash
# Generar cliente
npx prisma generate

# Push a BD
npx prisma db push

# Probar
npx tsx scripts/test-notification-system.ts
```

## ¿Qué se Elimina?

Se eliminan estas secciones duplicadas que están al FINAL del archivo:

```prisma
// 💳 Modelo de Pagos Mejorado
model Payment {
  id                String              @id @default(cuid())
  userId            String
  user              User                @relation(...)
  
  // Información del pago
  amount            Float
  currency          String              @default("COP")
  method            String              // mercadopago, paypal, nequi, etc.
  status            PaymentStatus       @default(PENDING)
  
  // ... más campos ...
  
  @@map("payments")
}

// Enum para estado de pagos
enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
  CANCELLED
  EXPIRED
}
```

## ¿Qué se Mantiene?

Se mantienen estas secciones que están ANTES en el archivo:

```prisma
// Modelo Payment original (más simple)
model Payment {
  id                String              @id @default(cuid())
  userId            String
  subscriptionId    String?
  stripePaymentId   String?             @unique
  amount            Float
  currency          String              @default("USD")
  status            PaymentStatus        @default(PENDING)
  paymentMethod     String?
  description       String?
  metadata          String?
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  user              User                @relation(...)
  @@map("payments")
}

// Enum PaymentStatus original
enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

// Estos SÍ se mantienen (son nuevos, no duplicados)
model NotificationToken { ... }
enum NotificationTokenType { ... }
enum TokenStatus { ... }
```
