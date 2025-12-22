# 🏗️ ARQUITECTURA COMPLETA DEL SISTEMA

## 📋 Resumen Ejecutivo

**Smart Sales Bot Pro** - Sistema completo de automatización de ventas por WhatsApp con IA para Tecnovariedades D&S.

- **Lenguaje:** TypeScript
- **Framework:** Next.js 15 (App Router)
- **Base de datos:** PostgreSQL (prod) / SQLite (dev)
- **ORM:** Prisma
- **WhatsApp:** @whiskeysockets/baileys
- **IA:** Groq SDK (Llama 3.1) + Multi-provider fallback
- **Real-time:** Socket.io

---

## 🎯 FLUJO COMPLETO DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO DE WHATSAPP                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              BAILEYS SERVICE (WhatsApp API)                  │
│  - Conexión con WhatsApp Web                                │
│  - Manejo de QR code                                        │
│  - Recepción/envío de mensajes                              │
│  - Gestión de sesiones                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI SERVICE (Cerebro)                      │
│  - Análisis de intención                                    │
│  - Búsqueda de productos                                    │
│  - Generación de respuestas                                 │
│  - Manejo de contexto                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  PRODUCT    │ │  MEMORY     │ │  PAYMENT    │
│  SEARCH     │ │  SERVICE    │ │  LINKS      │
└─────────────┘ └─────────────┘ └─────────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  BASE DE DATOS (Prisma)                      │
│  - Usuarios                                                  │
│  - Productos                                                 │
│  - Conversaciones                                            │
│  - Mensajes                                                  │
│  - Pagos                                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 ESTRUCTURA DE ARCHIVOS

### 🎨 Frontend (Next.js)

```
src/app/
├── page.tsx                    # Dashboard principal
├── catalogo/                   # Catálogo público
├── tienda/                     # Tienda online
├── membresias/                 # Planes de suscripción
├── payment/                    # Páginas de pago
└── api/                        # API Routes
    ├── auth/                   # Autenticación
    ├── whatsapp/              # WhatsApp endpoints
    ├── products/              # CRUD productos
    ├── conversations/         # Gestión conversaciones
    ├── payments/              # Procesamiento pagos
    └── settings/              # Configuración bot
```

### 🧠 Backend (Services)

```
src/lib/
├── ai-service.ts                      # 🧠 Servicio principal de IA
├── baileys-stable-service.ts          # 📱 Conexión WhatsApp
├── product-intelligence-service.ts    # 🔍 Búsqueda inteligente
├── conversation-context-service.ts    # 💾 Memoria conversación
├── ai-multi-provider.ts               # 🔄 Multi-IA fallback
├── humanized-response-generator.ts    # 💬 Respuestas humanizadas
├── training-24-7-service.ts           # 📚 Sistema entrenamiento
├── neural-learning-service.ts         # 🧠 Aprendizaje neuronal
├── message-variation-service.ts       # 🎭 Variaciones mensajes
├── megaflujos-service.ts              # 📊 Flujos complejos
├── media-service.ts                   # 🎵 Audio/imagen
├── message-queue-service.ts           # 📬 Cola mensajes
├── hot-reload-service.ts              # 🔥 Recarga en caliente
├── connection-monitor.ts              # 📡 Monitor conexión
├── human-escalation-service.ts        # 🆘 Escalamiento humano
├── email-service.ts                   # 📧 Notificaciones email
├── payment-methods.ts                 # 💳 Métodos pago
├── bot-payment-link-generator.ts      # 🔗 Links pago dinámicos
├── product-photo-sender.ts            # 📸 Envío fotos
├── safe-baileys-sender.ts             # 🛡️ Envío seguro
├── safe-reconnect-manager.ts          # 🔌 Reconexión segura
├── anti-ban-middleware.ts             # 🚫 Anti-ban WhatsApp
└── db.ts                              # 🗄️ Cliente Prisma
```

### 🗂️ Base de Datos (Prisma)

```
prisma/
├── schema.prisma              # Esquema completo
└── migrations/                # Migraciones
```

### 📊 Datos de Entrenamiento

```
data/
├── entrenamiento-24-7-completo.json
├── entrenamiento-completo-todos-productos.json
├── entrenamiento-flujo-completo-conversacional.json
├── entrenamiento-saludos-mejorados.json
├── entrenamiento-preguntas-seguimiento.json
├── megaflujos-parte-1.json
├── megaflujos-parte-2.json
├── megaflujos-parte-3.json
├── megaflujos-parte-4.json
└── megaflujos-parte-5.json
```

### 🛠️ Scripts Útiles

```
scripts/
├── entrenar-bot-24-7-completo.ts      # Entrenar bot
├── verificar-sistema-24-7.ts          # Verificar sistema
├── test-bot-24-7-complete.ts          # Test completo
├── ver-aprendizaje-neuronal.ts        # Ver aprendizaje
├── verificar-productos-usuario.ts     # Ver productos
├── import-productos-completos.ts      # Importar productos
├── limpiar-duplicados.ts              # Limpiar duplicados
└── create-admin-user.ts               # Crear admin
```

---

## 🗄️ MODELOS DE BASE DE DATOS

### User (Usuario)
```prisma
- id: String (UUID)
- email: String (único)
- password: String (hash)
- name: String
- role: UserRole (ADMIN, USER)
- whatsappConnected: Boolean
- membershipTier: MembershipTier
- createdAt: DateTime
- updatedAt: DateTime
```

### Product (Producto)
```prisma
- id: String (UUID)
- name: String
- description: String
- price: Float
- currency: String
- category: String
- type: ProductType (DIGITAL, PHYSICAL)
- status: ProductStatus (AVAILABLE, OUT_OF_STOCK)
- images: String (JSON array)
- features: String (JSON array)
- tags: String
- stock: Int
- userId: String (FK)
```

### Conversation (Conversación)
```prisma
- id: String (UUID)
- userId: String (FK)
- customerPhone: String
- customerName: String
- status: ConversationStatus (ACTIVE, CLOSED)
- lastMessageAt: DateTime
- createdAt: DateTime
- messages: Message[]
```

### Message (Mensaje)
```prisma
- id: String (UUID)
- conversationId: String (FK)
- content: String
- direction: MessageDirection (INCOMING, OUTGOING)
- status: MessageStatus (SENT, DELIVERED, READ)
- createdAt: DateTime
```

### Payment (Pago)
```prisma
- id: String (UUID)
- userId: String (FK)
- productId: String (FK)
- amount: Float
- currency: String
- method: PaymentMethod
- status: PaymentStatus
- transactionId: String
- createdAt: DateTime
```

---

## 🔄 FLUJO DE PROCESAMIENTO DE MENSAJES

### 1. Recepción de Mensaje
```typescript
// baileys-stable-service.ts
socket.ev.on('messages.upsert', async (m) => {
  // 1. Extraer mensaje
  const message = m.messages[0]
  const from = message.key.remoteJid
  const messageText = message.message?.conversation
  
  // 2. Guardar en BD
  await saveIncomingMessage(userId, from, messageText)
  
  // 3. Procesar con IA
  const response = await AIService.generateResponse(...)
  
  // 4. Enviar respuesta
  await socket.sendMessage(from, { text: response.message })
  
  // 5. Guardar respuesta en BD
  await saveOutgoingMessage(userId, from, response.message)
})
```

### 2. Procesamiento con IA
```typescript
// ai-service.ts
static async generateResponse(userId, message, phone, history) {
  // 1. Cargar historial 24h
  const fullHistory = await loadFullConversationHistory(...)
  
  // 2. Detectar escalamiento humano
  const escalation = HumanEscalationService.needsHumanEscalation(message)
  
  // 3. Buscar producto
  const product = await ProductIntelligenceService.findProduct(message, userId)
  
  // 4. Generar respuesta con IA
  const aiResponse = await groq.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [systemPrompt, ...history, userMessage]
  })
  
  // 5. Retornar respuesta
  return { message: aiResponse, confidence: 0.9 }
}
```

### 3. Búsqueda de Productos
```typescript
// product-intelligence-service.ts
static async findProduct(query, userId) {
  // 1. Normalizar query
  const normalized = normalizeQuery(query)
  
  // 2. Detectar tipo de producto
  const type = detectProductType(normalized)
  
  // 3. Extraer keywords
  const keywords = extractKeywords(normalized)
  
  // 4. Buscar en BD
  const products = await db.product.findMany({
    where: {
      userId,
      status: 'AVAILABLE',
      OR: keywords.map(k => ({
        OR: [
          { name: { contains: k } },
          { description: { contains: k } },
          { tags: { contains: k } }
        ]
      }))
    }
  })
  
  // 5. Retornar mejor match
  return products[0]
}
```

---

## 🎯 CARACTERÍSTICAS PRINCIPALES

### 1. Multi-provider IA
```typescript
// ai-multi-provider.ts
Proveedores disponibles:
- Groq (Llama 3.1) - Principal
- OpenAI (GPT-4) - Fallback 1
- Claude (Anthropic) - Fallback 2
- Gemini (Google) - Fallback 3
- Mistral - Fallback 4
```

### 2. Sistema Anti-Ban
```typescript
// anti-ban-middleware.ts
- Límites de mensajes por minuto
- Delays aleatorios entre mensajes
- Detección de patrones sospechosos
- Reconexión segura
- Monitoreo de salud
```

### 3. Memoria de Conversación
```typescript
// conversation-context-service.ts
- Historial de 24 horas
- Contexto de producto actual
- Intenciones detectadas
- Preferencias del usuario
```

### 4. Aprendizaje Neuronal
```typescript
// neural-learning-service.ts
- Registro de interacciones exitosas
- Análisis de patrones
- Mejora continua
- Base de conocimiento creciente
```

### 5. Variaciones de Mensajes
```typescript
// message-variation-service.ts
- Múltiples formas de decir lo mismo
- Evita repetición
- Más natural y humano
```

---

## 💳 SISTEMA DE PAGOS

### Métodos Soportados
- Nequi
- Daviplata
- MercadoPago
- PayPal
- PSE
- Tarjetas de crédito
- Transferencia bancaria

### Generación de Links
```typescript
// bot-payment-link-generator.ts
static async generatePaymentLinks(productId, userId, quantity) {
  // 1. Obtener producto
  const product = await db.product.findUnique(...)
  
  // 2. Calcular total
  const total = product.price * quantity
  
  // 3. Generar links por método
  const links = {
    nequi: generateNequiLink(total),
    daviplata: generateDaviplataLink(total),
    mercadopago: generateMercadoPagoLink(product, total)
  }
  
  // 4. Formatear mensaje
  return formatPaymentMessage(product, total, links)
}
```

---

## 📊 DASHBOARD Y ADMINISTRACIÓN

### Componentes Principales
```
src/components/
├── dashboard/
│   ├── main-dashboard.tsx          # Dashboard principal
│   ├── WhatsAppConnection.tsx      # Conexión WhatsApp
│   └── MembershipStatus.tsx        # Estado membresía
├── ProductsManagement.tsx          # Gestión productos
├── ImportExportProducts.tsx        # Import/Export
├── HelpBot.tsx                     # Bot de ayuda
├── AntiBanMonitor.tsx              # Monitor anti-ban
├── MegaflujosDashboard.tsx         # Dashboard megaflujos
└── ui/                             # Componentes shadcn/ui
```

### API Routes
```
src/app/api/
├── auth/                           # Login, registro, logout
├── whatsapp/
│   ├── connect/                    # Conectar WhatsApp
│   ├── disconnect/                 # Desconectar
│   ├── status/                     # Estado conexión
│   └── send/                       # Enviar mensaje
├── products/                       # CRUD productos
├── conversations/                  # Gestión conversaciones
├── payments/                       # Procesamiento pagos
├── settings/                       # Configuración bot
└── stats/                          # Estadísticas
```

---

## 🚀 COMANDOS PRINCIPALES

### Desarrollo
```bash
npm run dev                    # Iniciar servidor desarrollo
npm run build                  # Build producción
npm start                      # Iniciar producción
```

### Base de Datos
```bash
npm run db:push               # Push schema a BD
npm run db:generate           # Generar cliente Prisma
npm run db:migrate            # Ejecutar migraciones
npm run db:reset              # Resetear BD
```

### Utilidades
```bash
npm run lint                  # Linter
npm run verificar-duplicados  # Verificar duplicados
npm run limpiar-duplicados    # Limpiar duplicados
npm run test-payment          # Test pagos
```

### Scripts Personalizados
```bash
npx tsx scripts/entrenar-bot-24-7-completo.ts
npx tsx scripts/verificar-sistema-24-7.ts
npx tsx scripts/create-admin-user.ts
npx tsx scripts/import-productos-completos.ts
```

---

## 🔐 VARIABLES DE ENTORNO

```env
# Base de datos
DATABASE_URL="postgresql://..."

# IA Providers
GROQ_API_KEY="gsk_..."
OPENAI_API_KEY="sk-..."
CLAUDE_API_KEY="sk-ant-..."
GEMINI_API_KEY="..."
MISTRAL_API_KEY="..."

# Configuración IA
AI_FALLBACK_ENABLED="true"
AI_USE_REASONING="false"

# Pagos
MERCADOPAGO_ACCESS_TOKEN="..."
PAYPAL_CLIENT_ID="..."

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

---

## 📈 MÉTRICAS Y ESTADÍSTICAS

### Capacidades Actuales
- **Productos:** 235+ activos
- **Usuarios:** Multi-usuario
- **Conversaciones:** Ilimitadas
- **Mensajes:** Historial 24h
- **Entrenamiento:** 1,139+ ejemplos
- **Respuesta:** < 2 segundos
- **Uptime:** 24/7

### Límites Anti-Ban
- **Mensajes/minuto:** 20
- **Delay entre mensajes:** 1-3 segundos
- **Reconexión automática:** Sí
- **Monitoreo salud:** Cada 30 segundos

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

1. **Optimizar IA:** Mejorar prompts y contexto
2. **Más Productos:** Importar catálogo completo
3. **Analytics:** Dashboard de métricas
4. **A/B Testing:** Probar diferentes respuestas
5. **Webhooks:** Notificaciones en tiempo real
6. **Multi-idioma:** Soporte inglés/portugués
7. **Voice Messages:** Transcripción audio
8. **Chatbot Web:** Widget para sitio web

---

## 📚 DOCUMENTACIÓN DISPONIBLE

- `INDICE_COMPLETO.md` - Índice de toda la documentación
- `REFERENCIA_RAPIDA.txt` - Comandos rápidos
- `GUIA_COMPLETA_ACTIVACION_BOT_24_7.md` - Guía activación
- `SISTEMA_FINAL_COMPLETO.md` - Sistema completo
- `ANTI_BAN_GUIDE.md` - Guía anti-ban
- `TIENDA_COMPLETA_FUNCIONAL.md` - Tienda online

---

**Fecha:** 16 de noviembre de 2025  
**Versión:** 3.0  
**Estado:** ✅ Producción  
**Mantenedor:** Tecnovariedades D&S
