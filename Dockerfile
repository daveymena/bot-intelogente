# ============================================
# STAGE 1: Dependencies
# ============================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias (incluir devDependencies para build)
RUN npm ci && \
    npm cache clean --force

# ============================================
# STAGE 2: Builder
# ============================================
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copiar dependencias del stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
RUN npm run build

# ============================================
# STAGE 3: Runner (Producción)
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    py3-pip \
    curl \
    git \
    bash

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Configurar variables de entorno
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Copiar archivos de OpenClaw
COPY --from=builder /app/.openclaw-workspace ./.openclaw-workspace

# Copiar script de entrypoint
COPY --from=builder /app/scripts/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Crear directorios necesarios con permisos
RUN mkdir -p /app/auth_sessions && \
    mkdir -p /app/.next/cache && \
    chown -R nextjs:nodejs /app

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Usar entrypoint script
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Comando de inicio
CMD ["node", "server.js"]
