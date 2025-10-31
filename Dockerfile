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

# Build de Next.js
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Variables de entorno para Puppeteer (ya incluidas en la imagen base)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Comando de inicio
CMD ["npm", "start"]
