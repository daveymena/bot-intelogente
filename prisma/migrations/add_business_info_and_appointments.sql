-- Agregar información del negocio al modelo User
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "businessAddress" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "businessPhone" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "businessHours" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "businessDescription" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "adminNotificationPhone" TEXT DEFAULT '3005560186';

-- Crear tabla de citas/agendamientos
CREATE TABLE IF NOT EXISTS "appointments" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  "customerName" TEXT,
  "conversationId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING_ADMIN_APPROVAL',
  "requestedDate" TIMESTAMP,
  "requestedTime" TEXT,
  "confirmedDate" TIMESTAMP,
  "confirmedTime" TEXT,
  "adminResponse" TEXT,
  "customerMessage" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
  FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "appointments_userId_idx" ON "appointments"("userId");
CREATE INDEX IF NOT EXISTS "appointments_status_idx" ON "appointments"("status");
CREATE INDEX IF NOT EXISTS "appointments_customerPhone_idx" ON "appointments"("customerPhone");

COMMENT ON COLUMN "users"."businessAddress" IS 'Dirección física del negocio';
COMMENT ON COLUMN "users"."businessPhone" IS 'Teléfono de contacto del negocio';
COMMENT ON COLUMN "users"."businessHours" IS 'Horario de atención (JSON)';
COMMENT ON COLUMN "users"."businessDescription" IS 'Descripción del negocio';
COMMENT ON COLUMN "users"."adminNotificationPhone" IS 'Teléfono para notificaciones de citas';

COMMENT ON TABLE "appointments" IS 'Citas agendadas por clientes';
COMMENT ON COLUMN "appointments"."status" IS 'PENDING_ADMIN_APPROVAL, ADMIN_RESPONDED, CONFIRMED, CANCELLED, COMPLETED';
