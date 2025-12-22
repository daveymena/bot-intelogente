# Dockerfile para Easypanel
FROM node:20-slim

# Instalar dependencias del sistema incluyendo git
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Variables para el build - Prisma necesita una URL válida
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=1

# IMPORTANTE: Esta URL se usa SOLO durante el build para generar Prisma Client
# En runtime, se usa la variable DATABASE_URL del entorno de Easypanel
ARG DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV DATABASE_URL=${DATABASE_URL}

# Copiar package.json
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar código
COPY . .

# Generar Prisma
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Crear directorios
RUN mkdir -p /app/auth_sessions /app/whatsapp-sessions

# Puerto
EXPOSE 3000

# Iniciar - Regenerar Prisma Client con la URL real del entorno
CMD ["sh", "-c", "npx prisma generate && npx prisma db push --accept-data-loss || true && npm start"]
