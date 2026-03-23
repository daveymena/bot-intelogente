# Dockerfile optimizado para Easypanel
FROM node:20

# Instalar dependencias del sistema
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

# Limpiar variables de entorno que pueden interferir con npm
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS="--max-old-space-size=4096" \
    npm_config_fetch_retry_mintimeout=120000 \
    npm_config_fetch_retry_maxtimeout=300000 \
    npm_config_fetch_timeout=300000

WORKDIR /app

# Copiar package files primero
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias (usar npm install en lugar de ci para mayor tolerancia)
RUN npm install --prefer-offline --no-audit 2>/dev/null || npm install --no-audit || true

# Copiar código fuente
COPY . .

# Generar Prisma
RUN npx prisma generate

# Rebuild de lightningcss para asegurar compatibilidad
RUN npm rebuild lightningcss 2>/dev/null || true

# Build de Next.js
RUN npm run build

# Carpetas necesarias
RUN mkdir -p /app/auth_sessions /app/whatsapp-sessions /app/public/fotos

EXPOSE 3000

CMD ["sh", "-c", "PORT=3000 npx prisma generate && npx prisma db push --accept-data-loss || true && npm start"]