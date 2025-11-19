# Dockerfile optimizado para Easypanel con Puppeteer preinstalado
FROM ghcr.io/puppeteer/puppeteer:21.6.0

# Configurar directorio de trabajo
WORKDIR /app

# Variables de entorno para reducir uso de memoria en build
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NEXT_TELEMETRY_DISABLED=1

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias (todas, incluyendo dev para el build)
RUN npm install --no-audit --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Build de Next.js (standalone mode para producción)
RUN npm run build

# Copiar archivos estáticos necesarios para standalone
RUN cp -r .next/static .next/standalone/.next/ && \
    cp -r public .next/standalone/

# Limpiar caché de npm para reducir tamaño de imagen
RUN npm cache clean --force

# Crear directorios necesarios
RUN mkdir -p /app/dist /app/whatsapp-sessions /app/auth_sessions /app/data /app/moto

# Exponer puerto
EXPOSE 3000

# Variables de entorno para Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Cambiar a usuario no-root
USER pptruser

# Comando de inicio simplificado
CMD ["sh", "-c", "npx prisma db push --accept-data-loss || true && npm start"]
