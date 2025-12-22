# Dockerfile para Easypanel
FROM node:20-slim

# Instalar dependencias del sistema incluyendo git
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Variables para el build
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV SKIP_ENV_VALIDATION=1

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

# Iniciar
CMD ["sh", "-c", "npx prisma db push --accept-data-loss || true && npm start"]
