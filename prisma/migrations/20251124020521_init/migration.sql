-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "membershipType" TEXT NOT NULL DEFAULT 'FREE',
    "membershipEnds" DATETIME,
    "trialEnds" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerificationCode" TEXT,
    "phoneVerificationExpires" DATETIME,
    "passwordResetToken" TEXT,
    "passwordResetExpires" DATETIME,
    "apiKey" TEXT,
    "whatsappNumber" TEXT,
    "businessName" TEXT,
    "businessAddress" TEXT,
    "businessPhone" TEXT,
    "businessHours" TEXT,
    "businessDescription" TEXT,
    "adminNotificationPhone" TEXT DEFAULT '3005560186',
    "lastLoginAt" DATETIME,
    "stripeCustomerId" TEXT,
    "subscriptionPlan" TEXT DEFAULT 'free',
    "subscriptionStatus" TEXT DEFAULT 'trial',
    "subscriptionExpiresAt" DATETIME,
    "paymentMethods" TEXT,
    "businessInfo" TEXT,
    "notificationSettings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'COP',
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "customCategory" TEXT,
    "store" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "images" TEXT,
    "tags" TEXT,
    "autoResponse" TEXT,
    "stock" INTEGER,
    "smartTags" TEXT,
    "tagCategory" TEXT,
    "searchPriority" INTEGER NOT NULL DEFAULT 5,
    "autoTagged" BOOLEAN NOT NULL DEFAULT false,
    "paymentLinkMercadoPago" TEXT,
    "paymentLinkPayPal" TEXT,
    "paymentLinkCustom" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerPhone" TEXT NOT NULL,
    "customerName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastMessageAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT,
    CONSTRAINT "conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "conversations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TEXT',
    "direction" TEXT NOT NULL,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "confidence" REAL,
    "conversationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_prompts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ai_prompts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bot_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL DEFAULT 'Tecnovariedades D&S',
    "businessPhone" TEXT NOT NULL,
    "businessHours" TEXT,
    "businessAddress" TEXT,
    "whatsappNumber" TEXT,
    "shippingInfo" TEXT,
    "warrantyInfo" TEXT,
    "botPersonality" TEXT,
    "groqApiKey" TEXT,
    "openaiApiKey" TEXT,
    "claudeApiKey" TEXT,
    "geminiApiKey" TEXT,
    "mistralApiKey" TEXT,
    "anthropicApiKey" TEXT,
    "openrouterApiKey" TEXT,
    "ollamaBaseUrl" TEXT,
    "ollamaModel" TEXT DEFAULT 'llama3.1',
    "preferredAiProvider" TEXT NOT NULL DEFAULT 'groq',
    "aiProviderPriority" TEXT NOT NULL DEFAULT '["groq","openai","gemini","claude","mistral"]',
    "enableAutoFallback" BOOLEAN NOT NULL DEFAULT true,
    "responseDelay" INTEGER NOT NULL DEFAULT 2,
    "autoResponseEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smartWaitingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "maxTokens" INTEGER NOT NULL DEFAULT 200,
    "temperature" REAL NOT NULL DEFAULT 0.7,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bot_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "training_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userMessage" TEXT NOT NULL,
    "botResponse" TEXT NOT NULL,
    "context" JSONB,
    "productId" TEXT,
    "productName" TEXT,
    "category" TEXT,
    "qualityScore" INTEGER,
    "wasSuccessful" BOOLEAN,
    "userFeedback" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evaluatedAt" DATETIME,
    CONSTRAINT "training_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "training_data_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TRIAL',
    "currentPeriodStart" DATETIME,
    "currentPeriodEnd" DATETIME,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "trialStart" DATETIME,
    "trialEnd" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "whatsapp_connections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DISCONNECTED',
    "qrCode" TEXT,
    "qrExpiresAt" DATETIME,
    "sessionId" TEXT,
    "lastConnectedAt" DATETIME,
    "lastMessageAt" DATETIME,
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "webhookUrl" TEXT,
    "webhookSecret" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" DATETIME,
    "connectionAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "lastErrorAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "whatsapp_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "interval" TEXT NOT NULL,
    "intervalCount" INTEGER NOT NULL DEFAULT 1,
    "stripePriceId" TEXT,
    "features" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "stripePaymentId" TEXT,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "description" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payment_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "mercadoPagoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mercadoPagoPublicKey" TEXT,
    "mercadoPagoAccessToken" TEXT,
    "paypalEnabled" BOOLEAN NOT NULL DEFAULT false,
    "paypalClientId" TEXT,
    "paypalClientSecret" TEXT,
    "bankTransferEnabled" BOOLEAN NOT NULL DEFAULT true,
    "bankName" TEXT DEFAULT 'Bancolombia',
    "bankAccountNumber" TEXT,
    "bankAccountType" TEXT DEFAULT 'Ahorros',
    "bankAccountHolder" TEXT,
    "nequiEnabled" BOOLEAN NOT NULL DEFAULT true,
    "nequiPhone" TEXT DEFAULT '3136174267',
    "daviplataEnabled" BOOLEAN NOT NULL DEFAULT true,
    "daviplataPhone" TEXT DEFAULT '3136174267',
    "contactPhone" TEXT DEFAULT '+57 304 274 8687',
    "contactEmail" TEXT DEFAULT 'deinermen25@gmail.com',
    "contactAddress" TEXT DEFAULT 'Centro Comercial El Diamante 2, San Nicolás, Cali',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "payment_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "usage_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "usage_metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "message_queue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phoneNumber" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "metadata" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "landing_pages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" TEXT NOT NULL,
    "template" TEXT NOT NULL DEFAULT 'default',
    "variant" TEXT,
    "heroImage" TEXT,
    "headline" TEXT,
    "subheadline" TEXT,
    "ctaText" TEXT,
    "ctaColor" TEXT,
    "benefits" TEXT,
    "features" TEXT,
    "urgencyMessage" TEXT,
    "guarantee" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "landing_pages_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentIntegration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "hotmartEnabled" BOOLEAN NOT NULL DEFAULT false,
    "hotmartApiKey" TEXT,
    "hotmartProductId" TEXT,
    "hotmartCheckoutUrl" TEXT,
    "hotmartEmail" TEXT,
    "mercadopagoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mercadopagoAccessToken" TEXT,
    "mercadopagoPublicKey" TEXT,
    "mercadopagoEmail" TEXT,
    "paypalEnabled" BOOLEAN NOT NULL DEFAULT false,
    "paypalClientId" TEXT,
    "paypalClientSecret" TEXT,
    "paypalEmail" TEXT,
    "paypalMode" TEXT DEFAULT 'sandbox',
    "stripeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stripeSecretKey" TEXT,
    "stripePublishableKey" TEXT,
    "stripeWebhookSecret" TEXT,
    "nequiEnabled" BOOLEAN NOT NULL DEFAULT false,
    "nequiPhone" TEXT,
    "nequiName" TEXT,
    "daviplataEnabled" BOOLEAN NOT NULL DEFAULT false,
    "daviplataPhone" TEXT,
    "daviplataName" TEXT,
    "bankTransferEnabled" BOOLEAN NOT NULL DEFAULT false,
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "bankAccountType" TEXT,
    "bankAccountHolder" TEXT,
    "bankIdNumber" TEXT,
    "defaultCurrency" TEXT DEFAULT 'COP',
    "autoGenerateLinks" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "productId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerPhone" TEXT NOT NULL,
    "customerAddress" TEXT,
    "customerCity" TEXT,
    "shippingAddress" TEXT,
    "notes" TEXT,
    "items" TEXT,
    "total" REAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "storeSlug" TEXT NOT NULL,
    "customDomain" TEXT,
    "storeName" TEXT NOT NULL DEFAULT 'Mi Tienda',
    "storeSlogan" TEXT,
    "description" TEXT,
    "logo" TEXT,
    "logoSquare" TEXT,
    "favicon" TEXT,
    "bannerImage" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#10b981',
    "secondaryColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "accentColor" TEXT NOT NULL DEFAULT '#f59e0b',
    "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "textColor" TEXT NOT NULL DEFAULT '#1f2937',
    "email" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT DEFAULT 'Colombia',
    "facebook" TEXT,
    "instagram" TEXT,
    "twitter" TEXT,
    "tiktok" TEXT,
    "youtube" TEXT,
    "linkedin" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "keywords" TEXT,
    "ogImage" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'COP',
    "language" TEXT NOT NULL DEFAULT 'es',
    "timezone" TEXT NOT NULL DEFAULT 'America/Bogota',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "termsUrl" TEXT,
    "privacyUrl" TEXT,
    "returnPolicy" TEXT,
    "shippingPolicy" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StoreSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerName" TEXT,
    "conversationId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_ADMIN_APPROVAL',
    "requestedDate" DATETIME,
    "requestedTime" TEXT,
    "confirmedDate" DATETIME,
    "confirmedTime" TEXT,
    "adminResponse" TEXT,
    "customerMessage" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "appointments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "appointments_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sales_flow_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "businessType" TEXT NOT NULL DEFAULT 'ECOMMERCE',
    "dropshippingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "deliveryDays" TEXT DEFAULT '4-5 días hábiles',
    "paymentOnDelivery" BOOLEAN NOT NULL DEFAULT true,
    "hasPhysicalStore" BOOLEAN NOT NULL DEFAULT false,
    "storeAddress" TEXT,
    "storeHours" TEXT,
    "allowPickup" BOOLEAN NOT NULL DEFAULT false,
    "requiresAppointment" BOOLEAN NOT NULL DEFAULT false,
    "appointmentDuration" INTEGER DEFAULT 60,
    "advanceBookingDays" INTEGER DEFAULT 7,
    "consultationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "consultationPrice" REAL,
    "consultationDuration" INTEGER DEFAULT 30,
    "welcomeMessage" TEXT,
    "priceMessage" TEXT,
    "deliveryMessage" TEXT,
    "confirmationMessage" TEXT,
    "requireName" BOOLEAN NOT NULL DEFAULT true,
    "requirePhone" BOOLEAN NOT NULL DEFAULT true,
    "requireEmail" BOOLEAN NOT NULL DEFAULT false,
    "requireAddress" BOOLEAN NOT NULL DEFAULT true,
    "requireCity" BOOLEAN NOT NULL DEFAULT true,
    "requireNotes" BOOLEAN NOT NULL DEFAULT false,
    "showColors" BOOLEAN NOT NULL DEFAULT true,
    "showSizes" BOOLEAN NOT NULL DEFAULT false,
    "showVariants" BOOLEAN NOT NULL DEFAULT false,
    "facebookEnabled" BOOLEAN NOT NULL DEFAULT false,
    "instagramEnabled" BOOLEAN NOT NULL DEFAULT false,
    "detectSocialMedia" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sales_flow_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "conversation_knowledge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userQuery" TEXT NOT NULL,
    "botResponse" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT,
    "context" TEXT NOT NULL DEFAULT 'general',
    "confidence" REAL NOT NULL DEFAULT 0.8,
    "usageCount" INTEGER NOT NULL DEFAULT 1,
    "successRate" REAL NOT NULL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "conversation_patterns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pattern" TEXT NOT NULL,
    "queryType" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "responseTemplate" TEXT NOT NULL,
    "confidence" REAL NOT NULL DEFAULT 0.8,
    "usageCount" INTEGER NOT NULL DEFAULT 1,
    "successRate" REAL NOT NULL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "notification_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "userId" TEXT,
    "paymentId" TEXT,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" DATETIME,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "notification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notification_tokens_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "persistent_memory" (
    "conversationKey" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "userName" TEXT,
    "currentProduct" TEXT,
    "productHistory" TEXT NOT NULL DEFAULT '[]',
    "conversationStage" TEXT NOT NULL DEFAULT 'greeting',
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "lastInteraction" TEXT NOT NULL,
    "intentions" TEXT NOT NULL DEFAULT '[]',
    "preferences" TEXT NOT NULL DEFAULT '{}',
    "budget" TEXT,
    "objections" TEXT NOT NULL DEFAULT '[]',
    "photoSent" BOOLEAN NOT NULL DEFAULT false,
    "paymentIntent" BOOLEAN NOT NULL DEFAULT false,
    "preferredPaymentMethod" TEXT,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_apiKey_key" ON "users"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "products_category_subcategory_idx" ON "products"("category", "subcategory");

-- CreateIndex
CREATE INDEX "products_store_idx" ON "products"("store");

-- CreateIndex
CREATE UNIQUE INDEX "bot_settings_userId_key" ON "bot_settings"("userId");

-- CreateIndex
CREATE INDEX "training_data_userId_qualityScore_idx" ON "training_data"("userId", "qualityScore");

-- CreateIndex
CREATE INDEX "training_data_category_qualityScore_idx" ON "training_data"("category", "qualityScore");

-- CreateIndex
CREATE INDEX "training_data_createdAt_idx" ON "training_data"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_connections_userId_key" ON "whatsapp_connections"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_connections_phoneNumber_key" ON "whatsapp_connections"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_stripePriceId_key" ON "subscription_plans"("stripePriceId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripePaymentId_key" ON "payments"("stripePaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_configs_userId_key" ON "payment_configs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "usage_metrics_userId_metricType_period_key" ON "usage_metrics"("userId", "metricType", "period");

-- CreateIndex
CREATE INDEX "landing_pages_productId_idx" ON "landing_pages"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "landing_pages_productId_variant_key" ON "landing_pages"("productId", "variant");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIntegration_userId_key" ON "PaymentIntegration"("userId");

-- CreateIndex
CREATE INDEX "orders_userId_idx" ON "orders"("userId");

-- CreateIndex
CREATE INDEX "orders_productId_idx" ON "orders"("productId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE UNIQUE INDEX "StoreSettings_userId_key" ON "StoreSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreSettings_storeSlug_key" ON "StoreSettings"("storeSlug");

-- CreateIndex
CREATE UNIQUE INDEX "StoreSettings_customDomain_key" ON "StoreSettings"("customDomain");

-- CreateIndex
CREATE INDEX "StoreSettings_userId_idx" ON "StoreSettings"("userId");

-- CreateIndex
CREATE INDEX "StoreSettings_storeSlug_idx" ON "StoreSettings"("storeSlug");

-- CreateIndex
CREATE INDEX "StoreSettings_isPublic_isActive_idx" ON "StoreSettings"("isPublic", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "sales_flow_configs_userId_key" ON "sales_flow_configs"("userId");

-- CreateIndex
CREATE INDEX "conversation_knowledge_userQuery_idx" ON "conversation_knowledge"("userQuery");

-- CreateIndex
CREATE INDEX "conversation_knowledge_productId_idx" ON "conversation_knowledge"("productId");

-- CreateIndex
CREATE INDEX "conversation_knowledge_successRate_idx" ON "conversation_knowledge"("successRate");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_patterns_pattern_key" ON "conversation_patterns"("pattern");

-- CreateIndex
CREATE INDEX "conversation_patterns_queryType_idx" ON "conversation_patterns"("queryType");

-- CreateIndex
CREATE INDEX "conversation_patterns_successRate_idx" ON "conversation_patterns"("successRate");

-- CreateIndex
CREATE UNIQUE INDEX "notification_tokens_token_key" ON "notification_tokens"("token");

-- CreateIndex
CREATE INDEX "notification_tokens_token_idx" ON "notification_tokens"("token");

-- CreateIndex
CREATE INDEX "notification_tokens_userId_type_idx" ON "notification_tokens"("userId", "type");

-- CreateIndex
CREATE INDEX "notification_tokens_paymentId_idx" ON "notification_tokens"("paymentId");

-- CreateIndex
CREATE INDEX "notification_tokens_expiresAt_idx" ON "notification_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "notification_tokens_status_idx" ON "notification_tokens"("status");

-- CreateIndex
CREATE INDEX "persistent_memory_userId_idx" ON "persistent_memory"("userId");

-- CreateIndex
CREATE INDEX "persistent_memory_lastUpdated_idx" ON "persistent_memory"("lastUpdated");
