# Dockerfile optimizado para Easypanel (Debian Bullseye)
FROM node:20

# Instalar dependencias del sistema (Chromium, build tools, cmake)
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libfreetype6 \
    libharfbuzz-bin \
    ca-certificates \
    fonts-freefont-ttf \
    git \
    openssl \
    make \
    g++ \
    cmake \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Variables de entorno
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS="--max-old-space-size=4096"

WORKDIR /app

# Copiar package files primero
COPY package*.json ./
COPY prisma ./prisma/

# Instalar TODAS las dependencias (no solo production) para construir módulos nativos
RUN npm ci

# Copiar código fuente
COPY . .

# Generar Prisma
RUN npx prisma generate

# Rebuild de lightningcss para asegurar compatibilidad con linux-x64-gnu
RUN npm rebuild lightningcss 2>/dev/null || npm install lightningcss --save-dev

# Build de Next.js
RUN npm run build

# Carpetas necesarias
RUN mkdir -p /app/auth_sessions /app/whatsapp-sessions /app/public/fotos

EXPOSE 3000

CMD ["sh", "-c", "PORT=3000 npx prisma generate && npx prisma db push --accept-data-loss || true && npm start"]