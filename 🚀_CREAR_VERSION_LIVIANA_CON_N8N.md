# 🚀 Crear Smart Sales Bot Lite - Versión Liviana con n8n

## 🎯 Objetivo

Crear una versión liviana del bot que:
- ✅ Mantiene la interfaz idéntica (Dashboard + Tienda + Catálogo)
- ✅ Reduce el código en 95% (500 líneas vs 15,000)
- ✅ Delega lógica de negocio a n8n
- ✅ Es rápido de desplegar (1-2 min vs 5-10 min)
- ✅ Fácil de mantener y escalar

## 📊 Comparación

| Aspecto | Versión Actual | Versión Lite |
|---------|----------------|--------------|
| **Tamaño repo** | ~500MB | ~50MB |
| **Líneas de código** | ~15,000 | ~500 |
| **Archivos** | 1000+ | 50 |
| **Deploy time** | 5-10 min | 1-2 min |
| **Complejidad** | Alta | Baja |
| **Mantenibilidad** | Difícil | Fácil |
| **Escalabilidad** | Limitada | Excelente |

## 🏗️ Arquitectura Nueva

```
┌─────────────────────────────────────────────────────────────┐
│         SMART SALES BOT LITE (Solo UI + WhatsApp)           │
│                                                               │
│  Frontend (Next.js)          Backend Mínimo                  │
│  ├─ Dashboard                ├─ API Auth                     │
│  ├─ Tienda                   ├─ API Products (CRUD)          │
│  ├─ Catálogo                 ├─ API WhatsApp (connect/send)  │
│  └─ Componentes UI           └─ Baileys Webhook (200 líneas) │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/Webhooks
┌─────────────────────────────────────────────────────────────┐
│                    n8n (Lógica de Negocio)                   │
│  ├─ IA (Groq/Ollama)                                        │
│  ├─ Búsqueda de productos                                   │
│  ├─ Procesamiento de pagos                                  │
│  ├─ Workflows visuales                                      │
│  └─ Integraciones                                           │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL (Base de Datos)                │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Paso 1: Crear Nuevo Proyecto

### 1.1 Crear Directorio

```bash
mkdir smart-sales-bot-lite
cd smart-sales-bot-lite
```

### 1.2 Inicializar Next.js

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir
```

Opciones:
- ✅ TypeScript
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ `src/` directory
- ✅ App Router
- ❌ Turbopack (opcional)
- ✅ Import alias (@/*)

### 1.3 Instalar Dependencias Esenciales

```bash
# Core
npm install @prisma/client prisma
npm install @whiskeysockets/baileys@7.0.0-rc.6
npm install axios qrcode sharp

# UI
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-tabs
npm install lucide-react class-variance-authority clsx tailwind-merge

# Auth
npm install next-auth bcryptjs
npm install -D @types/bcryptjs

# Forms
npm install react-hook-form zod @hookform/resolvers

# Utils
npm install date-fns
```

## 📁 Paso 2: Estructura del Proyecto Lite

```
smart-sales-bot-lite/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── products/route.ts
│   │   │   ├── whatsapp/
│   │   │   │   ├── connect/route.ts
│   │   │   │   ├── send-from-n8n/route.ts
│   │   │   │   └── status/route.ts
│   │   │   └── stats/route.ts
│   │   ├── catalogo/page.tsx
│   │   ├── tienda/page.tsx
│   │   └── page.tsx                  # Dashboard
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── main-dashboard.tsx
│   │   │   ├── products-table.tsx
│   │   │   └── whatsapp-status.tsx
│   │   ├── tienda/
│   │   │   ├── product-card.tsx
│   │   │   └── product-grid.tsx
│   │   └── ui/                       # shadcn/ui
│   │
│   ├── lib/
│   │   ├── baileys-webhook.ts        # Solo 200 líneas
│   │   ├── db.ts                     # Prisma client
│   │   └── auth.ts                   # NextAuth config
│   │
│   └── types/
│       └── index.ts
│
├── prisma/
│   └── schema.prisma                 # Solo modelos esenciales
│
├── public/
│   ├── images/
│   └── logos/
│
├── .env
├── .gitignore
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 🗄️ Paso 3: Schema de Base de Datos Simplificado

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String
  role          Role      @default(USER)
  emailVerified Boolean   @default(false)
  products      Product[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Product {
  id          String   @id @default(cuid())
  name        String
  description String
  price       Float
  images      String[]
  category    String
  tags        String[]
  stock       Int      @default(0)
  isDigital   Boolean  @default(false)
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Conversation {
  id        String   @id @default(cuid())
  phone     String
  message   String
  response  String
  createdAt DateTime @default(now())
}

model BotSettings {
  id           String   @id @default(cuid())
  businessName String
  n8nWebhook   String
  n8nApiKey    String
  updatedAt    DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

## 🔧 Paso 4: Baileys Webhook Service (Simplificado)

```typescript
// src/lib/baileys-webhook.ts

import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys'
import axios from 'axios'

const N8N_WEBHOOK = process.env.N8N_WEBHOOK_URL!

export class BaileysWebhook {
  private sock: any
  
  async connect() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_sessions')
    
    this.sock = makeWASocket({
      auth: state,
      printQRInTerminal: true
    })
    
    this.sock.ev.on('creds.update', saveCreds)
    
    // Enviar mensajes a n8n
    this.sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) {
        if (msg.key.fromMe) continue
        
        await axios.post(N8N_WEBHOOK, {
          from: msg.key.remoteJid,
          message: msg.message?.conversation || '',
          timestamp: Date.now()
        })
      }
    })
  }
  
  async sendMessage(to: string, message: string) {
    await this.sock.sendMessage(to, { text: message })
  }
}
```

## 🎨 Paso 5: Copiar Componentes UI del Proyecto Actual

### 5.1 Copiar Componentes Dashboard

```bash
# Desde proyecto actual
cp -r src/components/dashboard/* ../smart-sales-bot-lite/src/components/dashboard/
```

### 5.2 Copiar Componentes Tienda

```bash
cp -r src/components/tienda/* ../smart-sales-bot-lite/src/components/tienda/
```

### 5.3 Copiar Componentes UI (shadcn)

```bash
cp -r src/components/ui/* ../smart-sales-bot-lite/src/components/ui/
```

### 5.4 Copiar Estilos

```bash
cp src/app/globals.css ../smart-sales-bot-lite/src/app/globals.css
```

## 📄 Paso 6: Páginas Principales

### 6.1 Dashboard (src/app/page.tsx)

```typescript
import { MainDashboard } from '@/components/dashboard/main-dashboard'

export default function DashboardPage() {
  return <MainDashboard />
}
```

### 6.2 Tienda (src/app/tienda/page.tsx)

```typescript
import { ProductGrid } from '@/components/tienda/product-grid'
import { prisma } from '@/lib/db'

export default async function TiendaPage() {
  const products = await prisma.product.findMany()
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Tienda</h1>
      <ProductGrid products={products} />
    </div>
  )
}
```

### 6.3 Catálogo (src/app/catalogo/page.tsx)

```typescript
import { ProductCard } from '@/components/tienda/product-card'
import { prisma } from '@/lib/db'

export default async function CatalogoPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  })
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Catálogo</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
```

## 🔌 Paso 7: API Routes Mínimas

### 7.1 WhatsApp Send (src/app/api/whatsapp/send-from-n8n/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { BaileysWebhook } from '@/lib/baileys-webhook'

const baileys = new BaileysWebhook()

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key')
  if (apiKey !== process.env.N8N_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { to, message } = await req.json()
  await baileys.sendMessage(to, message)
  
  return NextResponse.json({ success: true })
}
```

### 7.2 Products CRUD (src/app/api/products/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const products = await prisma.product.findMany()
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const product = await prisma.product.create({ data })
  return NextResponse.json(product)
}
```

## ⚙️ Paso 8: Variables de Entorno

```bash
# .env

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/smartsales_lite"

# NextAuth
NEXTAUTH_SECRET="tu-secret-super-seguro"
NEXTAUTH_URL="http://localhost:3000"

# n8n Integration
N8N_WEBHOOK_URL="http://n8n:5678/webhook/whatsapp-incoming"
N8N_API_KEY="tu-api-key-segura-123"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_BUSINESS_NAME="Tecnovariedades D&S"
```

## 🚀 Paso 9: Scripts package.json

```json
{
  "name": "smart-sales-bot-lite",
  "version": "3.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  }
}
```

## 📝 Paso 10: .gitignore

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Production
.vercel
.env*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# WhatsApp sessions
auth_sessions/

# Temp files
temp-audio/
temp-media/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Prisma
prisma/*.db
prisma/*.db-journal
```

## 🎯 Paso 11: Importar Workflow n8n

1. Copiar archivo del proyecto actual:
```bash
cp n8n-workflow-whatsapp-bot-easypanel.json ../smart-sales-bot-lite/
```

2. Importar en n8n (Easypanel)
3. Configurar credenciales PostgreSQL
4. Activar workflow

## ✅ Paso 12: Verificar Todo

### Checklist

- [ ] Proyecto creado
- [ ] Dependencias instaladas
- [ ] Schema Prisma configurado
- [ ] Baileys webhook implementado
- [ ] Componentes UI copiados
- [ ] Páginas creadas (Dashboard, Tienda, Catálogo)
- [ ] API routes creadas
- [ ] Variables de entorno configuradas
- [ ] .gitignore configurado
- [ ] Workflow n8n importado

## 🚀 Paso 13: Iniciar Proyecto

```bash
# 1. Generar Prisma client
npm run db:generate

# 2. Push schema a BD
npm run db:push

# 3. Iniciar desarrollo
npm run dev
```

## 📊 Resultado Final

### Tamaño del Proyecto

```
smart-sales-bot-lite/
├── src/                    # ~50 archivos
├── prisma/                 # 1 archivo
├── public/                 # Assets
├── node_modules/           # ~200MB (vs 500MB)
└── Total: ~50MB (vs 500MB)
```

### Líneas de Código

```
Baileys: 200 líneas (vs 5000)
API Routes: 100 líneas (vs 2000)
Components: 200 líneas (copiados)
Total: ~500 líneas (vs 15,000)
```

### Deploy Time

```
Build: 30 segundos (vs 3 minutos)
Deploy: 1 minuto (vs 5-10 minutos)
Total: ~1.5 minutos (vs 8-13 minutos)
```

## 🎉 Ventajas de la Versión Lite

1. **95% menos código** - Más fácil de mantener
2. **90% menos tamaño** - Más rápido de clonar/desplegar
3. **Interfaz idéntica** - Misma experiencia de usuario
4. **Lógica en n8n** - Modificar sin programar
5. **Escalable** - Agregar features fácilmente
6. **Debugging visual** - Ver flujos en n8n
7. **Deploy rápido** - 1-2 minutos vs 5-10
8. **Menos bugs** - Menos código = menos errores

## 📚 Próximos Pasos

1. **Probar localmente** - Verificar que todo funciona
2. **Subir a Git** - Crear repositorio nuevo
3. **Desplegar en Easypanel** - Conectar con n8n
4. **Migrar datos** - Copiar productos de BD actual
5. **Probar en producción** - Enviar mensajes reales
6. **Monitorear** - Ver ejecuciones en n8n

## 💡 Tips

- Mantén el proyecto actual como backup
- Prueba la versión lite en paralelo
- Migra gradualmente
- Documenta cambios
- Usa Git branches para experimentar

**¡Listo para crear tu versión liviana!** 🚀
