-- Agregar campos para configuración avanzada de IA
ALTER TABLE "bot_settings" ADD COLUMN IF NOT EXISTS "preferredAiProvider" TEXT DEFAULT 'groq';
ALTER TABLE "bot_settings" ADD COLUMN IF NOT EXISTS "aiProviderPriority" TEXT DEFAULT '["groq","openai","gemini","claude","mistral"]';
ALTER TABLE "bot_settings" ADD COLUMN IF NOT EXISTS "enableAutoFallback" BOOLEAN DEFAULT true;
ALTER TABLE "bot_settings" ADD COLUMN IF NOT EXISTS "ollamaBaseUrl" TEXT;
ALTER TABLE "bot_settings" ADD COLUMN IF NOT EXISTS "ollamaModel" TEXT DEFAULT 'llama3.1';
ALTER TABLE "bot_settings" ADD COLUMN IF NOT EXISTS "openrouterApiKey" TEXT;
ALTER TABLE "bot_settings" ADD COLUMN IF NOT EXISTS "anthropicApiKey" TEXT;

-- Comentarios
COMMENT ON COLUMN "bot_settings"."preferredAiProvider" IS 'Proveedor de IA preferido por el usuario';
COMMENT ON COLUMN "bot_settings"."aiProviderPriority" IS 'Array JSON con orden de prioridad de proveedores';
COMMENT ON COLUMN "bot_settings"."enableAutoFallback" IS 'Habilitar fallback automático si falla el proveedor principal';
