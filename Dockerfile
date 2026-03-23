# Dockerfile para Easypanel - Simple y robusto
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

# Limpiar variables que pueden causar problemas de red
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS="--max-old-space-size=4096"

WORKDIR /app

# Copiar solo archivos necesarios
COPY package.json package-lock.json* ./

# Instalar con reintentos
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 30000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --legacy-peer-deps --no-audit

# Copiar Prisma
COPY prisma ./prisma/

# Generar Prisma antes de copiar todo el código
RUN npx prisma generate

# Copiar resto del código
COPY . .

# Build
RUN npm run build

# Crear carpetas
RUN mkdir -p /app/auth_sessions /app/whatsapp-sessions /app/public/fotos

EXPOSE 3000

CMD ["sh", "-c", "PORT=3000 npx tsx server.js"]
