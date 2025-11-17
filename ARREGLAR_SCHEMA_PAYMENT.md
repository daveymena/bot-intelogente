# 🔧 Arreglar Schema - Eliminar Payment Duplicado

## Problema

El schema tiene 2 modelos `Payment` duplicados y también `PaymentStatus` duplicado.

## Solución

Necesitas editar manualmente `prisma/schema.prisma` y:

### 1. Eliminar el segundo modelo Payment

Busca en el archivo la segunda aparición de:
```prisma
model Payment {
  id                String              @id @default(cuid())
  userId            String
  user              User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Información del pago
  amount            Float
  currency          String              @default("COP")
  method            String              // mercadopago, paypal, nequi, etc.
  ...
```

**ELIMINA TODO** desde `model Payment {` hasta el `@@map("payments")` de ese segundo modelo.

### 2. Eliminar el segundo enum PaymentStatus

Busca la segunda aparición de:
```prisma
enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  ...
}
```

**ELIMINA** ese enum duplicado (mantén solo el primero).

### 3. Mantener solo NotificationToken

El modelo `NotificationToken` y sus enums SÍ deben quedarse:
- `NotificationToken` (modelo)
- `NotificationTokenType` (enum)
- `TokenStatus` (enum)

## Comando para Arreglar

Después de editar manualmente:

```bash
# Generar cliente de Prisma
npx prisma generate

# Push a la base de datos
npx prisma db push
```

## Ubicación Aproximada

Los duplicados están al final del archivo `prisma/schema.prisma`.

Busca por:
- Primera aparición de `model Payment` → MANTENER
- Segunda aparición de `model Payment` → ELIMINAR
- Primera aparición de `enum PaymentStatus` → MANTENER  
- Segunda aparición de `enum PaymentStatus` → ELIMINAR

## Después de Arreglar

Ejecuta:
```bash
npx tsx scripts/test-notification-system.ts
```
