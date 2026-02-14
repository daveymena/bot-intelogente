# Dockerfile optimizado para Easypanel (Debian Bullseye)
# Usamos imagen completa node:20 para evitar problemas con librerías nativas (glibc vs musl)
FROM node:20

# Instalar dependencias del sistema (Chromium para Puppeteer, build tools)
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
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Variables de entorno para optimización
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS="--max-old-space-size=4096"

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias (SIN --ignore-scripts para permitir postinstall de Next/Tailwind)
# En Debian, node-llama-cpp debería compilar correctamente.
RUN npm ci --only=production --prefer-offline --no-audit

# Copiar código fuente
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Build de Next.js
RUN npm run build

# Crear directorios necesarios
RUN mkdir -p /app/auth_sessions /app/whatsapp-sessions /app/public/fotos

# Exponer puerto 3000
EXPOSE 3000

# Comando de inicio optimizado
CMD ["sh", "-c", "PORT=3000 npx prisma generate && npx prisma db push --accept-data-loss || true && npm start"]