# Project Structure

## Root Directory

```
/
├── src/                      # Next.js application source
├── scripts/                  # Utility scripts (100+ files)
├── prisma/                   # Database schema and migrations
├── auth_sessions/            # WhatsApp session storage (gitignored)
├── public/                   # Static assets
├── examples/                 # Example CSV/JSON files
├── botexperimento/           # Legacy bot experiments
├── server.ts                 # Custom Express + Next.js server
├── package.json              # Dependencies and scripts
└── [MANY .md files]          # Extensive Spanish documentation
```

## Source Directory (`src/`)

```
src/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── whatsapp/        # WhatsApp connection/send/status
│   │   ├── products/        # Product CRUD
│   │   ├── conversations/   # Conversation management
│   │   ├── payments/        # Payment processing
│   │   ├── memberships/     # Subscription management
│   │   ├── settings/        # Bot configuration
│   │   └── stats/           # Analytics
│   ├── catalogo/            # Public product catalog
│   ├── membresias/          # Membership plans page
│   ├── payment/             # Payment success/failure pages
│   ├── verify-email/        # Email verification
│   └── page.tsx             # Dashboard home
│
├── components/              # React components
│   ├── dashboard/           # Dashboard-specific components
│   │   ├── main-dashboard.tsx
│   │   ├── WhatsAppConnection.tsx
│   │   └── MembershipStatus.tsx
│   ├── ProductsManagement.tsx
│   ├── ImportExportProducts.tsx
│   ├── HelpBot.tsx
│   └── ui/                  # shadcn/ui components
│
├── lib/                     # Core business logic
│   ├── ai-service.ts                    # Main AI orchestration
│   ├── ai-multi-provider.ts             # Multi-AI fallback system
│   ├── baileys-service.ts               # WhatsApp integration
│   ├── product-intelligence-service.ts  # Product search/matching
│   ├── intelligent-response-service.ts  # Smart response generation
│   ├── conversation-context-service.ts  # 24h conversation memory
│   ├── human-escalation-service.ts      # Escalation detection
│   ├── media-service.ts                 # Audio/image handling
│   ├── message-queue-service.ts         # Retry queue
│   ├── hot-reload-service.ts            # Live config updates
│   ├── connection-monitor.ts            # WhatsApp health check
│   ├── training-data.ts                 # AI training examples
│   ├── email-service.ts                 # Email notifications
│   ├── payment-methods.ts               # Payment configuration
│   ├── auth.ts                          # Authentication logic
│   └── db.ts                            # Prisma client singleton
│
├── hooks/                   # React hooks
└── middleware.ts            # Next.js middleware (auth)
```

## Scripts Directory (`scripts/`)

Over 100 utility scripts organized by function:
- **Product Management**: `agregar-*.ts`, `actualizar-*.ts`, `ver-productos.ts`
- **Import/Export**: `import-*.ts`, `scrape-*.ts`, `preparar-*.ts`
- **Database**: `seed-*.ts`, `reset-*.ts`, `limpiar-*.ts`
- **Testing**: `test-*.ts`, `probar-*.ts`, `verificar-*.ts`
- **Admin**: `create-admin*.ts`, `reset-admin-password.ts`

## Key Files

- **`server.ts`**: Custom Express server that wraps Next.js for Socket.io
- **`prisma/schema.prisma`**: Complete database schema (15+ models)
- **`package.json`**: Dependencies and npm scripts
- **`.env`**: Environment variables (not in git)
- **`next.config.ts`**: Next.js configuration with Baileys webpack setup
- **`tsconfig.json`**: TypeScript configuration

## Documentation Files

The root contains 200+ markdown files documenting:
- Setup guides (`EMPEZAR_*.md`, `INICIO_*.md`)
- Feature documentation (`SISTEMA_*.md`, `GUIA_*.md`)
- Troubleshooting (`SOLUCION_*.md`, `DEBUG_*.md`)
- Deployment (`DEPLOY_*.md`, `CHECKLIST_*.md`)
- Session summaries (`RESUMEN_*.md`)

All documentation is in Spanish.

## Conventions

### File Naming
- **Components**: PascalCase (`ProductsManagement.tsx`)
- **Services**: kebab-case (`ai-service.ts`)
- **Scripts**: kebab-case (`import-productos-completos.ts`)
- **Documentation**: SCREAMING_SNAKE_CASE (`GUIA_COMPLETA.md`)

### Code Organization
- **Services** (`src/lib/`): Pure TypeScript classes with static methods
- **API Routes**: Next.js App Router convention (`route.ts`)
- **Components**: Functional React components with TypeScript
- **Database**: Prisma ORM with explicit relations

### Import Patterns
- Use `@/` alias for `src/` imports
- Dynamic imports for heavy services (AI, media processing)
- Prisma client imported from `@/lib/db`

### Error Handling
- Try-catch blocks with console logging
- Fallback responses for AI failures
- Automatic reconnection for WhatsApp disconnects
- Message queue for failed sends
