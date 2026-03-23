# Dockerfile optimizado para Easypanel con Next.js + Custom Server
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

# Variables de entorno
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS="--max-old-space-size=4096"

WORKDIR /app

# Copiar package files
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install --legacy-peer-deps --prefer-offline --no-audit || \
    npm install --legacy-peer-deps --no-audit || \
    npm install --no-audit

# Copiar código fuente
COPY . .

# Generar Prisma
RUN npx prisma generate

# Build de Next.js
RUN npm run build

# Carpetas necesarias
RUN mkdir -p /app/auth_sessions /app/whatsapp-sessions /app/public/fotos

EXPOSE 3000

# Usar el server.js custom con tsx para producción
CMD ["sh", "-c", "PORT=3000 npx tsx server.js"]
