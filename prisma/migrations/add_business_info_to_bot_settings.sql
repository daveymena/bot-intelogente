-- Agregar información del negocio a la tabla bot_settings
ALTER TABLE "bot_settings" ADD COLUMN IF NOT EXISTS "businessHours" TEXT;
ALTER TABLE "bot_settings" ADD COLUMN IF NOT EXISTS "businessAddress" TEXT;
ALTER TABLE "bot_settings" ADD COLUMN IF NOT EXISTS "shippingInfo" TEXT;
ALTER TABLE "bot_settings" ADD COLUMN IF NOT EXISTS "warrantyInfo" TEXT;

-- Comentarios
COMMENT ON COLUMN "bot_settings"."businessHours" IS 'Horarios de atención del negocio';
COMMENT ON COLUMN "bot_settings"."businessAddress" IS 'Dirección física del negocio';
COMMENT ON COLUMN "bot_settings"."shippingInfo" IS 'Información de envíos y entregas';
COMMENT ON COLUMN "bot_settings"."warrantyInfo" IS 'Política de garantía y devoluciones';