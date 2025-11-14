# Technology Stack

## Frontend

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Real-time**: Socket.io client

## Backend

- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL (production) / SQLite (development)
- **ORM**: Prisma
- **Real-time**: Socket.io server
- **WhatsApp**: @whiskeysockets/baileys (v7.0.0-rc.6)
- **Authentication**: JWT tokens, bcryptjs

## AI & Services

- **Primary AI**: Groq SDK (Llama 3.1)
- **Multi-provider**: Custom AIMultiProvider service with fallback
- **Audio Transcription**: Groq Whisper API
- **Product Intelligence**: Custom semantic search and intent detection
- **Conversation Context**: In-memory context service with 24h history

## Key Libraries

- `@whiskeysockets/baileys` - WhatsApp Web API
- `groq-sdk` - Groq AI integration
- `prisma` - Database ORM
- `socket.io` - Real-time communication
- `qrcode` - QR code generation for WhatsApp
- `sharp` - Image processing
- `puppeteer` - Web scraping for product imports
- `mercadopago` - Payment integration

## Development Commands

```bash
# Development
npm run dev                    # Start dev server with hot reload (nodemon + tsx)

# Database
npm run db:push               # Push schema changes to database
npm run db:generate           # Generate Prisma client
npm run db:migrate            # Run migrations (dev)
npm run db:migrate:deploy     # Run migrations (production)
npm run db:reset              # Reset database

# Build & Production
npm run build                 # Build Next.js app
npm run build:server          # Build server TypeScript
npm start                     # Start production server
npm run start:prod            # Start with production script

# Utilities
npm run lint                  # Run ESLint
npm run verificar-duplicados  # Check for duplicate products
npm run limpiar-duplicados    # Remove duplicate products
npm run test-payment          # Test payment credentials

# Dropshipping
npm run scrape:dropshipping   # Scrape products from suppliers
npm run import:dropshipping   # Import scraped products
npm run dropship:update       # Scrape + import in one command
```

## Scripts Directory

The `scripts/` folder contains numerous utility scripts for:
- Product management (import, export, update)
- Database operations (seed, reset, clean)
- Testing (AI responses, payment, WhatsApp)
- Scraping (MegaComputer, Dropi, SmartJoys)
- Admin user creation

Run scripts with: `npx tsx scripts/<script-name>.ts`

## Environment Variables

Key variables in `.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `GROQ_API_KEY` - Primary AI provider
- `OPENAI_API_KEY`, `CLAUDE_API_KEY`, etc. - Optional fallback AIs
- `AI_FALLBACK_ENABLED` - Enable multi-provider fallback
- `MERCADOPAGO_ACCESS_TOKEN` - Payment integration
- `NEXT_PUBLIC_*` - Client-side environment variables

## Architecture Notes

- **Server**: Custom Express server (`server.ts`) wraps Next.js for Socket.io integration
- **Hot Reload**: Nodemon watches for changes and restarts server
- **Session Storage**: File-based auth sessions in `auth_sessions/` directory
- **Database**: Prisma schema supports both PostgreSQL (prod) and SQLite (dev)
- **Real-time**: Socket.io for WhatsApp status updates and live messaging
- **Caching**: In-memory product and settings cache with hot reload support
