# Dockerfile optimizado para Easypanel con Puppeteer preinstalado
FROM ghcr.io/puppeteer/puppeteer:21.6.0

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias (todas, incluyendo dev para el build)
# Actualizado: 2025-10-31 - Incluye @tailwindcss/postcss
RUN npm ci

# Copiar el resto del código
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Build de Next.js y servidor
RUN npm run build

# Crear directorio dist si no existe y dar permisos
RUN mkdir -p /app/dist && chown -R pptruser:pptruser /app/dist

# Script de inicio que ejecuta migraciones y crea admin
RUN echo '#!/bin/sh\nnpx prisma db push --accept-data-loss\nnpx tsx scripts/create-admin.ts\nexec npm start' > /app/start.sh && chmod +x /app/start.sh && chown pptruser:pptruser /app/start.sh

# Exponer puerto
EXPOSE 3000

# Variables de entorno para Puppeteer (ya incluidas en la imagen base)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Comando de inicio con migraciones automáticas
CMD ["/app/start.sh"]
