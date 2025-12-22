# 📚 Smart Sales Bot Pro - Documentación Completa del Sistema Actual

## 🎯 Descripción General

**Smart Sales Bot Pro** es un sistema completo de automatización de ventas por WhatsApp con inteligencia artificial para Tecnovariedades D&S. Sistema monolítico que integra dashboard, tienda online, bot de WhatsApp y gestión de productos en una sola aplicación.

## 📊 Arquitectura Actual (Monolítica)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SMART SALES BOT PRO (Monolito)                    │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      Next.js 15 App                           │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐             │  │
│  │  │ Dashboard  │  │   Tienda   │  │  Catálogo  │             │  │
│  │  │   Admin    │  │   Pública  │  │  Público   │             │  │
│  │  └────────────┘  └────────────┘  └────────────┘             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    API Routes (Next.js)                       │  │
│  │  /api/auth  /api/products  /api/whatsapp  /api/payments      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Business Logic (src/lib)                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │  │
│  │  │ Baileys      │  │ AI Service   │  │ Product      │       │  │
│  │  │ WhatsApp     │  │ Multi-       │  │ Intelligence │       │  │
│  │  │ (5000 líneas)│  │ Provider     │  │              │       │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │  │
│  │  │ Conversation │  │ Media        │  │ Payment      │       │  │
│  │  │ Context      │  │ Service      │  │ Methods      │       │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Database (Prisma ORM)                      │  │
│  │  PostgreSQL (Producción) / SQLite (Desarrollo)                │  │
│  │  15+ Models: User, Product, Order, Conversation, etc.         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    External Services                          │  │
│  │  Groq, OpenAI, Claude, Gemini, MercadoPago, PayPal, etc.     │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## 📁 Estructura del Proyecto

```
smart-sales-bot-pro/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/                 # Autenticación (NextAuth)
│   │   │   ├── whatsapp/             # WhatsApp endpoints
│   │   │   │   ├── connect/          # Conectar WhatsApp
│   │   │   │   ├── send/             # Enviar mensajes
│   │   │   │   ├── status/           # Estado conexión
│   │   │   │   └── disconnect/       # Desconectar
│   │   │   ├── products/             # CRUD productos
│   │   │   ├── conversations/        # Historial conversaciones
│   │   │   ├── payments/             # Procesamiento pagos
│   │   │   ├── memberships/          # Suscripciones
│   │   │   ├── settings/             # Configuración bot
│   │   │   └── stats/                # Estadísticas
│   │   ├── catalogo/                 # Catálogo público
│   │   ├── membresias/               # Planes de suscripción
│   │   ├── payment/                  # Páginas de pago
│   │   ├── verify-email/             # Verificación email
│   │   └── page.tsx                  # Dashboard principal
│   │
│   ├── components/                   # Componentes React
│   │   ├── dashboard/                # Componentes del dashboard
│   │   │   ├── main-dashboard.tsx    # Dashboard principal
│   │   │   ├── WhatsAppConnection.tsx # Conexión WhatsApp
│   │   │   └── MembershipStatus.tsx  # Estado membresía
│   │   ├── ProductsManagement.tsx    # Gestión productos
│   │   ├── ImportExportProducts.tsx  # Importar/Exportar
│   │   ├── HelpBot.tsx               # Bot de ayuda
│   │   └── ui/                       # shadcn/ui components
│   │
│   ├── lib/                          # Lógica de negocio
│   │   ├── ai-service.ts             # Orquestación IA (1500 líneas)
│   │   ├── ai-multi-provider.ts      # Multi-proveedor IA (800 líneas)
│   │   ├── baileys-service.ts        # WhatsApp Baileys (5000 líneas)
│   │   ├── product-intelligence-service.ts  # Búsqueda productos (1200 líneas)
│   │   ├── intelligent-response-service.ts  # Respuestas inteligentes (900 líneas)
│   │   ├── conversation-context-service.ts  # Contexto 24h (600 líneas)
│   │   ├── human-escalation-service.ts      # Escalamiento humano (400 líneas)
│   │   ├── media-service.ts          # Audio/imagen (700 líneas)
│   │   ├── message-queue-service.ts  # Cola de mensajes (500 líneas)
│   │   ├── hot-reload-service.ts     # Recarga en caliente (300 líneas)
│   │   ├── connection-monitor.ts     # Monitor conexión (400 líneas)
│   │   ├── training-data.ts          # Datos entrenamiento (2000 líneas)
│   │   ├── email-service.ts          # Emails (300 líneas)
│   │   ├── payment-methods.ts        # Métodos de pago (400 líneas)
│   │   ├── auth.ts                   # Autenticación (500 líneas)
│   │   └── db.ts                     # Prisma client
│   │
│   ├── hooks/                        # React hooks personalizados
│   └── middleware.ts                 # Next.js middleware (auth)
│
├── prisma/
│   ├── schema.prisma                 # Schema de base de datos (15+ modelos)
│   └── migrations/                   # Migraciones
│
├── scripts/                          # Scripts de utilidad (100+ archivos)
│   ├── agregar-*.ts                  # Agregar datos
│   ├── actualizar-*.ts               # Actualizar datos
│   ├── import-*.ts                   # Importar productos
│   ├── test-*.ts                     # Tests
│   └── verificar-*.ts                # Verificaciones
│
├── public/                           # Assets estáticos
│   ├── images/                       # Imágenes
│   ├── icons/                        # Iconos
│   └── logos/                        # Logos
│
├── auth_sessions/                    # Sesiones WhatsApp (gitignored)
├── temp-audio/                       # Audio temporal (gitignored)
├── temp-media/                       # Media temporal (gitignored)
│
├── server.ts                         # Servidor Express + Next.js + Socket.io
├── package.json                      # Dependencias
├── next.config.ts                    # Configuración Next.js
├── tsconfig.json                     # Configuración TypeScript
├── tailwind.config.ts                # Configuración Tailwind
└── .env                              # Variables de entorno
```

## 🔧 Tecnologías Utilizadas

### Frontend
- **Next.js 15** - Framework React con App Router
- **TypeScript 5** - Tipado estático
- **Tailwind CSS 4** - Estilos
- **shadcn/ui** - Componentes UI (Radix UI)
- **Framer Motion** - Animaciones
- **Zustand** - State management
- **React Hook Form + Zod** - Formularios y validación
- **Socket.io Client** - Real-time

### Backend
- **Node.js + Express** - Servidor
- **Next.js API Routes** - Endpoints
- **Socket.io Server** - WebSockets
- **Prisma ORM** - Base de datos
- **PostgreSQL** - Base de datos producción
- **SQLite** - Base de datos desarrollo

### WhatsApp
- **@whiskeysockets/baileys v7.0.0-rc.6** - WhatsApp Web API
- **qrcode** - Generación QR
- **sharp** - Procesamiento imágenes

### IA
- **Groq SDK** - Llama 3.1 (principal)
- **OpenAI SDK** - GPT-4 (fallback)
- **Anthropic SDK** - Claude (fallback)
- **Google Generative AI** - Gemini (fallback)
- **Mistral SDK** - Mistral (fallback)

### Pagos
- **MercadoPago SDK** - Pagos Colombia
- **PayPal SDK** - Pagos internacionales
- **Stripe SDK** - Tarjetas de crédito

### Otros
- **bcryptjs** - Hash contraseñas
- **jsonwebtoken** - JWT tokens
- **nodemailer** - Emails
- **puppeteer** - Web scraping
- **axios** - HTTP requests

## 📦 Dependencias Principales

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.0",
    "typescript": "^5.3.0",
    "@whiskeysockets/baileys": "^7.0.0-rc.6",
    "@prisma/client": "^5.7.0",
    "groq-sdk": "^0.3.0",
    "socket.io": "^4.6.0",
    "express": "^4.18.0",
    "tailwindcss": "^4.0.0",
    "@radix-ui/react-*": "^1.0.0",
    "framer-motion": "^10.0.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "mercadopago": "^2.0.0",
    "sharp": "^0.33.0",
    "qrcode": "^1.5.0"
  }
}
```

## 🗄️ Modelos de Base de Datos

```prisma
// prisma/schema.prisma

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String
  role          Role      @default(USER)
  emailVerified Boolean   @default(false)
  products      Product[]
  orders        Order[]
  conversations Conversation[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Product {
  id          String   @id @default(cuid())
  name        String
  description String
  price       Float
  images      String[] // Array de URLs
  category    String
  subcategory String?
  tags        String[] // Para búsqueda
  stock       Int      @default(0)
  isDigital   Boolean  @default(false)
  deliveryLink String? // Para productos digitales
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  orderItems  OrderItem[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Order {
  id            String      @id @default(cuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  total         Float
  status        OrderStatus @default(PENDING)
  paymentMethod String
  paymentId     String?
  items         OrderItem[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Float
}

model Conversation {
  id        String   @id @default(cuid())
  phone     String   // Número de WhatsApp
  message   String   // Mensaje del cliente
  response  String   // Respuesta del bot
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}

model BotSettings {
  id                String  @id @default(cuid())
  businessName      String
  welcomeMessage    String
  aiProvider        String  @default("groq")
  enableAudio       Boolean @default(false)
  enableImages      Boolean @default(true)
  autoReconnect     Boolean @default(true)
  updatedAt         DateTime @updatedAt
}

// ... más modelos (Membership, Payment, etc.)
```

## 🔑 Variables de Entorno

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/smartsales"

# NextAuth
NEXTAUTH_SECRET="tu-secret-super-seguro"
NEXTAUTH_URL="http://localhost:3000"

# AI Providers
GROQ_API_KEY="gsk_tu_api_key_de_groq"
OPENAI_API_KEY="sk-tu_api_key_de_openai"
ANTHROPIC_API_KEY="sk-ant-tu_api_key_de_claude"
GOOGLE_API_KEY="tu_api_key_de_gemini"

# AI Configuration
AI_FALLBACK_ENABLED="true"
AI_PRIMARY_PROVIDER="groq"

# WhatsApp
WHATSAPP_AUTO_RECONNECT="true"
WHATSAPP_SESSION_PATH="./auth_sessions"

# Payments
MERCADOPAGO_ACCESS_TOKEN="tu_token_de_mercadopago"
PAYPAL_CLIENT_ID="tu_client_id_de_paypal"
PAYPAL_CLIENT_SECRET="tu_client_secret_de_paypal"

# Email
RESEND_API_KEY="re_tu_api_key_de_resend"
EMAIL_FROM="noreply@tudominio.com"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_BUSINESS_NAME="Tecnovariedades D&S"
```

## 🚀 Comandos Disponibles

```bash
# Desarrollo
npm run dev                    # Iniciar servidor desarrollo
npm run build                  # Build producción
npm start                      # Iniciar producción

# Base de datos
npm run db:push               # Push schema a BD
npm run db:generate           # Generar Prisma client
npm run db:migrate            # Crear migración
npm run db:migrate:deploy     # Aplicar migraciones
npm run db:reset              # Resetear BD

# Utilidades
npm run lint                  # Linter
npm run verificar-duplicados  # Verificar productos duplicados
npm run limpiar-duplicados    # Limpiar duplicados
npm run test-payment          # Test credenciales pago

# Scripts personalizados (100+)
npx tsx scripts/import-productos.ts
npx tsx scripts/test-whatsapp.ts
npx tsx scripts/verificar-sistema.ts
```

## 📊 Características Principales

### 1. Dashboard Admin
- Gestión de productos (CRUD completo)
- Importar/Exportar productos (CSV/JSON)
- Gestión de conversaciones
- Estadísticas en tiempo real
- Configuración del bot
- Gestión de usuarios
- Gestión de órdenes

### 2. Tienda Pública
- Catálogo de productos
- Búsqueda y filtros
- Carrito de compras
- Checkout con múltiples métodos de pago
- Landing pages dinámicas por producto
- SEO optimizado

### 3. Bot de WhatsApp
- Conexión real con WhatsApp (Baileys)
- Respuestas inteligentes con IA
- Búsqueda de productos
- Recomendaciones personalizadas
- Procesamiento de pagos
- Envío de imágenes/audio
- Contexto de conversación 24h
- Escalamiento a humano
- Cola de mensajes con reintentos

### 4. Sistema de IA
- Multi-proveedor (Groq, OpenAI, Claude, Gemini, Mistral)
- Fallback automático
- Búsqueda semántica de productos
- Detección de intenciones
- Generación de respuestas contextuales
- Análisis de sentimiento

### 5. Pagos
- MercadoPago (Colombia)
- PayPal (Internacional)
- Nequi
- Daviplata
- Transferencia bancaria
- Contraentrega

## 🔒 Seguridad

- Autenticación con NextAuth
- Hash de contraseñas con bcryptjs
- JWT tokens
- Validación de inputs con Zod
- Rate limiting
- CORS configurado
- Variables de entorno seguras
- Sanitización de datos

## 📈 Rendimiento

- Server-side rendering (SSR)
- Static generation (SSG) para catálogo
- Image optimization con Next.js
- Code splitting automático
- Lazy loading de componentes
- Caching de productos
- Hot reload de configuración

## 🐛 Problemas Conocidos

### 1. Tamaño del Proyecto
- **Problema**: Repositorio muy pesado (~500MB)
- **Causa**: 
  - Muchos archivos de documentación (200+ MD)
  - Scripts de utilidad (100+)
  - node_modules grande
  - Sesiones de WhatsApp
  - Media temporal
- **Impacto**: Lento para clonar, subir a Git, desplegar

### 2. Complejidad del Código
- **Problema**: Lógica de negocio mezclada
- **Causa**: Arquitectura monolítica
- **Impacto**: Difícil de mantener y escalar

### 3. Acoplamiento
- **Problema**: Todo depende de todo
- **Causa**: No hay separación de responsabilidades
- **Impacto**: Cambios en una parte afectan otras

### 4. Despliegue
- **Problema**: Lento para desplegar
- **Causa**: Build grande, muchas dependencias
- **Impacto**: Deploy tarda 5-10 minutos

## 💡 Solución Propuesta: Versión Liviana con n8n

### Arquitectura Nueva (Microservicios)

```
┌─────────────────────────────────────────────────────────────┐
│              SMART SALES BOT LITE (Liviano)                  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Next.js App (Solo UI)                                 │ │
│  │  - Dashboard                                           │ │
│  │  - Tienda                                              │ │
│  │  - Catálogo                                            │ │
│  │  - API mínima                                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Baileys Service (Solo WhatsApp)                       │ │
│  │  - Conectar/Desconectar                                │ │
│  │  - Enviar/Recibir mensajes                             │ │
│  │  - Webhook a n8n                                       │ │
│  │  (200 líneas vs 5000)                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    n8n (Orquestador)                         │
│  - Lógica de negocio                                        │
│  - IA (Groq/Ollama)                                         │
│  - Búsqueda de productos                                    │
│  - Procesamiento de pagos                                   │
│  - Workflows visuales                                       │
└─────────────────────────────────────────────────────────────┘
```

### Beneficios
- ✅ **95% menos código** (500 líneas vs 15,000)
- ✅ **Repositorio liviano** (~50MB vs 500MB)
- ✅ **Deploy rápido** (1-2 min vs 5-10 min)
- ✅ **Fácil de mantener** (UI separada de lógica)
- ✅ **Escalable** (agregar features sin código)
- ✅ **Debugging visual** (ver flujos en n8n)

## 📚 Documentación Adicional

- `GUIA_COMPLETA.md` - Guía de uso completa
- `DEPLOY_EASYPANEL.md` - Guía de despliegue
- `SISTEMA_*.md` - Documentación de sistemas
- `SOLUCION_*.md` - Soluciones a problemas
- `RESUMEN_*.md` - Resúmenes de sesiones

## 🤝 Contribuir

Este es un proyecto privado para Tecnovariedades D&S.

## 📄 Licencia

Propietario - Todos los derechos reservados

---

**Versión Actual**: 2.0.0 (Monolítica)  
**Próxima Versión**: 3.0.0 (Microservicios con n8n)  
**Última Actualización**: Diciembre 2025
